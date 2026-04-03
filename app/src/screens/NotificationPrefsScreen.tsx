/**
 * NotificationPrefsScreen — Notification preference toggles.
 *
 * Provides global enable/disable, per-type toggles, and push vs in-app
 * selection. Preferences are persisted to user.db via settingsStore pattern.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Switch,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { ScreenNavProp } from '../navigation/types';
import { ScreenHeader } from '../components/ScreenHeader';
import { getPreference, setPreference } from '../db/user';
import { useTheme, spacing, radii, fontFamily } from '../theme';
import { withErrorBoundary } from '../components/ScreenErrorBoundary';
import { logger } from '../utils/logger';

interface NotificationPrefs {
  enabled: boolean;
  newSubmissions: boolean;
  approvedRejected: boolean;
  trustChanges: boolean;
  pushEnabled: boolean;
  inAppEnabled: boolean;
}

const DEFAULT_PREFS: NotificationPrefs = {
  enabled: true,
  newSubmissions: true,
  approvedRejected: true,
  trustChanges: true,
  pushEnabled: true,
  inAppEnabled: true,
};

const PREF_KEY = 'notification_prefs';

function NotificationPrefsScreen() {
  const { base } = useTheme();
  const navigation = useNavigation<ScreenNavProp<'More', 'NotificationPrefs'>>();
  const [prefs, setPrefs] = useState<NotificationPrefs>(DEFAULT_PREFS);
  const [loaded, setLoaded] = useState(false);

  // Load prefs from user.db
  useEffect(() => {
    async function load() {
      try {
        const raw = await getPreference(PREF_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          setPrefs({ ...DEFAULT_PREFS, ...parsed });
        }
      } catch (err) {
        logger.warn('NotificationPrefsScreen', 'Failed to load prefs', err);
      } finally {
        setLoaded(true);
      }
    }
    load();
  }, []);

  const updatePref = useCallback(
    async (key: keyof NotificationPrefs, value: boolean) => {
      const updated = { ...prefs, [key]: value };

      // If global toggle is disabled, disable all sub-toggles display-wise
      setPrefs(updated);

      try {
        await setPreference(PREF_KEY, JSON.stringify(updated));
      } catch (err) {
        logger.warn('NotificationPrefsScreen', 'Failed to save prefs', err);
      }
    },
    [prefs],
  );

  if (!loaded) return null;

  const subTogglesDisabled = !prefs.enabled;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: base.bg }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <ScreenHeader
          title="Notification Preferences"
          onBack={() => navigation.goBack()}
          style={styles.headerSpacing}
        />

        {/* Global toggle */}
        <SectionLabel text="GENERAL" base={base} />
        <ToggleRow
          label="Enable Notifications"
          value={prefs.enabled}
          onToggle={(v) => updatePref('enabled', v)}
          base={base}
        />

        {/* Per-type toggles */}
        <SectionLabel text="NOTIFICATION TYPES" base={base} />
        <ToggleRow
          label="New Submissions"
          hint="When someone submits new content to a topic you follow"
          value={prefs.newSubmissions}
          onToggle={(v) => updatePref('newSubmissions', v)}
          disabled={subTogglesDisabled}
          base={base}
        />
        <ToggleRow
          label="Approved / Rejected"
          hint="When your submissions are approved or rejected"
          value={prefs.approvedRejected}
          onToggle={(v) => updatePref('approvedRejected', v)}
          disabled={subTogglesDisabled}
          base={base}
        />
        <ToggleRow
          label="Trust Level Changes"
          hint="When your trust level is upgraded"
          value={prefs.trustChanges}
          onToggle={(v) => updatePref('trustChanges', v)}
          disabled={subTogglesDisabled}
          base={base}
        />

        {/* Delivery method */}
        <SectionLabel text="DELIVERY" base={base} />
        <ToggleRow
          label="Push Notifications"
          value={prefs.pushEnabled}
          onToggle={(v) => updatePref('pushEnabled', v)}
          disabled={subTogglesDisabled}
          base={base}
        />
        <ToggleRow
          label="In-App Notifications"
          value={prefs.inAppEnabled}
          onToggle={(v) => updatePref('inAppEnabled', v)}
          disabled={subTogglesDisabled}
          base={base}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

/* ── Sub-components ──────────────────────────────────────────────── */

function SectionLabel({ text, base }: { text: string; base: ReturnType<typeof useTheme>['base'] }) {
  return <Text style={[styles.sectionLabel, { color: base.textMuted }]}>{text}</Text>;
}

function ToggleRow({
  label,
  hint,
  value,
  onToggle,
  disabled,
  base,
}: {
  label: string;
  hint?: string;
  value: boolean;
  onToggle: (v: boolean) => void;
  disabled?: boolean;
  base: ReturnType<typeof useTheme>['base'];
}) {
  return (
    <View style={[styles.row, { borderBottomColor: base.border + '40' }]}>
      <View style={styles.rowLabelWrap}>
        <Text style={[styles.rowLabel, { color: disabled ? base.textMuted : base.text }]}>
          {label}
        </Text>
        {hint && (
          <Text style={[styles.rowHint, { color: base.textMuted }]}>{hint}</Text>
        )}
      </View>
      <Switch
        value={value && !disabled}
        onValueChange={onToggle}
        disabled={disabled}
        trackColor={{ false: base.bgSurface, true: base.gold + '60' }}
        thumbColor={value && !disabled ? base.gold : base.textMuted}
      />
    </View>
  );
}

/* ── Styles ──────────────────────────────────────────────────────── */

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.md },
  headerSpacing: { marginBottom: spacing.lg },
  sectionLabel: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 11,
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
    marginTop: spacing.xl,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  rowLabelWrap: {
    flex: 1,
    marginRight: spacing.md,
  },
  rowLabel: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 14,
  },
  rowHint: {
    fontFamily: fontFamily.ui,
    fontSize: 11,
    marginTop: 2,
  },
});

export default withErrorBoundary(NotificationPrefsScreen);
