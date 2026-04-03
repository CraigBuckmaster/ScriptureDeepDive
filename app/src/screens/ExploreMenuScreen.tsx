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
      { title: 'People', subtitle: 'Lives that shaped sacred history', screen: 'GenealogyTree' },
      { title: 'Timeline', subtitle: 'The arc of redemption through the ages', screen: 'Timeline' },
      { title: 'Map', subtitle: 'Walk the lands of the Bible', screen: 'Map' },
    ],
  },
  {
    label: 'Themes & Connections',
    subtitle: 'Trace ideas across Scripture',
    layout: 'grid',
    features: [
      { title: 'Concepts', subtitle: 'Explore the grand themes of Scripture', screen: 'ConceptBrowse' },
      { title: 'Topical Index', subtitle: 'What does the Bible say about...?', screen: 'TopicBrowse' },
      { title: 'Prophecy & Typology', subtitle: 'Trace fulfillment from promise to completion', screen: 'ProphecyBrowse' },
      { title: 'Threads', subtitle: '31 thematic chains across Scripture', screen: 'ThreadBrowse' },
      { title: 'Gospel Harmony', subtitle: 'The life of Jesus across four Gospels', screen: 'HarmonyBrowse' },
    ],
  },
  {
    label: 'Language & Reference',
    subtitle: 'Original words and definitions',
    layout: 'grid',
    features: [
      { title: 'Word Studies', subtitle: 'Meaning in the original languages', screen: 'WordStudyBrowse' },
      { title: 'Concordance', subtitle: 'Every occurrence of a word in Scripture', screen: 'Concordance' },
      { title: 'Bible Dictionary', subtitle: 'Definitions for every biblical term', screen: 'DictionaryBrowse' },
    ],
  },
  {
    label: 'Scholarly Analysis',
    subtitle: 'Academic perspectives and debate',
    layout: 'grid',
    features: [
      { title: 'Scholars', subtitle: 'Insights from centuries of scholarship', screen: 'ScholarBrowse' },
      { title: 'Scholar Debates', subtitle: 'Explore where scholars disagree', screen: 'DebateBrowse' },
      { title: 'Difficult Passages', subtitle: 'Wrestling with hard texts', screen: 'DifficultPassagesBrowse' },
      { title: 'Content Library', subtitle: 'Browse manuscripts, discourse, and more', screen: 'ContentLibrary' },
    ],
  },
];

export default function ExploreMenuScreen() {
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
