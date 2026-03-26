/**
 * HomeScreen — Personal dashboard landing page.
 *
 * Layout (top to bottom):
 *   1. Time-aware greeting + personal subtitle
 *   2. Continue Reading card (primary action)
 *   3. Verse of the Day
 *   4. Contextual "From Your Study" suggestions
 *   5. Overall progress bar
 */

import React, { useState, useCallback, useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, RefreshControl, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useScrollToTop } from '@react-navigation/native';
import { ArrowRight } from 'lucide-react-native';
import { useHomeData } from '../hooks/useHomeData';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { base, spacing, radii, fontFamily } from '../theme';

const TOTAL_BIBLE_CHAPTERS = 1189;

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const { greeting, subtitle, stats, verse, recentChapters, readingStats, isLoading, refresh } = useHomeData();
  const [refreshing, setRefreshing] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  useScrollToTop(scrollRef);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }, [refresh]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <LoadingSkeleton lines={6} />
        </View>
      </SafeAreaView>
    );
  }

  const mostRecent = recentChapters[0] ?? null;
  const chaptersRead = readingStats?.totalChapters ?? 0;
  const pct = chaptersRead > 0 ? ((chaptersRead / TOTAL_BIBLE_CHAPTERS) * 100).toFixed(1) : null;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={base.gold}
            colors={[base.gold]}
          />
        }
      >

        {/* ── 1. Greeting ──────────────────────────────── */}
        <View style={styles.greetingSection}>
          <Text style={styles.greetingText}>{greeting}</Text>
          <Text style={styles.greetingSubtitle}>{subtitle}</Text>
        </View>

        {/* ── 2. Continue Reading (primary action) ──────── */}
        {mostRecent ? (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.navigate('Chapter', {
              bookId: mostRecent.book_id,
              chapterNum: mostRecent.chapter_num,
            })}
            style={styles.continueCard}
          >
            <View style={styles.continueCardContent}>
              <Text style={styles.continueBookName}>
                {mostRecent.book_name} · Chapter {mostRecent.chapter_num}
              </Text>
              <Text style={styles.continueChapter}>
                {mostRecent.title ?? 'Continue reading'}
              </Text>
            </View>
            <View style={styles.continueAction}>
              <Text style={styles.continueLabel}>Continue</Text>
              <ArrowRight size={14} color={base.gold} />
            </View>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.navigate('Chapter', {
              bookId: 'genesis',
              chapterNum: 1,
            })}
            style={styles.continueCard}
          >
            <View style={styles.continueCardContent}>
              <Text style={styles.continueBookName}>Begin Your Journey</Text>
              <Text style={styles.continueChapter}>Start reading through Scripture</Text>
            </View>
            <View style={styles.continueAction}>
              <Text style={styles.continueLabel}>Genesis 1</Text>
              <ArrowRight size={14} color={base.gold} />
            </View>
          </TouchableOpacity>
        )}

        {/* ── 3. Verse of the Day ──────────────────────── */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation.navigate('Chapter', {
            bookId: verse.bookId,
            chapterNum: verse.chapter,
          })}
          style={styles.verseCard}
        >
          <Text style={styles.verseCardLabel}>VERSE OF THE DAY</Text>
          <Text style={styles.verseCardRef}>{verse.ref}</Text>
          <Text style={styles.verseCardText}>{verse.text}</Text>
        </TouchableOpacity>

        {/* ── 4. Contextual Suggestions ─────────────────── */}
        {mostRecent && (
          <View style={styles.suggestionsSection}>
            <Text style={styles.sectionLabel}>FROM YOUR STUDY</Text>
            <View style={styles.suggestionsRow}>
              <TouchableOpacity
                style={styles.suggestionCard}
                activeOpacity={0.7}
                onPress={() => navigation.navigate('ExploreTab', { screen: 'GenealogyTree' })}
              >
                <Text style={styles.suggestionTitle}>People</Text>
                <Text style={styles.suggestionSubtitle}>
                  {stats ? `${stats.peopleCount} biblical figures` : 'Biblical figures'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.suggestionCard}
                activeOpacity={0.7}
                onPress={() => navigation.navigate('ExploreTab', { screen: 'Timeline' })}
              >
                <Text style={styles.suggestionTitle}>Timeline</Text>
                <Text style={styles.suggestionSubtitle}>
                  {stats ? `${stats.timelineCount} events` : 'Events & figures'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ── 5. Overall Progress ──────────────────────── */}
        {chaptersRead > 0 && pct && (
          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressText}>{chaptersRead} of {TOTAL_BIBLE_CHAPTERS} chapters</Text>
              <Text style={styles.progressPct}>{pct}%</Text>
            </View>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${Math.max(1, parseFloat(pct))}%` }]} />
            </View>
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: base.bg,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },

  // Greeting
  greetingSection: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
  },
  greetingText: {
    color: base.text,
    fontFamily: fontFamily.displaySemiBold,
    fontSize: 22,
  },
  greetingSubtitle: {
    color: base.textDim,
    fontFamily: fontFamily.bodyItalic,
    fontSize: 14,
    marginTop: spacing.xs,
  },

  // Continue Reading
  continueCard: {
    backgroundColor: base.bgElevated,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: base.gold + '30',
    padding: spacing.md,
    marginBottom: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  continueCardContent: {
    flex: 1,
  },
  continueBookName: {
    color: base.text,
    fontFamily: fontFamily.displayMedium,
    fontSize: 14,
  },
  continueChapter: {
    color: base.textDim,
    fontFamily: fontFamily.ui,
    fontSize: 13,
    marginTop: 2,
  },
  continueAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginLeft: spacing.md,
  },
  continueLabel: {
    color: base.gold,
    fontFamily: fontFamily.uiMedium,
    fontSize: 13,
  },

  // Verse of the Day
  verseCard: {
    backgroundColor: base.bgElevated,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: base.gold + '20',
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  verseCardLabel: {
    color: base.textMuted,
    fontFamily: fontFamily.uiMedium,
    fontSize: 11,
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  verseCardRef: {
    color: base.gold,
    fontFamily: fontFamily.displayMedium,
    fontSize: 14,
    marginBottom: spacing.sm,
  },
  verseCardText: {
    color: base.text,
    fontFamily: fontFamily.body,
    fontSize: 18,
    lineHeight: 28,
  },

  // Suggestions
  suggestionsSection: {
    marginBottom: spacing.lg,
  },
  sectionLabel: {
    color: base.textMuted,
    fontFamily: fontFamily.uiMedium,
    fontSize: 11,
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  suggestionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  suggestionCard: {
    flex: 1,
    backgroundColor: base.bgElevated,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: base.gold + '20',
    padding: spacing.sm + 2,
  },
  suggestionTitle: {
    color: base.gold,
    fontFamily: fontFamily.uiMedium,
    fontSize: 12,
    marginBottom: 2,
  },
  suggestionSubtitle: {
    color: base.textDim,
    fontFamily: fontFamily.ui,
    fontSize: 12,
  },

  // Progress
  progressCard: {
    backgroundColor: base.bgElevated,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: base.border,
    padding: spacing.sm + 4,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs + 2,
  },
  progressText: {
    color: base.text,
    fontFamily: fontFamily.ui,
    fontSize: 12,
  },
  progressPct: {
    color: base.gold,
    fontFamily: fontFamily.uiMedium,
    fontSize: 12,
  },
  progressTrack: {
    height: 4,
    backgroundColor: base.border,
    borderRadius: 2,
  },
  progressFill: {
    height: 4,
    backgroundColor: base.gold,
    borderRadius: 2,
    minWidth: 8,
  },
});
