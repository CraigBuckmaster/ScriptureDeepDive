/**
 * ScholarBrowseScreen — Grid of 43 scholar cards, filterable by tradition.
 */

import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { ScreenNavProp } from '../navigation/types';
import { useScholars } from '../hooks/useScholars';
import { BrowseScreenTemplate } from '../components/BrowseScreenTemplate';
import { useTheme, spacing, radii, fontFamily } from '../theme';
import { logger } from '../utils/logger';
import { withErrorBoundary } from '../components/ScreenErrorBoundary';

function ScholarBrowseScreen() {
  const { base, getScholarColor } = useTheme();
  const navigation = useNavigation<ScreenNavProp<'Explore', 'ScholarBrowse'>>();
  const { scholars, isLoading } = useScholars();
  const [search, setSearch] = useState('');
  const [tradition, setTradition] = useState<string>('all');

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
    ({ item: s }: { item: any }) => {
      const color = getScholarColor(s.id);
      let scope = 'All books';
      try {
        const parsed = JSON.parse(s.scope_json);
        if (Array.isArray(parsed)) scope = `${parsed.length} books`;
      } catch (err) { logger.warn('ScholarBrowseScreen', 'Operation failed', err); }

      return (
        <TouchableOpacity
          onPress={() => navigation.navigate('ScholarBio', { scholarId: s.id })}
          style={[styles.card, { backgroundColor: color + '14', borderLeftColor: color }]}
          accessibilityLabel={`${s.name}${s.tradition ? ", " + s.tradition : ""}`}
          accessibilityRole="button"
        >
          <Text style={[styles.cardName, { color }]}>{s.name}</Text>
          {s.tradition && <Text style={[styles.cardTradition, { color: base.textMuted }]}>{s.tradition}</Text>}
          <Text style={[styles.cardScope, { color: base.textDim }]}>{scope}</Text>
        </TouchableOpacity>
      );
    },
    [base, getScholarColor, navigation]
  );

  const filterBar = (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.filterRow}>
      {traditions.map((t) => (
        <TouchableOpacity key={t} onPress={() => setTradition(t)}>
          <Text style={[
            styles.filterLabel,
            { color: base.textMuted },
            tradition === t && { color: base.gold, borderBottomColor: base.gold },
            tradition === t && styles.filterLabelActive,
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
      keyExtractor={(s: any) => s.id}
      numColumns={2}
      columnWrapperStyle={styles.gridRow}
      contentContainerStyle={styles.gridContent}
    />
  );
}

const styles = StyleSheet.create({
  filterRow: {
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  filterLabel: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 11,
    paddingBottom: 4,
    paddingHorizontal: 4,
  },
  filterLabelActive: {
    borderBottomWidth: 2,
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
    borderLeftWidth: 3,
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
