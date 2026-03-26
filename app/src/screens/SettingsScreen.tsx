/**
 * SettingsScreen — Translation, font size, VHL toggle, about, data management.
 *
 * Phase 4E fixes:
 *   - Dynamic stats from getContentStats() (no hardcoded counts)
 *   - Clear Reading History actually works (deletes + feedback)
 *   - Version from expo Constants
 */

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView, Switch, Alert, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSettingsStore } from '../stores';
import { ScreenHeader } from '../components/ScreenHeader';
import { getContentStats, type ContentStats } from '../db/content';
import { getUserDb } from '../db/userDatabase';
import { base, spacing, radii, fontFamily } from '../theme';
import { logger } from '../utils/logger';

const APP_VERSION = require('../../app.json').expo.version ?? '1.0.0';

export default function SettingsScreen() {
  const navigation = useNavigation<any>();
  const translation = useSettingsStore((s) => s.translation);
  const fontSize = useSettingsStore((s) => s.fontSize);
  const vhlEnabled = useSettingsStore((s) => s.vhlEnabled);
  const setTranslation = useSettingsStore((s) => s.setTranslation);
  const setFontSize = useSettingsStore((s) => s.setFontSize);
  const setVhlEnabled = useSettingsStore((s) => s.setVhlEnabled);

  const [stats, setStats] = useState<ContentStats | null>(null);

  useEffect(() => {
    getContentStats().then(setStats);
  }, []);

  const handleClearHistory = () => {
    Alert.alert(
      'Clear History',
      'This will clear all reading history and streak data. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await getUserDb().runAsync('DELETE FROM reading_progress');
              Alert.alert('Done', 'Reading history cleared.');
            } catch (err) {
              Alert.alert('Error', 'Failed to clear history. Please try again.');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header with back button */}
        <ScreenHeader
          title="Settings"
          onBack={() => navigation.goBack()}
          style={{ marginBottom: spacing.lg }}
        />

        {/* Translation */}
        <Row label="Default Translation">
          <View style={styles.pillToggle}>
            {(['niv', 'esv'] as const).map((t) => (
              <TouchableOpacity
                key={t}
                onPress={() => setTranslation(t)}
                style={[
                  styles.pillOption,
                  translation === t && styles.pillOptionActive,
                ]}
              >
                <Text style={[
                  styles.pillLabel,
                  translation === t && styles.pillLabelActive,
                ]}>
                  {t.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Row>

        {/* Font Size */}
        <Row label={`Font Size: ${fontSize}pt`}>
          <View style={styles.sizeControls}>
            <TouchableOpacity
              onPress={() => setFontSize(fontSize - 1)}
              style={styles.sizeButton}
            >
              <Text style={styles.sizeButtonText}>−</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setFontSize(fontSize + 1)}
              style={styles.sizeButton}
            >
              <Text style={styles.sizeButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </Row>

        {/* Font preview */}
        <View style={styles.preview}>
          <Text style={[styles.previewText, { fontSize, lineHeight: fontSize * 1.6 }]}>
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
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>ABOUT</Text>
          <Text style={styles.aboutText}>
            {stats
              ? `Companion Study presents the Bible alongside scholarly commentary from evangelical, reformed, Jewish, critical, and patristic traditions. ${stats.scholarCount} scholars across ${stats.liveBooks} books with ${stats.liveChapters} chapters of verse-by-verse analysis.`
              : 'Companion Study presents the Bible alongside scholarly commentary from evangelical, reformed, Jewish, critical, and patristic traditions.'
            }
          </Text>
          <Text style={styles.version}>Version {APP_VERSION}</Text>
        </View>

        {/* Data */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>DATA</Text>
          <TouchableOpacity onPress={handleClearHistory} style={styles.dangerRow}>
            <Text style={styles.dangerText}>Clear Reading History</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Row sub-component ────────────────────────────────────────────

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      {children}
    </View>
  );
}

// ── Styles ───────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: base.bg,
  },
  content: {
    padding: spacing.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: base.border + '40',
  },
  rowLabel: {
    color: base.text,
    fontFamily: fontFamily.uiMedium,
    fontSize: 14,
  },
  pillToggle: {
    flexDirection: 'row',
    backgroundColor: base.bgElevated,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: base.border,
  },
  pillOption: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: radii.pill,
  },
  pillOptionActive: {
    backgroundColor: base.gold + '30',
  },
  pillLabel: {
    color: base.textMuted,
    fontFamily: fontFamily.uiSemiBold,
    fontSize: 12,
  },
  pillLabelActive: {
    color: base.gold,
  },
  sizeControls: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
  },
  sizeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: base.bgElevated,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: base.border,
  },
  sizeButtonText: {
    color: base.gold,
    fontSize: 16,
  },
  preview: {
    paddingVertical: spacing.sm,
  },
  previewText: {
    color: base.textDim,
    fontFamily: fontFamily.body,
  },
  section: {
    marginTop: spacing.xl,
  },
  sectionLabel: {
    color: base.textMuted,
    fontFamily: fontFamily.display,
    fontSize: 10,
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  aboutText: {
    color: base.textDim,
    fontFamily: fontFamily.body,
    fontSize: 14,
    lineHeight: 22,
  },
  version: {
    color: base.textMuted,
    fontFamily: fontFamily.ui,
    fontSize: 11,
    marginTop: spacing.md,
  },
  dangerRow: {
    paddingVertical: spacing.sm,
  },
  dangerText: {
    color: '#e05a6a',
    fontFamily: fontFamily.uiMedium,
    fontSize: 14,
  },
});
