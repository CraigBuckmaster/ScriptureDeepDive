/**
 * CompositeContextPanel — Tabbed context hub for the hist panel.
 *
 * Tabs: Context | Historical | Audience | ANE Parallels
 * Only tabs with data are shown. Single-tab → no tab bar.
 * Backward compatible: PanelRenderer detects the composite shape.
 */

import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TabbedPanelRenderer } from './TabbedPanelRenderer';
import type { TabConfig } from './TabbedPanelRenderer';
import { TappableReference } from '../TappableReference';
import { useTheme, spacing, fontFamily } from '../../theme';
import type { CompositeContextData, ParsedRef } from '../../types';

interface Props {
  data: CompositeContextData;
  onRefPress?: (ref: ParsedRef) => void;
}

export function CompositeContextPanel({ data, onRefPress }: Props) {
  const tabs: TabConfig[] = useMemo(() => [
    { key: 'context', label: 'Context', hasData: !!data.context },
    { key: 'historical', label: 'Historical', hasData: !!data.historical },
    { key: 'audience', label: 'Audience', hasData: !!data.audience },
    { key: 'ane', label: 'ANE', hasData: Array.isArray(data.ane) && data.ane.length > 0 },
  ], [data]);

  return (
    <TabbedPanelRenderer tabs={tabs}>
      {(activeKey) => {
        switch (activeKey) {
          case 'context':
            return (
              <View style={styles.tabContent}>
                <TappableReference text={data.context!} onRefPress={onRefPress} />
              </View>
            );
          case 'historical':
            return (
              <View style={styles.tabContent}>
                <TappableReference text={data.historical!} onRefPress={onRefPress} />
              </View>
            );
          case 'audience':
            return (
              <View style={styles.tabContent}>
                <TappableReference text={data.audience!} onRefPress={onRefPress} />
              </View>
            );
          case 'ane':
            return <ANEParallelView entries={data.ane!} onRefPress={onRefPress} />;
          default:
            return null;
        }
      }}
    </TabbedPanelRenderer>
  );
}

/* ── ANE Parallels sub-view ── */

interface ANEParallelViewProps {
  entries: CompositeContextData['ane'] & {};
  onRefPress?: (ref: ParsedRef) => void;
}

function ANEParallelView({ entries, onRefPress }: ANEParallelViewProps) {
  const { base, getPanelColors } = useTheme();
  const colors = getPanelColors('hist');

  return (
    <View style={styles.tabContent}>
      {entries.map((entry, i) => (
        <View key={i} style={[styles.aneCard, { backgroundColor: base.bgElevated, borderColor: base.border }]}>
          <Text style={[styles.aneTitle, { color: colors.accent }]}>
            {entry.parallel}
          </Text>

          <View style={styles.aneRow}>
            <Text style={[styles.aneLabel, { color: base.textMuted }]}>Similarity</Text>
            <TappableReference text={entry.similarity} onRefPress={onRefPress} />
          </View>

          <View style={styles.aneRow}>
            <Text style={[styles.aneLabel, { color: base.textMuted }]}>Difference</Text>
            <TappableReference text={entry.difference} onRefPress={onRefPress} />
          </View>

          <View style={styles.aneRow}>
            <Text style={[styles.aneLabel, { color: base.textMuted }]}>Significance</Text>
            <TappableReference text={entry.significance} onRefPress={onRefPress} />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  tabContent: {
    paddingVertical: spacing.xs,
  },
  aneCard: {
    borderWidth: 1,
    borderRadius: 8,
    padding: spacing.sm + 2,
    marginBottom: spacing.sm,
  },
  aneTitle: {
    fontFamily: fontFamily.displayMedium,
    fontSize: 14,
    marginBottom: spacing.sm,
  },
  aneRow: {
    marginBottom: spacing.xs + 2,
  },
  aneLabel: {
    fontFamily: fontFamily.uiSemiBold,
    fontSize: 11,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
});
