/**
 * CollapsibleSection — Animated expand/collapse container.
 *
 * Used for panel content, authorship section, and any expandable UI.
 *
 * Card #1358 (UI polish phase 1):
 *   - Cinzel header title (displayMedium)
 *   - Gold chevron indicator using ChevronDown / ChevronUp
 *   - 3px gold left border accent on the header
 */

import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, LayoutAnimation, Platform, UIManager, StyleSheet } from 'react-native';
import { ChevronDown, ChevronUp } from 'lucide-react-native';
import { useTheme, spacing, fontFamily } from '../theme';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface Props {
  title: string;
  initiallyCollapsed?: boolean;
  accentColor?: string;
  children: React.ReactNode;
}

function CollapsibleSection({ title, initiallyCollapsed = true, accentColor, children }: Props) {
  const { base } = useTheme();
  const [collapsed, setCollapsed] = useState(initiallyCollapsed);
  const accent = accentColor ?? base.gold;

  const toggle = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setCollapsed((prev) => !prev);
  }, []);

  return (
    <View>
      <TouchableOpacity
        onPress={toggle}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityState={{ expanded: !collapsed }}
        accessibilityLabel={`${title}, ${collapsed ? 'collapsed' : 'expanded'}`}
        style={[styles.headerButton, { borderLeftColor: accent }]}
      >
        <Text style={[styles.headerTitle, { color: accent }]}>
          {title}
        </Text>
        {collapsed
          ? <ChevronDown size={16} color={accent} />
          : <ChevronUp size={16} color={accent} />
        }
      </TouchableOpacity>
      {!collapsed && (
        <View style={styles.contentContainer}>
          {children}
        </View>
      )}
    </View>
  );
}

const MemoizedCollapsibleSection = React.memo(CollapsibleSection);
export { MemoizedCollapsibleSection as CollapsibleSection };
export default MemoizedCollapsibleSection;

const styles = StyleSheet.create({
  headerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    paddingLeft: spacing.md,
    paddingRight: spacing.md,
    minHeight: 44,
    borderLeftWidth: 3,
  },
  headerTitle: {
    fontFamily: fontFamily.displayMedium,
    fontSize: 13,
    letterSpacing: 0.8,
  },
  contentContainer: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
});
