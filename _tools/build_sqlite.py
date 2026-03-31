#!/usr/bin/env python3
"""
build_sqlite.py — Compile all JSON content into scripture.db.

Reads all content/{book}/{ch}.json files and content/meta/*.json reference
data, then builds a single SQLite database that the React Native app bundles.

This script is run after every content change (enrichment, new scholars,
timeline updates, etc.) as part of the standard pipeline:
    python3 _tools/validate.py       # Check JSON integrity
    python3 _tools/build_sqlite.py   # ← This script
    python3 _tools/validate_sqlite.py  # Verify DB integrity

The DB version lives in _tools/db_version.json (single source of truth).
It is auto-incremented on each build and synced to the app's database.ts
so the app knows to replace the old DB on device.

Usage:
    python3 _tools/build_sqlite.py
"""
import os, sys, json, sqlite3, glob, re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
META = ROOT / 'content' / 'meta'
VERSES_DIR = ROOT / 'content' / 'verses'
DB_PATH = ROOT / 'scripture.db'
APP_DB_TS = ROOT / 'app' / 'src' / 'db' / 'database.ts'
VERSION_FILE = ROOT / '_tools' / 'db_version.json'

# Read from db_version.json — the single source of truth for the DB version.
# Auto-incremented on every build by bump_db_version(). Triggers a full DB
# replacement on user devices when the app detects a version mismatch.
DB_VERSION = json.loads(VERSION_FILE.read_text())['version']


def bump_db_version():
    """Auto-increment DB_VERSION and sync to database.ts.

    How it works:
      1. Reads current version from _tools/db_version.json (e.g. '0.14')
      2. Increments minor (-> '0.15')
      3. Writes the new version back to db_version.json
      4. Rewrites the EXPECTED_DB_VERSION line in database.ts to match
      5. Updates the global DB_VERSION so the current build uses the new value
    """
    global DB_VERSION

    # Parse current version: "0.14" -> major=0, minor=14
    parts = DB_VERSION.split('.')
    if len(parts) == 2:
        major, minor = int(parts[0]), int(parts[1])
        new_version = f"{major}.{minor + 1}"
    else:
        new_version = DB_VERSION + ".1"

    old_version = DB_VERSION

    # Write new version to db_version.json (single source of truth)
    VERSION_FILE.write_text(json.dumps({"version": new_version}, indent=2) + '\n')

    # Sync to app/src/db/database.ts so the app knows to replace the old DB
    if APP_DB_TS.exists():
        ts_content = APP_DB_TS.read_text()
        ts_content = re.sub(
            r"const EXPECTED_DB_VERSION = '[^']+';",
            f"const EXPECTED_DB_VERSION = '{new_version}';",
            ts_content
        )
        APP_DB_TS.write_text(ts_content)
        print(f"  DB version: {old_version} -> {new_version} (synced to database.ts)")
    else:
        print(f"  DB version: {old_version} -> {new_version} (database.ts not found)")

    DB_VERSION = new_version
    return new_version



# ---------------------------------------------------------------------------
# Schema
# ---------------------------------------------------------------------------
SCHEMA = """
-- ══════════════════════════════════════════════════════════════
-- CONTENT (bundled with app, updated via OTA)
-- ══════════════════════════════════════════════════════════════

CREATE TABLE books (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  testament TEXT NOT NULL,
  total_chapters INTEGER NOT NULL,
  book_order INTEGER NOT NULL,
  is_live BOOLEAN DEFAULT 0,
  genre TEXT,
  genre_label TEXT,
  genre_guidance TEXT
);

CREATE TABLE chapters (
  id TEXT PRIMARY KEY,
  book_id TEXT NOT NULL REFERENCES books(id),
  chapter_num INTEGER NOT NULL,
  title TEXT,
  subtitle TEXT,
  timeline_link_event TEXT,
  timeline_link_text TEXT,
  map_story_link_id TEXT,
  map_story_link_text TEXT,
  coaching_json TEXT
);

CREATE TABLE sections (
  id TEXT PRIMARY KEY,
  chapter_id TEXT NOT NULL REFERENCES chapters(id),
  section_num INTEGER NOT NULL,
  header TEXT,
  verse_start INTEGER,
  verse_end INTEGER
);

CREATE TABLE section_panels (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  section_id TEXT NOT NULL REFERENCES sections(id),
  panel_type TEXT NOT NULL,
  content_json TEXT NOT NULL
);

CREATE TABLE chapter_panels (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  chapter_id TEXT NOT NULL REFERENCES chapters(id),
  panel_type TEXT NOT NULL,
  content_json TEXT NOT NULL
);

CREATE TABLE verses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  book_id TEXT NOT NULL REFERENCES books(id),
  chapter_num INTEGER NOT NULL,
  verse_num INTEGER NOT NULL,
  translation TEXT NOT NULL,
  text TEXT NOT NULL
);
CREATE INDEX idx_verses ON verses(book_id, chapter_num, verse_num, translation);

CREATE TABLE book_intros (
  book_id TEXT PRIMARY KEY REFERENCES books(id),
  intro_json TEXT NOT NULL
);

CREATE TABLE people (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  gender TEXT,
  father TEXT,
  mother TEXT,
  spouse_of TEXT,
  era TEXT,
  dates TEXT,
  role TEXT,
  type TEXT,
  bio TEXT,
  scripture_role TEXT,
  refs_json TEXT,
  chapter_link TEXT
);

CREATE TABLE scholars (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  label TEXT NOT NULL,
  color TEXT,
  tradition TEXT,
  scope_json TEXT NOT NULL,
  bio_json TEXT NOT NULL
);

CREATE TABLE places (
  id TEXT PRIMARY KEY,
  ancient_name TEXT NOT NULL,
  modern_name TEXT,
  latitude REAL NOT NULL,
  longitude REAL NOT NULL,
  type TEXT NOT NULL,
  priority INTEGER DEFAULT 2,
  label_dir TEXT DEFAULT 'n'
);

CREATE TABLE map_stories (
  id TEXT PRIMARY KEY,
  era TEXT NOT NULL,
  name TEXT NOT NULL,
  scripture_ref TEXT,
  chapter_link TEXT,
  summary TEXT NOT NULL,
  places_json TEXT,
  regions_json TEXT,
  paths_json TEXT
);

CREATE TABLE word_studies (
  id TEXT PRIMARY KEY,
  language TEXT NOT NULL,
  original TEXT NOT NULL,
  transliteration TEXT NOT NULL,
  strongs TEXT,
  glosses_json TEXT NOT NULL,
  semantic_range TEXT,
  note TEXT,
  occurrences_json TEXT
);

CREATE TABLE synoptic_map (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT,
  passages_json TEXT NOT NULL
);

CREATE TABLE vhl_groups (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  chapter_id TEXT NOT NULL REFERENCES chapters(id),
  group_name TEXT NOT NULL,
  css_class TEXT NOT NULL,
  words_json TEXT NOT NULL,
  btn_types_json TEXT NOT NULL
);

CREATE TABLE genealogy_config (
  key TEXT PRIMARY KEY,
  value_json TEXT NOT NULL
);

CREATE TABLE cross_ref_threads (
  id TEXT PRIMARY KEY,
  theme TEXT NOT NULL,
  tags_json TEXT,
  steps_json TEXT NOT NULL
);

CREATE TABLE cross_ref_pairs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  from_ref TEXT NOT NULL,
  to_ref TEXT NOT NULL,
  note TEXT
);

CREATE TABLE timelines (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL,
  era TEXT,
  name TEXT NOT NULL,
  year INTEGER NOT NULL,
  scripture_ref TEXT,
  chapter_link TEXT,
  people_json TEXT,
  summary TEXT,
  region TEXT
);

-- Database version metadata
CREATE TABLE db_meta (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

-- ══════════════════════════════════════════════════════════════
-- FEATURE TABLES (prophecy chains, concepts, difficult passages)
-- ══════════════════════════════════════════════════════════════

CREATE TABLE prophecy_chains (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  chain_type TEXT NOT NULL,
  summary TEXT,
  tags_json TEXT,
  links_json TEXT NOT NULL
);

CREATE TABLE concepts (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  theme_key TEXT,
  word_study_ids_json TEXT,
  thread_ids_json TEXT,
  prophecy_chain_ids_json TEXT,
  people_tags_json TEXT,
  tags_json TEXT
);

CREATE TABLE difficult_passages (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  severity TEXT NOT NULL,
  passage TEXT NOT NULL,
  question TEXT NOT NULL,
  context TEXT,
  consensus TEXT,
  key_verses_json TEXT,
  responses_json TEXT NOT NULL,
  related_chapters_json TEXT,
  further_reading_json TEXT,
  tags_json TEXT
);

-- Full-text search indexes
CREATE VIRTUAL TABLE verses_fts USING fts5(text, content=verses, content_rowid=id);
CREATE VIRTUAL TABLE people_fts USING fts5(name, role, bio, content=people, content_rowid=rowid);

-- ══════════════════════════════════════════════════════════════
-- NOTE: User tables (notes, bookmarks, preferences, highlights,
-- reading progress, plans) live in a separate user.db managed by
-- the app's userDatabase.ts migration system. They are NOT bundled
-- in scripture.db so that content updates can safely replace this
-- file without destroying user data.
-- ══════════════════════════════════════════════════════════════
"""


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def _json_str(obj):
    """Compact JSON encode."""
    return json.dumps(obj, ensure_ascii=False, separators=(',', ':'))


def _load_json(path):
    with open(path, encoding='utf-8') as f:
        return json.load(f)


# ---------------------------------------------------------------------------
# Population functions
# ---------------------------------------------------------------------------
def populate_books(cur):
    books = _load_json(META / 'books.json')
    for b in books:
        cur.execute(
            'INSERT INTO books (id, name, testament, total_chapters, book_order, is_live, genre, genre_label, genre_guidance) '
            'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            (b['id'], b['name'], b['testament'], b['total_chapters'],
             b['book_order'], b['is_live'], b.get('genre'), b.get('genre_label'), b.get('genre_guidance'))
        )
    return len(books)


def populate_chapters(cur):
    """Populate chapters, sections, section_panels, chapter_panels, and vhl_groups.

    Walks every content/{book}/*.json file and inserts the nested data:
      book_dir/
        └── {ch}.json
              ├── chapter row (title, subtitle, deep-links)
              ├── sections[] → section rows (header, verse range)
              │     └── panels{} → section_panel rows (heb, ctx, cross, scholar notes)
              ├── chapter_panels{} → chapter_panel rows (lit, themes, ppl, tx, etc.)
              └── vhl_groups[] → vhl_group rows (highlighted words by category)

    Skips content/meta/ and content/verses/ (those are handled by other functions).
    """
    chapter_count = 0
    section_count = 0
    sec_panel_count = 0
    ch_panel_count = 0
    vhl_count = 0

    content_dir = ROOT / 'content'
    for book_dir in sorted(content_dir.iterdir()):
        if not book_dir.is_dir() or book_dir.name in ('meta', 'verses'):
            continue
        book_id = book_dir.name
        for json_file in sorted(book_dir.glob('*.json')):
            data = _load_json(json_file)
            ch_num = data['chapter_num']
            chapter_id = f"{book_id}_{ch_num}"

            # Deep-links
            tl = data.get('timeline_link')
            ms = data.get('map_story_link')

            # Coaching tips (optional)
            coaching = data.get('coaching')
            coaching_str = _json_str(coaching) if coaching else None

            cur.execute(
                'INSERT INTO chapters (id, book_id, chapter_num, title, subtitle, '
                'timeline_link_event, timeline_link_text, '
                'map_story_link_id, map_story_link_text, coaching_json) '
                'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                (chapter_id, book_id, ch_num,
                 data.get('title'), data.get('subtitle'),
                 tl['event_id'] if tl else None,
                 tl['text'] if tl else None,
                 ms['story_id'] if ms else None,
                 ms['text'] if ms else None,
                 coaching_str)
            )
            chapter_count += 1

            # Sections
            for sec in data.get('sections', []):
                sn = sec['section_num']
                section_id = f"{chapter_id}_s{sn}"
                cur.execute(
                    'INSERT INTO sections (id, chapter_id, section_num, header, '
                    'verse_start, verse_end) VALUES (?, ?, ?, ?, ?, ?)',
                    (section_id, chapter_id, sn, sec.get('header'),
                     sec.get('verse_start'), sec.get('verse_end'))
                )
                section_count += 1

                # Section panels
                for ptype, content in sec.get('panels', {}).items():
                    cur.execute(
                        'INSERT INTO section_panels (section_id, panel_type, content_json) '
                        'VALUES (?, ?, ?)',
                        (section_id, ptype, _json_str(content))
                    )
                    sec_panel_count += 1

            # Chapter panels
            for ptype, content in data.get('chapter_panels', {}).items():
                cur.execute(
                    'INSERT INTO chapter_panels (chapter_id, panel_type, content_json) '
                    'VALUES (?, ?, ?)',
                    (chapter_id, ptype, _json_str(content))
                )
                ch_panel_count += 1

            # VHL groups
            for g in data.get('vhl_groups', []):
                cur.execute(
                    'INSERT INTO vhl_groups (chapter_id, group_name, css_class, '
                    'words_json, btn_types_json) VALUES (?, ?, ?, ?, ?)',
                    (chapter_id, g['name'], g['css_class'],
                     _json_str(g['words']), _json_str(g['btn_types']))
                )
                vhl_count += 1

    return chapter_count, section_count, sec_panel_count, ch_panel_count, vhl_count


def populate_verses(cur):
    count = 0
    for translation in ('niv', 'esv'):
        trans_dir = VERSES_DIR / translation
        if not trans_dir.is_dir():
            continue
        for json_file in sorted(trans_dir.glob('*.json')):
            book_id = json_file.stem
            verses = _load_json(json_file)
            for v in verses:
                cur.execute(
                    'INSERT INTO verses (book_id, chapter_num, verse_num, translation, text) '
                    'VALUES (?, ?, ?, ?, ?)',
                    (book_id, v['ch'], v['v'], translation, v['text'])
                )
                count += 1
    return count


def populate_book_intros(cur):
    intros = _load_json(META / 'book-intros.json')
    count = 0
    for intro in intros:
        book_id = intro.get('book', '').lower().replace(' ', '_')
        if not book_id:
            continue
        cur.execute(
            'INSERT OR IGNORE INTO book_intros (book_id, intro_json) VALUES (?, ?)',
            (book_id, _json_str(intro))
        )
        count += 1
    return count


def populate_people(cur):
    data = _load_json(META / 'people.json')
    people = data.get('people', [])

    # Load spine IDs for type computation
    gc = _load_json(META / 'genealogy-config.json')
    spine_ids = set(gc.get('spine_ids', []))

    count = 0
    for p in people:
        ptype = 'spine' if p['id'] in spine_ids else 'satellite'
        cur.execute(
            'INSERT INTO people (id, name, gender, father, mother, spouse_of, '
            'era, dates, role, type, bio, scripture_role, refs_json, chapter_link) '
            'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            (p['id'], p['name'], p.get('gender'), p.get('father'),
             p.get('mother'), p.get('spouseOf'), p.get('era'),
             p.get('dates'), p.get('role'), ptype, p.get('bio'),
             p.get('scriptureRole'),
             _json_str(p.get('refs', [])),
             p.get('chapter'))
        )
        count += 1
    return count


def populate_scholars(cur):
    scholars = _load_json(META / 'scholars.json')
    count = 0
    for s in scholars:
        bio_json = _json_str({
            'eyebrow': s.get('eyebrow', ''),
            'tradition': s.get('tradition', ''),
            'description': s.get('description', ''),
            'sections': s.get('bio_sections', []),
        })
        scope = s.get('scope', [])
        scope_json = _json_str(scope) if isinstance(scope, list) else _json_str(scope)

        cur.execute(
            'INSERT INTO scholars (id, name, label, color, tradition, scope_json, bio_json) '
            'VALUES (?, ?, ?, ?, ?, ?, ?)',
            (s['id'], s['name'], s['label'], s.get('color'),
             s.get('tradition'), scope_json, bio_json)
        )
        count += 1
    return count


def populate_places(cur):
    places = _load_json(META / 'places.json')
    count = 0
    for p in places:
        cur.execute(
            'INSERT INTO places (id, ancient_name, modern_name, latitude, longitude, '
            'type, priority, label_dir) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            (p['id'], p.get('ancient', ''), p.get('modern'),
             p['lat'], p['lon'], p['type'],
             p.get('priority', 2), p.get('labelDir', 'n'))
        )
        count += 1
    return count


def populate_map_stories(cur):
    data = _load_json(META / 'map-stories.json')
    stories = data.get('stories', [])
    count = 0
    for s in stories:
        cur.execute(
            'INSERT INTO map_stories (id, era, name, scripture_ref, chapter_link, '
            'summary, places_json, regions_json, paths_json) '
            'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            (s['id'], s['era'], s['name'], s.get('ref'),
             s.get('chapter'), s.get('summary', ''),
             _json_str(s.get('places', [])),
             _json_str(s.get('regions', [])),
             _json_str(s.get('paths', [])))
        )
        count += 1
    return count


def populate_word_studies(cur):
    studies = _load_json(META / 'word-studies.json')
    count = 0
    for w in studies:
        cur.execute(
            'INSERT INTO word_studies (id, language, original, transliteration, '
            'strongs, glosses_json, semantic_range, note, occurrences_json) '
            'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            (w['id'], w['language'], w['original'], w['transliteration'],
             w.get('strongs'), _json_str(w.get('glosses', [])),
             w.get('range'), w.get('note'),
             _json_str(w.get('occurrences', [])))
        )
        count += 1
    return count


def populate_synoptic(cur):
    entries = _load_json(META / 'synoptic.json')
    count = 0
    for s in entries:
        cur.execute(
            'INSERT INTO synoptic_map (id, title, category, passages_json) '
            'VALUES (?, ?, ?, ?)',
            (s['id'], s['title'], s.get('category'),
             _json_str(s.get('passages', [])))
        )
        count += 1
    return count


def populate_genealogy_config(cur):
    gc = _load_json(META / 'genealogy-config.json')
    count = 0
    for key, value in gc.items():
        cur.execute(
            'INSERT INTO genealogy_config (key, value_json) VALUES (?, ?)',
            (key, _json_str(value))
        )
        count += 1
    return count


def populate_cross_refs(cur):
    data = _load_json(META / 'cross-refs.json')

    # Threads (chain → steps_json)
    threads = data.get('threads', [])
    for t in threads:
        cur.execute(
            'INSERT INTO cross_ref_threads (id, theme, tags_json, steps_json) '
            'VALUES (?, ?, ?, ?)',
            (t['id'], t['theme'],
             _json_str(t.get('tags', [])),
             _json_str(t.get('chain', [])))
        )

    # Pairs (a → from_ref, b → to_ref)
    pairs = data.get('pairs', [])
    for p in pairs:
        cur.execute(
            'INSERT INTO cross_ref_pairs (from_ref, to_ref, note) '
            'VALUES (?, ?, ?)',
            (p['a'], p['b'], p.get('note'))
        )

    return len(threads), len(pairs)


def populate_timelines(cur):
    """Populate the timelines table from timelines.json.

    timelines.json contains 4 separate arrays that all go into one table:
      events[]          → biblical events (prefix: evt_)
      book_events[]     → book authorship dates (prefix: bk_)
      timeline_people[] → people with date ranges (prefix: ppl_)
      world_events[]    → secular history markers (prefix: wld_)

    IDs are prefixed by category because the same name can appear in multiple
    arrays (e.g. 'deborah' as both an event and a person). The prefix makes
    each row's primary key unique while the 'category' column allows filtering.

    Also stores era metadata (hex colors, names, ranges) in genealogy_config
    as key-value pairs for the timeline UI to read.
    """
    data = _load_json(META / 'timelines.json')
    count = 0

    # --- Biblical events (e.g. "The Exodus", "Fall of Jerusalem") ---
    for ev in data.get('events', []):
        tid = f"evt_{ev['id']}"
        cur.execute(
            'INSERT INTO timelines (id, category, era, name, year, '
            'scripture_ref, chapter_link, people_json, summary, region) '
            'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            (tid, 'event', ev.get('era'), ev['name'], ev['year'],
             ev.get('ref'), ev.get('chapter'),
             _json_str(ev.get('people', [])),
             ev.get('summary'), None)
        )
        count += 1

    # --- Book authorship events (e.g. "Genesis written", "Romans written") ---
    for bk in data.get('book_events', []):
        tid = f"bk_{bk['id']}"
        cur.execute(
            'INSERT INTO timelines (id, category, era, name, year, '
            'scripture_ref, chapter_link, people_json, summary, region) '
            'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            (tid, 'book', bk.get('era'), bk['name'], bk['year'],
             bk.get('ref'), bk.get('chapter'),
             _json_str(bk.get('author', [])),
             bk.get('summary'), None)
        )
        count += 1

    # --- Timeline people (e.g. "Abraham ~2000 BC", "David ~1010 BC") ---
    for tp in data.get('timeline_people', []):
        tid = f"ppl_{tp['id']}"
        cur.execute(
            'INSERT INTO timelines (id, category, era, name, year, '
            'scripture_ref, chapter_link, people_json, summary, region) '
            'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            (tid, 'person', tp.get('era'), tp['name'], tp['year'],
             None, None, None, None, None)
        )
        count += 1

    # --- World events (e.g. "Fall of Rome", "Cyrus conquers Babylon") ---
    for we in data.get('world_events', []):
        tid = f"wld_{we['id']}"
        cur.execute(
            'INSERT INTO timelines (id, category, era, name, year, '
            'scripture_ref, chapter_link, people_json, summary, region) '
            'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            (tid, 'world', None, we['name'], we['year'],
             None, None, None, we.get('summary'), we.get('region'))
        )
        count += 1

    # --- Era metadata (colors, names, date ranges) stored in genealogy_config ---
    # The genealogy_config table is a generic key-value store. Timeline era data
    # is stored here with 'timeline_' prefixed keys so the app can render era
    # labels, colors, and filter ranges without hardcoding them.
    for key in ('era_hex', 'era_names', 'era_ranges', 'era_config'):
        if key in data:
            cur.execute(
                'INSERT OR REPLACE INTO genealogy_config (key, value_json) '
                'VALUES (?, ?)',
                (f'timeline_{key}', _json_str(data[key]))
            )

    return count


def populate_prophecy_chains(cur):
    path = META / 'prophecy-chains.json'
    if not path.exists():
        return 0
    chains = _load_json(path)
    for c in chains:
        cur.execute(
            'INSERT INTO prophecy_chains VALUES (?,?,?,?,?,?,?)',
            (c['id'], c['title'], c['category'], c['type'],
             c.get('summary'), _json_str(c.get('tags', [])),
             _json_str(c['links']))
        )
    return len(chains)


def populate_concepts(cur):
    path = META / 'concepts.json'
    if not path.exists():
        return 0
    concepts = _load_json(path)
    for c in concepts:
        cur.execute(
            'INSERT INTO concepts VALUES (?,?,?,?,?,?,?,?,?)',
            (c['id'], c['title'], c.get('description'),
             c.get('theme_key'), _json_str(c.get('word_study_ids', [])),
             _json_str(c.get('thread_ids', [])),
             _json_str(c.get('prophecy_chain_ids', [])),
             _json_str(c.get('people_tags', [])),
             _json_str(c.get('tags', [])))
        )
    return len(concepts)


def populate_difficult_passages(cur):
    path = META / 'difficult-passages.json'
    if not path.exists():
        return 0
    passages = _load_json(path)
    for p in passages:
        cur.execute(
            'INSERT INTO difficult_passages VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)',
            (p['id'], p['title'], p['category'], p['severity'],
             p['passage'], p['question'],
             p.get('context'),
             p.get('consensus'),
             _json_str(p.get('key_verses', [])),
             _json_str(p['responses']),
             _json_str(p.get('related_chapters', [])),
             _json_str(p.get('further_reading', [])),
             _json_str(p.get('tags', [])))
        )
    return len(passages)


def build_fts(cur):
    """Populate FTS5 indexes."""
    cur.execute('INSERT INTO verses_fts(verses_fts) VALUES("rebuild")')
    cur.execute('INSERT INTO people_fts(people_fts) VALUES("rebuild")')


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
def main():
    # Auto-increment version on every build
    bump_db_version()
    
    # Remove existing DB
    if DB_PATH.exists():
        DB_PATH.unlink()

    print("=" * 60)
    print("Phase 0F: Building scripture.db")
    print("=" * 60)

    conn = sqlite3.connect(str(DB_PATH))
    cur = conn.cursor()

    # Enable WAL mode for better concurrent reads
    cur.execute('PRAGMA journal_mode=WAL')
    # Disable FK enforcement during bulk inserts for speed
    cur.execute('PRAGMA foreign_keys=OFF')

    # Create schema
    cur.executescript(SCHEMA)
    print("  Schema created.")

    # Populate
    n = populate_books(cur)
    print(f"  [OK] books: {n} rows")

    ch, sec, sp, cp, vh = populate_chapters(cur)
    print(f"  [OK] chapters: {ch} rows")
    print(f"  [OK] sections: {sec} rows")
    print(f"  [OK] section_panels: {sp} rows")
    print(f"  [OK] chapter_panels: {cp} rows")
    print(f"  [OK] vhl_groups: {vh} rows")

    n = populate_verses(cur)
    print(f"  [OK] verses: {n} rows")

    n = populate_book_intros(cur)
    print(f"  [OK] book_intros: {n} rows")

    n = populate_people(cur)
    print(f"  [OK] people: {n} rows")

    n = populate_scholars(cur)
    print(f"  [OK] scholars: {n} rows")

    n = populate_places(cur)
    print(f"  [OK] places: {n} rows")

    n = populate_map_stories(cur)
    print(f"  [OK] map_stories: {n} rows")

    n = populate_word_studies(cur)
    print(f"  [OK] word_studies: {n} rows")

    n = populate_synoptic(cur)
    print(f"  [OK] synoptic_map: {n} rows")

    n = populate_genealogy_config(cur)
    print(f"  [OK] genealogy_config: {n} rows")

    t, p = populate_cross_refs(cur)
    print(f"  [OK] cross_ref_threads: {t} rows")
    print(f"  [OK] cross_ref_pairs: {p} rows")

    n = populate_timelines(cur)
    print(f"  [OK] timelines: {n} rows")

    n = populate_prophecy_chains(cur)
    print(f"  [OK] prophecy_chains: {n} rows")

    n = populate_concepts(cur)
    print(f"  [OK] concepts: {n} rows")

    n = populate_difficult_passages(cur)
    print(f"  [OK] difficult_passages: {n} rows")

    # Build FTS
    build_fts(cur)
    print(f"  [OK] FTS5 indexes built")

    # Write DB version
    cur.execute("INSERT INTO db_meta (key, value) VALUES ('version', ?)", (DB_VERSION,))
    print(f"  [OK] db_meta: version {DB_VERSION}")

    # Re-enable FK enforcement
    cur.execute('PRAGMA foreign_keys=ON')

    conn.commit()
    conn.close()

    # File size
    size = DB_PATH.stat().st_size
    print(f"\n{'='*60}")
    print(f"scripture.db: {size // 1024 // 1024}MB ({size // 1024}KB)")

    # Verification queries
    conn = sqlite3.connect(str(DB_PATH))
    cur = conn.cursor()

    print(f"\n--- Verification Queries ---")

    # Table row counts
    tables = [
        'books', 'chapters', 'sections', 'section_panels', 'chapter_panels',
        'verses', 'book_intros', 'people', 'scholars', 'places',
        'map_stories', 'word_studies', 'synoptic_map', 'vhl_groups',
        'genealogy_config', 'cross_ref_threads', 'cross_ref_pairs', 'timelines',
    ]
    for t in tables:
        cur.execute(f'SELECT COUNT(*) FROM {t}')
        print(f"  {t:25s}: {cur.fetchone()[0]}")

    # Sample: Genesis 1 sections
    cur.execute("SELECT id, header, verse_start, verse_end FROM sections WHERE chapter_id='genesis_1'")
    rows = cur.fetchall()
    print(f"\n  Genesis 1 sections ({len(rows)}):")
    for r in rows:
        print(f"    {r[0]}: vv.{r[2]}-{r[3]} '{r[1][:50]}'")

    # Sample: panels for genesis_1_s1
    cur.execute("SELECT panel_type FROM section_panels WHERE section_id='genesis_1_s1'")
    types = [r[0] for r in cur.fetchall()]
    print(f"\n  genesis_1_s1 panel types: {types}")

    # FTS test
    cur.execute("""
        SELECT v.book_id, v.chapter_num, v.verse_num, v.text
        FROM verses_fts f
        JOIN verses v ON v.id = f.rowid
        WHERE f.text MATCH 'beginning'
        LIMIT 3
    """)
    results = cur.fetchall()
    print(f"\n  FTS 'beginning' results ({len(results)}):")
    for r in results:
        print(f"    {r[0]} {r[1]}:{r[2]} — {r[3][:60]}...")

    cur.execute("""
        SELECT p.name, p.role
        FROM people_fts f
        JOIN people p ON p.rowid = f.rowid
        WHERE f.name MATCH 'Abraham'
        LIMIT 3
    """)
    results = cur.fetchall()
    print(f"\n  FTS people 'Abraham' ({len(results)}):")
    for r in results:
        print(f"    {r[0]} — {r[1][:40] if r[1] else 'no role'}")

    # Deep-link chapters
    cur.execute("SELECT id, timeline_link_event, map_story_link_id FROM chapters "
                "WHERE timeline_link_event IS NOT NULL OR map_story_link_id IS NOT NULL")
    dl = cur.fetchall()
    print(f"\n  Chapters with deep-links: {len(dl)}")

    # Spine people
    cur.execute("SELECT COUNT(*) FROM people WHERE type='spine'")
    spine_count = cur.fetchone()[0]
    cur.execute("SELECT COUNT(*) FROM people WHERE type='satellite'")
    sat_count = cur.fetchone()[0]
    print(f"  People: {spine_count} spine, {sat_count} satellite")

    conn.close()

    print(f"\n{'='*60}")
    print("Phase 0F complete.")


if __name__ == '__main__':
    os.chdir(ROOT)
    main()
