/**
 * MarriageBarSvg — Polished marriage connector with rounded endcaps,
 * soft glow, and interlocking rings symbol at midpoint.
 */

import React, { memo } from 'react';
import { G, Line, Circle } from 'react-native-svg';
import { useTheme } from '../../theme';
import type { MarriageBar } from '../../utils/treeBuilder';

interface Props {
  bar: MarriageBar;
  /** Dimmed when the era filter is on and neither partner matches. */
  dimmed?: boolean;
}

const RING_R = 4;
const RING_GAP = 2.5;

export const MarriageBarSvg = memo(function MarriageBarSvg({ bar, dimmed = false }: Props) {
  const { base } = useTheme();
  const opacity = dimmed ? 0.1 : 0.5;
  const color = base.goldDim;
  const { x1, x2, y, midX } = bar;

  return (
    <G opacity={opacity}>
      {/* Soft glow behind bar */}
      <Line x1={x1} y1={y} x2={x2} y2={y}
        stroke={base.gold} strokeWidth={6} opacity={0.07}
        strokeLinecap="round" />
      {/* Main bar */}
      <Line x1={x1} y1={y} x2={x2} y2={y}
        stroke={color} strokeWidth={2}
        strokeLinecap="round" />
      {/* Interlocking rings */}
      <Circle cx={midX - RING_GAP} cy={y} r={RING_R}
        stroke={color} strokeWidth={1} fill="none" />
      <Circle cx={midX + RING_GAP} cy={y} r={RING_R}
        stroke={color} strokeWidth={1} fill="none" />
    </G>
  );
});
