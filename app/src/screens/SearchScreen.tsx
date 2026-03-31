/**
 * SearchScreen — Full FTS5 search across verses, people, word studies.
 *
 * Fixes from Phase 4A:
 *   - Verse results show book display name (via joined book_name)
 *   - Empty state when no results match
 *   - "Load more" button when verses are sliced at 20
 */

import React, { useState, useRef, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, SectionList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { ScreenNavProp } from '../navigation/types';
import { useScrollToTop } from '@react-navigation/native';
import { Search as SearchIcon } from 'lucide-react-native';
import { useSearch } from '../hooks/useSearch';
import { SearchInput } from '../components/SearchInput';
import { base, spacing, radii, fontFamily, eras } from '../theme';
import type { Person, WordStudy, Verse } from '../types';

const INITIAL_VERSE_LIMIT = 20;
const LOAD_MORE_INCREMENT = 30;

export default function SearchScreen() {
  const navigation = useNavigation<ScreenNavProp<'Search', 'SearchMain'>>();
  const [query, setQuery] = useState('');
  const [verseLimit, setVerseLimit] = useState(INITIAL_VERSE_LIMIT);
  const { results, isLoading } = useSearch(query);
  const listRef = useRef<SectionList>(null);
  useScrollToTop(listRef);

  // Reset limit when query changes
  const handleQueryChange = (text: string) => {
    setQuery(text);
    setVerseLimit(INITIAL_VERSE_LIMIT);
  };

  const displayedVerses = results.verses.slice(0, verseLimit);
  const hasMoreVerses = results.verses.length > verseLimit;

  const sections = useMemo(() => [
    ...(results.people.length ? [{
      title: 'People',
      data: results.people.map((p) => ({ type: 'person' as const, item: p })),
    }] : []),
    ...(results.wordStudies.length ? [{
      title: 'Word Studies',
      data: results.wordStudies.map((w) => ({ type: 'word' as const, item: w })),
    }] : []),
    ...(displayedVerses.length ? [{
      title: 'Verses',
      data: [
        ...displayedVerses.map((v) => ({ type: 'verse' as const, item: v })),
        ...(hasMoreVerses ? [{ type: 'loadMore' as const, item: null }] : []),
      ],
    }] : []),
  ], [results.people, results.wordStudies, displayedVerses, hasMoreVerses]);

  const trimmed = query.trim();
  const hasResults = results.people.length > 0 || results.wordStudies.length > 0 || results.verses.length > 0;

  return (
    <SafeAreaView style={styles.container}>
      {/* Search input */}
      <View style={styles.inputWrapper}>
        <SearchInput
          value={query}
          onChangeText={handleQueryChange}
          placeholder="Search verses, people, word studies..."
          autoFocus
        />
      </View>

      {trimmed.length < 2 ? (
        /* Idle state */
        <View style={styles.emptyCenter}>
          <SearchIcon size={28} color={base.textMuted + '60'} />
          <Text style={styles.emptyText}>
            Search verses, people, and more
          </Text>
        </View>
      ) : !hasResults && !isLoading ? (
        /* No results */
        <View style={styles.emptyCenter}>
          <Text style={styles.emptyText}>
            No results found for "{trimmed}"
          </Text>
        </View>
      ) : (
        <SectionList
          ref={listRef}
          sections={sections}
          keyExtractor={(item, i) => `${item.type}-${i}`}
          contentContainerStyle={styles.listContent}
          renderSectionHeader={({ section }) => (
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                {section.title.toUpperCase()}
              </Text>
            </View>
          )}
          renderItem={({ item: { type, item } }) => {
            if (type === 'loadMore') {
              return (
                <TouchableOpacity
                  onPress={() => setVerseLimit((prev) => prev + LOAD_MORE_INCREMENT)}
                  style={styles.loadMoreButton}
                >
                  <Text style={styles.loadMoreText}>Load more verses</Text>
                </TouchableOpacity>
              );
            }
            if (type === 'person') {
              const p = item as Person;
              return (
                <TouchableOpacity
                  onPress={() => navigation.navigate('ExploreTab', {
                    screen: 'PersonDetail',
                    params: { personId: p.id },
                  })}
                  style={styles.personRow}
                >
                  <View style={[
                    styles.eraDot,
                    { backgroundColor: p.era ? (eras[p.era] ?? base.textMuted) : base.textMuted },
                  ]} />
                  <View style={styles.personText}>
                    <Text style={styles.personName}>{p.name}</Text>
                    <Text style={styles.personRole} numberOfLines={1}>{p.role}</Text>
                  </View>
                </TouchableOpacity>
              );
            }
            if (type === 'word') {
              const w = item as WordStudy;
              return (
                <TouchableOpacity
                  onPress={() => navigation.navigate('ExploreTab', {
                    screen: 'WordStudyDetail',
                    params: { wordId: w.id },
                  })}
                  style={styles.wordRow}
                >
                  <Text style={styles.wordOriginal}>{w.original}</Text>
                  <Text style={styles.wordTranslit}>{w.transliteration}</Text>
                </TouchableOpacity>
              );
            }
            // Verse
            const v = item as Verse;
            const displayName = v.book_name ?? v.book_id;
            return (
              <TouchableOpacity
                onPress={() => navigation.navigate('ReadTab', {
                  screen: 'Chapter',
                  params: { bookId: v.book_id, chapterNum: v.chapter_num },
                })}
                style={styles.verseRow}
              >
                <Text style={styles.verseRef}>
                  {displayName} {v.chapter_num}:{v.verse_num}
                </Text>
                <Text style={styles.verseText} numberOfLines={2}>{v.text}</Text>
              </TouchableOpacity>
            );
          }}
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
  inputWrapper: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xxl,
  },
  sectionHeader: {
    paddingTop: spacing.md,
    paddingBottom: spacing.xs,
    backgroundColor: base.bg,
  },
  sectionTitle: {
    color: base.textMuted,
    fontFamily: fontFamily.display,
    fontSize: 10,
    letterSpacing: 0.5,
  },
  emptyCenter: {
    alignItems: 'center',
    paddingTop: spacing.xxl,
    gap: spacing.sm,
  },
  emptyText: {
    color: base.textMuted,
    fontFamily: fontFamily.bodyItalic,
    fontSize: 15,
  },
  // Person
  personRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  eraDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  personText: {
    flex: 1,
  },
  personName: {
    color: base.text,
    fontFamily: fontFamily.uiMedium,
    fontSize: 14,
  },
  personRole: {
    color: base.textMuted,
    fontFamily: fontFamily.ui,
    fontSize: 11,
  },
  // Word study
  wordRow: {
    paddingVertical: spacing.sm,
  },
  wordOriginal: {
    color: '#e890b8',
    fontFamily: fontFamily.bodyMedium,
    fontSize: 16,
  },
  wordTranslit: {
    color: base.goldDim,
    fontFamily: fontFamily.bodyItalic,
    fontSize: 12,
  },
  // Verse
  verseRow: {
    paddingVertical: spacing.xs,
  },
  verseRef: {
    color: base.gold,
    fontFamily: fontFamily.uiMedium,
    fontSize: 12,
  },
  verseText: {
    color: base.textDim,
    fontFamily: fontFamily.ui,
    fontSize: 12,
  },
  // Load more
  loadMoreButton: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  loadMoreText: {
    color: base.gold,
    fontFamily: fontFamily.uiMedium,
    fontSize: 13,
  },
});
