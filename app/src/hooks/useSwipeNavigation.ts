/**
 * hooks/useSwipeNavigation.ts — Horizontal swipe detection for chapter nav.
 *
 * Simple touch-start/touch-end tracking. Fires onSwipeLeft or onSwipeRight
 * when a fast (< 500ms), long (> 80px), clearly horizontal (2:1 ratio) swipe
 * is detected. No gesture-handler dependency.
 */

import { useCallback, useRef } from 'react';
import type { GestureResponderEvent } from 'react-native';

interface SwipeHandlers {
  onTouchStart: (e: GestureResponderEvent) => void;
  onTouchEnd: (e: GestureResponderEvent) => void;
}

export function useSwipeNavigation(
  onSwipeRight: (() => void) | undefined,
  onSwipeLeft: (() => void) | undefined,
): SwipeHandlers {
  const touchStart = useRef<{ x: number; y: number; t: number } | null>(null);

  const onTouchStart = useCallback((e: GestureResponderEvent) => {
    const { pageX, pageY } = e.nativeEvent;
    touchStart.current = { x: pageX, y: pageY, t: Date.now() };
  }, []);

  const onTouchEnd = useCallback((e: GestureResponderEvent) => {
    if (!touchStart.current) return;
    const { pageX, pageY } = e.nativeEvent;
    const dx = pageX - touchStart.current.x;
    const dy = pageY - touchStart.current.y;
    const dt = Date.now() - touchStart.current.t;
    touchStart.current = null;

    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    if (dt < 500 && absDx > 80 && absDx > absDy * 2) {
      if (dx > 0) onSwipeRight?.();
      else onSwipeLeft?.();
    }
  }, [onSwipeRight, onSwipeLeft]);

  return { onTouchStart, onTouchEnd };
}
