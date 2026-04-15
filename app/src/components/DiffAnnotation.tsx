/**
 * DiffAnnotation — Expandable card showing a textual difference between
 * parallel Gospel or OT accounts.
 *
 * diff_type drives the badge color:
 *   addition        -> green
 *   omission        -> red/dim
 *   reordering      -> gold
 *   wording         -> gold
 *   theological_emphasis -> gold
 *
 * Supports flexible `texts` map keyed by book ID (e.g. { matthew: "...", luke: "..." }).
 * Legacy flat matthew/luke fields are normalized via normalizeDiffAnnotation().
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme, spacing, radii, fontFamily } from '../theme';
import { gospelColor, GOSPEL_SHORT } from './GospelColors';

export interface DiffAnnotationData {
  location: string;
  diff_type: 'addition' | 'omission' | 'reordering' | 'wording' | 'theological_emphasis';
  texts: Record<string, string>;
  explanation: string;
}

/**
 * Normalize a diff annotation from either new `texts` map format or
 * legacy flat `matthew`/`luke`/`mark`/`john` fields.
 */
export function normalizeDiffAnnotation(raw: DiffAnnotationData | Record<string, unknown>): DiffAnnotationData {
  const r = raw as Record<string, unknown>;
  if (r.texts) return raw as DiffAnnotationData;
  const texts: Record<string, string> = {};
  for (const key of ['matthew', 'mark', 'luke', 'john']) {
    if (r[key]) texts[key] = r[key] as string;
  }
  return {
    location: r.location as string,
    diff_type: r.diff_type as DiffAnnotationData['diff_type'],
    texts,
    explanation: r.explanation as string,
  };
}

const DIFF_TYPE_LABELS: Record<string, string> = {
  addition: 'Addition',
  omission: 'Omission',
  reordering: 'Reordering',
  wording: 'Wording',
  theological_emphasis: 'Theological Emphasis',
};

const DIFF_TYPE_COLORS: Record<string, string> = {
  addition: '#4a8c5c', // data-color: intentional
  omission: '#8c4a4a', // data-color: intentional
  reordering: '#8a6e1a', // data-color: intentional
  wording: '#8a6e1a', // data-color: intentional
  theological_emphasis: '#8a6e1a', // data-color: intentional
};

const DIFF_TYPE_BG: Record<string, string> = {
  addition: '#4a8c5c22', // data-color: intentional
  omission: '#8c4a4a22', // data-color: intentional
  reordering: '#bfa05022', // data-color: intentional
  wording: '#bfa05022', // data-color: intentional
  theological_emphasis: '#bfa05022', // data-color: intentional
};

interface Props {
  annotation: DiffAnnotationData;
}

function DiffAnnotation({ annotation }: Props) {
  const { base } = useTheme();
  const [expanded, setExpanded] = useState(false);
  const color = DIFF_TYPE_COLORS[annotation.diff_type] ?? DIFF_TYPE_COLORS.wording;
  const bg = DIFF_TYPE_BG[annotation.diff_type] ?? DIFF_TYPE_BG.wording;
  const label = DIFF_TYPE_LABELS[annotation.diff_type] ?? annotation.diff_type;

  const normalized = normalizeDiffAnnotation(annotation);

  return (
    <TouchableOpacity
      onPress={() => setExpanded(!expanded)}
      activeOpacity={0.75}
      style={[styles.card, { backgroundColor: base.bgElevated, borderColor: base.border, borderLeftColor: color }]}
    >
      {/* Header row */}
      <View style={styles.header}>
        <View style={[styles.typeBadge, { backgroundColor: bg }]}>
          <Text style={[styles.typeText, { color }]}>{label}</Text>
        </View>
        <Text style={[styles.location, { color: base.textMuted }]} numberOfLines={expanded ? 0 : 1}>{annotation.location}</Text>
        <Text style={[styles.chevron, { color: base.textMuted }]}>{expanded ? '\u25b2' : '\u25bc'}</Text>
      </View>

      {/* Collapsed preview */}
      {!expanded && (
        <Text style={[styles.previewText, { color: base.textMuted }]} numberOfLines={1}>
          {annotation.explanation}
        </Text>
      )}

      {/* Expanded: comparison + explanation */}
      {expanded && (
        <View style={styles.expandedContent}>
          {Object.entries(normalized.texts).map(([bookId, text]) => {
            const bookColor = gospelColor(bookId);
            const shortLabel = GOSPEL_SHORT[bookId] ?? bookId.slice(0, 2).toUpperCase();
            return (
              <View key={bookId} style={styles.textRow}>
                <View style={[styles.textLabelBox, { backgroundColor: bookColor + '25' }]}>
                  <Text style={[styles.textLabel, { color: bookColor }]}>{shortLabel}</Text>
                </View>
                <Text style={[styles.textContent, { color: base.text }]}>{text}</Text>
              </View>
            );
          })}

          {/* Explanation */}
          <View style={[styles.explanationBox, { backgroundColor: base.gold + '08' }]}>
            <Text style={[styles.explanationText, { color: base.textDim }]}>{annotation.explanation}</Text>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
}

const MemoizedDiffAnnotation = React.memo(DiffAnnotation);
export { MemoizedDiffAnnotation as DiffAnnotation };
export default MemoizedDiffAnnotation;

interface ListProps {
  annotations: DiffAnnotationData[];
}

export function DiffAnnotationList({ annotations }: ListProps) {
  const { base } = useTheme();

  if (!annotations || annotations.length === 0) return null;

  return (
    <View style={styles.listContainer}>
      <Text style={[styles.listHeader, { color: base.gold }]}>Textual Differences</Text>
      {annotations.map((a, i) => (
        <DiffAnnotation key={i} annotation={normalizeDiffAnnotation(a)} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  listContainer: {
    paddingBottom: spacing.md,
  },
  listHeader: {
    fontFamily: fontFamily.displayMedium,
    fontSize: 13,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  card: {
    borderWidth: 1,
    borderLeftWidth: 3,
    borderRadius: radii.md,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  typeBadge: {
    paddingHorizontal: spacing.xs + 1,
    paddingVertical: 2,
    borderRadius: radii.sm,
    flexShrink: 0,
  },
  typeText: {
    fontFamily: fontFamily.uiSemiBold,
    fontSize: 9,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  location: {
    fontFamily: fontFamily.ui,
    fontSize: 11,
    flex: 1,
  },
  chevron: {
    fontSize: 9,
    fontFamily: fontFamily.ui,
  },
  previewText: {
    fontFamily: fontFamily.ui,
    fontSize: 12,
    fontStyle: 'italic',
  },
  expandedContent: {
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  textRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    alignItems: 'flex-start',
  },
  textLabelBox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 1,
  },
  textLabel: {
    fontFamily: fontFamily.uiSemiBold,
    fontSize: 9,
  },
  textContent: {
    fontFamily: fontFamily.body,
    fontSize: 13,
    lineHeight: 20,
    flex: 1,
  },
  explanationBox: {
    borderRadius: radii.sm,
    padding: spacing.sm,
    marginTop: spacing.xs,
  },
  explanationText: {
    fontFamily: fontFamily.ui,
    fontSize: 12,
    lineHeight: 19,
  },
});
