/**
 * PanelContainer — Expand/collapse wrapper for panel content.
 *
 * Left border (3px accent) + bg + padding. Close ✕ in top-right.
 * Renders PanelRenderer inside.
 */

import React, { useMemo } from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import Animated, { FadeIn, LinearTransition } from 'react-native-reanimated';
import { useTheme, spacing } from '../theme';
import { lightImpact } from '../utils/haptics';
import type { ParsedRef } from '../types';
import { PanelRenderer } from './panels/PanelRenderer';

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
  /** Override the initial tab for composite panels (deep-link). */
  defaultTab?: string;
}

export function PanelContainer({
  panelType, contentJson, isOpen, onClose,
  onRefPress, onWordStudyPress, onScholarPress,
  onPersonPress, onPlacePress, onEventPress,
  defaultTab,
}: Props) {
  const { base, getPanelColors } = useTheme();

  // panelStyle must be computed before any early return so hook call order
  // stays consistent across renders. getPanelColors() is pure (theme-keyed).
  const colors = getPanelColors(panelType);
  const panelStyle = useMemo(() => ({
    backgroundColor: colors.bg,
    borderLeftColor: colors.accent,
  }), [colors.bg, colors.accent]);

  if (!isOpen) return null;

  return (
    <Animated.View
      entering={FadeIn.duration(150)}
      layout={LinearTransition.duration(150)}
      style={[styles.panel, panelStyle]}
      accessibilityLiveRegion="polite"
    >
      {/* Close button */}
      {onClose && (
        <TouchableOpacity
          onPress={() => { lightImpact(); onClose(); }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityLabel="Close panel"
          accessibilityRole="button"
          style={styles.closeButton}
        >
          <Text style={[styles.closeText, { color: base.textMuted }]}>✕</Text>
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
        defaultTab={defaultTab}
      />
    </Animated.View>
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
    fontSize: 16,
    lineHeight: 18,
  },
});
