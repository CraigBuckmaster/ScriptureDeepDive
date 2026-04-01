# Companion Study — Theme System

> T1–T5 complete. All 128+ files migrated to `useTheme()`. Dark/Sepia/Light/System themes live.

---

## Architecture (Reference)

### Core: ThemeProvider + `useTheme()` Hook

```typescript
// Every component:
const { base, panels, getPanelColors, getScholarColor, mode } = useTheme();
```

### Data Flow

```
settingsStore.theme (persisted)  ──►  ThemeProvider (resolves palette)
         │                                      │
    'dark'|'sepia'|'light'|'system'    resolvedTheme: ThemePalette
                                                │
                                    useTheme() hook in 128+ files
                                                │
                                    { base, panels, scholars, eras,
                                      mode, getPanelColors, getScholarColor }
```

### ThemePalette shape

```typescript
interface ThemePalette {
  mode: 'dark' | 'sepia' | 'light';
  base: { bg, bgElevated, text, textDim, textMuted, gold, green, red, blue, border, ... };
  panels: Record<string, { bg: string; accent: string; text: string }>;
  scholars: Record<string, string>;
  eras: Record<string, string>;
  categoryColors: { event, book, person, world };
  statusBar: 'light-content' | 'dark-content';
}
```

### File structure

```
app/src/theme/
├── colors.ts       # Dark palette (source of truth, internal to palettes.ts after T6)
├── palettes.ts     # dark/sepia/light base palettes + transforms
├── transforms.ts   # HSL transform utilities for panels/scholars/eras
├── ThemeContext.ts  # React context + useTheme() hook
├── ThemeProvider.tsx # Provider component (resolves system theme)
├── fonts.ts        # Unchanged
├── spacing.ts      # Unchanged
└── index.ts        # Re-exports useTheme + legacy statics (until T6)
```

### Conventions

1. **Never import `base` directly from `colors.ts`** — always `const { base } = useTheme()`
2. **Non-component color access:** Pass colors as props or use `getActiveTheme()` utility
3. **Static StyleSheet for layout, dynamic for colors:** `[styles.card, { backgroundColor: base.bgElevated }]`
4. **Panel/scholar colors:** Always via `getPanelColors()` / `getScholarColor()` from the hook

---

## Batch T6 — Legacy Cleanup (Remaining)

**Status: NOT STARTED.**

### Changes

1. Remove static `base` export from `theme/index.ts`
2. Remove `colors.ts` legacy exports (internalize to `palettes.ts` only)
3. Update DEV_GUIDE.md with theme conventions
4. Verify no file imports `base` directly from `colors.ts` or `theme/index.ts`

### Verification

```bash
grep -rn "from.*theme.*import.*\bbase\b" app/src/ --include="*.tsx" --include="*.ts" | grep -v useTheme | grep -v palettes | grep -v colors.ts
```

Should return zero results after T6.

### Effort: 0.5 session
