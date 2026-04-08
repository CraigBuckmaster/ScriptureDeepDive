/**
 * ConcordanceScreen — Shows every verse where a Hebrew/Greek word
 * (identified by Strong's number) appears across the Bible.
 *
 * Entry points:
 *   - InterlinearSheet "See all N occurrences" button
 *   - WordStudyDetailScreen concordance link
 *   - ExploreMenuScreen (manual search, no pre-filter)
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, FlatList, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Search, X } from 'lucide-react-native';
import type { ScreenNavProp, ScreenRouteProp } from '../navigation/types';
import { getConcordanceResults, getConcordanceCount } from '../db/content';
import { ConcordanceEntry } from '../components/ConcordanceEntry';
import { ScreenHeader } from '../components/ScreenHeader';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { useTheme, spacing, radii, fontFamily, MIN_TOUCH_TARGET } from '../theme';
import type { ConcordanceResult } from '../types';
import { withErrorBoundary } from '../components/ScreenErrorBoundary';

function ConcordanceScreen() {
  const { base, panels } = useTheme();
  const navigation = useNavigation<ScreenNavProp<'Explore', 'Concordance'>>();
  const route = useRoute<ScreenRouteProp<'Explore', 'Concordance'>>();
  const { strongs: initialStrongs, original, transliteration, gloss } = route.params ?? {};

  const [strongs, setStrongs] = useState(initialStrongs ?? '');
  const [searchInput, setSearchInput] = useState(initialStrongs ?? '');
  const [results, setResults] = useState<ConcordanceResult[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const runSearch = useCallback(async (s: string) => {
    const trimmed = s.trim().toUpperCase();
    if (!trimmed) return;
    setStrongs(trimmed);
    setLoading(true);
    setSearched(true);
    const [r, c] = await Promise.all([
      getConcordanceResults(trimmed),
      getConcordanceCount(trimmed),
    ]);
    setResults(r);
    setCount(c);
    setLoading(false);
  }, []);

  // Auto-search if opened with a Strong's number
  useEffect(() => {
    if (initialStrongs) runSearch(initialStrongs);
  }, [initialStrongs, runSearch]);

  const handleSubmit = () => runSearch(searchInput);

  const navigateToChapter = (item: ConcordanceResult) => {
    navigation.navigate('Chapter', {
      bookId: item.book_id,
      chapterNum: item.chapter_num,
    });
  };

  // Determine the accent color (Hebrew = pink, Greek = blue)
  const isHebrew = strongs.startsWith('H');
  const accentColor = isHebrew ? panels.heb.accent : panels.hist.accent;

  const headerTitle = original
    ? `${original} (${strongs})`
    : strongs
    ? strongs
    : 'Concordance';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: base.bg }]}>
      <ScreenHeader
        title="Concordance"
        onBack={() => navigation.goBack()}
        style={styles.header}
      />

      {/* Word info header (when opened with a specific word) */}
      {original ? (
        <View style={styles.wordInfo}>
          <Text style={[styles.originalWord, { color: accentColor }]}>{original}</Text>
          {transliteration ? (
            <Text style={[styles.transliteration, { color: base.goldDim }]}>{transliteration}</Text>
          ) : null}
          <View style={styles.metaRow}>
            <Text style={[styles.strongsBadge, { color: base.textMuted }]}>{strongs}</Text>
            {gloss ? <Text style={[styles.glossText, { color: base.textDim }]}>{gloss}</Text> : null}
            {count > 0 ? (
              <View style={[styles.countBadge, { backgroundColor: accentColor + '22' }]}>
                <Text style={[styles.countText, { color: accentColor }]}>
                  {count} {count === 1 ? 'verse' : 'verses'}
                </Text>
              </View>
            ) : null}
          </View>
        </View>
      ) : null}

      {/* Search bar (always visible, especially for manual entry) */}
      <View style={styles.searchRow}>
        <View style={[styles.searchInputWrap, { backgroundColor: base.bgElevated, borderColor: base.border }]}>
          <Search size={16} color={base.textMuted} />
          <TextInput
            ref={inputRef}
            style={[styles.searchInput, { color: base.text }]}
            placeholder="Enter Strong's number (e.g. H2617)"
            placeholderTextColor={base.textMuted}
            value={searchInput}
            onChangeText={setSearchInput}
            onSubmitEditing={handleSubmit}
            autoCapitalize="characters"
            autoCorrect={false}
            returnKeyType="search"
          />
          {searchInput ? (
            <TouchableOpacity onPress={() => { setSearchInput(''); inputRef.current?.focus(); }}>
              <X size={16} color={base.textMuted} />
            </TouchableOpacity>
          ) : null}
        </View>
        <TouchableOpacity style={[styles.searchBtn, { backgroundColor: base.gold + '22' }]} onPress={handleSubmit}>
          <Text style={[styles.searchBtnText, { color: base.gold }]}>Search</Text>
        </TouchableOpacity>
      </View>

      {/* Results */}
      {loading ? (
        <View style={styles.loadingWrap}>
          <LoadingSkeleton lines={5} height={60} />
        </View>
      ) : results.length > 0 ? (
        <FlatList
          data={results}
          keyExtractor={(item) => `${item.book_id}-${item.chapter_num}-${item.verse_num}`}
          renderItem={({ item }) => (
            <ConcordanceEntry
              result={item}
              gloss={gloss ?? item.gloss}
              onPress={() => navigateToChapter(item)}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          maxToRenderPerBatch={10}
          windowSize={5}
          initialNumToRender={15}
        />
      ) : searched ? (
        <View style={styles.emptyWrap}>
          <Text style={[styles.emptyText, { color: base.textDim }]}>
            No results found for {strongs}.
          </Text>
          <Text style={[styles.emptyHint, { color: base.textMuted }]}>
            Make sure the Strong's number is correct (e.g. H2617 for Hebrew, G26 for Greek).
          </Text>
        </View>
      ) : (
        <View style={styles.emptyWrap}>
          <Text style={[styles.emptyText, { color: base.textDim }]}>
            Find every verse where a Hebrew or Greek word appears across the entire Bible.
          </Text>
          <Text style={[styles.emptyHint, { color: base.textMuted }]}>
            Enter a Strong's number above, or tap a word in the Interlinear view to see all its occurrences.
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    marginBottom: 0,
    paddingHorizontal: spacing.md,
  },
  wordInfo: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  originalWord: {
    fontFamily: fontFamily.bodyMedium,
    fontSize: 32,
    textAlign: 'center',
  },
  transliteration: {
    fontFamily: fontFamily.bodyItalic,
    fontSize: 14,
    marginTop: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: spacing.xs,
  },
  strongsBadge: {
    fontFamily: fontFamily.ui,
    fontSize: 11,
  },
  glossText: {
    fontFamily: fontFamily.bodyItalic,
    fontSize: 13,
  },
  countBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radii.sm,
  },
  countText: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 11,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  searchInputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: radii.md,
    paddingHorizontal: spacing.sm,
    height: MIN_TOUCH_TARGET,
    gap: 6,
  },
  searchInput: {
    flex: 1,
    fontFamily: fontFamily.ui,
    fontSize: 14,
    paddingVertical: 0,
  },
  searchBtn: {
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    height: MIN_TOUCH_TARGET,
    justifyContent: 'center',
  },
  searchBtnText: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 13,
  },
  loadingWrap: {
    padding: spacing.md,
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  emptyWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  emptyText: {
    fontFamily: fontFamily.body,
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 24,
  },
  emptyHint: {
    fontFamily: fontFamily.ui,
    fontSize: 12,
    textAlign: 'center',
    marginTop: spacing.sm,
    lineHeight: 18,
  },
});

export default withErrorBoundary(ConcordanceScreen);
