/**
 * AmicusThreadScreen — live conversation view with streaming chat.
 *
 * Shell came from #1454; this card (#1455) wires the streaming orchestrator,
 * MessageList, InputBar, and error banners.
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ChevronLeft, Share } from 'lucide-react-native';
import { Share as RNShare } from 'react-native';
import { useTheme, spacing, fontFamily } from '../theme';
import {
  getAmicusThread,
  getAmicusThreadContext,
  getLinkedGuidedStudyQuestionForThread,
} from '../db/userQueries';
import MessageList from '../components/amicus/MessageList';
import InputBar from '../components/amicus/InputBar';
import MetaFaqModal from '../components/amicus/MetaFaqModal';
import StudyActionRow from '../components/amicus/StudyActionRow';
import { useAmicusContext } from '../hooks/useAmicusContext';
import { useAmicusThread } from '../hooks/useAmicusThread';
import { useAmicusAccess } from '../hooks/useAmicusAccess';
import CapExceededBanner from '../components/amicus/CapExceededBanner';
import {
  reopenGuidedStudyQuestion,
  resolveGuidedStudyQuestion,
  updateThreadTitle,
  upsertAmicusThreadSummary,
} from '../db/userMutations';
import { getAmicusAuthToken } from '../services/amicus/authToken';
import { formatAmicusContextLabel } from '../services/amicus/context';
import { exportThreadToMarkdown } from '../services/amicus/exportThread';
import { buildStudyActionSeeds, type AmicusStudyActionSeed } from '../services/amicus/studyActions';
import {
  deriveThreadIntelligence,
  shouldAutoRenameThread,
  summarizeLinkedQuestionState,
} from '../services/amicus/threadIntelligence';
import { navigateToCitation, type MetaFaqArticle } from '../services/amicus/citationNav';
import { useAmicusConsent } from '../services/amicus/consent';
import { useSuppressAmicusFab } from '../contexts/AmicusFabContext';
import type {
  AmicusCitation,
  AmicusThread,
  AmicusThreadContextRecord,
  GuidedStudyQuestion,
} from '../types';
import type { ScreenNavProp, ScreenRouteProp } from '../navigation/types';
import { logger } from '../utils/logger';

export default function AmicusThreadScreen(): React.ReactElement {
  const { base } = useTheme();
  const navigation = useNavigation<ScreenNavProp<'Amicus', 'Thread'>>();
  const route = useRoute<ScreenRouteProp<'Amicus', 'Thread'>>();
  const { threadId, initialQuery, seedChapterRef, seedGuidedContext } = route.params;

  const [thread, setThread] = useState<AmicusThread | null>(null);
  const [threadContext, setThreadContext] = useState<AmicusThreadContextRecord | null>(null);
  const [linkedQuestion, setLinkedQuestion] = useState<GuidedStudyQuestion | null>(null);
  const [faqArticle, setFaqArticle] = useState<MetaFaqArticle | null>(null);
  const { requestAmicusConsent } = useAmicusConsent();
  const access = useAmicusAccess();
  const amicusContext = useAmicusContext({
    entryPoint: threadContext?.entry_point ?? seedGuidedContext?.entryPoint ?? 'thread',
    chapterRefOverride: thread?.chapter_ref ?? seedChapterRef ?? null,
    guidedStudyContext: {
      entryPoint: threadContext?.entry_point ?? seedGuidedContext?.entryPoint ?? 'thread',
      sessionId: threadContext?.guided_session_id ?? seedGuidedContext?.sessionId ?? null,
      guidedStudyStep: threadContext?.guided_step ?? seedGuidedContext?.guidedStudyStep ?? null,
      openQuestionId:
        linkedQuestion?.id ??
        threadContext?.open_question_id ??
        seedGuidedContext?.openQuestionId ??
        null,
      openQuestionText:
        linkedQuestion?.question_text ?? seedGuidedContext?.openQuestionText ?? null,
      takeaway: threadContext?.takeaway ?? seedGuidedContext?.takeaway ?? null,
      keyConnection: threadContext?.key_connection ?? seedGuidedContext?.keyConnection ?? null,
    },
  });
  const { messages, isStreaming, error, sendMessage, abortStream, clearError } = useAmicusThread(
    threadId,
    { context: amicusContext },
  );
  useSuppressAmicusFab();

  const chapterLabel = formatAmicusContextLabel(thread?.chapter_ref ?? seedChapterRef ?? null);
  const questionText = linkedQuestion?.question_text ?? amicusContext.openQuestionText;
  const questionResolved = linkedQuestion?.status === 'resolved';
  const takeawayText = threadContext?.takeaway ?? amicusContext.takeaway;
  const connectionText = threadContext?.key_connection ?? amicusContext.keyConnection;
  const actionSeeds = React.useMemo(() => buildStudyActionSeeds(amicusContext), [amicusContext]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const [t, context, question] = await Promise.all([
          getAmicusThread(threadId),
          getAmicusThreadContext(threadId),
          getLinkedGuidedStudyQuestionForThread(threadId),
        ]);
        if (!cancelled) {
          setThread(t);
          setThreadContext(context);
          setLinkedQuestion(question);
        }
      } catch (err) {
        logger.error('Amicus', 'thread fetch failed', err);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [threadId]);

  const persistThreadIntelligence = useCallback(
    async (text: string, action?: AmicusStudyActionSeed) => {
      const derived = deriveThreadIntelligence({
        currentTitle: thread?.title,
        chapterRef: thread?.chapter_ref ?? seedChapterRef ?? null,
        userQuery: text,
        action,
        openQuestionText: questionText ?? seedGuidedContext?.openQuestionText ?? null,
        takeaway: threadContext?.takeaway ?? seedGuidedContext?.takeaway,
        keyConnection: threadContext?.key_connection ?? seedGuidedContext?.keyConnection,
      });

      try {
        if (shouldAutoRenameThread(thread?.title) && derived.title !== thread?.title) {
          await updateThreadTitle(threadId, derived.title);
        }
        await upsertAmicusThreadSummary({
          threadId,
          summaryText: derived.summaryText,
          lastUserIntent: derived.lastUserIntent,
        });
        setThread((prev) =>
          prev
            ? {
                ...prev,
                title:
                  shouldAutoRenameThread(prev.title) && derived.title !== prev.title
                    ? derived.title
                    : prev.title,
                summary_text: derived.summaryText,
                last_user_intent: derived.lastUserIntent,
              }
            : prev,
        );
      } catch (err) {
        logger.warn('Amicus', 'thread intelligence update failed', err);
      }
    },
    [
      questionText,
      seedChapterRef,
      seedGuidedContext?.keyConnection,
      seedGuidedContext?.openQuestionText,
      seedGuidedContext?.takeaway,
      thread,
      threadContext?.key_connection,
      threadContext?.takeaway,
      threadId,
    ],
  );

  const sendWithContext = useCallback(
    async (text: string, action?: AmicusStudyActionSeed) => {
      if (access.reason === 'not_premium') {
        navigation.navigate('Paywall');
        return;
      }
      if (access.reason === 'monthly_cap_reached' || access.reason === 'offline') {
        logger.info('Amicus', `send blocked: ${access.reason}`);
        return;
      }

      const authToken = await getAmicusAuthToken();
      if (!authToken) {
        logger.warn('Amicus', 'no auth token â€” aborting send');
        return;
      }
      const accepted = await requestAmicusConsent();
      if (!accepted) {
        logger.info('Amicus', 'opt-in declined â€” not sending');
        return;
      }
      await persistThreadIntelligence(text, action);
      await sendMessage(text, authToken);
    },
    [access.reason, navigation, requestAmicusConsent, persistThreadIntelligence, sendMessage],
  );

  // Auto-send the seed query once per mount when navigated in from the
  // home card / deep-link handoff (#1467). Guarded by a ref so rapid
  // re-renders don't re-dispatch. Deferred with queueMicrotask so the
  // setState calls sendWithContext performs don't run synchronously
  // within the effect body (react-hooks/set-state-in-effect).
  const autoSentRef = useRef(false);
  useEffect(() => {
    if (autoSentRef.current) return;
    if (!initialQuery) return;
    if (messages.length > 0) return;
    if (isStreaming) return;
    autoSentRef.current = true;
    queueMicrotask(() => {
      void sendWithContext(initialQuery);
    });
  }, [initialQuery, messages.length, isStreaming, sendWithContext]);

  const handleExport = useCallback(async () => {
    try {
      const payload = await exportThreadToMarkdown(threadId);
      await RNShare.share({
        title: payload.title,
        message: payload.markdown,
      });
    } catch (err) {
      logger.error('Amicus', 'export failed', err);
    }
  }, [threadId]);

  const handleCitation = useCallback(
    async (c: AmicusCitation) => {
      const parts = c.chunk_id.split(':');
      const source_id = parts.slice(1).join(':');
      const outcome = await navigateToCitation(
        {
          chunk_id: c.chunk_id,
          source_type: c.source_type,
          source_id,
        },
        navigation,
      );
      if (outcome.kind === 'modal' && outcome.modal === 'meta_faq') {
        setFaqArticle(outcome.article);
      } else if (outcome.kind === 'unresolved') {
        logger.warn('Amicus', `citation unresolved: ${c.chunk_id}`);
      }
    },
    [navigation],
  );

  const toggleQuestionStatus = useCallback(async () => {
    if (!linkedQuestion) return;
    try {
      if (linkedQuestion.status === 'resolved') {
        await reopenGuidedStudyQuestion(linkedQuestion.id);
        const nextSummary = summarizeLinkedQuestionState({
          chapterRef: thread?.chapter_ref ?? seedChapterRef ?? null,
          questionText: linkedQuestion.question_text,
          status: 'open',
        });
        await upsertAmicusThreadSummary({
          threadId,
          summaryText: nextSummary,
          lastUserIntent: 'Investigate question',
        });
        setLinkedQuestion((prev) => (prev ? { ...prev, status: 'open', resolved_at: null } : prev));
        setThread((prev) =>
          prev
            ? { ...prev, summary_text: nextSummary, last_user_intent: 'Investigate question' }
            : prev,
        );
      } else {
        await resolveGuidedStudyQuestion(linkedQuestion.id);
        const nextSummary = summarizeLinkedQuestionState({
          chapterRef: thread?.chapter_ref ?? seedChapterRef ?? null,
          questionText: linkedQuestion.question_text,
          status: 'resolved',
        });
        await upsertAmicusThreadSummary({
          threadId,
          summaryText: nextSummary,
          lastUserIntent: 'Resolved question',
        });
        setLinkedQuestion((prev) =>
          prev ? { ...prev, status: 'resolved', resolved_at: new Date().toISOString() } : prev,
        );
        setThread((prev) =>
          prev
            ? { ...prev, summary_text: nextSummary, last_user_intent: 'Resolved question' }
            : prev,
        );
      }
    } catch (err) {
      logger.warn('Amicus', 'failed to update linked question status', err);
    }
  }, [linkedQuestion, seedChapterRef, thread, threadId]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: base.bg }]}>
      <View style={[styles.header, { borderBottomColor: base.border }]}>
        <Pressable
          accessibilityLabel="Back"
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <ChevronLeft size={24} color={base.text} />
        </Pressable>
        <View style={styles.headerText}>
          <Text
            numberOfLines={1}
            style={[styles.headerTitle, { color: base.text, fontFamily: fontFamily.display }]}
          >
            {thread?.title ?? 'Amicus'}
          </Text>
          <View style={styles.headerMetaRow}>
            {chapterLabel && (
              <Text style={[styles.headerBadge, { color: base.gold }]}>{chapterLabel}</Text>
            )}
            {access.entitlement === 'partner_plus' && (
              <Text
                accessibilityLabel="Powered by Sonnet"
                style={[
                  styles.partnerPlusBadge,
                  { color: base.gold, borderColor: `${base.gold}50` },
                ]}
              >
                PARTNER+
              </Text>
            )}
          </View>
        </View>
        {access.entitlement === 'partner_plus' && (
          <Pressable
            accessibilityLabel="Export conversation"
            onPress={() => void handleExport()}
            style={styles.headerAction}
          >
            <Share size={20} color={base.text} />
          </Pressable>
        )}
      </View>

      {(chapterLabel ||
        thread?.last_user_intent ||
        thread?.summary_text ||
        questionText ||
        takeawayText ||
        connectionText) && (
        <View style={[styles.contextHeader, { borderBottomColor: base.border }]}>
          <View style={styles.contextMetaRow}>
            {chapterLabel && (
              <Text
                style={[styles.contextBadge, { color: base.gold, borderColor: `${base.gold}40` }]}
              >
                {chapterLabel}
              </Text>
            )}
            {thread?.last_user_intent && (
              <Text style={[styles.contextIntent, { color: base.textMuted }]}>
                {thread.last_user_intent}
              </Text>
            )}
          </View>
          {thread?.summary_text && (
            <Text style={[styles.contextSummary, { color: base.textMuted }]}>
              {thread.summary_text}
            </Text>
          )}
          {questionText && (
            <View
              style={[
                styles.questionCard,
                {
                  backgroundColor: base.bgSurface,
                  borderColor: `${base.gold}28`,
                },
              ]}
            >
              <View style={styles.questionHeaderRow}>
                <Text style={[styles.questionEyebrow, { color: base.gold }]}>Open Question</Text>
                {linkedQuestion && (
                  <Pressable
                    accessibilityLabel={
                      questionResolved ? 'Reopen question' : 'Mark question resolved'
                    }
                    onPress={() => void toggleQuestionStatus()}
                    style={[styles.questionAction, { borderColor: `${base.gold}38` }]}
                  >
                    <Text style={[styles.questionActionText, { color: base.gold }]}>
                      {questionResolved ? 'Reopen' : 'Resolve'}
                    </Text>
                  </Pressable>
                )}
              </View>
              <Text style={[styles.questionText, { color: base.text }]}>{questionText}</Text>
            </View>
          )}
          {!questionText && takeawayText && (
            <Text style={[styles.contextSummary, { color: base.textMuted }]}>
              Takeaway: {takeawayText}
            </Text>
          )}
          {!questionText && !takeawayText && connectionText && (
            <Text style={[styles.contextSummary, { color: base.textMuted }]}>
              Connection: {connectionText}
            </Text>
          )}
        </View>
      )}

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {messages.length === 0 && !isStreaming && actionSeeds.length > 0 && (
          <View style={styles.studyActionWrap}>
            <StudyActionRow
              actions={actionSeeds}
              onSelect={(action) => void sendWithContext(action.seedQuery, action)}
            />
          </View>
        )}

        <MessageList
          messages={messages}
          isStreaming={isStreaming}
          onCitationPress={handleCitation}
          onFollowUp={(text) => void sendWithContext(text)}
        />

        {error && <ErrorBanner error={error} onDismiss={clearError} />}

        {access.reason === 'monthly_cap_reached' && (
          <CapExceededBanner
            entitlement={access.entitlement}
            onUpgrade={() =>
              navigation.getParent()?.navigate('MoreTab', {
                screen: 'Subscription',
              })
            }
          />
        )}

        <InputBar
          isStreaming={isStreaming}
          disabled={access.reason !== 'ok'}
          onSend={(t) => void sendWithContext(t)}
          onAbort={abortStream}
        />
      </KeyboardAvoidingView>

      <MetaFaqModal article={faqArticle} onClose={() => setFaqArticle(null)} />
    </SafeAreaView>
  );
}

function ErrorBanner({
  error,
  onDismiss,
}: {
  error: { code: string; message: string };
  onDismiss: () => void;
}): React.ReactElement {
  const { base } = useTheme();
  const message = bannerCopy(error.code);
  return (
    <Pressable
      accessibilityLabel={`${message}. Tap to dismiss.`}
      onPress={onDismiss}
      style={[styles.banner, { backgroundColor: `${base.gold}20`, borderColor: base.gold }]}
    >
      <Text style={{ color: base.text, fontFamily: fontFamily.body, fontSize: 13 }}>{message}</Text>
    </Pressable>
  );
}

function bannerCopy(code: string): string {
  switch (code) {
    case 'OFFLINE':
      return 'Amicus needs an internet connection. Tap to dismiss.';
    case 'PROXY_UNAUTHORIZED':
      return 'Your subscription is required to use Amicus. Tap to dismiss.';
    case 'EMBED_FAILED':
      return 'Amicus is temporarily unavailable. Tap to dismiss.';
    case 'EXTENSION_NOT_LOADED':
      return 'Amicus retrieval is unavailable on this device build. Tap to dismiss.';
    default:
      return 'Something went wrong. Tap to dismiss.';
  }
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backButton: { padding: spacing.xs },
  headerText: { flex: 1, marginLeft: spacing.sm },
  headerTitle: { fontSize: 16 },
  headerMetaRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginTop: 2 },
  headerBadge: { fontSize: 11 },
  partnerPlusBadge: {
    fontSize: 9,
    letterSpacing: 0.6,
    fontWeight: '600',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  headerAction: { padding: spacing.xs },
  contextHeader: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: spacing.xs,
  },
  contextMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  contextBadge: {
    fontSize: 11,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
    overflow: 'hidden',
  },
  contextIntent: {
    fontSize: 12,
    fontFamily: fontFamily.bodyItalic,
  },
  contextSummary: {
    fontSize: 12,
    lineHeight: 17,
  },
  questionCard: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 12,
    padding: spacing.sm,
    gap: spacing.xs,
  },
  questionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  questionEyebrow: {
    fontSize: 10,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    fontFamily: fontFamily.uiSemiBold,
  },
  questionText: {
    fontSize: 13,
    lineHeight: 19,
    fontFamily: fontFamily.body,
  },
  questionAction: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  questionActionText: {
    fontSize: 11,
    fontFamily: fontFamily.uiSemiBold,
  },
  banner: {
    padding: spacing.sm,
    marginHorizontal: spacing.sm,
    marginBottom: spacing.xs,
    borderRadius: 12,
    borderWidth: 1,
  },
  studyActionWrap: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
});
