/**
 * JourneyBrowseSection — Journeys section for ExploreMenuScreen.
 *
 * Two horizontal rows:
 *   Row A: Person Journeys — avatar-style cards
 *   Row B: Thematic + Concept Journeys — text-forward cards
 *
 * Rewritten for Epic #1379 unified journey model.
 */

import React, { useCallback } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { ScreenNavProp } from '../navigation/types';
import { useJourneyBrowse, type JourneyBrowseEntry } from '../hooks/useJourneyBrowse';
import { useTheme, spacing, radii, fontFamily } from '../theme';

function PersonCard({ entry, onPress }: { entry: JourneyBrowseEntry; onPress: () => void }) {
  const { base } = useTheme();
  return (
    <TouchableOpacity
      style={[styles.personCard, { backgroundColor: base.bgElevated, borderColor: base.gold + '20' }]}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`${entry.title} journey`}
    >
      <View style={[styles.avatar, { backgroundColor: base.gold + '30', borderColor: base.gold + '40' }]}>
        <Text style={[styles.avatarText, { color: base.gold }]}>{entry.title.charAt(0)}</Text>
      </View>
      <Text style={[styles.personName, { color: base.text }]} numberOfLines={1}>{entry.title}</Text>
      {entry.subtitle && (
        <Text style={[styles.personRole, { color: base.textMuted }]} numberOfLines={1}>{entry.subtitle}</Text>
      )}
    </TouchableOpacity>
  );
}

function JourneyCard({ entry, onPress }: { entry: JourneyBrowseEntry; onPress: () => void }) {
  const { base } = useTheme();
  return (
    <TouchableOpacity
      style={[styles.conceptCard, { backgroundColor: base.bgElevated, borderColor: base.border }]}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`${entry.title} journey`}
    >
      <Text style={[styles.conceptTitle, { color: base.gold }]} numberOfLines={1}>{entry.title}</Text>
      {entry.subtitle && (
        <Text style={[styles.conceptRange, { color: base.textMuted }]} numberOfLines={1}>{entry.subtitle}</Text>
      )}
      {entry.lensId && (
        <Text style={[styles.stageCount, { color: base.textDim }]}>
          {entry.lensId.replace(/_/g, ' ')}
        </Text>
      )}
    </TouchableOpacity>
  );
}

export function JourneyBrowseSection() {
  const { base } = useTheme();
  const navigation = useNavigation<ScreenNavProp<'Explore', 'ExploreMenu'>>();
  const { personJourneys, thematicJourneys, conceptJourneys, isLoading } = useJourneyBrowse();

  const handleJourneyPress = useCallback((journeyId: string) => {
    navigation.navigate('JourneyDetail', { journeyId });
  }, [navigation]);

  const handleBrowseAll = useCallback((tab?: 'people' | 'lenses' | 'featured') => {
    navigation.navigate('JourneyBrowse', { tab });
  }, [navigation]);

  if (isLoading || (personJourneys.length === 0 && thematicJourneys.length === 0 && conceptJourneys.length === 0)) {
    return null;
  }

  const otherJourneys = [...thematicJourneys, ...conceptJourneys];

  return (
    <View style={styles.container}>
      {personJourneys.length > 0 && (
        <View style={styles.rowContainer}>
          <View style={styles.rowHeader}>
            <Text style={[styles.rowLabel, { color: base.textMuted }]}>PEOPLE</Text>
            <TouchableOpacity onPress={() => handleBrowseAll('people')} hitSlop={8}>
              <Text style={[styles.browseAll, { color: base.gold }]}>{personJourneys.length} journeys ›</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.carouselContent} decelerationRate="fast">
            {personJourneys.map((entry) => (
              <PersonCard key={entry.id} entry={entry} onPress={() => handleJourneyPress(entry.id)} />
            ))}
          </ScrollView>
        </View>
      )}

      {otherJourneys.length > 0 && (
        <View style={styles.rowContainer}>
          <View style={styles.rowHeader}>
            <Text style={[styles.rowLabel, { color: base.textMuted }]}>JOURNEYS</Text>
            <TouchableOpacity onPress={() => handleBrowseAll('lenses')} hitSlop={8}>
              <Text style={[styles.browseAll, { color: base.gold }]}>{otherJourneys.length} journeys ›</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.carouselContent} decelerationRate="fast">
            {otherJourneys.map((entry) => (
              <JourneyCard key={entry.id} entry={entry} onPress={() => handleJourneyPress(entry.id)} />
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const PERSON_CARD_WIDTH = 120;
const CONCEPT_CARD_WIDTH = 160;

const styles = StyleSheet.create({
  container: { gap: spacing.md },
  rowContainer: { gap: spacing.sm },
  rowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  rowLabel: { fontFamily: fontFamily.uiMedium, fontSize: 11, letterSpacing: 0.5 },
  browseAll: { fontFamily: fontFamily.uiMedium, fontSize: 11 },
  carouselContent: { paddingHorizontal: 20, gap: spacing.sm },
  personCard: {
    width: PERSON_CARD_WIDTH,
    borderRadius: radii.lg,
    borderWidth: 1,
    padding: spacing.sm + 2,
    alignItems: 'center',
  },
  avatar: {
    width: 44, height: 44, borderRadius: 22, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center', marginBottom: spacing.xs,
  },
  avatarText: { fontFamily: fontFamily.displaySemiBold, fontSize: 18 },
  personName: { fontFamily: fontFamily.uiMedium, fontSize: 12, textAlign: 'center' },
  personRole: { fontFamily: fontFamily.ui, fontSize: 10, textAlign: 'center', marginTop: 1 },
  stageCount: { fontFamily: fontFamily.uiMedium, fontSize: 10, marginTop: spacing.xs },
  conceptCard: {
    width: CONCEPT_CARD_WIDTH,
    borderRadius: radii.lg,
    borderWidth: 1,
    padding: spacing.sm + 4,
  },
  conceptTitle: { fontFamily: fontFamily.uiMedium, fontSize: 13, marginBottom: 2 },
  conceptRange: { fontFamily: fontFamily.ui, fontSize: 10, lineHeight: 14, marginBottom: spacing.xs },
});
