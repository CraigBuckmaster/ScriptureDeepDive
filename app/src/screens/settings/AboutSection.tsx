import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { BaseColors } from '../../theme/palettes';
import type { ContentStats } from '../../db/content';
import { spacing, fontFamily } from '../../theme';
import { SectionLabel } from './SectionLabel';
import { sharedStyles } from './styles';

function formatStat(count: number, singular: string, plural?: string): string {
  const label = count === 1 ? singular : (plural ?? `${singular}s`);
  return `${count} ${label}`;
}

interface AboutSectionProps {
  base: BaseColors;
  paragraphs: string[];
  stats: ContentStats | null;
  version: string;
}

export function AboutSection({ base, paragraphs, stats, version }: AboutSectionProps) {
  return (
    <View style={sharedStyles.section}>
      <SectionLabel text="ABOUT" base={base} />

      {paragraphs.map((para, idx) => (
        <Text
          key={idx}
          style={[
            localStyles.aboutText,
            { color: base.textDim },
            idx < paragraphs.length - 1 && localStyles.aboutParagraphGap,
          ]}
        >
          {para}
        </Text>
      ))}

      {/* Stats strip */}
      {stats && (
        <Text style={[localStyles.statsStrip, { color: base.textMuted }]}>
          {formatStat(stats.liveBooks, 'Book')}
          {'  \u00B7  '}
          {formatStat(stats.liveChapters, 'Chapter')}
          {'  \u00B7  '}
          {formatStat(stats.scholarCount, 'Scholar')}
          {'  \u00B7  '}
          {formatStat(stats.peopleCount, 'Person', 'People')}
        </Text>
      )}

      <Text style={[localStyles.version, { color: base.textMuted }]}>Version {version}</Text>

      <Text style={[localStyles.disclaimerText, { color: base.textMuted }]}>
        Scholar commentary panels present paraphrased summaries of positions found in published works and are not direct quotations. For exact wording, consult the original sources cited.
      </Text>
    </View>
  );
}

const localStyles = StyleSheet.create({
  aboutText: {
    fontFamily: fontFamily.body,
    fontSize: 14,
    lineHeight: 22,
  },
  aboutParagraphGap: {
    marginBottom: spacing.md,
  },
  statsStrip: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 12,
    marginTop: spacing.lg,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  version: {
    fontFamily: fontFamily.ui,
    fontSize: 11,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  disclaimerText: {
    fontFamily: fontFamily.ui,
    fontSize: 10,
    lineHeight: 15,
    marginTop: spacing.lg,
    textAlign: 'center',
    opacity: 0.7,
  },
});
