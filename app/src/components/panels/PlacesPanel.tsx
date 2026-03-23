/**
 * PlacesPanel — Place cards with name, role, description.
 * poi green (#30a848). Tap name → MapScreen.
 */

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { TappableReference } from '../TappableReference';
import { getPanelColors, base, spacing, radii } from '../../theme';
import type { PlaceEntry, ParsedRef } from '../../types';

interface Props {
  entries: PlaceEntry[];
  onPlacePress?: (placeName: string) => void;
  onRefPress?: (ref: ParsedRef) => void;
}

export function PlacesPanel({ entries, onPlacePress, onRefPress }: Props) {
  const colors = getPanelColors('poi');

  return (
    <View style={{ gap: spacing.sm }}>
      {entries.map((entry, i) => (
        <View
          key={i}
          style={{
            backgroundColor: colors.bg,
            borderWidth: 1,
            borderColor: colors.border + '60',
            borderRadius: radii.md,
            padding: spacing.sm,
          }}
        >
          <TouchableOpacity
            onPress={() => onPlacePress?.(entry.name)}
            disabled={!onPlacePress}
          >
            <Text style={{
              color: colors.accent,
              fontFamily: 'Cinzel_500Medium',
              fontSize: 13,
            }}>
              {entry.name}
            </Text>
          </TouchableOpacity>
          {entry.role ? (
            <Text style={{ color: base.textMuted, fontSize: 11, fontFamily: 'SourceSans3_400Regular', marginTop: 2 }}>
              {entry.role}
            </Text>
          ) : null}
          {entry.text ? (
            <TappableReference
              text={entry.text}
              style={{ color: base.textDim, fontSize: 13, lineHeight: 20, marginTop: 4 }}
              onRefPress={onRefPress}
            />
          ) : null}
        </View>
      ))}
    </View>
  );
}
