#!/usr/bin/env python3
"""
download_priority_images.py — Download the 19 priority Explore screen images.

Downloads from creationism.org (Doré collection) which is the only source
that works from this environment. For images without Doré equivalents,
creates placeholder entries.

Usage:
    python3 _tools/download_priority_images.py

Output:
    _tools/art_staging/priority/ — Downloaded images
    _tools/art_staging/priority_manifest.json — Manifest for R2 upload
"""
import json
import os
import time
from pathlib import Path
from urllib.request import urlopen, Request
from urllib.error import HTTPError, URLError

ROOT = Path(__file__).resolve().parent.parent
STAGING_DIR = ROOT / '_tools' / 'art_staging' / 'priority'

# Creationism.org Doré collection base URL
DORE_BASE = 'https://www.creationism.org/images/DoreBibleIllus/'

# Priority 19 images mapped to Doré sources
# Format: (target_filename, dore_filename, caption, credit)
PRIORITY_IMAGES = [
    # Spirit of God / Pentecost
    ('dore-pentecost.jpg', 
     'vAct0202Dore_TheDescentOfTheSpirit.jpg',
     'The Descent of the Spirit — Pentecost',
     'Gustave Doré · Public domain'),
    
    # Faith / Abraham & Isaac
    ('dore-abraham-isaac.jpg',
     'aGen2210Dore_TheTrialOfAbraham_sFaith.jpg',
     'The Trial of Abraham\'s Faith — binding of Isaac',
     'Gustave Doré · Public domain'),
    
    # Mercy & Grace / Prodigal Son
    ('dore-prodigal-son.jpg',
     'tLuk1520Dore_TheProdigalSonInTheArmsOfHisFather.jpg',
     'The Prodigal Son in the Arms of His Father',
     'Gustave Doré · Public domain'),
    
    # Judgment / Crucifixion Darkness
    ('dore-crucifixion-darkness.jpg',
     'tLuk2344Dore_TheDarknessAtTheCrucifixion.jpg',
     'The Darkness at the Crucifixion — judgment',
     'Gustave Doré · Public domain'),
    
    # Creation / Light
    ('dore-creation-light.jpg',
     'aGen0103Dore_TheCreationOfLight.jpg',
     'The Creation of Light',
     'Gustave Doré · Public domain'),
    
    # Redemption / Red Sea
    ('dore-red-sea.jpg',
     'bExo1427Dore_TheEgyptiansDrownedInTheRedSea.jpg',
     'The Egyptians Drowned in the Red Sea — redemption',
     'Gustave Doré · Public domain'),
    
    # Prophecy / Isaiah
    ('dore-isaiah.jpg',
     'nIsa0608Dore_Isaiah.jpg',
     'Isaiah the Prophet',
     'Gustave Doré · Public domain'),
    
    # Suffering / Jeremiah
    ('dore-jeremiah.jpg',
     'nJer0114Dore_Jeremiah.jpg',
     'Jeremiah the Prophet — suffering and lament',
     'Gustave Doré · Public domain'),
    
    # Resurrection
    ('dore-resurrection.jpg',
     'rMat2805Dore_TheResurrection.jpg',
     'The Resurrection of Jesus',
     'Gustave Doré · Public domain'),
    
    # Jacob blessing (Isaac blessing Jacob is closest)
    ('dore-jacob-blessing.jpg',
     'aGen2729Dore_IsaacBlessingJacob.jpg',
     'Isaac Blessing Jacob',
     'Gustave Doré · Public domain'),
    
    # Jericho / Joshua
    ('dore-jericho.jpg',
     'dJos0620Dore_TheWallsOfJerichoFallingDown.jpg',
     'The Walls of Jericho Falling Down',
     'Gustave Doré · Public domain'),
    
    # Ezekiel
    ('dore-ezekiel.jpg',
     'oEze0103Dore_EzekielProphesying.jpg',
     'Ezekiel Prophesying',
     'Gustave Doré · Public domain'),
    
    # Daniel
    ('dore-daniel.jpg',
     'pDan0220Dore_Daniel.jpg',
     'Daniel',
     'Gustave Doré · Public domain'),
    
    # Jonah
    ('dore-jonah.jpg',
     'qJon0201Dore_JonahCastForthByTheWhale.jpg',
     'Jonah Cast Forth by the Whale',
     'Gustave Doré · Public domain'),
    
    # Abram's call / Journey
    ('dore-abram-call.jpg',
     'aGen1201Dore_AbrahamJourneyingIntoTheLandOfCanaan.jpg',
     'Abraham Journeying into the Land of Canaan',
     'Gustave Doré · Public domain'),
    
    # Nativity
    ('dore-nativity.jpg',
     'tLuk0215Dore_TheNativity.jpg',
     'The Nativity — Jesus birth',
     'Gustave Doré · Public domain'),
    
    # Paul / Mission (using Paul preaching to Thessalonians)
    ('dore-paul.jpg',
     'w1Th0211Dore_St_PaulPreachingToTheThessalonians.jpg',
     'St. Paul Preaching to the Thessalonians — missionary to the nations',
     'Gustave Doré · Public domain'),
]

# Images that need manual sourcing (no Doré equivalent)
MANUAL_IMAGES = [
    ('codex-sinaiticus.jpg', 
     'Codex Sinaiticus — 4th century Bible manuscript',
     'Needs: British Library or Codex Sinaiticus Project image'),
    ('paul-journey3.jpg',
     "Paul's Third Missionary Journey map",
     'Needs: Public domain Bible map or custom creation'),
]


def download_image(url: str, dest_path: Path) -> bool:
    """Download image. Returns True on success."""
    try:
        req = Request(url, headers={
            'User-Agent': 'Mozilla/5.0 (compatible; CompanionStudyBot/1.0)'
        })
        
        with urlopen(req, timeout=30) as response:
            data = response.read()
        
        # Verify it's actual image data
        if len(data) < 5000:
            print(f"      ⚠️  Response too small ({len(data)} bytes)")
            return False
        
        if data[:4] == b'<!DO' or data[:5] == b'<html':
            print(f"      ⚠️  Got HTML instead of image")
            return False
        
        with open(dest_path, 'wb') as f:
            f.write(data)
        
        return True
        
    except HTTPError as e:
        print(f"      ❌ HTTP {e.code}: {e.reason}")
        return False
    except URLError as e:
        print(f"      ❌ URL Error: {e.reason}")
        return False
    except Exception as e:
        print(f"      ❌ Error: {e}")
        return False


def main():
    print("=" * 60)
    print("Priority Images Downloader")
    print("=" * 60)
    print(f"\nTarget: {len(PRIORITY_IMAGES)} Doré images from creationism.org")
    print(f"Manual: {len(MANUAL_IMAGES)} images need alternative sourcing\n")
    
    STAGING_DIR.mkdir(parents=True, exist_ok=True)
    
    manifest = {
        'downloaded': [],
        'manual_needed': [],
        'failed': [],
    }
    
    # Download Doré images
    for i, (filename, dore_file, caption, credit) in enumerate(PRIORITY_IMAGES, 1):
        url = DORE_BASE + dore_file
        dest = STAGING_DIR / filename
        
        print(f"[{i}/{len(PRIORITY_IMAGES)}] {filename}")
        
        if dest.exists():
            size_kb = dest.stat().st_size / 1024
            print(f"      ✓ Already exists ({size_kb:.1f} KB)")
            manifest['downloaded'].append({
                'filename': filename,
                'source_url': url,
                'caption': caption,
                'credit': credit,
                'size_bytes': dest.stat().st_size,
            })
            continue
        
        print(f"      Downloading from creationism.org...")
        if download_image(url, dest):
            size_kb = dest.stat().st_size / 1024
            print(f"      ✓ Downloaded ({size_kb:.1f} KB)")
            manifest['downloaded'].append({
                'filename': filename,
                'source_url': url,
                'caption': caption,
                'credit': credit,
                'size_bytes': dest.stat().st_size,
            })
        else:
            manifest['failed'].append({
                'filename': filename,
                'source_url': url,
                'caption': caption,
            })
        
        time.sleep(0.5)  # Be nice to server
    
    # Record manual images
    for filename, caption, note in MANUAL_IMAGES:
        print(f"\n⚠️  {filename}: {note}")
        manifest['manual_needed'].append({
            'filename': filename,
            'caption': caption,
            'note': note,
        })
    
    # Save manifest
    manifest_path = STAGING_DIR.parent / 'priority_manifest.json'
    with open(manifest_path, 'w') as f:
        json.dump(manifest, f, indent=2)
    
    # Summary
    print("\n" + "=" * 60)
    print("SUMMARY")
    print("=" * 60)
    print(f"  ✓ Downloaded:    {len(manifest['downloaded'])}")
    print(f"  ⚠️  Manual needed: {len(manifest['manual_needed'])}")
    print(f"  ❌ Failed:        {len(manifest['failed'])}")
    print(f"\n📋 Manifest saved: {manifest_path}")
    
    if manifest['failed']:
        print("\n=== FAILED ===")
        for item in manifest['failed']:
            print(f"  - {item['filename']}")
    
    if manifest['manual_needed']:
        print("\n=== NEED MANUAL SOURCING ===")
        for item in manifest['manual_needed']:
            print(f"  - {item['filename']}: {item['note']}")
    
    print("\nNext: python3 _tools/upload_images_to_r2.py --priority")


if __name__ == '__main__':
    main()
