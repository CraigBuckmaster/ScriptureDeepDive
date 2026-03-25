import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, FlatList, SafeAreaView, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { getPlans, getActivePlanId, getPlanProgress, startPlan, completePlanDay, abandonPlan } from '../db/user';
import { PlanProgressBar } from '../components/PlanProgressBar';
import { ScreenHeader } from '../components/ScreenHeader';
import { base, spacing, radii } from '../theme';
import type { ReadingPlan, PlanProgress } from '../db/user';

export default function PlanDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
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

  if (!plan) return <View style={{ flex: 1, backgroundColor: base.bg }} />;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: base.bg }}>
      <View style={{ paddingHorizontal: spacing.md, paddingTop: spacing.lg }}>
        <ScreenHeader title={plan.name} onBack={() => navigation.goBack()} />
        <Text style={{ color: base.textDim, fontFamily: 'EBGaramond_400Regular', fontSize: 14, marginTop: 4 }}>
          {plan.description}
        </Text>

        {isActive ? (
          <View style={{ marginTop: spacing.md }}>
            <PlanProgressBar completed={completed} total={progress.length} />
            <TouchableOpacity onPress={handleAbandon} style={{ marginTop: spacing.sm }}>
              <Text style={{ color: '#e05a6a', fontSize: 12 }}>Abandon plan</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            onPress={handleStart}
            style={{ marginTop: spacing.md, backgroundColor: base.gold + '30', borderRadius: radii.sm,
              paddingHorizontal: spacing.md, paddingVertical: spacing.sm, alignSelf: 'flex-start' }}
          >
            <Text style={{ color: base.gold, fontFamily: 'SourceSans3_600SemiBold', fontSize: 14 }}>Start Plan</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={days}
        keyExtractor={(d) => String(d.day)}
        contentContainerStyle={{ padding: spacing.md }}
        renderItem={({ item: dayData }) => {
          const dayProgress = progress.find((p) => p.day_num === dayData.day);
          const isDone = !!dayProgress?.completed_at;

          return (
            <View style={{
              flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
              paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: base.border + '40',
            }}>
              <Text style={{ color: isDone ? '#4a8a5a' : base.textMuted, fontSize: 14, width: 20 }}>
                {isDone ? '✓' : dayData.day}
              </Text>
              <View style={{ flex: 1 }}>
                {dayData.chapters.map((ch, i) => (
                  <TouchableOpacity
                    key={i}
                    onPress={() => {
                      const match = ch.match(/^(\w+)_(\d+)$/);
                      if (match) navigation.navigate('ReadTab', {
                        screen: 'Chapter', params: { bookId: match[1], chapterNum: parseInt(match[2], 10) },
                      });
                    }}
                  >
                    <Text style={{ color: base.textDim, fontFamily: 'SourceSans3_400Regular', fontSize: 13 }}>
                      {ch.replace('_', ' ')}
                    </Text>
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
