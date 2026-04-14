#!/usr/bin/env python3
"""
download_explore_images.py — Download and stage images for Explore screen panels.

Downloads Doré Bible illustrations from creationism.org, the Stattler Maccabees
from Wikimedia, and the Babylonian map tablet from Wikimedia. Stages them in
_tools/art_staging/priority/ for upload to R2.

Run from the repo root:
    python download_explore_images.py

Then upload to R2:
    python _tools/upload_images_to_r2.py --priority

Images are for:
  - 4 tool panels (Map, Dictionary, Concordance, Topical Index)
  - 12 period cards
  - 8 redemptive arc (story) cards
"""

import os
import sys
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent
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
            print(f"  ✓ {len(data):,} bytes → {dest.name}")
            return True
    except Exception as e:
        print(f"  ✗ Failed: {e}")
        return False


def main():
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
            print(f"  ✗ {fn} — {desc}")
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
