/**
 * StoryPanel — Story detail content for bottom sheet / sidebar.
 * Era badge, name, ref, summary, "Geography & Strategy" analysis
 * (#1327), place chips, chapter link.
 */

import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { X, Swords, Cross } from 'lucide-react-native';
import { BadgeChip } from '../BadgeChip';
import { useTheme, spacing, radii, eras, eraNames, fontFamily, MIN_TOUCH_TARGET } from '../../theme';
import type { MapStory, Place, StoryTerrainAnalysis } from '../../types';
import { safeParse } from '../../utils/logger';

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
    const ids = safeParse<string[]>(story.places_json, []);
    return ids.map((id) => places.find((p) => p.id === id)).filter(Boolean) as Place[];
  }, [story.places_json, places]);

  const terrain = useMemo(
    () => safeParse<StoryTerrainAnalysis | null>(story.terrain_analysis_json ?? null, null),
    [story.terrain_analysis_json],
  );

  const [terrainExpanded, setTerrainExpanded] = useState(false);

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

      {/* Geography & Strategy (#1327) */}
      {terrain && terrain.headline && terrain.body ? (
        <View style={styles.terrainSection}>
          <View style={styles.terrainHeader}>
            <Text style={[styles.sectionLabel, { color: base.textMuted }]}>
              WHY THIS GEOGRAPHY MATTERS
            </Text>
            <View style={styles.terrainBadges}>
              {terrain.military ? (
                <View
                  style={[styles.terrainBadge, { backgroundColor: base.gold + '22' }]}
                  accessibilityLabel="Military analysis"
                >
                  <Swords size={11} color={base.gold} />
                </View>
              ) : null}
              {terrain.theological ? (
                <View
                  style={[styles.terrainBadge, { backgroundColor: base.gold + '22' }]}
                  accessibilityLabel="Theological analysis"
                >
                  <Cross size={11} color={base.gold} />
                </View>
              ) : null}
            </View>
          </View>

          <Text style={[styles.terrainHeadline, { color: base.text }]}>
            {terrain.headline}
          </Text>
          <Text
            style={[styles.terrainBody, { color: base.textDim }]}
            numberOfLines={terrainExpanded ? undefined : 3}
          >
            {terrain.body}
          </Text>
          <TouchableOpacity
            onPress={() => setTerrainExpanded((v) => !v)}
            accessibilityRole="button"
            accessibilityLabel={terrainExpanded ? 'Collapse terrain analysis' : 'Read more terrain analysis'}
          >
            <Text style={[styles.readMore, { color: base.gold }]}>
              {terrainExpanded ? 'Read less' : 'Read more'}
            </Text>
          </TouchableOpacity>

          {terrain.source_scholars && terrain.source_scholars.length > 0 ? (
            <View style={styles.scholarRow}>
              {terrain.source_scholars.map((sid) => (
                <View
                  key={sid}
                  style={[styles.scholarChip, { borderColor: base.border, backgroundColor: base.bgElevated }]}
                >
                  <Text style={[styles.scholarChipText, { color: base.textMuted }]}>
                    {sid}
                  </Text>
                </View>
              ))}
            </View>
          ) : null}
        </View>
      ) : null}

      {/* Key Places */}
      {storyPlaces.length > 0 && (
        <View style={styles.placesSection}>
          <Text style={[styles.sectionLabel, { color: base.textMuted }]}>
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
  sectionLabel: {
    fontFamily: fontFamily.display,
    fontSize: 10,
    letterSpacing: 0.5,
  },
  terrainSection: {
    marginTop: spacing.md,
    gap: spacing.xs,
  },
  terrainHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  terrainBadges: {
    flexDirection: 'row',
    gap: 6,
  },
  terrainBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  terrainHeadline: {
    fontFamily: fontFamily.displaySemiBold,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 2,
  },
  terrainBody: {
    fontFamily: fontFamily.body,
    fontSize: 13,
    lineHeight: 20,
    marginTop: 4,
  },
  readMore: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 12,
    marginTop: 4,
  },
  scholarRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: spacing.xs,
  },
  scholarChip: {
    borderWidth: 1,
    borderRadius: radii.pill,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  scholarChipText: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 10,
    letterSpacing: 0.3,
  },
  placesSection: {
    marginTop: spacing.md,
  },
  placesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: spacing.xs,
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
