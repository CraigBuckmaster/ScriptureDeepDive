/**
 * ManuscriptStoriesView — Renders manuscript variant stories for a chapter.
 *
 * Each story: title, passage badge, summary, evidence list, consensus, significance.
 * Used inside the composite TextualPanel when stories data is present.
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme, spacing, radii, fontFamily } from '../../theme';

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
  const { base, getPanelColors } = useTheme();
  const [expanded, setExpanded] = useState(false);
  const colors = getPanelColors('tx');

  return (
    <View style={[styles.card, { backgroundColor: base.bgElevated, borderColor: base.border }]}>
      {/* Header */}
      <TouchableOpacity
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.7}
        style={styles.cardHeader}
      >
        <View style={styles.cardHeaderLeft}>
          <View style={[styles.passageBadge, { backgroundColor: base.gold + '20' }]}>
            <Text style={[styles.passageText, { color: base.gold }]}>{story.passage}</Text>
          </View>
          <Text style={[styles.storyTitle, { color: colors.accent }]}>{story.title}</Text>
        </View>
        <Text style={[styles.expandChevron, { color: base.textMuted }]}>{expanded ? '▲' : '▼'}</Text>
      </TouchableOpacity>

      {/* Summary always visible */}
      <Text style={[styles.summary, { color: base.textDim }]}>{story.summary}</Text>

      {/* Expanded: evidence + consensus + significance */}
      {expanded && (
        <View style={[styles.expandedContent, { borderTopColor: base.borderLight }]}>
          {/* Evidence table */}
          <Text style={[styles.sectionLabel, { color: base.gold }]}>Manuscript Evidence</Text>
          <View style={[styles.evidenceTable, { borderColor: base.borderLight }]}>
            {story.evidence.map((ev, i) => (
              <View key={i} style={[styles.evidenceRow, i % 2 === 0 && { backgroundColor: base.gold + '08' }]}>
                <Text style={[styles.evidenceMs, { color: base.text }]} numberOfLines={2}>{ev.manuscript}</Text>
                <Text style={[styles.evidenceReading, { color: base.textDim }]}>{ev.reading}</Text>
              </View>
            ))}
          </View>

          {/* Consensus */}
          <Text style={[styles.sectionLabel, { color: base.gold }]}>Scholarly Consensus</Text>
          <Text style={[styles.consensusText, { color: base.textDim }]}>{story.consensus}</Text>

          {/* Significance */}
          <Text style={[styles.sectionLabel, { color: base.gold }]}>Significance</Text>
          <Text style={[styles.significanceText, { color: base.textDim }]}>{story.significance}</Text>
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
    borderWidth: 1,
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
    paddingHorizontal: spacing.xs + 2,
    paddingVertical: 2,
    borderRadius: radii.sm,
  },
  passageText: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 11,
  },
  storyTitle: {
    fontFamily: fontFamily.displayMedium,
    fontSize: 14,
    flexShrink: 1,
  },
  expandChevron: {
    fontFamily: fontFamily.ui,
    fontSize: 10,
    marginTop: 2,
    marginLeft: spacing.xs,
  },
  summary: {
    fontFamily: fontFamily.body,
    fontSize: 13,
    lineHeight: 20,
    marginBottom: spacing.xs,
  },
  expandedContent: {
    borderTopWidth: 1,
    marginTop: spacing.xs,
    paddingTop: spacing.sm,
    gap: spacing.sm,
  },
  sectionLabel: {
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
  },
  evidenceRow: {
    flexDirection: 'row',
    padding: spacing.xs,
    gap: spacing.xs,
  },
  evidenceMs: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 11,
    flex: 1,
    flexShrink: 1,
  },
  evidenceReading: {
    fontFamily: fontFamily.ui,
    fontSize: 11,
    flex: 1,
    flexShrink: 1,
  },
  consensusText: {
    fontFamily: fontFamily.body,
    fontSize: 13,
    lineHeight: 20,
  },
  significanceText: {
    fontFamily: fontFamily.bodyItalic,
    fontSize: 13,
    lineHeight: 20,
  },
});
