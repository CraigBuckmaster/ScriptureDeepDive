/**
 * TreeNode — Circular avatar node with initial letter inside, full name below.
 *
 * Visual tiers (expressed via opacity; native layer count is constant):
 *   - Messianic line: warm radial-gradient fill + gold stroke
 *   - Spine:          flat dark fill + gold-tinted stroke
 *   - Satellite:      flat dark fill + dim stroke (smaller circle)
 *
 * Constant render tree: every node emits the same 3 SVG layers regardless
 * of tier (Circle + initial SvgText + name SvgText) plus an optional
 * invisible touch-target Rect for satellites. Visibility by tier is
 * controlled via opacity, never via null returns or JSX-structure swaps.
 *
 * WHY constant structure? Previous iterations conditionally mounted role
 * badges, waypoint diamonds, messianic glows, and selection rings —
 * each an extra native view. When a zoom gesture crossed a tier
 * threshold, React would mount ~80 new views (tier 1 → tier 2) or
 * ~200 (tier 2 → tier 3) in a single commit. iOS's compositor crashed
 * on those batch mounts on the tall (~10 000 px) Svg canvas. With a
 * constant structure, a zoom change only toggles opacity on existing
 * layers — no mid-session allocations — and iOS handles it cleanly.
 *
 * Role badges and covenant waypoints aren't rendered here anymore; if
 * we want to surface them per node, we'll wire them to a tap-selection
 * state or a side panel so they can appear without a batch-mount.
 *
 * Card #1281: replaces the previous rectangular-card design.
 */

import React, { memo, useCallback } from 'react';
import { Circle, Rect, Text as SvgText, G } from 'react-native-svg';
import { useTheme } from '../../theme';
import type { LayoutNode, TreePerson } from '../../utils/treeBuilder';
import { isMessianic } from '../../utils/messianicLine';
import { getPersonTier, isPersonVisibleAtZoom } from '../../utils/genealogyOrganic';

// ── Circle dimensions ─────────────────────────────────────────────────
const SPINE_R = 24;            // 48 px diameter
const SAT_R = 18;              // 36 px diameter

// Initial letter inside the circle
const SPINE_INITIAL_FONT = 18;
const SAT_INITIAL_FONT = 14;

// Full name below the circle
const NAME_FONT_SPINE = 10;
const NAME_FONT_SAT = 9;
const NAME_GAP = 8;            // circle bottom edge → name baseline

// Accessibility — every interactive node should have a 44 pt touch target
const MIN_TOUCH_H = 44;

// Flat fills — match the wireframe's dark backgrounds
const SPINE_FILL = '#1a1810';   // intentional — wireframe spec
const SAT_FILL = '#181612';     // intentional — wireframe spec

interface Props {
  node: LayoutNode;
  dimmed: boolean;
  selected: boolean;
  filterEra: string | null;
  /** Current committed zoom scale. Drives per-tier visibility (#1291). */
  zoom?: number;
  /** When true and this node is an associate, render at opacity 0 (so
   *  the collapse badges can show instead). Kept as a prop rather than
   *  derived inside TreeNode so TreeCanvas can compute it once. */
  clustersCollapsed?: boolean;
  onPress: (person: TreePerson) => void;
}

export const TreeNode = memo(function TreeNode({
  node, dimmed, selected, filterEra: _filterEra, zoom = 1,
  clustersCollapsed = false, onPress,
}: Props) {
  const { base } = useTheme();
  const { data, x, y } = node;
  const isSpine = data.nodeType === 'spine';
  const onMessianicLine = isMessianic(data.id);
  const handlePress = useCallback(() => onPress(data), [data, onPress]);

  // Tier / opacity model — visibility via opacity, not null returns.
  // The React tree is always the same size; only opacity varies with zoom.
  // Associate mount/unmount is staggered by TreeCanvas across frames to
  // avoid iOS compositor crashes from a batch native-view delta in a
  // single commit; once mounted, this opacity calc takes over.
  const tier = getPersonTier(data, onMessianicLine);
  const visible = isPersonVisibleAtZoom(tier, zoom);
  const isAssociate = data.isAssociate === true;
  const hiddenAsAssociate = isAssociate && clustersCollapsed;
  const opacity =
    (visible ? 1 : 0)
    * (hiddenAsAssociate ? 0 : 1)
    * (dimmed ? 0.25 : 1)
    * (isAssociate ? 0.75 : 1);

  // Geometry — associate satellites render slightly smaller to read as
  // "off-tree" contemporaries rather than genealogical descendants (#1290).
  const r = isSpine ? SPINE_R : (isAssociate ? SAT_R - 3 : SAT_R);
  const initialFont = isSpine ? SPINE_INITIAL_FONT : SAT_INITIAL_FONT;
  const nameFont = isSpine ? NAME_FONT_SPINE : NAME_FONT_SAT;

  // Border color logic: selected > messianic > spine > satellite
  let borderColor: string;
  let borderWidth: number;
  if (selected) {
    borderColor = base.goldBright;
    borderWidth = 2;
  } else if (onMessianicLine) {
    borderColor = base.gold + '60';
    borderWidth = 1.5;
  } else if (isSpine) {
    borderColor = base.gold + '30';
    borderWidth = 1;
  } else {
    borderColor = base.border;
    borderWidth = 1;
  }

  // Fill — messianic uses the radial gradient defined on TreeCanvas;
  // everything else uses a flat dark colour.
  const nodeFill = onMessianicLine
    ? 'url(#messianic-node-fill)'
    : (isSpine ? SPINE_FILL : SAT_FILL);

  // Initial letter — first character of the person's name, uppercased
  const initial = (data.name?.[0] ?? '').toUpperCase();

  // Name colour — messianic + spine show full text; satellites are dim
  const nameFill = onMessianicLine
    ? base.gold
    : (isSpine ? base.text : base.textDim);

  // Initial colour — gold inside messianic, light text inside spine, dim text inside satellite
  const initialFill = onMessianicLine
    ? base.gold
    : (isSpine ? base.text : base.textDim);

  const needsTouchTarget = r * 2 < MIN_TOUCH_H;

  return (
    <G onPress={handlePress} opacity={opacity}>
      {/* Invisible touch target so small satellite circles still hit 44 pt. */}
      {needsTouchTarget && (
        <Rect
          x={x - MIN_TOUCH_H / 2}
          y={y - MIN_TOUCH_H / 2}
          width={MIN_TOUCH_H}
          height={MIN_TOUCH_H}
          fill="transparent"
        />
      )}

      {/* Main circle */}
      <Circle
        cx={x}
        cy={y}
        r={r}
        fill={nodeFill}
        stroke={borderColor}
        strokeWidth={borderWidth}
        strokeDasharray={isAssociate ? '2,2' : undefined}
      />

      {/* Initial letter, visually centred in the circle */}
      <SvgText
        x={x}
        y={y + initialFont * 0.35}
        textAnchor="middle"
        fontSize={initialFont}
        fill={initialFill}
        fontFamily="Cinzel_600SemiBold"
        fontWeight="600"
      >
        {initial}
      </SvgText>

      {/* Full name below the circle */}
      <SvgText
        x={x}
        y={y + r + NAME_GAP}
        textAnchor="middle"
        fontSize={nameFont}
        fill={nameFill}
        fontFamily="SourceSans3_400Regular"
        fontWeight={isSpine || onMessianicLine ? '600' : '400'}
      >
        {data.name}
      </SvgText>
    </G>
  );
});
