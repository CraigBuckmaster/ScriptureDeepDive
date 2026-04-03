import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme, spacing, fontFamily } from '../../theme';
import type { HebTextEntry } from '../../types';

interface Props { entries: HebTextEntry[]; }

export function HebrewReadingPanel({ entries }: Props) {
  const { base, getPanelColors } = useTheme();
  const colors = getPanelColors('hebText');
  return (
    <View style={[styles.container, { gap: spacing.md }]}>
      {entries.map((e, i) => (
        <View key={i} style={styles.entryRow}>
          <View style={styles.wordRow}>
            <Text style={[styles.wordText, { color: colors.accent }]}>{e.word}</Text>
            <Text style={[styles.transliterationText, { color: base.goldDim }]}>{e.tlit}</Text>
            <Text style={[styles.glossText, { color: base.gold }]}>— {e.gloss}</Text>
          </View>
          {e.note ? <Text style={[styles.noteText, { color: base.textDim }]}>{e.note}</Text> : null}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
  entryRow: {
    gap: 2,
  },
  wordRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'baseline',
    gap: 6,
  },
  wordText: {
    fontSize: 17,
    fontFamily: fontFamily.bodyMedium,
  },
  transliterationText: {
    fontSize: 12,
    fontFamily: fontFamily.bodyItalic,
  },
  glossText: {
    fontSize: 13,
    fontFamily: fontFamily.bodySemiBold,
  },
  noteText: {
    fontSize: 13,
    lineHeight: 20,
    fontFamily: fontFamily.body,
  },
});
