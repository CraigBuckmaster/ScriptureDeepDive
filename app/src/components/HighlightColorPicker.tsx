/**
 * HighlightColorPicker — 6 color circles + remove option.
 * Modal popup triggered by long-press → Highlight action.
 */

import React from 'react';
import { Alert, View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { useTheme, spacing, radii, fontFamily } from '../theme';
import { selectionFeedback } from '../utils/haptics';

export const HIGHLIGHT_COLORS = [
  { name: 'gold', hex: '#bfa050', label: 'Key verses' }, // data-color: intentional
  { name: 'blue', hex: '#5b8fb9', label: 'Commands' }, // data-color: intentional
  { name: 'green', hex: '#5fa87a', label: 'Prayers' }, // data-color: intentional
  { name: 'purple', hex: '#8b7cb8', label: 'Study later' }, // data-color: intentional
  { name: 'coral', hex: '#c47a6a', label: 'Prophecy' }, // data-color: intentional
  { name: 'teal', hex: '#5ba8a0', label: 'Themes' }, // data-color: intentional
];

interface Props {
  visible: boolean;
  currentColor: string | null;
  onSelect: (color: string | null) => void;
  onClose: () => void;
}

export function HighlightColorPicker({ visible, currentColor, onSelect, onClose }: Props) {
  const { base } = useTheme();

  return (
    <Modal visible={visible} transparent animationType="fade">
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose}>
        <View style={[styles.card, { backgroundColor: base.bgElevated, borderColor: base.border }]}>
          <Text style={[styles.label, { color: base.textMuted }]}>HIGHLIGHT COLOR</Text>

          <View style={styles.colorRow}>
            {HIGHLIGHT_COLORS.map((c) => {
              const isActive = currentColor === c.name;
              return (
                <TouchableOpacity
                  key={c.name}
                  onPress={() => { selectionFeedback(); onSelect(c.name); onClose(); }}
                  style={[
                    styles.circle,
                    { backgroundColor: c.hex + '60', borderColor: isActive ? c.hex : c.hex + '40' },
                    isActive && styles.circleActive,
                  ]}
                  accessibilityLabel={`${c.label} (${c.name})`}
                >
                  {isActive && <Text style={styles.checkmark}>✓</Text>}
                </TouchableOpacity>
              );
            })}
          </View>

          {currentColor && (
            <TouchableOpacity
              onPress={() => {
                Alert.alert('Remove Highlight', 'Remove this highlight?', [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Remove', style: 'destructive', onPress: () => { onSelect(null); onClose(); } },
                ]);
              }}
              style={styles.removeButton}
            >
              <Text style={[styles.removeLabel, { color: base.textMuted }]}>Remove highlight</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)', // overlay-color: intentional
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    borderRadius: radii.lg,
    padding: spacing.md,
    borderWidth: 1,
    width: 280,
  },
  label: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 10,
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  colorRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm + 2,
    marginBottom: spacing.md,
  },
  circle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleActive: {
    borderWidth: 3,
  },
  checkmark: {
    color: '#fff',
    fontSize: 14,
  },
  removeButton: {
    alignSelf: 'center',
  },
  removeLabel: {
    fontFamily: fontFamily.ui,
    fontSize: 12,
  },
});
