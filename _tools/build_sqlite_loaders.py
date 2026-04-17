"""
build_sqlite_loaders.py — Data loading functions for scripture.db.

One loader function per content type. Each takes a cursor and loads
data from the content/ directory into the appropriate tables.

This module is imported by build_sqlite.py (the orchestrator).
"""
import os, json, glob, re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
META = ROOT / 'content' / 'meta'
VERSES_DIR = ROOT / 'content' / 'verses'
AUDIT_DIR = ROOT / '_tools' / 'audit'
REFERENCE_MATRIX_PATH = AUDIT_DIR / 'reference_matrix.json'
TRANSLATIONS_DIR = ROOT / 'app' / 'assets' / 'translations'

# Translations config — must match build_sqlite.py
AVAILABLE_TRANSLATIONS = {'kjv', 'asv'}
BUNDLED_TRANSLATIONS = {'kjv', 'asv'}

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
# Refuted claim filtering
# ---------------------------------------------------------------------------

def _load_refuted_claims():
    """Load refuted claims from the accuracy audit reference matrix.

    Returns a dict keyed by (book_dir, chapter_num, section_num_or_None, panel_type)
    containing sets of claim_text prefixes (first 200 chars) to match against.
    """
    if not REFERENCE_MATRIX_PATH.exists():
        return {}

    matrix = json.load(open(REFERENCE_MATRIX_PATH, encoding='utf-8'))
    claims = matrix.get('claims', {})

    refuted = {}
    for claim_id, claim in claims.items():
        if claim.get('status') != 'REFUTED':
            continue
        ch_id = claim.get('chapter_id', '')
        m = re.search(r'(\d+)$', ch_id)
        ch_num = int(m.group(1)) if m else None
        key = (
            claim.get('book_dir'),
            ch_num,
            claim.get('section_num'),  # None for chapter panels
            claim.get('panel_type'),
        )
        text = (claim.get('claim_text') or '')[:200]
        if text:
            refuted.setdefault(key, set()).add(text)

    return refuted


def _extract_note_texts(panel_type, entry):
    """Extract all matchable text representations from a panel entry.

    Returns a list of text strings to match against, since the accuracy
    extractor may capture different fields of the same entry as separate claims.
    """
    texts = []
    if isinstance(entry, dict):
        # Hebrew word studies: {word, transliteration, gloss, paragraph}
        if 'word' in entry:
            w = entry.get('word', '')
            t = entry.get('transliteration', '')
            g = entry.get('gloss', '')
            texts.append(f"{w} ({t}) = {g}")
        if 'paragraph' in entry:
            texts.append(entry['paragraph'][:200])
        # Scholar/commentary notes: {ref, note}
        if 'note' in entry:
            texts.append(entry['note'][:200])
        # Cross-ref: {ref, note} — extractor prefixes with [ref]
        if 'ref' in entry and 'note' in entry:
            texts.append(f"[{entry['ref']}] {entry['note']}"[:200])
        # People entries: description text
        if 'description' in entry:
            texts.append(entry['description'][:200])
    if isinstance(entry, str):
        texts.append(entry[:200])
    return texts


def _is_refuted(entry_texts, refuted_texts):
    """Check if any of the entry's text representations match a refuted claim."""
    for text in entry_texts:
        if not text:
            continue
        for rt in refuted_texts:
            if not rt:
                continue
            if text.startswith(rt) or rt.startswith(text):
                return True
    return False


def _filter_refuted_notes(content, panel_type, refuted_texts):
    """Remove individual notes/entries from a panel that match refuted claims.

    Returns the filtered content (same type as input), or None if the entire
    panel should be removed (e.g., single-value panel like hist.context).
    """
    if not refuted_texts:
        return content

    # List-based panels (heb entries, hebtext entries, ppl entries, etc.)
    if isinstance(content, list):
        filtered = [e for e in content
                    if not _is_refuted(_extract_note_texts(panel_type, e), refuted_texts)]
        return filtered

    if isinstance(content, dict):
        # Scholar commentary: {source, notes: [...]}
        if 'notes' in content and isinstance(content['notes'], list):
            filtered_notes = [e for e in content['notes']
                              if not _is_refuted(_extract_note_texts(panel_type, e), refuted_texts)]
            if not filtered_notes:
                return None  # All notes refuted, remove entire panel
            result = dict(content)
            result['notes'] = filtered_notes
            return result

        # Cross-ref panel: {refs: [...]}
        if 'refs' in content and isinstance(content['refs'], list):
            filtered_refs = [e for e in content['refs']
                             if not _is_refuted(_extract_note_texts(panel_type, e), refuted_texts)]
            if not filtered_refs:
                return None
            result = dict(content)
            result['refs'] = filtered_refs
            return result

        # Hist panel: {context: "..."}
        if 'context' in content:
            text = content['context'][:200]
            if any(text.startswith(rt) or rt.startswith(text) for rt in refuted_texts if text and rt):
                return None
            return content

        # Thread/tx/rec/src panels with mixed structures — check all string values
        for key, val in content.items():
            if isinstance(val, str) and len(val) > 50:
                text = val[:200]
                if any(text.startswith(rt) or rt.startswith(text) for rt in refuted_texts if text and rt):
                    return None

    return content


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

    Skips content/meta/, content/verses/, content/interlinear/, content/archaeology/, content/life_topics/, content/historical_interpretations/ (handled separately).
    """
    chapter_count = 0
    section_count = 0
    sec_panel_count = 0
    ch_panel_count = 0
    vhl_count = 0
    refuted_hidden = 0

    # Load refuted claims for filtering
    refuted_claims = _load_refuted_claims()
    if refuted_claims:
        total_refuted = sum(len(v) for v in refuted_claims.values())
        print(f"  Refuted claims loaded: {total_refuted} (will be hidden from DB)")

    # Load redemptive arc chapter_map for act assignment (#1118)
    ra_path = META / 'redemptive-arc.json'
    ra_chapter_map = {}
    if ra_path.exists():
        ra_data = _load_json(ra_path)
        ra_chapter_map = ra_data.get('chapter_map', {})

    content_dir = ROOT / 'content'
    for book_dir in sorted(content_dir.iterdir()):
        if not book_dir.is_dir() or book_dir.name in ('meta', 'verses', 'interlinear', 'archaeology', 'life_topics', 'historical_interpretations', 'grammar', 'map-styles'):
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
                'map_story_link_id, map_story_link_text, coaching_json, prayer_prompt, '
                'redemptive_act) '
                'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                (chapter_id, book_id, ch_num,
                 data.get('title'), data.get('subtitle'),
                 tl['event_id'] if tl else None,
                 tl['text'] if tl else None,
                 ms['story_id'] if ms else None,
                 ms['text'] if ms else None,
                 coaching_str,
                 data.get('prayer_prompt'),
                 ra_chapter_map.get(chapter_id))
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
                    # Filter refuted claims from this panel
                    refuted_key = (book_id, ch_num, sn, ptype)
                    refuted_texts = refuted_claims.get(refuted_key, set())
                    if refuted_texts:
                        content = _filter_refuted_notes(content, ptype, refuted_texts)
                        if content is None:
                            refuted_hidden += 1
                            continue  # Entire panel refuted, skip it
                    cur.execute(
                        'INSERT INTO section_panels (section_id, panel_type, content_json) '
                        'VALUES (?, ?, ?)',
                        (section_id, ptype, _json_str(content))
                    )
                    sec_panel_count += 1

            # Chapter panels
            for ptype, content in data.get('chapter_panels', {}).items():
                # Filter refuted claims from chapter-level panels (section_num=None)
                refuted_key = (book_id, ch_num, None, ptype)
                refuted_texts = refuted_claims.get(refuted_key, set())
                if refuted_texts:
                    content = _filter_refuted_notes(content, ptype, refuted_texts)
                    if content is None:
                        refuted_hidden += 1
                        continue  # Entire panel refuted, skip it
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

    if refuted_hidden:
        print(f"  Refuted notes hidden: {refuted_hidden} panels stripped or filtered")
    return chapter_count, section_count, sec_panel_count, ch_panel_count, vhl_count


def _insert_verses(cur, translation: str) -> int:
    """Insert all verses for a single translation. Returns row count."""
    trans_dir = VERSES_DIR / translation
    count = 0
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


def populate_verses(cur):
    """Insert only BUNDLED_TRANSLATIONS into the core scripture.db."""
    count = 0
    for translation in sorted(BUNDLED_TRANSLATIONS):
        trans_dir = VERSES_DIR / translation
        if not trans_dir.is_dir():
            print(f"  WARNING: bundled translation '{translation}' not found", file=sys.stderr)
            continue
        count += _insert_verses(cur, translation)
    return count


def build_supplemental_translations() -> list[dict]:
    """Build a separate .db file for each non-bundled translation.

    Each file goes into app/assets/translations/{id}.db and contains:
      - verses table (same schema as core)
      - verses_fts (FTS5 index for search)

    Returns a list of {id, file, size_bytes} for the manifest.
    """
    TRANSLATIONS_DIR.mkdir(parents=True, exist_ok=True)
    supplemental = sorted(AVAILABLE_TRANSLATIONS - BUNDLED_TRANSLATIONS)
    built = []

    for trans_id in supplemental:
        db_path = TRANSLATIONS_DIR / f'{trans_id}.db'
        if db_path.exists():
            db_path.unlink()

        conn = sqlite3.connect(str(db_path))
        cur = conn.cursor()
        cur.execute('PRAGMA journal_mode=WAL')
        cur.executescript("""
            CREATE TABLE verses (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                book_id TEXT NOT NULL,
                chapter_num INTEGER NOT NULL,
                verse_num INTEGER NOT NULL,
                translation TEXT NOT NULL,
                text TEXT NOT NULL
            );
            CREATE INDEX idx_verses ON verses(book_id, chapter_num, verse_num, translation);
            CREATE VIRTUAL TABLE verses_fts USING fts5(text, content=verses, content_rowid=id);
        """)

        count = _insert_verses(cur, trans_id)
        cur.execute('INSERT INTO verses_fts(verses_fts) VALUES("rebuild")')
        conn.commit()
        conn.execute('VACUUM')
        conn.close()

        size = db_path.stat().st_size
        built.append({'id': trans_id, 'file': f'{trans_id}.db', 'size_bytes': size})
        print(f"  [OK] translation {trans_id}.db: {count} verses, {size / 1024 / 1024:.1f}MB")

    return built


def populate_interlinear(cur):
    interlinear_dir = ROOT / 'content' / 'interlinear'
    if not interlinear_dir.is_dir():
        return 0
    
    # Map Strong's H/G numbers to existing word_study IDs
    cur.execute('SELECT id, strongs FROM word_studies WHERE strongs IS NOT NULL')
    strongs_to_ws = {}
    for row in cur.fetchall():
        if row[1]:
            strongs_to_ws[row[1]] = row[0]

    # First pass: collect all unique glosses and morphology codes
    all_glosses = set()
    all_morphology = set()
    all_words = []
    for json_file in sorted(interlinear_dir.glob('*.json')):
        book_id = json_file.stem
        words = _load_json(json_file)
        for w in words:
            gloss = w.get('gloss', '')
            morph = w.get('morphology', '')
            if gloss:
                all_glosses.add(gloss)
            if morph:
                all_morphology.add(morph)
            all_words.append((book_id, w))
    
    # Insert glosses and build lookup
    gloss_to_id = {}
    for gloss in sorted(all_glosses):
        cur.execute('INSERT INTO interlinear_glosses (gloss) VALUES (?)', (gloss,))
        gloss_to_id[gloss] = cur.lastrowid
    
    # Insert morphology codes and build lookup
    morph_to_id = {}
    for morph in sorted(all_morphology):
        cur.execute('INSERT INTO interlinear_morphology (code) VALUES (?)', (morph,))
        morph_to_id[morph] = cur.lastrowid
    
    # Second pass: insert words with gloss_id and morphology_id
    count = 0
    for book_id, w in all_words:
        ws_id = strongs_to_ws.get(w.get('strongs', ''))
        gloss_id = gloss_to_id.get(w.get('gloss', ''))
        morph_id = morph_to_id.get(w.get('morphology', ''))
        cur.execute(
            'INSERT INTO interlinear_words '
            '(book_id, chapter_num, verse_num, word_position, original, '
            'transliteration, strongs, morphology_id, gloss_id, word_study_id) '
            'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            (book_id, w['ch'], w['v'], w['pos'], w['original'],
             w.get('transliteration', ''), w.get('strongs', ''),
             morph_id, gloss_id, ws_id)
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
            'INSERT OR IGNORE INTO book_intros '
            '(book_id, intro_json, era, era_span, purpose, key_verses, christ_in, outline, at_a_glance) '
            'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            (book_id, _json_str(intro),
             intro.get('era'),
             _json_str(intro['era_span']) if 'era_span' in intro else None,
             intro.get('purpose'),
             _json_str(intro['key_verses']) if 'key_verses' in intro else None,
             intro.get('christ_in'),
             _json_str(intro['outline']) if 'outline' in intro else None,
             _json_str(intro['at_a_glance']) if 'at_a_glance' in intro else None)
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
    legacy_count = 0
    for p in people:
        # Explicit `type` in people.json wins (lets us mark allegorical
        # figures per Card #1289). Fall back to the spine/satellite
        # computation otherwise.
        explicit_type = p.get('type')
        ptype = explicit_type if explicit_type else (
            'spine' if p['id'] in spine_ids else 'satellite'
        )
        # spouseOf and spouse_of are both accepted (legacy + recent style).
        spouse = p.get('spouseOf') or p.get('spouse_of')
        geography = p.get('geography')
        geography_json = (
            _json_str(geography) if isinstance(geography, list) else None
        )
        cur.execute(
            'INSERT INTO people (id, name, gender, father, mother, spouse_of, '
            'era, dates, role, type, bio, scripture_role, refs_json, chapter_link, '
            'associated_with, association_type, geography_json) '
            'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            (p['id'], p['name'], p.get('gender'), p.get('father'),
             p.get('mother'), spouse, p.get('era'),
             p.get('dates'), p.get('role'), ptype, p.get('bio'),
             p.get('scriptureRole'),
             _json_str(p.get('refs', [])),
             p.get('chapter'),
             p.get('associated_with'),
             p.get('association_type'),
             geography_json)
        )
        count += 1

        # Legacy refs (#1125)
        for lr in p.get('legacy_refs', []):
            cur.execute(
                'INSERT INTO people_legacy_refs (person_id, ref, note) '
                'VALUES (?, ?, ?)',
                (p['id'], lr['ref'], lr.get('note'))
            )
            legacy_count += 1

    if legacy_count > 0:
        print(f"  [OK] people_legacy_refs: {legacy_count} refs")
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
        refs = p.get('refs')
        refs_json = _json_str(refs) if isinstance(refs, list) else None
        confidence = p.get('confidence')
        if not isinstance(confidence, int):
            confidence = None

        # ── Enrichment layer (#1323 / #1325) ────────────────────────
        # All four enrichment fields are optional. Missing ones stay
        # NULL so the UI can hide empty sections without a check per
        # nested field.
        key_verses = p.get('key_verses')
        key_verses_json = (
            _json_str(key_verses) if isinstance(key_verses, list) else None
        )
        scholar_notes = p.get('scholar_notes')
        scholar_notes_json = (
            _json_str(scholar_notes) if isinstance(scholar_notes, list) else None
        )
        testament_history = p.get('testament_history')
        testament_history_json = (
            _json_str(testament_history)
            if isinstance(testament_history, list) else None
        )

        cur.execute(
            'INSERT INTO places (id, ancient_name, modern_name, latitude, longitude, '
            'type, priority, label_dir, refs_json, confidence, '
            'description, significance, key_verses_json, scholar_notes_json, '
            'testament_history_json) '
            'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            (p['id'], p.get('ancient', ''), p.get('modern'),
             p['lat'], p['lon'], p['type'],
             p.get('priority', 2), p.get('labelDir', 'n'),
             refs_json, confidence,
             p.get('description'), p.get('significance'),
             key_verses_json, scholar_notes_json, testament_history_json)
        )
        count += 1
    return count


def populate_map_stories(cur):
    data = _load_json(META / 'map-stories.json')
    stories = data.get('stories', [])
    count = 0
    for s in stories:
        # terrain_analysis is optional; store only when present and well-formed.
        terrain = s.get('terrain_analysis')
        terrain_json = _json_str(terrain) if isinstance(terrain, dict) else None
        cur.execute(
            'INSERT INTO map_stories (id, era, name, scripture_ref, chapter_link, '
            'summary, places_json, regions_json, paths_json, terrain_analysis_json) '
            'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            (s['id'], s['era'], s['name'], s.get('ref'),
             s.get('chapter'), s.get('summary', ''),
             _json_str(s.get('places', [])),
             _json_str(s.get('regions', [])),
             _json_str(s.get('paths', [])),
             terrain_json)
        )
        count += 1
    return count


def populate_ancient_borders(cur):
    """
    Scaffold loader for epic #1314 / issue #1317.

    Reads `content/meta/ancient-borders.json`, which is keyed by the app's
    8 era IDs (primeval / patriarch / exodus / judges / kingdom / prophets /
    exile / nt) and whose values are GeoJSON FeatureCollections. Any
    non-era top-level keys (e.g. `attribution`) are skipped.

    Until the polygon-authoring Chat session runs, every era's feature
    list is empty — the table still gets populated so the runtime code
    can load by era without a null check.
    """
    path = META / 'ancient-borders.json'
    if not path.exists():
        return 0
    data = _load_json(path)
    valid_eras = {
        'primeval', 'patriarch', 'exodus', 'judges',
        'kingdom', 'prophets', 'exile', 'nt',
    }
    count = 0
    for era, fc in data.items():
        if era not in valid_eras:
            continue
        if not isinstance(fc, dict) or fc.get('type') != 'FeatureCollection':
            continue
        cur.execute(
            'INSERT INTO ancient_borders (era, features_json) VALUES (?, ?)',
            (era, _json_str(fc)),
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
            'INSERT INTO synoptic_map (id, title, category, period, sort_order, passages_json, diff_annotations_json) '
            'VALUES (?, ?, ?, ?, ?, ?, ?)',
            (s['id'], s['title'], s.get('category'), s.get('period'),
             s.get('sort_order', 0),
             _json_str(s.get('passages', [])),
             _json_str(s.get('diff_annotations', [])))
        )
        count += 1
    return count


def _load_all_theme_scores():
    """Load themes panel data from all chapter JSON files.

    Returns dict: chapter_id -> [{label, score}, ...]
    Handles both {label, score} and {name, value} key variants.
    """
    content_dir = ROOT / 'content'
    themes = {}
    for book_dir in sorted(content_dir.iterdir()):
        if not book_dir.is_dir() or book_dir.name in ('meta', 'interlinear', 'archaeology', 'life_topics'):
            continue
        for ch_file in sorted(book_dir.glob('*.json')):
            try:
                data = json.loads(ch_file.read_text(encoding='utf-8'))
            except Exception:
                continue
            if not isinstance(data, dict):
                continue
            theme_panel = data.get('chapter_panels', {}).get('themes')
            if not theme_panel or not isinstance(theme_panel, dict):
                continue
            scores = theme_panel.get('scores', [])
            chapter_id = f"{book_dir.name}_{ch_file.stem}"
            normalized = []
            for s in scores:
                if not isinstance(s, dict):
                    continue
                label = s.get('label') or s.get('name', '')
                score = s.get('score') or s.get('value', 0)
                if label and score:
                    normalized.append({'label': label.lower(), 'score': score})
            if normalized:
                themes[chapter_id] = normalized
    return themes


def _generate_relevant_chapters(topic_tags, all_themes, limit=10):
    """Match topic tags against chapter theme labels, return top chapters by score."""
    scores = {}
    tags_lower = [t.lower() for t in topic_tags]
    for chapter_id, theme_scores in all_themes.items():
        for ts in theme_scores:
            label = ts['label']
            for tag in tags_lower:
                if tag in label or label in tag:
                    scores[chapter_id] = scores.get(chapter_id, 0) + ts['score']
                    break  # avoid double-counting same label for multiple matching tags
    return sorted(scores, key=scores.get, reverse=True)[:limit]


def populate_topics(cur):
    path = META / 'topics.json'
    if not path.exists():
        return 0
    entries = _load_json(path)

    # Load all theme scores for relevant chapter auto-generation
    all_themes = _load_all_theme_scores()

    count = 0
    for t in entries:
        # Auto-generate relevant_chapters if not manually specified
        tags = t.get('tags', [])
        manual_chapters = t.get('relevant_chapters', [])
        if manual_chapters:
            relevant = manual_chapters
        elif tags and all_themes:
            relevant = _generate_relevant_chapters(tags, all_themes)
        else:
            relevant = []

        cur.execute(
            'INSERT INTO topics (id, title, category, description, tags_json, subtopics_json, '
            'related_concept_ids_json, related_thread_ids_json, related_prophecy_ids_json, '
            'relevant_chapters_json) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            (t['id'], t['title'], t['category'], t['description'],
             _json_str(tags),
             _json_str(t.get('subtopics', [])),
             _json_str(t.get('related_concept_ids', [])),
             _json_str(t.get('related_thread_ids', [])),
             _json_str(t.get('related_prophecy_ids', [])),
             _json_str(relevant))
        )
        count += 1

    # Build FTS5 index
    cur.execute("""
        CREATE VIRTUAL TABLE IF NOT EXISTS topics_fts USING fts5(
            title, description, tags,
            content='',
            tokenize='porter unicode61'
        )
    """)
    cur.execute("""
        INSERT INTO topics_fts(rowid, title, description, tags)
        SELECT rowid, title, description,
               REPLACE(REPLACE(tags_json, '[', ''), ']', '')
        FROM topics
    """)
    return count


def populate_debate_topics(cur):
    path = META / 'debate-topics.json'
    if not path.exists():
        return 0
    entries = _load_json(path)
    count = 0
    scholar_links = 0
    for t in entries:
        cur.execute(
            'INSERT INTO debate_topics (id, title, category, book_id, chapters_json, '
            'passage, question, context, positions_json, synthesis, '
            'related_passages_json, tags_json) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            (t['id'], t['title'], t['category'], t['book_id'],
             _json_str(t.get('chapters', [])),
             t.get('passage', ''),
             t.get('question', t['title']),
             t.get('context', ''),
             _json_str(t.get('positions', [])),
             t.get('synthesis', ''),
             _json_str(t.get('related_passages', [])),
             _json_str(t.get('tags', [])))
        )
        # Insert scholar links from position scholar_ids
        for pos in t.get('positions', []):
            for sid in pos.get('scholar_ids', []):
                try:
                    cur.execute(
                        'INSERT OR IGNORE INTO debate_topic_scholars (topic_id, scholar_id) '
                        'VALUES (?, ?)',
                        (t['id'], sid)
                    )
                    scholar_links += 1
                except Exception:
                    pass
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


def populate_eras(cur):
    """Populate the eras table from timelines.json era_config.

    Stores each era as a row with enriched narrative fields (summary, narrative,
    key_themes, key_people, books, geographic_center, redemptive_thread,
    transition_to_next) when available. This enables the PeriodsScreen to query
    eras directly without parsing the genealogy_config blob.
    """
    data = _load_json(META / 'timelines.json')
    era_config = data.get('era_config', {})
    count = 0
    for era_id, era in era_config.items():
        rng = era.get('range', [None, None])
        cur.execute(
            'INSERT OR IGNORE INTO eras '
            '(id, name, pill, hex, range_start, range_end, summary, narrative, '
            'key_themes, key_people, books, chapter_range, geographic_center, '
            'redemptive_thread, transition_to_next) '
            'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            (era_id, era['name'], era.get('pill'), era.get('hex'),
             rng[0] if len(rng) > 0 else None,
             rng[1] if len(rng) > 1 else None,
             era.get('summary'),
             era.get('narrative'),
             _json_str(era['key_themes']) if 'key_themes' in era else None,
             _json_str(era['key_people']) if 'key_people' in era else None,
             _json_str(era['books']) if 'books' in era else None,
             _json_str(era['chapter_range']) if 'chapter_range' in era else None,
             _json_str(era['geographic_center']) if 'geographic_center' in era else None,
             era.get('redemptive_thread'),
             era.get('transition_to_next'))
        )
        count += 1
    return count


def populate_redemptive_acts(cur):
    """Populate the redemptive_acts table from redemptive-arc.json."""
    path = META / 'redemptive-arc.json'
    if not path.exists():
        return 0
    data = _load_json(path)
    acts = data.get('acts', [])
    count = 0
    for i, act in enumerate(acts):
        cur.execute(
            'INSERT OR IGNORE INTO redemptive_acts '
            '(id, act_order, name, tagline, summary, key_verse, '
            'era_ids, book_range, threads, prophecy_chains) '
            'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            (act['id'], i, act['name'], act.get('tagline'),
             act.get('summary'), _json_str(act['key_verse']) if 'key_verse' in act else None,
             _json_str(act['era_ids']) if 'era_ids' in act else None,
             act.get('book_range'),
             _json_str(act['threads']) if 'threads' in act else None,
             _json_str(act['prophecy_chains']) if 'prophecy_chains' in act else None)
        )
        count += 1
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


def populate_lexicon(cur):
    """Populate lexicon_entries from content/meta/lexicon-greek.json and lexicon-hebrew.json."""
    n = 0
    for fname in ['lexicon-greek.json', 'lexicon-hebrew.json']:
        path = META / fname
        if not path.exists():
            print(f"  [SKIP] {fname} not found")
            continue
        data = _load_json(path)
        for entry in data:
            cur.execute(
                'INSERT OR IGNORE INTO lexicon_entries '
                '(strongs, language, lemma, transliteration, pronunciation, pos, '
                'definition_json, etymology, related_strongs_json, source) '
                'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                (entry['strongs'], entry['language'], entry['lemma'],
                 entry['transliteration'], entry.get('pronunciation'),
                 entry.get('pos'), _json_str(entry['definition']),
                 entry.get('etymology'),
                 _json_str(entry.get('related_strongs', [])) if entry.get('related_strongs') else None,
                 entry.get('source', 'thayer' if entry['language'] == 'greek' else 'bdb'))
            )
            n += 1
    return n


def populate_dictionary(cur):
    """Populate dictionary_entries from content/meta/dictionary-easton.json."""
    path = META / 'dictionary-easton.json'
    if not path.exists():
        print("  [SKIP] dictionary-easton.json not found")
        return 0
    entries = _load_json(path)
    for e in entries:
        cross = e.get('cross_links', {})
        cur.execute(
            'INSERT INTO dictionary_entries (id, term, definition, refs_json, related_json, '
            'category, cross_person_id, cross_place_id, cross_word_study_id, cross_concept_id, source) '
            'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            (e['id'], e['term'], e['definition'],
             _json_str(e.get('refs', [])),
             _json_str(e.get('related', [])),
             e.get('category', 'general'),
             cross.get('person_id'),
             cross.get('place_id'),
             cross.get('word_study_id'),
             cross.get('concept_id'),
             'easton')
        )
    return len(entries)


def populate_red_letter(cur):
    """Populate red_letter_verses from content/meta/red-letter.json."""
    path = META / 'red-letter.json'
    if not path.exists():
        print("  [SKIP] red-letter.json not found")
        return 0
    data = _load_json(path)
    n = 0
    for entry in data:
        book = entry['book_id']
        ch = entry['chapter']
        for v in entry['verses']:
            cur.execute(
                'INSERT INTO red_letter_verses (book_id, chapter_num, verse_num) '
                'VALUES (?, ?, ?)',
                (book, ch, v)
            )
            n += 1
    return n


def populate_life_topics(cur):
    """Populate life topic tables from content/life_topics/ JSON files.

    Expected directory structure:
        content/life_topics/
        ├── categories.json       # Array of {id, name, display_order, icon}
        └── topics/
            ├── anxiety.json      # Single topic file
            └── ...

    Gracefully skips if the directory does not exist.
    """
    life_topics_dir = ROOT / 'content' / 'life_topics'
    if not life_topics_dir.is_dir():
        return None  # signal: directory not present

    from datetime import datetime, timezone
    now = datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ')

    cat_count = 0
    topic_count = 0
    verse_count = 0
    scholar_count = 0
    related_count = 0

    # 1. Load categories
    cat_path = life_topics_dir / 'categories.json'
    if cat_path.exists():
        categories = _load_json(cat_path)
        for cat in categories:
            cur.execute(
                'INSERT INTO life_topic_categories (id, name, display_order, icon) '
                'VALUES (?, ?, ?, ?)',
                (cat['id'], cat['name'], cat['display_order'], cat.get('icon'))
            )
            cat_count += 1

    # 2. Load individual topic files
    topics_dir = life_topics_dir / 'topics'
    if topics_dir.is_dir():
        for json_file in sorted(topics_dir.glob('*.json')):
            t = _load_json(json_file)

            cur.execute(
                'INSERT INTO life_topics_official '
                '(id, category_id, title, subtitle, summary, body, display_order, '
                'created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
                (t['id'], t['category_id'], t['title'], t.get('subtitle'),
                 t['summary'], t['body'], t['display_order'], now, now)
            )
            topic_count += 1

            # Verses
            for v in t.get('verses', []):
                cur.execute(
                    'INSERT INTO life_topic_verses '
                    '(topic_id, verse_ref, verse_order, annotation, is_primary) '
                    'VALUES (?, ?, ?, ?, ?)',
                    (t['id'], v['verse_ref'], v['verse_order'],
                     v.get('annotation'), 1 if v.get('is_primary') else 0)
                )
                verse_count += 1

            # Scholars
            for s in t.get('scholars', []):
                cur.execute(
                    'INSERT INTO life_topic_scholars '
                    '(topic_id, scholar_id, quote, source, display_order) '
                    'VALUES (?, ?, ?, ?, ?)',
                    (t['id'], s['scholar_id'], s['quote'],
                     s.get('source'), s['display_order'])
                )
                scholar_count += 1

            # Related topics
            for rel_id in t.get('related', []):
                cur.execute(
                    'INSERT OR IGNORE INTO life_topic_related (topic_id, related_id) '
                    'VALUES (?, ?)',
                    (t['id'], rel_id)
                )
                related_count += 1

    # 3. Rebuild FTS index
    cur.execute("INSERT INTO life_topics_fts(life_topics_fts) VALUES('rebuild')")

    return cat_count, topic_count, verse_count, scholar_count, related_count


def populate_hermeneutic_lenses(cur):
    """Populate hermeneutic lens tables from content/hermeneutic_lenses/ JSON files.

    Expected directory structure:
        content/hermeneutic_lenses/
        ├── lenses.json            # Array of {id, name, description, icon, display_order}
        └── chapters/
            └── <chapter_id>.json  # {lenses: [{lens_id, guidance, panel_filter, panel_order}]}

    Gracefully skips if the directory does not exist.
    """
    lenses_dir = ROOT / 'content' / 'hermeneutic_lenses'
    if not lenses_dir.is_dir():
        return None  # signal: directory not present

    lens_count = 0
    content_count = 0

    # 1. Load lens definitions
    lenses_path = lenses_dir / 'lenses.json'
    if lenses_path.exists():
        lenses = _load_json(lenses_path)
        for lens in lenses:
            assert 'id' in lens and 'name' in lens and 'description' in lens, \
                f"Lens missing required fields: {lens}"
            cur.execute(
                'INSERT INTO hermeneutic_lenses (id, name, description, icon, display_order) '
                'VALUES (?, ?, ?, ?, ?)',
                (lens['id'], lens['name'], lens['description'],
                 lens.get('icon'), lens.get('display_order', 0))
            )
            lens_count += 1

    # 2. Load chapter lens content
    chapters_dir = lenses_dir / 'chapters'
    if chapters_dir.is_dir():
        # Build set of valid lens IDs for validation
        valid_lenses = set()
        cur.execute('SELECT id FROM hermeneutic_lenses')
        for row in cur.fetchall():
            valid_lenses.add(row[0])

        for json_file in sorted(chapters_dir.glob('*.json')):
            data = _load_json(json_file)
            chapter_id = json_file.stem
            for entry in data.get('lenses', []):
                lens_id = entry['lens_id']
                assert lens_id in valid_lenses, \
                    f"Unknown lens_id '{lens_id}' in {json_file.name}"
                assert 'guidance' in entry, \
                    f"Missing guidance in {json_file.name} for lens {lens_id}"
                cur.execute(
                    'INSERT INTO chapter_lens_content '
                    '(chapter_id, lens_id, guidance, panel_filter_json, panel_order_json) '
                    'VALUES (?, ?, ?, ?, ?)',
                    (chapter_id, lens_id, entry['guidance'],
                     _json_str(entry['panel_filter']) if 'panel_filter' in entry else None,
                     _json_str(entry['panel_order']) if 'panel_order' in entry else None)
                )
                content_count += 1

    return lens_count, content_count


def populate_archaeology(cur):
    """Populate archaeological discovery tables from content/archaeology/discoveries.json.

    Expected structure:
        content/archaeology/
        └── discoveries.json   # Array of discovery objects

    Gracefully skips if the file does not exist.
    """
    arch_dir = ROOT / 'content' / 'archaeology'
    path = arch_dir / 'discoveries.json'
    if not path.exists():
        return None  # signal: file not present

    discoveries = _load_json(path)
    disc_count = 0
    link_count = 0
    img_count = 0

    for d in discoveries:
        images_list = d.get('images', [])
        images_json = json.dumps(images_list) if images_list else None
        cur.execute(
            'INSERT INTO archaeological_discoveries '
            '(id, name, category, date_range, location, significance, '
            'description, image_url, images_json, source, display_order) '
            'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            (d['id'], d['name'], d['category'], d.get('date_range'),
             d.get('location'), d['significance'], d['description'],
             d.get('image_url'), images_json, d.get('source'),
             d.get('display_order', 0))
        )
        disc_count += 1

        # Verse links
        for v in d.get('verse_links', []):
            cur.execute(
                'INSERT INTO archaeology_verse_links '
                '(discovery_id, verse_ref, relevance) VALUES (?, ?, ?)',
                (d['id'], v['verse_ref'], v.get('relevance'))
            )
            link_count += 1

        # Images
        for idx, img in enumerate(d.get('images', [])):
            cur.execute(
                'INSERT INTO archaeology_images '
                '(discovery_id, url, caption, credit, display_order) '
                'VALUES (?, ?, ?, ?, ?)',
                (d['id'], img['url'], img.get('caption'),
                 img.get('credit'), idx)
            )
            img_count += 1

    # Rebuild FTS index
    cur.execute("INSERT INTO archaeology_fts(archaeology_fts) VALUES('rebuild')")

    return disc_count, link_count, img_count


def populate_historical_interpretations(cur):
    """Populate historical interpretations tables from content/historical_interpretations/.

    Expected directory structure:
        content/historical_interpretations/
        ├── eras.json              # Array of {id, name, date_range, description, display_order}
        └── interpretations/
            ├── john_3_16.json     # Interpretations keyed by verse ref
            └── ...

    Gracefully skips if the directory does not exist.
    """
    interp_dir = ROOT / 'content' / 'historical_interpretations'
    if not interp_dir.is_dir():
        return None  # signal: directory not present

    era_count = 0
    interp_count = 0

    # 1. Load eras
    eras_path = interp_dir / 'eras.json'
    if eras_path.exists():
        eras_data = _load_json(eras_path)
        for era in eras_data:
            cur.execute(
                'INSERT INTO interpretation_eras '
                '(id, name, date_range, description, display_order) '
                'VALUES (?, ?, ?, ?, ?)',
                (era['id'], era['name'], era['date_range'],
                 era['description'], era['display_order'])
            )
            era_count += 1

    # 2. Load individual interpretation files
    interps_dir = interp_dir / 'interpretations'
    if interps_dir.is_dir():
        for json_file in sorted(interps_dir.glob('*.json')):
            entries = _load_json(json_file)
            if isinstance(entries, dict):
                entries = [entries]
            for entry in entries:
                cur.execute(
                    'INSERT INTO historical_interpretations '
                    '(id, verse_ref, era, era_label, author, author_dates, '
                    'source_title, source_date, interpretation, context, '
                    'display_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                    (entry['id'], entry['verse_ref'], entry['era'],
                     entry['era_label'], entry['author'],
                     entry.get('author_dates'), entry['source_title'],
                     entry.get('source_date'), entry['interpretation'],
                     entry.get('context'), entry.get('display_order', 0))
                )
                interp_count += 1

    return era_count, interp_count


def populate_grammar_articles(cur):
    """Populate grammar_articles from content/grammar/articles.json.

    Gracefully skips if the file does not exist yet (content will be
    authored incrementally).
    """
    grammar_dir = ROOT / 'content' / 'grammar'
    path = grammar_dir / 'articles.json'
    if not path.exists():
        print("  [SKIP] grammar/articles.json not found")
        return 0
    data = _load_json(path)
    if not isinstance(data, list):
        print("  [WARN] grammar/articles.json is not a list, skipping")
        return 0
    n = 0
    for entry in data:
        # Validate required fields
        required = ('id', 'title', 'language', 'category', 'summary', 'body')
        if not all(entry.get(k) for k in required):
            print(f"  [WARN] grammar article missing required fields: {entry.get('id', '?')}")
            continue
        cur.execute(
            'INSERT OR IGNORE INTO grammar_articles '
            '(id, title, language, category, summary, body, '
            'examples_json, related_articles_json, display_order) '
            'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            (entry['id'], entry['title'], entry['language'],
             entry['category'], entry['summary'], entry['body'],
             _json_str(entry['examples']) if entry.get('examples') else None,
             _json_str(entry['related_articles']) if entry.get('related_articles') else None,
             entry.get('display_order', 0))
        )
        n += 1
    return n


def populate_content_library(cur):
    """Extract content library entries from chapter JSONs.

    Walks all chapter JSONs and extracts entries for 5 categories:
    - manuscripts: tx.stories (chapter-level)
    - discourse: chapter_panels.discourse (chapter-level)
    - echoes: cross.echoes (section-level)
    - ane: hist.ane (section-level)
    - chiasms: lit.chiasm (chapter-level)
    """
    # Build book lookup for name and testament
    cur.execute('SELECT id, name, testament, book_order FROM books')
    book_info = {}
    for row in cur.fetchall():
        book_info[row[0]] = {'name': row[1], 'testament': row[2], 'order': row[3]}

    count = 0
    content_dir = ROOT / 'content'
    for book_dir in sorted(content_dir.iterdir()):
        if not book_dir.is_dir() or book_dir.name in ('meta', 'verses', 'interlinear', 'archaeology', 'life_topics', 'historical_interpretations', 'grammar', 'map-styles'):
            continue
        book_id = book_dir.name
        info = book_info.get(book_id)
        if not info:
            continue
        book_name = info['name']
        testament = info['testament']
        book_order = info['order']

        for json_file in sorted(book_dir.glob('*.json')):
            data = _load_json(json_file)
            ch_num = data['chapter_num']
            sort_order = book_order * 1000 + ch_num
            cp = data.get('chapter_panels', {})

            # --- Discourse ---
            disc = cp.get('discourse')
            if disc and isinstance(disc, dict):
                thesis = disc.get('thesis', '')
                nodes = disc.get('nodes', [])
                title = f"{book_name} {ch_num} — Argument Flow"
                preview = thesis[:200] if thesis else (nodes[0]['text'][:200] if nodes else '')
                cur.execute(
                    'INSERT INTO content_library '
                    '(category, title, preview, book_id, book_name, chapter_num, '
                    'section_num, panel_type, tab_key, testament, sort_order) '
                    'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                    ('discourse', title, preview, book_id, book_name, ch_num,
                     None, 'discourse', None, testament, sort_order)
                )
                count += 1

            # --- Manuscript Stories ---
            tx = cp.get('tx')
            if tx and isinstance(tx, dict):
                for story in tx.get('stories', []):
                    title = story.get('title', 'Untitled')
                    summary = story.get('summary', '')
                    cur.execute(
                        'INSERT INTO content_library '
                        '(category, title, preview, book_id, book_name, chapter_num, '
                        'section_num, panel_type, tab_key, testament, sort_order) '
                        'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                        ('manuscripts', title, summary[:200], book_id, book_name, ch_num,
                         None, 'tx', 'stories', testament, sort_order)
                    )
                    count += 1

            # --- Chiasms ---
            lit = cp.get('lit')
            if lit and isinstance(lit, dict) and lit.get('chiasm'):
                chiasm = lit['chiasm']
                title = chiasm.get('title', f'{book_name} {ch_num} Chiasm')
                pairs = chiasm.get('pairs', [])
                center_obj = chiasm.get('center', {})
                center_text = center_obj.get('text', '') if isinstance(center_obj, dict) else str(center_obj)
                if pairs:
                    preview = pairs[0].get('label', '') + ' … ' + center_text
                else:
                    preview = center_text or ''
                cur.execute(
                    'INSERT INTO content_library '
                    '(category, title, preview, book_id, book_name, chapter_num, '
                    'section_num, panel_type, tab_key, testament, sort_order) '
                    'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                    ('chiasms', title, preview[:200], book_id, book_name, ch_num,
                     None, 'lit', 'chiasm', testament, sort_order)
                )
                count += 1

            # --- Section-level panels ---
            for sec in data.get('sections', []):
                sn = sec['section_num']
                panels = sec.get('panels', {})

                # Echoes
                cross = panels.get('cross')
                if cross and isinstance(cross, dict):
                    for echo in cross.get('echoes', []):
                        src = echo.get('source_ref', '')
                        tgt = echo.get('target_ref', '')
                        title = f"{src} → {tgt}" if src and tgt else echo.get('title', 'Echo')
                        preview = echo.get('connection', '')[:200]
                        cur.execute(
                            'INSERT INTO content_library '
                            '(category, title, preview, book_id, book_name, chapter_num, '
                            'section_num, panel_type, tab_key, testament, sort_order) '
                            'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                            ('echoes', title, preview, book_id, book_name, ch_num,
                             sn, 'cross', 'echoes', testament, sort_order)
                        )
                        count += 1

                # ANE Parallels
                hist = panels.get('hist')
                if hist and isinstance(hist, dict):
                    for ane in hist.get('ane', []):
                        title = ane.get('parallel', ane.get('title', 'ANE Parallel'))
                        preview = ane.get('similarity', '')[:200]
                        cur.execute(
                            'INSERT INTO content_library '
                            '(category, title, preview, book_id, book_name, chapter_num, '
                            'section_num, panel_type, tab_key, testament, sort_order) '
                            'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                            ('ane', title, preview, book_id, book_name, ch_num,
                             sn, 'hist', 'ane', testament, sort_order)
                        )
                        count += 1

    return count


def populate_content_images(cur):
    """Populate content_images table by scanning content meta files for images[].

    Follows the same pattern as archaeology — entries in content JSON files
    can optionally include an images[] array. This function scans all content
    types listed below and inserts any images found.

    Archaeology keeps its own archaeology_images table (no migration needed).

    Part of Epic #1071 (#1085).
    """
    CONTENT_SOURCES = [
        # (content_type, file_path, entries_extractor, id_field)
        ('people', META / 'people.json', lambda d: d.get('people', []), 'id'),
        ('timeline', META / 'timelines.json', lambda d: d.get('events', []) if isinstance(d, dict) else d, 'id'),
        ('map_story', META / 'map-stories.json', lambda d: d.get('stories', []) if isinstance(d, dict) else d, 'id'),
        ('topic', META / 'topics.json', lambda d: d if isinstance(d, list) else [], 'id'),
        ('prophecy', META / 'prophecy-chains.json', lambda d: d if isinstance(d, list) else [], 'id'),
        ('thread', META / 'cross-refs.json', lambda d: d.get('threads', []) if isinstance(d, dict) else d, 'id'),
        ('harmony', META / 'synoptic.json', lambda d: d if isinstance(d, list) else [], 'id'),
        ('word_study', META / 'word-studies.json', lambda d: d if isinstance(d, list) else [], 'id'),
        ('scholar', META / 'scholar-bios.json', lambda d: list(d.values()) if isinstance(d, dict) else d, 'key'),
        ('debate', META / 'debate-topics.json', lambda d: d if isinstance(d, list) else [], 'id'),
        ('difficult', META / 'difficult-passages.json', lambda d: d if isinstance(d, list) else [], 'id'),
        ('grammar', ROOT / 'content' / 'grammar' / 'articles.json', lambda d: d if isinstance(d, list) else [], 'id'),
        ('time_travel', ROOT / 'content' / 'historical_interpretations' / 'eras.json', lambda d: d if isinstance(d, list) else [], 'id'),
        ('book', META / 'book-intros.json', lambda d: d if isinstance(d, list) else [], 'book'),
    ]

    count = 0

    for content_type, path, extractor, id_field in CONTENT_SOURCES:
        if not path.exists():
            continue
        try:
            data = _load_json(path)
        except Exception:
            continue

        entries = extractor(data)
        for entry in entries:
            if not isinstance(entry, dict):
                continue
            content_id = entry.get(id_field)
            if not content_id:
                continue
            images = entry.get('images')
            if not images or not isinstance(images, list):
                continue
            for idx, img in enumerate(images):
                if not isinstance(img, dict) or not img.get('url'):
                    continue
                cur.execute(
                    'INSERT INTO content_images '
                    '(content_type, content_id, url, caption, credit, display_order) '
                    'VALUES (?, ?, ?, ?, ?, ?)',
                    (content_type, content_id, img['url'],
                     img.get('caption'), img.get('credit'), idx)
                )
                count += 1

    # Life topics: scan individual topic JSON files
    topics_dir = ROOT / 'content' / 'life_topics' / 'topics'
    if topics_dir.exists():
        for topic_file in sorted(topics_dir.glob('*.json')):
            try:
                topic = _load_json(topic_file)
            except Exception:
                continue
            if not isinstance(topic, dict):
                continue
            topic_id = topic.get('id')
            if not topic_id:
                continue
            images = topic.get('images')
            if not images or not isinstance(images, list):
                continue
            for idx, img in enumerate(images):
                if not isinstance(img, dict) or not img.get('url'):
                    continue
                cur.execute(
                    'INSERT INTO content_images '
                    '(content_type, content_id, url, caption, credit, display_order) '
                    'VALUES (?, ?, ?, ?, ?, ?)',
                    ('life_topic', topic_id, img['url'],
                     img.get('caption'), img.get('credit'), idx)
                )
                count += 1

    return count


def build_fts(cur):
    """Populate FTS5 indexes."""
    cur.execute('INSERT INTO verses_fts(verses_fts) VALUES("rebuild")')
    cur.execute('INSERT INTO people_fts(people_fts) VALUES("rebuild")')
    cur.execute('INSERT INTO dictionary_fts(dictionary_fts) VALUES("rebuild")')


def populate_journeys(cur):
    """Load all journey JSON files into journeys, journey_stops, journey_tags tables."""
    journeys_dir = ROOT / 'content' / 'meta' / 'journeys'
    if not journeys_dir.exists():
        return 0, 0, 0

    count_journeys = 0
    count_stops = 0
    count_tags = 0

    for journey_type in ['thematic', 'concept', 'person']:
        type_dir = journeys_dir / journey_type
        if not type_dir.exists():
            continue

        for json_file in sorted(type_dir.glob('*.json')):
            data = _load_json(json_file)

            cur.execute('''
                INSERT INTO journeys
                (id, journey_type, title, subtitle, description, lens_id, depth,
                 sort_order, person_id, concept_id, era, tags, hero_image_url)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                data['id'],
                data['journey_type'],
                data['title'],
                data.get('subtitle'),
                data['description'],
                data.get('lens_id'),
                data.get('depth'),
                data.get('sort_order', 0),
                data.get('person_id'),
                data.get('concept_id'),
                data.get('era'),
                json.dumps(data.get('tags', [])) if data.get('tags') else None,
                data.get('hero_image_url'),
            ))
            count_journeys += 1

            for stop in data.get('stops', []):
                cur.execute('''
                    INSERT INTO journey_stops
                    (journey_id, stop_order, stop_type, label, ref, book_id,
                     chapter_num, verse_start, verse_end, development, what_changes,
                     linked_journey_id, linked_journey_intro, bridge_to_next)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', (
                    data['id'],
                    stop['stop_order'],
                    stop['stop_type'],
                    stop.get('label'),
                    stop.get('ref'),
                    stop.get('book_id'),
                    stop.get('chapter_num'),
                    stop.get('verse_start'),
                    stop.get('verse_end'),
                    stop.get('development'),
                    stop.get('what_changes'),
                    stop.get('linked_journey_id'),
                    stop.get('linked_journey_intro'),
                    stop.get('bridge_to_next'),
                ))
                count_stops += 1

            for tag in data.get('tags', []):
                if isinstance(tag, dict) and 'type' in tag and 'id' in tag:
                    cur.execute('''
                        INSERT OR IGNORE INTO journey_tags
                        (journey_id, tag_type, tag_id)
                        VALUES (?, ?, ?)
                    ''', (data['id'], tag['type'], tag['id']))
                    count_tags += 1

    return count_journeys, count_stops, count_tags


# ---------------------------------------------------------------------------
# Difficulty scoring
# ---------------------------------------------------------------------------

# Genre base weights (higher = harder to interpret)
_GENRE_WEIGHT = {
    'apocalyptic': 2.0,
    'prophecy': 1.0,
    'law': 1.0,
    'wisdom': 0.5,
    'lament': 0.5,
    'poetry': 0.3,
}


def compute_difficulty(cur):
    """Compute 1-5 difficulty rating for each chapter.

    Produces a continuous raw score from genre weight, structural complexity,
    scholarly density, difficult passage overlap, and literary devices, then
    assigns 1-5 via percentile bucketing for a natural distribution.
    """
    # Build genre lookup
    genre_by_book = {}
    for row in cur.execute('SELECT id, genre FROM books').fetchall():
        genre_by_book[row[0]] = row[1]

    # Difficult passage chapters: (book_id, chapter_num) -> severity weight
    diff_severity = {}
    severity_score = {'major': 2.0, 'moderate': 1.0, 'minor': 0.5}
    for row in cur.execute(
            'SELECT related_chapters_json, severity FROM difficult_passages').fetchall():
        try:
            chapters = json.loads(row[0]) if row[0] else []
            sev = severity_score.get(row[1], 0.5)
            for ch in chapters:
                key = (ch.get('book_dir', ''), ch.get('chapter_num', 0))
                diff_severity[key] = max(diff_severity.get(key, 0), sev)
        except (json.JSONDecodeError, TypeError):
            pass

    # Content library chapters with chiasms or discourse
    literary_chapters = set()
    for row in cur.execute(
            "SELECT book_id, chapter_num FROM content_library "
            "WHERE category IN ('chiasms', 'discourse')").fetchall():
        literary_chapters.add((row[0], row[1]))

    # Pass 1: compute raw scores
    scores = []  # [(chapter_id, raw_score)]
    for row in cur.execute(
            'SELECT c.id, c.book_id, c.chapter_num FROM chapters c').fetchall():
        ch_id, book_id, ch_num = row
        genre = genre_by_book.get(book_id, '')
        score = 0.0

        # 1. Genre weight (0-2)
        score += _GENRE_WEIGHT.get(genre, 0)

        # 2. Section count — continuous (median ~2, max ~7)
        sec_count = cur.execute(
            'SELECT COUNT(*) FROM sections WHERE chapter_id=?', (ch_id,)
        ).fetchone()[0]
        score += min(sec_count / 3.0, 2.0)

        # 3. Scholar panel density — continuous (median ~3.5, max ~8)
        panel_count = cur.execute(
            'SELECT COUNT(DISTINCT sp.panel_type) FROM section_panels sp '
            'JOIN sections s ON s.id = sp.section_id '
            'WHERE s.chapter_id=?', (ch_id,)
        ).fetchone()[0]
        avg_panels = panel_count / max(sec_count, 1)
        score += min(avg_panels / 4.0, 2.0)

        # 4. Difficult passages (0-2)
        key = (book_id, ch_num)
        score += diff_severity.get(key, 0)

        # 5. Literary complexity: chiasm/discourse (0-0.5)
        if key in literary_chapters:
            score += 0.5

        scores.append((ch_id, score))

    # Pass 2: percentile-based bucketing
    sorted_scores = sorted(s[1] for s in scores)
    n = len(sorted_scores)

    def percentile(p):
        idx = int(n * p / 100)
        return sorted_scores[min(idx, n - 1)]

    # Target distribution: ~30% 1, ~30% 2, ~22% 3, ~12% 4, ~6% 5
    p30 = percentile(30)
    p60 = percentile(60)
    p82 = percentile(82)
    p94 = percentile(94)

    updated = 0
    for ch_id, score in scores:
        if score <= p30:
            difficulty = 1
        elif score <= p60:
            difficulty = 2
        elif score <= p82:
            difficulty = 3
        elif score <= p94:
            difficulty = 4
        else:
            difficulty = 5

        cur.execute('UPDATE chapters SET difficulty=? WHERE id=?',
                    (difficulty, ch_id))
        updated += 1

    return updated


# ---------------------------------------------------------------------------
# Amicus — Vector embeddings loader (Card #1448)
# ---------------------------------------------------------------------------

def populate_embeddings(conn):
    """Merge embeddings.db into scripture.db.

    No-op with a warning in three cases (all safe for CI/builds without
    AI-partner tooling set up):
      - embeddings.db does not exist (run build_embeddings.py first)
      - sqlite-vec Python package not installed
      - the build's sqlite3 can't load extensions

    On success, creates the `embeddings` vec0 virtual table, copies every
    row from the source DB into (embeddings, chunk_text, chunk_metadata)
    in matching order so rowid ↔ chunk_id stays consistent.

    Returns the number of chunks populated (0 on skip).
    """
    import sqlite3

    embeddings_db = ROOT / 'embeddings.db'
    if not embeddings_db.exists():
        print('  [WARN] embeddings.db not found — skipping embeddings table')
        print('         Run: python _tools/build_embeddings.py')
        return 0

    import sys as _sys
    _sys.path.insert(0, str(ROOT / '_tools'))
    from sqlite_vec_loader import try_load

    loaded, msg = try_load(conn)
    if not loaded:
        print(f'  [WARN] sqlite-vec unavailable ({msg}) — skipping embeddings table')
        return 0

    conn.execute(
        'CREATE VIRTUAL TABLE IF NOT EXISTS embeddings USING vec0('
        'embedding FLOAT[1536])'
    )

    src = sqlite3.connect(f'file:{embeddings_db}?mode=ro', uri=True)
    try:
        rows = src.execute(
            'SELECT chunk_id, source_type, source_id, text, metadata_json, '
            'embedding FROM embedding_chunks ORDER BY chunk_id'
        ).fetchall()
    finally:
        src.close()

    cur = conn.cursor()
    inserted = 0
    for chunk_id, src_type, src_id, text, meta_json, emb_blob in rows:
        meta = json.loads(meta_json) if meta_json else {}
        cur.execute('INSERT INTO embeddings(embedding) VALUES (?)', (emb_blob,))
        cur.execute('INSERT INTO chunk_text(chunk_id, text) VALUES (?, ?)',
                    (chunk_id, text))
        cur.execute(
            'INSERT INTO chunk_metadata'
            '(chunk_id, source_type, source_id, scholar_id, tradition,'
            ' book_id, chapter_num, verse_start, verse_end, panel_type)'
            ' VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            (chunk_id, src_type, src_id,
             meta.get('scholar_id'), meta.get('tradition'),
             meta.get('book_id'), meta.get('chapter_num'),
             meta.get('verse_start'), meta.get('verse_end'),
             meta.get('panel_type')),
        )
        inserted += 1

    conn.commit()
    return inserted
# Amicus — Pre-cached FAB chip pool loader (Card #1461)
# ---------------------------------------------------------------------------

def populate_precached_prompts(conn):
    """Merge prompts.db (from build_prompts.py) into scripture.db.

    No-op with warning when prompts.db is absent (local dev / CI without
    the Anthropic key set). Leaves the empty precached_prompts table in
    place so app code can query safely.

    Returns the number of rows populated (0 on skip).
    """
    import sqlite3
    prompts_db = ROOT / 'prompts.db'
    if not prompts_db.exists():
        print('  [WARN] prompts.db not found — skipping precached prompts')
        print('         Run: python _tools/build_prompts.py')
        return 0

    src = sqlite3.connect(f'file:{prompts_db}?mode=ro', uri=True)
    try:
        rows = src.execute(
            'SELECT entity_type, entity_id, profile_variant, chips_json, generated_at '
            'FROM precached_prompts ORDER BY entity_type, entity_id, profile_variant'
        ).fetchall()
    finally:
        src.close()

    cur = conn.cursor()
    for entity_type, entity_id, variant, chips_json, generated_at in rows:
        cur.execute(
            'INSERT INTO precached_prompts'
            '(entity_type, entity_id, profile_variant, chips_json, generated_at) '
            'VALUES (?, ?, ?, ?, ?)',
            (entity_type, entity_id, variant, chips_json, generated_at),
        )
    conn.commit()
    return len(rows)
