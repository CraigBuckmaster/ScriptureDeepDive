/**
 * EmptyState — Unified empty/error/offline state component.
 *
 * Replaces the duplicated emptyWrap + emptyText pattern across screens.
 * Supports three variants: empty (default), error, and offline.
 *
 * Card #1358 (UI polish phase 1) — warmer styling:
 *   - Title in Cinzel (displaySemiBold)
 *   - `tint` prop wraps content in a parchment-tinted card
 *   - `empty` variant icon in soft gold
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme, spacing, radii, fontFamily } from '../theme';

type Variant = 'empty' | 'error' | 'offline';

interface Props {
  title: string;
  subtitle?: string;
  variant?: Variant;
  action?: { label: string; onPress: () => void };
  /** When true, wrap the content in a parchment-tinted card. Default false. */
  tint?: boolean;
}

const VARIANT_ICONS: Record<Variant, string> = {
  empty: '',
  error: '⚠',
  offline: '☁',
};

function EmptyState({ title, subtitle, variant = 'empty', action, tint = false }: Props) {
  const { base } = useTheme();

  // Per #1358: empty variant uses soft gold at 40% opacity (rendered via
  // the gold color with a 66 alpha hex suffix). Error keeps danger red.
  const iconColor =
    variant === 'error' ? base.danger : `${base.gold}66`;

  const containerStyle = [
    styles.container,
    tint && {
      backgroundColor: base.tintParchment,
      borderRadius: radii.lg,
    },
  ];

  return (
    <View style={containerStyle}>
      {variant !== 'empty' && (
        <Text style={[styles.icon, { color: iconColor }]}>
          {VARIANT_ICONS[variant]}
        </Text>
      )}
      <Text style={[styles.title, { color: base.textDim }]}>{title}</Text>
      {subtitle ? (
        <Text style={[styles.subtitle, { color: base.textMuted }]}>{subtitle}</Text>
      ) : null}
      {action ? (
        <TouchableOpacity
          onPress={action.onPress}
          style={[styles.button, { borderColor: base.gold }]}
          accessibilityRole="button"
          accessibilityLabel={action.label}
        >
          <Text style={[styles.buttonText, { color: base.gold }]}>{action.label}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

export default React.memo(EmptyState);

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg * 2,
    paddingHorizontal: spacing.lg,
  },
  icon: {
    fontSize: 28,
    marginBottom: spacing.sm,
  },
  title: {
    fontFamily: fontFamily.displaySemiBold,
    fontSize: 16,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: fontFamily.ui,
    fontSize: 12,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  button: {
    marginTop: spacing.md,
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
  },
  buttonText: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 13,
  },
});
