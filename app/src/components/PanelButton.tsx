/**
 * PanelButton — Single toggle button for panel activation.
 *
 * Default: solid dark bg + tinted border. Active: accent bg 20% + accent text.
 * Scholar buttons use getScholarColor(). Cinzel 10pt. 32px height + hitSlop.
 */

import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { getPanelColors, getScholarColor, base, radii, fontFamily } from '../theme';
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
      hitSlop={{ top: 6, bottom: 6, left: 2, right: 2 }}
      accessibilityRole="button"
      accessibilityState={{ selected: isActive }}
      accessibilityLabel={`${label} panel${isActive ? ', open' : ''}`}
      style={{
        backgroundColor: isActive ? accent + '33' : base.bg + 'EE',
        borderWidth: 1,
        borderColor: isActive ? accent : accent + '40',
        borderRadius: radii.sm,
        paddingHorizontal: 10,
        height: 32,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Text style={{
        color: isActive ? accent : base.textDim,
        fontFamily: fontFamily.display,
        fontSize: 10,
        letterSpacing: 0.3,
      }}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}
