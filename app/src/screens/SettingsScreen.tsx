/**
 * SettingsScreen — Preferences, notifications, about, and data management.
 *
 * Sections:
 *   PREFERENCES  — Translation, font size, verse highlighting
 *   NOTIFICATIONS — Daily verse (uses existing NotificationSettings component)
 *   ABOUT        — App description, dynamic stats strip, version
 *   DATA         — Export study data, clear history/notes/bookmarks
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { ScreenNavProp } from '../navigation/types';
import { Download } from 'lucide-react-native';
import { useSettingsStore } from '../stores';
import { ScreenHeader } from '../components/ScreenHeader';
import { CompactDropdown, type DropdownOption } from '../components/CompactDropdown';
import { NotificationSettings } from '../components/NotificationSettings';
import { ThemePicker } from '../components/ThemePicker';
import { getContentStats, type ContentStats } from '../db/content';
import { getUserDb } from '../db/userDatabase';
import { exportStudyData, ExportError } from '../utils/exportData';
import { base, useTheme, spacing, fontFamily } from '../theme';
import { logger } from '../utils/logger';

const APP_VERSION = require('../../app.json').expo.version ?? '1.0.0';

const TRANSLATION_OPTIONS: DropdownOption[] = [
  { key: 'niv', label: 'NIV' },
  { key: 'esv', label: 'ESV' },
  { key: 'kjv', label: 'KJV' },
];

/* ── About copy ─────────────────────────────────────────────────── */

const ABOUT_PARAGRAPHS = [
  'Don\u2019t just read the Bible. Learn to read it the way it was written.',
  'Companion Study is a free Bible study app that does what no other app does: it teaches you how ancient texts actually work. Every chapter pairs the biblical text with scholarly commentary from 45+ commentators \u2014 evangelical, reformed, Jewish, critical, and patristic \u2014 placing multiple perspectives side by side so you can see how the text has been understood across centuries, traditions, and communities.',
  'Beyond commentary, Companion Study surfaces what other apps can\u2019t: the original audience\u2019s assumptions, ancient Near Eastern parallels, chiastic literary structures, intertextual allusions, genre-aware reading guidance, and progressive revelation tracking. Interactive tools \u2014 genealogy trees, a biblical world map, timelines, word studies, prophecy chains, and a concept explorer \u2014 let you trace threads across the entire canon.',
  'Your study is personal. Highlight verses in multiple colors, take notes, build collections, and bookmark passages \u2014 all stored privately on your device. No account required. No ads. No paywall on scholarship.',
];

/* ── Component ──────────────────────────────────────────────────── */

export default function SettingsScreen() {
  const { base } = useTheme();
  const navigation = useNavigation<ScreenNavProp<'More', 'Settings'>>();
  const translation = useSettingsStore((s) => s.translation);
  const fontSize = useSettingsStore((s) => s.fontSize);
  const vhlEnabled = useSettingsStore((s) => s.vhlEnabled);
  const setTranslation = useSettingsStore((s) => s.setTranslation);
  const setFontSize = useSettingsStore((s) => s.setFontSize);
  const setVhlEnabled = useSettingsStore((s) => s.setVhlEnabled);
  const studyCoachEnabled = useSettingsStore((s) => s.studyCoachEnabled);
  const setStudyCoachEnabled = useSettingsStore((s) => s.setStudyCoachEnabled);
  const theme = useSettingsStore((s) => s.theme);
  const setTheme = useSettingsStore((s) => s.setTheme);

  const [stats, setStats] = useState<ContentStats | null>(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    getContentStats().then(setStats).catch(() => {});
  }, []);

  /* ── Data actions ───────────────────────────────────────────── */

  const handleExport = async () => {
    setExporting(true);
    try {
      await exportStudyData();
    } catch (err) {
      const message =
        err instanceof ExportError
          ? err.message
          : 'Something went wrong while exporting. Please try again.';
      Alert.alert('Export', message);
    } finally {
      setExporting(false);
    }
  };

  const handleClearHistory = () => {
    confirmClear(
      'Clear Reading History',
      'This will clear all reading history and streak data. This cannot be undone.',
      'DELETE FROM reading_progress',
      'Reading history cleared.',
    );
  };

  const handleClearNotes = () => {
    confirmClear(
      'Clear All Notes',
      'This will permanently delete all your notes and note links. Collections will be kept. This cannot be undone.',
      ['DELETE FROM note_links', 'DELETE FROM notes_fts', 'DELETE FROM user_notes'],
      'All notes have been deleted.',
    );
  };

  const handleClearBookmarks = () => {
    confirmClear(
      'Clear All Bookmarks',
      'This will permanently delete all your bookmarks. This cannot be undone.',
      'DELETE FROM bookmarks',
      'All bookmarks have been deleted.',
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: base.bg }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <ScreenHeader
          title="Settings"
          onBack={() => navigation.goBack()}
          style={{ marginBottom: spacing.lg }}
        />

        {/* ── PREFERENCES ──────────────────────────────────────── */}
        <SectionLabel text="PREFERENCES" base={base} />

        {/* Translation */}
        <Row label="Default Translation" base={base}>
          <CompactDropdown
            value={translation}
            options={TRANSLATION_OPTIONS}
            onSelect={setTranslation}
          />
        </Row>

        {/* Appearance */}
        <ThemePicker theme={theme} setTheme={setTheme} />

        {/* Font Size */}
        <Row label={`Font Size: ${fontSize}pt`} base={base}>
          <View style={styles.sizeControls}>
            <TouchableOpacity
              onPress={() => setFontSize(fontSize - 1)}
              style={[styles.sizeButton, { backgroundColor: base.bgElevated, borderColor: base.border }]}
            >
              <Text style={[styles.sizeButtonText, { color: base.gold }]}>−</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setFontSize(fontSize + 1)}
              style={[styles.sizeButton, { backgroundColor: base.bgElevated, borderColor: base.border }]}
            >
              <Text style={[styles.sizeButtonText, { color: base.gold }]}>+</Text>
            </TouchableOpacity>
          </View>
        </Row>

        {/* Font preview */}
        <View style={styles.preview}>
          <Text
            style={[
              styles.previewText,
              { fontSize, lineHeight: fontSize * 1.6, color: base.textDim },
            ]}
          >
            In the beginning God created the heavens and the earth.
          </Text>
        </View>

        {/* VHL Toggle */}
        <Row label="Verse Highlighting" base={base}>
          <Switch
            value={vhlEnabled}
            onValueChange={setVhlEnabled}
            trackColor={{ false: base.bgSurface, true: base.gold + '60' }}
            thumbColor={vhlEnabled ? base.gold : base.textMuted}
          />
        </Row>

        {/* Study Coach */}
        <Row label="Study Coach" base={base}>
          <Switch
            value={studyCoachEnabled}
            onValueChange={setStudyCoachEnabled}
            trackColor={{ false: base.bgSurface, true: base.gold + '60' }}
            thumbColor={studyCoachEnabled ? base.gold : base.textMuted}
          />
        </Row>

        {/* ── NOTIFICATIONS ────────────────────────────────────── */}
        <NotificationSettings />

        {/* ── ABOUT ────────────────────────────────────────────── */}
        <View style={styles.section}>
          <SectionLabel text="ABOUT" base={base} />

          {ABOUT_PARAGRAPHS.map((para, idx) => (
            <Text
              key={idx}
              style={[
                styles.aboutText,
                { color: base.textDim },
                idx < ABOUT_PARAGRAPHS.length - 1 && styles.aboutParagraphGap,
              ]}
            >
              {para}
            </Text>
          ))}

          {/* Stats strip */}
          {stats && (
            <Text style={[styles.statsStrip, { color: base.textMuted }]}>
              {formatStat(stats.liveBooks, 'Book')}
              {'  \u00B7  '}
              {formatStat(stats.liveChapters, 'Chapter')}
              {'  \u00B7  '}
              {formatStat(stats.scholarCount, 'Scholar')}
              {'  \u00B7  '}
              {formatStat(stats.peopleCount, 'Person', 'People')}
            </Text>
          )}

          <Text style={[styles.version, { color: base.textMuted }]}>Version {APP_VERSION}</Text>

          <Text style={[styles.disclaimerText, { color: base.textMuted }]}>
            Scholar commentary panels present paraphrased summaries of positions found in published works and are not direct quotations. For exact wording, consult the original sources cited.
          </Text>
        </View>

        {/* ── DATA ─────────────────────────────────────────────── */}
        <View style={styles.section}>
          <SectionLabel text="DATA" base={base} />

          {/* Export */}
          <TouchableOpacity
            onPress={handleExport}
            disabled={exporting}
            style={styles.exportRow}
            activeOpacity={0.6}
          >
            {exporting ? (
              <ActivityIndicator size="small" color={base.gold} />
            ) : (
              <Download size={16} color={base.gold} />
            )}
            <Text style={[styles.exportText, { color: base.gold }]}>
              {exporting ? 'Preparing export\u2026' : 'Export Study Data'}
            </Text>
          </TouchableOpacity>
          <Text style={[styles.exportHint, { color: base.textMuted }]}>
            Notes, bookmarks, and highlights as JSON
          </Text>

          {/* Destructive actions */}
          <View style={[styles.dangerZone, { borderTopColor: base.border + '40' }]}>
            <TouchableOpacity onPress={handleClearHistory} style={styles.dangerRow}>
              <Text style={styles.dangerText}>Clear Reading History</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleClearNotes} style={styles.dangerRow}>
              <Text style={styles.dangerText}>Clear All Notes</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleClearBookmarks} style={styles.dangerRow}>
              <Text style={styles.dangerText}>Clear All Bookmarks</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bottom breathing room */}
        <View style={{ height: spacing.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

/* ── Helpers ────────────────────────────────────────────────────── */

function formatStat(count: number, singular: string, plural?: string): string {
  const label = count === 1 ? singular : (plural ?? `${singular}s`);
  return `${count} ${label}`;
}

/**
 * Shared confirmation → delete pattern for all destructive actions.
 * Accepts a single SQL string or an array of SQL strings to run in sequence.
 */
function confirmClear(
  title: string,
  message: string,
  sql: string | string[],
  successMessage: string,
) {
  Alert.alert(title, message, [
    { text: 'Cancel', style: 'cancel' },
    {
      text: 'Delete',
      style: 'destructive',
      onPress: async () => {
        try {
          const db = getUserDb();
          const statements = Array.isArray(sql) ? sql : [sql];
          for (const stmt of statements) {
            await db.runAsync(stmt);
          }
          Alert.alert('Done', successMessage);
        } catch (err) {
          logger.error('SettingsScreen', `Failed: ${title}`, err);
          Alert.alert('Error', 'Something went wrong. Please try again.');
        }
      },
    },
  ]);
}

/* ── Sub-components ─────────────────────────────────────────────── */

function SectionLabel({ text, base }: { text: string; base: ReturnType<typeof useTheme>['base'] }) {
  return <Text style={[styles.sectionLabel, { color: base.textMuted }]}>{text}</Text>;
}

function Row({ label, children, base }: { label: string; children: React.ReactNode; base: ReturnType<typeof useTheme>['base'] }) {
  return (
    <View style={[styles.row, { borderBottomColor: base.border + '40' }]}>
      <Text style={[styles.rowLabel, { color: base.text }]}>{label}</Text>
      {children}
    </View>
  );
}

/* ── Styles ──────────────────────────────────────────────────────── */

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
  },

  /* Section label */
  sectionLabel: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 11,
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  section: {
    marginTop: spacing.xl,
  },

  /* Preference rows */
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  rowLabel: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 14,
  },

  /* Font size controls */
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

  /* Font preview */
  preview: {
    paddingVertical: spacing.sm,
  },
  previewText: {
    fontFamily: fontFamily.body,
  },

  /* About */
  aboutText: {
    fontFamily: fontFamily.body,
    fontSize: 14,
    lineHeight: 22,
  },
  aboutParagraphGap: {
    marginBottom: spacing.md,
  },
  statsStrip: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 12,
    marginTop: spacing.lg,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  version: {
    fontFamily: fontFamily.ui,
    fontSize: 11,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  disclaimerText: {
    fontFamily: fontFamily.ui,
    fontSize: 10,
    lineHeight: 15,
    marginTop: spacing.lg,
    textAlign: 'center',
    opacity: 0.7,
  },

  /* Export */
  exportRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  exportText: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 14,
  },
  exportHint: {
    fontFamily: fontFamily.ui,
    fontSize: 11,
    marginTop: -spacing.sm,
    marginBottom: spacing.md,
  },

  /* Danger zone */
  dangerZone: {
    borderTopWidth: 1,
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
  },
  dangerRow: {
    paddingVertical: spacing.sm + 2,
  },
  dangerText: {
    color: '#e05a6a',
    fontFamily: fontFamily.uiMedium,
    fontSize: 14,
  },
});
