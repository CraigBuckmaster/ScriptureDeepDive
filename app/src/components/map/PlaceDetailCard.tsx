/**
 * PlaceDetailCard — Bottom-overlay detail card for a tapped place.
 *
 * Ancient + modern names, type badge, and three enrichment layers:
 *   1. Significance line + description (#1323)
 *   2. Key-verse chips (tappable deep-links)
 *   3. Scholar notes with tradition chip
 *   4. "Through the Ages" cross-testament history timeline (#1325)
 *   5. Related stories chips
 *
 * Part of Card #1272 Fix 1 (Map UX overhaul); enrichment layers from
 * #1323 and #1325.
 */

import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { X } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { BadgeChip } from '../BadgeChip';
import { getPeopleAtPlace } from '../../db/content';
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
import { safeParse } from '../../utils/logger';
import type {
  MapStory,
  Place,
  PlaceScholarNote,
  PlaceTestamentEvent,
} from '../../types';

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

const TESTAMENT_COLORS = {
  OT: '#d4a05a', // amber
  NT: '#5ea073', // green
};

/** Format a coordinate to 2 decimals with N/S, E/W suffix. */
export function formatCoord(value: number, axis: 'lat' | 'lon'): string {
  const positive = axis === 'lat' ? 'N' : 'E';
  const negative = axis === 'lat' ? 'S' : 'W';
  const suffix = value >= 0 ? positive : negative;
  return `${Math.abs(value).toFixed(2)}° ${suffix}`;
}

/**
 * Parse `Book Ch:V` / `1 Kgs 25:9` style refs into navigation params.
 * Returns null if the ref doesn't parse cleanly so the caller can skip
 * navigation rather than blow up.
 */
export function parseVerseRef(ref: string): {
  bookId: string;
  chapterNum: number;
} | null {
  const m = ref.trim().match(/^(\d?\s?[A-Za-z.]+)\s+(\d+)(?::\d+)?$/);
  if (!m) return null;
  const bookId = m[1].toLowerCase().replace(/\s+/g, '_').replace(/\./g, '');
  const chapterNum = parseInt(m[2], 10);
  if (!bookId || Number.isNaN(chapterNum)) return null;
  return { bookId, chapterNum };
}

export function PlaceDetailCard({
  place,
  stories,
  onClose,
  onStoryPress,
}: PlaceDetailCardProps) {
  const { base } = useTheme();
  const navigation = useNavigation();
  const typeColor = TYPE_COLORS[place.type] ?? base.gold;
  const typeLabel = TYPE_LABELS[place.type] ?? place.type;
  const list = stories ?? [];

  const keyVerses = useMemo(
    () => safeParse<string[]>(place.key_verses_json ?? null, []),
    [place.key_verses_json],
  );
  const scholarNotes = useMemo(
    () => safeParse<PlaceScholarNote[]>(place.scholar_notes_json ?? null, []),
    [place.scholar_notes_json],
  );
  const testamentHistory = useMemo(
    () => safeParse<PlaceTestamentEvent[]>(place.testament_history_json ?? null, []),
    [place.testament_history_json],
  );

  const [showAllScholarNotes, setShowAllScholarNotes] = useState(false);
  const [showAllHistory, setShowAllHistory] = useState(false);

  // "People who came here" — resolved on demand when the card opens (#1324).
  const [peopleHere, setPeopleHere] = useState<{ id: string; name: string }[]>([]);
  useEffect(() => {
    let cancelled = false;
    getPeopleAtPlace(place.id).then((rows) => {
      if (!cancelled) setPeopleHere(rows);
    });
    return () => { cancelled = true; };
  }, [place.id]);

  const visibleScholarNotes = showAllScholarNotes ? scholarNotes : scholarNotes.slice(0, 2);
  const visibleHistory = showAllHistory ? testamentHistory : testamentHistory.slice(0, 4);

  const navigateToRef = (ref: string) => {
    const parsed = parseVerseRef(ref);
    if (!parsed) return;
    lightImpact();
    (navigation as any).navigate('ReadTab', {
      screen: 'Chapter',
      params: parsed,
    });
  };

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

      {/* Significance line (#1323) — always visible when present */}
      {place.significance ? (
        <Text style={[styles.significance, { color: base.textDim }]}>
          {place.significance}
        </Text>
      ) : null}

      <View style={[styles.divider, { backgroundColor: base.border }]} />

      {/* Key verse chips (#1323) */}
      {keyVerses.length > 0 && (
        <View style={styles.keyVersesRow}>
          {keyVerses.map((ref) => (
            <TouchableOpacity
              key={ref}
              onPress={() => navigateToRef(ref)}
              accessibilityRole="button"
              accessibilityLabel={`Open ${ref}`}
              style={[styles.verseChip, { backgroundColor: base.gold + '1A', borderColor: base.gold + '40' }]}
            >
              <Text style={[styles.verseChipText, { color: base.gold }]}>{ref}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Description (#1323) */}
      {place.description ? (
        <Text style={[styles.description, { color: base.textDim }]}>
          {place.description}
        </Text>
      ) : null}

      {/* Scholarly perspectives (#1323) */}
      {scholarNotes.length > 0 && (
        <View style={styles.sectionBlock}>
          <Text style={[styles.sectionLabel, { color: base.textMuted }]}>
            SCHOLARLY PERSPECTIVES
          </Text>
          {visibleScholarNotes.map((n, i) => (
            <View key={`${n.scholar_id}-${i}`} style={styles.scholarNote}>
              <View style={styles.scholarNoteHeader}>
                <BadgeChip label={n.tradition} color={base.gold} />
              </View>
              <Text style={[styles.scholarNoteBody, { color: base.text }]}>{n.note}</Text>
              {n.ref ? (
                <Text style={[styles.scholarNoteRef, { color: base.gold }]}>{n.ref}</Text>
              ) : null}
            </View>
          ))}
          {scholarNotes.length > 2 && (
            <TouchableOpacity onPress={() => setShowAllScholarNotes((v) => !v)}>
              <Text style={[styles.showMore, { color: base.gold }]}>
                {showAllScholarNotes ? 'Show fewer' : `Show ${scholarNotes.length - 2} more`}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Related stories — "Appears in" */}
      {list.length > 0 ? (
        <View style={[styles.sectionBlock, styles.storiesSection]}>
          <Text style={[styles.sectionLabel, { color: base.textMuted }]}>APPEARS IN</Text>
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

      {/* People who came here (#1324) — tap a chip to open their arc */}
      {peopleHere.length > 0 && (
        <View style={styles.sectionBlock}>
          <Text style={[styles.sectionLabel, { color: base.textMuted }]}>
            PEOPLE WHO CAME HERE
          </Text>
          <View style={styles.storiesRow}>
            {peopleHere.map((p) => (
              <TouchableOpacity
                key={p.id}
                onPress={() => {
                  lightImpact();
                  (navigation as any).navigate('Map', { personId: p.id });
                }}
                accessibilityRole="button"
                accessibilityLabel={`Show ${p.name}'s geographic arc`}
                style={[
                  styles.storyChip,
                  { backgroundColor: '#e09050' + '1A', borderColor: '#e09050' + '40' },
                ]}
              >
                <Text
                  style={[styles.storyChipText, { color: '#e09050' }]}
                  numberOfLines={1}
                >
                  {p.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Through the Ages — cross-testament history (#1325) */}
      {testamentHistory.length > 0 && (
        <View style={styles.sectionBlock}>
          <Text style={[styles.sectionLabel, { color: base.textMuted }]}>
            THROUGH THE AGES
          </Text>
          {visibleHistory.map((e, i) => {
            const color = TESTAMENT_COLORS[e.testament] ?? base.gold;
            return (
              <View key={`${e.ref}-${i}`} style={styles.historyRow}>
                <View style={[styles.historyDot, { backgroundColor: color }]} />
                <View style={styles.historyBody}>
                  <View style={styles.historyMeta}>
                    <Text style={[styles.historyTestament, { color }]}>
                      {e.testament}
                    </Text>
                    <TouchableOpacity
                      onPress={() => navigateToRef(e.ref)}
                      accessibilityRole="button"
                      accessibilityLabel={`Open ${e.ref}`}
                    >
                      <Text style={[styles.historyRef, { color: base.gold }]}>
                        {e.ref}
                      </Text>
                    </TouchableOpacity>
                    {e.era ? (
                      <Text style={[styles.historyEra, { color: base.textMuted }]}>
                        · {eraNames[e.era] ?? e.era}
                      </Text>
                    ) : null}
                  </View>
                  <Text style={[styles.historyEvent, { color: base.textDim }]}>
                    {e.event}
                  </Text>
                </View>
              </View>
            );
          })}
          {testamentHistory.length > 4 && (
            <TouchableOpacity onPress={() => setShowAllHistory((v) => !v)}>
              <Text style={[styles.showMore, { color: base.gold }]}>
                {showAllHistory ? 'Show fewer' : `Show ${testamentHistory.length - 4} more`}
              </Text>
            </TouchableOpacity>
          )}
        </View>
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
    paddingBottom: spacing.lg,
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
  significance: {
    fontFamily: fontFamily.bodyItalic,
    fontSize: 13,
    lineHeight: 19,
    marginTop: spacing.xs,
  },
  divider: {
    height: 1,
    marginVertical: spacing.md,
  },
  keyVersesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: spacing.sm,
  },
  verseChip: {
    borderWidth: 1,
    borderRadius: radii.pill,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  verseChipText: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 12,
  },
  description: {
    fontFamily: fontFamily.body,
    fontSize: 13,
    lineHeight: 19,
    marginBottom: spacing.sm,
  },
  sectionBlock: {
    marginTop: spacing.md,
    gap: spacing.xs,
  },
  sectionLabel: {
    fontFamily: fontFamily.display,
    fontSize: 10,
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  scholarNote: {
    marginBottom: spacing.sm,
    gap: 4,
  },
  scholarNoteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scholarNoteBody: {
    fontFamily: fontFamily.body,
    fontSize: 13,
    lineHeight: 19,
  },
  scholarNoteRef: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 11,
    marginTop: 2,
  },
  showMore: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 12,
    marginTop: 2,
  },
  storiesSection: {
    gap: spacing.xs,
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
  historyRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  historyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
  },
  historyBody: {
    flex: 1,
  },
  historyMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  historyTestament: {
    fontFamily: fontFamily.uiSemiBold,
    fontSize: 10,
    letterSpacing: 0.5,
  },
  historyRef: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 12,
  },
  historyEra: {
    fontFamily: fontFamily.ui,
    fontSize: 11,
  },
  historyEvent: {
    fontFamily: fontFamily.body,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 2,
  },
  empty: {
    fontFamily: fontFamily.ui,
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: spacing.md,
  },
  coords: {
    marginTop: spacing.md,
    fontFamily: fontFamily.ui,
    fontSize: 11,
  },
});
