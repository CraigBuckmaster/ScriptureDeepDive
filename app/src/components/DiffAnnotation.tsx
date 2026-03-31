/**
 * DiffAnnotation — Expandable card showing a textual difference between
 * parallel Gospel or OT accounts.
 *
 * diff_type drives the badge color:
 *   addition        → green
 *   omission        → red/dim
 *   reordering      → gold
 *   wording         → gold
 *   theological_emphasis → gold
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { base, spacing, radii, fontFamily } from '../theme';

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
  addition: '#4a8c5c',      // muted green
  omission: '#8c4a4a',      // muted red
  reordering: '#8a6e1a',    // goldDim
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

interface Props {
  annotation: DiffAnnotationData;
}

export function DiffAnnotation({ annotation }: Props) {
  const [expanded, setExpanded] = useState(false);
  const color = DIFF_TYPE_COLORS[annotation.diff_type] ?? DIFF_TYPE_COLORS.wording;
  const bg = DIFF_TYPE_BG[annotation.diff_type] ?? DIFF_TYPE_BG.wording;
  const label = DIFF_TYPE_LABELS[annotation.diff_type] ?? annotation.diff_type;

  return (
    <TouchableOpacity
      onPress={() => setExpanded(!expanded)}
      activeOpacity={0.75}
      style={[styles.card, { borderLeftColor: color }]}
    >
      {/* Header row */}
      <View style={styles.header}>
        <View style={[styles.typeBadge, { backgroundColor: bg }]}>
          <Text style={[styles.typeText, { color }]}>{label}</Text>
        </View>
        <Text style={styles.location} numberOfLines={expanded ? 0 : 1}>{annotation.location}</Text>
        <Text style={styles.chevron}>{expanded ? '▲' : '▼'}</Text>
      </View>

      {/* Collapsed preview */}
      {!expanded && (
        <Text style={styles.previewText} numberOfLines={1}>
          {annotation.explanation}
        </Text>
      )}

      {/* Expanded: comparison + explanation */}
      {expanded && (
        <View style={styles.expandedContent}>
          {/* Side A */}
          <View style={styles.textRow}>
            <View style={styles.textLabelBox}>
              <Text style={styles.textLabel}>A</Text>
            </View>
            <Text style={styles.textContent}>{annotation.matthew}</Text>
          </View>

          {/* Side B */}
          <View style={styles.textRow}>
            <View style={[styles.textLabelBox, styles.textLabelBoxB]}>
              <Text style={styles.textLabel}>B</Text>
            </View>
            <Text style={styles.textContent}>{annotation.luke}</Text>
          </View>

          {/* Explanation */}
          <View style={styles.explanationBox}>
            <Text style={styles.explanationText}>{annotation.explanation}</Text>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
}

interface ListProps {
  annotations: DiffAnnotationData[];
}

export function DiffAnnotationList({ annotations }: ListProps) {
  if (!annotations || annotations.length === 0) return null;

  return (
    <View style={styles.listContainer}>
      <Text style={styles.listHeader}>Textual Differences</Text>
      {annotations.map((a, i) => (
        <DiffAnnotation key={i} annotation={a} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  listContainer: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  listHeader: {
    color: base.gold,
    fontFamily: fontFamily.displayMedium,
    fontSize: 13,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  card: {
    backgroundColor: base.bgElevated,
    borderWidth: 1,
    borderColor: base.border,
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
    color: base.textMuted,
    fontFamily: fontFamily.ui,
    fontSize: 11,
    flex: 1,
  },
  chevron: {
    color: base.textMuted,
    fontSize: 9,
    fontFamily: fontFamily.ui,
  },
  previewText: {
    color: base.textMuted,
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
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: base.gold + '25',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 1,
  },
  textLabelBoxB: {
    backgroundColor: base.textMuted + '25',
  },
  textLabel: {
    color: base.gold,
    fontFamily: fontFamily.uiSemiBold,
    fontSize: 10,
  },
  textContent: {
    color: base.text,
    fontFamily: fontFamily.body,
    fontSize: 13,
    lineHeight: 20,
    flex: 1,
  },
  explanationBox: {
    backgroundColor: base.gold + '08',
    borderRadius: radii.sm,
    padding: spacing.sm,
    marginTop: spacing.xs,
  },
  explanationText: {
    color: base.textDim,
    fontFamily: fontFamily.ui,
    fontSize: 12,
    lineHeight: 19,
  },
});
