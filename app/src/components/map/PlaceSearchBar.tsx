/**
 * PlaceSearchBar — Search input for finding places on the map.
 *
 * Mirrors PersonSearchBar from the genealogy tree. Filters by ancient
 * AND modern names with a starts-with match (case-insensitive). The
 * coloured dot in each row encodes the place type, matching the
 * marker label colour scheme.
 *
 * Part of Card #1272 Fix 2 (Map UX overhaul).
 */

import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SearchInput } from '../SearchInput';
import {
  useTheme,
  spacing,
  radii,
  fontFamily,
  MIN_TOUCH_TARGET,
} from '../../theme';
import type { Place } from '../../types';

const MAX_RESULTS = 8;

/** Colour of the leading dot in each result row. Mirrors PlaceLabel. */
const TYPE_COLORS: Record<Place['type'], string> = {
  city: '#d4b483',
  mountain: '#d4b483',
  site: '#d4b483',
  water: '#90c8d8',
  region: '#b8a070',
};

export interface PlaceSearchBarProps {
  places: Place[];
  onSelect: (place: Place) => void;
  /** Override the default 8-result cap (useful for tests). */
  maxResults?: number;
}

/** Pure filter so it can be unit-tested without mounting the component. */
export function filterPlaces(
  places: Place[],
  query: string,
  max = MAX_RESULTS,
): Place[] {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];
  const matches: Place[] = [];
  for (const p of places) {
    if (p.ancient_name.toLowerCase().startsWith(q)) {
      matches.push(p);
    } else if (p.modern_name && p.modern_name.toLowerCase().startsWith(q)) {
      matches.push(p);
    }
    if (matches.length >= max) break;
  }
  return matches;
}

export function PlaceSearchBar({
  places,
  onSelect,
  maxResults = MAX_RESULTS,
}: PlaceSearchBarProps) {
  const { base } = useTheme();
  const [query, setQuery] = useState('');

  const results = useMemo(
    () => filterPlaces(places, query, maxResults),
    [places, query, maxResults],
  );

  const handleSelect = (place: Place) => {
    setQuery('');
    onSelect(place);
  };

  return (
    <View style={styles.wrapper}>
      <SearchInput
        value={query}
        onChangeText={setQuery}
        placeholder="Search places..."
        compact
      />
      {results.length > 0 && (
        <View
          style={[
            styles.dropdown,
            { backgroundColor: base.bgElevated, borderColor: base.border },
          ]}
        >
          {results.map((p) => {
            const dotColor = TYPE_COLORS[p.type] ?? base.textMuted;
            return (
              <TouchableOpacity
                key={p.id}
                onPress={() => handleSelect(p)}
                accessibilityRole="button"
                accessibilityLabel={`Select ${p.ancient_name}`}
                style={[
                  styles.resultRow,
                  { borderBottomColor: base.border + '40' },
                ]}
              >
                <View style={[styles.typeDot, { backgroundColor: dotColor }]} />
                <View style={styles.resultInfo}>
                  <Text
                    style={[styles.resultName, { color: base.text }]}
                    numberOfLines={1}
                  >
                    {p.ancient_name}
                  </Text>
                  {p.modern_name ? (
                    <Text
                      style={[styles.resultModern, { color: base.textMuted }]}
                      numberOfLines={1}
                    >
                      {p.modern_name}
                    </Text>
                  ) : null}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: spacing.md,
    zIndex: 20,
  },
  dropdown: {
    position: 'absolute',
    top: 36,
    left: spacing.md,
    right: spacing.md,
    borderWidth: 1,
    borderRadius: radii.md,
    maxHeight: 300,
    zIndex: 20,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    minHeight: MIN_TOUCH_TARGET,
    borderBottomWidth: 1,
  },
  typeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  resultInfo: {
    flex: 1,
  },
  resultName: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 13,
  },
  resultModern: {
    fontFamily: fontFamily.ui,
    fontSize: 11,
  },
});
