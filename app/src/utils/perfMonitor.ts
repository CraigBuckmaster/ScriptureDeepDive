/**
 * utils/perfMonitor.ts — Performance measurement utilities.
 *
 * Add markers to measure app launch, chapter load, search speed.
 * Results logged to console in __DEV__ mode.
 */

const markers = new Map<string, number>();

export function markStart(label: string): void {
  markers.set(label, Date.now());
}

export function markEnd(label: string): number {
  const start = markers.get(label);
  if (!start) return -1;
  const elapsed = Date.now() - start;
  markers.delete(label);
  if (__DEV__) {
    const status = getTarget(label);
    const pass = status === null || elapsed <= status;
    console.log(
      `[PERF] ${label}: ${elapsed}ms ${pass ? '✅' : `❌ (target: ${status}ms)`}`
    );
  }
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

/** Log all current performance targets and their status. */
export function printTargets(): void {
  console.log('[PERF] Targets:');
  console.log('  App launch → HomeScreen: < 2000ms');
  console.log('  Chapter load (cold): < 500ms');
  console.log('  Panel expand: 60 FPS (< 16ms/frame)');
  console.log('  FTS5 search: < 200ms');
  console.log('  Map markers (71): < 100ms');
  console.log('  Database size: < 25MB');
}
