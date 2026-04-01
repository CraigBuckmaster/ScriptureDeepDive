/**
 * NotificationSettings — Settings section for notification management.
 *
 * Users can toggle the daily verse notification and choose the exact
 * hour and minute it fires (defaults to 7:00 AM).
 */

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Switch, StyleSheet } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { requestPermission, scheduleDailyVerse, cancelAllNotifications } from '../services/notifications';
import { getPreference, setPreference } from '../db/user';
import { useTheme, spacing, fontFamily, radii, MIN_TOUCH_TARGET } from '../theme';

const DEFAULT_HOUR = 7;
const DEFAULT_MINUTE = 0;

function formatTime(hour: number, minute: number): string {
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  const displayMinute = String(minute).padStart(2, '0');
  return `${displayHour}:${displayMinute} ${period}`;
}

export function NotificationSettings() {
  const { base } = useTheme();
  const [granted, setGranted] = useState(false);
  const [dailyVerse, setDailyVerse] = useState(false);
  const [hour, setHour] = useState(DEFAULT_HOUR);
  const [minute, setMinute] = useState(DEFAULT_MINUTE);

  useEffect(() => {
    getPreference('notifications_granted').then((v) => setGranted(v === '1'));
    getPreference('daily_verse_enabled').then((v) => setDailyVerse(v === '1'));
    getPreference('notification_hour').then((v) => {
      const parsed = v ? parseInt(v, 10) : NaN;
      if (!isNaN(parsed) && parsed >= 0 && parsed <= 23) setHour(parsed);
    });
    getPreference('notification_minute').then((v) => {
      const parsed = v ? parseInt(v, 10) : NaN;
      if (!isNaN(parsed) && parsed >= 0 && parsed <= 59) setMinute(parsed);
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
      await scheduleDailyVerse(hour, minute);
    } else {
      await cancelAllNotifications();
    }
  };

  const changeHour = async (delta: number) => {
    const next = ((hour + delta) % 24 + 24) % 24;
    setHour(next);
    await setPreference('notification_hour', String(next));
    if (dailyVerse) {
      await scheduleDailyVerse(next, minute);
    }
  };

  const changeMinute = async (delta: number) => {
    const next = ((minute + delta) % 60 + 60) % 60;
    setMinute(next);
    await setPreference('notification_minute', String(next));
    if (dailyVerse) {
      await scheduleDailyVerse(hour, next);
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
              <Text style={{ color: base.textMuted, fontSize: 11 }}>{formatTime(hour, minute)} daily</Text>
            </View>
            <Switch
              value={dailyVerse}
              onValueChange={handleToggleDailyVerse}
              trackColor={{ false: base.bgSurface, true: base.gold + '60' }}
              thumbColor={dailyVerse ? base.gold : base.textMuted}
            />
          </View>

          {/* Time picker — only show when enabled */}
          {dailyVerse && (
            <View style={[styles.timePicker, { borderColor: base.border }]}>
              {/* Hour */}
              <View style={styles.timeColumn}>
                <Text style={[styles.timeLabel, { color: base.textMuted }]}>HOUR</Text>
                <View style={styles.timeControl}>
                  <TouchableOpacity
                    onPress={() => changeHour(-1)}
                    style={styles.arrowBtn}
                    accessibilityLabel="Earlier hour"
                  >
                    <ChevronLeft size={18} color={base.gold} />
                  </TouchableOpacity>
                  <Text style={[styles.timeValue, { color: base.text }]}>
                    {hour === 0 ? 12 : hour > 12 ? hour - 12 : hour}
                  </Text>
                  <TouchableOpacity
                    onPress={() => changeHour(1)}
                    style={styles.arrowBtn}
                    accessibilityLabel="Later hour"
                  >
                    <ChevronRight size={18} color={base.gold} />
                  </TouchableOpacity>
                </View>
              </View>

              <Text style={[styles.timeSeparator, { color: base.textMuted }]}>:</Text>

              {/* Minute */}
              <View style={styles.timeColumn}>
                <Text style={[styles.timeLabel, { color: base.textMuted }]}>MIN</Text>
                <View style={styles.timeControl}>
                  <TouchableOpacity
                    onPress={() => changeMinute(-1)}
                    style={styles.arrowBtn}
                    accessibilityLabel="Earlier minute"
                  >
                    <ChevronLeft size={18} color={base.gold} />
                  </TouchableOpacity>
                  <Text style={[styles.timeValue, { color: base.text }]}>
                    {String(minute).padStart(2, '0')}
                  </Text>
                  <TouchableOpacity
                    onPress={() => changeMinute(1)}
                    style={styles.arrowBtn}
                    accessibilityLabel="Later minute"
                  >
                    <ChevronRight size={18} color={base.gold} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* AM/PM */}
              <Text style={[styles.periodLabel, { color: base.gold }]}>
                {hour >= 12 ? 'PM' : 'AM'}
              </Text>
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
  timePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: radii.md,
    paddingVertical: spacing.sm,
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
    gap: spacing.xs,
  },
  timeColumn: {
    alignItems: 'center',
  },
  timeLabel: {
    fontFamily: fontFamily.ui,
    fontSize: 8,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  timeControl: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeValue: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 18,
    minWidth: 32,
    textAlign: 'center',
  },
  timeSeparator: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 18,
    marginTop: 10,
  },
  periodLabel: {
    fontFamily: fontFamily.uiSemiBold,
    fontSize: 14,
    marginLeft: spacing.sm,
    marginTop: 10,
  },
  arrowBtn: {
    minWidth: MIN_TOUCH_TARGET,
    minHeight: MIN_TOUCH_TARGET,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
