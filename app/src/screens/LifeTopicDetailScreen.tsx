/**
 * LifeTopicDetailScreen — Full detail view of a life topic.
 *
 * Shows summary, key verses, body content, scholar perspectives,
 * and related topics. Premium gate on full content (summary visible
 * to free users, body/scholars/verses are premium).
 */

import React, { useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Share as ShareIcon } from 'lucide-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { ScreenNavProp, ScreenRouteProp } from '../navigation/types';
import { parseDotReference, parseReference } from '../utils/verseResolver';
import { shareLifeTopic } from '../utils/shareLifeTopic';
import { ScreenHeader } from '../components/ScreenHeader';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { CollapsibleSection } from '../components/CollapsibleSection';
import { UpgradePrompt } from '../components/UpgradePrompt';
import { VerseCard, ScholarQuoteCard, RelatedTopics, CommunityPerspectives } from '../components/lifetopics';
import { BadgeChip } from '../components/BadgeChip';
import { useLifeTopicDetail } from '../hooks/useLifeTopics';
import { useLifeTopicCategories } from '../hooks/useLifeTopics';
import { useSubmissionFeed } from '../hooks/useSubmissionFeed';
import { usePremium } from '../hooks/usePremium';
import { useTheme, spacing, fontFamily, MIN_TOUCH_TARGET } from '../theme';
import { withErrorBoundary } from '../components/ScreenErrorBoundary';

function LifeTopicDetailScreen() {
  const { base } = useTheme();
  const navigation = useNavigation<ScreenNavProp<'Explore', 'LifeTopicDetail'>>();
  const route = useRoute<ScreenRouteProp<'Explore', 'LifeTopicDetail'>>();
  const { topicId } = route.params;

  const { topic, verses, scholars, related, loading } = useLifeTopicDetail(topicId);
  const { data: categories } = useLifeTopicCategories();
  const { submissions: communitySubmissions } = useSubmissionFeed('newest', topicId);
  const { isPremium, upgradeRequest, showUpgrade, dismissUpgrade } = usePremium();

  const categoryName = categories.find((c) => c.id === topic?.category_id)?.name;

  const handleVersePress = useCallback(
    (ref: string) => {
      const parsed = parseDotReference(ref) ?? parseReference(ref);
      if (parsed) {
        navigation.push('Chapter', { bookId: parsed.bookId, chapterNum: parsed.chapter, verseNum: parsed.verseStart });
      }
    },
    [navigation],
  );

  const handleSubmissionPress = useCallback(
    (submissionId: string) => {
      navigation.push('SubmissionDetail' as any, { submissionId });
    },
    [navigation],
  );

  const handleRelatedPress = useCallback(
    (relatedTopicId: string) => {
      navigation.push('LifeTopicDetail', { topicId: relatedTopicId });
    },
    [navigation],
  );

  const handleShare = useCallback(() => {
    if (topic) {
      shareLifeTopic(topic.title, topic.summary, topicId);
    }
  }, [topic, topicId]);

  if (loading || !topic) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: base.bg }]}>
        <View style={styles.headerPad}>
          <ScreenHeader title="Life Topic" onBack={() => navigation.goBack()} />
        </View>
        <View style={styles.loadingPad}>
          {loading ? <LoadingSkeleton lines={8} /> : (
            <Text style={[styles.notFound, { color: base.textMuted }]}>Topic not found</Text>
          )}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: base.bg }]}>
      <View style={styles.headerPad}>
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <ScreenHeader title={topic.title} onBack={() => navigation.goBack()} />
          </View>
          <TouchableOpacity
            onPress={handleShare}
            style={styles.shareButton}
            accessibilityRole="button"
            accessibilityLabel="Share this topic"
          >
            <ShareIcon size={20} color={base.gold} />
          </TouchableOpacity>
        </View>
        {categoryName ? (
          <View style={styles.badgeRow}>
            <BadgeChip label={categoryName} />
          </View>
        ) : null}
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Summary card — always visible */}
        <View style={[styles.summaryCard, { backgroundColor: base.bgElevated, borderColor: base.border + '40' }]}>
          <Text style={[styles.summaryText, { color: base.text }]}>{topic.summary}</Text>
        </View>

        {/* Key verses — premium gated */}
        {isPremium && verses.length > 0 && (
          <CollapsibleSection title="Key Verses" initiallyCollapsed={false}>
            {verses.map((v: any) => (
              <VerseCard
                key={v.id ?? v.verse_ref}
                verseRef={v.verse_ref}
                annotation={v.annotation}
                isPrimary={!!v.is_primary}
                onPress={() => handleVersePress(v.verse_ref)}
              />
            ))}
          </CollapsibleSection>
        )}

        {/* Body content — premium gated */}
        {isPremium && topic.body ? (
          <View style={styles.bodySection}>
            <Text style={[styles.bodyText, { color: base.text }]}>{topic.body}</Text>
          </View>
        ) : null}

        {/* Scholar perspectives — premium gated */}
        {isPremium && scholars.length > 0 && (
          <CollapsibleSection title="Scholar Perspectives" initiallyCollapsed={false}>
            {scholars.map((s: any, idx: number) => (
              <ScholarQuoteCard
                key={s.id ?? idx}
                quote={s.quote ?? s.content ?? ''}
                scholarName={s.scholar_name ?? ''}
                tradition={s.tradition}
              />
            ))}
          </CollapsibleSection>
        )}

        {/* Community Perspectives */}
        {communitySubmissions.length > 0 && (
          <CommunityPerspectives
            submissions={communitySubmissions}
            onSubmissionPress={handleSubmissionPress}
          />
        )}

        {/* Related topics */}
        {related.length > 0 && (
          <CollapsibleSection title="Related Topics" initiallyCollapsed>
            <RelatedTopics topics={related} onPress={handleRelatedPress} />
          </CollapsibleSection>
        )}

        {/* Premium upsell for free users */}
        {!isPremium && (
          <View style={[styles.gateCard, { backgroundColor: base.bgElevated, borderColor: base.gold + '30' }]}>
            <Text style={[styles.gateIcon, { color: base.gold }]}>{'✦'}</Text>
            <Text style={[styles.gateTitle, { color: base.text }]}>
              Full topic guide available with Companion+
            </Text>
            <Text style={[styles.gateDesc, { color: base.textDim }]}>
              Unlock key verses, in-depth content, and scholar perspectives.
            </Text>
            <BadgeChip
              label="Learn More"
              onPress={() => showUpgrade('explore', 'Life Topics')}
            />
          </View>
        )}
      </ScrollView>

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
  headerPad: { paddingHorizontal: spacing.md, paddingTop: spacing.md },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerLeft: {
    flex: 1,
  },
  shareButton: {
    minWidth: MIN_TOUCH_TARGET,
    minHeight: MIN_TOUCH_TARGET,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeRow: {
    flexDirection: 'row',
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  scroll: { flex: 1 },
  scrollContent: { padding: spacing.md, paddingBottom: spacing.xxl },
  summaryCard: {
    borderWidth: 1,
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  summaryText: {
    fontFamily: fontFamily.body,
    fontSize: 14,
    lineHeight: 22,
  },
  bodySection: {
    marginBottom: spacing.md,
  },
  bodyText: {
    fontFamily: fontFamily.body,
    fontSize: 14,
    lineHeight: 22,
  },
  gateCard: {
    borderWidth: 1,
    borderRadius: 8,
    padding: spacing.lg,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  gateIcon: {
    fontSize: 24,
    marginBottom: spacing.sm,
  },
  gateTitle: {
    fontFamily: fontFamily.displayMedium,
    fontSize: 15,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  gateDesc: {
    fontFamily: fontFamily.body,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  loadingPad: { padding: spacing.lg },
  notFound: {
    fontFamily: fontFamily.ui,
    fontSize: 14,
    textAlign: 'center',
  },
});

export default withErrorBoundary(LifeTopicDetailScreen);
