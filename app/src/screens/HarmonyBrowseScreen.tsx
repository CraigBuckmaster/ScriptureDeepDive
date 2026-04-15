/**
 * HarmonyBrowseScreen — Chronological, period-grouped browse of Gospel harmony entries.
 *
 * SectionList grouped by life period, with search and filter pills.
 * Tap entry -> HarmonyDetailScreen.
 */

import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { ScreenNavProp } from '../navigation/types';
import { GospelDots } from '../components/GospelDots';
import { BrowseScreenTemplate } from '../components/BrowseScreenTemplate';
import { useHarmonyData, PERIOD_LABELS } from '../hooks/useHarmonyData';
import { useTheme, spacing, radii, fontFamily } from '../theme';
import { withErrorBoundary } from '../components/ScreenErrorBoundary';
import type { HarmonyEntry } from '../types';

function HarmonyBrowseScreen() {
  const { base } = useTheme();
  const navigation = useNavigation<ScreenNavProp<'Explore', 'HarmonyBrowse'>>();
  const {
    sections, periods, loading,
    search, setSearch, periodFilter, setPeriodFilter,
  } = useHarmonyData();

  const sectionListData = sections.map((s) => ({
    title: s.label.toUpperCase(),
    data: s.data,
  }));

  const filterBar = (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillRow}>
      {['all', ...periods].map((p) => {
        const active = periodFilter === p;
        const label = p === 'all' ? 'All' : (PERIOD_LABELS[p] ?? p);
        return (
          <TouchableOpacity
            key={p}
            onPress={() => setPeriodFilter(p)}
            style={[styles.pill, { borderColor: base.border }, active && { borderColor: base.gold + '55', backgroundColor: base.gold + '12' }]}
          >
            <Text style={[styles.pillText, { color: base.textMuted }, active && { color: base.gold }]}>
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );

  return (
    <BrowseScreenTemplate
      title="Harmony of the Gospels"
      loading={loading}
      search={search}
      onSearchChange={setSearch}
      searchPlaceholder="Search events..."
      filterBar={filterBar}
      mode="section"
      sections={sectionListData}
      keyExtractor={(item: HarmonyEntry) => item.id}
      renderSectionHeader={({ section }) => (
        <View style={[styles.sectionHeader, { borderBottomColor: base.gold + '25', backgroundColor: base.bg }]}>
          <Text style={[styles.sectionHeaderText, { color: base.gold }]}>
            {section.title}
          </Text>
        </View>
      )}
      renderItem={({ item }: { item: HarmonyEntry }) => {
        let passages: { book: string; ref: string }[] = [];
        try { passages = JSON.parse(item.passages_json); } catch { /* */ }
        const books = passages.map((p: { book: string; ref: string }) => p.book);

        let diffCount = 0;
        try {
          const diffs = JSON.parse(item.diff_annotations_json || '[]');
          diffCount = diffs.length;
        } catch { /* */ }

        return (
          <TouchableOpacity
            onPress={() => navigation.push('HarmonyDetail', { entryId: item.id })}
            activeOpacity={0.7}
            style={[styles.entryRow, { borderBottomColor: base.border + '40' }]}
          >
            <View style={styles.entryTitleRow}>
              <Text style={[styles.entryTitle, { color: base.text }]}>{item.title}</Text>
              {diffCount > 0 && (
                <Text style={[styles.diffBadge, { color: base.gold }]}>
                  {diffCount} {'\u25B3'}
                </Text>
              )}
            </View>
            <GospelDots books={books} />
          </TouchableOpacity>
        );
      }}
      emptyMessage="No events found"
      contentContainerStyle={styles.listPad}
    />
  );
}

const styles = StyleSheet.create({
  pillRow: { gap: spacing.xs, marginBottom: spacing.md },
  pill: {
    borderWidth: 1,
    borderRadius: radii.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  pillText: {
    fontFamily: fontFamily.display,
    fontSize: 10,
    letterSpacing: 0.3,
  },
  listPad: { paddingHorizontal: spacing.md },
  sectionHeader: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.xs,
    borderBottomWidth: 1,
    marginBottom: spacing.xs,
  },
  sectionHeaderText: {
    fontFamily: fontFamily.display,
    fontSize: 10,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  entryRow: {
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  entryTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  entryTitle: {
    fontFamily: fontFamily.displayMedium,
    fontSize: 14,
    flex: 1,
  },
  diffBadge: {
    fontFamily: fontFamily.ui,
    fontSize: 9,
    marginLeft: spacing.sm,
  },
});

export default withErrorBoundary(HarmonyBrowseScreen);
