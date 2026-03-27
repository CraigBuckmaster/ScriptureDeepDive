/**
 * ExploreMenuScreen — Hero cards for top features + grid for the rest.
 *
 * People and Timeline get full-width hero cards. Map, Parallel Passages,
 * Word Studies, Scholars in a 2×2 grid. All gold borders, no icon squares.
 */

import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useScrollToTop } from '@react-navigation/native';
import { base, spacing, radii, fontFamily } from '../theme';

interface Feature {
  title: string;
  subtitle: string;
  screen: string;
}

const HERO_FEATURES: Feature[] = [
  {
    title: 'People',
    subtitle: 'Lives that shaped sacred history',
    screen: 'GenealogyTree',
  },
  {
    title: 'Timeline',
    subtitle: 'The arc of redemption through the ages',
    screen: 'Timeline',
  },
];

const GRID_FEATURES: Feature[] = [
  {
    title: 'Map',
    subtitle: 'Walk the lands of the Bible',
    screen: 'Map',
  },
  {
    title: 'Parallel Passages',
    subtitle: 'Compare accounts side by side',
    screen: 'ParallelPassage',
  },
  {
    title: 'Word Studies',
    subtitle: 'Meaning in the original languages',
    screen: 'WordStudyBrowse',
  },
  {
    title: 'Scholars',
    subtitle: 'Insights from centuries of scholarship',
    screen: 'ScholarBrowse',
  },
  {
    title: 'Prophecy & Typology',
    subtitle: 'Trace fulfillment from promise to completion',
    screen: 'ProphecyBrowse',
  },
  {
    title: 'Concepts',
    subtitle: 'Explore the grand themes of Scripture',
    screen: 'ConceptBrowse',
  },
  {
    title: 'Difficult Passages',
    subtitle: 'Wrestling with hard texts',
    screen: 'DifficultPassagesBrowse',
  },
];

export default function ExploreMenuScreen() {
  const navigation = useNavigation<any>();
  const scrollRef = useRef<ScrollView>(null);
  useScrollToTop(scrollRef);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView ref={scrollRef} contentContainerStyle={styles.content}>
        <Text style={styles.title} accessibilityRole="header">Explore</Text>

        {/* Hero cards — full width */}
        {HERO_FEATURES.map((f) => (
          <TouchableOpacity
            key={f.screen}
            onPress={() => navigation.navigate(f.screen)}
            activeOpacity={0.7}
            style={styles.heroCard}
          >
            <Text style={styles.heroTitle}>{f.title}</Text>
            <Text style={styles.heroSubtitle}>{f.subtitle}</Text>
          </TouchableOpacity>
        ))}

        {/* Grid cards — 2×2 */}
        <View style={styles.grid}>
          {GRID_FEATURES.map((f) => (
            <TouchableOpacity
              key={f.screen}
              onPress={() => navigation.navigate(f.screen)}
              activeOpacity={0.7}
              style={styles.gridCard}
            >
              <Text style={styles.gridTitle}>{f.title}</Text>
              <Text style={styles.gridSubtitle}>{f.subtitle}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: base.bg,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  title: {
    color: base.gold,
    fontFamily: fontFamily.displaySemiBold,
    fontSize: 22,
    marginBottom: spacing.lg,
  },
  heroCard: {
    backgroundColor: base.bgElevated,
    borderWidth: 1,
    borderColor: base.gold + '20',
    borderRadius: radii.lg,
    padding: spacing.md,
    marginBottom: spacing.sm + 2,
  },
  heroTitle: {
    color: base.text,
    fontFamily: fontFamily.displayMedium,
    fontSize: 15,
  },
  heroSubtitle: {
    color: base.textDim,
    fontFamily: fontFamily.ui,
    fontSize: 12,
    marginTop: 3,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  gridCard: {
    width: '48%',
    backgroundColor: base.bgElevated,
    borderWidth: 1,
    borderColor: base.gold + '20',
    borderRadius: radii.md,
    padding: spacing.md,
    minHeight: 72,
    justifyContent: 'center',
  },
  gridTitle: {
    color: base.text,
    fontFamily: fontFamily.displayMedium,
    fontSize: 13,
  },
  gridSubtitle: {
    color: base.textMuted,
    fontFamily: fontFamily.ui,
    fontSize: 11,
    marginTop: 3,
  },
});
