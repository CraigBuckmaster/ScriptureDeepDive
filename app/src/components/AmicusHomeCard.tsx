/**
 * components/AmicusHomeCard.tsx — "Amicus noticed..." card on HomeScreen (#1466).
 *
 * Three modes:
 *   1. Premium + daily prompt → shows prompt_text, taps deep-link to Amicus.
 *   2. Premium + no prompt (first launch / offline with no cache) → fallback
 *      copy with the "Ask Amicus anything…" row.
 *   3. Non-premium → "Unlock Amicus" variant with a "See plans →" CTA.
 *
 * Long-press on any variant dismisses the card for the rest of the day via
 * a user-preference key. The dismissal resets the next calendar day.
 */
import { useNavigation, type NavigationProp, type ParamListBase } from '@react-navigation/native';
import { MessageSquare } from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { setPreference } from '../db/userMutations';
import { getPreference } from '../db/userQueries';
import { useAmicusAccess } from '../hooks/useAmicusAccess';
import { useDailyPrompt } from '../hooks/useDailyPrompt';
import { navigateToAmicusWithSeed } from '../services/amicus/deepLink';
import { useSettingsStore } from '../stores/settingsStore';
import { fontFamily, radii, spacing, useTheme } from '../theme';
import { logger } from '../utils/logger';

const DISMISS_KEY = 'amicus_home_card_dismissed_date';

function todayStr(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export default function AmicusHomeCard(): React.ReactElement | null {
  const { base } = useTheme();
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const amicusEnabled = useSettingsStore((s) => s.amicusEnabled);
  const access = useAmicusAccess();
  const { prompt } = useDailyPrompt();

  const [dismissedToday, setDismissedToday] = useState(false);
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const stored = await getPreference(DISMISS_KEY).catch(() => null);
      if (!cancelled && stored === todayStr()) setDismissedToday(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleDismiss = useCallback(async () => {
    setDismissedToday(true);
    await setPreference(DISMISS_KEY, todayStr()).catch((err) => {
      logger.warn('AmicusHomeCard', `dismiss_write_failed: ${String(err)}`);
    });
    logger.info('AmicusHomeCard', 'dismissed for today');
  }, []);

  const navigateToNewThread = useCallback(
    (seedQuery?: string) => {
      if (seedQuery) {
        navigateToAmicusWithSeed(navigation, { query: seedQuery });
        logger.info('AmicusHomeCard', 'tapped prompt');
      } else {
        const parent = navigation.getParent<NavigationProp<ParamListBase>>();
        parent?.navigate('AmicusTab', { screen: 'NewThread' });
        logger.info('AmicusHomeCard', 'tapped input');
      }
    },
    [navigation],
  );

  const navigateToPlans = useCallback(() => {
    const parent = navigation.getParent<NavigationProp<ParamListBase>>();
    parent?.navigate('MoreTab', { screen: 'Subscription' });
    logger.info('AmicusHomeCard', 'tapped upgrade');
  }, [navigation]);

  if (!amicusEnabled) return null;
  if (dismissedToday) return null;

  const isLocked = access.reason === 'not_premium';

  const header = isLocked
    ? 'Unlock Amicus'
    : prompt
      ? 'Amicus noticed…'
      : 'Meet Amicus';

  const body = isLocked
    ? 'Your AI study companion, grounded in 72 scholars. Included with Companion+.'
    : prompt
      ? prompt.prompt_text
      : 'Your scholarly study companion is ready for questions.';

  const onBodyPress = isLocked
    ? navigateToPlans
    : () => navigateToNewThread(prompt?.seed_query);

  return (
    <View
      style={[
        styles.outer,
        { backgroundColor: base.bgElevated, borderColor: `${base.gold}30` },
      ]}
    >
      <View style={[styles.goldStripe, { backgroundColor: base.gold }]} />

      <Pressable
        onPress={onBodyPress}
        onLongPress={handleDismiss}
        accessibilityLabel={isLocked ? 'Unlock Amicus' : 'Open Amicus'}
        accessibilityHint={
          isLocked
            ? 'Opens the subscription screen'
            : 'Opens a new Amicus thread. Long-press to hide this card for the day.'
        }
        android_ripple={{ color: `${base.gold}20` }}
        style={styles.inner}
      >
        <View style={styles.headerRow}>
          <MessageSquare size={16} color={base.gold} />
          <Text
            style={[
              styles.header,
              { color: base.gold, fontFamily: fontFamily.displaySemiBold },
            ]}
          >
            {header}
          </Text>
        </View>

        <Text
          style={[
            styles.body,
            { color: base.text, fontFamily: fontFamily.body },
          ]}
        >
          {body}
        </Text>

        {isLocked ? (
          <TouchableOpacity
            onPress={navigateToPlans}
            accessibilityLabel="See plans"
            style={[
              styles.ctaButton,
              { borderColor: base.gold, backgroundColor: `${base.gold}15` },
            ]}
          >
            <Text
              style={[
                styles.ctaText,
                { color: base.gold, fontFamily: fontFamily.uiMedium },
              ]}
            >
              See plans →
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={() => navigateToNewThread()}
            accessibilityLabel="Ask Amicus anything"
            style={[
              styles.inputRow,
              { backgroundColor: base.bg, borderColor: base.border },
            ]}
          >
            <Text
              numberOfLines={1}
              style={[
                styles.inputPlaceholder,
                { color: base.textMuted, fontFamily: fontFamily.bodyItalic },
              ]}
            >
              Ask Amicus anything…
            </Text>
          </TouchableOpacity>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    flexDirection: 'row',
    borderRadius: radii.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  goldStripe: {
    width: 4,
  },
  inner: {
    flex: 1,
    padding: spacing.md,
    gap: spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  header: {
    fontSize: 14,
    letterSpacing: 0.3,
  },
  body: {
    fontSize: 14,
    lineHeight: 20,
  },
  inputRow: {
    borderWidth: 1,
    borderRadius: radii.md,
    paddingHorizontal: spacing.sm + 4,
    paddingVertical: spacing.sm,
  },
  inputPlaceholder: {
    fontSize: 13,
  },
  ctaButton: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    marginTop: spacing.xs,
  },
  ctaText: {
    fontSize: 13,
  },
});
