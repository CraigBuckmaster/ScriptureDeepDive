/**
 * PeriodsScreen — Bible historical periods as an interactive vertical timeline.
 *
 * Displays ~12 eras chronologically with summary, key people, books, and
 * geographic region. First 3 eras are free; remaining require premium.
 *
 * Part of epic #1102 / story #1116.
 */

import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { ScreenNavProp } from '../navigation/types';
import { useEras } from '../hooks/useEras';
import type { ParsedEra } from '../hooks/useEras';
import { usePremium } from '../hooks/usePremium';
import { ScreenHeader } from '../components/ScreenHeader';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { BadgeChip } from '../components/BadgeChip';
import { UpgradePrompt } from '../components/UpgradePrompt';
import { useTheme, spacing, radii, fontFamily } from '../theme';
import type { BaseColors } from '../theme/palettes';
import { withErrorBoundary } from '../components/ScreenErrorBoundary';

/** Number of eras visible without premium. */
const FREE_ERA_COUNT = 3;

function formatYear(year: number | null): string {
  if (year == null) return '?';
  if (year < 0) return `${Math.abs(year)} BC`;
  return `AD ${year}`;
}

function PeriodsScreen() {
  const { base } = useTheme();
  const navigation = useNavigation<ScreenNavProp<'Explore', 'Periods'>>();
  const { eras, isLoading } = useEras();
  const { isPremium, upgradeRequest, showUpgrade, dismissUpgrade } = usePremium();

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: base.bg }]}>
        <View style={styles.loadingPad}>
          <LoadingSkeleton lines={8} />
        </View>
      </SafeAreaView>
    );
  }

  const visibleEras = isPremium ? eras : eras.slice(0, FREE_ERA_COUNT);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: base.bg }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ScreenHeader
          title="The Periods of the Bible"
          subtitle={`${eras.length} eras from creation to the apostolic age`}
          onBack={() => navigation.goBack()}
          style={styles.header}
        />

        {visibleEras.map((era, index) => (
          <EraCard
            key={era.id}
            era={era}
            isLast={index === visibleEras.length - 1}
            nextEra={index < eras.length - 1 ? eras[index + 1] : null}
            base={base}
            onPersonPress={(personId) =>
              navigation.navigate('PersonDetail', { personId })
            }
            onBookPress={(bookId) =>
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (navigation as any).navigate('BookIntro', { bookId })
            }
          />
        ))}

        {/* Premium gate */}
        {!isPremium && eras.length > FREE_ERA_COUNT && (
          <TouchableOpacity
            onPress={() => showUpgrade('explore', 'Bible Periods')}
            style={[styles.gateCard, { backgroundColor: base.bgElevated, borderColor: base.gold + '30' }]}
            accessibilityRole="button"
            accessibilityLabel="Unlock remaining eras"
          >
            <Text style={[styles.gateIcon, { color: base.gold }]}>✦</Text>
            <Text style={[styles.gateTitle, { color: base.text }]}>
              {eras.length - FREE_ERA_COUNT} more eras
            </Text>
            <Text style={[styles.gateSubtitle, { color: base.textDim }]}>
              Unlock the full journey from Exodus to the Apostolic Age
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      <UpgradePrompt
        visible={!!upgradeRequest}
        onClose={dismissUpgrade}
        variant={upgradeRequest?.variant ?? 'explore'}
        featureName={upgradeRequest?.featureName ?? 'Bible Periods'}
      />
    </SafeAreaView>
  );
}

// ── Era Card ──────────────────────────────────────────────────────

interface EraCardProps {
  era: ParsedEra;
  isLast: boolean;
  nextEra: ParsedEra | null;
  base: BaseColors;
  onPersonPress: (personId: string) => void;
  onBookPress: (bookId: string) => void;
}

function EraCard({ era, isLast, nextEra, base, onPersonPress, onBookPress }: EraCardProps) {
  const accentColor = era.hex ?? base.gold;

  return (
    <>
      <View style={styles.eraCardWrapper}>
        {/* Timeline dot + line */}
        <View style={styles.timelineTrack}>
          <View style={[styles.timelineDot, { backgroundColor: accentColor }]} />
          {!isLast && <View style={[styles.timelineLine, { backgroundColor: base.border }]} />}
        </View>

        {/* Card body */}
        <View style={[styles.eraCard, { backgroundColor: base.bgElevated, borderColor: accentColor + '40' }]}>
          {/* Header: name + date range + pill */}
          <View style={styles.eraHeader}>
            <View style={styles.eraHeaderLeft}>
              <Text style={[styles.eraName, { color: base.text }]}>{era.name}</Text>
              <Text style={[styles.eraRange, { color: base.textDim }]}>
                {formatYear(era.range_start)} – {formatYear(era.range_end)}
              </Text>
            </View>
            {era.pill && (
              <View style={[styles.eraPill, { backgroundColor: accentColor + '25' }]}>
                <Text style={[styles.eraPillText, { color: accentColor }]}>{era.pill}</Text>
              </View>
            )}
          </View>

          {/* Summary */}
          {era.summary && (
            <Text style={[styles.eraSummary, { color: base.textDim }]}>{era.summary}</Text>
          )}

          {/* Key People */}
          {era.key_people.length > 0 && (
            <View style={styles.eraRow}>
              <Text style={[styles.eraRowLabel, { color: base.gold }]}>KEY PEOPLE</Text>
              <View style={styles.chipRow}>
                {era.key_people.map((pid) => (
                  <TouchableOpacity
                    key={pid}
                    onPress={() => onPersonPress(pid)}
                    style={[styles.personChip, { backgroundColor: base.gold + '15' }]}
                    accessibilityRole="button"
                  >
                    <Text style={[styles.personChipText, { color: base.gold }]}>
                      {pid.replace(/_/g, ' ')}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Books */}
          {era.books.length > 0 && (
            <View style={styles.eraRow}>
              <Text style={[styles.eraRowLabel, { color: base.gold }]}>BOOKS</Text>
              <View style={styles.chipRow}>
                {era.books.map((bk) => (
                  <TouchableOpacity
                    key={bk}
                    onPress={() => onBookPress(bk)}
                    style={[styles.bookChip, { backgroundColor: base.bgSurface ?? base.bg }]}
                    accessibilityRole="button"
                  >
                    <Text style={[styles.bookChipText, { color: base.text }]}>
                      {bk.replace(/_/g, ' ')}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Geographic region */}
          {era.geographic_center?.region && (
            <View style={styles.eraRow}>
              <BadgeChip label={era.geographic_center.region} color={base.textDim} />
            </View>
          )}
        </View>
      </View>

      {/* Transition arrow to next era — outside the row for proper flow */}
      {!isLast && era.transition_to_next && nextEra && (
        <View style={[styles.transitionBlock, { borderColor: base.border }]}>
          <Text style={[styles.transitionText, { color: base.textMuted }]}>
            {era.transition_to_next}
          </Text>
        </View>
      )}
    </>
  );
}

// ── Styles ────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingPad: {
    padding: spacing.lg,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  header: {
    marginBottom: spacing.lg,
  },
  /* Era card wrapper with timeline track */
  eraCardWrapper: {
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
  /* Card */
  eraCard: {
    flex: 1,
    borderRadius: radii.md,
    borderWidth: 1,
    padding: spacing.md,
    marginBottom: spacing.xs,
  },
  eraHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  eraHeaderLeft: {
    flex: 1,
    marginRight: spacing.sm,
  },
  eraName: {
    fontFamily: fontFamily.displayMedium,
    fontSize: 16,
  },
  eraRange: {
    fontFamily: fontFamily.ui,
    fontSize: 12,
    marginTop: 2,
  },
  eraPill: {
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  eraPillText: {
    fontFamily: fontFamily.uiSemiBold,
    fontSize: 10,
    letterSpacing: 0.3,
  },
  eraSummary: {
    fontFamily: fontFamily.body,
    fontSize: 14,
    lineHeight: 22,
    marginBottom: spacing.sm,
  },
  eraRow: {
    marginTop: spacing.sm,
  },
  eraRowLabel: {
    fontFamily: fontFamily.display,
    fontSize: 9,
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  personChip: {
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  personChipText: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 11,
  },
  bookChip: {
    borderRadius: radii.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  bookChipText: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 11,
  },
  /* Transition arrow */
  transitionBlock: {
    marginLeft: 36,
    borderTopWidth: 1,
    borderStyle: 'dashed',
    paddingTop: spacing.xs,
    paddingLeft: spacing.sm,
    paddingBottom: spacing.sm,
    marginBottom: spacing.xs,
  },
  transitionText: {
    fontFamily: fontFamily.bodyItalic,
    fontSize: 11,
    lineHeight: 16,
  },
  /* Premium gate */
  gateCard: {
    borderRadius: radii.md,
    borderWidth: 1,
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
    fontSize: 16,
    marginBottom: spacing.xs,
  },
  gateSubtitle: {
    fontFamily: fontFamily.body,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default withErrorBoundary(PeriodsScreen);
