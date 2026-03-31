/**
 * ScholarTag — Colored name tag for scholar identification.
 *
 * BG: scholar color at 15% opacity. Text + border: scholar color.
 * Tap → ScholarInfoSheet.
 */

import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { useTheme, fontFamily, radii, spacing } from '../theme';
import { getPanelLabel } from '../utils/panelLabels';

interface Props {
  scholarId: string;
  onPress?: () => void;
}

export function ScholarTag({ scholarId, onPress }: Props) {
  const { getScholarColor } = useTheme();
  const color = getScholarColor(scholarId);
  const label = getPanelLabel(scholarId);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      disabled={!onPress}
      accessibilityRole="button"
      accessibilityLabel={`Scholar: ${label}`}
      style={{
        backgroundColor: color + '26', // 15% opacity
        borderWidth: 1,
        borderColor: color + '66', // 40% opacity
        borderRadius: radii.sm,
        paddingHorizontal: spacing.sm,
        paddingVertical: 3,
        alignSelf: 'flex-start',
      }}
    >
      <Text style={{
        color,
        fontFamily: fontFamily.display,
        fontSize: 10,
        letterSpacing: 0.3,
      }}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}
