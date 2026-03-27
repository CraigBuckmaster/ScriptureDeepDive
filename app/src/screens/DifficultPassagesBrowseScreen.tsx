/**
 * DifficultPassagesBrowseScreen — Browse difficult passages with filtering.
 *
 * Features:
 * - Category filter chips (All, Ethical, Contradiction, etc.)
 * - Search by title/question
 * - Cards showing title, category badge, severity indicator, truncated question
 * - Tap navigates to detail
 */

import React, { useState, useMemo, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft, Search, X } from 'lucide-react-native';
import {
  useDifficultPassages,
  DifficultPassage,
  DifficultPassageCategory,
} from '../hooks/useDifficultPassages';
import { base, spacing, radii, fontFamily } from '../theme';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { ExploreStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<ExploreStackParamList, 'DifficultPassagesBrowse'>;

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

const CATEGORY_COLORS: Record<DifficultPassageCategory, string> = {
  ethical: '#E57373',
  contradiction: '#FFB74D',
  theological: '#64B5F6',
  historical: '#81C784',
  textual: '#BA68C8',
};

const SEVERITY_DOT: Record<string, string> = {
  minor: '#4CAF50',
  moderate: '#FFC107',
  major: '#F44336',
};

export default function DifficultPassagesBrowseScreen() {
  const navigation = useNavigation<Nav>();
  const { passages, loading, error } = useDifficultPassages();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<FilterCategory>('all');
  const inputRef = useRef<TextInput>(null);

  const filtered = useMemo(() => {
    let result = passages;

    // Filter by category
    if (activeCategory !== 'all') {
      result = result.filter((p) => p.category === activeCategory);
    }

    // Filter by search
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

  const renderItem = ({ item }: { item: DifficultPassage }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.7}
      onPress={() => navigation.navigate('DifficultPassageDetail', { passageId: item.id })}
    >
      {/* Header row: title + severity dot */}
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <View style={[styles.severityDot, { backgroundColor: SEVERITY_DOT[item.severity] }]} />
      </View>

      {/* Category badge */}
      <View style={[styles.categoryBadge, { backgroundColor: CATEGORY_COLORS[item.category] + '30' }]}>
        <Text style={[styles.categoryText, { color: CATEGORY_COLORS[item.category] }]}>
          {item.category}
        </Text>
      </View>

      {/* Passage reference */}
      <Text style={styles.passage} numberOfLines={1}>
        {item.passage}
      </Text>

      {/* Question preview */}
      <Text style={styles.question} numberOfLines={2}>
        {item.question}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <ChevronLeft size={24} color={base.gold} />
        </TouchableOpacity>
        <Text style={styles.title}>Difficult Passages</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Search size={16} color={base.textMuted} />
          <TextInput
            ref={inputRef}
            style={styles.searchInput}
            placeholder="Search passages…"
            placeholderTextColor={base.textMuted}
            value={search}
            onChangeText={setSearch}
            autoCorrect={false}
            autoCapitalize="none"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <X size={16} color={base.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Category filter chips */}
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
              style={[styles.chip, isActive && styles.chipActive]}
              onPress={() => setActiveCategory(cat.key)}
              activeOpacity={0.7}
            >
              <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Content */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={base.gold} />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>{error}</Text>
        </View>
      ) : filtered.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>No passages found</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: base.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  title: {
    color: base.gold,
    fontFamily: fontFamily.displaySemiBold,
    fontSize: 18,
  },
  searchRow: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: base.bgElevated,
    borderRadius: radii.md,
    paddingHorizontal: spacing.sm,
    height: 40,
    gap: spacing.xs,
  },
  searchInput: {
    flex: 1,
    color: base.text,
    fontFamily: fontFamily.ui,
    fontSize: 14,
    paddingVertical: 0,
  },
  chipRow: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    gap: spacing.xs,
  },
  chip: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs + 2,
    borderRadius: radii.full,
    backgroundColor: base.bgElevated,
    borderWidth: 1,
    borderColor: base.gold + '20',
    marginRight: spacing.xs,
  },
  chipActive: {
    backgroundColor: base.gold,
    borderColor: base.gold,
  },
  chipText: {
    color: base.textMuted,
    fontFamily: fontFamily.ui,
    fontSize: 12,
  },
  chipTextActive: {
    color: base.bg,
    fontFamily: fontFamily.uiMedium,
  },
  list: {
    padding: spacing.md,
    paddingTop: spacing.xs,
  },
  card: {
    backgroundColor: base.bgElevated,
    borderWidth: 1,
    borderColor: base.gold + '20',
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
    color: base.text,
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
    color: base.gold,
    fontFamily: fontFamily.ui,
    fontSize: 12,
    marginBottom: spacing.xs,
  },
  question: {
    color: base.textDim,
    fontFamily: fontFamily.ui,
    fontSize: 13,
    lineHeight: 18,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: base.textMuted,
    fontFamily: fontFamily.ui,
    fontSize: 14,
  },
});
