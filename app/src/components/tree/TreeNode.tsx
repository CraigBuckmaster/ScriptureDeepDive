/**
 * TreeNode — Circular avatar node with initial letter inside, full name below.
 *
 * Visual tiers:
 *   - Messianic line: warm radial-gradient fill + bright gold border + outer aura
 *   - Spine: flat dark fill + gold-tinted border
 *   - Satellite: flat dark fill + dim border (smaller circle)
 *
 * Role badges (K/P/✧/J/T) sit on the circle's top-right quadrant.
 * Covenant waypoint diamonds + theological annotations stack below the name.
 *
 * Card #1281: replaces the previous rectangular-card design.
 */

import React, { memo, useCallback } from 'react';
import { Circle, Rect, Text as SvgText, G } from 'react-native-svg';
import { useTheme, eras } from '../../theme';
import type { LayoutNode, TreePerson } from '../../utils/treeBuilder';
import { isMessianic } from '../../utils/messianicLine';
import { getRoleBadgeConfig } from './RoleBadge';
import { getCovenantWaypoint } from '../../utils/covenantWaypoints';
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

// Role badge sizing (kept from previous design)
const BADGE_R = 7;
const BADGE_FONT = 7;

// Covenant diamond sizing (kept from previous design)
const DIAMOND_SIZE = 5;
const DIAMOND_GAP = 6;

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
  onPress: (person: TreePerson) => void;
}

export const TreeNode = memo(function TreeNode({
  node, dimmed, selected, filterEra: _filterEra, zoom = 1, onPress,
}: Props) {
  const { base } = useTheme();
  const { data, x, y } = node;
  const isSpine = data.nodeType === 'spine';
  const onMessianicLine = isMessianic(data.id);
  const handlePress = useCallback(() => onPress(data), [data, onPress]);

  // Zoom-semantic tier filtering (#1291): hide tier-3 nodes when zoomed out.
  // Must come AFTER all hook calls to respect the rules-of-hooks contract.
  const tier = getPersonTier(data, onMessianicLine);
  if (!isPersonVisibleAtZoom(tier, zoom)) return null;

  const isAssociate = data.isAssociate === true;
  const opacity = (dimmed ? 0.25 : 1) * (isAssociate ? 0.75 : 1);

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

  // Role badge config (reuses RoleBadge's mapping)
  const roleBadge = data.role
    ? getRoleBadgeConfig(data.role, {
        gold: base.gold,
        eraColor: data.era ? (eras[data.era] ?? base.gold) : base.gold,
      })
    : null;

  // Covenant waypoint
  const waypoint = getCovenantWaypoint(data.id);

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

  // Layout for the role badge: top-right quadrant of the circle
  // (cos(-45°), sin(-45°)) = (~0.707, -0.707) → scaled by r
  const badgeOffset = r * 0.707;

  return (
    <G onPress={handlePress} opacity={opacity}>
      {/* ── Touch target ─── */}
      {r * 2 < MIN_TOUCH_H && (
        <Rect
          x={x - MIN_TOUCH_H / 2}
          y={y - MIN_TOUCH_H / 2}
          width={MIN_TOUCH_H}
          height={MIN_TOUCH_H}
          fill="transparent"
        />
      )}

      {/* ── Messianic outer glow — warm golden aura ─── */}
      {onMessianicLine && !dimmed && (
        <Circle
          cx={x}
          cy={y}
          r={r + 6}
          fill={base.gold}
          opacity={0.12}
        />
      )}

      {/* ── Selected glow ring ─── */}
      {selected && (
        <Circle
          cx={x}
          cy={y}
          r={r + 4}
          fill={base.gold}
          opacity={0.2}
        />
      )}

      {/* ── Main circle ─── */}
      <Circle
        cx={x}
        cy={y}
        r={r}
        fill={nodeFill}
        stroke={borderColor}
        strokeWidth={borderWidth}
        strokeDasharray={isAssociate ? '2,2' : undefined}
      />

      {/* ── Initial letter (Cinzel SemiBold, visually centred) ─── */}
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

      {/* ── Full name below the circle ─── */}
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

      {/* ── Role badge — top-right quadrant ─── */}
      {roleBadge && (
        <G>
          <Circle
            cx={x + badgeOffset}
            cy={y - badgeOffset}
            r={BADGE_R}
            fill={roleBadge.color + '22'}
            stroke={roleBadge.color}
            strokeWidth={0.8}
          />
          <SvgText
            x={x + badgeOffset}
            y={y - badgeOffset + BADGE_FONT * 0.35}
            textAnchor="middle"
            fontSize={BADGE_FONT}
            fill={roleBadge.color}
            fontFamily="SourceSans3_600SemiBold"
            fontWeight="600"
          >
            {roleBadge.label}
          </SvgText>
        </G>
      )}

      {/* ── Covenant waypoint diamond + annotation ─── */}
      {waypoint && !dimmed && (
        <G>
          {/* Diamond sits below the name text */}
          <G
            transform={`translate(${x}, ${y + r + NAME_GAP + nameFont + DIAMOND_GAP + DIAMOND_SIZE / 2}) rotate(45)`}
          >
            <Rect
              x={-DIAMOND_SIZE / 2}
              y={-DIAMOND_SIZE / 2}
              width={DIAMOND_SIZE}
              height={DIAMOND_SIZE}
              fill={base.gold + '60'}
              stroke={base.gold}
              strokeWidth={0.8}
            />
          </G>
          {/* Waypoint annotation */}
          <SvgText
            x={x + DIAMOND_SIZE + 4}
            y={y + r + NAME_GAP + nameFont + DIAMOND_GAP + DIAMOND_SIZE / 2 + 3}
            textAnchor="start"
            fontSize={7}
            fill={base.gold}
            fontFamily="SourceSans3_400Regular"
            fontStyle="italic"
            opacity={0.7}
          >
            {waypoint.text}
          </SvgText>
          <SvgText
            x={x + DIAMOND_SIZE + 4}
            y={y + r + NAME_GAP + nameFont + DIAMOND_GAP + DIAMOND_SIZE / 2 + 12}
            textAnchor="start"
            fontSize={6.5}
            fill={base.gold}
            fontFamily="SourceSans3_600SemiBold"
            fontWeight="600"
            opacity={0.5}
          >
            {waypoint.ref}
          </SvgText>
        </G>
      )}
    </G>
  );
});
