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
import { base, useTheme, spacing, radii, fontFamily } from '../theme';
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
  const { base } = useTheme();
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
      style={[styles.card, { backgroundColor: base.bgElevated, borderColor: base.gold + '20' }]}
      activeOpacity={0.7}
      onPress={() => navigation.navigate('DifficultPassageDetail', { passageId: item.id })}
    >
      {/* Header row: title + severity dot */}
      <View style={styles.cardHeader}>
        <Text style={[styles.cardTitle, { color: base.text }]} numberOfLines={1}>
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
      <Text style={[styles.passage, { color: base.gold }]} numberOfLines={1}>
        {item.passage}
      </Text>

      {/* Question preview */}
      <Text style={[styles.question, { color: base.textDim }]} numberOfLines={2}>
        {item.question}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: base.bg }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <ChevronLeft size={24} color={base.gold} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: base.gold }]}>Difficult Passages</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <View style={[styles.searchBox, { backgroundColor: base.bgElevated }]}>
          <Search size={16} color={base.textMuted} />
          <TextInput
            ref={inputRef}
            style={[styles.searchInput, { color: base.text }]}
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
              style={[
                styles.chip,
                { backgroundColor: base.bgElevated, borderColor: base.gold + '20' },
                isActive && { backgroundColor: base.gold, borderColor: base.gold },
              ]}
              onPress={() => setActiveCategory(cat.key)}
              activeOpacity={0.7}
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

      {/* Content */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={base.gold} />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={[styles.emptyText, { color: base.textMuted }]}>{error}</Text>
        </View>
      ) : filtered.length === 0 ? (
        <View style={styles.center}>
          <Text style={[styles.emptyText, { color: base.textMuted }]}>No passages found</Text>
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  title: {
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
    borderRadius: radii.md,
    paddingHorizontal: spacing.sm,
    height: 40,
    gap: spacing.xs,
  },
  searchInput: {
    flex: 1,
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
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: fontFamily.ui,
    fontSize: 14,
  },
});
