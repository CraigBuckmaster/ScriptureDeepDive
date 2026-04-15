/**
 * ScreenHeader — Reusable header with back button, title, and optional subtitle.
 *
 * Used by all screens that need a back arrow. Consolidates the pattern from
 * SettingsScreen and ChapterListScreen into a single component so that
 * icon size, touch target, font tokens, and accessibility are consistent.
 *
 * Card #1358 (UI polish phase 1) — adds a 3px gold bar accent to the left of
 * the title text. The design language thread ties headers to CollapsibleSection
 * and (subsequently) BrowseScreenTemplate section headers.
 *
 * Usage:
 *   <ScreenHeader title="Settings" onBack={() => navigation.goBack()} />
 *   <ScreenHeader title={book.name} subtitle="50 chapters" onBack={...} />
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, type ViewStyle } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { useTheme, spacing, MIN_TOUCH_TARGET, fontFamily } from '../theme';

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
  const { base } = useTheme();
  const resolvedTitleColor = titleColor ?? base.gold;

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
        <View style={[styles.goldBar, { backgroundColor: resolvedTitleColor }]} />
        <View style={styles.titleTextWrap}>
          <Text style={[styles.title, { color: resolvedTitleColor }]} numberOfLines={1} accessibilityRole="header">{title}</Text>
          {subtitle ? (
            <Text style={[styles.subtitle, { color: base.textMuted }]}>{subtitle}</Text>
          ) : null}
        </View>
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
    flexDirection: 'row',
    alignItems: 'center',
  },
  goldBar: {
    width: 3,
    alignSelf: 'stretch',
    marginRight: spacing.sm,
    borderRadius: 1.5,
  },
  titleTextWrap: {
    flex: 1,
  },
  title: {
    fontFamily: fontFamily.displaySemiBold,
    fontSize: 22,
  },
  subtitle: {
    fontFamily: fontFamily.ui,
    fontSize: 12,
  },
});
