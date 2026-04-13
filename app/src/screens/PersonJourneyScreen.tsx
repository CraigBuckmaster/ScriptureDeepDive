/**
 * PersonJourneyScreen — A person's multi-book journey as a vertical arc timeline.
 *
 * Shows journey stages connected by a timeline line, with era-colored accents.
 * Below the timeline: legacy refs as linked verse cards.
 * Premium-gated: first 3 stages free, rest behind paywall.
 *
 * Part of epic #1102 / story #1126.
 */

import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { ScreenNavProp, ScreenRouteProp } from '../navigation/types';
import { usePersonJourney } from '../hooks/usePersonJourney';
import { usePremium } from '../hooks/usePremium';
import { useEras } from '../hooks/useEras';
import { ScreenHeader } from '../components/ScreenHeader';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { BadgeChip } from '../components/BadgeChip';
import { UpgradePrompt } from '../components/UpgradePrompt';
import { useTheme, spacing, radii, fontFamily } from '../theme';
import { withErrorBoundary } from '../components/ScreenErrorBoundary';

const FREE_STAGE_COUNT = 3;

function PersonJourneyScreen() {
  const { base } = useTheme();
  const navigation = useNavigation<ScreenNavProp<'Explore', 'PersonJourney'>>();
  const route = useRoute<ScreenRouteProp<'Explore', 'PersonJourney'>>();
  const { personId } = route.params ?? {};
  const { person, stages, legacyRefs, isLoading } = usePersonJourney(personId);
  const { isPremium, upgradeRequest, showUpgrade, dismissUpgrade } = usePremium();
  const { eras } = useEras();

  // Build era hex lookup
  const eraHex: Record<string, string> = {};
  for (const era of eras) {
    if (era.hex) eraHex[era.id] = era.hex;
  }

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: base.bg }]}>
        <View style={styles.loadingPad}>
          <LoadingSkeleton lines={8} />
        </View>
      </SafeAreaView>
    );
  }

  if (!person) return null;

  const visibleStages = isPremium ? stages : stages.slice(0, FREE_STAGE_COUNT);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: base.bg }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ScreenHeader
          title={person.name}
          subtitle={[person.role, person.era ? person.era.replace(/_/g, ' ') : null, person.dates]
            .filter(Boolean)
            .join(' · ')}
          onBack={() => navigation.goBack()}
          style={styles.header}
        />

        {/* Journey Timeline */}
        {visibleStages.map((stage, index) => {
          const accentColor = stage.era ? (eraHex[stage.era] ?? base.gold) : base.gold;
          const isLast = index === visibleStages.length - 1;

          return (
            <View key={stage.id} style={styles.stageWrapper}>
              {/* Timeline track */}
              <View style={styles.timelineTrack}>
                <View style={[styles.timelineDot, { backgroundColor: accentColor }]} />
                {!isLast && <View style={[styles.timelineLine, { backgroundColor: base.border }]} />}
              </View>

              {/* Stage card */}
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => {
                  if (stage.book_dir) {
                    const ch = stage.chapters ? JSON.parse(stage.chapters)[0] : 1;
                    // Parse starting verse from verse_ref (e.g., "Gen 12:1-9" → 1)
                    const verseMatch = stage.verse_ref?.match(/:(\d+)/);
                    const verseNum = verseMatch ? parseInt(verseMatch[1], 10) : undefined;
                    // Navigate within ExploreStack so Back returns here
                    navigation.navigate('Chapter', {
                      bookId: stage.book_dir,
                      chapterNum: ch,
                      ...(verseNum ? { verseNum } : {}),
                    });
                  }
                }}
                style={[styles.stageCard, { backgroundColor: base.bgElevated, borderLeftColor: accentColor }]}
              >
                <Text style={[styles.stageName, { color: base.text }]}>{stage.stage}</Text>
                {stage.verse_ref && (
                  <Text style={[styles.stageRef, { color: accentColor }]}>{stage.verse_ref}</Text>
                )}
                {stage.summary && (
                  <Text style={[styles.stageSummary, { color: base.textDim }]}>{stage.summary}</Text>
                )}
                {stage.theme && (
                  <Text style={[styles.stageTheme, { color: base.textMuted }]}>{stage.theme}</Text>
                )}
                {stage.era && (
                  <View style={styles.stageMetaRow}>
                    <BadgeChip label={stage.era.replace(/_/g, ' ')} color={accentColor} />
                  </View>
                )}
              </TouchableOpacity>
            </View>
          );
        })}

        {/* Premium gate */}
        {!isPremium && stages.length > FREE_STAGE_COUNT && (
          <TouchableOpacity
            onPress={() => showUpgrade('explore', 'Person Journey')}
            style={[styles.gateCard, { backgroundColor: base.bgElevated, borderColor: base.gold + '30' }]}
          >
            <Text style={[styles.gateIcon, { color: base.gold }]}>✦</Text>
            <Text style={[styles.gateTitle, { color: base.text }]}>
              {stages.length - FREE_STAGE_COUNT} more stages
            </Text>
            <Text style={[styles.gateSubtitle, { color: base.textDim }]}>
              Follow {person.name}'s complete journey
            </Text>
          </TouchableOpacity>
        )}

        {/* Legacy Section */}
        {legacyRefs.length > 0 && (
          <View style={styles.legacySection}>
            <Text style={[styles.legacyLabel, { color: base.gold }]}>IN THE NEW TESTAMENT</Text>
            {legacyRefs.map((lr) => (
              <View
                key={lr.id}
                style={[styles.legacyCard, { backgroundColor: base.bgElevated, borderColor: base.gold + '20' }]}
              >
                <Text style={[styles.legacyRef, { color: base.gold }]}>{lr.ref}</Text>
                {lr.note && (
                  <Text style={[styles.legacyNote, { color: base.textDim }]}>{lr.note}</Text>
                )}
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <UpgradePrompt
        visible={!!upgradeRequest}
        onClose={dismissUpgrade}
        variant={upgradeRequest?.variant ?? 'explore'}
        featureName={upgradeRequest?.featureName ?? 'Person Journey'}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingPad: { padding: spacing.lg },
  scrollContent: { padding: spacing.md, paddingBottom: spacing.xxl },
  header: { marginBottom: spacing.lg },
  /* Timeline */
  stageWrapper: {
    flexDirection: 'row',
    marginBottom: spacing.xs,
  },
  timelineTrack: {
    width: 24,
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: spacing.md,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    marginTop: spacing.xs,
  },
  /* Stage card */
  stageCard: {
    flex: 1,
    borderRadius: radii.md,
    borderLeftWidth: 3,
    padding: spacing.md,
    marginBottom: spacing.xs,
  },
  stageName: {
    fontFamily: fontFamily.displayMedium,
    fontSize: 15,
    marginBottom: 2,
  },
  stageRef: {
    fontFamily: fontFamily.uiSemiBold,
    fontSize: 11,
    marginBottom: spacing.xs,
  },
  stageSummary: {
    fontFamily: fontFamily.body,
    fontSize: 14,
    lineHeight: 22,
    marginBottom: spacing.xs,
  },
  stageTheme: {
    fontFamily: fontFamily.bodyItalic,
    fontSize: 12,
    marginBottom: spacing.xs,
  },
  stageMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  /* Premium gate */
  gateCard: {
    borderRadius: radii.md,
    borderWidth: 1,
    padding: spacing.lg,
    alignItems: 'center',
    marginVertical: spacing.md,
  },
  gateIcon: { fontSize: 24, marginBottom: spacing.sm },
  gateTitle: { fontFamily: fontFamily.displayMedium, fontSize: 16, marginBottom: spacing.xs },
  gateSubtitle: {
    fontFamily: fontFamily.body,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
  },
  /* Legacy section */
  legacySection: {
    marginTop: spacing.lg,
  },
  legacyLabel: {
    fontFamily: fontFamily.display,
    fontSize: 10,
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  legacyCard: {
    borderRadius: radii.md,
    borderWidth: 1,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  legacyRef: {
    fontFamily: fontFamily.displayMedium,
    fontSize: 12,
    marginBottom: spacing.xs,
  },
  legacyNote: {
    fontFamily: fontFamily.body,
    fontSize: 13,
    lineHeight: 20,
  },
});

export default withErrorBoundary(PersonJourneyScreen);
