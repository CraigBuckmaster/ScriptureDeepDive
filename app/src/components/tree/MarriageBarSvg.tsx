/**
 * MarriageBarSvg — Horizontal line + double-tick marriage symbol.
 */

import React, { memo } from 'react';
import { G, Line } from 'react-native-svg';
import { base } from '../../theme';
import type { MarriageBar } from '../../utils/treeBuilder';

interface Props { bar: MarriageBar; }

export const MarriageBarSvg = memo(function MarriageBarSvg({ bar }: Props) {
  const opacity = bar.dimmed ? 0.1 : 0.5;
  const color = base.goldDim;
  const { x1, x2, y, midX } = bar;
  const tickH = 5;
  const tickGap = 3;

  return (
    <G opacity={opacity}>
      <Line x1={x1} y1={y} x2={x2} y2={y} stroke={color} strokeWidth={1.5} />
      <Line x1={midX - tickGap} y1={y - tickH} x2={midX - tickGap} y2={y + tickH} stroke={color} strokeWidth={1.5} />
      <Line x1={midX + tickGap} y1={y - tickH} x2={midX + tickGap} y2={y + tickH} stroke={color} strokeWidth={1.5} />
    </G>
  );
});
