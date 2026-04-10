#!/usr/bin/env python3
"""
image_inventory.py - Inventory all Wikimedia image URLs and prepare for R2 migration.

Scans all content JSON files, extracts Wikimedia URLs, generates:
  1. _tools/art_staging/inventory.json - Full mapping of old URLs to new names
  2. Console summary of images by source

Usage:
    python3 _tools/image_inventory.py
"""
import json
import os
import re
import hashlib
from pathlib import Path
from urllib.parse import unquote

ROOT = Path(__file__).resolve().parent.parent
META_DIR = ROOT / 'content' / 'meta'
APP_EXPLORE = ROOT / 'app' / 'assets' / 'explore-images.json'
STAGING_DIR = ROOT / '_tools' / 'art_staging'

# Mapping of artists to short prefixes
ARTIST_PREFIXES = {
    'schnorr': 'schnorr',
    'doré': 'dore',
    'dore': 'dore',
    'rembrandt': 'rembrandt',
    'michelangelo': 'michelangelo',
    'tissot': 'tissot',
    'holman': 'holman',
    'bloch': 'bloch',
    'cranach': 'cranach',
    'raphael': 'raphael',
    'rafael': 'raphael',
    'campin': 'campin',
}


def extract_wikimedia_urls(obj, source_file, parent_id=None, path="", results=None):
    """Recursively extract Wikimedia URLs with context."""
    if results is None:
        results = []
    
    if isinstance(obj, dict):
        # Check if this is an image object
        if 'url' in obj and isinstance(obj['url'], str) and 'wikimedia' in obj['url']:
            results.append({
                'source_file': source_file,
                'parent_id': parent_id,
                'path': path,
                'url': obj['url'],
                'caption': obj.get('caption', ''),
                'credit': obj.get('credit', ''),
            })
        
        # Get ID for context
        item_id = obj.get('id') or parent_id
        
        for k, v in obj.items():
            new_path = f"{path}.{k}" if path else k
            extract_wikimedia_urls(v, source_file, item_id, new_path, results)
            
    elif isinstance(obj, list):
        for i, v in enumerate(obj):
            extract_wikimedia_urls(v, source_file, parent_id, f"{path}[{i}]", results)
    
    return results


def url_to_filename(url: str, caption: str = "") -> str:
    """Convert Wikimedia URL to clean filename."""
    # Extract the actual filename from URL
    # Handle both direct and thumbnail URLs
    url_decoded = unquote(url)
    
    # Extract filename from URL path
    match = re.search(r'/([^/]+\.(jpg|jpeg|png|gif|tif|tiff))(?:\?|$)', url_decoded, re.I)
    if not match:
        # Fallback: use hash
        return f"img-{hashlib.md5(url.encode()).hexdigest()[:8]}.jpg"
    
    original_name = match.group(1)
    
    # Determine artist prefix
    url_lower = url_decoded.lower()
    prefix = 'misc'
    for artist, short in ARTIST_PREFIXES.items():
        if artist in url_lower:
            prefix = short
            break
    
    # Special cases for manuscripts/codices
    if 'codex' in url_lower or 'sinaiticus' in url_lower:
        prefix = 'manuscript'
    elif 'dead_sea' in url_lower or 'isaiah_scroll' in url_lower:
        prefix = 'manuscript'
    elif 'papyrus' in url_lower or 'p46' in url_lower:
        prefix = 'manuscript'
    elif 'aleppo' in url_lower:
        prefix = 'manuscript'
    elif 'gutenberg' in url_lower:
        prefix = 'manuscript'
    elif 'book_of_kells' in url_lower:
        prefix = 'manuscript'
    elif 'nuremberg' in url_lower:
        prefix = 'medieval'
    
    # Clean up the filename
    # Remove common prefixes like "400px-", "thumb/", etc.
    clean_name = re.sub(r'^\d+px-', '', original_name)
    clean_name = re.sub(r'^lossy-page\d+-\d+px-', '', clean_name)
    
    # Remove artist name from filename (we have it in prefix)
    for artist in ARTIST_PREFIXES:
        clean_name = re.sub(rf'{artist}[_\-]?', '', clean_name, flags=re.I)
    
    # Remove "Gustave_" prefix specifically
    clean_name = re.sub(r'^Gustave[_\-]?', '', clean_name, flags=re.I)
    
    # Clean up common patterns
    clean_name = re.sub(r'_+', '-', clean_name)  # underscores to hyphens
    clean_name = re.sub(r'-+', '-', clean_name)  # multiple hyphens to single
    clean_name = re.sub(r'^-|-$', '', clean_name)  # trim leading/trailing hyphens
    clean_name = clean_name.lower()
    
    # Ensure .jpg extension
    clean_name = re.sub(r'\.(tif|tiff|png|gif)$', '.jpg', clean_name, flags=re.I)
    if not clean_name.endswith('.jpg'):
        clean_name += '.jpg'
    
    return f"{prefix}-{clean_name}"


def main():
    print("=" * 60)
    print("Image Inventory - Wikimedia URL Scanner")
    print("=" * 60)
    
    STAGING_DIR.mkdir(parents=True, exist_ok=True)
    
    all_items = []
    
    # Scan meta files
    print("\nScanning content/meta/*.json...")
    for fname in sorted(os.listdir(META_DIR)):
        if fname.endswith('.json'):
            fpath = META_DIR / fname
            try:
                with open(fpath) as f:
                    data = json.load(f)
                items = extract_wikimedia_urls(data, fname)
                all_items.extend(items)
                if items:
                    print(f"  {fname}: {len(items)} URLs")
            except Exception as e:
                print(f"  {fname}: ERROR - {e}")
    
    # Scan app explore-images
    if APP_EXPLORE.exists():
        print("\nScanning app/assets/explore-images.json...")
        with open(APP_EXPLORE) as f:
            data = json.load(f)
        items = extract_wikimedia_urls(data, 'app/explore-images.json')
        all_items.extend(items)
        print(f"  explore-images.json: {len(items)} URLs")
    
    # Dedupe by URL
    print("\nDeduplicating...")
    seen_urls = {}
    for item in all_items:
        url = item['url']
        if url not in seen_urls:
            seen_urls[url] = item
        else:
            # Merge source files
            if item['source_file'] not in seen_urls[url]['source_file']:
                seen_urls[url]['source_file'] += f", {item['source_file']}"
    
    unique_items = list(seen_urls.values())
    print(f"  {len(all_items)} total -> {len(unique_items)} unique URLs")
    
    # Generate inventory with new filenames
    inventory = []
    used_filenames = set()
    
    for item in unique_items:
        new_name = url_to_filename(item['url'], item['caption'])
        
        # Handle collisions
        base_name = new_name
        counter = 1
        while new_name in used_filenames:
            name_parts = base_name.rsplit('.', 1)
            new_name = f"{name_parts[0]}-{counter}.{name_parts[1]}"
            counter += 1
        
        used_filenames.add(new_name)
        
        inventory.append({
            'original_url': item['url'],
            'new_filename': new_name,
            'source_files': item['source_file'],
            'caption': item['caption'],
            'credit': item['credit'],
        })
    
    # Save inventory
    inventory_path = STAGING_DIR / 'inventory.json'
    with open(inventory_path, 'w') as f:
        json.dump(inventory, f, indent=2)
    
    print(f"\n✅ Inventory saved to {inventory_path}")
    print(f"   {len(inventory)} images to process")
    
    # Summary by prefix
    print("\n=== BY SOURCE ===")
    by_prefix = {}
    for item in inventory:
        prefix = item['new_filename'].split('-')[0]
        by_prefix.setdefault(prefix, []).append(item)
    
    for prefix in sorted(by_prefix.keys()):
        print(f"  {prefix}: {len(by_prefix[prefix])}")
    
    # Show sample filenames
    print("\n=== SAMPLE FILENAMES ===")
    for item in inventory[:10]:
        print(f"  {item['new_filename']}")
        print(f"    ← {item['original_url'][:60]}...")
    
    print("\nNext: python3 _tools/download_images.py")


if __name__ == '__main__':
    main()
