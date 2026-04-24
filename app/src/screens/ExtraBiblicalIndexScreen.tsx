/**
 * ExtraBiblicalIndexScreen — Browse all extra-biblical literature entries
 * (HWGTB-P2-02 / #1547). Reachable from the Explore hero card
 * (HWGTB-P2-04), from CanonComparisonScreen (HWGTB-P3-01), and from
 * SecondTemplePanel chips (HWGTB-P2-01).
 *
 * Pattern matches DebateBrowseScreen: BrowseScreenTemplate, hook-driven
 * data, category filter chips, debounced search. Free-tier readers see
 * the full index but an entry tap opens UpgradePrompt.
 */

import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme, spacing, radii, fontFamily } from '../theme';
import {
  useExtraBiblical,
  EXTRABIBLICAL_CATEGORY_LABELS,
  type ExtrabiblicalFilter,
} from '../hooks/useExtraBiblical';
import {
  BrowseScreenTemplate,
  BrowseFilterPill,
} from '../components/BrowseScreenTemplate';
import { UpgradePrompt } from '../components/UpgradePrompt';
import { usePremium } from '../hooks/usePremium';
import type { ExtrabiblicalSummary } from '../types';
import type { ScreenNavProp } from '../navigation/types';
import { withErrorBoundary } from '../components/ScreenErrorBoundary';

type Nav = ScreenNavProp<'Explore', 'ExtraBiblicalIndex'>;

const TRADITION_BADGES: Array<{
  key: keyof ExtrabiblicalSummary['tradition_status'];
  short: string;
  a11y: string;
}> = [
  { key: 'protestant', short: 'Prot', a11y: 'Protestant' },
  { key: 'catholic', short: 'Cath', a11y: 'Catholic' },
  { key: 'eastern_orthodox', short: 'EO', a11y: 'Eastern Orthodox' },
  { key: 'ethiopian_tewahedo', short: 'Eth', a11y: 'Ethiopian Tewahedo' },
];

/** Map tradition_status free-text values → canonical ✓/✗/~ symbol. */
function classifyStatus(value: string): 'in' | 'out' | 'partial' {
  const v = value.toLowerCase();
  // "canonical", "included", "accepted", "deuterocanonical" → in
  if (/canonical|included|accepted|scripture|deuterocanon/.test(v) && !/not\s/.test(v)) {
    return 'in';
  }
  // "apocryphal", "not included", "rejected", "excluded" → out
  if (/not\s|excluded|reject|apocryph|outside|noncanonical|non-canonical/.test(v)) {
    return 'out';
  }
  // "appendix", "read but not canonical", "deuterocanon in some", ambiguous
  return 'partial';
}

function statusSymbol(cls: 'in' | 'out' | 'partial'): string {
  switch (cls) {
    case 'in':
      return '✓';
    case 'out':
      return '✗';
    case 'partial':
      return '~';
  }
}

/** First sentence of brief_summary, capped for the card descriptor line. */
function firstSentence(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) return '';
  const match = trimmed.match(/^[^.!?]+[.!?]/);
  const out = match ? match[0] : trimmed;
  return out.length > 180 ? out.slice(0, 177).trim() + '…' : out;
}

function ExtraBiblicalIndexScreen() {
  const { base } = useTheme();
  const navigation = useNavigation<Nav>();
  const { isPremium, upgradeRequest, showUpgrade, dismissUpgrade } = usePremium();
  const {
    entries,
    loading,
    search,
    setSearch,
    categoryFilter,
    setCategoryFilter,
    categories,
  } = useExtraBiblical();

  const handleEntryPress = useCallback(
    (entry: ExtrabiblicalSummary) => {
      if (!isPremium) {
        showUpgrade('explore', 'Extra-Biblical Literature');
        return;
      }
      navigation.navigate('ExtraBiblicalDetail', { id: entry.id });
    },
    [isPremium, showUpgrade, navigation],
  );

  const renderCard = useCallback(
    ({ item }: { item: ExtrabiblicalSummary }) => {
      const descriptor = firstSentence(item.brief_summary);
      return (
        <TouchableOpacity
          onPress={() => handleEntryPress(item)}
          activeOpacity={0.6}
          accessibilityRole="button"
          accessibilityLabel={`Open ${item.title}`}
          style={[
            styles.card,
            { backgroundColor: base.bgElevated, borderLeftColor: base.gold },
          ]}
        >
          <Text style={[styles.cardTitle, { color: base.text }]} numberOfLines={2}>
            {item.title}
          </Text>
          {descriptor ? (
            <Text style={[styles.cardDescriptor, { color: base.textDim }]} numberOfLines={2}>
              {descriptor}
            </Text>
          ) : null}
          <View style={styles.badgeRow}>
            {TRADITION_BADGES.map((b) => {
              const status = classifyStatus(item.tradition_status[b.key] ?? '');
              const color =
                status === 'in'
                  ? base.gold
                  : status === 'out'
                    ? base.textMuted
                    : base.textDim;
              return (
                <View
                  key={b.key}
                  style={[styles.badge, { borderColor: color + '55' }]}
                  accessibilityLabel={`${b.a11y}: ${status}`}
                >
                  <Text style={[styles.badgeLabel, { color }]}>
                    {b.short} {statusSymbol(status)}
                  </Text>
                </View>
              );
            })}
          </View>
        </TouchableOpacity>
      );
    },
    [base, handleEntryPress],
  );

  const filterBar = (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.chipRow}
    >
      <BrowseFilterPill
        label="All"
        active={categoryFilter === 'all'}
        onPress={() => setCategoryFilter('all')}
      />
      {categories.map((cat) => (
        <BrowseFilterPill
          key={cat}
          label={EXTRABIBLICAL_CATEGORY_LABELS[cat]}
          active={categoryFilter === cat}
          onPress={() => setCategoryFilter(cat as ExtrabiblicalFilter)}
        />
      ))}
    </ScrollView>
  );

  return (
    <>
      <BrowseScreenTemplate<ExtrabiblicalSummary>
        title="Extra-Biblical Literature"
        subtitle="1 Enoch, Jubilees, Apocrypha, and the Dead Sea Scrolls"
        loading={loading}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search titles, aliases..."
        filterBar={filterBar}
        data={entries}
        renderItem={renderCard}
        keyExtractor={(item) => item.id}
        emptyMessage="No entries match."
        contentContainerStyle={styles.list}
      />
      {upgradeRequest && (
        <UpgradePrompt
          visible
          variant={upgradeRequest.variant}
          featureName={upgradeRequest.featureName}
          onClose={dismissUpgrade}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  chipRow: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: spacing.xs,
  },
  list: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  card: {
    borderLeftWidth: 4,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  cardTitle: {
    fontFamily: fontFamily.displaySemiBold,
    fontSize: 15,
    marginBottom: 4,
  },
  cardDescriptor: {
    fontFamily: fontFamily.body,
    fontSize: 13,
    lineHeight: 19,
    marginBottom: spacing.sm,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  badge: {
    borderWidth: 1,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  badgeLabel: {
    fontFamily: fontFamily.uiSemiBold,
    fontSize: 11,
  },
});

export default withErrorBoundary(ExtraBiblicalIndexScreen);
