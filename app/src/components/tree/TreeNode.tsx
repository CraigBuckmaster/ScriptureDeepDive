/**
 * TreeNode — Person node: invisible touch target + circle + label.
 */

import React, { memo, useCallback } from 'react';
import { Circle, Rect, Text as SvgText, G } from 'react-native-svg';
import { useTheme, eras } from '../../theme';
import { TREE_CONSTANTS, type LayoutNode, type TreePerson } from '../../utils/treeBuilder';

interface Props {
  node: LayoutNode;
  dimmed: boolean;
  filterEra: string | null;
  onPress: (person: TreePerson) => void;
}

export const TreeNode = memo(function TreeNode({ node, dimmed, filterEra, onPress }: Props) {
  const { base } = useTheme();
  const { data, x, y } = node;
  const isSpine = data.nodeType === 'spine';
  const r = isSpine ? TREE_CONSTANTS.spineRadius : TREE_CONSTANTS.satelliteRadius;
  const fontSize = isSpine ? TREE_CONSTANTS.spineFontSize : TREE_CONSTANTS.satelliteFontSize;
  const fillColor = isSpine ? base.gold : (data.era ? (eras[data.era] ?? base.textMuted) : base.textMuted);
  const opacity = dimmed ? 0.25 : 1;

  const handlePress = useCallback(() => onPress(data), [data, onPress]);

  // Approximate text width for hit target
  const labelWidth = data.name.length * (fontSize * 0.6);
  const labelY = y - r - 4;

  return (
    <G onPress={handlePress}>
      {/* Invisible hit rect covering the name label */}
      <Rect
        x={x - labelWidth / 2}
        y={labelY - fontSize}
        width={labelWidth}
        height={fontSize + 6}
        fill="transparent"
      />
      {/* Invisible touch target around circle */}
      <Circle
        cx={x} cy={y} r={TREE_CONSTANTS.touchTargetRadius}
        fill="transparent"
      />
      {/* Visible circle */}
      <Circle
        cx={x} cy={y} r={r}
        fill={fillColor}
        stroke={isSpine ? base.goldBright : fillColor}
        strokeWidth={2}
        opacity={opacity}
      />
      {/* Name label */}
      <SvgText
        x={x} y={labelY}
        textAnchor="middle"
        fontSize={fontSize}
        fill={isSpine ? '#f0e8d8' : base.textDim}
        fontFamily="SourceSans3_400Regular"
        opacity={opacity}
      >
        {data.name}
      </SvgText>
    </G>
  );
});
