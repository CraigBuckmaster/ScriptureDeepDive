# Phase 2: React Native Project Foundation — Implementation Plan

## Overview

**Goal:** Set up the Expo/React Native project with the complete design system, navigation skeleton, SQLite data access layer, TypeScript types, and reusable hooks — so that every screen built in Phases 3–6 has a solid foundation to build on.

**Dependencies:** Phase 0 (data migration) and Phase 1 (authoring pipeline) complete. `scripture.db` exists with all content.

**What Phase 2 builds:**
- Expo project scaffold with TypeScript
- All npm dependencies installed and configured
- Design system: complete color tokens, typography tokens, spacing, panel accent colors, scholar colors, era colors
- TypeScript types for all 19 database entities
- SQLite data access layer with all query functions
- Zustand stores for app state (translation preference, active panel, settings)
- Navigation skeleton (all tabs, stacks, modals — screens as empty shells)
- Custom hooks for data loading (useChapter, useVerses, useSections, etc.)
- Font loading configuration (EB Garamond, Cinzel, Source Sans 3)
- Database bundling and initialization
- App icon and splash screen
- Accessibility foundation

**What Phase 2 does NOT build:** Any screen UI. All screens are placeholder `<Text>ScreenName</Text>` shells. The visual design starts in Phase 3.

**Estimated batches:** 5 batches across 2-3 sessions.

---

## Batch 2A: Expo Project Init + Dependencies
*Create the project, install every package, configure.*

### Prompt for Batch 2A

```
Phase 2A: Initialize the Expo React Native project and install all
dependencies.

READ _tools/PHASE_2_PLAN.md (Batch 2A section).
READ _tools/REACT_NATIVE_PLAN.md §2.1 (repo structure) and §2.2 (tech stack).

IMPORTANT: We are building inside the existing ScriptureDeepDive repo.
The app/ directory is NEW. The _tools/, content/, scripture.db are existing.

1. CREATE the Expo project:
   cd /home/claude/ScriptureDeepDive
   npx create-expo-app@latest app --template blank-typescript
   cd app

2. INSTALL all dependencies (from the tech stack table):
   Core:
     npx expo install expo-sqlite expo-font expo-splash-screen
     npx expo install expo-notifications expo-speech expo-updates
     npx expo install react-native-reanimated react-native-gesture-handler
     npx expo install react-native-svg react-native-maps
     npx expo install react-native-safe-area-context react-native-screens

   Navigation:
     npm install @react-navigation/native @react-navigation/stack
     npm install @react-navigation/bottom-tabs

   State + Styling:
     npm install zustand
     npm install nativewind tailwindcss
     npx tailwindcss init

   UI Libraries:
     npm install @gorhom/bottom-sheet
     npm install lucide-react-native
     npm install victory-native
     npm install d3-hierarchy

   Testing:
     npm install --save-dev @testing-library/react-native jest

3. CONFIGURE NativeWind:
   - Create tailwind.config.js with content paths
   - Update babel.config.js to include nativewind/babel

4. CONFIGURE react-native-reanimated:
   - Add 'react-native-reanimated/plugin' to babel.config.js plugins

5. CREATE the directory structure:
   app/src/
     screens/        (empty for now)
     components/
       panels/       (empty for now)
     db/
     hooks/
     theme/
     utils/
     navigation/
     types/

6. COPY scripture.db to app/assets/:
   cp ../scripture.db app/assets/scripture.db

7. COPY font files:
   Download (or locate in _archive if present):
   - EB Garamond: Regular, Medium, SemiBold, Italic, MediumItalic
   - Cinzel: Regular, Medium, SemiBold
   - Source Sans 3: Light, Regular, Medium, SemiBold
   Place in app/assets/fonts/

8. COPY app icon:
   - The 1024x1024 icon source exists (golden cross + Bible)
   - Copy to app/assets/images/icon.png
   - Copy 192/512 versions for adaptive icon

9. UPDATE app.json:
   - Set name: "Scripture Deep Dive"
   - Set slug: "scripture-deep-dive"
   - Set scheme: "scripture"
   - Set icon, splash, adaptiveIcon paths
   - Set backgroundColor: "#0c0a07" (our dark bg)
   - Set userInterfaceStyle: "dark"
   - Add expo-sqlite plugin config
   - Add expo-font plugin config

10. VERIFY: Run `npx expo start` and confirm the app launches
    (just the default Expo screen — we haven't built anything yet).
    Print package.json dependencies list.
```

---

## Batch 2B: Design System — Complete Token Files
*Every color, font, spacing, and accent value encoded in TypeScript.*

### Data to encode

**Base colors** (from css/base.css and css/styles.css :root):
- bg: #0c0a07, bg2/elevated: #18150f (from base.css: #141008, styles.css: #181410 — normalize)
- bgSurface: #1f1b14, bg3: #1a1508
- text: #f0e8d8, textDim: #b8a888, textMuted: #7a6a50
- gold: #c9a84c, goldDim: #8b6914, goldBright: #e8c870
- border: #3a2e18, borderLight: #2a2010

**Panel accent colors** (14 panel types, each with bg/border/accent):
- heb, hist, ctx, cross, poi, tl, ppl, trans, src, rec, lit, hebText, thread, com

**Scholar colors** (42 scholars from scholar-data.js):
- alter: #d4a853, anderson: #c8d0a0, ..., childs: #6080b0

**Era colors** (9 eras from timeline-data.js ERA_HEX):
- primeval: #523d0b, patriarch: #4b395f, ..., nt: #46370f

**Typography** (3 font families, multiple weights):
- Display: Cinzel (Regular/400, Medium/500, SemiBold/600)
- Body: EB Garamond (Regular/400, Medium/500, SemiBold/600, Italic/400i, MediumItalic/500i)
- UI: Source Sans 3 (Light/300, Regular/400, Medium/500, SemiBold/600)

### Prompt for Batch 2B

```
Phase 2B: Build the complete design system token files.

READ _tools/PHASE_2_PLAN.md (Batch 2B section) for every exact color value.
READ _tools/REACT_NATIVE_PLAN.md §2.3 for the design system spec.

1. CREATE app/src/theme/colors.ts:

   Export an object with ALL colors organized by category:

   a. Base UI colors (from CSS variables — use the styles.css values):
      bg: '#0c0a07', bgElevated: '#181410', bgSurface: '#1f1b14',
      text: '#f0e8d8', textDim: '#b8a888', textMuted: '#7a6a50',
      gold: '#c9a84c', goldDim: '#8b6914', goldBright: '#e8c870',
      border: '#3a2e18', borderLight: '#2a2010'

   b. Panel accent colors (each panel type has bg, border, accent):
      panels: {
        heb:     { bg: '#1a0d14', border: '#7a3050', accent: '#e890b8' },
        hist:    { bg: '#0a1220', border: '#2a5080', accent: '#70b8e8' },
        ctx:     { bg: '#0a180e', border: '#2a6040', accent: '#70d098' },
        cross:   { bg: '#140f00', border: '#6a4a00', accent: '#d4b060' },
        poi:     { bg: '#060e06', border: '#1a6028', accent: '#30a848' },
        tl:      { bg: '#0a0f18', border: '#0a0f18', accent: '#70b8e8' },
        ppl:     { bg: '#180800', border: '#8a3010', accent: '#e86040' },
        trans:   { bg: '#001a18', border: '#186058', accent: '#58c8c0' },
        src:     { bg: '#140814', border: '#603058', accent: '#a05890' },
        rec:     { bg: '#180610', border: '#882040', accent: '#e04080' },
        lit:     { bg: '#101400', border: '#485010', accent: '#b8c858' },
        hebText: { bg: '#0a0800', border: '#4a3800', accent: '#d4aa40' },
        thread:  { bg: '#0a0a1a', border: '#303070', accent: '#9090e0' },
        com:     { bg: '#110408', border: '#6a1828', accent: '#c04050' },
        tx:      { bg: '#0a0a14', border: '#303060', accent: '#8888d0' },
        debate:  { bg: '#140a0a', border: '#603030', accent: '#d08080' },
        themes:  { bg: '#0a0a07', border: '#3a3010', accent: '#c9a84c' },
      }

   c. Scholar colors (42 entries — ALL from scholar-data.js):
      scholars: {
        alter: '#d4a853',
        anderson: '#c8d0a0',
        ashley: '#f0c080',
        bergen: '#d8a080',
        berlin: '#c08060',
        block: '#e0a070',
        calvin: '#7ba7cc',
        catena: '#b888d8',
        childs: '#6080b0',
        clines: '#b8a0d0',
        collins: '#7a9ab0',
        craigie: '#d8b8f0',
        fox: '#a0b8a0',
        garrett: '#c89898',
        goldingay: '#b0a890',
        habel: '#d0b888',
        hess: '#60d0c0',
        howard: '#90b0e0',
        hubbard: '#a8c870',
        japhet: '#a8c8b8',
        jobes: '#c8a090',
        keener: '#a8c8f8',
        kidner: '#a8c890',
        levenson: '#d0c080',
        longman: '#c0a870',
        macarthur: '#e05a6a',
        marcus: '#70d8d8',
        milgrom: '#78d8a8',
        netbible: '#d8e8d0',
        oconnor: '#c08060',
        oswalt: '#5a9a6a',
        provan: '#d8c0a0',
        rhoads: '#e8c060',
        robertson: '#c8d870',
        sarna: '#4ec9b0',
        selman: '#c0b890',
        tigay: '#e8d090',
        tsumura: '#88b8d8',
        vangemeren: '#88a8c8',
        waltke: '#e8a0b8',
        webb: '#90c890',
        williamson: '#90a8c8',
        wiseman: '#b0d8e8',
      }

   d. Era colors (9 eras):
      eras: {
        primeval: '#523d0b',
        patriarch: '#4b395f',
        exodus: '#26472e',
        judges: '#503d18',
        kingdom: '#304153',
        prophets: '#653030',
        exile: '#29444d',
        intertestamental: '#4a3e27',
        nt: '#46370f',
      }

   e. Era names:
      eraNames: {
        primeval: 'Primeval History',
        patriarch: 'Patriarchal Period',
        exodus: 'Egypt & Exodus',
        judges: 'Conquest & Judges',
        kingdom: 'United Kingdom',
        prophets: 'Divided Kingdom & Prophets',
        exile: 'Exile & Return',
        intertestamental: 'Intertestamental',
        nt: 'New Testament',
      }

2. CREATE app/src/theme/typography.ts:
   - Display: Cinzel (headings, section titles, panel labels, scholar names)
   - Body: EB Garamond (verse text, bios, commentary, reading content)
   - UI: Source Sans 3 (navigation, search, badges, buttons)
   - Define named presets: displayLg, displayMd, displaySm,
     bodyLg, bodyMd, bodySm, bodyItalic, bodyBold,
     uiLg, uiMd, uiSm, uiBold
   - Each preset: { fontFamily, fontSize, lineHeight?, letterSpacing? }
   - Export a function scaledTypography(systemFontScale: number)
     that multiplies all font sizes for Dynamic Type support.

3. CREATE app/src/theme/spacing.ts:
   - xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48
   - radii: sm: 4, md: 8, lg: 12, pill: 999
   - Export MIN_TOUCH_TARGET = 44 (accessibility)

4. CREATE app/src/theme/index.ts:
   - Re-export everything from colors, typography, spacing
   - Export a `getPanelColors(panelType: string)` helper that returns
     the {bg, border, accent} for any panel type, falling back to
     'com' colors for unknown types (scholar panels)
   - Export a `getScholarColor(scholarId: string)` helper

5. CREATE app/src/theme/fonts.ts:
   - Export FONT_MAP: Record<string, Asset> mapping font family names
     to require('../assets/fonts/FontName.ttf') paths
   - This is consumed by expo-font in the app initialization

6. VERIFY: Import theme/index.ts in App.tsx and log all color counts:
   - Base colors: 11
   - Panel types: 17
   - Scholar colors: 42
   - Era colors: 9
   Print totals to confirm nothing was missed.
```

---

## Batch 2C: TypeScript Types + Data Access Layer
*Every database entity typed. Every query function written.*

### Prompt for Batch 2C

```
Phase 2C: Write TypeScript types and the complete SQLite data access layer.

READ _tools/PHASE_2_PLAN.md (Batch 2C section) for the full type inventory.
READ _tools/REACT_NATIVE_PLAN.md §2.5 for all query function signatures.
READ the SQLite schema from _tools/REACT_NATIVE_PLAN.md Phase 0.5.

1. CREATE app/src/types/index.ts with ALL 19 entity types:

   export interface Book {
     id: string;
     name: string;
     testament: 'ot' | 'nt';
     total_chapters: number;
     book_order: number;
     is_live: boolean;
   }

   export interface Chapter {
     id: string;
     book_id: string;
     chapter_num: number;
     title: string | null;
     timeline_link_event: string | null;
     timeline_link_text: string | null;
     map_story_link_id: string | null;
     map_story_link_text: string | null;
   }

   export interface Section {
     id: string;
     chapter_id: string;
     section_num: number;
     header: string;
     verse_start: number;
     verse_end: number;
   }

   export interface SectionPanel {
     id: number;
     section_id: string;
     panel_type: string;
     content_json: string;   // JSON string — parse at render time
   }

   export interface ChapterPanel {
     id: number;
     chapter_id: string;
     panel_type: string;
     content_json: string;
   }

   export interface Verse {
     id: number;
     book_id: string;
     chapter_num: number;
     verse_num: number;
     translation: string;
     text: string;
   }

   export interface BookIntro {
     book_id: string;
     intro_json: string;
   }

   export interface Person {
     id: string;
     name: string;
     gender: string | null;
     father: string | null;
     mother: string | null;
     spouse_of: string | null;
     era: string | null;
     dates: string | null;
     role: string | null;
     type: string | null;    // 'spine' or 'satellite'
     bio: string | null;
     scripture_role: string | null;
     refs_json: string | null;
     chapter_link: string | null;
   }

   export interface Scholar {
     id: string;
     name: string;
     label: string;
     tradition: string | null;
     era: string | null;
     scope_json: string;
     bio_json: string;
   }

   export interface Place {
     id: string;
     ancient_name: string;
     modern_name: string | null;
     latitude: number;
     longitude: number;
     type: string;    // 'city' | 'water' | 'region' | 'mountain' | 'site'
     priority: number;
     label_dir: string;
   }

   export interface MapStory {
     id: string;
     era: string;
     name: string;
     scripture_ref: string | null;
     chapter_link: string | null;
     summary: string;
     places_json: string | null;
     regions_json: string | null;
     paths_json: string | null;
   }

   export interface WordStudy {
     id: string;
     language: string;
     original: string;
     transliteration: string;
     strongs: string | null;
     glosses_json: string;
     semantic_range: string | null;
     note: string | null;
     occurrences_json: string | null;
   }

   export interface SynopticEntry {
     id: string;
     title: string;
     passages_json: string;
   }

   export interface VHLGroup {
     id: number;
     chapter_id: string;
     group_name: string;
     css_class: string;
     words_json: string;
   }

   export interface CrossRefThread {
     id: string;
     theme: string;
     tags_json: string | null;
     steps_json: string;
   }

   export interface UserNote {
     id: number;
     verse_ref: string;
     note_text: string;
     created_at: string;
     updated_at: string;
   }

   export interface ReadingProgress {
     book_id: string;
     chapter_num: number;
     completed_at: string | null;
   }

   export interface Bookmark {
     id: number;
     verse_ref: string;
     label: string | null;
     created_at: string;
   }

   // Computed / joined types
   export interface RecentChapter extends ReadingProgress {
     title: string | null;
     book_name: string;
   }

   // Parsed panel content types (what you get after JSON.parse on content_json)
   export interface HebEntry { word: string; tlit: string; gloss: string; text: string; }
   export interface CrossRefEntry { ref: string; note: string; }
   export interface CommentaryEntry { ref: string; note: string; }
   export interface PlaceEntry { name: string; role: string; text: string; }
   export interface TimelineEvent { date: string; event: string; text: string; }
   export interface LitRow { label: string; range: string; text: string; is_key: boolean; }
   export interface ThemeScore { name: string; value: number; }
   export interface SourceEntry { title: string; quote: string; note: string; }
   export interface ThreadEntry { anchor: string; target: string; direction: string; type: string; text: string; }

2. CREATE app/src/db/database.ts — Database initialization:
   - Export initDatabase() that:
     a. Copies scripture.db from assets to the app's document directory
        (only on first launch — check if file exists)
     b. Opens the database with expo-sqlite
     c. Returns the database instance
   - Export getDb() singleton accessor

3. CREATE app/src/db/content.ts — ALL read-only content queries:
   Copy every query function from the React Native plan §2.5:
   - getBooks(), getBook(id), getLiveBooks()
   - getChapter(bookId, ch), getChapterWithLinks(bookId, ch)
   - getSections(chapterId), getSectionPanels(sectionId)
   - getChapterPanels(chapterId)
   - getVerses(bookId, ch, translation)
   - getVHLGroups(chapterId)
   - getBookIntro(bookId)
   - getPerson(id), getPersonChildren(parentId), getAllPeople()
   - getScholar(id), getScholarsForBook(bookId), getAllScholars()
   - getPlaces(), getMapStories(era?)
   - getWordStudy(id), getAllWordStudies(), searchWordStudies(query)
   - getSynopticEntries(), getSynopticForChapter(bookId, ch)
   - getThreadsForChapter(bookId, ch)
   - searchVerses(query, limit), searchPeople(query)

4. CREATE app/src/db/user.ts — User data queries (read + write):
   - getNotesForChapter(bookId, ch), getNoteCount(bookId, ch)
   - saveNote(verseRef, text), deleteNote(id)
   - recordVisit(bookId, ch), getRecentChapters(limit)
   - addBookmark(verseRef, label), removeBookmark(id), getBookmarks()
   - getPreference(key), setPreference(key, value)

5. TEST: Write a simple test script that:
   - Initializes the database
   - Queries: getBooks() → expect 66 entries
   - Queries: getLiveBooks() → expect 30 entries
   - Queries: getChapter('genesis', 1) → expect non-null
   - Queries: getSections('genesis_1') → expect 2+ entries
   - Queries: getVerses('genesis', 1, 'niv') → expect 31 entries
   - Queries: searchVerses('In the beginning') → expect results
   - Queries: getPerson('abraham') → expect non-null
   - Queries: getAllScholars() → expect 43
   - Queries: getPlaces() → expect 60+
   Print PASS/FAIL for each.
```

---

## Batch 2D: Zustand Stores + Custom Hooks
*App-level state management and data-loading hooks.*

### Prompt for Batch 2D

```
Phase 2D: Create Zustand state stores and custom data-loading hooks.

READ _tools/PHASE_2_PLAN.md (Batch 2D section).
READ _tools/REACT_NATIVE_PLAN.md §2.4 for the screen hierarchy (to
understand what state each screen needs).

1. CREATE app/src/stores/settingsStore.ts:
   Zustand store for persistent user preferences.
   - translation: 'niv' | 'esv' (default: 'niv')
   - fontSize: number (default: 16, range 12-24)
   - vhlEnabled: boolean (default: true)
   - setTranslation(t), setFontSize(s), setVhlEnabled(v)
   - Persist to SQLite user_preferences table via getPreference/setPreference
   - hydrate() method to load from SQLite on app start

2. CREATE app/src/stores/readerStore.ts:
   Zustand store for reading state (not persisted — resets per session).
   - currentBook: Book | null
   - currentChapter: number
   - activePanel: { sectionId: string, panelType: string } | null
   - qnavOpen: boolean
   - notesOverlayOpen: boolean
   - setCurrentBook(b), setCurrentChapter(ch)
   - setActivePanel(sectionId, panelType) — implements single-open policy:
     if same panel is already open, close it; otherwise close any open and open this one
   - clearActivePanel()
   - toggleQnav(), toggleNotesOverlay()

3. CREATE app/src/stores/index.ts — re-export all stores.

4. CREATE custom hooks in app/src/hooks/:

   a. useChapterData(bookId, chapterNum):
      Loads ALL data for a chapter in one call:
      - chapter (with deep-links)
      - sections (with their panels)
      - verses (for current translation from settingsStore)
      - VHL groups
      - chapter-level panels
      - cross-ref threads for this chapter
      - note count for this chapter
      Returns: { chapter, sections, verses, vhlGroups, chapterPanels,
                 threads, noteCount, isLoading }
      Uses React.useMemo to avoid re-querying on every render.
      Re-queries when bookId, chapterNum, or translation changes.

   b. useBooks():
      Returns all books (cached after first call).
      { books, liveBooks, isLoading }

   c. useBookIntro(bookId):
      Returns parsed book intro data.
      { intro, isLoading }

   d. usePeople():
      Returns all 211 people (cached).
      { people, isLoading }

   e. usePersonDetail(personId):
      Returns person + children + parents (from father/mother links).
      { person, parents, children, spouses, isLoading }

   f. useScholars():
      Returns all 43 scholars (cached).
      { scholars, isLoading }

   g. usePlaces():
      Returns all 60+ places (cached).
      { places, isLoading }

   h. useMapStories(era?):
      Returns map stories, optionally filtered by era.
      { stories, isLoading }

   i. useWordStudies():
      Returns all word study entries (cached).
      { studies, isLoading }

   j. useSearch(query):
      Combined search: verses + people + word studies.
      Debounced (300ms). Returns mixed results.
      { results: { verses, people, wordStudies }, isLoading }

   k. useRecentChapters(limit):
      Returns recent reading history for homepage chips.
      { recent, isLoading }

5. VERIFY: Import all hooks in a test component. Log return types.
   Confirm no TypeScript errors. Print hook count and store count.
```

---

## Batch 2E: Navigation Skeleton + App Shell
*Wire up every tab, every stack, every modal — with empty screen shells.*

### Prompt for Batch 2E

```
Phase 2E: Build the complete navigation skeleton with placeholder screens.

READ _tools/PHASE_2_PLAN.md (Batch 2E section).
READ _tools/REACT_NATIVE_PLAN.md §2.4 for the full screen hierarchy.

1. CREATE placeholder screens in app/src/screens/:
   Each screen is a minimal component that just shows its name + route params:

   HomeScreen.tsx
   BookListScreen.tsx
   ChapterListScreen.tsx
   BookIntroScreen.tsx
   ChapterScreen.tsx
   ParallelPassageScreen.tsx
   ExploreMenuScreen.tsx
   GenealogyTreeScreen.tsx
   PersonDetailScreen.tsx
   MapScreen.tsx
   TimelineScreen.tsx
   WordStudyBrowseScreen.tsx
   WordStudyDetailScreen.tsx
   ScholarBrowseScreen.tsx
   ScholarBioScreen.tsx
   SearchScreen.tsx
   SettingsScreen.tsx

   Each screen:
   ```typescript
   export default function ChapterScreen({ route }) {
     return (
       <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
         <Text style={{ color: colors.text }}>
           ChapterScreen — {route.params?.bookId} ch.{route.params?.chapterNum}
         </Text>
       </SafeAreaView>
     );
   }
   ```

2. CREATE modal components in app/src/components/:
   QnavOverlay.tsx         — full-screen modal
   PersonSidebar.tsx       — bottom sheet
   CrossRefPopup.tsx       — centered modal
   WordStudyPopup.tsx      — bottom sheet
   ScholarInfoSheet.tsx    — bottom sheet
   ThreadViewerSheet.tsx   — bottom sheet
   NotesOverlay.tsx        — full-screen modal
   AuthorshipSheet.tsx     — bottom sheet

   Each modal is a placeholder:
   ```typescript
   export function QnavOverlay({ visible, onClose }) {
     return (
       <Modal visible={visible} animationType="slide">
         <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
           <Text style={{ color: colors.text }}>Qnav Overlay</Text>
           <TouchableOpacity onPress={onClose}>
             <Text style={{ color: colors.gold }}>Close</Text>
           </TouchableOpacity>
         </SafeAreaView>
       </Modal>
     );
   }
   ```

3. CREATE navigation config in app/src/navigation/:

   a. HomeStack.tsx — just HomeScreen
   b. ReadStack.tsx — BookListScreen → ChapterListScreen → BookIntroScreen
                      → ChapterScreen → ParallelPassageScreen
   c. ExploreStack.tsx — ExploreMenuScreen → all Explore screens
   d. SearchStack.tsx — SearchScreen
   e. MoreStack.tsx — SettingsScreen

   f. TabNavigator.tsx — BottomTabNavigator with 5 tabs:
      - Home (HomeStack) — icon: Home
      - Read (ReadStack) — icon: BookOpen
      - Explore (ExploreStack) — icon: Compass
      - Search (SearchStack) — icon: Search
      - More (MoreStack) — icon: Menu

      Tab bar styling: dark background (#0c0a07), gold active tint (#c9a84c),
      muted inactive tint (#6a5a38), Cinzel font for labels.

   g. RootNavigator.tsx — wraps TabNavigator + provides modal context
      (for modals that can be triggered from any screen)

4. UPDATE App.tsx:
   - Load fonts with expo-font (useFonts hook)
   - Show splash screen until fonts loaded
   - Initialize database (initDatabase from db/database.ts)
   - Hydrate settings store (settingsStore.hydrate)
   - Wrap in NavigationContainer
   - Render RootNavigator
   - Render global modal providers (PersonSidebar context, etc.)

   ```typescript
   export default function App() {
     const [fontsLoaded] = useFonts(FONT_MAP);
     const [dbReady, setDbReady] = useState(false);

     useEffect(() => {
       initDatabase().then(() => {
         settingsStore.getState().hydrate();
         setDbReady(true);
       });
     }, []);

     if (!fontsLoaded || !dbReady) return <SplashScreen />;

     return (
       <GestureHandlerRootView style={{ flex: 1 }}>
         <NavigationContainer theme={darkTheme}>
           <RootNavigator />
         </NavigationContainer>
       </GestureHandlerRootView>
     );
   }
   ```

5. VERIFY the full navigation flow:
   - App launches → splash → home tab shows HomeScreen placeholder
   - Tap Read tab → BookListScreen placeholder
   - Tap Explore tab → ExploreMenuScreen placeholder
   - Tap Search tab → SearchScreen placeholder
   - Tap More tab → SettingsScreen placeholder
   - All tabs render with correct dark theme
   - Tab bar uses gold/muted colors
   - No TypeScript errors, no runtime errors

6. Print summary: total screens, total modals, total navigation stacks.
   Commit everything. Push.
```

---

## Batch Summary

| Batch | Description | Tool calls | Dependencies |
|-------|-------------|-----------|--------------|
| **2A** | Expo project init + all npm packages + directory structure + assets | ~15 | Phase 1 complete |
| **2B** | Design system: colors (79 values), typography, spacing, helpers | ~8 | 2A |
| **2C** | TypeScript types (19 entities) + SQLite data access layer (40+ functions) + test | ~12 | 2A |
| **2D** | Zustand stores (2) + custom hooks (11) | ~10 | 2B, 2C |
| **2E** | Navigation skeleton: 17 screens + 8 modals + 5 stacks + tab navigator + App.tsx | ~14 | 2D |

**Total: 5 batches, ~59 tool calls, targeting 2-3 sessions.**

**Dependency graph:**
```
2A ──→ 2B ──┐
       │     ├──→ 2D ──→ 2E
2A ──→ 2C ──┘
```

2B (design system) and 2C (types + DB) can run in parallel after 2A. Both must complete before 2D (hooks use types + colors). 2E depends on everything.

---

## Session Planning

**Session 1:** Batches 2A + 2B (project init + design system)
**Session 2:** Batches 2C + 2D (types + DB + hooks)
**Session 3:** Batch 2E (navigation skeleton + app shell) — shorter session

---

## Verification Checklist (run after Phase 2 is complete)

- [ ] `app/` directory exists with full Expo project structure
- [ ] `npx expo start` launches without errors
- [ ] All 30+ npm dependencies installed (check package.json)
- [ ] Design system: 11 base colors, 17 panel accent sets, 42 scholar colors, 9 era colors
- [ ] Typography: 12 named presets across 3 font families
- [ ] All 19 TypeScript entity interfaces defined
- [ ] All 12 parsed panel content types defined
- [ ] Database initializes and copies scripture.db from assets
- [ ] All 40+ query functions in db/content.ts compile without errors
- [ ] All user data functions in db/user.ts compile
- [ ] 2 Zustand stores: settingsStore + readerStore
- [ ] 11 custom hooks: useChapterData, useBooks, useBookIntro, usePeople, usePersonDetail, useScholars, usePlaces, useMapStories, useWordStudies, useSearch, useRecentChapters
- [ ] 17 placeholder screens render their names
- [ ] 8 placeholder modals open and close
- [ ] 5 navigation stacks configured
- [ ] Bottom tab navigator with 5 tabs, dark theme, gold active tint
- [ ] App.tsx loads fonts, initializes DB, hydrates settings, shows splash
- [ ] Tab navigation works between all 5 tabs
- [ ] Stack navigation works (push/pop) within Read and Explore tabs
- [ ] No TypeScript compilation errors
- [ ] No runtime errors on app launch
