"""
update_phase2_urls.py - Update JSON files with Phase 2 R2 image URLs

Run after upload_phase2_to_r2.py completes successfully.
Updates: map-stories.json, people.json
"""

import json
from pathlib import Path

CONTENT_META = Path(__file__).parent.parent / 'content' / 'meta'
R2_PUBLIC_URL = 'https://contentcompanionstudy.com'

# === IMAGE MAPPINGS ===

MAP_STORY_IMAGES = {
    "babel": {"url": f"{R2_PUBLIC_URL}/art/dore-babel.jpg", "caption": "The Confusion of Tongues - Tower of Babel", "credit": "Gustave Dore - Public domain"},
    "flood": {"url": f"{R2_PUBLIC_URL}/art/dore-flood.jpg", "caption": "The Deluge - Noah's Flood", "credit": "Gustave Dore - Public domain"},
    "sodom": {"url": f"{R2_PUBLIC_URL}/art/dore-sodom.jpg", "caption": "The Flight of Lot - Destruction of Sodom", "credit": "Gustave Dore - Public domain"},
    "isaac-birth": {"url": f"{R2_PUBLIC_URL}/art/dore-isaac-rebekah.jpg", "caption": "The Meeting of Isaac and Rebekah", "credit": "Gustave Dore - Public domain"},
    "sinai": {"url": f"{R2_PUBLIC_URL}/art/dore-sinai.jpg", "caption": "The Giving of the Law Upon Mount Sinai", "credit": "Gustave Dore - Public domain"},
    "elijah": {"url": f"{R2_PUBLIC_URL}/art/dore-elijah-chariot.jpg", "caption": "Elijah Taken Up to Heaven in a Chariot of Fire", "credit": "Gustave Dore - Public domain"},
    "ezra-return": {"url": f"{R2_PUBLIC_URL}/art/dore-ezra-prayer.jpg", "caption": "Ezra in Prayer", "credit": "Gustave Dore - Public domain"},
    "exile-assyria": {"url": f"{R2_PUBLIC_URL}/art/dore-assyrian-exile.jpg", "caption": "The Strange Nations Slain by Lions of Samaria", "credit": "Gustave Dore - Public domain"},
    # Smith Atlas maps
    "exodus-plagues": {"url": f"{R2_PUBLIC_URL}/art/map-egypt-1450bc.jpg", "caption": "Egypt 1450 BC", "credit": "Smith Bible Atlas - Public domain"},
    "joseph-egypt": {"url": f"{R2_PUBLIC_URL}/art/map-egypt-1450bc.jpg", "caption": "Egypt 1450 BC", "credit": "Smith Bible Atlas - Public domain"},
    "exile-babylon": {"url": f"{R2_PUBLIC_URL}/art/map-babylon-560bc.jpg", "caption": "Babylon 560 BC", "credit": "Smith Bible Atlas - Public domain"},
    "conquest": {"url": f"{R2_PUBLIC_URL}/art/map-palestine-1250bc.jpg", "caption": "Palestine 1250 BC - Conquest Era", "credit": "Smith Bible Atlas - Public domain"},
    "judges-cycle": {"url": f"{R2_PUBLIC_URL}/art/map-palestine-1250bc.jpg", "caption": "Palestine 1250 BC - Conquest Era", "credit": "Smith Bible Atlas - Public domain"},
    "david-rise": {"url": f"{R2_PUBLIC_URL}/art/map-israel-saul.jpg", "caption": "Israel under Saul 1020 BC", "credit": "Smith Bible Atlas - Public domain"},
    "solomon-temple": {"url": f"{R2_PUBLIC_URL}/art/map-israel-david.jpg", "caption": "Israel under David 1000 BC", "credit": "Smith Bible Atlas - Public domain"},
    "nativity": {"url": f"{R2_PUBLIC_URL}/art/map-palestine-herod.jpg", "caption": "Palestine under Herod 30 BC", "credit": "Smith Bible Atlas - Public domain"},
    "baptism-temptation": {"url": f"{R2_PUBLIC_URL}/art/map-palestine-christ.jpg", "caption": "Palestine in Christ's Time 27 AD", "credit": "Smith Bible Atlas - Public domain"},
    "galilee-ministry": {"url": f"{R2_PUBLIC_URL}/art/map-palestine-christ.jpg", "caption": "Palestine in Christ's Time 27 AD", "credit": "Smith Bible Atlas - Public domain"},
    "final-week": {"url": f"{R2_PUBLIC_URL}/art/map-palestine-christ.jpg", "caption": "Palestine in Christ's Time 27 AD", "credit": "Smith Bible Atlas - Public domain"},
    "paul-journey1": {"url": f"{R2_PUBLIC_URL}/art/map-paul-journeys.jpg", "caption": "St. Paul's Missionary Journeys", "credit": "Smith Bible Atlas - Public domain"},
    "paul-journey2": {"url": f"{R2_PUBLIC_URL}/art/map-paul-journeys.jpg", "caption": "St. Paul's Missionary Journeys", "credit": "Smith Bible Atlas - Public domain"},
    "paul-journey3": {"url": f"{R2_PUBLIC_URL}/art/map-paul-journeys.jpg", "caption": "St. Paul's Missionary Journeys", "credit": "Smith Bible Atlas - Public domain"},
    "paul-rome": {"url": f"{R2_PUBLIC_URL}/art/map-paul-journeys.jpg", "caption": "St. Paul's Missionary Journeys", "credit": "Smith Bible Atlas - Public domain"},
}

PEOPLE_IMAGES = {
    "adam": {"url": f"{R2_PUBLIC_URL}/art/dore-adam-eve.jpg", "caption": "Adam and Eve Driven Out of Eden", "credit": "Gustave Dore - Public domain"},
    "eve": {"url": f"{R2_PUBLIC_URL}/art/dore-adam-eve.jpg", "caption": "Adam and Eve Driven Out of Eden", "credit": "Gustave Dore - Public domain"},
    "noah": {"url": f"{R2_PUBLIC_URL}/art/dore-noah-ark.jpg", "caption": "The Dove Sent Forth from the Ark", "credit": "Gustave Dore - Public domain"},
    "abraham": {"url": f"{R2_PUBLIC_URL}/art/dore-abraham-angels.jpg", "caption": "Abraham and the Three Angels", "credit": "Gustave Dore - Public domain"},
    "sarah": {"url": f"{R2_PUBLIC_URL}/art/dore-abraham-angels.jpg", "caption": "Abraham and the Three Angels", "credit": "Gustave Dore - Public domain"},
    "jacob": {"url": f"{R2_PUBLIC_URL}/art/dore-jacob-ladder.jpg", "caption": "Jacob's Dream - The Ladder to Heaven", "credit": "Gustave Dore - Public domain"},
    "joseph": {"url": f"{R2_PUBLIC_URL}/art/dore-joseph-sold.jpg", "caption": "Joseph Sold by His Brethren", "credit": "Gustave Dore - Public domain"},
    "moses": {"url": f"{R2_PUBLIC_URL}/art/dore-moses-sinai.jpg", "caption": "Moses Coming Down from Mount Sinai", "credit": "Gustave Dore - Public domain"},
    "samson": {"url": f"{R2_PUBLIC_URL}/art/dore-samson.jpg", "caption": "Death of Samson", "credit": "Gustave Dore - Public domain"},
    "david": {"url": f"{R2_PUBLIC_URL}/art/dore-david-goliath.jpg", "caption": "David Slays Goliath", "credit": "Gustave Dore - Public domain"},
    "solomon": {"url": f"{R2_PUBLIC_URL}/art/dore-solomon-judgment.jpg", "caption": "The Judgment of Solomon", "credit": "Gustave Dore - Public domain"},
    "elijah": {"url": f"{R2_PUBLIC_URL}/art/dore-elijah-carmel.jpg", "caption": "The Fire from Heaven Consumes Elijah's Sacrifice", "credit": "Gustave Dore - Public domain"},
    "job": {"url": f"{R2_PUBLIC_URL}/art/dore-job.jpg", "caption": "Job Hearing of His Ruin", "credit": "Gustave Dore - Public domain"},
    "ruth": {"url": f"{R2_PUBLIC_URL}/art/dore-ruth-boaz.jpg", "caption": "Boaz and Ruth", "credit": "Gustave Dore - Public domain"},
    "deborah": {"url": f"{R2_PUBLIC_URL}/art/dore-deborah.jpg", "caption": "Deborah", "credit": "Gustave Dore - Public domain"},
    "esther": {"url": f"{R2_PUBLIC_URL}/art/dore-esther.jpg", "caption": "Esther Accusing Haman", "credit": "Gustave Dore - Public domain"},
}


def update_map_stories():
    """Update map-stories.json with R2 URLs."""
    path = CONTENT_META / 'map-stories.json'
    data = json.loads(path.read_text(encoding='utf-8'))
    
    updated = 0
    for story in data.get('stories', []):
        sid = story.get('id')
        if sid in MAP_STORY_IMAGES:
            story['image'] = MAP_STORY_IMAGES[sid]
            updated += 1
    
    path.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding='utf-8')
    print(f"[OK] map-stories.json: {updated} images updated")
    return updated


def update_people():
    """Update people.json with R2 URLs."""
    path = CONTENT_META / 'people.json'
    data = json.loads(path.read_text(encoding='utf-8'))
    
    updated = 0
    for person in data.get('people', []):
        pid = person.get('id')
        if pid in PEOPLE_IMAGES:
            img_data = PEOPLE_IMAGES[pid]
            # Check if person has existing images array
            if 'images' not in person or not person['images']:
                person['images'] = [img_data]
                updated += 1
            else:
                # Replace first Wikimedia image with R2 URL
                for i, img in enumerate(person['images']):
                    if isinstance(img, dict) and 'wikimedia' in img.get('url', '').lower():
                        person['images'][i] = img_data
                        updated += 1
                        break
    
    path.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding='utf-8')
    print(f"[OK] people.json: {updated} images updated")
    return updated


def main():
    print("=" * 50)
    print("Phase 2: Update JSON with R2 URLs")
    print("=" * 50)
    print()
    
    map_count = update_map_stories()
    people_count = update_people()
    
    print()
    print(f"Total: {map_count + people_count} images updated")
    print()
    print("Next steps:")
    print("  1. python _tools/schema_validator.py")
    print("  2. python _tools/build_sqlite.py")
    print("  3. python _tools/validate_sqlite.py")


if __name__ == "__main__":
    main()
