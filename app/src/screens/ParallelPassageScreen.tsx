/**
 * ParallelPassageScreen — 45 synoptic entries: browse + tabbed compare.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, SafeAreaView, ScrollView } from 'react-native';
import { getSynopticEntries } from '../db/content';
import { resolveVerseText, parseReference } from '../utils/verseResolver';
import { useSettingsStore } from '../stores';
import { base, spacing, radii, MIN_TOUCH_TARGET } from '../theme';
import type { SynopticEntry } from '../types';

const CATEGORY_LABELS: Record<string, string> = {
  'gospel': 'Synoptic Gospels',
  'gospel-luke': 'Luke Special',
  'gospel-john': 'John Special',
  'ot-parallel': 'OT Parallels',
};

export default function ParallelPassageScreen() {
  const [entries, setEntries] = useState<SynopticEntry[]>([]);
  const [catFilter, setCatFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [compareEntry, setCompareEntry] = useState<SynopticEntry | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [resolvedTexts, setResolvedTexts] = useState<Record<string, string[]>>({});
  const translation = useSettingsStore((s) => s.translation);

  useEffect(() => {
    getSynopticEntries().then(setEntries);
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
    try { passages = JSON.parse(compareEntry.passages_json); } catch {}

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

  // BROWSE MODE
  if (!compareEntry) {
    const categories = ['all', ...new Set(entries.map((e) => e.category).filter(Boolean))];

    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: base.bg }}>
        <View style={{ paddingHorizontal: spacing.md, paddingTop: spacing.lg }}>
          <Text style={{ color: base.gold, fontFamily: 'Cinzel_600SemiBold', fontSize: 22, marginBottom: spacing.md }}>
            Parallel Passages
          </Text>

          <TextInput
            value={search} onChangeText={setSearch}
            placeholder="Search passages..."
            placeholderTextColor={base.textMuted}
            style={{
              backgroundColor: base.bgElevated, color: base.text,
              fontFamily: 'SourceSans3_400Regular', fontSize: 14,
              borderRadius: radii.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
              borderWidth: 1, borderColor: base.border, marginBottom: spacing.sm,
            }}
          />

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.xs, marginBottom: spacing.md }}>
            {categories.map((cat) => (
              <TouchableOpacity key={cat ?? 'all'} onPress={() => setCatFilter(cat ?? 'all')}>
                <Text style={{
                  color: catFilter === cat ? base.gold : base.textMuted,
                  fontFamily: 'Cinzel_400Regular', fontSize: 10,
                  borderBottomWidth: catFilter === cat ? 2 : 0,
                  borderBottomColor: base.gold, paddingBottom: 4, paddingHorizontal: 4,
                }}>
                  {cat === 'all' ? 'All' : (CATEGORY_LABELS[cat!] ?? cat)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <FlatList
          data={filtered}
          keyExtractor={(e) => e.id}
          contentContainerStyle={{ paddingHorizontal: spacing.md }}
          renderItem={({ item }) => {
            let passages: { book: string; ref: string }[] = [];
            try { passages = JSON.parse(item.passages_json); } catch {}

            return (
              <TouchableOpacity
                onPress={() => { setCompareEntry(item); setActiveTab(0); }}
                style={{
                  paddingVertical: spacing.md,
                  borderBottomWidth: 1, borderBottomColor: base.border + '40',
                }}
              >
                <Text style={{ color: base.text, fontFamily: 'Cinzel_500Medium', fontSize: 14 }}>
                  {item.title}
                </Text>
                <Text style={{ color: base.textMuted, fontFamily: 'SourceSans3_400Regular', fontSize: 11, marginTop: 4 }}>
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
  try { passages = JSON.parse(compareEntry.passages_json); } catch {}

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: base.bg }}>
      {/* Header */}
      <View style={{ paddingHorizontal: spacing.md, paddingTop: spacing.md }}>
        <TouchableOpacity onPress={() => setCompareEntry(null)}>
          <Text style={{ color: base.gold, fontSize: 14 }}>← Back</Text>
        </TouchableOpacity>
        <Text style={{ color: base.text, fontFamily: 'Cinzel_500Medium', fontSize: 16, marginTop: spacing.sm }}>
          {compareEntry.title}
        </Text>
      </View>

      {/* Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: spacing.md, gap: spacing.xs, paddingVertical: spacing.sm }}>
        {passages.map((p, i) => (
          <TouchableOpacity
            key={i}
            onPress={() => setActiveTab(i)}
            style={{
              backgroundColor: activeTab === i ? base.gold + '30' : 'transparent',
              borderWidth: 1, borderColor: activeTab === i ? base.gold : base.border,
              borderRadius: radii.sm, paddingHorizontal: 12, minHeight: MIN_TOUCH_TARGET,
              justifyContent: 'center',
            }}
          >
            <Text style={{
              color: activeTab === i ? base.gold : base.textMuted,
              fontFamily: 'Cinzel_400Regular', fontSize: 11,
            }}>
              {p.book}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Verse text */}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: spacing.md }}>
        <Text style={{ color: base.gold, fontFamily: 'SourceSans3_600SemiBold', fontSize: 12, marginBottom: spacing.sm }}>
          {passages[activeTab]?.book} {passages[activeTab]?.ref}
        </Text>
        {(resolvedTexts[passages[activeTab]?.book] ?? []).map((text, i) => (
          <Text key={i} style={{ color: base.text, fontFamily: 'EBGaramond_400Regular', fontSize: 16, lineHeight: 26, marginBottom: 4 }}>
            {text}
          </Text>
        ))}
        {!resolvedTexts[passages[activeTab]?.book] && (
          <Text style={{ color: base.textMuted, fontFamily: 'EBGaramond_400Regular_Italic', fontSize: 14 }}>
            Loading or not available in current content...
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
