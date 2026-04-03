/**
 * ArchaeologyBadge — Small badge indicator for sections with archaeological evidence.
 *
 * Displays a "🏛" icon badge. Intended to be placed inside SectionBlock headers
 * when the section has associated archaeological discoveries.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme, spacing, fontFamily } from '../theme';

interface ArchaeologyBadgeProps {
  /** Optional size variant */
  size?: 'small' | 'default';
}

function ArchaeologyBadgeInner({ size = 'default' }: ArchaeologyBadgeProps) {
  const { base } = useTheme();
  const isSmall = size === 'small';

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: base.gold + '15',
          borderColor: base.gold + '30',
        },
        isSmall && styles.badgeSmall,
      ]}
    >
      <Text style={[styles.icon, isSmall && styles.iconSmall]}>🏛</Text>
      {!isSmall && (
        <Text style={[styles.label, { color: base.gold }]}>Evidence</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    gap: 3,
  },
  badgeSmall: {
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  icon: {
    fontSize: 12,
  },
  iconSmall: {
    fontSize: 10,
  },
  label: {
    fontFamily: fontFamily.display,
    fontSize: 9,
    letterSpacing: 0.3,
  },
});

export const ArchaeologyBadge = React.memo(ArchaeologyBadgeInner);
