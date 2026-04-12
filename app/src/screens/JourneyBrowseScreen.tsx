/**
 * JourneyBrowseScreen — Full-screen list of all person + concept journeys.
 *
 * Two tabs: People (30 entries) and Concepts (20 entries).
 * Each row shows name, stage/stop count, era/range, and chevron.
 * Taps navigate to PersonJourney or ConceptDetail (journey tab).
 *
 * Part of Journeys on Explore feature.
 */

import React, { useState, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, FlatList, StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ChevronRight } from 'lucide-react-native';
import type { ScreenNavProp, ScreenRouteProp } from '../navigation/types';
import { useJourneyBrowse, type PersonJourneyEntry, type ConceptJourneyEntry } from '../hooks/useJourneyBrowse';
import { ScreenHeader } from '../components/ScreenHeader';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { useTheme, spacing, radii, fontFamily } from '../theme';
import { withErrorBoundary } from '../components/ScreenErrorBoundary';

type Tab = 'people' | 'concepts';

function JourneyBrowseScreen() {
  const { base } = useTheme();
  const navigation = useNavigation<ScreenNavProp<'Explore', 'JourneyBrowse'>>();
  const route = useRoute<ScreenRouteProp<'Explore', 'JourneyBrowse'>>();
  const initialTab = route.params?.tab ?? 'people';
  const [activeTab, setActiveTab] = useState<Tab>(initialTab);
  const { personJourneys, conceptJourneys, isLoading } = useJourneyBrowse();

  const handlePersonPress = useCallback((personId: string) => {
    navigation.navigate('PersonJourney', { personId });
  }, [navigation]);

  const handleConceptPress = useCallback((conceptId: string) => {
    navigation.navigate('ConceptDetail', { conceptId, initialTab: 'journey' });
  }, [navigation]);

  const renderPersonItem = useCallback(({ item }: { item: PersonJourneyEntry }) => (
    <TouchableOpacity
      style={[styles.row, { borderBottomColor: base.border }]}
      onPress={() => handlePersonPress(item.personId)}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`${item.name}, ${item.stageCount} stages`}
    >
      <View style={[styles.avatar, { backgroundColor: base.gold + '18', borderColor: base.gold + '30' }]}>
        <Text style={[styles.avatarText, { color: base.gold }]}>
          {item.name.charAt(0)}
        </Text>
      </View>
      <View style={styles.rowCenter}>
        <Text style={[styles.rowTitle, { color: base.text }]}>{item.name}</Text>
        <Text style={[styles.rowSubtitle, { color: base.textMuted }]}>
          {[item.role, item.era].filter(Boolean).join(' · ')}
        </Text>
      </View>
      <View style={styles.rowRight}>
        <Text style={[styles.countBadge, { color: base.gold }]}>
          {item.stageCount} stages
        </Text>
        <ChevronRight size={14} color={base.textMuted} />
      </View>
    </TouchableOpacity>
  ), [base, handlePersonPress]);

  const renderConceptItem = useCallback(({ item }: { item: ConceptJourneyEntry }) => (
    <TouchableOpacity
      style={[styles.row, { borderBottomColor: base.border }]}
      onPress={() => handleConceptPress(item.conceptId)}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`${item.title}, ${item.stopCount} stops`}
    >
      <View style={[styles.conceptIcon, { backgroundColor: base.gold + '12' }]}>
        <Text style={styles.conceptIconText}>◆</Text>
      </View>
      <View style={styles.rowCenter}>
        <Text style={[styles.rowTitle, { color: base.text }]}>{item.title}</Text>
        {item.firstLabel && item.lastLabel ? (
          <Text style={[styles.rowSubtitle, { color: base.textMuted }]} numberOfLines={1}>
            {item.firstLabel} → {item.lastLabel}
          </Text>
        ) : null}
      </View>
      <View style={styles.rowRight}>
        <Text style={[styles.countBadge, { color: base.gold }]}>
          {item.stopCount} stops
        </Text>
        <ChevronRight size={14} color={base.textMuted} />
      </View>
    </TouchableOpacity>
  ), [base, handleConceptPress]);

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: base.bg }]}>
        <ScreenHeader title="Journeys" />
        <View style={styles.loadingPad}>
          <LoadingSkeleton lines={8} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: base.bg }]}>
      <ScreenHeader title="Journeys" />

      {/* Tab bar */}
      <View style={[styles.tabBar, { borderBottomColor: base.border }]}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'people' && [styles.tabActive, { backgroundColor: base.gold + '15' }]]}
          onPress={() => setActiveTab('people')}
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === 'people' }}
        >
          <Text style={[styles.tabText, { color: base.textMuted }, activeTab === 'people' && { color: base.gold }]}>
            People ({personJourneys.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'concepts' && [styles.tabActive, { backgroundColor: base.gold + '15' }]]}
          onPress={() => setActiveTab('concepts')}
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === 'concepts' }}
        >
          <Text style={[styles.tabText, { color: base.textMuted }, activeTab === 'concepts' && { color: base.gold }]}>
            Concepts ({conceptJourneys.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* List */}
      {activeTab === 'people' ? (
        <FlatList
          data={personJourneys}
          keyExtractor={(item) => item.personId}
          renderItem={renderPersonItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <FlatList
          data={conceptJourneys}
          keyExtractor={(item) => item.conceptId}
          renderItem={renderConceptItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

export default withErrorBoundary(JourneyBrowseScreen);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingPad: {
    padding: spacing.lg,
  },

  // Tab bar
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    paddingHorizontal: spacing.lg,
  },
  tab: {
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    borderRadius: radii.sm,
    marginBottom: -1,
  },
  tabActive: {
    borderRadius: radii.sm,
  },
  tabText: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 13,
  },

  // List
  listContent: {
    paddingBottom: spacing.xxl,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm + 4,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    gap: spacing.sm + 2,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: fontFamily.displaySemiBold,
    fontSize: 16,
  },
  conceptIcon: {
    width: 38,
    height: 38,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  conceptIconText: {
    fontSize: 14,
    color: '#bfa050', // Uses gold directly for the icon — matches brand
  },
  rowCenter: {
    flex: 1,
  },
  rowTitle: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 14,
  },
  rowSubtitle: {
    fontFamily: fontFamily.ui,
    fontSize: 11,
    marginTop: 1,
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  countBadge: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 11,
  },
});
