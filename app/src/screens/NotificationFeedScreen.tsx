/**
 * NotificationFeedScreen — In-app notification feed.
 *
 * Shows a FlatList of notification cards with unread indicators.
 * Tapping a notification marks it read and navigates to related content.
 */

import React, { useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Bell, CheckCheck } from 'lucide-react-native';
import type { ScreenNavProp } from '../navigation/types';
import { ScreenHeader } from '../components/ScreenHeader';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { useNotifications } from '../hooks/useNotifications';
import { useTheme, spacing, radii, fontFamily } from '../theme';
import { withErrorBoundary } from '../components/ScreenErrorBoundary';
import type { AppNotification } from '../types';

function NotificationFeedScreen() {
  const { base } = useTheme();
  const navigation = useNavigation<ScreenNavProp<'More', 'NotificationFeed'>>();
  const { notifications, unreadCount, markRead, markAllRead, loading } = useNotifications();

  const handlePress = useCallback(
    (item: AppNotification) => {
      if (!item.is_read) {
        markRead(item.id);
      }
      // Navigate to content if target info is available
      // For now, just mark as read — navigation targets will be added
      // as content types are defined
    },
    [markRead],
  );

  const renderItem = useCallback(
    ({ item }: { item: AppNotification }) => {
      const isUnread = !item.is_read;
      return (
        <TouchableOpacity
          onPress={() => handlePress(item)}
          style={[
            styles.card,
            {
              backgroundColor: isUnread ? base.gold + '08' : base.bgElevated,
              borderColor: isUnread ? base.gold + '20' : base.border + '40',
            },
          ]}
          activeOpacity={0.7}
        >
          <View style={styles.cardHeader}>
            {isUnread && <View style={[styles.unreadDot, { backgroundColor: base.gold }]} />}
            <Text
              style={[
                styles.cardTitle,
                { color: base.text },
                isUnread && { fontFamily: fontFamily.uiSemiBold },
              ]}
              numberOfLines={1}
            >
              {item.title}
            </Text>
            <Text style={[styles.cardTime, { color: base.textMuted }]}>
              {formatTimeAgo(item.created_at)}
            </Text>
          </View>
          <Text style={[styles.cardBody, { color: base.textDim }]} numberOfLines={2}>
            {item.body}
          </Text>
        </TouchableOpacity>
      );
    },
    [base, handlePress],
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: base.bg }]}>
        <View style={styles.headerPad}>
          <ScreenHeader title="Notifications" onBack={() => navigation.goBack()} />
        </View>
        <View style={styles.loadingPad}>
          <LoadingSkeleton lines={6} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: base.bg }]}>
      <View style={styles.headerPad}>
        <ScreenHeader title="Notifications" onBack={() => navigation.goBack()} />
        {unreadCount > 0 && (
          <TouchableOpacity onPress={markAllRead} style={styles.markAllRow}>
            <CheckCheck size={14} color={base.gold} />
            <Text style={[styles.markAllText, { color: base.gold }]}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listPad}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Bell size={32} color={base.textMuted} />
            <Text style={[styles.emptyTitle, { color: base.text }]}>No notifications</Text>
            <Text style={[styles.emptyText, { color: base.textMuted }]}>
              You&apos;ll see notifications here when there&apos;s activity on content you follow.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

/* ── Helpers ──────────────────────────────────────────────────────── */

function formatTimeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60_000);

  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d`;
  return new Date(dateStr).toLocaleDateString();
}

/* ── Styles ──────────────────────────────────────────────────────── */

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerPad: { paddingHorizontal: spacing.md, paddingTop: spacing.lg },
  loadingPad: { padding: spacing.lg },
  listPad: { paddingHorizontal: spacing.md, paddingBottom: spacing.xxl },
  markAllRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-end',
    marginBottom: spacing.sm,
  },
  markAllText: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 12,
  },
  card: {
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  cardTitle: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 14,
    flex: 1,
  },
  cardTime: {
    fontFamily: fontFamily.ui,
    fontSize: 11,
    marginLeft: spacing.sm,
  },
  cardBody: {
    fontFamily: fontFamily.ui,
    fontSize: 13,
    lineHeight: 18,
  },
  emptyState: {
    padding: spacing.xxl,
    alignItems: 'center',
  },
  emptyTitle: {
    fontFamily: fontFamily.displaySemiBold,
    fontSize: 16,
    marginTop: spacing.md,
  },
  emptyText: {
    fontFamily: fontFamily.ui,
    fontSize: 13,
    textAlign: 'center',
    marginTop: spacing.xs,
    lineHeight: 18,
  },
});

export default withErrorBoundary(NotificationFeedScreen);
