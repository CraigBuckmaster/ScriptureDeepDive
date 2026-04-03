/**
 * InterpretationCard — Displays a historical interpretation with author,
 * quote, source, and era badge. Uses church era colors from theme.
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme, spacing, radii, fontFamily, churchEras } from '../../theme';
import type { HistoricalInterpretation } from '../../types';

interface Props {
  interpretation: HistoricalInterpretation;
}

export const InterpretationCard = React.memo(function InterpretationCard({
  interpretation,
}: Props) {
  const { base } = useTheme();
  const eraColor = churchEras[interpretation.era] ?? base.gold;

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: base.bgElevated, borderColor: eraColor + '30' },
      ]}
    >
      {/* Era badge */}
      <View style={[styles.eraBadge, { backgroundColor: eraColor + '25' }]}>
        <View style={[styles.eraDot, { backgroundColor: eraColor }]} />
        <Text style={[styles.eraLabel, { color: eraColor }]}>
          {interpretation.era_label}
        </Text>
      </View>

      {/* Author line */}
      <View style={styles.authorRow}>
        <Text style={[styles.author, { color: base.text }]}>
          {interpretation.author}
        </Text>
        {interpretation.author_dates ? (
          <Text style={[styles.authorDates, { color: base.textMuted }]}>
            {interpretation.author_dates}
          </Text>
        ) : null}
      </View>

      {/* Interpretation text */}
      <Text style={[styles.interpretation, { color: base.text }]}>
        {interpretation.interpretation}
      </Text>

      {/* Context note */}
      {interpretation.context ? (
        <Text style={[styles.context, { color: base.textDim }]}>
          {interpretation.context}
        </Text>
      ) : null}

      {/* Source line */}
      <View style={styles.sourceRow}>
        <Text style={[styles.source, { color: base.textMuted }]}>
          {interpretation.source_title}
          {interpretation.source_date ? ` (${interpretation.source_date})` : ''}
        </Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  eraBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    borderRadius: radii.pill,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: spacing.sm,
  },
  eraDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  eraLabel: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 10,
    letterSpacing: 0.3,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  author: {
    fontFamily: fontFamily.displayMedium,
    fontSize: 14,
  },
  authorDates: {
    fontFamily: fontFamily.ui,
    fontSize: 11,
  },
  interpretation: {
    fontFamily: fontFamily.body,
    fontSize: 13,
    lineHeight: 20,
    fontStyle: 'italic',
    marginBottom: spacing.sm,
  },
  context: {
    fontFamily: fontFamily.body,
    fontSize: 12,
    lineHeight: 18,
    marginBottom: spacing.sm,
  },
  sourceRow: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#3a2e1840',
    paddingTop: spacing.xs,
  },
  source: {
    fontFamily: fontFamily.ui,
    fontSize: 11,
  },
});
