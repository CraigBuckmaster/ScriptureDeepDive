/**
 * ScholarBrowseScreen — Grid of 43 scholar cards, filterable by tradition.
 */

import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, FlatList, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useScholars } from '../hooks/useScholars';
import { ScreenHeader } from '../components/ScreenHeader';
import { SearchInput } from '../components/SearchInput';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { getScholarColor, base, spacing, radii, fontFamily } from '../theme';
import { logger } from '../utils/logger';

export default function ScholarBrowseScreen() {
  const navigation = useNavigation<any>();
  const { scholars, isLoading } = useScholars();
  const [search, setSearch] = useState('');
  const [tradition, setTradition] = useState<string>('all');

  /** Extract broadest tradition category (first word before any delimiter). */
  const broadTradition = (t: string | null | undefined): string => {
    if (!t) return '';
    // Split on common delimiters: dash, en-dash, em-dash, comma, parenthetical
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

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingPad}><LoadingSkeleton lines={6} /></View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topSection}>
        <ScreenHeader
          title="Scholars"
          onBack={() => navigation.goBack()}
          style={styles.headerSpacing}
        />

        <View style={{ marginBottom: spacing.sm }}>
          <SearchInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search scholars..."
          />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}>
          {traditions.map((t) => (
            <TouchableOpacity key={t} onPress={() => setTradition(t)}>
              <Text style={[styles.filterLabel, tradition === t && styles.filterLabelActive]}>
                {t === 'all' ? 'All' : t}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(s) => s.id}
        numColumns={2}
        contentContainerStyle={styles.gridContent}
        columnWrapperStyle={styles.gridRow}
        renderItem={({ item: s }) => {
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
              {s.tradition && <Text style={styles.cardTradition}>{s.tradition}</Text>}
              <Text style={styles.cardScope}>{scope}</Text>
            </TouchableOpacity>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: base.bg,
  },
  loadingPad: {
    padding: spacing.lg,
  },
  topSection: {
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
    fontFamily: fontFamily.uiMedium,
    fontSize: 11,
    paddingBottom: 4,
    paddingHorizontal: 4,
  },
  filterLabelActive: {
    color: base.gold,
    borderBottomWidth: 2,
    borderBottomColor: base.gold,
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
    color: base.textMuted,
    fontFamily: fontFamily.ui,
    fontSize: 10,
    marginTop: 2,
  },
  cardScope: {
    color: base.textDim,
    fontFamily: fontFamily.ui,
    fontSize: 10,
    marginTop: 2,
  },
});
