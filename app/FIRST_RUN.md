# Getting Started — First Run Guide

## What You Need

1. **Node.js 18+** — Download from https://nodejs.org (LTS version)
2. **Git** — Download from https://git-scm.com/download/win
3. **A phone** with **Expo Go** installed (iPhone App Store or Google Play Store)

> **Why a phone?** The app uses SQLite to serve 979 chapters of content.
> SQLite works great on phones via Expo Go but has limitations in web browsers.
> You'll scan a QR code and the app runs on your phone instantly.

## Steps (Windows Command Prompt or PowerShell)

### 1. Clone the repo

```bash
git clone https://github.com/CraigBuckmaster/ScriptureDeepDive.git
cd ScriptureDeepDive\app
```

### 2. Install dependencies

```bash
npm install
```

If you see peer dependency warnings, they're safe to ignore (the `.npmrc` file handles this).

If `expo-file-system` gives a version error, run this to auto-pick the compatible version:

```bash
npx expo install expo-file-system
```

### 3. Copy the database into the app

```bash
npm run setup
```

You should see:
```
  ✅ Copied scripture.db (36.0 MB) to assets/
```

This copies the pre-built database from the repo root into `app/assets/` where Expo can bundle it.

### 4. Start the dev server

```bash
npx expo start
```

A QR code appears in your terminal.

### 5. Open on your phone

- **iPhone:** Open the Camera app → point at the QR code → tap the Expo banner
- **Android:** Open Expo Go → tap "Scan QR Code"

> **Both devices must be on the same WiFi network.**
>
> If the QR code doesn't connect, try: `npx expo start --tunnel`
> (This routes through Expo's servers — slower but works across networks.)

The first load takes 15-30 seconds as the 36MB database transfers to your phone. Subsequent launches are instant.

## What You'll See

- **Home screen** — Daily reading card, recent chapters, quick navigation
- **Read tab** — Book list → Chapter list → Full chapter with all panels
- **Explore tab** — Genealogy tree, timeline, maps, scholars, word studies
- **Search tab** — Full-text search across all 979 chapters
- **More tab** — Settings, bookmarks, reading history, plans

Tap any chapter to see: verse text, Hebrew/Greek panels, historical context,
cross-references, MacArthur/Calvin/NET Bible commentary, book-specific scholars
(Block, Zimmerli, Sarna, etc.), literary structure, and theological themes radar.

## Troubleshooting

| Problem | Fix |
|---------|-----|
| QR code won't connect | Try `npx expo start --tunnel` |
| "Module not found" | Run `npm install` in the `app/` directory |
| "scripture.db not found" | Run `npm run setup` |
| App loads but no content | Delete app from phone, restart `npx expo start`, re-scan |
| Fonts look wrong | Check Expo Go console for font errors — reinstall Expo Go |
| Port 8081 in use | `npx expo start --port 8082` |

## Web Preview (Limited)

You can see the UI shell in a browser, but without content data:

```bash
npx expo start --web
```

The web version will show the app's navigation, screens, and styling, but all
content panels will be empty because the SQLite database can't load on web yet.
Full web support with data is a planned future feature.

## Updating Content

When new chapters are built (by Claude in a session), pull and rebuild:

```bash
cd ScriptureDeepDive
git pull origin master
cd app
npm run setup
npx expo start
```

The `npm run setup` step re-copies the database. Delete the app from your phone
before re-scanning to ensure the fresh database loads.

## Architecture Quick Reference

```
app/
  App.tsx                ← Entry point (fonts, DB init, navigation)
  assets/
    scripture.db         ← Copied here by `npm run setup` (gitignored)
  src/
    db/                  ← SQLite queries (51 functions)
    screens/             ← 21 screens
    components/          ← 43+ components, 18 panel types
    hooks/               ← 13 data-loading hooks
    navigation/          ← Tab navigator + 5 stacks
    stores/              ← Zustand state (settings + reader)
    theme/               ← Colors, typography, spacing
    types/               ← TypeScript interfaces
    utils/               ← Verse resolver, reference parser
```
