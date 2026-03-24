/**
 * CompactDropdown — Generic pill-shaped dropdown selector.
 *
 * Closed: compact pill showing the active option label.
 * Open: overlay with options, active item gets a checkmark, tap-outside dismisses.
 * NO CHEVRONS — the pill shape is sufficient affordance.
 *
 * Used by TranslationDropdown (Phase 3) and ViewModeDropdown (Phase 4).
 */

import React, { useState, useRef, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, Modal, StyleSheet,
  TouchableWithoutFeedback, type LayoutRectangle,
} from 'react-native';
import { Check } from 'lucide-react-native';
import { base, spacing, radii, fontFamily, MIN_TOUCH_TARGET } from '../theme';

export interface DropdownOption {
  key: string;
  label: string;
}

interface Props {
  value: string;
  options: DropdownOption[];
  onSelect: (key: string) => void;
  direction?: 'down' | 'up';
}

export function CompactDropdown({ value, options, onSelect, direction = 'down' }: Props) {
  const [open, setOpen] = useState(false);
  const [pillLayout, setPillLayout] = useState<LayoutRectangle | null>(null);
  const pillRef = useRef<View>(null);

  const activeLabel = options.find((o) => o.key === value)?.label ?? value.toUpperCase();

  const handleOpen = useCallback(() => {
    pillRef.current?.measureInWindow((x, y, width, height) => {
      setPillLayout({ x, y, width, height });
      setOpen(true);
    });
  }, []);

  const handleSelect = useCallback((key: string) => {
    onSelect(key);
    setOpen(false);
  }, [onSelect]);

  return (
    <View ref={pillRef} collapsable={false}>
      {/* Pill trigger */}
      <TouchableOpacity
        onPress={handleOpen}
        activeOpacity={0.7}
        style={styles.pill}
        accessibilityRole="button"
        accessibilityLabel={`${activeLabel}, tap to change`}
      >
        <Text style={styles.pillLabel}>{activeLabel}</Text>
      </TouchableOpacity>

      {/* Dropdown overlay */}
      <Modal visible={open} transparent animationType="fade">
        <TouchableWithoutFeedback onPress={() => setOpen(false)}>
          <View style={styles.backdrop}>
            <TouchableWithoutFeedback>
              <View style={[
                styles.menu,
                pillLayout && {
                  position: 'absolute',
                  left: pillLayout.x,
                  minWidth: Math.max(pillLayout.width, 100),
                  ...(direction === 'down'
                    ? { top: pillLayout.y + pillLayout.height + 4 }
                    : { bottom: undefined, top: pillLayout.y - (options.length * MIN_TOUCH_TARGET) - 12 }
                  ),
                },
              ]}>
                {options.map((opt) => {
                  const isActive = opt.key === value;
                  return (
                    <TouchableOpacity
                      key={opt.key}
                      onPress={() => handleSelect(opt.key)}
                      style={styles.menuItem}
                      accessibilityState={{ selected: isActive }}
                    >
                      <Text style={[
                        styles.menuLabel,
                        isActive && styles.menuLabelActive,
                      ]}>
                        {opt.label}
                      </Text>
                      {isActive && <Check size={14} color={base.gold} />}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    backgroundColor: base.bgElevated,
    borderWidth: 1,
    borderColor: base.border,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm + 4,
    paddingVertical: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pillLabel: {
    color: base.text,
    fontFamily: fontFamily.uiSemiBold,
    fontSize: 12,
  },
  backdrop: {
    flex: 1,
  },
  menu: {
    backgroundColor: base.bgElevated,
    borderWidth: 1,
    borderColor: base.border,
    borderRadius: radii.md,
    overflow: 'hidden',
    // Subtle shadow on iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: MIN_TOUCH_TARGET,
    paddingHorizontal: spacing.md,
  },
  menuLabel: {
    color: base.text,
    fontFamily: fontFamily.uiMedium,
    fontSize: 14,
  },
  menuLabelActive: {
    color: base.gold,
  },
});
