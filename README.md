# Companion Study

*Don't just read the Bible. Learn to read it the way it was written.*

**The only Bible app that bridges the gap between reading scripture and understanding ancient literature.** 45+ scholars, interlinear Hebrew & Greek, and features no other app offers — seminary-level depth, entirely offline, and free.

---

## Features

### Bible Reading

- **KJV & ASV translations** — Both public domain translations available instantly. On-demand translation architecture ready for additional licensed translations (NIV, ESV) when licensing is secured.
- **Chapter-by-chapter reading** — Every chapter of the Bible paired with scholarly study panels. Swipe between chapters, pick up where you left off.
- **Interlinear Hebrew & Greek** — Tap any verse to see the original-language words with transliterations, Strong's numbers, morphology, and glosses. Covers the full Old and New Testaments.
- **Full-text search** — FTS5-powered search across all verse text with testament and book filtering.

### Scholarly Commentary

- **54 scholar commentaries** — Perspectives from evangelical, reformed, Jewish, critical, patristic, and Pentecostal traditions. Commentators include MacArthur, Calvin, Sarna, Alter, Robertson, Catena, NET Bible notes, and more.
- **Study panels** — Each section of Scripture comes with expandable panels for Hebrew word studies, historical context, cross-references, literary structure, discourse analysis, reception history, textual notes, and scholar commentary. One tap to open any panel.
- **Scholar browser** — Browse all 54 scholars with bios, tradition tags, and links to their commentary across the Bible.

### Explore Tools

- **Interactive genealogy tree** — Pinch-to-zoom SVG family tree spanning Creation to Christ. Era filtering, search-to-node, tap any person to read their bio with family links, dates, and scripture references.
- **Biblical world map** — Interactive map with ancient place markers, narrative journey overlays (Exodus route, Paul's missionary journeys, etc.), story picker by era, and zoom-dependent labels.
- **Timeline** — Visual timeline from Creation to Revelation. Filter by era and category (events, books, people, world history). Tap any event to jump to the related chapter.
- **Word studies** — 43 Hebrew and Greek word studies with original script, transliteration, glosses, semantic range, and every occurrence in Scripture.
- **Concordance** — Search by Strong's number to find every verse where a Hebrew or Greek word appears, with interlinear context.
- **Prophecy chains** — 50 prophetic themes traced across the canon, from initial promise through progressive revelation to fulfillment. Categories include messianic, typological, and kingdom prophecies.
- **Concept explorer** — 20 theological concepts (covenant, atonement, temple, etc.) with journey stops showing how each concept develops across Scripture, linked word studies, prophecy chains, cross-reference threads, and key people.
- **Difficult passages** — 53 scholarly treatments of challenging texts. Multiple tradition perspectives with strengths/weaknesses analysis, severity ratings, and key verse context. Categories: ethical, contradiction, theological, historical, textual.
- **Parallel passage comparison** — Synoptic Gospel sets and other parallel passages displayed side by side with unique-word highlighting.
- **Content library** — Curated collection of the best study content across all books, filterable by category and testament.

### Study Panels (Per Section)

Every section of Scripture includes some or all of these expandable study panels:

| Panel | Description |
|-------|-------------|
| **Hebrew / Greek** | Original-language words with morphology, Strong's numbers, and glosses |
| **Hebrew Reading** | Guided reading of key Hebrew phrases with transliteration and notes |
| **Historical Context** | Ancient Near Eastern background, audience assumptions, cultural setting |
| **Cross-References** | Related passages with thematic connections and verse links |
| **Literary Structure** | Chiastic patterns, inclusios, discourse flow, and structural analysis |
| **Commentary** | Scholar-specific verse-by-verse analysis (MacArthur, Calvin, Sarna, etc.) |
| **Discourse Analysis** | Argument flow and rhetorical structure (especially Pauline epistles) |
| **Debate** | Scholarly disagreements with positions from multiple traditions |
| **Reception History** | How the passage has been interpreted across centuries and traditions |
| **Textual Notes** | Manuscript variants, translation differences, and text-critical observations |
| **Threading** | Intertextual connections linking Old and New Testament passages |
| **Places** | Geographic context with map links for locations mentioned in the passage |
| **People** | Biographical context for people mentioned, with genealogy tree links |
| **Timeline** | Chronological context with links to the interactive timeline |
| **Themes Radar** | Visual theme scoring showing which theological themes are prominent |
| **Translation Comparison** | Side-by-side comparison of how different translations render key phrases |

### Personal Study Tools

- **Notes** — Create notes on any verse with tags and collections. Full-text search across all notes. Bidirectional note linking.
- **Bookmarks** — Label and organize bookmarks for quick access to important passages.
- **Color highlights** — Highlight verses in multiple colors with optional notes per highlight. Organize into highlight collections.
- **Reading plans** — 10 curated plans (Genesis deep dive, Psalms journey, Gospel harmony, etc.) with daily progress tracking.
- **Reading streaks** — Daily engagement tracking with streak counter and milestones.
- **Reading history** — Per-chapter visit log showing which chapters you've studied and when.
- **Text-to-speech** — Listen to any chapter read aloud with play/pause, skip, and speed controls.
- **Study depth tracking** — Tracks which panels you've opened per section, encouraging deeper engagement over time.
- **Export** — Export all notes, bookmarks, and highlights as JSON for backup or external use.

### Onboarding & Engagement

- **First-launch onboarding** — 3-page guided carousel introducing the app's thesis, study panel system, and explore tools.
- **Daily verse** — Push notification with a random verse each day at your preferred time.
- **Re-engagement notifications** — Gentle nudge after 3 days of inactivity to continue your study.
- **App Store review prompt** — Triggers after reading 3+ chapters, once per app version.
- **Study coach** — Contextual tips that introduce study tools as you encounter them.

### Account & Settings

- **Optional sign-in** — Google, Facebook, or email authentication via Supabase. The app works fully without an account. Sign-in unlocks premium features (coming soon) and future cloud sync.
- **Theme modes** — Dark, sepia, and light themes. All colors use centralized tokens that respond to theme switching.
- **Font size** — Adjustable reading font size (12-24pt).
- **Verse highlighting toggle** — Show/hide visual keyword highlights in verse text.
- **Entirely offline** — All content bundled in the app. No internet required after install.
- **Free** — No ads, no subscriptions, no in-app purchases.

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Framework | React Native 0.81 (Expo SDK 54) |
| Language | TypeScript — strict mode |
| Database | SQLite (expo-sqlite 16) — FTS5 search |
| Auth | Supabase (Google, Facebook, email) |
| Tree rendering | react-native-svg 15 + d3-hierarchy |
| Map | react-native-maps 1.20 |
| Gestures | react-native-gesture-handler 2.28 + react-native-reanimated 4.1 |
| State | Zustand 5 |
| Testing | Jest (jest-expo) — 201 suites, 1178 tests |
| CI/CD | GitHub Actions — tests + coverage on every PR |
| Deployment | EAS Build + EAS Update (OTA) |

## Quick Start

```bash
git clone https://github.com/CraigBuckmaster/ScriptureDeepDive.git
cd ScriptureDeepDive/app
npm install
python3 ../_tools/build_sqlite.py   # builds scripture.db from content JSON
npx expo start
```

Scan the QR code with Expo Go on your phone. See [app/SETUP.md](app/SETUP.md) for detailed setup.

## Running on iPhone

| Setup | How |
|-------|-----|
| **Windows/Mac/Linux + iPhone** | `npx expo start` → scan QR with iPhone camera → opens in Expo Go |
| **Tunnel mode** (if QR won't connect) | `npx expo start --tunnel` — routes through Expo's servers |
| **Native dev build** (Mac only) | `npx expo run:ios` — builds native binary |
| **Cloud build** | `eas build --platform ios` — builds in Expo cloud, needs Apple Developer ($99/yr) |
| **Production OTA** | `eas update --branch production` — instant update, no App Store review |

### iOS Accessibility: Reduce Motion Workaround

If **Settings > Accessibility > Motion > Reduce Motion** is enabled, Reanimated silently breaks programmatic `useAnimatedStyle` updates. Gesture-driven updates still work fine.

**Solution:** Two-layer transform architecture — outer `Animated.View` for gesture deltas (worklets, always works), inner `View` for base position (React state, always works). See `app/src/hooks/useTreeGestures.ts` for full details.

## Project Structure

```
ScriptureDeepDive/
├── app/                          React Native (Expo) project
│   ├── src/
│   │   ├── screens/              36 screens
│   │   ├── components/           Panels, tree, map, modals, primitives
│   │   ├── hooks/                Data loading, state, TTS, gestures
│   │   ├── db/                   SQLite queries (content + user + translation manager)
│   │   ├── lib/                  Supabase client, OAuth helpers
│   │   ├── services/             Analytics, notifications, re-engagement
│   │   ├── theme/                Color tokens, type presets, spacing, semantic maps
│   │   ├── stores/               Settings, reader state, auth (Zustand)
│   │   ├── utils/                Verse resolver, tree builder, geo math
│   │   ├── navigation/           Stacks + tab navigator
│   │   └── types/                TypeScript interfaces
│   ├── __tests__/                201 test suites (unit + integration + component)
│   └── assets/                   Bundled scripture.db
├── content/                      Source-of-truth JSON
│   ├── {book_id}/{ch}.json       One file per chapter
│   ├── meta/                     Reference data (books, scholars, people, places, etc.)
│   └── verses/                   KJV, ASV (+ NIV, ESV preserved for future licensing)
├── _tools/                       Build system + content pipeline
│   ├── shared.py                 save_chapter(), REGISTRY
│   ├── config.py                 Scholar config, book metadata, people bios
│   ├── build_sqlite.py           JSON → SQLite compiler (bundled + supplemental translations)
│   ├── validate.py               Content JSON schema validator
│   └── validate_sqlite.py        SQLite integrity checker
└── .github/workflows/test.yml    CI — tests + coverage on every PR
```

## Translations Architecture

Translations are split into **bundled** and **on-demand** to keep the app binary small:

- **Bundled** (KJV, ASV) — baked into `scripture.db`, available instantly
- **On-demand** (future licensed translations) — separate small `.db` files downloaded when the user first selects them

Controlled by `AVAILABLE_TRANSLATIONS` and `BUNDLED_TRANSLATIONS` in `build_sqlite.py`. The app-side registry (`translationRegistry.ts`) and download manager (`translationManager.ts`) handle the rest. Adding a new translation is a config change + rebuild.

## Content Pipeline

```
Generator script (/tmp/gen_{book}.py)
  → save_chapter(book_dir, ch, data_dict)
    → content/{book}/{ch}.json
      → build_sqlite.py
        → app/assets/scripture.db
          → validate.py + validate_sqlite.py
            → eas update --branch production
```

Generator scripts are ephemeral — created in `/tmp/`, never committed.

## Database

Two separate SQLite databases:

- **`scripture.db`** — read-only content, replaced on updates. Bundled translations + FTS5 on verses and people.
- **`user.db`** — notes, bookmarks, highlights, preferences, auth profiles, analytics events. Never replaced, migrated in-place (8 migration versions).

DB version tracked in `_tools/db_version.json`. The build script auto-increments the version and syncs it to the app's `database.ts`.

## Testing

```bash
cd app
npx jest              # run all tests
npx jest --coverage   # run with coverage report
```

201 test suites covering screens, hooks, components, panels, stores, DB queries, and utilities. CI runs on every pull request and posts test results + coverage percentages directly to the PR.

## Deploy

```bash
python3 _tools/build_sqlite.py       # builds scripture.db + supplemental translations
git add -A && git commit -m "..."
git push
cd app && eas update --branch production
```

## Conventions

- **Book IDs:** Underscores for multi-word names (`1_samuel`, `song_of_solomon`).
- **Generators:** Always in `/tmp/`, never committed.
- **Scholars:** Data-driven via `config.py` SCHOLAR_REGISTRY + COMMENTATOR_SCOPE.
- **Meta data:** All in `content/meta/*.json`.
- **Colors:** All colors use theme tokens from `theme/colors.ts`. No hardcoded hex values in screens.
- **Translations:** Controlled by `AVAILABLE_TRANSLATIONS` in `build_sqlite.py`. Verse data for unlicensed translations stays in the repo but isn't exposed in the app.
- **Analytics:** Local SQLite event log. Events pruned after 90 days.

## License

All rights reserved.
