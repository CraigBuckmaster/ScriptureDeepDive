/**
 * TreeNode — Person node card: rounded-rect background, gender-tinted,
 * gold glow ring when selected. Spine nodes are larger.
 */

import React, { memo, useCallback } from 'react';
import { Circle, Rect, Text as SvgText, G } from 'react-native-svg';
import { useTheme, eras } from '../../theme';
import { TREE_CONSTANTS, type LayoutNode, type TreePerson } from '../../utils/treeBuilder';

/** Gender-based tint for node card backgrounds. */
const GENDER_TINT: Record<string, string> = {
  m: '#1a2030',   // cool blue-slate
  f: '#2a1824',   // warm rose-plum
};
const GENDER_TINT_DEFAULT = '#1a1810'; // neutral warm dark

interface Props {
  node: LayoutNode;
  dimmed: boolean;
  selected: boolean;
  filterEra: string | null;
  onPress: (person: TreePerson) => void;
}

// Card dimensions derived from node type
const SPINE_CARD = { w: 88, h: 42, rx: 10 };
const SAT_CARD = { w: 72, h: 34, rx: 8 };

export const TreeNode = memo(function TreeNode({ node, dimmed, selected, filterEra, onPress }: Props) {
  const { base } = useTheme();
  const { data, x, y } = node;
  const isSpine = data.nodeType === 'spine';
  const card = isSpine ? SPINE_CARD : SAT_CARD;
  const fontSize = isSpine ? TREE_CONSTANTS.spineFontSize : TREE_CONSTANTS.satelliteFontSize;
  const accentColor = isSpine ? base.gold : (data.era ? (eras[data.era] ?? base.textMuted) : base.textMuted);
  const opacity = dimmed ? 0.25 : 1;
  const genderTint = GENDER_TINT[data.gender ?? ''] ?? GENDER_TINT_DEFAULT;

  const handlePress = useCallback(() => onPress(data), [data, onPress]);

  // Card is centered on (x, y) — the node's d3 position
  const cx = x - card.w / 2;
  const cy = y - card.h / 2;

  return (
    <G onPress={handlePress} opacity={opacity}>
      {/* Touch target — slightly larger than card */}
      <Rect
        x={cx - 6} y={cy - 6}
        width={card.w + 12} height={card.h + 12}
        fill="transparent"
      />

      {/* Selected glow ring */}
      {selected && (
        <Rect
          x={cx - 4} y={cy - 4}
          width={card.w + 8} height={card.h + 8}
          rx={card.rx + 2}
          fill={base.gold}
          opacity={0.2}
        />
      )}

      {/* Card background */}
      <Rect
        x={cx} y={cy}
        width={card.w} height={card.h}
        rx={card.rx}
        fill={genderTint}
        stroke={selected ? base.goldBright : (isSpine ? base.gold + '55' : base.border)}
        strokeWidth={selected ? 1.5 : 1}
      />

      {/* Accent dot — era or gold */}
      <Circle
        cx={x}
        cy={y - card.h / 2 + 11}
        r={3}
        fill={accentColor}
      />

      {/* Name label — centered in card */}
      <SvgText
        x={x}
        y={y + 2}
        textAnchor="middle"
        fontSize={fontSize}
        fill={isSpine ? '#f0e8d8' : base.textDim}
        fontFamily="SourceSans3_400Regular"
        fontWeight={isSpine ? '600' : '400'}
      >
        {data.name}
      </SvgText>

      {/* Year/era subtitle for spine nodes */}
      {isSpine && data.era && (
        <SvgText
          x={x}
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
