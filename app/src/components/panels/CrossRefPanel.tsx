/**
 * CrossRefPanel — Cross-reference entries with tappable refs.
 * cross gold (#d4b060).
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { TappableReference } from '../TappableReference';
import { useTheme, spacing, fontFamily } from '../../theme';
import { parseReference } from '../../utils/verseResolver';
import type { CrossRefEntry, ParsedRef } from '../../types';

interface Props {
  entries: CrossRefEntry[];
  onRefPress?: (ref: ParsedRef) => void;
}

export function CrossRefPanel({ entries, onRefPress }: Props) {
  const { base, getPanelColors } = useTheme();
  const colors = getPanelColors('cross');

  return (
    <View style={styles.container}>
      {entries.map((entry, i) => (
        <View key={i} style={styles.entryRow}>
          <TouchableOpacity
            onPress={() => {
              const parsed = parseReference(entry.ref);
              if (parsed && onRefPress) onRefPress(parsed);
            }}
            accessibilityRole="link"
            accessibilityLabel={`Reference: ${entry.ref}`}
          >
            <Text style={[styles.refLabel, { color: colors.accent }]}>
              {entry.ref}
            </Text>
          </TouchableOpacity>
          <View style={styles.noteWrapper}>
            <TappableReference
              text={entry.note}
              style={[styles.noteText, { color: base.textDim }]}
              onRefPress={onRefPress}
            />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  entryRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  refLabel: {
    fontFamily: fontFamily.uiSemiBold,
    fontSize: 13,
    minWidth: 70,
  },
  noteWrapper: {
    flex: 1,
  },
  noteText: {
    fontSize: 14,
    lineHeight: 22,
  },
});
