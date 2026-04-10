import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import type { BaseColors } from '../../theme/palettes';
import { spacing, radii, fontFamily } from '../../theme';
import { useSettingsStore } from '../../stores';
import { useAvailableVoices } from '../../hooks/useAvailableVoices';
import { SectionLabel } from './SectionLabel';
import { sharedStyles } from './styles';

export function VoicePicker({ base }: { base: BaseColors }) {
  const voices = useAvailableVoices();
  const ttsVoice = useSettingsStore((s) => s.ttsVoice);
  const setTtsVoice = useSettingsStore((s) => s.setTtsVoice);
  const [expanded, setExpanded] = useState(false);

  if (voices.length === 0) return null;

  const currentName = voices.find((v) => v.identifier === ttsVoice)?.name ?? 'System Default';

  return (
    <View style={sharedStyles.section}>
      <SectionLabel text="TEXT-TO-SPEECH" base={base} />
      <TouchableOpacity
        onPress={() => setExpanded(!expanded)}
        style={[localStyles.voiceRow, { borderBottomColor: base.border + '40' }]}
        accessibilityRole="button"
        accessibilityLabel={`TTS voice: ${currentName}. Tap to change.`}
      >
        <Text style={[sharedStyles.rowLabel, { color: base.text }]}>Voice</Text>
        <Text style={[localStyles.voiceValue, { color: base.gold }]}>
          {currentName} {expanded ? '\u25B2' : '\u25BC'}
        </Text>
      </TouchableOpacity>
      {expanded && (
        <View style={[localStyles.voiceList, { backgroundColor: base.bgElevated, borderColor: base.border }]}>
          <TouchableOpacity
            onPress={() => { setTtsVoice(''); setExpanded(false); }}
            style={[localStyles.voiceOption, !ttsVoice && { backgroundColor: base.gold + '15' }]}
          >
            <Text style={[localStyles.voiceOptionText, { color: !ttsVoice ? base.gold : base.text }]}>
              System Default
            </Text>
          </TouchableOpacity>
          {voices.map((v) => (
            <TouchableOpacity
              key={v.identifier}
              onPress={() => { setTtsVoice(v.identifier); setExpanded(false); }}
              style={[localStyles.voiceOption, ttsVoice === v.identifier && { backgroundColor: base.gold + '15' }]}
            >
              <View style={localStyles.voiceNameRow}>
                <Text style={[localStyles.voiceOptionText, { color: ttsVoice === v.identifier ? base.gold : base.text }]}>
                  {v.name}
                </Text>
                {v.recommended && (
                  <Text style={[localStyles.recommendedBadge, { color: base.gold }]}>
                    RECOMMENDED
                  </Text>
                )}
              </View>
              <Text style={[localStyles.voiceQuality, { color: base.textMuted }]}>
                {v.quality !== 'Default' ? v.quality : v.language}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
      <Text style={[sharedStyles.translationHint, { color: base.textMuted }]}>
        For better voices, go to iPhone Settings {'\u2192'} Accessibility {'\u2192'} Spoken Content {'\u2192'} Voices {'\u2192'} English and download enhanced voices.
      </Text>
    </View>
  );
}

const localStyles = StyleSheet.create({
  voiceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  voiceList: {
    borderRadius: radii.md,
    borderWidth: 1,
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
    maxHeight: 280,
    overflow: 'hidden',
  },
  voiceOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
  },
  voiceOptionText: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 13,
  },
  voiceValue: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 13,
  },
  voiceNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  recommendedBadge: {
    fontSize: 9,
    fontFamily: fontFamily.uiSemiBold,
    opacity: 0.8,
  },
  voiceQuality: {
    fontSize: 10,
    fontFamily: fontFamily.ui,
  },
});
