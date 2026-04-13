/**
 * TreeNode — Person node card with messianic highlighting, role badges,
 * covenant waypoint diamonds, gender icons, and dynamic width.
 *
 * Visual tiers:
 *   - Messianic line members: golden glow + golden border (the "golden thread")
 *   - Spine nodes: gold-tinted border
 *   - Satellite nodes: dim border
 *
 * Role badges (K/P/✧/J/T) render as SVG circles at the card's top-right.
 * Covenant waypoint diamonds mark the 7 key theological milestones.
 */

import React, { memo, useCallback } from 'react';
import { Circle, Rect, Line, Text as SvgText, G } from 'react-native-svg';
import { useTheme, eras } from '../../theme';
import { TREE_CONSTANTS, type LayoutNode, type TreePerson } from '../../utils/treeBuilder';
import { isMessianic } from '../../utils/messianicLine';
import { getRoleBadgeConfig } from './RoleBadge';
import { getCovenantWaypoint } from '../../utils/covenantWaypoints';

/**
 * Gender-based tint for node card backgrounds.
 * Messianic line members get a warm golden tint instead.
 */
function getCardTint(gender: string | null, bgBase: string, onMessianicLine: boolean): string {
  const isDark = bgBase.charAt(1) <= '3';
  if (onMessianicLine) return isDark ? '#221e10' : '#f0e8d0';
  const g = (gender ?? '').toLowerCase();
  if (g === 'm') return isDark ? '#1a2030' : '#dde4f0';
  if (g === 'f') return isDark ? '#2a1824' : '#f0dde4';
  return isDark ? '#1a1810' : '#e8e4dc';
}

// Card dimensions
const SPINE_H = 42;
const SAT_H = 34;
const SPINE_RX = 10;
const SAT_RX = 8;

// Gender icon sizing
const SPINE_ICON_R = 4;
const SAT_ICON_R = 3.2;
const SPINE_ICON_SPACE = 16;
const SAT_ICON_SPACE = 14;

const H_PAD = 20;
const SPINE_MIN_W = 56;
const SAT_MIN_W = 46;
const MIN_TOUCH_H = 44;

// Role badge sizing
const BADGE_R = 7;
const BADGE_FONT = 7;

// Covenant diamond sizing
const DIAMOND_SIZE = 5;
const DIAMOND_GAP = 6;

interface Props {
  node: LayoutNode;
  dimmed: boolean;
  selected: boolean;
  filterEra: string | null;
  onPress: (person: TreePerson) => void;
}

function hasGender(g: string | null): boolean {
  return g === 'm' || g === 'M' || g === 'f' || g === 'F';
}

function isMale(g: string | null): boolean {
  return g === 'm' || g === 'M';
}

export const TreeNode = memo(function TreeNode({ node, dimmed, selected, filterEra, onPress }: Props) {
  const { base } = useTheme();
  const { data, x, y } = node;
  const isSpine = data.nodeType === 'spine';
  const fontSize = isSpine ? TREE_CONSTANTS.spineFontSize : TREE_CONSTANTS.satelliteFontSize;
  const onMessianicLine = isMessianic(data.id);
  const accentColor = onMessianicLine
    ? base.gold
    : isSpine
      ? base.gold
      : (data.era ? (eras[data.era] ?? base.textMuted) : base.textMuted);
  const opacity = dimmed ? 0.25 : 1;
  const cardTint = getCardTint(data.gender, base.bg, onMessianicLine);

  const h = isSpine ? SPINE_H : SAT_H;
  const rx = isSpine ? SPINE_RX : SAT_RX;
  const minW = isSpine ? SPINE_MIN_W : SAT_MIN_W;
  const showGender = hasGender(data.gender);
  const iconSpace = showGender ? (isSpine ? SPINE_ICON_SPACE : SAT_ICON_SPACE) : 0;
  const iconR = isSpine ? SPINE_ICON_R : SAT_ICON_R;

  const textW = data.name.length * fontSize * 0.6;
  const w = Math.max(minW, textW + iconSpace + H_PAD);

  const handlePress = useCallback(() => onPress(data), [data, onPress]);

  // Card centered on (x, y)
  const cx = x - w / 2;
  const cy = y - h / 2;

  const contentCenterX = x + (showGender ? iconSpace / 2 : 0);
  const iconCenterX = x - (textW / 2) - (iconSpace / 2) + 2;
  const iconCenterY = y;
  const iconColor = accentColor;

  // Role badge config (reuses the config logic from RoleBadge.tsx)
  const roleBadge = data.role
    ? getRoleBadgeConfig(data.role, { gold: base.gold, eraColor: data.era ? (eras[data.era] ?? base.gold) : base.gold })
    : null;

  // Covenant waypoint
  const waypoint = getCovenantWaypoint(data.id);

  // Border color logic: messianic > selected > spine > satellite
  let borderColor: string;
  let borderWidth: number;
  if (selected) {
    borderColor = base.goldBright;
    borderWidth = 1.5;
  } else if (onMessianicLine) {
    borderColor = base.gold + '88';
    borderWidth = 1.5;
  } else if (isSpine) {
    borderColor = base.gold + '55';
    borderWidth = 1;
  } else {
    borderColor = base.border;
    borderWidth = 1;
  }

  return (
    <G onPress={handlePress} opacity={opacity}>
      {/* Accessibility touch target */}
      {h < MIN_TOUCH_H && (
        <Rect
          x={cx - 2} y={y - MIN_TOUCH_H / 2}
          width={w + 4} height={MIN_TOUCH_H}
          fill="transparent"
        />
      )}

      {/* Messianic outer glow — warm golden aura */}
      {onMessianicLine && !dimmed && (
        <Rect
          x={cx - 5} y={cy - 5}
          width={w + 10} height={h + 10}
          rx={rx + 3}
          fill={base.gold}
          opacity={0.1}
        />
      )}

      {/* Selected glow ring */}
      {selected && (
        <Rect
          x={cx - 4} y={cy - 4}
          width={w + 8} height={h + 8}
          rx={rx + 2}
          fill={base.gold}
          opacity={0.2}
        />
      )}

      {/* Card background */}
      <Rect
        x={cx} y={cy}
        width={w} height={h}
        rx={rx}
        fill={cardTint}
        stroke={borderColor}
        strokeWidth={borderWidth}
      />

      {/* Gender icon */}
      {showGender && isMale(data.gender) && (
        <G opacity={0.5}>
          <Circle cx={iconCenterX} cy={iconCenterY} r={iconR}
            stroke={iconColor} strokeWidth={1} fill="none" />
          <Line
            x1={iconCenterX + iconR * 0.7} y1={iconCenterY - iconR * 0.7}
            x2={iconCenterX + iconR * 1.8} y2={iconCenterY - iconR * 1.8}
            stroke={iconColor} strokeWidth={1}
          />
          <Line
            x1={iconCenterX + iconR * 1.8} y1={iconCenterY - iconR * 1.8}
            x2={iconCenterX + iconR * 1.0} y2={iconCenterY - iconR * 1.8}
            stroke={iconColor} strokeWidth={1}
          />
          <Line
            x1={iconCenterX + iconR * 1.8} y1={iconCenterY - iconR * 1.8}
            x2={iconCenterX + iconR * 1.8} y2={iconCenterY - iconR * 1.0}
            stroke={iconColor} strokeWidth={1}
          />
        </G>
      )}
      {showGender && !isMale(data.gender) && (
        <G opacity={0.5}>
          <Circle cx={iconCenterX} cy={iconCenterY - 1} r={iconR}
            stroke={iconColor} strokeWidth={1} fill="none" />
          <Line
            x1={iconCenterX} y1={iconCenterY + iconR - 1}
            x2={iconCenterX} y2={iconCenterY + iconR + 4}
            stroke={iconColor} strokeWidth={1}
          />
          <Line
            x1={iconCenterX - 2.5} y1={iconCenterY + iconR + 1.5}
            x2={iconCenterX + 2.5} y2={iconCenterY + iconR + 1.5}
            stroke={iconColor} strokeWidth={1}
          />
        </G>
      )}

      {/* Name label */}
      <SvgText
        x={contentCenterX}
        y={y + 2}
        textAnchor="middle"
        fontSize={fontSize}
        fill={onMessianicLine ? base.gold : (isSpine ? base.text : base.textDim)}
        fontFamily="SourceSans3_400Regular"
        fontWeight={isSpine || onMessianicLine ? '600' : '400'}
      >
        {data.name}
      </SvgText>

      {/* Era subtitle for spine nodes */}
      {isSpine && data.era && (
        <SvgText
          x={contentCenterX}
          y={y + 14}
          textAnchor="middle"
          fontSize={8}
          fill={base.textMuted}
          fontFamily="SourceSans3_400Regular"
        >
          {data.era.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
        </SvgText>
      )}

      {/* ── Role badge (top-right corner) ─────────────────────────── */}
      {roleBadge && (
        <G>
          <Circle
            cx={cx + w - BADGE_R - 2}
            cy={cy + BADGE_R + 2}
            r={BADGE_R}
            fill={roleBadge.color + '22'}
            stroke={roleBadge.color}
            strokeWidth={0.8}
          />
          <SvgText
            x={cx + w - BADGE_R - 2}
            y={cy + BADGE_R + 2 + BADGE_FONT * 0.35}
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

      {/* ── Covenant waypoint diamond ─────────────────────────────── */}
      {waypoint && !dimmed && (
        <G>
          {/* Rotated diamond below the card */}
          <G transform={`translate(${x}, ${cy + h + DIAMOND_GAP + DIAMOND_SIZE / 2}) rotate(45)`}>
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
            y={cy + h + DIAMOND_GAP + DIAMOND_SIZE / 2 + 3}
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
            y={cy + h + DIAMOND_GAP + DIAMOND_SIZE / 2 + 12}
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
