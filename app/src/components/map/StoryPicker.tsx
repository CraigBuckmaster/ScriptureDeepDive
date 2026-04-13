/**
 * StoryPicker — Horizontal scroll strip OR expandable 2-column grid.
 *
 * Default state: a single-row scroll of story chips (the original UX).
 * Tapping the toggle on the right swaps in a vertical 2-column overlay
 * grid that shows every story with era + place-count metadata. Selecting
 * a story closes the grid and bubbles the id up.
 *
 * Part of Card #1272 Fix 4 (Map UX overhaul).
 */

import React, { useMemo, useState } from 'react';
import {
  ScrollView,
  Text,
  TouchableOpacity,
  StyleSheet,
  View,
  Dimensions,
} from 'react-native';
import { BadgeChip } from '../BadgeChip';
import {
  useTheme,
  spacing,
  radii,
  eras,
  eraNames,
  fontFamily,
} from '../../theme';
import { lightImpact } from '../../utils/haptics';
import type { MapStory, Place } from '../../types';
import { safeParse } from '../../utils/logger';

interface Props {
  stories: MapStory[];
  activeStoryId: string | null;
  onSelect: (storyId: string) => void;
  /** Optional — when provided, each grid card shows "N places" derived from
   *  the story's places_json. Strip view ignores it. */
  places?: Place[];
}

const CHIP_HEIGHT = 32;

/** Count places referenced by a story's `places_json` field. */
export function placeCount(story: MapStory): number {
  return safeParse<string[]>(story.places_json, []).length;
}

export function StoryPicker({ stories, activeStoryId, onSelect, places }: Props) {
  const { base } = useTheme();
  const [expanded, setExpanded] = useState(false);

  // Reset to the strip whenever the era filter empties the story list.
  React.useEffect(() => {
    if (stories.length === 0 && expanded) setExpanded(false);
  }, [stories.length, expanded]);

  const selectAndCollapse = (id: string) => {
    lightImpact();
    setExpanded(false);
    onSelect(id);
  };

  if (stories.length === 0) {
    return (
      <Text style={[styles.emptyText, { color: base.textMuted }]}>
        No stories for this era
      </Text>
    );
  }

  if (expanded) {
    return (
      <StoryGrid
        stories={stories}
        activeStoryId={activeStoryId}
        onSelect={selectAndCollapse}
        onCollapse={() => setExpanded(false)}
        places={places}
      />
    );
  }

  return (
    <View style={styles.stripRow}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.stripContent}
      >
        {stories.map((story) => {
          const isActive = activeStoryId === story.id;
          const color = eras[story.era] ?? base.gold;
          return (
            <TouchableOpacity
              key={story.id}
              onPress={() => {
                lightImpact();
                onSelect(story.id);
              }}
              hitSlop={{ top: 6, bottom: 6, left: 2, right: 2 }}
              accessibilityRole="button"
              accessibilityLabel={`${isActive ? 'Selected story: ' : 'Select story: '}${story.name}`}
              style={[
                styles.storyChip,
                {
                  backgroundColor: isActive ? color + '33' : base.bg + 'EE',
                  borderColor: isActive ? color : base.gold + '55',
                },
              ]}
            >
              <Text
                style={[styles.storyChipText, { color: isActive ? color : base.gold }]}
              >
                {story.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
      <TouchableOpacity
        onPress={() => setExpanded(true)}
        accessibilityRole="button"
        accessibilityLabel="Browse all stories"
        style={[
          styles.expandToggle,
          { backgroundColor: base.bg + 'EE', borderColor: base.gold + '55' },
        ]}
      >
        <Text style={[styles.expandIcon, { color: base.gold }]}>▴</Text>
      </TouchableOpacity>
    </View>
  );
}

// ── Grid view ──────────────────────────────────────────────────────────

interface GridProps {
  stories: MapStory[];
  activeStoryId: string | null;
  onSelect: (storyId: string) => void;
  onCollapse: () => void;
  places?: Place[];
}

function StoryGrid({ stories, activeStoryId, onSelect, onCollapse, places }: GridProps) {
  const { base } = useTheme();
  const screenHeight = Dimensions.get('window').height;
  const maxHeight = Math.round(screenHeight * 0.6);
  const placesAvailable = (places?.length ?? 0) > 0;

  return (
    <View
      accessibilityLabel="Story browser"
      style={[
        styles.gridOverlay,
        {
          backgroundColor: base.bgElevated + 'F5',
          borderColor: base.gold + '40',
          maxHeight,
        },
      ]}
    >
      <View style={styles.gridHeader}>
        <Text style={[styles.gridTitle, { color: base.gold }]}>
          {stories.length} stor{stories.length === 1 ? 'y' : 'ies'}
        </Text>
        <TouchableOpacity
          onPress={() => {
            lightImpact();
            onCollapse();
          }}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          accessibilityRole="button"
          accessibilityLabel="Collapse story browser"
          style={[styles.expandToggle, { backgroundColor: 'transparent', borderColor: base.gold + '55' }]}
        >
          <Text style={[styles.expandIcon, { color: base.gold }]}>▾</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.gridScroll}>
        <View style={styles.gridWrap}>
          {stories.map((story) => {
            const isActive = activeStoryId === story.id;
            const color = eras[story.era] ?? base.gold;
            const eraLabel = eraNames[story.era] ?? story.era;
            const count = placesAvailable ? placeCount(story) : null;
            return (
              <TouchableOpacity
                key={story.id}
                onPress={() => onSelect(story.id)}
                accessibilityRole="button"
                accessibilityLabel={`Open story ${story.name}, ${eraLabel} era`}
                style={[
                  styles.gridCard,
                  {
                    backgroundColor: isActive ? color + '20' : base.bg + 'CC',
                    borderColor: isActive ? color : base.border,
                  },
                ]}
              >
                <Text
                  style={[styles.gridName, { color: isActive ? color : base.text }]}
                  numberOfLines={2}
                >
                  {story.name}
                </Text>
                <View style={styles.gridMetaRow}>
                  <BadgeChip label={eraLabel} color={color} />
                  {count != null ? (
                    <Text style={[styles.gridCount, { color: base.textMuted }]}>
                      {count} place{count === 1 ? '' : 's'}
                    </Text>
                  ) : null}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  emptyText: {
    fontSize: 12,
    fontFamily: fontFamily.ui,
    textAlign: 'center',
    paddingVertical: spacing.xs,
  },
  // ── Strip mode ──
  stripRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xs,
    gap: spacing.xs,
  },
  stripContent: {
    gap: spacing.xs,
    paddingHorizontal: spacing.xs,
    flexGrow: 1,
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
  expandToggle: {
    height: CHIP_HEIGHT,
    minWidth: CHIP_HEIGHT,
    borderWidth: 1,
    borderRadius: radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  expandIcon: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 14,
  },
  // ── Grid mode ──
  gridOverlay: {
    borderTopLeftRadius: radii.lg,
    borderTopRightRadius: radii.lg,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
  },
  gridHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  gridTitle: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 11,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  gridScroll: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  gridWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  gridCard: {
    flexBasis: '48%',
    flexGrow: 1,
    borderWidth: 1,
    borderRadius: radii.md,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
    minHeight: 64,
  },
  gridName: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 12,
  },
  gridMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  gridCount: {
    fontFamily: fontFamily.ui,
    fontSize: 9,
  },
});
