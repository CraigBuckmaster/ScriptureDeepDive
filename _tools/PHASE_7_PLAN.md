# Phase 7: Native-Only Enhancements — Implementation Plan

## Overview

**Goal:** Add features that are impossible or impractical in a PWA: verse bookmarks, color-coded highlights, structured reading plans with reminders, text-to-speech, verse sharing as branded image cards, and push notifications.

**Dependencies:** Phases 2–6 complete. All screens fully implemented. Notes system built in Phase 3. Settings screen built in Phase 6. All data hooks and SQLite infrastructure in place.

**What already exists from earlier phases:**

| Feature | Phase | Status |
|---------|-------|--------|
| Per-verse notes (pencil indicators, overlay, CRUD) | Phase 3 | ✅ Complete |
| Reading history tracking (recordVisit, useRecentChapters) | Phase 3 | ✅ Tracking complete |
| Continue Reading chips on HomeScreen | Phase 6 | ✅ Complete |
| Font size preference + Dynamic Type | Phase 6 | ✅ Complete |
| Translation toggle (NIV/ESV) | Phase 6 | ✅ Complete |
| Export notes | Phase 6 | ✅ Complete |
| Bookmark DB functions (addBookmark, removeBookmark, getBookmarks) | Phase 2 | ✅ DB layer only |
| expo-notifications installed | Phase 2A | ✅ Installed |
| expo-speech installed | Phase 2A | ✅ Installed |

**What Phase 7 builds NEW:**

| Feature | New tables | New screens | New components |
|---------|-----------|-------------|----------------|
| Bookmarks | — (table exists) | BookmarkListScreen | BookmarkButton, BookmarkList |
| Highlights | `verse_highlights` (NEW) | — | HighlightColorPicker, highlight rendering in VerseBlock |
| Reading plans | `reading_plans`, `plan_progress` (NEW) | PlanListScreen, PlanDetailScreen | PlanCard, PlanProgressBar, DailyReadingCard |
| Reading history | — (table exists) | ReadingHistoryScreen | HistoryList, HistoryCard |
| Text-to-speech | — | — | TTSButton, TTSControls (in ChapterScreen) |
| Verse sharing | — | — | VerseShareCard, ShareButton |
| Push notifications | — | — | NotificationSettings, permission flow |

**Widgets (iOS WidgetKit / Android AppWidget) are explicitly deferred to post-launch.** They require custom native modules and platform-specific code that doesn't belong in the initial release.

---

## New SQLite Tables

Phase 7 adds two new tables to the user data section of the schema:

```sql
-- Color-coded verse highlights (distinct from notes)
CREATE TABLE verse_highlights (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  verse_ref TEXT NOT NULL,            -- 'genesis 1:1'
  color TEXT NOT NULL,                -- 'gold', 'blue', 'green', 'pink', 'purple'
  created_at TEXT DEFAULT (datetime('now')),
  UNIQUE(verse_ref)                   -- one highlight per verse (latest color wins)
);

-- Reading plan definitions (bundled with app, updated via OTA)
CREATE TABLE reading_plans (
  id TEXT PRIMARY KEY,                -- 'gospels-30', 'psalms-30', 'bible-year'
  name TEXT NOT NULL,                 -- 'Gospels in 30 Days'
  description TEXT NOT NULL,
  total_days INTEGER NOT NULL,
  chapters_json TEXT NOT NULL          -- JSON: [{"day":1,"chapters":["matthew_1","matthew_2","matthew_3"]}, ...]
);

-- User's progress on active reading plans
CREATE TABLE plan_progress (
  plan_id TEXT NOT NULL REFERENCES reading_plans(id),
  day_num INTEGER NOT NULL,
  completed_at TEXT,                   -- null = not yet completed
  PRIMARY KEY (plan_id, day_num)
);
```

### Highlight colors

5 fixed colors, each with a semantic name and hex value:

| Name | Hex | Meaning suggestion |
|------|-----|--------------------|
| `gold` | `#c9a84c40` | Key verses / promises |
| `blue` | `#5a7ab040` | Commands / instructions |
| `green` | `#4a8a5a40` | Prayers / praise |
| `pink` | `#c04a6a40` | Prophecy / messianic |
| `purple` | `#8a5ab040` | Questions / study later |

All at 25% opacity (`40` hex alpha) so they underlay the text without obscuring it. The VHL system (content-defined word-level highlighting) is unaffected — user highlights apply to entire verses as a background color.

### Pre-built reading plans

```json
[
  {
    "id": "gospels-30",
    "name": "Gospels in 30 Days",
    "description": "Read all four Gospels — Matthew, Mark, Luke, and John — in one month.",
    "total_days": 30,
    "chapters_json": [
      {"day": 1, "chapters": ["matthew_1", "matthew_2", "matthew_3"]},
      {"day": 2, "chapters": ["matthew_4", "matthew_5"]},
      ...
    ]
  },
  {
    "id": "psalms-30",
    "name": "Psalms in 30 Days",
    "description": "The entire book of Psalms — 5 psalms per day for 30 days.",
    "total_days": 30,
    "chapters_json": [...]
  },
  {
    "id": "wisdom-30",
    "name": "Wisdom Literature",
    "description": "Job, Proverbs, Ecclesiastes, and Song of Solomon in 30 days.",
    "total_days": 30,
    "chapters_json": [...]
  },
  {
    "id": "pentateuch-60",
    "name": "The Pentateuch",
    "description": "Genesis through Deuteronomy — the five books of Moses in 60 days.",
    "total_days": 60,
    "chapters_json": [...]
  },
  {
    "id": "prophets-30",
    "name": "Prophets Deep Dive",
    "description": "Isaiah, Daniel, and Lamentations — major and minor prophetic voices.",
    "total_days": 30,
    "chapters_json": [...]
  }
]
```

Plans are stored in SQLite and can be updated via OTA (they're bundled content, not user data). New plans can be added without app store review.

---

## Batch 7A: Bookmarks + Highlights
*Per-verse bookmarking and color-coded highlighting. Both are user-data features on verses.*

### Prompt for Batch 7A

```
Phase 7A: Build the bookmark and highlight systems.

READ _tools/PHASE_7_PLAN.md (Batch 7A section + highlight colors + new tables).

The bookmark DB functions (addBookmark, removeBookmark, getBookmarks)
already exist in app/src/db/user.ts from Phase 2. This batch adds the
UI. Highlights are entirely new — new table, new rendering, new picker.

1. ADD verse_highlights table:
   Run a migration in database.ts initDatabase():
   CREATE TABLE IF NOT EXISTS verse_highlights (
     id INTEGER PRIMARY KEY AUTOINCREMENT,
     verse_ref TEXT NOT NULL,
     color TEXT NOT NULL,
     created_at TEXT DEFAULT (datetime('now')),
     UNIQUE(verse_ref)
   );

2. ADD highlight DB functions to app/src/db/user.ts:
   - setHighlight(verseRef: string, color: string): void
     INSERT OR REPLACE INTO verse_highlights (verse_ref, color, created_at) ...
   - removeHighlight(verseRef: string): void
   - getHighlightsForChapter(bookId: string, ch: number): VerseHighlight[]
   - getAllHighlights(): VerseHighlight[]

3. CREATE app/src/components/BookmarkButton.tsx:
   Small bookmark icon that appears per-verse (next to NoteIndicator).
   Props: { verseRef: string, isBookmarked: boolean, onToggle: () => void }
   - Bookmark icon (Lucide): filled gold if bookmarked, outline textMuted if not
   - 44pt touch target
   - Long-press: shows label input modal for categorizing

4. CREATE app/src/components/HighlightColorPicker.tsx:
   Popup with 5 color circles + "Remove" option.
   Props: { verseRef: string, currentColor: string | null,
            onSelect: (color: string | null) => void }
   - 5 circles: gold, blue, green, pink, purple (with semantic labels)
   - "Remove highlight" option (X icon)
   - Triggered by long-pressing verse text in VerseBlock

5. UPDATE app/src/components/VerseBlock.tsx:
   a. Add bookmark icon per verse (BookmarkButton)
   b. Add highlight background rendering:
      If a verse has a highlight, render the entire verse Text component
      with a backgroundColor matching the highlight color at 25% opacity.
      Highlights and VHL coexist — VHL colors individual words,
      highlights color the entire verse background.
   c. Long-press on verse text → show HighlightColorPicker
   d. Props additions: highlightedVerses: Map<number, string> (verseNum → color),
      bookmarkedVerses: Set<number>

6. CREATE app/src/screens/BookmarkListScreen.tsx:
   Browsable list of all bookmarked verses.
   - Accessible from MoreTab/SettingsScreen or a dedicated tab
   - FlatList grouped by book: "Genesis" → "Gen 1:1 — In the beginning..."
   - Each item: verse reference, verse text preview (first 60 chars), label, date
   - Tap → navigate to ChapterScreen at that verse
   - Swipe to delete
   - Empty state: "No bookmarks yet. Tap the bookmark icon next to any verse."

7. ADD hooks:
   - useBookmarks(): { bookmarks, isLoading }
   - useHighlightsForChapter(bookId, ch): Map<number, string>
   - useBookmarkedVerses(bookId, ch): Set<number>

8. WIRE into ChapterScreen:
   - useHighlightsForChapter + useBookmarkedVerses in ChapterScreen
   - Pass to SectionBlock → VerseBlock

9. VERIFY:
   - Tap bookmark icon on Genesis 1:1 → icon fills gold
   - BookmarkListScreen shows "Genesis 1:1"
   - Long-press verse → color picker appears
   - Select "gold" → verse background turns gold at 25% opacity
   - VHL highlighting still visible on top of highlight background
   - Remove highlight → background clears
   - Bookmarks persist across app restart
   - Highlights persist across app restart
```

---

## Batch 7B: Reading Plans
*Plan definitions, progress tracking, daily schedule, plan screens.*

### Prompt for Batch 7B

```
Phase 7B: Build the reading plan system.

READ _tools/PHASE_7_PLAN.md (Batch 7B section + plan definitions + new tables).

1. ADD reading_plans and plan_progress tables:
   Migration in database.ts:
   CREATE TABLE IF NOT EXISTS reading_plans (
     id TEXT PRIMARY KEY,
     name TEXT NOT NULL,
     description TEXT NOT NULL,
     total_days INTEGER NOT NULL,
     chapters_json TEXT NOT NULL
   );
   CREATE TABLE IF NOT EXISTS plan_progress (
     plan_id TEXT NOT NULL REFERENCES reading_plans(id),
     day_num INTEGER NOT NULL,
     completed_at TEXT,
     PRIMARY KEY (plan_id, day_num)
   );

2. SEED reading plans:
   Write _tools/build_reading_plans.py that generates the 5 plans:
   - gospels-30: Matt(28) + Mark(16) + Luke(24) + John(21) = 89ch / 30 days
   - psalms-30: Ps 1-150 / 30 days (5/day)
   - wisdom-30: Job(42) + Prov(31) + Eccl(12) + Song(8) = 93ch / 30 days
   - pentateuch-60: Gen(50) + Exod(40) + Lev(27) + Num(36) + Deut(34) = 187ch / 60 days
   - prophets-30: Isa(66) + Dan(12) + Lam(5) = 83ch / 30 days
   Each plan: distribute chapters across days (roughly equal per day).
   Output as JSON, inserted into reading_plans table during build_sqlite.py.
   Plans only reference LIVE chapters — skip non-live books.

3. ADD plan DB functions to app/src/db/user.ts:
   - getPlans(): ReadingPlan[]
   - getActivePlan(): { plan: ReadingPlan, progress: PlanProgress[] } | null
   - startPlan(planId: string, startDate: string): void
     → populate plan_progress with one row per day, all null completed_at
   - completePlanDay(planId: string, dayNum: number): void
   - getPlanProgress(planId: string): PlanProgress[]
   - abandonPlan(planId: string): void → delete plan_progress rows

4. CREATE app/src/screens/PlanListScreen.tsx:
   Browsable list of available reading plans.
   Accessible from SettingsScreen or a "Plans" section on HomeScreen.
   a. Active plan card (if user has a plan in progress):
      - Plan name, progress bar (days completed / total), current day
      - "Today's Reading" preview: chapter names for today
      - Tap → PlanDetailScreen
   b. Available plans list:
      Each card: plan name, description, duration badge ("30 days"),
      chapter count. Tap → PlanDetailScreen (to preview before starting).

5. CREATE app/src/screens/PlanDetailScreen.tsx:
   a. If plan is NOT started:
      - Plan name, description, total days, chapter overview
      - "Start Plan" button → startPlan() + navigate to day 1
   b. If plan IS active:
      - Daily schedule: scrollable list of all days
      - Each day: day number, chapter names, completed/pending state
      - Today's row highlighted with gold border
      - Completed days: checkmark, green tint
      - Tap a day's chapter → navigate to ChapterScreen
      - Auto-completion: when user reads a chapter that's in today's plan
        (via reading_progress from Phase 3), mark it as complete

6. CREATE app/src/components/PlanProgressBar.tsx:
   Horizontal progress bar showing plan completion.
   Props: { completed: number, total: number }
   - Gold fill for completed portion, bgElevated for remaining
   - Percentage label: "42% · Day 13 of 30"

7. CREATE app/src/components/DailyReadingCard.tsx:
   Card showing today's reading assignment.
   Props: { plan, todayChapters, completedToday }
   - Shown on HomeScreen below Continue Reading chips
   - Chapter list with checkmarks for completed ones
   - "Start reading" button → first uncompleted chapter

8. WIRE into HomeScreen + ChapterScreen:
   - HomeScreen: show DailyReadingCard if active plan exists
   - ChapterScreen: on chapter load, check if chapter is in today's plan
     → auto-mark day as complete when all chapters for that day are read

9. VERIFY:
   - PlanListScreen shows 5 available plans
   - Tap "Gospels in 30 Days" → PlanDetailScreen with preview
   - Tap "Start Plan" → day 1 appears, today highlighted
   - Tap Matthew 1 → ChapterScreen opens
   - Navigate back → day 1 shows checkmark (auto-completed via reading_progress)
   - HomeScreen shows DailyReadingCard with today's assignment
   - Progress bar updates as days are completed
   - Abandon plan → progress cleared, plan available to restart
```

---

## Batch 7C: Text-to-Speech + Verse Sharing
*Read chapters aloud. Generate shareable verse image cards.*

### Prompt for Batch 7C

```
Phase 7C: Build text-to-speech and verse sharing features.

READ _tools/PHASE_7_PLAN.md (Batch 7C section).

expo-speech and react-native-view-shot are already installed (Phase 2A).

1. CREATE app/src/components/TTSButton.tsx:
   Play/pause button for reading the current chapter aloud.
   Placed in ChapterScreen's BottomBar (next to translation toggle).
   Props: { verses: Verse[] }
   States: idle → playing → paused → idle
   - Idle: speaker icon (textDim)
   - Playing: speaker-active icon (gold), pulsing
   - Paused: pause icon (gold)

2. CREATE app/src/components/TTSControls.tsx:
   Expanded controls shown when TTS is active.
   Renders as a thin bar above BottomBar.
   a. Play/Pause button (large)
   b. Skip to next verse / previous verse
   c. Speed control: 0.5x, 0.75x, 1.0x, 1.25x, 1.5x (pill selector)
   d. Current verse indicator: "Verse 14 of 31"
   e. Close button (stops TTS)

3. CREATE app/src/hooks/useTTS.ts:
   Custom hook wrapping expo-speech.
   ```typescript
   function useTTS(verses: Verse[]) {
     const [isPlaying, setIsPlaying] = useState(false);
     const [currentVerse, setCurrentVerse] = useState(0);
     const [speed, setSpeed] = useState(1.0);

     function play() {
       setIsPlaying(true);
       speakVerse(currentVerse);
     }

     function speakVerse(index: number) {
       if (index >= verses.length) { stop(); return; }
       setCurrentVerse(index);
       const text = `Verse ${verses[index].verse_num}. ${verses[index].text}`;
       Speech.speak(text, {
         language: 'en-US',
         rate: speed,
         onDone: () => speakVerse(index + 1),  // auto-advance
       });
     }

     function pause() { Speech.stop(); setIsPlaying(false); }
     function stop() { Speech.stop(); setIsPlaying(false); setCurrentVerse(0); }
     function skipNext() { Speech.stop(); speakVerse(currentVerse + 1); }
     function skipPrev() { Speech.stop(); speakVerse(Math.max(0, currentVerse - 1)); }

     return { isPlaying, currentVerse, speed, play, pause, stop,
              skipNext, skipPrev, setSpeed };
   }
   ```

4. WIRE TTS into ChapterScreen:
   - useTTS(verses) hook in ChapterScreen
   - TTSButton in BottomBar
   - TTSControls bar appears above BottomBar when playing
   - Current verse highlighted with subtle gold background while being spoken
   - ScrollView auto-scrolls to keep the current verse visible
   - TTS stops when navigating away from the chapter

5. CREATE app/src/components/VerseShareCard.tsx:
   A styled verse card designed to be captured as an image and shared.
   Props: { verseRef: string, verseText: string, translation: string }
   Layout:
   ```
   ┌──────────────────────────────────────┐
   │                                      │
   │   "For to us a child is born,        │
   │    to us a son is given..."          │
   │                                      │
   │   — Isaiah 9:6 (NIV)                │
   │                                      │
   │   ✦ Scripture Deep Dive              │
   └──────────────────────────────────────┘
   ```
   - Dark background (#0c0a07), gold text, EB Garamond
   - Verse text in bodyLg, centred
   - Reference in displaySm, gold
   - App branding subtle at bottom
   - Fixed aspect ratio (1080x1080 or 1080x1350 for Instagram)

6. CREATE app/src/components/ShareButton.tsx:
   Appears per-verse (perhaps in the long-press context menu alongside
   HighlightColorPicker, or as a dedicated share icon).
   Props: { verseRef, verseText, translation }
   Flow:
   a. Renders VerseShareCard off-screen (in a hidden View)
   b. Captures it with react-native-view-shot → image URI
   c. Opens expo-sharing sheet with the image

7. VERIFY:
   - Tap TTS button → chapter starts reading aloud from verse 1
   - Current verse highlighted and auto-scrolled
   - Pause → resumes from same verse
   - Speed control: 0.5x noticeably slower, 1.5x noticeably faster
   - Skip next/prev works
   - Navigate away → TTS stops cleanly
   - Long-press verse → share option → generates image card → share sheet opens
   - Share card has correct verse text, reference, app branding
```

---

## Batch 7D: Push Notifications
*Daily verse, reading plan reminders, new content alerts.*

### Prompt for Batch 7D

```
Phase 7D: Build the push notification system.

READ _tools/PHASE_7_PLAN.md (Batch 7D section).

expo-notifications is already installed (Phase 2A). This batch configures
it, builds the permission flow, and sets up three notification types.

1. CREATE app/src/services/notifications.ts:
   Notification service module.

   a. requestPermission(): Promise<boolean>
      - Calls Notifications.requestPermissionsAsync()
      - Returns true if granted
      - On iOS: asks for alert + badge + sound
      - On Android: creates notification channel "scripture-deep-dive"

   b. scheduleDailyVerse(hour: number, minute: number): void
      - Cancels any existing daily-verse notification
      - Schedules a repeating local notification:
        trigger: { hour, minute, repeats: true }
        content: random verse from SQLite (query: SELECT * FROM verses
        WHERE translation='niv' ORDER BY RANDOM() LIMIT 1)
      - Title: "Verse of the Day"
      - Body: verse text (truncated to 150 chars) + reference

   c. scheduleReadingPlanReminder(hour: number, minute: number): void
      - Only active if user has an active reading plan
      - Daily reminder: "Today's reading: Matthew 5–7"
      - Includes the chapter names for today's plan day

   d. cancelAllNotifications(): void
   e. getScheduledNotifications(): Promise<Notification[]>

2. CREATE app/src/components/NotificationSettings.tsx:
   Settings section for managing notifications.
   Placed inside SettingsScreen.
   a. Permission status indicator (granted / not granted)
   b. "Request Permission" button (if not granted)
   c. "Daily Verse" toggle + time picker (default: 7:00 AM)
   d. "Reading Plan Reminder" toggle + time picker (default: 8:00 AM)
      Only shown if user has an active plan.
   e. "New Content Alerts" toggle (for future use — when OTA adds chapters)
   f. All preferences stored in user_preferences table

3. UPDATE app/src/screens/SettingsScreen.tsx:
   Add NotificationSettings section below the existing settings.

4. NOTIFICATION HANDLING:
   In App.tsx, add notification response handler:
   - Tap daily verse notification → navigate to that chapter
   - Tap reading plan notification → navigate to PlanDetailScreen
   Uses expo-notifications addNotificationResponseReceivedListener.

5. VERIFY:
   - First launch: permission prompt appears
   - Grant permission → "Daily Verse" toggle appears
   - Enable daily verse at 7:00 AM → notification scheduled
   - Manually trigger notification (for testing): appears with verse text
   - Tap notification → app opens to that chapter
   - Enable reading plan reminder → shows today's chapters
   - Disable all → no notifications scheduled
   - Revoke permission → settings show "Permission not granted" with re-request button
```

---

## Batch 7E: Reading History Screen + Final Integration
*Dedicated browsable history, wiring all Phase 7 features together.*

### Prompt for Batch 7E

```
Phase 7E: Build ReadingHistoryScreen and final Phase 7 integration.

READ _tools/PHASE_7_PLAN.md (Batch 7E section).

1. CREATE app/src/screens/ReadingHistoryScreen.tsx:
   Browsable list of all chapter visits.
   Accessible from SettingsScreen or MoreTab.
   a. FlatList grouped by date (today, yesterday, this week, earlier)
   b. Each item: book name + chapter number + title + timestamp
   c. Tap → navigate to ChapterScreen
   d. "Clear History" button (with confirmation)
   e. Statistics at top:
      - Total chapters read
      - Current streak (consecutive days with at least 1 chapter)
      - Longest streak
      - Favourite book (most chapters read)

2. ADD streak/stats DB functions to app/src/db/user.ts:
   - getReadingStats(): { totalChapters, currentStreak, longestStreak, favouriteBook }
     Computed from reading_progress table.
     Current streak: count consecutive days backwards from today where
     at least 1 reading_progress entry exists.

3. UPDATE navigation:
   Ensure all new screens are in the navigation stacks:
   - BookmarkListScreen → MoreTab stack
   - ReadingHistoryScreen → MoreTab stack
   - PlanListScreen → MoreTab stack (or ReadTab)
   - PlanDetailScreen → pushed from PlanListScreen

4. UPDATE SettingsScreen:
   Add links to new screens:
   - "Bookmarks" → BookmarkListScreen
   - "Reading History" → ReadingHistoryScreen
   - "Reading Plans" → PlanListScreen
   - Notification settings (from Batch 7D)

5. FINAL INTEGRATION CHECK:
   Walk through the complete user journey:
   a. Fresh install → HomeScreen shows hero + book grid (no history, no plan)
   b. Tap Genesis → Chapter 1 → read verse text
   c. Bookmark verse 1:1 → icon fills gold
   d. Long-press verse 1:3 → highlight gold → background changes
   e. Tap TTS → chapter reads aloud → auto-scrolls
   f. Navigate back → HomeScreen shows "Continue Reading: Genesis 1"
   g. Go to Settings → start "Psalms in 30 Days" plan
   h. HomeScreen shows DailyReadingCard: "Day 1: Psalms 1–5"
   i. Enable daily verse notification at 7 AM
   j. Go to Reading History → shows Genesis 1 with timestamp + streak: 1
   k. Go to Bookmarks → shows Genesis 1:1
   l. Share Genesis 1:1 → image card generated → share sheet opens
   m. All features persist after app restart

6. Commit everything. Print feature summary.
```

---

## Batch Summary

| Batch | Description | New components | Tool calls |
|-------|-------------|---------------|-----------|
| **7A** | Bookmarks (UI on existing DB) + Highlights (new table, color picker, verse bg rendering) | BookmarkButton, HighlightColorPicker, BookmarkListScreen, 3 hooks | ~12 |
| **7B** | Reading plans (2 new tables, 5 plan definitions, plan list/detail screens, daily card, auto-completion) | PlanListScreen, PlanDetailScreen, PlanProgressBar, DailyReadingCard, build script | ~14 |
| **7C** | Text-to-speech (expo-speech, play/pause/skip/speed, verse highlight during read) + Verse sharing (react-native-view-shot, branded card, share sheet) | TTSButton, TTSControls, useTTS, VerseShareCard, ShareButton | ~12 |
| **7D** | Push notifications (permission flow, daily verse scheduler, plan reminders, tap-to-navigate) | NotificationSettings, notifications service | ~8 |
| **7E** | Reading history screen (stats, streaks, grouped by date) + navigation wiring + final integration test | ReadingHistoryScreen, stats functions | ~10 |

**Total: 5 batches, ~56 tool calls, targeting 2-3 sessions.**

**Dependency graph:**
```
7A ──────────┐
7B ──────────┤
7C ──────────┼──→ 7E (integration)
7D ──────────┘
```

7A, 7B, 7C, 7D are independent of each other — any order works. 7E integrates everything and must come last.

---

## Session Planning

**Session 1:** Batches 7A + 7B (bookmarks + highlights + reading plans)
**Session 2:** Batches 7C + 7D (TTS + sharing + notifications)
**Session 3:** Batch 7E (history screen + integration wiring + verification)

---

## Verification Checklist (run after Phase 7 is complete)

**Bookmarks:**
- [ ] Bookmark icon appears per verse in VerseBlock
- [ ] Tap bookmark → icon fills gold, persists in SQLite
- [ ] BookmarkListScreen shows all bookmarks grouped by book
- [ ] Tap bookmark in list → navigates to correct chapter
- [ ] Swipe to delete works

**Highlights:**
- [ ] Long-press verse → HighlightColorPicker appears (5 colors + remove)
- [ ] Select color → verse background changes to that color at 25% opacity
- [ ] VHL word highlighting still visible on top of highlight background
- [ ] Highlights persist across app restart
- [ ] Remove highlight → background clears

**Reading Plans:**
- [ ] PlanListScreen shows 5 available plans
- [ ] Start plan → PlanDetailScreen shows daily schedule
- [ ] Today highlighted with gold border
- [ ] Tap chapter in plan → navigates to ChapterScreen
- [ ] Auto-completion: reading a plan chapter marks it done
- [ ] DailyReadingCard shows on HomeScreen
- [ ] Progress bar updates as days complete
- [ ] Abandon plan → progress cleared

**Text-to-Speech:**
- [ ] TTSButton in BottomBar
- [ ] Play → chapter reads aloud from current verse
- [ ] Current verse highlighted during reading
- [ ] Auto-scroll to keep current verse visible
- [ ] Pause/resume works
- [ ] Skip next/prev works
- [ ] Speed: 0.5x–1.5x range audibly different
- [ ] Navigate away → TTS stops cleanly

**Verse Sharing:**
- [ ] Long-press verse → share option available
- [ ] Generates image card: dark bg, gold verse text, reference, app branding
- [ ] Share sheet opens with image
- [ ] Image aspect ratio correct (1080×1080 or 1080×1350)

**Push Notifications:**
- [ ] Permission prompt on first enable
- [ ] Daily verse: scheduled, displays verse + reference
- [ ] Tap notification → opens correct chapter
- [ ] Reading plan reminder shows today's chapters
- [ ] Toggle off → notifications cancelled
- [ ] Settings persist across restart

**Reading History:**
- [ ] ReadingHistoryScreen shows all chapter visits grouped by date
- [ ] Stats: total chapters, current streak, longest streak, favourite book
- [ ] Tap entry → navigates to chapter
- [ ] Clear history works with confirmation

**Integration:**
- [ ] All new screens in navigation stacks
- [ ] SettingsScreen links to bookmarks, history, plans, notifications
- [ ] HomeScreen shows: continue reading + daily reading card (if plan active)
- [ ] All user data persists across app restart
- [ ] No regression in ChapterScreen (notes, VHL, panels still work)
