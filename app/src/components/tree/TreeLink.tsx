/**
 * TreeLink — Parent→child connection line using cubic bezier.
 *
 * Three visual tiers:
 *   1. Messianic links — wide gold glow + crisp gold stroke (the "golden thread")
 *   2. Spine links — medium glow trail + gold-dim stroke
 *   3. Satellite links — thin, muted stroke
 */

import React, { memo } from 'react';
import { Path } from 'react-native-svg';
import { useTheme, eras } from '../../theme';
import { bezierPath } from '../../utils/genealogyOrganic';

interface Props {
  source: { x: number; y: number };
  target: { x: number; y: number };
  isSpine: boolean;
  isMessianic: boolean;
  dimmed: boolean;
  era?: string;
}

export const TreeLink = memo(function TreeLink({ source, target, isSpine, isMessianic, dimmed, era }: Props) {
  const { base } = useTheme();
  const d = bezierPath(source, target);
  const eraColor = era ? (eras[era] ?? base.textMuted) : base.textMuted;

  if (dimmed) {
    return (
      <Path d={d} stroke={isMessianic ? base.gold : eraColor}
        strokeWidth={isMessianic ? 1.5 : 1} fill="none" opacity={0.08}
        strokeLinecap="round" />
    );
  }

  // ── Messianic golden thread ───────────────────────────────────
  if (isMessianic) {
    return (
      <>
        {/* Wide soft outer glow */}
        <Path d={d} stroke={base.gold} strokeWidth={8} fill="none" opacity={0.08}
          strokeLinecap="round" />
        {/* Medium inner glow */}
        <Path d={d} stroke={base.gold} strokeWidth={4} fill="none" opacity={0.15}
          strokeLinecap="round" />
        {/* Crisp golden stroke */}
        <Path d={d} stroke={base.gold} strokeWidth={2} fill="none" opacity={0.6}
          strokeLinecap="round" />
      </>
    );
  }

  // ── Spine links (non-messianic) ──────────────────────────────
  if (isSpine) {
    return (
      <>
        <Path d={d} stroke={base.goldDim} strokeWidth={4} fill="none" opacity={0.08}
          strokeLinecap="round" />
        <Path d={d} stroke={base.goldDim} strokeWidth={1.5} fill="none" opacity={0.5}
          strokeLinecap="round" />
      </>
    );
  }

  // ── Satellite links ──────────────────────────────────────────
  return (
    <Path d={d} stroke={eraColor} strokeWidth={0.8} fill="none" opacity={0.3}
      strokeLinecap="round" />
  );
});
