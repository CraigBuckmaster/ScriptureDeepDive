/**
 * WordStudyPreviewList — Top 3 word studies with Hebrew/Greek glyphs + see-all.
 *
 * The original glyph IS the content — not an icon. A gold-tinted square hosts it.
 *
 * Part of Card #1263 (Explore redesign).
 */

import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme, radii, fontFamily, spacing } from '../../theme';
import { getAllWordStudies } from '../../db/content';
import type { WordStudy } from '../../types';

const PREVIEW_COUNT = 3;

export interface WordStudyPreviewListProps {
  onWordPress: (id: string) => void;
  onSeeAll: () => void;
  /** Override data fetching — useful for tests. */
  wordStudies?: WordStudy[];
  /** Total count for the "all N" link. */
  totalCount?: number;
}

/** Pull the first gloss out of `glosses_json`. Safe on malformed JSON. */
export function parseFirstGloss(json: string | null | undefined): string {
  if (!json) return '';
  try {
    const parsed = JSON.parse(json);
    if (Array.isArray(parsed) && parsed.length > 0) {
      const first = parsed[0];
      return typeof first === 'string' ? first : '';
    }
    return '';
  } catch {
    return '';
  }
}

/** Count occurrences encoded in `occurrences_json`. */
export function countOccurrences(json: string | null | undefined): number {
  if (!json) return 0;
  try {
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? parsed.length : 0;
  } catch {
    return 0;
  }
}

export function WordStudyPreviewList({
  onWordPress,
  onSeeAll,
  wordStudies,
  totalCount,
}: WordStudyPreviewListProps) {
  const { base } = useTheme();
  const [loaded, setLoaded] = useState<WordStudy[] | null>(
    wordStudies !== undefined ? wordStudies : null,
  );

  useEffect(() => {
    if (wordStudies !== undefined) {
      setLoaded(wordStudies);
      return;
    }
    let cancelled = false;
    getAllWordStudies()
      .then((rows) => {
        if (!cancelled) setLoaded(rows);
      })
      .catch(() => {
        if (!cancelled) setLoaded([]);
      });
    return () => {
      cancelled = true;
    };
  }, [wordStudies]);

  if (!loaded || loaded.length === 0) return null;

  const top = loaded.slice(0, PREVIEW_COUNT);
  const total = totalCount ?? loaded.length;

  return (
    <View style={styles.container}>
      {top.map((word) => {
        const gloss = parseFirstGloss(word.glosses_json);
        const occurrences = countOccurrences(word.occurrences_json);
        return (
          <TouchableOpacity
            key={word.id}
            style={[
              styles.row,
              {
                backgroundColor: base.tintParchment || base.bgElevated,
              },
            ]}
            onPress={() => onWordPress(word.id)}
            activeOpacity={0.75}
            accessibilityRole="button"
            accessibilityLabel={`${word.transliteration}, ${word.language}, ${gloss}`}
          >
            <View
              style={[
                styles.glyphBox,
                {
                  backgroundColor: base.gold + '14',
                  borderColor: base.gold + '1A',
                },
              ]}
            >
              <Text style={[styles.glyph, { color: base.gold }]} numberOfLines={1}>
                {word.original}
              </Text>
            </View>
            <View style={styles.textCol}>
              <View style={styles.titleRow}>
                <Text style={[styles.translit, { color: base.text }]} numberOfLines={1}>
                  {word.transliteration}
                </Text>
                <Text style={[styles.langBadge, { color: base.goldDim }]}>
                  {word.language?.toUpperCase()}
                </Text>
              </View>
              {gloss ? (
                <Text style={[styles.gloss, { color: base.textMuted }]} numberOfLines={1}>
                  {gloss}
                </Text>
              ) : null}
              {occurrences > 0 ? (
                <Text style={[styles.occurrences, { color: base.textDim }]}>
                  {occurrences}×
                </Text>
              ) : null}
            </View>
          </TouchableOpacity>
        );
      })}
      <TouchableOpacity
        onPress={onSeeAll}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        accessibilityRole="button"
        accessibilityLabel={`See all ${total} word studies`}
      >
        <Text style={[styles.seeAll, { color: base.gold }]}>
          All {total} word studies ›
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radii.md,
    padding: spacing.sm,
    gap: spacing.sm,
  },
  glyphBox: {
    width: 46,
    height: 46,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glyph: {
    fontFamily: fontFamily.displayMedium,
    fontSize: 18,
  },
  textCol: {
    flex: 1,
    gap: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.xs,
  },
  translit: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 13,
    flexShrink: 1,
  },
  langBadge: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 8,
    letterSpacing: 0.5,
  },
  gloss: {
    fontFamily: fontFamily.ui,
    fontSize: 10,
  },
  occurrences: {
    fontFamily: fontFamily.ui,
    fontSize: 8,
  },
  seeAll: {
    alignSelf: 'flex-end',
    fontFamily: fontFamily.uiMedium,
    fontSize: 11,
    paddingVertical: 4,
  },
});
