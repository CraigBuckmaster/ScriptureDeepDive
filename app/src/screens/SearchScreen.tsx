/**
 * SearchScreen — Universal search across all content types.
 *
 * Searches: verses, people, books, concepts, map stories,
 * timeline events, life topics, and difficult passages.
 * Includes reference parsing for direct chapter/verse navigation.
 * Groups ordered by relevance — best name matches first.
 */

import React, { useState, useRef, useMemo, useCallback } from 'react';
import { View, Text, TouchableOpacity, SectionList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useScrollToTop } from '@react-navigation/native';
import {
  Search as SearchIcon, BookOpen, Users, Compass, MapPin,
  Clock, Heart, HelpCircle, ArrowRight,
} from 'lucide-react-native';
import { useSearch, buildOrderedGroups } from '../hooks/useSearch';
import type { SearchResultGroup, ParsedReference } from '../hooks/useSearch';
import { SearchInput } from '../components/SearchInput';
import { useTheme, spacing, radii, fontFamily, panels } from '../theme';
import type { Person, Book, MapStory, TimelineEntry, Verse, DifficultPassage, Concept, LifeTopic } from '../types';
import { withErrorBoundary } from '../components/ScreenErrorBoundary';

const INITIAL_VERSE_LIMIT = 20;
const LOAD_MORE_INCREMENT = 30;

// ── Section icons & colors by group key ─────────────────────────────

const GROUP_META: Record<string, { Icon: any; colorKey: string }> = {
  books:              { Icon: BookOpen,   colorKey: 'gold' },
  people:             { Icon: Users,      colorKey: 'gold' },
  concepts:           { Icon: Compass,    colorKey: 'gold' },
  difficultPassages:  { Icon: HelpCircle, colorKey: 'gold' },
  mapStories:         { Icon: MapPin,     colorKey: 'gold' },
  timelineEvents:     { Icon: Clock,      colorKey: 'gold' },
  lifeTopics:         { Icon: Heart,      colorKey: 'gold' },
  verses:             { Icon: BookOpen,   colorKey: 'gold' },
};

function SearchScreen() {
  const { base, eras } = useTheme();
  const navigation = useNavigation<any>();
  const [query, setQuery] = useState('');
  const [verseLimit, setVerseLimit] = useState(INITIAL_VERSE_LIMIT);
  const { results, isLoading } = useSearch(query);
  const listRef = useRef<SectionList>(null);
  useScrollToTop(listRef);

  const handleQueryChange = useCallback((text: string) => {
    setQuery(text);
    setVerseLimit(INITIAL_VERSE_LIMIT);
  }, []);

  const trimmed = query.trim();

  // Build ordered groups, cap verses at verseLimit
  const groups = useMemo(() => {
    const ordered = buildOrderedGroups(results, trimmed);
    return ordered.map((g) => {
      if (g.key === 'verses') {
        const sliced = g.data.slice(0, verseLimit);
        const hasMore = g.data.length > verseLimit;
        return {
          ...g,
          data: [
            ...sliced.map((v: Verse) => ({ type: g.key, item: v })),
            ...(hasMore ? [{ type: 'loadMore', item: null }] : []),
          ],
        };
      }
      return { ...g, data: g.data.map((item: any) => ({ type: g.key, item })) };
    });
  }, [results, trimmed, verseLimit]);

  // Prepend reference result as its own section
  const sections = useMemo(() => {
    const s: { title: string; key: string; data: any[] }[] = [];
    if (results.reference) {
      s.push({
        title: 'Go To',
        key: 'reference',
        data: [{ type: 'reference', item: results.reference }],
      });
    }
    for (const g of groups) {
      s.push({ title: g.label, key: g.key, data: g.data });
    }
    return s;
  }, [results.reference, groups]);

  const hasResults = sections.length > 0;

  // ── Navigation handlers ─────────────────────────────────────────

  const goToChapter = useCallback((bookId: string, chapterNum: number, verseNum?: number) => {
    navigation.navigate('ReadTab', {
      screen: 'Chapter',
      params: { bookId, chapterNum, verseNum },
    });
  }, [navigation]);

  const goToExplore = useCallback((screen: string, params: Record<string, any>) => {
    navigation.navigate('ExploreTab', { screen, params });
  }, [navigation]);

  // ── Render items ────────────────────────────────────────────────

  const renderItem = useCallback(({ item: { type, item } }: { item: { type: string; item: any } }) => {
    if (type === 'loadMore') {
      return (
        <TouchableOpacity
          onPress={() => setVerseLimit((prev) => prev + LOAD_MORE_INCREMENT)}
          style={styles.loadMoreButton}
          accessibilityRole="button"
          accessibilityLabel="Load more verses"
        >
          <Text style={[styles.loadMoreText, { color: base.gold }]}>Load more verses</Text>
        </TouchableOpacity>
      );
    }

    if (type === 'reference') {
      const ref = item as ParsedReference;
      return (
        <TouchableOpacity
          onPress={() => goToChapter(ref.bookId, ref.chapter, ref.verse)}
          style={[styles.refRow, { backgroundColor: base.gold + '12', borderColor: base.gold + '30' }]}
          accessibilityRole="button"
          accessibilityLabel={`Go to ${ref.display}`}
        >
          <ArrowRight size={16} color={base.gold} />
          <Text style={[styles.refText, { color: base.gold }]}>{ref.display}</Text>
        </TouchableOpacity>
      );
    }

    if (type === 'books') {
      const b = item as Book;
      return (
        <TouchableOpacity
          onPress={() => navigation.navigate('ReadTab', { screen: 'ChapterList', params: { bookId: b.id } })}
          style={styles.row}
          accessibilityRole="button"
          accessibilityLabel={`Open ${b.name}`}
        >
          <BookOpen size={14} color={base.textMuted} />
          <View style={styles.rowText}>
            <Text style={[styles.rowTitle, { color: base.text }]}>{b.name}</Text>
            <Text style={[styles.rowSub, { color: base.textMuted }]}>
              {b.total_chapters} chapters · {b.testament === 'ot' ? 'Old Testament' : 'New Testament'}
            </Text>
          </View>
        </TouchableOpacity>
      );
    }

    if (type === 'people') {
      const p = item as Person;
      return (
        <TouchableOpacity
          onPress={() => goToExplore('PersonDetail', { personId: p.id })}
          style={styles.row}
          accessibilityRole="button"
          accessibilityLabel={`View ${p.name}`}
        >
          <View style={[styles.eraDot, { backgroundColor: p.era ? (eras[p.era] ?? base.textMuted) : base.textMuted }]} />
          <View style={styles.rowText}>
            <Text style={[styles.rowTitle, { color: base.text }]}>{p.name}</Text>
            {p.role ? <Text style={[styles.rowSub, { color: base.textMuted }]} numberOfLines={1}>{p.role}</Text> : null}
          </View>
        </TouchableOpacity>
      );
    }

    if (type === 'concepts') {
      const c = item as Concept;
      return (
        <TouchableOpacity
          onPress={() => goToExplore('ConceptDetail', { conceptId: c.id })}
          style={styles.row}
          accessibilityRole="button"
          accessibilityLabel={`Concept: ${c.name}`}
        >
          <Compass size={14} color={base.textMuted} />
          <View style={styles.rowText}>
            <Text style={[styles.rowTitle, { color: base.text }]}>{c.name}</Text>
            {c.description ? <Text style={[styles.rowSub, { color: base.textMuted }]} numberOfLines={1}>{c.description}</Text> : null}
          </View>
        </TouchableOpacity>
      );
    }

    if (type === 'difficultPassages') {
      const d = item as DifficultPassage;
      return (
        <TouchableOpacity
          onPress={() => goToExplore('DifficultPassageDetail', { passageId: d.id })}
          style={styles.row}
          accessibilityRole="button"
          accessibilityLabel={`Difficult passage: ${d.title}`}
        >
          <HelpCircle size={14} color={base.textMuted} />
          <View style={styles.rowText}>
            <Text style={[styles.rowTitle, { color: base.text }]}>{d.title}</Text>
            <Text style={[styles.rowSub, { color: base.textMuted }]} numberOfLines={1}>{d.passage}</Text>
          </View>
        </TouchableOpacity>
      );
    }

    if (type === 'mapStories') {
      const ms = item as MapStory;
      return (
        <TouchableOpacity
          onPress={() => goToExplore('Map', { storyId: ms.id })}
          style={styles.row}
          accessibilityRole="button"
          accessibilityLabel={`Map story: ${ms.name}`}
        >
          <MapPin size={14} color={base.textMuted} />
          <View style={styles.rowText}>
            <Text style={[styles.rowTitle, { color: base.text }]}>{ms.name}</Text>
            {ms.summary ? <Text style={[styles.rowSub, { color: base.textMuted }]} numberOfLines={1}>{ms.summary}</Text> : null}
          </View>
        </TouchableOpacity>
      );
    }

    if (type === 'timelineEvents') {
      const t = item as TimelineEntry;
      return (
        <TouchableOpacity
          onPress={() => goToExplore('Timeline', { eventId: t.id })}
          style={styles.row}
          accessibilityRole="button"
          accessibilityLabel={`Timeline: ${t.name}`}
        >
          <Clock size={14} color={base.textMuted} />
          <View style={styles.rowText}>
            <Text style={[styles.rowTitle, { color: base.text }]}>{t.name}</Text>
            <Text style={[styles.rowSub, { color: base.textMuted }]} numberOfLines={1}>
              {t.year != null ? `${Math.abs(t.year)} ${t.year < 0 ? 'BC' : 'AD'}` : ''}{t.summary ? ` · ${t.summary}` : ''}
            </Text>
          </View>
        </TouchableOpacity>
      );
    }

    if (type === 'lifeTopics') {
      const lt = item as LifeTopic;
      return (
        <TouchableOpacity
          onPress={() => goToExplore('LifeTopicDetail', { topicId: lt.id })}
          style={styles.row}
          accessibilityRole="button"
          accessibilityLabel={`Life topic: ${lt.title}`}
        >
          <Heart size={14} color={base.textMuted} />
          <View style={styles.rowText}>
            <Text style={[styles.rowTitle, { color: base.text }]}>{lt.title}</Text>
            {lt.subtitle ? <Text style={[styles.rowSub, { color: base.textMuted }]} numberOfLines={1}>{lt.subtitle}</Text> : null}
          </View>
        </TouchableOpacity>
      );
    }

    // Verses (default)
    const v = item as Verse;
    const displayName = (v as any).book_name ?? v.book_id;
    return (
      <TouchableOpacity
        onPress={() => goToChapter(v.book_id, v.chapter_num, v.verse_num)}
        style={styles.verseRow}
        accessibilityRole="button"
        accessibilityLabel={`Go to ${displayName} ${v.chapter_num}:${v.verse_num}`}
      >
        <Text style={[styles.verseRef, { color: base.gold }]}>
          {displayName} {v.chapter_num}:{v.verse_num}
        </Text>
        <Text style={[styles.verseText, { color: base.textDim }]} numberOfLines={2}>{v.text}</Text>
      </TouchableOpacity>
    );
  }, [base, eras, goToChapter, goToExplore, navigation]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: base.bg }]}>
      <View style={styles.inputWrapper}>
        <SearchInput
          value={query}
          onChangeText={handleQueryChange}
          placeholder="Search anything — or type a reference like Gen 3:15"
          autoFocus
        />
      </View>

      {trimmed.length < 2 ? (
        <View style={styles.emptyCenter}>
          <SearchIcon size={28} color={base.textMuted + '60'} />
          <Text style={[styles.emptyText, { color: base.textMuted }]}>
            Search books, people, concepts, verses, and more
          </Text>
        </View>
      ) : !hasResults && !isLoading ? (
        <View style={styles.emptyCenter}>
          <Text style={[styles.emptyText, { color: base.textMuted }]}>
            No results found for "{trimmed}"
          </Text>
        </View>
      ) : (
        <SectionList
          ref={listRef}
          sections={sections}
          keyExtractor={(item, i) => `${item.type}-${i}`}
          contentContainerStyle={styles.listContent}
          stickySectionHeadersEnabled={false}
          renderSectionHeader={({ section }) => (
            <View style={[styles.sectionHeader, { backgroundColor: base.bg }]}>
              <Text style={[styles.sectionTitle, { color: base.textMuted }]}>
                {section.title.toUpperCase()}
              </Text>
            </View>
          )}
          renderItem={renderItem}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  },
  sectionTitle: {
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
    fontFamily: fontFamily.bodyItalic,
    fontSize: 15,
  },
  // Reference row
  refRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.md,
    borderWidth: 1,
  },
  refText: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 15,
  },
  // Generic content row
  row: {
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
  rowText: {
    flex: 1,
  },
  rowTitle: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 14,
  },
  rowSub: {
    fontFamily: fontFamily.ui,
    fontSize: 11,
    marginTop: 1,
  },
  // Verse row
  verseRow: {
    paddingVertical: spacing.xs,
  },
  verseRef: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 12,
  },
  verseText: {
    fontFamily: fontFamily.ui,
    fontSize: 12,
  },
  // Load more
  loadMoreButton: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  loadMoreText: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 13,
  },
});

export default withErrorBoundary(SearchScreen);
