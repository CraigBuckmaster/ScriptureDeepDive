/**
 * Tests for lensPanelFilter — pure functions for filtering and reordering
 * panel keys per active hermeneutic lens (Epic #820, #1780).
 *
 * Behaviour decisions documented in the source file are pinned here so a
 * future refactor can't quietly change them. Watch out for the empty-filter
 * case in particular — that one's deliberate.
 */

import {
  parseLensJson,
  filterPanelKeys,
  orderPanelKeys,
  applyLensToKeys,
} from '@/utils/lensPanelFilter';

describe('lensPanelFilter', () => {
  // Silence the warn() calls during the malformed-JSON branch tests so the
  // jest output stays clean. Restore after each test to avoid leak between
  // suites.
  let warnSpy: jest.SpyInstance;
  beforeEach(() => {
    warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  });
  afterEach(() => {
    warnSpy.mockRestore();
  });

  describe('parseLensJson', () => {
    it('returns undefined for null/undefined/empty', () => {
      expect(parseLensJson(undefined)).toBeUndefined();
      expect(parseLensJson(null)).toBeUndefined();
      expect(parseLensJson('')).toBeUndefined();
    });

    it('parses a valid string array', () => {
      expect(parseLensJson('["heb","cross"]')).toEqual(['heb', 'cross']);
    });

    it('parses an empty array (caller decides what to do with it)', () => {
      expect(parseLensJson('[]')).toEqual([]);
    });

    it('returns undefined and logs on malformed JSON', () => {
      expect(parseLensJson('not json')).toBeUndefined();
      expect(warnSpy).toHaveBeenCalled();
    });

    it('returns undefined when JSON parses to a non-array', () => {
      expect(parseLensJson('{"foo":"bar"}')).toBeUndefined();
      expect(parseLensJson('"single string"')).toBeUndefined();
      expect(parseLensJson('42')).toBeUndefined();
    });

    it('drops non-string entries and warns', () => {
      expect(parseLensJson('["heb",1,"cross",null]')).toEqual(['heb', 'cross']);
      expect(warnSpy).toHaveBeenCalled();
    });
  });

  describe('filterPanelKeys', () => {
    const keys = ['heb', 'cross', 'hist', 'ctx'];

    it('returns keys unchanged when filter is undefined', () => {
      expect(filterPanelKeys(keys, undefined)).toBe(keys);
    });

    it('returns keys unchanged when filter is empty (avoids hiding everything)', () => {
      expect(filterPanelKeys(keys, [])).toBe(keys);
    });

    it('keeps only keys present in the filter', () => {
      expect(filterPanelKeys(keys, ['heb', 'ctx'])).toEqual(['heb', 'ctx']);
    });

    it('preserves the original order of kept keys, not the filter order', () => {
      // `keys` is [heb, cross, hist, ctx]; filter requests [ctx, heb] — but
      // filterPanelKeys preserves original order. orderPanelKeys is what
      // does reordering.
      expect(filterPanelKeys(keys, ['ctx', 'heb'])).toEqual(['heb', 'ctx']);
    });

    it('silently drops filter entries not present in keys', () => {
      expect(filterPanelKeys(keys, ['heb', 'nonexistent'])).toEqual(['heb']);
    });

    it('returns empty array when filter has no overlap with keys', () => {
      expect(filterPanelKeys(keys, ['nope'])).toEqual([]);
    });

    it('does not mutate the input keys array', () => {
      const input = [...keys];
      filterPanelKeys(input, ['heb']);
      expect(input).toEqual(keys);
    });
  });

  describe('orderPanelKeys', () => {
    const keys = ['heb', 'cross', 'hist', 'ctx'];

    it('returns keys unchanged when order is undefined', () => {
      expect(orderPanelKeys(keys, undefined)).toBe(keys);
    });

    it('returns keys unchanged when order is empty', () => {
      expect(orderPanelKeys(keys, [])).toBe(keys);
    });

    it('reorders keys to match the order array', () => {
      expect(orderPanelKeys(keys, ['ctx', 'heb', 'cross', 'hist'])).toEqual([
        'ctx',
        'heb',
        'cross',
        'hist',
      ]);
    });

    it('appends keys not in the order array, preserving their original relative order', () => {
      // order specifies heb first; cross/hist/ctx should follow in original order.
      expect(orderPanelKeys(keys, ['heb'])).toEqual(['heb', 'cross', 'hist', 'ctx']);
    });

    it('silently drops order entries not present in keys', () => {
      expect(orderPanelKeys(keys, ['heb', 'nonexistent', 'cross'])).toEqual([
        'heb',
        'cross',
        'hist',
        'ctx',
      ]);
    });

    it('handles partial overlap: ordered keys first, unordered keys appended', () => {
      // order specifies [ctx, heb]; hist and cross weren't mentioned — append
      // those after, in their original relative order from `keys`.
      expect(orderPanelKeys(keys, ['ctx', 'heb'])).toEqual([
        'ctx',
        'heb',
        'cross',
        'hist',
      ]);
    });

    it('deduplicates the order array (first occurrence wins)', () => {
      // Defensive: an order with duplicates shouldn't reorder twice.
      expect(orderPanelKeys(['heb', 'cross'], ['heb', 'heb', 'cross'])).toEqual([
        'heb',
        'cross',
      ]);
    });

    it('does not mutate the input keys array', () => {
      const input = [...keys];
      orderPanelKeys(input, ['ctx']);
      expect(input).toEqual(keys);
    });
  });

  describe('applyLensToKeys', () => {
    const keys = ['heb', 'cross', 'hist', 'ctx', 'lit'];

    it('applies filter then order in one call', () => {
      // Filter to {heb, lit, ctx}, then order [lit, ctx, heb].
      expect(applyLensToKeys(keys, ['heb', 'lit', 'ctx'], ['lit', 'ctx', 'heb'])).toEqual([
        'lit',
        'ctx',
        'heb',
      ]);
    });

    it('returns keys unchanged when both filter and order are undefined', () => {
      expect(applyLensToKeys(keys)).toEqual(keys);
    });

    it('with only filter: filter applied, original order kept', () => {
      expect(applyLensToKeys(keys, ['ctx', 'heb'])).toEqual(['heb', 'ctx']);
    });

    it('with only order: full key set, reordered', () => {
      expect(applyLensToKeys(keys, undefined, ['lit'])).toEqual([
        'lit',
        'heb',
        'cross',
        'hist',
        'ctx',
      ]);
    });

    it('order keys outside of filter are silently dropped', () => {
      // hist isn't in the filter, so even though order mentions it, it's gone.
      expect(applyLensToKeys(keys, ['heb', 'cross'], ['cross', 'hist', 'heb'])).toEqual([
        'cross',
        'heb',
      ]);
    });
  });

  describe('end-to-end through parse', () => {
    it('parses panel_filter_json + panel_order_json strings and applies them', () => {
      const filterJson = '["heb","cross","ctx"]';
      const orderJson = '["ctx","heb","cross"]';
      const filter = parseLensJson(filterJson);
      const order = parseLensJson(orderJson);
      expect(applyLensToKeys(['heb', 'cross', 'hist', 'ctx'], filter, order)).toEqual([
        'ctx',
        'heb',
        'cross',
      ]);
    });

    it('falls back to no transformation when both JSON strings are malformed', () => {
      const keys = ['heb', 'cross', 'hist'];
      const filter = parseLensJson('not json');
      const order = parseLensJson('also not json');
      expect(applyLensToKeys(keys, filter, order)).toEqual(keys);
    });
  });
});
