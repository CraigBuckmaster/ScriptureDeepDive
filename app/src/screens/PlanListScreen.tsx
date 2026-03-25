import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getPlans, getActivePlanId, getPlanProgress } from '../db/user';
import { PlanProgressBar } from '../components/PlanProgressBar';
import { ScreenHeader } from '../components/ScreenHeader';
import { base, spacing, radii } from '../theme';
import type { ReadingPlan, PlanProgress } from '../db/user';

export default function PlanListScreen() {
  const navigation = useNavigation<any>();
  const [plans, setPlans] = useState<ReadingPlan[]>([]);
  const [activePlanId, setActivePlanId] = useState<string | null>(null);
  const [progress, setProgress] = useState<PlanProgress[]>([]);

  useEffect(() => {
    getPlans().then(setPlans);
    getActivePlanId().then(async (id) => {
      setActivePlanId(id);
      if (id) setProgress(await getPlanProgress(id));
    });
  }, []);

  const completed = progress.filter((p) => p.completed_at).length;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: base.bg }}>
      <ScreenHeader
        title="Reading Plans"
        onBack={() => navigation.goBack()}
        style={{ paddingHorizontal: spacing.md, paddingTop: spacing.lg, paddingBottom: spacing.md }}
      />

      {/* Active plan */}
      {activePlanId && plans.find((p) => p.id === activePlanId) && (
        <TouchableOpacity
          onPress={() => navigation.navigate('PlanDetail', { planId: activePlanId })}
          style={{ marginHorizontal: spacing.md, marginBottom: spacing.lg, backgroundColor: base.bgElevated,
            borderWidth: 1, borderColor: base.gold + '40', borderRadius: radii.md, padding: spacing.md }}
        >
          <Text style={{ color: base.textMuted, fontFamily: 'Cinzel_400Regular', fontSize: 9, letterSpacing: 0.5 }}>
            ACTIVE PLAN
          </Text>
          <Text style={{ color: base.text, fontFamily: 'Cinzel_500Medium', fontSize: 16, marginTop: 4 }}>
            {plans.find((p) => p.id === activePlanId)?.name}
          </Text>
          <View style={{ marginTop: spacing.sm }}>
            <PlanProgressBar completed={completed} total={progress.length} />
          </View>
        </TouchableOpacity>
      )}

      <FlatList
        data={plans}
        keyExtractor={(p) => p.id}
        contentContainerStyle={{ paddingHorizontal: spacing.md }}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => navigation.navigate('PlanDetail', { planId: item.id })}
            style={{ paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: base.border + '40' }}
          >
            <Text style={{ color: base.text, fontFamily: 'Cinzel_500Medium', fontSize: 14 }}>{item.name}</Text>
            <Text style={{ color: base.textDim, fontFamily: 'EBGaramond_400Regular', fontSize: 13, marginTop: 4 }}>
              {item.description}
            </Text>
            <Text style={{ color: base.textMuted, fontSize: 11, marginTop: 4 }}>
              {item.total_days} days
              {item.id === activePlanId ? ' · Active' : ''}
            </Text>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}
