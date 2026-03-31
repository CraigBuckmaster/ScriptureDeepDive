/**
 * ManuscriptStoriesView — Renders manuscript variant stories for a chapter.
 *
 * Each story: title, passage badge, summary, evidence list, consensus, significance.
 * Used inside the composite TextualPanel when stories data is present.
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { getPanelColors, base, spacing, radii, fontFamily } from '../../theme';

export interface ManuscriptEvidence {
  manuscript: string;
  reading: string;
}

export interface ManuscriptStory {
  title: string;
  passage: string;
  summary: string;
  evidence: ManuscriptEvidence[];
  consensus: string;
  significance: string;
}

interface Props {
  stories: ManuscriptStory[];
}

function StoryCard({ story }: { story: ManuscriptStory }) {
  const [expanded, setExpanded] = useState(false);
  const colors = getPanelColors('tx');

  return (
    <View style={styles.card}>
      {/* Header */}
      <TouchableOpacity
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.7}
        style={styles.cardHeader}
      >
        <View style={styles.cardHeaderLeft}>
          <View style={styles.passageBadge}>
            <Text style={styles.passageText}>{story.passage}</Text>
          </View>
          <Text style={[styles.storyTitle, { color: colors.accent }]}>{story.title}</Text>
        </View>
        <Text style={styles.expandChevron}>{expanded ? '▲' : '▼'}</Text>
      </TouchableOpacity>

      {/* Summary always visible */}
      <Text style={styles.summary}>{story.summary}</Text>

      {/* Expanded: evidence + consensus + significance */}
      {expanded && (
        <View style={styles.expandedContent}>
          {/* Evidence table */}
          <Text style={styles.sectionLabel}>Manuscript Evidence</Text>
          <View style={styles.evidenceTable}>
            {story.evidence.map((ev, i) => (
              <View key={i} style={[styles.evidenceRow, i % 2 === 0 && styles.evidenceRowAlt]}>
                <Text style={styles.evidenceMs} numberOfLines={2}>{ev.manuscript}</Text>
                <Text style={styles.evidenceReading}>{ev.reading}</Text>
              </View>
            ))}
          </View>

          {/* Consensus */}
          <Text style={styles.sectionLabel}>Scholarly Consensus</Text>
          <Text style={styles.consensusText}>{story.consensus}</Text>

          {/* Significance */}
          <Text style={styles.sectionLabel}>Significance</Text>
          <Text style={styles.significanceText}>{story.significance}</Text>
        </View>
      )}
    </View>
  );
}

export function ManuscriptStoriesView({ stories }: Props) {
  if (!stories || stories.length === 0) return null;

  return (
    <View style={styles.container}>
      {stories.map((story, i) => (
        <StoryCard key={i} story={story} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  card: {
    backgroundColor: base.bgElevated,
    borderWidth: 1,
    borderColor: base.border,
    borderRadius: radii.lg,
    padding: spacing.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  cardHeaderLeft: {
    flex: 1,
    gap: spacing.xs,
  },
  passageBadge: {
    alignSelf: 'flex-start',
    backgroundColor: base.gold + '20',
    paddingHorizontal: spacing.xs + 2,
    paddingVertical: 2,
    borderRadius: radii.sm,
  },
  passageText: {
    color: base.gold,
    fontFamily: fontFamily.uiMedium,
    fontSize: 11,
  },
  storyTitle: {
    fontFamily: fontFamily.displayMedium,
    fontSize: 14,
    flexShrink: 1,
  },
  expandChevron: {
    color: base.textMuted,
    fontFamily: fontFamily.ui,
    fontSize: 10,
    marginTop: 2,
    marginLeft: spacing.xs,
  },
  summary: {
    color: base.textDim,
    fontFamily: fontFamily.body,
    fontSize: 13,
    lineHeight: 20,
    marginBottom: spacing.xs,
  },
  expandedContent: {
    borderTopWidth: 1,
    borderTopColor: base.borderLight,
    marginTop: spacing.xs,
    paddingTop: spacing.sm,
    gap: spacing.sm,
  },
  sectionLabel: {
    color: base.gold,
    fontFamily: fontFamily.uiSemiBold,
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 2,
  },
  evidenceTable: {
    borderRadius: radii.sm,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: base.borderLight,
  },
  evidenceRow: {
    flexDirection: 'row',
    padding: spacing.xs,
    gap: spacing.xs,
  },
  evidenceRowAlt: {
    backgroundColor: base.gold + '08',
  },
  evidenceMs: {
    color: base.text,
    fontFamily: fontFamily.uiMedium,
    fontSize: 11,
    flex: 1,
    flexShrink: 1,
  },
  evidenceReading: {
    color: base.textDim,
    fontFamily: fontFamily.ui,
    fontSize: 11,
    flex: 1,
    flexShrink: 1,
  },
  consensusText: {
    color: base.textDim,
    fontFamily: fontFamily.body,
    fontSize: 13,
    lineHeight: 20,
  },
  significanceText: {
    color: base.textDim,
    fontFamily: fontFamily.bodyItalic,
    fontSize: 13,
    lineHeight: 20,
  },
});
