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
import { Download, Trash2 } from 'lucide-react-native';
import { useSettingsStore } from '../stores';
import { ScreenHeader } from '../components/ScreenHeader';
import { CompactDropdown, type DropdownOption } from '../components/CompactDropdown';
import { NotificationSettings } from '../components/NotificationSettings';
import { ThemePicker } from '../components/ThemePicker';
import { TRANSLATIONS } from '../db/translationRegistry';
import { useTranslationSwitch } from '../hooks/useTranslationSwitch';
import { getContentStats, type ContentStats } from '../db/content';
import { getUserDb } from '../db/userDatabase';
import { resetToNewUser } from '../db/userMutations';
import { exportStudyData, ExportError } from '../utils/exportData';
import { useTheme, spacing, radii, fontFamily } from '../theme';
import { usePremiumStore } from '../stores/premiumStore';
import { logger } from '../utils/logger';
import { withErrorBoundary } from '../components/ScreenErrorBoundary';
import { SectionLabel, SettingsRow, TranslationManager, VoicePicker, sharedStyles } from './settings';

const APP_VERSION = require('../../app.json').expo.version ?? '1.0.0';

const TRANSLATION_OPTIONS: DropdownOption[] = TRANSLATIONS.map((t) => ({
  key: t.id,
  label: t.label,
}));

/* ── About copy ─────────────────────────────────────────────────── */

const ABOUT_PARAGRAPHS = [
  'Don\u2019t just read the Bible. Learn to read it the way it was written.',
  'Companion Study is a free Bible study app that does what no other app does: it teaches you how ancient texts actually work. Every chapter pairs the biblical text with scholarly commentary from 45+ commentators \u2014 evangelical, reformed, Jewish, critical, and patristic \u2014 placing multiple perspectives side by side so you can see how the text has been understood across centuries, traditions, and communities.',
  'Beyond commentary, Companion Study surfaces what other apps can\u2019t: the original audience\u2019s assumptions, ancient Near Eastern parallels, chiastic literary structures, intertextual allusions, genre-aware reading guidance, and progressive revelation tracking. Interactive tools \u2014 genealogy trees, a biblical world map, timelines, word studies, prophecy chains, and a concept explorer \u2014 let you trace threads across the entire canon.',
  'Your study is personal. Highlight verses in multiple colors, take notes, build collections, and bookmark passages \u2014 all stored privately on your device. No account required. No ads. No paywall on scholarship.',
];

/* ── Component ──────────────────────────────────────────────────── */

function SettingsScreen() {
  const { base } = useTheme();
  const navigation = useNavigation<ScreenNavProp<'More', 'Settings'>>();
  const translation = useSettingsStore((s) => s.translation);
  const fontSize = useSettingsStore((s) => s.fontSize);
  const vhlEnabled = useSettingsStore((s) => s.vhlEnabled);
  const { switchTranslation } = useTranslationSwitch();
  const setFontSize = useSettingsStore((s) => s.setFontSize);
  const setVhlEnabled = useSettingsStore((s) => s.setVhlEnabled);
  const redLetterEnabled = useSettingsStore((s) => s.redLetterEnabled);
  const setRedLetterEnabled = useSettingsStore((s) => s.setRedLetterEnabled);
  const studyCoachEnabled = useSettingsStore((s) => s.studyCoachEnabled);
  const setStudyCoachEnabled = useSettingsStore((s) => s.setStudyCoachEnabled);
  const focusMode = useSettingsStore((s) => s.focusMode);
  const toggleFocusMode = useSettingsStore((s) => s.toggleFocusMode);
  const theme = useSettingsStore((s) => s.theme);
  const setTheme = useSettingsStore((s) => s.setTheme);
  const isPremium = usePremiumStore((s) => s.isPremium);
  const purchaseType = usePremiumStore((s) => s.purchaseType);

  const [stats, setStats] = useState<ContentStats | null>(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    getContentStats().then(setStats).catch((err) => { logger.warn('SettingsScreen', 'Failed to load content stats', err); });
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
      'This will clear all reading history, streak data, and reading plan progress. This cannot be undone.',
      [
        'DELETE FROM reading_progress',
        'DELETE FROM plan_progress',
        "INSERT OR REPLACE INTO user_preferences (key, value) VALUES ('active_plan', '')",
      ],
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
          style={styles.headerSpacing}
        />

        {/* ── COMPANION+ ────────────────────────────────────────── */}
        <TouchableOpacity
          onPress={() => navigation.navigate('Subscription' as any)}
          style={[styles.premiumRow, { borderColor: base.gold + '30' }]}
          accessibilityRole="button"
          accessibilityLabel={isPremium ? 'Companion+ active' : 'Subscribe to Companion+'}
        >
          <View>
            <Text style={[styles.premiumLabel, { color: base.gold }]}>✦ Companion+</Text>
            <Text style={[styles.premiumHint, { color: base.textDim }]}>
              {isPremium
                ? `Active — ${purchaseType === 'lifetime' ? 'Lifetime' : purchaseType === 'annual' ? 'Annual' : 'Monthly'}`
                : 'Unlock all premium study tools'}
            </Text>
          </View>
          <Text style={[styles.premiumArrow, { color: base.gold }]}>›</Text>
        </TouchableOpacity>

        {/* ── PREFERENCES ──────────────────────────────────────── */}
        <SectionLabel text="PREFERENCES" base={base} />

        {/* Translation */}
        <SettingsRow label="Default Translation" base={base}>
          <CompactDropdown
            value={translation}
            options={TRANSLATION_OPTIONS}
            onSelect={switchTranslation}
          />
        </SettingsRow>

        {/* Appearance */}
        <ThemePicker theme={theme} setTheme={setTheme} />

        {/* Font Size */}
        <SettingsRow label={`Font Size: ${fontSize}pt`} base={base}>
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
        </SettingsRow>

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

        {/* ── TTS VOICE ─────────────────────────────────────────── */}
        <VoicePicker base={base} />

        {/* ── TRANSLATIONS ─────────────────────────────────────── */}
        <TranslationManager base={base} />

        {/* ── NOTIFICATIONS ────────────────────────────────────── */}
        <NotificationSettings />

        {/* Notification preferences link */}
        <TouchableOpacity
          onPress={() => navigation.navigate('NotificationPrefs' as any)}
          style={[sharedStyles.row, { borderBottomColor: base.border + '40' }]}
          accessibilityRole="button"
          accessibilityLabel="Notification Preferences"
        >
          <Text style={[sharedStyles.rowLabel, { color: base.text }]}>Notification Preferences</Text>
          <Text style={[styles.premiumArrow, { color: base.textMuted }]}>{'\u203A'}</Text>
        </TouchableOpacity>

        {/* ── ABOUT ────────────────────────────────────────────── */}
        <View style={sharedStyles.section}>
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
        <View style={sharedStyles.section}>
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
              <Text style={[styles.dangerText, { color: base.danger }]}>Clear Reading History</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleClearNotes} style={styles.dangerRow}>
              <Text style={[styles.dangerText, { color: base.danger }]}>Clear All Notes</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleClearBookmarks} style={styles.dangerRow}>
              <Text style={[styles.dangerText, { color: base.danger }]}>Clear All Bookmarks</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => {
              Alert.alert(
                'Reset to New User?',
                'Clears reading history, onboarding, streaks, and plan progress. Notes, bookmarks, and highlights are kept. Force-close the app after reset.',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Reset', style: 'destructive', onPress: async () => {
                    try {
                      await resetToNewUser();
                      Alert.alert('Reset Complete', 'Force-close and reopen the app to see the new-user experience.');
                    } catch (err) {
                      logger.error('SettingsScreen', 'Failed to reset new user state', err);
                      Alert.alert('Error', 'Reset failed. Please try again.');
                    }
                  }},
                ],
              );
            }} style={styles.dangerRow}>
              <Text style={[styles.dangerText, { color: base.danger }]}>Reset to New User (Dev)</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bottom breathing room */}
        <View style={styles.bottomSpacer} />
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

/* ── Styles ──────────────────────────────────────────────────────── */

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
  },
  headerSpacing: {
    marginBottom: spacing.lg,
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
    fontFamily: fontFamily.uiMedium,
    fontSize: 14,
  },

  bottomSpacer: {
    height: spacing.xxl,
  },
  premiumRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  premiumLabel: {
    fontFamily: fontFamily.displaySemiBold,
    fontSize: 16,
  },
  premiumHint: {
    fontFamily: fontFamily.ui,
    fontSize: 12,
    marginTop: 2,
  },
  premiumArrow: {
    fontSize: 24,
    fontFamily: fontFamily.ui,
  },
});

export default withErrorBoundary(SettingsScreen);
