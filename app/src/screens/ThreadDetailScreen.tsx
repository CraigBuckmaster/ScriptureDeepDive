/**
 * ThreadDetailScreen — Vertical chain journey for a cross-reference thread.
 *
 * Each stop shows the scripture reference, inline verse preview (max 3 verses),
 * the curator's note, and a "Go to chapter" link.
 * Follows the ProphecyDetailScreen rail pattern.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { ScreenNavProp, ScreenRouteProp } from '../navigation/types';
import { useThreadDetail } from '../hooks/useThreads';
import type { ChainStep } from '../hooks/useThreads';
import { parseReference } from '../utils/verseResolver';
import type { ParsedRef } from '../utils/verseResolver';
import { resolveVerseText } from '../utils/verseResolver';
import { ScreenHeader } from '../components/ScreenHeader';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { useTheme, spacing, radii, fontFamily } from '../theme';
import { logger } from '../utils/logger';

const OT_BOOKS = new Set([
  'genesis', 'exodus', 'leviticus', 'numbers', 'deuteronomy',
  'joshua', 'judges', 'ruth', '1_samuel', '2_samuel',
  '1_kings', '2_kings', '1_chronicles', '2_chronicles',
  'ezra', 'nehemiah', 'esther', 'job', 'psalms', 'proverbs',
  'ecclesiastes', 'song_of_solomon', 'isaiah', 'jeremiah',
  'lamentations', 'ezekiel', 'daniel', 'hosea', 'joel', 'amos',
  'obadiah', 'jonah', 'micah', 'nahum', 'habakkuk', 'zephaniah',
  'haggai', 'zechariah', 'malachi',
]);

const MAX_PREVIEW_VERSES = 3;

interface StopWithVerse {
  step: ChainStep;
  parsed: ParsedRef | null;
  verseText: string[];
}

export default function ThreadDetailScreen() {
  const { base, testament } = useTheme();
  const navigation = useNavigation<ScreenNavProp<'Explore', 'ThreadDetail'>>();
  const route = useRoute<ScreenRouteProp<'Explore', 'ThreadDetail'>>();
  const { threadId } = route.params ?? {};
  const { thread, isLoading } = useThreadDetail(threadId || '');
  const [stops, setStops] = useState<StopWithVerse[]>([]);
  const [versesLoading, setVersesLoading] = useState(true);

  // Fetch verse text for each stop
  useEffect(() => {
    if (!thread) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setVersesLoading(true);

    Promise.all(
      thread.steps.map(async (step) => {
        const parsed = parseReference(step.ref);
        let verseText: string[] = [];
        if (parsed) {
          try {
            const texts = await resolveVerseText(parsed);
            verseText = texts.slice(0, MAX_PREVIEW_VERSES);
          } catch (err) {
            logger.warn('ThreadDetail', `Failed to resolve ${step.ref}`, err);
          }
        }
        return { step, parsed, verseText };
      }),
    )
      .then(setStops)
      .finally(() => setVersesLoading(false));
  }, [thread]);

  const handleGoToChapter = (parsed: ParsedRef) => {
    try {
      navigation.navigate('Chapter', {
        bookId: parsed.bookId,
        chapterNum: parsed.chapter,
      });
    } catch (err) {
      logger.warn('ThreadDetail', 'Navigation failed', err);
      Alert.alert('Not Available', `${parsed.bookName} ${parsed.chapter} — chapter not yet available.`);
    }
  };

  if (isLoading || !thread) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: base.bg }]}>
        <View style={styles.loadingPad}>
          <LoadingSkeleton lines={8} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: base.bg }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <ScreenHeader
          title="Thread"
          onBack={() => navigation.goBack()}
          style={styles.header}
        />

        {/* Theme title */}
        <Text style={[styles.themeTitle, { color: base.text }]}>{thread.theme}</Text>

        {/* Tags */}
        {thread.tags.length > 0 && (
          <View style={styles.tagRow}>
            {thread.tags.map((tag) => (
              <View key={tag} style={[styles.tag, { backgroundColor: base.gold + '15' }]}>
                <Text style={[styles.tagText, { color: base.gold }]}>{tag}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Stop count */}
        <Text style={[styles.stopCount, { color: base.textMuted }]}>
          {thread.steps.length} stops across Scripture
        </Text>

        {/* Chain rail */}
        <View style={styles.railSection}>
          <Text style={[styles.sectionLabel, { color: base.gold }]}>CHAIN</Text>

          {versesLoading ? (
            <LoadingSkeleton lines={6} />
          ) : (
            <View style={styles.rail}>
              {stops.map((stop, idx) => {
                const isOT = stop.parsed ? OT_BOOKS.has(stop.parsed.bookId) : true;
                const dotColor = isOT ? testament.ot : testament.nt;
                const isLast = idx === stops.length - 1;
                const totalVerses = stop.parsed?.verseEnd && stop.parsed?.verseStart
                  ? stop.parsed.verseEnd - stop.parsed.verseStart + 1
                  : 0;
                const remaining = totalVerses > MAX_PREVIEW_VERSES
                  ? totalVerses - MAX_PREVIEW_VERSES
                  : 0;

                return (
                  <View key={idx} style={styles.railItem}>
                    {/* Connector line */}
                    {!isLast && <View style={[styles.railLine, { backgroundColor: base.border }]} />}

                    {/* Dot */}
                    <View style={[styles.railDot, { backgroundColor: dotColor }]} />

                    {/* Card */}
                    <View style={[styles.railCard, { backgroundColor: base.bgElevated, borderColor: base.border + '40' }]}>
                      {/* Reference badge */}
                      <TouchableOpacity
                        onPress={() => stop.parsed && handleGoToChapter(stop.parsed)}
                        disabled={!stop.parsed}
                        accessibilityRole="button"
                        accessibilityLabel={`Go to ${stop.step.ref}`}
                      >
                        <Text style={[styles.verseRef, { color: dotColor }]}>{stop.step.ref}</Text>
                      </TouchableOpacity>

                      {/* Inline verse preview */}
                      {stop.verseText.length > 0 && (
                        <View style={[styles.versePreview, { backgroundColor: base.bg + '80' }]}>
                          {stop.verseText.map((text, vi) => (
                            <Text key={vi} style={[styles.verseText, { color: base.textDim }]} numberOfLines={3}>
                              {text}
                            </Text>
                          ))}
                          {remaining > 0 && (
                            <Text style={[styles.moreVerses, { color: base.textMuted }]}>
                              ...and {remaining} more verse{remaining > 1 ? 's' : ''}
                            </Text>
                          )}
                        </View>
                      )}

                      {/* Curator's note */}
                      <Text style={[styles.noteText, { color: base.textDim }]}>{stop.step.note}</Text>

                      {/* Go to chapter link */}
                      {stop.parsed && (
                        <TouchableOpacity
                          onPress={() => handleGoToChapter(stop.parsed!)}
                          style={styles.goLink}
                          accessibilityRole="button"
                          accessibilityLabel={`Go to ${stop.parsed.bookName} ${stop.parsed.chapter}`}
                        >
                          <Text style={[styles.goLinkText, { color: base.gold }]}>
                            Go to {stop.parsed.bookName} {stop.parsed.chapter} →
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingPad: {
    flex: 1,
    padding: spacing.lg,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  header: {
    marginBottom: spacing.sm,
  },
  themeTitle: {
    fontFamily: fontFamily.displaySemiBold,
    fontSize: 22,
    marginBottom: spacing.sm,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  tag: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 1,
    borderRadius: radii.sm,
  },
  tagText: {
    fontFamily: fontFamily.ui,
    fontSize: 10,
  },
  stopCount: {
    fontFamily: fontFamily.ui,
    fontSize: 12,
    marginBottom: spacing.md,
  },
  railSection: {
    marginTop: spacing.sm,
  },
  sectionLabel: {
    fontFamily: fontFamily.display,
    fontSize: 11,
    letterSpacing: 0.4,
    marginBottom: spacing.md,
  },
  rail: {
    paddingLeft: spacing.md,
  },
  railItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
    position: 'relative',
  },
  railLine: {
    position: 'absolute',
    left: 5,
    top: 14,
    bottom: -spacing.md,
    width: 2,
  },
  railDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: spacing.sm,
    marginTop: 2,
  },
  railCard: {
    flex: 1,
    borderRadius: radii.sm,
    padding: spacing.sm,
    borderWidth: 1,
  },
  verseRef: {
    fontFamily: fontFamily.displayMedium,
    fontSize: 13,
    marginBottom: spacing.xs,
  },
  versePreview: {
    borderRadius: radii.sm,
    padding: spacing.xs,
    marginBottom: spacing.xs,
  },
  verseText: {
    fontFamily: fontFamily.bodyItalic,
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 2,
  },
  moreVerses: {
    fontFamily: fontFamily.ui,
    fontSize: 10,
    marginTop: 2,
  },
  noteText: {
    fontFamily: fontFamily.body,
    fontSize: 12,
    lineHeight: 18,
    marginBottom: spacing.xs,
  },
  goLink: {
    marginTop: 2,
  },
  goLinkText: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 11,
  },
});
