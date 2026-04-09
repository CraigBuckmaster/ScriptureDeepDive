#!/usr/bin/env python3
"""Add curated Wikimedia images to all 66 books in book-intros.json."""
import json

S = "https://upload.wikimedia.org/wikipedia/commons/thumb"

def img(url, caption, credit):
    return {"url": url, "caption": caption, "credit": credit}

# Schnorr von Carolsfeld Bible in Pictures (1860) — reliable plates
def schnorr(num, caption):
    return img(f"{S}/{num[0]}/{num[1]}/Schnorr_von_Carolsfeld_Bibel_in_Bildern_1860_{num}.png/400px-Schnorr_von_Carolsfeld_Bibel_in_Bildern_1860_{num}.png", caption, "Julius Schnorr von Carolsfeld · Public domain")

# Doré Bible illustrations
DORE_CREATION = img(f"{S}/6/63/Gustave_Dor%C3%A9_-_The_Holy_Bible_-_Plate_I%2C_The_Creation_of_Light.jpg/400px-Gustave_Dor%C3%A9_-_The_Holy_Bible_-_Plate_I%2C_The_Creation_of_Light.jpg", "The creation of light — Genesis 1", "Gustave Doré · Public domain")
DORE_FLOOD = img(f"{S}/1/1e/Gustave_Dor%C3%A9_-_The_Holy_Bible_-_Plate_I%2C_The_Deluge.jpg/400px-Gustave_Dor%C3%A9_-_The_Holy_Bible_-_Plate_I%2C_The_Deluge.jpg", "The Deluge", "Gustave Doré · Public domain")
DORE_CRUCIFIXION = img(f"{S}/c/ce/Gustave_Dor%C3%A9_-_The_Holy_Bible_-_Plate_CXL_-_The_Darkness_at_the_Crucifixion.jpg/400px-Gustave_Dor%C3%A9_-_The_Holy_Bible_-_Plate_CXL_-_The_Darkness_at_the_Crucifixion.jpg", "The darkness at the crucifixion", "Gustave Doré · Public domain")

# Reusable images
MICHELANGELO_CREATION = img(f"{S}/1/12/Creaci%C3%B3n_de_Ad%C3%A1m.jpg/400px-Creaci%C3%B3n_de_Ad%C3%A1m.jpg", "The Creation of Adam — Sistine Chapel", "Michelangelo · Public domain")
REMBRANDT_MOSES = img(f"{S}/0/03/Rembrandt_Harmensz._van_Rijn_079.jpg/400px-Rembrandt_Harmensz._van_Rijn_079.jpg", "Moses with the tablets of the Law", "Rembrandt · Public domain")
REMBRANDT_ABRAHAM = img(f"{S}/a/a1/Rembrandt_Abraham_and_Isaac_1634.jpg/400px-Rembrandt_Abraham_and_Isaac_1634.jpg", "Abraham and Isaac on Mount Moriah", "Rembrandt · Public domain")
REMBRANDT_PAUL = img(f"{S}/d/d0/Rembrandt_-_The_Apostle_Paul_-_WGA19120.jpg/400px-Rembrandt_-_The_Apostle_Paul_-_WGA19120.jpg", "The Apostle Paul", "Rembrandt · Public domain")
REMBRANDT_PRODIGAL = img(f"{S}/b/bd/Rembrandt_Harmensz._van_Rijn_-_The_Return_of_the_Prodigal_Son_-_Google_Art_Project.jpg/400px-Rembrandt_Harmensz._van_Rijn_-_The_Return_of_the_Prodigal_Son_-_Google_Art_Project.jpg", "Return of the Prodigal Son", "Rembrandt · Public domain")
RED_SEA = img(f"{S}/3/3e/Figures_Crossing_of_the_Red_Sea.jpg/400px-Figures_Crossing_of_the_Red_Sea.jpg", "Israel crosses the Red Sea", "Providence Lithograph Co. · Public domain")
JERICHO = img(f"{S}/2/2d/Holman_The_Walls_of_Jericho_Fall_Down.jpg/400px-Holman_The_Walls_of_Jericho_Fall_Down.jpg", "The walls of Jericho fall", "Providence Lithograph Co. · Public domain")
NATIVITY = img(f"{S}/b/b4/Robert_Campin_-_The_Nativity_-_WGA14420.jpg/400px-Robert_Campin_-_The_Nativity_-_WGA14420.jpg", "The Nativity", "Robert Campin · Public domain")
TISSOT_EXILE = img(f"{S}/7/7e/Tissot_The_Flight_of_the_Prisoners.jpg/400px-Tissot_The_Flight_of_the_Prisoners.jpg", "The Babylonian exile", "James Tissot · Public domain")
DSS = img(f"{S}/a/ae/Dead_Sea_Scroll_-_part_of_Isaiah_Scroll_%28Isa_57.17_-_59.9%29%2C_Qumran_Cave_1_-_Google_Art_Project.jpg/400px-Dead_Sea_Scroll_-_part_of_Isaiah_Scroll_%28Isa_57.17_-_59.9%29%2C_Qumran_Cave_1_-_Google_Art_Project.jpg", "The Great Isaiah Scroll — Dead Sea Scrolls", "Public domain, via Wikimedia Commons")
P46 = img(f"{S}/8/8d/P46.jpg/400px-P46.jpg", "Papyrus 46 — early New Testament manuscript", "Public domain, via Wikimedia Commons")
SINAITICUS = img(f"{S}/b/b6/Codex_Sinaiticus_open_full.jpg/400px-Codex_Sinaiticus_open_full.jpg", "Codex Sinaiticus — 4th century Bible manuscript", "Public domain, via Wikimedia Commons")
NUREMBERG = img(f"{S}/f/fc/Nuremberg_chronicles_f_10v.png/400px-Nuremberg_chronicles_f_10v.png", "Nuremberg Chronicle — medieval Bible illustration", "Hartmann Schedel · Public domain")
MICHELANGELO_ISAIAH = img(f"{S}/6/6e/Michelangelo%2C_profeta_Isaia_02.jpg/400px-Michelangelo%2C_profeta_Isaia_02.jpg", "The prophet Isaiah — Sistine Chapel", "Michelangelo · Public domain")
MICHELANGELO_JEREMIAH = img(f"{S}/d/d0/Michelangelo_Buonarroti_-_Sistine_Chapel_Ceiling_-_Jeremiah.jpg/400px-Michelangelo_Buonarroti_-_Sistine_Chapel_Ceiling_-_Jeremiah.jpg", "The prophet Jeremiah — Sistine Chapel", "Michelangelo · Public domain")
MICHELANGELO_EZEKIEL = img(f"{S}/a/ad/Michelangelo%2C_profeta_Ezechiele_02.jpg/400px-Michelangelo%2C_profeta_Ezechiele_02.jpg", "The prophet Ezekiel — Sistine Chapel", "Michelangelo · Public domain")
MICHELANGELO_DANIEL = img(f"{S}/6/6a/Michelangelo%2C_profeta_Daniele_02.jpg/400px-Michelangelo%2C_profeta_Daniele_02.jpg", "The prophet Daniel — Sistine Chapel", "Michelangelo · Public domain")
MICHELANGELO_JONAH = img(f"{S}/d/d3/Michelangelo_Buonarroti_-_Jonah_%28detail%29.jpg/400px-Michelangelo_Buonarroti_-_Jonah_%28detail%29.jpg", "The prophet Jonah — Sistine Chapel", "Michelangelo · Public domain")

BOOK_IMAGES = {
    # ═══ TORAH (5) ═══
    "genesis": [MICHELANGELO_CREATION, REMBRANDT_ABRAHAM],
    "exodus": [RED_SEA, REMBRANDT_MOSES],
    "leviticus": [schnorr("143", "The Day of Atonement — Levitical sacrificial system"), REMBRANDT_MOSES],
    "numbers": [schnorr("060", "The Israelites in the wilderness"), RED_SEA],
    "deuteronomy": [REMBRANDT_MOSES, schnorr("067", "Moses' farewell — the plains of Moab")],
    # ═══ HISTORY (12) ═══
    "joshua": [JERICHO, schnorr("068", "Joshua leads Israel into the promised land")],
    "judges": [schnorr("072", "Deborah — judge and prophetess of Israel"), schnorr("076", "Samson — judge of Israel")],
    "ruth": [schnorr("172", "Ruth and Naomi — faithfulness across generations")],
    "1_samuel": [schnorr("082", "Samuel anoints David"), schnorr("091", "David plays the harp before Saul")],
    "2_samuel": [schnorr("091", "David the king and poet of Israel"), schnorr("098", "David brings the Ark to Jerusalem")],
    "1_kings": [schnorr("112", "Solomon's Temple — the glory of Israel"), schnorr("124", "Elijah on Mount Carmel")],
    "2_kings": [schnorr("124", "Elijah's ministry in the divided kingdom"), TISSOT_EXILE],
    "1_chronicles": [schnorr("098", "Temple worship — the Levites before the Ark"), schnorr("091", "David's reign over Israel")],
    "2_chronicles": [schnorr("112", "Solomon's Temple completed"), TISSOT_EXILE],
    "ezra": [TISSOT_EXILE, schnorr("143", "Ezra and the restoration of worship")],
    "nehemiah": [TISSOT_EXILE, NUREMBERG],
    "esther": [schnorr("147", "Esther before King Ahasuerus")],
    # ═══ POETRY (5) ═══
    "job": [schnorr("175", "Job's suffering — tested by affliction"), DORE_CRUCIFIXION],
    "psalms": [schnorr("091", "David the psalmist — the shepherd king"), DSS],
    "proverbs": [schnorr("112", "Solomon's wisdom — a gift from God")],
    "ecclesiastes": [schnorr("112", "Solomon reflects — vanity of vanities")],
    "song_of_solomon": [schnorr("112", "Solomon — love poetry and wisdom")],
    # ═══ MAJOR PROPHETS (5) ═══
    "isaiah": [MICHELANGELO_ISAIAH, DSS],
    "jeremiah": [MICHELANGELO_JEREMIAH, TISSOT_EXILE],
    "lamentations": [TISSOT_EXILE, MICHELANGELO_JEREMIAH],
    "ezekiel": [MICHELANGELO_EZEKIEL, TISSOT_EXILE],
    "daniel": [MICHELANGELO_DANIEL, schnorr("138", "Daniel in the lions' den")],
    # ═══ MINOR PROPHETS (12) ═══
    "hosea": [MICHELANGELO_ISAIAH, TISSOT_EXILE],
    "joel": [DORE_CRUCIFIXION, schnorr("254", "The day of Pentecost — Joel's prophecy fulfilled")],
    "amos": [MICHELANGELO_ISAIAH, schnorr("124", "Prophetic judgment on Israel")],
    "obadiah": [TISSOT_EXILE, NUREMBERG],
    "jonah": [MICHELANGELO_JONAH, schnorr("200", "Jonah and the great fish")],
    "micah": [NATIVITY, MICHELANGELO_ISAIAH],
    "nahum": [TISSOT_EXILE, NUREMBERG],
    "habakkuk": [MICHELANGELO_JEREMIAH, TISSOT_EXILE],
    "zephaniah": [DORE_CRUCIFIXION, MICHELANGELO_ISAIAH],
    "haggai": [schnorr("143", "The rebuilding of the Temple"), TISSOT_EXILE],
    "zechariah": [MICHELANGELO_ISAIAH, schnorr("143", "Visions of restoration — Zechariah's prophecy")],
    "malachi": [schnorr("143", "Temple worship — Malachi's call to faithfulness"), MICHELANGELO_ISAIAH],
    # ═══ GOSPELS + ACTS (5) ═══
    "matthew": [schnorr("240", "The Sermon on the Mount"), NATIVITY],
    "mark": [schnorr("227", "The baptism of Jesus"), DORE_CRUCIFIXION],
    "luke": [NATIVITY, REMBRANDT_PRODIGAL],
    "john": [schnorr("251", "The resurrection — John's witness"), P46],
    "acts": [schnorr("254", "Pentecost — the birth of the church"), REMBRANDT_PAUL],
    # ═══ PAULINE EPISTLES (13) ═══
    "romans": [REMBRANDT_PAUL, P46],
    "1_corinthians": [REMBRANDT_PAUL, P46],
    "2_corinthians": [REMBRANDT_PAUL, P46],
    "galatians": [REMBRANDT_PAUL, P46],
    "ephesians": [REMBRANDT_PAUL, P46],
    "philippians": [REMBRANDT_PAUL, SINAITICUS],
    "colossians": [REMBRANDT_PAUL, SINAITICUS],
    "1_thessalonians": [REMBRANDT_PAUL, P46],
    "2_thessalonians": [REMBRANDT_PAUL, P46],
    "1_timothy": [REMBRANDT_PAUL, SINAITICUS],
    "2_timothy": [REMBRANDT_PAUL, SINAITICUS],
    "titus": [REMBRANDT_PAUL, SINAITICUS],
    "philemon": [REMBRANDT_PAUL, SINAITICUS],
    # ═══ GENERAL EPISTLES (8) ═══
    "hebrews": [schnorr("143", "The great High Priest — Hebrews' central argument"), SINAITICUS],
    "james": [schnorr("240", "Practical wisdom — faith and works"), SINAITICUS],
    "1_peter": [schnorr("233", "Peter — shepherd of the flock"), SINAITICUS],
    "2_peter": [schnorr("233", "Peter's final testimony"), SINAITICUS],
    "1_john": [schnorr("257", "John's vision — light and love"), SINAITICUS],
    "2_john": [SINAITICUS, P46],
    "3_john": [SINAITICUS, P46],
    "jude": [SINAITICUS, DORE_CRUCIFIXION],
    # ═══ APOCALYPTIC (1) ═══
    "revelation": [schnorr("257", "John's vision on Patmos — the Apocalypse"), DORE_CRUCIFIXION],
}

with open('content/meta/book-intros.json', encoding='utf-8') as f:
    data = json.load(f)

count = 0
matched = 0
for entry in data:
    book_id = entry['book']
    images = BOOK_IMAGES.get(book_id)
    if images:
        entry['images'] = images
        count += len(images)
        matched += 1

with open('content/meta/book-intros.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)
    f.write('\n')

print(f"Added {count} images to {matched} of {len(data)} books")
missing = [e['book'] for e in data if 'images' not in e]
if missing:
    print(f"Missing: {missing}")
else:
    print("All 66 books have images!")
