import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TappableReference } from '../TappableReference';
import { useTheme, spacing, fontFamily } from '../../theme';
import type { SourceEntry, ParsedRef } from '../../types';

interface Props { entries: SourceEntry[]; onRefPress?: (ref: ParsedRef) => void; }

export function SourcesPanel({ entries, onRefPress }: Props) {
  const { base, getPanelColors } = useTheme();
  const colors = getPanelColors('src');
  return (
    <View style={styles.container}>
      {entries.map((e, i) => (
        <View key={i} style={styles.entryWrapper}>
          <Text style={[styles.entryTitle, { color: colors.accent }]}>
            {e.title}
          </Text>
          <Text style={[styles.entryQuote, { color: base.textDim }]}>
            {e.quote}
          </Text>
          <TappableReference text={e.note} style={[styles.entryNote, { color: base.textMuted }]} onRefPress={onRefPress} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  entryWrapper: {
    gap: 4,
  },
  entryTitle: {
    fontFamily: fontFamily.display,
    fontSize: 12,
  },
  entryQuote: {
    fontFamily: fontFamily.bodyItalic,
    fontSize: 14,
    lineHeight: 22,
  },
  entryNote: {
    fontSize: 13,
    lineHeight: 20,
  },
});
