/**
 * TopicDetailScreen — Full detail view of a biblical topic.
 *
 * Shows description, cross-links, collapsible subtopics with verse chains,
 * and auto-generated relevant chapters.
 */

import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { ScreenNavProp, ScreenRouteProp } from '../navigation/types';
import { parseReference } from '../utils/verseResolver';
import { ScreenHeader } from '../components/ScreenHeader';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { CollapsibleSection } from '../components/CollapsibleSection';
import { TopicVerseChain } from '../components/TopicVerseChain';
import { TopicCrossLinks } from '../components/TopicCrossLinks';
import { BadgeChip } from '../components/BadgeChip';
import { useTopicDetail } from '../hooks/useTopicDetail';
import { CATEGORY_LABELS } from '../hooks/useTopicData';
import { useTheme, spacing, fontFamily } from '../theme';
import type { Subtopic } from '../types/topic';
import { withErrorBoundary } from '../components/ScreenErrorBoundary';

function TopicDetailScreen() {
  const { base } = useTheme();
  const navigation = useNavigation<ScreenNavProp<'Explore', 'TopicDetail'>>();
  const route = useRoute<ScreenRouteProp<'Explore', 'TopicDetail'>>();
  const { topicId } = route.params;

  const { topic, relatedConcepts, relatedThreads, relatedProphecyChains, loading } = useTopicDetail(topicId);

  const handleVersePress = (ref: string) => {
    const parsed = parseReference(ref);
    if (parsed) {
      navigation.push('Chapter', { bookId: parsed.bookId, chapterNum: parsed.chapter });
    }
  };

  if (loading || !topic) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: base.bg }]}>
        <View style={styles.headerPad}>
          <ScreenHeader title="Topic" onBack={() => navigation.goBack()} />
        </View>
        <View style={styles.loadingPad}>
          {loading ? <LoadingSkeleton lines={8} /> : (
            <Text style={[styles.notFound, { color: base.textMuted }]}>Topic not found</Text>
          )}
        </View>
      </SafeAreaView>
    );
  }

  let subtopics: Subtopic[] = [];
  try { subtopics = JSON.parse(topic.subtopics_json); } catch { /* */ }

  let relevantChapters: string[] = [];
  try { relevantChapters = JSON.parse(topic.relevant_chapters_json || '[]'); } catch { /* */ }

  const categoryLabel = CATEGORY_LABELS[topic.category] ?? topic.category;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: base.bg }]}>
      <View style={styles.headerPad}>
        <ScreenHeader title={topic.title} onBack={() => navigation.goBack()} />
        <Text style={[styles.categorySubtitle, { color: base.textMuted }]}>{categoryLabel}</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Description */}
        <Text style={[styles.description, { color: base.text }]}>{topic.description}</Text>

        {/* Cross-links */}
        <TopicCrossLinks
          concepts={relatedConcepts}
          threads={relatedThreads}
          prophecyChains={relatedProphecyChains}
          onConceptPress={(id) => navigation.push('ConceptDetail', { conceptId: id })}
          onThreadPress={() => { /* ThreadViewerSheet is a modal, would need different handling */ }}
          onProphecyPress={(id) => navigation.push('ProphecyDetail', { chainId: id })}
        />

        {/* Subtopics with verse chains */}
        {subtopics.map((st, idx) => (
          <CollapsibleSection
            key={`${st.label}-${idx}`}
            title={st.label}
            initiallyCollapsed={idx >= 2}
          >
            <TopicVerseChain verses={st.verses} onVersePress={handleVersePress} />
          </CollapsibleSection>
        ))}

        {/* Relevant chapters */}
        {relevantChapters.length > 0 && (
          <CollapsibleSection title="Relevant Chapters" initiallyCollapsed>
            <View style={styles.chipsRow}>
              {relevantChapters.map((chapterId) => {
                const parts = chapterId.split('_');
                const chNum = parts.pop();
                const bookId = parts.join('_');
                const label = `${bookId.replace(/_/g, ' ')} ${chNum}`;
                return (
                  <BadgeChip
                    key={chapterId}
                    label={label}
                    onPress={() => {
                      navigation.push('Chapter', {
                        bookId,
                        chapterNum: parseInt(chNum ?? '1', 10),
                      });
                    }}
                  />
                );
              })}
            </View>
          </CollapsibleSection>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingPad: { padding: spacing.lg },
  headerPad: { paddingHorizontal: spacing.md, paddingTop: spacing.md },
  categorySubtitle: {
    fontFamily: fontFamily.ui,
    fontSize: 11,
    marginTop: 2,
    marginBottom: spacing.sm,
  },
  scroll: { flex: 1 },
  scrollContent: { padding: spacing.md, paddingBottom: spacing.xxl },
  description: {
    fontFamily: fontFamily.body,
    fontSize: 14,
    lineHeight: 22,
    marginBottom: spacing.sm,
  },
  notFound: {
    fontFamily: fontFamily.ui,
    fontSize: 14,
    textAlign: 'center',
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
});

export default withErrorBoundary(TopicDetailScreen);
