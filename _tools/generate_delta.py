#!/usr/bin/env python3
"""
generate_delta.py — Generate SQL delta patches between scripture.db versions.

This script compares the current scripture.db against the previous version
(downloaded from R2) and generates a gzipped SQL migration file containing
INSERT, UPDATE, and DELETE statements to transform the old DB into the new one.

Usage:
    python3 _tools/generate_delta.py

The script:
1. Fetches manifest.json from R2 to find current deployed version
2. Downloads the previous DB version from R2
3. Compares tables row-by-row
4. Generates SQL delta (INSERT/UPDATE/DELETE per table)
5. Gzips and uploads delta to R2
6. Updates manifest.json with new delta entry

If delta size > 50% of full DB size, skips delta generation (app falls back
to full download).

Environment Variables:
    R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY,
    R2_BUCKET_NAME, R2_PUBLIC_URL

Part of epic #758.
"""
import os
import sys
import json
import gzip
import sqlite3
import hashlib
import tempfile
from pathlib import Path
from datetime import datetime, timezone
from typing import Any

# Ensure stdout can handle UTF-8
if sys.stdout.encoding and sys.stdout.encoding.lower() != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

ROOT = Path(__file__).resolve().parent.parent
DB_PATH = ROOT / 'scripture.db'
VERSION_FILE = ROOT / '_tools' / 'db_version.json'
ENV_FILE = ROOT / '.env'

# Tables to skip during diff (virtual tables, internal SQLite tables)
SKIP_TABLES = {
    'sqlite_sequence',
    # FTS shadow tables (auto-managed)
    'verses_fts', 'verses_fts_config', 'verses_fts_data', 'verses_fts_docsize', 'verses_fts_idx',
    'people_fts', 'people_fts_config', 'people_fts_data', 'people_fts_docsize', 'people_fts_idx',
    'topics_fts', 'topics_fts_config', 'topics_fts_data', 'topics_fts_docsize', 'topics_fts_idx',
    'dictionary_fts', 'dictionary_fts_config', 'dictionary_fts_data', 'dictionary_fts_docsize', 'dictionary_fts_idx',
    'archaeology_fts', 'archaeology_fts_config', 'archaeology_fts_data', 'archaeology_fts_docsize', 'archaeology_fts_idx',
    'life_topics_fts', 'life_topics_fts_config', 'life_topics_fts_data', 'life_topics_fts_docsize', 'life_topics_fts_idx',
}

# Maximum delta size as percentage of full DB (skip if larger)
MAX_DELTA_RATIO = 0.50

# Number of deltas to retain
MAX_DELTAS = 10


def load_env():
    """Load environment variables from .env file if present."""
    if ENV_FILE.exists():
        with open(ENV_FILE) as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key, _, value = line.partition('=')
                    value = value.strip().strip('"').strip("'")
                    os.environ.setdefault(key.strip(), value)


def get_env(key: str) -> str:
    """Get required environment variable or exit with error."""
    value = os.environ.get(key)
    if not value:
        print(f"❌ Missing required environment variable: {key}")
        sys.exit(1)
    return value


def sha256_file(path: Path) -> str:
    """Calculate SHA256 hash of a file."""
    h = hashlib.sha256()
    with open(path, 'rb') as f:
        for chunk in iter(lambda: f.read(8192), b''):
            h.update(chunk)
    return h.hexdigest()


def sha256_bytes(data: bytes) -> str:
    """Calculate SHA256 hash of bytes."""
    return hashlib.sha256(data).hexdigest()


def get_version() -> str:
    """Read current DB version from db_version.json."""
    with open(VERSION_FILE) as f:
        return json.load(f)['version']


def get_s3_client():
    """Create boto3 S3 client configured for R2."""
    try:
        import boto3
    except ImportError:
        print("❌ boto3 not installed. Run: pip install boto3")
        sys.exit(1)
    
    account_id = get_env('R2_ACCOUNT_ID')
    access_key = get_env('R2_ACCESS_KEY_ID')
    secret_key = get_env('R2_SECRET_ACCESS_KEY')
    
    return boto3.client(
        's3',
        endpoint_url=f"https://{account_id}.r2.cloudflarestorage.com",
        aws_access_key_id=access_key,
        aws_secret_access_key=secret_key,
        region_name='auto',
    )


def fetch_manifest(s3, bucket: str) -> dict | None:
    """Fetch manifest.json from R2."""
    try:
        response = s3.get_object(Bucket=bucket, Key='db/manifest.json')
        return json.loads(response['Body'].read().decode('utf-8'))
    except Exception as e:
        print(f"⚠️  Could not fetch manifest: {e}")
        return None


def download_previous_db(s3, bucket: str, manifest: dict, temp_dir: Path) -> Path | None:
    """Download the currently deployed DB from R2."""
    url = manifest.get('full_db_url', '')
    if not url:
        return None
    
    # Extract key from URL
    public_url = get_env('R2_PUBLIC_URL').rstrip('/')
    key = url.replace(public_url + '/', '')
    
    dest_path = temp_dir / 'previous.db'
    print(f"📥 Downloading previous DB: {key}")
    
    try:
        s3.download_file(bucket, key, str(dest_path))
        print(f"   ✓ Downloaded ({dest_path.stat().st_size / 1024 / 1024:.1f} MB)")
        return dest_path
    except Exception as e:
        print(f"   ✗ Failed: {e}")
        return None


def get_tables(conn: sqlite3.Connection) -> set[str]:
    """Get list of user tables in database."""
    cursor = conn.execute(
        "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
    )
    return {row[0] for row in cursor.fetchall()} - SKIP_TABLES


def get_table_columns(conn: sqlite3.Connection, table: str) -> list[str]:
    """Get column names for a table."""
    cursor = conn.execute(f"PRAGMA table_info({table})")
    return [row[1] for row in cursor.fetchall()]


def get_primary_key(conn: sqlite3.Connection, table: str) -> list[str]:
    """Get primary key column(s) for a table."""
    cursor = conn.execute(f"PRAGMA table_info({table})")
    pk_cols = []
    for row in cursor.fetchall():
        # row: (cid, name, type, notnull, dflt_value, pk)
        if row[5] > 0:  # pk column is > 0 for PK columns
            pk_cols.append((row[5], row[1]))  # (pk_order, name)
    
    if pk_cols:
        pk_cols.sort()
        return [col for _, col in pk_cols]
    
    # No explicit PK — use rowid
    return ['rowid']


def row_to_dict(columns: list[str], row: tuple) -> dict:
    """Convert a row tuple to a dict."""
    return dict(zip(columns, row))


def escape_value(value: Any) -> str:
    """Escape a value for SQL."""
    if value is None:
        return 'NULL'
    elif isinstance(value, bool):
        return '1' if value else '0'
    elif isinstance(value, (int, float)):
        return str(value)
    elif isinstance(value, bytes):
        return f"X'{value.hex()}'"
    else:
        # String — escape single quotes
        escaped = str(value).replace("'", "''")
        return f"'{escaped}'"


def escape_identifier(name: str) -> str:
    """Escape a SQL identifier."""
    return f'"{name}"'


def generate_insert(table: str, columns: list[str], row: dict) -> str:
    """Generate INSERT statement."""
    cols = ', '.join(escape_identifier(c) for c in columns if c != 'rowid')
    vals = ', '.join(escape_value(row[c]) for c in columns if c != 'rowid')
    return f"INSERT INTO {escape_identifier(table)} ({cols}) VALUES ({vals});"


def generate_update(table: str, columns: list[str], pk_cols: list[str], row: dict) -> str:
    """Generate UPDATE statement."""
    set_parts = []
    for col in columns:
        if col not in pk_cols and col != 'rowid':
            set_parts.append(f"{escape_identifier(col)} = {escape_value(row[col])}")
    
    where_parts = [f"{escape_identifier(pk)} = {escape_value(row[pk])}" for pk in pk_cols]
    
    return f"UPDATE {escape_identifier(table)} SET {', '.join(set_parts)} WHERE {' AND '.join(where_parts)};"


def generate_delete(table: str, pk_cols: list[str], pk_values: dict) -> str:
    """Generate DELETE statement."""
    where_parts = [f"{escape_identifier(pk)} = {escape_value(pk_values[pk])}" for pk in pk_cols]
    return f"DELETE FROM {escape_identifier(table)} WHERE {' AND '.join(where_parts)};"


def hash_row(row: dict) -> str:
    """Generate a hash of row contents for comparison."""
    # Sort keys for consistent ordering
    content = json.dumps(row, sort_keys=True, default=str)
    return hashlib.md5(content.encode()).hexdigest()


def diff_table(old_conn: sqlite3.Connection, new_conn: sqlite3.Connection, table: str) -> list[str]:
    """Generate SQL statements to transform old table into new table."""
    statements = []
    
    # Get columns (use new schema as reference)
    new_columns = get_table_columns(new_conn, table)
    old_columns = get_table_columns(old_conn, table)
    pk_cols = get_primary_key(new_conn, table)
    
    # Check for schema changes
    if set(new_columns) != set(old_columns):
        # Schema changed — for now, just regenerate all rows
        # This is a simplification; full schema migration would be more complex
        print(f"   ⚠️  Schema changed for {table}, regenerating all rows")
        
        # Delete all old rows
        statements.append(f"DELETE FROM {escape_identifier(table)};")
        
        # Insert all new rows
        cursor = new_conn.execute(f"SELECT * FROM {escape_identifier(table)}")
        for row in cursor:
            row_dict = row_to_dict(new_columns, row)
            statements.append(generate_insert(table, new_columns, row_dict))
        
        return statements
    
    columns = new_columns
    
    # Build pk string for ordering
    pk_order = ', '.join(escape_identifier(pk) for pk in pk_cols)
    
    # Load all rows from both tables into memory (indexed by PK)
    def load_rows(conn: sqlite3.Connection) -> dict[tuple, dict]:
        cursor = conn.execute(f"SELECT * FROM {escape_identifier(table)} ORDER BY {pk_order}")
        rows = {}
        for row in cursor:
            row_dict = row_to_dict(columns, row)
            pk_tuple = tuple(row_dict[pk] for pk in pk_cols)
            rows[pk_tuple] = row_dict
        return rows
    
    old_rows = load_rows(old_conn)
    new_rows = load_rows(new_conn)
    
    old_pks = set(old_rows.keys())
    new_pks = set(new_rows.keys())
    
    # Inserts: in new but not in old
    for pk in sorted(new_pks - old_pks):
        statements.append(generate_insert(table, columns, new_rows[pk]))
    
    # Deletes: in old but not in new
    for pk in sorted(old_pks - new_pks):
        pk_values = dict(zip(pk_cols, pk))
        statements.append(generate_delete(table, pk_cols, pk_values))
    
    # Updates: in both, but content changed
    for pk in sorted(old_pks & new_pks):
        old_hash = hash_row(old_rows[pk])
        new_hash = hash_row(new_rows[pk])
        if old_hash != new_hash:
            statements.append(generate_update(table, columns, pk_cols, new_rows[pk]))
    
    return statements


def generate_delta(old_db_path: Path, new_db_path: Path, from_version: str, to_version: str) -> tuple[bytes, dict]:
    """Generate a complete delta between two database versions.
    
    Returns (gzipped_sql_bytes, stats_dict)
    """
    print(f"\n🔍 Generating delta: {from_version} → {to_version}")
    
    old_conn = sqlite3.connect(old_db_path)
    new_conn = sqlite3.connect(new_db_path)
    
    old_tables = get_tables(old_conn)
    new_tables = get_tables(new_conn)
    
    all_statements = []
    stats = {
        'tables_added': [],
        'tables_removed': [],
        'tables_modified': [],
        'inserts': 0,
        'updates': 0,
        'deletes': 0,
    }
    
    # Header
    all_statements.append(f"-- Delta from {from_version} to {to_version}")
    all_statements.append(f"-- Generated: {datetime.now(timezone.utc).isoformat()}")
    all_statements.append("")
    all_statements.append("BEGIN TRANSACTION;")
    all_statements.append("")
    
    # Tables removed (in old but not in new)
    for table in sorted(old_tables - new_tables):
        print(f"   - Dropping table: {table}")
        all_statements.append(f"-- Dropping table: {table}")
        all_statements.append(f"DROP TABLE IF EXISTS {escape_identifier(table)};")
        all_statements.append("")
        stats['tables_removed'].append(table)
    
    # Tables added (in new but not in old)
    for table in sorted(new_tables - old_tables):
        print(f"   + Adding table: {table}")
        stats['tables_added'].append(table)
        
        # Get CREATE TABLE statement
        cursor = new_conn.execute(
            "SELECT sql FROM sqlite_master WHERE type='table' AND name=?", (table,)
        )
        create_sql = cursor.fetchone()[0]
        
        all_statements.append(f"-- Adding table: {table}")
        all_statements.append(f"{create_sql};")
        
        # Insert all rows
        columns = get_table_columns(new_conn, table)
        cursor = new_conn.execute(f"SELECT * FROM {escape_identifier(table)}")
        for row in cursor:
            row_dict = row_to_dict(columns, row)
            all_statements.append(generate_insert(table, columns, row_dict))
            stats['inserts'] += 1
        
        all_statements.append("")
    
    # Tables in both — diff them
    for table in sorted(old_tables & new_tables):
        statements = diff_table(old_conn, new_conn, table)
        if statements:
            print(f"   ~ Modified table: {table} ({len(statements)} changes)")
            stats['tables_modified'].append(table)
            
            all_statements.append(f"-- Table: {table}")
            all_statements.extend(statements)
            all_statements.append("")
            
            # Count by type
            for stmt in statements:
                if stmt.startswith('INSERT'):
                    stats['inserts'] += 1
                elif stmt.startswith('UPDATE'):
                    stats['updates'] += 1
                elif stmt.startswith('DELETE'):
                    stats['deletes'] += 1
    
    # Update db_meta version
    all_statements.append("-- Update version")
    all_statements.append(f"UPDATE db_meta SET value = '{to_version}' WHERE key = 'version';")
    all_statements.append("")
    all_statements.append("COMMIT;")
    
    old_conn.close()
    new_conn.close()
    
    # Combine and compress
    sql_content = '\n'.join(all_statements)
    gzipped = gzip.compress(sql_content.encode('utf-8'), compresslevel=9)
    
    print(f"\n📊 Delta stats:")
    print(f"   Tables added: {len(stats['tables_added'])}")
    print(f"   Tables removed: {len(stats['tables_removed'])}")
    print(f"   Tables modified: {len(stats['tables_modified'])}")
    print(f"   Inserts: {stats['inserts']}")
    print(f"   Updates: {stats['updates']}")
    print(f"   Deletes: {stats['deletes']}")
    print(f"   SQL size: {len(sql_content) / 1024:.1f} KB")
    print(f"   Gzipped size: {len(gzipped) / 1024:.1f} KB")
    
    return gzipped, stats


def upload_delta(s3, bucket: str, public_url: str, from_version: str, to_version: str, gzipped: bytes) -> dict:
    """Upload delta to R2 and return delta entry for manifest."""
    key = f"db/deltas/{from_version}-{to_version}.sql.gz"
    
    print(f"\n📤 Uploading delta: {key}")
    
    s3.put_object(
        Bucket=bucket,
        Key=key,
        Body=gzipped,
        ContentType='application/gzip',
        ContentEncoding='gzip',
        CacheControl='public, max-age=31536000, immutable',
    )
    
    url = f"{public_url}/{key}"
    print(f"   ✓ Uploaded to {url}")
    
    return {
        'from_version': from_version,
        'to_version': to_version,
        'url': url,
        'sha256': sha256_bytes(gzipped),
        'size_bytes': len(gzipped),
    }


def update_manifest(s3, bucket: str, manifest: dict, new_delta: dict):
    """Update manifest with new delta and prune old ones."""
    # Add new delta
    manifest['deltas'].append(new_delta)
    
    # Sort deltas by from_version (newest first)
    manifest['deltas'].sort(key=lambda d: d['from_version'], reverse=True)
    
    # Prune old deltas
    if len(manifest['deltas']) > MAX_DELTAS:
        removed = manifest['deltas'][MAX_DELTAS:]
        manifest['deltas'] = manifest['deltas'][:MAX_DELTAS]
        print(f"   Pruned {len(removed)} old deltas")
        
        # Delete old delta files from R2
        for delta in removed:
            try:
                key = delta['url'].replace(get_env('R2_PUBLIC_URL').rstrip('/') + '/', '')
                s3.delete_object(Bucket=bucket, Key=key)
                print(f"   Deleted: {key}")
            except Exception as e:
                print(f"   ⚠️  Failed to delete {delta['url']}: {e}")
    
    # Update min_supported_version
    if manifest['deltas']:
        oldest_from = min(d['from_version'] for d in manifest['deltas'])
        manifest['min_supported_version'] = oldest_from
    
    manifest['updated_at'] = datetime.now(timezone.utc).isoformat()
    
    # Upload updated manifest
    print(f"\n📤 Updating manifest...")
    s3.put_object(
        Bucket=bucket,
        Key='db/manifest.json',
        Body=json.dumps(manifest, indent=2),
        ContentType='application/json',
        CacheControl='public, max-age=60',
    )
    print(f"   ✓ Manifest updated")


def main():
    print("=" * 60)
    print("Delta Generator")
    print("=" * 60)
    
    load_env()
    
    # Validate inputs
    if not DB_PATH.exists():
        print(f"❌ Database not found: {DB_PATH}")
        sys.exit(1)
    
    new_version = get_version()
    bucket = get_env('R2_BUCKET_NAME')
    public_url = get_env('R2_PUBLIC_URL').rstrip('/')
    
    print(f"📦 New version: {new_version}")
    print(f"📁 New DB: {DB_PATH} ({DB_PATH.stat().st_size / 1024 / 1024:.1f} MB)")
    
    # Get S3 client and manifest
    s3 = get_s3_client()
    manifest = fetch_manifest(s3, bucket)
    
    if not manifest:
        print("\n⚠️  No manifest found — this appears to be first upload.")
        print("   Run upload_to_r2.py first to establish baseline.")
        sys.exit(0)
    
    old_version = manifest.get('current_version')
    print(f"📦 Current deployed version: {old_version}")
    
    if old_version == new_version:
        print("\n✓ Versions match — no delta needed.")
        sys.exit(0)
    
    # Check if delta already exists
    existing_deltas = {(d['from_version'], d['to_version']) for d in manifest.get('deltas', [])}
    if (old_version, new_version) in existing_deltas:
        print(f"\n✓ Delta {old_version} → {new_version} already exists.")
        sys.exit(0)
    
    # Download previous DB
    with tempfile.TemporaryDirectory() as temp_dir:
        temp_path = Path(temp_dir)
        old_db_path = download_previous_db(s3, bucket, manifest, temp_path)
        
        if not old_db_path:
            print("\n❌ Could not download previous DB.")
            sys.exit(1)
        
        # Generate delta
        gzipped, stats = generate_delta(old_db_path, DB_PATH, old_version, new_version)
        
        # Check size ratio
        full_size = DB_PATH.stat().st_size
        delta_ratio = len(gzipped) / full_size
        
        print(f"\n📏 Delta ratio: {delta_ratio:.1%} of full DB")
        
        if delta_ratio > MAX_DELTA_RATIO:
            print(f"   ⚠️  Delta too large (>{MAX_DELTA_RATIO:.0%}) — skipping.")
            print("   App will fall back to full download for this version.")
            sys.exit(0)
        
        # Upload delta
        delta_entry = upload_delta(s3, bucket, public_url, old_version, new_version, gzipped)
        
        # Update manifest
        update_manifest(s3, bucket, manifest, delta_entry)
    
    print()
    print("=" * 60)
    print("✅ Delta generation complete!")
    print("=" * 60)
    print(f"   From: {old_version}")
    print(f"   To:   {new_version}")
    print(f"   Size: {len(gzipped) / 1024:.1f} KB ({delta_ratio:.1%} of full DB)")
    print()


if __name__ == '__main__':
    main()
