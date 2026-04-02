# Tree Visual Polish — Implementation Plan

**Status:** Planned
**Scope:** 7 files modified, 0 new files, 0 new dependencies
**Data:** 282 nodes (217♂, 53♀, 12 null gender), 34 spouse nodes

---

## Overview

Three tiers of visual polish for the genealogy tree, executed bottom-up so each phase is independently shippable.

| Phase | Impact | Summary |
|-------|--------|---------|
| 0 | — | Props threading (selectedPersonId plumbing, no visual change) |
| 1 | Low | Background environment (radial glow, dot grid, overlay backdrop) |
| 2 | Medium | Link & connector polish (spine glow trails, round caps, dashed spouses) |
| 3 | High | Node card redesign (mini cards, era accent, gender icons, selected glow) |
| 4 | — | Verification & tuning |

---

## Phase 0: Props Threading

**Risk:** Zero. No visual change. Pure plumbing.

### `GenealogyTreeScreen.tsx` — 2 lines
- Pass `selectedPersonId={selectedPerson?.id ?? null}` to `<TreeCanvas>`

### `TreeCanvas.tsx` — Props + forwarding
- Add `selectedPersonId: string | null` to `Props`
- Pass `selected={node.data.id === selectedPersonId}` to each `<TreeNode>`

### `TreeNode.tsx` — Props only
- Add `selected: boolean` to `Props` (no rendering change yet)

### Verify
- App builds, tree renders identically, no regressions.

---

## Phase 1: Background & Environment

**Risk:** Low. Additive only — new SVG elements behind existing content.

### `TreeCanvas.tsx` — SVG background layers

Import `Defs, RadialGradient, Stop, Pattern, Rect as SvgRect, Circle as SvgCircle` from `react-native-svg`.

Add `<Defs>` block inside root `<G>`:

```
<RadialGradient id="treeAmbient" cx="45%" cy="42%" r="55%">
  <Stop offset="0%"   stopColor={base.gold} stopOpacity={0.045} />
  <Stop offset="55%"  stopColor={base.gold} stopOpacity={0.015} />
  <Stop offset="100%" stopColor={base.gold} stopOpacity={0} />
</RadialGradient>

<Pattern id="treeGrid" x="0" y="0" width={28} height={28} patternUnits="userSpaceOnUse">
  <SvgCircle cx={14} cy={14} r={0.6} fill={base.gold} opacity={0.055} />
</Pattern>
```

Render two `<SvgRect>` as first children of the `<G>`:
1. Pattern fill `url(#treeGrid)` — sized to canvas width × height
2. Gradient fill `url(#treeAmbient)` — same size

Accept `canvasWidth` and `canvasHeight` as props (derived from bounds in screen).

### `GenealogyTreeScreen.tsx` — Overlay backdrop

Wrap the search/filter `<View>` with:
- `backgroundColor: base.bg + 'F0'` (94% opaque)
- `borderBottomWidth: StyleSheet.hairlineWidth`
- `borderBottomColor: base.border`

### Verify
- Faint dot grid visible when zoomed out (0.3x), nearly invisible at 1x+
- Subtle warm glow near tree center
- Search/filter bar has clean separation from tree content

---

## Phase 2: Link & Connector Polish

**Risk:** Low. Self-contained single-file changes.

### `TreeLink.tsx`

For `isSpine === true`, render a second `<Path>` **before** the visible path:
- Same bezier `d` string
- `strokeWidth={5}`, `stroke={color}`, `opacity={dimmed ? 0.03 : 0.12}`
- `strokeLinecap="round"`

Add `strokeLinecap="round"` to the main `<Path>` as well.

Non-spine links: unchanged.

### `MarriageBarSvg.tsx`

- Add glow `<Line>` behind main bar: `strokeWidth={6}`, `opacity={dimmed ? 0.02 : 0.07}`, `strokeLinecap="round"`
- Bump main bar `strokeWidth` from 1.5 → 2
- Add `strokeLinecap="round"` to all three `<Line>` elements (bar + two ticks)

### `SpouseConnectorSvg.tsx`

- Add `strokeDasharray="4,4"` to distinguish from solid descent links
- Add `strokeLinecap="round"`

### Verify
- Spine lineage has visible warm glow trail at all zoom levels
- Marriage bars have polished rounded endpoints
- Spouse connectors are clearly dashed (marriage) vs solid (descent)

---

## Phase 3: Node Card Redesign

**Risk:** Medium. Touches visual rendering AND layout math.

### `treeBuilder.ts` — Constants + marriage bar math

Add to `TREE_CONSTANTS`:
```ts
spineCardW: 74,
spineCardH: 28,
satCardW: 62,
satCardH: 24,
cardRadius: 5,
accentBarW: 3,
```

Update `computeMarriageBars`:
- `x1 = partner.x + (isSpine ? spineCardW/2 : satCardW/2) + 2`
- `x2 = node.x - (isSpouse-spine ? spineCardW/2 : satCardW/2) - 2`
- Uses `node.data.nodeType` to determine which card width applies

No changes to `nodeSize`, `spouseXOffset`, or d3 layout — positions stay identical. Only marriage bar endpoint math changes.

### `TreeNode.tsx` — Complete visual rewrite

Replace Circle + floating SvgText + hit-target Circle with card-based SVG group.

Render order (back to front):

| # | Element | Condition |
|---|---------|-----------|
| 1 | Outer glow `<Rect>` | `selected` only — goldBright, 6% opacity, card + 12px padding |
| 2 | Mid glow `<Rect>` | `selected` only — gold, 12% opacity, card + 6px padding |
| 3 | Card body `<Rect>` | Always — bgElevated (spine) or bgSurface (satellite), rounded |
| 4 | Era accent bar `<Rect>` | Always — 3px wide, left edge, era color (gold for spine) |
| 5 | Gender icon `<G>` | When gender is 'm'/'f' — ♂ or ♀ SVG shapes. Null = no icon |
| 6 | Name `<SvgText>` | Always — inside card, left-aligned after gender icon |
| 7 | Hit target `<Rect>` | Always — transparent, card bounds + padding for touch |

**Card sizing:** From TREE_CONSTANTS. Spine = 74×28, satellite = 62×24.

**Spine treatment:** Gold accent bar, `base.text` color, fontWeight 600.

**Satellite treatment:** Era-colored accent bar, `base.textDim` color, fontWeight 400.

**Dimming:** `<G opacity={0.25}>` when dimmed (same as current).

**Selected state:**
- Two glow `<Rect>` behind card (outer = +12px, inner = +6px)
- Card border changes to goldBright at 1.5px (vs default 0.8px)

**Gender icons:**
- Male (♂): `<Circle>` + diagonal `<Line>` (arrow). r=4 (spine) / 3.2 (satellite).
- Female (♀): `<Circle>` + vertical `<Line>` + horizontal `<Line>` (cross). Same radii.
- Null gender: icon space collapses, name shifts left.
- Color: gold (spine) or era color (satellite), 50% opacity.

### Verify
- All 282 nodes render as cards
- Gender icons display correctly for m/f/null
- Selected glow appears on tap
- Cards don't overlap between siblings (74px card vs 90px nodeSize = 16px gap)
- Marriage bars connect at card edges, not circle edges

---

## Phase 4: Verification & Tuning

1. **TypeScript:** `npx tsc --noEmit --pretty 2>&1 | grep -E "(TreeNode|TreeCanvas|TreeLink|Marriage|Spouse|Genealogy)"` — zero errors
2. **Gestures:** Pinch zoom, pan, tap-to-select unchanged (two-layer transform untouched)
3. **Era filters:** Cards dim correctly, spine cards never dim, filter-and-center works
4. **Zoom levels:** Cards readable at 0.3x–3x. Dot grid visible at 0.3x, invisible at 1x+
5. **Performance:** 282 cards × ~7 SVG elements = ~1,974 elements (up from ~1,128). Well under SVG budget. Glow rects only render for 1 selected node.
6. **Sibling overlap:** If 74px spine cards overlap at nodeSize[0]=90, bump to 100. Only potential layout tweak.
7. **Deep link:** `initialPersonId` → auto-centre + glow + sidebar still works

---

## Files Changed

| File | Phase | Change |
|------|-------|--------|
| `GenealogyTreeScreen.tsx` | 0, 1 | selectedPersonId prop + overlay backdrop style |
| `TreeCanvas.tsx` | 0, 1 | Thread selectedPersonId + SVG Defs/background layers |
| `TreeNode.tsx` | 0, 3 | Accept selected → full card rewrite |
| `TreeLink.tsx` | 2 | Glow Path for spine links + strokeLinecap |
| `MarriageBarSvg.tsx` | 2 | Glow line + round caps + thicker stroke |
| `SpouseConnectorSvg.tsx` | 2 | Dashed pattern + round caps |
| `treeBuilder.ts` | 3 | Card constants + marriage bar endpoint math |

**Total:** 7 files, ~250 lines changed, 0 new dependencies, 0 new files.
