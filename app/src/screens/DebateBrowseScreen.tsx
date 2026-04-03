/**
 * DebateBrowseScreen — Browse scholarly debate topics.
 *
 * FlatList of debate cards with category filter chips and search.
 * Card shows title, book/chapter, position count, and tradition dots.
 */

import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme, spacing, radii, fontFamily } from '../theme';
import { families } from '../theme/colors';
import { useDebateTopics, DEBATE_CATEGORY_LABELS } from '../hooks/useDebateTopics';
import { BrowseScreenTemplate } from '../components/BrowseScreenTemplate';
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

  const filterBar = (
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
  );

  return (
    <BrowseScreenTemplate<DebateTopicSummary>
      title="Scholar Debates"
      loading={loading}
      search={search}
      onSearchChange={setSearch}
      searchPlaceholder="Search debates..."
      filterBar={filterBar}
      data={topics}
      renderItem={renderCard}
      keyExtractor={(item) => item.id}
      emptyMessage="No debates found."
      contentContainerStyle={styles.list}
    />
  );
}

const styles = StyleSheet.create({
  chipRow: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: spacing.xs,
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
});

export default withErrorBoundary(DebateBrowseScreen);
