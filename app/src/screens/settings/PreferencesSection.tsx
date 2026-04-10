import React from 'react';
import { View, Text, TouchableOpacity, Switch, StyleSheet } from 'react-native';
import type { BaseColors } from '../../theme/palettes';
import type { DropdownOption } from '../../components/CompactDropdown';
import { CompactDropdown } from '../../components/CompactDropdown';
import { ThemePicker } from '../../components/ThemePicker';
import { spacing, fontFamily } from '../../theme';
import { SectionLabel } from './SectionLabel';
import { SettingsRow } from './SettingsRow';

interface PreferencesSectionProps {
  base: BaseColors;
  translation: string;
  translationOptions: DropdownOption[];
  onTranslationChange: (key: string) => void;
  theme: string;
  setTheme: (t: string) => void;
  fontSize: number;
  setFontSize: (s: number) => void;
  vhlEnabled: boolean;
  setVhlEnabled: (v: boolean) => void;
  redLetterEnabled: boolean;
  setRedLetterEnabled: (v: boolean) => void;
  studyCoachEnabled: boolean;
  setStudyCoachEnabled: (v: boolean) => void;
  focusMode: boolean;
  toggleFocusMode: () => void;
}

export function PreferencesSection({
  base,
  translation,
  translationOptions,
  onTranslationChange,
  theme,
  setTheme,
  fontSize,
  setFontSize,
  vhlEnabled,
  setVhlEnabled,
  redLetterEnabled,
  setRedLetterEnabled,
  studyCoachEnabled,
  setStudyCoachEnabled,
  focusMode,
  toggleFocusMode,
}: PreferencesSectionProps) {
  return (
    <>
      <SectionLabel text="PREFERENCES" base={base} />

      {/* Translation */}
      <SettingsRow label="Default Translation" base={base}>
        <CompactDropdown
          value={translation}
          options={translationOptions}
          onSelect={onTranslationChange}
        />
      </SettingsRow>

      {/* Appearance */}
      <ThemePicker theme={theme} setTheme={setTheme} />

      {/* Font Size */}
      <SettingsRow label={`Font Size: ${fontSize}pt`} base={base}>
        <View style={localStyles.sizeControls}>
          <TouchableOpacity
            onPress={() => setFontSize(fontSize - 1)}
            style={[localStyles.sizeButton, { backgroundColor: base.bgElevated, borderColor: base.border }]}
          >
            <Text style={[localStyles.sizeButtonText, { color: base.gold }]}>{'\u2212'}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setFontSize(fontSize + 1)}
            style={[localStyles.sizeButton, { backgroundColor: base.bgElevated, borderColor: base.border }]}
          >
            <Text style={[localStyles.sizeButtonText, { color: base.gold }]}>+</Text>
          </TouchableOpacity>
        </View>
      </SettingsRow>

      {/* Font preview */}
      <View style={localStyles.preview}>
        <Text
          style={[
            localStyles.previewText,
            { fontSize, lineHeight: fontSize * 1.6, color: base.textDim },
          ]}
        >
          In the beginning God created the heavens and the earth.
        </Text>
      </View>

      {/* VHL Toggle */}
      <SettingsRow label="Verse Highlighting" base={base}>
        <Switch
          value={vhlEnabled}
          onValueChange={setVhlEnabled}
          trackColor={{ false: base.bgSurface, true: base.gold + '60' }}
          thumbColor={vhlEnabled ? base.gold : base.textMuted}
        />
      </SettingsRow>

      {/* Red Letter Toggle */}
      <SettingsRow label="Words of Christ in Red" base={base}>
        <Switch
          value={redLetterEnabled}
          onValueChange={setRedLetterEnabled}
          trackColor={{ false: base.bgSurface, true: base.redLetter + '60' }}
          thumbColor={redLetterEnabled ? base.redLetter : base.textMuted}
        />
      </SettingsRow>

      {/* Study Coach */}
      <SettingsRow label="Study Coach" base={base}>
        <Switch
          value={studyCoachEnabled}
          onValueChange={setStudyCoachEnabled}
          trackColor={{ false: base.bgSurface, true: base.gold + '60' }}
          thumbColor={studyCoachEnabled ? base.gold : base.textMuted}
        />
      </SettingsRow>

      {/* Focus / Reading Mode */}
      <SettingsRow label="Focus Mode" base={base}>
        <Switch
          value={focusMode}
          onValueChange={toggleFocusMode}
          trackColor={{ false: base.bgSurface, true: base.gold + '60' }}
          thumbColor={focusMode ? base.gold : base.textMuted}
        />
      </SettingsRow>
    </>
  );
}

const localStyles = StyleSheet.create({
  sizeControls: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
  },
  sizeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  sizeButtonText: {
    fontSize: 16,
  },
  preview: {
    paddingVertical: spacing.sm,
  },
  previewText: {
    fontFamily: fontFamily.body,
  },
});
