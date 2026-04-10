/**
 * RedemptiveArcScreen — The 8-act story of the Bible.
 *
 * Vertical timeline of act cards showing the redemptive meta-narrative.
 * Each act shows name, tagline, summary, key verse, era badges, book range.
 * Tappable to expand: shows linked threads and prophecy chains.
 * Premium-gated (first 2 acts free).
 *
 * Part of epic #1102 / story #1119.
 */

import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { ScreenNavProp } from '../navigation/types';
import { useRedemptiveArc } from '../hooks/useRedemptiveArc';
import type { ParsedRedemptiveAct } from '../hooks/useRedemptiveArc';
import { usePremium } from '../hooks/usePremium';
import { ScreenHeader } from '../components/ScreenHeader';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { BadgeChip } from '../components/BadgeChip';
import { UpgradePrompt } from '../components/UpgradePrompt';
import { useTheme, spacing, radii, fontFamily } from '../theme';
import { withErrorBoundary } from '../components/ScreenErrorBoundary';

const FREE_ACT_COUNT = 2;

function RedemptiveArcScreen() {
  const { base } = useTheme();
  const navigation = useNavigation<ScreenNavProp<'Explore', 'RedemptiveArc'>>();
  const { acts, isLoading } = useRedemptiveArc();
  const { isPremium, upgradeRequest, showUpgrade, dismissUpgrade } = usePremium();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: base.bg }]}>
        <View style={styles.loadingPad}>
          <LoadingSkeleton lines={8} />
        </View>
      </SafeAreaView>
    );
  }

  const visibleActs = isPremium ? acts : acts.slice(0, FREE_ACT_COUNT);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: base.bg }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ScreenHeader
          title="The Story of the Bible"
          subtitle={`${acts.length} acts in God's redemptive narrative`}
          onBack={() => navigation.goBack()}
          style={styles.header}
        />

        {visibleActs.map((act, index) => (
          <TouchableOpacity
            key={act.id}
            activeOpacity={0.8}
            onPress={() => setExpandedId(expandedId === act.id ? null : act.id)}
            style={[styles.actCard, { backgroundColor: base.bgElevated, borderColor: base.gold + '25' }]}
          >
            {/* Act number badge */}
            <View style={[styles.actNumBadge, { backgroundColor: base.gold }]}>
              <Text style={styles.actNumText}>{index + 1}</Text>
            </View>

            {/* Header */}
            <Text style={[styles.actName, { color: base.text }]}>{act.name}</Text>
            {act.tagline && (
              <Text style={[styles.actTagline, { color: base.goldDim }]}>{act.tagline}</Text>
            )}

            {/* Summary */}
            {act.summary && (
              <Text style={[styles.actSummary, { color: base.textDim }]}>{act.summary}</Text>
            )}

            {/* Key verse */}
            {act.key_verse && (
              <View style={[styles.keyVerseRow, { borderColor: base.gold + '20' }]}>
                <Text style={[styles.keyVerseText, { color: base.text }]}>{act.key_verse.text}</Text>
                <Text style={[styles.keyVerseRef, { color: base.goldDim }]}>{act.key_verse.ref}</Text>
              </View>
            )}

            {/* Era badges + book range */}
            <View style={styles.metaRow}>
              {act.era_ids.map((eid) => (
                <BadgeChip key={eid} label={eid.replace(/_/g, ' ')} color={base.gold} />
              ))}
              {act.book_range && (
                <BadgeChip label={act.book_range} color={base.textDim} />
              )}
            </View>

            {/* Expanded: threads and prophecy chains */}
            {expandedId === act.id && (
              <View style={styles.expandedSection}>
                {act.threads.length > 0 && (
                  <View style={styles.linkedSection}>
                    <Text style={[styles.linkedLabel, { color: base.gold }]}>THREADS</Text>
                    <View style={styles.chipRow}>
                      {act.threads.map((tid) => (
                        <TouchableOpacity
                          key={tid}
                          onPress={() => navigation.navigate('ThreadDetail', { threadId: tid })}
                          style={[styles.linkedChip, { backgroundColor: base.gold + '15' }]}
                        >
                          <Text style={[styles.linkedChipText, { color: base.gold }]}>
                            {tid.replace(/_/g, ' ')}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}
                {act.prophecy_chains.length > 0 && (
                  <View style={styles.linkedSection}>
                    <Text style={[styles.linkedLabel, { color: base.gold }]}>PROPHECY CHAINS</Text>
                    <View style={styles.chipRow}>
                      {act.prophecy_chains.map((cid) => (
                        <TouchableOpacity
                          key={cid}
                          onPress={() => navigation.navigate('ProphecyDetail', { chainId: cid })}
                          style={[styles.linkedChip, { backgroundColor: base.gold + '15' }]}
                        >
                          <Text style={[styles.linkedChipText, { color: base.gold }]}>
                            {cid.replace(/_/g, ' ')}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}
              </View>
            )}
          </TouchableOpacity>
        ))}

        {/* Premium gate */}
        {!isPremium && acts.length > FREE_ACT_COUNT && (
          <TouchableOpacity
            onPress={() => showUpgrade('explore', 'The Story of the Bible')}
            style={[styles.gateCard, { backgroundColor: base.bgElevated, borderColor: base.gold + '30' }]}
          >
            <Text style={[styles.gateIcon, { color: base.gold }]}>✦</Text>
            <Text style={[styles.gateTitle, { color: base.text }]}>
              {acts.length - FREE_ACT_COUNT} more acts
            </Text>
            <Text style={[styles.gateSubtitle, { color: base.textDim }]}>
              Follow the full arc from Promise to Restoration
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      <UpgradePrompt
        visible={!!upgradeRequest}
        onClose={dismissUpgrade}
        variant={upgradeRequest?.variant ?? 'explore'}
        featureName={upgradeRequest?.featureName ?? 'The Story of the Bible'}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingPad: { padding: spacing.lg },
  scrollContent: { padding: spacing.md, paddingBottom: spacing.xxl },
  header: { marginBottom: spacing.lg },
  actCard: {
    borderRadius: radii.md,
    borderWidth: 1,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  actNumBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  actNumText: {
    fontFamily: fontFamily.displaySemiBold,
    fontSize: 14,
    color: '#1a1a1a',
  },
  actName: {
    fontFamily: fontFamily.displayMedium,
    fontSize: 18,
    marginBottom: 2,
  },
  actTagline: {
    fontFamily: fontFamily.bodyItalic,
    fontSize: 13,
    marginBottom: spacing.sm,
  },
  actSummary: {
    fontFamily: fontFamily.body,
    fontSize: 14,
    lineHeight: 22,
    marginBottom: spacing.sm,
  },
  keyVerseRow: {
    borderLeftWidth: 3,
    paddingLeft: spacing.sm,
    marginBottom: spacing.sm,
  },
  keyVerseText: {
    fontFamily: fontFamily.bodyItalic ?? fontFamily.body,
    fontSize: 13,
    lineHeight: 20,
  },
  keyVerseRef: {
    fontFamily: fontFamily.ui,
    fontSize: 11,
    marginTop: 3,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  expandedSection: {
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(191,160,80,0.15)',
  },
  linkedSection: {
    marginBottom: spacing.sm,
  },
  linkedLabel: {
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
  linkedChip: {
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  linkedChipText: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 11,
  },
  gateCard: {
    borderRadius: radii.md,
    borderWidth: 1,
    padding: spacing.lg,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  gateIcon: { fontSize: 24, marginBottom: spacing.sm },
  gateTitle: { fontFamily: fontFamily.displayMedium, fontSize: 16, marginBottom: spacing.xs },
  gateSubtitle: {
    fontFamily: fontFamily.body,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default withErrorBoundary(RedemptiveArcScreen);
