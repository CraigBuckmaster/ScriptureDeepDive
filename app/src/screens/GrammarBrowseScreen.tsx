/**
 * GrammarBrowseScreen — Browse grammar articles by language (Greek/Hebrew tabs)
 * and category, with search. Premium gated for full article access.
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, FlatList, StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme, spacing, radii, fontFamily } from '../theme';
import { ScreenHeader } from '../components/ScreenHeader';
import { SearchInput } from '../components/SearchInput';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
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
    setLoading(true);
    getGrammarArticles(language).then((a) => {
      setArticles(a);
      setLoading(false);
    });
  }, [language]);

  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }
    searchGrammarArticles(searchQuery).then(setSearchResults);
  }, [searchQuery]);

  const handleArticlePress = useCallback(
    (article: GrammarArticle) => {
      (navigation as any).navigate('GrammarArticle', { articleId: article.id });
    },
    [navigation]
  );

  const isSearching = searchQuery.length >= 2;
  const displayData = isSearching ? searchResults : articles;

  // Group articles by category
  const categories = React.useMemo(() => {
    const map = new Map<string, GrammarArticle[]>();
    for (const a of displayData) {
      const cat = a.category || 'General';
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(a);
    }
    return Array.from(map.entries());
  }, [displayData]);

  const renderArticle = useCallback(
    (item: GrammarArticle) => (
      <TouchableOpacity
        key={item.id}
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

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: base.bg }]}>
      <View style={styles.topSection}>
        <ScreenHeader
          title="Grammar Reference"
          onBack={() => navigation.goBack()}
          style={styles.headerSpacing}
        />
        <View style={styles.searchWrap}>
          <SearchInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search grammar articles..."
          />
        </View>

        {/* Language tabs */}
        {!isSearching && (
          <View style={styles.tabRow}>
            {LANGUAGE_TABS.map((tab) => {
              const isActive = language === tab.key;
              return (
                <TouchableOpacity
                  key={tab.key}
                  onPress={() => setLanguage(tab.key)}
                  style={[
                    styles.tab,
                    { borderColor: isActive ? base.gold : base.border },
                    isActive && { backgroundColor: base.gold + '10' },
                  ]}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: isActive }}
                >
                  <Text
                    style={[
                      styles.tabText,
                      { color: isActive ? base.gold : base.textMuted },
                    ]}
                  >
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.loadingPad}>
          <LoadingSkeleton lines={6} />
        </View>
      ) : displayData.length === 0 ? (
        <View style={styles.center}>
          <Text style={[styles.emptyText, { color: base.textDim }]}>
            {isSearching
              ? `No articles found for "${searchQuery}"`
              : 'No grammar articles available yet.'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={categories}
          keyExtractor={([cat]) => cat}
          renderItem={({ item: [category, items] }) => (
            <View>
              <View style={[styles.categoryHeader, { backgroundColor: base.bgElevated }]}>
                <Text style={[styles.categoryText, { color: base.gold }]}>
                  {category.toUpperCase()}
                </Text>
              </View>
              {items.map(renderArticle)}
            </View>
          )}
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
  tabRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.xs + 2,
    borderWidth: 1,
    borderRadius: radii.pill,
    alignItems: 'center',
  },
  tabText: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 13,
  },
  loadingPad: {
    padding: spacing.lg,
  },
  categoryHeader: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
  },
  categoryText: {
    fontFamily: fontFamily.displaySemiBold,
    fontSize: 11,
    letterSpacing: 0.8,
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

export default withErrorBoundary(GrammarBrowseScreen);
