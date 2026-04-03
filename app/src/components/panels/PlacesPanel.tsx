/**
 * PlacesPanel — Place cards with name, role, description.
 * poi green (#30a848). Tap name → MapScreen.
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { TappableReference } from '../TappableReference';
import { useTheme, spacing, radii, fontFamily } from '../../theme';
import type { PlaceEntry, ParsedRef } from '../../types';

interface Props {
  entries: PlaceEntry[];
  onPlacePress?: (placeName: string) => void;
  onRefPress?: (ref: ParsedRef) => void;
}

export function PlacesPanel({ entries, onPlacePress, onRefPress }: Props) {
  const { base, getPanelColors } = useTheme();
  const colors = getPanelColors('poi');

  return (
    <View style={styles.container}>
      {entries.map((entry, i) => (
        <View
          key={i}
          style={[styles.entryCard, {
            backgroundColor: colors.bg,
            borderColor: colors.border + '60',
          }]}
        >
          <TouchableOpacity
            onPress={() => onPlacePress?.(entry.name)}
            disabled={!onPlacePress}
            accessibilityRole="button"
            accessibilityLabel={`View ${entry.name} on map`}
          >
            <Text style={[styles.entryName, { color: colors.accent }]}>
              {entry.name}
            </Text>
          </TouchableOpacity>
          {entry.role ? (
            <Text style={[styles.entryRole, { color: base.textMuted }]}>
              {entry.role}
            </Text>
          ) : null}
          {entry.text ? (
            <TappableReference
              text={entry.text}
              style={[styles.entryText, { color: base.textDim }]}
              onRefPress={onRefPress}
            />
          ) : null}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  entryCard: {
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing.sm,
  },
  entryName: {
    fontFamily: fontFamily.displayMedium,
    fontSize: 13,
  },
  entryRole: {
    fontSize: 11,
    fontFamily: fontFamily.ui,
    marginTop: 2,
  },
  entryText: {
    fontSize: 13,
    lineHeight: 20,
    marginTop: 4,
  },
});
