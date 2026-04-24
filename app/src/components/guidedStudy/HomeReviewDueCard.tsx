import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Clock, ChevronRight } from 'lucide-react-native';
import { fontFamily, radii, spacing, useTheme } from '../../theme';

interface Props {
  count: number;
  onPress: () => void;
}

export function HomeReviewDueCard({ count, onPress }: Props) {
  const { base } = useTheme();
  if (count <= 0) return null;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.72}
      style={[styles.outer, { backgroundColor: base.bgElevated, borderColor: `${base.gold}30` }]}
      accessibilityRole="button"
      accessibilityLabel={`${count} study review prompts due`}
    >
      <View style={[styles.stripe, { backgroundColor: base.gold }]} />
      <Clock size={16} color={base.gold} />
      <View style={styles.textWrap}>
        <Text style={[styles.title, { color: base.text }]}>Review from your study</Text>
        <Text style={[styles.meta, { color: base.textMuted }]}>
          {count === 1 ? '1 prompt due today' : `${count} prompts due today`}
        </Text>
      </View>
      <ChevronRight size={16} color={base.textMuted} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  outer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderRadius: radii.md,
    minHeight: 52,
    overflow: 'hidden',
    paddingRight: spacing.md,
  },
  stripe: {
    width: 3,
    alignSelf: 'stretch',
  },
  textWrap: {
    flex: 1,
    paddingVertical: spacing.sm,
  },
  title: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 14,
  },
  meta: {
    fontFamily: fontFamily.ui,
    fontSize: 11,
    marginTop: 2,
  },
});
