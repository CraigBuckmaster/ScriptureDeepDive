"""
build_sqlite_schema.py — All CREATE TABLE, CREATE INDEX, CREATE TRIGGER DDL
for scripture.db.

This module is imported by build_sqlite.py (the orchestrator). It contains a
single public function: create_schema(conn).
"""


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
  coaching_json TEXT,
  difficulty INTEGER,
  prayer_prompt TEXT,
  related_life_topics TEXT,
  redemptive_act TEXT
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

CREATE INDEX idx_sections_chapter ON sections(chapter_id);
CREATE INDEX idx_section_panels_section ON section_panels(section_id);
CREATE INDEX idx_section_panels_type ON section_panels(section_id, panel_type);
CREATE INDEX idx_chapter_panels_chapter ON chapter_panels(chapter_id);
CREATE INDEX idx_chapter_panels_type ON chapter_panels(chapter_id, panel_type);

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
  intro_json TEXT NOT NULL,
  era TEXT,
  era_span TEXT,
  purpose TEXT,
  key_verses TEXT,
  christ_in TEXT,
  outline TEXT,
  at_a_glance TEXT
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
  chapter_link TEXT,
  -- Non-genealogical relationship to anchor disconnected figures (#1288).
  -- association_type ∈ {disciple, contemporary, adversary, servant}.
  associated_with TEXT,
  association_type TEXT,
  -- Chronological geographic arc — {place_id, era, event, order} objects.
  -- Feeds the person-arc layer on the map (#1324).
  geography_json TEXT
);

CREATE TABLE people_legacy_refs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  person_id TEXT NOT NULL REFERENCES people(id),
  ref TEXT NOT NULL,
  note TEXT
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
  label_dir TEXT DEFAULT 'n',
  refs_json TEXT,               -- JSON array of verse-ref strings (Card #1271)
  confidence INTEGER,           -- 1–1000 identification confidence (Card #1271)
  -- Enrichment layer (#1323)
  description TEXT,             -- 50-100 words of geographic + theological context
  significance TEXT,            -- 1-sentence hook for the card header
  key_verses_json TEXT,         -- JSON array of verse-ref strings
  scholar_notes_json TEXT,      -- JSON array of {scholar_id, tradition, note, ref}
  -- Cross-testament history (#1325)
  testament_history_json TEXT   -- JSON array of {ref, testament: 'OT'|'NT', event, era}
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
  paths_json TEXT,
  -- "Why this geography matters" — headline + 150-250 word body with
  -- military / theological flags and a source_scholars array (#1327).
  terrain_analysis_json TEXT
);

-- Ancient political borders per era (Patriarchal Canaan, Divided Kingdom,
-- Roman provinces, etc.). One row per era; features_json is a GeoJSON
-- FeatureCollection the app loads into a ShapeSource. Scaffold for #1317;
-- real polygons land in a follow-up Chat session.
CREATE TABLE ancient_borders (
  era TEXT PRIMARY KEY,
  features_json TEXT NOT NULL
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
  period TEXT,
  sort_order INTEGER DEFAULT 0,
  passages_json TEXT NOT NULL,
  diff_annotations_json TEXT
);

CREATE INDEX idx_synoptic_period ON synoptic_map(period, sort_order);

CREATE TABLE topics (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  tags_json TEXT NOT NULL,
  subtopics_json TEXT NOT NULL,
  related_concept_ids_json TEXT,
  related_thread_ids_json TEXT,
  related_prophecy_ids_json TEXT,
  relevant_chapters_json TEXT
);

CREATE INDEX idx_topics_category ON topics(category);

CREATE TABLE debate_topics (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  book_id TEXT NOT NULL,
  chapters_json TEXT NOT NULL,
  passage TEXT,
  question TEXT NOT NULL,
  context TEXT,
  positions_json TEXT NOT NULL,
  synthesis TEXT,
  related_passages_json TEXT DEFAULT '[]',
  tags_json TEXT DEFAULT '[]'
);

CREATE INDEX idx_debate_topics_book ON debate_topics(book_id);
CREATE INDEX idx_debate_topics_category ON debate_topics(category);

CREATE TABLE debate_topic_scholars (
  topic_id TEXT NOT NULL REFERENCES debate_topics(id),
  scholar_id TEXT NOT NULL,
  PRIMARY KEY (topic_id, scholar_id)
);

CREATE TABLE vhl_groups (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  chapter_id TEXT NOT NULL REFERENCES chapters(id),
  group_name TEXT NOT NULL,
  css_class TEXT NOT NULL,
  words_json TEXT NOT NULL,
  btn_types_json TEXT NOT NULL
);
CREATE INDEX idx_vhl_groups_chapter ON vhl_groups(chapter_id);

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

CREATE TABLE eras (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  pill TEXT,
  hex TEXT,
  range_start INTEGER,
  range_end INTEGER,
  summary TEXT,
  narrative TEXT,
  key_themes TEXT,
  key_people TEXT,
  books TEXT,
  chapter_range TEXT,
  geographic_center TEXT,
  redemptive_thread TEXT,
  transition_to_next TEXT
);

CREATE TABLE redemptive_acts (
  id TEXT PRIMARY KEY,
  act_order INTEGER NOT NULL,
  name TEXT NOT NULL,
  tagline TEXT,
  summary TEXT,
  key_verse TEXT,
  era_ids TEXT,
  book_range TEXT,
  threads TEXT,
  prophecy_chains TEXT
);

-- Database version metadata
CREATE TABLE db_meta (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

-- ══════════════════════════════════════════════════════════════
-- FEATURE TABLES (prophecy chains, difficult passages)
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

CREATE TABLE interlinear_glosses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  gloss TEXT NOT NULL UNIQUE
);

CREATE TABLE interlinear_morphology (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT NOT NULL UNIQUE
);

CREATE TABLE interlinear_words (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  book_id TEXT NOT NULL,
  chapter_num INTEGER NOT NULL,
  verse_num INTEGER NOT NULL,
  word_position INTEGER NOT NULL,
  original TEXT NOT NULL,
  transliteration TEXT NOT NULL,
  strongs TEXT,
  morphology_id INTEGER REFERENCES interlinear_morphology(id),
  gloss_id INTEGER REFERENCES interlinear_glosses(id),
  word_study_id TEXT
);
CREATE INDEX idx_interlinear_verse ON interlinear_words(book_id, chapter_num, verse_num);
CREATE INDEX idx_interlinear_gloss ON interlinear_words(gloss_id);

-- Content Library (build-time index for cross-chapter content browsing)
CREATE TABLE content_library (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  preview TEXT,
  book_id TEXT NOT NULL,
  book_name TEXT NOT NULL,
  chapter_num INTEGER NOT NULL,
  section_num INTEGER,
  panel_type TEXT NOT NULL,
  tab_key TEXT,
  testament TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX idx_cl_category ON content_library(category);
CREATE INDEX idx_cl_book ON content_library(book_id);

-- Red letter verses (Jesus speaking)
CREATE TABLE red_letter_verses (
  book_id TEXT NOT NULL,
  chapter_num INTEGER NOT NULL,
  verse_num INTEGER NOT NULL,
  PRIMARY KEY (book_id, chapter_num, verse_num)
);
CREATE INDEX idx_red_letter_chapter ON red_letter_verses(book_id, chapter_num);

-- Lexicon entries (Thayer's Greek + BDB Hebrew)
CREATE TABLE lexicon_entries (
  strongs TEXT PRIMARY KEY,
  language TEXT NOT NULL,
  lemma TEXT NOT NULL,
  transliteration TEXT NOT NULL,
  pronunciation TEXT,
  pos TEXT,
  definition_json TEXT NOT NULL,
  etymology TEXT,
  related_strongs_json TEXT,
  source TEXT NOT NULL DEFAULT 'thayer'
);
CREATE INDEX idx_lexicon_language ON lexicon_entries(language);

-- Dictionary entries (Easton's Bible Dictionary)
CREATE TABLE dictionary_entries (
  id TEXT PRIMARY KEY,
  term TEXT NOT NULL,
  definition TEXT NOT NULL,
  refs_json TEXT,
  related_json TEXT,
  category TEXT,
  cross_person_id TEXT,
  cross_place_id TEXT,
  cross_word_study_id TEXT,
  cross_concept_id TEXT,
  source TEXT NOT NULL DEFAULT 'easton'
);

CREATE INDEX idx_dictionary_category ON dictionary_entries(category);
CREATE INDEX idx_dictionary_term ON dictionary_entries(term);

-- Full-text search indexes
CREATE VIRTUAL TABLE verses_fts USING fts5(text, content=verses, content_rowid=id);
CREATE VIRTUAL TABLE people_fts USING fts5(name, role, bio, content=people, content_rowid=rowid);
CREATE VIRTUAL TABLE dictionary_fts USING fts5(term, definition, content=dictionary_entries, content_rowid=rowid);

-- ══════════════════════════════════════════════════════════════
-- LIFE TOPICS (curated topical guides with scholar quotes)
-- ══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS life_topic_categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    display_order INTEGER NOT NULL,
    icon TEXT
);

CREATE TABLE IF NOT EXISTS life_topics_official (
    id TEXT PRIMARY KEY,
    category_id TEXT NOT NULL REFERENCES life_topic_categories(id),
    title TEXT NOT NULL,
    subtitle TEXT,
    summary TEXT NOT NULL,
    body TEXT NOT NULL,
    display_order INTEGER NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS life_topic_verses (
    id INTEGER PRIMARY KEY,
    topic_id TEXT NOT NULL REFERENCES life_topics_official(id),
    verse_ref TEXT NOT NULL,
    verse_order INTEGER NOT NULL,
    annotation TEXT,
    is_primary INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS life_topic_scholars (
    id INTEGER PRIMARY KEY,
    topic_id TEXT NOT NULL REFERENCES life_topics_official(id),
    scholar_id TEXT NOT NULL,
    quote TEXT NOT NULL,
    source TEXT,
    display_order INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS life_topic_related (
    topic_id TEXT NOT NULL,
    related_id TEXT NOT NULL,
    PRIMARY KEY (topic_id, related_id)
);

CREATE VIRTUAL TABLE IF NOT EXISTS life_topics_fts USING fts5(
    title, summary, body, content='life_topics_official'
);

-- ══════════════════════════════════════════════════════════════
-- HERMENEUTIC LENSES (interpretive frameworks for reading)
-- ══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS hermeneutic_lenses (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT,
  display_order INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS chapter_lens_content (
  id INTEGER PRIMARY KEY,
  chapter_id TEXT NOT NULL,
  lens_id TEXT NOT NULL REFERENCES hermeneutic_lenses(id),
  guidance TEXT NOT NULL,
  panel_filter_json TEXT,
  panel_order_json TEXT,
  UNIQUE(chapter_id, lens_id)
);

-- ══════════════════════════════════════════════════════════════
-- ARCHAEOLOGICAL EVIDENCE
-- ══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS archaeological_discoveries (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  date_range TEXT,
  location TEXT,
  significance TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  images_json TEXT,
  source TEXT,
  display_order INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS archaeology_verse_links (
  id INTEGER PRIMARY KEY,
  discovery_id TEXT NOT NULL REFERENCES archaeological_discoveries(id),
  verse_ref TEXT NOT NULL,
  relevance TEXT
);

CREATE VIRTUAL TABLE IF NOT EXISTS archaeology_fts USING fts5(
  name, significance, description, content='archaeological_discoveries'
);

CREATE INDEX IF NOT EXISTS idx_archaeology_category ON archaeological_discoveries(category);
CREATE INDEX IF NOT EXISTS idx_archaeology_verse_links ON archaeology_verse_links(discovery_id);

CREATE TABLE IF NOT EXISTS archaeology_images (
  id INTEGER PRIMARY KEY,
  discovery_id TEXT NOT NULL REFERENCES archaeological_discoveries(id),
  url TEXT NOT NULL,
  caption TEXT,
  credit TEXT,
  display_order INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_archaeology_images ON archaeology_images(discovery_id);

-- ══════════════════════════════════════════════════════════════
-- HISTORICAL INTERPRETATIONS (Time-Travel Reader)
-- ══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS historical_interpretations (
  id TEXT PRIMARY KEY,
  verse_ref TEXT NOT NULL,
  era TEXT NOT NULL,
  era_label TEXT NOT NULL,
  author TEXT NOT NULL,
  author_dates TEXT,
  source_title TEXT NOT NULL,
  source_date TEXT,
  interpretation TEXT NOT NULL,
  context TEXT,
  display_order INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS interpretation_eras (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  date_range TEXT NOT NULL,
  description TEXT NOT NULL,
  display_order INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_interp_verse ON historical_interpretations(verse_ref);
CREATE INDEX IF NOT EXISTS idx_interp_era ON historical_interpretations(era);

-- ══════════════════════════════════════════════════════════════
-- GRAMMAR ARTICLES (morphology reference)
-- ══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS grammar_articles (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  language TEXT NOT NULL,
  category TEXT NOT NULL,
  summary TEXT NOT NULL,
  body TEXT NOT NULL,
  examples_json TEXT,
  related_articles_json TEXT,
  display_order INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_grammar_language ON grammar_articles(language);
CREATE INDEX IF NOT EXISTS idx_grammar_category ON grammar_articles(category);

-- ══════════════════════════════════════════════════════════════
-- CONTENT IMAGES (generic image table for any content type)
-- ══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS content_images (
  id INTEGER PRIMARY KEY,
  content_type TEXT NOT NULL,
  content_id TEXT NOT NULL,
  url TEXT NOT NULL,
  caption TEXT,
  credit TEXT,
  display_order INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_content_images
  ON content_images(content_type, content_id);

-- ══════════════════════════════════════════════════════════════
-- UNIFIED JOURNEYS (person, concept, thematic)
-- ══════════════════════════════════════════════════════════════

CREATE TABLE journeys (
  id TEXT PRIMARY KEY,
  journey_type TEXT NOT NULL CHECK (journey_type IN ('person', 'concept', 'thematic')),
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT NOT NULL,
  lens_id TEXT,
  depth TEXT CHECK (depth IN ('short', 'medium', 'long')),
  sort_order INTEGER DEFAULT 0,
  person_id TEXT,
  concept_id TEXT,
  era TEXT,
  tags TEXT,
  hero_image_url TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_journeys_type ON journeys(journey_type);
CREATE INDEX IF NOT EXISTS idx_journeys_lens ON journeys(lens_id);

CREATE TABLE journey_stops (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  journey_id TEXT NOT NULL REFERENCES journeys(id) ON DELETE CASCADE,
  stop_order INTEGER NOT NULL,
  stop_type TEXT NOT NULL CHECK (stop_type IN ('regular', 'linked_journey')),
  label TEXT,
  ref TEXT,
  book_id TEXT,
  chapter_num INTEGER,
  verse_start INTEGER,
  verse_end INTEGER,
  development TEXT,
  what_changes TEXT,
  linked_journey_id TEXT,
  linked_journey_intro TEXT,
  bridge_to_next TEXT,
  UNIQUE (journey_id, stop_order)
);

CREATE INDEX IF NOT EXISTS idx_stops_journey ON journey_stops(journey_id);

CREATE TABLE journey_tags (
  journey_id TEXT NOT NULL REFERENCES journeys(id) ON DELETE CASCADE,
  tag_type TEXT NOT NULL CHECK (tag_type IN ('person', 'place', 'theme', 'word_study', 'prophecy_chain')),
  tag_id TEXT NOT NULL,
  PRIMARY KEY (journey_id, tag_type, tag_id)
);

CREATE INDEX IF NOT EXISTS idx_journey_tags_target ON journey_tags(tag_type, tag_id);

-- ══════════════════════════════════════════════════════════════
-- NOTE: User tables (notes, bookmarks, preferences, highlights,
-- reading progress, plans) live in a separate user.db managed by
-- the app's userDatabase.ts migration system. They are NOT bundled
-- in scripture.db so that content updates can safely replace this
-- file without destroying user data.
-- ══════════════════════════════════════════════════════════════
"""


def create_schema(conn):
    """Execute all DDL statements to create the scripture.db schema.

    Args:
        conn: An open sqlite3 connection (or cursor).
    """
    cur = conn.cursor() if hasattr(conn, 'cursor') else conn
    cur.executescript(SCHEMA)
