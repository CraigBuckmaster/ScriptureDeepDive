# Companion Study

*Logos & Letters, verse by verse*

**Scholarly Bible study with 54 commentators, Hebrew & Greek word studies, an interactive genealogy tree, a biblical world map, and verse-by-verse analysis — entirely offline.**

## Features

- **Dual translation** — NIV and ESV with instant toggle
- **54 scholar commentaries** — evangelical, reformed, Jewish, critical, patristic, Pentecostal
- **Hebrew & Greek word studies** — original-language roots with glosses, semantic range, and key occurrences
- **Interactive genealogy tree** — pinch-to-zoom family tree with era filtering and search-to-node
- **Biblical world map** — ancient places with narrative journey overlays
- **Timeline** — Creation to Revelation with chapter deep-links and era filtering
- **Prophecy chains** — 50 chains tracing prophetic themes across the canon
- **Concept Explorer** — 20 theological concepts with cross-references and related passages
- **Difficult Passages** — 53 scholarly treatments with multiple tradition perspectives, strengths/weaknesses analysis
- **Discourse analysis** — argument-flow panels (Romans)
- **Parallel passage comparison** — synoptic sets with unique-word highlighting
- **Personal study tools** — notes with tags and collections, bookmarks, color highlights, reading plans, TTS
- **Entirely offline** — no internet required after install
- **Free** — no ads, no subscriptions, no in-app purchases

## Tech Stack

| Layer | Tech |
|-------|------|
| Framework | React Native 0.81 (Expo SDK 54) |
| Language | TypeScript — strict mode |
| Database | SQLite (expo-sqlite 16) — FTS5 search |
| Tree rendering | react-native-svg 15 + d3-hierarchy |
| Map | react-native-maps 1.20 |
| Gestures | react-native-gesture-handler 2.28 + react-native-reanimated 4.1 |
| State | Zustand 5 |
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

| Setup | How |
|-------|-----|
| **Windows/Mac/Linux + iPhone** | `npx expo start` → scan QR with iPhone camera → opens in Expo Go |
| **Tunnel mode** (if QR won't connect) | `npx expo start --tunnel` — routes through Expo's servers |
| **Native dev build** (Mac only) | `npx expo run:ios` — builds native binary |
| **Cloud build** | `eas build --platform ios` — builds in Expo cloud, needs Apple Developer ($99/yr) |
| **Production OTA** | `eas update --branch production` — instant update, no App Store review |

### iOS Accessibility: Reduce Motion Workaround

If **Settings → Accessibility → Motion → Reduce Motion** is enabled, Reanimated silently breaks programmatic `useAnimatedStyle` updates. Gesture-driven updates still work fine.

**Solution:** Two-layer transform architecture — outer `Animated.View` for gesture deltas (worklets, always works), inner `View` for base position (React state, always works). See `app/src/hooks/useTreeGestures.ts` for full details.

## Project Structure

```
ScriptureDeepDive/
├── app/                          React Native (Expo) project
│   ├── src/
│   │   ├── screens/              All screens
│   │   ├── components/           Panels, tree, map, modals, primitives
│   │   ├── hooks/                Data loading, state, TTS, gestures
│   │   ├── db/                   SQLite queries (content + user modules)
│   │   ├── theme/                Color tokens, type presets, spacing
│   │   ├── stores/               Settings + reader state (Zustand)
│   │   ├── utils/                Verse resolver, tree builder, geo math
│   │   ├── navigation/           Stacks + tab navigator
│   │   └── types/                TypeScript interfaces
│   ├── __tests__/                Unit + integration + component tests
│   └── maestro/                  E2E test flows
├── content/                      Source-of-truth JSON
│   ├── {book_id}/{ch}.json       One file per chapter
│   ├── meta/                     Reference data (books, scholars, people, places, etc.)
│   └── verses/                   NIV + ESV verse files per book
├── _tools/                       Build system + content pipeline
│   ├── shared.py                 save_chapter(), REGISTRY
│   ├── config.py                 Scholar config, book metadata, people bios
│   ├── build_sqlite.py           JSON → SQLite compiler
│   ├── validate.py               Content JSON schema validator
│   ├── validate_sqlite.py        SQLite integrity checker
│   └── GENERATOR_TEMPLATE.py     Template for chapter generator scripts
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

Generator scripts are ephemeral — created in `/tmp/`, never committed.

## Database

Two separate SQLite databases:

- **`scripture.db`** — read-only content, replaced on updates. FTS5 on verses and people.
- **`user.db`** — notes, bookmarks, highlights, preferences. Never replaced, migrated in-place.

DB version tracked in `_tools/db_version.json`. See `_tools/DEV_GUIDE.md` for conventions.

## Deploy

```bash
python3 _tools/build_sqlite.py
cp scripture.db app/assets/scripture.db
git add -A && git commit -m "..." && git push
cd app && eas update --branch production
```

## Conventions

- **Verse text:** Word-for-word NIV. No paraphrasing, no skipping verses.
- **Book IDs:** Underscores for multi-word names (`1_samuel`, `song_of_solomon`).
- **Generators:** Always in `/tmp/`, never committed.
- **Scholars:** Data-driven via `config.py` SCHOLAR_REGISTRY + COMMENTATOR_SCOPE.
- **Meta data:** All in `content/meta/*.json`.

## License

© Companion Study. All rights reserved.
