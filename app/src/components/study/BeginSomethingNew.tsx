/**
 * components/study/BeginSomethingNew.tsx — Study hub row (#1833):
 * three cards (A Book / A Journey / A Topic) that open the one-decision
 * plan picker with the matching segment preselected.
 */
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BookOpen, Footprints, Lightbulb } from 'lucide-react-native';
import { fontFamily, radii, spacing, useTheme } from '../../theme';

export type PlanPickerSegment = 'book' | 'journey' | 'topic';

interface Props {
  onPick: (segment: PlanPickerSegment) => void;
}

const CARDS: Array<{ segment: PlanPickerSegment; label: string; Icon: typeof BookOpen }> = [
  { segment: 'book', label: 'A Book', Icon: BookOpen },
  { segment: 'journey', label: 'A Journey', Icon: Footprints },
  { segment: 'topic', label: 'A Topic', Icon: Lightbulb },
];

export function BeginSomethingNew({ onPick }: Props) {
  const { base } = useTheme();

  return (
    <View>
      <Text style={[styles.label, { color: base.textMuted }]}>BEGIN SOMETHING NEW</Text>
      <View style={styles.row}>
        {CARDS.map(({ segment, label, Icon }) => (
          <TouchableOpacity
            key={segment}
            onPress={() => onPick(segment)}
            activeOpacity={0.72}
            accessibilityRole="button"
            accessibilityLabel={`Begin studying ${label.toLowerCase()}`}
            style={[styles.card, { backgroundColor: base.bgElevated, borderColor: base.border }]}
          >
            <Icon size={18} color={base.gold} />
            <Text style={[styles.cardLabel, { color: base.text }]}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 10,
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  card: {
    flex: 1,
    minHeight: 64,
    borderWidth: 1,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: spacing.sm,
  },
  cardLabel: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 12,
  },
});
