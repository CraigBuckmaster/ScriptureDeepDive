/**
 * HighlightColorPicker — 5 color circles + remove option.
 * Triggered by long-pressing verse text.
 */

import React from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { base, spacing, radii, fontFamily } from '../theme';

const HIGHLIGHT_COLORS = [
  { name: 'gold', hex: '#c9a84c', label: 'Key verses' },
  { name: 'blue', hex: '#5a7ab0', label: 'Commands' },
  { name: 'green', hex: '#4a8a5a', label: 'Prayers' },
  { name: 'pink', hex: '#c04a6a', label: 'Prophecy' },
  { name: 'purple', hex: '#8a5ab0', label: 'Study later' },
];

export { HIGHLIGHT_COLORS };

interface Props {
  visible: boolean;
  currentColor: string | null;
  onSelect: (color: string | null) => void;
  onClose: () => void;
}

export function HighlightColorPicker({ visible, currentColor, onSelect, onClose }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <TouchableOpacity style={{ flex: 1, backgroundColor: '#00000066', justifyContent: 'center', alignItems: 'center' }} activeOpacity={1} onPress={onClose}>
        <View style={{
          backgroundColor: base.bgElevated, borderRadius: radii.lg,
          padding: spacing.md, borderWidth: 1, borderColor: base.border,
          width: 260,
        }}>
          <Text style={{ color: base.textMuted, fontFamily: fontFamily.display, fontSize: 10, letterSpacing: 0.5, marginBottom: spacing.sm, textAlign: 'center' }}>
            HIGHLIGHT COLOR
          </Text>

          <View style={{ flexDirection: 'row', justifyContent: 'center', gap: spacing.md, marginBottom: spacing.md }}>
            {HIGHLIGHT_COLORS.map((c) => (
              <TouchableOpacity
                key={c.name}
                onPress={() => { onSelect(c.name); onClose(); }}
                style={{
                  width: 36, height: 36, borderRadius: 18,
                  backgroundColor: c.hex + '60',
                  borderWidth: currentColor === c.name ? 3 : 1,
                  borderColor: currentColor === c.name ? c.hex : c.hex + '40',
                  justifyContent: 'center', alignItems: 'center',
                }}
                accessibilityLabel={`${c.label} (${c.name})`}
              >
                {currentColor === c.name && <Text style={{ color: '#fff', fontSize: 14 }}>✓</Text>}
              </TouchableOpacity>
            ))}
          </View>

          {currentColor && (
            <TouchableOpacity onPress={() => { onSelect(null); onClose(); }} style={{ alignSelf: 'center' }}>
              <Text style={{ color: base.textMuted, fontSize: 12 }}>Remove highlight</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    </Modal>
  );
}
