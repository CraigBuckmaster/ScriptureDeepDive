/**
 * PanelButton — Single toggle button for panel activation.
 *
 * Default: border + textDim. Active: accent bg 20% + accent text.
 * Scholar buttons use getScholarColor(). Cinzel 10-11pt. Min 44pt touch.
 */

import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { getPanelColors, getScholarColor, base, radii, MIN_TOUCH_TARGET } from '../theme';
import { getPanelLabel, isScholarPanel } from '../utils/panelLabels';

interface Props {
  panelType: string;
  isActive: boolean;
  onPress: () => void;
}

export function PanelButton({ panelType, isActive, onPress }: Props) {
  const scholar = isScholarPanel(panelType);
  const accent = scholar ? getScholarColor(panelType) : getPanelColors(panelType).accent;
  const label = getPanelLabel(panelType);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityState={{ selected: isActive }}
      accessibilityLabel={`${label} panel${isActive ? ', open' : ''}`}
      style={{
        backgroundColor: isActive ? accent + '33' : 'transparent',
        borderWidth: 1,
        borderColor: isActive ? accent : base.border,
        borderRadius: radii.sm,
        paddingHorizontal: 10,
        minHeight: MIN_TOUCH_TARGET,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Text style={{
        color: isActive ? accent : base.textDim,
        fontFamily: 'Cinzel_400Regular',
        fontSize: 10,
        letterSpacing: 0.3,
      }}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}
