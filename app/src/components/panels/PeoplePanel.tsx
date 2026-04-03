import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
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
    <View style={styles.container}>
      {entries.map((p, i) => (
        <View key={i} style={[styles.personCard, {
          backgroundColor: colors.bg,
          borderColor: colors.border + '60',
        }]}>
          <TouchableOpacity onPress={() => onPersonPress?.(p.name)} disabled={!onPersonPress} accessibilityRole="button" accessibilityLabel={`View details for ${p.name}`}>
            <Text style={[styles.personName, { color: colors.accent }]}>
              {p.name}
            </Text>
          </TouchableOpacity>
          <Text style={[styles.personRole, { color: base.textMuted }]}>
            {p.role}
          </Text>
          {p.text ? (
            <TappableReference text={p.text} style={[styles.personText, { color: base.textDim }]} onRefPress={onRefPress} />
          ) : null}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  personCard: {
    width: '48%',
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing.sm,
  },
  personName: {
    fontFamily: fontFamily.displayMedium,
    fontSize: 12,
  },
  personRole: {
    fontSize: 10,
    fontFamily: fontFamily.ui,
    marginTop: 2,
  },
  personText: {
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
  },
});
