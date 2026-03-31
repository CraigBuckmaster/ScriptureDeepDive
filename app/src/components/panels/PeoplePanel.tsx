import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { TappableReference } from '../TappableReference';
import { useTheme, spacing, radii, fontFamily } from '../../theme';
import type { PeopleEntry, ParsedRef } from '../../types';

interface Props {
  entries: PeopleEntry[];
  onPersonPress?: (name: string) => void;
  onRefPress?: (ref: ParsedRef) => void;
}

export function PeoplePanel({ entries, onPersonPress, onRefPress }: Props) {
  const { base, getPanelColors } = useTheme();
  const colors = getPanelColors('ppl');
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
      {entries.map((p, i) => (
        <View key={i} style={{
          width: '48%', backgroundColor: colors.bg, borderWidth: 1,
          borderColor: colors.border + '60', borderRadius: radii.md, padding: spacing.sm,
        }}>
          <TouchableOpacity onPress={() => onPersonPress?.(p.name)} disabled={!onPersonPress}>
            <Text style={{ color: colors.accent, fontFamily: fontFamily.displayMedium, fontSize: 12 }}>
              {p.name}
            </Text>
          </TouchableOpacity>
          <Text style={{ color: base.textMuted, fontSize: 10, fontFamily: fontFamily.ui, marginTop: 2 }}>
            {p.role}
          </Text>
          {p.text ? (
            <TappableReference text={p.text} style={{ color: base.textDim, fontSize: 12, lineHeight: 18, marginTop: 4 }} onRefPress={onRefPress} />
          ) : null}
        </View>
      ))}
    </View>
  );
}
