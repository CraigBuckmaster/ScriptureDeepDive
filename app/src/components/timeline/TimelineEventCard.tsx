/**
 * TimelineEventCard — Individual event on the vertical timeline.
 *
 * Collapsed: year + scripture ref header, title, subtitle, optional image.
 * Expanded: full summary + people pills + chapter link.
 *
 * Part of Card #1264 (Timeline Phase 1).
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme, radii, fontFamily, spacing } from '../../theme';
import type { TimelineEntry } from '../../types';

export interface TimelineEventCardProps {
  event: TimelineEntry;
  /** Era accent colour — supplied from `eras[event.era].hex`. */
  eraColor: string;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onPersonPress?: (personId: string) => void;
  onChapterPress?: (bookId: string, chapterNum: number) => void;
}

/** Format a negative year as BC, zero/positive as AD. */
export function formatTimelineYear(year: number): string {
  if (year === 0) return 'AD/BC';
  if (year < 0) return `${Math.abs(year)} BC`;
  return `AD ${year}`;
}

/** Parse a `people_json` column into an array of ids. Never throws. */
export function parsePeopleJson(json: string | null | undefined): string[] {
  if (!json) return [];
  try {
    const parsed = JSON.parse(json);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((v): v is string => typeof v === 'string');
  } catch {
    return [];
  }
}

/** Extract `{ bookId, chapterNum }` from a `content/ot/genesis_12.html`-style link. */
export function parseChapterLink(
  link: string | null | undefined,
): { bookId: string; chapterNum: number } | null {
  if (!link) return null;
  const match = link.match(/(\w+)_(\d+)\.html/);
  if (!match) return null;
  const bookId = match[1].toLowerCase();
  const chapterNum = parseInt(match[2], 10);
  if (!Number.isFinite(chapterNum)) return null;
  return { bookId, chapterNum };
}

export function TimelineEventCard({
  event,
  eraColor,
  isExpanded,
  onToggleExpand,
  onPersonPress,
  onChapterPress,
}: TimelineEventCardProps) {
  const { base } = useTheme();

  const people = parsePeopleJson(event.people_json);
  const chapter = parseChapterLink(event.chapter_link);

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onToggleExpand}
      accessibilityRole="button"
      accessibilityLabel={`${event.name}, ${formatTimelineYear(event.year)}`}
      accessibilityState={{ expanded: isExpanded }}
      style={[
        styles.card,
        {
          backgroundColor: base.bgElevated,
          borderColor: eraColor + '20',
        },
      ]}
    >
      <View style={styles.header}>
        <Text style={[styles.year, { color: eraColor }]}>
          {formatTimelineYear(event.year)}
        </Text>
        {event.scripture_ref ? (
          <Text style={[styles.ref, { color: base.gold }]}>{event.scripture_ref}</Text>
        ) : null}
      </View>
      <Text style={[styles.title, { color: base.text }]}>{event.name}</Text>
      {event.summary ? (
        <Text
          style={[styles.subtitle, { color: base.textMuted }]}
          numberOfLines={isExpanded ? undefined : 2}
        >
          {event.summary}
        </Text>
      ) : null}
      {isExpanded && people.length > 0 ? (
        <View style={styles.peopleRow}>
          {people.map((personId) => (
            <TouchableOpacity
              key={personId}
              onPress={() => onPersonPress?.(personId)}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              accessibilityRole="button"
              accessibilityLabel={`Person ${personId}`}
              style={[styles.personPill, { borderColor: eraColor + '40' }]}
            >
              <Text style={[styles.personLabel, { color: base.text }]}>{personId}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : null}
      {isExpanded && chapter ? (
        <TouchableOpacity
          onPress={() => onChapterPress?.(chapter.bookId, chapter.chapterNum)}
          style={[
            styles.chapterButton,
            { backgroundColor: base.gold + '22', borderColor: base.gold + '55' },
          ]}
          accessibilityRole="button"
          accessibilityLabel={`Open ${chapter.bookId} ${chapter.chapterNum}`}
        >
          <Text style={[styles.chapterText, { color: base.gold }]}>Go to chapter →</Text>
        </TouchableOpacity>
      ) : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.md,
    borderWidth: 1,
    padding: spacing.sm + 2,
    gap: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  year: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 9,
    letterSpacing: 1,
  },
  ref: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 8,
  },
  title: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 13,
  },
  subtitle: {
    fontFamily: fontFamily.ui,
    fontSize: 10,
    lineHeight: 14,
  },
  peopleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: spacing.xs,
  },
  personPill: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  personLabel: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 9,
  },
  chapterButton: {
    marginTop: spacing.xs,
    borderWidth: 1,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  chapterText: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 10,
  },
});
