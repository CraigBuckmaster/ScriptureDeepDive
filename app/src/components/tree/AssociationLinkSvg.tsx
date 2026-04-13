/**
 * AssociationLinkSvg — Dashed bezier connector for `associated_with`
 * satellites (#1290). A visual counterpart to TreeLink, distinguished by
 * the dashed stroke so users can tell a contemporary association (e.g.
 * Peter → Jesus) apart from a genealogical link.
 *
 * No per-link type text — the apex labels rendered by TreeCanvas on each
 * sub-bloom ("disciples", "contemporaries", …) convey type already, and
 * rendering 89 extra <SvgText> elements here contributed to an iOS
 * native-paint crash on a tall (10k px) canvas.
 */

import React, { memo } from 'react';
import { Path } from 'react-native-svg';
import { useTheme } from '../../theme';
import { bezierPath } from '../../utils/genealogyOrganic';
import type { AssociationType } from '../../types';

interface Props {
  source: { x: number; y: number };
  target: { x: number; y: number };
  /** Retained on the prop for future per-type styling; unused at render. */
  type: AssociationType | null;
  dimmed: boolean;
}

export const AssociationLinkSvg = memo(function AssociationLinkSvg({
  source, target, dimmed,
}: Props) {
  const { base } = useTheme();
  const d = bezierPath(source, target);
  return (
    <Path
      d={d}
      stroke={base.border}
      strokeWidth={0.9}
      strokeDasharray="4,4"
      fill="none"
      opacity={dimmed ? 0.15 : 0.55}
      strokeLinecap="round"
    />
  );
});
