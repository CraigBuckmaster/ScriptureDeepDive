/**
 * TranslationPicker — Compact pill row for switching Bible translation.
 * Available options: NIV · ESV · KJV
 */

import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { base, useTheme, spacing, radii, fontFamily } from '../theme';

const TRANSLATIONS: { id: string; label: string }[] = [
  { id: 'niv', label: 'NIV' },
  { id: 'esv', label: 'ESV' },
  { id: 'kjv', label: 'KJV' },
];

interface Props {
  selected: string;
  onSelect: (translation: string) => void;
}

export function TranslationPicker({ selected, onSelect }: Props) {
  const { base } = useTheme();
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
      style={[styles.scroll, { borderBottomColor: base.border, backgroundColor: base.bg }]}
    >
      {TRANSLATIONS.map((t) => {
        const isActive = t.id === selected;
        return (
          <TouchableOpacity
            key={t.id}
            onPress={() => onSelect(t.id)}
            style={[styles.pill, { borderColor: base.border }, isActive && { borderColor: base.gold, backgroundColor: base.gold + '20' }]}
            activeOpacity={0.7}
          >
            <Text style={[styles.pillLabel, { color: base.textMuted }, isActive && { color: base.gold }]}>
              {t.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    borderBottomWidth: 1,
    flexGrow: 0,
    flexShrink: 0,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    gap: spacing.xs,
  },
  pill: {
    borderWidth: 1,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 4,
  },
  pillLabel: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 11,
  },
});
