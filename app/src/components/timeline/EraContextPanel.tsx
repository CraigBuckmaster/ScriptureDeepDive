/**
 * EraContextPanel — Expandable era narrative/themes/people/books panel.
 *
 * Surfaces the rich era_config fields (narrative, key_themes, key_people,
 * books) that aren't visible on the timeline today. Tap an era segment in
 * the strip to toggle the panel; only one era is open at a time.
 *
 * Part of Card #1266 (Timeline Phase 2).
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme, fontFamily, radii, spacing } from '../../theme';
import type { EraRow } from '../../db/content/reference';
import { formatEraRange } from './TimelineEraStrip';

export interface EraContextPanelProps {
  era: EraRow;
  onPersonPress?: (personName: string) => void;
  onBookPress?: (bookName: string) => void;
}

/** Split a comma-separated string into trimmed, non-empty pieces. */
export function splitCommaList(input: string | null | undefined): string[] {
  if (!input) return [];
  return input
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

export function EraContextPanel({ era, onPersonPress, onBookPress }: EraContextPanelProps) {
  const { base } = useTheme();
  const accent = era.hex ?? base.gold;

  const themes = splitCommaList(era.key_themes);
  const people = splitCommaList(era.key_people);
  const books = splitCommaList(era.books);

  return (
    <View
      accessibilityLabel={`${era.name} era context`}
      style={[
        styles.panel,
        {
          backgroundColor: accent + '14',
          borderColor: accent + '1A',
        },
      ]}
    >
      <Text style={[styles.title, { color: accent }]}>
        {era.name.toUpperCase()}
        <Text style={[styles.range, { color: base.textMuted }]}>
          {'  '}
          {formatEraRange(era.range_start, era.range_end)}
        </Text>
      </Text>

      {era.narrative ? (
        <Text style={[styles.narrative, { color: base.textDim }]}>{era.narrative}</Text>
      ) : null}

      {themes.length > 0 ? (
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: base.textMuted }]}>Key Themes</Text>
          <Text style={[styles.sectionBody, { color: base.textMuted }]}>{themes.join(', ')}</Text>
        </View>
      ) : null}

      {people.length > 0 ? (
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: base.textMuted }]}>Key People</Text>
          <View style={styles.pillRow}>
            {people.map((name) => (
              <TouchableOpacity
                key={name}
                onPress={() => onPersonPress?.(name)}
                accessibilityRole="button"
                accessibilityLabel={`Filter timeline to ${name}`}
                style={[styles.pill, { borderColor: accent + '40' }]}
              >
                <Text style={[styles.pillLabel, { color: base.text }]}>{name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ) : null}

      {books.length > 0 ? (
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: base.textMuted }]}>Books</Text>
          <View style={styles.pillRow}>
            {books.map((book) => (
              <TouchableOpacity
                key={book}
                onPress={() => onBookPress?.(book)}
                accessibilityRole="button"
                accessibilityLabel={`Open ${book}`}
                style={[styles.pill, { borderColor: base.gold + '40' }]}
              >
                <Text style={[styles.pillLabel, { color: base.gold }]}>{book}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing.sm + 2,
    gap: spacing.sm,
  },
  title: {
    fontFamily: fontFamily.displaySemiBold,
    fontSize: 12,
    letterSpacing: 1,
  },
  range: {
    fontFamily: fontFamily.ui,
    fontSize: 10,
    letterSpacing: 0,
  },
  narrative: {
    fontFamily: fontFamily.body,
    fontSize: 11,
    lineHeight: 17,
  },
  section: {
    gap: 4,
  },
  sectionLabel: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 9,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  sectionBody: {
    fontFamily: fontFamily.ui,
    fontSize: 10,
    lineHeight: 14,
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  pill: {
    borderWidth: 1,
    borderRadius: radii.pill,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  pillLabel: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 10,
  },
});
