#!/usr/bin/env python3
"""
build_sqlite.py — Compile all JSON content into scripture.db.

Orchestrator that imports schema DDL from build_sqlite_schema and loader
functions from build_sqlite_loaders, calls them in order, then runs
VACUUM/ANALYZE and verification queries.

Usage:
    python3 _tools/build_sqlite.py
"""
import os, sys, json, sqlite3, hashlib, shutil
from pathlib import Path

# Ensure stdout can handle UTF-8 (needed on Windows where cp1252 is default)
if sys.stdout.encoding and sys.stdout.encoding.lower() != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

ROOT = Path(__file__).resolve().parent.parent
META = ROOT / 'content' / 'meta'
DB_PATH = ROOT / 'scripture.db'
DB_MANIFEST_PATH = ROOT / 'app' / 'assets' / 'db-manifest.json'

from build_sqlite_schema import create_schema
from build_sqlite_loaders import (
    populate_books, populate_chapters, populate_verses,
    populate_book_intros, populate_people, populate_scholars,
    populate_places, populate_map_stories, populate_ancient_borders,
    populate_word_studies,
    populate_synoptic, populate_topics, populate_debate_topics,
    populate_genealogy_config, populate_cross_refs, populate_timelines,
    populate_eras, populate_redemptive_acts, populate_prophecy_chains,
    populate_concepts, populate_difficult_passages, populate_interlinear,
    populate_lexicon, populate_dictionary, populate_red_letter,
    populate_content_library, populate_life_topics, populate_hermeneutic_lenses,
    populate_archaeology, populate_historical_interpretations,
    populate_grammar_articles, populate_content_images,
    build_fts, compute_difficulty, build_supplemental_translations,
    AVAILABLE_TRANSLATIONS, BUNDLED_TRANSLATIONS,
)


def compute_content_hash():
    """Compute SHA256 hash of all content source files."""
    hasher = hashlib.sha256()
    content_dir = ROOT / 'content'
    json_files = sorted(content_dir.rglob('*.json'))
    json_files = [f for f in json_files if 'verses' not in f.parts]
    for filepath in json_files:
        rel_path = filepath.relative_to(content_dir)
        hasher.update(str(rel_path).encode('utf-8'))
        hasher.update(filepath.read_bytes())
    return hasher.hexdigest()[:16]


def write_db_manifest(content_hash: str):
    """Write the content hash to app/assets/db-manifest.json."""
    manifest = {
        "content_hash": content_hash,
        "build_time": __import__('datetime').datetime.utcnow().isoformat() + 'Z'
    }
    DB_MANIFEST_PATH.parent.mkdir(parents=True, exist_ok=True)
    DB_MANIFEST_PATH.write_text(json.dumps(manifest, indent=2) + '\n', encoding='utf-8')
    print(f"  [OK] db-manifest.json: {content_hash}")


def main():
    content_hash = compute_content_hash()
    print(f"  Content hash: {content_hash}")

    if DB_PATH.exists():
        DB_PATH.unlink()

    print("=" * 60)
    print("Phase 0F: Building scripture.db")
    print("=" * 60)

    conn = sqlite3.connect(str(DB_PATH))
    cur = conn.cursor()
    cur.execute('PRAGMA journal_mode=DELETE')
    cur.execute('PRAGMA foreign_keys=OFF')

    # Schema
    create_schema(conn)
    print("  Schema created.")

    # Loaders
    print(f"  [OK] books: {populate_books(cur)} rows")

    ch, sec, sp, cp, vh = populate_chapters(cur)
    print(f"  [OK] chapters: {ch}, sections: {sec}, section_panels: {sp}, chapter_panels: {cp}, vhl: {vh}")

    print(f"  [OK] verses: {populate_verses(cur)} rows")
    print(f"  [OK] book_intros: {populate_book_intros(cur)} rows")
    print(f"  [OK] people: {populate_people(cur)} rows")
    print(f"  [OK] scholars: {populate_scholars(cur)} rows")
    print(f"  [OK] places: {populate_places(cur)} rows")
    print(f"  [OK] map_stories: {populate_map_stories(cur)} rows")
    print(f"  [OK] ancient_borders: {populate_ancient_borders(cur)} rows")
    print(f"  [OK] word_studies: {populate_word_studies(cur)} rows")
    print(f"  [OK] synoptic_map: {populate_synoptic(cur)} rows")
    print(f"  [OK] topics: {populate_topics(cur)} rows")
    print(f"  [OK] debate_topics: {populate_debate_topics(cur)} rows")
    print(f"  [OK] genealogy_config: {populate_genealogy_config(cur)} rows")

    t, p = populate_cross_refs(cur)
    print(f"  [OK] cross_ref_threads: {t}, cross_ref_pairs: {p}")

    print(f"  [OK] timelines: {populate_timelines(cur)} rows")
    print(f"  [OK] eras: {populate_eras(cur)} rows")
    print(f"  [OK] redemptive_acts: {populate_redemptive_acts(cur)} rows")
    print(f"  [OK] prophecy_chains: {populate_prophecy_chains(cur)} rows")
    print(f"  [OK] concepts: {populate_concepts(cur)} rows")
    print(f"  [OK] difficult_passages: {populate_difficult_passages(cur)} rows")
    print(f"  [OK] interlinear_words: {populate_interlinear(cur)} rows")
    print(f"  [OK] lexicon_entries: {populate_lexicon(cur)} rows")
    print(f"  [OK] dictionary_entries: {populate_dictionary(cur)} rows")
    print(f"  [OK] red_letter_verses: {populate_red_letter(cur)} rows")
    print(f"  [OK] content_library: {populate_content_library(cur)} rows")

    result = populate_life_topics(cur)
    if result is None:
        print("  [SKIP] life_topics: not found")
    else:
        cats, topics, verses, scholars, related = result
        print(f"  [OK] life_topics: {cats} cats, {topics} topics, {verses} verses")

    result = populate_hermeneutic_lenses(cur)
    if result is None:
        print("  [SKIP] hermeneutic_lenses: not found")
    else:
        print(f"  [OK] hermeneutic_lenses: {result[0]} lenses, {result[1]} contents")

    result = populate_archaeology(cur)
    if result is None:
        print("  [SKIP] archaeology: not found")
    else:
        print(f"  [OK] archaeology: {result[0]} discoveries, {result[1]} links, {result[2]} images")

    result = populate_historical_interpretations(cur)
    if result is None:
        print("  [SKIP] historical_interpretations: not found")
    else:
        print(f"  [OK] historical_interpretations: {result[0]} eras, {result[1]} entries")

    print(f"  [OK] grammar_articles: {populate_grammar_articles(cur)} rows")
    print(f"  [OK] content_images: {populate_content_images(cur)} rows")
    print(f"  [OK] difficulty scores: {compute_difficulty(cur)} chapters rated")

    build_fts(cur)
    print("  [OK] FTS5 indexes built")

    # Performance indexes for hot-path queries (Card #1175)
    cur.executescript("""
        CREATE INDEX IF NOT EXISTS idx_sections_chapter ON sections(chapter_id);
        CREATE INDEX IF NOT EXISTS idx_section_panels_section ON section_panels(section_id);
        CREATE INDEX IF NOT EXISTS idx_chapter_panels_chapter ON chapter_panels(chapter_id);
        CREATE INDEX IF NOT EXISTS idx_vhl_groups_chapter ON vhl_groups(chapter_id);
        CREATE INDEX IF NOT EXISTS idx_chapters_book ON chapters(book_id);
        CREATE INDEX IF NOT EXISTS idx_people_journeys_person ON people_journeys(person_id);
    """)
    print("  [OK] Performance indexes created")

    # Write content hash to db_meta
    cur.execute("INSERT INTO db_meta (key, value) VALUES ('content_hash', ?)", (content_hash,))
    cur.execute('PRAGMA foreign_keys=ON')
    conn.commit()
    conn.execute('VACUUM')
    conn.close()

    # Copy to app assets
    assets_db = ROOT / 'app' / 'assets' / 'scripture.db'
    assets_db.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(DB_PATH, assets_db)
    write_db_manifest(content_hash)

    # Sync explore-images
    explore_src = META / 'explore-images.json'
    explore_dst = ROOT / 'app' / 'assets' / 'explore-images.json'
    if explore_src.exists():
        shutil.copy2(explore_src, explore_dst)

    size = DB_PATH.stat().st_size
    print(f"\n{'='*60}")
    print(f"scripture.db: {size // 1024 // 1024}MB ({size // 1024}KB)")

    # Build supplemental translations
    supplemental = build_supplemental_translations()
    manifest = []
    for t in sorted(AVAILABLE_TRANSLATIONS):
        is_bundled = t in BUNDLED_TRANSLATIONS
        entry = {'id': t, 'bundled': is_bundled}
        if not is_bundled:
            sup = next((s for s in supplemental if s['id'] == t), None)
            if sup:
                entry['file'] = sup['file']
                entry['sizeBytes'] = sup['size_bytes']
        manifest.append(entry)
    manifest_path = ROOT / 'app' / 'src' / 'db' / 'translations.json'
    manifest_path.write_text(json.dumps(manifest, indent=2), encoding='utf-8')
    print(f"  [OK] translations.json: {len(manifest)} translations")

    print(f"\n{'='*60}")
    print("Phase 0F complete.")


if __name__ == '__main__':
    os.chdir(ROOT)
    main()
