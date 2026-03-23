# Scripture Deep Dive — React Native Migration Plan

## Executive Summary

**Current state:** A static PWA (HTML + JS + CSS) hosted on GitHub Pages with 879 chapters, 28MB of scholarly HTML content, 51MB of verse data, and 30 interactive features. All scholarly content is embedded directly in HTML files — there is no structured content database.

**Target state:** A cross-platform React Native app (iOS + Android) with an offline-first SQLite database, native navigation, and the same rich scholarly experience — plus features impossible in a PWA (push notifications, widgets, watch apps, Siri/Google Assistant, background audio TTS).

**The critical challenge:** The 28MB of scholarly content (commentary, cross-refs, Hebrew studies, context notes, etc.) exists ONLY as rendered HTML. The generator scripts that produced it were ephemeral — run once, then deleted. There is no structured JSON database of this content. Phase 0 of the migration is extracting this data back into structured format and *changing the build pipeline so this never happens again*.

**Timeline estimate:** 4-5 months for a solo developer, 2-3 months with two. The plan is designed to be done incrementally — the PWA stays live throughout and is never disrupted.

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
| `js/pages/people-data.js` (196KB) | `content/meta/people.json` | Strip wrapper, parse |
| `js/pages/people-index.js` (26KB) | Derived from people.json at build time | Not stored separately |
| `js/pages/timeline-data.js` (75KB) | `content/meta/timelines.json` | Strip wrapper, parse |
| `data/cross-refs.js` (17KB) | `content/meta/cross-refs.json` | Strip wrapper, parse |
| `data/word-study.js` (18KB) | `content/meta/word-studies.json` | Strip wrapper, parse |
| `data/synoptic-map.js` (10KB) | `content/meta/synoptic.json` | Strip wrapper, parse |
| `verses/niv/ot/*.js` + `verses/esv/ot/*.js` | `content/verses/{translation}/{book}.json` | Already JSON-like, strip var wrapper |
| `_tools/config.py` SCHOLAR_REGISTRY | `content/meta/scholars.json` | Export to JSON |
| `_tools/config.py` COMMENTATOR_SCOPE | `content/meta/scholar-scopes.json` | Export to JSON |
| `_tools/config.py` BOOK_META | `content/meta/books.json` | Export to JSON |

**Estimated effort:** 1 day with a conversion script.

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
```

**Database size estimate:**
- Verses: ~31,000 rows × 2 translations × ~80 bytes avg = ~5MB
- Sections + panels: ~1,800 sections × ~5KB avg panel data = ~9MB
- Chapter panels: ~879 chapters × ~3KB avg = ~2.6MB
- People, scholars, intros: ~1MB
- **Total: ~18MB compressed** (SQLite compresses well)

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
│   ├── HomeTab (HomeScreen)                    ← Hero, book grid, search
│   ├── ReadTab (StackNavigator)
│   │   ├── BookListScreen                      ← OT/NT book list
│   │   ├── ChapterListScreen                   ← Chapters for a book
│   │   ├── ChapterScreen                       ← THE main reading screen
│   │   └── BookIntroScreen                     ← "How to Read" intro
│   ├── SearchTab (SearchScreen)                ← Full-text search
│   ├── PeopleTab (StackNavigator)
│   │   ├── PeopleListScreen                    ← Alphabetical/era browse
│   │   └── PersonDetailScreen                  ← Full bio
│   └── SettingsTab (SettingsScreen)
│       ├── Translation toggle (NIV/ESV)
│       ├── Font size
│       ├── Reading plan setup
│       ├── Notification preferences
│       └── About / credits
│
├── Modal: PersonSidebar                        ← Slide-in bio (from any screen)
├── Modal: ScholarBio                           ← Scholar info
└── Modal: CrossRefPreview                      ← Quick verse preview popup
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

---

## Phase 3: Feature Parity (Weeks 7-10)

Build each feature to match the PWA:

### 3.1 — Must-have features (launch blockers)

| # | Feature | Complexity | Notes |
|---|---------|-----------|-------|
| 1 | Chapter reading with verse display | Medium | Core screen |
| 2 | NIV/ESV translation toggle | Low | State toggle + re-query |
| 3 | Section panels (all 15+ types) | High | Panel renderer system |
| 4 | Animated panel expand/collapse | Medium | `react-native-reanimated` |
| 5 | Chapter navigation (prev/next) | Low | Stack navigation |
| 6 | Book list with OT/NT tabs | Low | FlatList + tabs |
| 7 | Book intro pages | Medium | Render from book_intros table |
| 8 | Search (books, chapters, verses, people) | Medium | SQLite FTS5 |
| 9 | Person sidebar with bio | Medium | Modal + slide animation |
| 10 | Scholar bio pages | Low | Simple detail screen |
| 11 | Themes radar chart | Medium | Victory-native SVG chart |
| 12 | Offline capability | Free | SQLite is always local |

### 3.2 — Enhancement features (post-launch or v1.1)

| # | Feature | Complexity | Notes |
|---|---------|-----------|-------|
| 13 | Push notifications (daily verse) | Medium | expo-notifications + server |
| 14 | Reading plans with progress tracking | Medium | New SQLite tables + UI |
| 15 | Text-to-speech (read chapter aloud) | Low | expo-speech |
| 16 | User notes and highlights | Medium | SQLite user_notes table |
| 17 | Bookmarks | Low | SQLite bookmarks table |
| 18 | Font size adjustment | Low | Zustand preference store |
| 19 | Share verse as image | Medium | React-native-view-shot |
| 20 | Widget (verse of the day) | High | Platform-specific native code |
| 21 | Apple Watch / WearOS | High | Separate native extensions |
| 22 | Siri Shortcuts / Google Assistant | Medium | expo-shortcuts or native |
| 23 | Cross-device sync (accounts) | High | Requires backend (Firebase/Supabase) |
| 24 | Social features (shared reading plans) | High | Requires backend |

---

## Phase 4: Content Pipeline Integration (Weeks 10-11)

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

## Phase 5: Native-Only Enhancements (Weeks 11-14)

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
| **Phase 0:** Data Layer | Weeks 1-3 | JSON content files + SQLite database + dual-target pipeline |
| **Phase 1:** Project Setup | Weeks 3-4 | Expo project, navigation, theme, database access |
| **Phase 2:** Core Architecture | Weeks 4-7 | ChapterScreen, panel system, search, all data rendering |
| **Phase 3:** Feature Parity | Weeks 7-10 | All 12 must-have features matching the PWA |
| **Phase 4:** Pipeline Integration | Weeks 10-11 | Dual-target builds, OTA content updates |
| **Phase 5:** Native Enhancements | Weeks 11-14 | Push notifications, TTS, sharing, widgets |
| **Phase 6:** Store Submission | Weeks 14-16 | App Store + Google Play submission and review |

**Total: ~16 weeks (4 months) for a solo developer.**

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
