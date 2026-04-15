/**
 * TopicBrowseScreen — Searchable, category-grouped browse of biblical topics.
 *
 * SectionList when browsing, FlatList when searching (FTS5).
 */

import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { ScreenNavProp } from '../navigation/types';
import { ScreenHeader } from '../components/ScreenHeader';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { BrowseScreenTemplate } from '../components/BrowseScreenTemplate';
import { useTopicData, CATEGORY_LABELS } from '../hooks/useTopicData';
import { useTheme, spacing, radii, fontFamily } from '../theme';
import type { Topic } from '../types/topic';
import type { Subtopic } from '../types/topic';
import { withErrorBoundary } from '../components/ScreenErrorBoundary';

function getTopicMeta(topic: Topic): { verseCount: number; subtopicCount: number } {
  let subtopics: Subtopic[] = [];
  try { subtopics = JSON.parse(topic.subtopics_json); } catch { /* */ }
  const verseCount = subtopics.reduce((sum, st) => sum + st.verses.length, 0);
  return { verseCount, subtopicCount: subtopics.length };
}

function hasConceptLinks(topic: Topic): boolean {
  try {
    const ids = JSON.parse(topic.related_concept_ids_json || '[]');
    return Array.isArray(ids) && ids.length > 0;
  } catch { return false; }
}

interface TopicRowProps {
  topic: Topic;
  onPress: () => void;
  base: any;
}

function TopicRow({ topic, onPress, base }: TopicRowProps) {
  const { verseCount, subtopicCount } = getTopicMeta(topic);
  const showConceptBadge = hasConceptLinks(topic);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[styles.entryRow, { borderBottomColor: base.border + '40' }]}
    >
      <Text style={[styles.entryTitle, { color: base.text }]}>{topic.title}</Text>
      <Text style={[styles.entryDesc, { color: base.textDim }]} numberOfLines={2}>
        {topic.description}
      </Text>
      <View style={styles.metaRow}>
        <Text style={[styles.metaText, { color: base.textMuted }]}>
          {verseCount} {verseCount === 1 ? 'verse' : 'verses'} · {subtopicCount} {subtopicCount === 1 ? 'subtopic' : 'subtopics'}
        </Text>
        {showConceptBadge && (
          <Text style={[styles.crossLinkBadge, { color: base.gold }]}>✦ Concept</Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

function TopicBrowseScreen() {
  const { base } = useTheme();
  const navigation = useNavigation<ScreenNavProp<'Explore', 'TopicBrowse'>>();
  const {
    sections, categories, loading,
    search, setSearch, searchResults,
    categoryFilter, setCategoryFilter,
  } = useTopicData();

  const isSearching = search.length >= 2;

  const handleTopicPress = useCallback(
    (topicId: string) => {
      navigation.push('TopicDetail', { topicId });
    },
    [navigation]
  );

  const renderTopicItem = useCallback(
    ({ item }: { item: Topic }) => (
      <TopicRow topic={item} onPress={() => handleTopicPress(item.id)} base={base} />
    ),
    [base, handleTopicPress]
  );

  // Topic has a dual-mode layout (SectionList browse / FlatList search) similar to Dictionary,
  // so we keep a lightweight custom shell but use shared header components.
  const filterBar = !isSearching ? (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillRow}>
      {['all', ...categories].map((cat) => {
        const active = categoryFilter === cat;
        const label = cat === 'all' ? 'All' : (CATEGORY_LABELS[cat] ?? cat);
        return (
          <TouchableOpacity
            key={cat}
            onPress={() => setCategoryFilter(cat)}
            style={[styles.pill, { borderColor: base.border }, active && { borderColor: base.gold + '55', backgroundColor: base.gold + '12' }]}
          >
            <Text style={[styles.pillText, { color: base.textMuted }, active && { color: base.gold }]}>
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  ) : null;

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: base.bg }]}>
        <View style={styles.headerPad}>
          <ScreenHeader title="Topical Index" onBack={() => navigation.goBack()} />
        </View>
        <View style={styles.loadingPad}><LoadingSkeleton lines={6} /></View>
      </SafeAreaView>
    );
  }

  if (isSearching) {
    return (
      <BrowseScreenTemplate<Topic>
        title="Topical Index"
        loading={false}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search topics..."
        data={searchResults ?? []}
        renderItem={renderTopicItem}
        keyExtractor={(item) => item.id}
        emptyMessage={`No topics found for "${search}"`}
        contentContainerStyle={styles.listPad}
      />
    );
  }

  const sectionListData = sections.map((s) => ({
    title: s.label.toUpperCase(),
    data: s.data,
  }));

  return (
    <BrowseScreenTemplate<Topic>
      title="Topical Index"
      loading={false}
      search={search}
      onSearchChange={setSearch}
      searchPlaceholder="Search topics..."
      filterBar={filterBar}
      mode="section"
      sections={sectionListData}
      keyExtractor={(item) => item.id}
      renderSectionHeader={({ section }) => (
        <View style={[styles.sectionHeader, { borderBottomColor: base.gold + '25', backgroundColor: base.bg }]}>
          <Text style={[styles.sectionHeaderText, { color: base.gold }]}>
            {section.title}
          </Text>
        </View>
      )}
      renderItem={renderTopicItem}
      emptyMessage="No topics found"
      contentContainerStyle={styles.listPad}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerPad: { paddingHorizontal: spacing.md, paddingTop: spacing.lg },
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
  listPad: { paddingHorizontal: spacing.md },
  sectionHeader: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.xs,
    borderBottomWidth: 1,
    marginBottom: spacing.xs,
  },
  sectionHeaderText: {
    fontFamily: fontFamily.display,
    fontSize: 10,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  entryRow: {
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  entryTitle: {
    fontFamily: fontFamily.displayMedium,
    fontSize: 14,
  },
  entryDesc: {
    fontFamily: fontFamily.body,
    fontSize: 12,
    marginTop: 3,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: spacing.sm,
  },
  metaText: {
    fontFamily: fontFamily.ui,
    fontSize: 10,
  },
  crossLinkBadge: {
    fontFamily: fontFamily.ui,
    fontSize: 10,
  },
  loadingPad: {
    padding: spacing.lg,
  },
});

export default withErrorBoundary(TopicBrowseScreen);
