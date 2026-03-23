# Scripture Deep Dive — React Native App Plan (v2)

## Executive Summary

**What we're doing:** Retiring the static PWA entirely and building Scripture Deep Dive as a native React Native app (iOS + Android). The app will be the sole product. No dual-target pipeline, no HTML generation, no GitHub Pages dependency.

**Current state:** A PWA with 879 chapters of scholarly content across 30 books, a D3.js genealogy tree (211 people), a Leaflet.js biblical world map (60+ places, 15+ journey stories), interactive timelines, a word-study lexicon, synoptic parallel-passage system, per-chapter keyword highlighting (VHL), 43 scholar bio pages, and full verse text in NIV + ESV. All scholarly content is embedded in rendered HTML with no structured database.

**Target state:** A native React Native app with:
- All content in a single offline-first SQLite database (~19MB)
- Pure-native rendering for every feature (no WebView shortcuts)
- Content authored as JSON, never as HTML
- OTA content updates via Expo (no store review for new chapters)
- Native features: push notifications, widgets, TTS, sharing, accessibility

**Design philosophy:** Do it right, not fast. Every component is pure native. Every interaction has proper gestures, animations, and accessibility. The app ships when it's polished, not when a deadline demands it.

---

## Phase 0: Data Migration (Weeks 1-3)
*"Extract everything from HTML into structured JSON. This is a one-time operation."*

### 0.1 — Reverse-extract all 879 chapters from HTML to JSON

Write `_tools/extract_to_json.py` — a BeautifulSoup parser that reads each chapter HTML and extracts structured data back into JSON.

**What gets extracted per chapter:**

```json
{
  "book": "isaiah",
  "chapter": 1,
  "title": "The Great Arraignment",
  "sections": [
    {
      "header": "Verses 1–15 — \"Though Your Sins Are Like Scarlet\"",
      "verse_start": 1,
      "verse_end": 15,
      "panels": {
        "heb": [{"word": "רִיב", "tlit": "rîb", "gloss": "lawsuit", "text": "..."}],
        "ctx": "Isaiah opens not with his call...",
        "cross": [{"ref": "Deut 32:1", "note": "Moses summoned the same witnesses..."}],
        "mac": [{"ref": "1:2–3", "note": "Heaven and earth as witnesses..."}],
        "calvin": [{"ref": "1:2–3", "note": "Calvin reads the ox-and-donkey..."}],
        "netbible": [{"ref": "1:2", "note": "The NET notes the verb 'reared'..."}],
        "oswalt": [{"ref": "1:2–4", "note": "Oswalt emphasises the covenant-lawsuit..."}],
        "childs": [{"ref": "1:1–15", "note": "Childs reads ch.1 as the canonical..."}]
      }
    }
  ],
  "chapter_panels": {
    "lit": {"rows": [...], "note": "..."},
    "hebtext": "...",
    "themes": {"scores": [...], "note": "..."},
    "ppl": [...],
    "trans": [...],
    "src": [...],
    "rec": [...],
    "thread": [...],
    "textual": [...],
    "debate": [...]
  },
  "vhl_groups": [
    {"name": "hebrew", "css_class": "dn-key", "words": ["rîb", "ṣədāqâ"]},
    {"name": "divine", "css_class": "dn-yhwh", "words": ["LORD"]},
    {"name": "key", "css_class": "dn-key", "words": ["scarlet", "snow"]}
  ]
}
```

**Validation strategy:** For each of the 879 chapters:
1. Extract HTML → JSON
2. Manually verify a sample set (10% = ~88 chapters across all books)
3. Automated checks: section count matches, panel types present, verse ranges contiguous, no empty panels

**Output directory:**
```
content/
  genesis/1.json ... 50.json
  exodus/1.json ... 40.json
  ...
  acts/1.json ... 28.json
```

### 0.2 — Extract supporting data from JS files

Trivial conversions (strip `window.X =` wrapper, parse as JSON):

| Source | Target |
|--------|--------|
| `data/book-intros.js` (233KB) | `content/meta/book-intros.json` |
| `js/pages/people-data.js` (196KB) | `content/meta/people.json` |
| `js/pages/timeline-data.js` (75KB) | `content/meta/timelines.json` |
| `data/cross-refs.js` (17KB) | `content/meta/cross-refs.json` |
| `data/word-study.js` (18KB) | `content/meta/word-studies.json` |
| `data/synoptic-map.js` (10KB) | `content/meta/synoptic.json` |
| `verses/niv/**/*.js` | `content/verses/niv/{book}.json` |
| `verses/esv/**/*.js` | `content/verses/esv/{book}.json` |

### 0.3 — Extract data embedded inline in HTML

These require custom parsers because the data lives inside HTML files, not in separate JS:

| Source | Target | Notes |
|--------|--------|-------|
| `map.html` — `PLACES` array | `content/meta/places.json` | 60+ place objects: id, ancient/modern names, lat/lon, type, priority, stories[] |
| `map.html` — `STORIES` array | `content/meta/map-stories.json` | 15+ narratives: summary, region polygons, journey polylines with coordinates |
| `people.html` — tree config | `content/meta/genealogy-config.json` | ERA_COLORS, ERA_NAMES, spine-node logic |
| `commentators/*.html` (43 files) | `content/meta/scholar-bios.json` | Structured bio data: name, tradition, sections, body text |
| Per-chapter VHL data | Merged into each `content/{book}/{ch}.json` | The `initVHL(GROUPS)` call data from each chapter |

### 0.4 — Export Python config to JSON

| Source | Target |
|--------|--------|
| `config.py` SCHOLAR_REGISTRY | `content/meta/scholars.json` |
| `config.py` COMMENTATOR_SCOPE | `content/meta/scholar-scopes.json` |
| `config.py` BOOK_META | `content/meta/books.json` |

### 0.5 — Build the SQLite database

Write `_tools/build_sqlite.py` that reads all `content/**/*.json` and assembles a single `scripture.db`.

**Schema:**

```sql
-- ══════════════════════════════════════════════════════════════
-- CONTENT (bundled with app, updated via OTA)
-- ══════════════════════════════════════════════════════════════

CREATE TABLE books (
  id TEXT PRIMARY KEY,              -- 'genesis'
  name TEXT NOT NULL,                -- 'Genesis'
  testament TEXT NOT NULL,           -- 'ot' or 'nt'
  total_chapters INTEGER NOT NULL,
  book_order INTEGER NOT NULL,       -- canonical order 1–66
  is_live BOOLEAN DEFAULT 0
);

CREATE TABLE chapters (
  id TEXT PRIMARY KEY,              -- 'genesis_1'
  book_id TEXT NOT NULL REFERENCES books(id),
  chapter_num INTEGER NOT NULL,
  title TEXT,
  timeline_link_event TEXT,          -- timeline event ID (e.g., 'creation') or null
  timeline_link_text TEXT,           -- display text (e.g., 'See on Timeline — Creation') or null
  map_story_link_id TEXT,            -- map story ID (e.g., 'abram-call') or null
  map_story_link_text TEXT           -- display text (e.g., 'See on Map — Abraham''s Call') or null
);

CREATE TABLE sections (
  id TEXT PRIMARY KEY,              -- 'genesis_1_s1'
  chapter_id TEXT NOT NULL REFERENCES chapters(id),
  section_num INTEGER NOT NULL,
  header TEXT,
  verse_start INTEGER,
  verse_end INTEGER
);

CREATE TABLE section_panels (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  section_id TEXT NOT NULL REFERENCES sections(id),
  panel_type TEXT NOT NULL,          -- 'heb', 'ctx', 'cross', 'mac', 'calvin', etc.
  content_json TEXT NOT NULL
);

CREATE TABLE chapter_panels (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  chapter_id TEXT NOT NULL REFERENCES chapters(id),
  panel_type TEXT NOT NULL,          -- 'lit', 'hebtext', 'themes', 'ppl', 'trans', etc.
  content_json TEXT NOT NULL
);

CREATE TABLE verses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  book_id TEXT NOT NULL REFERENCES books(id),
  chapter_num INTEGER NOT NULL,
  verse_num INTEGER NOT NULL,
  translation TEXT NOT NULL,         -- 'niv' or 'esv'
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
  father TEXT,                       -- person ID (for genealogy tree links)
  mother TEXT,
  spouse_of TEXT,
  era TEXT,
  dates TEXT,
  role TEXT,
  type TEXT,                         -- 'spine' or 'satellite' (for tree rendering)
  bio TEXT,
  scripture_role TEXT,
  refs_json TEXT,                    -- JSON array of scripture references
  chapter_link TEXT
);

CREATE TABLE scholars (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  label TEXT NOT NULL,
  tradition TEXT,
  era TEXT,
  scope_json TEXT NOT NULL,          -- ["genesis","exodus"] or "all"
  bio_json TEXT NOT NULL             -- {eyebrow, sections: [{title, body}]}
);

CREATE TABLE places (
  id TEXT PRIMARY KEY,
  ancient_name TEXT NOT NULL,
  modern_name TEXT,
  latitude REAL NOT NULL,
  longitude REAL NOT NULL,
  type TEXT NOT NULL,                -- 'city', 'water', 'region', 'mountain', 'site'
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
  places_json TEXT,                  -- JSON array of place IDs
  regions_json TEXT,                 -- JSON array of polygon coordinates
  paths_json TEXT                    -- JSON array of polyline coordinates
);

CREATE TABLE word_studies (
  id TEXT PRIMARY KEY,
  language TEXT NOT NULL,            -- 'hebrew' or 'greek'
  original TEXT NOT NULL,            -- Unicode script
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
  passages_json TEXT NOT NULL         -- {"matthew":"3:13-17","mark":"1:9-11",...}
);

CREATE TABLE vhl_groups (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  chapter_id TEXT NOT NULL REFERENCES chapters(id),
  group_name TEXT NOT NULL,
  css_class TEXT NOT NULL,
  words_json TEXT NOT NULL
);

CREATE TABLE genealogy_config (
  key TEXT PRIMARY KEY,
  value_json TEXT NOT NULL
);

CREATE TABLE cross_ref_threads (
  id TEXT PRIMARY KEY,               -- 'substitutionary-sacrifice'
  theme TEXT NOT NULL,                -- 'Substitutionary Sacrifice'
  tags_json TEXT,                     -- JSON array of tag strings
  steps_json TEXT NOT NULL            -- JSON array of {ref, text, anchor?, type?}
);

CREATE TABLE cross_ref_pairs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  from_ref TEXT NOT NULL,
  to_ref TEXT NOT NULL,
  note TEXT
);

-- Full-text search indexes
CREATE VIRTUAL TABLE verses_fts USING fts5(text, content=verses, content_rowid=id);
CREATE VIRTUAL TABLE people_fts USING fts5(name, role, bio, content=people, content_rowid=rowid);

-- ══════════════════════════════════════════════════════════════
-- USER DATA (local only, never bundled, never overwritten by OTA)
-- ══════════════════════════════════════════════════════════════

CREATE TABLE user_notes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  verse_ref TEXT NOT NULL,
  note_text TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE reading_progress (
  book_id TEXT NOT NULL,
  chapter_num INTEGER NOT NULL,
  completed_at TEXT,
  PRIMARY KEY (book_id, chapter_num)
);

CREATE TABLE bookmarks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  verse_ref TEXT NOT NULL,
  label TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE user_preferences (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
```

**Estimated database size:** ~19MB (verses ~5MB, panels ~12MB, meta ~2MB).

### 0.6 — Archive the PWA

Once extraction is validated:
1. Tag the current state: `git tag pwa-final`
2. Move HTML directories to `_archive/` (keep in git history but out of the working tree)
3. The `content/` directory and `scripture.db` become the source of truth
4. The PWA can remain deployed on GitHub Pages as a read-only legacy link, but it receives no further updates

---

## Phase 1: New Content Authoring Pipeline (Weeks 3-4)
*"Replace build_chapter() → HTML with save_chapter() → JSON → SQLite"*

### 1.1 — Rewrite the authoring function

The generator scripts (the ones we write together in each session) currently call `build_chapter()` which renders to HTML. Replace with `save_chapter()` which writes JSON:

```python
def save_chapter(book_dir, ch, data):
    """Save chapter content as structured JSON. No HTML rendering."""
    json_dir = os.path.join(CONTENT_DIR, book_dir)
    os.makedirs(json_dir, exist_ok=True)
    json_path = os.path.join(json_dir, f'{ch}.json')

    # Validate required keys
    assert 'title' in data
    assert 'sections' in data and len(data['sections']) >= 2

    # Auto-generate chapter-level panels from section data (same logic as before)
    if 'ppl' not in data:
        data['ppl'] = auto_people(data['sections'])
    if 'trans' not in data:
        data['trans'] = auto_translations(book_dir, ch, data['sections'])
    # ... etc. for src, rec, thread, themes

    with open(json_path, 'w') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    print(f'Saved {book_dir} {ch} → {json_path}')
```

### 1.2 — Rewrite the build pipeline

```
_tools/
  shared.py          ← save_chapter(), auto_scholarly(), helpers
  config.py          ← SCHOLAR_REGISTRY, COMMENTATOR_SCOPE, BOOK_META (unchanged)
  build_sqlite.py    ← NEW: assembles content/*.json → scripture.db
  validate.py        ← NEW: checks all JSON for completeness, consistency
```

**Build workflow for new chapters:**
```bash
# 1. Write generator script (same as before — Python dicts with scholarly content)
python3 /tmp/gen_isaiah_23_33.py

# 2. Validate
python3 _tools/validate.py

# 3. Build database
python3 _tools/build_sqlite.py

# 4. Commit content + db
git add content/ scripture.db && git commit && git push

# 5. Push to devices (no store review)
eas update --branch production
```

### 1.3 — Generator script format (unchanged at the authoring level)

The scripts we write together DON'T change in structure. The data dicts are identical:

```python
save_chapter('isaiah', 23, {
    'title': 'The Oracle Against Tyre',
    'sections': [{
        'header': 'Verses 1–14 — "Wail, You Ships of Tarshish"',
        'verses': verse_range(1, 14),
        'heb': [('מַשָּׂא', 'massāʾ', 'oracle / burden', '...')],
        'ctx': 'Tyre was the greatest maritime...',
        'cross': [('Ezek 26:1–14', 'Ezekiel\'s extended Tyre oracle...')],
        'mac': [('23:1–3', 'Wail, ships of Tarshish...')],
        # ... same structure as always
    }],
    'lit': ...,
    'hebtext': ...,
    'themes': ...,
})
```

The only change is the function name: `build_chapter()` → `save_chapter()`. The content creation experience is identical.

---

## Phase 2: React Native Project Foundation (Weeks 4-6)

### 2.1 — Repository structure

```
ScriptureDeepDive/
  _archive/              ← old PWA HTML (tagged, preserved in git history)
  _tools/                ← authoring pipeline (shared.py, config.py, build_sqlite.py)
  content/               ← JSON source of truth (879+ chapter files, meta files)
  scripture.db           ← SQLite database (built from content/)
  app/                   ← React Native app
    src/
      screens/           ← all screen components
      components/        ← reusable UI components
      components/panels/ ← section and chapter panel renderers
      db/                ← SQLite access layer
      hooks/             ← custom React hooks
      theme/             ← colors, typography, spacing
      utils/             ← verse resolver, reference parser, etc.
      navigation/        ← React Navigation config
    assets/
      fonts/             ← EB Garamond, Cinzel, Source Sans 3
      images/            ← app icon, splash screen
      scripture.db       ← bundled database copy
    app.json
    package.json
```

### 2.2 — Technology stack

| Layer | Choice | Rationale |
|-------|--------|-----------|
| **Framework** | Expo (React Native, TypeScript) | Managed workflow. EAS Build + EAS Update. |
| **Navigation** | React Navigation v7 | Stack + Bottom Tab + Modal. Industry standard. |
| **State** | Zustand | Lightweight, no boilerplate. |
| **Database** | expo-sqlite (SQLite 3) | Offline-first. Bundled in app binary. |
| **Styling** | NativeWind (Tailwind for RN) | Utility-first, consistent. |
| **Fonts** | expo-font | EB Garamond, Cinzel, Source Sans 3. |
| **Icons** | Lucide React Native | Clean, consistent icon set. |
| **Animations** | react-native-reanimated v3 | Panel expand/collapse, transitions. |
| **Gestures** | react-native-gesture-handler | Pinch-to-zoom (tree, map), swipe navigation. |
| **SVG** | react-native-svg | Timeline, radar chart, genealogy tree. |
| **Charts** | victory-native | Themes radar chart. |
| **Maps** | react-native-maps | Biblical world map (Apple Maps / Google Maps). |
| **Tree layout** | d3-hierarchy (math only) | Tree layout calculation for genealogy. No DOM, no WebView. |
| **Search** | SQLite FTS5 | Full-text search on verses, people, panels. |
| **TTS** | expo-speech | Read chapters aloud. |
| **Notifications** | expo-notifications | Daily verse, reading plan reminders. |
| **OTA** | expo-updates | Content updates without store review. |
| **Bottom sheets** | @gorhom/bottom-sheet | Map story panel, person sidebar, modals. |
| **Analytics** | PostHog React Native SDK | Usage patterns, errors, popular content. |
| **Testing** | Jest + React Native Testing Library | Unit + component tests. |
| **E2E Testing** | Maestro | Full device flow tests. |
| **Accessibility** | Built-in RN a11y props | VoiceOver (iOS), TalkBack (Android). |

### 2.3 — Design system

Before building any screens, establish the design system:

```typescript
// theme/tokens.ts

export const colors = {
  bg:          '#0c0a07',
  bgElevated:  '#18150f',
  bgSurface:   '#1f1b14',
  text:        '#e8dcc8',
  textDim:     '#a89a80',
  textMuted:   '#6a5f4f',
  gold:        '#c9a84c',
  goldBright:  '#e4c65c',
  goldDim:     '#8a7635',
  border:      '#3a2e18',
  borderLight: '#4a3d24',
  // Scholar accent colors (from styles.css)
  macarthur:   '#9e3a3a',
  calvin:      '#3a9e8a',
  netbible:    '#5a7ab0',
  sarna:       '#8a6a3a',
  // ... all 43 scholar colors
  // Era colors (from genealogy/timeline)
  eraPrimeval:      '#523d0b',
  eraPatriarch:     '#4b395f',
  eraExodus:        '#26472e',
  eraJudges:        '#503d18',
  eraKingdom:       '#304153',
  eraProphets:      '#653030',
  eraExile:         '#29444d',
  eraIntertestamental: '#4a3e27',
  eraNT:            '#46370f',
};

export const typography = {
  // Display: Cinzel (headings, section titles, buttons, scholar names)
  displayLg:   { fontFamily: 'Cinzel-SemiBold', fontSize: 22, letterSpacing: 1.5 },
  displayMd:   { fontFamily: 'Cinzel-Medium', fontSize: 16, letterSpacing: 1.2 },
  displaySm:   { fontFamily: 'Cinzel-Regular', fontSize: 12, letterSpacing: 2 },
  // Body: EB Garamond (verse text, bios, commentary, all reading content)
  bodyLg:      { fontFamily: 'EBGaramond-Regular', fontSize: 18, lineHeight: 30 },
  bodyMd:      { fontFamily: 'EBGaramond-Regular', fontSize: 16, lineHeight: 26 },
  bodySm:      { fontFamily: 'EBGaramond-Regular', fontSize: 14, lineHeight: 22 },
  bodyItalic:  { fontFamily: 'EBGaramond-Italic', fontSize: 16, lineHeight: 26 },
  // UI: Source Sans 3 (navigation, labels, badges, search)
  uiMd:        { fontFamily: 'SourceSans3-Regular', fontSize: 14 },
  uiSm:        { fontFamily: 'SourceSans3-Regular', fontSize: 12 },
  uiBold:      { fontFamily: 'SourceSans3-SemiBold', fontSize: 14 },
};

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 };
export const radii = { sm: 4, md: 8, lg: 12, pill: 999 };
```

**Tablet support:** All layouts use flexible breakpoints. On tablets (iPad, Android tablets):
- ChapterScreen: wider max-width content column with optional sidebar for panels
- MapScreen: story panel as persistent sidebar instead of bottom sheet
- GenealogyScreen: more visible tree area, sidebar bio panel
- Two-column book list in landscape

**Accessibility:**
- All interactive elements have `accessibilityLabel` and `accessibilityRole`
- VoiceOver / TalkBack announces: verse numbers, panel types, scholar names
- Font scaling respects system Dynamic Type / font-size preferences
- Minimum touch target: 44pt × 44pt
- Color contrast: all text meets WCAG AA on dark background (verified)

### 2.4 — Screen hierarchy

```
App
├── BottomTabNavigator
│   ├── HomeTab
│   │   └── HomeScreen
│   │       ├── Hero section (app branding, tagline)
│   │       ├── "Continue Reading" chips (last 5 chapters from reading_progress)
│   │       ├── Inline search bar (mixed verse + people results, inline rendering)
│   │       ├── Book grid: OT/NT toggle, collapsible book sections
│   │       │   ├── Book cards with chapter counts + "LIVE" badges
│   │       │   └── Expand → chapter number grid (tap to open chapter)
│   │       └── Footer (about, credits)
│   │
│   ├── ReadTab (Stack)
│   │   ├── BookListScreen            — OT/NT sections, book cards, chapter counts, LIVE badges
│   │   ├── ChapterListScreen         — Chapter number grid + "About This Book" link
│   │   ├── BookIntroScreen           — Full book intro. Supports `initialScrollTo` for chapter-specific deep-scroll.
│   │   ├── ChapterScreen             — THE main screen (§3). See §3.1 for full layout spec.
│   │   └── ParallelPassageScreen     — Side-by-side synoptic comparison
│   │
│   ├── ExploreTab (Stack)
│   │   ├── ExploreMenuScreen         — Grid: People, Map, Timeline, Synoptic, Word Studies, Scholars
│   │   ├── GenealogyTreeScreen       — Zoomable SVG family tree (§4)
│   │   ├── PersonDetailScreen        — Full bio
│   │   ├── MapScreen                 — Biblical world map with journey stories (§5)
│   │   ├── TimelineScreen            — Full interactive timeline (standalone, not just in-chapter panel)
│   │   ├── ParallelPassageScreen     — Also reachable from Explore (not just from chapters)
│   │   ├── WordStudyBrowseScreen     — Hebrew/Greek lexicon browser
│   │   ├── WordStudyDetailScreen     — Single word detail
│   │   ├── ScholarBrowseScreen       — 43 scholars, filter by tradition/era
│   │   └── ScholarBioScreen          — Full bio + link to their commentary
│   │
│   ├── SearchTab
│   │   └── SearchScreen              — FTS5 across verses, people, places, word studies
│   │
│   └── MoreTab
│       └── SettingsScreen            — Translation, font size, reading plans, notifications
│           ├── Authorship & methodology disclosure
│           ├── About / credits / licenses
│           └── Footer content
│
├── Modal: QnavOverlay                — CRITICAL. Full-screen quick-navigation overlay (§3.5).
│                                       OT/NT toggle, book accordion, chapter grid, inline search.
│                                       Triggered by 🔍 button on ChapterScreen nav bar.
│                                       This is how users jump between books/chapters without leaving.
├── Modal: PersonSidebar              — Slide-in from any screen. Tappable family links chain.
├── Modal: CrossRefPopup              — Tap reference → verse preview without navigating away.
├── Modal: WordStudyPopup             — Tap highlighted word → compact lexicon card.
├── Modal: ScholarInfoSheet           — Tap scholar name in panel → quick info + "See full bio."
├── Modal: ThreadViewerSheet          — Step-by-step cross-book theme journey (§3.7).
├── Modal: NotesOverlay               — "My Notes" for current chapter. View/edit/delete per-verse notes (§3.6).
└── Modal: AuthorshipSheet            — Methodology and content attribution disclosure.
```

### 2.5 — Data access layer

```typescript
// db/content.ts

import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('scripture.db');

// ── Chapters ──────────────────────────────────────────────────────────
export const getChapter = (bookId: string, ch: number): Chapter | null =>
  db.getFirstSync('SELECT * FROM chapters WHERE book_id=? AND chapter_num=?', [bookId, ch]);

export const getSections = (chapterId: string): Section[] =>
  db.getAllSync('SELECT * FROM sections WHERE chapter_id=? ORDER BY section_num', [chapterId]);

export const getSectionPanels = (sectionId: string): SectionPanel[] =>
  db.getAllSync('SELECT * FROM section_panels WHERE section_id=? ORDER BY panel_type', [sectionId]);

export const getChapterPanels = (chapterId: string): ChapterPanel[] =>
  db.getAllSync('SELECT * FROM chapter_panels WHERE chapter_id=?', [chapterId]);

// ── Verses ────────────────────────────────────────────────────────────
export const getVerses = (bookId: string, ch: number, translation: string): Verse[] =>
  db.getAllSync(
    'SELECT * FROM verses WHERE book_id=? AND chapter_num=? AND translation=? ORDER BY verse_num',
    [bookId, ch, translation]);

// ── VHL ───────────────────────────────────────────────────────────────
export const getVHLGroups = (chapterId: string): VHLGroup[] =>
  db.getAllSync('SELECT * FROM vhl_groups WHERE chapter_id=?', [chapterId]);

// ── Search ────────────────────────────────────────────────────────────
export const searchVerses = (query: string, limit = 50): Verse[] =>
  db.getAllSync('SELECT * FROM verses_fts WHERE text MATCH ? LIMIT ?', [query, limit]);

export const searchPeople = (query: string): Person[] =>
  db.getAllSync('SELECT * FROM people_fts WHERE people_fts MATCH ? LIMIT 20', [query]);

// ── People ────────────────────────────────────────────────────────────
export const getPerson = (id: string): Person | null =>
  db.getFirstSync('SELECT * FROM people WHERE id=?', [id]);

export const getPersonChildren = (parentId: string): Person[] =>
  db.getAllSync('SELECT * FROM people WHERE father=? OR mother=?', [parentId, parentId]);

// ── Map ───────────────────────────────────────────────────────────────
export const getPlaces = (): Place[] => db.getAllSync('SELECT * FROM places');

export const getMapStories = (era?: string): MapStory[] =>
  era ? db.getAllSync('SELECT * FROM map_stories WHERE era=?', [era])
      : db.getAllSync('SELECT * FROM map_stories');

// ── Scholars ──────────────────────────────────────────────────────────
export const getScholar = (id: string): Scholar | null =>
  db.getFirstSync('SELECT * FROM scholars WHERE id=?', [id]);

export const getScholarsForBook = (bookId: string): Scholar[] =>
  db.getAllSync("SELECT * FROM scholars WHERE scope_json LIKE ? OR scope_json='\"all\"'",
    [`%${bookId}%`]);

// ── User notes ────────────────────────────────────────────────────────
export const getNotesForChapter = (bookId: string, ch: number): UserNote[] =>
  db.getAllSync(
    "SELECT * FROM user_notes WHERE verse_ref LIKE ? ORDER BY verse_ref",
    [`${bookId} ${ch}:%`]);

export const getNoteCount = (bookId: string, ch: number): number =>
  db.getFirstSync<{c:number}>(
    "SELECT COUNT(*) as c FROM user_notes WHERE verse_ref LIKE ?",
    [`${bookId} ${ch}:%`])?.c ?? 0;

export const saveNote = (verseRef: string, text: string): void =>
  db.runSync(
    "INSERT OR REPLACE INTO user_notes (verse_ref, note_text, updated_at) VALUES (?, ?, datetime('now'))",
    [verseRef, text]);

// ── Reading history ───────────────────────────────────────────────────
export const recordVisit = (bookId: string, ch: number): void =>
  db.runSync(
    "INSERT OR REPLACE INTO reading_progress (book_id, chapter_num, completed_at) VALUES (?, ?, datetime('now'))",
    [bookId, ch]);

export const getRecentChapters = (limit = 5): RecentChapter[] =>
  db.getAllSync(
    `SELECT rp.*, c.title, b.name as book_name FROM reading_progress rp
     JOIN chapters c ON c.book_id=rp.book_id AND c.chapter_num=rp.chapter_num
     JOIN books b ON b.id=rp.book_id ORDER BY rp.completed_at DESC LIMIT ?`,
    [limit]);

// ── Timeline / Map deep-links ─────────────────────────────────────────
// Stored directly on the chapters table (null for chapters without links)
export const getChapterWithLinks = (bookId: string, ch: number): ChapterWithLinks | null =>
  db.getFirstSync(
    'SELECT * FROM chapters WHERE book_id=? AND chapter_num=?',
    [bookId, ch]);
// Returns: { id, book_id, chapter_num, title, timeline_link_event, timeline_link_text,
//            map_story_link_id, map_story_link_text }

// ── Cross-ref threads (for thread viewer badges) ─────────────────────
export const getThreadsForChapter = (bookId: string, ch: number): CrossRefThread[] =>
  db.getAllSync(
    "SELECT * FROM cross_ref_threads WHERE steps_json LIKE ?",
    [`%${bookId}%${ch}%`]);
```

---

## Phase 3: ChapterScreen — The Core Experience (Weeks 6-9)
*"This is where 90% of user time is spent. Get this right."*

### 3.1 — ChapterScreen full layout

```
┌─────────────────────────────────────┐
│ ← Library  Genesis Ch.1  ← 🔍 →    │  sticky nav bar (§3.1a)
├─────────────────────────────────────┤
│                                     │
│ Genesis 1                           │  chapter title (h1)
│ The Creation of the Heavens...      │  subtitle
│                                     │
│ [My Notes (3)]  [About This Book →] │  action bar (§3.6, §3.1b)
│                                     │
│ ┌ See on Timeline — Creation ─────┐ │  timeline deep-link (§3.1c)
│ └─────────────────────────────────┘ │
│ ┌ 📍 See on Map — Garden of Eden ┐ │  map story deep-link (§3.1c)
│ └─────────────────────────────────┘ │
│                                     │
│ ┌ Creation Thread · Covenant Thr. ┐ │  thread badges (§3.7)
│ └─────────────────────────────────┘ │
│                                     │
│ Verses 1–13 — "In the Beginning"   │  section header
│                                     │
│ ¹ In the beginning God created...  │  verse text (VHL-highlighted, §3.3)
│ ² Now the earth was formless...    │  per-verse note indicator ✏️ (§3.6)
│ ³ And God said...                  │
│                                     │
│ [Heb][Ctx][Hst][✝][Mac][Sar][Cal] │  button row
│ [Net][Alt][Plc][TL]                │  (incl. poi + tl buttons, §3.2b)
│                                     │
│ ┌─ Hebrew Word Study ────────────┐ │
│ │  בְּרֵאשִׁית (bərēʾshîṯ)       │ │  expanded panel (single-open)
│ │  — in the beginning             │ │
│ └────────────────────────────────┘ │
│                                     │
│ Verses 14–23 — "Let There Be..."   │  section 2
│ ...                                 │
│                                     │
│ ── SCHOLARLY BLOCK ──────────────── │  chapter-level panels
│ [Lit][Heb][Themes][Ppl][Trans]     │
│ [Src][Rec][Thread][Txt][Debate]    │
│                                     │
│ ── Authorship ▾ ─────────────────── │  collapsible authorship disclosure
│                                     │
├─────────────────────────────────────┤
│ ←  Prev          NIV ↔ ESV    Next→ │  bottom bar
└─────────────────────────────────────┘
```

### 3.1a — Sticky nav bar

```typescript
// components/ChapterNavBar.tsx

function ChapterNavBar({ book, chapter, totalChapters, onBack, onPrev, onNext, onQnav }) {
  return (
    <View style={styles.navBar}>
      {/* Left: back to Library (BookListScreen) */}
      <TouchableOpacity onPress={onBack} style={styles.navBack}>
        <ChevronLeft size={16} /><Text style={styles.navBackText}>Library</Text>
      </TouchableOpacity>

      {/* Centre: book name + chapter number */}
      <View style={styles.navCenter}>
        <Text style={styles.navBook}>{book.name}</Text>
        <Text style={styles.navChapter}>Chapter {chapter}</Text>
      </View>

      {/* Right: prev, qnav trigger (🔍), next */}
      <View style={styles.navArrows}>
        <TouchableOpacity onPress={onPrev} disabled={chapter <= 1}>
          <Text style={[styles.arrow, chapter <= 1 && styles.arrowDisabled]}>←</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onQnav} style={styles.qnavTrigger}>
          <Search size={18} color={colors.gold} />
        </TouchableOpacity>
        <TouchableOpacity onPress={onNext} disabled={chapter >= totalChapters}>
          <Text style={[styles.arrow, chapter >= totalChapters && styles.arrowDisabled]}>→</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
```

### 3.1b — "About This Book" link

Every chapter page shows an "About This Book →" link below the title. Tapping navigates to BookIntroScreen with `initialScrollTo` set to the current chapter number, so the intro page deep-scrolls to the section most relevant to that chapter (e.g., the literary structure outline highlighting the current chapter's position).

```typescript
<TouchableOpacity onPress={() => navigation.navigate('BookIntro', {
  bookId: book.id,
  initialScrollTo: chapterNum  // intro page scrolls to relevant section
})}>
  <Text style={styles.introLink}>About This Book →</Text>
</TouchableOpacity>
```

### 3.1c — Timeline and map deep-links

Certain chapters link to timeline events or map stories. This data is stored in the chapter JSON (or derived from cross-referencing chapter content with the timeline/map-stories tables).

```typescript
{/* Timeline event link — shown when chapter maps to a timeline event */}
{timelineEvent && (
  <TouchableOpacity onPress={() => navigation.navigate('Timeline', { eventId: timelineEvent.id })}>
    <Text style={styles.deepLink}>See on Timeline — {timelineEvent.name}</Text>
  </TouchableOpacity>
)}

{/* Map story link — shown when chapter maps to a map story */}
{mapStory && (
  <TouchableOpacity onPress={() => navigation.navigate('Map', { storyId: mapStory.id })}>
    <Text style={styles.deepLink}>📍 See on Map — {mapStory.name}</Text>
  </TouchableOpacity>
)}
```

### 3.1d — Authorship disclosure

A collapsible section at the bottom of each chapter (below the scholarly block) showing content attribution and methodology:

```typescript
<CollapsibleSection title="Authorship & Sources" initiallyCollapsed>
  <Text style={styles.disclosureText}>
    Commentary panels are scholarly paraphrases, not direct quotes. Each scholar's
    work is cited by name. Hebrew/Greek studies are based on standard lexicons (BDB,
    HALOT, BDAG). Cross-references are curated, not algorithmically generated.
  </Text>
</CollapsibleSection>
```

### 3.1e — Progressive loading

To avoid blocking the reading experience while panels load:

1. **Immediate:** Render verse text + section headers (the content the user came to read)
2. **50ms later:** Render button rows (shows what panels are available)
3. **On panel tap:** Load panel content from SQLite (sub-100ms query)
4. **Background:** Pre-fetch adjacent chapters (prev/next) for instant navigation

Loading skeletons shown for any panel content that takes >100ms to render.

### 3.2 — Panel rendering system

```typescript
// components/panels/PanelRenderer.tsx

const PANEL_COMPONENTS: Record<string, React.FC<PanelProps>> = {
  // Section-level panels
  heb:      HebrewPanel,            // Hebrew/Greek word studies
  ctx:      ContextPanel,           // Literary/historical context
  hist:     HistoricalContextPanel, // Historical background (distinct from ctx in PWA)
  cross:    CrossRefPanel,          // Cross-references with tappable verse links
  poi:      PlacesPanel,            // Geographic places with coords → tap navigates to MapScreen
  tl:       TimelinePanel,          // Per-section timeline events → tap navigates to TimelineScreen
  // Chapter-level panels
  lit:      LiteraryStructurePanel, // Literary outline with key-section highlighting
  hebtext:  HebrewReadingPanel,     // Hebrew-rooted interlinear reading
  themes:   ThemesRadarPanel,       // SVG radar chart of 10 theological themes
  ppl:      PeoplePanel,            // People cards → tap opens PersonSidebar
  trans:    TranslationPanel,       // Translation comparison table
  src:      SourcesPanel,           // Ancient sources (ANE texts, DSS, Josephus, etc.)
  rec:      ReceptionPanel,         // Reception history (early church, medieval, modern)
  thread:   ThreadingPanel,         // Intertextual threading connections
  textual:  TextualPanel,           // Textual criticism notes
  debate:   DebatePanel,            // Scholarly debates
};

// All scholar commentary uses one component, parameterized by scholar ID.
// Any key not in the explicit map is assumed to be a scholar.
export function renderPanel(type: string, data: any) {
  const Component = PANEL_COMPONENTS[type];
  if (Component) return <Component data={JSON.parse(data)} />;
  return <CommentaryPanel data={JSON.parse(data)} scholarId={type} />;
}
```

**PlacesPanel (poi):** Renders place cards with name, description, and coordinates. Tapping a place navigates to MapScreen centered on that location. If the place is part of a map story, the story is pre-selected.

**TimelinePanel (tl):** Renders per-section timeline events. Tapping an event navigates to the standalone TimelineScreen centered on that event's date.

**HistoricalContextPanel (hist):** Renders historical/archaeological background paragraphs. Distinct from `ctx` (which is literary context) in the PWA's panel taxonomy.

Adding a new scholar in the future requires ZERO new components — just a database entry + a color in the theme.

### 3.3 — VHL integration in verse text

```typescript
// components/VerseBlock.tsx

function VerseBlock({ verses, vhlGroups, activeGroups }) {
  return (
    <View>
      {verses.map(v => (
        <Text key={v.verse_num} style={styles.verse}>
          <Text style={styles.verseNum}>{v.verse_num} </Text>
          <HighlightedText
            text={v.text}
            groups={vhlGroups.filter(g => activeGroups.includes(g.group_name))}
            onWordPress={(word) => {
              const study = findWordStudy(word);
              if (study) openWordStudyPopup(study);
            }}
          />
        </Text>
      ))}
    </View>
  );
}
```

### 3.4 — Cross-reference resolution

Port the `verse-resolver.js` (15KB) logic to TypeScript. This handles:
- Book name abbreviations: "Gen", "1 Cor", "Ps", "Rev"
- Verse ranges: "Gen 1:1-3", "Gen 1:1–2:3"
- Multi-reference: "Gen 1:1; Ex 3:14; John 1:1"
- Chapter-only: "Gen 1" (all verses)

Every cross-reference string rendered in any panel becomes a tappable link that opens CrossRefPopup with the resolved verse text.

### 3.5 — Qnav (Quick Navigation Overlay)

**What this is:** The primary navigation mechanism for jumping between books and chapters without leaving the reading experience. In the PWA, `qnav.js` (88KB) is a full-screen overlay triggered by the 🔍 button in the chapter nav bar. It's NOT the same as the SearchTab — it's an instant chapter-picker modal.

```typescript
// components/QnavOverlay.tsx — Full-screen quick-navigation modal

function QnavOverlay({ visible, onClose, onSelectChapter }) {
  const [testament, setTestament] = useState<'ot'|'nt'>('ot');
  const [expandedBook, setExpandedBook] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const books = useBooks();

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen">
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
        {/* Header: close button + title */}
        <View style={styles.qnavHeader}>
          <TouchableOpacity onPress={onClose}><X size={20} /></TouchableOpacity>
          <Text style={styles.qnavTitle}>Navigate</Text>
        </View>

        {/* Inline search bar (searches verses + people) */}
        <TextInput
          style={styles.qnavSearch}
          placeholder="Search verses, people..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length >= 2 && <QnavSearchResults query={searchQuery} onSelect={...} />}

        {/* OT / NT toggle */}
        <View style={styles.testamentToggle}>
          <TouchableOpacity onPress={() => setTestament('ot')}>
            <Text style={[styles.testamentBtn, testament === 'ot' && styles.active]}>Old Testament</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setTestament('nt')}>
            <Text style={[styles.testamentBtn, testament === 'nt' && styles.active]}>New Testament</Text>
          </TouchableOpacity>
        </View>

        {/* Book accordion — tap book to expand chapter grid */}
        <FlatList
          data={books.filter(b => b.testament === testament)}
          renderItem={({ item }) => (
            <BookAccordion
              book={item}
              expanded={expandedBook === item.id}
              onToggle={() => setExpandedBook(expandedBook === item.id ? null : item.id)}
              onSelectChapter={(ch) => { onSelectChapter(item.id, ch); onClose(); }}
            />
          )}
        />
      </SafeAreaView>
    </Modal>
  );
}
```

**Key behaviors:**
- Opens instantly (no network calls — all data from SQLite)
- Search works while the accordion is visible (mixed results: verses + people)
- Tapping a chapter number navigates directly and closes the overlay
- Book rows show chapter counts and "LIVE" badges
- Remembers last testament toggle between opens

### 3.6 — Per-verse notes system

**What this is:** Users can annotate individual verses. The PWA has per-verse pencil indicators (✏️), a "My Notes (3)" button with badge count in the chapter header, and a full notes overlay panel for viewing/editing/deleting.

This is a **core feature**, not a post-launch enhancement. It ships with the app.

```typescript
// components/NoteIndicator.tsx — tiny pencil icon per verse
function NoteIndicator({ verseNum, hasNote, onPress }) {
  return (
    <TouchableOpacity onPress={() => onPress(verseNum)} style={styles.noteIndicator}
                      accessibilityLabel={hasNote ? `Edit note on verse ${verseNum}` : `Add note to verse ${verseNum}`}>
      <Pencil size={12} color={hasNote ? colors.gold : colors.textMuted} />
    </TouchableOpacity>
  );
}

// components/NotesButton.tsx — "My Notes (3)" in chapter header
function NotesButton({ noteCount, onPress }) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.notesButton}>
      <Text style={styles.notesButtonText}>My Notes</Text>
      {noteCount > 0 && <View style={styles.badge}><Text style={styles.badgeText}>{noteCount}</Text></View>}
    </TouchableOpacity>
  );
}

// components/NotesOverlay.tsx — full-screen notes panel for current chapter
function NotesOverlay({ bookId, chapterNum, onClose }) {
  const notes = useNotesForChapter(bookId, chapterNum);

  return (
    <Modal animationType="slide">
      <SafeAreaView>
        <FlatList
          data={notes}
          renderItem={({ item }) => (
            <NoteCard
              verseRef={item.verse_ref}
              text={item.note_text}
              updatedAt={item.updated_at}
              onEdit={() => openEditor(item)}
              onDelete={() => deleteNote(item.id)}
            />
          )}
          ListEmptyComponent={<Text>No notes yet. Tap ✏️ next to any verse.</Text>}
        />
      </SafeAreaView>
    </Modal>
  );
}
```

**Data:** `user_notes` SQLite table (local only, never overwritten by OTA updates).

### 3.7 — Thread viewer

**What this is:** The PWA's `cross-ref-ui.js` renders "thread badges" below the chapter header — e.g., "Creation Thread", "Covenant Thread". Tapping a badge opens a step-by-step guided viewer showing how a theme threads through multiple books (Gen 1:1 → John 1:1 → Col 1:16 → Heb 11:3 → Rev 21:1).

```typescript
// components/ThreadViewerSheet.tsx — bottom sheet step-by-step cross-book journey

function ThreadViewerSheet({ thread, initialStep, onClose }) {
  // thread = { name: "Creation Thread", steps: [
  //   { ref: "Gen 1:1", anchor: true, text: "In the beginning God created..." },
  //   { ref: "John 1:1-3", type: "fulfilment", text: "In the beginning was the Word..." },
  //   { ref: "Col 1:16", type: "expansion", text: "All things created through him..." },
  // ]}

  const [currentStep, setCurrentStep] = useState(initialStep);

  return (
    <BottomSheet snapPoints={['60%', '90%']}>
      <Text style={styles.threadTitle}>{thread.name}</Text>
      <FlatList
        data={thread.steps}
        renderItem={({ item, index }) => (
          <ThreadStep
            step={item}
            isCurrent={index === currentStep}
            isAnchor={item.anchor}
            onPress={() => setCurrentStep(index)}
            onNavigate={() => navigateToChapter(item.ref)}
          />
        )}
      />
    </BottomSheet>
  );
}
```

**Data source:** `thread-panel` data from `chapter_panels` table. Each chapter's threading data includes the cross-book step sequences.

### 3.8 — Reading history tracking

Record every chapter visit for the "Continue Reading" section on HomeScreen:

```typescript
// db/user.ts
export function recordChapterVisit(bookId: string, chapterNum: number) {
  db.runSync(
    'INSERT OR REPLACE INTO reading_progress (book_id, chapter_num, completed_at) VALUES (?, ?, ?)',
    [bookId, chapterNum, new Date().toISOString()]
  );
}

export function getRecentChapters(limit = 5): RecentChapter[] {
  return db.getAllSync(
    `SELECT rp.*, c.title, b.name as book_name
     FROM reading_progress rp
     JOIN chapters c ON c.book_id = rp.book_id AND c.chapter_num = rp.chapter_num
     JOIN books b ON b.id = rp.book_id
     ORDER BY rp.completed_at DESC LIMIT ?`,
    [limit]
  );
}
```

---

## Phase 4: Genealogy Tree — Pure Native SVG (Weeks 9-11)
*"No WebView. D3 for layout math. React Native SVG for rendering."*

### 4.1 — Architecture

```
d3-hierarchy (JS library, math only)
  └── computes x,y positions for 211 nodes
      └── feeds into react-native-svg rendering
          └── <Svg> with <G>, <Circle>, <Text>, <Line>, <Path>
              └── react-native-gesture-handler for pinch/pan/tap
```

### 4.2 — Implementation

```typescript
// screens/GenealogyTreeScreen.tsx

function GenealogyTreeScreen() {
  const people = usePeople();
  const config = useGenealogyConfig();
  const [filterEra, setFilterEra] = useState<string>('all');
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);

  const root = useMemo(() => {
    const hierarchy = d3Hierarchy(buildTree(people));
    d3Tree().nodeSize([90, 140])(hierarchy);
    positionSpouses(hierarchy, people);
    return hierarchy;
  }, [people, filterEra]);

  // Gesture: pinch-to-zoom + pan
  const scale = useSharedValue(0.75);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <EraFilterBar eras={config.eras} active={filterEra} onSelect={setFilterEra} />
      <PersonSearch people={people} onSelect={selectAndPanTo} />

      <GestureDetector gesture={Gesture.Simultaneous(pinchGesture, panGesture)}>
        <Svg width="100%" height="100%">
          <AnimatedG transform={animatedTransform}>
            {renderMarriageBars(root, config, filterEra)}
            {root.links().filter(l => !l.target.data.spouseOf).map(link =>
              <Path key={linkKey(link)} d={verticalLink(link)} stroke={eraColor(link.target)} />
            )}
            {root.descendants().map(node =>
              <TreeNode key={node.data.id} node={node} config={config}
                        dimmed={filterEra !== 'all' && node.data.era !== filterEra}
                        onPress={() => setSelectedPerson(node.data)} />
            )}
          </AnimatedG>
        </Svg>
      </GestureDetector>

      {selectedPerson && (
        <PersonSidebar person={selectedPerson} onClose={() => setSelectedPerson(null)}
                       onNavigate={(id) => { setSelectedPerson(getPerson(id)); animatePanTo(id); }} />
      )}
    </View>
  );
}
```

### 4.3 — Full feature parity with people.html

- 211 nodes with spine/satellite distinction
- Spouse positioning (same y-level as partner, offset x)
- Multi-spouse vertical staggering (Jacob's 4 wives)
- Marriage bars with double-tick symbols
- Era filtering (dim non-matching, keep spine visible)
- Pinch-to-zoom (0.15x–3x) with gesture handler
- Pan with momentum/inertia
- Bio sidebar/bottom sheet with family link chaining (tap Father → his bio → HIS father)
- Search with auto-center-and-zoom-to-node
- Deep link support (navigate from any screen with person pre-selected)
- Touch targets: invisible 44pt circles around each node
- Responsive: tablet sidebar bio, phone bottom sheet bio

---

## Phase 5: Biblical World Map — Native (Weeks 11-13)
*"react-native-maps with full story engine"*

### 5.1 — Implementation

```typescript
// screens/MapScreen.tsx

function MapScreen() {
  const places = usePlaces();
  const stories = useMapStories();
  const [activeEra, setActiveEra] = useState('all');
  const [activeStory, setActiveStory] = useState<MapStory | null>(null);
  const [showModern, setShowModern] = useState(false);
  const mapRef = useRef<MapView>(null);
  const storySheet = useRef<BottomSheet>(null);

  return (
    <View style={{ flex: 1 }}>
      <EraFilterBar eras={ERA_LIST} active={activeEra} onSelect={setActiveEra} />

      <MapView ref={mapRef} style={{ flex: 1 }} mapType="terrain"
               initialRegion={{ latitude: 31, longitude: 36, latitudeDelta: 15, longitudeDelta: 20 }}>
        {places.map(p => (
          <Marker key={p.id} coordinate={{ latitude: p.latitude, longitude: p.longitude }}>
            <PlaceLabel place={p} showModern={showModern} />
          </Marker>
        ))}
        {activeStory && renderStoryOverlays(activeStory)}
      </MapView>

      <StoryPicker stories={filteredStories} onSelect={selectStory} />

      <BottomSheet ref={storySheet} snapPoints={['40%', '80%']}>
        {activeStory && <StoryPanel story={activeStory} onPlaceTap={panToPlace} />}
      </BottomSheet>

      <FloatingControls onToggleNames={() => setShowModern(!showModern)} onCenter={fitBounds} />
    </View>
  );
}
```

### 5.2 — Full feature parity with map.html

- 60+ places with ancient/modern names
- Custom Cinzel-font place labels (zoom-responsive sizing)
- Type-specific symbols (mountain △, dot ●, italic for water)
- 15+ narrative stories with summaries
- Journey polylines with directional arrows
- Region polygons with dashed borders and semi-transparent fill
- Story panel (bottom sheet on phone, sidebar on tablet) with place chips (tap → pan map)
- Ancient ↔ Modern name toggle
- Era filtering for stories and place markers
- Chapter links from story panels
- Loading state

**Tile styling:** The PWA uses ESRI tiles with CSS sepia filter. Options for native:
1. Standard terrain tiles (clean, performant) — **start here**
2. Mapbox custom JSON style for parchment-toned terrain — **evaluate post-launch**

---

## Phase 6: Remaining Feature Screens (Weeks 13-16)

### 6.1 — Standalone Timeline Screen

**Not just a panel component** — the PWA has a dedicated `timeline.html` (35KB) that is a full interactive page with era filtering, zoom/pan, event cards, and people-data integration. This must be replicated as a standalone screen accessible from ExploreTab.

The TimelineScreen uses the same SVG timeline component as the in-chapter `tl` panel but with:
- Full-screen layout (not constrained to a panel)
- Era filter bar (9 eras, tap to isolate an era)
- Pan and zoom across the full timeline (3000 BC → AD 100)
- Tappable event cards that expand to show description + "Go to chapter" link
- People integration: events linked to people entries (tap person name → PersonSidebar)
- Deep-link support: `navigate('Timeline', { eventId })` centers on a specific event (used by chapter deep-links from §3.1c)

### 6.2 — Interactive Timeline SVG Component (shared)

Custom `react-native-svg` component used in BOTH the standalone TimelineScreen AND the in-chapter `tl` panel:
- Horizontal proportional date axis (3000 BC → AD 100)
- Era-colored background segments
- Event markers positioned by year
- Current-chapter event highlighted with glow (when used in chapter panels)
- Tappable events with expandable detail cards
- Pinch-to-zoom for dense time periods

### 6.3 — Word Study System

- **WordStudyBrowseScreen:** FlatList, filterable by language (Hebrew/Greek), searchable. Row: original script → transliteration → primary gloss.
- **WordStudyDetailScreen:** Full entry with glosses, semantic range, theological note, occurrence list (tappable cross-refs).
- **WordStudyPopup:** Triggered from VHL tap in verse text. Compact card. "See full study" link.

### 6.4 — Parallel / Synoptic Passages

- **ParallelPassageScreen:** Side-by-side scrollable columns for 2-4 Gospels.
- Synced scroll position across columns.
- Tabbed mode for smaller screens: swipeable tabs per Gospel.
- Unique words highlighted per Gospel.

### 6.5 — Scholar Browse System

- **ScholarBrowseScreen:** Grid of 43 scholars. Filter by tradition, era. Each card: name, tradition badge, books covered.
- **ScholarBioScreen:** Full bio with sections. "Other Scholars" grid. "See their commentary in [book]" links.
- **ScholarInfoSheet:** Bottom sheet from tapping scholar name in any panel. Quick info + "See full bio."
- Bidirectional navigation: scholar bio ↔ chapter panel.

---

## Phase 7: Native-Only Enhancements (Weeks 16-18)

### 7.1 — User features
- **Bookmarks:** Quick-save verses. Browsable list. Badge counts.
- **Reading plans:** Multi-week structured plans. Progress tracking. Daily reminders.
- **Reading history:** Recent chapters with timestamps (core tracking in §3.8, this adds a dedicated browsable history screen).
- **Highlights:** Color-coded verse highlighting (distinct from notes). Multiple colors for different study purposes.

Note: Per-verse **notes** (pencil indicators, notes overlay, edit/delete) are core features built in Phase 3 (§3.6), not deferred to this phase.

### 7.2 — Platform features
- **Push notifications:** Daily verse, reading plan reminders, new content alerts.
- **Text-to-speech:** Read chapter aloud via expo-speech with adjustable rate.
- **Verse sharing:** Generate image card with verse + reference + branding.
- **Font size:** User preference. Respects system Dynamic Type.

### 7.3 — Widgets (post-launch)
- iOS: WidgetKit — verse of the day, reading progress
- Android: App Widget — verse of the day, reading progress

---

## Phase 8: Testing & Polish (Weeks 18-20)

### 8.1 — Testing strategy

| Layer | Tool | Coverage |
|-------|------|----------|
| Unit tests | Jest | Verse resolver, reference parser, VHL word matching, tree layout math |
| Component tests | React Native Testing Library | All panel renderers, verse text, search results |
| Integration tests | Jest + SQLite | Database queries return expected data for known chapters |
| E2E tests | Maestro | Full flows: open → browse → read → panel → search → navigate |
| Accessibility audit | Manual + Accessibility Inspector | VoiceOver, TalkBack, Dynamic Type, contrast |
| Performance profiling | React DevTools + Flipper | Scroll FPS, panel latency, tree zoom smoothness |

### 8.2 — Performance targets

| Metric | Target |
|--------|--------|
| App launch → home screen | < 2 seconds |
| Chapter load (cold) | < 500ms |
| Panel expand animation | 60 FPS |
| Genealogy tree zoom/pan | 60 FPS |
| Map marker rendering (60+ markers) | < 100ms |
| FTS5 search results | < 200ms |
| Database total size | < 25MB |

### 8.3 — Polish checklist
- [ ] Splash screen with golden cross icon
- [ ] App icon for all sizes (1024×1024 source exists)
- [ ] Empty states for all screens
- [ ] Error states and database corruption recovery
- [ ] Loading skeletons for chapter and panel content
- [ ] Haptic feedback on panel toggle (iOS)
- [ ] Pull-to-refresh on search
- [ ] Keyboard avoidance on search screen
- [ ] Safe area insets (notch, home indicator, dynamic island)
- [ ] Dark mode only (matches brand)

---

## Phase 9: Store Submission (Weeks 20-22)

### 9.1 — App Store (iOS)

| Requirement | Status |
|-------------|--------|
| App icon (1024×1024) | ✅ Golden cross/Bible image exists |
| Screenshots (6.7", 6.5", 5.5") | Generate from Maestro flows |
| App description | Write from existing site content |
| Privacy policy | Required — no user data collected beyond analytics |
| Age rating | 4+ (religious/educational) |
| Apple Developer Account | $99/year |
| Category | Reference > Bible Study |

**Review confidence:** High. Fully native app. SQLite database. Native SVG rendering. Native map. Push notifications. Accessibility. No WebViews anywhere.

### 9.2 — Google Play (Android)

| Requirement | Status |
|-------------|--------|
| Feature graphic (1024×500) | Generate |
| Screenshots | Generate from Maestro flows |
| Privacy policy | Same as iOS |
| Google Play Developer Account | $25 one-time |
| Content rating | IARC questionnaire |

---

## Phase 10: Content Completion (Ongoing)

### 10.1 — Current content debt

| Work Item | Scope | Priority |
|-----------|-------|----------|
| Isaiah enrichment | 44 chapters (23-66) at 7 buttons | High |
| Kings/Chronicles MacArthur | 112 chapters missing MacArthur notes | Medium |
| Remaining 36 books | ~301 chapters not yet built | Ongoing |

### 10.2 — New content workflow

All new content is authored directly to JSON. No HTML is ever generated.

```bash
python3 /tmp/gen_isaiah_23_33.py    # calls save_chapter(), outputs JSON
python3 _tools/build_sqlite.py      # rebuilds scripture.db
git add content/ scripture.db && git commit
eas update --branch production       # OTA to all installed apps — minutes, not days
```

### 10.3 — Remaining 36 books

Authored directly into the JSON pipeline. Book intros already written (all 66). The build infrastructure handles them identically to the existing 30 books.

---

## Timeline Summary

| Phase | Weeks | Deliverable |
|-------|-------|-------------|
| **0. Data Migration** | 1–3 | Extract all 879 chapters + map + VHL + bios → JSON. Build SQLite. Archive PWA. |
| **1. Authoring Pipeline** | 3–4 | save_chapter() → JSON → SQLite. Generator scripts updated. |
| **2. App Foundation** | 4–6 | Expo project, design system, navigation, database layer, accessibility. |
| **3. ChapterScreen** | 6–10 | Core reading experience: all panels (18 types + scholars), VHL, cross-ref engine, Qnav overlay, per-verse notes system, thread viewer, "About This Book" links, timeline/map deep-links, nav bar with prev/next/Qnav, authorship disclosure, progressive loading, reading history tracking. |
| **4. Genealogy Tree** | 10–12 | Pure-native SVG tree with d3-hierarchy, gestures, family links. |
| **5. Biblical World Map** | 12–14 | react-native-maps with places, stories, journeys, overlays. |
| **6. Feature Screens** | 14–17 | Standalone timeline, timeline SVG component, word studies, synoptic, scholar browse. |
| **7. Native Features** | 17–19 | Bookmarks, reading plans, highlights, TTS, sharing, notifications. |
| **8. Testing & Polish** | 19–21 | Jest, Maestro E2E, accessibility audit, performance tuning. |
| **9. Store Submission** | 21–23 | App Store + Google Play submission and review. |
| **10. Content** | Ongoing | Isaiah enrichment, remaining 36 books via JSON pipeline. |

**Total: ~23 weeks (5.75 months).** Phase 3 expanded by 1 week to accommodate Qnav, notes system, thread viewer, deep-links, and authorship — all core features that must ship at launch.

---

## Cost Estimate

| Item | Cost | Frequency |
|------|------|-----------|
| Apple Developer Account | $99 | Annual |
| Google Play Developer Account | $25 | One-time |
| Expo EAS Build (free tier) | $0 | 30 builds/month |
| Expo Push Notifications | $0 | Up to 1,000 users free |
| PostHog Analytics (free tier) | $0 | 1M events/month free |
| **Total Year 1** | **$124** | |
| **Total Year 2+** | **$99/year** | |

No servers. No hosting. No CDN. SQLite ships with the app. OTA updates through Expo's free tier. The only recurring cost is Apple's annual fee.
