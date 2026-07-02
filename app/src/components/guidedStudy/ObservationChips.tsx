/**
 * components/guidedStudy/ObservationChips.tsx — Selectable observation
 * pills under the Observe prompts (#1839, friction phase A). Chips are
 * an ADDITION to the free-text inputs, never a replacement; skipping
 * them carries no visual punishment (no error/em-dash states).
 */
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { GuidedConceptChip } from '../../services/guidedStudy';
import { fontFamily, spacing, useTheme } from '../../theme';

interface Props {
  chips: GuidedConceptChip[];
  /** Selected chip labels (persisted as CapturedInputs.observeSelections). */
  selected: string[];
  onToggle: (label: string) => void;
}

export function ObservationChips({ chips, selected, onToggle }: Props) {
  const { base } = useTheme();

  if (chips.length === 0) return null;

  return (
    <View style={styles.wrap}>
      <Text style={[styles.label, { color: base.textMuted }]}>
        MARK WHAT YOU NOTICED — OPTIONAL
      </Text>
      <View style={styles.row}>
        {chips.map((chip) => {
          const isSelected = selected.includes(chip.label);
          return (
            <TouchableOpacity
              key={chip.id}
              onPress={() => onToggle(chip.label)}
              activeOpacity={0.72}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              accessibilityLabel={`${chip.label}${isSelected ? ', marked' : ''}`}
              style={[
                styles.chip,
                {
                  borderColor: isSelected ? base.gold : base.border,
                  backgroundColor: isSelected ? `${base.gold}18` : 'transparent',
                },
              ]}
            >
              <Text
                style={[styles.chipText, { color: isSelected ? base.gold : base.textDim }]}
              >
                {chip.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  label: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 10,
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  chip: {
    // borderRadius 16 per the design system's pill spec (#1839).
    borderRadius: 16,
    borderWidth: 1,
    minHeight: 32,
    paddingHorizontal: spacing.sm,
    justifyContent: 'center',
  },
  chipText: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 12,
  },
});
