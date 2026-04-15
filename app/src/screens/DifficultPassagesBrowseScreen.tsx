/**
 * DifficultPassagesBrowseScreen — Browse difficult passages with filtering.
 *
 * Features:
 * - Category filter chips (All, Ethical, Contradiction, etc.)
 * - Search by title/question
 * - Cards showing title, category badge, severity indicator, truncated question
 * - Tap navigates to detail
 */

import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import {
  useDifficultPassages,
  DifficultPassage,
  DifficultPassageCategory,
} from '../hooks/useDifficultPassages';
import { useTheme, spacing, radii, fontFamily } from '../theme';
import { BrowseScreenTemplate } from '../components/BrowseScreenTemplate';
import type { ExploreStackParamList } from '../navigation/types';
import { withErrorBoundary } from '../components/ScreenErrorBoundary';

type Nav = StackNavigationProp<ExploreStackParamList, 'DifficultPassagesBrowse'>;

type FilterCategory = 'all' | DifficultPassageCategory;

interface CategoryChip {
  key: FilterCategory;
  label: string;
}

const CATEGORIES: CategoryChip[] = [
  { key: 'all', label: 'All' },
  { key: 'ethical', label: 'Ethical' },
  { key: 'contradiction', label: 'Contradiction' },
  { key: 'theological', label: 'Theological' },
  { key: 'historical', label: 'Historical' },
  { key: 'textual', label: 'Textual' },
];

function DifficultPassagesBrowseScreen() {
  const { base, categories: catColors, severity: sevColors } = useTheme();
  const navigation = useNavigation<Nav>();
  const { passages, loading, error } = useDifficultPassages();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<FilterCategory>('all');

  const filtered = useMemo(() => {
    let result = passages;
    if (activeCategory !== 'all') {
      result = result.filter((p) => p.category === activeCategory);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.question.toLowerCase().includes(q) ||
          p.passage.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    return result;
  }, [passages, activeCategory, search]);

  const renderItem = useCallback(
    ({ item }: { item: DifficultPassage }) => (
      <TouchableOpacity
        style={[styles.card, { backgroundColor: base.bgElevated, borderColor: base.gold + '20' }]}
        activeOpacity={0.7}
        onPress={() => navigation.navigate('DifficultPassageDetail', { passageId: item.id })}
        accessibilityRole="button"
        accessibilityLabel={`View passage: ${item.title}`}
      >
        <View style={styles.cardHeader}>
          <Text style={[styles.cardTitle, { color: base.text }]} numberOfLines={1}>
            {item.title}
          </Text>
          <View style={[styles.severityDot, { backgroundColor: sevColors[item.severity] }]} />
        </View>
        <View style={[styles.categoryBadge, { backgroundColor: (catColors[item.category] ?? base.textMuted) + '30' }]}>
          <Text style={[styles.categoryText, { color: catColors[item.category] ?? base.textMuted }]}>
            {item.category}
          </Text>
        </View>
        <Text style={[styles.passage, { color: base.gold }]} numberOfLines={1}>
          {item.passage}
        </Text>
        <Text style={[styles.question, { color: base.textDim }]} numberOfLines={2}>
          {item.question}
        </Text>
      </TouchableOpacity>
    ),
    [base, catColors, sevColors, navigation]
  );

  const filterBar = (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.chipRow}
    >
      {CATEGORIES.map((cat) => {
        const isActive = activeCategory === cat.key;
        return (
          <TouchableOpacity
            key={cat.key}
            style={[
              styles.chip,
              { backgroundColor: base.bgElevated, borderColor: base.gold + '20' },
              isActive && { backgroundColor: base.gold, borderColor: base.gold },
            ]}
            onPress={() => setActiveCategory(cat.key)}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={`Filter by ${cat.label}`}
            accessibilityState={{ selected: isActive }}
          >
            <Text style={[
              styles.chipText,
              { color: base.textMuted },
              isActive && { color: base.bg, fontFamily: fontFamily.uiMedium },
            ]}>
              {cat.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );

  return (
    <BrowseScreenTemplate<DifficultPassage>
      title="Difficult Passages"
      loading={loading}
      search={search}
      onSearchChange={setSearch}
      searchPlaceholder="Search passages..."
      filterBar={filterBar}
      data={filtered}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      emptyMessage={error || 'No passages found'}
      contentContainerStyle={styles.list}
    />
  );
}

const styles = StyleSheet.create({
  chipRow: {
    paddingBottom: spacing.sm,
    gap: spacing.xs,
  },
  chip: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs + 2,
    borderRadius: radii.pill,
    borderWidth: 1,
    marginRight: spacing.xs,
  },
  chipText: {
    fontFamily: fontFamily.ui,
    fontSize: 12,
  },
  list: {
    padding: spacing.md,
    paddingTop: spacing.xs,
  },
  card: {
    borderWidth: 1,
    borderRadius: radii.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  cardTitle: {
    flex: 1,
    fontFamily: fontFamily.displayMedium,
    fontSize: 15,
    marginRight: spacing.sm,
  },
  severityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.xs + 2,
    paddingVertical: 2,
    borderRadius: radii.sm,
    marginBottom: spacing.xs,
  },
  categoryText: {
    fontFamily: fontFamily.ui,
    fontSize: 10,
    textTransform: 'capitalize',
  },
  passage: {
    fontFamily: fontFamily.ui,
    fontSize: 12,
    marginBottom: spacing.xs,
  },
  question: {
    fontFamily: fontFamily.ui,
    fontSize: 13,
    lineHeight: 18,
  },
});

export default withErrorBoundary(DifficultPassagesBrowseScreen);
