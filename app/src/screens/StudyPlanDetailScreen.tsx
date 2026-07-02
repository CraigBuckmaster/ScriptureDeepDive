/**
 * StudyPlanDetailScreen — Unified study plan detail (#1833). NOT the
 * legacy PlanDetailScreen (reading plans) — this one reads
 * study_plans/study_plan_items. Item list with completion state,
 * chapter trail, per-item resume, and an archive action. Reached from
 * the hub's Continue hero (chevron / long-press); never a mandatory
 * hop on the way into a session.
 */
import React, { useCallback, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { Archive, BookOpen, Check, ChevronRight } from 'lucide-react-native';
import { ChapterTrail } from '../components/study/ChapterTrail';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { ScreenHeader } from '../components/ScreenHeader';
import { withErrorBoundary } from '../components/ScreenErrorBoundary';
import { archiveStudyPlan } from '../db/userMutations';
import { getStudyPlan, getStudyPlanItems } from '../db/userQueries';
import type { ScreenNavProp, ScreenRouteProp } from '../navigation/types';
import { formatChapterRef } from '../services/guidedStudy';
import { fontFamily, radii, spacing, useTheme } from '../theme';
import type { StudyPlan, StudyPlanItem, StudyPlanItemRef } from '../types';
import { logger } from '../utils/logger';

function parseRef(item: StudyPlanItem): StudyPlanItemRef | null {
  try {
    const ref: unknown = JSON.parse(item.ref_json);
    if (typeof ref === 'object' && ref !== null && 'bookId' in ref && 'chapterNum' in ref) {
      return ref as StudyPlanItemRef;
    }
  } catch {
    /* fall through */
  }
  return null;
}

function StudyPlanDetailScreen() {
  const { base } = useTheme();
  const navigation = useNavigation<ScreenNavProp<'Explore', 'StudyPlanDetail'>>();
  const route = useRoute<ScreenRouteProp<'Explore', 'StudyPlanDetail'>>();
  const { planId } = route.params;

  const [plan, setPlan] = useState<StudyPlan | null>(null);
  const [items, setItems] = useState<StudyPlanItem[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    try {
      const [planRow, itemRows] = await Promise.all([
        getStudyPlan(planId),
        getStudyPlanItems(planId),
      ]);
      setPlan(planRow);
      setItems(itemRows);
    } catch (err) {
      logger.warn('StudyPlanDetail', 'Failed to load plan', err);
    } finally {
      setLoading(false);
    }
  }, [planId]);

  // Reload on focus so returning from a session reflects completion.
  useFocusEffect(
    useCallback(() => {
      void reload();
    }, [reload]),
  );

  const handleArchive = useCallback(() => {
    Alert.alert(
      'Archive this plan?',
      'The plan moves out of your Study hub. Nothing you wrote is deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Archive',
          style: 'destructive',
          onPress: () => {
            void archiveStudyPlan(planId)
              .then(() => navigation.goBack())
              .catch((err) => logger.warn('StudyPlanDetail', 'Failed to archive plan', err));
          },
        },
      ],
    );
  }, [navigation, planId]);

  const handleResumeItem = useCallback(
    (item: StudyPlanItem) => {
      const ref = parseRef(item);
      if (!ref) return;
      navigation.navigate('StudySession', {
        bookId: ref.bookId,
        chapterNum: ref.chapterNum,
        planId,
      });
    },
    [navigation, planId],
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: base.bg }]}>
        <View style={styles.loadingPad}>
          <LoadingSkeleton lines={8} />
        </View>
      </SafeAreaView>
    );
  }

  if (!plan) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: base.bg }]}>
        <View style={styles.headerPad}>
          <ScreenHeader title="Study Plan" onBack={() => navigation.goBack()} />
        </View>
        <Text style={[styles.notFound, { color: base.textMuted }]}>Plan not found</Text>
      </SafeAreaView>
    );
  }

  const done = items.filter((i) => i.completed_at != null).length;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: base.bg }]}>
      <View style={styles.headerPad}>
        <ScreenHeader title={plan.title} onBack={() => navigation.goBack()} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.progressBlock}>
          <ChapterTrail items={items} />
          <Text style={[styles.progressText, { color: base.textMuted }]}>
            {done} of {items.length} complete
          </Text>
        </View>

        <View style={styles.list}>
          {items.map((item) => {
            const ref = parseRef(item);
            const label = ref ? formatChapterRef(`${ref.bookId}_${ref.chapterNum}`) : '—';
            const completed = item.completed_at != null;
            return (
              <TouchableOpacity
                key={item.item_num}
                onPress={() => handleResumeItem(item)}
                disabled={!ref}
                activeOpacity={0.72}
                accessibilityRole="button"
                accessibilityLabel={
                  completed ? `${label}, complete. Revisit session` : `${label}. Resume here`
                }
                style={[
                  styles.itemRow,
                  { backgroundColor: base.bgElevated, borderColor: base.border },
                ]}
              >
                {completed ? (
                  <Check size={16} color={base.gold} />
                ) : (
                  <BookOpen size={16} color={base.textMuted} />
                )}
                <View style={styles.itemText}>
                  <Text style={[styles.itemTitle, { color: completed ? base.textMuted : base.text }]}>
                    {label}
                  </Text>
                  <Text style={[styles.itemMeta, { color: base.textMuted }]}>
                    {item.kind === 'session' ? 'Guided session' : 'Reading'}
                    {ref?.verseStart != null ? ` · from v${ref.verseStart}` : ''}
                  </Text>
                </View>
                <ChevronRight size={16} color={base.textMuted} />
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity
          onPress={handleArchive}
          activeOpacity={0.72}
          accessibilityRole="button"
          accessibilityLabel={`Archive the ${plan.title} plan`}
          style={[styles.archiveButton, { borderColor: base.border }]}
        >
          <Archive size={15} color={base.textMuted} />
          <Text style={[styles.archiveLabel, { color: base.textMuted }]}>Archive plan</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerPad: { paddingHorizontal: spacing.md, paddingTop: spacing.sm },
  loadingPad: { padding: spacing.lg },
  notFound: {
    fontFamily: fontFamily.ui,
    fontSize: 14,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
  content: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xxl,
  },
  progressBlock: {
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  progressText: {
    fontFamily: fontFamily.ui,
    fontSize: 12,
  },
  list: { gap: spacing.xs },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 52,
    borderWidth: 1,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  itemText: { flex: 1 },
  itemTitle: {
    fontFamily: fontFamily.bodyMedium,
    fontSize: 15,
  },
  itemMeta: {
    fontFamily: fontFamily.ui,
    fontSize: 11,
    marginTop: 1,
  },
  archiveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    minHeight: 44,
    borderWidth: 1,
    borderRadius: radii.md,
    marginTop: spacing.lg,
  },
  archiveLabel: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 13,
  },
});

export default withErrorBoundary(StudyPlanDetailScreen);
