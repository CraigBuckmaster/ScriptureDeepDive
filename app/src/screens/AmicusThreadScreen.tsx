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
import { useAmicusThread } from '../hooks/useAmicusThread';
import type { AmicusCitation, AmicusThread } from '../types';
import type { ScreenNavProp, ScreenRouteProp } from '../navigation/types';
import { logger } from '../utils/logger';

export default function AmicusThreadScreen(): React.ReactElement {
  const { base } = useTheme();
  const navigation = useNavigation<ScreenNavProp<'Amicus', 'Thread'>>();
  const route = useRoute<ScreenRouteProp<'Amicus', 'Thread'>>();
  const { threadId } = route.params;

  const [thread, setThread] = useState<AmicusThread | null>(null);
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
      // TODO(#1460): source authToken from RevenueCat entitlement store.
      const authToken = process.env.EXPO_PUBLIC_AMICUS_DEV_TOKEN ?? '';
      if (!authToken) {
        logger.warn('Amicus', 'no auth token — aborting send');
        return;
      }
      await sendMessage(text, authToken);
    },
    [sendMessage],
  );

  const handleCitation = useCallback((c: AmicusCitation) => {
    // #1456 wires real navigation. For now, log.
    logger.info('Amicus', `citation pressed: ${c.chunk_id}`);
  }, []);

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

        <InputBar
          isStreaming={isStreaming}
          onSend={(t) => void handleSend(t)}
          onAbort={abortStream}
        />
      </KeyboardAvoidingView>
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
