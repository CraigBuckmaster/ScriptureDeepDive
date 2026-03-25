/**
 * ScreenHeader — Reusable header with back button, title, and optional subtitle.
 *
 * Used by all screens that need a back arrow. Consolidates the pattern from
 * SettingsScreen and ChapterListScreen into a single component so that
 * icon size, touch target, font tokens, and accessibility are consistent.
 *
 * Usage:
 *   <ScreenHeader title="Settings" onBack={() => navigation.goBack()} />
 *   <ScreenHeader title={book.name} subtitle="50 chapters" onBack={...} />
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, type ViewStyle } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { base, spacing, MIN_TOUCH_TARGET, fontFamily } from '../theme';

interface Props {
  title: string;
  subtitle?: string;
  onBack: () => void;
  /** Override container style (e.g. extra marginBottom) */
  style?: ViewStyle;
  /** Override title color. Defaults to base.gold. */
  titleColor?: string;
  /** Accessibility label for the back button. Defaults to "Go back". */
  backLabel?: string;
}

export function ScreenHeader({ title, subtitle, onBack, style, titleColor, backLabel }: Props) {
  return (
    <View style={[styles.row, style]}>
      <TouchableOpacity
        onPress={onBack}
        style={styles.backButton}
        accessibilityRole="button"
        accessibilityLabel={backLabel ?? 'Go back'}
      >
        <ArrowLeft size={20} color={base.gold} />
      </TouchableOpacity>
      <View style={styles.textWrap}>
        <Text style={[styles.title, titleColor ? { color: titleColor } : undefined]} numberOfLines={1}>{title}</Text>
        {subtitle ? (
          <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  backButton: {
    minWidth: MIN_TOUCH_TARGET,
    minHeight: MIN_TOUCH_TARGET,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textWrap: {
    flex: 1,
  },
  title: {
    color: base.gold,
    fontFamily: fontFamily.displaySemiBold,
    fontSize: 22,
  },
  subtitle: {
    color: base.textMuted,
    fontFamily: fontFamily.ui,
    fontSize: 12,
  },
});
