/**
 * components/study/ContinueHero.tsx — The Study hub's "Continue" hero
 * (#1832): active plan title in Cinzel, chapter trail ticks, paused
 * step + minutes, and a Resume action. Long-press (or the chevron)
 * opens StudyPlanDetail (#1833) — never a mandatory hop.
 */
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ChevronRight, Play } from 'lucide-react-native';
import { formatChapterRef, getGuidedStudyStepLabel } from '../../services/guidedStudy';
import type { ResumeTarget } from '../../services/study';
import { fontFamily, radii, spacing, useTheme } from '../../theme';
import type { StudyPlan, StudyPlanItem } from '../../types';
import { ChapterTrail } from './ChapterTrail';

interface Props {
  plan: StudyPlan;
  items: StudyPlanItem[];
  target: ResumeTarget;
  estimateMin: number | null;
  onResume: () => void;
  /** Opens StudyPlanDetail (#1833). Optional so #1832 callers keep working. */
  onOpenDetail?: () => void;
}

export function ContinueHero({ plan, items, target, estimateMin, onResume, onOpenDetail }: Props) {
  const { base } = useTheme();

  const chapterRef = formatChapterRef(`${target.bookId}_${target.chapterNum}`);

  const metaParts: string[] = [chapterRef];
  if (target.step) metaParts.push(`Paused at ${getGuidedStudyStepLabel(target.step)}`);
  if (estimateMin != null) metaParts.push(`~${estimateMin} min`);

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onLongPress={onOpenDetail}
      disabled={!onOpenDetail}
      accessibilityLabel={`${plan.title} study plan`}
      accessibilityHint={onOpenDetail ? 'Long press to open the plan details' : undefined}
      style={[styles.card, { backgroundColor: base.bgElevated, borderColor: `${base.gold}30` }]}
    >
      <View style={styles.kickerRow}>
        <Text style={[styles.kicker, { color: base.textMuted }]}>CONTINUE</Text>
        {onOpenDetail && (
          <TouchableOpacity
            onPress={onOpenDetail}
            accessibilityRole="button"
            accessibilityLabel={`Open ${plan.title} plan details`}
            style={styles.detailButton}
          >
            <ChevronRight size={18} color={base.textMuted} />
          </TouchableOpacity>
        )}
      </View>
      <Text style={[styles.title, { color: base.text }]} accessibilityRole="header">
        {plan.title}
      </Text>

      <ChapterTrail items={items} />

      <Text style={[styles.meta, { color: base.textMuted }]}>{metaParts.join(' · ')}</Text>

      <TouchableOpacity
        onPress={onResume}
        activeOpacity={0.72}
        style={[styles.resumeButton, { backgroundColor: base.gold }]}
        accessibilityRole="button"
        accessibilityLabel={`Resume ${plan.title} at ${chapterRef}`}
      >
        <Play size={16} color={base.bg} />
        <Text style={[styles.resumeLabel, { color: base.bg }]}>Resume</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing.md,
    gap: spacing.sm,
  },
  kickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  kicker: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 10,
    letterSpacing: 1,
  },
  detailButton: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginVertical: -spacing.sm,
    marginRight: -spacing.xs,
  },
  title: {
    fontFamily: fontFamily.displayMedium,
    fontSize: 20,
    // No numberOfLines on purpose — Dynamic Type must never truncate
    // the hero title (a11y acceptance criterion, #1832).
  },
  meta: {
    fontFamily: fontFamily.ui,
    fontSize: 12,
  },
  resumeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    minHeight: 44,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    alignSelf: 'stretch',
  },
  resumeLabel: {
    fontFamily: fontFamily.uiSemiBold,
    fontSize: 14,
  },
});
