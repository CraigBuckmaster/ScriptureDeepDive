/**
 * DebateBrowseScreen — Browse scholarly debate topics.
 *
 * FlatList of debate cards with category filter chips and search.
 * Card shows title, book/chapter, position count, and tradition dots.
 */

import React, { useCallback, useMemo, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft, Search, X } from 'lucide-react-native';
import { useTheme, spacing, radii, fontFamily } from '../theme';
import { families } from '../theme/colors';
import { useDebateTopics, DEBATE_CATEGORY_LABELS } from '../hooks/useDebateTopics';
import type { DebateTopicSummary } from '../types';
import type { ScreenNavProp } from '../navigation/types';
import { withErrorBoundary } from '../components/ScreenErrorBoundary';

type Nav = ScreenNavProp<'Explore', 'DebateBrowse'>;

const CATEGORY_COLORS: Record<string, string> = {
  theological: '#64B5F6',
  ethical: '#81C784',
  historical: '#FFB74D',
  textual: '#BA68C8',
  interpretive: '#4FC3F7',
};

function getPositionTraditions(topic: DebateTopicSummary): string[] {
  try {
    const positions = JSON.parse(topic.positions_json || '[]');
    const traditions = new Set<string>();
    for (const p of positions) {
      if (p.tradition_family) traditions.add(p.tradition_family);
    }
    return Array.from(traditions);
  } catch {
    return [];
  }
}

function DebateBrowseScreen() {
  const { base } = useTheme();
  const navigation = useNavigation<Nav>();
  const {
    topics,
    loading,
    search,
    setSearch,
    categoryFilter,
    setCategoryFilter,
    categories,
  } = useDebateTopics();
  const inputRef = useRef<TextInput>(null);

  const handleTopicPress = useCallback(
    (topic: DebateTopicSummary) => {
      (navigation as any).navigate('DebateDetail', { topicId: topic.id });
    },
    [navigation]
  );

  const renderCard = useCallback(
    ({ item }: { item: DebateTopicSummary }) => {
      const catColor = CATEGORY_COLORS[item.category] || base.textDim;
      const traditions = getPositionTraditions(item);

      return (
        <TouchableOpacity
          onPress={() => handleTopicPress(item)}
          activeOpacity={0.6}
          style={[styles.card, { backgroundColor: base.bgElevated, borderLeftColor: catColor }]}
        >
          <Text style={[styles.cardTitle, { color: base.text }]} numberOfLines={2}>
            {item.title}
          </Text>
          {item.passage ? (
            <Text style={[styles.cardPassage, { color: base.textDim }]} numberOfLines={1}>
              {item.passage}
            </Text>
          ) : null}
          <Text style={[styles.cardQuestion, { color: base.textDim }]} numberOfLines={2}>
            {item.question}
          </Text>

          <View style={styles.cardFooter}>
            <Text style={[styles.posCount, { color: base.textMuted }]}>
              {item.position_count} position{item.position_count !== 1 ? 's' : ''}
            </Text>
            <View style={styles.traditionDots}>
              {traditions.slice(0, 4).map((t) => (
                <View
                  key={t}
                  style={[
                    styles.dot,
                    { backgroundColor: families[t as keyof typeof families] || base.textMuted },
                  ]}
                />
              ))}
            </View>
          </View>
        </TouchableOpacity>
      );
    },
    [base, handleTopicPress]
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: base.bg }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft size={22} color={base.gold} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: base.gold }]}>Scholar Debates</Text>
      </View>

      {/* Search */}
      <View style={[styles.searchRow, { backgroundColor: base.bgElevated, borderColor: base.border }]}>
        <Search size={16} color={base.textMuted} />
        <TextInput
          ref={inputRef}
          value={search}
          onChangeText={setSearch}
          placeholder="Search debates..."
          placeholderTextColor={base.textMuted}
          style={[styles.searchInput, { color: base.text }]}
          autoCorrect={false}
          returnKeyType="search"
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <X size={16} color={base.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Category filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipRow}
      >
        <TouchableOpacity
          onPress={() => setCategoryFilter('all')}
          style={[
            styles.chip,
            {
              backgroundColor: categoryFilter === 'all' ? base.gold : base.gold + '15',
              borderColor: base.gold + '40',
            },
          ]}
        >
          <Text style={[styles.chipText, { color: categoryFilter === 'all' ? base.bg : base.gold }]}>
            All
          </Text>
        </TouchableOpacity>
        {categories.map((cat) => {
          const active = categoryFilter === cat;
          const color = CATEGORY_COLORS[cat] || base.gold;
          return (
            <TouchableOpacity
              key={cat}
              onPress={() => setCategoryFilter(cat)}
              style={[
                styles.chip,
                {
                  backgroundColor: active ? color : color + '15',
                  borderColor: color + '40',
                },
              ]}
            >
              <Text style={[styles.chipText, { color: active ? '#fff' : color }]}>
                {DEBATE_CATEGORY_LABELS[cat] || cat}
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
      ) : topics.length === 0 ? (
        <View style={styles.center}>
          <Text style={[styles.emptyText, { color: base.textDim }]}>
            No debates found.
          </Text>
        </View>
      ) : (
        <FlatList
          data={topics}
          keyExtractor={(item) => item.id}
          renderItem={renderCard}
          contentContainerStyle={styles.list}
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
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  backBtn: {
    padding: spacing.xs,
    marginRight: spacing.xs,
  },
  title: {
    fontFamily: fontFamily.displaySemiBold,
    fontSize: 20,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.md,
    marginBottom: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 8,
    borderRadius: radii.md,
    borderWidth: 1,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontFamily: fontFamily.ui,
    fontSize: 14,
    padding: 0,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radii.md,
    borderWidth: 1,
  },
  chipText: {
    fontFamily: fontFamily.displayMedium,
    fontSize: 12,
  },
  list: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  card: {
    borderLeftWidth: 4,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  cardTitle: {
    fontFamily: fontFamily.displaySemiBold,
    fontSize: 15,
    marginBottom: 4,
  },
  cardPassage: {
    fontFamily: fontFamily.ui,
    fontSize: 12,
    marginBottom: 4,
  },
  cardQuestion: {
    fontFamily: fontFamily.ui,
    fontSize: 12,
    lineHeight: 17,
    marginBottom: spacing.sm,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  posCount: {
    fontFamily: fontFamily.ui,
    fontSize: 11,
  },
  traditionDots: {
    flexDirection: 'row',
    gap: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyText: {
    fontFamily: fontFamily.ui,
    fontSize: 14,
    textAlign: 'center',
  },
});

export default withErrorBoundary(DebateBrowseScreen);
