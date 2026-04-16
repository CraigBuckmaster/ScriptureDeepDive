/**
 * JourneyDetailScreen — Unified screen for person, concept, and thematic journeys.
 *
 * Layout: hero header → metadata row → description → stops timeline → tags.
 * Premium-gated: first 3 stops free, rest behind paywall.
 */

import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { ScreenNavProp, ScreenRouteProp } from '../navigation/types';
import { useJourneyDetail } from '../hooks/useJourneyDetail';
import { usePremium } from '../hooks/usePremium';
import { ScreenHeader } from '../components/ScreenHeader';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { JourneyStopsTimeline } from '../components/JourneyStopsTimeline';
import { LinkedJourneySheet } from '../components/LinkedJourneySheet';
import { UpgradePrompt } from '../components/UpgradePrompt';
import { BadgeChip } from '../components/BadgeChip';
import { useTheme, spacing, fontFamily } from '../theme';
import { withErrorBoundary } from '../components/ScreenErrorBoundary';

const FREE_STOP_COUNT = 3;

function JourneyDetailScreen() {
  const { base } = useTheme();
  const navigation = useNavigation<ScreenNavProp<'Explore', 'JourneyDetail'>>();
  const route = useRoute<ScreenRouteProp<'Explore', 'JourneyDetail'>>();
  const { journeyId } = route.params ?? {};
  const { journey, stops, tags, linkedJourneyLookups, readingTimeMinutes, isLoading } = useJourneyDetail(journeyId);
  const { isPremium, upgradeRequest, showUpgrade, dismissUpgrade } = usePremium();

  const [linkedSheetJourneyId, setLinkedSheetJourneyId] = useState<string | null>(null);
  const [linkedSheetIntro, setLinkedSheetIntro] = useState<string | null>(null);

  const handleNavigateToChapter = useCallback((bookId: string, chapterNum: number, verseNum?: number) => {
    navigation.navigate('Chapter', {
      bookId,
      chapterNum,
      ...(verseNum ? { verseNum } : {}),
    });
  }, [navigation]);

  const handleLinkedJourneyPress = useCallback((linkedId: string, intro: string | null) => {
    if (!isPremium) {
      showUpgrade('feature', 'Linked Journeys');
      return;
    }
    setLinkedSheetJourneyId(linkedId);
    setLinkedSheetIntro(intro);
  }, [isPremium, showUpgrade]);

  const handleLinkedSheetClose = useCallback(() => {
    setLinkedSheetJourneyId(null);
    setLinkedSheetIntro(null);
  }, []);

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: base.bg }]}>
        <View style={styles.loadingPad}>
          <LoadingSkeleton lines={8} />
        </View>
      </SafeAreaView>
    );
  }

  if (!journey) return null;

  const linkedTitles = new Map<string, string>();
  for (const [id, lookup] of linkedJourneyLookups) {
    linkedTitles.set(id, lookup.title);
  }

  const depthLabel = journey.depth ? journey.depth.charAt(0).toUpperCase() + journey.depth.slice(1) : null;
  const lensLabel = journey.lens_id ? journey.lens_id.replace(/_/g, ' ') : null;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: base.bg }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ScreenHeader
          title={journey.title}
          subtitle={journey.subtitle ?? undefined}
          onBack={() => navigation.goBack()}
          style={styles.header}
        />

        {/* Metadata row */}
        <View style={styles.metaRow}>
          {lensLabel && (
            <BadgeChip label={lensLabel} color={base.gold} />
          )}
          <Text style={[styles.metaText, { color: base.textMuted }]}>
            {stops.length} stops · {readingTimeMinutes} min read
          </Text>
          {depthLabel && (
            <Text style={[styles.metaText, { color: base.textMuted }]}>
              · {depthLabel}
            </Text>
          )}
        </View>

        {/* Description / Introduction */}
        {journey.description ? (
          <Text style={[styles.description, { color: base.text }]}>
            {journey.description}
          </Text>
        ) : null}

        {/* Stops Timeline */}
        <View style={styles.timelineSection}>
          <JourneyStopsTimeline
            stops={stops}
            isPremium={isPremium}
            freeStopCount={FREE_STOP_COUNT}
            linkedJourneyTitles={linkedTitles}
            onNavigateToChapter={handleNavigateToChapter}
            onLinkedJourneyPress={handleLinkedJourneyPress}
          />
        </View>

        {/* Premium gate */}
        {!isPremium && stops.length > FREE_STOP_COUNT && (
          <View style={styles.gateSection}>
            <Text style={[styles.gateText, { color: base.textMuted }]}>
              {stops.length - FREE_STOP_COUNT} more stops available with Premium
            </Text>
          </View>
        )}

        {/* Tags */}
        {tags.length > 0 && (
          <View style={styles.tagsSection}>
            <Text style={[styles.sectionTitle, { color: base.text }]}>Explore Deeper</Text>
            <View style={styles.tagRow}>
              {tags.map((tag) => (
                <BadgeChip
                  key={`${tag.tag_type}-${tag.tag_id}`}
                  label={tag.tag_id.replace(/-/g, ' ')}
                  color={base.textMuted}
                />
              ))}
            </View>
          </View>
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

      <LinkedJourneySheet
        visible={linkedSheetJourneyId !== null}
        linkedJourneyId={linkedSheetJourneyId}
        linkedJourneyIntro={linkedSheetIntro}
        onClose={handleLinkedSheetClose}
        onNavigateToChapter={handleNavigateToChapter}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingPad: {
    padding: spacing.lg,
  },
  scrollContent: {
    paddingBottom: spacing.xl * 2,
  },
  header: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    paddingHorizontal: spacing.md,
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  metaText: {
    fontFamily: fontFamily.ui,
    fontSize: 13,
  },
  description: {
    fontFamily: fontFamily.body,
    fontSize: 15,
    lineHeight: 24,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
  },
  timelineSection: {
    paddingHorizontal: spacing.md,
  },
  gateSection: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  gateText: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 14,
    textAlign: 'center',
  },
  tagsSection: {
    paddingHorizontal: spacing.md,
    marginTop: spacing.lg,
  },
  sectionTitle: {
    fontFamily: fontFamily.displayMedium,
    fontSize: 16,
    marginBottom: spacing.sm,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
});

export default withErrorBoundary(JourneyDetailScreen);
