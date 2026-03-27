/**
 * ParallelPassageScreen — 45 synoptic entries: browse + tabbed compare.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, FlatList, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { getSynopticEntries } from '../db/content';
import { resolveVerseText, parseReference } from '../utils/verseResolver';
import { useSettingsStore } from '../stores';
import { ScreenHeader } from '../components/ScreenHeader';
import { SearchInput } from '../components/SearchInput';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { base, spacing, radii, fontFamily, MIN_TOUCH_TARGET } from '../theme';
import type { SynopticEntry } from '../types';
import { logger } from '../utils/logger';

const CATEGORY_LABELS: Record<string, string> = {
  'gospel': 'Synoptic Gospels',
  'gospel-luke': 'Luke Special',
  'gospel-john': 'John Special',
  'ot-parallel': 'OT Parallels',
};

export default function ParallelPassageScreen() {
  const navigation = useNavigation<any>();
  const [entries, setEntries] = useState<SynopticEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [catFilter, setCatFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [compareEntry, setCompareEntry] = useState<SynopticEntry | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [resolvedTexts, setResolvedTexts] = useState<Record<string, string[]>>({});
  const translation = useSettingsStore((s) => s.translation);

  useEffect(() => {
    getSynopticEntries().then((e) => { setEntries(e); setIsLoading(false); });
  }, []);

  const filtered = useMemo(() => {
    let list = entries;
    if (catFilter !== 'all') list = list.filter((e) => e.category === catFilter);
    if (search.length >= 2) {
      const q = search.toLowerCase();
      list = list.filter((e) => e.title.toLowerCase().includes(q));
    }
    return list;
  }, [entries, catFilter, search]);

  // Load verse texts when comparing
  useEffect(() => {
    if (!compareEntry) return;
    let passages: { book: string; ref: string }[] = [];
    try { passages = JSON.parse(compareEntry.passages_json); } catch (err) { logger.warn('ParallelPassageScreen', 'Operation failed', err); }

    const loadAll = async () => {
      const texts: Record<string, string[]> = {};
      for (const p of passages) {
        const parsed = parseReference(`${p.book} ${p.ref}`);
        if (parsed) {
          texts[p.book] = await resolveVerseText(parsed, translation);
        }
      }
      setResolvedTexts(texts);
    };
    loadAll();
  }, [compareEntry, translation]);

  // LOADING
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.browseHeader}>
          <ScreenHeader title="Parallel Passages" onBack={() => navigation.goBack()} />
        </View>
        <View style={{ padding: spacing.lg }}><LoadingSkeleton lines={6} /></View>
      </SafeAreaView>
    );
  }

  // BROWSE MODE
  if (!compareEntry) {
    const categories = ['all', ...new Set(entries.map((e) => e.category).filter(Boolean))];

    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.browseHeader}>
          <ScreenHeader
            title="Parallel Passages"
            onBack={() => navigation.goBack()}
            style={styles.headerSpacing}
          />

          <View style={{ marginBottom: spacing.sm }}>
            <SearchInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search passages..."
            />
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
            {categories.map((cat) => (
              <TouchableOpacity key={cat ?? 'all'} onPress={() => setCatFilter(cat ?? 'all')}>
                <Text style={[
                  styles.filterLabel,
                  catFilter === cat && styles.filterLabelActive,
                ]}>
                  {cat === 'all' ? 'All' : (CATEGORY_LABELS[cat!] ?? cat)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <FlatList
          data={filtered}
          keyExtractor={(e) => e.id}
          contentContainerStyle={styles.listPadding}
          renderItem={({ item }) => {
            let passages: { book: string; ref: string }[] = [];
            try { passages = JSON.parse(item.passages_json); } catch (err) { logger.warn('ParallelPassageScreen', 'Operation failed', err); }

            return (
              <TouchableOpacity
                onPress={() => { setCompareEntry(item); setActiveTab(0); }}
                style={styles.entryRow}
              >
                <Text style={styles.entryTitle}>{item.title}</Text>
                <Text style={styles.entryRefs}>
                  {passages.map((p) => `${p.book} ${p.ref}`).join(' · ')}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </SafeAreaView>
    );
  }

  // COMPARE MODE (tabbed)
  let passages: { book: string; ref: string }[] = [];
  try { passages = JSON.parse(compareEntry.passages_json); } catch (err) { logger.warn('ParallelPassageScreen', 'Operation failed', err); }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.compareHeader}>
        <ScreenHeader
          title={compareEntry.title}
          onBack={() => setCompareEntry(null)}
          backLabel="Back to list"
        />
      </View>

      {/* Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabRow}>
        {passages.map((p, i) => (
          <TouchableOpacity
            key={i}
            onPress={() => setActiveTab(i)}
            style={[styles.tab, activeTab === i && styles.tabActive]}
          >
            <Text style={[styles.tabLabel, activeTab === i && styles.tabLabelActive]}>
              {p.book}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Verse text */}
      <ScrollView style={styles.verseScroll} contentContainerStyle={styles.verseContent}>
        <Text style={styles.verseRef}>
          {passages[activeTab]?.book} {passages[activeTab]?.ref}
        </Text>
        {(resolvedTexts[passages[activeTab]?.book] ?? []).map((text, i) => (
          <Text key={i} style={styles.verseText}>{text}</Text>
        ))}
        {!resolvedTexts[passages[activeTab]?.book] && (
          <Text style={styles.versePlaceholder}>
            Loading or not available in current content...
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: base.bg,
  },
  browseHeader: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
  },
  headerSpacing: {
    marginBottom: spacing.md,
  },
  filterRow: {
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  filterLabel: {
    color: base.textMuted,
    fontFamily: fontFamily.display,
    fontSize: 10,
    paddingBottom: 4,
    paddingHorizontal: 4,
  },
  filterLabelActive: {
    color: base.gold,
    borderBottomWidth: 2,
    borderBottomColor: base.gold,
  },
  listPadding: {
    paddingHorizontal: spacing.md,
  },
  entryRow: {
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: base.border + '40',
  },
  entryTitle: {
    color: base.text,
    fontFamily: fontFamily.displayMedium,
    fontSize: 14,
  },
  entryRefs: {
    color: base.textMuted,
    fontFamily: fontFamily.ui,
    fontSize: 11,
    marginTop: 4,
  },
  compareHeader: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  tabRow: {
    paddingHorizontal: spacing.md,
    gap: spacing.xs,
    paddingVertical: spacing.sm,
  },
  tab: {
    borderWidth: 1,
    borderColor: base.border,
    borderRadius: radii.sm,
    paddingHorizontal: 12,
    minHeight: MIN_TOUCH_TARGET,
    justifyContent: 'center',
  },
  tabActive: {
    backgroundColor: base.gold + '30',
    borderColor: base.gold,
  },
  tabLabel: {
    color: base.textMuted,
    fontFamily: fontFamily.display,
    fontSize: 11,
  },
  tabLabelActive: {
    color: base.gold,
  },
  verseScroll: {
    flex: 1,
  },
  verseContent: {
    padding: spacing.md,
  },
  verseRef: {
    color: base.gold,
    fontFamily: fontFamily.uiSemiBold,
    fontSize: 12,
    marginBottom: spacing.sm,
  },
  verseText: {
    color: base.text,
    fontFamily: fontFamily.body,
    fontSize: 16,
    lineHeight: 26,
    marginBottom: 4,
  },
  versePlaceholder: {
    color: base.textMuted,
    fontFamily: fontFamily.bodyItalic,
    fontSize: 14,
  },
});
