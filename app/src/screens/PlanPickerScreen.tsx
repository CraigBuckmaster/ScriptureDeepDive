/**
 * PlanPickerScreen — One-decision plan picker (#1833), presented as a
 * modal sheet on the Explore/Study stack. Segments: Book / Journey /
 * Topic. Picking a source creates a unified study plan (mode comes
 * from the last mode used in a session — the picker NEVER asks) and
 * replaces itself with the first session.
 *
 * Book segment order: pinned "Continue where you're reading" (from
 * most-recent reading_progress), starter books (books.json meta
 * `starter: true`, rendered only when the data is present — see #1833
 * pipeline note), then all live books grouped by testament. No
 * hardcoded book lists.
 */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { BookMarked, ChevronRight } from 'lucide-react-native';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { ScreenHeader } from '../components/ScreenHeader';
import { withErrorBoundary } from '../components/ScreenErrorBoundary';
import { getTopics } from '../db/content';
import { getAllJourneys } from '../db/content/features';
import { getRecentChapters } from '../db/userQueries';
import { useBooks } from '../hooks';
import type { ScreenNavProp, ScreenRouteProp } from '../navigation/types';
import { startStudyPlan } from '../services/study';
import { fontFamily, radii, spacing, useTheme } from '../theme';
import type { Journey, RecentChapter } from '../types';
import type { Topic } from '../types/topic';
import { logger } from '../utils/logger';

type Segment = 'book' | 'journey' | 'topic';

const SEGMENTS: Array<{ key: Segment; label: string }> = [
  { key: 'book', label: 'Book' },
  { key: 'journey', label: 'Journey' },
  { key: 'topic', label: 'Topic' },
];

/** Topics qualify only when they carry relevant chapters to study. */
function topicHasChapters(topic: Topic): boolean {
  try {
    const parsed: unknown = JSON.parse(topic.relevant_chapters_json ?? '[]');
    return Array.isArray(parsed) && parsed.length > 0;
  } catch {
    return false;
  }
}

function PlanPickerScreen() {
  const { base } = useTheme();
  const navigation = useNavigation<ScreenNavProp<'Explore', 'PlanPicker'>>();
  const route = useRoute<ScreenRouteProp<'Explore', 'PlanPicker'>>();
  const [segment, setSegment] = useState<Segment>(route.params?.segment ?? 'book');

  const { liveBooks } = useBooks();
  const [recent, setRecent] = useState<RecentChapter | null>(null);
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const [recentRows, journeyRows, topicRows] = await Promise.all([
          getRecentChapters(1),
          getAllJourneys(),
          getTopics(),
        ]);
        if (cancelled) return;
        setRecent(recentRows[0] ?? null);
        setJourneys(journeyRows);
        setTopics(topicRows.filter(topicHasChapters));
      } catch (err) {
        logger.warn('PlanPicker', 'Failed to load picker sources', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const starterBooks = useMemo(() => liveBooks.filter((b) => !!b.starter), [liveBooks]);
  const otBooks = useMemo(() => liveBooks.filter((b) => b.testament === 'ot'), [liveBooks]);
  const ntBooks = useMemo(() => liveBooks.filter((b) => b.testament === 'nt'), [liveBooks]);

  /**
   * Create the plan and replace the modal with the session — one
   * decision, zero extra hops. `openAt` overrides the target chapter
   * for the pinned continue row.
   */
  const start = useCallback(
    async (
      planType: 'book' | 'journey' | 'topical',
      sourceId: string,
      title: string,
      openAt?: { bookId: string; chapterNum: number },
    ) => {
      if (busy) return;
      setBusy(true);
      setNotice(null);
      try {
        const started = await startStudyPlan({ planType, sourceId, title });
        if (!started) {
          setNotice('Nothing to study there yet — try another pick.');
          return;
        }
        navigation.replace('StudySession', {
          bookId: openAt?.bookId ?? started.firstRef.bookId,
          chapterNum: openAt?.chapterNum ?? started.firstRef.chapterNum,
          planId: started.planId,
        });
      } catch (err) {
        logger.warn('PlanPicker', 'Failed to start study plan', err);
        setNotice('Could not start that study. Please try again.');
      } finally {
        setBusy(false);
      }
    },
    [busy, navigation],
  );

  const renderRow = (
    key: string,
    title: string,
    subtitle: string | null,
    onPress: () => void,
    pinned = false,
  ) => (
    <TouchableOpacity
      key={key}
      onPress={onPress}
      disabled={busy}
      activeOpacity={0.72}
      accessibilityRole="button"
      accessibilityLabel={`Study ${title}`}
      style={[
        styles.row,
        {
          backgroundColor: base.bgElevated,
          borderColor: pinned ? `${base.gold}55` : base.border,
        },
      ]}
    >
      {pinned && <BookMarked size={16} color={base.gold} />}
      <View style={styles.rowText}>
        <Text style={[styles.rowTitle, { color: base.text }]}>{title}</Text>
        {subtitle ? (
          <Text style={[styles.rowSubtitle, { color: base.textMuted }]}>{subtitle}</Text>
        ) : null}
      </View>
      <ChevronRight size={16} color={base.textMuted} />
    </TouchableOpacity>
  );

  const sectionLabel = (label: string) => (
    <Text key={`label-${label}`} style={[styles.sectionLabel, { color: base.textMuted }]}>
      {label}
    </Text>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: base.bg }]}>
      <View style={styles.headerPad}>
        <ScreenHeader title="Begin a study" onBack={() => navigation.goBack()} />
      </View>

      {/* ── Segments ─── */}
      <View style={styles.segmentRow}>
        {SEGMENTS.map((s) => {
          const active = segment === s.key;
          return (
            <TouchableOpacity
              key={s.key}
              onPress={() => setSegment(s.key)}
              activeOpacity={0.72}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              accessibilityLabel={`${s.label} studies`}
              style={[
                styles.segment,
                {
                  borderColor: active ? base.gold : base.border,
                  backgroundColor: active ? `${base.gold}12` : 'transparent',
                },
              ]}
            >
              <Text style={[styles.segmentLabel, { color: active ? base.gold : base.textMuted }]}>
                {s.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {notice && <Text style={[styles.notice, { color: base.textMuted }]}>{notice}</Text>}

      {loading ? (
        <View style={styles.loadingPad}>
          <LoadingSkeleton lines={8} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          {segment === 'book' && (
            <>
              {recent &&
                renderRow(
                  'continue-reading',
                  "Continue where you're reading",
                  `${recent.book_name} ${recent.chapter_num}`,
                  () =>
                    start('book', recent.book_id, recent.book_name, {
                      bookId: recent.book_id,
                      chapterNum: recent.chapter_num,
                    }),
                  true,
                )}
              {starterBooks.length > 0 && sectionLabel('GOOD PLACES TO BEGIN')}
              {starterBooks.map((b) =>
                renderRow(`starter-${b.id}`, b.name, `${b.total_chapters} chapters`, () =>
                  start('book', b.id, b.name),
                ),
              )}
              {otBooks.length > 0 && sectionLabel('OLD TESTAMENT')}
              {otBooks.map((b) =>
                renderRow(b.id, b.name, `${b.total_chapters} chapters`, () =>
                  start('book', b.id, b.name),
                ),
              )}
              {ntBooks.length > 0 && sectionLabel('NEW TESTAMENT')}
              {ntBooks.map((b) =>
                renderRow(b.id, b.name, `${b.total_chapters} chapters`, () =>
                  start('book', b.id, b.name),
                ),
              )}
            </>
          )}

          {segment === 'journey' &&
            journeys.map((j) =>
              renderRow(j.id, j.title, j.subtitle, () => start('journey', j.id, j.title)),
            )}

          {segment === 'topic' &&
            topics.map((t) =>
              renderRow(t.id, t.title, t.category, () => start('topical', t.id, t.title)),
            )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerPad: { paddingHorizontal: spacing.md, paddingTop: spacing.sm },
  loadingPad: { padding: spacing.lg },
  segmentRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  segment: {
    flex: 1,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: radii.md,
  },
  segmentLabel: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 13,
  },
  notice: {
    fontFamily: fontFamily.ui,
    fontSize: 12,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.xs,
  },
  content: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xxl,
    gap: spacing.xs,
  },
  sectionLabel: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 10,
    letterSpacing: 1,
    marginTop: spacing.sm,
    marginBottom: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 52,
    borderWidth: 1,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  rowText: { flex: 1 },
  rowTitle: {
    fontFamily: fontFamily.bodyMedium,
    fontSize: 16,
  },
  rowSubtitle: {
    fontFamily: fontFamily.ui,
    fontSize: 11,
    marginTop: 1,
  },
});

export default withErrorBoundary(PlanPickerScreen);
