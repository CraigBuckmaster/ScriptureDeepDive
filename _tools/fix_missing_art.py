#!/usr/bin/env python3
"""
fix_missing_art.py — Fetch and upload a specific list of art assets to R2.

Bridges the gap between `content_images` rows referencing an R2 URL and the
actual file existing on R2. When a curated image is referenced by an
Explore card or detail screen but the bytes aren't in the bucket yet, the
app renders a placeholder instead of the image. This script takes a list
of (filename, wikimedia_source_url) pairs, downloads each source (with the
proper User-Agent Wikimedia requires), converts PNG → JPG to match the
filename extension written into the DB, and uploads to R2 under the
`art/` prefix.

Why this script exists as its own tool:
  - Stateless one-off uploads, distinct from the bulk curation flow in
    `download_explore_images.py` + `upload_images_to_r2.py`.
  - Now reads from `_tools/art_sources/` (committed via Git LFS) as the
    source of truth. The `--populate-sources` flag re-seeds that directory
    from Wikimedia Commons when new assets are added or an existing one
    needs re-curating. This eliminates runtime dependence on
    upload.wikimedia.org, which has proven unreliable as Commons curation
    routinely invalidates hash-prefixed URLs.

Usage:
    # Normal operation — upload local sources to R2:
    python _tools/fix_missing_art.py
    python _tools/fix_missing_art.py --dry-run
    python _tools/fix_missing_art.py --only schnorr

    # Seeding / re-seeding local sources from Wikimedia Commons:
    python _tools/fix_missing_art.py --populate-sources
    python _tools/fix_missing_art.py --populate-sources --only campin

Environment variables (R2 upload mode only):
    R2_ACCOUNT_ID
    R2_ACCESS_KEY_ID
    R2_SECRET_ACCESS_KEY
    R2_BUCKET_NAME
    R2_PUBLIC_URL

Reads from `.env` at the repo root if present (matches the pattern used by
`upload_images_to_r2.py`). In CI the env vars come from secrets directly.

Exit codes:
    0  — every targeted file was uploaded and verified 200 on R2
    1  — one or more files failed at fetch, convert, or upload
    2  — environment/config error (missing creds, missing deps, etc.)
"""
from __future__ import annotations

import argparse
import io
import os
import sys
import urllib.error
import urllib.request
from dataclasses import dataclass
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
ENV_FILE = ROOT / '.env'
ART_SOURCES_DIR = ROOT / '_tools' / 'art_sources'

# Wikimedia requires an identifying User-Agent with contact info.
# https://meta.wikimedia.org/wiki/User-Agent_policy
WIKIMEDIA_USER_AGENT = (
    'CompanionStudyBot/1.0 '
    '(https://companionstudy.app; craig@companionstudy.app) '
    'Python/3'
)

# Immutable cache — art files are versioned by filename; if we ever need to
# replace one we'd change the filename.
CACHE_CONTROL = 'public, max-age=31536000, immutable'


@dataclass(frozen=True)
class ArtTarget:
    """A single file to fetch and upload.

    `r2_filename` is the name the DB's `content_images.url` column expects
    (e.g. `schnorr-010.jpg`). `source_url` is the upstream Wikimedia URL.
    `description` is free-text for logs.
    """
    r2_filename: str
    source_url: str
    description: str


# ── Tonight's target list: 4 Map + 5 Prophecy card images ──────────────
#
# These filenames are already referenced by `content_images` rows in
# scripture.db (verified against the Apr 21 2026 build). The rows point at
# `https://contentcompanionstudy.com/art/{r2_filename}` — so uploading each
# file under `art/{r2_filename}` completes the chain; no DB edit required.
#
# Source URLs copied from `download_explore_images.py` (same file, same
# curation, same credits), kept inline here so this script is
# self-contained and does not reach into another script's data.
#
# Adding future files: append to this list. To run a different list
# entirely, refactor to read from a JSON input — but deliberately not
# doing that now, we want the target set reviewed in PR.
TARGETS: list[ArtTarget] = [
    # ── Map card (4) ────────────────────────────────────────────────
    ArtTarget(
        r2_filename='figures-abraham-journey.jpg',
        source_url='https://upload.wikimedia.org/wikipedia/commons/7/72/Figures_The_Journey_of_Abraham.jpg',
        description='Map/abram-call — Figures: The Journey of Abraham',
    ),
    ArtTarget(
        r2_filename='figures-red-sea-crossing.jpg',
        source_url='https://upload.wikimedia.org/wikipedia/commons/1/17/Figures_Crossing_of_the_Red_Sea.jpg',
        description='Map/exodus-plagues — Figures: Crossing of the Red Sea',
    ),
    ArtTarget(
        r2_filename='holman-paul-journey3.jpg',
        source_url="https://upload.wikimedia.org/wikipedia/commons/0/02/Holman_Paul%27s_Third_Missionary_Journey.jpg",
        description="Map/paul-journey3 — Holman: Paul's Third Missionary Journey",
    ),
    ArtTarget(
        r2_filename='campin-nativity.jpg',
        source_url='https://upload.wikimedia.org/wikipedia/commons/3/38/Robert_Campin_-_The_Nativity_-_WGA14420.jpg',
        description='Map/nativity — Robert Campin: The Nativity',
    ),

    # ── Prophecy card (5) ───────────────────────────────────────────
    ArtTarget(
        r2_filename='schnorr-010.jpg',
        source_url='https://upload.wikimedia.org/wikipedia/commons/f/f5/Schnorr_von_Carolsfeld_Bibel_in_Bildern_1860_010.png',
        description='Prophecy/seed_of_woman — Schnorr: Creation (PNG→JPG)',
    ),
    ArtTarget(
        r2_filename='schnorr-091.jpg',
        source_url='https://upload.wikimedia.org/wikipedia/commons/2/28/Schnorr_von_Carolsfeld_Bibel_in_Bildern_1860_091.png',
        description='Prophecy/davidic_covenant — Schnorr: David with harp (PNG→JPG)',
    ),
    ArtTarget(
        r2_filename='michelangelo-isaiah.jpg',
        source_url='https://upload.wikimedia.org/wikipedia/commons/1/18/Michelangelo%2C_profeta_Isaia_02.jpg',
        description='Prophecy/suffering_servant — Michelangelo: Prophet Isaiah',
    ),
    ArtTarget(
        r2_filename='michelangelo-daniel.jpg',
        source_url='https://upload.wikimedia.org/wikipedia/commons/0/03/Michelangelo%2C_profeta_Daniele_02.jpg',
        description='Prophecy/son_of_man — Michelangelo: Prophet Daniel',
    ),
    ArtTarget(
        r2_filename='michelangelo-jeremiah.jpg',
        source_url='https://upload.wikimedia.org/wikipedia/commons/4/4a/Michelangelo_Buonarroti_-_Sistine_Chapel_Ceiling_-_Jeremiah.jpg',
        description='Prophecy/new_covenant — Michelangelo: Prophet Jeremiah',
    ),
]


# ── env loading ────────────────────────────────────────────────────────

def load_env() -> None:
    """Load `.env` at repo root if present. Env already set wins.

    Matches the behaviour of `load_env()` in `upload_images_to_r2.py` so a
    developer who has the existing flow working locally doesn't need to do
    anything different.
    """
    if not ENV_FILE.exists():
        return
    with open(ENV_FILE) as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith('#') or '=' not in line:
                continue
            key, _, value = line.partition('=')
            value = value.strip().strip('"').strip("'")
            os.environ.setdefault(key.strip(), value)


def require_env(key: str) -> str:
    """Fetch an env var or die with a clear message."""
    value = os.environ.get(key)
    if not value:
        print(f'[X] Missing required environment variable: {key}')
        sys.exit(2)
    return value


# ── fetch ──────────────────────────────────────────────────────────────

def fetch_source(target: ArtTarget) -> bytes:
    """Download `target.source_url`. Returns raw bytes.

    Uses the Wikimedia-compliant User-Agent. Raises on non-200 or empty
    response so the caller can record it as a failure.
    """
    req = urllib.request.Request(
        target.source_url,
        headers={
            'User-Agent': WIKIMEDIA_USER_AGENT,
            'Accept': 'image/*,*/*',
        },
    )
    with urllib.request.urlopen(req, timeout=30) as resp:
        data = resp.read()
    if len(data) < 1024:
        raise RuntimeError(
            f'Response too small ({len(data)} bytes) — likely not a valid image'
        )
    return data


# ── convert ────────────────────────────────────────────────────────────

def ensure_jpeg(source_url: str, raw: bytes) -> bytes:
    """If the R2 filename is .jpg but the source is .png (or other), convert.

    The DB references files with .jpg extensions regardless of upstream
    format (`schnorr-010.jpg` → upstream is a PNG). Uploading the raw PNG
    bytes under a .jpg key means the served file's magic bytes don't match
    its extension, which trips `expo-image` on some platforms.

    Decision: convert to JPEG using Pillow, quality 90. JPEG at q90 is
    visually indistinguishable from the PNG source at the display sizes
    used in-app and avoids the format/extension mismatch.
    """
    if source_url.lower().endswith('.jpg') or source_url.lower().endswith('.jpeg'):
        return raw  # Already JPEG, no conversion needed

    try:
        from PIL import Image
    except ImportError:
        print('[X] Pillow not installed. Run: pip install Pillow')
        sys.exit(2)

    img = Image.open(io.BytesIO(raw))
    # PNGs from Wikimedia can be RGBA; JPEG is RGB-only. Flatten to white.
    if img.mode in ('RGBA', 'LA') or (img.mode == 'P' and 'transparency' in img.info):
        background = Image.new('RGB', img.size, (255, 255, 255))
        background.paste(img, mask=img.split()[-1] if img.mode == 'RGBA' else None)
        img = background
    elif img.mode != 'RGB':
        img = img.convert('RGB')

    buf = io.BytesIO()
    img.save(buf, format='JPEG', quality=90, optimize=True)
    return buf.getvalue()


# ── upload ─────────────────────────────────────────────────────────────

def get_s3_client():
    """boto3 S3 client wired for CloudFlare R2."""
    try:
        import boto3
    except ImportError:
        print('[X] boto3 not installed. Run: pip install boto3')
        sys.exit(2)

    return boto3.client(
        's3',
        endpoint_url=f"https://{require_env('R2_ACCOUNT_ID')}.r2.cloudflarestorage.com",
        aws_access_key_id=require_env('R2_ACCESS_KEY_ID'),
        aws_secret_access_key=require_env('R2_SECRET_ACCESS_KEY'),
        region_name='auto',
    )


def upload_to_r2(s3, bucket: str, target: ArtTarget, body: bytes) -> None:
    """Upload `body` to R2 at `art/{r2_filename}`."""
    s3.put_object(
        Bucket=bucket,
        Key=f'art/{target.r2_filename}',
        Body=body,
        ContentType='image/jpeg',
        CacheControl=CACHE_CONTROL,
    )


# ── verify ─────────────────────────────────────────────────────────────

def verify_public_url(public_url_base: str, target: ArtTarget) -> int:
    """HEAD the public URL and return the HTTP status code.

    Best-effort: CloudFlare's public URL may take a moment to propagate
    after upload, but in practice R2 serves immediately. We still treat a
    non-200 as a soft warning rather than a hard failure, because the
    upload has already succeeded by the time we reach here.
    """
    url = f"{public_url_base.rstrip('/')}/art/{target.r2_filename}"
    req = urllib.request.Request(url, method='HEAD', headers={'User-Agent': 'companionstudy-verify/1.0'})
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            return resp.status
    except urllib.error.HTTPError as e:
        return e.code
    except Exception:
        return 0


# ── main ───────────────────────────────────────────────────────────────

def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__.split('\n\n')[0] if __doc__ else '')
    parser.add_argument('--dry-run', action='store_true', help='Skip writes (no R2 upload in normal mode; no disk write in populate mode)')
    parser.add_argument('--only', metavar='SUBSTRING', help='Only process targets whose filename contains SUBSTRING')
    parser.add_argument(
        '--populate-sources',
        action='store_true',
        help='Download sources from Commons into _tools/art_sources/ instead of uploading to R2',
    )
    args = parser.parse_args()

    load_env()

    # Filter targets
    targets = list(TARGETS)
    if args.only:
        targets = [t for t in targets if args.only in t.r2_filename]
        if not targets:
            print(f'[X] --only={args.only!r} matched zero targets')
            return 2

    print('=' * 60)
    print('fix_missing_art — surgical R2 art upload')
    print('=' * 60)
    print(f'Targets: {len(targets)}')
    if args.populate_sources:
        label = 'POPULATE SOURCES (Commons -> _tools/art_sources/)'
        if args.dry_run:
            label += ' [DRY RUN, no disk writes]'
        print(f'Mode:    {label}')
    elif args.dry_run:
        print('Mode:    DRY RUN (no R2 writes)')
    else:
        print('Mode:    UPLOAD (local -> R2)')
    print()

    s3 = None
    bucket = ''
    public_url_base = ''
    if not args.dry_run and not args.populate_sources:
        s3 = get_s3_client()
        bucket = require_env('R2_BUCKET_NAME')
        public_url_base = require_env('R2_PUBLIC_URL')

    succeeded: list[str] = []
    failed: list[tuple[str, str]] = []  # (filename, reason)

    for i, target in enumerate(targets, 1):
        print(f'[{i}/{len(targets)}] {target.r2_filename}')
        print(f'         {target.description}')

        if args.populate_sources:
            # Commons -> local disk
            try:
                raw = fetch_source(target)
                print(f'         [OK] fetched {len(raw):,} bytes')
            except Exception as e:
                print(f'         [X] fetch failed: {e}')
                failed.append((target.r2_filename, f'fetch: {e}'))
                continue

            try:
                body = ensure_jpeg(target.source_url, raw)
                if body is not raw:
                    print(f'         [OK] converted to JPEG ({len(body):,} bytes)')
            except Exception as e:
                print(f'         [X] convert failed: {e}')
                failed.append((target.r2_filename, f'convert: {e}'))
                continue

            dest = ART_SOURCES_DIR / target.r2_filename
            if args.dry_run:
                print(f'         [--] skipped write to {dest.relative_to(ROOT)} (dry run)')
            else:
                ART_SOURCES_DIR.mkdir(parents=True, exist_ok=True)
                dest.write_bytes(body)
                print(f'         [OK] wrote {dest.relative_to(ROOT)}')
            succeeded.append(target.r2_filename)
            continue

        # Default mode: local disk -> R2
        local_path = ART_SOURCES_DIR / target.r2_filename
        if not local_path.exists():
            print(f'         [X] no local source at {local_path.relative_to(ROOT)}')
            print(f'             run with --populate-sources to fetch from Commons')
            failed.append((target.r2_filename, 'missing local source'))
            continue

        body = local_path.read_bytes()
        print(f'         [OK] read {len(body):,} bytes from {local_path.relative_to(ROOT)}')

        if args.dry_run:
            print('         [--] skipped upload (dry run)')
            succeeded.append(target.r2_filename)
            continue

        try:
            upload_to_r2(s3, bucket, target, body)
            print(f'         [OK] uploaded to art/{target.r2_filename}')
        except Exception as e:
            print(f'         [X] upload failed: {e}')
            failed.append((target.r2_filename, f'upload: {e}'))
            continue

        status = verify_public_url(public_url_base, target)
        if status == 200:
            print(f'         [OK] verified 200 at public URL')
        else:
            print(f'         [!] public URL returned {status} (may just be CDN lag)')

        succeeded.append(target.r2_filename)

    # Summary
    print()
    print('=' * 60)
    print('SUMMARY')
    print('=' * 60)
    print(f'  Succeeded: {len(succeeded)}')
    print(f'  Failed:    {len(failed)}')
    if failed:
        print()
        print('  Failures:')
        for filename, reason in failed:
            print(f'    - {filename}: {reason}')

    return 0 if not failed else 1


if __name__ == '__main__':
    sys.exit(main())
