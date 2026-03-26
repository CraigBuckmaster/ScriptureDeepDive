# Companion Study

*Logos & Letters, verse by verse*

**Scholarly Bible study with 47 commentators, Hebrew & Greek word studies, an interactive genealogy tree, a biblical world map, and verse-by-verse analysis — entirely offline.**

## Features

- **996 chapters** across 36 live books with verse-by-verse scholarly commentary
- **Dual translation** — NIV and ESV with instant toggle (61,000+ verses)
- **47 scholar commentaries** — evangelical, reformed, Jewish, critical, patristic
- **Hebrew & Greek word studies** — original-language roots with glosses and semantic range
- **Interactive genealogy tree** — 237 biblical figures with pinch-to-zoom and family linking
- **Biblical world map** — 73 ancient places, 28 narrative journey overlays
- **Timeline** — 366 events from Creation to Revelation
- **Parallel passage comparison** — 45 synoptic sets with unique-word highlighting
- **Personal study tools** — notes, bookmarks, color highlights, reading plans, TTS
- **Entirely offline** — no internet required after install
- **Free** — no ads, no subscriptions, no in-app purchases

## Tech Stack

| Layer | Tech |
|-------|------|
| Framework | React Native 0.76 (Expo SDK 52) |
| Language | TypeScript — 148 source files, strict mode |
| Database | SQLite (expo-sqlite 15) — 35MB content DB with FTS5 search |
| Tree rendering | react-native-svg 15 + d3-hierarchy |
| Map | react-native-maps 1.18 |
| Gestures | react-native-gesture-handler 2.20 + react-native-reanimated 3.16 |
| State | Zustand |
| Deployment | EAS Build + EAS Update (OTA) |

## Quick Start

```bash
git clone https://github.com/CraigBuckmaster/ScriptureDeepDive.git
cd ScriptureDeepDive/app
npm install
npx expo start
```

Scan the QR code with Expo Go on your phone. See [app/SETUP.md](app/SETUP.md) for detailed setup including building the content database.

## Running on iPhone

The primary development target is iOS via Expo Go. Here's what works:

| Setup | How |
|-------|-----|
| **Windows/Mac/Linux + iPhone** | `npx expo start` → scan QR with iPhone camera → opens in Expo Go |
| **Tunnel mode** (if QR won't connect) | `npx expo start --tunnel` — routes through Expo's servers, works across networks |
| **Native dev build** (Mac only) | `npx expo run:ios` — builds native binary, allows custom native modules |
| **Cloud build** | `eas build --platform ios` — builds in Expo cloud, needs Apple Developer ($99/yr) |
| **Production OTA** | `eas update --branch production` — instant update, no App Store review |

### iOS Accessibility: Reduce Motion Workaround

If **Settings → Accessibility → Motion → Reduce Motion** is enabled on the iPhone, Reanimated 3.16 silently breaks programmatic `useAnimatedStyle` updates. This affects any feature that moves the viewport to a specific position (era filters, search-to-node, deep links on the genealogy tree).

**What happens:** Shared values update in JavaScript (confirmed via logs), but the native `Animated.View` transform never changes. Gesture-driven updates (pan, pinch) work fine because gesture worklets use a different Reanimated pipeline.

**What we tried that didn't work:**
1. Direct `.value = x` assignment from JS thread
2. `withTiming` + `ReduceMotion.Never`
3. `cancelAnimation()` before setting
4. `runOnUI(() => { 'worklet'; ... })()`
5. `setRenderTick` to force React re-render (worklets don't re-run on renders)
6. Single `Animated.View` with any combination of the above

**What works:** Two-layer transform architecture:
- Outer `Animated.View` — gesture deltas (Reanimated shared values, updated by gesture worklets → always works)
- Inner `View` — base position (React `useState`, updated by `setBase()` → plain React re-render → always works)

Programmatic centering sets the inner View via React state. Gestures modify the outer Animated.View via worklets. Neither relies on the broken Reanimated JS→native bridge.

See `app/src/hooks/useTreeGestures.ts` for the full documented history.

## Project Structure

```
ScriptureDeepDive/
├── app/                          React Native (Expo) project
│   ├── src/
│   │   ├── screens/     (23)     All screens
│   │   ├── components/  (68)     Panels, tree, map, modals, primitives
│   │   ├── hooks/       (22)     Data loading, state, TTS, gestures
│   │   ├── db/          (4)      SQLite queries (66 functions)
│   │   ├── theme/       (5)      115 color tokens, type presets, spacing
│   │   ├── stores/      (3)      Settings + reader state (Zustand)
│   │   ├── utils/       (10)     Verse resolver, tree builder, geo math
│   │   ├── navigation/  (8)      5 stacks + tab navigator
│   │   └── types/       (1)      42 TypeScript interfaces
│   ├── __tests__/                Unit + integration + component tests
│   ├── maestro/                  16 E2E test flows
│   └── store-metadata/           App Store + Google Play metadata
├── content/                      Source-of-truth JSON
│   ├── {book_id}/{ch}.json       One file per chapter (996 total)
│   ├── meta/                     Reference data (books, scholars, people, places)
│   └── verses/                   NIV + ESV verse files per book
├── _tools/                       Build system + content pipeline
│   ├── shared.py                 save_chapter(), REGISTRY (~1,350 lines)
│   ├── config.py                 Scholar config, book metadata, people bios
│   ├── build_sqlite.py           JSON → SQLite compiler
│   ├── validate.py               Content JSON schema validator
│   ├── validate_sqlite.py        SQLite integrity checker
│   ├── GENERATOR_TEMPLATE.py     Template for chapter generator scripts
│   ├── BUILD_PLAN.md             How to add a new book
│   └── MASTER_PLAN.md            Wave order, scholar allocation
└── scripture.db                  SQLite database (built from content/)
```

## Content Pipeline

```
Generator script (/tmp/gen_{book}.py)
  → save_chapter(book_dir, ch, data_dict)
    → content/{book}/{ch}.json
      → build_sqlite.py
        → scripture.db
          → validate.py + validate_sqlite.py
            → eas update --branch production
```

Generator scripts are ephemeral — created in `/tmp/`, never committed. See `_tools/BUILD_PLAN.md` before starting a new book.

## Database

Two separate SQLite databases (see `_tools/DEV_GUIDE.md` for conventions):

- **`scripture.db`** (~35 MB) — read-only content, replaced on updates
- **`user.db`** — user data (notes, bookmarks, highlights, preferences), never replaced, migrated in-place

### Content tables (scripture.db)

| Table | Rows | Description |
|-------|------|-------------|
| books | 66 | All 66 Bible books (36 live, 30 pending) |
| book_intros | 66 | Scholarly introductions for every book |
| chapters | 996 | Chapter metadata + links |
| sections | 2,239 | Verse-range sections within chapters |
| section_panels | 16,307 | Commentary panels (Hebrew, historical, context, scholars) |
| chapter_panels | 7,650 | Chapter-level panels (people, translations, themes) |
| verses | 61,000 | NIV + ESV text with FTS5 search |
| people | 237 | Biblical figures with bios, eras, family links |
| scholars | 47 | Commentator profiles and tradition info |
| places | 73 | Ancient locations with coordinates |
| map_stories | 28 | Narrative journey overlays |
| timelines | 366 | Historical events |
| synoptic_map | 45 | Parallel passage sets |
| word_studies | 14 | Hebrew/Greek root analyses |
| vhl_groups | 4,395 | Verse highlight groups |
| cross_ref_threads | 11 | Cross-reference thread sets |
| genealogy_config | 3 | Tree rendering configuration |

Plus FTS5 indexes on verses and people, and user tables (notes, bookmarks, preferences, reading progress).

## Live Books (36)

**Old Testament (31):** Genesis, Exodus, Leviticus, Numbers, Deuteronomy, Joshua, Judges, Ruth, 1 Samuel, 2 Samuel, 1 Kings, 2 Kings, 1 Chronicles, 2 Chronicles, Ezra, Nehemiah, Esther, Job, Psalms, Proverbs, Ecclesiastes, Song of Solomon, Isaiah, Jeremiah, Lamentations, Ezekiel, Daniel, Joel, Amos, Obadiah, Jonah

**New Testament (5):** Matthew, Mark, Luke, John, Acts

## Wave Progress

| Wave | Books | Status |
|------|-------|--------|
| 1 | Genesis → Ruth, Psalms → Song of Solomon, Matthew → Acts | Complete |
| 2 | 1 Samuel → Esther | Complete |
| 3 | Daniel, Lamentations, Isaiah, Jeremiah, Ezekiel | Complete (Isaiah ch23-66 needs enrichment) |
| 4 (current) | Minor Prophets: Joel ✓, Amos ✓, Obadiah ✓, Jonah ✓ → Hosea, Micah, Habakkuk, Nahum, Zephaniah, Haggai, Zechariah, Malachi | In progress |
| 5 | NT Epistles | Planned |
| 6 | Revelation | Planned |

**Enrichment debt:** Isaiah 23–66 (44 chapters), Kings/Chronicles MacArthur commentary (112 chapters).

## Deploy Checklist

```bash
# 1. Build chapters via ephemeral generator
python3 /tmp/gen_{book}.py

# 2. Compile JSON → SQLite
python3 _tools/build_sqlite.py

# 3. Validate content + database
python3 _tools/validate.py
python3 _tools/validate_sqlite.py

# 4. Clean up generators
rm /tmp/gen_*.py

# 5. Commit + push
git add -A && git commit -m "feat: {book} chapters X-Y" && git push

# 6. OTA deploy
eas update --branch production
```

## Conventions

- **Verse text:** Word-for-word NIV. No paraphrasing, no skipping verses.
- **Book IDs:** Underscores for multi-word names (`1_samuel`, `song_of_solomon`).
- **Generators:** Always in `/tmp/`, never committed.
- **Scholars:** Data-driven via `config.py` SCHOLAR_REGISTRY + COMMENTATOR_SCOPE.
- **Meta data:** All in `content/meta/*.json`.

## License

© Companion Study. All rights reserved.
