/**
 * FeatureCard — Individual card in an Explore feature carousel.
 *
 * 140px fixed width with title (accent color), subtitle,
 * and optional premium badge.
 *
 * Part of Epic #1048 (#1054).
 */

import React from 'react';
import { Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import { useTheme, spacing, radii, fontFamily } from '../theme';

export interface FeatureCardData {
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  screen: string;
  params?: Record<string, any>;
  premium?: boolean;
}

interface Props {
  feature: FeatureCardData;
  onPress: () => void;
  isPremium: boolean;
}

export function FeatureCard({ feature, onPress, isPremium }: Props) {
  const { base } = useTheme();
  const isLocked = feature.premium && !isPremium;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`${feature.title}: ${feature.subtitle}${isLocked ? ', requires Companion+' : ''}`}
      style={[styles.card, {
        backgroundColor: base.bgElevated,
        borderColor: feature.color + '20',
      }]}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: feature.color }]} numberOfLines={1}>
          {feature.title}
        </Text>
        {isLocked && <Text style={[styles.lockIcon, { color: base.gold }]}>✦</Text>}
      </View>
      <Text style={[styles.subtitle, { color: base.textMuted }]} numberOfLines={2}>
        {feature.subtitle}
      </Text>
    </TouchableOpacity>
  );
}

const CARD_WIDTH = 148;

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing.sm + 2,
    minHeight: 72,
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 3,
  },
  title: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 12,
    flex: 1,
  },
  lockIcon: {
    fontSize: 10,
  },
  subtitle: {
    fontFamily: fontFamily.ui,
    fontSize: 10,
    lineHeight: 14,
  },
});

export { CARD_WIDTH };
