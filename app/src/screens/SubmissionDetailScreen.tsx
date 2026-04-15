/**
 * SubmissionDetailScreen — Full view of a community submission.
 *
 * Shows title, author, trust badge, body content, verses,
 * and an engagement bar for upvote/star/share.
 */

import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { ScreenNavProp, ScreenRouteProp } from '../navigation/types';
import { ScreenHeader } from '../components/ScreenHeader';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { EngagementBar } from '../components/engagement';
import TrustBadge from '../components/TrustBadge';
import { useAsyncData } from '../hooks/useAsyncData';
import { useEngagement } from '../hooks/useEngagement';
import { useTheme, spacing, fontFamily } from '../theme';
import { withErrorBoundary } from '../components/ScreenErrorBoundary';
import { getSupabase } from '../lib/supabase';
import type { Submission } from '../types';

async function fetchSubmission(id: string): Promise<Submission | null> {
  const supabase = getSupabase();
  if (!supabase) return null;
  try {
    const { data } = await supabase
      .from('submissions')
      .select('*')
      .eq('id', id)
      .single();
    return data as Submission | null;
  } catch {
    return null;
  }
}

function SubmissionDetailScreen() {
  const { base } = useTheme();
  const navigation = useNavigation<ScreenNavProp<'Explore', 'SubmissionDetail'>>();
  const route = useRoute<ScreenRouteProp<'Explore', 'SubmissionDetail'>>();
  const { submissionId } = route.params;

  const { data: submission, loading } = useAsyncData(
    () => fetchSubmission(submissionId),
    [submissionId],
    null as Submission | null,
  );

  const engagement = useEngagement(submissionId);

  const verses: string[] = React.useMemo(() => {
    if (!submission?.verses_json) return [];
    try {
      return JSON.parse(submission.verses_json);
    } catch {
      return [];
    }
  }, [submission?.verses_json]);

  if (loading || !submission) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: base.bg }]}>
        <View style={styles.headerPad}>
          <ScreenHeader title="Submission" onBack={() => navigation.goBack()} />
        </View>
        <View style={styles.loadingPad}>
          {loading ? <LoadingSkeleton lines={8} /> : (
            <Text style={[styles.notFound, { color: base.textMuted }]}>Submission not found</Text>
          )}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: base.bg }]}>
      <View style={styles.headerPad}>
        <ScreenHeader title="Submission" onBack={() => navigation.goBack()} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Title */}
        <Text style={[styles.title, { color: base.text }]}>{submission.title}</Text>

        {/* Author + trust */}
        <View style={styles.authorRow}>
          <Text style={[styles.author, { color: base.textDim }]}>
            by {submission.author_name}
          </Text>
          <TrustBadge level={0} />
        </View>

        {/* Body */}
        <Text style={[styles.body, { color: base.text }]}>{submission.body}</Text>

        {/* Verses */}
        {verses.length > 0 && (
          <View style={[styles.versesSection, { borderColor: base.border + '30' }]}>
            <Text style={[styles.sectionLabel, { color: base.textMuted }]}>VERSES</Text>
            {verses.map((ref: string) => (
              <Text key={ref} style={[styles.verseRef, { color: base.gold }]}>
                {ref}
              </Text>
            ))}
          </View>
        )}

        {/* Engagement bar */}
        <EngagementBar
          upvoteCount={submission.upvote_count}
          isUpvoted={engagement.isUpvoted}
          onUpvoteToggle={engagement.toggleUpvote}
          rating={engagement.rating}
          onRate={engagement.setRating}
          shareTitle={submission.title}
          shareBody={submission.body.slice(0, 200)}
          verseNum={0}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerPad: { paddingHorizontal: spacing.md, paddingTop: spacing.md },
  loadingPad: { padding: spacing.lg },
  scroll: { flex: 1 },
  scrollContent: { padding: spacing.md, paddingBottom: spacing.xxl },
  title: {
    fontFamily: fontFamily.displaySemiBold,
    fontSize: 22,
    marginBottom: spacing.xs,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  author: {
    fontFamily: fontFamily.ui,
    fontSize: 13,
  },
  body: {
    fontFamily: fontFamily.body,
    fontSize: 15,
    lineHeight: 24,
    marginBottom: spacing.lg,
  },
  versesSection: {
    borderTopWidth: 1,
    paddingTop: spacing.md,
    marginBottom: spacing.md,
  },
  sectionLabel: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 11,
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  verseRef: {
    fontFamily: fontFamily.displayMedium,
    fontSize: 14,
    marginBottom: spacing.xs,
  },
  notFound: {
    fontFamily: fontFamily.ui,
    fontSize: 14,
    textAlign: 'center',
  },
});

export default withErrorBoundary(SubmissionDetailScreen);
