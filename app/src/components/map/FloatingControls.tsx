/**
 * FloatingControls — Overlay buttons above the map.
 * Ancient/Modern toggle + Centre button.
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme, spacing, radii, MIN_TOUCH_TARGET, fontFamily } from '../../theme';

interface Props {
  showModern: boolean;
  onToggleNames: () => void;
  onCentre: () => void;
}

export function FloatingControls({ showModern, onToggleNames, onCentre }: Props) {
  const { base } = useTheme();
  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={onToggleNames}
        style={[styles.controlButton, { backgroundColor: base.bg + 'CC', borderColor: base.border }]}
        accessibilityLabel={showModern ? 'Switch to biblical view' : 'Switch to modern view'}
      >
        <Text style={[styles.controlButtonText, { color: base.gold }]}>
          {showModern ? 'Biblical' : 'Modern'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={onCentre}
        style={[styles.controlButton, { backgroundColor: base.bg + 'CC', borderColor: base.border }]}
        accessibilityLabel="Centre map"
      >
        <Text style={[styles.controlButtonText, { color: base.gold }]}>
          Centre
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: spacing.lg,
    right: spacing.md,
    gap: spacing.xs,
  },
  controlButton: {
    borderWidth: 1,
    borderRadius: radii.md,
    paddingHorizontal: spacing.sm,
    minHeight: MIN_TOUCH_TARGET,
    justifyContent: 'center',
  },
  controlButtonText: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 11,
  },
});
