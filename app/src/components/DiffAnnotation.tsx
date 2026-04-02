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
 * When passageLabels are provided, the "A"/"B" labels are replaced with
 * actual Gospel names derived from the annotation's location field.
 */

import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme, spacing, radii, fontFamily } from '../theme';

export interface DiffAnnotationData {
  location: string;
  diff_type: 'addition' | 'omission' | 'reordering' | 'wording' | 'theological_emphasis';
  matthew: string;
  luke: string;
  explanation: string;
}

const DIFF_TYPE_LABELS: Record<string, string> = {
  addition: 'Addition',
  omission: 'Omission',
  reordering: 'Reordering',
  wording: 'Wording',
  theological_emphasis: 'Theological Emphasis',
};

const DIFF_TYPE_COLORS: Record<string, string> = {
  addition: '#4a8c5c',
  omission: '#8c4a4a',
  reordering: '#8a6e1a',
  wording: '#8a6e1a',
  theological_emphasis: '#8a6e1a',
};

const DIFF_TYPE_BG: Record<string, string> = {
  addition: '#4a8c5c22',
  omission: '#8c4a4a22',
  reordering: '#bfa05022',
  wording: '#bfa05022',
  theological_emphasis: '#bfa05022',
};

/** Gospel name -> color lookup for label circles. */
const LABEL_COLORS: Record<string, string> = {
  Matthew: '#70b8e8',
  Mark: '#e86040',
  Luke: '#81C784',
  John: '#b090d0',
};

interface Props {
  annotation: DiffAnnotationData;
  labelA?: string;
  labelB?: string;
}

/** Extract Gospel names from a location string like "Matthew 3:13-17 / Luke 3:21-22". */
function extractLabelsFromLocation(location: string): [string | null, string | null] {
  const parts = location.split('/').map(s => s.trim());
  const extractName = (s: string) => {
    const m = s.match(/^(\d?\s*[A-Za-z]+)/);
    return m ? m[1].trim() : null;
  };
  return [extractName(parts[0] ?? ''), extractName(parts[1] ?? '')];
}

export function DiffAnnotation({ annotation, labelA, labelB }: Props) {
  const { base } = useTheme();
  const [expanded, setExpanded] = useState(false);
  const color = DIFF_TYPE_COLORS[annotation.diff_type] ?? DIFF_TYPE_COLORS.wording;
  const bg = DIFF_TYPE_BG[annotation.diff_type] ?? DIFF_TYPE_BG.wording;
  const label = DIFF_TYPE_LABELS[annotation.diff_type] ?? annotation.diff_type;

  // Resolve labels: explicit props > location parsing > fallback A/B
  const [locA, locB] = useMemo(() => extractLabelsFromLocation(annotation.location), [annotation.location]);
  const displayA = labelA ?? locA ?? 'A';
  const displayB = labelB ?? locB ?? 'B';
  const colorA = LABEL_COLORS[displayA] ?? base.gold;
  const colorB = LABEL_COLORS[displayB] ?? base.gold;

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
          {/* Side A */}
          <View style={styles.textRow}>
            <View style={[styles.textLabelBox, { backgroundColor: colorA + '25' }]}>
              <Text style={[styles.textLabel, { color: colorA }]}>{displayA.slice(0, 2)}</Text>
            </View>
            <Text style={[styles.textContent, { color: base.text }]}>{annotation.matthew}</Text>
          </View>

          {/* Side B */}
          <View style={styles.textRow}>
            <View style={[styles.textLabelBox, { backgroundColor: colorB + '25' }]}>
              <Text style={[styles.textLabel, { color: colorB }]}>{displayB.slice(0, 2)}</Text>
            </View>
            <Text style={[styles.textContent, { color: base.text }]}>{annotation.luke}</Text>
          </View>

          {/* Explanation */}
          <View style={[styles.explanationBox, { backgroundColor: base.gold + '08' }]}>
            <Text style={[styles.explanationText, { color: base.textDim }]}>{annotation.explanation}</Text>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
}

interface ListProps {
  annotations: DiffAnnotationData[];
  /** Map of book ID -> Gospel display name. Used to resolve A/B labels. */
  passageLabels?: Map<string, string>;
}

export function DiffAnnotationList({ annotations, passageLabels }: ListProps) {
  const { base } = useTheme();

  if (!annotations || annotations.length === 0) return null;

  // Try to derive A/B labels from passage labels if available
  const labelEntries = passageLabels ? Array.from(passageLabels.values()) : [];
  const defaultA = labelEntries[0];
  const defaultB = labelEntries[1];

  return (
    <View style={styles.listContainer}>
      <Text style={[styles.listHeader, { color: base.gold }]}>Textual Differences</Text>
      {annotations.map((a, i) => (
        <DiffAnnotation
          key={i}
          annotation={a}
          labelA={defaultA}
          labelB={defaultB}
        />
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
