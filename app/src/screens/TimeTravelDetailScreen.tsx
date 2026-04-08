/**
 * TimeTravelDetailScreen — For a specific verse: show interpretations
 * across all church history eras in a timeline layout.
 *
 * Author, quote, source, era badge per card. Premium gated:
 * 1-2 eras visible for free users, all eras for premium.
 */

import React, { useMemo, useRef, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import type { ScreenNavProp, ScreenRouteProp } from '../navigation/types';
import { ScreenHeader } from '../components/ScreenHeader';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { InterpretationCard } from '../components/interpretations/InterpretationCard';
import { BadgeChip } from '../components/BadgeChip';
import { UpgradePrompt } from '../components/UpgradePrompt';
import { useVerseInterpretations } from '../hooks/useInterpretations';
import { usePremium } from '../hooks/usePremium';
import { useTheme, spacing, fontFamily, churchEras } from '../theme';
import { withErrorBoundary } from '../components/ScreenErrorBoundary';
import { parseReference } from '../utils/verseResolver';
import type { HistoricalInterpretation } from '../types';

/** Number of free eras visible to non-premium users. */
const FREE_ERA_LIMIT = 2;

function TimeTravelDetailScreen() {
  const { base } = useTheme();
  const navigation = useNavigation<ScreenNavProp<'Explore', 'TimeTravelDetail'>>();
  const route = useRoute<ScreenRouteProp<'Explore', 'TimeTravelDetail'>>();
  const { verseRef } = route.params;

  const { data: interpretations, loading } = useVerseInterpretations(verseRef);
  const { isPremium, upgradeRequest, showUpgrade, dismissUpgrade } = usePremium();

  const scrollRef = useRef<ScrollView>(null);
  const cardYMap = useRef<Record<string, number>>({});
  const lastPressedCardId = useRef<string | null>(null);

  // Restore scroll position when returning from chapter view
  const handleScrollRestore = useCallback(() => {
    const id = lastPressedCardId.current;
    if (id && cardYMap.current[id] != null) {
      setTimeout(() => {
        scrollRef.current?.scrollTo({ y: Math.max(0, cardYMap.current[id] - 80), animated: true });
      }, 150);
    }
  }, []);

  const handleVersePress = useCallback((refStr: string, cardId: string) => {
    const parsed = parseReference(refStr);
    if (!parsed) return;
    lastPressedCardId.current = cardId;
    navigation.push('Chapter', {
      bookId: parsed.bookId,
      chapterNum: parsed.chapter,
      verseNum: parsed.verseStart,
    });
  }, [navigation]);

  // Restore scroll position when returning from chapter view
  useFocusEffect(
    useCallback(() => {
      handleScrollRestore();
    }, [handleScrollRestore])
  );

  // Group interpretations by era, preserving display_order
  const groupedByEra = useMemo(() => {
    const groups: { era: string; eraLabel: string; items: HistoricalInterpretation[] }[] = [];
    const eraMap = new Map<string, HistoricalInterpretation[]>();
    const eraOrder: string[] = [];

    for (const interp of interpretations) {
      if (!eraMap.has(interp.era)) {
        eraMap.set(interp.era, []);
        eraOrder.push(interp.era);
      }
      eraMap.get(interp.era)!.push(interp);
    }

    for (const era of eraOrder) {
      const items = eraMap.get(era)!;
      groups.push({
        era,
        eraLabel: items[0].era_label,
        items,
      });
    }
    return groups;
  }, [interpretations]);

  const visibleGroups = isPremium
    ? groupedByEra
    : groupedByEra.slice(0, FREE_ERA_LIMIT);

  const hiddenEraCount = groupedByEra.length - visibleGroups.length;

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: base.bg }]}>
        <View style={styles.headerPad}>
          <ScreenHeader title={verseRef} onBack={() => navigation.goBack()} />
        </View>
        <View style={styles.loadingPad}>
          <LoadingSkeleton lines={8} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: base.bg }]}>
      <View style={styles.headerPad}>
        <ScreenHeader
          title="Through the Ages"
          onBack={() => navigation.goBack()}
        />
        <Text style={[styles.verseRef, { color: base.gold }]}>{verseRef}</Text>
      </View>

      <ScrollView ref={scrollRef} style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {interpretations.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, { color: base.textMuted }]}>
              No historical interpretations found for this passage.
            </Text>
          </View>
        ) : (
          <>
            {visibleGroups.map((group) => {
              const eraColor = churchEras[group.era] ?? base.gold;
              return (
                <View key={group.era} style={styles.eraSection}>
                  {/* Era heading with timeline dot */}
                  <View style={styles.eraHeadingRow}>
                    <View style={[styles.timelineDot, { backgroundColor: eraColor }]} />
                    <Text style={[styles.eraHeading, { color: eraColor }]}>
                      {group.eraLabel}
                    </Text>
                  </View>
                  <View
                    style={[styles.timelineLine, { borderLeftColor: eraColor + '40' }]}
                  >
                    {group.items.map((interp) => (
                      <View
                        key={interp.id}
                        onLayout={(e) => {
                          cardYMap.current[interp.id] = e.nativeEvent.layout.y;
                        }}
                      >
                        <InterpretationCard
                          interpretation={interp}
                          onVersePress={(ref) => handleVersePress(ref, interp.id)}
                        />
                      </View>
                    ))}
                  </View>
                </View>
              );
            })}

            {/* Premium gate */}
            {!isPremium && hiddenEraCount > 0 && (
              <View
                style={[
                  styles.gateCard,
                  { backgroundColor: base.bgElevated, borderColor: base.gold + '30' },
                ]}
              >
                <Text style={[styles.gateIcon, { color: base.gold }]}>{'✦'}</Text>
                <Text style={[styles.gateTitle, { color: base.text }]}>
                  {hiddenEraCount} more {hiddenEraCount === 1 ? 'era' : 'eras'} available
                  with Companion+
                </Text>
                <Text style={[styles.gateDesc, { color: base.textDim }]}>
                  Unlock Reformation, Modern, and more perspectives across church history.
                </Text>
                <BadgeChip
                  label="Learn More"
                  onPress={() => showUpgrade('explore', 'Time-Travel Reader')}
                />
              </View>
            )}
          </>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerPad: { paddingHorizontal: spacing.md, paddingTop: spacing.md },
  verseRef: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 13,
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  scroll: { flex: 1 },
  scrollContent: { padding: spacing.md, paddingBottom: spacing.xxl },
  eraSection: {
    marginBottom: spacing.md,
  },
  eraHeadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  eraHeading: {
    fontFamily: fontFamily.displayMedium,
    fontSize: 16,
  },
  timelineLine: {
    borderLeftWidth: 2,
    marginLeft: 4,
    paddingLeft: spacing.md,
  },
  emptyState: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: fontFamily.ui,
    fontSize: 14,
    textAlign: 'center',
  },
  gateCard: {
    borderWidth: 1,
    borderRadius: 8,
    padding: spacing.lg,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  gateIcon: {
    fontSize: 24,
    marginBottom: spacing.sm,
  },
  gateTitle: {
    fontFamily: fontFamily.displayMedium,
    fontSize: 15,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  gateDesc: {
    fontFamily: fontFamily.body,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  loadingPad: { padding: spacing.lg },
});

export default withErrorBoundary(TimeTravelDetailScreen);
