/**
 * ConceptBrowseScreen — Browse all theological concepts.
 *
 * Grid layout with search, each card shows title and truncated description.
 * Tapping a card navigates to ConceptDetailScreen.
 */

import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useConcepts, Concept } from '../hooks/useConceptData';
import { useTheme, spacing, radii, fontFamily } from '../theme';
import { BrowseScreenTemplate } from '../components/BrowseScreenTemplate';
import type { ExploreStackParamList } from '../navigation/types';
import { withErrorBoundary } from '../components/ScreenErrorBoundary';

type Nav = StackNavigationProp<ExploreStackParamList, 'ConceptBrowse'>;

function ConceptBrowseScreen() {
  const { base } = useTheme();
  const navigation = useNavigation<Nav>();
  const { concepts, loading } = useConcepts();
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search.trim()) return concepts;
    const q = search.toLowerCase();
    return concepts.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.tags.some((t) => t.toLowerCase().includes(q))
    );
  }, [concepts, search]);

  const renderItem = useCallback(
    ({ item }: { item: Concept }) => (
      <TouchableOpacity
        style={[styles.card, { backgroundColor: base.bgElevated, borderColor: base.gold + '20' }]}
        activeOpacity={0.7}
        onPress={() => navigation.navigate('ConceptDetail', { conceptId: item.id })}
        accessibilityRole="button"
        accessibilityLabel={`View concept: ${item.title}`}
      >
        <Text style={[styles.cardTitle, { color: base.text }]}>{item.title}</Text>
        <Text style={[styles.cardDesc, { color: base.textDim }]} numberOfLines={3}>
          {item.description}
        </Text>
        <View style={styles.tagRow}>
          {item.tags.slice(0, 3).map((tag) => (
            <View key={tag} style={[styles.tag, { backgroundColor: base.gold + '15' }]}>
              <Text style={[styles.tagText, { color: base.gold }]}>{tag}</Text>
            </View>
          ))}
        </View>
      </TouchableOpacity>
    ),
    [base, navigation]
  );

  return (
    <BrowseScreenTemplate<Concept>
      title="Concepts"
      loading={loading}
      search={search}
      onSearchChange={setSearch}
      searchPlaceholder="Search concepts..."
      data={filtered}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      emptyMessage="No concepts found"
      contentContainerStyle={styles.list}
    />
  );
}

const styles = StyleSheet.create({
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
  cardTitle: {
    fontFamily: fontFamily.displayMedium,
    fontSize: 15,
    marginBottom: spacing.xs,
  },
  cardDesc: {
    fontFamily: fontFamily.ui,
    fontSize: 13,
    lineHeight: 18,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  tag: {
    paddingHorizontal: spacing.xs + 2,
    paddingVertical: 2,
    borderRadius: radii.sm,
  },
  tagText: {
    fontFamily: fontFamily.ui,
    fontSize: 10,
  },
});

export default withErrorBoundary(ConceptBrowseScreen);
