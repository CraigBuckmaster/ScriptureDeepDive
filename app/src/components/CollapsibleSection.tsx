/**
 * CollapsibleSection — Animated expand/collapse container.
 *
 * Used for panel content, authorship section, and any expandable UI.
 */

import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, LayoutAnimation, Platform, UIManager } from 'react-native';
import { Plus, Minus } from 'lucide-react-native';
import { base, spacing, fontFamily } from '../theme';

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

export function CollapsibleSection({ title, initiallyCollapsed = true, accentColor, children }: Props) {
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
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingVertical: spacing.sm,
          paddingHorizontal: spacing.md,
          minHeight: 44,
        }}
      >
        <Text style={{
          color: accent,
          fontFamily: fontFamily.display,
          fontSize: 12,
          letterSpacing: 0.4,
        }}>
          {title}
        </Text>
        {collapsed
          ? <Plus size={14} color={base.textMuted} />
          : <Minus size={14} color={base.textMuted} />
        }
      </TouchableOpacity>
      {!collapsed && (
        <View style={{ paddingHorizontal: spacing.md, paddingBottom: spacing.md }}>
          {children}
        </View>
      )}
    </View>
  );
}
