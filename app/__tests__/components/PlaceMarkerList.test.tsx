import { placesToFeatureCollection } from '@/components/map/PlaceMarkerList';
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
