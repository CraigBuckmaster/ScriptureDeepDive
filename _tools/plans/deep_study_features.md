# ScriptureDeepDive — Deep Study Features: Engineering Plan

**Author:** Architecture Session — Chat 8  
**Date:** March 2026  
**Status:** Planning  
**Target:** 5 features, 10 implementation phases  

---

## 1. Design Principles

Every decision in this plan follows four principles, in priority order:

1. **Performance** — Static files, lazy loading, no render-blocking. Data loads only when needed. First meaningful paint under 1s on 3G.
2. **Maintenance** — Single source of truth for every data type. No hardcoding. Adding a cross-reference or word study entry is a one-file edit.
3. **UI/UX** — Consistent dark scholarly aesthetic. Mobile-first. Progressive disclosure — simple surface, depth on demand. Every interaction reversible.
4. **Readability** — Every JS file has a header comment explaining what it does, what it depends on, and who calls it. Functions named for what they do, not how. Data files self-documenting with inline comments.

---

## 2. Architecture Overview

### 2.1 Layers

```
┌─────────────────────────────────────────────────────┐
│  UI Layer          │ Chapter pages, standalone pages │
├─────────────────────────────────────────────────────┤
│  Feature Logic     │ One JS file per feature         │
├─────────────────────────────────────────────────────┤
│  Shared Services   │ verse-resolver.js, storage.js   │
├─────────────────────────────────────────────────────┤
│  Data Layer        │ External JS data files           │
├─────────────────────────────────────────────────────┤
│  Infrastructure    │ SW cache, base.css, styles.css   │
└─────────────────────────────────────────────────────┘
```

### 2.2 New Shared Services (Phase 0 — Foundation)

Two utility modules that multiple features depend on. Build these first.

**`verse-resolver.js`** (~2KB)  
Canonical verse addressing. Every feature needs to go from a string like `"Gen 22:1-3"` or `"Heb 11:17"` to a URL, book key, chapter number, and verse range — and back.

```js
// verse-resolver.js — canonical verse addressing for Scripture Deep Dive
//
// Usage:
//   var v = VerseResolver.parse("Gen 22:1-3");
//   // → { book: "genesis", bookName: "Genesis", ch: 22, v1: 1, v2: 3,
//   //     url: "ot/genesis/Genesis_22.html", ref: "Genesis 22:1-3" }
//
//   var url = VerseResolver.toUrl("Heb 11:17");
//   // → "nt/hebrews/Hebrews_11.html"
//
//   var display = VerseResolver.toShort("Genesis 22:1");
//   // → "Gen 22:1"
//
// Depends on: books.js (window.BOOKS) — only for validation.
// Consumed by: cross-ref-engine.js, word-study.js, annotations.js, synoptic.js
```

This replaces ad-hoc ref parsing scattered across files. Single canonical parser. Handles all abbreviation formats (Gen, Ge, 1Ki, 1 Kgs, etc). Maps every book to its directory path, testament, and live status. Fails gracefully on unknown books (returns null, doesn't throw).

The abbreviation table is a data object at the top of the file — easy to read, easy to extend:

```js
var ABBREVS = {
  'gen': 'genesis', 'ge': 'genesis', 'gn': 'genesis',
  'exod': 'exodus', 'ex': 'exodus', 'exo': 'exodus',
  '1ki': '1_kings', '1kgs': '1_kings', '1 kings': '1_kings',
  // ... complete table
};
```

**`study-storage.js`** (~3KB)  
Thin wrapper around `window.storage` (the persistent storage API available in the PWA) for the personal annotations feature. Provides a clean CRUD interface with optimistic reads, write debouncing, and offline resilience.

```js
// study-storage.js — personal study data persistence
//
// Usage:
//   await StudyStorage.saveNote("Gen 22:1", "The Akedah...");
//   var notes = await StudyStorage.getNotesForChapter("genesis", 22);
//   await StudyStorage.deleteNote("Gen 22:1", noteId);
//
// Storage keys: "notes:{book}:{ch}" → JSON array of { id, verse, text, created, updated }
// All data is personal (shared: false).
//
// Depends on: window.storage (PWA persistent storage API)
// Consumed by: annotations.js
```

Key design decisions:
- Notes grouped by chapter (one storage key per chapter, not per verse) to minimize API calls
- Each note has a UUID `id` for stable references
- `updated` timestamp for conflict-free merge if we ever add sync
- All reads wrapped in try-catch with empty-array fallback
- Writes debounced at 500ms to avoid hammering storage on rapid typing

---

## 3. Feature Specifications

### 3.1 Feature A: Cross-Reference Threading

**What it does:** From any verse with cross-references, follow a theological thread across the canon. Start at Gen 22 → Heb 11:17 → Rom 8:32 → John 3:16 — seeing how one concept develops.

**Data file: `data/cross-refs.js`** (~100-200KB estimated)

```js
// cross-refs.js — canonical cross-reference database
// Format: array of thread objects, each with an ID, theme label, and verse chain.
// Threads are curated, not auto-generated. Each represents a genuine theological arc.
//
// To add a thread: append one object to CROSS_REF_THREADS.
// To add a cross-ref pair: add to CROSS_REF_PAIRS (bidirectional).

window.CROSS_REF_THREADS = [
  {
    id: "akedah-to-calvary",
    theme: "Substitutionary Sacrifice",
    tags: ["sacrifice", "atonement", "typology"],
    chain: [
      { ref: "Gen 22:1-14", note: "Abraham offers Isaac; God provides the ram" },
      { ref: "Exod 12:1-13", note: "Passover lamb — blood on the doorposts" },
      { ref: "Isa 53:7", note: "Led like a lamb to the slaughter" },
      { ref: "John 1:29", note: "Behold, the Lamb of God" },
      { ref: "Heb 11:17-19", note: "By faith Abraham offered Isaac" },
      { ref: "Rom 8:32", note: "He who did not spare his own Son" }
    ]
  },
  // ...
];

// Bidirectional pairs for simpler connections
window.CROSS_REF_PAIRS = [
  { a: "Gen 1:1", b: "John 1:1", note: "In the beginning — creation and incarnation" },
  { a: "Gen 3:15", b: "Rev 12:1-5", note: "Protoevangelium — seed of the woman" },
  // ...
];
```

**Logic file: `cross-ref-engine.js`** (~4KB)

```
// Depends on: verse-resolver.js, data/cross-refs.js, books.js
// Consumed by: chapter pages (injected via cross-ref-ui.js)
//
// Core functions:
//   CrossRef.getThreadsForVerse(ref) → threads containing this verse
//   CrossRef.getPairsForVerse(ref)   → simple bidirectional links
//   CrossRef.getThread(threadId)     → full thread chain
//   CrossRef.searchThreads(query)    → text search across themes/tags
```

**UI integration: `cross-ref-ui.js`** (~5KB)

Lives in each chapter page (loaded after cross-ref-engine.js). Enhances existing cross-reference panels:

- **Thread badge:** If a verse appears in a curated thread, its cross-ref panel shows a gold "Thread →" badge. Tap it to open a slide-in **thread viewer** — a vertical timeline of the chain, current verse highlighted, each stop showing the verse text snippet and a one-line note. Tap any stop to navigate there.
- **Breadcrumb bar:** When you navigate to a verse via a thread, a thin bar appears below the sticky nav: `Substitutionary Sacrifice: Gen 22 → Exod 12 → **Isa 53** → John 1 → Heb 11 → Rom 8`. You can step forward/back through the chain. Dismiss to exit thread mode.
- **Thread panel on homepage:** A "Explore Threads" section — searchable grid of all curated threads, filterable by tag. Good entry point for thematic study.

**Build approach:** Data is curated per book as chapters are built. `gen_1kings.py` etc. already produces cross-ref panel content — extend the gen scripts to also emit entries into a cross-ref data file. Or maintain cross-refs.js independently and hydrate panels at runtime.

---

### 3.2 Feature B: Personal Annotations

**What it does:** Tap any verse to add a personal note. Notes persist across sessions. View all your notes for a chapter, a book, or the whole Bible.

**Data:** No external data file — all data lives in `window.storage` (personal, per-user).

**Logic file: `annotations.js`** (~6KB)

```
// Depends on: study-storage.js, verse-resolver.js
// Consumed by: chapter pages
//
// Core functions:
//   Annotations.init(bookKey, chapterNum) — scan page for verses, add note icons
//   Annotations.openEditor(verseRef)      — open inline editor below verse
//   Annotations.save(verseRef, text)      — persist via StudyStorage
//   Annotations.delete(verseRef, noteId)  — remove a note
//   Annotations.getChapterNotes(book, ch) — load all notes for display
//   Annotations.exportAll()               — JSON export of all notes
```

**UI design:**

- **Note indicator:** Small amber quill icon appears in the margin of any verse that has a note. Subtle — doesn't compete with scholar buttons.
- **Inline editor:** Tap the quill (or tap the verse text itself if no quill yet) → a textarea expands below the verse with the same dark aesthetic. Auto-saves on blur/debounce. Markdown-light: bold, italic, verse references auto-linked.
- **Chapter notes summary:** A "My Notes" button in the chapter header opens a slide panel showing all your notes for this chapter, ordered by verse. Each note shows the verse reference, your text, and a timestamp.
- **Study journal page:** New standalone page `journal.html` — thin HTML shell loading `annotations.js` + `study-storage.js`. Shows all notes across all books, grouped by book → chapter → verse. Searchable. Export as JSON or plain text.

**Key UX decisions:**
- Notes are verse-level, not section-level. One note per verse, editable.
- No rich text — plain text with minimal markdown. Keeps storage small, export clean.
- Notes survive chapter rebuilds (keyed by canonical ref, not DOM position).
- "My Notes" count appears as a badge on the chapter header button.

---

### 3.3 Feature C: Parallel Passage Comparison (Synoptic Viewer)

**What it does:** Side-by-side display of parallel Gospel accounts (and parallel passages in Kings/Chronicles, Samuel/Chronicles, etc).

**Data file: `data/synoptic-map.js`** (~15KB)

```js
// synoptic-map.js — parallel passage mappings
//
// Each entry maps a pericope (named unit) across multiple books.
// Not every entry has all four Gospels — some are Matthew-only, some triple tradition.
//
// To add a mapping: append one object to SYNOPTIC_MAP.

window.SYNOPTIC_MAP = [
  {
    id: "baptism-of-jesus",
    title: "The Baptism of Jesus",
    category: "gospel",
    passages: [
      { book: "matthew", ref: "Matt 3:13-17" },
      { book: "mark",    ref: "Mark 1:9-11" },
      { book: "luke",    ref: "Luke 3:21-22" },
      { book: "john",    ref: "John 1:29-34" }
    ]
  },
  {
    id: "feeding-5000",
    title: "Feeding of the Five Thousand",
    category: "gospel",
    passages: [
      { book: "matthew", ref: "Matt 14:13-21" },
      { book: "mark",    ref: "Mark 6:30-44" },
      { book: "luke",    ref: "Luke 9:10-17" },
      { book: "john",    ref: "John 6:1-14" }
    ]
  },
  // OT parallels
  {
    id: "solomons-temple",
    title: "Solomon Builds the Temple",
    category: "ot-parallel",
    passages: [
      { book: "1_kings", ref: "1 Kgs 6:1-38" },
      { book: "2_chronicles", ref: "2 Chr 3:1-14" }
    ]
  },
  // ...
];
```

**Logic file: `synoptic.js`** (~5KB)

```
// Depends on: verse-resolver.js, data/synoptic-map.js
// Consumed by: synoptic.html (standalone viewer) + chapter pages (discovery)
//
// Core functions:
//   Synoptic.getParallels(bookKey, ch, v) → array of parallel entries containing this verse
//   Synoptic.getEntry(id)                 → full pericope mapping
//   Synoptic.getCategory(cat)             → all entries in a category
//   Synoptic.loadVerseText(ref)           → fetch verse text for display (from VERSES data)
```

**UI: `synoptic.html`** (standalone page) + **in-chapter discovery**

- **Standalone viewer:** User picks a pericope from a searchable list (or arrives via link from a chapter). Page shows 2-4 columns, each with the full verse text from one Gospel. Columns scroll independently. Differences highlighted with subtle background colour. Touch-friendly column toggling on mobile (tabs, not columns).
- **In-chapter indicator:** If you're reading Matt 14:15 and it has a synoptic parallel, a small "∥" icon appears near the verse. Tap it → opens a bottom sheet showing the other accounts inline, or a "Compare →" link to the full viewer.
- **Mobile first:** On phone screens, the viewer uses a tabbed interface (swipe between Gospels) instead of columns. On tablets+, it shows 2-3 columns.

---

### 3.4 Feature D: Book Introductions & Reading Plans

**What it does:** Each book gets a "How to Read This Book" introduction page with literary structure, historical context, theological themes, and a recommended reading order. Plus curated cross-book reading plans.

**Data file: `data/book-intros.js`** (~50-100KB, growing per book)

```js
// book-intros.js — book-level introductory content
//
// Each entry provides the orientation a reader needs before diving into chapters.
// Content is scholarly but accessible — no jargon without explanation.
//
// To add a book intro: append one object to BOOK_INTROS.

window.BOOK_INTROS = [
  {
    book: "genesis",
    title: "How to Read Genesis",
    author: "Scripture Deep Dive",
    sections: [
      {
        heading: "What Kind of Book Is This?",
        content: "Genesis is not a modern history textbook. It is theological narrative — ..."
      },
      {
        heading: "Literary Structure",
        content: "Genesis is organized around ten 'toledot' (generations) formulas ...",
        outline: [
          { label: "Primeval History (1-11)", chapters: [1,11], note: "Creation to Babel" },
          { label: "Abraham Cycle (12-25)", chapters: [12,25], note: "Call to death" },
          { label: "Jacob Cycle (25-36)", chapters: [25,36], note: "Deception and transformation" },
          { label: "Joseph Novella (37-50)", chapters: [37,50], note: "Providence and reconciliation" }
        ]
      },
      {
        heading: "Key Themes to Watch For",
        content: "...",
        themes: ["Blessing and curse", "Covenant", "Seed/offspring", "Land", "Exile and return"]
      },
      {
        heading: "Historical Context",
        content: "..."
      },
      {
        heading: "Suggested Reading Order",
        content: "If you're new to Genesis, start with these key chapters...",
        plan: [
          { ref: "Gen 1-3", label: "Creation and Fall" },
          { ref: "Gen 12", label: "Abrahamic Covenant" },
          { ref: "Gen 22", label: "The Binding of Isaac" },
          { ref: "Gen 37-50", label: "Joseph — read as a continuous narrative" }
        ]
      }
    ]
  },
  // ...
];
```

**Data file: `data/reading-plans.js`** (~10KB)

```js
// reading-plans.js — curated cross-book reading plans
//
// Each plan is a guided path through the Bible organized around a theme.

window.READING_PLANS = [
  {
    id: "covenant-thread",
    title: "The Covenant Thread",
    description: "Trace God's covenant relationship from Adam through Christ.",
    difficulty: "intermediate",
    steps: [
      { ref: "Gen 1-3", note: "Creation mandate and first covenant" },
      { ref: "Gen 9:1-17", note: "Noahic covenant — never again" },
      { ref: "Gen 12:1-9", note: "Abrahamic call" },
      { ref: "Gen 15:1-21", note: "Covenant ceremony — smoking firepot" },
      { ref: "Exod 19-20", note: "Sinai covenant — law and relationship" },
      { ref: "Deut 28-30", note: "Blessings, curses, and the choice" },
      { ref: "2 Sam 7:1-17", note: "Davidic covenant — eternal throne" },
      { ref: "1 Kgs 8:22-53", note: "Solomon's prayer — covenant remembered" },
      { ref: "Matt 26:26-29", note: "New covenant in my blood" }
    ]
  },
  // ...
];
```

**Logic file: `book-intro.js`** (~3KB) — renders intro pages from data  
**UI: `intro/{book}.html`** — thin shells: `<div id="intro-target"></div>` + loads book-intro.js  
**UI: `plans.html`** — reading plan browser and tracker (uses study-storage.js for progress)  
**In-chapter link:** Each chapter's header shows a small "About This Book →" link to its intro page.

---

### 3.5 Feature E: Hebrew/Greek Word Study

**What it does:** Tap a key Hebrew or Greek word → see its original-language form, transliteration, semantic range, theological significance, and every occurrence in your live chapters.

**Data file: `data/word-study.js`** (~150-300KB, growing per book)

```js
// word-study.js — Hebrew and Greek lexicon entries
//
// Each entry represents one original-language word with its full study data.
// occurrence_refs lists every verse where this word appears in live chapters.
//
// To add a word: append one object to WORD_STUDY_DATA.
// To add occurrences: extend the refs array as new books go live.

window.WORD_STUDY_DATA = [
  {
    id: "hesed",
    language: "hebrew",
    original: "חֶסֶד",
    transliteration: "ḥesed",
    strongs: "H2617",
    glosses: ["steadfast love", "lovingkindness", "mercy", "loyalty", "faithfulness"],
    semantic_range: "Covenant faithfulness that goes beyond legal obligation. The word that holds the Bible together.",
    theological_note: "Used 248 times in the OT. Describes God's character more than any other single word. Often paired with 'emet' (faithfulness) to express covenant reliability.",
    occurrences: [
      { ref: "Gen 24:12", translation: "kindness", context: "Abraham's servant prays for 'hesed'" },
      { ref: "Ruth 1:8", translation: "kindness", context: "Naomi blesses: 'May the LORD show hesed to you'" },
      { ref: "Ruth 3:10", translation: "kindness", context: "Boaz: 'This hesed is greater than the first'" },
      { ref: "2 Sam 7:15", translation: "love", context: "Davidic covenant: 'My hesed will not depart'" },
      // ... all live occurrences
    ]
  },
  {
    id: "logos",
    language: "greek",
    original: "λόγος",
    transliteration: "logos",
    strongs: "G3056",
    glosses: ["word", "reason", "speech", "account", "message"],
    semantic_range: "From ordinary speech to cosmic creative force. John 1 uses it in a way that would have resonated with both Jewish (dabar/memra) and Greek (Stoic logos) audiences.",
    theological_note: "In John's prologue, Logos is a title for Christ — the self-expression of God. This is the most philosophically dense opening in the NT.",
    occurrences: [
      { ref: "John 1:1", translation: "Word", context: "In the beginning was the Word" },
      { ref: "John 1:14", translation: "Word", context: "The Word became flesh" },
      // ...
    ]
  },
  // ...
];
```

**Logic file: `word-study.js`** (~4KB)

```
// Depends on: verse-resolver.js, data/word-study.js
// Consumed by: chapter pages (via word-study-ui.js)
//
// Core functions:
//   WordStudy.lookup(wordId)              → full lexicon entry
//   WordStudy.findByGloss(englishWord)    → entries where this English word appears as a gloss
//   WordStudy.getForVerse(ref)            → all word studies relevant to this verse
//   WordStudy.search(query)               → text search across entries
```

**UI integration: `word-study-ui.js`** (~5KB)

- **Word study indicator:** VHL-highlighted words that have a word study entry get a subtle underline dot. Tap → a **word study card** slides up from the bottom (not a full page navigation). The card shows: original script, transliteration, gloss range, one-line theological note, and a scrollable list of occurrences in live chapters (each tappable to navigate).
- **Full word study page:** `word-study.html` — standalone page for browsing/searching all entries. Grid of cards filtered by language, searchable by English gloss or transliteration. Good for intentional study sessions.
- **VHL integration:** The existing VHL word arrays (DIVINE, KEY, etc.) can link to word study entries. When `initVHL()` runs, it can check if a highlighted word has a word study entry and upgrade its click behavior.

---

## 4. Implementation Phases

Build order is driven by dependencies: services first, then features that depend on them, then features that enhance earlier features.

### Phase 0: Foundation Services (Week 1)
- [ ] `verse-resolver.js` — canonical verse addressing
- [ ] `study-storage.js` — personal data persistence wrapper
- [ ] Add both to SW CORE
- [ ] Unit tests for verse parsing (abbreviations, ranges, edge cases)
- **Depends on:** nothing
- **Unlocks:** all 5 features

### Phase 1: Book Introductions (Week 2)
- [ ] `data/book-intros.js` — intro content for all 17 live books
- [ ] `book-intro.js` — rendering logic
- [ ] `book-intro.css` — styling (loads base.css)
- [ ] `intro/{book}.html` — thin shell pages (17 pages)
- [ ] "About This Book →" link in chapter headers
- [ ] Reading plan data + page (can be Phase 1b)
- **Depends on:** verse-resolver.js
- **Unlocks:** reading plans, contextual study
- **Why first:** Lowest complexity, highest immediate UX value. Orients readers before they dive into chapters. No integration with existing panels needed.

### Phase 2: Personal Annotations (Week 3)
- [ ] `annotations.js` — note CRUD + UI injection
- [ ] `annotations.css` — editor styling
- [ ] Per-verse note indicators in chapter pages
- [ ] Inline editor (expands below verse)
- [ ] Chapter-level "My Notes" panel
- [ ] `journal.html` — standalone study journal page
- [ ] Export functionality (JSON, plain text)
- **Depends on:** study-storage.js, verse-resolver.js
- **Unlocks:** personal study workflow
- **Why second:** Self-contained, high engagement value. Makes the site "yours."

### Phase 3: Cross-Reference Threading (Weeks 4-5)
- [ ] `data/cross-refs.js` — curated threads + pairs for live books
- [ ] `cross-ref-engine.js` — thread lookup and traversal
- [ ] `cross-ref-ui.js` — thread badges, breadcrumb bar, thread viewer
- [ ] Homepage "Explore Threads" section
- [ ] Thread data for all 17 live books (ongoing — content grows per book)
- **Depends on:** verse-resolver.js
- **Unlocks:** thematic study, canon-level reading
- **Why third:** Highest depth value but requires curated data. Thread curation is ongoing — ship with 10-20 threads for initial books, grow from there.

### Phase 4: Synoptic Viewer (Week 6)
- [ ] `data/synoptic-map.js` — parallel passage mappings
- [ ] `synoptic.js` — parallel lookup logic
- [ ] `synoptic.html` — standalone comparison page
- [ ] `synoptic.css` — column/tab layout
- [ ] In-chapter "∥" parallel indicators
- [ ] OT parallels (Kings/Chronicles, Samuel/Chronicles)
- **Depends on:** verse-resolver.js, verse text data (already exists)
- **Unlocks:** Gospel comparison, OT parallel study
- **Why fourth:** Scope is well-defined but UI is the most complex (responsive columns ↔ tabs).

### Phase 5: Hebrew/Greek Word Study (Weeks 7-8)
- [ ] `data/word-study.js` — lexicon entries for key words in live books
- [ ] `word-study.js` — lookup engine
- [ ] `word-study-ui.js` — inline cards, VHL integration
- [ ] `word-study.html` — standalone browse/search page
- [ ] `word-study.css` — card and page styling
- [ ] VHL upgrade: link highlighted words to word study entries
- **Depends on:** verse-resolver.js, vhl.js (for integration)
- **Unlocks:** original-language insight, deepest study level
- **Why last:** Highest data curation effort (every entry requires Hebrew/Greek scholarship). Ship with 20-30 landmark words, grow per book.

---

## 5. File Structure (Final State)

```
ScriptureDeepDive/
├── base.css                          # shared :root vars
├── styles.css                        # chapter page styles
├── homepage.css / homepage.js        # homepage-specific
├── people.css / people-data.js       # people page
├── timeline.css / timeline-data.js   # timeline page
├── vhl.js                            # verse highlight layer (shared)
├── tog.js                            # panel toggle (shared)
├── history.js                        # reading history (shared)
├── qnav.js                           # quicknav panel (shared)
├── translation.js                    # NIV/ESV switcher
├── site-footer.js                    # shared footer + SW reg
├── verse-resolver.js          ← NEW  # canonical verse addressing
├── study-storage.js           ← NEW  # personal data persistence
├── annotations.js             ← NEW  # personal notes feature
├── annotations.css            ← NEW
├── cross-ref-engine.js        ← NEW  # thread traversal logic
├── cross-ref-ui.js            ← NEW  # thread UI (chapter integration)
├── synoptic.js                ← NEW  # parallel passage logic
├── word-study.js              ← NEW  # lexicon lookup
├── word-study-ui.js           ← NEW  # inline cards + VHL integration
├── book-intro.js              ← NEW  # book intro renderer
├── data/                      ← NEW  # all curated data files
│   ├── cross-refs.js                 # thread chains + pairs
│   ├── synoptic-map.js               # parallel passage mappings
│   ├── book-intros.js                # book introductions
│   ├── reading-plans.js              # curated reading paths
│   └── word-study.js                 # Hebrew/Greek lexicon
├── intro/                     ← NEW  # book intro pages (thin shells)
│   ├── genesis.html
│   ├── exodus.html
│   └── ...
├── journal.html               ← NEW  # personal study journal
├── synoptic.html              ← NEW  # parallel passage viewer
├── word-study.html            ← NEW  # word study browser
├── plans.html                 ← NEW  # reading plan browser
├── commentators/
│   ├── scholar-data.js               # scholar metadata (exists)
│   ├── commentator-nav.js            # dropdown nav (exists)
│   └── *.html                        # bio pages (exist)
├── ot/ nt/                           # chapter pages (exist)
├── verses/                           # verse data (exists)
└── _tools/
    ├── shared.py                     # build system (exists)
    ├── plans/
    │   ├── cross-refs-curation.md    # guide for adding cross-ref threads
    │   ├── word-study-curation.md    # guide for adding word study entries
    │   └── book-intro-template.md    # template for book introductions
    └── ...
```

---

## 6. Script Loading Strategy

Chapter pages currently load 7 scripts. Adding features should not degrade load time.

**Approach: lazy-load feature scripts after DOMContentLoaded.**

```html
<!-- Chapter page <head> — same as now -->
<link rel="stylesheet" href="../../styles.css">

<!-- Chapter page <body> — critical path scripts (same as now) -->
<script src="../../tog.js"></script>
<script src="../../vhl.js"></script>
<script>/* per-chapter VHL data + initVHL() */</script>
<script src="../../books.js"></script>
<script src="../../verses/niv/ot/genesis.js"></script>
<script src="../../history.js"></script>
<script src="../../qnav.js"></script>
<script src="../../translation.js"></script>

<!-- Feature scripts — lazy loaded, non-blocking -->
<script>
document.addEventListener('DOMContentLoaded', function() {
  // Load feature scripts dynamically — doesn't block first paint
  var features = [
    '../../verse-resolver.js',
    '../../annotations.js',
    '../../cross-ref-ui.js',
    '../../word-study-ui.js'
  ];
  features.forEach(function(src) {
    var s = document.createElement('script');
    s.src = src; s.async = true;
    document.head.appendChild(s);
  });
});
</script>
```

Feature scripts all use `DOMContentLoaded` or check for DOM readiness internally. They enhance the page after it's already interactive.

**Shared.py integration:** The `vhl_js()` function already controls what scripts a chapter loads. Add a `feature_scripts()` function that returns the lazy-loading block. Every chapter gets it automatically through the gen scripts.

---

## 7. Data Curation Workflow

Each feature depends on curated data. This data grows book by book, in parallel with chapter building.

**Per-book data checklist (add to CONTENT_PLAN_TEMPLATE.md):**

```
## Deep Study Data (alongside chapter build)

### Cross-References
- [ ] Identify 3-5 major threads that pass through this book
- [ ] Add thread entries to data/cross-refs.js
- [ ] Add bidirectional pairs for key verse connections

### Word Studies
- [ ] Identify 5-10 theologically significant Hebrew/Greek words
- [ ] Write lexicon entries with semantic range + theological notes
- [ ] Map occurrences across all live chapters

### Synoptic Parallels (if applicable)
- [ ] Map parallel passages to synoptic-map.js

### Book Introduction
- [ ] Write "How to Read This Book" content
- [ ] Define literary structure outline
- [ ] Identify key themes
- [ ] Create suggested reading order
```

**Curation principle:** Ship each feature with data for existing books. Don't wait for complete coverage. A word study tool with 30 entries is already valuable. It grows every time a new book is built.

---

## 8. Testing Strategy

Each phase produces testable outputs:

- **verse-resolver.js:** Unit test suite in `_tools/tests/test_verse_resolver.py` — parse 50+ ref formats, validate URL generation, test edge cases (1 John vs John, Song of Songs, etc).
- **study-storage.js:** Manual test in browser (storage API is runtime-only).
- **annotations.js:** Visual test — open chapter, add note, reload, verify persistence.
- **cross-ref-engine.js:** Unit test — lookup known threads, verify bidirectional pairs.
- **synoptic.js:** Unit test — verify parallel lookup returns correct passages.
- **word-study.js:** Unit test — lookup by ID, by gloss, by verse.
- **Audit integration:** Extend `audit.py` to verify:
  - All data files parse as valid JS
  - All verse refs in cross-refs.js resolve to live chapters
  - All word study occurrences point to live verses
  - All synoptic mappings reference live books
  - All book intros reference books in REGISTRY

---

## 9. Performance Budget

| Metric | Target | How |
|--------|--------|-----|
| First paint | < 1s on 3G | Feature scripts lazy-loaded after DOMContentLoaded |
| Chapter interactive | < 1.5s | Critical path unchanged (tog, vhl, qnav) |
| Feature ready | < 3s | Async script loading, data files cached by SW |
| Data files cached | 100% | All data/*.js in SW CORE |
| Storage reads | < 50ms | Chapter-level grouping (one key per chapter) |
| Thread viewer open | < 100ms | Data pre-indexed on load |

---

## 10. Migration Path

No breaking changes. Every phase is additive:

- Existing chapters continue to work unchanged
- Feature scripts are additive (enhance, don't replace)
- Data files load in parallel (don't block)
- `shared.py` changes are backward-compatible (new functions, not changed ones)
- Can ship Phase 0+1 and get immediate value while Phases 2-5 develop

**First commit for each phase:** data file + logic file + one sample page working end-to-end. Then retrofit all chapters in a single batch commit.
