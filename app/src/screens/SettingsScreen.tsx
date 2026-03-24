/**
 * SettingsScreen — Translation, font size, VHL toggle, about, export.
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView, Switch, Alert } from 'react-native';
import { useSettingsStore } from '../stores';
import { base, spacing, radii } from '../theme';

export default function SettingsScreen() {
  const translation = useSettingsStore((s) => s.translation);
  const fontSize = useSettingsStore((s) => s.fontSize);
  const vhlEnabled = useSettingsStore((s) => s.vhlEnabled);
  const setTranslation = useSettingsStore((s) => s.setTranslation);
  const setFontSize = useSettingsStore((s) => s.setFontSize);
  const setVhlEnabled = useSettingsStore((s) => s.setVhlEnabled);

  const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <View style={{
      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
      paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: base.border + '40',
    }}>
      <Text style={{ color: base.text, fontFamily: 'SourceSans3_500Medium', fontSize: 14 }}>{label}</Text>
      {children}
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: base.bg }}>
      <ScrollView contentContainerStyle={{ padding: spacing.md }}>
        <Text style={{ color: base.gold, fontFamily: 'Cinzel_600SemiBold', fontSize: 22, marginBottom: spacing.lg }}>
          Settings
        </Text>

        {/* Translation */}
        <Row label="Default Translation">
          <View style={{ flexDirection: 'row', backgroundColor: base.bgElevated, borderRadius: radii.pill, borderWidth: 1, borderColor: base.border }}>
            {(['niv', 'esv'] as const).map((t) => (
              <TouchableOpacity
                key={t}
                onPress={() => setTranslation(t)}
                style={{
                  paddingHorizontal: 16, paddingVertical: 6,
                  backgroundColor: translation === t ? base.gold + '30' : 'transparent',
                  borderRadius: radii.pill,
                }}
              >
                <Text style={{ color: translation === t ? base.gold : base.textMuted, fontFamily: 'SourceSans3_600SemiBold', fontSize: 12 }}>
                  {t.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Row>

        {/* Font Size */}
        <Row label={`Font Size: ${fontSize}pt`}>
          <View style={{ flexDirection: 'row', gap: spacing.sm, alignItems: 'center' }}>
            <TouchableOpacity onPress={() => setFontSize(fontSize - 1)} style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: base.bgElevated, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: base.border }}>
              <Text style={{ color: base.gold, fontSize: 16 }}>−</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setFontSize(fontSize + 1)} style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: base.bgElevated, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: base.border }}>
              <Text style={{ color: base.gold, fontSize: 16 }}>+</Text>
            </TouchableOpacity>
          </View>
        </Row>

        {/* Font preview */}
        <View style={{ paddingVertical: spacing.sm }}>
          <Text style={{ color: base.textDim, fontFamily: 'EBGaramond_400Regular', fontSize, lineHeight: fontSize * 1.6 }}>
            In the beginning God created the heavens and the earth.
          </Text>
        </View>

        {/* VHL Toggle */}
        <Row label="Verse Highlighting">
          <Switch
            value={vhlEnabled}
            onValueChange={setVhlEnabled}
            trackColor={{ false: base.bgSurface, true: base.gold + '60' }}
            thumbColor={vhlEnabled ? base.gold : base.textMuted}
          />
        </Row>

        {/* About */}
        <View style={{ marginTop: spacing.xl }}>
          <Text style={{ color: base.textMuted, fontFamily: 'Cinzel_400Regular', fontSize: 10, letterSpacing: 0.5, marginBottom: spacing.sm }}>
            ABOUT
          </Text>
          <Text style={{ color: base.textDim, fontFamily: 'EBGaramond_400Regular', fontSize: 14, lineHeight: 22 }}>
            Scripture Deep Dive presents the Bible alongside scholarly commentary from evangelical, reformed,
            Jewish, critical, and patristic traditions. 43 scholars across 30 books with 879 chapters of
            verse-by-verse analysis.
          </Text>
          <Text style={{ color: base.textMuted, fontFamily: 'SourceSans3_400Regular', fontSize: 11, marginTop: spacing.md }}>
            Version 1.0.0
          </Text>
        </View>

        {/* Data */}
        <View style={{ marginTop: spacing.xl }}>
          <Text style={{ color: base.textMuted, fontFamily: 'Cinzel_400Regular', fontSize: 10, letterSpacing: 0.5, marginBottom: spacing.sm }}>
            DATA
          </Text>
          <TouchableOpacity
            onPress={() => Alert.alert('Clear History', 'This will clear all reading history. Continue?', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Clear', style: 'destructive', onPress: () => {} },
            ])}
            style={{ paddingVertical: spacing.sm }}
          >
            <Text style={{ color: '#e05a6a', fontFamily: 'SourceSans3_500Medium', fontSize: 14 }}>
              Clear Reading History
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
