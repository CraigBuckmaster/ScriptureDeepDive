import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TappableReference } from '../TappableReference';
import { useTheme, spacing, fontFamily } from '../../theme';
import type { ParsedRef, RecEntry } from '../../types';

interface Props { entries: RecEntry[]; onRefPress?: (ref: ParsedRef) => void; }

export function ReceptionPanel({ entries, onRefPress }: Props) {
  const { base, getPanelColors } = useTheme();
  const colors = getPanelColors('rec');
  if (!entries?.length) {
    return (
      <Text style={[styles.emptyText, { color: base.textMuted }]}>
        No reception history available.
      </Text>
    );
  }

  return (
    <View style={[styles.container, { gap: spacing.md }]}>
      {entries.map((e: any, i: number) => {
        // Support both shapes: { title, quote, note } and { who, text }
        const heading = e.title ?? e.who ?? '';
        const body = e.quote ?? e.text ?? '';
        const note = e.note ?? '';

        return (
          <View key={i} style={styles.entryRow}>
            {heading ? (
              <Text style={[styles.headingText, { color: colors.accent }]}>
                {heading}
              </Text>
            ) : null}
            {body ? (
              <Text style={[styles.quoteText, { color: base.textDim }]}>
                {body}
              </Text>
            ) : null}
            {note ? (
              <TappableReference text={note} style={[styles.noteText, { color: base.textMuted }]} onRefPress={onRefPress} />
            ) : null}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
  emptyText: {
    fontSize: 12,
    fontFamily: fontFamily.ui,
  },
  entryRow: {
    gap: 4,
  },
  headingText: {
    fontFamily: fontFamily.display,
    fontSize: 12,
  },
  quoteText: {
    fontFamily: fontFamily.bodyItalic,
    fontSize: 14,
    lineHeight: 22,
  },
  noteText: {
    fontSize: 13,
    lineHeight: 20,
  },
});
