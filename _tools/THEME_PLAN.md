# Companion Study — Theme System Plan

## Summary

Add three discrete themes (Dark, Sepia, Light) plus a "System" option that follows iOS appearance. Full palette adaptation: base UI, panels, scholars, and eras all shift per theme.

**Scope:** 120 files, 924 base color references, 51 panel color consumers, 15 era color consumers, 6 navigation files, 1 settings screen update.

---

## Architecture

### Core Concept: ThemeProvider + `useTheme()` Hook

Every file currently does `import { base, panels, ... } from '../theme'` and uses the values as static constants. The new system replaces this with a React Context that provides the **same-shaped objects** but with theme-appropriate values.

```
Before:  import { base } from '../theme';
         // base.bg is always '#0c0a07'

After:   const { base } = useTheme();
         // base.bg is '#0c0a07' | '#f5efe4' | '#ffffff' depending on theme
```

**Why Context, not Zustand?** Zustand is great for persistence (and we'll still use `settingsStore` for that). But React Context is the right tool for "every component in the tree needs this value and should re-render when it changes." Navigation, tab bars, and deeply nested panels all need to respond to theme changes. Context's cascading re-render is a feature here, not a bug.

### Data Flow

```
settingsStore.theme (persisted)  ──►  ThemeProvider (resolves palette)
         │                                      │
    'dark'|'sepia'|'light'|'system'    resolvedTheme: ThemePalette
         │                                      │
    SQLite user_preferences              React Context
                                                │
                                    useTheme() hook in 120+ files
                                                │
                                    { base, panels, scholars, eras,
                                      mode, getPanelColors, getScholarColor }
```

### Theme Palette Shape

```typescript
interface ThemePalette {
  mode: 'dark' | 'sepia' | 'light';
  base: typeof import('./colors').base;       // same 14 tokens
  panels: typeof import('./colors').panels;   // same 17 panel sets
  scholars: Record<string, string>;           // same 50+ scholar colors
  eras: Record<string, string>;               // same 12 era colors
  categoryColors: { event: string; book: string; person: string; world: string };
  statusBar: 'light-content' | 'dark-content';
}
```

Each theme defines all values. Consumers never know which theme is active — they just use `base.bg` and get the right color.

---

## Color Palettes

### Strategy

- **base (14 tokens):** Hand-tuned per theme. These are the most visible and highest-frequency tokens (924 usages). No shortcuts.
- **panels (17 sets × 3 colors):** Programmatic transform with manual overrides. Dark = current values. Sepia/Light = hue-preserved, lightness-shifted.
- **scholars (50+ colors):** Programmatic transform only. Darken for light backgrounds, warm-shift for sepia.
- **eras (12 colors):** Programmatic transform. Same approach as scholars.

### Base Palette Definitions

| Token         | Dark (current)   | Sepia              | Light              |
|---------------|------------------|--------------------|--------------------|
| bg            | `#0c0a07`        | `#f0e8d8`          | `#fafafa`          |
| bgElevated    | `#252015`        | `#e8dcc4`          | `#ffffff`          |
| bgSurface     | `#1f1b14`        | `#ece2d0`          | `#f5f5f5`          |
| bg3           | `#1a1508`        | `#e4d8c0`          | `#eeeeee`          |
| text          | `#f0e8d8`        | `#2c2418`          | `#1a1a1a`          |
| textDim       | `#b8a888`        | `#5a4e3c`          | `#555555`          |
| textMuted     | `#a09888`        | `#7a6e5c`          | `#888888`          |
| gold          | `#bfa050`        | `#9a7a28`          | `#8a6a18`          |
| goldDim       | `#8a6e1a`        | `#7a5e14`          | `#6a5010`          |
| goldBright    | `#d4b868`        | `#b89030`          | `#a07820`          |
| border        | `#3a2e18`        | `#c8b898`          | `#e0e0e0`          |
| borderLight   | `#2a2010`        | `#d8ccb0`          | `#eeeeee`          |
| verseNum      | `#9a8a6a`        | `#8a7a5a`          | `#999999`          |
| navText       | `#d8ccb0`        | `#4a3e2c`          | `#333333`          |

**Design rationale:**
- **Dark:** Current palette, unchanged. The identity theme.
- **Sepia:** Warm parchment. Backgrounds are cream/tan. Text goes dark brown. Gold darkens to maintain contrast on light warm backgrounds. Borders go warm mid-tones.
- **Light:** Clean, neutral. Near-white backgrounds, near-black text. Gold darkens further for contrast. Borders are light gray. No warmth — this is the "modern reading" theme.

### Panel Color Transform

Panels have `{ bg, border, accent }`. The transform:

| Property | Dark           | Sepia                      | Light                       |
|----------|----------------|----------------------------|-----------------------------|
| bg       | Current (dark) | Lighten to ~92% luminance, warm shift | Lighten to ~96% luminance |
| border   | Current (mid)  | Lighten to ~75% luminance, warm shift | Lighten to ~82% luminance |
| accent   | Current        | Darken 15% for contrast    | Darken 25% for contrast     |

This means `heb` (Hebrew panel) currently `{ bg: '#261520', border: '#7a3050', accent: '#e890b8' }` becomes:
- **Sepia:** `{ bg: '#f0e0e8', border: '#c89aaa', accent: '#c07898' }`
- **Light:** `{ bg: '#faf0f4', border: '#d8a8b8', accent: '#b06888' }`

The transform function lives in `theme/transforms.ts` and runs once at theme resolution (not per-render).

### Scholar & Era Color Transform

Scholars are identity colors used on pills and accent strips. Transform:
- **Sepia:** Darken 20%, increase saturation 10%
- **Light:** Darken 30%, increase saturation 15%

This ensures readable contrast on light backgrounds while preserving each scholar's color identity.

---

## File Structure

```
app/src/theme/
├── colors.ts              # Unchanged (dark palette remains source of truth)
├── palettes.ts            # NEW — dark/sepia/light base palettes + transforms
├── transforms.ts          # NEW — HSL transform utilities for panels/scholars/eras
├── ThemeContext.ts         # NEW — React context + useTheme() hook
├── ThemeProvider.tsx       # NEW — Provider component (resolves system theme)
├── fonts.ts               # Unchanged
├── spacing.ts             # Unchanged
├── typography.ts          # Unchanged
└── index.ts               # Updated — re-export useTheme, keep legacy statics for migration
```

---

## Migration Strategy

### The Zero-Breakage Bridge Pattern

During migration, BOTH patterns work simultaneously:

```typescript
// theme/index.ts (during migration)
export { base, panels, scholars, eras, ... } from './colors';     // Legacy (static)
export { useTheme } from './ThemeContext';                          // New (reactive)
export type { ThemePalette } from './palettes';
```

Files that haven't been migrated yet still import the static `base` and get dark-only. Files that have been migrated use `useTheme()` and get the active theme. No file breaks during the transition. The app works at every intermediate commit.

Once all 120 files are migrated, the static exports are removed and the legacy `colors.ts` exports become internal-only (consumed only by `palettes.ts` as the dark theme definition).

### Migration Batches

**Batch T1 — Infrastructure** (no visual change, ships independently)
- `theme/transforms.ts` — HSL utilities
- `theme/palettes.ts` — 3 palettes + transform runners
- `theme/ThemeContext.ts` — context + hook
- `theme/ThemeProvider.tsx` — provider + system theme listener
- `settingsStore.ts` — add `theme` preference
- `theme/index.ts` — add new exports alongside legacy
- Wrap app root in `<ThemeProvider>`

**Batch T2 — Navigation + Chrome** (~8 files)
- `TabNavigator.tsx` — tab bar bg, active/inactive colors
- All 5 stack navigators — `cardStyle.backgroundColor`
- `ScreenHeader.tsx` (if exists) — header bg/text
- `App.tsx` or root — StatusBar `barStyle`

**Batch T3 — Screens** (~30 files, split into 3 sub-batches of 10)
- T3a: Home, BookList, ChapterScreen, Settings, Search (high-traffic screens)
- T3b: Timeline, Map, Genealogy, PersonDetail, Explore (visual-heavy screens)
- T3c: All remaining screens (History, Plans, Notes, Bookmarks, etc.)

**Batch T4 — Components** (~90 files, split into 4 sub-batches)
- T4a: Panel components (PanelCard, section panels — these use getPanelColors)
- T4b: Popups/sheets (CrossRefPopup, WordStudyPopup, ScholarInfoSheet, etc.)
- T4c: Navigation/chrome components (ScreenHeader, BackButton, etc.)
- T4d: All remaining components

**Batch T5 — Settings UI + Polish**
- Theme picker UI in SettingsScreen (3 visual presets + System toggle)
- StatusBar integration
- Animated transition between themes (optional, low priority)
- Edge cases: modals with `presentationStyle="fullScreen"`, bottom sheets

**Batch T6 — Legacy Cleanup**
- Remove static `base` export from `theme/index.ts`
- Remove `colors.ts` legacy exports (internalize to `palettes.ts`)
- Update DEV_GUIDE.md with theme conventions

### Per-File Migration Pattern

Every file follows the same mechanical transform:

```diff
- import { base, spacing, radii, fontFamily } from '../theme';
+ import { spacing, radii, fontFamily } from '../theme';
+ import { useTheme } from '../theme';

  export default function SomeScreen() {
+   const { base } = useTheme();
    // ... rest of component unchanged, base.gold still works
```

For files that also use `getPanelColors` or `getScholarColor`:

```diff
- import { base, getPanelColors, getScholarColor } from '../theme';
+ import { useTheme } from '../theme';

  export default function PanelCard({ type }) {
+   const { base, getPanelColors, getScholarColor } = useTheme();
    const colors = getPanelColors(type);
```

For **non-component files** (utilities, helpers) that reference colors:
- They receive colors as function parameters instead of importing directly
- OR they use a `getActiveTheme()` function (non-hook, reads from Zustand store directly)

---

## Settings UI Design

The theme picker goes in the PREFERENCES section of SettingsScreen, between Translation and Font Size:

```
┌─ PREFERENCES ──────────────────────────┐
│  Default Translation        NIV | ESV  │
│                                        │
│  Appearance                            │
│  ┌──────┐ ┌──────┐ ┌──────┐          │
│  │      │ │      │ │      │          │
│  │ Dark │ │Sepia │ │Light │  System  │
│  │      │ │      │ │      │   [ ]    │
│  └──────┘ └──────┘ └──────┘          │
│                                        │
│  Font Size: 16pt            [ - ] [+] │
│  ...                                   │
└────────────────────────────────────────┘
```

- Three visual preview cards showing a mini chapter screen mockup in each theme
- "System" toggle below — when on, disables manual selection and follows iOS
- Selecting a theme applies immediately (no save button)

---

## System Theme Integration

```typescript
// ThemeProvider.tsx
import { useColorScheme } from 'react-native';

function ThemeProvider({ children }) {
  const systemScheme = useColorScheme(); // 'dark' | 'light'
  const themePref = useSettingsStore(s => s.theme); // 'dark'|'sepia'|'light'|'system'

  const resolvedMode = themePref === 'system'
    ? (systemScheme === 'light' ? 'light' : 'dark')
    : themePref;

  const palette = useMemo(() => buildPalette(resolvedMode), [resolvedMode]);

  return (
    <ThemeContext.Provider value={palette}>
      {children}
    </ThemeContext.Provider>
  );
}
```

Note: System mode maps to Dark or Light only (not Sepia). Sepia is an intentional aesthetic choice that no OS makes automatically.

---

## Performance Considerations

1. **Palette computation:** `buildPalette()` runs HSL transforms on ~80 panel/scholar/era colors. This runs **once** on theme change, memoized via `useMemo`. Cost: <5ms. No per-render impact.

2. **Re-render scope:** Theme change triggers a context update that re-renders the entire tree. This is acceptable because:
   - Theme changes are rare (user action in settings)
   - React Native's reconciler handles this efficiently
   - No layout shifts — only color values change

3. **StyleSheet.create compatibility:** The migrated StyleSheet patterns from Arch Batch 7 use `base.X` in static styles. These will need to move into the component body (inside the hook scope) or use the array-style dynamic override. Recommendation: keep layout in static StyleSheet, apply colors via inline `style={{ color: base.text }}` or array syntax `[styles.label, { color: base.text }]`.

---

## Estimated Effort

| Batch | Files | Estimated Sessions | Notes |
|-------|-------|--------------------|-------|
| T1    | 6     | 1 session          | Infrastructure, no UI change |
| T2    | 8     | 0.5 session        | Navigation chrome |
| T3    | 30    | 2-3 sessions       | All screens |
| T4    | 90    | 4-5 sessions       | All components |
| T5    | 3     | 1 session          | Settings UI + polish |
| T6    | 2     | 0.5 session        | Cleanup |
| **Total** | **~130** | **~10 sessions** | |

T1 + T2 + T5 can be done first to get a working prototype on key screens before the full migration sweep.

---

## Risk Mitigations

| Risk | Mitigation |
|------|-----------|
| Scholar color unreadable on light bg | Transform function + visual QA pass. Override individual scholars if needed |
| Panel bg too similar to screen bg in light | Enforce minimum contrast ratio in transform. Add subtle border-only fallback |
| Navigation flicker on theme change | Memoize palette, use `React.memo` on navigators |
| Arch Batch 7 conflict (StyleSheet migration) | Theme migration subsumes inline→StyleSheet work. Colors move to dynamic, layout stays static |
| 120-file migration feels infinite | Bridge pattern means every commit ships. No big-bang cutover |

---

## Conventions (add to DEV_GUIDE.md after T6)

1. **Never import `base` directly from `colors.ts`** — always use `const { base } = useTheme()`
2. **Non-component color access:** Pass colors as props or use `getActiveTheme()` utility
3. **New components:** Must use `useTheme()` from day one
4. **Static StyleSheet for layout, dynamic for colors:** `StyleSheet.create()` for dimensions/padding/flex. Theme colors via `[styles.card, { backgroundColor: base.bgElevated }]`
5. **Panel/scholar colors:** Always via `getPanelColors()` / `getScholarColor()` from the theme hook, never by direct lookup
