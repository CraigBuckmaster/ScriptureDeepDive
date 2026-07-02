import React, { useCallback, useState } from 'react';
import {
  LayoutAnimation,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from 'react-native';
import { ChevronDown, ChevronUp } from 'lucide-react-native';
import { fontFamily, radii, spacing, useTheme } from '../../theme';
import type { GuidedStudyStep } from '../../types';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const COLLAPSED_PREVIEW_CHARS = 80;

export interface CarriedForwardItem {
  sourceStep: GuidedStudyStep;
  label: string;
  content: string;
  /**
   * Observation-chip selections (#1839). When present, the expanded
   * banner renders these as pills; `content` stays as the collapsed
   * preview / screen-reader text.
   */
  chips?: string[];
}

interface CarriedForwardBannerProps {
  items: CarriedForwardItem[];
  defaultCollapsed?: boolean;
}

function previewOf(content: string): string {
  if (content.length <= COLLAPSED_PREVIEW_CHARS) return content;
  return `${content.slice(0, COLLAPSED_PREVIEW_CHARS).trimEnd()}…`;
}

export function CarriedForwardBanner({
  items,
  defaultCollapsed = true,
}: CarriedForwardBannerProps) {
  const { base } = useTheme();
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  const toggle = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setCollapsed((prev) => !prev);
  }, []);

  if (items.length === 0) return null;

  return (
    <TouchableOpacity
      onPress={toggle}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityState={{ expanded: !collapsed }}
      accessibilityLabel={`Carried forward from earlier steps, ${
        collapsed ? 'collapsed' : 'expanded'
      }`}
      style={[
        styles.outer,
        { backgroundColor: base.bgElevated, borderColor: `${base.gold}20` },
      ]}
    >
      <View style={styles.headerRow}>
        <Text style={[styles.headerLabel, { color: base.textMuted }]}>CARRIED FORWARD</Text>
        {collapsed ? (
          <ChevronDown size={14} color={base.textMuted} />
        ) : (
          <ChevronUp size={14} color={base.textMuted} />
        )}
      </View>
      {items.map((item, idx) => (
        <View
          key={`${item.sourceStep}-${idx}`}
          style={idx > 0 ? styles.itemSpacing : undefined}
        >
          <Text style={[styles.itemLabel, { color: base.textMuted }]}>
            {item.label.toUpperCase()}
          </Text>
          {item.chips && item.chips.length > 0 && !collapsed ? (
            <View style={styles.chipRow}>
              {item.chips.map((chip) => (
                <View key={chip} style={[styles.chip, { borderColor: `${base.gold}35` }]}>
                  <Text style={[styles.chipText, { color: base.gold }]}>{chip}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={[styles.itemContent, { color: base.textDim }]}>
              {collapsed ? previewOf(item.content) : item.content}
            </Text>
          )}
        </View>
      ))}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  outer: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  headerLabel: {
    fontFamily: fontFamily.uiSemiBold,
    fontSize: 10,
    letterSpacing: 1,
  },
  itemSpacing: {
    marginTop: spacing.xs,
  },
  itemLabel: {
    fontFamily: fontFamily.uiSemiBold,
    fontSize: 10,
    letterSpacing: 1,
    marginBottom: 2,
  },
  itemContent: {
    fontFamily: fontFamily.body,
    fontSize: 13,
    lineHeight: 20,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 2,
  },
  chip: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  chipText: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 11,
  },
});
