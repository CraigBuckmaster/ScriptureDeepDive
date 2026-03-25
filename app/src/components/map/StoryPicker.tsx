/**
 * StoryPicker — Horizontal scrollable strip of story buttons.
 */

import React from 'react';
import { ScrollView, Text, TouchableOpacity } from 'react-native';
import { base, spacing, radii, eras, fontFamily } from '../../theme';
import type { MapStory } from '../../types';

interface Props {
  stories: MapStory[];
  activeStoryId: string | null;
  onSelect: (storyId: string) => void;
}

const CHIP_HEIGHT = 32;

export function StoryPicker({ stories, activeStoryId, onSelect }: Props) {
  if (stories.length === 0) {
    return (
      <Text style={{
        color: base.textMuted, fontSize: 12, fontFamily: fontFamily.ui,
        textAlign: 'center', paddingVertical: spacing.xs,
      }}>
        No stories for this era
      </Text>
    );
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: spacing.sm, gap: spacing.xs, paddingVertical: spacing.xs }}
    >
      {stories.map((story) => {
        const isActive = activeStoryId === story.id;
        const color = eras[story.era] ?? base.gold;
        return (
          <TouchableOpacity
            key={story.id}
            onPress={() => onSelect(story.id)}
            hitSlop={{ top: 6, bottom: 6, left: 2, right: 2 }}
            style={{
              backgroundColor: isActive ? color + '33' : 'transparent',
              borderWidth: 1,
              borderColor: isActive ? color : base.border,
              borderRadius: radii.sm,
              paddingHorizontal: 8,
              height: CHIP_HEIGHT,
              justifyContent: 'center',
            }}
          >
            <Text style={{
              color: isActive ? color : base.textDim,
              fontFamily: fontFamily.display, fontSize: 10, letterSpacing: 0.3,
            }}>
              {story.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}
