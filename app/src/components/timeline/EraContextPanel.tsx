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

/** Theme entry from key_themes JSON. */
interface ThemeEntry {
  theme: string;
  ref?: string;
  note?: string;
}

/** Parse a JSON array string into string[]. Returns empty array on failure. */
function parseStringArray(input: string | null | undefined): string[] {
  if (!input) return [];
  try {
    const parsed = JSON.parse(input);
    if (Array.isArray(parsed)) {
      return parsed.filter((item): item is string => typeof item === 'string');
    }
  } catch {
    // Fall back to comma-separated for legacy data
    return input.split(',').map((s) => s.trim()).filter(Boolean);
  }
  return [];
}

/** Parse key_themes JSON array into ThemeEntry[]. */
function parseThemes(input: string | null | undefined): ThemeEntry[] {
  if (!input) return [];
  try {
    const parsed = JSON.parse(input);
    if (Array.isArray(parsed)) {
      return parsed.filter(
        (item): item is ThemeEntry =>
          typeof item === 'object' && item !== null && typeof item.theme === 'string'
      );
    }
  } catch {
    // Malformed JSON — return empty
  }
  return [];
}

export function EraContextPanel({ era, onPersonPress, onBookPress }: EraContextPanelProps) {
  const { base } = useTheme();
  const accent = era.hex ?? base.gold;

  const themes = parseThemes(era.key_themes);
  const people = parseStringArray(era.key_people);
  const books = parseStringArray(era.books);

  /** Format person ID as display name (snake_case → Title Case). */
  const formatPersonName = (id: string): string => {
    return id
      .split(/[-_]/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  /** Format book ID as display name. */
  const formatBookName = (id: string): string => {
    // Handle numbered books like "1_kings" → "1 Kings"
    const formatted = id.replace(/_/g, ' ');
    return formatted
      .split(' ')
      .map((word) => {
        if (/^\d+$/.test(word)) return word;
        return word.charAt(0).toUpperCase() + word.slice(1);
      })
      .join(' ');
  };

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
          <View style={styles.themesContainer}>
            {themes.map((t, idx) => (
              <View key={idx} style={styles.themeItem}>
                <View style={styles.themeHeader}>
                  <Text style={[styles.themeName, { color: base.text }]}>{t.theme}</Text>
                  {t.ref ? (
                    <Text style={[styles.themeRef, { color: accent }]}>{t.ref}</Text>
                  ) : null}
                </View>
                {t.note ? (
                  <Text style={[styles.themeNote, { color: base.textMuted }]}>{t.note}</Text>
                ) : null}
              </View>
            ))}
          </View>
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
                accessibilityLabel={`Filter timeline to ${formatPersonName(name)}`}
                style={[styles.pill, { borderColor: accent + '40' }]}
              >
                <Text style={[styles.pillLabel, { color: base.text }]}>
                  {formatPersonName(name)}
                </Text>
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
                accessibilityLabel={`Open ${formatBookName(book)}`}
                style={[styles.pill, { borderColor: base.gold + '40' }]}
              >
                <Text style={[styles.pillLabel, { color: base.gold }]}>
                  {formatBookName(book)}
                </Text>
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
  themesContainer: {
    gap: spacing.xs,
  },
  themeItem: {
    gap: 2,
  },
  themeHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.xs,
    flexWrap: 'wrap',
  },
  themeName: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 11,
  },
  themeRef: {
    fontFamily: fontFamily.ui,
    fontSize: 10,
  },
  themeNote: {
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
