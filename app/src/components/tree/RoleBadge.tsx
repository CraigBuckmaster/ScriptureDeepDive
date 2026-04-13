/**
 * RoleBadge — Tiny 16px circular badge hinting at a person's role.
 *
 * Kings → 'K', Patriarchs → 'P', Priests → 'Pr' (plain unicode — no icon fonts),
 * Prophets → '*', Judges → 'J', Tribes → 'T'. Falls back to a dot for unknown
 * roles.
 *
 * Part of Card #1265 (Genealogy redesign Phase 1).
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme, fontFamily } from '../../theme';

export type PersonRole =
  | 'king'
  | 'patriarch'
  | 'priest'
  | 'prophet'
  | 'judge'
  | 'tribe'
  | string
  | null
  | undefined;

export interface RoleBadgeConfig {
  /** 1-2 character glyph shown inside the badge. Unicode only — no icon fonts. */
  label: string;
  /** Colour key from the theme. */
  color: string;
}

export interface RoleBadgeProps {
  role: PersonRole;
  /** Size in points. Defaults to 16. */
  size?: number;
  /** Era colour — used for roles that are era-tinted (patriarch, tribe, judge). */
  eraColor?: string;
}

/** Derive badge config from the role + theme palette. Returns null for unknown roles. */
export function getRoleBadgeConfig(
  role: PersonRole,
  palette: { gold: string; eraColor?: string },
): RoleBadgeConfig | null {
  switch (role) {
    case 'king':
      return { label: 'K', color: palette.gold };
    case 'patriarch':
      return { label: 'P', color: palette.eraColor ?? palette.gold };
    case 'priest':
      return { label: '⛊', color: '#90a0b0' }; // intentional — neutral priestly blue-gray
    case 'prophet':
      return { label: '✧', color: '#a090c0' }; // intentional — neutral prophetic violet
    case 'judge':
      return { label: 'J', color: palette.eraColor ?? palette.gold };
    case 'tribe':
      return { label: 'T', color: palette.eraColor ?? palette.gold };
    default:
      return null;
  }
}

export function RoleBadge({ role, size = 16, eraColor }: RoleBadgeProps) {
  const { base } = useTheme();
  const config = getRoleBadgeConfig(role, { gold: base.gold, eraColor });
  if (!config) return null;

  return (
    <View
      accessibilityLabel={`${role} role badge`}
      style={[
        styles.badge,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: config.color + '22',
          borderColor: config.color,
        },
      ]}
    >
      <Text
        style={[
          styles.label,
          {
            color: config.color,
            fontSize: Math.round(size * 0.55),
            lineHeight: size,
          },
        ]}
      >
        {config.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontFamily: fontFamily.uiMedium,
    textAlign: 'center',
    includeFontPadding: false,
  },
});
