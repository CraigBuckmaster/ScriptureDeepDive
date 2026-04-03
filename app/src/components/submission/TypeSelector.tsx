/**
 * TypeSelector — Three cards for choosing submission type.
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { BookOpen, Lightbulb, FileText } from 'lucide-react-native';
import { useTheme, spacing, radii, fontFamily } from '../../theme';
import type { SubmissionType } from '../../types';

const TYPES: { key: SubmissionType; label: string; desc: string; Icon: React.ElementType }[] = [
  {
    key: 'verse_collection',
    label: 'Verse Collection',
    desc: 'Curate a set of verses around a theme',
    Icon: BookOpen,
  },
  {
    key: 'personal_reflection',
    label: 'Personal Reflection',
    desc: 'Share your insight on a passage or topic',
    Icon: Lightbulb,
  },
  {
    key: 'topical_study',
    label: 'Topical Study',
    desc: 'An in-depth study on a specific topic',
    Icon: FileText,
  },
];

interface Props {
  selected: SubmissionType | null;
  onSelect: (type: SubmissionType) => void;
}

function TypeSelector({ selected, onSelect }: Props) {
  const { base } = useTheme();

  return (
    <View style={styles.container}>
      {TYPES.map(({ key, label, desc, Icon }) => {
        const isSelected = selected === key;
        return (
          <TouchableOpacity
            key={key}
            activeOpacity={0.7}
            onPress={() => onSelect(key)}
            style={[
              styles.card,
              {
                backgroundColor: base.bgElevated,
                borderColor: isSelected ? base.gold : base.border + '40',
                borderWidth: isSelected ? 2 : 1,
              },
            ]}
          >
            <Icon size={24} color={isSelected ? base.gold : base.textDim} />
            <Text style={[styles.label, { color: isSelected ? base.gold : base.text }]}>
              {label}
            </Text>
            <Text style={[styles.desc, { color: base.textDim }]}>{desc}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  card: {
    borderRadius: radii.md,
    padding: spacing.md,
    gap: spacing.xs,
  },
  label: {
    fontFamily: fontFamily.displayMedium,
    fontSize: 15,
  },
  desc: {
    fontFamily: fontFamily.body,
    fontSize: 12,
    lineHeight: 18,
  },
});

export default React.memo(TypeSelector);
