import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TappableReference } from '../TappableReference';
import { useTheme, spacing, fontFamily, useTypography } from '../../theme';
import type { ParsedRef, RecEntry } from '../../types';

interface Props { entries: RecEntry[]; onRefPress?: (ref: ParsedRef) => void; }

export function ReceptionPanel({ entries, onRefPress }: Props) {
  const { base, getPanelColors } = useTheme();
  const { content } = useTypography();
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
      {entries.map((e: RecEntry & { title?: string; quote?: string; who?: string; text?: string }, i: number) => {
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
              <Text style={[content.bodyItalic, { color: base.textDim }]}>
                {body}
              </Text>
            ) : null}
            {note ? (
              <TappableReference text={note} style={[content.bodySm, { color: base.textMuted }]} onRefPress={onRefPress} />
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
});
