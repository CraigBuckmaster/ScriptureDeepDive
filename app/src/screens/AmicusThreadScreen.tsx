/**
 * AmicusThreadScreen — live conversation view with streaming chat.
 *
 * Shell came from #1454; this card (#1455) wires the streaming orchestrator,
 * MessageList, InputBar, and error banners.
 */
import React, { useCallback, useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ChevronLeft } from 'lucide-react-native';
import { useTheme, spacing, fontFamily } from '../theme';
import { getAmicusThread } from '../db/userQueries';
import MessageList from '../components/amicus/MessageList';
import InputBar from '../components/amicus/InputBar';
import MetaFaqModal from '../components/amicus/MetaFaqModal';
import { useAmicusThread } from '../hooks/useAmicusThread';
import { useAmicusAccess } from '../hooks/useAmicusAccess';
import CapExceededBanner from '../components/amicus/CapExceededBanner';
import {
  navigateToCitation,
  type MetaFaqArticle,
} from '../services/amicus/citationNav';
import { useAmicusConsent } from '../services/amicus/consent';
import type { AmicusCitation, AmicusThread } from '../types';
import type { ScreenNavProp, ScreenRouteProp } from '../navigation/types';
import { logger } from '../utils/logger';

export default function AmicusThreadScreen(): React.ReactElement {
  const { base } = useTheme();
  const navigation = useNavigation<ScreenNavProp<'Amicus', 'Thread'>>();
  const route = useRoute<ScreenRouteProp<'Amicus', 'Thread'>>();
  const { threadId } = route.params;

  const [thread, setThread] = useState<AmicusThread | null>(null);
  const [faqArticle, setFaqArticle] = useState<MetaFaqArticle | null>(null);
  const { requestAmicusConsent } = useAmicusConsent();
  const access = useAmicusAccess();
  const { messages, isStreaming, error, sendMessage, abortStream, clearError } =
    useAmicusThread(threadId);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const t = await getAmicusThread(threadId);
        if (!cancelled) setThread(t);
      } catch (err) {
        logger.error('Amicus', 'thread fetch failed', err);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [threadId]);

  const handleSend = useCallback(
    async (text: string) => {
      // Pre-flight access check (#1460).
      if (access.reason === 'not_premium') {
        navigation.navigate('Paywall');
        return;
      }
      if (access.reason === 'monthly_cap_reached' || access.reason === 'offline') {
        logger.info('Amicus', `send blocked: ${access.reason}`);
        return;
      }

      const authToken = process.env.EXPO_PUBLIC_AMICUS_DEV_TOKEN ?? '';
      if (!authToken) {
        logger.warn('Amicus', 'no auth token — aborting send');
        return;
      }
      // Gate on one-time privacy acknowledgement (#1458).
      const accepted = await requestAmicusConsent();
      if (!accepted) {
        logger.info('Amicus', 'opt-in declined — not sending');
        return;
      }
      await sendMessage(text, authToken);
    },
    [sendMessage, requestAmicusConsent, access.reason, navigation],
  );

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
          {thread?.chapter_ref && (
            <Text style={[styles.headerBadge, { color: base.gold }]}>
              {thread.chapter_ref}
            </Text>
          )}
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <MessageList
          messages={messages}
          isStreaming={isStreaming}
          onCitationPress={handleCitation}
          onFollowUp={(text) => void handleSend(text)}
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
          onSend={(t) => void handleSend(t)}
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
      <Text style={{ color: base.text, fontFamily: fontFamily.body, fontSize: 13 }}>
        {message}
      </Text>
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
  headerBadge: { fontSize: 11, marginTop: 2 },
  banner: {
    padding: spacing.sm,
    marginHorizontal: spacing.sm,
    marginBottom: spacing.xs,
    borderRadius: 12,
    borderWidth: 1,
  },
});
