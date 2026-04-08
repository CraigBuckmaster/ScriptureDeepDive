/**
 * LifeTopicsScreen — Browse life topics by category with search.
 *
 * Shows a 2-column category grid by default. Tapping a category filters
 * to show topics in that category. Search uses FTS via searchLifeTopics.
 * Premium gate: shows UpgradePrompt for non-premium users with a teaser.
 */

import React, { useCallback, useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { UserPlus } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { ScreenNavProp } from '../navigation/types';
import { ScreenHeader } from '../components/ScreenHeader';
import { SearchInput } from '../components/SearchInput';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { UpgradePrompt } from '../components/UpgradePrompt';
import { TopicListItem } from '../components/lifetopics';
import {
  useLifeTopicCategories,
  useLifeTopics,
  useLifeTopicSearch,
} from '../hooks/useLifeTopics';
import { usePremium } from '../hooks/usePremium';
import { useFollowingFeed, type FeedItem } from '../hooks/useFollowingFeed';
import { useTheme, spacing, radii, fontFamily } from '../theme';
import type { LifeTopic } from '../types';
import { withErrorBoundary } from '../components/ScreenErrorBoundary';

type TabMode = 'browse' | 'following';

function LifeTopicsScreen() {
  const { base } = useTheme();
  const navigation = useNavigation<ScreenNavProp<'Explore', 'LifeTopics'>>();
  const { isPremium, upgradeRequest, showUpgrade, dismissUpgrade } = usePremium();

  const [activeTab, setActiveTab] = useState<TabMode>('browse');
  const { data: categories, loading: catLoading } = useLifeTopicCategories();
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const { data: topics, loading: topicsLoading } = useLifeTopics(selectedCategory);
  const { search, setSearch, results: searchResults, searching } = useLifeTopicSearch();
  const { feed, loading: feedLoading, hasFollows } = useFollowingFeed();

  const isSearching = search.length >= 2;

  // Build a map of category id -> name for badges
  const categoryMap = useMemo(() => {
    const map: Record<string, string> = {};
    categories.forEach((c) => { map[c.id] = c.name; });
    return map;
  }, [categories]);

  const handleTopicPress = useCallback(
    (topicId: string) => {
      if (!isPremium) {
        showUpgrade('explore', 'Life Topics');
        return;
      }
      navigation.push('LifeTopicDetail', { topicId });
    },
    [navigation, isPremium, showUpgrade],
  );

  const handleCategoryPress = useCallback(
    (categoryId: string) => {
      setSelectedCategory((prev) => (prev === categoryId ? undefined : categoryId));
      setSearch('');
    },
    [setSearch],
  );

  const renderTopicItem = useCallback(
    ({ item }: { item: LifeTopic }) => (
      <TopicListItem
        title={item.title}
        subtitle={item.subtitle ?? item.summary}
        categoryName={categoryMap[item.category_id]}
        onPress={() => handleTopicPress(item.id)}
      />
    ),
    [categoryMap, handleTopicPress],
  );

  const renderFeedItem = useCallback(
    ({ item }: { item: FeedItem }) => (
      <TouchableOpacity
        onPress={() => item.target_id && handleTopicPress(item.target_id)}
        style={[styles.feedCard, { backgroundColor: base.bgElevated, borderColor: base.border + '40' }]}
        activeOpacity={0.7}
      >
        <Text style={[styles.feedTitle, { color: base.text }]} numberOfLines={1}>{item.title}</Text>
        <Text style={[styles.feedBody, { color: base.textDim }]} numberOfLines={2}>{item.body}</Text>
        {item.author_name && (
          <Text style={[styles.feedAuthor, { color: base.textMuted }]}>by {item.author_name}</Text>
        )}
      </TouchableOpacity>
    ),
    [base, handleTopicPress],
  );

  // Tab bar component
  const tabBar = (
    <View style={styles.tabBar}>
      {(['browse', 'following'] as TabMode[]).map((tab) => {
        const active = activeTab === tab;
        return (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={[
              styles.tab,
              { borderColor: active ? base.gold : 'transparent' },
            ]}
          >
            <Text
              style={[
                styles.tabText,
                { color: active ? base.gold : base.textMuted },
              ]}
            >
              {tab === 'browse' ? 'Browse' : 'Following'}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  const loading = catLoading || topicsLoading;

  if (loading && !isSearching && activeTab === 'browse') {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: base.bg }]}>
        <View style={styles.headerPad}>
          <ScreenHeader title="Life Topics" onBack={() => navigation.goBack()} />
          {tabBar}
        </View>
        <View style={styles.loadingPad}><LoadingSkeleton lines={6} /></View>
      </SafeAreaView>
    );
  }

  // Search mode
  if (isSearching) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: base.bg }]}>
        <View style={styles.headerPad}>
          <ScreenHeader title="Life Topics" onBack={() => navigation.goBack()} />
          <View style={styles.searchWrap}>
            <SearchInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search life topics..."
            />
          </View>
        </View>
        {searching ? (
          <View style={styles.loadingPad}><LoadingSkeleton lines={4} /></View>
        ) : (
          <FlatList
            data={searchResults}
            keyExtractor={(item) => item.id}
            renderItem={renderTopicItem}
            contentContainerStyle={styles.listPad}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Text style={[styles.emptyText, { color: base.textMuted }]}>
                  {`No topics found for "${search}"`}
                </Text>
              </View>
            }
          />
        )}

        {upgradeRequest && (
          <UpgradePrompt
            visible
            variant={upgradeRequest.variant}
            featureName={upgradeRequest.featureName}
            onClose={dismissUpgrade}
          />
        )}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: base.bg }]}>
      <View style={styles.headerPad}>
        <ScreenHeader title="Life Topics" onBack={() => navigation.goBack()} />
        {tabBar}

        {activeTab === 'browse' && (
          <>
            <View style={styles.searchWrap}>
              <SearchInput
                value={search}
                onChangeText={setSearch}
                placeholder="Search life topics..."
              />
            </View>

            {/* Category filter pills */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.pillRow}
            >
              <TouchableOpacity
                onPress={() => setSelectedCategory(undefined)}
                style={[
                  styles.pill,
                  { borderColor: base.border },
                  !selectedCategory && {
                    borderColor: base.gold + '55',
                    backgroundColor: base.gold + '12',
                  },
                ]}
              >
                <Text
                  style={[
                    styles.pillText,
                    { color: base.textMuted },
                    !selectedCategory && { color: base.gold },
                  ]}
                >
                  All
                </Text>
              </TouchableOpacity>
              {categories.map((cat) => {
                const active = selectedCategory === cat.id;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    onPress={() => handleCategoryPress(cat.id)}
                    style={[
                      styles.pill,
                      { borderColor: base.border },
                      active && {
                        borderColor: base.gold + '55',
                        backgroundColor: base.gold + '12',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.pillText,
                        { color: base.textMuted },
                        active && { color: base.gold },
                      ]}
                    >
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </>
        )}
      </View>

      {activeTab === 'browse' ? (
        <FlatList
          data={topics}
          keyExtractor={(item) => item.id}
          renderItem={renderTopicItem}
          contentContainerStyle={styles.listPad}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={[styles.emptyText, { color: base.textMuted }]}>
                {selectedCategory ? 'No topics in this category' : 'No topics available'}
              </Text>
            </View>
          }
        />
      ) : (
        /* Following tab */
        feedLoading ? (
          <View style={styles.loadingPad}><LoadingSkeleton lines={4} /></View>
        ) : !hasFollows ? (
          /* Empty state with follow suggestions */
          <View style={styles.followEmptyState}>
            <UserPlus size={36} color={base.textMuted} />
            <Text style={[styles.followEmptyTitle, { color: base.text }]}>
              Follow topics to see updates here
            </Text>
            <Text style={[styles.followEmptyBody, { color: base.textMuted }]}>
              Browse life topics and tap the Follow button to get personalized updates from topics that matter to you.
            </Text>
            <TouchableOpacity
              onPress={() => setActiveTab('browse')}
              style={[styles.followEmptyCta, { borderColor: base.gold }]}
            >
              <Text style={[styles.followEmptyCtaText, { color: base.gold }]}>Browse Topics</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={feed}
            keyExtractor={(item) => item.id}
            renderItem={renderFeedItem}
            contentContainerStyle={styles.listPad}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Text style={[styles.emptyText, { color: base.textMuted }]}>
                  No recent activity from topics you follow
                </Text>
              </View>
            }
          />
        )
      )}

      {/* Premium teaser for non-premium users */}
      {!isPremium && activeTab === 'browse' && (
        <View style={[styles.teaser, { backgroundColor: base.bgElevated, borderColor: base.gold + '30' }]}>
          <Text style={[styles.teaserText, { color: base.textDim }]}>
            Preview mode — upgrade to unlock full topic guides
          </Text>
          <TouchableOpacity onPress={() => showUpgrade('explore', 'Life Topics')}>
            <Text style={[styles.teaserCta, { color: base.gold }]}>Learn More</Text>
          </TouchableOpacity>
        </View>
      )}

      {upgradeRequest && (
        <UpgradePrompt
          visible
          variant={upgradeRequest.variant}
          featureName={upgradeRequest.featureName}
          onClose={dismissUpgrade}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerPad: { paddingHorizontal: spacing.md, paddingTop: spacing.lg },
  searchWrap: { marginBottom: spacing.sm },
  pillRow: { gap: spacing.xs, marginBottom: spacing.md },
  pill: {
    borderWidth: 1,
    borderRadius: radii.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  pillText: {
    fontFamily: fontFamily.display,
    fontSize: 10,
    letterSpacing: 0.3,
  },
  listPad: { paddingHorizontal: spacing.md, paddingBottom: spacing.xxl },
  columnWrapper: { gap: spacing.sm },
  loadingPad: { padding: spacing.lg },
  emptyState: { padding: spacing.xl, alignItems: 'center' },
  emptyText: { fontFamily: fontFamily.ui, fontSize: 14 },
  teaser: {
    borderTopWidth: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  teaserText: {
    fontFamily: fontFamily.ui,
    fontSize: 11,
    flex: 1,
  },
  teaserCta: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 12,
    marginLeft: spacing.sm,
  },
  tabBar: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
    gap: spacing.md,
  },
  tab: {
    paddingVertical: spacing.xs,
    borderBottomWidth: 2,
  },
  tabText: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 14,
    letterSpacing: 0.3,
  },
  feedCard: {
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  feedTitle: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 14,
    marginBottom: 2,
  },
  feedBody: {
    fontFamily: fontFamily.ui,
    fontSize: 13,
    lineHeight: 18,
  },
  feedAuthor: {
    fontFamily: fontFamily.ui,
    fontSize: 11,
    marginTop: 4,
  },
  followEmptyState: {
    padding: spacing.xxl,
    alignItems: 'center',
  },
  followEmptyTitle: {
    fontFamily: fontFamily.displaySemiBold,
    fontSize: 16,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  followEmptyBody: {
    fontFamily: fontFamily.ui,
    fontSize: 13,
    textAlign: 'center',
    marginTop: spacing.xs,
    lineHeight: 18,
    paddingHorizontal: spacing.lg,
  },
  followEmptyCta: {
    marginTop: spacing.lg,
    borderWidth: 1,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  followEmptyCtaText: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 13,
  },
});

export default withErrorBoundary(LifeTopicsScreen);
