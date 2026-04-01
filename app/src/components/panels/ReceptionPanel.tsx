import React from 'react';
import { View, Text } from 'react-native';
import { TappableReference } from '../TappableReference';
import { useTheme, spacing, fontFamily } from '../../theme';
import type { ParsedRef, RecEntry } from '../../types';

interface Props { entries: RecEntry[]; onRefPress?: (ref: ParsedRef) => void; }

export function ReceptionPanel({ entries, onRefPress }: Props) {
  const { base, getPanelColors } = useTheme();
  const colors = getPanelColors('rec');
  if (!entries?.length) {
    return (
      <Text style={{ color: base.textMuted, fontSize: 12, fontFamily: fontFamily.ui }}>
        No reception history available.
      </Text>
    );
  }

  return (
    <View style={{ gap: spacing.md }}>
      {entries.map((e: any, i: number) => {
        // Support both shapes: { title, quote, note } and { who, text }
        const heading = e.title ?? e.who ?? '';
        const body = e.quote ?? e.text ?? '';
        const note = e.note ?? '';

        return (
          <View key={i} style={{ gap: 4 }}>
            {heading ? (
              <Text style={{ color: colors.accent, fontFamily: fontFamily.display, fontSize: 12 }}>
                {heading}
              </Text>
            ) : null}
            {body ? (
              <Text style={{ color: base.textDim, fontFamily: fontFamily.bodyItalic, fontSize: 14, lineHeight: 22 }}>
                {body}
              </Text>
            ) : null}
            {note ? (
              <TappableReference text={note} style={{ color: base.textMuted, fontSize: 13, lineHeight: 20 }} onRefPress={onRefPress} />
            ) : null}
          </View>
        );
      })}
    </View>
  );
}
