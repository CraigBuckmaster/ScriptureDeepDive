/**
 * DetailTabBar — Shared tab bar for detail screens with internal tabs.
 *
 * Active tab gets a gold text color and a 2px gold underline indicator.
 * Inactive tabs show muted text on a transparent background. No full-width
 * tab highlight — the underline is the only active affordance.
 *
 * Card #1360 (UI polish phase 3). Used by ConceptDetail (Overview/Journey),
 * DebateDetail (if/when tabs are added), PersonDetail.
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme, spacing, fontFamily } from '../theme';

export interface DetailTab<K extends string = string> {
  key: K;
  label: string;
}

interface Props<K extends string> {
  tabs: DetailTab<K>[];
  active: K;
  onChange: (key: K) => void;
}

export function DetailTabBar<K extends string>({ tabs, active, onChange }: Props<K>) {
  const { base } = useTheme();

  return (
    <View style={[styles.bar, { borderBottomColor: base.border }]}>
      {tabs.map((tab) => {
        const isActive = tab.key === active;
        return (
          <TouchableOpacity
            key={tab.key}
            onPress={() => onChange(tab.key)}
            accessibilityRole="tab"
            accessibilityLabel={`${tab.label} tab`}
            accessibilityState={{ selected: isActive }}
            style={styles.tab}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.tabText,
                { color: isActive ? base.gold : base.textMuted },
              ]}
            >
              {tab.label}
            </Text>
            <View
              style={[
                styles.underline,
                { backgroundColor: isActive ? base.gold : 'transparent' },
              ]}
            />
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingTop: spacing.sm + 2,
    paddingBottom: 0,
  },
  tabText: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 13,
    marginBottom: spacing.xs,
  },
  underline: {
    height: 2,
    width: '50%',
    borderTopLeftRadius: 1,
    borderTopRightRadius: 1,
  },
});
