# Scripture Deep Dive — React Native Migration Plan

## Executive Summary

**Current state:** A static PWA (HTML + JS + CSS) hosted on GitHub Pages with 879 chapters, 28MB of scholarly HTML content, 51MB of verse data, and 30+ interactive features including a D3.js genealogy tree (211 people, zoomable, with family-link navigation), a Leaflet.js biblical world map (60+ places, 15+ narrative journey overlays), interactive timelines, a word-study lexicon, a synoptic parallel-passage system, per-chapter visual keyword highlighting, and 43 scholar biography pages. All scholarly content is embedded directly in HTML files — there is no structured content database.

**Target state:** A cross-platform React Native app (iOS + Android) with an offline-first SQLite database, native navigation, and the same rich scholarly experience — plus features impossible in a PWA (push notifications, widgets, watch apps, Siri/Google Assistant, background audio TTS).

**The critical challenge:** The 28MB of scholarly content (commentary, cross-refs, Hebrew studies, context notes, etc.) exists ONLY as rendered HTML. Additionally, the map data (60+ places, 15+ stories with polygon/polyline coordinates) and the VHL highlight groups are embedded inline in HTML files rather than in separate data files. Phase 0 extracts ALL of this into structured JSON and *changes the build pipeline so this never happens again*.

**Timeline estimate:** ~4.5 months for a solo developer, 2.5-3 months with two. The plan is designed to be done incrementally — the PWA stays live throughout and is never disrupted.

---

## Phase 0: Data Layer Foundation (Weeks 1-3)
*"Fix the biggest architectural mistake before anything else"*

### 0.1 — Modify build_chapter() to emit JSON alongside HTML

The root cause of the extraction challenge: `build_chapter()` in `shared.py` receives structured data dicts (sections, panels, Hebrew entries, cross-refs, etc.) and renders them to HTML, but **never saves the structured input**. Fix this first.

**Changes to `shared.py`:**
```python
def build_chapter(book_dir, ch, data):
    # === NEW: Save structured data as JSON ===
    json_dir = os.path.join(_REPO, 'content', book_dir)
    os.makedirs(json_dir, exist_ok=True)
    json_path = os.path.join(json_dir, f'{ch}.json')
    with open(json_path, 'w') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    # ... existing HTML build logic unchanged ...
```

**Result:** Every future chapter build produces BOTH an HTML file (for the PWA) AND a JSON file (for the native app). The JSON files become the single source of truth. The HTML becomes a rendering target, not a data store.

**New directory structure:**
```
content/
  genesis/
    1.json      ← structured chapter data
    2.json
    ...
  exodus/
    1.json
    ...
```

### 0.2 — Reverse-extract existing 879 chapters from HTML to JSON

Write `_tools/extract_to_json.py` — a parser that reads each chapter HTML file and extracts structured data back into JSON matching the `build_chapter()` input format.

**What can be extracted reliably:**
- Section headers and verse ranges (from `class="section-header"` and `data-v` attributes)
- Hebrew/Greek word studies (from `class="hebrew-word"`, `class="tlit"` patterns)
- Context text (from `class="anno-panel ctx"`)
- Cross-references (from `class="cross-ref-list"` `<li>` items)
- All commentary panels (from `class="anno-panel com-{scholar}"` and `class="com-ref"` / `class="com-note"`)
- Literary structure (from `class="lit-panel"`)
- Hebrew-rooted reading (from `class="heb-text-panel"`)
- Themes (from `class="themes-panel"`)
- People (from `class="ppl-panel"`)
- Translation comparison (from `class="trans-panel"`)
- Reception history (from `class="rec-panel"`)
- Ancient sources (from `class="src-panel"`)
- Intertextual threading (from `class="thread-panel"`)
- Textual notes (from `class="tx-panel"`)
- Scholarly debates (from `class="db-panel"`)

**Extraction strategy:** Use BeautifulSoup to parse each HTML file. Map CSS classes back to data dict keys. Validate by re-running `build_chapter()` on the extracted JSON and comparing the HTML output to the original (diff test).

**Validation:** For each chapter: `extract(html) → json → build_chapter(json) → html2`. If `html == html2` (minus whitespace), the extraction is lossless. Run this on all 879 chapters.

**Estimated effort:** 3-5 days for the parser + validation pipeline.

### 0.3 — Convert supporting data files to JSON

These are already structured JS objects — trivial conversion:

| Source File | Target | Strategy |
|-------------|--------|----------|
| `data/book-intros.js` (233KB) | `content/meta/book-intros.json` | Strip `window.BOOK_INTROS =` wrapper, parse as JSON |
| `js/pages/people-data.js` (196KB) | `content/meta/people.json` | Strip wrapper, parse. Includes father/mother/spouseOf family links for genealogy tree. |
| `js/pages/people-index.js` (26KB) | Derived from people.json at build time | Not stored separately |
| `js/pages/timeline-data.js` (75KB) | `content/meta/timelines.json` | Strip wrapper, parse. Includes ERA_HEX, ERA_NAMES, and all timeline entries with proportional date data. |
| `data/cross-refs.js` (17KB) | `content/meta/cross-refs.json` | Strip wrapper, parse |
| `data/word-study.js` (18KB) | `content/meta/word-studies.json` | Strip wrapper, parse. Each entry has: id, language, original, transliteration, strongs, glosses[], range, note, occurrences. |
| `data/synoptic-map.js` (10KB) | `content/meta/synoptic.json` | Strip wrapper, parse. Maps parallel passages across Gospels with pericope IDs. |
| `verses/niv/ot/*.js` + `verses/esv/ot/*.js` | `content/verses/{translation}/{book}.json` | Already JSON-like, strip var wrapper |
| `_tools/config.py` SCHOLAR_REGISTRY | `content/meta/scholars.json` | Export to JSON |
| `_tools/config.py` COMMENTATOR_SCOPE | `content/meta/scholar-scopes.json` | Export to JSON |
| `_tools/config.py` BOOK_META | `content/meta/books.json` | Export to JSON |

**Non-trivial extractions** (data embedded inline in HTML, not in separate data files):

| Source File | Target | Strategy |
|-------------|--------|----------|
| `map.html` (94KB) — inline `PLACES` array | `content/meta/places.json` | Parse 60+ place objects with: id, ancient name, modern name, lat, lon, type (city/water/region/mountain/site), priority, labelDir, stories[] |
| `map.html` (94KB) — inline `STORIES` array | `content/meta/stories.json` | Parse 15+ story objects with: id, era, name, ref, chapter link, summary, places[], regions[] (polygon coords), paths[] (polyline coords, dashed flag, label) |
| `people.html` (32KB) — inline tree config | `content/meta/genealogy-config.json` | Parse ERA_COLORS, PEOPLE_ERA_NAMES, spine-node logic. The people DATA is already in people-data.js; the tree CONFIG (which nodes are spine, era colors) is in people.html. |
| Per-chapter VHL groups (inline in each HTML) | `content/{book}/{ch}.json` → add `vhl_groups` key | Extract the `initVHL(GROUPS)` call data from each chapter HTML. Each chapter defines its own highlight word-groups (Hebrew terms, divine names, key theological terms) with associated CSS classes. Add to the chapter JSON alongside section data. |
| `commentators/*.html` (43 files, ~9KB each) | `content/meta/scholar-bios.json` | Parse bio-name, bio-eyebrow, bio-tradition, section titles + body text, "other scholars" grid data. |

**Estimated effort:** 2-3 days with conversion scripts (the inline-in-HTML extractions are more complex than simple wrapper-stripping).

### 0.4 — Build the SQLite database schema

The React Native app will use SQLite (via `expo-sqlite` or `react-native-sqlite-storage`) for all content. The database ships bundled with the app binary.

```sql
-- Core tables
CREATE TABLE books (
  id TEXT PRIMARY KEY,           -- 'genesis', 'exodus', etc.
  name TEXT NOT NULL,             -- 'Genesis', 'Exodus', etc.
  testament TEXT NOT NULL,        -- 'ot' or 'nt'
  total_chapters INTEGER,
  book_order INTEGER,             -- canonical order (1-66)
  is_live BOOLEAN DEFAULT 0
);

CREATE TABLE chapters (
  id TEXT PRIMARY KEY,            -- 'genesis_1', 'genesis_2', etc.
  book_id TEXT NOT NULL,
  chapter_num INTEGER NOT NULL,
  title TEXT,
  FOREIGN KEY (book_id) REFERENCES books(id)
);

CREATE TABLE sections (
  id TEXT PRIMARY KEY,            -- 'genesis_1_s1', etc.
  chapter_id TEXT NOT NULL,
  section_num INTEGER NOT NULL,
  header TEXT,
  verse_start INTEGER,
  verse_end INTEGER,
  FOREIGN KEY (chapter_id) REFERENCES chapters(id)
);

-- Scholarly panels (per-section)
CREATE TABLE section_panels (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  section_id TEXT NOT NULL,
  panel_type TEXT NOT NULL,       -- 'hebrew', 'ctx', 'cross', 'mac', 'calvin', etc.
  content_json TEXT NOT NULL,     -- JSON blob: the panel's data
  FOREIGN KEY (section_id) REFERENCES sections(id)
);

-- Chapter-level scholarly blocks
CREATE TABLE chapter_panels (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  chapter_id TEXT NOT NULL,
  panel_type TEXT NOT NULL,       -- 'ppl', 'trans', 'src', 'rec', 'lit', 'hebtext', 'thread', 'themes', 'textual', 'debate'
  content_json TEXT NOT NULL,
  FOREIGN KEY (chapter_id) REFERENCES chapters(id)
);

-- Verses (NIV + ESV)
CREATE TABLE verses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  book_id TEXT NOT NULL,
  chapter_num INTEGER NOT NULL,
  verse_num INTEGER NOT NULL,
  translation TEXT NOT NULL,      -- 'niv' or 'esv'
  text TEXT NOT NULL,
  FOREIGN KEY (book_id) REFERENCES books(id)
);

CREATE INDEX idx_verses_lookup ON verses(book_id, chapter_num, verse_num, translation);

-- Book introductions
CREATE TABLE book_intros (
  book_id TEXT PRIMARY KEY,
  intro_json TEXT NOT NULL,       -- full intro object as JSON
  FOREIGN KEY (book_id) REFERENCES books(id)
);

-- People
CREATE TABLE people (
  id TEXT PRIMARY KEY,            -- 'adam', 'abraham', etc.
  name TEXT NOT NULL,
  role TEXT,
  era TEXT,
  dates TEXT,
  bio_json TEXT NOT NULL          -- full bio data as JSON
);

-- Scholars
CREATE TABLE scholars (
  id TEXT PRIMARY KEY,            -- 'macarthur', 'calvin', etc.
  name TEXT NOT NULL,
  label TEXT NOT NULL,
  scope_json TEXT NOT NULL,       -- which books they cover
  bio_html TEXT                   -- bio page content
);

-- User data (local only, not bundled)
CREATE TABLE user_notes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  verse_ref TEXT NOT NULL,        -- 'Genesis 1:1'
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

-- ══════════════════════════════════════════════════════════════════════════
-- TABLES MISSED IN ORIGINAL PLAN — Added after full feature audit
-- ══════════════════════════════════════════════════════════════════════════

-- World Map: Places (60+ locations with coordinates)
CREATE TABLE places (
  id TEXT PRIMARY KEY,             -- 'jerusalem', 'babylon', 'ur', etc.
  ancient_name TEXT NOT NULL,       -- 'Jerusalem', 'Ur of the Chaldeans'
  modern_name TEXT,                 -- 'Jerusalem', 'Tell el-Muqayyar, Iraq'
  latitude REAL NOT NULL,
  longitude REAL NOT NULL,
  type TEXT NOT NULL,               -- 'city', 'water', 'region', 'mountain', 'site'
  priority INTEGER DEFAULT 2,       -- display priority (1=always, 4=zoom-only)
  label_dir TEXT DEFAULT 'n'        -- preferred label direction
);

-- World Map: Stories (narrative journeys with routes and regions)
CREATE TABLE map_stories (
  id TEXT PRIMARY KEY,             -- 'abram-call', 'exodus-plagues', 'paul-journey1'
  era TEXT NOT NULL,                -- 'patriarch', 'exodus', 'nt', etc.
  name TEXT NOT NULL,               -- 'Abraham''s Call'
  scripture_ref TEXT,               -- 'Genesis 12–25'
  chapter_link TEXT,                -- 'ot/genesis/Genesis_12.html'
  summary TEXT NOT NULL,            -- narrative summary paragraph
  places_json TEXT,                 -- JSON array of place IDs featured in this story
  regions_json TEXT,                -- JSON array of polygon coords [{coords, color, label}]
  paths_json TEXT                   -- JSON array of polyline coords [{coords, dashed, label}]
);

-- World Map: Place↔Story junction (which places appear in which stories)
CREATE TABLE place_stories (
  place_id TEXT NOT NULL,
  story_id TEXT NOT NULL,
  PRIMARY KEY (place_id, story_id),
  FOREIGN KEY (place_id) REFERENCES places(id),
  FOREIGN KEY (story_id) REFERENCES map_stories(id)
);

-- Word Studies: Hebrew/Greek lexicon entries
CREATE TABLE word_studies (
  id TEXT PRIMARY KEY,             -- 'hesed', 'logos', 'agape', etc.
  language TEXT NOT NULL,           -- 'hebrew' or 'greek'
  original TEXT NOT NULL,           -- Unicode original script
  transliteration TEXT NOT NULL,    -- 'ḥesed', 'logos'
  strongs TEXT,                     -- 'H2617', 'G3056'
  glosses_json TEXT NOT NULL,       -- JSON array: ["steadfast love","mercy","loyalty"]
  semantic_range TEXT,              -- paragraph on meaning
  note TEXT,                        -- theological significance
  occurrences_json TEXT             -- JSON: verse references where this word appears
);

-- Synoptic / Parallel Passages
CREATE TABLE synoptic_map (
  id TEXT PRIMARY KEY,             -- pericope ID
  title TEXT NOT NULL,              -- 'Baptism of Jesus'
  passages_json TEXT NOT NULL       -- JSON: {"matthew":"3:13-17","mark":"1:9-11","luke":"3:21-22","john":null}
);

-- VHL (Visual Highlight Layer) — per-chapter keyword highlight groups
CREATE TABLE vhl_groups (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  chapter_id TEXT NOT NULL,
  group_name TEXT NOT NULL,         -- 'hebrew', 'divine', 'key', etc.
  css_class TEXT NOT NULL,          -- CSS class for highlighting
  words_json TEXT NOT NULL,         -- JSON array of words/phrases to highlight
  FOREIGN KEY (chapter_id) REFERENCES chapters(id)
);

-- Scholar biographies (structured, not just HTML)
CREATE TABLE scholar_bios (
  scholar_id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  tradition TEXT,                   -- 'Reformed', 'Catholic', 'Jewish', etc.
  era TEXT,                         -- 'Reformation', 'Modern', etc.
  eyebrow TEXT,                     -- subtitle/description
  sections_json TEXT NOT NULL,      -- JSON array of {title, body} section objects
  FOREIGN KEY (scholar_id) REFERENCES scholars(id)
);

-- Genealogy tree configuration
CREATE TABLE genealogy_config (
  key TEXT PRIMARY KEY,             -- 'spine_nodes', 'era_colors', 'era_names'
  value_json TEXT NOT NULL          -- JSON config data
);
```

**Database size estimate:**
- Verses: ~31,000 rows × 2 translations × ~80 bytes avg = ~5MB
- Sections + panels: ~1,800 sections × ~5KB avg panel data = ~9MB
- Chapter panels: ~879 chapters × ~3KB avg = ~2.6MB
- People, scholars, intros: ~1MB
- Places + stories + routes: ~0.3MB
- Word studies + synoptic + VHL: ~0.5MB
- Scholar bios: ~0.2MB
- **Total: ~19MB compressed** (SQLite compresses well)

This is well within acceptable app binary size (most users won't notice 18MB).

### 0.5 — Build the JSON→SQLite pipeline

Write `_tools/build_sqlite.py`:
1. Read all `content/**/*.json` files
2. Parse and insert into SQLite
3. Bundle the `.db` file for the app
4. Add to the build system: after any chapter build, regenerate SQLite

**This pipeline runs in the existing repo. The content JSON + SQLite live alongside the PWA HTML. Both are generated from the same source data.**

---

## Phase 1: React Native Project Setup (Week 3-4)

### 1.1 — New repo or monorepo?

**Recommendation: Monorepo.** Add a `mobile/` directory inside the existing repo.

```
ScriptureDeepDive/
  _tools/              ← existing build system
  ot/                  ← existing PWA HTML
  nt/
  content/             ← NEW: JSON content (Phase 0)
  content/scripture.db ← NEW: SQLite database
  mobile/              ← NEW: React Native app
    src/
    assets/
    app.json
    package.json
  index.html           ← existing PWA
  service-worker.js
```

**Why monorepo:** The build system (`shared.py`) generates content for BOTH targets. Keeping them together means one `build_chapter()` call produces HTML + JSON + SQLite. No cross-repo sync issues.

### 1.2 — Technology choices

| Layer | Choice | Why |
|-------|--------|-----|
| **Framework** | Expo (React Native) | Easier build/deploy than bare RN. EAS Build for CI/CD. |
| **Navigation** | React Navigation v7 | Stack + Tab + Drawer. The standard. |
| **State** | Zustand | Lightweight, no boilerplate. Perfect for read-heavy content app. |
| **Database** | expo-sqlite | Ships SQLite bundled in the app binary. |
| **Styling** | NativeWind (Tailwind for RN) | Utility-first, consistent with modern RN. |
| **Fonts** | expo-font | Load EB Garamond, Cinzel, Source Sans 3. |
| **Icons** | Lucide React Native | Consistent, lightweight. |
| **Charts** | react-native-svg + victory-native | For the themes radar chart. |
| **Search** | Local SQLite FTS5 | Full-text search on verses + panels. |
| **TTS** | expo-speech | Read chapters aloud. |
| **Notifications** | expo-notifications | Daily verse, reading plan reminders. |
| **OTA Updates** | expo-updates | Push content updates without store review. |
| **Analytics** | PostHog or Mixpanel (RN SDK) | Usage patterns, popular chapters, errors. |
| **Maps** | react-native-maps | Native Apple Maps / Google Maps for the Biblical World Map. Custom markers, polyline journey overlays, polygon region overlays. Replaces Leaflet.js. |
| **Genealogy Tree** | react-native-webview + D3.js | Wrap the existing D3 genealogy tree (people.html) in a WebView with native bridge. D3's tree layout + SVG rendering has no clean pure-RN equivalent. Phase 2 = WebView wrapper; post-launch = evaluate pure-RN migration with react-native-svg + d3-hierarchy (math only). |
| **Timelines** | react-native-svg | Custom SVG timeline component with proportional date placement, era-colored segments, expandable event details. Replaces CSS-animated timeline in PWA. |
| **WebView** | react-native-webview | For complex visualizations that resist native porting (genealogy tree). Bidirectional message passing for native↔web interaction. |

### 1.3 — Project initialization

```bash
npx create-expo-app@latest ScriptureDeepDive --template blank-typescript
cd ScriptureDeepDive
npx expo install expo-sqlite expo-font expo-notifications expo-speech
npx expo install react-native-svg victory-native
npm install @react-navigation/native @react-navigation/stack @react-navigation/bottom-tabs
npm install zustand nativewind
```

---

## Phase 2: Core App Architecture (Weeks 4-7)

### 2.1 — Screen hierarchy

```
App
├── BottomTabNavigator
│   ├── HomeTab (HomeScreen)
│   │   ├── Hero, featured content, search bar
│   │   └── Quick-access book grid
│   │
│   ├── ReadTab (StackNavigator)
│   │   ├── BookListScreen                       ← OT/NT book list with chapter counts
│   │   ├── ChapterListScreen                    ← Chapters for a book + Book Intro link
│   │   ├── ChapterScreen                        ← THE main reading screen (90% of user time)
│   │   ├── BookIntroScreen                      ← "How to Read" intro page
│   │   └── ParallelPassageScreen                ← Side-by-side Gospel/OT synoptic comparison
│   │
│   ├── ExploreTab (StackNavigator)
│   │   ├── ExploreMenuScreen                    ← Grid: People, Map, Timeline, Word Studies, Scholars
│   │   ├── GenealogyTreeScreen                  ← D3 zoomable tree (WebView with native bridge)
│   │   ├── PersonDetailScreen                   ← Full bio (also reachable from sidebar)
│   │   ├── MapScreen                            ← Leaflet→react-native-maps biblical world map
│   │   ├── MapStoryScreen                       ← Story detail panel (journey, summary, places)
│   │   ├── WordStudyBrowseScreen                ← Browsable Hebrew/Greek lexicon
│   │   ├── WordStudyDetailScreen                ← Single word: glosses, range, occurrences
│   │   ├── ScholarBrowseScreen                  ← Grid of 43 scholars with era/tradition filter
│   │   └── ScholarBioScreen                     ← Full bio + links to their commentary panels
│   │
│   ├── SearchTab (SearchScreen)                 ← Full-text search: verses, people, places, words
│   │
│   └── SettingsTab (SettingsScreen)
│       ├── Translation toggle (NIV/ESV default)
│       ├── Font size adjustment
│       ├── Reading plan setup
│       ├── Notification preferences
│       ├── VHL highlight toggle (on/off)
│       └── About / credits / licenses
│
├── Modal: PersonSidebar                         ← Slide-in bio from any screen (tappable family links)
├── Modal: CrossRefPopup                         ← Tap a reference → inline verse preview without leaving page
├── Modal: WordStudyPopup                        ← Tap a highlighted word → instant word study card
└── Modal: ScholarInfoPopup                      ← Tap a scholar name → quick bio + "see full bio" link
```

### 2.2 — ChapterScreen (the critical screen)

This is where 90% of user time is spent. It must replicate the current experience:

```
ChapterScreen
├── Header (book name, chapter number, title)
├── ScrollView
│   ├── Section 1
│   │   ├── SectionHeader ("Verses 1-10 — Title")
│   │   ├── VerseBlock (verse text, tappable verse numbers)
│   │   ├── ButtonRow (collapsible panel triggers)
│   │   │   ├── HebrewButton
│   │   │   ├── ContextButton
│   │   │   ├── CrossRefButton
│   │   │   ├── MacArthurButton
│   │   │   ├── CalvinButton
│   │   │   ├── ... (dynamic based on scope)
│   │   └── PanelContainer (animated expand/collapse)
│   │       ├── HebrewPanel
│   │       ├── ContextPanel
│   │       ├── CrossRefPanel
│   │       └── ... (rendered from section_panels table)
│   ├── Section 2 (same structure)
│   ├── ... more sections
│   └── ScholarlyBlock (chapter-level panels)
│       ├── PeoplePanel
│       ├── TranslationPanel
│       ├── LiteraryStructurePanel
│       ├── HebrewReadingPanel
│       ├── ThemesRadarChart
│       ├── ThreadingPanel
│       ├── ReceptionPanel
│       ├── SourcesPanel
│       ├── TextualPanel
│       └── DebatePanel
├── BottomBar
│   ├── PrevChapter arrow
│   ├── Translation toggle (NIV ↔ ESV)
│   └── NextChapter arrow
```

### 2.3 — Data access layer

```typescript
// db/content.ts — SQLite query functions

import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('scripture.db');

export function getChapter(bookId: string, chapterNum: number) {
  return db.getFirstSync<Chapter>(
    'SELECT * FROM chapters WHERE book_id = ? AND chapter_num = ?',
    [bookId, chapterNum]
  );
}

export function getSections(chapterId: string) {
  return db.getAllSync<Section>(
    'SELECT * FROM sections WHERE chapter_id = ? ORDER BY section_num',
    [chapterId]
  );
}

export function getSectionPanels(sectionId: string) {
  return db.getAllSync<SectionPanel>(
    'SELECT * FROM section_panels WHERE section_id = ? ORDER BY panel_type',
    [sectionId]
  );
}

export function getVerses(bookId: string, chapter: number, translation: string) {
  return db.getAllSync<Verse>(
    'SELECT * FROM verses WHERE book_id = ? AND chapter_num = ? AND translation = ? ORDER BY verse_num',
    [bookId, chapter, translation]
  );
}

export function searchVerses(query: string, limit = 50) {
  return db.getAllSync<Verse>(
    'SELECT * FROM verses_fts WHERE text MATCH ? LIMIT ?',
    [query, limit]
  );
}
```

### 2.4 — Panel rendering system

Rather than 15+ bespoke panel components, build a **panel renderer** that maps `panel_type` to a rendering strategy:

```typescript
// components/panels/PanelRenderer.tsx

const PANEL_RENDERERS: Record<string, React.FC<{data: any}>> = {
  hebrew:   HebrewPanel,
  ctx:      ContextPanel,
  cross:    CrossRefPanel,
  mac:      CommentaryPanel,  // reused for all scholars
  calvin:   CommentaryPanel,
  netbible: CommentaryPanel,
  // ... all scholar keys map to CommentaryPanel
  // with the scholar's name/color passed as props
};

export function PanelRenderer({ panelType, data, scholar }) {
  const Component = PANEL_RENDERERS[panelType] || CommentaryPanel;
  return <Component data={JSON.parse(data)} scholar={scholar} />;
}
```

This means adding a new scholar in the future requires ZERO new components — just a database entry.

### 2.5 — Theme system

Replicate the dark-gold aesthetic:

```typescript
// theme/colors.ts
export const colors = {
  bg:       '#0c0a07',
  bg2:      '#18150f',
  fg:       '#e8dcc8',
  fg2:      '#a89a80',
  gold:     '#c9a84c',
  goldDim:  '#8a7635',
  accent:   '#d4a84b',
  crimson:  '#9e3a3a',  // MacArthur
  teal:     '#3a9e8a',  // Calvin
  // ... per-scholar colors from styles.css
};
```

### 2.6 — Visual Highlight Layer (VHL)

**What exists in PWA:** `vhl.js` (2.7KB) powers per-chapter colored keyword highlighting. Each chapter defines inline highlight word-groups (Hebrew terms in one color, divine names in another, key theological terms in a third). The `initVHL(GROUPS)` function is called per chapter with a data array of `{btnType, cssClass, words[]}`. Clicking a button-row toggle highlights/unhighlights the matching words in the verse text. The system is row-aware — it uses `hasBtnType()` guards to check which buttons exist per section.

**React Native equivalent:**

```typescript
// components/VerseText.tsx
// Renders verse text with VHL highlighting applied

interface VHLGroup {
  name: string;       // 'hebrew', 'divine', 'key'
  cssClass: string;   // maps to a color in the theme
  words: string[];    // words/phrases to highlight
  active: boolean;    // toggled by user
}

function VerseText({ text, vhlGroups }: { text: string, vhlGroups: VHLGroup[] }) {
  // Split text into spans, wrapping matched words in colored Text components
  // Active groups get their color applied; inactive groups render as normal text
  // Tap a word that matches a word-study entry → opens WordStudyPopup modal
}
```

**Data source:** `vhl_groups` SQLite table, loaded per chapter. Each chapter's VHL data is extracted from the inline `initVHL()` calls during Phase 0 HTML→JSON extraction.

**Complexity:** Medium. The word-matching and span-splitting logic is the challenge — must handle multi-word phrases, case-insensitive matching, and overlapping groups.

### 2.7 — Cross-Reference Engine

**What exists in PWA:** `cross-ref-engine.js` (5KB) + `cross-ref-ui.js` (9KB) + `cross-refs.js` (17KB). When a user taps a cross-reference like "Gen 12:1-3" inside any panel, the engine resolves the reference to actual verse text (from the loaded verse data) and displays it in an inline popup without navigating away from the current chapter. The popup shows the referenced text and a "Go to chapter" link.

**React Native equivalent:**

```typescript
// components/CrossRefPopup.tsx — Modal that appears on reference tap

function CrossRefPopup({ reference, onClose, onNavigate }) {
  const verses = useVersesByRef(reference); // SQLite query
  return (
    <Modal animationType="slide" transparent>
      <View style={styles.popupContainer}>
        <Text style={styles.refTitle}>{reference}</Text>
        {verses.map(v => <VerseText key={v.id} text={v.text} />)}
        <Button title="Go to chapter" onPress={() => onNavigate(reference)} />
      </View>
    </Modal>
  );
}
```

**Key requirement:** Every cross-reference string in every panel (commentary, context, cross-ref panels) must be tappable. This means the panel renderer must parse reference patterns (e.g., "Gen 12:1-3", "Matt 4:15-16", "Ps 23") from text and wrap them in `<TouchableOpacity>` components. The `verse-resolver.js` logic (15KB in PWA) must be ported — it handles range resolution, book-name abbreviations, multi-chapter references, etc.

**Complexity:** Medium-High. The verse resolution logic is non-trivial (handles "Gen 12:1-3", "1 Cor 15:32", "Ps 119:105", "Rev 21:1-4" etc.).

### 2.8 — Word Study System

**What exists in PWA:** `word-study.js` (18KB data) + `word-study-engine.js` (4.5KB) + `word-study-ui.js` (9KB). The lexicon currently has entries with: id, language (Hebrew/Greek), original script, transliteration, Strong's number, glosses array, semantic range paragraph, theological note, and occurrence list. The UI provides: (1) tap a highlighted Hebrew/Greek word in verse text → see its lexicon entry, and (2) a browsable word-study index page.

**React Native screens:**

1. **WordStudyBrowseScreen** — FlatList of all lexicon entries, filterable by language (Hebrew/Greek), searchable. Each row shows: original script, transliteration, primary gloss.
2. **WordStudyDetailScreen** — Full entry: original script (large), transliteration, Strong's number, all glosses, semantic range, theological note, occurrence list (tappable references → CrossRefPopup).
3. **WordStudyPopup (Modal)** — Triggered from VHL: when a highlighted word in verse text is tapped AND it matches a word-study entry, show a compact card with the key info + "See full study" link.

**Data source:** `word_studies` SQLite table.

**Complexity:** Medium. The browse/detail screens are standard. The inline-tap integration with VHL is the nuanced part.

### 2.9 — Interactive Timeline Component

**What exists in PWA:** `timeline-data.js` (75KB) with era definitions (9 eras, each with hex color and name) + per-chapter `tl-panel` sections. The timeline renders as a CSS-animated horizontal bar with proportional date placement (events positioned by year on a scaled axis), era-colored segments, and expandable event cards. All 879 chapters have timeline panels.

**React Native equivalent:**

```typescript
// components/TimelineBar.tsx — SVG-based proportional timeline

function TimelineBar({ events, eraColors, yearRange }) {
  // Uses react-native-svg to render:
  // 1. A horizontal axis with year markers
  // 2. Era-colored background segments
  // 3. Event dots/markers positioned proportionally by date
  // 4. Tappable events that expand to show description
  // 5. Highlight for "current chapter" event
  // Supports pinch-to-zoom for dense time periods
  // Scrollable horizontally within a ScrollView
}
```

**Key requirements:**
- Proportional date placement (not evenly spaced — 3000 BC to AD 100 spans 3100 years; events cluster around exodus, monarchy, exile, NT)
- Era segments colored to match the theme (primeval, patriarch, exodus, judges, kingdom, prophets, exile, intertestamental, NT)
- Current-chapter event highlighted with a glow/pulse
- Expandable event cards on tap
- Must handle both OT deep-time (creation → flood → Abraham) and NT compressed-time (3 years of ministry)

**Complexity:** High. This is a custom SVG component, not a library drop-in. The proportional date math and responsive scaling are the hard parts.

### 2.10 — Genealogy Tree Screen

**What exists in PWA:** `people.html` (32KB) — a fully built D3.js interactive genealogy tree:
- 211 people rendered as a zoomable/pannable SVG tree (0.15x–3x scale via `d3.zoom()`)
- Spine nodes (Adam→Seth→...→Abraham→...→David→...→Jesus) rendered larger in gold
- Satellite nodes (siblings, minor figures) smaller, era-colored
- Spouse positioning: horizontal marriage bars with double-tick symbols, multi-wife vertical staggering (Jacob↔Rachel+Leah+Bilhah+Zilpah)
- Era filtering (9 eras): dims non-matching nodes while keeping spine visible
- Bio panel: desktop = 340px right sidebar; mobile = bottom sheet
- Full bio: name, era badge, dates, role, bio paragraph, scriptureRole, family links (tappable: Father→Mother→Spouse→Children chain navigation), scripture references, "Go to chapter" link
- Person search with autocomplete dropdown + auto-pan/zoom to found node
- Deep-link support (`people.html#abraham` opens bio + centers tree)
- Responsive: desktop uses mouse wheel zoom; mobile uses pinch-to-zoom + drag
- Resize-safe: preserves zoom/pan transform across window resizes

**React Native approach — Phase 1 (WebView wrapper):**

```typescript
// screens/GenealogyTreeScreen.tsx

function GenealogyTreeScreen() {
  const webViewRef = useRef<WebView>(null);

  const onMessage = (event) => {
    const data = JSON.parse(event.nativeEvent.data);
    if (data.type === 'openBio') navigation.navigate('PersonDetail', { id: data.personId });
    if (data.type === 'goToChapter') navigation.navigate('Chapter', { ref: data.chapter });
  };

  return (
    <WebView
      ref={webViewRef}
      source={{ uri: 'bundled-assets/people.html' }}
      onMessage={onMessage}
      // Inject: override showBio() to postMessage to RN instead of rendering HTML bio panel
      injectedJavaScript={`
        window.ReactNativeWebView = true;
        const originalShowBio = showBio;
        showBio = function(d) {
          window.ReactNativeWebView.postMessage(JSON.stringify({type:'openBio', personId:d.id}));
        };
      `}
    />
  );
}
```

Bundle `people.html` + `people-data.js` + `d3.min.js` + `people.css` as local assets in the app.

**Phase 2 (pure native, post-launch evaluation):** Replace WebView with `react-native-svg` + `d3-hierarchy` (layout math only, no DOM). This would require reimplementing: the tree layout, spouse positioning, marriage bars, zoom/pan gestures (`react-native-gesture-handler`), era filtering, node rendering. Estimated: 2-3 weeks standalone.

**Complexity:** Low for WebView wrapper (1-2 days). High for pure-native rewrite (2-3 weeks).

### 2.11 — Biblical World Map Screen

**What exists in PWA:** `map.html` (94KB) — a fully built Leaflet.js interactive map:
- ESRI World Physical tiles with sepia CSS filter (parchment look)
- 60+ places with: id, ancient name, modern name, lat/lon, type (city/water/region/mountain/site), priority, label direction
- Custom markers: Cinzel-font labels that scale with zoom level, type-specific symbols (mountain triangle, dot for cities, italic for water), zoom-responsive sizing
- 15+ narrative "Stories" spanning all eras: each has a summary paragraph, place references, region polygons (with dashed borders and semi-transparent fill), journey polylines (with directional arrows, dashed for return journeys), and links back to chapter content
- Story panel: desktop = 340px side panel; mobile = 50vh bottom sheet with drag handle
- Ancient↔Modern name toggle on all markers simultaneously
- Era filtering: filter stories AND dim non-matching place markers
- Place chips in story panels that pan the map to that location
- Story picker: scrollable button row organized by era
- Chapter-linking: story panels have "Go to chapter" links
- Loading overlay with parchment-colored spinner

**React Native approach — pure native (react-native-maps):**

```typescript
// screens/MapScreen.tsx

function MapScreen() {
  const [places] = usePlaces();          // from SQLite
  const [stories] = useMapStories();      // from SQLite
  const [selectedStory, setStory] = useState(null);
  const [showModern, setShowModern] = useState(false);
  const mapRef = useRef<MapView>(null);

  return (
    <View style={{ flex: 1 }}>
      <EraFilterBar onSelect={filterByEra} />
      <MapView
        ref={mapRef}
        provider={PROVIDER_DEFAULT}   // Apple Maps on iOS, Google on Android
        style={{ flex: 1 }}
        initialRegion={{ latitude: 31, longitude: 36, latDelta: 15, lonDelta: 20 }}
        mapType="terrain"
      >
        {places.map(p => (
          <Marker key={p.id} coordinate={{ latitude: p.latitude, longitude: p.longitude }}>
            <PlaceLabel place={p} showModern={showModern} />
          </Marker>
        ))}
        {selectedStory?.regions.map(r => (
          <Polygon key={r.label} coordinates={r.coords} strokeColor={r.color}
                   fillColor={r.color + '33'} strokeWidth={2} lineDashPattern={[6,4]} />
        ))}
        {selectedStory?.paths.map(seg => (
          <Polyline key={seg.label} coordinates={seg.coords} strokeColor={eraColor}
                    strokeWidth={3} lineDashPattern={seg.dashed ? [8,5] : null} />
        ))}
      </MapView>
      <StoryPicker stories={stories} onSelect={setStory} />
      {selectedStory && <StoryPanel story={selectedStory} onClose={() => setStory(null)} />}
      <FloatingControls onToggleNames={() => setShowModern(!showModern)} onCenter={centerMap} />
    </View>
  );
}
```

**Key differences from PWA:**
- No sepia tile filter (react-native-maps doesn't support CSS filters on tiles). Alternatives: use a custom map style (Mapbox) or accept standard terrain tiles.
- Custom marker labels (Cinzel font, zoom-scaling) will need `<Marker><View>...</View></Marker>` custom components instead of Leaflet's `L.divIcon`.
- Story panel: implement as a native bottom sheet (`@gorhom/bottom-sheet`) instead of CSS transitions.
- Arrow markers on journey endpoints: custom `<Marker>` with rotated SVG arrow.

**Why NOT WebView for the map:** Unlike the genealogy tree, the map benefits significantly from native rendering — native maps have better performance, gesture handling, and offline tile caching than Leaflet in a WebView. The data model (places + stories + polygons + polylines) maps cleanly to react-native-maps primitives.

**Data source:** `places`, `map_stories`, `place_stories` SQLite tables.

**Complexity:** High. The custom markers, story overlays, and responsive behavior are substantial. Estimated: 1-2 weeks.

### 2.12 — Parallel / Synoptic Passage Screen

**What exists in PWA:** `synoptic-map.js` (10KB) maps parallel passages across the Gospels (and some OT parallels). `synoptic.js` renders a banner showing which other Gospels share the current passage, with links to jump between them.

**React Native screen:**

```typescript
// screens/ParallelPassageScreen.tsx
// Side-by-side or tabbed view of parallel passages

function ParallelPassageScreen({ pericope }) {
  // pericope = { id, title, passages: { matthew: "26:17-30", mark: "14:12-26", luke: "22:7-23", john: "13:1-30" } }
  const [activeTab, setActiveTab] = useState('side-by-side'); // or 'tabbed'

  // Side-by-side mode: 2 scrollable columns, synced scroll position
  // Tabbed mode: swipeable tabs for each Gospel
  // Each column shows verse text from the respective Gospel
  // Differences highlighted (words unique to one Gospel in accent color)
  // Tap any verse → CrossRefPopup with the parallel in other Gospels
}
```

**Data source:** `synoptic_map` SQLite table. Verse text from `verses` table.

**Complexity:** Medium. The synced-scroll side-by-side view is the UX challenge.

### 2.13 — Scholar Browse & Bio System

**What exists in PWA:** 43 bio pages in `commentators/` with: bio header (name, tradition, era), eyebrow subtitle, multi-section body (biography, significance, recommended reading, etc.), "Other Scholars" grid at the bottom, and a dropdown navigator between all scholars. `commentator-nav.js` builds the dropdown + grid dynamically from `scholar-data.js`. From chapter panels, tapping a scholar name links to their bio page.

**React Native screens:**

1. **ScholarBrowseScreen** — Grid/list of all 43 scholars, filterable by tradition (Reformed, Catholic, Jewish, Critical, Evangelical, etc.) and era. Each card shows: name, tradition badge, scope summary ("Genesis, Exodus" or "All books").
2. **ScholarBioScreen** — Full bio with sections. "Other Scholars" grid at bottom. "See their commentary" button → navigates to a chapter where their panel is active.
3. **ScholarInfoPopup (Modal)** — When reading a chapter and tapping a scholar's name badge on their commentary panel, show a quick-info card with "See full bio" link.

**Navigation integration:** From any commentary panel (e.g., `com-oswalt` in Isaiah 1), tapping "Oswalt" opens ScholarInfoPopup. From the popup, "See full bio" navigates to ScholarBioScreen. From ScholarBioScreen, "See their commentary in Isaiah 1" navigates back to ChapterScreen with that panel pre-opened.

**Data source:** `scholars` + `scholar_bios` SQLite tables. `scholar-scopes.json` for which books each scholar covers.

**Complexity:** Medium. Standard CRUD screens with filtering. The cross-linking between scholar bios and chapter panels is the integration challenge.

---

## Phase 3: Feature Parity (Weeks 7-12)
*Updated timeline: 7-12 weeks (was 7-10) to account for the 8 features the original plan missed*

Build each feature to match the PWA:

### 3.1 — Must-have features (launch blockers)

| # | Feature | Complexity | Notes |
|---|---------|-----------|-------|
| 1 | Chapter reading with verse display | Medium | Core screen. §2.2 |
| 2 | NIV/ESV translation toggle | Low | State toggle + re-query |
| 3 | Section panels (all 15+ types) | High | Panel renderer system. §2.4 |
| 4 | Animated panel expand/collapse | Medium | `react-native-reanimated` |
| 5 | Chapter navigation (prev/next) | Low | Stack navigation |
| 6 | Book list with OT/NT tabs | Low | FlatList + tabs |
| 7 | Book intro pages | Medium | Render from book_intros table |
| 8 | Search (books, chapters, verses, people, places) | Medium | SQLite FTS5 |
| 9 | Person sidebar with bio + family links | Medium | Modal + slide animation. §2.10 |
| 10 | Themes radar chart | Medium | Victory-native SVG chart |
| 11 | Offline capability | Free | SQLite is always local |
| 12 | **VHL keyword highlighting** | Medium | Per-chapter color-coded word groups in verse text. §2.6 |
| 13 | **Cross-reference engine + popup** | Medium-High | Tap any reference → inline verse preview. Verse resolver logic. §2.7 |
| 14 | **Word study system** | Medium | Browse screen + detail screen + inline tap-to-study from VHL. §2.8 |
| 15 | **Interactive timeline** | High | SVG proportional timeline with era colors, expandable events. §2.9 |
| 16 | **Genealogy tree** | Low-Medium | WebView wrapper for D3 tree + native bio bridge. §2.10 |
| 17 | **Biblical world map** | High | react-native-maps with 60+ places, 15+ story journeys, overlays. §2.11 |
| 18 | **Parallel / synoptic passages** | Medium | Side-by-side Gospel comparison. §2.12 |
| 19 | **Scholar browse + bios** | Medium | 43 scholars, tradition filter, cross-linked to panels. §2.13 |

### 3.2 — Enhancement features (post-launch or v1.1)

| # | Feature | Complexity | Notes |
|---|---------|-----------|-------|
| 20 | Push notifications (daily verse) | Medium | expo-notifications + server |
| 21 | Reading plans with progress tracking | Medium | New SQLite tables + UI |
| 22 | Text-to-speech (read chapter aloud) | Low | expo-speech |
| 23 | User notes and highlights | Medium | SQLite user_notes table |
| 24 | Bookmarks | Low | SQLite bookmarks table |
| 25 | Font size adjustment | Low | Zustand preference store |
| 26 | Share verse as image | Medium | React-native-view-shot |
| 27 | Widget (verse of the day) | High | Platform-specific native code |
| 28 | Apple Watch / WearOS | High | Separate native extensions |
| 29 | Siri Shortcuts / Google Assistant | Medium | expo-shortcuts or native |
| 30 | Cross-device sync (accounts) | High | Requires backend (Firebase/Supabase) |
| 31 | Social features (shared reading plans) | High | Requires backend |
| 32 | Genealogy tree: pure-native migration | High | Replace WebView D3 with react-native-svg + d3-hierarchy. §2.10 Phase 2 |
| 33 | Map: custom tile styling | Medium | Mapbox tiles for parchment aesthetic (replaces ESRI sepia filter) |
| 34 | Synoptic: difference highlighting | Medium | Highlight words unique to one Gospel in the parallel view |
| 35 | Audio Bible integration | High | License needed + streaming/download |

---

## Phase 4: Content Pipeline Integration (Weeks 12-13)

### 4.1 — Dual-target build system

Modify the existing `shared.py` so that every build operation produces content for both targets:

```
Generator script → build_chapter() → {
  1. HTML file (for PWA, as before)
  2. JSON file (for content/ directory)
  3. SQLite update (via build_sqlite.py)
}
```

The PWA continues to work exactly as before. The mobile app reads from SQLite. Both are generated from the same source.

### 4.2 — Content update strategy

**Initial release:** The SQLite database ships bundled in the app binary. All 879+ chapters are included.

**Updates:** When new chapters are built:
1. Rebuild the SQLite database (takes seconds)
2. For the PWA: push to GitHub as usual
3. For the app: use `expo-updates` (OTA) to push the new database WITHOUT requiring a store update

This means new chapters can go live on both platforms within minutes of being built, without waiting for App Store review.

### 4.3 — OTA content updates

```typescript
// updates/content-updater.ts
import * as Updates from 'expo-updates';

export async function checkForContentUpdate() {
  const update = await Updates.checkForUpdateAsync();
  if (update.isAvailable) {
    await Updates.fetchUpdateAsync();
    // Prompt user to restart, or auto-restart
    await Updates.reloadAsync();
  }
}
```

The SQLite `.db` file is included in the OTA bundle. When it changes, Expo pushes the delta. Users get new chapters without opening the App Store.

---

## Phase 5: Native-Only Enhancements (Weeks 13-16)

These are features that ONLY a native app can provide — the justification for Option 3 over Option 2:

### 5.1 — Push notifications

- **Daily verse:** Random verse at user-chosen time
- **Reading plan reminders:** "You're 3 chapters behind in your Isaiah plan"
- **New content alerts:** "Jeremiah chapters 1-7 just went live"

Requires a lightweight backend (Firebase Cloud Messaging or Expo Push Notifications service).

### 5.2 — Text-to-speech

```typescript
import * as Speech from 'expo-speech';

function readChapterAloud(verses: Verse[]) {
  const text = verses.map(v => `Verse ${v.verse_num}. ${v.text}`).join(' ');
  Speech.speak(text, {
    language: 'en-US',
    rate: 0.9,
    onDone: () => markChapterAsRead(verses[0].book_id, verses[0].chapter_num),
  });
}
```

### 5.3 — Verse sharing as image

Generate shareable verse cards:
```
┌──────────────────────────┐
│                          │
│   "For to us a child     │
│    is born..."           │
│                          │
│   — Isaiah 9:6 (NIV)    │
│                          │
│   Scripture Deep Dive    │
└──────────────────────────┘
```

### 5.4 — Widget (iOS / Android)

- iOS: WidgetKit extension showing verse of the day
- Android: App Widget showing verse of the day + reading progress

Both require platform-specific native code but Expo supports custom native modules.

---

## Phase 6: Store Submission (Weeks 14-16)

### 6.1 — App Store requirements

| Requirement | Status |
|-------------|--------|
| App icon (1024×1024) | ✅ Have the cross/Bible image |
| Screenshots (6.7", 6.5", 5.5" for iOS) | Need to generate |
| App description | Write from site content |
| Privacy policy | Required — create simple page |
| Age rating | 4+ (religious content, no objectionable material) |
| Apple Developer Account | $99/year — need to create |
| Category | Reference > Bible Study |

### 6.2 — Google Play requirements

| Requirement | Status |
|-------------|--------|
| Feature graphic (1024×500) | Need to create |
| Screenshots | Need to generate |
| Short description (80 chars) | Write |
| Full description (4000 chars) | Write from site content |
| Privacy policy | Same as iOS |
| Google Play Developer Account | $25 one-time |
| Content rating | IARC questionnaire |

### 6.3 — App review risks

**Apple:** Apple rejects "wrapper" apps that just show a website in a WebView. This is NOT that — it's a native React Native app with a SQLite database, native navigation, push notifications, and native features. Should pass review. Key differentiators to emphasise: offline database, native search, TTS, notifications, widgets.

**Google:** Generally less strict. The main concern is content policy — religious content is fine as long as it's not hate speech. This app is scholarly and positive.

---

## Phase 7: Ongoing Operations

### 7.1 — Content workflow (post-launch)

```
1. Write chapter content (same generator scripts)
2. Run build_chapter() → produces HTML + JSON
3. Run build_sqlite.py → updates scripture.db
4. Git push → PWA goes live immediately
5. Run eas update → mobile app gets OTA content update
```

No store review needed for content updates. Only structural app changes (new screens, new features) require store submission.

### 7.2 — Analytics to add

- Chapter view counts (which chapters are most read?)
- Panel open rates (which scholarly panels do users actually use?)
- Search queries (what are people looking for?)
- Session duration (how long do users study?)
- Reading plan completion rates
- Crash reports

### 7.3 — Future features roadmap

| Feature | Priority | Effort |
|---------|----------|--------|
| Audio Bible integration | High | Medium (license needed) |
| Community reading plans | Medium | High (backend needed) |
| Cross-device sync | Medium | High (accounts + backend) |
| Hebrew/Greek keyboard for word study | Low | Medium |
| AR: walk through the tabernacle/temple | Low | Very High |
| Apple Vision Pro spatial Bible study | Low | Very High |

---

## Migration Timeline Summary

| Phase | Duration | Deliverable |
|-------|----------|-------------|
| **Phase 0:** Data Layer | Weeks 1-3 | JSON content files + SQLite database + dual-target pipeline. Extract map/VHL/scholar data from inline HTML. |
| **Phase 1:** Project Setup | Weeks 3-4 | Expo project, navigation, theme, database access, WebView bridge |
| **Phase 2:** Core Architecture | Weeks 4-8 | ChapterScreen, panel system, VHL, cross-ref engine, word study, timeline, genealogy tree (WebView), map, synoptic view, scholar browse. All §2.x components. |
| **Phase 3:** Feature Parity | Weeks 8-12 | All 19 must-have features matching the PWA. Full QA pass. |
| **Phase 4:** Pipeline Integration | Weeks 12-13 | Dual-target builds, OTA content updates |
| **Phase 5:** Native Enhancements | Weeks 13-16 | Push notifications, TTS, sharing, widgets |
| **Phase 6:** Store Submission | Weeks 16-18 | App Store + Google Play submission and review |

**Total: ~18 weeks (4.5 months) for a solo developer.** (Was 16 weeks before the feature audit added 8 missed components.)

The 2-week increase comes from:
- Map screen (react-native-maps with 60+ places, 15+ stories, overlays): +1 week
- Timeline SVG component (custom proportional rendering): +0.5 week
- VHL + word study + cross-ref engine integration: +0.5 week
- Scholar browse system with cross-linking: included in existing timeline
- Parallel passages: included in existing timeline
- Genealogy tree WebView wrapper: minimal overhead (1-2 days)

---

## What Continues in Parallel

The PWA remains live throughout. Content building continues normally:
- Isaiah enrichment (44 chapters remaining)
- Kings/Chronicles MacArthur (112 chapters)
- Jeremiah (52 chapters) and Ezekiel (48 chapters)
- Remaining 36 books (301 chapters)

The only change to the content workflow is Phase 0's addition of JSON output. Everything else is additive.

---

## Cost Estimate

| Item | Cost | Frequency |
|------|------|-----------|
| Apple Developer Account | $99 | Annual |
| Google Play Developer Account | $25 | One-time |
| Expo EAS Build (free tier) | $0 | 30 builds/month |
| Push notification service (Expo) | $0 | Up to 1,000 users free |
| Firebase (if sync needed later) | $0 | Spark plan is free |
| GitHub Pages (PWA hosting) | $0 | Unchanged |
| **Total Year 1** | **$124** | |
| **Total Year 2+** | **$99/year** | |

The architecture deliberately avoids recurring server costs. Everything is static/bundled.
