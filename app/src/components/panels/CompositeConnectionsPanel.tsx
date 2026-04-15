/**
 * CompositeConnectionsPanel — Tabbed cross-references + echoes hub.
 *
 * Tabs: Cross-References | Echoes & Allusions
 * Only tabs with data are shown. Single-tab → no tab bar.
 * Backward compatible: PanelRenderer detects the composite shape.
 */

import React, { useMemo } from 'react';
import type { CompositeConnectionsData, ParsedRef } from '../../types';
import { TabbedPanelRenderer } from './TabbedPanelRenderer';
import type { TabConfig } from './TabbedPanelRenderer';
import { CrossRefPanel } from './CrossRefPanel';
import { EchoesView } from './EchoesView';

interface Props {
  data: CompositeConnectionsData;
  onRefPress?: (ref: ParsedRef) => void;
  defaultTab?: string;
}

export function CompositeConnectionsPanel({ data, onRefPress, defaultTab }: Props) {
  const tabs: TabConfig[] = useMemo(() => [
    { key: 'refs', label: 'Cross-References', hasData: data.refs.length > 0 },
    { key: 'echoes', label: 'Echoes & Allusions', hasData: Array.isArray(data.echoes) && data.echoes.length > 0 },
  ], [data]);

  return (
    <TabbedPanelRenderer tabs={tabs} defaultTab={defaultTab}>
      {(activeKey) => {
        switch (activeKey) {
          case 'refs':
            return <CrossRefPanel entries={data.refs} onRefPress={onRefPress} />;
          case 'echoes':
            return <EchoesView entries={data.echoes!} onRefPress={onRefPress} />;
          default:
            return null;
        }
      }}
    </TabbedPanelRenderer>
  );
}
