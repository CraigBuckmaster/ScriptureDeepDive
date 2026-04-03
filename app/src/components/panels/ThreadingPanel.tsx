import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { TappableReference } from '../TappableReference';
import { BadgeChip } from '../BadgeChip';
import { useTheme, spacing, fontFamily } from '../../theme';
import type { ThreadEntry, ParsedRef } from '../../types';

interface Props { entries: ThreadEntry[]; onRefPress?: (ref: ParsedRef) => void; }

export function ThreadingPanel({ entries, onRefPress }: Props) {
  const { base, getPanelColors } = useTheme();
  const colors = getPanelColors('thread');
  return (
    <View style={[styles.container, { gap: spacing.md }]}>
      {entries.map((e, i) => (
        <View key={i} style={styles.entryRow}>
          <View style={[styles.headerRow, { gap: spacing.sm }]}>
            <Text style={[styles.anchorText, { color: colors.accent }]}>
              {e.anchor}
            </Text>
            <Text style={[styles.arrowText, { color: base.textMuted }]}>→</Text>
            <Text style={[styles.anchorText, { color: colors.accent }]}>
              {e.target}
            </Text>
            {e.type ? <BadgeChip label={e.type} color={colors.accent} /> : null}
          </View>
          <TappableReference text={e.text} style={[styles.bodyText, { color: base.textDim }]} onRefPress={onRefPress} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
  entryRow: {
    gap: 4,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  anchorText: {
    fontFamily: fontFamily.uiSemiBold,
    fontSize: 13,
  },
  arrowText: {
    fontSize: 14,
  },
  bodyText: {
    fontSize: 13,
    lineHeight: 20,
  },
});
