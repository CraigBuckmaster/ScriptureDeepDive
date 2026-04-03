/**
 * TreeLink — Parent→child connection line using cubic bezier.
 *
 * Spine links get a wide, soft gold glow trail behind the main path.
 * Non-spine links are thinner with era-based coloring.
 */

import React, { memo } from 'react';
import { Path } from 'react-native-svg';
import { useTheme, eras } from '../../theme';

interface Props {
  source: { x: number; y: number };
  target: { x: number; y: number };
  isSpine: boolean;
  dimmed: boolean;
  era?: string;
}

export const TreeLink = memo(function TreeLink({ source, target, isSpine, dimmed, era }: Props) {
  const { base } = useTheme();
  const midY = (source.y + target.y) / 2;
  const d = `M${source.x},${source.y} C${source.x},${midY} ${target.x},${midY} ${target.x},${target.y}`;
  const color = isSpine ? base.goldDim : (era ? (eras[era] ?? base.textMuted) : base.textMuted);

  if (dimmed) {
    return (
      <Path d={d} stroke={color} strokeWidth={1} fill="none" opacity={0.1}
        strokeLinecap="round" />
    );
  }

  return isSpine ? (
    <>
      {/* Wide soft glow trail */}
      <Path d={d} stroke={base.gold} strokeWidth={5} fill="none" opacity={0.12}
        strokeLinecap="round" />
      {/* Crisp spine line */}
      <Path d={d} stroke={base.goldDim} strokeWidth={1.5} fill="none" opacity={0.7}
        strokeLinecap="round" />
    </>
  ) : (
    <Path d={d} stroke={color} strokeWidth={1} fill="none" opacity={0.4}
      strokeLinecap="round" />
  );
});
