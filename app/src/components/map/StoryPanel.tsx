/**
 * StoryPanel — Story detail content for bottom sheet / sidebar.
 * Era badge, name, ref, summary, place chips, chapter link.
 */

import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { X } from 'lucide-react-native';
import { BadgeChip } from '../BadgeChip';
import { base, spacing, radii, eras, eraNames, fontFamily, MIN_TOUCH_TARGET } from '../../theme';
import type { MapStory, Place } from '../../types';

interface Props {
  story: MapStory;
  places: Place[];
  showModern: boolean;
  onPlaceTap: (placeId: string) => void;
  onChapterPress: () => void;
  onClose: () => void;
}

export function StoryPanel({ story, places, showModern, onPlaceTap, onChapterPress, onClose }: Props) {
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
      {/* Close button */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <BadgeChip label={eraLabel} color={eraColor} />
        <TouchableOpacity
          onPress={onClose}
          style={{ minWidth: MIN_TOUCH_TARGET, minHeight: MIN_TOUCH_TARGET, justifyContent: 'center', alignItems: 'center' }}
          accessibilityLabel="Close panel"
          accessibilityRole="button"
        >
          <X size={18} color={base.textMuted} />
        </TouchableOpacity>
      </View>

      {/* Name */}
      <Text style={{
        color: base.text, fontFamily: fontFamily.displaySemiBold,
        fontSize: 18, marginTop: spacing.sm,
      }}>
        {story.name}
      </Text>

      {/* Scripture ref */}
      {story.scripture_ref && (
        <Text style={{
          color: base.gold, fontFamily: fontFamily.bodyMedium,
          fontSize: 14, marginTop: 4,
        }}>
          {story.scripture_ref}
        </Text>
      )}

      <View style={{ height: 1, backgroundColor: base.border, marginVertical: spacing.md }} />

      {/* Summary */}
      <Text style={{
        color: base.textDim, fontFamily: fontFamily.body,
        fontSize: 14, lineHeight: 22,
      }}>
        {story.summary}
      </Text>

      {/* Key Places */}
      {storyPlaces.length > 0 && (
        <View style={{ marginTop: spacing.md }}>
          <Text style={{
            color: base.textMuted, fontFamily: fontFamily.display,
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
                    color: eraColor, fontFamily: fontFamily.uiMedium, fontSize: 12,
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
            color: base.gold, fontFamily: fontFamily.uiSemiBold, fontSize: 13,
          }}>
            Read in Scripture Deep Dive →
          </Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}
