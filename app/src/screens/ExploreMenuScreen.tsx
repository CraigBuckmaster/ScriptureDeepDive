/**
 * ExploreMenuScreen — Redesigned Explore tab with:
 *   1. Jump-to category pills (horizontal scroll)
 *   2. Start Here banner (new users, chaptersRead < 5)
 *   3. Recommended for You with editorial RecommendedCards
 *   4. Horizontal feature carousels with image cards + count CTAs
 *   5. Gold separators between sections
 *
 * Part of Epic #1071 (#1077).
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
import { FeatureCard, CARD_WIDTH, type FeatureCardData } from '../components/FeatureCard';
import { RecommendedCard } from '../components/RecommendedCard';
import { StartHereBanner } from '../components/StartHereBanner';
import { UpgradePrompt } from '../components/UpgradePrompt';
import { getReadingStats, getPreference, setPreference } from '../db/user';
import { withErrorBoundary } from '../components/ScreenErrorBoundary';

// ── Section data ───────────────────────────────────────────────

interface FeatureSection {
  id: string;
  label: string;
  subtitle: string;
  features: FeatureCardData[];
}

const PREMIUM_SCREENS: Record<string, string> = {
  Concordance: 'Concordance Search',
  ContentLibrary: 'Content Library',
  ThreadBrowse: 'Cross-Reference Threading',
};

const SECTIONS: FeatureSection[] = [
  {
    id: 'biblical-world', label: 'The Biblical World', subtitle: 'Where, when, and who',
    features: [
      { title: 'People',    subtitle: '282 people on a zoomable family tree with bios',                color: '#e86040', screen: 'GenealogyTree' },
      { title: 'Timeline',  subtitle: '543 events from creation to revelation',                        color: '#70b8e8', screen: 'Timeline' },
      { title: 'Periods',   subtitle: '12 eras from creation to the apostolic age',                    color: '#8a6e3a', screen: 'Periods', premium: true },
      { title: 'Story',     subtitle: '8 acts in God\'s redemptive narrative',                          color: '#c8a040', screen: 'RedemptiveArc', premium: true },
      { title: 'Map',       subtitle: '28 journeys with route overlays across 73 places',              color: '#81C784', screen: 'Map' },
    ],
  },
  {
    id: 'themes', label: 'Themes & Connections', subtitle: 'Trace ideas across Scripture',
    features: [
      { title: 'Concepts',           subtitle: 'Covenant, atonement, kingdom & more',                  color: '#bfa050', screen: 'ConceptBrowse' },
      { title: 'Topical Index',      subtitle: 'What does the Bible say about...?',                    color: '#c8a040', screen: 'TopicBrowse' },
      { title: 'Prophecy',           subtitle: '50 chains \u2014 OT to NT fulfillment',                color: '#e8a070', screen: 'ProphecyBrowse' },
      { title: 'Threads',            subtitle: 'One idea across 31 chains',                            color: '#9090e0', screen: 'ThreadBrowse', premium: true },
      { title: 'Gospel Harmony',     subtitle: 'Parallel accounts across four Gospels',                color: '#70d098', screen: 'HarmonyBrowse' },
    ],
  },
  {
    id: 'language', label: 'Language & Reference', subtitle: 'Original words and definitions',
    features: [
      { title: 'Word Studies', subtitle: 'Hebrew & Greek deep dives',                                  color: '#e890b8', screen: 'WordStudyBrowse' },
      { title: 'Concordance',  subtitle: 'Every occurrence of a word',                                 color: '#70b8e8', screen: 'Concordance', premium: true },
      { title: 'Dictionary',   subtitle: 'Definitions for every biblical term',                         color: '#c090e0', screen: 'DictionaryBrowse' },
    ],
  },
  {
    id: 'scholarly', label: 'Scholarly Analysis', subtitle: 'Academic perspectives & debate',
    features: [
      { title: 'Scholars',           subtitle: 'Browse all 54 by tradition',                            color: '#a0b8d0', screen: 'ScholarBrowse' },
      { title: 'Debates',            subtitle: '303 topics where scholars disagree',                    color: '#d08080', screen: 'DebateBrowse' },
      { title: 'Difficult Passages', subtitle: '53 hard texts with multi-view responses',               color: '#FFB74D', screen: 'DifficultPassagesBrowse' },
      { title: 'Content Library',    subtitle: 'Discourse, manuscripts & more',                          color: '#b8a0d0', screen: 'ContentLibrary', premium: true },
    ],
  },
  {
    id: 'life', label: 'Life & Faith', subtitle: 'Biblical guidance for everyday life',
    features: [
      { title: 'Life Topics', subtitle: 'Practical guidance from Scripture',                             color: '#81C784', screen: 'LifeTopics' },
    ],
  },
  {
    id: 'deep-dive', label: 'Deep Dive', subtitle: 'Advanced study tools',
    features: [
      { title: 'Hermeneutic Lenses', subtitle: 'Feminist, liberation, canonical & more',                color: '#BA68C8', screen: 'LensBrowse' },
      { title: 'Archaeology',        subtitle: 'Real artifacts that illuminate the text',                color: '#b07d4f', screen: 'ArchaeologyBrowse' },
      { title: 'Time-Travel Reader', subtitle: 'Augustine, Luther & modern scholars',                   color: '#8a6a3a', screen: 'TimeTravelBrowse' },
      { title: 'Grammar',            subtitle: 'Verb forms & syntax in plain English',                  color: '#7a9ab0', screen: 'GrammarBrowse' },
    ],
  },
];

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
    for (const section of SECTIONS.slice(0, 2)) {
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

  // ── Image lookup (flat registry keyed by screen name) ──────
  const getScreenImages = useCallback((screenName: string) => {
    return imageRegistry[screenName];
  }, [imageRegistry]);

  const showStartHere = chaptersRead !== null && chaptersRead < 5 && !startHereDismissed;
  const showRecommendations = !showStartHere && recommendations.length > 0;
  const filteredSections = activeJump ? SECTIONS.filter((s) => s.id === activeJump) : SECTIONS;

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
          {SECTIONS.map((s) => (
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

        {/* ── Sections with carousels ─── */}
        {filteredSections.map((section, sectionIndex) => (
          <View key={section.id}>
            {/* Gold separator between sections */}
            {sectionIndex > 0 && (
              <View style={[styles.separator, { backgroundColor: base.gold + '1A' }]} />
            )}

            <View style={styles.section}>
              <Text style={[styles.sectionLabel, { color: base.gold }]}>{section.label}</Text>
              <Text style={[styles.sectionSubtitle, { color: base.textMuted }]}>{section.subtitle}</Text>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.carouselContent}
                decelerationRate="fast"
                snapToInterval={CARD_WIDTH + spacing.sm}
              >
                {section.features.map((f, cardIndex) => {
                  const imgData = getScreenImages(f.screen);
                  return (
                    <FeatureCard
                      key={f.screen}
                      feature={f}
                      onPress={() => handleNavigate(f.screen)}
                      isPremium={isPremium}
                      images={imgData?.images}
                      count={imgData?.count}
                      noun={imgData?.noun}
                      onImagePress={handleDeepLink}
                      staggerMs={cardIndex * 1200}
                    />
                  );
                })}
              </ScrollView>
            </View>
          </View>
        ))}

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

  // Gold separator
  separator: { height: 1, marginBottom: spacing.md },

  // Sections
  section: { marginBottom: spacing.md },
  sectionLabel: { fontFamily: fontFamily.displayMedium, fontSize: 13, letterSpacing: 0.5, marginBottom: 2 },
  sectionSubtitle: { fontFamily: fontFamily.ui, fontSize: 11, marginBottom: spacing.sm },

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
