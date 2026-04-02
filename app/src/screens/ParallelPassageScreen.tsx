/**
 * ParallelPassageScreen — Browse mode for 53 synoptic entries.
 *
 * SectionList grouped by period (chronological harmony).
 * Category filter pills + search. Tap entry → ParallelDetailScreen.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, SectionList, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { ScreenNavProp } from '../navigation/types';
import { getSynopticEntries } from '../db/content';
import { ScreenHeader } from '../components/ScreenHeader';
import { SearchInput } from '../components/SearchInput';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { GospelDots } from '../components/GospelDots';
import { useTheme, spacing, radii, fontFamily } from '../theme';
import type { SynopticEntry } from '../types';
import { logger } from '../utils/logger';

const CATEGORY_LABELS: Record<string, string> = {
  all: 'All',
  gospel: 'Gospels',
  'gospel-john': 'John',
  'gospel-luke': 'Luke',
  'ot-parallel': 'OT Parallels',
};

const PERIOD_ORDER = [
  'early_ministry', 'galilean', 'later_judean', 'journey',
  'passion', 'resurrection', 'ot',
];

const PERIOD_LABELS: Record<string, string> = {
  early_ministry: 'John the Baptist & Early Ministry',
  galilean: 'Galilean Ministry',
  later_judean: 'Later Judean Ministry',
  journey: 'Journey to Jerusalem',
  passion: 'Passion Week',
  resurrection: 'Resurrection & Ascension',
  ot: 'Old Testament Parallels',
};

export default function ParallelPassageScreen() {
  const { base } = useTheme();
  const navigation = useNavigation<ScreenNavProp<'Explore', 'ParallelPassage'>>();
  const [entries, setEntries] = useState<SynopticEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [catFilter, setCatFilter] = useState<string>('all');
  const [search, setSearch] = useState('');

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

  const sections = useMemo(() => {
    const groups = new Map<string, SynopticEntry[]>();
    for (const entry of filtered) {
      const period = entry.period ?? 'ot';
      if (!groups.has(period)) groups.set(period, []);
      groups.get(period)!.push(entry);
    }
    return PERIOD_ORDER
      .filter((p) => groups.has(p))
      .map((p) => ({ title: PERIOD_LABELS[p] ?? p, data: groups.get(p)! }));
  }, [filtered]);

  const categories = useMemo(() => {
    const cats = new Set(entries.map((e) => e.category).filter(Boolean));
    return ['all', ...cats];
  }, [entries]);

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: base.bg }]}>
        <View style={styles.headerPad}>
          <ScreenHeader title="Parallel Passages" onBack={() => navigation.goBack()} />
        </View>
        <View style={{ padding: spacing.lg }}><LoadingSkeleton lines={6} /></View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: base.bg }]}>
      <View style={styles.headerPad}>
        <ScreenHeader title="Parallel Passages" onBack={() => navigation.goBack()} style={styles.headerSpacing} />
        <View style={{ marginBottom: spacing.sm }}>
          <SearchInput value={search} onChangeText={setSearch} placeholder="Search passages..." />
        </View>

        {/* Category filter pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillRow}>
          {categories.map((cat) => {
            const active = catFilter === cat;
            return (
              <TouchableOpacity
                key={cat ?? 'all'}
                onPress={() => setCatFilter(cat ?? 'all')}
                style={[styles.pill, { borderColor: base.border }, active && { borderColor: base.gold + '55', backgroundColor: base.gold + '12' }]}
              >
                <Text style={[styles.pillText, { color: base.textMuted }, active && { color: base.gold }]}>
                  {CATEGORY_LABELS[cat!] ?? cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listPad}
        renderSectionHeader={({ section }) => (
          <View style={[styles.sectionHeader, { borderBottomColor: base.gold + '25' }]}>
            <Text style={[styles.sectionHeaderText, { color: base.gold }]}>
              {section.title}
            </Text>
          </View>
        )}
        renderItem={({ item }) => {
          let passages: { book: string; ref: string }[] = [];
          try { passages = JSON.parse(item.passages_json); } catch { /* */ }
          const books = passages.map((p) => p.book);
          const isOT = item.category === 'ot-parallel';
          const refSummary = passages.map((p) => p.ref).join(' \u00b7 ');

          return (
            <TouchableOpacity
              onPress={() => navigation.navigate('ParallelDetail', { entryId: item.id })}
              activeOpacity={0.7}
              style={[styles.entryRow, { borderBottomColor: base.border + '40' }]}
            >
              <Text style={[styles.entryTitle, { color: base.text }]}>{item.title}</Text>
              <GospelDots books={books} isOT={isOT} />
              <Text style={[styles.entryRefs, { color: base.textMuted }]} numberOfLines={1}>
                {refSummary}
              </Text>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, { color: base.textMuted }]}>
              No passages found
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
  entryTitle: {
    fontFamily: fontFamily.displayMedium,
    fontSize: 14,
  },
  entryRefs: {
    fontFamily: fontFamily.ui,
    fontSize: 11,
    marginTop: 4,
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
