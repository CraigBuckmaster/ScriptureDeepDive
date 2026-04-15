/**
 * ArchaeologyDetailScreen — Full detail view of an archaeological discovery.
 *
 * Shows name, date range, location, significance, description, and linked
 * verses (tappable to navigate to Chapter). Description is visible to free
 * users; full detail (linked verses, source) is premium-gated.
 *
 * Card #1360 (UI polish phase 3):
 *   - Hero image via DetailHeroHeader when R2 images exist
 *   - Section titles use DetailSectionTitle (Cinzel + gold bar)
 *   - Verse-ref / date / location metadata use MetadataPill
 *   - Hairline section separators replaced by GoldSeparator
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
import { DiscoveryImageGallery } from '../components/DiscoveryImageGallery';
import { BadgeChip } from '../components/BadgeChip';
import { DetailHeroHeader } from '../components/DetailHeroHeader';
import { DetailSectionTitle } from '../components/DetailSectionTitle';
import { MetadataPill } from '../components/MetadataPill';
import { GoldSeparator } from '../components/GoldSeparator';
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

  const { discovery, verseLinks, images, loading } = useArchaeologyDetail(discoveryId);
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

  const heroImage = images.length > 0 ? images[0].url : undefined;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: base.bg }]} edges={['top']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <DetailHeroHeader
          title={discovery.name}
          subtitle={discovery.location ?? undefined}
          imageUrl={heroImage}
          onBack={() => navigation.goBack()}
        />

        <View style={styles.body}>
          {/* Metadata pill row */}
          <View style={styles.pillRow}>
            <MetadataPill label={discovery.category} />
            {discovery.date_range && <MetadataPill label={discovery.date_range} />}
          </View>

          {/* Image gallery — only when we have more than one image (hero already shows the first) */}
          {images.length > 1 && (
            <View style={styles.galleryWrap}>
              <DiscoveryImageGallery images={images} />
            </View>
          )}

          {/* Significance — always visible */}
          <View style={[styles.significanceCard, { backgroundColor: base.bgElevated, borderColor: base.gold + '30' }]}>
            <DetailSectionTitle title="Significance" transform="uppercase" />
            <Text style={[styles.significanceText, { color: base.text }]}>
              {discovery.significance}
            </Text>
          </View>

          {/* Description */}
          <Text style={[styles.bodyText, { color: base.text }]}>
            {discovery.description}
          </Text>

          {/* Linked Verses — premium gated */}
          {isPremium && verseLinks.length > 0 && (
            <>
              <GoldSeparator marginTop={spacing.md} />
              <CollapsibleSection title="Linked Verses" initiallyCollapsed={false}>
                {verseLinks.map((vl: ArchaeologyVerseLink) => (
                  <TouchableOpacity
                    key={vl.id}
                    onPress={() => handleVersePress(vl.verse_ref)}
                    style={[styles.verseCard, { backgroundColor: base.tintParchment, borderColor: base.gold + '20' }]}
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
            </>
          )}

          {/* Source — premium gated */}
          {isPremium && discovery.source && (
            <View style={styles.sourceSection}>
              <GoldSeparator marginBottom={spacing.md} />
              <DetailSectionTitle title="Source" transform="uppercase" />
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
        </View>
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
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: spacing.xxl },
  body: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  pillRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  galleryWrap: {
    marginBottom: spacing.md,
  },
  significanceCard: {
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  significanceText: {
    fontFamily: fontFamily.body,
    fontSize: 15,
    lineHeight: 25,
  },
  bodyText: {
    fontFamily: fontFamily.body,
    fontSize: 15,
    lineHeight: 25,
    marginBottom: spacing.md,
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
    fontSize: 13,
    lineHeight: 20,
  },
  sourceSection: {
    marginTop: spacing.md,
  },
  sourceText: {
    fontFamily: fontFamily.body,
    fontSize: 13,
    lineHeight: 20,
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
