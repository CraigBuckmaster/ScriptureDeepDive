/** SettingsScreen — Preferences, notifications, about, and data management. */

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { ScreenNavProp } from '../navigation/types';
import { useSettingsStore } from '../stores';
import { ScreenHeader } from '../components/ScreenHeader';
import type { DropdownOption } from '../components/CompactDropdown';
import { NotificationSettings } from '../components/NotificationSettings';
import { TRANSLATIONS } from '../db/translationRegistry';
import { useTranslationSwitch } from '../hooks/useTranslationSwitch';
import { getContentStats, type ContentStats } from '../db/content';
import { useTheme, spacing, fontFamily } from '../theme';
import { usePremiumStore } from '../stores/premiumStore';
import { logger } from '../utils/logger';
import { withErrorBoundary } from '../components/ScreenErrorBoundary';
import {
  PremiumBanner,
  PreferencesSection,
  VoicePicker,
  TranslationManager,
  AboutSection,
  DataSection,
  AmicusSettingsSection,
  sharedStyles,
} from './settings';

const APP_VERSION = require('../../app.json').expo.version ?? '1.0.0';

const TRANSLATION_OPTIONS: DropdownOption[] = TRANSLATIONS.map((t) => ({
  key: t.id,
  label: t.label,
}));

const ABOUT_PARAGRAPHS = [
  'Don\u2019t just read the Bible. Learn to read it the way it was written.',
  'Companion Study is a free Bible study app that does what no other app does: it teaches you how ancient texts actually work. Every chapter pairs the biblical text with scholarly commentary from 45+ commentators \u2014 evangelical, reformed, Jewish, critical, and patristic \u2014 placing multiple perspectives side by side so you can see how the text has been understood across centuries, traditions, and communities.',
  'Beyond commentary, Companion Study surfaces what other apps can\u2019t: the original audience\u2019s assumptions, ancient Near Eastern parallels, chiastic literary structures, intertextual allusions, genre-aware reading guidance, and progressive revelation tracking. Interactive tools \u2014 genealogy trees, a biblical world map, timelines, word studies, prophecy chains, and a concept explorer \u2014 let you trace threads across the entire canon.',
  'Your study is personal. Highlight verses in multiple colors, take notes, build collections, and bookmark passages \u2014 all stored privately on your device. No account required. No ads. No paywall on scholarship.',
];

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
  const amicusEnabled = useSettingsStore((s) => s.amicusEnabled);
  const setAmicusEnabled = useSettingsStore((s) => s.setAmicusEnabled);
  const isPremium = usePremiumStore((s) => s.isPremium);
  const purchaseType = usePremiumStore((s) => s.purchaseType);

  const [stats, setStats] = useState<ContentStats | null>(null);

  useEffect(() => {
    getContentStats().then(setStats).catch((err) => { logger.warn('SettingsScreen', 'Failed to load content stats', err); });
  }, []);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: base.bg }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <ScreenHeader
          title="Settings"
          onBack={() => navigation.goBack()}
          style={styles.headerSpacing}
        />

        <PremiumBanner
          base={base}
          isPremium={isPremium}
          purchaseType={purchaseType}
          onPress={() => navigation.navigate('Subscription')}
        />

        <PreferencesSection
          base={base}
          translation={translation}
          translationOptions={TRANSLATION_OPTIONS}
          onTranslationChange={switchTranslation}
          theme={theme}
          setTheme={setTheme}
          fontSize={fontSize}
          setFontSize={setFontSize}
          vhlEnabled={vhlEnabled}
          setVhlEnabled={setVhlEnabled}
          redLetterEnabled={redLetterEnabled}
          setRedLetterEnabled={setRedLetterEnabled}
          studyCoachEnabled={studyCoachEnabled}
          setStudyCoachEnabled={setStudyCoachEnabled}
          focusMode={focusMode}
          toggleFocusMode={toggleFocusMode}
        />

        <VoicePicker base={base} />
        <TranslationManager base={base} />
        <NotificationSettings />

        {/* Notification preferences link */}
        <TouchableOpacity
          onPress={() => navigation.navigate('NotificationPrefs')}
          style={[sharedStyles.row, { borderBottomColor: base.border + '40' }]}
          accessibilityRole="button"
          accessibilityLabel="Notification Preferences"
        >
          <Text style={[sharedStyles.rowLabel, { color: base.text }]}>Notification Preferences</Text>
          <Text style={[styles.navArrow, { color: base.textMuted }]}>{'\u203A'}</Text>
        </TouchableOpacity>

        <AmicusSettingsSection
          base={base}
          amicusEnabled={amicusEnabled}
          setAmicusEnabled={setAmicusEnabled}
          onInspectProfile={() => navigation.navigate('AmicusProfileInspector')}
        />

        <AboutSection base={base} paragraphs={ABOUT_PARAGRAPHS} stats={stats} version={APP_VERSION} />
        <DataSection base={base} />

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

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
  navArrow: {
    fontSize: 24,
    fontFamily: fontFamily.ui,
  },
  bottomSpacer: {
    height: spacing.xxl,
  },
});

export default withErrorBoundary(SettingsScreen);
