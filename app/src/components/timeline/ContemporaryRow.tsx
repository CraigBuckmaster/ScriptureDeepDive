/**
 * ContemporaryRow — Horizontal row of contemporary-avatar circles.
 *
 * Shown while the timeline is in "person filter" mode. Tapping an avatar
 * switches the person filter to that person.
 *
 * Part of Card #1266 (Timeline Phase 2).
 */

import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useTheme, fontFamily, spacing } from '../../theme';
import type { TimelineEntry } from '../../types';

const MAX_AVATARS = 8;

export interface Contemporary {
  id: string;
  name: string;
  count: number;
}

export interface ContemporaryRowProps {
  contemporaries: Contemporary[];
  onPress: (personId: string) => void;
}

/** Parse a `people_json` column into an array of ids. Never throws. */
function parsePeopleJsonSafe(json: string | null | undefined): string[] {
  if (!json) return [];
  try {
    const parsed = JSON.parse(json);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((v): v is string => typeof v === 'string');
  } catch {
    return [];
  }
}

/**
 * Compute up to `max` contemporaries that appear most often in events whose
 * year-range overlaps the filtered person's own event span. Pure logic so it
 * can be unit-tested without rendering the component.
 */
export function computeContemporaries(
  events: TimelineEntry[],
  personId: string,
  max = MAX_AVATARS,
): Contemporary[] {
  const personEvents = events.filter((e) =>
    parsePeopleJsonSafe(e.people_json).includes(personId),
  );
  if (personEvents.length === 0) return [];

  const years = personEvents.map((e) => e.year);
  const minYear = Math.min(...years);
  const maxYear = Math.max(...years);

  const candidates = events.filter((e) => e.year >= minYear && e.year <= maxYear);
  const counts: Record<string, number> = {};
  for (const e of candidates) {
    for (const pid of parsePeopleJsonSafe(e.people_json)) {
      if (pid === personId) continue;
      counts[pid] = (counts[pid] ?? 0) + 1;
    }
  }

  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, max)
    .map(([id, count]) => ({ id, name: id, count }));
}

export function ContemporaryRow({ contemporaries, onPress }: ContemporaryRowProps) {
  const { base } = useTheme();
  if (contemporaries.length === 0) return null;

  return (
    <View style={styles.wrapper}>
      <Text style={[styles.label, { color: base.textMuted }]}>Active contemporaries:</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        {contemporaries.map((c) => (
          <TouchableOpacity
            key={c.id}
            onPress={() => onPress(c.id)}
            accessibilityRole="button"
            accessibilityLabel={`Switch filter to ${c.name}`}
            style={[
              styles.avatar,
              { backgroundColor: base.bgElevated, borderColor: base.border },
            ]}
          >
            <Text style={[styles.initial, { color: base.textDim }]}>
              {c.name.charAt(0).toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.xs,
  },
  label: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 9,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  row: {
    flexDirection: 'row',
    gap: 6,
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initial: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 12,
  },
});
