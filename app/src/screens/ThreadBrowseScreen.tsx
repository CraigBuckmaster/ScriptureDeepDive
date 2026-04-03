/**
 * ThreadBrowseScreen — Browse all cross-reference threads with search.
 *
 * Each thread shows its theme, tag chips (max 4), and stop count.
 * Follows the ProphecyBrowseScreen pattern.
 */

import React, { useState, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { ScreenNavProp } from '../navigation/types';
import { useThreads } from '../hooks/useThreads';
import type { ParsedThread } from '../hooks/useThreads';
import { ScreenHeader } from '../components/ScreenHeader';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { useTheme, spacing, radii, fontFamily } from '../theme';

export default function ThreadBrowseScreen() {
  const { base } = useTheme();
  const navigation = useNavigation<ScreenNavProp<'Explore', 'ThreadBrowse'>>();
  const { threads, isLoading } = useThreads();
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search.trim()) return threads;
    const q = search.toLowerCase();
    return threads.filter(
      (t) =>
        t.theme.toLowerCase().includes(q) ||
        t.tags.some((tag) => tag.toLowerCase().includes(q)),
    );
  }, [threads, search]);

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: base.bg }]}>
        <View style={styles.loadingPad}>
          <LoadingSkeleton lines={6} />
        </View>
      </SafeAreaView>
    );
  }

  const renderItem = ({ item }: { item: ParsedThread }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('ThreadDetail', { threadId: item.id })}
      style={[styles.card, { backgroundColor: base.bgElevated, borderColor: base.gold + '25' }]}
      accessibilityLabel={item.theme}
      accessibilityRole="button"
    >
      <Text style={[styles.cardTitle, { color: base.text }]} numberOfLines={2}>
        {item.theme}
      </Text>

      {item.tags.length > 0 && (
        <View style={styles.tagRow}>
          {item.tags.slice(0, 4).map((tag) => (
            <View key={tag} style={[styles.tag, { backgroundColor: base.gold + '15' }]}>
              <Text style={[styles.tagText, { color: base.gold }]}>{tag}</Text>
            </View>
          ))}
        </View>
      )}

      <Text style={[styles.stopCount, { color: base.textMuted }]}>
        {item.steps.length} stops
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: base.bg }]}>
      <View style={styles.topSection}>
        <ScreenHeader
          title="Threads"
          onBack={() => navigation.goBack()}
          style={styles.headerSpacing}
        />

        <TextInput
          style={[styles.searchInput, { backgroundColor: base.bgElevated, color: base.text, borderColor: base.border }]}
          placeholder="Search threads..."
          placeholderTextColor={base.textMuted}
          value={search}
          onChangeText={setSearch}
          autoCorrect={false}
          accessibilityLabel="Search threads"
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(t) => t.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={[styles.emptyText, { color: base.textMuted }]}>
            {search ? 'No threads match your search.' : 'No threads available.'}
          </Text>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  searchInput: {
    fontFamily: fontFamily.ui,
    fontSize: 14,
    borderWidth: 1,
    borderRadius: radii.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs + 2,
    marginBottom: spacing.md,
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xxl,
  },
  card: {
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  cardTitle: {
    fontFamily: fontFamily.displayMedium,
    fontSize: 15,
    marginBottom: spacing.xs,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  tag: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 1,
    borderRadius: radii.sm,
  },
  tagText: {
    fontFamily: fontFamily.ui,
    fontSize: 10,
  },
  stopCount: {
    fontFamily: fontFamily.ui,
    fontSize: 11,
  },
  emptyText: {
    fontFamily: fontFamily.ui,
    fontSize: 14,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
});
