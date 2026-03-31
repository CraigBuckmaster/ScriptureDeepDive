/**
 * FloatingControls — Overlay buttons above the map.
 * Ancient/Modern toggle + Centre button.
 */

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme, spacing, radii, MIN_TOUCH_TARGET, fontFamily } from '../../theme';

interface Props {
  showModern: boolean;
  onToggleNames: () => void;
  onCentre: () => void;
}

export function FloatingControls({ showModern, onToggleNames, onCentre }: Props) {
  const { base } = useTheme();
  return (
    <View style={{
      position: 'absolute', top: spacing.lg, right: spacing.md,
      gap: spacing.xs,
    }}>
      <TouchableOpacity
        onPress={onToggleNames}
        style={{
          backgroundColor: base.bg + 'CC', borderWidth: 1, borderColor: base.border,
          borderRadius: radii.md, paddingHorizontal: spacing.sm, minHeight: MIN_TOUCH_TARGET,
          justifyContent: 'center',
        }}
        accessibilityLabel={showModern ? 'Switch to biblical view' : 'Switch to modern view'}
      >
        <Text style={{ color: base.gold, fontFamily: fontFamily.uiMedium, fontSize: 11 }}>
          {showModern ? 'Biblical' : 'Modern'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={onCentre}
        style={{
          backgroundColor: base.bg + 'CC', borderWidth: 1, borderColor: base.border,
          borderRadius: radii.md, paddingHorizontal: spacing.sm, minHeight: MIN_TOUCH_TARGET,
          justifyContent: 'center',
        }}
        accessibilityLabel="Centre map"
      >
        <Text style={{ color: base.gold, fontFamily: fontFamily.uiMedium, fontSize: 11 }}>
          Centre
        </Text>
      </TouchableOpacity>
    </View>
  );
}
