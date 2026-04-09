/**
 * HomeScreen — Redesigned personal dashboard.
 *
 * Layout (top to bottom):
 *   1. Greeting row (text + streak)
 *   2. ContinueReadingHero (full-width image hero)
 *   3. Verse of the Day (typography-forward)
 *   4. ActivePlanCard compact row (if active plan)
 *   5. "From your study" image carousel (FeatureCard reuse)
 *   6. ProgressRow collapsible
 *
 * Part of Epic #1089 (#1091, #1093, #1094).
 */

import React, { useState, useCallback, useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, RefreshControl, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useScrollToTop } from '@react-navigation/native';
import { Share2 } from 'lucide-react-native';
import type { ScreenNavProp } from '../navigation/types';
import { useHomeData } from '../hooks/useHomeData';
import { useStreakData } from '../hooks/useStreakData';
import { useRecommendations, type Recommendation } from '../hooks/useRecommendations';
import { useExploreImages } from '../hooks/useExploreImages';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { StreakBadge } from '../components/StreakBadge';
import { ActivePlanCard } from '../components/ActivePlanCard';
import { ContinueReadingHero } from '../components/ContinueReadingHero';
import { ProgressRow } from '../components/ProgressRow';
import { FeatureCard, CARD_WIDTH, type FeatureCardData } from '../components/FeatureCard';
import { MilestoneToast } from '../components/MilestoneToast';
import { useSettingsStore } from '../stores';
import { shareVerse } from '../utils/shareVerse';
import { useTheme, spacing, radii, fontFamily } from '../theme';
import { withErrorBoundary } from '../components/ScreenErrorBoundary';

// ── Static cards for new users ────────────────────────────────
const NEW_USER_CARDS: FeatureCardData[] = [
  { title: 'People',       subtitle: 'Lives that shaped sacred history',        color: '#e86040', screen: 'GenealogyTree' },
  { title: 'Timeline',     subtitle: 'The arc of redemption',                   color: '#70b8e8', screen: 'Timeline' },
  { title: 'Scholars',     subtitle: 'Centuries of scholarship',                color: '#a0b8d0', screen: 'ScholarBrowse' },
  { title: 'Word Studies', subtitle: 'Meaning in the original languages',       color: '#e890b8', screen: 'WordStudyBrowse' },
];

function HomeScreen() {
  const { base } = useTheme();
  const navigation = useNavigation<ScreenNavProp<'Home', 'HomeMain'>>();
  const { greeting, subtitle, verse, recentChapters, readingStats, isLoading, refresh } = useHomeData();
  const translation = useSettingsStore((s) => s.translation);
  const { currentStreak, pendingMilestone, markMilestoneSeen } = useStreakData();
  const recommendations = useRecommendations();
  const imageRegistry = useExploreImages();
  const [refreshing, setRefreshing] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  useScrollToTop(scrollRef);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }, [refresh]);

  const handleNavigate = useCallback((screen: string, params?: object) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    navigation.navigate(screen as any, params as any);
  }, [navigation]);

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

  // ── Map recommendations to FeatureCardData + images ──────
  const recCards: FeatureCardData[] = recommendations.map((r: Recommendation) => ({
    title: r.title,
    subtitle: r.subtitle,
    color: '#bfa050',
    screen: r.screen,
    params: r.params as Record<string, string> | undefined,
  }));

  const carouselCards = chaptersRead > 0 && recCards.length > 0
    ? recCards
    : NEW_USER_CARDS;

  const carouselLabel = chaptersRead > 0 && recCards.length > 0
    ? 'FROM YOUR STUDY'
    : 'START EXPLORING';

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
          <View style={styles.greetingRow}>
            <View style={styles.greetingLeft}>
              <Text style={[styles.greetingText, { color: base.text }]} accessibilityRole="header">{greeting}</Text>
              <Text style={[styles.greetingSubtitle, { color: base.textDim }]}>{subtitle}</Text>
            </View>
            <StreakBadge streak={currentStreak} />
          </View>
        </View>

        {/* ── 2. Continue Reading Hero ──────────────────── */}
        <View style={styles.sectionGap}>
          <ContinueReadingHero mostRecent={mostRecent} onPress={handleContinuePress} />
        </View>

        {/* ── 3. Verse of the Day (typography-forward) ──── */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleVersePress}
          style={[styles.verseCard, { backgroundColor: '#1a1508', borderColor: base.gold + '14' }]}
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
              <Share2 size={15} color="#706858" />
            </TouchableOpacity>
          </View>
          <Text style={[styles.verseCardRef, { color: base.gold }]}>{verse.ref}</Text>
          <Text style={[styles.verseCardText, { color: base.text }]}>{verse.text}</Text>
        </TouchableOpacity>

        {/* ── 4. Active Reading Plan (compact) ─────────── */}
        <View style={styles.sectionGap}>
          <ActivePlanCard />
        </View>

        {/* ── 5. "From your study" / "Start exploring" carousel ── */}
        <View style={styles.carouselSection}>
          <Text style={[styles.sectionLabel, { color: base.textMuted }]}>{carouselLabel}</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.carouselContent}
            decelerationRate="fast"
            snapToInterval={CARD_WIDTH + spacing.sm}
          >
            {carouselCards.map((card, i) => {
              const imgData = imageRegistry[card.screen];
              return (
                <FeatureCard
                  key={card.screen + i}
                  feature={card}
                  onPress={() => handleNavigate(card.screen, card.params)}
                  isPremium={false}
                  images={imgData?.images}
                  count={imgData?.count}
                  noun={imgData?.noun}
                  onImagePress={(dl) => handleNavigate(dl.screen, dl.params)}
                  staggerMs={i * 1200}
                />
              );
            })}
          </ScrollView>
        </View>

        {/* ── 6. Progress (collapsible) ─────────────────── */}
        <View style={styles.sectionGap}>
          <ProgressRow chaptersRead={chaptersRead} />
        </View>

      </ScrollView>

      <MilestoneToast message={pendingMilestone} onDismiss={markMilestoneSeen} />
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────

const HORIZONTAL_PAD = 20;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: HORIZONTAL_PAD,
    paddingBottom: spacing.xxl,
  },

  // Greeting
  greetingSection: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  greetingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  greetingLeft: {
    flex: 1,
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

  // Section gap (consistent 20-22px between sections)
  sectionGap: {
    marginBottom: 22,
  },

  // Verse of the Day (#1091 restyle)
  verseCard: {
    borderRadius: radii.lg,
    borderWidth: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: 28,
    marginBottom: 22,
  },
  verseCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
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
    fontFamily: fontFamily.bodyItalic,
    fontSize: 20,
    lineHeight: 32,
  },

  // Carousel section (#1093)
  carouselSection: {
    marginBottom: 22,
    marginHorizontal: -HORIZONTAL_PAD,
    paddingHorizontal: HORIZONTAL_PAD,
  },
  sectionLabel: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 11,
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  carouselContent: {
    gap: spacing.sm,
  },
});

export default withErrorBoundary(HomeScreen);
