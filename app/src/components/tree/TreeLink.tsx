/**
 * TreeLink — Parent→child connection line using cubic bezier.
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

  return (
    <Path
      d={d}
      stroke={color}
      strokeWidth={isSpine ? 1.5 : 1}
      fill="none"
      opacity={dimmed ? 0.1 : isSpine ? 0.7 : 0.4}
    />
  );
});
