# Epic #1048 — Content Deliverable

All text content needed for implementation across issues #1049–#1055.
Claude Code: reference this file when implementing any ticket in this epic.

---

## #1049 — Copy Rewrites

### Onboarding (`app/src/screens/OnboardingScreen.tsx` — PAGES array)

**Page 1 ("thesis"):**
```
title: "Companion Study"
subtitle: "Learn to read it the way\nit was written."          ← KEEP
body: "See what a Jewish scholar, a reformed pastor, and a literary critic each notice in the same passage — side by side, one tap away."
```

**Page 2 ("panels"):**
```
title: "Study Panels"
subtitle: "Tap a button below the text."
body: "Every passage has study buttons beneath the verses. Tap 'Hebrew' to see original word meanings. Tap a scholar's name to read their commentary. Tap 'History' for what was happening in the ancient world."
```

**Page 3 ("explore"):**
```
title: "Explore Tools"
subtitle: "Tools that connect the dots across Scripture."
body: "Follow Abraham's journey on a map. Trace a Hebrew word through every book it appears. See how an Old Testament promise finds its fulfillment. All offline, all free."
```

### Explore Subtitles (`app/src/screens/ExploreMenuScreen.tsx` — SECTIONS/features)

Replace each feature's `subtitle` field:

```typescript
const SECTIONS: FeatureSection[] = [
  {
    label: 'The Biblical World',
    subtitle: 'Where, when, and who',
    layout: 'hero',
    features: [
      { title: 'People', subtitle: '282 people on a zoomable family tree with bios', screen: 'GenealogyTree' },
      { title: 'Timeline', subtitle: '543 events from creation to revelation — tap any to read the chapter', screen: 'Timeline' },
      { title: 'Map', subtitle: '28 journeys with route overlays across 73 places', screen: 'Map' },
    ],
  },
  {
    label: 'Themes & Connections',
    subtitle: 'Trace ideas across Scripture',
    layout: 'grid',
    features: [
      { title: 'Concepts', subtitle: 'Trace covenant, atonement, kingdom & more across the whole Bible', screen: 'ConceptBrowse' },
      { title: 'Topical Index', subtitle: 'What does the Bible say about...?', screen: 'TopicBrowse' },
      { title: 'Prophecy & Typology', subtitle: '50 chains showing how OT promises connect to NT fulfillment', screen: 'ProphecyBrowse' },
      { title: 'Threads', subtitle: 'Follow one idea from Genesis to Revelation across 31 chains', screen: 'ThreadBrowse' },
      { title: 'Gospel Harmony', subtitle: 'Read parallel accounts of the same event across all four Gospels', screen: 'HarmonyBrowse' },
    ],
  },
  {
    label: 'Language & Reference',
    subtitle: 'Original words and definitions',
    layout: 'grid',
    features: [
      { title: 'Word Studies', subtitle: 'Deep dives into Hebrew & Greek words — etymology, usage, and theology', screen: 'WordStudyBrowse' },
      { title: 'Concordance', subtitle: 'Search every verse where a Hebrew or Greek word appears', screen: 'Concordance' },
      { title: 'Bible Dictionary', subtitle: 'Definitions for every biblical term', screen: 'DictionaryBrowse' },
    ],
  },
  {
    label: 'Scholarly Analysis',
    subtitle: 'Academic perspectives and debate',
    layout: 'grid',
    features: [
      { title: 'Scholars', subtitle: 'Browse all 54 scholars by tradition with full bios', screen: 'ScholarBrowse' },
      { title: 'Scholar Debates', subtitle: '303 topics where scholars disagree — see each side with citations', screen: 'DebateBrowse' },
      { title: 'Difficult Passages', subtitle: '53 hard passages with multi-view scholarly responses', screen: 'DifficultPassagesBrowse' },
      { title: 'Content Library', subtitle: 'Discourse analysis, manuscript notes, chiastic structures & more', screen: 'ContentLibrary' },
    ],
  },
  {
    label: 'Life & Faith',
    subtitle: 'Biblical guidance for everyday life',
    layout: 'grid',
    features: [
      { title: 'Life Topics', subtitle: 'Biblical guidance for everyday life', screen: 'LifeTopics' },
    ],
  },
  {
    label: 'Deep Dive',
    subtitle: 'Advanced study tools',
    layout: 'grid',
    features: [
      { title: 'Hermeneutic Lenses', subtitle: 'Read a chapter through feminist, liberation, or canonical frameworks', screen: 'LensBrowse' },
      { title: 'Archaeological Evidence', subtitle: 'Real artifacts and sites that illuminate the biblical text', screen: 'ArchaeologyBrowse' },
      { title: 'Time-Travel Reader', subtitle: 'How did Augustine, Luther & modern scholars read this passage?', screen: 'TimeTravelBrowse' },
      { title: 'Grammar Reference', subtitle: 'Verb forms, noun cases & syntax patterns in plain English', screen: 'GrammarBrowse' },
    ],
  },
];
```

---

## #1050 — Panel Descriptions

### Content Panel Descriptions (`app/src/utils/panelDescriptions.ts`)

```typescript
export const PANEL_DESCRIPTIONS: Record<string, { label: string; description: string }> = {
  // Section-level content panels
  heb:      { label: 'Hebrew Word Study',      description: 'Key Hebrew and Greek words in this passage — their etymology, range of meaning, and theological significance.' },
  hist:     { label: 'Historical Context',      description: 'What was happening in the ancient world when this was written — politics, culture, and daily life that shaped the original audience.' },
  ctx:      { label: 'Literary Context',        description: 'How this passage fits into the larger narrative flow — what comes before, what comes after, and why it matters here.' },
  cross:    { label: 'Cross-References',        description: 'Other passages that quote, echo, or parallel this text — showing how Scripture interprets itself.' },
  poi:      { label: 'Places of Interest',      description: 'Geographic locations mentioned in this passage with historical and archaeological context.' },
  tl:       { label: 'Timeline',                description: 'Where this passage falls in biblical chronology and what was happening in the wider ancient world.' },
  places:   { label: 'Places',                  description: 'Geographic locations mentioned in this passage with maps and historical context.' },

  // Chapter-level content panels
  lit:      { label: 'Literary Structure',      description: 'The architecture of this chapter — chiasms, inclusios, parallelism, and other structural patterns the author used.' },
  hebtext:  { label: 'Hebrew-Rooted Reading',   description: 'Reading through the lens of the original Hebrew — wordplay, alliteration, and nuances lost in English translation.' },
  themes:   { label: 'Theological Themes',      description: 'Major theological ideas running through this chapter and how they connect to the rest of Scripture.' },
  ppl:      { label: 'People',                  description: 'Key figures in this chapter — who they are, their role in the narrative, and their significance.' },
  trans:    { label: 'Translation Comparison',   description: 'How different Bible translations handle difficult phrases — and why the differences matter.' },
  src:      { label: 'Ancient Sources',          description: 'Ancient Near Eastern texts, inscriptions, and traditions that illuminate or parallel this passage.' },
  rec:      { label: 'Reception History',        description: 'How this chapter has been read and interpreted across 2,000 years of church history.' },
  thread:   { label: 'Intertextual Threading',   description: 'Thematic threads that run from this passage through other books — tracing ideas across the canon.' },
  tx:       { label: 'Textual Notes',            description: 'Manuscript variants, scribal traditions, and text-critical issues — what the earliest copies actually say.' },
  textual:  { label: 'Textual Notes',            description: 'Manuscript variants, scribal traditions, and text-critical issues — what the earliest copies actually say.' },
  debate:   { label: 'Scholarly Debates',        description: 'Points where respected scholars disagree about this passage — with each position and its reasoning.' },
  discourse:{ label: 'Argument Flow',            description: 'The logical structure of the author\'s argument — how each point builds on the last.' },
  mac:      { label: 'Application',              description: 'Pastoral commentary focused on practical life application, grounded in grammatical-historical interpretation.' },
};
```

### Missing Scholar Descriptions (add to `content/meta/scholars.json`)

These two scholars are missing the `description` field:

```json
{
  "id": "stuart",
  "description": "WBC commentator on Hosea–Jonah and Ezekiel. Combines text-critical precision with attention to the literary artistry of the prophetic books."
},
{
  "id": "andersen_freedman",
  "description": "Authors of the Anchor Bible commentaries on Hosea, Amos, and Micah. Rigorous philological analysis with exhaustive treatment of Hebrew syntax and poetic structure."
}
```

### Scholar Tooltip Behavior

The tooltip should display:
1. **Name** — from `scholars.json` → `name` field
2. **Tradition** — from `scholars.json` → `tradition` field (render as a colored chip)
3. **Description** — from `scholars.json` → `description` field, truncated to first sentence (split on `. ` or `.` and take `[0] + '.'`)
4. **"View Bio →"** link — navigates to `ScholarBio` screen with `{ scholarId: panel_type }`

No new `short_bio` field needed — first sentence of existing `description` works for all 72 scholars.

---

## #1051 — Getting Started Checklist

### Checklist Items

```typescript
const GETTING_STARTED_ITEMS = [
  {
    key: 'first_chapter',
    title: 'Read your first chapter',
    subtitle: 'Start with Genesis 1 and explore the study panels',
    screen: 'Chapter',
    params: { bookId: 'genesis', chapterNum: 1 },
    completionEvent: 'any_chapter_visit',   // triggers when reading_history has >= 1 entry
  },
  {
    key: 'first_panel',
    title: 'Tap a study panel',
    subtitle: 'Open any Hebrew, History, or scholar button below the text',
    screen: 'Chapter',
    params: { bookId: 'genesis', chapterNum: 1 },
    completionEvent: 'any_panel_open',      // triggers on first logEvent('panel_open')
  },
  {
    key: 'meet_scholars',
    title: 'Meet the scholars',
    subtitle: 'Browse the 54 scholars behind the commentary',
    screen: 'ScholarBrowse',
    params: {},
    completionEvent: 'scholar_browse_visit', // triggers on ScholarBrowse screen mount
  },
  {
    key: 'explore_timeline',
    title: 'Explore the timeline',
    subtitle: 'See where Genesis fits in 4,000 years of biblical history',
    screen: 'Timeline',
    params: {},
    completionEvent: 'timeline_visit',       // triggers on Timeline screen mount
  },
];
```

---

## #1053 — Continue Exploring Footer

### Card Type Priority & Templates

Cards are extracted from already-loaded chapter data. Priority order determines which cards render first (max 6):

```typescript
const EXPLORE_CARD_TYPES = [
  {
    priority: 1,
    type: 'people',
    source: 'chapter_panels where type = "ppl"',
    icon: '👤',
    titleTemplate: '{person_name}',
    subtitleTemplate: 'Person in {book_name}',
    screen: 'PersonDetail',
  },
  {
    priority: 2,
    type: 'timeline',
    source: 'chapter.timeline_link_event',
    icon: '⏱',
    titleTemplate: 'Timeline',
    subtitleTemplate: '{event_title}',
    screen: 'Timeline',
  },
  {
    priority: 3,
    type: 'map',
    source: 'chapter.map_story_link_id',
    icon: '📍',
    titleTemplate: 'Map',
    subtitleTemplate: '{story_title}',
    screen: 'Map',
  },
  {
    priority: 4,
    type: 'debate',
    source: 'chapter_panels where type = "debate"',
    icon: '⚖',
    titleTemplate: '{debate_title}',
    subtitleTemplate: 'Scholarly debate',
    screen: 'DebateDetail',
  },
  {
    priority: 5,
    type: 'word_study',
    source: 'section_panels where type = "heb" → extract word_study IDs',
    icon: '📝',
    titleTemplate: '{hebrew_word}',
    subtitleTemplate: 'Word study',
    screen: 'WordStudyDetail',
  },
  {
    priority: 6,
    type: 'concept',
    source: 'chapter_panels where type = "themes" → extract concept IDs',
    icon: '✦',
    titleTemplate: '{concept_name}',
    subtitleTemplate: 'Concept theme',
    screen: 'ConceptDetail',
  },
];
```

### Footer Section Label
```
CONTINUE EXPLORING
```

### Card CTA Text
```
Explore →
```

---

## #1054 — Explore Tab Redesign

### Section Icons

```typescript
const SECTION_ICONS: Record<string, string> = {
  'The Biblical World':    '🌍',
  'Themes & Connections':  '🔗',
  'Language & Reference':  'א',
  'Scholarly Analysis':    '🎓',
  'Life & Faith':          '💡',
  'Deep Dive':             '🔬',
};
```

### Start Here Banner Content

Shown when `chaptersRead < 5`. Section label: `START HERE`

```typescript
const START_HERE_TOOLS = [
  {
    title: 'People',
    subtitle: 'See who\'s in the story',
    icon: '👤',
    screen: 'GenealogyTree',
    color: '#e86040',
  },
  {
    title: 'Timeline',
    subtitle: 'When did this happen?',
    icon: '⏱',
    screen: 'Timeline',
    color: '#70b8e8',
  },
  {
    title: 'Word Studies',
    subtitle: 'What does this word mean?',
    icon: '📝',
    screen: 'WordStudyBrowse',
    color: '#e890b8',
  },
  {
    title: 'Topical Index',
    subtitle: 'What does the Bible say about...?',
    icon: '📑',
    screen: 'TopicBrowse',
    color: '#c8a040',
  },
];
```

### Recommendation Templates by Genre

The `useExploreRecommendations` hook uses the user's most recently read book to generate 3 contextual cards. The hook should use **genre-based fallback rules** when specific per-book content isn't available.

**Per-book overrides** (for the most-read books — expand over time):

```typescript
const BOOK_RECOMMENDATIONS: Record<string, ExploreRec[]> = {
  genesis: [
    { title: 'Creation',              subtitle: 'Concept you explored in Genesis',       icon: '✦', screen: 'ConceptDetail',   params: { conceptId: 'creation' },     color: '#bfa050' },
    { title: 'Abraham\'s Journey',    subtitle: 'Follow the route from Ur to Canaan',    icon: '📍', screen: 'Map',            params: { storyId: 'abraham_journey' },color: '#81C784' },
    { title: 'Covenant',              subtitle: 'Trace the idea from Genesis onward',    icon: '🧵', screen: 'ConceptDetail',   params: { conceptId: 'covenant' },     color: '#9090e0' },
  ],
  exodus: [
    { title: 'The Exodus Route',      subtitle: 'From Egypt to Sinai on the map',        icon: '📍', screen: 'Map',            params: { storyId: 'exodus_route' },   color: '#81C784' },
    { title: 'Moses',                 subtitle: 'The central figure of the Torah',       icon: '👤', screen: 'PersonDetail',    params: { personId: 'moses' },         color: '#e86040' },
    { title: 'Torah & Law',           subtitle: 'What role does the law play?',          icon: '✦', screen: 'ConceptDetail',   params: { conceptId: 'torah_law' },    color: '#bfa050' },
  ],
  psalms: [
    { title: 'Hebrew Poetry',         subtitle: 'How parallelism and meter work',        icon: '📐', screen: 'GrammarArticle',  params: { articleId: 'hebrew_poetry' },color: '#7a9ab0' },
    { title: 'Lament',                subtitle: 'The theology of crying out to God',     icon: '✦', screen: 'ConceptDetail',   params: { conceptId: 'lament' },       color: '#bfa050' },
    { title: 'David',                 subtitle: 'The poet behind the psalms',            icon: '👤', screen: 'PersonDetail',    params: { personId: 'david' },         color: '#e86040' },
  ],
  romans: [
    { title: 'Justification',         subtitle: 'Paul\'s central argument unpacked',     icon: '✦', screen: 'ConceptDetail',   params: { conceptId: 'justification' },color: '#bfa050' },
    { title: 'Paul',                  subtitle: 'The apostle to the Gentiles',           icon: '👤', screen: 'PersonDetail',    params: { personId: 'paul' },          color: '#e86040' },
    { title: 'Faith vs Works',        subtitle: 'A debate that shaped church history',   icon: '⚖', screen: 'DebateDetail',    params: { debateId: 'faith_works' },   color: '#d08080' },
  ],
  revelation: [
    { title: 'Apocalyptic Literature',subtitle: 'How to read this genre',               icon: '📐', screen: 'GrammarArticle',  params: { articleId: 'apocalyptic' },  color: '#7a9ab0' },
    { title: 'Kingdom of God',        subtitle: 'The consummation of a biblical theme',  icon: '✦', screen: 'ConceptDetail',   params: { conceptId: 'kingdom' },      color: '#bfa050' },
    { title: 'Prophecy Chains',       subtitle: 'Trace OT promises to their conclusion', icon: '🔮', screen: 'ProphecyBrowse',  params: {},                            color: '#e8a070' },
  ],
};
```

**Genre-based fallbacks** (when no per-book override exists):

```typescript
const GENRE_RECOMMENDATIONS: Record<string, ExploreRec[]> = {
  'Theological Narrative': [
    { title: 'People',        subtitle: 'See who appears in this book',            icon: '👤', screen: 'GenealogyTree', color: '#e86040' },
    { title: 'Map',           subtitle: 'Where does the action take place?',       icon: '📍', screen: 'Map',           color: '#81C784' },
    { title: 'Timeline',      subtitle: 'When did this happen?',                   icon: '⏱', screen: 'Timeline',      color: '#70b8e8' },
  ],
  'Theological History': [
    { title: 'People',        subtitle: 'Key figures in this historical period',   icon: '👤', screen: 'GenealogyTree', color: '#e86040' },
    { title: 'Timeline',      subtitle: 'Place these events in context',           icon: '⏱', screen: 'Timeline',      color: '#70b8e8' },
    { title: 'Map',           subtitle: 'The geography of the return from exile',  icon: '📍', screen: 'Map',           color: '#81C784' },
  ],
  'Prophecy': [
    { title: 'Prophecy Chains',subtitle: 'Trace these prophecies to fulfillment',  icon: '🔮', screen: 'ProphecyBrowse',color: '#e8a070' },
    { title: 'Timeline',       subtitle: 'When did this prophet speak?',           icon: '⏱', screen: 'Timeline',      color: '#70b8e8' },
    { title: 'Scholarly Debates',subtitle: 'Key interpretive disputes',            icon: '⚖', screen: 'DebateBrowse',  color: '#d08080' },
  ],
  'Wisdom Literature': [
    { title: 'Hebrew Poetry',  subtitle: 'How parallelism shapes meaning',         icon: '📐', screen: 'GrammarBrowse', color: '#7a9ab0' },
    { title: 'Word Studies',   subtitle: 'Key Hebrew terms in wisdom literature',  icon: '📝', screen: 'WordStudyBrowse',color: '#e890b8' },
    { title: 'Concepts',       subtitle: 'Wisdom, fear of the Lord & more',        icon: '✦', screen: 'ConceptBrowse', color: '#bfa050' },
  ],
  'Hebrew Poetry': [
    { title: 'Hebrew Poetry',  subtitle: 'How parallelism and meter work',         icon: '📐', screen: 'GrammarBrowse', color: '#7a9ab0' },
    { title: 'Word Studies',   subtitle: 'Key Hebrew terms in the psalms',         icon: '📝', screen: 'WordStudyBrowse',color: '#e890b8' },
    { title: 'Concepts',       subtitle: 'Praise, lament, trust & more',           icon: '✦', screen: 'ConceptBrowse', color: '#bfa050' },
  ],
  'Lament Poetry': [
    { title: 'Lament',         subtitle: 'The theology of crying out to God',      icon: '✦', screen: 'ConceptBrowse', color: '#bfa050' },
    { title: 'Hebrew Poetry',  subtitle: 'Acrostic structure and meter',           icon: '📐', screen: 'GrammarBrowse', color: '#7a9ab0' },
    { title: 'Timeline',       subtitle: 'The fall of Jerusalem in context',       icon: '⏱', screen: 'Timeline',      color: '#70b8e8' },
  ],
  'Love Poetry': [
    { title: 'Hebrew Poetry',  subtitle: 'The literary art of Song of Solomon',    icon: '📐', screen: 'GrammarBrowse', color: '#7a9ab0' },
    { title: 'Scholarly Debates',subtitle: 'Allegorical or literal?',              icon: '⚖', screen: 'DebateBrowse',  color: '#d08080' },
    { title: 'Word Studies',   subtitle: 'Love, beauty, and desire in Hebrew',     icon: '📝', screen: 'WordStudyBrowse',color: '#e890b8' },
  ],
  'Ritual Law': [
    { title: 'Atonement',     subtitle: 'The sacrificial system and its meaning',  icon: '✦', screen: 'ConceptDetail',  params: { conceptId: 'atonement' }, color: '#bfa050' },
    { title: 'Word Studies',   subtitle: 'Holiness, clean, and unclean in Hebrew', icon: '📝', screen: 'WordStudyBrowse',color: '#e890b8' },
    { title: 'Scholarly Debates',subtitle: 'How should modern readers approach law?',icon: '⚖', screen: 'DebateBrowse', color: '#d08080' },
  ],
  'Covenant Law': [
    { title: 'Covenant',       subtitle: 'The treaty structure behind Deuteronomy', icon: '✦', screen: 'ConceptDetail',  params: { conceptId: 'covenant' }, color: '#bfa050' },
    { title: 'Ancient Sources', subtitle: 'ANE treaty parallels',                  icon: '🏺', screen: 'ArchaeologyBrowse', color: '#b07d4f' },
    { title: 'Torah & Law',    subtitle: 'What role does the law play?',           icon: '✦', screen: 'ConceptBrowse', color: '#bfa050' },
  ],
  'Gospel': [
    { title: 'Gospel Harmony', subtitle: 'Compare this account across all 4 Gospels',icon: '📖', screen: 'HarmonyBrowse',color: '#70d098' },
    { title: 'Jesus',          subtitle: 'The central figure of the Gospels',      icon: '👤', screen: 'PersonDetail',   params: { personId: 'jesus' }, color: '#e86040' },
    { title: 'Prophecy Chains',subtitle: 'OT prophecies fulfilled in the Gospels', icon: '🔮', screen: 'ProphecyBrowse',color: '#e8a070' },
  ],
  'Epistle': [
    { title: 'Argument Flow',  subtitle: 'Follow the logic of the letter',         icon: '📐', screen: 'GrammarBrowse', color: '#7a9ab0' },
    { title: 'Word Studies',   subtitle: 'Key Greek terms in this letter',         icon: '📝', screen: 'WordStudyBrowse',color: '#e890b8' },
    { title: 'Concepts',       subtitle: 'Grace, faith, sanctification & more',    icon: '✦', screen: 'ConceptBrowse', color: '#bfa050' },
  ],
  'Apocalyptic': [
    { title: 'Apocalyptic Genre',subtitle: 'How to read symbolic literature',      icon: '📐', screen: 'GrammarBrowse', color: '#7a9ab0' },
    { title: 'Prophecy Chains',subtitle: 'Trace these visions to their OT roots',  icon: '🔮', screen: 'ProphecyBrowse',color: '#e8a070' },
    { title: 'Scholarly Debates',subtitle: 'Preterist, futurist, or idealist?',    icon: '⚖', screen: 'DebateBrowse',  color: '#d08080' },
  ],
};
```

**Hook logic summary:**
1. Query most recent book from `reading_history`
2. Look up `genre_label` from `books` table for that book
3. Check `BOOK_RECOMMENDATIONS[bookId]` first
4. Fall back to `GENRE_RECOMMENDATIONS[genre_label]`
5. Return 3 cards

### Recommendation Section Label & Subtitle
```
Label:    RECOMMENDED FOR YOU
Subtitle: Based on your reading in {book_name}
```

---

## #1055 — Interactive Onboarding Demo

### Static Demo Content (bundled in `OnboardingDemo.tsx`)

```typescript
const DEMO_CONTENT = {
  verses: [
    {
      num: 1,
      text: 'In the beginning God created the heavens and the earth.',
    },
    {
      num: 2,
      text: 'Now the earth was formless and empty, darkness was over the surface of the deep, and the Spirit of God was hovering over the waters.',
    },
  ],
  panels: {
    heb: {
      label: 'Hebrew',
      title: 'Hebrew Word Study',
      color: '#e890b8',
      content: 'בְּרֵאשִׁית (bereshit) — "In the beginning." This can be read as an absolute state ("In the beginning, God created") or a construct ("When God began to create"). The ambiguity is intentional — the Hebrew opens the text to both valid readings.',
    },
    hist: {
      label: 'History',
      title: 'Historical Context',
      color: '#70b8e8',
      content: 'Genesis 1 was composed against the backdrop of Babylonian and Egyptian creation myths. Unlike Enuma Elish, where creation emerges from divine conflict, Genesis presents a sovereign God who creates by speech alone — a pointed theological contrast.',
    },
    sarna: {
      label: 'Sarna',
      title: 'Nahum Sarna',
      tradition: 'Jewish Academic',
      color: '#4ec9b0',
      content: 'The Hebrew stem b-r-ʾ is used in the Bible exclusively of divine activity, never of human making. This verb choice emphasizes the effortless, unparalleled nature of God\'s creative act — something only God can do.',
    },
  },
};
```

### UI Text

```
Before any panel tap:
  Title:    "Try It Now"
  Subtitle: "Tap a button below the text."
  Hint:     "↑ Tap any button to try it"

After first panel tap:
  Title:    "This is how every chapter works."
  Body:     "Every passage has study buttons. Hebrew words, historical context, and scholar commentary — all one tap away."
```

---

## Content Checklist Summary

| Issue | Content Items | Status |
|-------|--------------|--------|
| #1049 | 3 onboarding rewrites + 20 Explore subtitles | ✅ Complete above |
| #1050 | 17 panel descriptions + 2 missing scholar descriptions | ✅ Complete above |
| #1051 | 4 checklist items (title, subtitle, nav target) | ✅ Complete above |
| #1053 | 6 card type templates + priority order | ✅ Complete above |
| #1054 | 6 section icons + 4 Start Here cards + 5 book overrides + 12 genre fallbacks | ✅ Complete above |
| #1055 | 2 demo verses + 3 panel texts + UI strings | ✅ Complete above |
