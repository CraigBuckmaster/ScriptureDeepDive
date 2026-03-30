/**
 * PanelContainer — Expand/collapse wrapper for panel content.
 *
 * Left border (3px accent) + bg + padding. Close ✕ in top-right.
 * Renders PanelRenderer inside.
 */

import React, { useMemo } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, LayoutAnimation, Platform, UIManager } from 'react-native';
import { PanelRenderer } from './panels/PanelRenderer';
import { getPanelColors, base, spacing } from '../theme';
import type { ParsedRef } from '../types';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface Props {
  panelType: string;
  contentJson: string;
  isOpen: boolean;
  onClose?: () => void;
  onRefPress?: (ref: ParsedRef) => void;
  onWordStudyPress?: (word: string) => void;
  onScholarPress?: (scholarId: string) => void;
  onPersonPress?: (name: string) => void;
  onPlacePress?: (name: string) => void;
  onEventPress?: (name: string) => void;
}

export function PanelContainer({
  panelType, contentJson, isOpen, onClose,
  onRefPress, onWordStudyPress, onScholarPress,
  onPersonPress, onPlacePress, onEventPress,
}: Props) {
  if (!isOpen) return null;

  const colors = getPanelColors(panelType);
  const panelStyle = useMemo(() => ({
    backgroundColor: colors.bg,
    borderLeftColor: colors.accent,
  }), [colors.bg, colors.accent]);

  return (
    <View
      style={[styles.panel, panelStyle]}
      accessibilityLiveRegion="polite"
    >
      {/* Close button */}
      {onClose && (
        <TouchableOpacity
          onPress={onClose}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityLabel="Close panel"
          accessibilityRole="button"
          style={styles.closeButton}
        >
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>
      )}

      <PanelRenderer
        panelType={panelType}
        contentJson={contentJson}
        onRefPress={onRefPress}
        onWordStudyPress={onWordStudyPress}
        onScholarPress={onScholarPress}
        onPersonPress={onPersonPress}
        onPlacePress={onPlacePress}
        onEventPress={onEventPress}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    borderLeftWidth: 3,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    marginHorizontal: 4,
    marginBottom: spacing.sm,
  },
  closeButton: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  closeText: {
    color: base.textMuted,
    fontSize: 16,
    lineHeight: 18,
  },
});
