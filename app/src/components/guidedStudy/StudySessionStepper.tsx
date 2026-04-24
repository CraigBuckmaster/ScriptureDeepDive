import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { fontFamily, radii, spacing, useTheme } from '../../theme';
import {
  GUIDED_STUDY_STEPS,
  GUIDED_STUDY_STEP_LABELS,
  type GuidedStudyStep,
} from '../../services/guidedStudy/types';

interface Props {
  activeStep: GuidedStudyStep;
  onSelect: (step: GuidedStudyStep) => void;
}

export function StudySessionStepper({ activeStep, onSelect }: Props) {
  const { base } = useTheme();

  return (
    <View style={styles.row}>
      {GUIDED_STUDY_STEPS.map((key) => {
        const active = key === activeStep;
        const label = GUIDED_STUDY_STEP_LABELS[key];
        return (
          <TouchableOpacity
            key={key}
            onPress={() => onSelect(key)}
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
              {label}
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
