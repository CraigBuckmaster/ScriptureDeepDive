"""
upload_phase2_to_r2.py - Upload Phase 2 images to R2 (run on Windows)

Usage:
  1. Copy art_staging/phase2/ folder from repo
  2. Run: python upload_phase2_to_r2.py

Requires: pip install boto3
"""

import boto3
import os
from pathlib import Path

# R2 credentials - same as GitHub secrets
R2_ACCOUNT_ID = '4f42abea81954721b5fb1b45adb1a554'
R2_ACCESS_KEY_ID = '33c5fbcf9c1e7b16f4e94ac659a69d6f'
R2_SECRET = '68ddcab86acd29ee9e0ddd5f268c97b1e5d8813ae3f71d97d0bb9c99c1e8b45b'
R2_BUCKET = 'companionstudybucket'
R2_PUBLIC_URL = 'https://contentcompanionstudy.com'

# Find staging directory
SCRIPT_DIR = Path(__file__).parent
STAGING_DIR = SCRIPT_DIR / 'art_staging' / 'phase2'

if not STAGING_DIR.exists():
    # Try relative to current working directory
    STAGING_DIR = Path('art_staging/phase2')
    if not STAGING_DIR.exists():
        STAGING_DIR = Path('phase2')
        if not STAGING_DIR.exists():
            print(f"ERROR: Cannot find phase2 staging directory")
            print(f"Place images in: {Path.cwd() / 'art_staging' / 'phase2'}")
            exit(1)

print(f"Source directory: {STAGING_DIR.absolute()}")

# Initialize R2 client
s3 = boto3.client(
    's3',
    endpoint_url=f'https://{R2_ACCOUNT_ID}.r2.cloudflarestorage.com',
    aws_access_key_id=R2_ACCESS_KEY_ID,
    aws_secret_access_key=R2_SECRET,
    region_name='auto'
)

print("\n=== UPLOADING TO R2 ===\n")

images = list(STAGING_DIR.glob('*.jpg'))
print(f"Found {len(images)} images\n")

uploaded = []
failed = []

for i, img_path in enumerate(sorted(images), 1):
    key = f"art/{img_path.name}"
    size_kb = img_path.stat().st_size / 1024
    
    try:
        s3.upload_file(
            str(img_path),
            R2_BUCKET,
            key,
            ExtraArgs={'ContentType': 'image/jpeg'}
        )
        url = f"{R2_PUBLIC_URL}/{key}"
        print(f"[{i}/{len(images)}] OK: {img_path.name} ({size_kb:.0f}KB)")
        uploaded.append((img_path.name, url))
    except Exception as e:
        print(f"[{i}/{len(images)}] FAIL: {img_path.name} - {e}")
        failed.append((img_path.name, str(e)))

print(f"\n{'='*50}")
print(f"SUMMARY")
print(f"{'='*50}")
print(f"Uploaded: {len(uploaded)}/{len(images)}")
print(f"Failed:   {len(failed)}")

if uploaded:
    print(f"\nR2 URLs:")
    for name, url in uploaded[:5]:
        print(f"  {url}")
    if len(uploaded) > 5:
        print(f"  ... and {len(uploaded) - 5} more")

if failed:
    print(f"\nFailed uploads:")
    for name, err in failed:
        print(f"  {name}: {err}")
