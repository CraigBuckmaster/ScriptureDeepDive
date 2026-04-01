/**
 * NotificationSettings — Settings section for notification management.
 *
 * Users can toggle the daily verse notification and choose the hour
 * it fires (defaults to 7 AM).
 */

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Switch, StyleSheet } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { requestPermission, scheduleDailyVerse, cancelAllNotifications } from '../services/notifications';
import { getPreference, setPreference } from '../db/user';
import { useTheme, spacing, fontFamily, radii, MIN_TOUCH_TARGET } from '../theme';

const DEFAULT_HOUR = 7;

function formatHour(hour: number): string {
  if (hour === 0) return '12:00 AM';
  if (hour === 12) return '12:00 PM';
  if (hour < 12) return `${hour}:00 AM`;
  return `${hour - 12}:00 PM`;
}

export function NotificationSettings() {
  const { base } = useTheme();
  const [granted, setGranted] = useState(false);
  const [dailyVerse, setDailyVerse] = useState(false);
  const [hour, setHour] = useState(DEFAULT_HOUR);

  useEffect(() => {
    getPreference('notifications_granted').then((v) => setGranted(v === '1'));
    getPreference('daily_verse_enabled').then((v) => setDailyVerse(v === '1'));
    getPreference('notification_hour').then((v) => {
      const parsed = v ? parseInt(v, 10) : NaN;
      if (!isNaN(parsed) && parsed >= 0 && parsed <= 23) setHour(parsed);
    });
  }, []);

  const handleRequestPermission = async () => {
    const result = await requestPermission();
    setGranted(result);
    await setPreference('notifications_granted', result ? '1' : '0');
  };

  const handleToggleDailyVerse = async (enabled: boolean) => {
    setDailyVerse(enabled);
    await setPreference('daily_verse_enabled', enabled ? '1' : '0');
    if (enabled) {
      await scheduleDailyVerse(hour, 0);
    } else {
      await cancelAllNotifications();
    }
  };

  const changeHour = async (delta: number) => {
    const next = ((hour + delta) % 24 + 24) % 24;
    setHour(next);
    await setPreference('notification_hour', String(next));
    if (dailyVerse) {
      await scheduleDailyVerse(next, 0);
    }
  };

  return (
    <View style={{ marginTop: spacing.xl }}>
      <Text style={{ color: base.textMuted, fontFamily: fontFamily.uiMedium, fontSize: 11, letterSpacing: 0.5, marginBottom: spacing.sm }}>
        NOTIFICATIONS
      </Text>

      {!granted ? (
        <TouchableOpacity onPress={handleRequestPermission} style={{ paddingVertical: spacing.sm }}>
          <Text style={{ color: base.gold, fontFamily: fontFamily.uiMedium, fontSize: 14 }}>
            Enable Notifications
          </Text>
          <Text style={{ color: base.textMuted, fontSize: 11, marginTop: 2 }}>
            Permission not yet granted
          </Text>
        </TouchableOpacity>
      ) : (
        <View>
          {/* Toggle row */}
          <View style={styles.toggleRow}>
            <View>
              <Text style={{ color: base.text, fontFamily: fontFamily.uiMedium, fontSize: 14 }}>
                Daily Verse
              </Text>
              <Text style={{ color: base.textMuted, fontSize: 11 }}>{formatHour(hour)} daily</Text>
            </View>
            <Switch
              value={dailyVerse}
              onValueChange={handleToggleDailyVerse}
              trackColor={{ false: base.bgSurface, true: base.gold + '60' }}
              thumbColor={dailyVerse ? base.gold : base.textMuted}
            />
          </View>

          {/* Hour picker — only show when enabled */}
          {dailyVerse && (
            <View style={[styles.hourPicker, { borderColor: base.border }]}>
              <TouchableOpacity
                onPress={() => changeHour(-1)}
                style={styles.arrowBtn}
                accessibilityRole="button"
                accessibilityLabel="Earlier hour"
              >
                <ChevronLeft size={18} color={base.gold} />
              </TouchableOpacity>

              <Text style={[styles.hourText, { color: base.text }]}>
                {formatHour(hour)}
              </Text>

              <TouchableOpacity
                onPress={() => changeHour(1)}
                style={styles.arrowBtn}
                accessibilityRole="button"
                accessibilityLabel="Later hour"
              >
                <ChevronRight size={18} color={base.gold} />
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  hourPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: radii.md,
    paddingVertical: spacing.xs,
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  arrowBtn: {
    minWidth: MIN_TOUCH_TARGET,
    minHeight: MIN_TOUCH_TARGET,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hourText: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 15,
    minWidth: 90,
    textAlign: 'center',
  },
});
