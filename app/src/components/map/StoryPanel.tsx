/**
 * StoryPanel — Story detail content for bottom sheet / sidebar.
 * Era badge, name, ref, summary, place chips, chapter link.
 */

import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { X } from 'lucide-react-native';
import { BadgeChip } from '../BadgeChip';
import { useTheme, spacing, radii, eras, eraNames, fontFamily, MIN_TOUCH_TARGET } from '../../theme';
import type { MapStory, Place } from '../../types';
import { parseJSON } from '../../utils/parseJSON';

interface Props {
  story: MapStory;
  places: Place[];
  showModern: boolean;
  onPlaceTap: (placeId: string) => void;
  onChapterPress: () => void;
  onClose: () => void;
}

export function StoryPanel({ story, places, showModern, onPlaceTap, onChapterPress, onClose }: Props) {
  const { base } = useTheme();
  const eraColor = eras[story.era] ?? base.gold;
  const eraLabel = eraNames[story.era] ?? story.era;

  const storyPlaces = useMemo(() => {
    const ids = parseJSON<string[]>(story.places_json, []);
    return ids.map((id) => places.find((p) => p.id === id)).filter(Boolean) as Place[];
  }, [story.places_json, places]);

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      {/* Close button */}
      <View style={styles.topRow}>
        <BadgeChip label={eraLabel} color={eraColor} />
        <TouchableOpacity
          onPress={onClose}
          style={styles.closeBtn}
          accessibilityLabel="Close panel"
          accessibilityRole="button"
        >
          <X size={18} color={base.textMuted} />
        </TouchableOpacity>
      </View>

      {/* Name */}
      <Text style={[styles.name, { color: base.text }]}>
        {story.name}
      </Text>

      {/* Scripture ref */}
      {story.scripture_ref && (
        <Text style={[styles.ref, { color: base.gold }]}>
          {story.scripture_ref}
        </Text>
      )}

      <View style={[styles.divider, { backgroundColor: base.border }]} />

      {/* Summary */}
      <Text style={[styles.summary, { color: base.textDim }]}>
        {story.summary}
      </Text>

      {/* Key Places */}
      {storyPlaces.length > 0 && (
        <View style={styles.placesSection}>
          <Text style={[styles.placesLabel, { color: base.textMuted }]}>
            KEY PLACES
          </Text>
          <View style={styles.placesRow}>
            {storyPlaces.map((p) => (
              <TouchableOpacity key={p.id} onPress={() => onPlaceTap(p.id)}>
                <View style={[styles.placeChip, {
                  backgroundColor: eraColor + '1A', borderColor: eraColor + '40',
                }]}>
                  <Text style={[styles.placeText, { color: eraColor }]}>
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
        <TouchableOpacity onPress={onChapterPress} style={styles.chapterLink}>
          <Text style={[styles.chapterLinkText, { color: base.gold }]}>
            Read in Companion Study →
          </Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: spacing.md,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  closeBtn: {
    minWidth: MIN_TOUCH_TARGET,
    minHeight: MIN_TOUCH_TARGET,
    justifyContent: 'center',
    alignItems: 'center',
  },
  name: {
    fontFamily: fontFamily.displaySemiBold,
    fontSize: 18,
    marginTop: spacing.sm,
  },
  ref: {
    fontFamily: fontFamily.bodyMedium,
    fontSize: 14,
    marginTop: 4,
  },
  divider: {
    height: 1,
    marginVertical: spacing.md,
  },
  summary: {
    fontFamily: fontFamily.body,
    fontSize: 14,
    lineHeight: 22,
  },
  placesSection: {
    marginTop: spacing.md,
  },
  placesLabel: {
    fontFamily: fontFamily.display,
    fontSize: 10,
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  placesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  placeChip: {
    borderWidth: 1,
    borderRadius: radii.pill,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  placeText: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 12,
  },
  chapterLink: {
    marginTop: spacing.md,
  },
  chapterLinkText: {
    fontFamily: fontFamily.uiSemiBold,
    fontSize: 13,
  },
});
