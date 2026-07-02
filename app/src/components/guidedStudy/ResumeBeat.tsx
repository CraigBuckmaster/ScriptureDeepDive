/**
 * components/guidedStudy/ResumeBeat.tsx — One dismissible line shown
 * when a session resumes past the scene step with existing responses
 * (#1836): "Picking up where you left off — {StepLabel}."
 */
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { X } from 'lucide-react-native';
import { GUIDED_STUDY_STEP_LABELS, type GuidedStudyStep } from '../../services/guidedStudy';
import { fontFamily, radii, spacing, useTheme } from '../../theme';

interface Props {
  step: GuidedStudyStep;
  onDismiss: () => void;
}

export function ResumeBeat({ step, onDismiss }: Props) {
  const { base } = useTheme();

  return (
    <View
      style={[styles.row, { backgroundColor: `${base.gold}10`, borderColor: `${base.gold}30` }]}
    >
      <Text style={[styles.text, { color: base.textDim }]}>
        Picking up where you left off — {GUIDED_STUDY_STEP_LABELS[step]}.
      </Text>
      <TouchableOpacity
        onPress={onDismiss}
        accessibilityRole="button"
        accessibilityLabel="Dismiss resume note"
        style={styles.dismiss}
      >
        <X size={14} color={base.textMuted} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderRadius: radii.md,
    paddingLeft: spacing.md,
    marginBottom: spacing.sm,
  },
  text: {
    flex: 1,
    fontFamily: fontFamily.bodyItalic,
    fontSize: 13,
    paddingVertical: spacing.sm,
  },
  dismiss: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
