/**
 * StoryPanel — Story detail content for bottom sheet / sidebar.
 * Era badge, name, ref, summary, place chips, chapter link.
 */

import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { BadgeChip } from '../BadgeChip';
import { base, spacing, radii, eras, eraNames } from '../../theme';
import type { MapStory, Place } from '../../types';

interface Props {
  story: MapStory;
  places: Place[];
  showModern: boolean;
  onPlaceTap: (placeId: string) => void;
  onChapterPress: () => void;
}

export function StoryPanel({ story, places, showModern, onPlaceTap, onChapterPress }: Props) {
  const eraColor = eras[story.era] ?? base.gold;
  const eraLabel = eraNames[story.era] ?? story.era;

  const storyPlaces = useMemo(() => {
    try {
      const ids: string[] = JSON.parse(story.places_json ?? '[]');
      return ids.map((id) => places.find((p) => p.id === id)).filter(Boolean) as Place[];
    } catch { return []; }
  }, [story.places_json, places]);

  return (
    <ScrollView contentContainerStyle={{ padding: spacing.md }}>
      {/* Era badge */}
      <BadgeChip label={eraLabel} color={eraColor} />

      {/* Name */}
      <Text style={{
        color: base.text, fontFamily: 'Cinzel_600SemiBold',
        fontSize: 18, marginTop: spacing.sm,
      }}>
        {story.name}
      </Text>

      {/* Scripture ref */}
      {story.scripture_ref && (
        <Text style={{
          color: base.gold, fontFamily: 'EBGaramond_500Medium',
          fontSize: 14, marginTop: 4,
        }}>
          {story.scripture_ref}
        </Text>
      )}

      <View style={{ height: 1, backgroundColor: base.border, marginVertical: spacing.md }} />

      {/* Summary */}
      <Text style={{
        color: base.textDim, fontFamily: 'EBGaramond_400Regular',
        fontSize: 14, lineHeight: 22,
      }}>
        {story.summary}
      </Text>

      {/* Key Places */}
      {storyPlaces.length > 0 && (
        <View style={{ marginTop: spacing.md }}>
          <Text style={{
            color: base.textMuted, fontFamily: 'Cinzel_400Regular',
            fontSize: 10, letterSpacing: 0.5, marginBottom: spacing.xs,
          }}>
            KEY PLACES
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
            {storyPlaces.map((p) => (
              <TouchableOpacity key={p.id} onPress={() => onPlaceTap(p.id)}>
                <View style={{
                  backgroundColor: eraColor + '1A', borderWidth: 1,
                  borderColor: eraColor + '40', borderRadius: radii.pill,
                  paddingHorizontal: 10, paddingVertical: 3,
                }}>
                  <Text style={{
                    color: eraColor, fontFamily: 'SourceSans3_500Medium', fontSize: 12,
                  }}>
                    {showModern && p.modern_name ? p.modern_name : p.ancient_name}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Chapter link */}
      {story.chapter_link && (
        <TouchableOpacity onPress={onChapterPress} style={{ marginTop: spacing.md }}>
          <Text style={{
            color: base.gold, fontFamily: 'SourceSans3_600SemiBold', fontSize: 13,
          }}>
            Read in Scripture Deep Dive →
          </Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}
