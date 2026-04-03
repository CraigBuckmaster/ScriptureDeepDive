/**
 * DictionaryBrowseScreen — Alphabetical SectionList + FTS search + letter jump bar.
 *
 * ~3,900 entries from Easton's Bible Dictionary (1897). Search by term or
 * definition text via FTS5. Cross-link badges show when an entry overlaps
 * with People, Places, Word Studies, or Concepts.
 */

import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SectionList,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft, Search, X } from 'lucide-react-native';
import { useTheme, spacing, radii, fontFamily } from '../theme';
import { AlphabetBar } from '../components/AlphabetBar';
import { useDictionaryBrowse, type DictionarySection } from '../hooks/useDictionary';
import type { DictionaryEntryParsed } from '../types/dictionary';
import { CATEGORY_LABELS, type DictionaryCategory } from '../types/dictionary';
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
  const inputRef = useRef<TextInput>(null);

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

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: base.bg }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft size={22} color={base.gold} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: base.gold }]}>Bible Dictionary</Text>
      </View>

      {/* Search */}
      <View style={[styles.searchRow, { backgroundColor: base.bgElevated, borderColor: base.border }]}>
        <Search size={16} color={base.textMuted} />
        <TextInput
          ref={inputRef}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search dictionary..."
          placeholderTextColor={base.textMuted}
          style={[styles.searchInput, { color: base.text }]}
          autoCorrect={false}
          returnKeyType="search"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <X size={16} color={base.textMuted} />
          </TouchableOpacity>
        )}
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
        <View style={styles.center}>
          <ActivityIndicator color={base.gold} />
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  backBtn: {
    padding: spacing.xs,
    marginRight: spacing.xs,
  },
  title: {
    fontFamily: fontFamily.displaySemiBold,
    fontSize: 20,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.md,
    marginBottom: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 8,
    borderRadius: radii.md,
    borderWidth: 1,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontFamily: fontFamily.ui,
    fontSize: 14,
    padding: 0,
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
