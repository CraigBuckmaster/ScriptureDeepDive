import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, FlatList, Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { ScreenNavProp, ScreenRouteProp } from '../navigation/types';
import { getPlans, getActivePlanId, getPlanProgress, startPlan, abandonPlan } from '../db/user';
import { PlanProgressBar } from '../components/PlanProgressBar';
import { ScreenHeader } from '../components/ScreenHeader';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { useTheme, spacing, radii, fontFamily } from '../theme';
import type { ReadingPlan, PlanProgress } from '../db/user';
import { withErrorBoundary } from '../components/ScreenErrorBoundary';

function PlanDetailScreen() {
  const { base } = useTheme();
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

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    reload();
  }, [reload]);

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
      <View style={[styles.loading, { backgroundColor: base.bg }]}>
        <LoadingSkeleton lines={6} height={16} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: base.bg }]}>
      <View style={styles.topSection}>
        <ScreenHeader title={plan.name} onBack={() => navigation.goBack()} />
        <Text style={[styles.description, { color: base.textDim }]}>{plan.description}</Text>

        {isActive ? (
          <View style={styles.progressBlock}>
            <PlanProgressBar completed={completed} total={progress.length} />
            <TouchableOpacity onPress={handleAbandon} style={styles.abandonLink}>
              <Text style={[styles.abandonText, { color: base.danger }]}>Abandon plan</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity onPress={handleStart} style={[styles.startButton, { backgroundColor: base.gold + '30' }]}>
            <Text style={[styles.startButtonText, { color: base.gold }]}>Start Plan</Text>
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
            <View style={[styles.dayRow, { borderBottomColor: base.border + '40' }]} accessibilityLabel={`Day ${dayData.day}${isDone ? ", completed" : ""}`}>
              <Text style={[styles.dayNum, { color: base.textMuted }, isDone && { color: base.success }]}>
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
                        planId: isActive ? planId : undefined,
                        planDayNum: isActive ? dayData.day : undefined,
                      });
                    }}
                  >
                    <Text style={[styles.chapterLabel, { color: base.textDim }]}>{ch.replace('_', ' ')}</Text>
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
  },
  loading: {
    flex: 1,
    padding: spacing.lg,
  },
  topSection: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
  },
  description: {
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
    // color set inline via base.danger
    fontSize: 12,
  },
  startButton: {
    marginTop: spacing.md,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    alignSelf: 'flex-start' as const,
  },
  startButtonText: {
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
  },
  dayNum: {
    fontSize: 14,
    width: 20,
  },
  dayDone: {
    // color set inline via base.success
  },
  dayChapters: {
    flex: 1,
  },
  chapterLabel: {
    fontFamily: fontFamily.ui,
    fontSize: 13,
  },
});

export default withErrorBoundary(PlanDetailScreen);
