import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BookOpen, ChevronRight } from 'lucide-react-native';
import { fontFamily, radii, spacing, useTheme } from '../../theme';
import {
  getGuidedStudyStepLabel,
  type GuidedStudyStep,
  type StudyDepthEstimate,
} from '../../services/guidedStudy';

interface Props {
  estimate: StudyDepthEstimate;
  onPress: () => void;
  mode?: 'start' | 'continue' | 'review';
  currentStep?: GuidedStudyStep;
  dueCount?: number;
}

function buildCopy(
  mode: 'start' | 'continue' | 'review',
  estimate: StudyDepthEstimate,
  currentStep?: GuidedStudyStep,
  dueCount: number = 0,
) {
  if (mode === 'continue') {
    return {
      title: 'Continue study',
      meta: `Resume at ${getGuidedStudyStepLabel(currentStep ?? 'scene')} | ${estimate.guidedMin} min guided`,
      accessibilityLabel: 'Continue study',
    };
  }

  if (mode === 'review') {
    return {
      title: 'Review insights',
      meta:
        dueCount === 1
          ? '1 review prompt due for this chapter'
          : `${dueCount} review prompts due for this chapter`,
      accessibilityLabel: 'Review insights',
    };
  }

  return {
    title: 'Study this chapter',
    meta: `${estimate.readMin} min read | ${estimate.guidedMin} min guided | ${estimate.deepMin} min deep`,
    accessibilityLabel: 'Study this chapter',
  };
}

export function StudySessionCTA({
  estimate,
  onPress,
  mode = 'start',
  currentStep,
  dueCount = 0,
}: Props) {
  const { base } = useTheme();
  const copy = buildCopy(mode, estimate, currentStep, dueCount);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.72}
      style={[styles.outer, { backgroundColor: base.bgElevated, borderColor: `${base.gold}30` }]}
      accessibilityRole="button"
      accessibilityLabel={copy.accessibilityLabel}
    >
      <View style={[styles.stripe, { backgroundColor: base.gold }]} />
      <View style={styles.iconWrap}>
        <BookOpen size={17} color={base.gold} />
      </View>
      <View style={styles.textWrap}>
        <Text style={[styles.title, { color: base.text }]}>{copy.title}</Text>
        <Text style={[styles.meta, { color: base.textMuted }]}>{copy.meta}</Text>
      </View>
      <ChevronRight size={16} color={base.textMuted} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  outer: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderRadius: radii.md,
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  stripe: {
    width: 3,
    alignSelf: 'stretch',
  },
  iconWrap: {
    paddingLeft: spacing.sm,
    paddingRight: spacing.xs,
  },
  textWrap: {
    flex: 1,
    paddingVertical: spacing.sm,
  },
  title: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 14,
  },
  meta: {
    fontFamily: fontFamily.ui,
    fontSize: 11,
    marginTop: 2,
  },
});
