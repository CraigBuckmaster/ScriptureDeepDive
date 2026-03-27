/**
 * ExploreMenuScreen — Hero cards for top features + grid for the rest.
 *
 * People and Timeline get full-width hero cards. Map, Parallel Passages,
 * Word Studies, Scholars in a 2×2 grid. All gold borders, no icon squares.
 */

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useScrollToTop } from '@react-navigation/native';
import { getContentStats, type ContentStats } from '../db/content';
import { base, spacing, radii, fontFamily } from '../theme';

interface Feature {
  title: string;
  subtitle: (stats: ContentStats | null) => string;
  screen: string;
}

const HERO_FEATURES: Feature[] = [
  {
    title: 'People',
    subtitle: (s) => s ? `${s.peopleCount} biblical figures across eras` : 'Genealogy tree of biblical figures',
    screen: 'GenealogyTree',
  },
  {
    title: 'Timeline',
    subtitle: (s) => s ? `${s.timelineCount} events from Creation to Revelation` : 'Events from Creation to Revelation',
    screen: 'Timeline',
  },
];

const GRID_FEATURES: Feature[] = [
  {
    title: 'Map',
    subtitle: () => 'Places & journeys',
    screen: 'Map',
  },
  {
    title: 'Parallel Passages',
    subtitle: () => 'Synoptic texts',
    screen: 'ParallelPassage',
  },
  {
    title: 'Word Studies',
    subtitle: () => 'Hebrew & Greek',
    screen: 'WordStudyBrowse',
  },
  {
    title: 'Scholars',
    subtitle: (s) => s ? `${s.scholarCount} commentators` : 'Commentators across traditions',
    screen: 'ScholarBrowse',
  },
];

export default function ExploreMenuScreen() {
  const navigation = useNavigation<any>();
  const [stats, setStats] = useState<ContentStats | null>(null);
  const scrollRef = useRef<ScrollView>(null);
  useScrollToTop(scrollRef);

  useEffect(() => {
    getContentStats().then(setStats);
  }, []);

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
            <Text style={styles.heroSubtitle}>{f.subtitle(stats)}</Text>
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
              <Text style={styles.gridSubtitle}>{f.subtitle(stats)}</Text>
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
