/**
 * hooks/useNotifications.ts — In-app notification feed management.
 *
 * Reads from the local app_notifications table in user.db.
 * Provides unread count, mark-read, and mark-all-read actions.
 */

import { useState, useEffect, useCallback } from 'react';
import { getUserDb } from '../db/userDatabase';
import { logger } from '../utils/logger';
import type { AppNotification } from '../types';

export function useNotifications() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadNotifications = useCallback(async () => {
    try {
      const db = getUserDb();
      const rows = await db.getAllAsync<AppNotification>(
        `SELECT id, type, title, body, target_id, target_type, is_read, created_at
         FROM app_notifications
         ORDER BY created_at DESC
         LIMIT 100`,
      );

      // SQLite returns 0/1 for booleans — normalize
      const normalized = rows.map((r) => ({
        ...r,
        is_read: !!r.is_read,
      }));

      setNotifications(normalized);
      setUnreadCount(normalized.filter((n) => !n.is_read).length);
    } catch (err) {
      logger.warn('useNotifications', 'Failed to load notifications', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const markRead = useCallback(async (notificationId: string) => {
    try {
      const db = getUserDb();
      await db.runAsync(
        'UPDATE app_notifications SET is_read = 1 WHERE id = ?',
        [notificationId],
      );

      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n)),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      logger.warn('useNotifications', 'Failed to mark notification read', err);
    }
  }, []);

  const markAllRead = useCallback(async () => {
    try {
      const db = getUserDb();
      await db.runAsync('UPDATE app_notifications SET is_read = 1 WHERE is_read = 0');

      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      logger.warn('useNotifications', 'Failed to mark all notifications read', err);
    }
  }, []);

  return { notifications, unreadCount, markRead, markAllRead, loading, refresh: loadNotifications };
}
