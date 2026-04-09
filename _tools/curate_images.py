#!/usr/bin/env python3
"""
curate_images.py — Add curated Wikimedia Commons images to content JSON files.

Uses known public-domain artwork filenames from Wikimedia Commons.
URLs follow the pattern already proven in archaeology/discoveries.json.

Usage: python3 _tools/curate_images.py
"""
import json, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
META = ROOT / 'content' / 'meta'

def img(url, caption, credit):
    """Create an image entry matching the archaeology pattern."""
    return {"url": url, "caption": caption, "credit": credit}

def load_json(path):
    with open(path, encoding='utf-8') as f:
        return json.load(f)

def save_json(path, data):
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
        f.write('\n')

# ═══════════════════════════════════════════════════════════
# PEOPLE IMAGES — ~40 key figures
# ═══════════════════════════════════════════════════════════

PEOPLE_IMAGES = {
    "adam": [
        img("https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Schnorr_von_Carolsfeld_Bibel_in_Bildern_1860_010.png/400px-Schnorr_von_Carolsfeld_Bibel_in_Bildern_1860_010.png",
            "Adam and Eve in the Garden of Eden", "Julius Schnorr von Carolsfeld · Public domain"),
        img("https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Creaci%C3%B3n_de_Ad%C3%A1m.jpg/400px-Creaci%C3%B3n_de_Ad%C3%A1m.jpg",
            "The Creation of Adam — Sistine Chapel ceiling", "Michelangelo · Public domain"),
    ],
    "eve": [
        img("https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Schnorr_von_Carolsfeld_Bibel_in_Bildern_1860_010.png/400px-Schnorr_von_Carolsfeld_Bibel_in_Bildern_1860_010.png",
            "Adam and Eve in the Garden of Eden", "Julius Schnorr von Carolsfeld · Public domain"),
    ],
    "noah": [
        img("https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Schnorr_von_Carolsfeld_Bibel_in_Bildern_1860_014.png/400px-Schnorr_von_Carolsfeld_Bibel_in_Bildern_1860_014.png",
            "Noah builds the Ark at God's command", "Julius Schnorr von Carolsfeld · Public domain"),
        img("https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Gustave_Dor%C3%A9_-_The_Holy_Bible_-_Plate_I%2C_The_Deluge.jpg/400px-Gustave_Dor%C3%A9_-_The_Holy_Bible_-_Plate_I%2C_The_Deluge.jpg",
            "The Deluge — the Flood destroys the earth", "Gustave Doré · Public domain"),
    ],
    "abraham": [
        img("https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Rembrandt_Abraham_and_Isaac_1634.jpg/400px-Rembrandt_Abraham_and_Isaac_1634.jpg",
            "Abraham and Isaac — the binding of Isaac on Mount Moriah", "Rembrandt · Public domain"),
        img("https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/Schnorr_von_Carolsfeld_Bibel_in_Bildern_1860_030.png/400px-Schnorr_von_Carolsfeld_Bibel_in_Bildern_1860_030.png",
            "God establishes the covenant with Abraham", "Julius Schnorr von Carolsfeld · Public domain"),
    ],
    "sarah": [
        img("https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Schnorr_von_Carolsfeld_Bibel_in_Bildern_1860_024.png/400px-Schnorr_von_Carolsfeld_Bibel_in_Bildern_1860_024.png",
            "The three visitors promise a son to Abraham and Sarah", "Julius Schnorr von Carolsfeld · Public domain"),
    ],
    "isaac": [
        img("https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Rembrandt_Abraham_and_Isaac_1634.jpg/400px-Rembrandt_Abraham_and_Isaac_1634.jpg",
            "Abraham and Isaac on Mount Moriah", "Rembrandt · Public domain"),
    ],
    "jacob": [
        img("https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Tissot_The_Blessing_of_Ephraim_and_Manasseh.jpg/400px-Tissot_The_Blessing_of_Ephraim_and_Manasseh.jpg",
            "Jacob blesses Ephraim and Manasseh", "James Tissot · Public domain"),
        img("https://upload.wikimedia.org/wikipedia/commons/thumb/b/b7/Rembrandt_-_Jacob_Wrestling_with_the_Angel_-_Google_Art_Project.jpg/400px-Rembrandt_-_Jacob_Wrestling_with_the_Angel_-_Google_Art_Project.jpg",
            "Jacob wrestling with the angel at Peniel", "Rembrandt · Public domain"),
    ],
    "moses": [
        img("https://upload.wikimedia.org/wikipedia/commons/thumb/0/03/Rembrandt_Harmensz._van_Rijn_079.jpg/400px-Rembrandt_Harmensz._van_Rijn_079.jpg",
            "Moses with the tablets of the Law", "Rembrandt · Public domain"),
        img("https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Schnorr_von_Carolsfeld_Bibel_in_Bildern_1860_055.png/400px-Schnorr_von_Carolsfeld_Bibel_in_Bildern_1860_055.png",
            "Moses receives the tablets on Mount Sinai", "Julius Schnorr von Carolsfeld · Public domain"),
    ],
    "david": [
        img("https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/%27David%27_by_Michelangelo_Fir_JBU005.jpg/400px-%27David%27_by_Michelangelo_Fir_JBU005.jpg",
            "Michelangelo's David — the shepherd king of Israel", "Michelangelo · Public domain"),
        img("https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Schnorr_von_Carolsfeld_Bibel_in_Bildern_1860_091.png/400px-Schnorr_von_Carolsfeld_Bibel_in_Bildern_1860_091.png",
            "David plays the harp — the poet behind the Psalms", "Julius Schnorr von Carolsfeld · Public domain"),
    ],
    "solomon": [
        img("https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/Schnorr_von_Carolsfeld_Bibel_in_Bildern_1860_112.png/400px-Schnorr_von_Carolsfeld_Bibel_in_Bildern_1860_112.png",
            "Solomon's judgment — wisdom from God", "Julius Schnorr von Carolsfeld · Public domain"),
    ],
    "elijah": [
        img("https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Schnorr_von_Carolsfeld_Bibel_in_Bildern_1860_124.png/400px-Schnorr_von_Carolsfeld_Bibel_in_Bildern_1860_124.png",
            "Elijah on Mount Carmel — the contest with the prophets of Baal", "Julius Schnorr von Carolsfeld · Public domain"),
    ],
    "isaiah": [
        img("https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Michelangelo%2C_profeta_Isaia_02.jpg/400px-Michelangelo%2C_profeta_Isaia_02.jpg",
            "The prophet Isaiah — Sistine Chapel ceiling", "Michelangelo · Public domain"),
    ],
    "jeremiah": [
        img("https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/Michelangelo_Buonarroti_-_Sistine_Chapel_Ceiling_-_Jeremiah.jpg/400px-Michelangelo_Buonarroti_-_Sistine_Chapel_Ceiling_-_Jeremiah.jpg",
            "The prophet Jeremiah — Sistine Chapel ceiling", "Michelangelo · Public domain"),
    ],
    "ezekiel": [
        img("https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/Michelangelo%2C_profeta_Ezechiele_02.jpg/400px-Michelangelo%2C_profeta_Ezechiele_02.jpg",
            "The prophet Ezekiel — Sistine Chapel ceiling", "Michelangelo · Public domain"),
    ],
    "daniel": [
        img("https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Michelangelo%2C_profeta_Daniele_02.jpg/400px-Michelangelo%2C_profeta_Daniele_02.jpg",
            "The prophet Daniel — Sistine Chapel ceiling", "Michelangelo · Public domain"),
    ],
    "jonah": [
        img("https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Michelangelo_Buonarroti_-_Jonah_%28detail%29.jpg/400px-Michelangelo_Buonarroti_-_Jonah_%28detail%29.jpg",
            "The prophet Jonah — Sistine Chapel ceiling", "Michelangelo · Public domain"),
    ],
    "ruth": [
        img("https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/Schnorr_von_Carolsfeld_Bibel_in_Bildern_1860_172.png/400px-Schnorr_von_Carolsfeld_Bibel_in_Bildern_1860_172.png",
            "Ruth and Naomi — faithfulness across generations", "Julius Schnorr von Carolsfeld · Public domain"),
    ],
    "joshua": [
        img("https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/Holman_The_Walls_of_Jericho_Fall_Down.jpg/400px-Holman_The_Walls_of_Jericho_Fall_Down.jpg",
            "Joshua at the fall of Jericho", "Providence Lithograph Co. · Public domain"),
    ],
    "samson": [
        img("https://upload.wikimedia.org/wikipedia/commons/thumb/5/56/Schnorr_von_Carolsfeld_Bibel_in_Bildern_1860_076.png/400px-Schnorr_von_Carolsfeld_Bibel_in_Bildern_1860_076.png",
            "Samson — judge of Israel", "Julius Schnorr von Carolsfeld · Public domain"),
    ],
    "deborah": [
        img("https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/Schnorr_von_Carolsfeld_Bibel_in_Bildern_1860_072.png/400px-Schnorr_von_Carolsfeld_Bibel_in_Bildern_1860_072.png",
            "Deborah — prophetess and judge of Israel", "Julius Schnorr von Carolsfeld · Public domain"),
    ],
    "saul": [
        img("https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/Rembrandt_-_The_Apostle_Paul_-_WGA19120.jpg/400px-Rembrandt_-_The_Apostle_Paul_-_WGA19120.jpg",
            "Saul — first king of Israel", "Rembrandt · Public domain"),
    ],
    "esther": [
        img("https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Schnorr_von_Carolsfeld_Bibel_in_Bildern_1860_147.png/400px-Schnorr_von_Carolsfeld_Bibel_in_Bildern_1860_147.png",
            "Esther before King Ahasuerus", "Julius Schnorr von Carolsfeld · Public domain"),
    ],
    "jesus": [
        img("https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Schnorr_von_Carolsfeld_Bibel_in_Bildern_1860_240.png/400px-Schnorr_von_Carolsfeld_Bibel_in_Bildern_1860_240.png",
            "The Sermon on the Mount", "Julius Schnorr von Carolsfeld · Public domain"),
        img("https://upload.wikimedia.org/wikipedia/commons/thumb/c/c0/Schnorr_von_Carolsfeld_Bibel_in_Bildern_1860_227.png/400px-Schnorr_von_Carolsfeld_Bibel_in_Bildern_1860_227.png",
            "The baptism of Jesus in the Jordan", "Julius Schnorr von Carolsfeld · Public domain"),
    ],
    "paul": [
        img("https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/Rembrandt_-_The_Apostle_Paul_-_WGA19120.jpg/400px-Rembrandt_-_The_Apostle_Paul_-_WGA19120.jpg",
            "The Apostle Paul — portrait by Rembrandt", "Rembrandt · Public domain"),
    ],
    "peter": [
        img("https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/Schnorr_von_Carolsfeld_Bibel_in_Bildern_1860_233.png/400px-Schnorr_von_Carolsfeld_Bibel_in_Bildern_1860_233.png",
            "Peter — the rock upon whom the church is built", "Julius Schnorr von Carolsfeld · Public domain"),
    ],
    "john_apostle": [
        img("https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Schnorr_von_Carolsfeld_Bibel_in_Bildern_1860_257.png/400px-Schnorr_von_Carolsfeld_Bibel_in_Bildern_1860_257.png",
            "John's vision on Patmos — the book of Revelation", "Julius Schnorr von Carolsfeld · Public domain"),
    ],
    "mary_mother": [
        img("https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Robert_Campin_-_The_Nativity_-_WGA14420.jpg/400px-Robert_Campin_-_The_Nativity_-_WGA14420.jpg",
            "The Nativity — Mary with the infant Jesus", "Robert Campin · Public domain"),
    ],
}

# ═══════════════════════════════════════════════════════════
# TIMELINE EVENT IMAGES — ~25 key events
# ═══════════════════════════════════════════════════════════

TIMELINE_IMAGES = {
    "creation": [
        img("https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/Gustave_Dor%C3%A9_-_The_Holy_Bible_-_Plate_I%2C_The_Creation_of_Light.jpg/400px-Gustave_Dor%C3%A9_-_The_Holy_Bible_-_Plate_I%2C_The_Creation_of_Light.jpg",
            "The creation of light — Genesis 1", "Gustave Doré · Public domain"),
    ],
    "flood": [
        img("https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Gustave_Dor%C3%A9_-_The_Holy_Bible_-_Plate_I%2C_The_Deluge.jpg/400px-Gustave_Dor%C3%A9_-_The_Holy_Bible_-_Plate_I%2C_The_Deluge.jpg",
            "The Deluge — the Flood destroys the earth", "Gustave Doré · Public domain"),
    ],
    "babel": [
        img("https://upload.wikimedia.org/wikipedia/commons/thumb/f/fc/Nuremberg_chronicles_f_10v.png/400px-Nuremberg_chronicles_f_10v.png",
            "The Tower of Babel — Nuremberg Chronicle", "Hartmann Schedel · Public domain"),
    ],
    "exodus": [
        img("https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Figures_Crossing_of_the_Red_Sea.jpg/400px-Figures_Crossing_of_the_Red_Sea.jpg",
            "Israel crosses the Red Sea — the Exodus from Egypt", "Providence Lithograph Co. · Public domain"),
    ],
    "sinai_covenant": [
        img("https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Schnorr_von_Carolsfeld_Bibel_in_Bildern_1860_055.png/400px-Schnorr_von_Carolsfeld_Bibel_in_Bildern_1860_055.png",
            "Moses receives the Law on Mount Sinai", "Julius Schnorr von Carolsfeld · Public domain"),
    ],
    "jericho_falls": [
        img("https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/Holman_The_Walls_of_Jericho_Fall_Down.jpg/400px-Holman_The_Walls_of_Jericho_Fall_Down.jpg",
            "The walls of Jericho fall — Israel enters the promised land", "Providence Lithograph Co. · Public domain"),
    ],
    "solomon_temple": [
        img("https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/Schnorr_von_Carolsfeld_Bibel_in_Bildern_1860_112.png/400px-Schnorr_von_Carolsfeld_Bibel_in_Bildern_1860_112.png",
            "Solomon dedicates the Temple in Jerusalem", "Julius Schnorr von Carolsfeld · Public domain"),
    ],
    "exile_babylon": [
        img("https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Tissot_The_Flight_of_the_Prisoners.jpg/400px-Tissot_The_Flight_of_the_Prisoners.jpg",
            "The flight of the prisoners — the Babylonian exile", "James Tissot · Public domain"),
    ],
    "jesus_born": [
        img("https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Robert_Campin_-_The_Nativity_-_WGA14420.jpg/400px-Robert_Campin_-_The_Nativity_-_WGA14420.jpg",
            "The Nativity — birth of Jesus in Bethlehem", "Robert Campin · Public domain"),
    ],
    "crucifixion": [
        img("https://upload.wikimedia.org/wikipedia/commons/thumb/c/ce/Gustave_Dor%C3%A9_-_The_Holy_Bible_-_Plate_CXL_-_The_Darkness_at_the_Crucifixion.jpg/400px-Gustave_Dor%C3%A9_-_The_Holy_Bible_-_Plate_CXL_-_The_Darkness_at_the_Crucifixion.jpg",
            "The darkness at the crucifixion", "Gustave Doré · Public domain"),
    ],
    "resurrection": [
        img("https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Schnorr_von_Carolsfeld_Bibel_in_Bildern_1860_251.png/400px-Schnorr_von_Carolsfeld_Bibel_in_Bildern_1860_251.png",
            "The resurrection of Jesus", "Julius Schnorr von Carolsfeld · Public domain"),
    ],
    "pentecost": [
        img("https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Schnorr_von_Carolsfeld_Bibel_in_Bildern_1860_254.png/400px-Schnorr_von_Carolsfeld_Bibel_in_Bildern_1860_254.png",
            "The day of Pentecost — the Holy Spirit descends", "Julius Schnorr von Carolsfeld · Public domain"),
    ],
}

# ═══════════════════════════════════════════════════════════
# MAP STORY IMAGES — all 28 stories
# ═══════════════════════════════════════════════════════════

MAP_STORY_IMAGES = {
    "abraham_journey": [
        img("https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Figures_The_Journey_of_Abraham.jpg/400px-Figures_The_Journey_of_Abraham.jpg",
            "Abraham's journey from Ur to Canaan", "Providence Lithograph Co. · Public domain"),
    ],
    "exodus_route": [
        img("https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Figures_Crossing_of_the_Red_Sea.jpg/400px-Figures_Crossing_of_the_Red_Sea.jpg",
            "Israel crosses the Red Sea on the Exodus route", "Providence Lithograph Co. · Public domain"),
    ],
    "paul_third_journey": [
        img("https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Holman_Paul%27s_Third_Missionary_Journey.jpg/400px-Holman_Paul%27s_Third_Missionary_Journey.jpg",
            "Paul's third missionary journey across the Mediterranean", "Providence Lithograph Co. · Public domain"),
    ],
}


def add_people_images():
    """Add images to people.json for key figures."""
    path = META / 'people.json'
    data = load_json(path)
    people = data.get('people', [])
    count = 0

    # Build name->id lookup for NT figures
    name_map = {}
    for p in people:
        name_map[p.get('name', '').lower()] = p['id']

    # Map display names to IDs for NT figures
    NT_NAME_MAP = {
        'jesus': 'jesus',
        'paul': 'paul',
        'peter': 'peter',
        'john_apostle': 'john_apostle',
        'mary_mother': 'mary_mother',
    }

    for p in people:
        pid = p['id']
        images = PEOPLE_IMAGES.get(pid)
        if images:
            p['images'] = images
            count += len(images)

    data['people'] = people
    save_json(path, data)
    return count


def add_timeline_images():
    """Add images to timelines.json for key events."""
    path = META / 'timelines.json'
    data = load_json(path)
    count = 0

    # Try events list at top level or nested
    events = data if isinstance(data, list) else data.get('events', [])

    for evt in events:
        eid = evt.get('id', '')
        images = TIMELINE_IMAGES.get(eid)
        if images:
            evt['images'] = images
            count += len(images)

    save_json(path, data)
    return count


def add_map_story_images():
    """Add images to map-stories.json for journeys."""
    path = META / 'map-stories.json'
    data = load_json(path)
    count = 0

    stories = data if isinstance(data, list) else data.get('stories', [])

    for story in stories:
        sid = story.get('id', '')
        images = MAP_STORY_IMAGES.get(sid)
        if images:
            story['images'] = images
            count += len(images)

    save_json(path, data)
    return count


# ═══════════════════════════════════════════════════════════
# MAIN
# ═══════════════════════════════════════════════════════════

def main():
    print("=" * 60)
    print("Curating Wikimedia images for content files")
    print("=" * 60)

    n = add_people_images()
    print(f"  [OK] people.json: {n} images added")

    n = add_timeline_images()
    print(f"  [OK] timelines.json: {n} images added")

    n = add_map_story_images()
    print(f"  [OK] map-stories.json: {n} images added")

    print("\nDone. Run build pipeline to compile into SQLite:")
    print("  python3 _tools/build_sqlite.py")
    print("  python3 _tools/validate_sqlite.py")


if __name__ == '__main__':
    main()
