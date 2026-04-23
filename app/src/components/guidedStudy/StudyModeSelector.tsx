import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import {
  GUIDED_STUDY_MODE_OPTIONS,
  type GuidedStudyMode,
} from '../../services/guidedStudy';
import { fontFamily, radii, spacing, useTheme } from '../../theme';

interface Props {
  value: GuidedStudyMode;
  onChange: (mode: GuidedStudyMode) => void;
}

export function StudyModeSelector({ value, onChange }: Props) {
  const { base } = useTheme();

  return (
    <View style={styles.wrap}>
      {GUIDED_STUDY_MODE_OPTIONS.map((mode) => {
        const active = mode.key === value;
        return (
          <TouchableOpacity
            key={mode.key}
            onPress={() => onChange(mode.key)}
            activeOpacity={0.72}
            style={[
              styles.option,
              {
                borderColor: active ? base.gold : `${base.border}AA`,
                backgroundColor: active ? `${base.gold}16` : base.bgSurface,
              },
            ]}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            accessibilityLabel={`${mode.label}, ${mode.estimate}`}
          >
            <Text style={[styles.label, { color: active ? base.gold : base.text }]}>{mode.label}</Text>
            <Text style={[styles.estimate, { color: base.textMuted }]}>{mode.estimate}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  option: {
    borderWidth: 1,
    borderRadius: radii.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    minWidth: '47%',
    flexGrow: 1,
  },
  label: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 12,
  },
  estimate: {
    fontFamily: fontFamily.ui,
    fontSize: 10,
    marginTop: 2,
  },
});
