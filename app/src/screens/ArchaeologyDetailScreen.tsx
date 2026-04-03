/**
 * ArchaeologyDetailScreen — Full detail view of an archaeological discovery.
 *
 * Shows name, date range, location, significance, description, and linked
 * verses (tappable to navigate to Chapter). Description is visible to free
 * users; full detail (linked verses, source) is premium-gated.
 */

import React, { useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { ScreenNavProp, ScreenRouteProp } from '../navigation/types';
import { parseReference } from '../utils/verseResolver';
import { ScreenHeader } from '../components/ScreenHeader';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { CollapsibleSection } from '../components/CollapsibleSection';
import { UpgradePrompt } from '../components/UpgradePrompt';
import { BadgeChip } from '../components/BadgeChip';
import { useArchaeologyDetail } from '../hooks/useArchaeology';
import { usePremium } from '../hooks/usePremium';
import { useTheme, spacing, radii, fontFamily } from '../theme';
import type { ArchaeologyVerseLink } from '../types';
import { withErrorBoundary } from '../components/ScreenErrorBoundary';

function ArchaeologyDetailScreen() {
  const { base } = useTheme();
  const navigation = useNavigation<ScreenNavProp<'Explore', 'ArchaeologyDetail'>>();
  const route = useRoute<ScreenRouteProp<'Explore', 'ArchaeologyDetail'>>();
  const { discoveryId } = route.params;

  const { discovery, verseLinks, loading } = useArchaeologyDetail(discoveryId);
  const { isPremium, upgradeRequest, showUpgrade, dismissUpgrade } = usePremium();

  const handleVersePress = useCallback(
    (ref: string) => {
      const parsed = parseReference(ref);
      if (parsed) {
        navigation.push('Chapter', { bookId: parsed.bookId, chapterNum: parsed.chapter });
      }
    },
    [navigation],
  );

  if (loading || !discovery) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: base.bg }]}>
        <View style={styles.headerPad}>
          <ScreenHeader title="Discovery" onBack={() => navigation.goBack()} />
        </View>
        <View style={styles.loadingPad}>
          {loading ? <LoadingSkeleton lines={8} /> : (
            <Text style={[styles.notFound, { color: base.textMuted }]}>
              Discovery not found
            </Text>
          )}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: base.bg }]}>
      <View style={styles.headerPad}>
        <ScreenHeader title={discovery.name} onBack={() => navigation.goBack()} />
        <View style={styles.badgeRow}>
          <BadgeChip label={discovery.category} />
          {discovery.location && (
            <BadgeChip label={discovery.location} />
          )}
        </View>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Icon + date range */}
        <View style={styles.heroRow}>
          <Text style={styles.heroEmoji}>🏛</Text>
          {discovery.date_range && (
            <Text style={[styles.dateRange, { color: base.textDim }]}>
              {discovery.date_range}
            </Text>
          )}
        </View>

        {/* Significance — always visible */}
        <View style={[styles.significanceCard, { backgroundColor: base.bgElevated, borderColor: base.gold + '30' }]}>
          <Text style={[styles.significanceLabel, { color: base.gold }]}>Significance</Text>
          <Text style={[styles.significanceText, { color: base.text }]}>
            {discovery.significance}
          </Text>
        </View>

        {/* Description — always visible */}
        <View style={styles.bodySection}>
          <Text style={[styles.bodyText, { color: base.text }]}>
            {discovery.description}
          </Text>
        </View>

        {/* Linked Verses — premium gated */}
        {isPremium && verseLinks.length > 0 && (
          <CollapsibleSection title="Linked Verses" initiallyCollapsed={false}>
            {verseLinks.map((vl: ArchaeologyVerseLink) => (
              <TouchableOpacity
                key={vl.id}
                onPress={() => handleVersePress(vl.verse_ref)}
                style={[styles.verseCard, { backgroundColor: base.bgElevated, borderColor: base.border + '40' }]}
              >
                <Text style={[styles.verseRef, { color: base.gold }]}>
                  {vl.verse_ref}
                </Text>
                {vl.relevance && (
                  <Text style={[styles.verseRelevance, { color: base.textDim }]}>
                    {vl.relevance}
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </CollapsibleSection>
        )}

        {/* Source — premium gated */}
        {isPremium && discovery.source && (
          <View style={styles.sourceSection}>
            <Text style={[styles.sourceLabel, { color: base.textMuted }]}>Source</Text>
            <Text style={[styles.sourceText, { color: base.textDim }]}>
              {discovery.source}
            </Text>
          </View>
        )}

        {/* Premium upsell for free users */}
        {!isPremium && (
          <View style={[styles.gateCard, { backgroundColor: base.bgElevated, borderColor: base.gold + '30' }]}>
            <Text style={[styles.gateIcon, { color: base.gold }]}>{'✦'}</Text>
            <Text style={[styles.gateTitle, { color: base.text }]}>
              Full discovery details available with Companion+
            </Text>
            <Text style={[styles.gateDesc, { color: base.textDim }]}>
              Unlock linked verses, source references, and more.
            </Text>
            <BadgeChip
              label="Learn More"
              onPress={() => showUpgrade('explore', 'Archaeological Evidence')}
            />
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerPad: { paddingHorizontal: spacing.md, paddingTop: spacing.md },
  badgeRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  scroll: { flex: 1 },
  scrollContent: { padding: spacing.md, paddingBottom: spacing.xxl },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  heroEmoji: {
    fontSize: 28,
  },
  dateRange: {
    fontFamily: fontFamily.ui,
    fontSize: 13,
  },
  significanceCard: {
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  significanceLabel: {
    fontFamily: fontFamily.display,
    fontSize: 10,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
  },
  significanceText: {
    fontFamily: fontFamily.body,
    fontSize: 14,
    lineHeight: 22,
  },
  bodySection: {
    marginBottom: spacing.md,
  },
  bodyText: {
    fontFamily: fontFamily.body,
    fontSize: 14,
    lineHeight: 22,
  },
  verseCard: {
    borderWidth: 1,
    borderRadius: radii.sm,
    padding: spacing.sm,
    marginBottom: spacing.xs,
  },
  verseRef: {
    fontFamily: fontFamily.displayMedium,
    fontSize: 13,
    marginBottom: 2,
  },
  verseRelevance: {
    fontFamily: fontFamily.body,
    fontSize: 12,
    lineHeight: 18,
  },
  sourceSection: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  sourceLabel: {
    fontFamily: fontFamily.display,
    fontSize: 10,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
  },
  sourceText: {
    fontFamily: fontFamily.body,
    fontSize: 12,
    lineHeight: 18,
  },
  gateCard: {
    borderWidth: 1,
    borderRadius: radii.md,
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
  notFound: {
    fontFamily: fontFamily.ui,
    fontSize: 14,
    textAlign: 'center',
  },
});

export default withErrorBoundary(ArchaeologyDetailScreen);
