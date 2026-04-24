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
import {
  appendAmicusMessage,
  createAmicusThread,
  upsertAmicusThreadContext,
  upsertAmicusThreadSummary,
} from '../db/userMutations';
import { serializeAmicusChapterRef } from '../services/amicus/context';
import { deriveThreadIntelligence } from '../services/amicus/threadIntelligence';
import { useTheme } from '../theme';
import type { ScreenNavProp, ScreenRouteProp } from '../navigation/types';
import type { AmicusDraftMessage } from '../types';
import { logger } from '../utils/logger';

function createThreadId(): string {
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

function createMessageId(prefix: string): string {
  const rand = Math.random().toString(16).slice(2, 10);
  const stamp = Date.now().toString(16);
  return `${prefix}-${stamp}-${rand}`;
}

function latestUserQuery(messages?: AmicusDraftMessage[]): string | undefined {
  if (!messages || messages.length === 0) return undefined;
  const reversed = [...messages].reverse();
  return reversed.find((message) => message.role === 'user')?.content;
}

async function persistPromotedMessages(
  threadId: string,
  messages: AmicusDraftMessage[],
): Promise<void> {
  for (const message of messages) {
    await appendAmicusMessage({
      messageId: createMessageId('m'),
      threadId,
      role: message.role,
      content: message.content,
      citations: message.role === 'assistant' ? message.citations : undefined,
      followUps: message.role === 'assistant' ? message.follow_ups : undefined,
    });
  }
}

export default function AmicusNewThreadScreen(): React.ReactElement {
  const { base } = useTheme();
  const navigation = useNavigation<ScreenNavProp<'Amicus', 'NewThread'>>();
  const route = useRoute<ScreenRouteProp<'Amicus', 'NewThread'>>();
  const params = route.params;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const threadId = createThreadId();
      const seedChapterRef = serializeAmicusChapterRef(params?.seedChapterRef);
      const seedText = params?.seedQuery ?? latestUserQuery(params?.promotedMessages);
      const derived = seedText
        ? deriveThreadIntelligence({
            currentTitle: titleFromSeed(seedText),
            chapterRef: seedChapterRef ?? null,
            userQuery: seedText,
            openQuestionText: params?.seedGuidedContext?.openQuestionText,
            takeaway: params?.seedGuidedContext?.takeaway,
            keyConnection: params?.seedGuidedContext?.keyConnection,
          })
        : null;
      try {
        await createAmicusThread({
          threadId,
          title: derived?.title ?? titleFromSeed(seedText),
          chapterRef: seedChapterRef,
        });
        if (params?.promotedMessages?.length) {
          await persistPromotedMessages(threadId, params.promotedMessages);
        }
        if (params?.seedGuidedContext) {
          await upsertAmicusThreadContext({
            threadId,
            entryPoint: params.seedGuidedContext.entryPoint ?? 'thread',
            guidedSessionId: params.seedGuidedContext.sessionId,
            guidedStep: params.seedGuidedContext.guidedStudyStep,
            openQuestionId: params.seedGuidedContext.openQuestionId,
            takeaway: params.seedGuidedContext.takeaway,
            keyConnection: params.seedGuidedContext.keyConnection,
          });
        }
        if (derived) {
          await upsertAmicusThreadSummary({
            threadId,
            summaryText: derived.summaryText,
            lastUserIntent: derived.lastUserIntent,
          });
        }
        if (cancelled) return;
        navigation.replace('Thread', {
          threadId,
          initialQuery: params?.promotedMessages?.length ? undefined : params?.seedQuery,
          seedChapterRef: seedChapterRef ?? undefined,
          seedGuidedContext: params?.seedGuidedContext,
        });
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
