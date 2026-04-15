/**
 * ThreadBrowseScreen — Browse all cross-reference threads with search.
 *
 * Each thread shows its theme, tag chips (max 4), and stop count.
 * Follows the ProphecyBrowseScreen pattern.
 *
 * Card #1359 (UI polish phase 2): migrated to shared BrowseScreenTemplate.
 * The custom TextInput is replaced by the template's SearchInput; the plain
 * empty Text now flows through EmptyState + tint.
 */

import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { ScreenNavProp } from '../navigation/types';
import { useThreads } from '../hooks/useThreads';
import type { ParsedThread } from '../hooks/useThreads';
import { BrowseScreenTemplate, browseCardStyle } from '../components/BrowseScreenTemplate';
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

  const cardStyle = browseCardStyle(base);

  const renderItem = ({ item }: { item: ParsedThread }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('ThreadDetail', { threadId: item.id })}
      style={cardStyle}
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
    <BrowseScreenTemplate
      title="Threads"
      loading={isLoading}
      search={search}
      onSearchChange={setSearch}
      searchPlaceholder="Search threads..."
      data={filtered}
      renderItem={renderItem}
      keyExtractor={(t: ParsedThread) => t.id}
      emptyMessage={search ? 'No threads match your search.' : 'No threads available.'}
    />
  );
}

const styles = StyleSheet.create({
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
});
