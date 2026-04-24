import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { fontFamily, MIN_TOUCH_TARGET, spacing, useTheme } from '../../theme';
import type { GuidedPanelRecommendation } from '../../services/guidedStudy';
import { ConfidenceBadge } from './ConfidenceBadge';

interface Props {
  recommendation: GuidedPanelRecommendation;
  onPress: () => void;
}

export function PanelRecommendationRow({ recommendation, onPress }: Props) {
  const { base } = useTheme();

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[styles.row, { borderBottomColor: `${base.border}55` }]}
      accessibilityRole="button"
      accessibilityLabel={`Open ${recommendation.title}`}
    >
      <View style={styles.textWrap}>
        <View style={styles.titleRow}>
          <Text style={[styles.title, { color: base.text }]}>{recommendation.title}</Text>
          <ConfidenceBadge level={recommendation.confidence} />
        </View>
        <Text style={[styles.subtitle, { color: base.textMuted }]}>{recommendation.subtitle}</Text>
      </View>
      <ChevronRight size={15} color={base.textMuted} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: MIN_TOUCH_TARGET,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderBottomWidth: 1,
    paddingVertical: spacing.sm,
  },
  textWrap: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flexWrap: 'wrap',
  },
  title: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 14,
  },
  subtitle: {
    fontFamily: fontFamily.ui,
    fontSize: 12,
    marginTop: 2,
  },
});
