/**
 * ExploreMenuScreen — Grid of 6 feature cards with Lucide icons and live counts.
 */

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useScrollToTop } from '@react-navigation/native';
import { Users, Map, Clock, GitCompare, BookOpen, GraduationCap } from 'lucide-react-native';
import { getContentStats, type ContentStats } from '../db/content';
import { base, spacing, radii, fontFamily, panels } from '../theme';

interface Feature {
  title: string;
  subtitle: (stats: ContentStats | null) => string;
  screen: string;
  icon: React.ElementType;
  accent: string;
}

const FEATURES: Feature[] = [
  {
    title: 'People',
    subtitle: (s) => s ? `${s.peopleCount} biblical figures` : 'Genealogy tree of biblical figures',
    screen: 'GenealogyTree',
    icon: Users,
    accent: panels.ppl.accent,
  },
  {
    title: 'Map',
    subtitle: () => 'Places across narrative journeys',
    screen: 'Map',
    icon: Map,
    accent: panels.poi.accent,
  },
  {
    title: 'Timeline',
    subtitle: (s) => s ? `${s.timelineCount} events & figures` : 'From Creation to Revelation',
    screen: 'Timeline',
    icon: Clock,
    accent: panels.tl.accent,
  },
  {
    title: 'Parallel Passages',
    subtitle: () => 'Synoptic comparisons',
    screen: 'ParallelPassage',
    icon: GitCompare,
    accent: panels.cross.accent,
  },
  {
    title: 'Word Studies',
    subtitle: () => 'Hebrew & Greek lexicon',
    screen: 'WordStudyBrowse',
    icon: BookOpen,
    accent: panels.heb.accent,
  },
  {
    title: 'Scholars',
    subtitle: (s) => s ? `${s.scholarCount} commentators` : 'Commentators across traditions',
    screen: 'ScholarBrowse',
    icon: GraduationCap,
    accent: panels.com.accent,
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

        <View style={styles.grid}>
          {FEATURES.map((f) => (
            <TouchableOpacity
              key={f.screen}
              onPress={() => navigation.navigate(f.screen)}
              activeOpacity={0.7}
              style={[styles.card, { borderColor: f.accent + '30' }]}
            >
              <f.icon size={24} color={f.accent} style={styles.cardIcon} />
              <Text style={styles.cardTitle}>{f.title}</Text>
              <Text style={styles.cardSubtitle}>{f.subtitle(stats)}</Text>
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
  },
  title: {
    color: base.gold,
    fontFamily: fontFamily.displaySemiBold,
    fontSize: 22,
    marginBottom: spacing.lg,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  card: {
    width: '48%',
    backgroundColor: base.bgElevated,
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing.md,
    minHeight: 100,
    justifyContent: 'center',
  },
  cardIcon: {
    marginBottom: spacing.xs,
  },
  cardTitle: {
    color: base.text,
    fontFamily: fontFamily.displayMedium,
    fontSize: 13,
  },
  cardSubtitle: {
    color: base.textMuted,
    fontFamily: fontFamily.ui,
    fontSize: 11,
    marginTop: 2,
  },
});
