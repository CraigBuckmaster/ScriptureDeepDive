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

import React, { useState, useCallback, useMemo, useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, RefreshControl, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { ScreenNavProp } from '../navigation/types';
import { useScrollToTop } from '@react-navigation/native';
import { ArrowRight, Share2 } from 'lucide-react-native';
import { useHomeData } from '../hooks/useHomeData';
import { getTestamentProgress, type TestamentProgress } from '../db/user';
import { useStreakData } from '../hooks/useStreakData';
import { useRecommendations, type Recommendation } from '../hooks/useRecommendations';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { StreakBadge } from '../components/StreakBadge';
import { WeeklySummary } from '../components/WeeklySummary';
import { MilestoneToast } from '../components/MilestoneToast';
import { useSettingsStore } from '../stores';
import { shareVerse, shareProgress } from '../utils/shareVerse';
import { useTheme, spacing, radii, fontFamily } from '../theme';
import { withErrorBoundary } from '../components/ScreenErrorBoundary';

const TOTAL_BIBLE_CHAPTERS = 1189;

function HomeScreen() {
  const { base } = useTheme();
  const navigation = useNavigation<ScreenNavProp<'Home', 'HomeMain'>>();
  const { greeting, subtitle, verse, recentChapters, readingStats, isLoading, refresh } = useHomeData();
  const translation = useSettingsStore((s) => s.translation);
  const { currentStreak, weeklyChapters, weeklyBookNames, pendingMilestone, markMilestoneSeen } = useStreakData();
  const recommendations = useRecommendations();
  const [refreshing, setRefreshing] = useState(false);
  const [testamentProgress, setTestamentProgress] = useState<TestamentProgress[]>([]);
  const scrollRef = useRef<ScrollView>(null);
  useScrollToTop(scrollRef);

  // Load testament progress when home screen is focused
  const loadTestamentProgress = useCallback(() => {
    getTestamentProgress().then(setTestamentProgress).catch((err) => {
      // Ignore — non-critical display data
    });
  }, []);

  const handleRecPress = useCallback((rec: Recommendation) => {
    navigation.navigate(rec.screen as any, rec.params as any);
  }, [navigation]);
  // Re-load on focus (useFocusEffect not available here, piggyback on refresh)

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refresh();
    loadTestamentProgress();
    setRefreshing(false);
  }, [refresh]);

  // Load testament progress when data is ready
  React.useEffect(() => {
    if (!isLoading) loadTestamentProgress();
  }, [isLoading, loadTestamentProgress]);

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: base.bg }]}>
        <View style={styles.content}>
          <LoadingSkeleton lines={6} />
        </View>
      </SafeAreaView>
    );
  }

  const mostRecent = recentChapters[0] ?? null;
  const chaptersRead = readingStats?.totalChapters ?? 0;
  const pct = chaptersRead > 0 ? ((chaptersRead / TOTAL_BIBLE_CHAPTERS) * 100).toFixed(1) : null;

  const handleContinuePress = () => {
    if (mostRecent) {
      navigation.navigate('Chapter', { bookId: mostRecent.book_id, chapterNum: mostRecent.chapter_num });
    } else {
      navigation.navigate('Chapter', { bookId: 'genesis', chapterNum: 1 });
    }
  };

  const handleVersePress = () => {
    navigation.navigate('Chapter', { bookId: verse.bookId, chapterNum: verse.chapter });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: base.bg }]}>
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
          <Text style={[styles.greetingText, { color: base.text }]} accessibilityRole="header">{greeting}</Text>
          <Text style={[styles.greetingSubtitle, { color: base.textDim }]}>{subtitle}</Text>
          <StreakBadge streak={currentStreak} />
        </View>

        {/* ── 2. Continue Reading (primary action) ──────── */}
        {mostRecent ? (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleContinuePress}
            style={[styles.continueCard, { backgroundColor: base.bgElevated, borderColor: base.gold + '30' }]}
            accessibilityRole="button"
            accessibilityLabel={`Continue reading ${mostRecent.book_name} chapter ${mostRecent.chapter_num}`}
          >
            <View style={styles.continueCardContent}>
              <Text style={[styles.continueBookName, { color: base.text }]}>
                {mostRecent.book_name} · Chapter {mostRecent.chapter_num}
              </Text>
              <Text style={[styles.continueChapter, { color: base.textDim }]}>
                {mostRecent.title ?? 'Continue reading'}
              </Text>
            </View>
            <View style={styles.continueAction}>
              <Text style={[styles.continueLabel, { color: base.gold }]}>Continue</Text>
              <ArrowRight size={14} color={base.gold} />
            </View>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleContinuePress}
            style={[styles.continueCard, { backgroundColor: base.bgElevated, borderColor: base.gold + '30' }]}
            accessibilityRole="button"
            accessibilityLabel="Begin your journey, start reading Genesis 1"
          >
            <View style={styles.continueCardContent}>
              <Text style={[styles.continueBookName, { color: base.text }]}>Begin Your Journey</Text>
              <Text style={[styles.continueChapter, { color: base.textDim }]}>Start reading through Scripture</Text>
            </View>
            <View style={styles.continueAction}>
              <Text style={[styles.continueLabel, { color: base.gold }]}>Genesis 1</Text>
              <ArrowRight size={14} color={base.gold} />
            </View>
          </TouchableOpacity>
        )}

        {/* ── 3. Verse of the Day ──────────────────────── */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleVersePress}
          style={[styles.verseCard, { backgroundColor: base.bgElevated, borderColor: base.gold + '20' }]}
          accessibilityRole="button"
          accessibilityLabel={`Verse of the day: ${verse.ref}. ${verse.text}. Tap to read in context`}
        >
          <View style={styles.verseCardHeader}>
            <Text style={[styles.verseCardLabel, { color: base.textMuted }]}>VERSE OF THE DAY</Text>
            <TouchableOpacity
              onPress={(e) => { e.stopPropagation(); shareVerse(verse.text, verse.ref, translation); }}
              hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
              accessibilityRole="button"
              accessibilityLabel="Share verse of the day"
            >
              <Share2 size={15} color={base.textMuted} />
            </TouchableOpacity>
          </View>
          <Text style={[styles.verseCardRef, { color: base.gold }]}>{verse.ref}</Text>
          <Text style={[styles.verseCardText, { color: base.text }]}>{verse.text}</Text>
        </TouchableOpacity>

        {/* ── 4. Weekly Summary ────────────────────────── */}
        <WeeklySummary chapters={weeklyChapters} bookNames={weeklyBookNames} />

        {/* ── 5. Contextual Suggestions ─────────────────── */}
        <View style={styles.suggestionsSection}>
          <Text
            style={[styles.sectionLabel, { color: base.textMuted }]}
            accessibilityRole="header"
          >
            {recommendations.length > 0 ? 'FROM YOUR STUDY' : 'EXPLORE'}
          </Text>
          {recommendations.length > 0 ? (
            <>
              <View style={styles.suggestionsRow}>
                {recommendations.slice(0, 2).map((rec) => (
                  <TouchableOpacity
                    key={rec.id}
                    style={[styles.suggestionCard, { backgroundColor: base.bgElevated, borderColor: base.gold + '20' }]}
                    activeOpacity={0.7}
                    onPress={() => handleRecPress(rec)}
                    accessibilityRole="button"
                    accessibilityLabel={`${rec.title}: ${rec.subtitle}`}
                  >
                    <Text style={[styles.suggestionTitle, { color: base.gold }]}>{rec.title}</Text>
                    <Text style={[styles.suggestionSubtitle, { color: base.textDim }]}>{rec.subtitle}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              {recommendations.length > 2 && (
                <View style={[styles.suggestionsRow, styles.suggestionsRowSpaced]}>
                  {recommendations.slice(2, 4).map((rec) => (
                    <TouchableOpacity
                      key={rec.id}
                      style={[styles.suggestionCard, { backgroundColor: base.bgElevated, borderColor: base.gold + '20' }]}
                      activeOpacity={0.7}
                      onPress={() => handleRecPress(rec)}
                      accessibilityRole="button"
                      accessibilityLabel={`${rec.title}: ${rec.subtitle}`}
                    >
                      <Text style={[styles.suggestionTitle, { color: base.gold }]}>{rec.title}</Text>
                      <Text style={[styles.suggestionSubtitle, { color: base.textDim }]}>{rec.subtitle}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </>
          ) : (
            <>
              <View style={styles.suggestionsRow}>
                <TouchableOpacity
                  style={[styles.suggestionCard, { backgroundColor: base.bgElevated, borderColor: base.gold + '20' }]}
                  activeOpacity={0.7}
                  onPress={() => navigation.navigate('ExploreTab' as any, { screen: 'GenealogyTree' })}
                  accessibilityRole="button"
                  accessibilityLabel="Explore people: Lives that shaped sacred history"
                >
                  <Text style={[styles.suggestionTitle, { color: base.gold }]}>People</Text>
                  <Text style={[styles.suggestionSubtitle, { color: base.textDim }]}>Lives that shaped sacred history</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.suggestionCard, { backgroundColor: base.bgElevated, borderColor: base.gold + '20' }]}
                  activeOpacity={0.7}
                  onPress={() => navigation.navigate('ExploreTab' as any, { screen: 'Timeline' })}
                  accessibilityRole="button"
                  accessibilityLabel="Explore timeline: The arc of redemption"
                >
                  <Text style={[styles.suggestionTitle, { color: base.gold }]}>Timeline</Text>
                  <Text style={[styles.suggestionSubtitle, { color: base.textDim }]}>The arc of redemption</Text>
                </TouchableOpacity>
              </View>
              <View style={[styles.suggestionsRow, styles.suggestionsRowSpaced]}>
                <TouchableOpacity
                  style={[styles.suggestionCard, { backgroundColor: base.bgElevated, borderColor: base.gold + '20' }]}
                  activeOpacity={0.7}
                  onPress={() => navigation.navigate('ExploreTab' as any, { screen: 'ScholarBrowse' })}
                  accessibilityRole="button"
                  accessibilityLabel="Explore scholars: Centuries of scholarship"
                >
                  <Text style={[styles.suggestionTitle, { color: base.gold }]}>Scholars</Text>
                  <Text style={[styles.suggestionSubtitle, { color: base.textDim }]}>Centuries of scholarship</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.suggestionCard, { backgroundColor: base.bgElevated, borderColor: base.gold + '20' }]}
                  activeOpacity={0.7}
                  onPress={() => navigation.navigate('ExploreTab' as any, { screen: 'WordStudyBrowse' })}
                  accessibilityRole="button"
                  accessibilityLabel="Explore word studies: Meaning in the original languages"
                >
                  <Text style={[styles.suggestionTitle, { color: base.gold }]}>Word Studies</Text>
                  <Text style={[styles.suggestionSubtitle, { color: base.textDim }]}>Meaning in the original languages</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>

        {/* ── 6. Overall Progress ──────────────────────── */}
        {chaptersRead > 0 && pct && (
          <View style={[styles.progressCard, { backgroundColor: base.bgElevated, borderColor: base.border }]}>
            <View style={styles.progressHeader}>
              <Text style={[styles.progressText, { color: base.text }]}>{chaptersRead} of {TOTAL_BIBLE_CHAPTERS} chapters</Text>
              <View style={styles.progressPctRow}>
                <Text style={[styles.progressPct, { color: base.gold }]}>{pct}%</Text>
                <TouchableOpacity
                  onPress={() => shareProgress(pct!, chaptersRead)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  accessibilityRole="button"
                  accessibilityLabel="Share your reading progress"
                >
                  <Share2 size={14} color={base.gold} style={{ opacity: 0.6 }} />
                </TouchableOpacity>
              </View>
            </View>
            <View style={[styles.progressTrack, { backgroundColor: base.border }]}>
              <View style={[styles.progressFill, { width: `${Math.max(1, parseFloat(pct))}%`, backgroundColor: base.gold }]} />
            </View>
          </View>
        )}

        {/* ── 7. Testament Progress ─────────────────────── */}
        {testamentProgress.length > 0 && chaptersRead > 0 && (
          <View style={styles.testamentList}>
            {testamentProgress.map((tp) => {
              const tpPct = tp.totalChapters > 0
                ? ((tp.chaptersRead / tp.totalChapters) * 100).toFixed(0)
                : '0';
              if (tp.chaptersRead === 0) return null;
              return (
                <View
                  key={tp.testament}
                  style={[styles.testamentRow, { backgroundColor: base.bgElevated, borderColor: base.border }]}
                >
                  <View style={styles.progressHeader}>
                    <Text style={[styles.testamentLabel, { color: base.textDim }]}>{tp.testament}</Text>
                    <Text style={[styles.testamentPct, { color: base.textMuted }]}>{tp.chaptersRead}/{tp.totalChapters} ({tpPct}%)</Text>
                  </View>
                  <View style={[styles.progressTrack, { backgroundColor: base.border }]}>
                    <View style={[styles.progressFill, { width: `${Math.max(1, parseFloat(tpPct))}%`, backgroundColor: base.gold + '80' }]} />
                  </View>
                </View>
              );
            })}
          </View>
        )}

      </ScrollView>

      <MilestoneToast message={pendingMilestone} onDismiss={markMilestoneSeen} />
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    fontFamily: fontFamily.displaySemiBold,
    fontSize: 22,
  },
  greetingSubtitle: {
    fontFamily: fontFamily.bodyItalic,
    fontSize: 14,
    marginTop: spacing.xs,
  },

  // Continue Reading
  continueCard: {
    borderRadius: radii.lg,
    borderWidth: 1,
    padding: spacing.md,
    marginBottom: spacing.md,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
  },
  continueCardContent: {
    flex: 1,
  },
  continueBookName: {
    fontFamily: fontFamily.displayMedium,
    fontSize: 14,
  },
  continueChapter: {
    fontFamily: fontFamily.ui,
    fontSize: 13,
    marginTop: 2,
  },
  continueAction: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: spacing.xs,
    marginLeft: spacing.md,
  },
  continueLabel: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 13,
  },

  // Verse of the Day
  verseCardHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: spacing.sm,
  },
  verseCard: {
    borderRadius: radii.lg,
    borderWidth: 1,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  verseCardLabel: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 11,
    letterSpacing: 0.5,
  },
  verseCardRef: {
    fontFamily: fontFamily.displayMedium,
    fontSize: 14,
    marginBottom: spacing.sm,
  },
  verseCardText: {
    fontFamily: fontFamily.body,
    fontSize: 18,
    lineHeight: 28,
  },

  // Suggestions
  suggestionsSection: {
    marginBottom: spacing.lg,
  },
  sectionLabel: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 11,
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  suggestionsRow: {
    flexDirection: 'row' as const,
    gap: spacing.sm,
  },
  suggestionCard: {
    flex: 1,
    borderRadius: radii.md,
    borderWidth: 1,
    padding: spacing.sm + 2,
  },
  suggestionTitle: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 12,
    marginBottom: 2,
  },
  suggestionSubtitle: {
    fontFamily: fontFamily.ui,
    fontSize: 12,
  },

  // Progress
  progressCard: {
    borderRadius: radii.md,
    borderWidth: 1,
    padding: spacing.sm + 4,
  },
  progressHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    marginBottom: spacing.xs + 2,
  },
  progressText: {
    fontFamily: fontFamily.ui,
    fontSize: 12,
  },
  progressPct: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 12,
  },
  progressTrack: {
    height: 4,
    borderRadius: 2,
  },
  progressFill: {
    height: 4,
    borderRadius: 2,
    minWidth: 8,
  },
  testamentRow: {
    borderRadius: radii.md,
    borderWidth: 1,
    padding: spacing.sm + 2,
  },
  testamentLabel: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 12,
  },
  testamentPct: {
    fontFamily: fontFamily.ui,
    fontSize: 11,
  },
  progressPctRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  testamentList: {
    gap: spacing.xs,
  },
  suggestionsRowSpaced: {
    marginTop: spacing.sm,
  },
});

export default withErrorBoundary(HomeScreen);
