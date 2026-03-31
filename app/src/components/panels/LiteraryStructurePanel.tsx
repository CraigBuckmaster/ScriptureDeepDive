/**
 * LiteraryStructurePanel — Chapter-level literary structure view.
 *
 * When chiasm data is present, renders as a tabbed panel with
 * Structure and Chiasm View tabs via TabbedPanelRenderer.
 * When absent, renders the structure view alone (no tab bar).
 */

import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TabbedPanelRenderer } from './TabbedPanelRenderer';
import type { TabConfig } from './TabbedPanelRenderer';
import { ChiasmView } from './ChiasmView';
import { getPanelColors, base, spacing, fontFamily } from '../../theme';
import type { LitPanel } from '../../types';

interface Props { data: LitPanel; }

export function LiteraryStructurePanel({ data }: Props) {
  const tabs: TabConfig[] = useMemo(() => [
    { key: 'structure', label: 'Structure', hasData: data.rows.length > 0 },
    { key: 'chiasm', label: 'Chiasm View', hasData: !!data.chiasm },
  ], [data]);

  return (
    <TabbedPanelRenderer tabs={tabs}>
      {(activeKey) => {
        if (activeKey === 'chiasm' && data.chiasm) {
          return <ChiasmView data={data.chiasm} />;
        }
        return <StructureView data={data} />;
      }}
    </TabbedPanelRenderer>
  );
}

/* ── Structure sub-view (original rendering) ── */

function StructureView({ data }: Props) {
  const colors = getPanelColors('lit');

  return (
    <View style={styles.structureContainer}>
      {data.rows.map((row, i) => (
        <View
          key={i}
          style={[
            styles.row,
            row.is_key && styles.rowKey,
          ]}
        >
          <Text style={[styles.rowLabel, { color: colors.accent }]}>
            {row.label}
          </Text>
          <Text style={styles.rowText}>
            {row.text}
          </Text>
        </View>
      ))}
      {data.note ? (
        <Text style={styles.note}>{data.note}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  structureContainer: {
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
    borderLeftWidth: 0,
    paddingLeft: 0,
  },
  rowKey: {
    borderLeftWidth: 3,
    borderLeftColor: base.gold,
    paddingLeft: spacing.sm,
  },
  rowLabel: {
    fontFamily: fontFamily.uiSemiBold,
    fontSize: 12,
    minWidth: 55,
  },
  rowText: {
    color: base.textDim,
    fontFamily: fontFamily.body,
    fontSize: 14,
    flex: 1,
  },
  note: {
    color: base.textMuted,
    fontFamily: fontFamily.bodyItalic,
    fontSize: 13,
    marginTop: spacing.xs,
  },
});
