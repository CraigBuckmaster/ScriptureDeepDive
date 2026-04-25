import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Switch } from 'react-native';
import type { BaseColors } from '../../theme/palettes';
import type { DropdownOption } from '../../components/CompactDropdown';
import { CompactDropdown } from '../../components/CompactDropdown';
import { ThemePicker } from '../../components/ThemePicker';
import { ReadingScaleEditor } from '../../components/settings/ReadingScaleEditor';
import { spacing, radii, fontFamily } from '../../theme';
import type { ChapterMode } from '../../stores/settingsStore';
import { MODE_META } from '../../components/onboarding/ModeChoiceCard';
import { SectionLabel } from './SectionLabel';
import { SettingsRow } from './SettingsRow';

type ThemePreference = 'dark' | 'sepia' | 'light' | 'system';

interface PreferencesSectionProps {
  base: BaseColors;
  translation: string;
  translationOptions: DropdownOption[];
  onTranslationChange: (key: string) => void;
  theme: ThemePreference;
  setTheme: (t: ThemePreference) => void;
  vhlEnabled: boolean;
  setVhlEnabled: (v: boolean) => void;
  redLetterEnabled: boolean;
  setRedLetterEnabled: (v: boolean) => void;
  studyCoachEnabled: boolean;
  setStudyCoachEnabled: (v: boolean) => void;
  chapterMode: ChapterMode;
  setChapterMode: (mode: ChapterMode) => void;
}

export function PreferencesSection({
  base,
  translation,
  translationOptions,
  onTranslationChange,
  theme,
  setTheme,
  vhlEnabled,
  setVhlEnabled,
  redLetterEnabled,
  setRedLetterEnabled,
  studyCoachEnabled,
  setStudyCoachEnabled,
  chapterMode,
  setChapterMode,
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

      {/* Reading size (replaces legacy Font Size +/- row, #1642) */}
      <ReadingScaleEditor />

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

      {/* Chapter Reading Mode — 3-segment control */}
      <View style={[styles.modeBlock, { borderBottomColor: base.border + '40' }]}>
        <Text style={[styles.modeLabel, { color: base.text }]}>Chapter Reading Mode</Text>
        <View style={[styles.segments, { borderColor: base.border, backgroundColor: base.bgSurface }]}>
          {MODE_META.map((meta) => {
            const active = meta.mode === chapterMode;
            return (
              <TouchableOpacity
                key={meta.mode}
                onPress={() => setChapterMode(meta.mode)}
                accessibilityRole="radio"
                accessibilityState={{ selected: active }}
                accessibilityLabel={meta.label}
                style={[
                  styles.segment,
                  active && { backgroundColor: base.gold + '25' },
                ]}
              >
                <Text
                  style={[
                    styles.segmentText,
                    { color: active ? base.gold : base.textMuted },
                  ]}
                  numberOfLines={1}
                >
                  {meta.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  modeBlock: {
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  modeLabel: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 14,
    marginBottom: spacing.sm,
  },
  segments: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: radii.md,
    overflow: 'hidden',
  },
  segment: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentText: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 13,
  },
});
