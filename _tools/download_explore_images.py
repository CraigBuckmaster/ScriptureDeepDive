#!/usr/bin/env python3
"""
download_explore_images.py — Download and stage images for Explore screen panels.

Downloads images from Wikimedia Commons, Doré Bible illustrations from
creationism.org, and other public domain sources. Stages them in
_tools/art_staging/priority/ for upload to R2.

Run from the repo root:
    python download_explore_images.py

Then upload to R2:
    python _tools/upload_images_to_r2.py --priority

Images cover:
  - 4 tool panels (Map, Dictionary, Concordance, Topical Index)
  - 12 period cards + 8 redemptive arc (story) cards
  - 8 explore feature panels (Threads, Harmony, Debates, Life Topics,
    Hermeneutic Lenses, Time Travel, Grammar, Content Library)
  - 4 scholar portraits (Calvin, Catena/Aquinas, Robertson, MacArthur)
"""

import os
import sys
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
STAGING_DIR = ROOT / "_tools" / "art_staging" / "priority"

# ── Images to download ──────────────────────────────────────────────────
# Format: (target_filename, source_url, description)

DOWNLOADS = [
    # === TOOL PANELS ===
    (
        "map-babylonian-tablet.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/2/2a/Babylonian_cuneiform_tablet_with_a_map_from_Nippur_1550-1450_BCE.jpg",
        "Map tool panel — Babylonian cuneiform map tablet from Nippur",
    ),
    # === TOOL PANEL IMAGES (Wikimedia) ===
    (
        "aleppo-codex-joshua.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/4/4d/Aleppo_Codex_Joshua_1_1.jpg",
        "Concordance tool panel — Aleppo Codex, Joshua 1:1",
    ),
    (
        "gutenberg-bible.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/b/b6/Gutenberg_Bible%2C_Lenox_Copy%2C_New_York_Public_Library%2C_2009._Pic_01.jpg",
        "Dictionary tool panel — Gutenberg Bible, Lenox Copy",
    ),
    (
        "botticelli-augustine.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/d/d4/Sandro_Botticelli_-_St_Augustin_dans_son_cabinet_de_travail.jpg",
        "Topical Index tool panel — Botticelli St. Augustine in His Study",
    ),

    # === DORÉ — Period cards (missing from R2) ===
    (
        "dore-solomon-judgment.jpg",
        "https://www.creationism.org/images/DoreBibleIllus/h1Ki0325Dore_JudgmentOfSolomon.jpg",
        "Period 5 (United Kingdom) — Judgment of Solomon",
    ),
    (
        "dore-mourning-jerusalem.jpg",
        "https://www.creationism.org/images/DoreBibleIllus/nLam0108Dore_ThePeopleMourningOverRuinsOfJerusalem.jpg",
        "Period 8 (Exile) — People Mourning Over Ruins of Jerusalem",
    ),
    (
        "dore-ezra-prayer.jpg",
        "https://www.creationism.org/images/DoreBibleIllus/jEzr0906Dore_EzraInPrayer.jpg",
        "Period 9 (Post-Exilic) — Ezra in Prayer (re-upload, was 503)",
    ),

    # === DORÉ — Story act cards (missing from R2) ===
    (
        "dore-david-goliath.jpg",
        "https://www.creationism.org/images/DoreBibleIllus/g1Sa1750Dore_DavidAndGoliath.jpg",
        "Story 4 (Kingdom) + Period 5 alt — David and Goliath",
    ),
    (
        "dore-new-jerusalem.jpg",
        "https://www.creationism.org/images/DoreBibleIllus/xRev2101Dore_TheNewJerusalem.jpg",
        "Story 8 (Restoration) — The New Jerusalem (Rev 21)",
    ),
    (
        "dore-resurrection.jpg",
        "https://www.creationism.org/images/DoreBibleIllus/rMat2805Dore_TheResurrection.jpg",
        "Bonus — The Resurrection (was 503 on R2)",
    ),

    # === STATTLER — Intertestamental ===
    (
        "stattler-maccabees.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/0/0b/Stattler-Machabeusze.jpg",
        "Period 10 (Intertestamental) — Stattler's Maccabees (1842)",
    ),

    # === EXPLORE PANEL IMAGES (Wikimedia → R2 migration) ===
    (
        "book-of-kells-chirho.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/9/98/Book_of_Kells_ChiRho_Folio_34R.png",
        "Threads panel — Book of Kells Chi Rho illumination",
    ),
    (
        "aachen-gospels-evangelists.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/3/36/Meister_der_Ada-Gruppe_002.jpg",
        "Gospel Harmony panel — Aachen Gospels, the four Evangelists",
    ),
    (
        "raphael-disputation.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/6/61/Disputa_del_Sacramento_%28Rafael%29.jpg",
        "Debates panel — Raphael's Disputation of the Holy Sacrament",
    ),
    (
        "bloch-sermon-on-mount.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/9/96/Bloch-SermonOnTheMount.jpg",
        "Life Topics panel — Carl Bloch's Sermon on the Mount",
    ),
    (
        "rembrandt-moses.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/4/4a/Rembrandt_Harmensz._van_Rijn_079.jpg",
        "Hermeneutic Lenses panel — Rembrandt's Moses with the Tablets",
    ),
    (
        "st-augustine-portrait.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/6/6b/St_Augustine_Portrait.jpg",
        "Time Travel Reader panel — St. Augustine of Hippo",
    ),
    (
        "martin-luther-cranach.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/9/9a/Martin_Luther_by_Cranach-restoration.tif",
        "Time Travel Reader panel — Martin Luther by Cranach",
    ),
    (
        "papyrus-46.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/5/5c/P46.jpg",
        "Grammar panel — Papyrus 46, Greek NT manuscript",
    ),

    # === SCHOLAR PORTRAIT IMAGES (Wikimedia → R2 migration) ===
    (
        "john-calvin-holbein.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/c/c5/John_Calvin_by_Holbein.png",
        "Scholar portrait — John Calvin by Holbein",
    ),
    (
        "thomas-aquinas.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/e/e3/St-thomas-aquinas.jpg",
        "Scholar portrait — Thomas Aquinas (Catena Aurea)",
    ),
    (
        "archibald-robertson.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/3/37/Archibald_Thomas_Robertson.jpg",
        "Scholar portrait — A.T. Robertson",
    ),
    (
        "john-macarthur.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/d/da/John_F._MacArthur_Jr..JPG",
        "Scholar portrait — John MacArthur",
    ),

    # === CONTENT FILE IMAGES (book intros, maps, timelines, prophecy, etc.) ===

    # Schnorr von Carolsfeld Bible in Pictures series (1860, public domain)
    ("schnorr-010.jpg", "https://upload.wikimedia.org/wikipedia/commons/f/f5/Schnorr_von_Carolsfeld_Bibel_in_Bildern_1860_010.png", "Schnorr — Creation"),
    ("schnorr-024.jpg", "https://upload.wikimedia.org/wikipedia/commons/0/04/Schnorr_von_Carolsfeld_Bibel_in_Bildern_1860_024.png", "Schnorr — Isaac sacrifice"),
    ("schnorr-030.jpg", "https://upload.wikimedia.org/wikipedia/commons/7/7a/Schnorr_von_Carolsfeld_Bibel_in_Bildern_1860_030.png", "Schnorr — Covenant"),
    ("schnorr-036.jpg", "https://upload.wikimedia.org/wikipedia/commons/b/b0/Schnorr_von_Carolsfeld_Bibel_in_Bildern_1860_036.png", "Schnorr — Joseph in Egypt"),
    ("schnorr-042.jpg", "https://upload.wikimedia.org/wikipedia/commons/3/3c/Schnorr_von_Carolsfeld_Bibel_in_Bildern_1860_042.png", "Schnorr — Moses basket"),
    ("schnorr-055.jpg", "https://upload.wikimedia.org/wikipedia/commons/b/be/Schnorr_von_Carolsfeld_Bibel_in_Bildern_1860_055.png", "Schnorr — Moses at Sinai"),
    ("schnorr-060.jpg", "https://upload.wikimedia.org/wikipedia/commons/5/5a/Schnorr_von_Carolsfeld_Bibel_in_Bildern_1860_060.png", "Schnorr — Levitical offerings"),
    ("schnorr-067.jpg", "https://upload.wikimedia.org/wikipedia/commons/6/6b/Schnorr_von_Carolsfeld_Bibel_in_Bildern_1860_067.png", "Schnorr — Balaam's donkey"),
    ("schnorr-068.jpg", "https://upload.wikimedia.org/wikipedia/commons/2/2e/Schnorr_von_Carolsfeld_Bibel_in_Bildern_1860_068.png", "Schnorr — Moses farewell"),
    ("schnorr-072.jpg", "https://upload.wikimedia.org/wikipedia/commons/d/d3/Schnorr_von_Carolsfeld_Bibel_in_Bildern_1860_072.png", "Schnorr — Jordan crossing"),
    ("schnorr-076.jpg", "https://upload.wikimedia.org/wikipedia/commons/3/36/Schnorr_von_Carolsfeld_Bibel_in_Bildern_1860_076.png", "Schnorr — Judges/Samson"),
    ("schnorr-082.jpg", "https://upload.wikimedia.org/wikipedia/commons/e/ee/Schnorr_von_Carolsfeld_Bibel_in_Bildern_1860_082.png", "Schnorr — Ruth and Boaz"),
    ("schnorr-091.jpg", "https://upload.wikimedia.org/wikipedia/commons/2/28/Schnorr_von_Carolsfeld_Bibel_in_Bildern_1860_091.png", "Schnorr — David with harp"),
    ("schnorr-098.jpg", "https://upload.wikimedia.org/wikipedia/commons/4/42/Schnorr_von_Carolsfeld_Bibel_in_Bildern_1860_098.png", "Schnorr — Solomon's wisdom"),
    ("schnorr-112.jpg", "https://upload.wikimedia.org/wikipedia/commons/1/19/Schnorr_von_Carolsfeld_Bibel_in_Bildern_1860_112.png", "Schnorr — Elijah and prophets"),
    ("schnorr-124.jpg", "https://upload.wikimedia.org/wikipedia/commons/2/2e/Schnorr_von_Carolsfeld_Bibel_in_Bildern_1860_124.png", "Schnorr — Isaiah's vision"),
    ("schnorr-143.jpg", "https://upload.wikimedia.org/wikipedia/commons/e/e0/Schnorr_von_Carolsfeld_Bibel_in_Bildern_1860_143.png", "Schnorr — Crucifixion"),
    ("schnorr-147.jpg", "https://upload.wikimedia.org/wikipedia/commons/a/aa/Schnorr_von_Carolsfeld_Bibel_in_Bildern_1860_147.png", "Schnorr — Job's suffering"),
    ("schnorr-172.jpg", "https://upload.wikimedia.org/wikipedia/commons/c/c5/Schnorr_von_Carolsfeld_Bibel_in_Bildern_1860_172.png", "Schnorr — Ezra reading"),
    ("schnorr-175.jpg", "https://upload.wikimedia.org/wikipedia/commons/2/22/Schnorr_von_Carolsfeld_Bibel_in_Bildern_1860_175.png", "Schnorr — Nehemiah's wall"),
    ("schnorr-200.jpg", "https://upload.wikimedia.org/wikipedia/commons/1/1f/Schnorr_von_Carolsfeld_Bibel_in_Bildern_1860_200.png", "Schnorr — Jonah and whale"),
    ("schnorr-227.jpg", "https://upload.wikimedia.org/wikipedia/commons/5/53/Schnorr_von_Carolsfeld_Bibel_in_Bildern_1860_227.png", "Schnorr — Jesus teaching"),
    ("schnorr-233.jpg", "https://upload.wikimedia.org/wikipedia/commons/9/92/Schnorr_von_Carolsfeld_Bibel_in_Bildern_1860_233.png", "Schnorr — Peter preaching"),
    ("schnorr-240.jpg", "https://upload.wikimedia.org/wikipedia/commons/4/4e/Schnorr_von_Carolsfeld_Bibel_in_Bildern_1860_240.png", "Schnorr — Paul preaching"),
    ("schnorr-251.jpg", "https://upload.wikimedia.org/wikipedia/commons/9/93/Schnorr_von_Carolsfeld_Bibel_in_Bildern_1860_251.png", "Schnorr — Resurrection"),
    ("schnorr-254.jpg", "https://upload.wikimedia.org/wikipedia/commons/5/5f/Schnorr_von_Carolsfeld_Bibel_in_Bildern_1860_254.png", "Schnorr — Pentecost"),
    ("schnorr-257.jpg", "https://upload.wikimedia.org/wikipedia/commons/6/65/Schnorr_von_Carolsfeld_Bibel_in_Bildern_1860_257.png", "Schnorr — New Jerusalem"),

    # Michelangelo (Sistine Chapel, public domain)
    ("michelangelo-creation-adam.jpg", "https://upload.wikimedia.org/wikipedia/commons/5/5b/Creaci%C3%B3n_de_Ad%C3%A1m.jpg", "Michelangelo — Creation of Adam"),
    ("michelangelo-isaiah.jpg", "https://upload.wikimedia.org/wikipedia/commons/1/18/Michelangelo%2C_profeta_Isaia_02.jpg", "Michelangelo — Prophet Isaiah"),
    ("michelangelo-ezekiel.jpg", "https://upload.wikimedia.org/wikipedia/commons/0/06/Michelangelo%2C_profeta_Ezechiele_02.jpg", "Michelangelo — Prophet Ezekiel"),
    ("michelangelo-daniel.jpg", "https://upload.wikimedia.org/wikipedia/commons/0/03/Michelangelo%2C_profeta_Daniele_02.jpg", "Michelangelo — Prophet Daniel"),
    ("michelangelo-jeremiah.jpg", "https://upload.wikimedia.org/wikipedia/commons/4/4a/Michelangelo_Buonarroti_-_Sistine_Chapel_Ceiling_-_Jeremiah.jpg", "Michelangelo — Prophet Jeremiah"),
    ("michelangelo-jonah.jpg", "https://upload.wikimedia.org/wikipedia/commons/2/2c/Michelangelo_Buonarroti_-_Jonah_%28detail%29.jpg", "Michelangelo — Prophet Jonah"),
    ("michelangelo-david.jpg", "https://upload.wikimedia.org/wikipedia/commons/a/ab/%27David%27_by_Michelangelo_Fir_JBU005.jpg", "Michelangelo — David statue"),

    # Rembrandt (public domain)
    ("rembrandt-paul.jpg", "https://upload.wikimedia.org/wikipedia/commons/b/bc/Rembrandt_-_The_Apostle_Paul_-_WGA19120.jpg", "Rembrandt — Apostle Paul"),
    ("rembrandt-abraham-isaac.jpg", "https://upload.wikimedia.org/wikipedia/commons/5/54/Rembrandt_Abraham_and_Isaac_1634.jpg", "Rembrandt — Abraham and Isaac"),
    ("rembrandt-jacob-wrestling.jpg", "https://upload.wikimedia.org/wikipedia/commons/7/7c/Rembrandt_-_Jacob_Wrestling_with_the_Angel_-_Google_Art_Project.jpg", "Rembrandt — Jacob wrestling the angel"),
    ("rembrandt-prodigal-son.jpg", "https://upload.wikimedia.org/wikipedia/commons/9/93/Rembrandt_Harmensz._van_Rijn_-_The_Return_of_the_Prodigal_Son_-_Google_Art_Project.jpg", "Rembrandt — Return of the Prodigal Son"),

    # Doré additional (public domain)
    ("dore-creation-of-light.jpg", "https://upload.wikimedia.org/wikipedia/commons/b/ba/Gustave_Dor%C3%A9_-_The_Holy_Bible_-_Plate_I%2C_The_Creation_of_Light.jpg", "Doré — Creation of Light (large version)"),
    ("dore-deluge.jpg", "https://upload.wikimedia.org/wikipedia/commons/2/24/Gustave_Dor%C3%A9_-_The_Holy_Bible_-_Plate_I%2C_The_Deluge.jpg", "Doré — The Deluge"),
    ("dore-crucifixion-darkness.jpg", "https://upload.wikimedia.org/wikipedia/commons/4/4e/Gustave_Dor%C3%A9_-_The_Holy_Bible_-_Plate_CXL_-_The_Darkness_at_the_Crucifixion.jpg", "Doré — Darkness at the Crucifixion"),

    # Tissot, Holman, Campin, and others (public domain)
    ("tissot-flight-prisoners.jpg", "https://upload.wikimedia.org/wikipedia/commons/2/2c/Tissot_The_Flight_of_the_Prisoners.jpg", "Tissot — Flight of the Prisoners (Exile)"),
    ("codex-sinaiticus.jpg", "https://upload.wikimedia.org/wikipedia/commons/d/d8/Codex_Sinaiticus_open_full.jpg", "Codex Sinaiticus — oldest complete NT"),
    ("dead-sea-isaiah-scroll.jpg", "https://upload.wikimedia.org/wikipedia/commons/a/a6/Dead_Sea_Scroll_-_part_of_Isaiah_Scroll_%28Isa_57.17_-_59.9%29.jpg", "Dead Sea Isaiah Scroll"),
    ("nuremberg-chronicles.jpg", "https://upload.wikimedia.org/wikipedia/commons/4/4a/Nuremberg_chronicles_f_10v.png", "Nuremberg Chronicles — genealogy"),
    ("figures-abraham-journey.jpg", "https://upload.wikimedia.org/wikipedia/commons/7/72/Figures_The_Journey_of_Abraham.jpg", "Figures — Journey of Abraham"),
    ("figures-red-sea-crossing.jpg", "https://upload.wikimedia.org/wikipedia/commons/1/17/Figures_Crossing_of_the_Red_Sea.jpg", "Figures — Crossing of the Red Sea"),
    ("holman-jericho-walls.jpg", "https://upload.wikimedia.org/wikipedia/commons/0/0e/Holman_The_Walls_of_Jericho_Fall_Down.jpg", "Holman — Walls of Jericho"),
    ("campin-nativity.jpg", "https://upload.wikimedia.org/wikipedia/commons/3/38/Robert_Campin_-_The_Nativity_-_WGA14420.jpg", "Campin — The Nativity"),
    ("holman-paul-journey3.jpg", "https://upload.wikimedia.org/wikipedia/commons/0/02/Holman_Paul%27s_Third_Missionary_Journey.jpg", "Holman — Paul's Third Missionary Journey"),
]

# Fallback URLs for Doré images (Wikimedia copies if creationism.org is down)
WIKIMEDIA_FALLBACKS = {
    "dore-solomon-judgment.jpg": "https://upload.wikimedia.org/wikipedia/commons/2/2a/Judgement_of_Solomon.jpg",
    "dore-david-goliath.jpg": "https://upload.wikimedia.org/wikipedia/commons/a/a4/David-goliath28.jpg",
    "dore-ezra-prayer.jpg": "https://upload.wikimedia.org/wikipedia/commons/d/d4/078.Ezra_in_Prayer.jpg",
    "dore-resurrection.jpg": "https://upload.wikimedia.org/wikipedia/commons/4/4c/Gustave_Dor%C3%A9_-_The_Resurrection.jpg",
    "dore-new-jerusalem.jpg": "https://upload.wikimedia.org/wikipedia/commons/3/3a/Dore_New_Jerusalem.jpg",
}


def download_file(url: str, dest: Path, description: str) -> bool:
    """Download a file with proper headers. Returns True on success."""
    headers = {
        "User-Agent": "CompanionStudyApp/1.0 (craig@companionstudy.app; scholarly Bible study app)"
    }
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            data = resp.read()
            if len(data) < 1000:
                print(f"  ⚠ Response too small ({len(data)} bytes), likely an error page")
                return False
            dest.write_bytes(data)
            print(f"  OK {len(data):,} bytes -> {dest.name}")
            return True
    except Exception as e:
        print(f"  X  Failed: {e}")
        return False


def main():
    # Force UTF-8 stdout on Windows (cp1252 can't handle Unicode symbols)
    import sys
    if sys.stdout.encoding and sys.stdout.encoding.lower() != 'utf-8':
        try:
            sys.stdout.reconfigure(encoding='utf-8')
        except Exception:
            pass
    STAGING_DIR.mkdir(parents=True, exist_ok=True)
    print(f"Staging directory: {STAGING_DIR}\n")

    success = 0
    failed = []

    for filename, url, description in DOWNLOADS:
        dest = STAGING_DIR / filename
        print(f"[{description}]")
        print(f"  Primary: {url}")

        if download_file(url, dest, description):
            success += 1
            continue

        # Try Wikimedia fallback for Doré images
        fallback = WIKIMEDIA_FALLBACKS.get(filename)
        if fallback:
            print(f"  Fallback: {fallback}")
            if download_file(fallback, dest, description):
                success += 1
                continue

        failed.append((filename, description))

    print(f"\n{'='*60}")
    print(f"Downloaded: {success}/{len(DOWNLOADS)}")

    if failed:
        print(f"Failed: {len(failed)}")
        for fn, desc in failed:
            print(f"  X  {fn} — {desc}")
        print("\nFor failed downloads, try manually:")
        for fn, desc in failed:
            primary = next(u for f, u, d in DOWNLOADS if f == fn)
            print(f"  curl -o {STAGING_DIR / fn} '{primary}'")
    else:
        print("All downloads successful!")

    print(f"\nNext step:")
    print(f"  python _tools/upload_images_to_r2.py --priority")
    print(f"\nThen wire images into content (see IMAGE_MAPPING below).")

    print(f"""
IMAGE MAPPING — R2 URLs after upload:
═══════════════════════════════════════════════════════════

TOOL PANELS (ExploreMenuScreen.tsx):
  Map:           https://contentcompanionstudy.com/art/map-babylonian-tablet.jpg
  Dictionary:    https://contentcompanionstudy.com/art/dore-gutenberg-bible.jpg  (verify existing)
  Concordance:   https://contentcompanionstudy.com/art/dore-aleppo-codex.jpg     (verify existing)
  Topical Index: https://contentcompanionstudy.com/art/botticelli-augustine.jpg   (verify existing)

12 PERIODS (content/meta/ or ExploreMenuScreen.tsx):
  1.  Primeval:        https://contentcompanionstudy.com/art/dore-flood.jpg              (LIVE)
  2.  Patriarchal:     https://contentcompanionstudy.com/art/dore-abraham-isaac.jpg       (LIVE)
  3.  Egypt & Exodus:  https://contentcompanionstudy.com/art/dore-red-sea.jpg             (LIVE)
  4.  Conquest:        https://contentcompanionstudy.com/art/dore-jericho.jpg             (LIVE)
  5.  United Kingdom:  https://contentcompanionstudy.com/art/dore-solomon-judgment.jpg    (NEW)
  6.  Divided Kingdom: https://contentcompanionstudy.com/art/dore-elijah-chariot.jpg      (LIVE)
  7.  Prophets:        https://contentcompanionstudy.com/art/dore-isaiah.jpg              (LIVE)
  8.  Exile:           https://contentcompanionstudy.com/art/dore-mourning-jerusalem.jpg  (NEW)
  9.  Post-Exilic:     https://contentcompanionstudy.com/art/dore-ezra-prayer.jpg         (RE-UPLOAD)
  10. Intertestamental: https://contentcompanionstudy.com/art/stattler-maccabees.jpg      (NEW)
  11. New Testament:   https://contentcompanionstudy.com/art/dore-nativity.jpg             (LIVE)
  12. Apostolic:       https://contentcompanionstudy.com/art/dore-paul.jpg                (LIVE)

8 STORY ACTS (content/meta/redemptive-arc.json):
  1. Creation:    https://contentcompanionstudy.com/art/dore-creation-light.jpg     (LIVE)
  2. Rebellion:   https://contentcompanionstudy.com/art/dore-adam-eve.jpg           (LIVE)
  3. Promise:     https://contentcompanionstudy.com/art/dore-jacob-blessing.jpg     (LIVE)
  4. Kingdom:     https://contentcompanionstudy.com/art/dore-david-goliath.jpg      (NEW)
  5. Exile:       https://contentcompanionstudy.com/art/dore-jeremiah.jpg           (LIVE)
  6. Incarnation: https://contentcompanionstudy.com/art/dore-nativity.jpg           (LIVE)
  7. Mission:     https://contentcompanionstudy.com/art/dore-pentecost.jpg          (LIVE)
  8. Restoration: https://contentcompanionstudy.com/art/dore-new-jerusalem.jpg      (NEW)
""")


if __name__ == "__main__":
    main()
