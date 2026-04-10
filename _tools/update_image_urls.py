#!/usr/bin/env python3
"""
update_image_urls.py - Replace Wikimedia URLs with R2 URLs in content JSON files.

Uses the URL mapping from upload_images_to_r2.py to update all references
in content/meta/*.json and app/assets/explore-images.json.

Usage:
    python3 _tools/update_image_urls.py [--dry-run]

Options:
    --dry-run   Show changes without modifying files
"""
import json
import os
import sys
import re
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parent.parent
META_DIR = ROOT / 'content' / 'meta'
APP_EXPLORE = ROOT / 'app' / 'assets' / 'explore-images.json'
STAGING_DIR = ROOT / '_tools' / 'art_staging'
UPLOAD_MANIFEST = STAGING_DIR / 'upload_manifest.json'
PRIORITY_MANIFEST = STAGING_DIR / 'priority_manifest.json'

# Mapping from concept/image ID to target R2 filename
# This maps the "meaning" of each image to the correct Doré replacement
IMAGE_CONCEPT_MAP = {
    # Concepts (concepts.json)
    'spirit-of-god': 'dore-pentecost.jpg',      # Pentecost / Spirit descends
    'faith': 'dore-abraham-isaac.jpg',           # Abraham's faith tested
    'mercy-grace': 'dore-prodigal-son.jpg',      # Prodigal son
    'judgment': 'dore-crucifixion-darkness.jpg', # Darkness at crucifixion
    'creation': 'dore-creation-light.jpg',       # Creation of light
    'redemption': 'dore-red-sea.jpg',            # Red Sea crossing
    'prophecy': 'dore-isaiah.jpg',               # Isaiah prophet
    'suffering': 'dore-jeremiah.jpg',            # Jeremiah prophet
    'resurrection': 'dore-resurrection.jpg',     # Resurrection of Jesus
    'mission': 'dore-paul.jpg',                  # Paul preaching
    'word-of-god': None,                         # codex-sinaiticus - manual
    
    # People with specific images
    'abraham': 'dore-abraham-isaac.jpg',
    'isaac': 'dore-abraham-isaac.jpg',
    'jacob': 'dore-jacob-blessing.jpg',
    'moses': 'dore-creation-light.jpg',  # Could use a better Moses image
    'isaiah': 'dore-isaiah.jpg',
    'jeremiah': 'dore-jeremiah.jpg',
    'ezekiel': 'dore-ezekiel.jpg',
    'daniel': 'dore-daniel.jpg',
    'jonah': 'dore-jonah.jpg',
    'paul': 'dore-paul.jpg',
    'jesus': 'dore-nativity.jpg',
    
    # Map stories
    'abram-call': 'dore-abram-call.jpg',
    'nativity': 'dore-nativity.jpg',
    'paul-journey3': None,  # Map - manual
    
    # Timeline events
    'pentecost': 'dore-pentecost.jpg',
    'crucifixion': 'dore-crucifixion-darkness.jpg',
    'exodus': 'dore-red-sea.jpg',
}

# Keyword patterns to match image captions/contexts to Doré images
CAPTION_PATTERNS = [
    (r'pentecost|spirit.*descend', 'dore-pentecost.jpg'),
    (r'abraham.*isaac|binding.*isaac|trial.*faith', 'dore-abraham-isaac.jpg'),
    (r'prodigal.*son|return.*father', 'dore-prodigal-son.jpg'),
    (r'darkness.*crucifixion|judgment.*cross', 'dore-crucifixion-darkness.jpg'),
    (r'creation.*light|let.*be.*light', 'dore-creation-light.jpg'),
    (r'red.*sea|egypt.*drown|crossing.*sea', 'dore-red-sea.jpg'),
    (r'isaiah.*prophet', 'dore-isaiah.jpg'),
    (r'jeremiah.*prophet|lament', 'dore-jeremiah.jpg'),
    (r'resurrection.*jesus|risen|empty.*tomb', 'dore-resurrection.jpg'),
    (r'jacob.*bless|isaac.*bless.*jacob', 'dore-jacob-blessing.jpg'),
    (r'jericho.*fall|walls.*jericho', 'dore-jericho.jpg'),
    (r'ezekiel.*prophet', 'dore-ezekiel.jpg'),
    (r'daniel\b', 'dore-daniel.jpg'),
    (r'jonah.*whale|cast.*forth', 'dore-jonah.jpg'),
    (r'abraham.*journey|abram.*call|land.*canaan', 'dore-abram-call.jpg'),
    (r'nativity|jesus.*birth|manger', 'dore-nativity.jpg'),
    (r'paul.*preach|paul.*mission|thessalonian', 'dore-paul.jpg'),
]


def match_caption_to_image(caption: str, context_id: str = None) -> str | None:
    """Try to match a caption or context to a Doré image."""
    # First check context ID mapping
    if context_id and context_id in IMAGE_CONCEPT_MAP:
        return IMAGE_CONCEPT_MAP[context_id]
    
    # Then try caption pattern matching
    caption_lower = caption.lower() if caption else ''
    for pattern, filename in CAPTION_PATTERNS:
        if re.search(pattern, caption_lower, re.IGNORECASE):
            return filename
    
    return None


def update_images_in_obj(obj: Any, r2_base: str, parent_id: str = None, 
                          changes: list = None, path: str = "") -> Any:
    """Recursively update Wikimedia URLs to R2 URLs."""
    if changes is None:
        changes = []
    
    if isinstance(obj, dict):
        # Track the ID if this is a content item
        item_id = obj.get('id') or parent_id
        
        # Check if this is an image object with a Wikimedia URL
        if 'url' in obj and isinstance(obj['url'], str) and 'wikimedia' in obj['url']:
            old_url = obj['url']
            caption = obj.get('caption', '')
            
            # Try to find a replacement
            new_filename = match_caption_to_image(caption, item_id)
            
            if new_filename:
                new_url = f"{r2_base}{new_filename}"
                obj['url'] = new_url
                obj['credit'] = 'Gustave Doré - Public domain'
                changes.append({
                    'path': path,
                    'old_url': old_url[:60] + '...',
                    'new_url': new_url,
                    'matched_by': f"caption='{caption[:30]}' or id='{item_id}'"
                })
            else:
                changes.append({
                    'path': path,
                    'old_url': old_url[:60] + '...',
                    'new_url': None,
                    'reason': f"No match found for caption='{caption[:30]}' id='{item_id}'"
                })
        
        # Recurse into dict values
        for k, v in obj.items():
            new_path = f"{path}.{k}" if path else k
            obj[k] = update_images_in_obj(v, r2_base, item_id, changes, new_path)
    
    elif isinstance(obj, list):
        for i, v in enumerate(obj):
            obj[i] = update_images_in_obj(v, r2_base, parent_id, changes, f"{path}[{i}]")
    
    return obj


def main():
    dry_run = '--dry-run' in sys.argv
    
    print("=" * 60)
    print("Image URL Updater")
    print("=" * 60)
    
    if dry_run:
        print("Mode: DRY RUN (no files will be modified)\n")
    else:
        print("Mode: LIVE (files will be modified)\n")
    
    # Load upload manifest to get R2 base URL
    if not UPLOAD_MANIFEST.exists():
        # Use expected URL format
        r2_base = "https://contentcompanionstudy.com/art/"
        print(f"[!]  Upload manifest not found, using default R2 URL: {r2_base}")
    else:
        with open(UPLOAD_MANIFEST, encoding='utf-8') as f:
            manifest = json.load(f)
        r2_base = manifest.get('public_url_base', "https://contentcompanionstudy.com/art/")
    
    print(f"R2 Base URL: {r2_base}\n")
    
    # Process all meta JSON files
    all_changes = {}
    files_to_update = []
    
    # Collect files to process
    for fname in sorted(os.listdir(META_DIR)):
        if fname.endswith('.json'):
            files_to_update.append(META_DIR / fname)
    
    if APP_EXPLORE.exists():
        files_to_update.append(APP_EXPLORE)
    
    for fpath in files_to_update:
        fname = fpath.name
        print(f"Processing {fname}...")
        
        try:
            with open(fpath, encoding='utf-8') as f:
                data = json.load(f)
        except Exception as e:
            print(f"  [X] Error reading: {e}")
            continue
        
        changes = []
        updated_data = update_images_in_obj(data, r2_base, changes=changes)
        
        if changes:
            all_changes[fname] = changes
            replaced = sum(1 for c in changes if c.get('new_url'))
            unmatched = sum(1 for c in changes if not c.get('new_url'))
            print(f"  [OK] {replaced} URLs replaced, {unmatched} unmatched")
            
            if not dry_run:
                with open(fpath, 'w', encoding='utf-8') as f:
                    json.dump(updated_data, f, indent=2, ensure_ascii=False)
                print(f"  -- File saved")
        else:
            print(f"  - No Wikimedia URLs found")
    
    # Summary
    print("\n" + "=" * 60)
    print("SUMMARY")
    print("=" * 60)
    
    total_replaced = 0
    total_unmatched = 0
    
    for fname, changes in all_changes.items():
        replaced = sum(1 for c in changes if c.get('new_url'))
        unmatched = sum(1 for c in changes if not c.get('new_url'))
        total_replaced += replaced
        total_unmatched += unmatched
        print(f"  {fname}: {replaced} replaced, {unmatched} unmatched")
    
    print(f"\n  Total replaced:  {total_replaced}")
    print(f"  Total unmatched: {total_unmatched}")
    
    if total_unmatched > 0:
        print("\n=== UNMATCHED URLS ===")
        for fname, changes in all_changes.items():
            for c in changes:
                if not c.get('new_url'):
                    print(f"  [{fname}] {c.get('reason', 'Unknown')}")
    
    if dry_run:
        print("\n[!]  DRY RUN - No files were modified")
        print("   Run without --dry-run to apply changes")
    else:
        print("\n[OK] All files updated!")
        print("\nNext steps:")
        print("  1. Review changes: git diff content/meta/")
        print("  2. Validate: python3 _tools/schema_validator.py")
        print("  3. Build DB: python3 _tools/build_sqlite.py")
        print("  4. Commit and push")


if __name__ == '__main__':
    main()
