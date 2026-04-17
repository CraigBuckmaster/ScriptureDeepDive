/**
 * AmicusNewThreadScreen — creates a new thread and redirects to it.
 *
 * Accepts optional `seedQuery` + `seedChapterRef` for FAB peek / home card
 * deep-link handoff (Phase 3/4). The streaming flow is wired in #1455; for
 * #1454 we just create the empty thread and navigate in.
 */
import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { createAmicusThread } from '../db/userMutations';
import { useTheme } from '../theme';
import type { ScreenNavProp, ScreenRouteProp } from '../navigation/types';
import { logger } from '../utils/logger';

function uuid(): string {
  // Avoid pulling a crypto dep — Math.random + timestamp is good enough for
  // client-only thread ids.
  const rand = Math.random().toString(16).slice(2, 10);
  const stamp = Date.now().toString(16);
  return `t-${stamp}-${rand}`;
}

function titleFromSeed(seed?: string): string {
  if (!seed) return 'New conversation';
  const trimmed = seed.trim().replace(/\s+/g, ' ');
  return trimmed.length > 60 ? trimmed.slice(0, 57) + '…' : trimmed;
}

export default function AmicusNewThreadScreen(): React.ReactElement {
  const { base } = useTheme();
  const navigation = useNavigation<ScreenNavProp<'Amicus', 'NewThread'>>();
  const route = useRoute<ScreenRouteProp<'Amicus', 'NewThread'>>();
  const params = route.params;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const threadId = uuid();
      try {
        await createAmicusThread({
          threadId,
          title: titleFromSeed(params?.seedQuery),
          chapterRef: params?.seedChapterRef ?? null,
        });
        if (cancelled) return;
        navigation.replace('Thread', { threadId });
      } catch (err) {
        logger.error('Amicus', 'create thread failed', err);
        if (!cancelled) navigation.goBack();
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [navigation, params]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: base.bg }]}>
      <View style={styles.center}>
        <ActivityIndicator color={base.gold} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
