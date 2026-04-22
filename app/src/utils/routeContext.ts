/**
 * utils/routeContext.ts — pure helpers that walk a React Navigation
 * state tree and resolve it into a `ChipContext` for Amicus.
 *
 * These were previously inlined as module-locals in AmicusPeekSheet.
 * They're extracted so the navigation-state subscription can live in
 * `useAmicusChipContext` (hooks/) while AmicusPeekSheet accepts the
 * resolved context as a plain prop. That separation makes the sheet
 * trivially testable without a NavigationContainer, and lets the
 * subscription's try/catch guard live alongside the other
 * navigation-safety guards in AmicusFab.
 *
 * Both exports are pure — no React imports, no hooks, no side effects.
 */

import type { ChipContext } from '../hooks/useAmicusChips';

/**
 * Minimal shape of a React Navigation route sufficient for our traversal.
 * Kept intentionally loose because React Navigation's own types vary by
 * navigator kind (stack/tab/drawer) and we only need the common subset.
 */
export interface MinimalRoute {
  name: string;
  params?: unknown;
  state?: { routes?: MinimalRoute[]; index?: number };
}

/**
 * Walk a navigation state tree to its deepest focused route.
 *
 * React Navigation nests navigators — a root tab navigator may contain
 * a stack navigator, which in turn contains the screen the user actually
 * sees. The `Chapter` / `PersonDetail` / etc. routes we care about live
 * at the bottom of that tree, so we descend until a route has no child
 * state.
 *
 * Accepts `unknown` because the caller may pass `undefined` (pre-mount
 * state) or a raw navigator state; both are handled without throwing.
 */
export function findDeepestRoute(state: unknown): MinimalRoute | null {
  const s = state as {
    routes?: MinimalRoute[];
    index?: number;
  } | null;
  if (!s || !Array.isArray(s.routes)) return null;
  const idx = typeof s.index === 'number' ? s.index : s.routes.length - 1;
  const route = s.routes[idx];
  if (!route) return null;
  if (route.state) return findDeepestRoute(route.state) ?? route;
  return route;
}

/**
 * Map a focused route to an Amicus `ChipContext`.
 *
 * Routes we don't recognise (or routes missing the params we need)
 * degrade to `{ kind: 'none' }`. Called from
 * `useAmicusChipContext` after `findDeepestRoute`.
 */
export function routeToChipContext(route: MinimalRoute | null): ChipContext {
  if (!route) return { kind: 'none' };
  const params = (route.params ?? {}) as Record<string, unknown>;
  switch (route.name) {
    case 'Chapter': {
      const bookId = typeof params.bookId === 'string' ? params.bookId : undefined;
      const chapterNum =
        typeof params.chapterNum === 'number' ? params.chapterNum : undefined;
      if (bookId && chapterNum) {
        return { kind: 'chapter', bookId, chapterNum };
      }
      return { kind: 'none' };
    }
    case 'PersonDetail':
      if (typeof params.personId === 'string') {
        return { kind: 'person', personId: params.personId };
      }
      return { kind: 'none' };
    case 'DebateDetail':
      if (typeof params.topicId === 'string') {
        return { kind: 'debate_topic', topicId: params.topicId };
      }
      return { kind: 'none' };
    default:
      return { kind: 'none' };
  }
}
