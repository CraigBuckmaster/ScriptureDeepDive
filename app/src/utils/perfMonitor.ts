/**
 * utils/perfMonitor.ts — Performance measurement utilities.
 *
 * Add markers to measure app launch, chapter load, search speed.
 * Results logged via logger.info (suppressed in production).
 */

import { logger } from './logger';

const TAG = 'PERF';
const markers = new Map<string, number>();

export function markStart(label: string): void {
  markers.set(label, Date.now());
}

export function markEnd(label: string): number {
  const start = markers.get(label);
  if (!start) return -1;
  const elapsed = Date.now() - start;
  markers.delete(label);
  const target = getTarget(label);
  const pass = target === null || elapsed <= target;
  logger.info(TAG,
    `${label}: ${elapsed}ms ${pass ? '✅' : `❌ (target: ${target}ms)`}`
  );
  return elapsed;
}

function getTarget(label: string): number | null {
  const targets: Record<string, number> = {
    'app-launch': 2000,
    'chapter-load': 500,
    'panel-expand': 16, // single frame
    'search': 200,
    'map-markers': 100,
  };
  return targets[label] ?? null;
}

/** Log all current performance targets. */
export function printTargets(): void {
  logger.info(TAG, 'Targets:');
  logger.info(TAG, '  App launch → HomeScreen: < 2000ms');
  logger.info(TAG, '  Chapter load (cold): < 500ms');
  logger.info(TAG, '  Panel expand: 60 FPS (< 16ms/frame)');
  logger.info(TAG, '  FTS5 search: < 200ms');
  logger.info(TAG, '  Map markers (71): < 100ms');
  logger.info(TAG, '  Database size: < 25MB');
}
