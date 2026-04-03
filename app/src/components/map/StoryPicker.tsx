/**
 * StoryPicker — Horizontal scrollable strip of story buttons.
 */

import React from 'react';
import { ScrollView, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme, spacing, radii, eras, fontFamily } from '../../theme';
import { lightImpact } from '../../utils/haptics';
import type { MapStory } from '../../types';

interface Props {
  stories: MapStory[];
  activeStoryId: string | null;
  onSelect: (storyId: string) => void;
}

const CHIP_HEIGHT = 32;

export function StoryPicker({ stories, activeStoryId, onSelect }: Props) {
  const { base } = useTheme();
  if (stories.length === 0) {
    return (
      <Text style={[styles.emptyText, { color: base.textMuted }]}>
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
            onPress={() => { lightImpact(); onSelect(story.id); }}
            hitSlop={{ top: 6, bottom: 6, left: 2, right: 2 }}
            accessibilityRole="button"
            accessibilityLabel={`${isActive ? 'Selected story: ' : 'Select story: '}${story.name}`}
            style={[styles.storyChip, {
              backgroundColor: isActive ? color + '33' : base.bg + 'EE',
              borderColor: isActive ? color : base.gold + '55',
            }]}
          >
            <Text style={[styles.storyChipText, { color: isActive ? color : base.gold }]}>
              {story.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  emptyText: {
    fontSize: 12,
    fontFamily: fontFamily.ui,
    textAlign: 'center',
    paddingVertical: spacing.xs,
  },
  storyChip: {
    borderWidth: 1,
    borderRadius: radii.sm,
    paddingHorizontal: 8,
    height: CHIP_HEIGHT,
    justifyContent: 'center',
  },
  storyChipText: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 10,
    letterSpacing: 0.3,
  },
});
