/**
 * Settings → Amicus section (#1459).
 *
 * Four rows:
 *   1. Enable Amicus toggle (hides tab/FAB/home card when off)
 *   2. Show My Amicus Profile → AmicusProfileInspectorScreen
 *   3. Clear Amicus History (destructive, confirm modal)
 *   4. Reset Privacy Notice (re-triggers first-use modal)
 */
import React from 'react';
import {
  Alert,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { clearAllAmicusData } from '../../db/userMutations';
import { resetAmicusOptIn } from '../../services/amicus/consent';
import { clearProfile } from '../../services/amicus/profile/generator';
import { fontFamily, spacing } from '../../theme';
import type { BaseColors } from '../../theme/palettes';
import { logger } from '../../utils/logger';
import { SectionLabel } from './SectionLabel';

export interface AmicusSettingsSectionProps {
  base: BaseColors;
  amicusEnabled: boolean;
  setAmicusEnabled: (v: boolean) => void;
  onInspectProfile: () => void;
  onToast?: (message: string) => void;
}

export function AmicusSettingsSection(
  props: AmicusSettingsSectionProps,
): React.ReactElement {
  const { base } = props;

  const handleClearHistory = (): void => {
    Alert.alert(
      'Clear Amicus History?',
      'This deletes all your conversations and resets Amicus\'s profile. ' +
        'Your notes, highlights, and reading progress are not affected.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear History',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearAllAmicusData();
              await clearProfile();
              props.onToast?.('Amicus history cleared.');
              logger.info('AmicusSettings', 'history cleared');
            } catch (err) {
              logger.error('AmicusSettings', 'clear failed', err);
            }
          },
        },
      ],
      { cancelable: true },
    );
  };

  const handleResetPrivacy = async (): Promise<void> => {
    try {
      await resetAmicusOptIn();
      props.onToast?.('Privacy notice reset.');
    } catch (err) {
      logger.error('AmicusSettings', 'reset privacy failed', err);
    }
  };

  return (
    <>
      <SectionLabel text="AMICUS" base={base} />

      <View style={[styles.row, { borderBottomColor: `${base.border}40` }]}>
        <View style={styles.rowBody}>
          <Text style={[styles.rowLabel, { color: base.text, fontFamily: fontFamily.body }]}>
            Enable Amicus
          </Text>
          <Text style={[styles.rowSubtitle, { color: base.textMuted, fontFamily: fontFamily.body }]}>
            Turn on your scholarly study companion.
          </Text>
        </View>
        <Switch
          accessibilityLabel="Enable Amicus"
          value={props.amicusEnabled}
          onValueChange={props.setAmicusEnabled}
          trackColor={{ false: base.border, true: base.gold }}
          thumbColor={base.bg}
        />
      </View>

      <Pressable
        accessibilityLabel="Show My Amicus Profile"
        onPress={props.onInspectProfile}
        style={({ pressed }) => [
          styles.row,
          {
            borderBottomColor: `${base.border}40`,
            backgroundColor: pressed ? base.bgSurface : 'transparent',
          },
        ]}
      >
        <View style={styles.rowBody}>
          <Text style={[styles.rowLabel, { color: base.text, fontFamily: fontFamily.body }]}>
            Show My Amicus Profile
          </Text>
          <Text style={[styles.rowSubtitle, { color: base.textMuted, fontFamily: fontFamily.body }]}>
            See the summary Amicus sends when you ask a question.
          </Text>
        </View>
        <ChevronRight size={18} color={base.textMuted} />
      </Pressable>

      <Pressable
        accessibilityLabel="Clear Amicus History"
        onPress={handleClearHistory}
        style={({ pressed }) => [
          styles.row,
          {
            borderBottomColor: `${base.border}40`,
            backgroundColor: pressed ? base.bgSurface : 'transparent',
          },
        ]}
      >
        <View style={styles.rowBody}>
          <Text style={[styles.rowLabel, { color: base.danger, fontFamily: fontFamily.body }]}>
            Clear Amicus History
          </Text>
          <Text style={[styles.rowSubtitle, { color: base.textMuted, fontFamily: fontFamily.body }]}>
            Delete all conversations and reset Amicus&rsquo;s profile.
          </Text>
        </View>
      </Pressable>

      <Pressable
        accessibilityLabel="Reset Privacy Notice"
        onPress={() => void handleResetPrivacy()}
        style={({ pressed }) => [
          styles.row,
          {
            borderBottomColor: `${base.border}40`,
            backgroundColor: pressed ? base.bgSurface : 'transparent',
          },
        ]}
      >
        <View style={styles.rowBody}>
          <Text style={[styles.rowLabel, { color: base.text, fontFamily: fontFamily.body }]}>
            Reset Privacy Notice
          </Text>
          <Text style={[styles.rowSubtitle, { color: base.textMuted, fontFamily: fontFamily.body }]}>
            Show the first-use privacy modal again next time you use Amicus.
          </Text>
        </View>
      </Pressable>
    </>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: spacing.sm,
  },
  rowBody: { flex: 1, gap: 2 },
  rowLabel: { fontSize: 15 },
  rowSubtitle: { fontSize: 12 },
});
