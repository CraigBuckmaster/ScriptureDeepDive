/**
 * ExploreMenuScreen — Redesigned Explore tab with:
 *   1. Jump-to category pills (horizontal scroll)
 *   2. Start Here banner (new users, chaptersRead < 5)
 *   3. Recommended for You with editorial RecommendedCards
 *   4. Library shelves (components/study/LibrarySections — extracted in
 *      #1832 so the Study hub renders the same sections)
 *   5. Gold separators between sections
 *
 * Part of Epic #1071 (#1077); flag-off root of the Study tab (#1830).
 */

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useScrollToTop } from '@react-navigation/native';
import type { ScreenNavProp } from '../navigation/types';
import { useTheme, spacing, fontFamily } from '../theme';
import { usePremium } from '../hooks/usePremium';
import { useExploreRecommendations } from '../hooks/useExploreRecommendations';
import { useExploreImages } from '../hooks/useExploreImages';
import { RecommendedCard } from '../components/RecommendedCard';
import { StartHereBanner } from '../components/StartHereBanner';
import { UpgradePrompt } from '../components/UpgradePrompt';
import {
  LibrarySections,
  LIBRARY_SECTIONS,
  PREMIUM_SCREENS,
} from '../components/study/LibrarySections';
import { getReadingStats, getPreference, setPreference } from '../db/user';
import { withErrorBoundary } from '../components/ScreenErrorBoundary';

// ── Component ──────────────────────────────────────────────────

function ExploreMenuScreen() {
  const { base } = useTheme();
  const navigation = useNavigation<ScreenNavProp<'Explore', 'ExploreMenu'>>();
  const scrollRef = useRef<ScrollView>(null);
  useScrollToTop(scrollRef);
  const { isPremium, upgradeRequest, showUpgrade, dismissUpgrade } = usePremium();
  const { recommendations, bookName } = useExploreRecommendations();
  const imageRegistry = useExploreImages();

  const [activeJump, setActiveJump] = useState<string | null>(null);
  const [chaptersRead, setChaptersRead] = useState<number | null>(null);
  const [startHereDismissed, setStartHereDismissedState] = useState(false);

  useEffect(() => {
    getReadingStats().then((s) => setChaptersRead(s.totalChapters)).catch(() => setChaptersRead(0));
    getPreference('startHereDismissed').then((v) => setStartHereDismissedState(v === '1')).catch(() => {});
  }, []);

  // ── Preload initial card images on mount ───────────────────
  useEffect(() => {
    const urls: string[] = [];
    for (const section of LIBRARY_SECTIONS.slice(0, 2)) {
      for (const f of section.features.slice(0, 3)) {
        const fi = imageRegistry[f.screen];
        if (fi?.images?.[0]) urls.push(fi.images[0].url);
      }
    }
    if (urls.length > 0) {
      Image.prefetch(urls).catch(() => {});
    }
  }, [imageRegistry]);

  const handleDismissStartHere = useCallback(() => {
    setStartHereDismissedState(true);
    setPreference('startHereDismissed', '1').catch(() => {});
  }, []);

  const handleNavigate = useCallback((screen: string, params?: Record<string, string>) => {
    const premiumLabel = PREMIUM_SCREENS[screen];
    if (premiumLabel && !isPremium) {
      showUpgrade('feature', premiumLabel);
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    navigation.navigate(screen as any, params as any);
  }, [isPremium, showUpgrade, navigation]);

  const handleDeepLink = useCallback((deepLink: { screen: string; params?: Record<string, string> }) => {
    handleNavigate(deepLink.screen, deepLink.params);
  }, [handleNavigate]);

  const handleJumpTo = useCallback((sectionId: string) => {
    setActiveJump((prev) => prev === sectionId ? null : sectionId);
  }, []);

  const getScreenImages = useCallback((screenName: string) => {
    return imageRegistry[screenName];
  }, [imageRegistry]);

  const showStartHere = chaptersRead !== null && chaptersRead < 5 && !startHereDismissed;
  const showRecommendations = !showStartHere && recommendations.length > 0;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: base.bg }]}>
      <ScrollView ref={scrollRef} contentContainerStyle={styles.content}>
        <Text style={[styles.title, { color: base.gold }]} accessibilityRole="header">Explore</Text>

        {/* ── Jump-to pills ─── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.pillScroll}
          style={styles.pillContainer}
        >
          {LIBRARY_SECTIONS.map((s) => (
            <TouchableOpacity
              key={s.id}
              onPress={() => handleJumpTo(s.id)}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={`Jump to ${s.label}`}
              style={[styles.pill, {
                borderColor: activeJump === s.id ? base.gold : base.border,
                backgroundColor: activeJump === s.id ? base.gold + '12' : 'transparent',
              }]}
            >
              <Text style={[styles.pillLabel, { color: activeJump === s.id ? base.gold : base.textMuted }]}>
                {s.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* ── Start Here banner (new users) ─── */}
        {showStartHere && (
          <StartHereBanner onDismiss={handleDismissStartHere} onNavigate={handleNavigate} />
        )}

        {/* ── Recommended for You (returning users) ─── */}
        {showRecommendations && (
          <View style={styles.recsSection}>
            <Text style={[styles.recsLabel, { color: base.textMuted }]}>RECOMMENDED FOR YOU</Text>
            {bookName && (
              <Text style={[styles.recsSubtitle, { color: base.textMuted }]}>
                Based on your reading in {bookName}
              </Text>
            )}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.carouselContent}
            >
              {recommendations.map((rec, i) => {
                const recImgData = getScreenImages(rec.screen);
                return (
                  <RecommendedCard
                    key={`rec-${i}`}
                    recommendation={rec}
                    onPress={() => handleNavigate(rec.screen)}
                    isPremium={isPremium}
                    images={recImgData?.images}
                    onImagePress={handleDeepLink}
                    staggerMs={i * 1500}
                  />
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* ── Library shelves (shared with the Study hub) ─── */}
        <LibrarySections
          imageRegistry={imageRegistry}
          isPremium={isPremium}
          onNavigate={handleNavigate}
          onDeepLink={handleDeepLink}
          filterSectionId={activeJump}
        />

        {/* Show all link when filtered */}
        {activeJump && (
          <TouchableOpacity
            onPress={() => setActiveJump(null)}
            style={[styles.showAllBtn, { borderColor: base.gold + '40' }]}
            activeOpacity={0.7}
          >
            <Text style={[styles.showAllText, { color: base.gold }]}>Show all sections</Text>
          </TouchableOpacity>
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

// ── Styles ─────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.md, paddingBottom: spacing.xxl },
  title: { fontFamily: fontFamily.displaySemiBold, fontSize: 22, marginBottom: spacing.sm },

  // Jump-to pills
  pillContainer: { marginBottom: spacing.md, marginHorizontal: -spacing.md },
  pillScroll: { paddingHorizontal: spacing.md, gap: 6 },
  pill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 14, borderWidth: 1,
  },
  pillLabel: { fontFamily: fontFamily.uiMedium, fontSize: 10 },

  // Recommendations
  recsSection: { marginBottom: spacing.md },
  recsLabel: { fontFamily: fontFamily.uiMedium, fontSize: 10, letterSpacing: 1, marginBottom: 2 },
  recsSubtitle: { fontFamily: fontFamily.ui, fontSize: 10, marginBottom: spacing.sm },

  // Carousels
  carouselContent: { gap: spacing.sm },

  // Show all
  showAllBtn: {
    alignSelf: 'center', borderWidth: 1, borderRadius: 14,
    paddingHorizontal: 16, paddingVertical: 6, marginTop: spacing.sm,
  },
  showAllText: { fontFamily: fontFamily.uiMedium, fontSize: 11 },
});

export default withErrorBoundary(ExploreMenuScreen);
