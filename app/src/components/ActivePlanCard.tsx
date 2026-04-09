/**
 * ActivePlanCard — Compact single-row reading plan card for HomeScreen.
 * Shows plan icon, title, day subtitle, progress bar, and chevron.
 * Returns null if no active plan.
 *
 * Part of Epic #1089 (#1092).
 */

import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { ChevronRight } from 'lucide-react-native';
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

    let days: { day: number; chapters: string[] }[] = [];
    try {
      days = JSON.parse(plan.chapters_json);
    } catch {
      days = [];
    }

    const nextDay = days.find((d) => {
      const dayProgress = progress.find((p) => p.day_num === d.day);
      return !dayProgress?.completed_at;
    }) ?? null;

    setPlanData({ plan, progress, nextDay });
  }, []);

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

  const dayLabel = nextDay
    ? `Day ${nextDay.day} · ${nextDay.chapters.map((c) => c.replace('_', ' ')).join(', ')}`
    : '✓ Complete';

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: base.bgElevated, borderColor: base.gold + '30' }]}
      onPress={() => navigation.navigate('PlanDetail', { planId: plan.id })}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`Active reading plan: ${plan.name}, ${progressPercent}% complete`}
    >
      {/* Icon container */}
      <View style={[styles.iconBox, { backgroundColor: base.gold + '18' }]}>
        <Text style={styles.iconText}>📖</Text>
      </View>

      {/* Center: title + subtitle + bar */}
      <View style={styles.center}>
        <Text style={[styles.title, { color: base.text }]} numberOfLines={1}>
          {plan.name}
        </Text>
        <Text style={[styles.subtitle, { color: base.textMuted }]} numberOfLines={1}>
          {dayLabel}
        </Text>
        <View style={[styles.bar, { backgroundColor: base.border }]}>
          <View style={[styles.barFill, { width: `${progressPercent}%`, backgroundColor: base.gold }]} />
        </View>
      </View>

      {/* Right: chevron */}
      <ChevronRight size={16} color={base.textMuted} />
    </TouchableOpacity>
  );
}

const MemoizedActivePlanCard = React.memo(ActivePlanCard);
export { MemoizedActivePlanCard as ActivePlanCard };
export default MemoizedActivePlanCard;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radii.lg,
    borderWidth: 1,
    padding: spacing.sm + 2,
    gap: spacing.sm + 2,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: radii.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 16,
  },
  center: {
    flex: 1,
  },
  title: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 13,
  },
  subtitle: {
    fontFamily: fontFamily.ui,
    fontSize: 11,
    marginTop: 1,
  },
  bar: {
    height: 3,
    borderRadius: 1.5,
    marginTop: 5,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 1.5,
  },
});
