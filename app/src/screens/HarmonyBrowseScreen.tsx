/**
 * HarmonyBrowseScreen — Chronological, period-grouped browse of Gospel harmony entries.
 *
 * SectionList grouped by life period, with search and filter pills.
 * Tap entry → HarmonyDetailScreen.
 */

import React from 'react';
import { View, Text, TouchableOpacity, SectionList, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { ScreenNavProp } from '../navigation/types';
import { ScreenHeader } from '../components/ScreenHeader';
import { SearchInput } from '../components/SearchInput';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { GospelDots } from '../components/GospelDots';
import { useHarmonyData, PERIOD_LABELS } from '../hooks/useHarmonyData';
import { useTheme, spacing, radii, fontFamily } from '../theme';

export default function HarmonyBrowseScreen() {
  const { base } = useTheme();
  const navigation = useNavigation<ScreenNavProp<'Explore', 'HarmonyBrowse'>>();
  const {
    sections, periods, loading,
    search, setSearch, periodFilter, setPeriodFilter,
  } = useHarmonyData();

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: base.bg }]}>
        <View style={styles.headerPad}>
          <ScreenHeader title="Harmony of the Gospels" onBack={() => navigation.goBack()} />
        </View>
        <View style={{ padding: spacing.lg }}><LoadingSkeleton lines={6} /></View>
      </SafeAreaView>
    );
  }

  const sectionListData = sections.map((s) => ({
    title: s.label.toUpperCase(),
    data: s.data,
  }));

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: base.bg }]}>
      <View style={styles.headerPad}>
        <ScreenHeader title="Harmony of the Gospels" onBack={() => navigation.goBack()} style={styles.headerSpacing} />
        <View style={{ marginBottom: spacing.sm }}>
          <SearchInput value={search} onChangeText={setSearch} placeholder="Search events..." />
        </View>

        {/* Period filter pills */}
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
      </View>

      <SectionList
        sections={sectionListData}
        keyExtractor={(item) => item.id}
        stickySectionHeadersEnabled
        contentContainerStyle={styles.listPad}
        renderSectionHeader={({ section }) => (
          <View style={[styles.sectionHeader, { borderBottomColor: base.gold + '25', backgroundColor: base.bg }]}>
            <Text style={[styles.sectionHeaderText, { color: base.gold }]}>
              {section.title}
            </Text>
          </View>
        )}
        renderItem={({ item }) => {
          let passages: { book: string; ref: string }[] = [];
          try { passages = JSON.parse(item.passages_json); } catch { /* */ }
          const books = passages.map((p) => p.book);

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
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, { color: base.textMuted }]}>
              No events found
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerPad: { paddingHorizontal: spacing.md, paddingTop: spacing.lg },
  headerSpacing: { marginBottom: spacing.md },
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
  emptyState: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: fontFamily.ui,
    fontSize: 14,
  },
});
