/**
 * StudyHubScreen — Root of the Study tab behind the `study_hub` flag
 * (#1832, Epic #1830). One screen that answers "where was I?":
 *   1. Continue hero — active plan, chapter trail, resume beat
 *   2. Review card — one due prompt at a time (Recall it / Later)
 *   3. Rhythm line — one italic sentence, deliberately not a streak
 *   4. Library — the same shelves ExploreMenuScreen renders
 *
 * With no active plan the hero region renders nothing (the first-run
 * empty state is #1837; the plan picker row is #1833).
 */
import React, { useCallback, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation, useScrollToTop } from '@react-navigation/native';
import { ContinueHero } from '../components/study/ContinueHero';
import {
  LibrarySections,
  PREMIUM_SCREENS,
} from '../components/study/LibrarySections';
import { ReviewRecallCard } from '../components/study/ReviewRecallCard';
import { RhythmLine } from '../components/study/RhythmLine';
import { UpgradePrompt } from '../components/UpgradePrompt';
import { withErrorBoundary } from '../components/ScreenErrorBoundary';
import { useContinuePlan } from '../hooks/useContinuePlan';
import { useExploreImages } from '../hooks/useExploreImages';
import { usePremium } from '../hooks/usePremium';
import { useReviewQueue } from '../hooks/useReviewQueue';
import type { ScreenNavProp } from '../navigation/types';
import { getWeeklyRhythm, type WeeklyRhythm } from '../services/study';
import { fontFamily, spacing, useTheme } from '../theme';
import { logger } from '../utils/logger';

function StudyHubScreen() {
  const { base } = useTheme();
  const navigation = useNavigation<ScreenNavProp<'Explore', 'StudyHub'>>();
  const scrollRef = useRef<ScrollView>(null);
  useScrollToTop(scrollRef);

  const { isPremium, upgradeRequest, showUpgrade, dismissUpgrade } = usePremium();
  const imageRegistry = useExploreImages();
  const { plan, items, target, estimateMin, reload: reloadPlan } = useContinuePlan();
  const { dueItems, completeItem, reload: reloadReviews } = useReviewQueue();

  const [rhythm, setRhythm] = useState<WeeklyRhythm[]>([]);
  const [reviewIndex, setReviewIndex] = useState(0);

  const reloadRhythm = useCallback(async () => {
    try {
      setRhythm(await getWeeklyRhythm());
    } catch (err) {
      logger.warn('StudyHub', 'Failed to load weekly rhythm', err);
    }
  }, []);

  // Refresh hub state when the tab gains focus — including first mount
  // (useFocusEffect fires on initial focus) and returning from a
  // completed session — so the trail, reviews, and rhythm stay live.
  useFocusEffect(
    useCallback(() => {
      void reloadPlan();
      void reloadReviews();
      void reloadRhythm();
    }, [reloadPlan, reloadReviews, reloadRhythm]),
  );

  const handleResume = useCallback(() => {
    if (!target) return;
    navigation.navigate('StudySession', {
      bookId: target.bookId,
      chapterNum: target.chapterNum,
      ...(target.step ? { initialStep: target.step } : {}),
    });
  }, [navigation, target]);

  const currentReview =
    dueItems.length > 0 ? dueItems[reviewIndex % dueItems.length] : null;

  const handleRecall = useCallback(async () => {
    if (!currentReview) return;
    try {
      await completeItem(currentReview.id);
    } catch (err) {
      logger.warn('StudyHub', 'Failed to complete review item', err);
    }
  }, [completeItem, currentReview]);

  const handleLater = useCallback(() => {
    setReviewIndex((i) => i + 1);
  }, []);

  const handleNavigate = useCallback(
    (screen: string, params?: Record<string, string>) => {
      const premiumLabel = PREMIUM_SCREENS[screen];
      if (premiumLabel && !isPremium) {
        showUpgrade('feature', premiumLabel);
        return;
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      navigation.navigate(screen as any, params as any);
    },
    [isPremium, showUpgrade, navigation],
  );

  const handleDeepLink = useCallback(
    (deepLink: { screen: string; params?: Record<string, string> }) => {
      handleNavigate(deepLink.screen, deepLink.params);
    },
    [handleNavigate],
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: base.bg }]}>
      <ScrollView ref={scrollRef} contentContainerStyle={styles.content}>
        <Text style={[styles.title, { color: base.gold }]} accessibilityRole="header">
          Study
        </Text>

        {/* ── Continue hero (hidden entirely when no active plan) ─── */}
        {plan && target && (
          <View style={styles.block}>
            <ContinueHero
              plan={plan}
              items={items}
              target={target}
              estimateMin={estimateMin}
              onResume={handleResume}
            />
          </View>
        )}

        {/* ── Review card — one due prompt at a time ─── */}
        {currentReview && (
          <View style={styles.block}>
            <ReviewRecallCard
              item={currentReview}
              dueCount={dueItems.length}
              onRecall={handleRecall}
              onLater={handleLater}
            />
          </View>
        )}

        {/* ── Rhythm line ─── */}
        <View style={styles.block}>
          <RhythmLine rhythm={rhythm} />
        </View>

        {/* ── Library shelves (shared with ExploreMenuScreen) ─── */}
        <LibrarySections
          imageRegistry={imageRegistry}
          isPremium={isPremium}
          onNavigate={handleNavigate}
          onDeepLink={handleDeepLink}
        />
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
  content: { padding: spacing.md, paddingBottom: spacing.xxl },
  title: { fontFamily: fontFamily.displaySemiBold, fontSize: 22, marginBottom: spacing.sm },
  block: { marginBottom: spacing.md },
});

export default withErrorBoundary(StudyHubScreen);
