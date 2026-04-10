#!/usr/bin/env python3
"""
upload_images_to_r2.py - Upload images to CloudFlare R2.

Uploads images from _tools/art_staging/priority/ to R2 under the art/ prefix.
Generates a URL mapping file for updating JSON references.

Usage:
    python3 _tools/upload_images_to_r2.py [--priority] [--all]

Options:
    --priority  Upload only priority images (default)
    --all       Upload all staged images

Environment Variables (required):
    R2_ACCOUNT_ID       - CloudFlare account ID
    R2_ACCESS_KEY_ID    - R2 API token access key
    R2_SECRET_ACCESS_KEY - R2 API token secret
    R2_BUCKET_NAME      - R2 bucket name
    R2_PUBLIC_URL       - Public URL base

The script can also read from a .env file in the repo root.
"""
import os
import sys
import json
import hashlib
import mimetypes
from pathlib import Path
from datetime import datetime, timezone

ROOT = Path(__file__).resolve().parent.parent
STAGING_DIR = ROOT / '_tools' / 'art_staging'
PRIORITY_DIR = STAGING_DIR / 'priority'
ENV_FILE = ROOT / '.env'


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
        print(f"[X] Missing required environment variable: {key}")
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


def get_s3_client():
    """Create boto3 S3 client configured for R2."""
    try:
        import boto3
    except ImportError:
        print("[X] boto3 not installed. Run: pip install boto3")
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


def get_content_type(filename: str) -> str:
    """Get MIME type for file."""
    mime_type, _ = mimetypes.guess_type(filename)
    return mime_type or 'application/octet-stream'


def main():
    priority_only = '--all' not in sys.argv
    
    print("=" * 60)
    print("CloudFlare R2 Image Upload")
    print("=" * 60)
    
    load_env()
    
    # Determine source directory
    if priority_only:
        source_dir = PRIORITY_DIR
        manifest_file = STAGING_DIR / 'priority_manifest.json'
        print("Mode: Priority images only")
    else:
        source_dir = STAGING_DIR
        manifest_file = STAGING_DIR / 'inventory.json'
        print("Mode: All staged images")
    
    if not source_dir.exists():
        print(f"[X] Source directory not found: {source_dir}")
        print("   Run download_priority_images.py first")
        sys.exit(1)
    
    # Get image files
    image_files = list(source_dir.glob('*.jpg')) + list(source_dir.glob('*.png'))
    if not image_files:
        print(f"[X] No images found in {source_dir}")
        sys.exit(1)
    
    bucket = get_env('R2_BUCKET_NAME')
    public_url = get_env('R2_PUBLIC_URL').rstrip('/')
    
    print(f"\n-- Source: {source_dir}")
    print(f"--  Images: {len(image_files)}")
    print(f"-- Bucket: {bucket}")
    print(f"-- Public URL: {public_url}")
    print()
    
    # Create S3 client
    s3 = get_s3_client()
    
    # Upload images
    uploaded = []
    failed = []
    
    for i, img_path in enumerate(sorted(image_files), 1):
        filename = img_path.name
        r2_key = f"art/{filename}"
        
        print(f"[{i}/{len(image_files)}] {filename}")
        
        try:
            content_type = get_content_type(filename)
            file_hash = sha256_file(img_path)
            
            s3.upload_file(
                str(img_path),
                bucket,
                r2_key,
                ExtraArgs={
                    'ContentType': content_type,
                    'CacheControl': 'public, max-age=31536000, immutable',
                }
            )
            
            r2_url = f"{public_url}/{r2_key}"
            print(f"      [OK] Uploaded to {r2_url}")
            
            uploaded.append({
                'filename': filename,
                'r2_key': r2_key,
                'r2_url': r2_url,
                'sha256': file_hash,
                'size_bytes': img_path.stat().st_size,
            })
            
        except Exception as e:
            print(f"      [X] Error: {e}")
            failed.append({'filename': filename, 'error': str(e)})
    
    # Save upload manifest
    upload_manifest = {
        'uploaded_at': datetime.now(timezone.utc).isoformat(),
        'public_url_base': f"{public_url}/art/",
        'images': uploaded,
        'failed': failed,
    }
    
    upload_manifest_path = STAGING_DIR / 'upload_manifest.json'
    with open(upload_manifest_path, 'w') as f:
        json.dump(upload_manifest, f, indent=2)
    
    # Summary
    print("\n" + "=" * 60)
    print("SUMMARY")
    print("=" * 60)
    print(f"  [OK] Uploaded: {len(uploaded)}")
    print(f"  [X] Failed:   {len(failed)}")
    print(f"\n-- Upload manifest: {upload_manifest_path}")
    
    if failed:
        print("\n=== FAILED ===")
        for item in failed:
            print(f"  - {item['filename']}: {item['error']}")
    
    # Create URL mapping for JSON updates
    url_mapping = {}
    
    # Load original manifest to get source URLs
    if manifest_file.exists():
        with open(manifest_file) as f:
            original_manifest = json.load(f)
        
        # Build mapping from original Wikimedia URLs to new R2 URLs
        if 'downloaded' in original_manifest:
            # Priority manifest format
            for item in original_manifest['downloaded']:
                # We'll map by filename since we don't have original Wikimedia URLs
                filename = item['filename']
                for uploaded_item in uploaded:
                    if uploaded_item['filename'] == filename:
                        # The source_url in priority manifest is the creationism.org URL
                        # We need to map the original Wikimedia URLs to R2 URLs
                        # For now, just record the R2 URL for each filename
                        url_mapping[filename] = {
                            'r2_url': uploaded_item['r2_url'],
                            'caption': item.get('caption', ''),
                            'credit': item.get('credit', ''),
                        }
                        break
    
    mapping_path = STAGING_DIR / 'url_mapping.json'
    with open(mapping_path, 'w') as f:
        json.dump(url_mapping, f, indent=2)
    
    print(f"-- URL mapping: {mapping_path}")
    print("\nNext: python3 _tools/update_image_urls.py")


if __name__ == '__main__':
    main()
