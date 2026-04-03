/**
 * DictionaryBrowseScreen — Alphabetical SectionList + FTS search + letter jump bar.
 *
 * ~3,900 entries from Easton's Bible Dictionary (1897). Search by term or
 * definition text via FTS5. Cross-link badges show when an entry overlaps
 * with People, Places, Word Studies, or Concepts.
 *
 * NOTE: This screen has a dual-mode layout (SectionList for browsing,
 * FlatList for search results) with an AlphabetBar, so it uses
 * BrowseScreenTemplate in a more customized way via the renderItem-only
 * approach, keeping the AlphabetBar as a filter bar.
 */

import React, { useState, useCallback, useRef } from 'react';
import { View, Text, TouchableOpacity, SectionList, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme, spacing, radii, fontFamily } from '../theme';
import { AlphabetBar } from '../components/AlphabetBar';
import { ScreenHeader } from '../components/ScreenHeader';
import { SearchInput } from '../components/SearchInput';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { useDictionaryBrowse, type DictionarySection } from '../hooks/useDictionary';
import type { DictionaryEntryParsed } from '../types/dictionary';
import type { ScreenNavProp } from '../navigation/types';
import { withErrorBoundary } from '../components/ScreenErrorBoundary';

type Nav = ScreenNavProp<'Explore', 'DictionaryBrowse'>;

function DictionaryBrowseScreen() {
  const { base } = useTheme();
  const navigation = useNavigation<Nav>();
  const {
    sections,
    availableLetters,
    isLoading,
    searchQuery,
    setSearchQuery,
    searchResults,
  } = useDictionaryBrowse();

  const [activeLetter, setActiveLetter] = useState<string | null>(null);
  const sectionListRef = useRef<SectionList>(null);

  const handleLetterSelect = useCallback(
    (letter: string) => {
      setActiveLetter(letter);
      const idx = sections.findIndex((s) => s.letter === letter);
      if (idx >= 0 && sectionListRef.current) {
        sectionListRef.current.scrollToLocation({
          sectionIndex: idx,
          itemIndex: 0,
          animated: true,
        });
      }
    },
    [sections]
  );

  const handleEntryPress = useCallback(
    (entry: DictionaryEntryParsed) => {
      (navigation as any).navigate('DictionaryDetail', { entryId: entry.id });
    },
    [navigation]
  );

  const hasCrossLink = (entry: DictionaryEntryParsed) =>
    entry.crossLinks.personId ||
    entry.crossLinks.placeId ||
    entry.crossLinks.wordStudyId ||
    entry.crossLinks.conceptId;

  const renderEntry = useCallback(
    ({ item }: { item: DictionaryEntryParsed }) => (
      <TouchableOpacity
        onPress={() => handleEntryPress(item)}
        activeOpacity={0.6}
        style={[styles.entryRow, { borderBottomColor: base.border }]}
      >
        <View style={styles.entryContent}>
          <Text style={[styles.entryTerm, { color: base.text }]} numberOfLines={1}>
            {item.term}
          </Text>
          <Text style={[styles.entryPreview, { color: base.textDim }]} numberOfLines={2}>
            {item.definition}
          </Text>
        </View>
        {hasCrossLink(item) && (
          <View style={[styles.crossBadge, { backgroundColor: base.gold + '15' }]}>
            <Text style={[styles.crossBadgeText, { color: base.gold }]}>CS</Text>
          </View>
        )}
      </TouchableOpacity>
    ),
    [base, handleEntryPress]
  );

  const renderSectionHeader = useCallback(
    ({ section }: { section: DictionarySection }) => (
      <View style={[styles.sectionHeader, { backgroundColor: base.bgElevated }]}>
        <Text style={[styles.sectionLetter, { color: base.gold }]}>{section.letter}</Text>
      </View>
    ),
    [base]
  );

  const isSearching = searchQuery.length >= 2;

  // Dictionary has a unique dual-mode layout (SectionList + AlphabetBar vs FlatList search)
  // that doesn't cleanly fit the generic template, so we keep a lightweight custom shell
  // but still use ScreenHeader + SearchInput for consistency.
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: base.bg }]}>
      <View style={styles.topSection}>
        <ScreenHeader
          title="Bible Dictionary"
          onBack={() => navigation.goBack()}
          style={styles.headerSpacing}
        />
        <View style={styles.searchWrap}>
          <SearchInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search dictionary..."
          />
        </View>
      </View>

      {/* Alphabet bar (hidden during search) */}
      {!isSearching && (
        <AlphabetBar
          activeLetter={activeLetter}
          availableLetters={availableLetters}
          onSelect={handleLetterSelect}
        />
      )}

      {/* Content */}
      {isLoading ? (
        <View style={styles.loadingPad}>
          <LoadingSkeleton lines={6} />
        </View>
      ) : isSearching ? (
        searchResults && searchResults.length > 0 ? (
          <FlatList
            data={searchResults}
            keyExtractor={(item) => item.id}
            renderItem={renderEntry}
          />
        ) : (
          <View style={styles.center}>
            <Text style={[styles.emptyText, { color: base.textDim }]}>
              No entries found for "{searchQuery}"
            </Text>
          </View>
        )
      ) : (
        <SectionList
          ref={sectionListRef}
          sections={sections}
          keyExtractor={(item) => item.id}
          renderItem={renderEntry}
          renderSectionHeader={renderSectionHeader as any}
          stickySectionHeadersEnabled
          getItemLayout={(_data, index) => ({
            length: 72,
            offset: 72 * index,
            index,
          })}
          onScrollToIndexFailed={() => {}}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topSection: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
  },
  headerSpacing: {
    marginBottom: spacing.md,
  },
  searchWrap: {
    marginBottom: spacing.sm,
  },
  loadingPad: {
    padding: spacing.lg,
  },
  sectionHeader: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
  },
  sectionLetter: {
    fontFamily: fontFamily.displaySemiBold,
    fontSize: 14,
  },
  entryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 72,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  entryContent: {
    flex: 1,
  },
  entryTerm: {
    fontFamily: fontFamily.displayMedium,
    fontSize: 14,
  },
  entryPreview: {
    fontFamily: fontFamily.ui,
    fontSize: 12,
    marginTop: 3,
    lineHeight: 16,
  },
  crossBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radii.sm,
    marginLeft: spacing.xs,
  },
  crossBadgeText: {
    fontFamily: fontFamily.displayMedium,
    fontSize: 10,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyText: {
    fontFamily: fontFamily.ui,
    fontSize: 14,
    textAlign: 'center',
  },
});

export default withErrorBoundary(DictionaryBrowseScreen);
