/**
 * ChapterHeader — Title, subtitle, and inline badge pills.
 *
 * Compact layout: title on its own line, subtitle + tappable pills
 * (timeline, map, notes, story context) flow together on the next line.
 * "About This Book" moved to ⓘ icon in ChapterNavBar.
 *
 * Card #1362 (UI polish phase 5): pill TouchableOpacities now carry a
 * hitSlop for a larger effective touch target without changing the
 * BadgeChip visuals (which are shared with other screens).
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme, spacing, fontFamily, panels, testament } from '../theme';
import type { Chapter } from '../types';
import { BadgeChip } from './BadgeChip';

interface Props {
  chapter: Chapter;
  noteCount: number;
  onNotesPress: () => void;
  onTimelinePress?: () => void;
  onMapPress?: () => void;
  onStoryPress?: () => void;
  storyActName?: string | null;
}

/** Shared hitSlop for header pills — effectively grows touch area to ~44px. */
const PILL_HIT_SLOP = { top: 8, bottom: 8, left: 6, right: 6 };

export function ChapterHeader({
  chapter, noteCount, onNotesPress,
  onTimelinePress, onMapPress,
  onStoryPress, storyActName,
}: Props) {
  const { base } = useTheme();
  const hasContextPills = !!(
    chapter.timeline_link_text || chapter.map_story_link_text ||
    noteCount > 0 || storyActName
  );

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
            <TouchableOpacity onPress={onTimelinePress} hitSlop={PILL_HIT_SLOP}>
              <BadgeChip label={chapter.timeline_link_text} color={panels.hist.accent} />
            </TouchableOpacity>
          )}

          {chapter.map_story_link_text && onMapPress && (
            <TouchableOpacity onPress={onMapPress} hitSlop={PILL_HIT_SLOP}>
              <BadgeChip label={chapter.map_story_link_text} color={panels.poi.accent} />
            </TouchableOpacity>
          )}

          {storyActName && onStoryPress && (
            <TouchableOpacity onPress={onStoryPress} hitSlop={PILL_HIT_SLOP}>
              <BadgeChip label={storyActName} color={testament.ot} />
            </TouchableOpacity>
          )}

          {noteCount > 0 && (
            <TouchableOpacity
              onPress={onNotesPress}
              hitSlop={PILL_HIT_SLOP}
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
