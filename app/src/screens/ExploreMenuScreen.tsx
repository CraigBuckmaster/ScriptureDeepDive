/**
 * ExploreMenuScreen — Grouped feature sections for Explore tab.
 *
 * Features organized into labeled sections: The Biblical World (hero cards),
 * Themes & Connections, Language & Reference, Scholarly Analysis (grid cards).
 */

import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { ScreenNavProp } from '../navigation/types';
import { useScrollToTop } from '@react-navigation/native';
import { useTheme, spacing, radii, fontFamily } from '../theme';
import { usePremium } from '../hooks/usePremium';
import { UpgradePrompt } from '../components/UpgradePrompt';
import { withErrorBoundary } from '../components/ScreenErrorBoundary';

interface Feature {
  title: string;
  subtitle: string;
  screen: string;
}

interface FeatureSection {
  label: string;
  subtitle: string;
  layout: 'hero' | 'grid';
  features: Feature[];
}

/** Screens that require Companion+ — key is screen name, value is UpgradePrompt featureName. */
const PREMIUM_SCREENS: Record<string, string> = {
  Concordance: 'Concordance Search',
  ContentLibrary: 'Content Library',
  ThreadBrowse: 'Cross-Reference Threading',
};

const SECTIONS: FeatureSection[] = [
  {
    label: 'The Biblical World',
    subtitle: 'Where, when, and who',
    layout: 'hero',
    features: [
      { title: 'People', subtitle: '282 people on a zoomable family tree with bios', screen: 'GenealogyTree' },
      { title: 'Timeline', subtitle: '543 events from creation to revelation \u2014 tap any to read the chapter', screen: 'Timeline' },
      { title: 'Map', subtitle: '28 journeys with route overlays across 73 places', screen: 'Map' },
    ],
  },
  {
    label: 'Themes & Connections',
    subtitle: 'Trace ideas across Scripture',
    layout: 'grid',
    features: [
      { title: 'Concepts', subtitle: 'Trace covenant, atonement, kingdom & more across the whole Bible', screen: 'ConceptBrowse' },
      { title: 'Topical Index', subtitle: 'What does the Bible say about...?', screen: 'TopicBrowse' },
      { title: 'Prophecy & Typology', subtitle: '50 chains showing how OT promises connect to NT fulfillment', screen: 'ProphecyBrowse' },
      { title: 'Threads', subtitle: 'Follow one idea from Genesis to Revelation across 31 chains', screen: 'ThreadBrowse' },
      { title: 'Gospel Harmony', subtitle: 'Read parallel accounts of the same event across all four Gospels', screen: 'HarmonyBrowse' },
    ],
  },
  {
    label: 'Language & Reference',
    subtitle: 'Original words and definitions',
    layout: 'grid',
    features: [
      { title: 'Word Studies', subtitle: 'Deep dives into Hebrew & Greek words \u2014 etymology, usage, and theology', screen: 'WordStudyBrowse' },
      { title: 'Concordance', subtitle: 'Search every verse where a Hebrew or Greek word appears', screen: 'Concordance' },
      { title: 'Bible Dictionary', subtitle: 'Definitions for every biblical term', screen: 'DictionaryBrowse' },
    ],
  },
  {
    label: 'Scholarly Analysis',
    subtitle: 'Academic perspectives and debate',
    layout: 'grid',
    features: [
      { title: 'Scholars', subtitle: 'Browse all 54 scholars by tradition with full bios', screen: 'ScholarBrowse' },
      { title: 'Scholar Debates', subtitle: '303 topics where scholars disagree \u2014 see each side with citations', screen: 'DebateBrowse' },
      { title: 'Difficult Passages', subtitle: '53 hard passages with multi-view scholarly responses', screen: 'DifficultPassagesBrowse' },
      { title: 'Content Library', subtitle: 'Discourse analysis, manuscript notes, chiastic structures & more', screen: 'ContentLibrary' },
    ],
  },
  {
    label: 'Life & Faith',
    subtitle: 'Biblical guidance for everyday life',
    layout: 'grid',
    features: [
      { title: 'Life Topics', subtitle: 'Biblical guidance for everyday life', screen: 'LifeTopics' },
    ],
  },
  {
    label: 'Deep Dive',
    subtitle: 'Advanced study tools',
    layout: 'grid',
    features: [
      { title: 'Hermeneutic Lenses', subtitle: 'Read a chapter through feminist, liberation, or canonical frameworks', screen: 'LensBrowse' },
      { title: 'Archaeological Evidence', subtitle: 'Real artifacts and sites that illuminate the biblical text', screen: 'ArchaeologyBrowse' },
      { title: 'Time-Travel Reader', subtitle: 'How did Augustine, Aquinas, Luther & modern scholars read this passage?', screen: 'TimeTravelBrowse' },
      { title: 'Grammar Reference', subtitle: 'Verb forms, noun cases & syntax patterns in plain English', screen: 'GrammarBrowse' },
    ],
  },
];

function ExploreMenuScreen() {
  const { base } = useTheme();
  const navigation = useNavigation<ScreenNavProp<'Explore', 'ExploreMenu'>>();
  const scrollRef = useRef<ScrollView>(null);
  useScrollToTop(scrollRef);
  const { isPremium, upgradeRequest, showUpgrade, dismissUpgrade } = usePremium();

  const handleNavigate = (screen: string) => {
    const premiumLabel = PREMIUM_SCREENS[screen];
    if (premiumLabel && !isPremium) {
      showUpgrade('feature', premiumLabel);
      return;
    }
    navigation.navigate(screen as any);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: base.bg }]}>
      <ScrollView ref={scrollRef} contentContainerStyle={styles.content}>
        <Text style={[styles.title, { color: base.gold }]} accessibilityRole="header">Explore</Text>

        {SECTIONS.map((section) => (
          <View key={section.label} style={styles.section}>
            <Text style={[styles.sectionLabel, { color: base.gold }]}>{section.label}</Text>
            <Text style={[styles.sectionSubtitle, { color: base.textMuted }]}>{section.subtitle}</Text>

            {section.layout === 'hero' ? (
              section.features.map((f) => (
                <TouchableOpacity
                  key={f.screen}
                  onPress={() => handleNavigate(f.screen)}
                  activeOpacity={0.7}
                  style={[styles.heroCard, { backgroundColor: base.bgElevated, borderColor: base.gold + '20' }]}
                >
                  <Text style={[styles.heroTitle, { color: base.text }]}>{f.title}</Text>
                  <Text style={[styles.heroSubtitle, { color: base.textDim }]}>{f.subtitle}</Text>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.grid}>
                {section.features.map((f) => {
                  const isLocked = !isPremium && !!PREMIUM_SCREENS[f.screen];
                  return (
                    <TouchableOpacity
                      key={f.screen}
                      onPress={() => handleNavigate(f.screen)}
                      activeOpacity={0.7}
                      style={[styles.gridCard, { backgroundColor: base.bgElevated, borderColor: base.gold + '20' }]}
                    >
                      <View style={styles.gridTitleRow}>
                        <Text style={[styles.gridTitle, { color: base.text }]}>{f.title}</Text>
                        {isLocked && <Text style={[styles.lockIcon, { color: base.gold }]}>✦</Text>}
                      </View>
                      <Text style={[styles.gridSubtitle, { color: base.textMuted }]}>{f.subtitle}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>
        ))}
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
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  title: {
    fontFamily: fontFamily.displaySemiBold,
    fontSize: 22,
    marginBottom: spacing.lg,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionLabel: {
    fontFamily: fontFamily.displayMedium,
    fontSize: 13,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  sectionSubtitle: {
    fontFamily: fontFamily.ui,
    fontSize: 11,
    marginBottom: spacing.sm,
  },
  heroCard: {
    borderWidth: 1,
    borderRadius: radii.lg,
    padding: spacing.md,
    marginBottom: spacing.sm + 2,
  },
  heroTitle: {
    fontFamily: fontFamily.displayMedium,
    fontSize: 15,
  },
  heroSubtitle: {
    fontFamily: fontFamily.ui,
    fontSize: 12,
    marginTop: 3,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  gridCard: {
    width: '48%',
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing.md,
    minHeight: 72,
    justifyContent: 'center',
  },
  gridTitle: {
    fontFamily: fontFamily.displayMedium,
    fontSize: 13,
  },
  gridTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  lockIcon: {
    fontSize: 12,
  },
  gridSubtitle: {
    fontFamily: fontFamily.ui,
    fontSize: 11,
    marginTop: 3,
  },
});

export default withErrorBoundary(ExploreMenuScreen);
