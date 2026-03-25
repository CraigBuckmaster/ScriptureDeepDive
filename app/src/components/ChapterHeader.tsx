/**
 * ChapterHeader — Title, subtitle, action bar, deep-links, thread badges.
 */

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { StickyNote, Clock, MapPin, ArrowRight } from 'lucide-react-native';
import { BadgeChip } from './BadgeChip';
import { base, spacing, fontFamily } from '../theme';
import type { Chapter } from '../types';

interface Props {
  chapter: Chapter;
  noteCount: number;
  onNotesPress: () => void;
  onIntroPress: () => void;
  onTimelinePress?: () => void;
  onMapPress?: () => void;
}

export function ChapterHeader({
  chapter, noteCount, onNotesPress, onIntroPress,
  onTimelinePress, onMapPress,
}: Props) {
  return (
    <View style={{ paddingHorizontal: spacing.md, paddingTop: spacing.lg, paddingBottom: spacing.md }}>
      {/* Title */}
      <Text style={{
        color: base.text, fontFamily: fontFamily.displaySemiBold,
        fontSize: 22, lineHeight: 30, letterSpacing: 0.5,
      }} accessibilityRole="header">
        {chapter.title || `Chapter ${chapter.chapter_num}`}
      </Text>

      {/* Subtitle */}
      {chapter.subtitle ? (
        <Text style={{
          color: base.textDim, fontFamily: fontFamily.bodyItalic,
          fontSize: 15, marginTop: 4,
        }}>
          {chapter.subtitle}
        </Text>
      ) : null}

      {/* Action bar */}
      <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md, flexWrap: 'wrap' }}>
        <TouchableOpacity
          onPress={onNotesPress}
          accessibilityLabel={noteCount > 0 ? `${noteCount} notes` : 'Notes'}
          accessibilityRole="button"
        >
          <BadgeChip
            label={noteCount > 0 ? `${noteCount} Notes` : 'Notes'}
            icon={<StickyNote size={12} color={noteCount > 0 ? base.gold : base.textMuted} />}
            color={noteCount > 0 ? base.gold : base.textMuted}
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onIntroPress}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
          accessibilityLabel="About this book"
          accessibilityRole="button"
        >
          <Text style={{
            color: base.textMuted,
            fontFamily: fontFamily.uiMedium,
            fontSize: 12,
          }}>
            About This Book
          </Text>
          <ArrowRight size={12} color={base.textMuted} />
        </TouchableOpacity>
      </View>

      {/* Deep-links */}
      {(chapter.timeline_link_event || chapter.map_story_link_id) && (
        <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm, flexWrap: 'wrap' }}>
          {chapter.timeline_link_text && onTimelinePress && (
            <TouchableOpacity onPress={onTimelinePress}>
              <BadgeChip
                label={chapter.timeline_link_text}
                icon={<Clock size={12} color="#70b8e8" />}
                color="#70b8e8"
              />
            </TouchableOpacity>
          )}
          {chapter.map_story_link_text && onMapPress && (
            <TouchableOpacity onPress={onMapPress}>
              <BadgeChip
                label={chapter.map_story_link_text}
                icon={<MapPin size={12} color="#30a848" />}
                color="#30a848"
              />
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}
