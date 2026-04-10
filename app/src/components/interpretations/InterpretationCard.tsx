/**
 * InterpretationCard — Displays a historical interpretation with author,
 * quote, source, and era badge. Uses church era colors from theme.
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme, spacing, radii, fontFamily, churchEras } from '../../theme';
import type { HistoricalInterpretation } from '../../types';

interface Props {
  interpretation: HistoricalInterpretation;
  onPress?: () => void;
  onVersePress?: (verseRef: string) => void;
}

export const InterpretationCard = React.memo(function InterpretationCard({
  interpretation,
  onPress,
  onVersePress,
}: Props) {
  const { base } = useTheme();
  const eraColor = churchEras[interpretation.era] ?? base.gold;

  const Wrapper = onPress ? TouchableOpacity : View;
  const wrapperProps = onPress
    ? { onPress, activeOpacity: 0.7, accessibilityRole: 'button' as const }
    : {};

  return (
    <Wrapper
      {...wrapperProps}
      style={[
        styles.card,
        { backgroundColor: base.bgElevated, borderColor: eraColor + '30' },
      ]}
    >
      {/* Era badge + verse ref row */}
      <View style={styles.badgeRow}>
        <View style={[styles.eraBadge, { backgroundColor: eraColor + '25' }]}>
          <View style={[styles.eraDot, { backgroundColor: eraColor }]} />
          <Text style={[styles.eraLabel, { color: eraColor }]}>
            {interpretation.era_label}
          </Text>
        </View>
        {interpretation.verse_ref && onVersePress ? (
          <TouchableOpacity
            onPress={() => onVersePress(interpretation.verse_ref)}
            style={[styles.verseRefPill, { backgroundColor: base.gold + '18', borderColor: base.gold + '35' }]}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={`Go to ${interpretation.verse_ref}`}
          >
            <Text style={[styles.verseRefText, { color: base.gold }]}>
              {interpretation.verse_ref}
            </Text>
          </TouchableOpacity>
        ) : null}
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
      <View style={[styles.sourceRow, { borderTopColor: base.border + '40' }]}>
        <Text style={[styles.source, { color: base.textMuted }]}>
          {interpretation.source_title}
          {interpretation.source_date ? ` (${interpretation.source_date})` : ''}
        </Text>
      </View>
    </Wrapper>
  );
});

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  eraBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: radii.pill,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  verseRefPill: {
    borderWidth: 1,
    borderRadius: radii.pill,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  verseRefText: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 10,
    letterSpacing: 0.3,
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
    // borderTopColor set inline via base.border + '40'
    paddingTop: spacing.xs,
  },
  source: {
    fontFamily: fontFamily.ui,
    fontSize: 11,
  },
});
