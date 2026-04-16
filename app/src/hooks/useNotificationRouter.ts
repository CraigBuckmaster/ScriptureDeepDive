/**
 * hooks/useNotificationRouter.ts — Route the user to the right screen when
 * they tap a notification.
 *
 * Handles two cases:
 *   1. Cold start — app was not running; iOS/Android launched it because the
 *      user tapped a notification. We read `getLastNotificationResponseAsync`.
 *   2. Warm tap — app is running (foreground or background). Handled by
 *      `addNotificationResponseReceivedListener`.
 *
 * Navigation is performed via a NavigationContainerRef so the router is
 * decoupled from any specific screen's hook tree.
 */

import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import type { NavigationContainerRef } from '@react-navigation/native';
import type { TabParamList } from '../navigation/types';
import { logger } from '../utils/logger';

interface DailyVerseTapPayload {
  type: 'daily_verse';
  bookId: string;
  chapterNum: number;
  verseNum?: number;
}

/** Narrow unknown notification data to our payload shape. */
function parsePayload(data: unknown): DailyVerseTapPayload | null {
  if (!data || typeof data !== 'object') return null;
  const d = data as Record<string, unknown>;
  if (d.type !== 'daily_verse') return null;
  if (typeof d.bookId !== 'string' || typeof d.chapterNum !== 'number') return null;
  const verseNum = typeof d.verseNum === 'number' ? d.verseNum : undefined;
  return { type: 'daily_verse', bookId: d.bookId, chapterNum: d.chapterNum, verseNum };
}

/**
 * Given a ready NavigationContainerRef, route a tap payload to the Chapter
 * screen inside HomeTab with optional verseNum for scroll-to-verse.
 */
function routeTap(
  navRef: NavigationContainerRef<TabParamList>,
  payload: DailyVerseTapPayload,
): void {
  try {
    navRef.navigate('HomeTab', {
      screen: 'Chapter',
      params: {
        bookId: payload.bookId,
        chapterNum: payload.chapterNum,
        ...(payload.verseNum ? { verseNum: payload.verseNum } : {}),
      },
    });
  } catch (err) {
    logger.warn('useNotificationRouter', 'Navigation failed', err);
  }
}

/**
 * Install listeners + process cold-start tap. The navRef MUST be the one
 * attached to the root NavigationContainer.
 *
 * Safe to mount before nav is ready — we poll `navRef.isReady()` a few
 * times before handing off cold-start routing.
 */
export function useNotificationRouter(
  navRef: NavigationContainerRef<TabParamList>,
): void {
  const coldStartHandled = useRef(false);

  useEffect(() => {
    let cancelled = false;

    // ── Cold start: handle the tap that launched the app ──
    async function handleColdStart(): Promise<void> {
      if (coldStartHandled.current) return;
      try {
        const response = await Notifications.getLastNotificationResponseAsync();
        const payload = parsePayload(response?.notification?.request?.content?.data);
        if (!payload) return;

        // Wait for the NavigationContainer to be ready (up to ~5s).
        for (let i = 0; i < 50; i++) {
          if (cancelled) return;
          if (navRef.isReady()) break;
          await new Promise((res) => setTimeout(res, 100));
        }
        if (!navRef.isReady() || cancelled) return;

        coldStartHandled.current = true;
        routeTap(navRef, payload);
      } catch (err) {
        logger.warn('useNotificationRouter', 'Cold-start handler failed', err);
      }
    }
    handleColdStart();

    // ── Warm tap: app running, user tapped a notification ──
    const sub = Notifications.addNotificationResponseReceivedListener((response) => {
      const payload = parsePayload(response.notification.request.content.data);
      if (!payload) return;
      if (navRef.isReady()) routeTap(navRef, payload);
    });

    return () => {
      cancelled = true;
      sub.remove();
    };
  }, [navRef]);
}
