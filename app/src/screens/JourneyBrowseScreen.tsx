/**
 * JourneyBrowseScreen — Full-screen list of all person + concept journeys.
 *
 * Two tabs: People (30 entries) and Concepts (20 entries).
 * Each row shows name, stage/stop count, era/range, and chevron.
 * Taps navigate to PersonJourney or ConceptDetail (journey tab).
 *
 * Part of Journeys on Explore feature.
 *
 * Card #1359 (UI polish phase 2): migrated to shared BrowseScreenTemplate.
 * The People/Concepts tab switcher now uses BrowseFilterPill for consistency
 * with other browse screens; row-level layout is preserved.
 */

import React, { useState, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ChevronRight } from 'lucide-react-native';
import type { ScreenNavProp, ScreenRouteProp } from '../navigation/types';
import { useJourneyBrowse, type PersonJourneyEntry, type ConceptJourneyEntry } from '../hooks/useJourneyBrowse';
import {
  BrowseScreenTemplate,
  BrowseFilterPill,
} from '../components/BrowseScreenTemplate';
import { useTheme, spacing, radii, fontFamily } from '../theme';
import { withErrorBoundary } from '../components/ScreenErrorBoundary';

type Tab = 'people' | 'concepts';
type AnyJourneyEntry = PersonJourneyEntry | ConceptJourneyEntry;

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

  const renderPersonItem = useCallback((item: PersonJourneyEntry) => (
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

  const renderConceptItem = useCallback((item: ConceptJourneyEntry) => (
    <TouchableOpacity
      style={[styles.row, { borderBottomColor: base.border }]}
      onPress={() => handleConceptPress(item.conceptId)}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`${item.title}, ${item.stopCount} stops`}
    >
      <View style={[styles.conceptIcon, { backgroundColor: base.gold + '12' }]}>
        <Text style={[styles.conceptIconText, { color: base.gold }]}>◆</Text>
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

  const data: AnyJourneyEntry[] = activeTab === 'people' ? personJourneys : conceptJourneys;

  const renderItem = useCallback(({ item }: { item: AnyJourneyEntry }) => {
    if (activeTab === 'people') {
      return renderPersonItem(item as PersonJourneyEntry);
    }
    return renderConceptItem(item as ConceptJourneyEntry);
  }, [activeTab, renderPersonItem, renderConceptItem]);

  const keyExtractor = useCallback((item: AnyJourneyEntry) => {
    return activeTab === 'people'
      ? (item as PersonJourneyEntry).personId
      : (item as ConceptJourneyEntry).conceptId;
  }, [activeTab]);

  const filterBar = (
    <View style={styles.tabRow}>
      <BrowseFilterPill
        label={`People (${personJourneys.length})`}
        active={activeTab === 'people'}
        onPress={() => setActiveTab('people')}
        role="tab"
      />
      <BrowseFilterPill
        label={`Concepts (${conceptJourneys.length})`}
        active={activeTab === 'concepts'}
        onPress={() => setActiveTab('concepts')}
        role="tab"
      />
    </View>
  );

  return (
    <BrowseScreenTemplate
      title="Journeys"
      loading={isLoading}
      filterBar={filterBar}
      data={data}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      emptyMessage={activeTab === 'people' ? 'No journeys available.' : 'No concept journeys available.'}
      contentContainerStyle={styles.listContent}
    />
  );
}

export default withErrorBoundary(JourneyBrowseScreen);

const styles = StyleSheet.create({
  tabRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingBottom: spacing.md,
  },
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
