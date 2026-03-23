/**
 * CrossRefPanel — Cross-reference entries with tappable refs.
 * cross gold (#d4b060).
 */

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { TappableReference } from '../TappableReference';
import { getPanelColors, base, spacing } from '../../theme';
import { parseReference } from '../../utils/verseResolver';
import type { CrossRefEntry, ParsedRef } from '../../types';

interface Props {
  entries: CrossRefEntry[];
  onRefPress?: (ref: ParsedRef) => void;
}

export function CrossRefPanel({ entries, onRefPress }: Props) {
  const colors = getPanelColors('cross');

  return (
    <View style={{ gap: spacing.sm }}>
      {entries.map((entry, i) => (
        <View key={i} style={{ flexDirection: 'row', gap: spacing.sm }}>
          <TouchableOpacity
            onPress={() => {
              const parsed = parseReference(entry.ref);
              if (parsed && onRefPress) onRefPress(parsed);
            }}
            accessibilityRole="link"
            accessibilityLabel={`Reference: ${entry.ref}`}
          >
            <Text style={{
              color: colors.accent,
              fontFamily: 'SourceSans3_600SemiBold',
              fontSize: 13,
              minWidth: 70,
            }}>
              {entry.ref}
            </Text>
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <TappableReference
              text={entry.note}
              style={{ color: base.textDim, fontSize: 14, lineHeight: 22 }}
              onRefPress={onRefPress}
            />
          </View>
        </View>
      ))}
    </View>
  );
}
