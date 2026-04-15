/**
 * ScholarBrowseScreen — Grid of 54 scholar cards, filterable by tradition.
 *
 * Glorify polish: neutral cards with gold accents, no tradition-based colors.
 */

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { ScreenNavProp } from '../navigation/types';
import { useScholars } from '../hooks/useScholars';
import type { Scholar } from '../types';
import { BrowseScreenTemplate } from '../components/BrowseScreenTemplate';
import { useSettingsStore } from '../stores';
import { useTheme, spacing, radii, fontFamily } from '../theme';
import { logger } from '../utils/logger';
import { withErrorBoundary } from '../components/ScreenErrorBoundary';

function ScholarBrowseScreen() {
  const { base } = useTheme();
  const navigation = useNavigation<ScreenNavProp<'Explore', 'ScholarBrowse'>>();
  const { scholars, isLoading } = useScholars();
  const [search, setSearch] = useState('');
  const [tradition, setTradition] = useState<string>('all');

  // Mark getting-started checklist item
  useEffect(() => { useSettingsStore.getState().markGettingStartedDone('meet_scholars'); }, []);

  const broadTradition = (t: string | null | undefined): string => {
    if (!t) return '';
    const first = t.split(/\s*[–—\-,:(]\s*/)[0].trim();
    return first;
  };

  const traditions = useMemo(() => {
    const set = new Set<string>();
    for (const s of scholars) {
      const broad = broadTradition(s.tradition);
      if (broad) set.add(broad);
    }
    return ['all', ...Array.from(set).sort()];
  }, [scholars]);

  const filtered = useMemo(() => {
    let list = scholars;
    if (tradition !== 'all') list = list.filter((s) => broadTradition(s.tradition) === tradition);
    if (search.length >= 2) {
      const q = search.toLowerCase();
      list = list.filter((s) => s.name.toLowerCase().includes(q));
    }
    return list;
  }, [scholars, tradition, search]);

  const renderItem = useCallback(
    ({ item: s }: { item: Scholar }) => {
      let scope = 'All books';
      try {
        const parsed = JSON.parse(s.scope_json);
        if (Array.isArray(parsed)) scope = `${parsed.length} books`;
      } catch (err) { logger.warn('ScholarBrowseScreen', 'Operation failed', err); }

      return (
        <TouchableOpacity
          onPress={() => navigation.navigate('ScholarBio', { scholarId: s.id })}
          style={[styles.card, { backgroundColor: base.bgElevated, borderColor: base.gold + '15' }]}
          accessibilityLabel={`${s.name}${s.tradition ? ", " + s.tradition : ""}`}
          accessibilityRole="button"
          activeOpacity={0.7}
        >
          <Text style={[styles.cardName, { color: base.text }]}>{s.name}</Text>
          {s.tradition && <Text style={[styles.cardTradition, { color: base.gold }]}>{s.tradition}</Text>}
          <Text style={[styles.cardScope, { color: base.textMuted }]}>{scope}</Text>
        </TouchableOpacity>
      );
    },
    [base, navigation]
  );

  const filterBar = (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.filterRow}>
      {traditions.map((t) => (
        <TouchableOpacity
          key={t}
          onPress={() => setTradition(t)}
          style={[
            styles.filterPill,
            { borderColor: tradition === t ? base.gold : base.border },
            tradition === t && { backgroundColor: base.gold + '12' },
          ]}
          activeOpacity={0.7}
        >
          <Text style={[
            styles.filterLabel,
            { color: tradition === t ? base.gold : base.textMuted },
          ]}>
            {t === 'all' ? 'All' : t}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  return (
    <BrowseScreenTemplate
      title="Scholars"
      loading={isLoading}
      search={search}
      onSearchChange={setSearch}
      searchPlaceholder="Search scholars..."
      filterBar={filterBar}
      data={filtered}
      renderItem={renderItem}
      keyExtractor={(s: Scholar) => s.id}
      numColumns={2}
      columnWrapperStyle={styles.gridRow}
      contentContainerStyle={styles.gridContent}
    />
  );
}

const styles = StyleSheet.create({
  filterRow: {
    gap: 6,
    marginBottom: spacing.md,
  },
  filterPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
  },
  filterLabel: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 10,
  },
  gridContent: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  gridRow: {
    gap: spacing.sm,
  },
  card: {
    flex: 1,
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing.sm,
  },
  cardName: {
    fontFamily: fontFamily.displayMedium,
    fontSize: 12,
  },
  cardTradition: {
    fontFamily: fontFamily.ui,
    fontSize: 10,
    marginTop: 2,
  },
  cardScope: {
    fontFamily: fontFamily.ui,
    fontSize: 10,
    marginTop: 2,
  },
});

export default withErrorBoundary(ScholarBrowseScreen);
