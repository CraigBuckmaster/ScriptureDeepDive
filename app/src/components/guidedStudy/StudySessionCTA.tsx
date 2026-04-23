import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BookOpen, ChevronRight } from 'lucide-react-native';
import { fontFamily, radii, spacing, useTheme } from '../../theme';
import type { StudyDepthEstimate } from '../../services/guidedStudy';

interface Props {
  estimate: StudyDepthEstimate;
  onPress: () => void;
}

export function StudySessionCTA({ estimate, onPress }: Props) {
  const { base } = useTheme();

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.72}
      style={[styles.outer, { backgroundColor: base.bgElevated, borderColor: `${base.gold}30` }]}
      accessibilityRole="button"
      accessibilityLabel="Study this chapter"
    >
      <View style={[styles.stripe, { backgroundColor: base.gold }]} />
      <View style={styles.iconWrap}>
        <BookOpen size={17} color={base.gold} />
      </View>
      <View style={styles.textWrap}>
        <Text style={[styles.title, { color: base.text }]}>Study this chapter</Text>
        <Text style={[styles.meta, { color: base.textMuted }]}>
          {`${estimate.readMin} min read · ${estimate.guidedMin} min guided · ${estimate.deepMin} min deep`}
        </Text>
      </View>
      <ChevronRight size={16} color={base.textMuted} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  outer: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderRadius: radii.md,
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  stripe: {
    width: 3,
    alignSelf: 'stretch',
  },
  iconWrap: {
    paddingLeft: spacing.sm,
    paddingRight: spacing.xs,
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
