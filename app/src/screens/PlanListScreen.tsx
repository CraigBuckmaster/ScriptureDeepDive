import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { ScreenNavProp } from '../navigation/types';
import { getPlans, getActivePlanId, getPlanProgress } from '../db/user';
import { PlanProgressBar } from '../components/PlanProgressBar';
import { BadgeChip } from '../components/BadgeChip';
import { ScreenHeader } from '../components/ScreenHeader';
import { base, spacing, radii, fontFamily } from '../theme';
import type { ReadingPlan, PlanProgress } from '../db/user';

export default function PlanListScreen() {
  const navigation = useNavigation<ScreenNavProp<'More', 'PlanList'>>();
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
    <SafeAreaView style={styles.container}>
      <ScreenHeader
        title="Reading Plans"
        onBack={() => navigation.goBack()}
        style={styles.header}
      />

      {/* Active plan */}
      {activePlanId && plans.find((p) => p.id === activePlanId) && (
        <TouchableOpacity
          onPress={() => navigation.navigate('PlanDetail', { planId: activePlanId })}
          style={styles.activeCard}
        >
          <Text style={styles.activeLabel}>ACTIVE PLAN</Text>
          <Text style={styles.activeName}>
            {plans.find((p) => p.id === activePlanId)?.name}
          </Text>
          <View style={styles.progressWrap}>
            <PlanProgressBar completed={completed} total={progress.length} />
          </View>
        </TouchableOpacity>
      )}

      <FlatList
        data={plans}
        keyExtractor={(p) => p.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => navigation.navigate('PlanDetail', { planId: item.id })}
            style={styles.row}
            accessibilityLabel={`${item.name}, ${item.total_days} days`}
            accessibilityRole="button"
          >
            <Text style={styles.planName}>{item.name}</Text>
            <Text style={styles.planDesc}>{item.description}</Text>
            <View style={styles.planMetaRow}>
              <Text style={styles.planMeta}>{item.total_days} days</Text>
              {item.id === activePlanId && <BadgeChip label="Active" color={base.gold} />}
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: base.bg,
  },
  header: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  activeCard: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.lg,
    backgroundColor: base.bgElevated,
    borderWidth: 1,
    borderColor: base.gold + '40',
    borderRadius: radii.md,
    padding: spacing.md,
  },
  activeLabel: {
    color: base.textMuted,
    fontFamily: fontFamily.display,
    fontSize: 9,
    letterSpacing: 0.5,
  },
  activeName: {
    color: base.text,
    fontFamily: fontFamily.displayMedium,
    fontSize: 16,
    marginTop: 4,
  },
  progressWrap: {
    marginTop: spacing.sm,
  },
  listContent: {
    paddingHorizontal: spacing.md,
  },
  row: {
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: base.border + '40',
  },
  planName: {
    color: base.text,
    fontFamily: fontFamily.displayMedium,
    fontSize: 14,
  },
  planDesc: {
    color: base.textDim,
    fontFamily: fontFamily.body,
    fontSize: 13,
    marginTop: 4,
  },
  planMeta: {
    color: base.textMuted,
    fontSize: 11,
  },
  planMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: 4,
  },
});
