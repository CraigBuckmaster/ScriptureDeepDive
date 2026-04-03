/**
 * ChapterHeader — Title, subtitle, and inline badge pills.
 *
 * Compact layout: title on its own line, subtitle + tappable pills
 * (timeline, map, notes) flow together on the next line.
 * "About This Book" moved to ⓘ icon in ChapterNavBar.
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { BadgeChip } from './BadgeChip';
import { useTheme, spacing, fontFamily } from '../theme';
import type { Chapter } from '../types';

interface Props {
  chapter: Chapter;
  noteCount: number;
  onNotesPress: () => void;
  onTimelinePress?: () => void;
  onMapPress?: () => void;
}

export function ChapterHeader({
  chapter, noteCount, onNotesPress,
  onTimelinePress, onMapPress,
}: Props) {
  const { base } = useTheme();
  const hasContextPills = !!(chapter.timeline_link_text || chapter.map_story_link_text || noteCount > 0);

  return (
    <View style={styles.container}>
      {/* Title */}
      <Text style={[styles.title, { color: base.text }]} accessibilityRole="header">
        {chapter.title || `Chapter ${chapter.chapter_num}`}
      </Text>

      {/* Subtitle + inline pills */}
      {(chapter.subtitle || hasContextPills) && (
        <View style={styles.subtitleRow}>
          {chapter.subtitle ? (
            <Text style={[styles.subtitle, { color: base.textDim }]}>{chapter.subtitle}</Text>
          ) : null}

          {chapter.timeline_link_text && onTimelinePress && (
            <TouchableOpacity onPress={onTimelinePress}>
              <BadgeChip label={chapter.timeline_link_text} color="#70b8e8" />
            </TouchableOpacity>
          )}

          {chapter.map_story_link_text && onMapPress && (
            <TouchableOpacity onPress={onMapPress}>
              <BadgeChip label={chapter.map_story_link_text} color="#30a848" />
            </TouchableOpacity>
          )}

          {noteCount > 0 && (
            <TouchableOpacity
              onPress={onNotesPress}
              accessibilityLabel={`${noteCount} notes`}
              accessibilityRole="button"
            >
              <BadgeChip label={`${noteCount} Notes`} color={base.gold} />
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  title: {
    fontFamily: fontFamily.displaySemiBold,
    fontSize: 22,
    lineHeight: 30,
    letterSpacing: 0.5,
  },
  subtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 2,
    marginTop: 6,
    flexWrap: 'wrap',
  },
  subtitle: {
    fontFamily: fontFamily.bodyItalic,
    fontSize: 14,
    marginRight: 2,
  },
});
