/**
 * AmicusThreadScreen — shell for a single Amicus conversation.
 *
 * Only the header + placeholder list + placeholder input are wired in this
 * card (#1454). Streaming + citation rendering + full input behavior arrive
 * in #1455.
 */
import React, { useEffect, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ChevronLeft } from 'lucide-react-native';
import { useTheme, spacing, fontFamily } from '../theme';
import { getAmicusThread, listAmicusMessages } from '../db/userQueries';
import type { AmicusMessage, AmicusThread } from '../types';
import type { ScreenNavProp, ScreenRouteProp } from '../navigation/types';
import { logger } from '../utils/logger';

export default function AmicusThreadScreen(): React.ReactElement {
  const { base } = useTheme();
  const navigation = useNavigation<ScreenNavProp<'Amicus', 'Thread'>>();
  const route = useRoute<ScreenRouteProp<'Amicus', 'Thread'>>();
  const { threadId } = route.params;

  const [thread, setThread] = useState<AmicusThread | null>(null);
  const [messages, setMessages] = useState<AmicusMessage[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [t, m] = await Promise.all([
          getAmicusThread(threadId),
          listAmicusMessages(threadId),
        ]);
        if (cancelled) return;
        setThread(t);
        setMessages(m);
      } catch (err) {
        logger.error('Amicus', 'thread load failed', err);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [threadId]);

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
        <FlatList
          inverted
          data={[...messages].reverse()}
          keyExtractor={(m) => m.message_id}
          contentContainerStyle={styles.messagesContent}
          renderItem={({ item }) => (
            <View
              style={[
                styles.messageBubble,
                item.role === 'user'
                  ? [styles.userBubble, { backgroundColor: base.gold }]
                  : [styles.assistantBubble, { backgroundColor: base.bgSurface }],
              ]}
            >
              <Text
                style={{
                  color: item.role === 'user' ? base.bg : base.text,
                  fontFamily: fontFamily.body,
                }}
              >
                {item.content}
              </Text>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={[styles.emptyText, { color: base.textMuted, fontFamily: fontFamily.bodyItalic }]}>
                Ask Amicus anything.
              </Text>
            </View>
          }
        />

        <View style={[styles.inputBar, { borderTopColor: base.border, backgroundColor: base.bg }]}>
          <TextInput
            placeholder="Message Amicus…"
            placeholderTextColor={base.textMuted}
            style={[styles.input, { color: base.text, borderColor: base.border }]}
            editable={false}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
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
  messagesContent: { padding: spacing.md, gap: spacing.sm },
  messageBubble: { padding: spacing.sm, borderRadius: 12, maxWidth: '85%' },
  userBubble: { alignSelf: 'flex-end' },
  assistantBubble: { alignSelf: 'flex-start' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
  emptyText: { fontSize: 15 },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    fontSize: 14,
  },
});
