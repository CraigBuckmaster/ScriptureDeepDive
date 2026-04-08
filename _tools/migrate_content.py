#!/usr/bin/env python3
"""
migrate_content.py — Content schema migration tooling.

Applies versioned, composable migrations to all chapter JSON files.
Each migration transforms data from one schema version to the next.

Usage:
    python3 _tools/migrate_content.py                # apply all migrations
    python3 _tools/migrate_content.py --dry-run      # preview without writing
    python3 _tools/migrate_content.py --book genesis  # migrate a single book

Exit codes:
    0 = all files migrated (or already current)
    1 = error during migration
"""
import os
import sys
import json
import argparse
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CONTENT = ROOT / 'content'

# ── Current schema version ──
CURRENT_SCHEMA_VERSION = '1.0'

# ── Skip directories (not chapter JSON) ──
SKIP_DIRS = {'meta', 'verses', 'interlinear', 'archaeology', 'life_topics', 'historical_interpretations'}


# ══════════════════════════════════════════════════════════════════════
# Migration functions
# ══════════════════════════════════════════════════════════════════════
# Each migration takes a chapter dict and returns the modified dict.
# Migrations must be idempotent (safe to run multiple times).

def migrate_0_to_1(data):
    """v0.0 → v1.0: Add schema_version field and ensure prayer_prompt exists."""
    if 'prayer_prompt' not in data:
        data['prayer_prompt'] = None
    data['schema_version'] = '1.0'
    return data


# ── Migration registry (from_version, to_version, function) ──
# Order matters: migrations are applied sequentially.
MIGRATIONS = [
    ('0.0', '1.0', migrate_0_to_1),
]


# ══════════════════════════════════════════════════════════════════════
# Migration engine
# ══════════════════════════════════════════════════════════════════════

def get_schema_version(data):
    """Extract schema version from chapter data, defaulting to '0.0'."""
    return data.get('schema_version', '0.0')


def needs_migration(data):
    """Check if a chapter file needs migration."""
    return get_schema_version(data) != CURRENT_SCHEMA_VERSION


def migrate_chapter(data):
    """Apply all necessary migrations to bring data to current version.

    Returns:
        tuple: (migrated_data, list of applied migration version pairs)
    """
    current = get_schema_version(data)
    applied = []

    for from_ver, to_ver, func in MIGRATIONS:
        if current == from_ver:
            data = func(data)
            applied.append((from_ver, to_ver))
            current = to_ver

    return data, applied


def migrate_file(json_path, dry_run=False):
    """Migrate a single chapter JSON file.

    Returns:
        tuple: (was_migrated: bool, migrations_applied: list)
    """
    try:
        text = json_path.read_text(encoding='utf-8')
        data = json.loads(text)
    except (json.JSONDecodeError, UnicodeDecodeError) as e:
        print(f"  [ERROR] {json_path}: {e}")
        return False, []

    if not isinstance(data, dict):
        return False, []

    if not needs_migration(data):
        return False, []

    migrated, applied = migrate_chapter(data)

    if not dry_run:
        with open(json_path, 'w', encoding='utf-8') as f:
            json.dump(migrated, f, ensure_ascii=False, indent=2)
            f.write('\n')

    return True, applied


def main():
    parser = argparse.ArgumentParser(description="Content schema migration tool")
    parser.add_argument("--dry-run", action="store_true",
                        help="Preview changes without writing files")
    parser.add_argument("--book", type=str, default=None,
                        help="Migrate a single book (e.g. genesis)")
    args = parser.parse_args()

    os.chdir(ROOT)

    print("=" * 60)
    print(f"Content Schema Migration → v{CURRENT_SCHEMA_VERSION}")
    if args.dry_run:
        print("  [DRY RUN] No files will be modified")
    print("=" * 60)

    total_files = 0
    migrated_count = 0
    skipped_count = 0
    error_count = 0

    for book_dir in sorted(CONTENT.iterdir()):
        if not book_dir.is_dir() or book_dir.name in SKIP_DIRS:
            continue
        if args.book and book_dir.name != args.book:
            continue

        for json_file in sorted(book_dir.glob('*.json')):
            total_files += 1
            try:
                was_migrated, applied = migrate_file(json_file, dry_run=args.dry_run)
                if was_migrated:
                    migrated_count += 1
                    versions = ' → '.join(f"{a[0]}→{a[1]}" for a in applied)
                    action = "would migrate" if args.dry_run else "migrated"
                    print(f"  [{action}] {book_dir.name}/{json_file.name} ({versions})")
                else:
                    skipped_count += 1
            except Exception as e:
                error_count += 1
                print(f"  [ERROR] {book_dir.name}/{json_file.name}: {e}")

    print(f"\n{'=' * 60}")
    print(f"RESULTS: {total_files} files scanned, "
          f"{migrated_count} migrated, {skipped_count} already current, "
          f"{error_count} errors")
    if args.dry_run and migrated_count > 0:
        print(f"  Run without --dry-run to apply {migrated_count} migrations")
    print(f"{'=' * 60}")

    return 0 if error_count == 0 else 1


if __name__ == '__main__':
    sys.exit(main())
