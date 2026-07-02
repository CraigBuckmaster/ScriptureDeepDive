/**
 * components/guidedStudy/TimeBudgetSelector.tsx — "How long do you
 * have?" (#1842). One-row segmented control: 10 / 20 / Full. Full is
 * the default and today's behavior; the row never blocks — ignoring it
 * is the same as choosing Full.
 */
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { fontFamily, radii, spacing, useTheme } from '../../theme';

const OPTIONS: Array<{ label: string; value: number | null }> = [
  { label: '10 min', value: 10 },
  { label: '20 min', value: 20 },
  { label: 'Full', value: null },
];

interface Props {
  /** Selected budget in minutes; null = Full (default). */
  value: number | null;
  onChange: (value: number | null) => void;
}

export function TimeBudgetSelector({ value, onChange }: Props) {
  const { base } = useTheme();

  return (
    <View style={styles.wrap}>
      <Text style={[styles.label, { color: base.textMuted }]}>How long do you have?</Text>
      <View style={styles.row}>
        {OPTIONS.map((option) => {
          const active = value === option.value;
          return (
            <TouchableOpacity
              key={option.label}
              onPress={() => onChange(option.value)}
              activeOpacity={0.72}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              accessibilityLabel={
                option.value == null
                  ? 'Full session'
                  : `${option.value} minute session`
              }
              style={[
                styles.segment,
                {
                  borderColor: active ? base.gold : base.border,
                  backgroundColor: active ? `${base.gold}12` : 'transparent',
                },
              ]}
            >
              <Text style={[styles.segmentLabel, { color: active ? base.gold : base.textMuted }]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: spacing.sm,
  },
  label: {
    fontFamily: fontFamily.ui,
    fontSize: 12,
    marginBottom: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  segment: {
    flex: 1,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: radii.md,
  },
  segmentLabel: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 13,
  },
});
