/**
 * PlaceDetailCard — Bottom-overlay detail card for a tapped place.
 *
 * Surfaces the ancient + modern names, type badge, related stories,
 * and coordinates. Mirrors StoryPanel's card pattern (bgElevated +
 * top border) but caps at ~30% screen height since there's less to
 * show.
 *
 * Part of Card #1272 Fix 1 (Map UX overhaul).
 */

import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { X } from 'lucide-react-native';
import { BadgeChip } from '../BadgeChip';
import {
  useTheme,
  spacing,
  radii,
  eras,
  eraNames,
  fontFamily,
  MIN_TOUCH_TARGET,
} from '../../theme';
import { lightImpact } from '../../utils/haptics';
import type { MapStory, Place } from '../../types';

export interface PlaceDetailCardProps {
  place: Place;
  /** Stories whose places_json includes this place. Caller derives once. */
  stories?: MapStory[];
  onClose: () => void;
  onStoryPress?: (story: MapStory) => void;
}

const TYPE_LABELS: Record<Place['type'], string> = {
  city: 'City',
  mountain: 'Mountain',
  water: 'Water',
  region: 'Region',
  site: 'Site',
};

const TYPE_COLORS: Record<Place['type'], string> = {
  city: '#d4b483',
  mountain: '#d4b483',
  site: '#d4b483',
  water: '#90c8d8',
  region: '#b8a070',
};

/** Format a coordinate to 2 decimals with N/S, E/W suffix. */
export function formatCoord(value: number, axis: 'lat' | 'lon'): string {
  const positive = axis === 'lat' ? 'N' : 'E';
  const negative = axis === 'lat' ? 'S' : 'W';
  const suffix = value >= 0 ? positive : negative;
  return `${Math.abs(value).toFixed(2)}° ${suffix}`;
}

export function PlaceDetailCard({
  place,
  stories,
  onClose,
  onStoryPress,
}: PlaceDetailCardProps) {
  const { base } = useTheme();
  const typeColor = TYPE_COLORS[place.type] ?? base.gold;
  const typeLabel = TYPE_LABELS[place.type] ?? place.type;
  const list = stories ?? [];

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      {/* Top row — type badge + close */}
      <View style={styles.topRow}>
        <BadgeChip label={typeLabel} color={typeColor} />
        <TouchableOpacity
          onPress={() => {
            lightImpact();
            onClose();
          }}
          style={styles.closeBtn}
          accessibilityLabel="Close place details"
          accessibilityRole="button"
        >
          <X size={18} color={base.textMuted} />
        </TouchableOpacity>
      </View>

      {/* Ancient name */}
      <Text style={[styles.name, { color: base.text }]}>{place.ancient_name}</Text>

      {/* Modern name */}
      {place.modern_name ? (
        <Text style={[styles.modernName, { color: base.textDim }]}>{place.modern_name}</Text>
      ) : null}

      <View style={[styles.divider, { backgroundColor: base.border }]} />

      {/* Related stories */}
      {list.length > 0 ? (
        <View style={styles.storiesSection}>
          <Text style={[styles.storiesLabel, { color: base.textMuted }]}>
            APPEARS IN
          </Text>
          <View style={styles.storiesRow}>
            {list.map((s) => {
              const eraColor = eras[s.era] ?? base.gold;
              const eraLabel = eraNames[s.era] ?? s.era;
              return (
                <TouchableOpacity
                  key={s.id}
                  onPress={() => {
                    lightImpact();
                    onStoryPress?.(s);
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={`Open story ${s.name}, ${eraLabel} era`}
                  style={[
                    styles.storyChip,
                    { backgroundColor: eraColor + '1A', borderColor: eraColor + '40' },
                  ]}
                >
                  <Text style={[styles.storyChipText, { color: eraColor }]} numberOfLines={1}>
                    {s.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      ) : (
        <Text style={[styles.empty, { color: base.textMuted }]}>
          No stories link to this place yet.
        </Text>
      )}

      {/* Coordinates footer */}
      <Text style={[styles.coords, { color: base.textMuted }]}>
        {formatCoord(place.latitude, 'lat')} · {formatCoord(place.longitude, 'lon')}
      </Text>
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
    alignItems: 'flex-end',
  },
  name: {
    fontFamily: fontFamily.displaySemiBold,
    fontSize: 18,
    marginTop: spacing.sm,
  },
  modernName: {
    fontFamily: fontFamily.body,
    fontSize: 14,
    marginTop: 2,
  },
  divider: {
    height: 1,
    marginVertical: spacing.md,
  },
  storiesSection: {
    gap: spacing.xs,
  },
  storiesLabel: {
    fontFamily: fontFamily.display,
    fontSize: 10,
    letterSpacing: 0.5,
  },
  storiesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  storyChip: {
    borderWidth: 1,
    borderRadius: radii.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
    maxWidth: '100%',
  },
  storyChipText: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 12,
  },
  empty: {
    fontFamily: fontFamily.ui,
    fontSize: 12,
    fontStyle: 'italic',
  },
  coords: {
    marginTop: spacing.md,
    fontFamily: fontFamily.ui,
    fontSize: 11,
  },
});
