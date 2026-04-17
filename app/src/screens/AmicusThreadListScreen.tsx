/**
 * AmicusThreadListScreen — Amicus tab home.
 *
 * Shows threads newest-first, with pinned threads grouped on top. Long-press
 * opens an action sheet (pin/unpin, rename, delete). "+ New" button routes
 * to the NewThread entry.
 */
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Pin, Plus, MessageSquare } from 'lucide-react-native';
import { useAmicusThreads } from '../hooks/useAmicusThreads';
import { useAmicusAccess } from '../hooks/useAmicusAccess';
import { useTheme, spacing, fontFamily } from '../theme';
import type { ScreenNavProp } from '../navigation/types';
import type { AmicusThread } from '../types';
import { logger } from '../utils/logger';

export default function AmicusThreadListScreen(): React.ReactElement {
  const { base } = useTheme();
  const navigation = useNavigation<ScreenNavProp<'Amicus', 'ThreadList'>>();
  const { threads, isLoading, refresh, actions } = useAmicusThreads();
  const access = useAmicusAccess();
  const [renaming, setRenaming] = useState<{ id: string; title: string } | null>(null);

  // Non-premium users see the paywall in place of the thread list.
  React.useEffect(() => {
    if (access.reason === 'not_premium') {
      navigation.replace('Paywall');
    }
  }, [access.reason, navigation]);

  const pinned = threads.filter((t) => t.pinned);
  const unpinned = threads.filter((t) => !t.pinned);

  const handleLongPress = useCallback(
    (thread: AmicusThread) => {
      Alert.alert(
        thread.title || 'Thread',
        undefined,
        [
          {
            text: thread.pinned ? 'Unpin' : 'Pin',
            onPress: () => {
              if (thread.pinned) actions.unpin(thread.thread_id);
              else actions.pin(thread.thread_id);
            },
          },
          {
            text: 'Rename',
            onPress: () => setRenaming({ id: thread.thread_id, title: thread.title }),
          },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () =>
              Alert.alert(
                'Delete thread?',
                'This cannot be undone.',
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => actions.remove(thread.thread_id),
                  },
                ],
                { cancelable: true },
              ),
          },
          { text: 'Cancel', style: 'cancel' },
        ],
        { cancelable: true },
      );
    },
    [actions],
  );

  const renderRow = useCallback(
    ({ item }: { item: AmicusThread }): React.ReactElement => (
      <ThreadRow
        thread={item}
        onPress={() => navigation.navigate('Thread', { threadId: item.thread_id })}
        onLongPress={() => handleLongPress(item)}
        renaming={renaming?.id === item.thread_id ? renaming : null}
        onRenameChange={(t) => setRenaming((prev) => (prev ? { ...prev, title: t } : prev))}
        onRenameSubmit={async () => {
          if (!renaming) return;
          const title = renaming.title.trim();
          if (title.length > 0 && title !== item.title) {
            await actions.rename(item.thread_id, title);
          }
          setRenaming(null);
        }}
        onRenameCancel={() => setRenaming(null)}
      />
    ),
    [handleLongPress, navigation, actions, renaming],
  );

  const data: AmicusThread[] = [...pinned, ...unpinned];

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: base.bg }]}>
        <View style={styles.center}>
          <ActivityIndicator color={base.gold} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: base.bg }]}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: base.text, fontFamily: fontFamily.display }]}>
            Amicus
          </Text>
          <Text style={[styles.subtitle, { color: base.textMuted, fontFamily: fontFamily.bodyItalic }]}>
            Your study conversations
          </Text>
        </View>
        <Pressable
          accessibilityLabel="New conversation"
          onPress={() => navigation.navigate('NewThread', undefined)}
          style={[styles.newButton, { backgroundColor: base.gold }]}
        >
          <Plus size={14} color={base.bg} />
          <Text style={[styles.newButtonText, { color: base.bg }]}>New</Text>
        </Pressable>
      </View>

      {data.length === 0 ? (
        <EmptyState
          onStart={() => navigation.navigate('NewThread', undefined)}
        />
      ) : (
        <FlatList
          data={data}
          keyExtractor={(t) => t.thread_id}
          renderItem={renderRow}
          ItemSeparatorComponent={Separator}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={() => {
                void refresh().catch((err) => logger.error('Amicus', 'refresh failed', err));
              }}
              tintColor={base.gold}
            />
          }
          ListHeaderComponent={pinned.length > 0 ? <SectionHeader label="Pinned" /> : null}
          contentContainerStyle={data.length === 0 ? styles.flex : undefined}
        />
      )}
    </SafeAreaView>
  );
}

// ── Sub-components ────────────────────────────────────────────────────

interface ThreadRowProps {
  thread: AmicusThread;
  onPress: () => void;
  onLongPress: () => void;
  renaming: { id: string; title: string } | null;
  onRenameChange: (t: string) => void;
  onRenameSubmit: () => void | Promise<void>;
  onRenameCancel: () => void;
}

function ThreadRow(props: ThreadRowProps): React.ReactElement {
  const { base } = useTheme();
  const { thread } = props;

  if (props.renaming) {
    return (
      <View style={[styles.row, { backgroundColor: base.bgSurface }]}>
        <TextInput
          autoFocus
          value={props.renaming.title}
          onChangeText={props.onRenameChange}
          onBlur={() => void props.onRenameSubmit()}
          onSubmitEditing={() => void props.onRenameSubmit()}
          returnKeyType="done"
          accessibilityLabel="Rename thread"
          style={[
            styles.renameInput,
            { color: base.text, borderColor: base.gold, fontFamily: fontFamily.display },
          ]}
        />
        <Pressable onPress={props.onRenameCancel} accessibilityLabel="Cancel rename">
          <Text style={{ color: base.textMuted }}>Cancel</Text>
        </Pressable>
      </View>
    );
  }

  const chapter = thread.chapter_ref;
  return (
    <Pressable
      accessibilityLabel={`Open thread ${thread.title}`}
      accessibilityHint="Long press for options"
      onPress={props.onPress}
      onLongPress={props.onLongPress}
      style={({ pressed }) => [
        styles.row,
        { backgroundColor: pressed ? base.bgSurface : 'transparent' },
      ]}
    >
      <View style={styles.rowBody}>
        <View style={styles.rowTitleLine}>
          {thread.pinned && <Pin size={12} color={base.gold} />}
          <Text
            numberOfLines={1}
            style={[styles.rowTitle, { color: base.text, fontFamily: fontFamily.display }]}
          >
            {thread.title}
          </Text>
          {chapter && <ChapterBadge label={chapter} />}
        </View>
        <Text
          numberOfLines={1}
          style={[styles.rowTimestamp, { color: base.textMuted }]}
        >
          {relativeTime(thread.last_message_at)}
        </Text>
      </View>
    </Pressable>
  );
}

function ChapterBadge({ label }: { label: string }): React.ReactElement {
  const { base } = useTheme();
  return (
    <View style={[styles.badge, { borderColor: base.gold, backgroundColor: `${base.gold}20` }]}>
      <Text style={[styles.badgeText, { color: base.gold }]}>{formatChapterRef(label)}</Text>
    </View>
  );
}

function SectionHeader({ label }: { label: string }): React.ReactElement {
  const { base } = useTheme();
  return (
    <Text style={[styles.sectionHeader, { color: base.textMuted }]}>{label}</Text>
  );
}

function Separator(): React.ReactElement {
  const { base } = useTheme();
  return <View style={[styles.separator, { backgroundColor: base.border }]} />;
}

function EmptyState({ onStart }: { onStart: () => void }): React.ReactElement {
  const { base } = useTheme();
  return (
    <View style={[styles.empty, { backgroundColor: base.bg }]}>
      <MessageSquare size={40} color={base.gold} />
      <Text style={[styles.emptyTitle, { color: base.text, fontFamily: fontFamily.display }]}>
        Amicus is ready when you are.
      </Text>
      <Pressable
        onPress={onStart}
        accessibilityLabel="Ask a question"
        style={[styles.primaryButton, { backgroundColor: base.gold }]}
      >
        <Text style={[styles.primaryButtonText, { color: base.bg }]}>Ask a question</Text>
      </Pressable>
    </View>
  );
}

// ── Formatting helpers ────────────────────────────────────────────────

function formatChapterRef(ref: string): string {
  // "romans:9" → "Romans 9"
  const [book, chap] = ref.split(':');
  if (!book || !chap) return ref;
  const pretty = book.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  return `${pretty} ${chap}`;
}

function relativeTime(iso: string): string {
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return '';
  const delta = Date.now() - t;
  const mins = Math.floor(delta / 60000);
  if (mins < 60) return `${Math.max(1, mins)}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d`;
  return new Date(t).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

// ── Styles ────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  title: { fontSize: 22 },
  subtitle: { fontSize: 13, marginTop: 2 },
  newButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
  },
  newButtonText: { fontSize: 13, fontWeight: '600' },
  sectionHeader: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    fontSize: 11,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  row: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowBody: { flex: 1, gap: 2 },
  rowTitleLine: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  rowTitle: { fontSize: 15, flexShrink: 1 },
  rowTimestamp: { fontSize: 11, marginLeft: spacing.sm },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 999,
    borderWidth: 1,
  },
  badgeText: { fontSize: 10, letterSpacing: 0.3 },
  separator: { height: StyleSheet.hairlineWidth, marginLeft: spacing.md },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg, gap: spacing.md },
  emptyTitle: { fontSize: 18, textAlign: 'center' },
  primaryButton: { paddingVertical: 12, paddingHorizontal: 24, borderRadius: 999, marginTop: spacing.sm },
  primaryButtonText: { fontSize: 15, fontWeight: '600' },
  renameInput: {
    flex: 1,
    borderBottomWidth: 1,
    fontSize: 15,
    paddingVertical: 4,
    marginRight: spacing.sm,
  },
});
