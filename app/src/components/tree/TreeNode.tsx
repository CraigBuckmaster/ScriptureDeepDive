/**
 * TreeNode — Person node card with dynamic width, gender icon, no dots.
 *
 * Card width is computed from the person's name length + icon space.
 * Gender icons (♂/♀ SVG shapes) render inside the card when gender is known.
 * The old Circle dot and Circle touch target are removed — the card Rect
 * is the sole visible element and tap target.
 */

import React, { memo, useCallback } from 'react';
import { Circle, Rect, Line, Text as SvgText, G } from 'react-native-svg';
import { useTheme, eras } from '../../theme';
import { TREE_CONSTANTS, type LayoutNode, type TreePerson } from '../../utils/treeBuilder';

/** Gender-based tint for node card backgrounds. */
const GENDER_TINT: Record<string, string> = {
  m: '#1a2030',   // data-color: intentional (cool blue-slate)
  f: '#2a1824',   // data-color: intentional (warm rose-plum)
};
const GENDER_TINT_DEFAULT = '#1a1810'; // data-color: intentional (neutral warm dark)

// Card height and corner radius by node type
const SPINE_H = 42;
const SAT_H = 34;
const SPINE_RX = 10;
const SAT_RX = 8;

// Gender icon sizing
const SPINE_ICON_R = 4;
const SAT_ICON_R = 3.2;
const SPINE_ICON_SPACE = 16;
const SAT_ICON_SPACE = 14;

// Horizontal padding (total, split evenly left/right)
const H_PAD = 20;

// Minimum card widths
const SPINE_MIN_W = 56;
const SAT_MIN_W = 46;

// Minimum touch target height (accessibility)
const MIN_TOUCH_H = 44;

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
  const accentColor = isSpine ? base.gold : (data.era ? (eras[data.era] ?? base.textMuted) : base.textMuted);
  const opacity = dimmed ? 0.25 : 1;
  const genderTint = GENDER_TINT[(data.gender ?? '').toLowerCase()] ?? GENDER_TINT_DEFAULT;

  const h = isSpine ? SPINE_H : SAT_H;
  const rx = isSpine ? SPINE_RX : SAT_RX;
  const minW = isSpine ? SPINE_MIN_W : SAT_MIN_W;
  const showGender = hasGender(data.gender);
  const iconSpace = showGender ? (isSpine ? SPINE_ICON_SPACE : SAT_ICON_SPACE) : 0;
  const iconR = isSpine ? SPINE_ICON_R : SAT_ICON_R;

  // Dynamic card width from name length
  const textW = data.name.length * fontSize * 0.6;
  const w = Math.max(minW, textW + iconSpace + H_PAD);

  const handlePress = useCallback(() => onPress(data), [data, onPress]);

  // Card centered on (x, y)
  const cx = x - w / 2;
  const cy = y - h / 2;

  // Icon position: inside card, left of center, vertically centered
  // Name shifts right when icon present
  const contentCenterX = x + (showGender ? iconSpace / 2 : 0);
  const iconCenterX = x - (textW / 2) - (iconSpace / 2) + 2;
  const iconCenterY = y;
  const iconColor = accentColor;

  return (
    <G onPress={handlePress} opacity={opacity}>
      {/* Accessibility touch target — if card is shorter than 44px, pad it */}
      {h < MIN_TOUCH_H && (
        <Rect
          x={cx - 2} y={y - MIN_TOUCH_H / 2}
          width={w + 4} height={MIN_TOUCH_H}
          fill="transparent"
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
        fill={genderTint}
        stroke={selected ? base.goldBright : (isSpine ? base.gold + '55' : base.border)}
        strokeWidth={selected ? 1.5 : 1}
      />

      {/* Gender icon */}
      {showGender && isMale(data.gender) && (
        <G opacity={0.5}>
          {/* ♂ — circle + diagonal arrow */}
          <Circle cx={iconCenterX} cy={iconCenterY} r={iconR}
            stroke={iconColor} strokeWidth={1} fill="none" />
          <Line
            x1={iconCenterX + iconR * 0.7} y1={iconCenterY - iconR * 0.7}
            x2={iconCenterX + iconR * 1.8} y2={iconCenterY - iconR * 1.8}
            stroke={iconColor} strokeWidth={1}
          />
          {/* Arrow head lines */}
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
          {/* ♀ — circle + vertical line + crossbar */}
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
        fill={isSpine ? '#f0e8d8' : base.textDim} // data-color: intentional (light text on SVG spine node)
        fontFamily="SourceSans3_400Regular"
        fontWeight={isSpine ? '600' : '400'}
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
    </G>
  );
});
