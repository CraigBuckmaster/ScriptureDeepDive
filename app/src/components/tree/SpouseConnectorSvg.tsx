/**
 * SpouseConnectorSvg — Dashed vertical line connecting multiple spouses.
 */

import React, { memo } from 'react';
import { Line } from 'react-native-svg';
import { useTheme } from '../../theme';
import type { SpouseConnector } from '../../utils/treeBuilder';

interface Props { connector: SpouseConnector; }

export const SpouseConnectorSvg = memo(function SpouseConnectorSvg({ connector }: Props) {
  const { base } = useTheme();
  return (
    <Line
      x1={connector.x} y1={connector.yTop}
      x2={connector.x} y2={connector.yBottom}
      stroke={base.goldDim} strokeWidth={1}
      strokeDasharray="4,3"
      opacity={connector.dimmed ? 0.1 : 0.4}
    />
  );
});
