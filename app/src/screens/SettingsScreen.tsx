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
import { Download } from 'lucide-react-native';
import { useSettingsStore } from '../stores';
import { ScreenHeader } from '../components/ScreenHeader';
import { NotificationSettings } from '../components/NotificationSettings';
import { getContentStats, type ContentStats } from '../db/content';
import { getUserDb } from '../db/userDatabase';
import { exportStudyData, ExportError } from '../utils/exportData';
import { base, spacing, radii, fontFamily } from '../theme';
import { logger } from '../utils/logger';

const APP_VERSION = require('../../app.json').expo.version ?? '1.0.0';

/* ── About copy ─────────────────────────────────────────────────── */

const ABOUT_PARAGRAPHS = [
  'Companion Study is a verse-by-verse Bible study app designed for readers who want depth without a seminary library. Every chapter pairs the biblical text with commentary drawn from evangelical, reformed, Jewish, critical, and patristic traditions \u2014 placing multiple scholarly voices side by side so you can see how the text has been understood across centuries and communities.',
  'Beyond commentary, each chapter surfaces the original Hebrew and Greek, historical context, cross-references, and thematic connections that give Scripture its layered richness. Interactive tools \u2014 a genealogy tree, biblical world map, timeline, word studies, prophecy chains, and concept explorer \u2014 let you trace threads across the entire canon.',
  'Your study is personal. Highlight verses, take notes, build collections, and bookmark passages \u2014 all stored privately on your device.',
];

/* ── Component ──────────────────────────────────────────────────── */

export default function SettingsScreen() {
  const navigation = useNavigation<any>();
  const translation = useSettingsStore((s) => s.translation);
  const fontSize = useSettingsStore((s) => s.fontSize);
  const vhlEnabled = useSettingsStore((s) => s.vhlEnabled);
  const setTranslation = useSettingsStore((s) => s.setTranslation);
  const setFontSize = useSettingsStore((s) => s.setFontSize);
  const setVhlEnabled = useSettingsStore((s) => s.setVhlEnabled);

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
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <ScreenHeader
          title="Settings"
          onBack={() => navigation.goBack()}
          style={{ marginBottom: spacing.lg }}
        />

        {/* ── PREFERENCES ──────────────────────────────────────── */}
        <SectionLabel text="PREFERENCES" />

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
                <Text
                  style={[
                    styles.pillLabel,
                    translation === t && styles.pillLabelActive,
                  ]}
                >
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
          <Text
            style={[
              styles.previewText,
              { fontSize, lineHeight: fontSize * 1.6 },
            ]}
          >
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

        {/* ── NOTIFICATIONS ────────────────────────────────────── */}
        <NotificationSettings />

        {/* ── ABOUT ────────────────────────────────────────────── */}
        <View style={styles.section}>
          <SectionLabel text="ABOUT" />

          {ABOUT_PARAGRAPHS.map((para, idx) => (
            <Text
              key={idx}
              style={[
                styles.aboutText,
                idx < ABOUT_PARAGRAPHS.length - 1 && styles.aboutParagraphGap,
              ]}
            >
              {para}
            </Text>
          ))}

          {/* Stats strip */}
          {stats && (
            <Text style={styles.statsStrip}>
              {formatStat(stats.liveBooks, 'Book')}
              {'  \u00B7  '}
              {formatStat(stats.liveChapters, 'Chapter')}
              {'  \u00B7  '}
              {formatStat(stats.scholarCount, 'Scholar')}
              {'  \u00B7  '}
              {formatStat(stats.peopleCount, 'Person', 'People')}
            </Text>
          )}

          <Text style={styles.version}>Version {APP_VERSION}</Text>
        </View>

        {/* ── DATA ─────────────────────────────────────────────── */}
        <View style={styles.section}>
          <SectionLabel text="DATA" />

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
            <Text style={styles.exportText}>
              {exporting ? 'Preparing export\u2026' : 'Export Study Data'}
            </Text>
          </TouchableOpacity>
          <Text style={styles.exportHint}>
            Notes, bookmarks, and highlights as JSON
          </Text>

          {/* Destructive actions */}
          <View style={styles.dangerZone}>
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

function SectionLabel({ text }: { text: string }) {
  return <Text style={styles.sectionLabel}>{text}</Text>;
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      {children}
    </View>
  );
}

/* ── Styles ──────────────────────────────────────────────────────── */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: base.bg,
  },
  content: {
    padding: spacing.md,
  },

  /* Section label */
  sectionLabel: {
    color: base.textMuted,
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
    borderBottomColor: base.border + '40',
  },
  rowLabel: {
    color: base.text,
    fontFamily: fontFamily.uiMedium,
    fontSize: 14,
  },

  /* Translation pill toggle */
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

  /* Font preview */
  preview: {
    paddingVertical: spacing.sm,
  },
  previewText: {
    color: base.textDim,
    fontFamily: fontFamily.body,
  },

  /* About */
  aboutText: {
    color: base.textDim,
    fontFamily: fontFamily.body,
    fontSize: 14,
    lineHeight: 22,
  },
  aboutParagraphGap: {
    marginBottom: spacing.md,
  },
  statsStrip: {
    color: base.textMuted,
    fontFamily: fontFamily.uiMedium,
    fontSize: 12,
    marginTop: spacing.lg,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  version: {
    color: base.textMuted,
    fontFamily: fontFamily.ui,
    fontSize: 11,
    marginTop: spacing.sm,
    textAlign: 'center',
  },

  /* Export */
  exportRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  exportText: {
    color: base.gold,
    fontFamily: fontFamily.uiMedium,
    fontSize: 14,
  },
  exportHint: {
    color: base.textMuted,
    fontFamily: fontFamily.ui,
    fontSize: 11,
    marginTop: -spacing.sm,
    marginBottom: spacing.md,
  },

  /* Danger zone */
  dangerZone: {
    borderTopWidth: 1,
    borderTopColor: base.border + '40',
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
