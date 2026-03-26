import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, FlatList, SafeAreaView, Alert, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { ScreenNavProp, ScreenRouteProp } from '../navigation/types';
import { getPlans, getActivePlanId, getPlanProgress, startPlan, completePlanDay, abandonPlan } from '../db/user';
import { PlanProgressBar } from '../components/PlanProgressBar';
import { ScreenHeader } from '../components/ScreenHeader';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { base, spacing, radii, fontFamily } from '../theme';
import type { ReadingPlan, PlanProgress } from '../db/user';

export default function PlanDetailScreen() {
  const navigation = useNavigation<ScreenNavProp<'More', 'PlanDetail'>>();
  const route = useRoute<ScreenRouteProp<'More', 'PlanDetail'>>();
  const { planId } = route.params ?? {};
  const [plan, setPlan] = useState<ReadingPlan | null>(null);
  const [activePlanId, setActivePlanId] = useState<string | null>(null);
  const [progress, setProgress] = useState<PlanProgress[]>([]);
  const [days, setDays] = useState<{ day: number; chapters: string[] }[]>([]);

  const reload = useCallback(async () => {
    const plans = await getPlans();
    const p = plans.find((x) => x.id === planId);
    setPlan(p ?? null);
    if (p) {
      try { setDays(JSON.parse(p.chapters_json)); } catch { setDays([]); }
    }
    const activeId = await getActivePlanId();
    setActivePlanId(activeId);
    if (activeId === planId) setProgress(await getPlanProgress(planId));
  }, [planId]);

  useEffect(() => { reload(); }, [reload]);

  const isActive = activePlanId === planId;
  const completed = progress.filter((p) => p.completed_at).length;

  const handleStart = async () => {
    await startPlan(planId);
    reload();
  };

  const handleAbandon = () => {
    Alert.alert('Abandon Plan', 'Clear all progress?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Abandon', style: 'destructive', onPress: async () => { await abandonPlan(planId); reload(); } },
    ]);
  };

  if (!plan) {
    return (
      <View style={styles.loading}>
        <LoadingSkeleton lines={6} height={16} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topSection}>
        <ScreenHeader title={plan.name} onBack={() => navigation.goBack()} />
        <Text style={styles.description}>{plan.description}</Text>

        {isActive ? (
          <View style={styles.progressBlock}>
            <PlanProgressBar completed={completed} total={progress.length} />
            <TouchableOpacity onPress={handleAbandon} style={styles.abandonLink}>
              <Text style={styles.abandonText}>Abandon plan</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity onPress={handleStart} style={styles.startButton}>
            <Text style={styles.startButtonText}>Start Plan</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={days}
        keyExtractor={(d) => String(d.day)}
        contentContainerStyle={styles.listContent}
        renderItem={({ item: dayData }) => {
          const dayProgress = progress.find((p) => p.day_num === dayData.day);
          const isDone = !!dayProgress?.completed_at;

          return (
            <View style={styles.dayRow} accessibilityLabel={`Day ${dayData.day}${isDone ? ", completed" : ""}`}>
              <Text style={[styles.dayNum, isDone && styles.dayDone]}>
                {isDone ? '✓' : dayData.day}
              </Text>
              <View style={styles.dayChapters}>
                {dayData.chapters.map((ch, i) => (
                  <TouchableOpacity
                    key={i}
                    onPress={() => {
                      const match = ch.match(/^(\w+)_(\d+)$/);
                      if (match) navigation.push('Chapter', {
                        bookId: match[1], chapterNum: parseInt(match[2], 10),
                      });
                    }}
                  >
                    <Text style={styles.chapterLabel}>{ch.replace('_', ' ')}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: base.bg,
  },
  loading: {
    flex: 1,
    backgroundColor: base.bg,
    padding: spacing.lg,
  },
  topSection: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
  },
  description: {
    color: base.textDim,
    fontFamily: fontFamily.body,
    fontSize: 14,
    marginTop: 4,
  },
  progressBlock: {
    marginTop: spacing.md,
  },
  abandonLink: {
    marginTop: spacing.sm,
  },
  abandonText: {
    color: '#e05a6a',
    fontSize: 12,
  },
  startButton: {
    marginTop: spacing.md,
    backgroundColor: base.gold + '30',
    borderRadius: radii.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    alignSelf: 'flex-start' as const,
  },
  startButtonText: {
    color: base.gold,
    fontFamily: fontFamily.uiSemiBold,
    fontSize: 14,
  },
  listContent: {
    padding: spacing.md,
  },
  dayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: base.border + '40',
  },
  dayNum: {
    color: base.textMuted,
    fontSize: 14,
    width: 20,
  },
  dayDone: {
    color: '#4a8a5a',
  },
  dayChapters: {
    flex: 1,
  },
  chapterLabel: {
    color: base.textDim,
    fontFamily: fontFamily.ui,
    fontSize: 13,
  },
});
