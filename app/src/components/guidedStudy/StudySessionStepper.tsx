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
  /**
   * Steps that have carry-forward content available right now. Phase 2.6
   * (#1735) renders a small filled dot next to those step labels.
   */
  carryForwardSteps?: ReadonlySet<GuidedStudyStep>;
}

export function StudySessionStepper({
  activeStep,
  onSelect,
  carryForwardSteps,
}: Props) {
  const { base } = useTheme();

  return (
    <View style={styles.row}>
      {GUIDED_STUDY_STEPS.map((key) => {
        const active = key === activeStep;
        const label = GUIDED_STUDY_STEP_LABELS[key];
        const hasCarry = carryForwardSteps?.has(key) ?? false;
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
            accessibilityState={{ selected: active }}
            accessibilityLabel={
              hasCarry ? `${label}, carried forward content available` : label
            }
          >
            <View style={styles.labelRow}>
              <Text style={[styles.label, { color: active ? base.gold : base.textMuted }]}>
                {label}
              </Text>
              {hasCarry ? (
                <View style={[styles.carryDot, { backgroundColor: base.gold }]} />
              ) : null}
            </View>
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
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  label: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 11,
  },
  carryDot: {
    width: 5,
    height: 5,
    borderRadius: 999,
  },
});
