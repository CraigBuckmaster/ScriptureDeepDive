/**
 * PanelButton — Single toggle button for panel activation.
 *
 * Unified gold styling:
 *   Inactive: dark bg, faint gold border, dim text
 *   Active:   gold tint bg, solid gold border, gold text
 *
 * Content panels (heb, hist, ctx, cross, etc.) = square (borderRadius 6)
 * Scholar panels (mac, calvin, sarna, etc.) = pill (borderRadius 16)
 *
 * Panel-specific accent colors are NOT used on buttons — only on the
 * panel content itself (left border, header text).
 */

import React from 'react';
import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme, radii, fontFamily } from '../theme';
import { getPanelLabel, isScholarPanel } from '../utils/panelLabels';
import { lightImpact } from '../utils/haptics';

interface Props {
  panelType: string;
  isActive: boolean;
  onPress: () => void;
}

export function PanelButton({ panelType, isActive, onPress }: Props) {
  const { base } = useTheme();
  const isScholar = isScholarPanel(panelType);
  const label = getPanelLabel(panelType);

  return (
    <TouchableOpacity
      onPress={() => { lightImpact(); onPress(); }}
      activeOpacity={0.7}
      hitSlop={{ top: 6, bottom: 6, left: 2, right: 2 }}
      accessibilityRole="button"
      accessibilityState={{ selected: isActive }}
      accessibilityLabel={`${label} panel${isActive ? ', open' : ''}`}
      style={[
        styles.button,
        {
          backgroundColor: isActive ? base.gold + '25' : base.bg + 'EE',
          borderColor: isActive ? base.gold : base.gold + '30',
          borderRadius: isScholar ? 16 : radii.md,
        },
      ]}
    >
      <Text style={[styles.label, { color: isActive ? base.gold : base.textDim }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 12,
  },
});
