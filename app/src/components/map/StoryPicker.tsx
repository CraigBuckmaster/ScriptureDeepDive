/**
 * StoryPicker — Horizontal scrollable strip of story buttons.
 */

import React from 'react';
import { ScrollView, Text, TouchableOpacity } from 'react-native';
import { base, spacing, radii, eras, MIN_TOUCH_TARGET } from '../../theme';
import type { MapStory } from '../../types';

interface Props {
  stories: MapStory[];
  activeStoryId: string | null;
  onSelect: (storyId: string) => void;
}

export function StoryPicker({ stories, activeStoryId, onSelect }: Props) {
  if (stories.length === 0) {
    return (
      <Text style={{
        color: base.textMuted, fontSize: 12, fontFamily: 'SourceSans3_400Regular',
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
      contentContainerStyle={{ paddingHorizontal: spacing.md, gap: spacing.xs, paddingVertical: spacing.xs }}
    >
      {stories.map((story) => {
        const isActive = activeStoryId === story.id;
        const color = eras[story.era] ?? base.gold;
        return (
          <TouchableOpacity
            key={story.id}
            onPress={() => onSelect(story.id)}
            style={{
              backgroundColor: isActive ? color + '33' : 'transparent',
              borderWidth: 1,
              borderColor: isActive ? color : base.border,
              borderRadius: radii.sm,
              paddingHorizontal: 10,
              minHeight: MIN_TOUCH_TARGET,
              justifyContent: 'center',
            }}
          >
            <Text style={{
              color: isActive ? color : base.textDim,
              fontFamily: 'Cinzel_400Regular', fontSize: 10, letterSpacing: 0.3,
            }}>
              {story.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}
