/**
 * CanonColumn — One tradition's canonical book list for the Canon
 * Comparison screen (HWGTB-P3-01 / #1550). Used both in landscape
 * (horizontal scroll across 4 columns) and portrait (tabbed, one
 * column at a time) layouts.
 *
 * Book-diff highlighting: books that appear in every tradition render
 * in the neutral style; books unique to a subset get a gold-tinted
 * badge showing the set of traditions they belong to.
 */

import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  LayoutAnimation,
} from 'react-native';
import { ChevronDown, ChevronRight } from 'lucide-react-native';
import { useTheme, spacing, radii, fontFamily } from '../theme';
import type { CanonTradition } from '../types';

interface Props {
  tradition: CanonTradition;
  /** Set of book-ids that appear in every tradition (the common core). */
  commonBookIds: Set<string>;
  /** book-id → set of tradition-ids that contain it. */
  bookMembership: Map<string, Set<string>>;
  /** All canonical biblical book ids (from the books table). Used to
   *  decide whether a tap should route to BookIntro or to
   *  ExtraBiblicalDetail. */
  biblicalBookIds: Set<string>;
  /** Short-label map for badging ({ protestant: 'Prot', ... }). */
  traditionShortLabels: Record<string, string>;
  /**
   * When true the column renders header + first N rows with a fade
   * overlay and a tap target that fires the upgrade flow. Used by the
   * free-tier UI to gate Orthodox + Ethiopian columns.
   */
  locked?: boolean;
  lockedRowCount?: number;
  onBiblicalBookPress?: (bookId: string) => void;
  onExtraBiblicalPress?: (id: string) => void;
  onUpgradePress?: () => void;
}

export function CanonColumn({
  tradition,
  commonBookIds,
  bookMembership,
  biblicalBookIds,
  traditionShortLabels,
  locked = false,
  lockedRowCount = 5,
  onBiblicalBookPress,
  onExtraBiblicalPress,
  onUpgradePress,
}: Props) {
  const { base } = useTheme();
  const [distinctivesOpen, setDistinctivesOpen] = useState(false);

  const toggleDistinctives = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setDistinctivesOpen((prev) => !prev);
  }, []);

  const handleBookPress = useCallback(
    (bookId: string) => {
      if (locked) {
        onUpgradePress?.();
        return;
      }
      if (biblicalBookIds.has(bookId)) {
        onBiblicalBookPress?.(bookId);
      } else {
        onExtraBiblicalPress?.(bookId);
      }
    },
    [locked, biblicalBookIds, onBiblicalBookPress, onExtraBiblicalPress, onUpgradePress],
  );

  // Founding-councils subtitle: first 2 formation_events as terse labels
  const councilsSubtitle = tradition.formation_events
    .slice(0, 2)
    .map((e) => e.label.replace(/\s*\(.*\)$/, ''))
    .join(' · ');

  // Flatten the canon_list into rows so we can trim for locked preview.
  const rows = flattenRows(tradition.canon_list);
  const visibleRows = locked ? rows.slice(0, lockedRowCount) : rows;

  return (
    <View
      style={[
        styles.column,
        { backgroundColor: base.bgElevated, borderColor: base.gold + '30' },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.label, { color: base.gold }]} numberOfLines={1}>
          {tradition.label}
        </Text>
        <Text style={[styles.bookCount, { color: base.text }]}>
          {tradition.book_count} books
        </Text>
        {councilsSubtitle ? (
          <Text style={[styles.councils, { color: base.textMuted }]} numberOfLines={2}>
            {councilsSubtitle}
          </Text>
        ) : null}
      </View>

      {/* Book list */}
      <ScrollView
        style={styles.listScroll}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={!locked}
      >
        {visibleRows.map((row, idx) =>
          row.type === 'section' ? (
            <Text
              key={`s-${idx}`}
              style={[styles.sectionHeader, { color: base.textDim }]}
            >
              {row.label}
            </Text>
          ) : (
            <BookRow
              key={`b-${row.bookId}-${idx}`}
              bookId={row.bookId}
              isCommon={commonBookIds.has(row.bookId)}
              memberTraditions={bookMembership.get(row.bookId) ?? new Set()}
              traditionShortLabels={traditionShortLabels}
              onPress={() => handleBookPress(row.bookId)}
            />
          ),
        )}

        {locked ? (
          <TouchableOpacity
            onPress={onUpgradePress}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Unlock canon comparison"
            style={[
              styles.lockedCta,
              {
                backgroundColor: base.gold + '18',
                borderColor: base.gold + '40',
              },
            ]}
          >
            <Text style={[styles.lockedCtaTitle, { color: base.gold }]}>
              {'✨ Unlock full canon'}
            </Text>
            <Text style={[styles.lockedCtaHint, { color: base.textDim }]}>
              {`See all ${rows.filter((r) => r.type === 'book').length} books in the ${tradition.label} canon`}
            </Text>
          </TouchableOpacity>
        ) : null}

        {/* Distinctives — bottom, expandable */}
        {!locked && tradition.distinctives.length > 0 ? (
          <View style={styles.distinctivesBlock}>
            <TouchableOpacity
              onPress={toggleDistinctives}
              accessibilityRole="button"
              accessibilityLabel={
                distinctivesOpen
                  ? `Hide ${tradition.label} distinctives`
                  : `Show ${tradition.label} distinctives`
              }
              style={styles.distinctivesHeader}
            >
              {distinctivesOpen ? (
                <ChevronDown size={14} color={base.gold} />
              ) : (
                <ChevronRight size={14} color={base.gold} />
              )}
              <Text style={[styles.distinctivesTitle, { color: base.gold }]}>
                Distinctives
              </Text>
            </TouchableOpacity>
            {distinctivesOpen ? (
              <View style={styles.distinctivesList}>
                {tradition.distinctives.map((d, i) => (
                  <View key={`d-${i}`} style={styles.distinctiveItem}>
                    <Text style={[styles.distinctiveItemTitle, { color: base.text }]}>
                      {d.title}
                    </Text>
                    <Text style={[styles.distinctiveItemBody, { color: base.textDim }]}>
                      {d.detail}
                    </Text>
                  </View>
                ))}
              </View>
            ) : null}
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

// ── Sub-components ────────────────────────────────────────────────

function BookRow({
  bookId,
  isCommon,
  memberTraditions,
  traditionShortLabels,
  onPress,
}: {
  bookId: string;
  isCommon: boolean;
  memberTraditions: Set<string>;
  traditionShortLabels: Record<string, string>;
  onPress: () => void;
}) {
  const { base } = useTheme();
  const displayName = formatBookName(bookId);
  const color = isCommon ? base.textDim : base.text;
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`${displayName}${isCommon ? ' (in all traditions)' : ''}`}
      style={styles.bookRow}
    >
      <Text style={[styles.bookName, { color }]} numberOfLines={1}>
        {displayName}
      </Text>
      {!isCommon ? (
        <View style={styles.badgeRow}>
          {Array.from(memberTraditions)
            .sort()
            .map((tid) => (
              <View
                key={tid}
                style={[
                  styles.badge,
                  { borderColor: base.gold + '60', backgroundColor: base.gold + '15' },
                ]}
              >
                <Text style={[styles.badgeText, { color: base.gold }]}>
                  {traditionShortLabels[tid] ?? tid[0].toUpperCase()}
                </Text>
              </View>
            ))}
        </View>
      ) : null}
    </TouchableOpacity>
  );
}

// ── Helpers ──────────────────────────────────────────────────────

type Row =
  | { type: 'section'; label: string }
  | { type: 'book'; bookId: string };

function flattenRows(sections: CanonTradition['canon_list']): Row[] {
  const rows: Row[] = [];
  for (const s of sections) {
    rows.push({ type: 'section', label: s.section });
    for (const bookId of s.books) rows.push({ type: 'book', bookId });
  }
  return rows;
}

function formatBookName(id: string): string {
  return id
    .split(/[-_]/)
    .map((s) => (s.length > 1 ? s[0].toUpperCase() + s.slice(1) : s))
    .join(' ');
}

// ── Styles ────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  column: {
    flex: 1,
    borderWidth: 1,
    borderRadius: radii.md,
    overflow: 'hidden',
  },
  header: {
    padding: spacing.sm,
    gap: 2,
  },
  label: {
    fontFamily: fontFamily.displaySemiBold,
    fontSize: 15,
  },
  bookCount: {
    fontFamily: fontFamily.uiSemiBold,
    fontSize: 12,
  },
  councils: {
    fontFamily: fontFamily.bodyItalic,
    fontSize: 11,
    lineHeight: 15,
  },
  listScroll: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.md,
    gap: 2,
  },
  sectionHeader: {
    fontFamily: fontFamily.uiSemiBold,
    fontSize: 10,
    letterSpacing: 0.8,
    marginTop: spacing.sm,
    marginBottom: 2,
  },
  bookRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.xs,
    paddingVertical: 4,
  },
  bookName: {
    fontFamily: fontFamily.body,
    fontSize: 13,
    flexShrink: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 3,
  },
  badge: {
    borderWidth: 1,
    borderRadius: radii.pill,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  badgeText: {
    fontFamily: fontFamily.uiSemiBold,
    fontSize: 9,
    letterSpacing: 0.3,
  },
  lockedCta: {
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing.sm,
    marginTop: spacing.sm,
    alignItems: 'center',
    gap: 2,
  },
  lockedCtaTitle: {
    fontFamily: fontFamily.displayMedium,
    fontSize: 13,
  },
  lockedCtaHint: {
    fontFamily: fontFamily.body,
    fontSize: 11,
    textAlign: 'center',
  },
  distinctivesBlock: {
    marginTop: spacing.md,
  },
  distinctivesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  distinctivesTitle: {
    fontFamily: fontFamily.displayMedium,
    fontSize: 13,
  },
  distinctivesList: {
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  distinctiveItem: {
    gap: 2,
  },
  distinctiveItemTitle: {
    fontFamily: fontFamily.uiSemiBold,
    fontSize: 12,
  },
  distinctiveItemBody: {
    fontFamily: fontFamily.body,
    fontSize: 12,
    lineHeight: 18,
  },
});
