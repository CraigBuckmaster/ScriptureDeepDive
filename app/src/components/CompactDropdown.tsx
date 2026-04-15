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
import { useTheme, spacing, radii, fontFamily, MIN_TOUCH_TARGET } from '../theme';
import { selectionFeedback } from '../utils/haptics';

export interface DropdownOption {
  key: string;
  label: string;
}

interface Props {
  value: string;
  /** Optional secondary label shown after a pipe in the pill (e.g. "KJV | ASV"). */
  secondaryLabel?: string;
  options: DropdownOption[];
  onSelect: (key: string) => void;
  direction?: 'down' | 'up';
  /** Render slot below the options list (e.g. Compare + button). Receives close callback. */
  renderFooter?: (close: () => void) => React.ReactNode;
}

export function CompactDropdown({ value, secondaryLabel, options, onSelect, direction = 'down', renderFooter }: Props) {
  const { base } = useTheme();
  const [open, setOpen] = useState(false);
  const [pillLayout, setPillLayout] = useState<LayoutRectangle | null>(null);
  const pillRef = useRef<View>(null);

  const primaryLabel = options.find((o) => o.key === value)?.label ?? value.toUpperCase();
  const activeLabel = secondaryLabel ? `${primaryLabel} | ${secondaryLabel}` : primaryLabel;

  const handleOpen = useCallback(() => {
    pillRef.current?.measureInWindow((x, y, width, height) => {
      setPillLayout({ x, y, width, height });
      setOpen(true);
    });
  }, []);

  const handleSelect = useCallback((key: string) => {
    selectionFeedback();
    onSelect(key);
    setOpen(false);
  }, [onSelect]);

  return (
    <View ref={pillRef} collapsable={false}>
      {/* Pill trigger */}
      <TouchableOpacity
        onPress={handleOpen}
        activeOpacity={0.7}
        style={[styles.pill, { backgroundColor: base.bgElevated, borderColor: base.border }]}
        accessibilityRole="button"
        accessibilityLabel={`${activeLabel}, tap to change`}
      >
        <Text style={[styles.pillLabel, { color: base.text }]}>{activeLabel}</Text>
      </TouchableOpacity>

      {/* Dropdown overlay */}
      <Modal visible={open} transparent animationType="fade">
        <TouchableWithoutFeedback onPress={() => setOpen(false)}>
          <View style={styles.backdrop}>
            <TouchableWithoutFeedback>
              <View style={[
                styles.menu,
                { backgroundColor: base.bgElevated, borderColor: base.border },
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
                      accessibilityRole="button"
                      accessibilityLabel={`Select ${opt.label}`}
                      accessibilityState={{ selected: isActive }}
                    >
                      <Text style={[
                        styles.menuLabel,
                        { color: base.text },
                        isActive && { color: base.gold },
                      ]}>
                        {opt.label}
                      </Text>
                      {isActive && <Check size={14} color={base.gold} />}
                    </TouchableOpacity>
                  );
                })}
                {renderFooter && (
                  <>
                    <View style={[styles.footerDivider, { backgroundColor: base.border }]} />
                    {renderFooter(() => setOpen(false))}
                  </>
                )}
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
    borderWidth: 1,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm + 4,
    paddingVertical: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pillLabel: {
    fontFamily: fontFamily.uiSemiBold,
    fontSize: 12,
  },
  backdrop: {
    flex: 1,
  },
  menu: {
    borderWidth: 1,
    borderRadius: radii.md,
    overflow: 'hidden',
    // Subtle shadow on iOS
    shadowColor: '#000', // overlay-color: intentional (RN shadow must be #000 on iOS)
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
    fontFamily: fontFamily.uiMedium,
    fontSize: 14,
  },
  footerDivider: {
    height: 1,
    marginHorizontal: spacing.sm,
  },
});
