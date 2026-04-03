/**
 * VerseCard — Verse reference with optional annotation, tappable to navigate.
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme, spacing, radii, fontFamily } from '../../theme';

interface Props {
  verseRef: string;
  annotation?: string;
  isPrimary?: boolean;
  onPress: () => void;
}

function VerseCard({ verseRef, annotation, isPrimary, onPress }: Props) {
  const { base } = useTheme();

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[
        styles.card,
        {
          backgroundColor: base.bgElevated,
          borderColor: isPrimary ? base.gold + '40' : base.border + '40',
        },
      ]}
    >
      <View style={styles.refRow}>
        <Text style={[styles.ref, { color: base.gold }]}>{verseRef}</Text>
        {isPrimary ? (
          <Text style={[styles.primaryBadge, { color: base.gold }]}>Key</Text>
        ) : null}
      </View>
      {annotation ? (
        <Text style={[styles.annotation, { color: base.textDim }]}>{annotation}</Text>
      ) : null}
    </TouchableOpacity>
  );
}

export default React.memo(VerseCard);

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing.sm + 2,
    marginBottom: spacing.xs,
  },
  refRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ref: {
    fontFamily: fontFamily.displayMedium,
    fontSize: 13,
  },
  primaryBadge: {
    fontFamily: fontFamily.ui,
    fontSize: 10,
    letterSpacing: 0.3,
  },
  annotation: {
    fontFamily: fontFamily.body,
    fontSize: 12,
    lineHeight: 18,
    marginTop: spacing.xs,
  },
});
