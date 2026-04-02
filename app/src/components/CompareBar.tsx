/**
 * CompareBar — Thin gold indicator bar: "Comparing KJV and ASV  ✕"
 * Shown below the nav bar when parallel translation mode is active.
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { X } from 'lucide-react-native';
import { useTheme, spacing, fontFamily } from '../theme';

interface Props {
  primaryLabel: string;
  comparisonLabel: string;
  onDismiss: () => void;
}

export function CompareBar({ primaryLabel, comparisonLabel, onDismiss }: Props) {
  const { base } = useTheme();

  return (
    <View
      style={[styles.bar, { backgroundColor: base.gold + '08', borderBottomColor: base.gold + '20' }]}
      accessibilityRole="toolbar"
      accessibilityLabel={`Comparing ${primaryLabel} and ${comparisonLabel}. Tap X to exit.`}
    >
      <Text style={[styles.text, { color: base.gold }]}>
        Comparing {primaryLabel} and {comparisonLabel}
      </Text>
      <TouchableOpacity
        onPress={onDismiss}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        accessibilityLabel="Exit translation comparison"
        accessibilityRole="button"
      >
        <X size={14} color={base.textMuted} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 28,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
  },
  text: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 11,
  },
});
