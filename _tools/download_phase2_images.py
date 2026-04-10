#!/usr/bin/env python3
"""
download_phase2_images.py - Download Phase 2 images for R2 migration.

Sources:
  - Creationism.org Dore collection (biblical scenes)
  - Creationism.org Smith Bible Atlas (maps)
  - Met Museum API (Rembrandt portraits)

Output:
  _tools/art_staging/phase2/ - Downloaded images
  _tools/art_staging/phase2_manifest.json - Manifest for R2 upload
"""

import json
import os
import urllib.request
import ssl
from pathlib import Path
from typing import Optional

# Paths
SCRIPT_DIR = Path(__file__).parent
STAGING_DIR = SCRIPT_DIR / 'art_staging' / 'phase2'
MANIFEST_PATH = SCRIPT_DIR / 'art_staging' / 'phase2_manifest.json'

# Sources
DORE_BASE = "https://www.creationism.org/images/DoreBibleIllus"
SMITH_BASE = "https://www.creationism.org/images/SmithBibleAtlas"
MET_API = "https://collectionapi.metmuseum.org/public/collection/v1/objects"

# === DORE IMAGES ===
# Map stories + timeline events that need Dore scenes
DORE_IMAGES = [
    # (our_filename, dore_source, caption, credit, target_entities)
    ("dore-babel.jpg", "aGen1106Dore_TheConfusionOfTongues.jpg",
     "The Confusion of Tongues - Tower of Babel",
     "Gustave Dore - Public domain",
     ["babel"]),
    
    ("dore-flood.jpg", "aGen0803Dore_TheDeluge.jpg",
     "The Deluge - Noah's Flood",
     "Gustave Dore - Public domain",
     ["flood"]),
    
    ("dore-sodom.jpg", "aGen1924Dore_TheFlightOfLot.jpg",
     "The Flight of Lot - Destruction of Sodom",
     "Gustave Dore - Public domain",
     ["sodom"]),
    
    ("dore-isaac-rebekah.jpg", "aGen2465Dore_TheMeetingOfIsaacAndRebekah.jpg",
     "The Meeting of Isaac and Rebekah",
     "Gustave Dore - Public domain",
     ["isaac-birth"]),
    
    ("dore-sinai.jpg", "bExo1918Dore_TheGivingOfTheLawUponMountSinai.jpg",
     "The Giving of the Law Upon Mount Sinai",
     "Gustave Dore - Public domain",
     ["sinai"]),
    
    ("dore-elijah-chariot.jpg", "h2Ki0211Dore_ElijahTakenUpToHeavenInA_ChariotOfFire.jpg",
     "Elijah Taken Up to Heaven in a Chariot of Fire",
     "Gustave Dore - Public domain",
     ["elijah"]),
    
    ("dore-ezra-prayer.jpg", "jEzr0906Dore_EzraInPrayer.jpg",
     "Ezra in Prayer",
     "Gustave Dore - Public domain",
     ["ezra-return"]),
    
    ("dore-assyrian-exile.jpg", "n2Ki1712Dore_TheAssyriansCarryAwayTheIsraelites.jpg",
     "The Assyrians Carry Away the Israelites",
     "Gustave Dore - Public domain",
     ["exile-assyria"]),
    
    # Additional Dore for people/events
    ("dore-adam-eve.jpg", "aGen0324Dore_AdamAndEveDrivenOutOfEden.jpg",
     "Adam and Eve Driven Out of Eden",
     "Gustave Dore - Public domain",
     ["adam", "eve"]),
    
    ("dore-noah-ark.jpg", "aGen0811Dore_TheDoveSentForthFromTheArk.jpg",
     "The Dove Sent Forth from the Ark",
     "Gustave Dore - Public domain",
     ["noah"]),
    
    ("dore-abraham-angels.jpg", "aGen1809Dore_AbrahamAndTheThreeAngels.jpg",
     "Abraham and the Three Angels",
     "Gustave Dore - Public domain",
     ["abraham", "sarah"]),
    
    ("dore-jacob-ladder.jpg", "aGen2812Dore_Jacob_sDream.jpg",
     "Jacob's Dream - The Ladder to Heaven",
     "Gustave Dore - Public domain",
     ["jacob"]),
    
    ("dore-jacob-wrestling.jpg", "aGen3224Dore_JacobWrestlingWithTheAngel.jpg",
     "Jacob Wrestling with the Angel",
     "Gustave Dore - Public domain",
     ["jacob"]),
    
    ("dore-joseph-sold.jpg", "aGen3728Dore_JosephSoldByHisBrethren.jpg",
     "Joseph Sold by His Brethren",
     "Gustave Dore - Public domain",
     ["joseph"]),
    
    ("dore-moses-sinai.jpg", "bExo3215Dore_MosesComingDownFromMountSinai.jpg",
     "Moses Coming Down from Mount Sinai",
     "Gustave Dore - Public domain",
     ["moses"]),
    
    ("dore-samson.jpg", "eJud1515Dore_SamsonDestroyingPhilistinesWithJawBoneOfAnAss.jpg",
     "Samson Destroying Philistines",
     "Gustave Dore - Public domain",
     ["samson"]),
    
    ("dore-david-goliath.jpg", "f1Sa1749Dore_DavidSlayethGoliath.jpg",
     "David Slays Goliath",
     "Gustave Dore - Public domain",
     ["david"]),
    
    ("dore-solomon-judgment.jpg", "g1Ki0326Dore_TheJudgmentOfSolomon.jpg",
     "The Judgment of Solomon",
     "Gustave Dore - Public domain",
     ["solomon"]),
    
    ("dore-elijah-carmel.jpg", "h1Ki1838Dore_TheFireFromHeavenConsumesElijahsSacrifice.jpg",
     "The Fire from Heaven Consumes Elijah's Sacrifice",
     "Gustave Dore - Public domain",
     ["elijah"]),
    
    ("dore-job.jpg", "lJob0120Dore_JobHearingOfHisRuins.jpg",
     "Job Hearing of His Ruins",
     "Gustave Dore - Public domain",
     ["job"]),
    
    ("dore-ruth-boaz.jpg", "eRut0203Dore_BoazAndRuth.jpg",
     "Boaz and Ruth",
     "Gustave Dore - Public domain",
     ["ruth"]),
    
    ("dore-deborah.jpg", "dJud0410Dore_DeborahAndBarak.jpg",
     "Deborah and Barak",
     "Gustave Dore - Public domain",
     ["deborah"]),
    
    ("dore-esther.jpg", "kEst0516Dore_EstherBeforeTheKing.jpg",
     "Esther Before the King",
     "Gustave Dore - Public domain",
     ["esther"]),
]

# === SMITH BIBLE ATLAS MAPS ===
SMITH_MAPS = [
    ("map-egypt-1450bc.jpg", "BibleAtlas02Egypt1450BC.jpg",
     "Egypt 1450 BC",
     "Smith Bible Atlas - Public domain",
     ["exodus-plagues", "joseph-egypt"]),
    
    ("map-babylon-560bc.jpg", "BibleAtlas03Babylon560BC.jpg",
     "Babylon 560 BC",
     "Smith Bible Atlas - Public domain",
     ["exile-babylon"]),
    
    ("map-palestine-1250bc.jpg", "BibleAtlas09Palestine1250BC.jpg",
     "Palestine 1250 BC - Conquest Era",
     "Smith Bible Atlas - Public domain",
     ["conquest", "judges-cycle"]),
    
    ("map-israel-saul.jpg", "BibleAtlas10IsraelSaul1020BC.jpg",
     "Israel under Saul 1020 BC",
     "Smith Bible Atlas - Public domain",
     ["david-rise"]),
    
    ("map-israel-david.jpg", "BibleAtlas11IsraelDavid1000BC.jpg",
     "Israel under David 1000 BC",
     "Smith Bible Atlas - Public domain",
     ["solomon-temple"]),
    
    ("map-palestine-herod.jpg", "BibleAtlas12PalestineHerod30BC.jpg",
     "Palestine under Herod 30 BC",
     "Smith Bible Atlas - Public domain",
     ["nativity"]),
    
    ("map-palestine-christ.jpg", "BibleAtlas13PalestineChrist27AD.jpg",
     "Palestine in Christ's Time 27 AD",
     "Smith Bible Atlas - Public domain",
     ["baptism-temptation", "galilee-ministry", "final-week"]),
    
    ("map-paul-journeys.jpg", "BibleAtlas14StPaulJourneys.jpg",
     "St. Paul's Missionary Journeys",
     "Smith Bible Atlas - Public domain",
     ["paul-journey1", "paul-journey2", "paul-journey3", "paul-rome"]),
]

# === MET MUSEUM SEARCHES ===
# (search_query, our_filename, target_entities)
MET_SEARCHES = [
    ("rembrandt moses", "met-moses.jpg", ["moses"]),
    ("rembrandt paul apostle", "met-paul.jpg", ["paul"]),
    ("rembrandt david harp", "met-david.jpg", ["david"]),
]


def download_image(url: str, dest: Path) -> bool:
    """Download image with proper headers."""
    try:
        ctx = ssl.create_default_context()
        ctx.check_hostname = False
        ctx.verify_mode = ssl.CERT_NONE
        
        req = urllib.request.Request(url, headers={
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })
        
        with urllib.request.urlopen(req, context=ctx, timeout=30) as response:
            data = response.read()
            dest.write_bytes(data)
            return True
    except Exception as e:
        print(f"      [X] Download failed: {e}")
        return False


def download_dore_images(manifest: dict) -> int:
    """Download Dore images from creationism.org."""
    print("\n=== DORE IMAGES ===")
    count = 0
    
    for our_name, dore_name, caption, credit, targets in DORE_IMAGES:
        dest = STAGING_DIR / our_name
        print(f"[{count+1}/{len(DORE_IMAGES)}] {our_name}")
        
        if dest.exists():
            size_kb = dest.stat().st_size / 1024
            print(f"      [OK] Already exists ({size_kb:.1f} KB)")
            manifest['downloaded'].append({
                'filename': our_name,
                'source_url': f"{DORE_BASE}/{dore_name}",
                'caption': caption,
                'credit': credit,
                'targets': targets,
                'size_bytes': dest.stat().st_size,
            })
            count += 1
            continue
        
        url = f"{DORE_BASE}/{dore_name}"
        print(f"      Downloading from creationism.org...")
        
        if download_image(url, dest):
            size_kb = dest.stat().st_size / 1024
            print(f"      [OK] Downloaded ({size_kb:.1f} KB)")
            manifest['downloaded'].append({
                'filename': our_name,
                'source_url': url,
                'caption': caption,
                'credit': credit,
                'targets': targets,
                'size_bytes': dest.stat().st_size,
            })
            count += 1
        else:
            manifest['failed'].append({
                'filename': our_name,
                'source_url': url,
                'error': 'Download failed',
            })
    
    return count


def download_smith_maps(manifest: dict) -> int:
    """Download Smith Bible Atlas maps from creationism.org."""
    print("\n=== SMITH BIBLE ATLAS MAPS ===")
    count = 0
    
    for our_name, smith_name, caption, credit, targets in SMITH_MAPS:
        dest = STAGING_DIR / our_name
        print(f"[{count+1}/{len(SMITH_MAPS)}] {our_name}")
        
        if dest.exists():
            size_kb = dest.stat().st_size / 1024
            print(f"      [OK] Already exists ({size_kb:.1f} KB)")
            manifest['downloaded'].append({
                'filename': our_name,
                'source_url': f"{SMITH_BASE}/{smith_name}",
                'caption': caption,
                'credit': credit,
                'targets': targets,
                'size_bytes': dest.stat().st_size,
            })
            count += 1
            continue
        
        url = f"{SMITH_BASE}/{smith_name}"
        print(f"      Downloading from creationism.org...")
        
        if download_image(url, dest):
            size_kb = dest.stat().st_size / 1024
            print(f"      [OK] Downloaded ({size_kb:.1f} KB)")
            manifest['downloaded'].append({
                'filename': our_name,
                'source_url': url,
                'caption': caption,
                'credit': credit,
                'targets': targets,
                'size_bytes': dest.stat().st_size,
            })
            count += 1
        else:
            manifest['failed'].append({
                'filename': our_name,
                'source_url': url,
                'error': 'Download failed',
            })
    
    return count


def download_met_images(manifest: dict) -> int:
    """Download images from Met Museum API."""
    print("\n=== MET MUSEUM API ===")
    count = 0
    
    for search_query, our_name, targets in MET_SEARCHES:
        dest = STAGING_DIR / our_name
        print(f"[{count+1}/{len(MET_SEARCHES)}] {our_name} (search: {search_query})")
        
        if dest.exists():
            size_kb = dest.stat().st_size / 1024
            print(f"      [OK] Already exists ({size_kb:.1f} KB)")
            count += 1
            continue
        
        try:
            # Search for object
            search_url = f"https://collectionapi.metmuseum.org/public/collection/v1/search?q={search_query.replace(' ', '%20')}&hasImages=true"
            req = urllib.request.Request(search_url)
            with urllib.request.urlopen(req, timeout=15) as resp:
                search_data = json.loads(resp.read())
            
            object_ids = search_data.get('objectIDs', [])
            if not object_ids:
                print(f"      [!] No results found")
                manifest['manual'].append({
                    'filename': our_name,
                    'search_query': search_query,
                    'targets': targets,
                    'reason': 'No Met Museum results',
                })
                continue
            
            # Get first object with public domain image
            for oid in object_ids[:5]:
                obj_url = f"{MET_API}/{oid}"
                req = urllib.request.Request(obj_url)
                with urllib.request.urlopen(req, timeout=15) as resp:
                    obj_data = json.loads(resp.read())
                
                if obj_data.get('isPublicDomain') and obj_data.get('primaryImage'):
                    img_url = obj_data['primaryImage']
                    title = obj_data.get('title', 'Unknown')
                    artist = obj_data.get('artistDisplayName', 'Unknown')
                    
                    print(f"      Found: {title[:40]} by {artist[:20]}")
                    print(f"      Downloading...")
                    
                    if download_image(img_url, dest):
                        size_kb = dest.stat().st_size / 1024
                        print(f"      [OK] Downloaded ({size_kb:.1f} KB)")
                        manifest['downloaded'].append({
                            'filename': our_name,
                            'source_url': img_url,
                            'caption': title,
                            'credit': f"{artist} - Met Museum, Public domain",
                            'targets': targets,
                            'size_bytes': dest.stat().st_size,
                        })
                        count += 1
                        break
            else:
                print(f"      [!] No public domain images found")
                manifest['manual'].append({
                    'filename': our_name,
                    'search_query': search_query,
                    'targets': targets,
                    'reason': 'No public domain images',
                })
        
        except Exception as e:
            print(f"      [X] API error: {e}")
            manifest['failed'].append({
                'filename': our_name,
                'error': str(e),
            })
    
    return count


def main():
    print("=" * 60)
    print("Phase 2 Images Downloader")
    print("=" * 60)
    print(f"Target: {len(DORE_IMAGES)} Dore + {len(SMITH_MAPS)} Maps + {len(MET_SEARCHES)} Met Museum")
    
    # Create staging directory
    STAGING_DIR.mkdir(parents=True, exist_ok=True)
    
    manifest = {
        'downloaded': [],
        'failed': [],
        'manual': [],
    }
    
    # Download from each source
    dore_count = download_dore_images(manifest)
    smith_count = download_smith_maps(manifest)
    met_count = download_met_images(manifest)
    
    # Summary
    print("\n" + "=" * 60)
    print("SUMMARY")
    print("=" * 60)
    print(f"  [OK] Dore:       {dore_count}/{len(DORE_IMAGES)}")
    print(f"  [OK] Smith Maps: {smith_count}/{len(SMITH_MAPS)}")
    print(f"  [OK] Met Museum: {met_count}/{len(MET_SEARCHES)}")
    print(f"  [!]  Manual:     {len(manifest['manual'])}")
    print(f"  [X]  Failed:     {len(manifest['failed'])}")
    
    # Save manifest
    MANIFEST_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(MANIFEST_PATH, 'w', encoding='utf-8') as f:
        json.dump(manifest, f, indent=2)
    print(f"\n-- Manifest saved: {MANIFEST_PATH}")
    
    if manifest['manual']:
        print("\n=== NEED MANUAL SOURCING ===")
        for item in manifest['manual']:
            print(f"  - {item['filename']}: {item.get('reason', 'Unknown')}")
    
    total = dore_count + smith_count + met_count
    print(f"\nNext: python _tools/upload_images_to_r2.py --phase2")


if __name__ == "__main__":
    main()
