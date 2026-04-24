import React from 'react';
import { Switch } from 'react-native';
import type { BaseColors } from '../../theme/palettes';
import type { DropdownOption } from '../../components/CompactDropdown';
import { CompactDropdown } from '../../components/CompactDropdown';
import { ThemePicker } from '../../components/ThemePicker';
import { ReadingScaleEditor } from '../../components/settings/ReadingScaleEditor';
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
