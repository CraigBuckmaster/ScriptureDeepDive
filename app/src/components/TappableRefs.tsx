/**
 * TappableRefs — Scripture references as tappable badge chips.
 *
 * Renders a flex-wrap row of reference badges. Each badge is tappable
 * and fires onRefPress with the reference string. Reusable across
 * Dictionary, Prophecy, WordStudy, and PersonDetail screens.
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme, spacing, radii, fontFamily } from '../theme';

interface Props {
  refs: string[];
  onRefPress: (ref: string) => void;
}

export function TappableRefs({ refs, onRefPress }: Props) {
  const { base } = useTheme();

  if (!refs || refs.length === 0) return null;

  return (
    <View style={styles.container}>
      {refs.map((ref, i) => (
        <TouchableOpacity
          key={`${ref}-${i}`}
          onPress={() => onRefPress(ref)}
          activeOpacity={0.6}
          style={[styles.badge, { backgroundColor: base.gold + '15', borderColor: base.gold + '30' }]}
        >
          <Text style={[styles.badgeText, { color: base.gold }]}>{ref}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radii.sm,
    borderWidth: 1,
  },
  badgeText: {
    fontFamily: fontFamily.ui,
    fontSize: 12,
  },
});
