#!/usr/bin/env python3
"""
download_images.py - Download all inventoried Wikimedia images.

Downloads images from Wikimedia Commons with proper User-Agent,
converts to JPG if needed, saves to _tools/art_staging/.

Usage:
    python3 _tools/download_images.py [--force]

Options:
    --force     Re-download even if file exists
"""
import json
import os
import sys
import time
import hashlib
from pathlib import Path
from urllib.request import urlopen, Request
from urllib.error import HTTPError, URLError

ROOT = Path(__file__).resolve().parent.parent
STAGING_DIR = ROOT / '_tools' / 'art_staging'
INVENTORY_PATH = STAGING_DIR / 'inventory.json'

# Wikimedia requires a proper User-Agent
USER_AGENT = (
    "CompanionStudyBot/1.0 "
    "(https://companionstudy.app; craig@companionstudy.app) "
    "Python/3"
)


def download_image(url: str, dest_path: Path) -> bool:
    """Download image with proper headers. Returns True on success."""
    try:
        req = Request(url, headers={'User-Agent': USER_AGENT})
        
        with urlopen(req, timeout=30) as response:
            data = response.read()
        
        # Check if we got actual image data
        if len(data) < 1000:
            print(f"      [!]  Response too small ({len(data)} bytes)")
            return False
        
        # Save the file
        with open(dest_path, 'wb') as f:
            f.write(data)
        
        return True
        
    except HTTPError as e:
        print(f"      [X] HTTP {e.code}: {e.reason}")
        return False
    except URLError as e:
        print(f"      [X] URL Error: {e.reason}")
        return False
    except Exception as e:
        print(f"      [X] Error: {e}")
        return False


def convert_to_jpg(src_path: Path, dest_path: Path) -> bool:
    """Convert image to JPG using PIL if available."""
    try:
        from PIL import Image
        
        with Image.open(src_path) as img:
            # Convert to RGB if necessary (for PNG with transparency, etc.)
            if img.mode in ('RGBA', 'P', 'LA'):
                # Create white background
                background = Image.new('RGB', img.size, (255, 255, 255))
                if img.mode == 'P':
                    img = img.convert('RGBA')
                background.paste(img, mask=img.split()[-1] if img.mode == 'RGBA' else None)
                img = background
            elif img.mode != 'RGB':
                img = img.convert('RGB')
            
            img.save(dest_path, 'JPEG', quality=85, optimize=True)
        
        return True
        
    except ImportError:
        print("      [!]  PIL not installed, keeping original format")
        return False
    except Exception as e:
        print(f"      [!]  Conversion error: {e}")
        return False


def main():
    force = '--force' in sys.argv
    
    print("=" * 60)
    print("Image Downloader - Wikimedia -> Local")
    print("=" * 60)
    
    if not INVENTORY_PATH.exists():
        print(f"[X] Inventory not found: {INVENTORY_PATH}")
        print("   Run image_inventory.py first")
        sys.exit(1)
    
    with open(INVENTORY_PATH) as f:
        inventory = json.load(f)
    
    print(f"\n-- {len(inventory)} images in inventory")
    if force:
        print("   --force: Re-downloading all")
    
    # Track results
    success = []
    failed = []
    skipped = []
    
    for i, item in enumerate(inventory, 1):
        url = item['original_url']
        filename = item['new_filename']
        dest_path = STAGING_DIR / filename
        
        print(f"\n[{i}/{len(inventory)}] {filename}")
        
        # Skip if exists (unless force)
        if dest_path.exists() and not force:
            size_kb = dest_path.stat().st_size / 1024
            print(f"      [OK] Exists ({size_kb:.1f} KB)")
            skipped.append(filename)
            continue
        
        # Download
        print(f"      Downloading...")
        
        # Try direct URL first, then try without thumbnail prefix
        success_download = download_image(url, dest_path)
        
        if not success_download:
            # Try to get higher resolution version
            # Wikimedia thumbnail URLs: .../thumb/.../400px-Filename.jpg
            # Full resolution: .../commons/.../Filename.jpg
            if '/thumb/' in url:
                # Extract full URL
                full_url = url.replace('/thumb/', '/')
                full_url = '/'.join(full_url.rsplit('/', 1)[:-1])  # Remove size prefix
                print(f"      Trying full resolution...")
                success_download = download_image(full_url, dest_path)
        
        if success_download:
            size_kb = dest_path.stat().st_size / 1024
            print(f"      [OK] Downloaded ({size_kb:.1f} KB)")
            
            # Convert to JPG if needed
            if not filename.endswith('.jpg') or dest_path.suffix.lower() in ('.png', '.tif', '.tiff', '.gif'):
                jpg_path = dest_path.with_suffix('.jpg')
                if convert_to_jpg(dest_path, jpg_path):
                    if dest_path != jpg_path:
                        os.remove(dest_path)
                    print(f"      [OK] Converted to JPG")
            
            success.append(filename)
        else:
            failed.append({'filename': filename, 'url': url})
        
        # Be nice to Wikimedia servers
        time.sleep(0.5)
    
    # Summary
    print("\n" + "=" * 60)
    print("SUMMARY")
    print("=" * 60)
    print(f"  [OK] Downloaded: {len(success)}")
    print(f"  >> Skipped:    {len(skipped)}")
    print(f"  [X] Failed:     {len(failed)}")
    
    if failed:
        print("\n=== FAILED DOWNLOADS ===")
        failed_path = STAGING_DIR / 'failed.json'
        with open(failed_path, 'w') as f:
            json.dump(failed, f, indent=2)
        print(f"  Saved to {failed_path}")
        for item in failed[:5]:
            print(f"    - {item['filename']}")
        if len(failed) > 5:
            print(f"    ... and {len(failed) - 5} more")
    
    # Update inventory with download status
    for item in inventory:
        filename = item['new_filename']
        path = STAGING_DIR / filename
        if path.exists():
            item['downloaded'] = True
            item['local_path'] = str(path)
            item['size_bytes'] = path.stat().st_size
        else:
            item['downloaded'] = False
    
    with open(INVENTORY_PATH, 'w') as f:
        json.dump(inventory, f, indent=2)
    
    print(f"\n-- Inventory updated: {INVENTORY_PATH}")
    
    if failed:
        print("\nNext: Fix failed downloads, then run upload_images_to_r2.py")
    else:
        print("\nNext: python3 _tools/upload_images_to_r2.py")


if __name__ == '__main__':
    main()
