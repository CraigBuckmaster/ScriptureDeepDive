/**
 * JourneyBrowseSection — Journeys section for ExploreMenuScreen.
 *
 * Two horizontal rows:
 *   Row A: Person Journeys — avatar-style cards (30 people)
 *   Row B: Concept Journeys — text-forward cards (20 concepts)
 *
 * Part of Journeys on Explore feature.
 */

import React, { useCallback } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ChevronRight } from 'lucide-react-native';
import type { ScreenNavProp } from '../navigation/types';
import { useJourneyBrowse, type PersonJourneyEntry, type ConceptJourneyEntry } from '../hooks/useJourneyBrowse';
import { useTheme, spacing, radii, fontFamily } from '../theme';

// ── Person Card ────────────────────────────────────────────────────

function PersonJourneyCard({
  entry,
  eraColor,
  onPress,
}: {
  entry: PersonJourneyEntry;
  eraColor: string;
  onPress: () => void;
}) {
  const { base } = useTheme();

  return (
    <TouchableOpacity
      style={[styles.personCard, { backgroundColor: base.bgElevated, borderColor: eraColor + '20' }]}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`${entry.name} journey, ${entry.stageCount} stages`}
    >
      {/* Avatar circle with initial */}
      <View style={[styles.avatar, { backgroundColor: eraColor + '30', borderColor: eraColor + '40' }]}>
        <Text style={[styles.avatarText, { color: eraColor }]}>
          {entry.name.charAt(0)}
        </Text>
      </View>
      <Text style={[styles.personName, { color: base.text }]} numberOfLines={1}>
        {entry.name}
      </Text>
      {entry.role ? (
        <Text style={[styles.personRole, { color: base.textMuted }]} numberOfLines={1}>
          {entry.role}
        </Text>
      ) : null}
      <Text style={[styles.stageCount, { color: eraColor }]}>
        {entry.stageCount} stages
      </Text>
    </TouchableOpacity>
  );
}

// ── Concept Card ───────────────────────────────────────────────────

function ConceptJourneyCard({
  entry,
  onPress,
}: {
  entry: ConceptJourneyEntry;
  onPress: () => void;
}) {
  const { base } = useTheme();

  const rangeText = entry.firstLabel && entry.lastLabel
    ? `${entry.firstLabel} → ${entry.lastLabel}`
    : '';

  return (
    <TouchableOpacity
      style={[styles.conceptCard, { backgroundColor: base.bgElevated, borderColor: base.border }]}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`${entry.title} journey, ${entry.stopCount} stops`}
    >
      <Text style={[styles.conceptTitle, { color: base.gold }]} numberOfLines={1}>
        {entry.title}
      </Text>
      {rangeText ? (
        <Text style={[styles.conceptRange, { color: base.textMuted }]} numberOfLines={1}>
          {rangeText}
        </Text>
      ) : null}
      <Text style={[styles.stageCount, { color: base.textDim }]}>
        {entry.stopCount} stops
      </Text>
    </TouchableOpacity>
  );
}

// ── Section Component ──────────────────────────────────────────────

export function JourneyBrowseSection() {
  const { base } = useTheme();
  const navigation = useNavigation<ScreenNavProp<'Explore', 'ExploreMenu'>>();
  const { personJourneys, conceptJourneys, isLoading } = useJourneyBrowse();

  const handlePersonPress = useCallback((personId: string) => {
    navigation.navigate('PersonJourney', { personId });
  }, [navigation]);

  const handleConceptPress = useCallback((conceptId: string) => {
    navigation.navigate('ConceptDetail', { conceptId, initialTab: 'journey' });
  }, [navigation]);

  const handleBrowseAll = useCallback((tab?: 'people' | 'concepts') => {
    navigation.navigate('JourneyBrowse', { tab });
  }, [navigation]);

  if (isLoading || (personJourneys.length === 0 && conceptJourneys.length === 0)) {
    return null;
  }

  // Map era strings to theme era colors
  const getEraColor = (era: string | null): string => {
    if (!era) return base.gold;
    // The eras record is in theme/colors but we use the palette-transformed version
    return base.gold; // Simplified — the era badge handles its own color
  };

  return (
    <View style={styles.container}>
      {/* ── Person Journeys Row ── */}
      {personJourneys.length > 0 && (
        <View style={styles.rowContainer}>
          <View style={styles.rowHeader}>
            <Text style={[styles.rowLabel, { color: base.textMuted }]}>
              PEOPLE
            </Text>
            <TouchableOpacity
              onPress={() => handleBrowseAll('people')}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityRole="button"
              accessibilityLabel={`Browse all ${personJourneys.length} person journeys`}
            >
              <Text style={[styles.browseAll, { color: base.gold }]}>
                {personJourneys.length} journeys ›
              </Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.carouselContent}
            decelerationRate="fast"
          >
            {personJourneys.map((entry) => (
              <PersonJourneyCard
                key={entry.personId}
                entry={entry}
                eraColor={getEraColor(entry.era)}
                onPress={() => handlePersonPress(entry.personId)}
              />
            ))}
          </ScrollView>
        </View>
      )}

      {/* ── Concept Journeys Row ── */}
      {conceptJourneys.length > 0 && (
        <View style={styles.rowContainer}>
          <View style={styles.rowHeader}>
            <Text style={[styles.rowLabel, { color: base.textMuted }]}>
              CONCEPTS
            </Text>
            <TouchableOpacity
              onPress={() => handleBrowseAll('concepts')}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityRole="button"
              accessibilityLabel={`Browse all ${conceptJourneys.length} concept journeys`}
            >
              <Text style={[styles.browseAll, { color: base.gold }]}>
                {conceptJourneys.length} journeys ›
              </Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.carouselContent}
            decelerationRate="fast"
          >
            {conceptJourneys.map((entry) => (
              <ConceptJourneyCard
                key={entry.conceptId}
                entry={entry}
                onPress={() => handleConceptPress(entry.conceptId)}
              />
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

// ── Styles ──────────────────────────────────────────────────────────

const PERSON_CARD_WIDTH = 120;
const CONCEPT_CARD_WIDTH = 160;

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  rowContainer: {
    gap: spacing.sm,
  },
  rowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  rowLabel: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 11,
    letterSpacing: 0.5,
  },
  browseAll: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 11,
  },
  carouselContent: {
    paddingHorizontal: 20,
    gap: spacing.sm,
  },

  // Person card
  personCard: {
    width: PERSON_CARD_WIDTH,
    borderRadius: radii.lg,
    borderWidth: 1,
    padding: spacing.sm + 2,
    alignItems: 'center',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  avatarText: {
    fontFamily: fontFamily.displaySemiBold,
    fontSize: 18,
  },
  personName: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 12,
    textAlign: 'center',
  },
  personRole: {
    fontFamily: fontFamily.ui,
    fontSize: 10,
    textAlign: 'center',
    marginTop: 1,
  },
  stageCount: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 10,
    marginTop: spacing.xs,
  },

  // Concept card
  conceptCard: {
    width: CONCEPT_CARD_WIDTH,
    borderRadius: radii.lg,
    borderWidth: 1,
    padding: spacing.sm + 4,
  },
  conceptTitle: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 13,
    marginBottom: 2,
  },
  conceptRange: {
    fontFamily: fontFamily.ui,
    fontSize: 10,
    lineHeight: 14,
    marginBottom: spacing.xs,
  },
});
