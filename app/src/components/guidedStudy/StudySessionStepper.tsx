import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { fontFamily, radii, spacing, useTheme } from '../../theme';
import type { GuidedStudyStep } from '../../services/guidedStudy';

const STEPS: Array<{ key: GuidedStudyStep; label: string }> = [
  { key: 'scene', label: 'Scene' },
  { key: 'observe', label: 'Observe' },
  { key: 'explore', label: 'Explore' },
  { key: 'synthesize', label: 'Synthesize' },
  { key: 'review', label: 'Review' },
];

interface Props {
  activeStep: GuidedStudyStep;
  onSelect: (step: GuidedStudyStep) => void;
}

export function StudySessionStepper({ activeStep, onSelect }: Props) {
  const { base } = useTheme();

  return (
    <View style={styles.row}>
      {STEPS.map((step) => {
        const active = step.key === activeStep;
        return (
          <TouchableOpacity
            key={step.key}
            onPress={() => onSelect(step.key)}
            activeOpacity={0.7}
            style={[
              styles.step,
              {
                borderColor: active ? base.gold : base.border,
                backgroundColor: active ? `${base.gold}18` : base.bgSurface,
              },
            ]}
          >
            <Text style={[styles.label, { color: active ? base.gold : base.textMuted }]}>
              {step.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.xs,
    flexWrap: 'wrap',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  step: {
    borderWidth: 1,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
  },
  label: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 11,
  },
});
