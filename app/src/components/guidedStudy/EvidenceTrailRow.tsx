import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Check, ChevronRight } from 'lucide-react-native';
import { fontFamily, MIN_TOUCH_TARGET, radii, spacing, useTheme } from '../../theme';
import type { GuidedEvidenceTrailItem } from '../../services/guidedStudy';
import { ConfidenceBadge } from './ConfidenceBadge';

interface Props {
  item: GuidedEvidenceTrailItem;
  index: number;
  onPress: () => void;
  /** Gold check when this trail key was already opened (#1835). */
  visited?: boolean;
}

export function EvidenceTrailRow({ item, index, onPress, visited = false }: Props) {
  const { base } = useTheme();
  const isFirst = index === 0;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.72}
      style={[
        styles.row,
        {
          backgroundColor: isFirst ? `${base.gold}10` : base.bgElevated,
          borderColor: isFirst ? `${base.gold}35` : `${base.border}99`,
        },
      ]}
      accessibilityRole="button"
      accessibilityLabel={visited ? `Open ${item.title}, visited` : `Open ${item.title}`}
    >
      <View style={[styles.stripe, { backgroundColor: base.gold }]} />
      <View style={[styles.indexPill, { borderColor: `${base.gold}45` }]}>
        <Text style={[styles.indexText, { color: base.gold }]}>{index + 1}</Text>
      </View>
      <View style={styles.textWrap}>
        <View style={styles.titleRow}>
          <Text style={[styles.title, { color: base.text }]}>{item.title}</Text>
          <View style={[styles.badge, { borderColor: `${base.gold}30` }]}>
            <Text style={[styles.badgeText, { color: base.gold }]}>{item.badge}</Text>
          </View>
          <ConfidenceBadge level={item.confidence} />
        </View>
        <Text style={[styles.subtitle, { color: base.textMuted }]}>{item.subtitle}</Text>
      </View>
      {visited ? (
        <View testID={`trail-visited-${item.key}`}>
          <Check size={15} color={base.gold} />
        </View>
      ) : (
        <ChevronRight size={15} color={base.textMuted} />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: MIN_TOUCH_TARGET,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderRadius: radii.md,
    overflow: 'hidden',
    paddingRight: spacing.sm,
  },
  stripe: {
    width: 3,
    alignSelf: 'stretch',
  },
  indexPill: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  indexText: {
    fontFamily: fontFamily.uiSemiBold,
    fontSize: 11,
  },
  textWrap: {
    flex: 1,
    paddingVertical: spacing.sm,
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
  badge: {
    borderWidth: 1,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
  },
  badgeText: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 10,
  },
});
