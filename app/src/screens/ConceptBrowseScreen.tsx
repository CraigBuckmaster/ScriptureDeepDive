/**
 * ConceptBrowseScreen — Browse all theological concepts.
 *
 * Grid layout with search, each card shows title and truncated description.
 * Tapping a card navigates to ConceptDetailScreen.
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft, Search, X } from 'lucide-react-native';
import { useConcepts, Concept } from '../hooks/useConceptData';
import { useTheme, spacing, radii, fontFamily } from '../theme';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { ExploreStackParamList } from '../navigation/types';
import { withErrorBoundary } from '../components/ScreenErrorBoundary';

type Nav = StackNavigationProp<ExploreStackParamList, 'ConceptBrowse'>;

function ConceptBrowseScreen() {
  const { base } = useTheme();
  const navigation = useNavigation<Nav>();
  const { concepts, loading } = useConcepts();
  const [search, setSearch] = useState('');
  const inputRef = useRef<TextInput>(null);

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

  const renderItem = ({ item }: { item: Concept }) => (
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
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: base.bg }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }} accessibilityRole="button" accessibilityLabel="Go back">
          <ChevronLeft size={24} color={base.gold} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: base.gold }]} accessibilityRole="header">Concepts</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <View style={[styles.searchBox, { backgroundColor: base.bgElevated }]}>
          <Search size={16} color={base.textMuted} />
          <TextInput
            ref={inputRef}
            style={[styles.searchInput, { color: base.text }]}
            placeholder="Search concepts…"
            placeholderTextColor={base.textMuted}
            value={search}
            onChangeText={setSearch}
            autoCorrect={false}
            autoCapitalize="none"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')} accessibilityRole="button" accessibilityLabel="Clear search">
              <X size={16} color={base.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={base.gold} />
        </View>
      ) : filtered.length === 0 ? (
        <View style={styles.center}>
          <Text style={[styles.emptyText, { color: base.textMuted }]}>No concepts found</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          numColumns={1}
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
  headerSpacer: {
    width: 24,
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

export default withErrorBoundary(ConceptBrowseScreen);
