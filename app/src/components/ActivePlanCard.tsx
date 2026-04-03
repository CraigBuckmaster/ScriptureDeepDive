/**
 * ActivePlanCard — Shows active reading plan with progress on HomeScreen.
 * Tappable to navigate to PlanDetailScreen. Returns null if no active plan.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { ScreenNavProp } from '../navigation/types';
import { getActivePlanId, getPlans, getPlanProgress, type ReadingPlan, type PlanProgress } from '../db/user';
import { useTheme, spacing, radii, fontFamily } from '../theme';

interface PlanData {
  plan: ReadingPlan;
  progress: PlanProgress[];
  nextDay: { day: number; chapters: string[] } | null;
}

function ActivePlanCard() {
  const { base } = useTheme();
  const navigation = useNavigation<ScreenNavProp<'Home', 'HomeMain'>>();
  const [planData, setPlanData] = useState<PlanData | null>(null);

  const loadPlanData = useCallback(async () => {
    const activePlanId = await getActivePlanId();
    if (!activePlanId) {
      setPlanData(null);
      return;
    }

    const plans = await getPlans();
    const plan = plans.find((p) => p.id === activePlanId);
    if (!plan) {
      setPlanData(null);
      return;
    }

    const progress = await getPlanProgress(activePlanId);
    
    // Parse chapters JSON
    let days: { day: number; chapters: string[] }[] = [];
    try {
      days = JSON.parse(plan.chapters_json);
    } catch {
      days = [];
    }

    // Find next incomplete day
    const nextDay = days.find((d) => {
      const dayProgress = progress.find((p) => p.day_num === d.day);
      return !dayProgress?.completed_at;
    }) ?? null;

    setPlanData({ plan, progress, nextDay });
  }, []);

  // Load on mount and when screen is focused
  useFocusEffect(
    useCallback(() => {
      loadPlanData();
    }, [loadPlanData])
  );

  if (!planData) return null;

  const { plan, progress, nextDay } = planData;
  const completed = progress.filter((p) => p.completed_at).length;
  const total = progress.length;
  const progressPercent = total > 0 ? Math.round((completed / total) * 100) : 0;

  const handlePress = () => {
    navigation.navigate('PlanDetail', { planId: plan.id });
  };

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: base.bgElevated, borderColor: base.gold + '30' }]}
      onPress={handlePress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`Active reading plan: ${plan.name}, ${progressPercent}% complete`}
    >
      <View style={styles.header}>
        <Text style={[styles.label, { color: base.textMuted }]}>ACTIVE READING PLAN</Text>
        <Text style={[styles.progress, { color: base.gold }]}>{progressPercent}%</Text>
      </View>

      <Text style={[styles.planName, { color: base.text }]}>{plan.name}</Text>

      {/* Progress bar */}
      <View style={[styles.progressBar, { backgroundColor: base.border }]}>
        <View style={[styles.progressFill, { width: `${progressPercent}%`, backgroundColor: base.gold }]} />
      </View>

      {/* Next day info */}
      {nextDay ? (
        <Text style={[styles.nextDay, { color: base.textDim }]}>
          Day {nextDay.day}: {nextDay.chapters.map((c) => c.replace('_', ' ')).join(', ')}
        </Text>
      ) : (
        <Text style={[styles.nextDay, { color: base.gold }]}>✓ Plan complete!</Text>
      )}

      <Text style={[styles.cta, { color: base.gold }]}>Continue reading →</Text>
    </TouchableOpacity>
  );
}

const MemoizedActivePlanCard = React.memo(ActivePlanCard);
export { MemoizedActivePlanCard as ActivePlanCard };
export default MemoizedActivePlanCard;

const styles = StyleSheet.create({
  container: {
    borderRadius: radii.md,
    borderWidth: 1,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 9,
    letterSpacing: 0.5,
  },
  progress: {
    fontFamily: fontFamily.uiSemiBold,
    fontSize: 12,
  },
  planName: {
    fontFamily: fontFamily.uiSemiBold,
    fontSize: 15,
    marginTop: 4,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    marginTop: spacing.sm,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  nextDay: {
    fontFamily: fontFamily.ui,
    fontSize: 12,
    marginTop: spacing.sm,
  },
  cta: {
    fontFamily: fontFamily.uiSemiBold,
    fontSize: 12,
    marginTop: spacing.sm,
  },
});
