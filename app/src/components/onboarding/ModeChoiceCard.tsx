/**
 * ModeChoiceCard — Shared row for choosing a chapter reading mode.
 *
 * Used by the onboarding mode-choice page and the in-app ChapterModePicker
 * sheet. The "Recommended" pip is opt-in via the `recommended` prop —
 * onboarding shows it, the in-app picker omits it.
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Check } from 'lucide-react-native';
import { useTheme, spacing, radii, fontFamily } from '../../theme';
import type { ChapterMode } from '../../stores/settingsStore';

export interface ModeMeta {
  mode: ChapterMode;
  label: string;
  description: string;
}

export const MODE_META: ReadonlyArray<ModeMeta> = [
  {
    mode: 'read',
    label: 'Read',
    description: 'Just the words. Verse text, notes, prayer.',
  },
  {
    mode: 'study',
    label: 'Study',
    description: 'Guided reading with context, journeys, and coach.',
  },
  {
    mode: 'deep',
    label: 'Deep Dive',
    description: 'Adds scholar commentary, Hebrew/Greek, manuscripts, debates.',
  },
];

export const RECOMMENDED_MODE: ChapterMode = 'study';

interface Props {
  mode: ChapterMode;
  selected: boolean;
  recommended?: boolean;
  onPress: () => void;
}

export function ModeChoiceCard({ mode, selected, recommended, onPress }: Props) {
  const { base } = useTheme();
  const meta = MODE_META.find((m) => m.mode === mode);
  if (!meta) return null;

  const borderColor = selected ? base.gold : base.border;
  const backgroundColor = selected ? base.gold + '15' : base.bgSurface;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={`${meta.label}. ${meta.description}${recommended ? '. Recommended.' : ''}`}
      style={[styles.card, { borderColor, backgroundColor }]}
    >
      <View style={styles.headerRow}>
        <Text style={[styles.label, { color: base.text }]}>{meta.label}</Text>
        <View style={styles.headerRight}>
          {recommended ? (
            <View style={[styles.pip, { backgroundColor: base.gold + '25', borderColor: base.gold + '60' }]}>
              <Text style={[styles.pipText, { color: base.gold }]}>Recommended</Text>
            </View>
          ) : null}
          {selected ? <Check size={18} color={base.gold} /> : null}
        </View>
      </View>
      <Text style={[styles.description, { color: base.textDim }]}>{meta.description}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: radii.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  label: {
    fontFamily: fontFamily.displayMedium,
    fontSize: 16,
    letterSpacing: 0.3,
  },
  description: {
    fontFamily: fontFamily.body,
    fontSize: 14,
    lineHeight: 20,
  },
  pip: {
    borderWidth: 1,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  pipText: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 10,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
});
