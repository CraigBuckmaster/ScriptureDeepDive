/**
 * CollapsibleSection — Animated expand/collapse container.
 *
 * Used for panel content, authorship section, and any expandable UI.
 */

import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, LayoutAnimation, Platform, UIManager, StyleSheet } from 'react-native';
import { Plus, Minus } from 'lucide-react-native';
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
        style={styles.headerButton}
      >
        <Text style={[styles.headerTitle, { color: accent }]}>
          {title}
        </Text>
        {collapsed
          ? <Plus size={14} color={base.textMuted} />
          : <Minus size={14} color={base.textMuted} />
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
    paddingHorizontal: spacing.md,
    minHeight: 44,
  },
  headerTitle: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 12,
    letterSpacing: 0.4,
  },
  contentContainer: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
});
