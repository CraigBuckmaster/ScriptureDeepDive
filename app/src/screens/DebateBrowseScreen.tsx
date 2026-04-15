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
import {
  BrowseScreenTemplate,
  BrowseFilterPill,
} from '../components/BrowseScreenTemplate';
import type { DebateTopicSummary } from '../types';
import type { ScreenNavProp } from '../navigation/types';
import { withErrorBoundary } from '../components/ScreenErrorBoundary';

type Nav = ScreenNavProp<'Explore', 'DebateBrowse'>;

/**
 * Per-category accent colors kept as-is — they're used on the card's left
 * border + tradition dots to preserve at-a-glance category differentiation.
 * The filter bar itself uses the monochrome gold pills now (#1359).
 */
const CATEGORY_COLORS: Record<string, string> = {
  theological: '#64B5F6', // data-color: intentional
  ethical: '#81C784', // data-color: intentional
  historical: '#FFB74D', // data-color: intentional
  textual: '#BA68C8', // data-color: intentional
  interpretive: '#4FC3F7', // data-color: intentional
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
      navigation.navigate('DebateDetail', { topicId: topic.id });
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
      <BrowseFilterPill
        label="All"
        active={categoryFilter === 'all'}
        onPress={() => setCategoryFilter('all')}
      />
      {categories.map((cat) => (
        <BrowseFilterPill
          key={cat}
          label={DEBATE_CATEGORY_LABELS[cat] || cat}
          active={categoryFilter === cat}
          onPress={() => setCategoryFilter(cat)}
        />
      ))}
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
