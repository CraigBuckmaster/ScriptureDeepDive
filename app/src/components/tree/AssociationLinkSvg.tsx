/**
 * AssociationLinkSvg — Dashed bezier connector for `associated_with`
 * satellites (#1290). A visual counterpart to TreeLink, distinguished by
 * the dashed stroke so users can tell a contemporary association (e.g.
 * Peter → Jesus) apart from a genealogical link.
 */

import React, { memo } from 'react';
import { Path, Text as SvgText } from 'react-native-svg';
import { useTheme } from '../../theme';
import { bezierPath } from '../../utils/genealogyOrganic';
import type { AssociationType } from '../../types';

interface Props {
  source: { x: number; y: number };
  target: { x: number; y: number };
  type: AssociationType | null;
  dimmed: boolean;
}

export const AssociationLinkSvg = memo(function AssociationLinkSvg({
  source, target, type, dimmed,
}: Props) {
  const { base } = useTheme();
  const d = bezierPath(source, target);
  const midX = (source.x + target.x) / 2;
  const midY = (source.y + target.y) / 2;

  return (
    <>
      <Path
        d={d}
        stroke={base.border}
        strokeWidth={0.9}
        strokeDasharray="4,4"
        fill="none"
        opacity={dimmed ? 0.15 : 0.55}
        strokeLinecap="round"
      />
      {type && !dimmed && (
        <SvgText
          x={midX}
          y={midY - 2}
          fill={base.textMuted}
          fontSize={9}
          textAnchor="middle"
          opacity={0.7}
        >
          {type}
        </SvgText>
      )}
    </>
  );
});
