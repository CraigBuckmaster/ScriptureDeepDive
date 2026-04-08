/**
 * EmptyState — Unified empty/error/offline state component.
 *
 * Replaces the duplicated emptyWrap + emptyText pattern across screens.
 * Supports three variants: empty (default), error, and offline.
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme, spacing, fontFamily } from '../theme';

type Variant = 'empty' | 'error' | 'offline';

interface Props {
  title: string;
  subtitle?: string;
  variant?: Variant;
  action?: { label: string; onPress: () => void };
}

const VARIANT_ICONS: Record<Variant, string> = {
  empty: '',
  error: '⚠',
  offline: '☁',
};

function EmptyState({ title, subtitle, variant = 'empty', action }: Props) {
  const { base } = useTheme();

  const iconColor = variant === 'error' ? base.danger : base.textMuted;

  return (
    <View style={styles.container}>
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
    fontFamily: fontFamily.ui,
    fontSize: 14,
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
