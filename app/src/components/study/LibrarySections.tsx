/**
 * components/study/LibrarySections.tsx — The Explore/Study library
 * shelves, extracted from ExploreMenuScreen (#1832) so the Study hub
 * and the legacy Explore menu render the exact same sections.
 *
 * Each section is a horizontal shelf (FlatList) of cards: art slot
 * (content_images via the explore image registry, tonal-wash fallback
 * inside FeatureCard when no image) + title + subtitle. Per-tool accent
 * colors come from the theme's `libraryAccents` record (keyed by screen
 * name) so they transform with the active mode (#1898).
 *
 * Consumers own premium gating: pass `onNavigate` that checks
 * PREMIUM_SCREENS (exported here) and shows the upgrade prompt.
 */
import React, { useCallback } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useTheme, spacing, fontFamily } from '../../theme';
import { FeatureCard, CARD_WIDTH, type FeatureCardData } from '../FeatureCard';
import { JourneyBrowseSection } from '../JourneyBrowseSection';
import {
  ProphecyChainCard,
  DebatePreviewList,
  WordStudyPreviewList,
  LifeTopicGrid,
  FullWidthImageCard,
  GlossySectionWrapper,
  PROPHECY_CHAIN_CARD_WIDTH,
} from '../explore';
import { useProphecyChains } from '../../hooks/useProphecyChains';
import type { ExploreFeatureImages } from '../../types';
import type { ProphecyChain } from '../../types';

// ── Section data ───────────────────────────────────────────────

/** Card data minus `color` — the accent is injected from the theme's
 *  `libraryAccents` record at render time. */
export type LibraryFeature = Omit<FeatureCardData, 'color'>;

export interface FeatureSection {
  id: string;
  label: string;
  subtitle: string;
  features: LibraryFeature[];
}

/** Screens that require premium — consumers gate onNavigate with this. */
export const PREMIUM_SCREENS: Record<string, string> = {
  Concordance: 'Concordance Search',
  ContentLibrary: 'Content Library',
  ThreadBrowse: 'Cross-Reference Threading',
  HowWeGotTheBibleLanding: 'How We Got The Bible',
};

export const LIBRARY_SECTIONS: FeatureSection[] = [
  {
    id: 'biblical-world', label: 'The Biblical World', subtitle: 'Where, when, and who',
    features: [
      { title: 'People',    subtitle: '282 people on a zoomable family tree with bios',                screen: 'GenealogyTree' },
      { title: 'Timeline',  subtitle: '543 events from creation to revelation',                        screen: 'Timeline' },
      { title: 'Map',       subtitle: '28 journeys with route overlays across 73 places',              screen: 'Map' },
      { title: 'Periods',   subtitle: '12 eras from creation to the apostolic age',                    screen: 'Periods', premium: true },
      { title: 'Story',     subtitle: '8 acts in God\'s redemptive narrative',                          screen: 'RedemptiveArc', premium: true },
    ],
  },
  {
    id: 'themes', label: 'Themes & Connections', subtitle: 'Trace ideas across Scripture',
    features: [
      { title: 'Guided Journeys',    subtitle: '60 journeys — people, concepts, themes',             screen: 'JourneyBrowse' },
      { title: 'Topical Index',      subtitle: 'What does the Bible say about...?',                    screen: 'TopicBrowse' },
      { title: 'Prophecy',           subtitle: '50 chains — OT to NT fulfillment',                screen: 'ProphecyBrowse' },
      { title: 'Threads',            subtitle: 'One idea across 31 chains',                            screen: 'ThreadBrowse', premium: true },
      { title: 'Gospel Harmony',     subtitle: 'Parallel accounts across four Gospels',                screen: 'HarmonyBrowse' },
    ],
  },
  {
    id: 'journeys', label: 'Journeys', subtitle: 'Follow a life or trace an idea across Scripture',
    features: [], // Custom renderer — uses JourneyBrowseSection instead of FeatureCards
  },
  {
    id: 'language', label: 'Language & Reference', subtitle: 'Original words and definitions',
    features: [
      { title: 'Word Studies', subtitle: 'Hebrew & Greek deep dives',                                  screen: 'WordStudyBrowse' },
      { title: 'Concordance',  subtitle: 'Every occurrence of a word',                                 screen: 'Concordance', premium: true },
      { title: 'Dictionary',   subtitle: 'Definitions for every biblical term',                         screen: 'DictionaryBrowse' },
    ],
  },
  {
    id: 'scholarly', label: 'Scholarly Analysis', subtitle: 'Academic perspectives & debate',
    features: [
      { title: 'Scholars',             subtitle: 'Browse all 54 by tradition',                            screen: 'ScholarBrowse' },
      { title: 'Debates',              subtitle: '303 topics where scholars disagree',                    screen: 'DebateBrowse' },
      { title: 'Difficult Passages',   subtitle: '53 hard texts with multi-view responses',               screen: 'DifficultPassagesBrowse' },
      { title: 'How We Got The Bible', subtitle: 'Canon, manuscripts, translations, and the books Jude quoted', screen: 'HowWeGotTheBibleLanding', premium: true },
      { title: 'Content Library',      subtitle: 'Discourse, manuscripts & more',                          screen: 'ContentLibrary', premium: true },
    ],
  },
  {
    id: 'life', label: 'Life & Faith', subtitle: 'Biblical guidance for everyday life',
    features: [
      { title: 'Life Topics', subtitle: 'Practical guidance from Scripture',                             screen: 'LifeTopics' },
    ],
  },
  {
    id: 'deep-dive', label: 'Deep Dive', subtitle: 'Advanced study tools',
    features: [
      { title: 'Hermeneutic Lenses', subtitle: 'Read Scripture through 8 interpretive frameworks',     screen: 'LensBrowse' },
      { title: 'Archaeology',        subtitle: 'Real artifacts that illuminate the text',                screen: 'ArchaeologyBrowse' },
      { title: 'Time-Travel Reader', subtitle: 'Augustine, Luther & modern scholars',                   screen: 'TimeTravelBrowse' },
      { title: 'Grammar',            subtitle: 'Verb forms & syntax in plain English',                  screen: 'GrammarBrowse' },
    ],
  },
];

// ── Component ──────────────────────────────────────────────────

export interface LibrarySectionsProps {
  /** Explore image registry (useExploreImages) keyed by screen name. */
  imageRegistry: Record<string, ExploreFeatureImages>;
  isPremium: boolean;
  /** Navigate to a tool screen. Consumer applies PREMIUM_SCREENS gating. */
  onNavigate: (screen: string, params?: Record<string, string>) => void;
  /** Follow a card image's deep link. */
  onDeepLink: (deepLink: { screen: string; params?: Record<string, string> }) => void;
  /** When set, render only the section with this id (jump-pill filter). */
  filterSectionId?: string | null;
}

export function LibrarySections({
  imageRegistry,
  isPremium,
  onNavigate,
  onDeepLink,
  filterSectionId,
}: LibrarySectionsProps) {
  const { base, libraryAccents } = useTheme();
  const { chains: prophecyChains } = useProphecyChains();

  const getScreenImages = useCallback(
    (screenName: string) => imageRegistry[screenName],
    [imageRegistry],
  );

  const renderFeatureCard = useCallback(
    ({ item, index }: { item: LibraryFeature; index: number }, compact: boolean) => {
      const imgData = getScreenImages(item.screen);
      const feature: FeatureCardData = {
        ...item,
        color: libraryAccents[item.screen] ?? base.gold,
      };
      return (
        <FeatureCard
          feature={feature}
          onPress={() => onNavigate(item.screen)}
          isPremium={isPremium}
          images={imgData?.images}
          count={imgData?.count}
          noun={imgData?.noun}
          onImagePress={onDeepLink}
          staggerMs={index * 1200}
          compact={compact || undefined}
        />
      );
    },
    [getScreenImages, isPremium, onNavigate, onDeepLink, libraryAccents, base.gold],
  );

  const featureKey = useCallback((item: LibraryFeature) => item.screen, []);
  const chainKey = useCallback((item: ProphecyChain) => item.id, []);

  // ── Per-section content renderer ────────────────────────────
  const renderSectionContent = (section: FeatureSection) => {
    switch (section.id) {
      case 'journeys':
        return <JourneyBrowseSection />;
      case 'themes':
        return (
          <View style={styles.sectionGap}>
            {prophecyChains.length > 0 && (
              <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.carouselContent}
                decelerationRate="fast"
                snapToInterval={PROPHECY_CHAIN_CARD_WIDTH + spacing.sm}
                data={prophecyChains.slice(0, 4)}
                keyExtractor={chainKey}
                renderItem={({ item }) => (
                  <ProphecyChainCard
                    chain={item}
                    onPress={() => onNavigate('ProphecyDetail', { chainId: item.id })}
                  />
                )}
              />
            )}
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.carouselContent}
              decelerationRate="fast"
              data={section.features}
              keyExtractor={featureKey}
              renderItem={(info) => renderFeatureCard(info, true)}
            />
          </View>
        );
      case 'scholarly': {
        // Debates renders as the preview strip above; everything else flows
        // into the horizontal carousel below. Denylist (vs. allowlist) so
        // future cards added to LIBRARY_SECTIONS surface automatically —
        // same pattern as the 'language' case for WordStudyBrowse.
        const carouselFeatures = section.features.filter(
          (f) => f.screen !== 'DebateBrowse',
        );
        const totalDebates = getScreenImages('DebateBrowse')?.count ?? undefined;
        return (
          <View style={styles.sectionGap}>
            <DebatePreviewList
              onDebatePress={(debateId) => onNavigate('DebateDetail', { topicId: debateId })}
              onSeeAll={() => onNavigate('DebateBrowse')}
              totalCount={totalDebates ?? undefined}
            />
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.carouselContent}
              decelerationRate="fast"
              data={carouselFeatures}
              keyExtractor={featureKey}
              renderItem={(info) => renderFeatureCard(info, true)}
            />
          </View>
        );
      }
      case 'language': {
        const splitFeatures = section.features.filter(
          (f) => f.screen !== 'WordStudyBrowse',
        );
        const totalWords = getScreenImages('WordStudyBrowse')?.count ?? undefined;
        return (
          <View style={styles.sectionGap}>
            <WordStudyPreviewList
              onWordPress={(id) => onNavigate('WordStudyDetail', { wordId: id })}
              onSeeAll={() => onNavigate('WordStudyBrowse')}
              totalCount={totalWords ?? undefined}
            />
            <View style={styles.row3}>
              {splitFeatures.map((f, i) => (
                <View key={f.screen} style={styles.rowCell}>
                  {renderFeatureCard({ item: f, index: i }, true)}
                </View>
              ))}
            </View>
          </View>
        );
      }
      case 'life': {
        const lifeImage = getScreenImages('LifeTopics');
        return (
          <View style={styles.sectionGap}>
            <FullWidthImageCard
              title="Life Topics"
              subtitle="Practical guidance from Scripture"
              image={lifeImage?.images?.[0] ?? null}
              count={lifeImage?.count ?? null}
              noun={lifeImage?.noun}
              onPress={() => onNavigate('LifeTopics')}
            />
            <LifeTopicGrid
              onCategoryPress={(categoryId) => onNavigate('LifeTopics', { categoryId })}
            />
          </View>
        );
      }
      case 'deep-dive':
      case 'biblical-world':
      default:
        return (
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.carouselContent}
            decelerationRate="fast"
            snapToInterval={CARD_WIDTH + spacing.sm}
            data={section.features}
            keyExtractor={featureKey}
            renderItem={(info) => renderFeatureCard(info, false)}
          />
        );
    }
  };

  const sections = filterSectionId
    ? LIBRARY_SECTIONS.filter((s) => s.id === filterSectionId)
    : LIBRARY_SECTIONS;

  return (
    <>
      {sections.map((section, sectionIndex) => (
        <View key={section.id}>
          <GlossySectionWrapper sectionIndex={sectionIndex}>
            <View style={styles.section}>
              <Text style={[styles.sectionLabel, { color: base.gold }]}>{section.label}</Text>
              <Text style={[styles.sectionSubtitle, { color: base.textMuted }]}>{section.subtitle}</Text>
              {renderSectionContent(section)}
            </View>
          </GlossySectionWrapper>
        </View>
      ))}
    </>
  );
}

// ── Styles ─────────────────────────────────────────────────────

const styles = StyleSheet.create({
  section: { marginBottom: spacing.md },
  sectionLabel: { fontFamily: fontFamily.displayMedium, fontSize: 13, letterSpacing: 0.5, marginBottom: 2 },
  sectionSubtitle: { fontFamily: fontFamily.ui, fontSize: 11, marginBottom: spacing.sm },
  carouselContent: { gap: spacing.sm },
  sectionGap: { gap: spacing.md },
  row3: { flexDirection: 'row', gap: spacing.sm },
  rowCell: { flex: 1 },
});
