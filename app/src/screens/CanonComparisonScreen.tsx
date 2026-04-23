/**
 * CanonComparisonScreen — Interactive side-by-side of the four major
 * canon traditions (HWGTB-P3-01 / #1550).
 *
 * Layout:
 *   Landscape (width > height)  — horizontal scroll across 4 columns
 *   Portrait  (width <= height) — tabs at top, one column visible
 *
 * Premium gating:
 *   Free tier: Protestant + Catholic fully visible
 *   Orthodox + Ethiopian: header + first ~5 rows with unlock CTA
 *
 * Entry points:
 *   HowWeGotTheBibleLandingScreen (HWGTB-P2-04 → PR #1598)
 *   ExtraBiblicalDetailScreen (HWGTB-P2-03 → PR #1597) "Compare canons"
 *
 * All four columns share a computed book-membership map so common
 * books render neutrally and unique books get per-tradition badges.
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  useWindowDimensions,
  SafeAreaView,
  LayoutAnimation,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft, ChevronDown, ChevronRight } from 'lucide-react-native';
import { useTheme, spacing, radii, fontFamily } from '../theme';
import { usePremium } from '../hooks/usePremium';
import { useCanonTraditions } from '../hooks/useCanonTraditions';
import { UpgradePrompt } from '../components/UpgradePrompt';
import { CanonColumn } from '../components/CanonColumn';
import { withErrorBoundary } from '../components/ScreenErrorBoundary';
import { getBooks } from '../db/content';
import { logger } from '../utils/logger';
import type { CanonFormationEvent, CanonTradition } from '../types';
import type { ScreenNavProp } from '../navigation/types';

type Nav = ScreenNavProp<'Explore', 'CanonComparison'>;

const FREE_TRADITION_IDS = new Set(['protestant', 'catholic']);
const TRADITION_SHORT_LABELS: Record<string, string> = {
  protestant: 'Prot',
  catholic: 'Cath',
  eastern_orthodox: 'EO',
  ethiopian_tewahedo: 'Eth',
};

// Landscape column width. Keeps 4 columns readable when scrolled.
const LANDSCAPE_COLUMN_WIDTH = 320;

function CanonComparisonScreen() {
  const { base } = useTheme();
  const navigation = useNavigation<Nav>();
  const { isPremium, upgradeRequest, showUpgrade, dismissUpgrade } = usePremium();
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

  const { traditions, loading, commonBookIds, bookMembership } =
    useCanonTraditions();
  const [biblicalBookIds, setBiblicalBookIds] = useState<Set<string>>(
    new Set(),
  );
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [timelineOpen, setTimelineOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getBooks()
      .then((rows) => {
        if (!cancelled) setBiblicalBookIds(new Set(rows.map((b) => b.id)));
      })
      .catch((err) => logger.warn('CanonComparison', 'getBooks failed', err));
    return () => {
      cancelled = true;
    };
  }, []);

  const handleUpgrade = useCallback(() => {
    showUpgrade('feature', 'Canon Comparison');
  }, [showUpgrade]);

  const handleBiblicalPress = useCallback(
    (bookId: string) => {
      navigation.navigate('BookIntro', { bookId });
    },
    [navigation],
  );

  const handleExtraBiblicalPress = useCallback(
    (id: string) => {
      navigation.navigate('ExtraBiblicalDetail', { id });
    },
    [navigation],
  );

  const handleJourneyPress = useCallback(() => {
    navigation.navigate('JourneyDetail', { journeyId: 'canon-formation' });
  }, [navigation]);

  const mergedTimeline = useMemo(
    () => mergeFormationEvents(traditions),
    [traditions],
  );

  const toggleTimeline = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setTimelineOpen((prev) => !prev);
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: base.bg }]}>
        <ScreenHeader onBack={() => navigation.goBack()} onJourneyPress={handleJourneyPress} />
        <View style={styles.center}>
          <ActivityIndicator color={base.gold} />
        </View>
      </SafeAreaView>
    );
  }

  if (traditions.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: base.bg }]}>
        <ScreenHeader onBack={() => navigation.goBack()} onJourneyPress={handleJourneyPress} />
        <View style={styles.center}>
          <Text style={[styles.emptyText, { color: base.textDim }]}>
            Canon data not yet available.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: base.bg }]}>
      <ScreenHeader onBack={() => navigation.goBack()} onJourneyPress={handleJourneyPress} />

      {isLandscape ? (
        <LandscapeLayout
          traditions={traditions}
          isPremium={isPremium}
          commonBookIds={commonBookIds}
          bookMembership={bookMembership}
          biblicalBookIds={biblicalBookIds}
          onBiblicalPress={handleBiblicalPress}
          onExtraBiblicalPress={handleExtraBiblicalPress}
          onUpgradePress={handleUpgrade}
        />
      ) : (
        <PortraitLayout
          traditions={traditions}
          activeIndex={activeTabIndex}
          onActiveIndexChange={setActiveTabIndex}
          isPremium={isPremium}
          commonBookIds={commonBookIds}
          bookMembership={bookMembership}
          biblicalBookIds={biblicalBookIds}
          onBiblicalPress={handleBiblicalPress}
          onExtraBiblicalPress={handleExtraBiblicalPress}
          onUpgradePress={handleUpgrade}
        />
      )}

      <TimelineFooter
        events={mergedTimeline}
        open={timelineOpen}
        onToggle={toggleTimeline}
      />

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

// ── Layouts ──────────────────────────────────────────────────────

function LandscapeLayout({
  traditions,
  isPremium,
  commonBookIds,
  bookMembership,
  biblicalBookIds,
  onBiblicalPress,
  onExtraBiblicalPress,
  onUpgradePress,
}: {
  traditions: CanonTradition[];
  isPremium: boolean;
  commonBookIds: Set<string>;
  bookMembership: Map<string, Set<string>>;
  biblicalBookIds: Set<string>;
  onBiblicalPress: (id: string) => void;
  onExtraBiblicalPress: (id: string) => void;
  onUpgradePress: () => void;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator
      contentContainerStyle={styles.landscapeRow}
    >
      {traditions.map((tr) => (
        <View
          key={tr.id}
          style={[styles.landscapeColumnWrap, { width: LANDSCAPE_COLUMN_WIDTH }]}
        >
          <CanonColumn
            tradition={tr}
            commonBookIds={commonBookIds}
            bookMembership={bookMembership}
            biblicalBookIds={biblicalBookIds}
            traditionShortLabels={TRADITION_SHORT_LABELS}
            locked={!isPremium && !FREE_TRADITION_IDS.has(tr.id)}
            onBiblicalBookPress={onBiblicalPress}
            onExtraBiblicalPress={onExtraBiblicalPress}
            onUpgradePress={onUpgradePress}
          />
        </View>
      ))}
    </ScrollView>
  );
}

function PortraitLayout({
  traditions,
  activeIndex,
  onActiveIndexChange,
  isPremium,
  commonBookIds,
  bookMembership,
  biblicalBookIds,
  onBiblicalPress,
  onExtraBiblicalPress,
  onUpgradePress,
}: {
  traditions: CanonTradition[];
  activeIndex: number;
  onActiveIndexChange: (i: number) => void;
  isPremium: boolean;
  commonBookIds: Set<string>;
  bookMembership: Map<string, Set<string>>;
  biblicalBookIds: Set<string>;
  onBiblicalPress: (id: string) => void;
  onExtraBiblicalPress: (id: string) => void;
  onUpgradePress: () => void;
}) {
  const { base } = useTheme();
  const activeTradition = traditions[activeIndex] ?? traditions[0];
  const isLocked = !isPremium && !FREE_TRADITION_IDS.has(activeTradition.id);

  return (
    <View style={styles.portraitRoot}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabRow}
      >
        {traditions.map((tr, i) => {
          const active = i === activeIndex;
          const locked = !isPremium && !FREE_TRADITION_IDS.has(tr.id);
          return (
            <TouchableOpacity
              key={tr.id}
              onPress={() => onActiveIndexChange(i)}
              activeOpacity={0.7}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              accessibilityLabel={`${tr.label}${locked ? ' (premium)' : ''}`}
              style={[
                styles.tabButton,
                {
                  backgroundColor: active ? base.gold + '18' : 'transparent',
                  borderColor: active ? base.gold : base.gold + '30',
                },
              ]}
            >
              <Text
                style={[
                  styles.tabLabel,
                  { color: active ? base.gold : base.textDim },
                ]}
                numberOfLines={1}
              >
                {tr.label}
                {locked ? ' 🔒' : ''}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={styles.portraitColumnWrap}>
        <CanonColumn
          tradition={activeTradition}
          commonBookIds={commonBookIds}
          bookMembership={bookMembership}
          biblicalBookIds={biblicalBookIds}
          traditionShortLabels={TRADITION_SHORT_LABELS}
          locked={isLocked}
          onBiblicalBookPress={onBiblicalPress}
          onExtraBiblicalPress={onExtraBiblicalPress}
          onUpgradePress={onUpgradePress}
        />
      </View>
    </View>
  );
}

// ── Header + timeline footer ──────────────────────────────────────

function ScreenHeader({
  onBack,
  onJourneyPress,
}: {
  onBack: () => void;
  onJourneyPress: () => void;
}) {
  const { base } = useTheme();
  return (
    <View style={styles.headerRow}>
      <TouchableOpacity
        onPress={onBack}
        style={styles.backBtn}
        accessibilityRole="button"
        accessibilityLabel="Go back"
      >
        <ChevronLeft size={22} color={base.gold} />
      </TouchableOpacity>
      <Text style={[styles.headerTitle, { color: base.gold }]} numberOfLines={1}>
        Canon Comparison
      </Text>
      <TouchableOpacity
        onPress={onJourneyPress}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel="How did this happen?"
        style={[styles.journeyBtn, { borderColor: base.gold + '50' }]}
      >
        <Text style={[styles.journeyBtnText, { color: base.gold }]}>
          How did this happen?
        </Text>
      </TouchableOpacity>
    </View>
  );
}

function TimelineFooter({
  events,
  open,
  onToggle,
}: {
  events: Array<CanonFormationEvent & { traditionLabel: string }>;
  open: boolean;
  onToggle: () => void;
}) {
  const { base } = useTheme();
  if (events.length === 0) return null;
  return (
    <View
      style={[
        styles.timelineWrap,
        { backgroundColor: base.bgElevated, borderTopColor: base.gold + '30' },
      ]}
    >
      <TouchableOpacity
        onPress={onToggle}
        accessibilityRole="button"
        accessibilityLabel={open ? 'Collapse formation timeline' : 'Expand formation timeline'}
        style={styles.timelineHeader}
      >
        {open ? (
          <ChevronDown size={14} color={base.gold} />
        ) : (
          <ChevronRight size={14} color={base.gold} />
        )}
        <Text style={[styles.timelineTitle, { color: base.gold }]}>
          Formation timeline — {events.length} events across the four traditions
        </Text>
      </TouchableOpacity>
      {open ? (
        <ScrollView
          style={styles.timelineList}
          contentContainerStyle={styles.timelineContent}
        >
          {events.map((e, i) => (
            <View key={`${e.year}-${i}`} style={styles.timelineRow}>
              <Text style={[styles.timelineYear, { color: base.gold }]}>
                {formatYear(e.year)}
              </Text>
              <View style={styles.timelineBody}>
                <Text style={[styles.timelineLabel, { color: base.text }]}>
                  {e.label}
                </Text>
                <Text style={[styles.timelineTradition, { color: base.textMuted }]}>
                  {e.traditionLabel}
                </Text>
                <Text style={[styles.timelineDetail, { color: base.textDim }]}>
                  {e.detail}
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>
      ) : null}
    </View>
  );
}

// ── Helpers ──────────────────────────────────────────────────────

function mergeFormationEvents(
  traditions: CanonTradition[],
): Array<CanonFormationEvent & { traditionLabel: string }> {
  const all: Array<CanonFormationEvent & { traditionLabel: string }> = [];
  for (const tr of traditions) {
    for (const e of tr.formation_events) {
      all.push({ ...e, traditionLabel: tr.label });
    }
  }
  all.sort((a, b) => a.year - b.year);
  return all;
}

function formatYear(year: number): string {
  if (year < 0) return `${-year} BC`;
  return `${year} AD`;
}

// ── Styles ────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontFamily: fontFamily.body,
    fontSize: 14,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  backBtn: {
    padding: spacing.xs,
  },
  headerTitle: {
    flex: 1,
    fontFamily: fontFamily.displayMedium,
    fontSize: 16,
  },
  journeyBtn: {
    borderWidth: 1,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  journeyBtnText: {
    fontFamily: fontFamily.uiSemiBold,
    fontSize: 11,
  },

  landscapeRow: {
    gap: spacing.sm,
    padding: spacing.md,
  },
  landscapeColumnWrap: {
    height: '100%',
  },

  portraitRoot: {
    flex: 1,
    gap: spacing.sm,
  },
  tabRow: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    gap: spacing.xs,
  },
  tabButton: {
    borderWidth: 1,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
  },
  tabLabel: {
    fontFamily: fontFamily.uiSemiBold,
    fontSize: 12,
  },
  portraitColumnWrap: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },

  timelineWrap: {
    borderTopWidth: 1,
  },
  timelineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
  },
  timelineTitle: {
    fontFamily: fontFamily.uiSemiBold,
    fontSize: 12,
    flex: 1,
  },
  timelineList: {
    maxHeight: 240,
  },
  timelineContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  timelineRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  timelineYear: {
    fontFamily: fontFamily.uiSemiBold,
    fontSize: 12,
    width: 60,
  },
  timelineBody: {
    flex: 1,
    gap: 2,
  },
  timelineLabel: {
    fontFamily: fontFamily.displayMedium,
    fontSize: 13,
  },
  timelineTradition: {
    fontFamily: fontFamily.bodyItalic,
    fontSize: 11,
  },
  timelineDetail: {
    fontFamily: fontFamily.body,
    fontSize: 12,
    lineHeight: 18,
  },
});

export default withErrorBoundary(CanonComparisonScreen);
