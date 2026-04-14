#!/usr/bin/env python3
"""
upload_to_r2.py — Upload scripture.db and manifest.json to CloudFlare R2.

This script uploads the compiled database to CloudFlare R2 for CDN delivery.
The app fetches manifest.json to check for updates, then downloads deltas
or the full DB as needed.

Usage:
    python3 _tools/upload_to_r2.py

Environment Variables (required):
    R2_ACCOUNT_ID       — CloudFlare account ID
    R2_ACCESS_KEY_ID    — R2 API token access key
    R2_SECRET_ACCESS_KEY — R2 API token secret
    R2_BUCKET_NAME      — R2 bucket name (e.g., 'companionstudybucket')
    R2_PUBLIC_URL       — Public URL (e.g., 'https://contentcompanionstudy.com')

The script can also read from a .env file in the repo root (gitignored).

Output structure on R2:
    db/scripture-{version}.db     — Full database file
    db/manifest.json              — Version manifest with URLs and checksums
    db/deltas/{from}-{to}.sql.gz  — Delta patches (created by generate_delta.py)
"""
import os
import sys
import json
import hashlib
from pathlib import Path
from datetime import datetime, timezone

# Ensure stdout can handle UTF-8
if sys.stdout.encoding and sys.stdout.encoding.lower() != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

ROOT = Path(__file__).resolve().parent.parent
DB_PATH = ROOT / 'scripture.db'
DB_MANIFEST_PATH = ROOT / 'app' / 'assets' / 'db-manifest.json'
MAP_STYLES_DIR = ROOT / 'content' / 'map-styles'
MAP_STYLE_FILES = ('ancient.json', 'modern.json')
ENV_FILE = ROOT / '.env'


def load_env():
    """Load environment variables from .env file if present."""
    if ENV_FILE.exists():
        with open(ENV_FILE) as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key, _, value = line.partition('=')
                    # Remove quotes if present
                    value = value.strip().strip('"').strip("'")
                    os.environ.setdefault(key.strip(), value)


def get_env(key: str) -> str:
    """Get required environment variable or exit with error."""
    value = os.environ.get(key)
    if not value:
        print(f"❌ Missing required environment variable: {key}")
        print("   Set it in your environment or in .env file")
        sys.exit(1)
    return value


def sha256_file(path: Path) -> str:
    """Calculate SHA256 hash of a file."""
    h = hashlib.sha256()
    with open(path, 'rb') as f:
        for chunk in iter(lambda: f.read(8192), b''):
            h.update(chunk)
    return h.hexdigest()


def get_content_hash() -> str:
    """Read current content hash from db-manifest.json."""
    with open(DB_MANIFEST_PATH) as f:
        data = json.load(f)
    return data['content_hash']


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
        region_name='auto',  # R2 uses 'auto' for region
    )


def get_existing_manifest(s3, bucket: str, public_url: str) -> dict | None:
    """Fetch existing manifest.json from R2, or None if not found."""
    try:
        response = s3.get_object(Bucket=bucket, Key='db/manifest.json')
        return json.loads(response['Body'].read().decode('utf-8'))
    except s3.exceptions.NoSuchKey:
        return None
    except Exception as e:
        print(f"⚠️  Could not fetch existing manifest: {e}")
        return None


def upload_map_styles(s3, bucket: str, public_url: str) -> int:
    """
    Upload MapLibre style JSON files (ancient.json / modern.json) to R2
    under `map-styles/`. Returns the count of files uploaded.

    Styles are fetched by the app at runtime from the R2 public URL, so
    editing the parchment palette or adjusting a layer is a one-file
    upload — no app release required. See map epic #1314 / issue #1316.
    """
    if not MAP_STYLES_DIR.exists():
        print(f"⚠️  map-styles directory not found: {MAP_STYLES_DIR} — skipping")
        return 0

    uploaded = 0
    for name in MAP_STYLE_FILES:
        path = MAP_STYLES_DIR / name
        if not path.exists():
            print(f"⚠️  Missing {path.relative_to(ROOT)} — skipping")
            continue

        # Structural sanity check — style files must be MapLibre Style Spec v8.
        try:
            data = json.loads(path.read_text(encoding='utf-8'))
        except json.JSONDecodeError as e:
            print(f"❌ {path.relative_to(ROOT)}: invalid JSON — {e}")
            sys.exit(1)
        if data.get('version') != 8:
            print(f"❌ {path.relative_to(ROOT)}: style spec version must be 8")
            sys.exit(1)

        key = f"map-styles/{name}"
        print(f"📤 Uploading {key}...")
        s3.upload_file(
            str(path),
            bucket,
            key,
            ExtraArgs={
                'ContentType': 'application/json',
                # Short cache so style tweaks roll out quickly.
                'CacheControl': 'public, max-age=300, must-revalidate',
            },
        )
        print(f"   ✓ Uploaded to {public_url}/{key}")
        uploaded += 1
    return uploaded


def main():
    print("=" * 60)
    print("CloudFlare R2 Upload")
    print("=" * 60)

    # Load .env if present
    load_env()

    # Allow map-styles-only uploads (restyle without rebuilding the DB).
    styles_only = '--styles-only' in sys.argv

    bucket_env = get_env('R2_BUCKET_NAME')
    public_url_env = get_env('R2_PUBLIC_URL').rstrip('/')

    if styles_only:
        s3 = get_s3_client()
        n = upload_map_styles(s3, bucket_env, public_url_env)
        print()
        print("=" * 60)
        print(f"✅ Uploaded {n} map style file(s) to {public_url_env}/map-styles/")
        print("=" * 60)
        return

    # Validate inputs
    if not DB_PATH.exists():
        print(f"❌ Database not found: {DB_PATH}")
        print("   Run build_sqlite.py first")
        sys.exit(1)
    
    if not DB_MANIFEST_PATH.exists():
        print(f"❌ Manifest not found: {DB_MANIFEST_PATH}")
        print("   Run build_sqlite.py first")
        sys.exit(1)
    
    content_hash = get_content_hash()
    bucket = bucket_env
    public_url = public_url_env

    print(f"📦 Version: {content_hash}")
    print(f"📁 Database: {DB_PATH}")
    print(f"   Size: {DB_PATH.stat().st_size / 1024 / 1024:.1f} MB")
    print(f"🪣 Bucket: {bucket}")
    print(f"🌐 Public URL: {public_url}")
    print()
    
    # Calculate checksum
    print("🔐 Calculating SHA256 checksum...")
    db_sha256 = sha256_file(DB_PATH)
    print(f"   {db_sha256[:16]}...")
    
    # Create S3 client
    s3 = get_s3_client()
    
    # Upload database
    db_key = f"db/scripture-{content_hash}.db"
    print(f"\n📤 Uploading {db_key}...")
    
    s3.upload_file(
        str(DB_PATH),
        bucket,
        db_key,
        ExtraArgs={
            'ContentType': 'application/x-sqlite3',
            'CacheControl': 'public, max-age=31536000, immutable',  # 1 year, versioned
        }
    )
    print(f"   ✓ Uploaded to {public_url}/{db_key}")
    
    # Get existing manifest to preserve deltas
    existing_manifest = get_existing_manifest(s3, bucket, public_url)
    existing_deltas = existing_manifest.get('deltas', []) if existing_manifest else []
    
    # Build manifest
    manifest = {
        "current_version": content_hash,
        "min_supported_version": content_hash,  # Will be updated when we have deltas
        "full_db_url": f"{public_url}/{db_key}",
        "full_db_sha256": db_sha256,
        "full_db_size_bytes": DB_PATH.stat().st_size,
        "deltas": existing_deltas,
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }
    
    # Update min_supported_version based on oldest delta
    if existing_deltas:
        oldest_from = min(d['from_version'] for d in existing_deltas)
        manifest['min_supported_version'] = oldest_from
    
    # Upload manifest
    manifest_key = "db/manifest.json"
    print(f"\n📤 Uploading {manifest_key}...")
    
    s3.put_object(
        Bucket=bucket,
        Key=manifest_key,
        Body=json.dumps(manifest, indent=2),
        ContentType='application/json',
        CacheControl='public, max-age=60',  # 1 minute cache for manifest
    )
    print(f"   ✓ Uploaded to {public_url}/{manifest_key}")

    # Map style JSON (ancient.json / modern.json) — see #1316.
    print()
    upload_map_styles(s3, bucket, public_url)

    # Summary
    print()
    print("=" * 60)
    print("✅ Upload complete!")
    print("=" * 60)
    print(f"   Manifest: {public_url}/{manifest_key}")
    print(f"   Database: {public_url}/{db_key}")
    print(f"   Version:  {content_hash}")
    print(f"   Deltas:   {len(existing_deltas)}")
    print()


if __name__ == '__main__':
    main()
