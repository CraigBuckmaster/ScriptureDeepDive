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
import { TRANSLATIONS, DOWNLOADABLE_TRANSLATIONS } from '../db/translationRegistry';
import { isTranslationInstalled, downloadTranslation, deleteTranslation, getInstalledSize } from '../db/translationManager';
import { useTranslationSwitch } from '../hooks/useTranslationSwitch';
import { getContentStats, type ContentStats } from '../db/content';
import { getUserDb } from '../db/userDatabase';
import { exportStudyData, ExportError } from '../utils/exportData';
import { useAvailableVoices } from '../hooks/useAvailableVoices';
import { useTheme, spacing, radii, fontFamily } from '../theme';
import { usePremiumStore } from '../stores/premiumStore';
import { logger } from '../utils/logger';
import { withErrorBoundary } from '../components/ScreenErrorBoundary';

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
        <Row label="Default Translation" base={base}>
          <CompactDropdown
            value={translation}
            options={TRANSLATION_OPTIONS}
            onSelect={switchTranslation}
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

        {/* Red Letter Toggle */}
        <Row label="Words of Christ in Red" base={base}>
          <Switch
            value={redLetterEnabled}
            onValueChange={setRedLetterEnabled}
            trackColor={{ false: base.bgSurface, true: base.redLetter + '60' }}
            thumbColor={redLetterEnabled ? base.redLetter : base.textMuted}
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

        {/* ── TTS VOICE ─────────────────────────────────────────── */}
        <VoicePicker base={base} />

        {/* ── TRANSLATIONS ─────────────────────────────────────── */}
        <TranslationManager base={base} />

        {/* ── NOTIFICATIONS ────────────────────────────────────── */}
        <NotificationSettings />

        {/* Notification preferences link */}
        <TouchableOpacity
          onPress={() => navigation.navigate('NotificationPrefs' as any)}
          style={[styles.row, { borderBottomColor: base.border + '40' }]}
          accessibilityRole="button"
          accessibilityLabel="Notification Preferences"
        >
          <Text style={[styles.rowLabel, { color: base.text }]}>Notification Preferences</Text>
          <Text style={[styles.premiumArrow, { color: base.textMuted }]}>{'\u203A'}</Text>
        </TouchableOpacity>

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
              <Text style={[styles.dangerText, { color: base.danger }]}>Clear Reading History</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleClearNotes} style={styles.dangerRow}>
              <Text style={[styles.dangerText, { color: base.danger }]}>Clear All Notes</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleClearBookmarks} style={styles.dangerRow}>
              <Text style={[styles.dangerText, { color: base.danger }]}>Clear All Bookmarks</Text>
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

/* ── Sub-components ─────────────────────────────────────────────── */

function TranslationManager({ base }: { base: ReturnType<typeof useTheme>['base'] }) {
  const [statuses, setStatuses] = useState<Record<string, { installed: boolean; size: number }>>({});
  const [busy, setBusy] = useState<string | null>(null);

  const refresh = async () => {
    const result: Record<string, { installed: boolean; size: number }> = {};
    for (const t of DOWNLOADABLE_TRANSLATIONS) {
      const installed = await isTranslationInstalled(t.id);
      const size = installed ? await getInstalledSize(t.id) : t.sizeBytes;
      result[t.id] = { installed, size };
    }
    setStatuses(result);
  };

  useEffect(() => { refresh(); }, [busy]);

  const handleDownload = async (id: string) => {
    setBusy(id);
    try {
      await downloadTranslation(id);
    } catch {
      Alert.alert('Download Failed', 'Please try again.');
    }
    setBusy(null);
  };

  const handleDelete = (id: string, label: string) => {
    Alert.alert(
      `Remove ${label}?`,
      'You can re-download it anytime.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove', style: 'destructive',
          onPress: async () => {
            setBusy(id);
            await deleteTranslation(id);
            setBusy(null);
          },
        },
      ],
    );
  };

  if (DOWNLOADABLE_TRANSLATIONS.length === 0) return null;

  return (
    <View style={styles.section}>
      <SectionLabel text="TRANSLATIONS" base={base} />
      <Text style={[styles.translationHint, { color: base.textMuted }]}>
        NIV and KJV are built in. Others can be downloaded on demand.
      </Text>
      {DOWNLOADABLE_TRANSLATIONS.map((t) => {
        const status = statuses[t.id];
        const isInstalled = status?.installed ?? false;
        const isBusy = busy === t.id;
        const sizeMB = ((status?.size ?? t.sizeBytes) / 1024 / 1024).toFixed(1);

        return (
          <View key={t.id} style={[styles.translationRow, { borderBottomColor: base.border + '40' }]}>
            <View style={styles.translationInfo}>
              <Text style={[styles.rowLabel, { color: base.text }]}>{t.label}</Text>
              <Text style={[styles.translationDetail, { color: base.textMuted }]}>
                {t.fullName}{isInstalled ? ` · ${sizeMB} MB` : ''}
              </Text>
            </View>
            {isBusy ? (
              <ActivityIndicator size="small" color={base.gold} />
            ) : isInstalled ? (
              <TouchableOpacity onPress={() => handleDelete(t.id, t.label)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Trash2 size={16} color={base.textMuted} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={() => handleDownload(t.id)} style={styles.downloadButton}>
                <Download size={14} color={base.gold} />
                <Text style={[styles.downloadLabel, { color: base.gold }]}>
                  {Number(sizeMB) > 0 ? `${sizeMB} MB` : 'Install'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        );
      })}
    </View>
  );
}

function VoicePicker({ base }: { base: ReturnType<typeof useTheme>['base'] }) {
  const voices = useAvailableVoices();
  const ttsVoice = useSettingsStore((s) => s.ttsVoice);
  const setTtsVoice = useSettingsStore((s) => s.setTtsVoice);
  const [expanded, setExpanded] = useState(false);

  if (voices.length === 0) return null;

  const currentName = voices.find((v) => v.identifier === ttsVoice)?.name ?? 'System Default';

  return (
    <View style={styles.section}>
      <SectionLabel text="TEXT-TO-SPEECH" base={base} />
      <TouchableOpacity
        onPress={() => setExpanded(!expanded)}
        style={[styles.voiceRow, { borderBottomColor: base.border + '40' }]}
        accessibilityRole="button"
        accessibilityLabel={`TTS voice: ${currentName}. Tap to change.`}
      >
        <Text style={[styles.rowLabel, { color: base.text }]}>Voice</Text>
        <Text style={[styles.voiceValue, { color: base.gold }]}>
          {currentName} {expanded ? '▲' : '▼'}
        </Text>
      </TouchableOpacity>
      {expanded && (
        <View style={[styles.voiceList, { backgroundColor: base.bgElevated, borderColor: base.border }]}>
          <TouchableOpacity
            onPress={() => { setTtsVoice(''); setExpanded(false); }}
            style={[styles.voiceOption, !ttsVoice && { backgroundColor: base.gold + '15' }]}
          >
            <Text style={[styles.voiceOptionText, { color: !ttsVoice ? base.gold : base.text }]}>
              System Default
            </Text>
          </TouchableOpacity>
          {voices.map((v) => (
            <TouchableOpacity
              key={v.identifier}
              onPress={() => { setTtsVoice(v.identifier); setExpanded(false); }}
              style={[styles.voiceOption, ttsVoice === v.identifier && { backgroundColor: base.gold + '15' }]}
            >
              <View style={styles.voiceNameRow}>
                <Text style={[styles.voiceOptionText, { color: ttsVoice === v.identifier ? base.gold : base.text }]}>
                  {v.name}
                </Text>
                {v.recommended && (
                  <Text style={[styles.recommendedBadge, { color: base.gold }]}>
                    RECOMMENDED
                  </Text>
                )}
              </View>
              <Text style={[styles.voiceQuality, { color: base.textMuted }]}>
                {v.quality !== 'Default' ? v.quality : v.language}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
      <Text style={[styles.translationHint, { color: base.textMuted }]}>
        For better voices, go to iPhone Settings → Accessibility → Spoken Content → Voices → English and download enhanced voices.
      </Text>
    </View>
  );
}

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
  headerSpacing: {
    marginBottom: spacing.lg,
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
    fontFamily: fontFamily.uiMedium,
    fontSize: 14,
  },

  /* Translation manager */
  translationHint: {
    fontFamily: fontFamily.ui,
    fontSize: 11,
    marginBottom: spacing.sm,
  },
  translationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  /* Voice picker */
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
  translationInfo: {
    flex: 1,
  },
  translationDetail: {
    fontSize: 11,
    fontFamily: fontFamily.ui,
  },
  downloadLabel: {
    fontSize: 12,
    fontFamily: fontFamily.uiSemiBold,
    marginLeft: 4,
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
