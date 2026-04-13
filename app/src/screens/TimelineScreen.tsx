/**
 * TimelineScreen — Vertical scrolling timeline.
 *
 * 543 events on a FlatList of event cards connected by a glowing spine.
 * Proportional era strip at the top filters by era. Event cards expand
 * inline (accordion) to show full summary + people + chapter link.
 *
 * Part of Card #1264 (Timeline Phase 1).
 */

import React, { useCallback, useEffect, useMemo, useReducer, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';

import type { ScreenNavProp, ScreenRouteProp } from '../navigation/types';
import { getAllTimelineEntries, getEras } from '../db/content';
import type { EraRow } from '../db/content/reference';
import { useContentImages } from '../hooks/useContentImages';
import {
  TimelineEraStrip,
  TimelineEventCard,
  TimelineSpine,
  SPINE_GUTTER_WIDTH,
} from '../components/timeline';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { useTheme, spacing, fontFamily } from '../theme';
import type { TimelineEntry } from '../types';
import { withErrorBoundary } from '../components/ScreenErrorBoundary';
import { useSettingsStore } from '../stores';

interface CategoryFilters {
  event: boolean;
  book: boolean;
  person: boolean;
  world: boolean;
}
type FilterAction = { type: 'toggle'; category: keyof CategoryFilters };
function filterReducer(state: CategoryFilters, action: FilterAction): CategoryFilters {
  return { ...state, [action.category]: !state[action.category] };
}
const INITIAL_FILTERS: CategoryFilters = { event: true, book: true, person: true, world: true };

/** Build a { eraId → event count } lookup from a timeline entry list. */
export function computeEraCounts(
  entries: TimelineEntry[] | null | undefined,
): Record<string, number> {
  const out: Record<string, number> = {};
  if (!entries) return out;
  for (const e of entries) {
    if (!e.era) continue;
    out[e.era] = (out[e.era] ?? 0) + 1;
  }
  return out;
}

/** Apply category + era filters to a timeline entry list. */
export function filterTimeline(
  entries: TimelineEntry[] | null | undefined,
  filters: CategoryFilters,
  eraId: string | null,
): TimelineEntry[] {
  if (!entries) return [];
  const cats = new Set<string>();
  if (filters.event) cats.add('event');
  if (filters.book) cats.add('book');
  if (filters.person) cats.add('person');
  if (filters.world) cats.add('world');
  if (cats.size === 0) {
    cats.add('event');
    cats.add('book');
  }
  return entries.filter((e) => {
    if (!cats.has(e.category)) return false;
    if (eraId && e.era !== eraId) return false;
    return true;
  });
}

function TimelineRow({
  event,
  eraColor,
  isFirst,
  isLast,
  isExpanded,
  onToggleExpand,
  onPersonPress,
  onChapterPress,
}: {
  event: TimelineEntry;
  eraColor: string;
  isFirst: boolean;
  isLast: boolean;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onPersonPress: (personId: string) => void;
  onChapterPress: (bookId: string, chapterNum: number) => void;
}) {
  const { images } = useContentImages('timeline', event.id);
  const hasImage = images.length > 0;
  return (
    <View style={styles.row}>
      <TimelineSpine
        eraColor={eraColor}
        hasImage={hasImage}
        isActive={isExpanded}
        isFirst={isFirst}
        isLast={isLast}
      />
      <View style={styles.rowCard}>
        <TimelineEventCard
          event={event}
          eraColor={eraColor}
          isExpanded={isExpanded}
          onToggleExpand={onToggleExpand}
          onPersonPress={onPersonPress}
          onChapterPress={onChapterPress}
        />
      </View>
    </View>
  );
}

function TimelineScreen() {
  const { base, eras: themeEras } = useTheme();
  const route = useRoute<ScreenRouteProp<'Explore', 'Timeline'>>();
  const navigation = useNavigation<ScreenNavProp<'Explore', 'Timeline'>>();
  const initialEventId = route?.params?.eventId;
  const insets = useSafeAreaInsets();

  const [events, setEvents] = useState<TimelineEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [eras, setEras] = useState<EraRow[]>([]);
  const [filterEra, setFilterEra] = useState<string | null>(null);
  const [filters, dispatchFilter] = useReducer(filterReducer, INITIAL_FILTERS);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([getAllTimelineEntries(), getEras()])
      .then(([entries, eraRows]) => {
        if (cancelled) return;
        setEvents(entries ?? []);
        setEras(eraRows ?? []);
        setIsLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    useSettingsStore.getState().markGettingStartedDone('explore_timeline');
  }, []);

  useEffect(() => {
    if (initialEventId) setExpandedId(initialEventId);
  }, [initialEventId]);

  const eraCounts = useMemo(() => computeEraCounts(events), [events]);
  const visible = useMemo(
    () => filterTimeline(events, filters, filterEra),
    [events, filters, filterEra],
  );

  const eraColorFor = useCallback(
    (eraId: string | null): string => {
      if (!eraId) return base.gold;
      const row = eras.find((e) => e.id === eraId);
      return row?.hex ?? themeEras[eraId] ?? base.gold;
    },
    [base.gold, eras, themeEras],
  );

  const handleToggleExpand = useCallback((id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  }, []);

  const handlePersonPress = useCallback(
    (personId: string) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      navigation.navigate('PersonDetail' as any, { personId } as any);
    },
    [navigation],
  );

  const handleChapterPress = useCallback(
    (bookId: string, chapterNum: number) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (navigation as any).navigate('ReadTab', {
        screen: 'Chapter',
        params: { bookId, chapterNum },
      });
    },
    [navigation],
  );

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: base.bg }]}>
        <View style={[styles.loadingPad, { paddingTop: insets.top + spacing.lg }]}>
          <LoadingSkeleton lines={6} />
        </View>
      </View>
    );
  }

  const lastIndex = visible.length - 1;

  return (
    <View
      style={[styles.container, { backgroundColor: base.bg, paddingTop: insets.top }]}
      accessibilityLabel="Timeline"
    >
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: base.gold }]} accessibilityRole="header">
          Timeline
        </Text>
        <Text style={[styles.headerCount, { color: base.textMuted }]}>
          {events.length} events
        </Text>
      </View>

      <TimelineEraStrip
        eras={eras}
        eventCounts={eraCounts}
        activeEraId={filterEra}
        onSelectEra={(eraId) => setFilterEra(eraId)}
      />

      {/* Category toggles */}
      <View style={styles.categoryRow}>
        {(
          [
            { key: 'event' as const, label: 'Events' },
            { key: 'book' as const, label: 'Books' },
            { key: 'person' as const, label: 'People' },
            { key: 'world' as const, label: 'World History' },
          ]
        ).map(({ key, label }) => (
          <TouchableOpacity
            key={key}
            onPress={() => dispatchFilter({ type: 'toggle', category: key })}
            hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
            accessibilityRole="button"
            accessibilityLabel={`${label} filter: ${filters[key] ? 'on' : 'off'}`}
            accessibilityState={{ selected: filters[key] }}
            style={[
              styles.categoryChip,
              {
                borderColor: filters[key] ? base.gold + '55' : base.border,
                opacity: filters[key] ? 1 : 0.5,
              },
            ]}
          >
            <Text style={[styles.categoryLabel, { color: base.textMuted }]}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={visible}
        keyExtractor={(e) => e.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item, index }) => {
          const eraColor = eraColorFor(item.era);
          return (
            <TimelineRow
              event={item}
              eraColor={eraColor}
              isFirst={index === 0}
              isLast={index === lastIndex}
              isExpanded={expandedId === item.id}
              onToggleExpand={() => handleToggleExpand(item.id)}
              onPersonPress={handlePersonPress}
              onChapterPress={handleChapterPress}
            />
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Text style={[styles.emptyText, { color: base.textMuted }]}>
              No events match the current filters.
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingPad: {
    padding: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  headerTitle: {
    fontFamily: fontFamily.displaySemiBold,
    fontSize: 22,
  },
  headerCount: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 11,
  },
  categoryRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    gap: spacing.xs,
  },
  categoryChip: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 10,
    height: 26,
    justifyContent: 'center',
  },
  categoryLabel: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 10,
    letterSpacing: 0.3,
  },
  listContent: {
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.xxl,
    gap: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: spacing.sm,
  },
  rowCard: {
    flex: 1,
    minWidth: 0,
  },
  emptyWrap: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: fontFamily.ui,
    fontSize: 12,
  },
});

export { SPINE_GUTTER_WIDTH };
export default withErrorBoundary(TimelineScreen);
