/**
 * JourneyBrowseScreen — Three-tab browse for all 60 journeys.
 *
 * Tab 1: Lenses — horizontal lens pill row + vertical list grouped by lens
 * Tab 2: People — alphabetical list of 30 person journeys
 * Tab 3: Featured — curated highlights (start here, seasonal, popular)
 *
 * Redesigned for Epic #1379 unified journey model.
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  View, Text, TouchableOpacity, FlatList, StyleSheet, SectionList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ChevronRight, Lock, Compass, Users, Star } from 'lucide-react-native';
import type { ScreenNavProp, ScreenRouteProp } from '../navigation/types';
import { useJourneyBrowse, type JourneyBrowseEntry } from '../hooks/useJourneyBrowse';
import { usePremium } from '../hooks/usePremium';
import { ScreenHeader } from '../components/ScreenHeader';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { UpgradePrompt } from '../components/UpgradePrompt';
import { useTheme, spacing, radii, fontFamily } from '../theme';
import { withErrorBoundary } from '../components/ScreenErrorBoundary';

type Tab = 'lenses' | 'people' | 'featured';

const FEATURED_IDS = ['garden-to-city', 'gospel-resurrections', 'why-does-god-allow-suffering'];
const SEASONAL_IDS = ['holy-week-day-by-day'];
const START_HERE_ID = 'garden-to-city';

function JourneyBrowseScreen() {
  const { base } = useTheme();
  const navigation = useNavigation<ScreenNavProp<'Explore', 'JourneyBrowse'>>();
  const route = useRoute<ScreenRouteProp<'Explore', 'JourneyBrowse'>>();
  const initialTab: Tab = (route.params as { tab?: Tab })?.tab ?? 'lenses';
  const [activeTab, setActiveTab] = useState<Tab>(initialTab);
  const [activeLens, setActiveLens] = useState<string | null>(null);
  const { allJourneys, personJourneys, lensIds, isLoading } = useJourneyBrowse();
  const { isPremium, upgradeRequest, showUpgrade, dismissUpgrade } = usePremium();

  const handlePress = useCallback((entry: JourneyBrowseEntry) => {
    if (!isPremium) {
      showUpgrade('feature', 'Guided Journeys');
      return;
    }
    navigation.navigate('JourneyDetail', { journeyId: entry.id });
  }, [isPremium, showUpgrade, navigation]);

  // Lenses tab data
  const lensFiltered = useMemo(() => {
    if (!activeLens) return allJourneys;
    return allJourneys.filter((j) => j.lensId === activeLens);
  }, [allJourneys, activeLens]);

  // People tab data — alphabetical sections
  const peopleSections = useMemo(() => {
    const map = new Map<string, JourneyBrowseEntry[]>();
    for (const j of personJourneys) {
      const letter = j.title.charAt(0).toUpperCase();
      if (!map.has(letter)) map.set(letter, []);
      map.get(letter)!.push(j);
    }
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([title, data]) => ({ title, data }));
  }, [personJourneys]);

  // Featured tab data
  const featuredJourneys = useMemo(() => allJourneys.filter((j) => FEATURED_IDS.includes(j.id)), [allJourneys]);
  const seasonalJourneys = useMemo(() => allJourneys.filter((j) => SEASONAL_IDS.includes(j.id)), [allJourneys]);
  const startHere = useMemo(() => allJourneys.find((j) => j.id === START_HERE_ID) ?? null, [allJourneys]);

  const renderRow = useCallback((entry: JourneyBrowseEntry) => (
    <TouchableOpacity
      key={entry.id}
      style={[styles.row, { borderBottomColor: base.border }]}
      onPress={() => handlePress(entry)}
      activeOpacity={0.7}
    >
      <View style={styles.rowContent}>
        <Text style={[styles.rowTitle, { color: base.text }]} numberOfLines={1}>{entry.title}</Text>
        {entry.subtitle && (
          <Text style={[styles.rowSubtitle, { color: base.textMuted }]} numberOfLines={1}>{entry.subtitle}</Text>
        )}
        <View style={styles.rowMeta}>
          {entry.lensId && (
            <Text style={[styles.lensPill, { color: base.gold }]}>
              {entry.lensId.replace(/_/g, ' ')}
            </Text>
          )}
          {entry.depth && (
            <Text style={[styles.depthText, { color: base.textMuted }]}>{entry.depth}</Text>
          )}
        </View>
      </View>
      {isPremium ? (
        <ChevronRight size={16} color={base.textMuted} />
      ) : (
        <Lock size={14} color={base.textMuted} />
      )}
    </TouchableOpacity>
  ), [base, handlePress, isPremium]);

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: base.bg }]}>
        <ScreenHeader title="Journeys" onBack={() => navigation.goBack()} />
        <View style={styles.loadingPad}><LoadingSkeleton lines={8} /></View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: base.bg }]}>
      <ScreenHeader title="Journeys" onBack={() => navigation.goBack()} />

      {/* Tab bar */}
      <View style={[styles.tabBar, { borderBottomColor: base.border }]}>
        {([
          { key: 'lenses' as Tab, label: 'Lenses', Icon: Compass },
          { key: 'people' as Tab, label: 'People', Icon: Users },
          { key: 'featured' as Tab, label: 'Featured', Icon: Star },
        ]).map(({ key, label, Icon }) => (
          <TouchableOpacity
            key={key}
            style={[styles.tab, activeTab === key && { borderBottomColor: base.gold, borderBottomWidth: 2 }]}
            onPress={() => setActiveTab(key)}
          >
            <Icon size={14} color={activeTab === key ? base.gold : base.textMuted} />
            <Text style={[styles.tabLabel, { color: activeTab === key ? base.gold : base.textMuted }]}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Lenses tab */}
      {activeTab === 'lenses' && (
        <View style={styles.flex}>
          {/* Lens pill row */}
          <FlatList
            horizontal
            data={[null, ...lensIds]}
            keyExtractor={(item) => item ?? 'all'}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.pillRow}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.pill,
                  { borderColor: (activeLens === item || (item === null && activeLens === null)) ? base.gold : base.border },
                  (activeLens === item || (item === null && activeLens === null)) && { backgroundColor: base.gold + '15' },
                ]}
                onPress={() => setActiveLens(item)}
              >
                <Text style={[styles.pillText, { color: (activeLens === item || (item === null && activeLens === null)) ? base.gold : base.textMuted }]}>
                  {item ? item.replace(/_/g, ' ') : 'All'}
                </Text>
              </TouchableOpacity>
            )}
          />
          <FlatList
            data={lensFiltered}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => renderRow(item)}
            contentContainerStyle={styles.listContent}
          />
        </View>
      )}

      {/* People tab */}
      {activeTab === 'people' && (
        <SectionList
          sections={peopleSections}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => renderRow(item)}
          renderSectionHeader={({ section }) => (
            <View style={[styles.sectionHeader, { backgroundColor: base.bg }]}>
              <Text style={[styles.sectionHeaderText, { color: base.gold }]}>{section.title}</Text>
            </View>
          )}
          stickySectionHeadersEnabled
          contentContainerStyle={styles.listContent}
        />
      )}

      {/* Featured tab */}
      {activeTab === 'featured' && (
        <SectionList
          sections={[
            ...(startHere ? [{ title: 'Start Here', data: [startHere] }] : []),
            ...(seasonalJourneys.length > 0 ? [{ title: 'In Season', data: seasonalJourneys }] : []),
            ...(featuredJourneys.length > 0 ? [{ title: 'Popular', data: featuredJourneys }] : []),
          ]}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => renderRow(item)}
          renderSectionHeader={({ section }) => (
            <View style={styles.featuredHeader}>
              <Text style={[styles.featuredHeaderText, { color: base.text }]}>{section.title}</Text>
            </View>
          )}
          contentContainerStyle={styles.listContent}
        />
      )}

      {upgradeRequest && (
        <UpgradePrompt
          visible
          variant={upgradeRequest.variant}
          featureName={upgradeRequest.featureName}
          onClose={dismissUpgrade}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  loadingPad: { padding: spacing.lg },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: spacing.md,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: spacing.sm,
  },
  tabLabel: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 13,
  },
  pillRow: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: 8,
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radii.pill,
    borderWidth: 1,
  },
  pillText: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 12,
    textTransform: 'capitalize',
  },
  listContent: {
    paddingBottom: spacing.xl * 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowContent: { flex: 1, marginRight: spacing.sm },
  rowTitle: {
    fontFamily: fontFamily.body,
    fontSize: 16,
  },
  rowSubtitle: {
    fontFamily: fontFamily.ui,
    fontSize: 13,
    marginTop: 2,
  },
  rowMeta: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  lensPill: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 11,
    textTransform: 'capitalize',
  },
  depthText: {
    fontFamily: fontFamily.ui,
    fontSize: 11,
  },
  sectionHeader: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  sectionHeaderText: {
    fontFamily: fontFamily.displayMedium,
    fontSize: 14,
    letterSpacing: 0.5,
  },
  featuredHeader: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xs,
  },
  featuredHeaderText: {
    fontFamily: fontFamily.displayMedium,
    fontSize: 16,
  },
});

export default withErrorBoundary(JourneyBrowseScreen);
