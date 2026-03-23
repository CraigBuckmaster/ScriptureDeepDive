/**
 * PanelContainer — Animated expand/collapse wrapper for panel content.
 *
 * Left border (3px accent) + bg + padding. Renders PanelRenderer inside.
 */

import React from 'react';
import { View, LayoutAnimation, Platform, UIManager } from 'react-native';
import { PanelRenderer } from './panels/PanelRenderer';
import { getPanelColors, spacing } from '../theme';
import type { ParsedRef } from '../types';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface Props {
  panelType: string;
  contentJson: string;
  isOpen: boolean;
  onRefPress?: (ref: ParsedRef) => void;
  onWordStudyPress?: (word: string) => void;
  onScholarPress?: (scholarId: string) => void;
  onPersonPress?: (name: string) => void;
  onPlacePress?: (name: string) => void;
  onEventPress?: (name: string) => void;
}

export function PanelContainer({
  panelType, contentJson, isOpen,
  onRefPress, onWordStudyPress, onScholarPress,
  onPersonPress, onPlacePress, onEventPress,
}: Props) {
  if (!isOpen) return null;

  const colors = getPanelColors(panelType);

  return (
    <View
      style={{
        backgroundColor: colors.bg,
        borderLeftWidth: 3,
        borderLeftColor: colors.accent,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.md,
        marginHorizontal: spacing.sm,
        marginBottom: spacing.sm,
      }}
      accessibilityLiveRegion="polite"
    >
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
