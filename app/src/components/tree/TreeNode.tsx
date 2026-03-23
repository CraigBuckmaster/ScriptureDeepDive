/**
 * TreeNode — Person node: invisible touch target + circle + label.
 */

import React, { memo, useCallback } from 'react';
import { Circle, Text as SvgText, G } from 'react-native-svg';
import { base, eras } from '../../theme';
import { TREE_CONSTANTS, type LayoutNode, type TreePerson } from '../../utils/treeBuilder';

interface Props {
  node: LayoutNode;
  dimmed: boolean;
  filterEra: string | null;
  onPress: (person: TreePerson) => void;
}

export const TreeNode = memo(function TreeNode({ node, dimmed, filterEra, onPress }: Props) {
  const { data, x, y } = node;
  const isSpine = data.nodeType === 'spine';
  const r = isSpine ? TREE_CONSTANTS.spineRadius : TREE_CONSTANTS.satelliteRadius;
  const fontSize = isSpine ? TREE_CONSTANTS.spineFontSize : TREE_CONSTANTS.satelliteFontSize;
  const fillColor = isSpine ? base.gold : (data.era ? (eras[data.era] ?? base.textMuted) : base.textMuted);
  const opacity = dimmed ? 0.25 : 1;

  const handlePress = useCallback(() => onPress(data), [data, onPress]);

  return (
    <G>
      {/* Invisible touch target (44pt equivalent) */}
      <Circle
        cx={x} cy={y} r={TREE_CONSTANTS.touchTargetRadius}
        fill="transparent"
        onPress={handlePress}
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
        x={x} y={y - r - 4}
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
