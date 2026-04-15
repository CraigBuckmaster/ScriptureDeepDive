/**
 * GrammarBrowseScreen — Browse grammar articles by language (Greek/Hebrew tabs)
 * and category, with search. Premium gated for full article access.
 *
 * Card #1359 (UI polish phase 2): migrated to BrowseScreenTemplate in
 * SectionList mode with BrowseSectionHeader for category grouping, and
 * BrowseFilterPill for the language tabs.
 */

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme, spacing, fontFamily } from '../theme';
import {
  BrowseScreenTemplate,
  BrowseFilterPill,
  BrowseSectionHeader,
} from '../components/BrowseScreenTemplate';
import { withErrorBoundary } from '../components/ScreenErrorBoundary';
import { getGrammarArticles, searchGrammarArticles } from '../db/content/grammar';
import type { GrammarArticle } from '../types';
import type { ScreenNavProp } from '../navigation/types';

type Nav = ScreenNavProp<'Explore', 'GrammarBrowse'>;

const LANGUAGE_TABS = [
  { key: 'greek', label: 'Greek' },
  { key: 'hebrew', label: 'Hebrew' },
] as const;

function GrammarBrowseScreen() {
  const { base } = useTheme();
  const navigation = useNavigation<Nav>();
  const [language, setLanguage] = useState<'greek' | 'hebrew'>('greek');
  const [articles, setArticles] = useState<GrammarArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<GrammarArticle[]>([]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    getGrammarArticles(language).then((a) => {
      setArticles(a);
      setLoading(false);
    });
  }, [language]);

  useEffect(() => {
    if (searchQuery.length < 2) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSearchResults([]);
      return;
    }
    searchGrammarArticles(searchQuery).then(setSearchResults);
  }, [searchQuery]);

  const handleArticlePress = useCallback(
    (article: GrammarArticle) => {
      navigation.navigate('GrammarArticle', { articleId: article.id });
    },
    [navigation]
  );

  const isSearching = searchQuery.length >= 2;
  const displayData = isSearching ? searchResults : articles;

  // Group articles by category for SectionList.
  const sections = useMemo(() => {
    const map = new Map<string, GrammarArticle[]>();
    for (const a of displayData) {
      const cat = a.category || 'General';
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(a);
    }
    return Array.from(map.entries()).map(([title, data]) => ({ title, data }));
  }, [displayData]);

  const renderItem = useCallback(
    ({ item }: { item: GrammarArticle }) => (
      <TouchableOpacity
        onPress={() => handleArticlePress(item)}
        activeOpacity={0.6}
        style={[styles.articleRow, { borderBottomColor: base.border }]}
      >
        <View style={styles.articleContent}>
          <Text style={[styles.articleTitle, { color: base.text }]} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={[styles.articleSummary, { color: base.textDim }]} numberOfLines={2}>
            {item.summary}
          </Text>
        </View>
      </TouchableOpacity>
    ),
    [base, handleArticlePress]
  );

  const renderSectionHeader = useCallback(
    ({ section }: { section: { title: string; data: GrammarArticle[] } }) => (
      <BrowseSectionHeader title={section.title.toUpperCase()} />
    ),
    [],
  );

  const filterBar = !isSearching ? (
    <View style={styles.tabRow}>
      {LANGUAGE_TABS.map((tab) => (
        <BrowseFilterPill
          key={tab.key}
          label={tab.label}
          active={language === tab.key}
          onPress={() => setLanguage(tab.key)}
          role="tab"
        />
      ))}
    </View>
  ) : null;

  return (
    <BrowseScreenTemplate
      title="Grammar Reference"
      loading={loading}
      search={searchQuery}
      onSearchChange={setSearchQuery}
      searchPlaceholder="Search grammar articles..."
      filterBar={filterBar}
      mode="section"
      sections={sections}
      renderItem={renderItem}
      renderSectionHeader={renderSectionHeader}
      keyExtractor={(a: GrammarArticle) => a.id}
      emptyMessage={
        isSearching
          ? `No articles found for "${searchQuery}"`
          : 'No grammar articles available yet.'
      }
    />
  );
}

const styles = StyleSheet.create({
  tabRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingBottom: spacing.sm,
  },
  articleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 64,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  articleContent: {
    flex: 1,
  },
  articleTitle: {
    fontFamily: fontFamily.displayMedium,
    fontSize: 14,
  },
  articleSummary: {
    fontFamily: fontFamily.ui,
    fontSize: 12,
    marginTop: 3,
    lineHeight: 16,
  },
});

export default withErrorBoundary(GrammarBrowseScreen);
