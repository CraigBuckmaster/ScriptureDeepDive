/**
 * components/amicus/PeekMiniConversation.tsx — conversation rendered
 * inside the FAB peek sheet (#1463).
 *
 * Reuses the bubble + citation pill + follow-up chip components from the
 * full Amicus tab (#1455) so there is no rendering duplication. Ephemeral
 * state lives in `usePeekConversation`.
 */
import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { PeekMessage } from '../../hooks/usePeekConversation';
import { AmicusError } from '../../services/amicus';
import { fontFamily, spacing, useTheme } from '../../theme';
import type { AmicusCitation } from '../../types';
import AssistantMessageBubble from './AssistantMessageBubble';
import FollowUpChips from './FollowUpChips';
import UserMessageBubble from './UserMessageBubble';

export const PEEK_HANDOFF_THRESHOLD = 3;

export interface PeekMiniConversationProps {
  messages: PeekMessage[];
  isStreaming: boolean;
  turnCount: number;
  error: AmicusError | null;
  onDismissError: () => void;
  onCitationPress?: (c: AmicusCitation) => void;
  onFollowUp: (text: string) => void;
  onContinueInTab: () => void;
  /** Shown when handoff is in progress. */
  handoffInProgress?: boolean;
}

export default function PeekMiniConversation(
  props: PeekMiniConversationProps,
): React.ReactElement {
  const { base } = useTheme();

  const lastAssistant = props.messages[props.messages.length - 1];
  const lastAssistantFollowUps =
    !props.isStreaming && lastAssistant?.role === 'assistant'
      ? lastAssistant.follow_ups ?? []
      : [];

  const showHandoff = props.turnCount >= PEEK_HANDOFF_THRESHOLD;

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {props.messages.map((m, idx) =>
          m.role === 'user' ? (
            <UserMessageBubble key={`u-${idx}`} content={m.content} />
          ) : (
            <AssistantMessageBubble
              key={`a-${idx}`}
              content={m.content}
              citations={m.citations ?? []}
              isStreaming={m.isStreaming === true}
              onCitationPress={props.onCitationPress}
            />
          ),
        )}

        {lastAssistantFollowUps.length > 0 && (
          <FollowUpChips
            followUps={lastAssistantFollowUps}
            onSelect={props.onFollowUp}
          />
        )}

        {showHandoff && (
          <Pressable
            accessibilityLabel="Continue in Amicus tab"
            disabled={props.handoffInProgress}
            onPress={props.onContinueInTab}
            style={({ pressed }) => [
              styles.handoffButton,
              {
                backgroundColor: props.handoffInProgress ? base.border : base.gold,
                opacity: pressed ? 0.7 : 1,
              },
            ]}
          >
            <Text style={[styles.handoffText, { color: base.bg, fontFamily: fontFamily.displaySemiBold }]}>
              {props.handoffInProgress ? 'Saving…' : 'Continue in Amicus tab →'}
            </Text>
          </Pressable>
        )}
      </ScrollView>

      {props.error && (
        <Pressable
          accessibilityLabel={`${errorCopy(props.error)}. Tap to dismiss.`}
          onPress={props.onDismissError}
          style={[
            styles.errorBanner,
            { backgroundColor: `${base.gold}20`, borderColor: base.gold },
          ]}
        >
          <Text
            style={[styles.errorText, { color: base.text, fontFamily: fontFamily.body }]}
          >
            {errorCopy(props.error)}
          </Text>
        </Pressable>
      )}
    </View>
  );
}

function errorCopy(err: AmicusError): string {
  switch (err.code) {
    case 'OFFLINE':
      return 'Amicus needs a connection.';
    case 'PROXY_UNAUTHORIZED':
      return 'Your subscription is required to use Amicus.';
    case 'EMBED_FAILED':
      return 'Amicus is temporarily unavailable. Try again.';
    case 'EXTENSION_NOT_LOADED':
      return 'Amicus retrieval is unavailable on this device build.';
    default:
      return 'Something went wrong.';
  }
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: spacing.md, gap: spacing.xs },
  handoffButton: {
    marginTop: spacing.md,
    paddingVertical: 12,
    borderRadius: 999,
    alignItems: 'center',
  },
  handoffText: { fontSize: 14, fontWeight: '600' },
  errorBanner: {
    margin: spacing.sm,
    padding: spacing.sm,
    borderRadius: 12,
    borderWidth: 1,
  },
  errorText: { fontSize: 13 },
});
