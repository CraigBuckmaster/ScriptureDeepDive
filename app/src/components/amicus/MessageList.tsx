/**
 * components/amicus/MessageList.tsx — inverted FlatList of chat messages
 * with a "new message ↓" pill when the user has scrolled up during a stream.
 */
import React, { useCallback, useRef, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import type { AmicusCitation, AmicusMessage } from '../../types';
import { fontFamily, spacing, useTheme } from '../../theme';
import AssistantMessageBubble from './AssistantMessageBubble';
import UserMessageBubble from './UserMessageBubble';
import FollowUpChips from './FollowUpChips';

export interface MessageListProps {
  messages: AmicusMessage[];
  isStreaming: boolean;
  onCitationPress?: (c: AmicusCitation) => void;
  onFollowUp?: (text: string) => void;
}

export default function MessageList(props: MessageListProps): React.ReactElement {
  const { base } = useTheme();
  const ref = useRef<FlatList<AmicusMessage>>(null);
  const [showNew, setShowNew] = useState(false);
  const atBottomRef = useRef(true);

  const handleScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>): void => {
      // Inverted list — scroll offset near 0 = at bottom visually.
      const offset = e.nativeEvent.contentOffset.y;
      const atBottom = offset < 80;
      atBottomRef.current = atBottom;
      if (atBottom) setShowNew(false);
    },
    [],
  );

  // When streaming emits new tokens and user is at bottom, nothing to do.
  // When user scrolled up, show the jump pill.
  React.useEffect(() => {
    if (!props.isStreaming) return;
    if (!atBottomRef.current) setShowNew(true);
  }, [props.isStreaming, props.messages]);

  const data = React.useMemo(() => [...props.messages].reverse(), [props.messages]);

  const lastAssistant = props.messages[props.messages.length - 1];
  const showFollowUps =
    !props.isStreaming &&
    lastAssistant?.role === 'assistant' &&
    lastAssistant.follow_ups.length > 0 &&
    props.onFollowUp != null;

  return (
    <View style={styles.container}>
      <FlatList
        ref={ref}
        inverted
        data={data}
        keyExtractor={(m) => m.message_id}
        onScroll={handleScroll}
        scrollEventThrottle={32}
        contentContainerStyle={styles.content}
        renderItem={({ item, index }) => {
          const isLast = index === 0; // inverted — first rendered = newest
          if (item.role === 'user') return <UserMessageBubble content={item.content} />;
          const streaming = isLast && props.isStreaming;
          return (
            <AssistantMessageBubble
              content={item.content}
              citations={item.citations}
              isStreaming={streaming}
              onCitationPress={props.onCitationPress}
            />
          );
        }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={[styles.emptyText, { color: base.textMuted, fontFamily: fontFamily.bodyItalic }]}>
              Ask Amicus anything.
            </Text>
          </View>
        }
      />

      {showFollowUps && lastAssistant && props.onFollowUp && (
        <FollowUpChips followUps={lastAssistant.follow_ups} onSelect={props.onFollowUp} />
      )}

      {showNew && (
        <Pressable
          onPress={() => {
            ref.current?.scrollToOffset({ offset: 0, animated: true });
            setShowNew(false);
          }}
          accessibilityLabel="Jump to latest message"
          style={[styles.jumpPill, { backgroundColor: base.gold }]}
        >
          <Text style={[styles.jumpText, { color: base.bg }]}>New message ↓</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.md },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.xl },
  emptyText: { fontSize: 15 },
  jumpPill: {
    position: 'absolute',
    bottom: spacing.md,
    alignSelf: 'center',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
  },
  jumpText: { fontSize: 12, fontWeight: '600' },
});
