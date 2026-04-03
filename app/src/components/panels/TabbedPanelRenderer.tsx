/**
 * TabbedPanelRenderer — Reusable tabbed container for composite panels.
 *
 * Used by Phases 2-4 and Phase 8 to render multi-tab views inside
 * existing panel containers. Manages tab state internally.
 *
 * Behavior:
 * - Defaults to the first tab with hasData: true
 * - Tabs with hasData: false are hidden
 * - If only one tab has data, no tab bar renders (standard panel)
 */

import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme, spacing, fontFamily } from '../../theme';

export interface TabConfig {
  /** Unique key for this tab, e.g. 'historical', 'audience', 'ane' */
  key: string;
  /** Display label, e.g. 'Historical', 'Audience', 'ANE' */
  label: string;
  /** false = tab hidden (graceful degradation) */
  hasData: boolean;
}

interface TabbedPanelRendererProps {
  tabs: TabConfig[];
  /** If provided, override the initial active tab selection. */
  defaultTab?: string;
  children?: (activeTabKey: string) => React.ReactNode;
}

export function TabbedPanelRenderer({ tabs, defaultTab, children }: TabbedPanelRendererProps) {
  const { base } = useTheme();

  const visibleTabs = useMemo(
    () => tabs.filter((t) => t.hasData),
    [tabs],
  );

  const [activeKey, setActiveKey] = useState<string>(() => {
    if (defaultTab) {
      const match = visibleTabs.find((t) => t.key === defaultTab);
      if (match) return match.key;
    }
    return visibleTabs[0]?.key ?? '';
  });

  // If no tabs have data, render nothing
  if (visibleTabs.length === 0) return null;

  // Single tab — skip tab bar, render content directly
  if (visibleTabs.length === 1) {
    return <>{children?.(visibleTabs[0].key)}</>;
  }

  return (
    <View>
      {/* Tab bar */}
      <View style={[styles.tabBar, { borderBottomColor: base.border }]}>
        {visibleTabs.map((tab) => {
          const isActive = tab.key === activeKey;
          return (
            <TouchableOpacity
              key={tab.key}
              onPress={() => setActiveKey(tab.key)}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={`${tab.label} tab`}
              accessibilityState={{ selected: isActive }}
              style={[styles.tab, isActive && [styles.tabActive, { borderBottomColor: base.gold, backgroundColor: base.gold + '12' }]]}
            >
              <Text style={[styles.tabLabel, { color: base.textMuted }, isActive && { color: base.gold, fontWeight: '700' }]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Active tab content */}
      {children?.(activeKey)}
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tab: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.sm,
  },
  tabActive: {
    borderBottomWidth: 2,
  },
  tabLabel: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 12,
    fontWeight: '500',
  },
});
