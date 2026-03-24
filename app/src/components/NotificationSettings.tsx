/**
 * NotificationSettings — Settings section for notification management.
 */

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Switch } from 'react-native';
import { requestPermission, scheduleDailyVerse, cancelAllNotifications } from '../services/notifications';
import { getPreference, setPreference } from '../db/user';
import { base, spacing } from '../theme';

export function NotificationSettings() {
  const [granted, setGranted] = useState(false);
  const [dailyVerse, setDailyVerse] = useState(false);

  useEffect(() => {
    getPreference('notifications_granted').then((v) => setGranted(v === '1'));
    getPreference('daily_verse_enabled').then((v) => setDailyVerse(v === '1'));
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
      await scheduleDailyVerse(7, 0);
    } else {
      await cancelAllNotifications();
    }
  };

  return (
    <View style={{ marginTop: spacing.xl }}>
      <Text style={{ color: base.textMuted, fontFamily: 'Cinzel_400Regular', fontSize: 10, letterSpacing: 0.5, marginBottom: spacing.sm }}>
        NOTIFICATIONS
      </Text>

      {!granted ? (
        <TouchableOpacity onPress={handleRequestPermission} style={{ paddingVertical: spacing.sm }}>
          <Text style={{ color: base.gold, fontFamily: 'SourceSans3_500Medium', fontSize: 14 }}>
            Enable Notifications
          </Text>
          <Text style={{ color: base.textMuted, fontSize: 11, marginTop: 2 }}>
            Permission not yet granted
          </Text>
        </TouchableOpacity>
      ) : (
        <View style={{
          flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
          paddingVertical: spacing.md,
        }}>
          <View>
            <Text style={{ color: base.text, fontFamily: 'SourceSans3_500Medium', fontSize: 14 }}>
              Daily Verse
            </Text>
            <Text style={{ color: base.textMuted, fontSize: 11 }}>7:00 AM daily</Text>
          </View>
          <Switch
            value={dailyVerse}
            onValueChange={handleToggleDailyVerse}
            trackColor={{ false: base.bgSurface, true: base.gold + '60' }}
            thumbColor={dailyVerse ? base.gold : base.textMuted}
          />
        </View>
      )}
    </View>
  );
}
