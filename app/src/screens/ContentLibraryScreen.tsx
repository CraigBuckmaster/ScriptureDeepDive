/**
 * ContentLibraryScreen — Browse panel content across all chapters.
 *
 * Category tabs (only non-empty shown), search bar, OT/NT filter chips,
 * and a SectionList grouped by book in canonical order.
 */

import React, { useMemo, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  SectionList, StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft } from 'lucide-react-native';
import type { ScreenNavProp } from '../navigation/types';
import { useContentLibrary, type ContentCategory } from '../hooks/useContentLibrary';
import { ContentLibraryCard } from '../components/ContentLibraryCard';
import { useTheme, spacing, radii, fontFamily, MIN_TOUCH_TARGET } from '../theme';
import type { ContentLibraryEntry } from '../types';

const CATEGORY_LABELS: Record<ContentCategory, string> = {
  manuscripts: 'Manuscripts',
  discourse: 'Discourse',
  echoes: 'Echoes',
  ane: 'ANE Parallels',
  chiasms: 'Chiasms',
};

type TestamentFilter = 'all' | 'ot' | 'nt';

export default function ContentLibraryScreen() {
  const { base } = useTheme();
  const navigation = useNavigation<ScreenNavProp<'Explore', 'ContentLibrary'>>();
  const {
    entries,
    availableCategories,
    activeCategory,
    setActiveCategory,
    testament,
    setTestament,
    searchQuery,
    setSearchQuery,
    isLoading,
  } = useContentLibrary();

  // Group entries by book for SectionList
  const sections = useMemo(() => {
    const bookMap = new Map<string, ContentLibraryEntry[]>();
    for (const entry of entries) {
      const key = entry.book_name;
      if (!bookMap.has(key)) bookMap.set(key, []);
      bookMap.get(key)!.push(entry);
    }
    return Array.from(bookMap, ([title, data]) => ({ title, data }));
  }, [entries]);

  const handleCardPress = useCallback((entry: ContentLibraryEntry) => {
    navigation.push('Chapter', {
      bookId: entry.book_id,
      chapterNum: entry.chapter_num,
      openPanel: {
        sectionNum: entry.section_num ?? undefined,
        panelType: entry.panel_type,
        tabKey: entry.tab_key ?? undefined,
      },
    });
  }, [navigation]);

  const currentFilter: TestamentFilter = testament ?? 'all';
  const handleFilterPress = useCallback((f: TestamentFilter) => {
    setTestament(f === 'all' ? undefined : f);
  }, [setTestament]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: base.bg }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: base.border }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          accessibilityLabel="Go back"
          style={styles.backButton}
        >
          <ChevronLeft size={22} color={base.gold} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: base.gold }]}>Content Library</Text>
        <View style={styles.backButton} />
      </View>

      {/* Category tabs */}
      {availableCategories.length > 0 && (
        <View style={[styles.tabRow, { borderBottomColor: base.border }]}>
          {availableCategories.map((cat) => {
            const isActive = cat === activeCategory;
            return (
              <TouchableOpacity
                key={cat}
                onPress={() => setActiveCategory(cat)}
                activeOpacity={0.7}
                style={[
                  styles.tab,
                  isActive && [styles.tabActive, { borderBottomColor: base.gold, backgroundColor: base.gold + '12' }],
                ]}
              >
                <Text
                  style={[
                    styles.tabLabel,
                    { color: base.textMuted },
                    isActive && { color: base.gold },
                  ]}
                >
                  {CATEGORY_LABELS[cat]}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* Search bar */}
      <View style={styles.searchRow}>
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search entries..."
          placeholderTextColor={base.textMuted}
          style={[styles.searchInput, { color: base.text, backgroundColor: base.bgElevated, borderColor: base.border }]}
          autoCorrect={false}
          autoCapitalize="none"
        />
      </View>

      {/* OT/NT filter chips */}
      <View style={styles.filterRow}>
        {(['all', 'ot', 'nt'] as TestamentFilter[]).map((f) => {
          const isActive = currentFilter === f;
          const label = f === 'all' ? 'All' : f === 'ot' ? 'OT' : 'NT';
          return (
            <TouchableOpacity
              key={f}
              onPress={() => handleFilterPress(f)}
              activeOpacity={0.7}
              style={[
                styles.chip,
                { borderColor: base.border },
                isActive && { backgroundColor: base.gold + '20', borderColor: base.gold },
              ]}
            >
              <Text
                style={[
                  styles.chipLabel,
                  { color: base.textMuted },
                  isActive && { color: base.gold },
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Entry list grouped by book */}
      <SectionList
        sections={sections}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <ContentLibraryCard entry={item} onPress={handleCardPress} />
        )}
        renderSectionHeader={({ section: { title } }) => (
          <Text style={[styles.sectionHeader, { color: base.textDim }]}>{title}</Text>
        )}
        contentContainerStyle={styles.listContent}
        stickySectionHeadersEnabled={false}
        ListEmptyComponent={
          !isLoading ? (
            <Text style={[styles.emptyText, { color: base.textMuted }]}>
              No entries found.
            </Text>
          ) : null
        }
      />
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
    paddingHorizontal: spacing.sm,
    height: 48,
    borderBottomWidth: 1,
  },
  backButton: {
    minWidth: MIN_TOUCH_TARGET,
    minHeight: MIN_TOUCH_TARGET,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: fontFamily.displaySemiBold,
    fontSize: 17,
  },
  tabRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    paddingHorizontal: spacing.xs,
  },
  tab: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.sm,
  },
  tabActive: {
    borderBottomWidth: 2,
  },
  tabLabel: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 12,
  },
  searchRow: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  searchInput: {
    fontFamily: fontFamily.ui,
    fontSize: 13,
    borderWidth: 1,
    borderRadius: radii.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs + 2,
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xs,
    paddingBottom: spacing.xs,
    gap: spacing.xs,
  },
  chip: {
    borderWidth: 1,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  chipLabel: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 11,
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xxl,
  },
  sectionHeader: {
    fontFamily: fontFamily.uiSemiBold,
    fontSize: 12,
    letterSpacing: 0.5,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  emptyText: {
    fontFamily: fontFamily.ui,
    fontSize: 13,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
});
