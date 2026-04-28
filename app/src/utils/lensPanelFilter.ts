/**
 * utils/lensPanelFilter.ts — Filter and reorder panel keys per active lens.
 *
 * Epic #820 / Phase 1 (#1780). Lenses can carry two optional JSON-serialised
 * string arrays in `chapter_lens_content`:
 *   - `panel_filter_json` — render only these panel keys
 *   - `panel_order_json`  — render in this order
 *
 * These pure functions parse and apply both transformations. They handle:
 *   - missing or undefined JSON  → no transformation
 *   - malformed JSON             → log + fall back to no transformation
 *   - empty arrays               → treat as "no filter" (avoids hiding everything)
 *   - keys not present in panels → silently dropped from order
 *   - panels not in the order    → appended after ordered keys (preserve relative order)
 *
 * The filter/order operate on panel _keys_ (e.g. "heb", "cross", "sarna"),
 * not on the rendering of individual panel content. Wider scoping (e.g.
 * within-section reordering of panel content blocks) is out of scope.
 */
import { logger } from './logger';

/**
 * Parse a panel-filter or panel-order JSON string into a string array.
 *
 * Returns `undefined` when the input is missing, malformed, or not an
 * array of strings — callers treat that as "no transformation".
 */
export function parseLensJson(json?: string | null): string[] | undefined {
  if (!json) return undefined;
  try {
    const parsed = JSON.parse(json) as unknown;
    if (!Array.isArray(parsed)) {
      logger.warn('lensPanelFilter', 'parsed value is not an array', { json });
      return undefined;
    }
    const strings = parsed.filter((k): k is string => typeof k === 'string');
    if (strings.length !== parsed.length) {
      logger.warn('lensPanelFilter', 'dropped non-string entries', {
        original: parsed.length,
        kept: strings.length,
      });
    }
    return strings;
  } catch (err) {
    logger.warn('lensPanelFilter', 'invalid JSON', { json, err: String(err) });
    return undefined;
  }
}

/**
 * Filter a list of panel keys to those present in `filter`.
 *
 * - When `filter` is undefined: return `keys` unchanged.
 * - When `filter` is empty: return `keys` unchanged. An empty filter would
 *   render zero panels, which is almost certainly an authoring bug rather
 *   than intent. The schema validator rejects empty `panel_filter` arrays
 *   at content time; this is the runtime safety net.
 */
export function filterPanelKeys(keys: string[], filter?: string[]): string[] {
  if (!filter || filter.length === 0) return keys;
  const allowed = new Set(filter);
  return keys.filter((k) => allowed.has(k));
}

/**
 * Reorder a list of panel keys to follow `order`.
 *
 * - Keys present in `order` come first, in the order specified.
 * - Keys not present in `order` come after, preserving their original
 *   relative order from `keys`.
 * - Keys in `order` but not in `keys` are silently dropped — content
 *   authors may include `panel_order` entries optimistically.
 * - When `order` is undefined or empty: return `keys` unchanged.
 */
export function orderPanelKeys(keys: string[], order?: string[]): string[] {
  if (!order || order.length === 0) return keys;
  const orderIndex = new Map<string, number>();
  order.forEach((k, i) => {
    if (!orderIndex.has(k)) orderIndex.set(k, i);
  });

  const ordered: string[] = [];
  const unordered: string[] = [];
  for (const k of keys) {
    if (orderIndex.has(k)) ordered.push(k);
    else unordered.push(k);
  }
  ordered.sort((a, b) => (orderIndex.get(a) ?? 0) - (orderIndex.get(b) ?? 0));
  return [...ordered, ...unordered];
}

/**
 * Convenience: apply both filter and order in one pass.
 * Filter first (drop hidden keys), then order (rearrange remaining).
 */
export function applyLensToKeys(
  keys: string[],
  filter?: string[],
  order?: string[],
): string[] {
  return orderPanelKeys(filterPanelKeys(keys, filter), order);
}
