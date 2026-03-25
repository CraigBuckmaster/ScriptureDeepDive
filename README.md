# Scripture Deep Dive

**Scholarly Bible study with 43 commentators, Hebrew & Greek word studies, an interactive genealogy tree, a biblical world map, and verse-by-verse analysis.**

## Features

- **879 chapters** across 30 books with verse-by-verse scholarly commentary
- **Dual translation** — NIV and ESV with instant toggle
- **43 scholar commentaries** — evangelical, reformed, Jewish, critical, patristic
- **Hebrew & Greek word studies** — original-language roots with glosses and semantic range
- **Interactive genealogy tree** — 211 biblical figures with pinch-to-zoom and family linking
- **Biblical world map** — 71 ancient places, 28 narrative journey overlays
- **Timeline** — 216 events from Creation to Revelation
- **Parallel passage comparison** — 45 synoptic sets with unique-word highlighting
- **Personal study tools** — notes, bookmarks, color highlights, reading plans, TTS
- **Entirely offline** — no internet required after install
- **Free** — no ads, no subscriptions, no in-app purchases

## Tech Stack

- **React Native** (Expo SDK 52) — cross-platform iOS + Android
- **TypeScript** — 136+ source files, strict mode
- **SQLite** (expo-sqlite) — 33MB content database with FTS5 search
- **react-native-svg** + **d3-hierarchy** — genealogy tree rendering
- **react-native-maps** — biblical world map
- **Zustand** — state management
- **NativeWind** — Tailwind CSS for React Native

## Quick Start

```bash
git clone https://github.com/CraigBuckmaster/ScriptureDeepDive.git
cd ScriptureDeepDive/app
npm install
npx expo start
```

Scan the QR code with Expo Go on your phone. See [app/SETUP.md](app/SETUP.md) for detailed setup instructions.

## Project Structure

```
app/                          React Native (Expo) project
  src/
    screens/     (21)         All screens fully implemented
    components/  (63)         Panels, tree, map, modals, primitives
    hooks/       (20)         Data loading, state, TTS, gestures
    db/          (4)          SQLite queries (63 functions)
    theme/       (5)          81 colors, 13 type presets, spacing
    stores/      (3)          Settings + reader state
    utils/       (7)          Verse resolver, tree builder, geo math
    navigation/  (8)          5 stacks + tab navigator
    services/    (1)          Push notifications
    types/       (1)          31 TypeScript interfaces
  __tests__/                  Unit + integration + component tests
  maestro/                    16 E2E test flows
  store-metadata/             App Store + Google Play metadata
content/                      Source-of-truth chapter JSON + meta + verse files
_tools/                       Build tools + content pipeline
scripture.db                  SQLite database (built from content/)
```

## Content Pipeline

```
GENERATOR_TEMPLATE.py → save_chapter() → content/{book}/{ch}.json
  → build_sqlite.py → scripture.db → OTA update
```

See [_tools/WORKFLOW.md](_tools/WORKFLOW.md) for the full authoring pipeline.

## License

© Scripture Deep Dive. All rights reserved.
