import {
  buildPlaceVisibilityExpr,
  placesToFeatureCollection,
} from '@/components/map/PlaceMarkerList';
import type { Place } from '@/types';

const makePlace = (id: string, priority: number, extra: Partial<Place> = {}): Place => ({
  id,
  ancient_name: `Place ${id}`,
  modern_name: null,
  latitude: 31.0,
  longitude: 35.0,
  type: 'city',
  priority,
  label_dir: 'n',
  ...extra,
});

describe('placesToFeatureCollection', () => {
  it('returns an empty FeatureCollection for an empty places array', () => {
    const fc = placesToFeatureCollection([]);
    expect(fc.type).toBe('FeatureCollection');
    expect(fc.features).toEqual([]);
  });

  it('emits one Point feature per place in [lon, lat] order', () => {
    const places: Place[] = [
      makePlace('a', 1, { latitude: 31.77, longitude: 35.23 }),
      makePlace('b', 2, { latitude: 32.0, longitude: 34.8 }),
    ];
    const fc = placesToFeatureCollection(places);
    expect(fc.features).toHaveLength(2);
    expect(fc.features[0].geometry).toEqual({ type: 'Point', coordinates: [35.23, 31.77] });
    expect(fc.features[1].geometry).toEqual({ type: 'Point', coordinates: [34.8, 32.0] });
  });

  it('carries id, priority, type, and both name variants into properties', () => {
    const p = makePlace('jerusalem', 1, {
      ancient_name: 'Jerusalem',
      modern_name: 'Yerushalayim',
      type: 'city',
    });
    const fc = placesToFeatureCollection([p]);
    const feat = fc.features[0];
    expect(feat.id).toBe('jerusalem');
    expect(feat.properties).toMatchObject({
      id: 'jerusalem',
      ancient: 'Jerusalem',
      modern: 'Yerushalayim',
      type: 'city',
      priority: 1,
    });
  });

  it('falls back to ancient_name when modern_name is null', () => {
    const p = makePlace('bethel', 2, { ancient_name: 'Bethel', modern_name: null });
    const fc = placesToFeatureCollection([p]);
    expect(fc.features[0].properties).toMatchObject({
      ancient: 'Bethel',
      modern: 'Bethel',
    });
  });
});

/**
 * Regression guard for the iOS MapLibre crash described in PR #1567.
 *
 * The original bug was a `step` expression with a non-literal `case` sub-
 * expression as a stop input. MapLibre's iOS SDK threw an uncaught
 * NSException at -[MLRNStyle setCircleOpacity:withReactStyleValue:] which
 * Sentry's terminate handler turned into a SIGABRT crash. The TypeScript
 * type system permits the broken shape — only runtime native validation
 * catches it — so a test that locks in the structural invariant is the
 * cheapest insurance against re-regression.
 *
 * The MapLibre style spec invariant being tested: in `["step", input,
 * base_output, stop_input_1, stop_output_1, ...]`, every stop_input_N
 * MUST be a literal number. Outputs may be expressions; inputs may not.
 */
describe('buildPlaceVisibilityExpr (MapLibre step-spec regression guard)', () => {
  it('returns a step expression', () => {
    const expr = buildPlaceVisibilityExpr([]);
    expect(expr[0]).toBe('step');
    expect(expr[1]).toEqual(['zoom']);
  });

  it('uses literal numeric stop inputs (the spec violation that caused the crash)', () => {
    const expr = buildPlaceVisibilityExpr([]);
    // Step expression layout after `["step", ["zoom"]]`:
    //   index 2:           base_output (any expression — OK)
    //   index 3, 5, 7, ...: stop_input_N (MUST be literal number)
    //   index 4, 6, 8, ...: stop_output_N (any expression — OK)
    const stopInputs = expr.slice(3).filter((_, i) => i % 2 === 0);
    expect(stopInputs.length).toBeGreaterThan(0);
    for (const input of stopInputs) {
      expect(typeof input).toBe('number');
      expect(Number.isFinite(input)).toBe(true);
    }
  });

  it('produces stop inputs in strictly ascending order (also a step-spec requirement)', () => {
    const expr = buildPlaceVisibilityExpr([]);
    const stopInputs = expr.slice(3).filter((_, i) => i % 2 === 0) as number[];
    for (let i = 1; i < stopInputs.length; i += 1) {
      expect(stopInputs[i]).toBeGreaterThan(stopInputs[i - 1]);
    }
  });

  it('threads storyPlaceIds through every per-zoom output so story places are always visible', () => {
    const ids = ['jerusalem', 'bethlehem'];
    const expr = buildPlaceVisibilityExpr(ids);
    const serialised = JSON.stringify(expr);
    // Every output that gates visibility must reference the story-place
    // literal so story features are unaffected by zoom thresholds.
    const literalRefs = serialised.match(/"literal"/g) ?? [];
    // One per output band (base + 4 stops = 5), minus the final `1` band
    // which has no `case` and therefore no literal reference. So we expect
    // at least 4 references.
    expect(literalRefs.length).toBeGreaterThanOrEqual(4);
    expect(serialised).toContain('"jerusalem"');
    expect(serialised).toContain('"bethlehem"');
  });
});
