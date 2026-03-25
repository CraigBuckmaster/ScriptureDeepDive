# Companion Study — Local Development Setup

## Prerequisites

- **Node.js** 18+ (check: `node --version`)
- **npm** 9+ (comes with Node)
- **Expo Go** app installed on your iPhone (App Store, free)
- Windows, Mac, or Linux — all work

## Quick Start

```bash
# 1. Clone the repo
git clone https://github.com/CraigBuckmaster/ScriptureDeepDive.git
cd ScriptureDeepDive/app

# 2. Install dependencies
npm install

# 3. Start the dev server
npx expo start
```

A QR code appears in your terminal. Scan it with your iPhone camera → opens in Expo Go → app runs on your phone.

**Tips:**
- Make sure your phone and computer are on the same WiFi network
- If the QR code doesn't connect, try `npx expo start --tunnel`
- For web preview: `npx expo start --web` (opens in browser)
- Uses Expo SDK 52 — compatible with current Expo Go from App Store
- The `.npmrc` file auto-handles peer dependency resolution

## Building the Content Database

The app needs `scripture.db` to display content. To generate it:

```bash
# From the repo root (not app/)
cd CompanionStudy

# Generate all content JSON from archived HTML
python3 _tools/convert_js_to_json.py
python3 _tools/extract_inline_data.py
python3 _tools/export_config.py
python3 -c "import sys; sys.path.insert(0,'_tools'); from extract_to_json import extract_all; extract_all('content')"
python3 _tools/migrate_content.py

# Build the SQLite database
python3 _tools/build_sqlite.py

# Validate (optional but recommended)
python3 _tools/validate.py
python3 _tools/validate_sqlite.py
```

This produces `scripture.db` (~33MB) in the repo root. The app loads it via expo-sqlite.

**Python requirements:** Python 3.9+, `beautifulsoup4` (`pip install beautifulsoup4`).

## Writing New Chapters

```bash
# Copy the template
cp _tools/GENERATOR_TEMPLATE.py /tmp/gen_jeremiah_1_10.py

# Edit with your content, then run
python3 /tmp/gen_jeremiah_1_10.py

# Rebuild DB
python3 _tools/build_sqlite.py
```

See `_tools/WORKFLOW.md` for the full authoring pipeline.

## Project Structure

```
ScriptureDeepDive/
  app/                    ← React Native (Expo) project
    App.tsx               ← Entry point: fonts, DB, navigation
    src/
      theme/              ← Colors, typography, spacing tokens
      types/              ← TypeScript interfaces (31 types)
      db/                 ← SQLite queries (51 functions)
      stores/             ← Zustand state (settings + reader)
      hooks/              ← Data loading hooks (13 hooks)
      screens/            ← All 17 screens
      components/         ← All UI components (43 files)
        panels/           ← 18 panel components + PanelRenderer
      navigation/         ← Tab navigator + 5 stacks
      utils/              ← Verse resolver, reference parser
  _tools/                 ← Build tools + plans
  content/                ← Source-of-truth chapter JSON + meta + verses
  scripture.db            ← SQLite database (built from content/)
```

## Troubleshooting

**"Module not found" errors:** Run `npm install` in the `app/` directory.

**QR code won't connect:** Try `npx expo start --tunnel` or check both devices are on the same network.

**Database not loading:** Make sure `scripture.db` exists. Run `python3 _tools/build_sqlite.py` from the repo root.

**Fonts not loading:** The app uses `@expo-google-fonts` packages — they download automatically via npm. If fonts show as system defaults, check the Expo Go console for font loading errors.

## Platform Notes

| Setup | What works |
|-------|-----------|
| **Windows + iPhone** | Full dev via Expo Go. QR code scan. All features except native builds. |
| **Mac + iPhone** | Full dev + native builds (`npx expo run:ios`). |
| **Cloud builds** | `eas build --platform ios` builds in Expo's cloud. Needs Apple Developer account ($99/yr). |
| **Android** | Also works. Install Expo Go on Android, same QR code flow. |
