/**
 * PersonFilterBar — Dismiss pill for the person-focused filter state.
 *
 * When the user taps a person name on any event card, the timeline filters to
 * that person. This bar displays below the era strip and shows a dismiss
 * button + count of matching events.
 *
 * Part of Card #1266 (Timeline Phase 2).
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme, fontFamily, radii, spacing } from '../../theme';

export interface PersonFilterBarProps {
  personName: string;
  matchCount: number;
  onDismiss: () => void;
}

export function PersonFilterBar({ personName, matchCount, onDismiss }: PersonFilterBarProps) {
  const { base } = useTheme();

  return (
    <View
      accessibilityLabel={`Showing ${matchCount} events for ${personName}`}
      style={[styles.pill, { backgroundColor: base.gold + '14', borderColor: base.gold + '40' }]}
    >
      <TouchableOpacity
        onPress={onDismiss}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        accessibilityRole="button"
        accessibilityLabel="Clear person filter"
        style={styles.dismiss}
      >
        <Text style={[styles.dismissLabel, { color: base.gold }]}>✕</Text>
      </TouchableOpacity>
      <Text style={[styles.label, { color: base.text }]}>
        Showing {matchCount} event{matchCount === 1 ? '' : 's'} for{' '}
        <Text style={{ color: base.gold }}>{personName}</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radii.pill,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  dismiss: {
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dismissLabel: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 12,
    lineHeight: 14,
  },
  label: {
    fontFamily: fontFamily.ui,
    fontSize: 11,
  },
});
