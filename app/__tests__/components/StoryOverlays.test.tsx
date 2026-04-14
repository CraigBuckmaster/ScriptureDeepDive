import {
  regionsToFeatureCollection,
  pathsToFeatureCollection,
  arrowsFromPaths,
  bearingDeg,
} from '@/components/map/StoryOverlays';

describe('regionsToFeatureCollection', () => {
  it('returns an empty FeatureCollection when no regions exist', () => {
    const fc = regionsToFeatureCollection([], '#bfa050');
    expect(fc.type).toBe('FeatureCollection');
    expect(fc.features).toEqual([]);
  });

  it('emits Polygon features with ring auto-closed on missing last coord', () => {
    const fc = regionsToFeatureCollection(
      [{ coords: [[35, 31], [36, 31], [36, 32], [35, 32]], color: '#ff0000', label: 'Canaan' }],
      '#bfa050',
    );
    expect(fc.features).toHaveLength(1);
    const geom = fc.features[0].geometry as GeoJSON.Polygon;
    expect(geom.type).toBe('Polygon');
    // Ring should be closed — last coord equals first
    const ring = geom.coordinates[0];
    expect(ring[0]).toEqual(ring[ring.length - 1]);
  });

  it('keeps explicit color and label in properties and falls back to era color', () => {
    const fc = regionsToFeatureCollection(
      [
        { coords: [[0, 0], [1, 0], [1, 1]], color: '#abcdef', label: 'A' },
        { coords: [[0, 0], [1, 0], [1, 1]] },
      ],
      '#bfa050',
    );
    expect(fc.features[0].properties).toMatchObject({ color: '#abcdef', label: 'A' });
    expect(fc.features[1].properties).toMatchObject({ color: '#bfa050', label: '' });
  });

  it('drops degenerate rings with fewer than 3 coords', () => {
    const fc = regionsToFeatureCollection(
      [
        { coords: [[0, 0]] },
        { coords: [[0, 0], [1, 0]] },
        { coords: [[0, 0], [1, 0], [1, 1]] },
      ],
      '#bfa050',
    );
    expect(fc.features).toHaveLength(1);
  });
});

describe('pathsToFeatureCollection', () => {
  it('returns an empty FeatureCollection when no paths exist', () => {
    const fc = pathsToFeatureCollection([]);
    expect(fc.type).toBe('FeatureCollection');
    expect(fc.features).toEqual([]);
  });

  it('emits LineString features with dashed + label props', () => {
    const fc = pathsToFeatureCollection([
      { coords: [[35, 31], [36, 32]], dashed: false, label: 'Solid' },
      { coords: [[37, 33], [38, 34]], dashed: true, label: 'Dashed' },
    ]);
    expect(fc.features).toHaveLength(2);
    expect((fc.features[0].geometry as GeoJSON.LineString).type).toBe('LineString');
    expect(fc.features[0].properties).toMatchObject({ dashed: false, label: 'Solid' });
    expect(fc.features[1].properties).toMatchObject({ dashed: true, label: 'Dashed' });
  });

  it('drops paths with fewer than 2 coords', () => {
    const fc = pathsToFeatureCollection([
      { coords: [[0, 0]] },
      { coords: [[0, 0], [1, 1]] },
    ]);
    expect(fc.features).toHaveLength(1);
  });

  it('defaults missing dashed/label fields to false and empty string', () => {
    const fc = pathsToFeatureCollection([{ coords: [[0, 0], [1, 1]] }]);
    expect(fc.features[0].properties).toMatchObject({ dashed: false, label: '' });
  });
});

describe('bearingDeg', () => {
  it('returns ~0° for due north', () => {
    expect(bearingDeg([0, 0], [0, 1])).toBeCloseTo(0, 0);
  });

  it('returns ~90° for due east', () => {
    expect(bearingDeg([0, 0], [1, 0])).toBeCloseTo(90, 0);
  });

  it('returns ~180° for due south', () => {
    expect(bearingDeg([0, 0], [0, -1])).toBeCloseTo(180, 0);
  });

  it('returns ~270° for due west', () => {
    expect(bearingDeg([0, 0], [-1, 0])).toBeCloseTo(270, 0);
  });

  it('wraps into the [0, 360) range', () => {
    expect(bearingDeg([10, 10], [5, 5])).toBeGreaterThanOrEqual(0);
    expect(bearingDeg([10, 10], [5, 5])).toBeLessThan(360);
  });
});

describe('arrowsFromPaths', () => {
  it('emits one arrow per path, at its last coord, with a bearing', () => {
    const fc = arrowsFromPaths([
      { coords: [[0, 0], [1, 0]] },
      { coords: [[0, 0], [0, 1], [0, 2]] },
    ]);
    expect(fc.features).toHaveLength(2);
    expect((fc.features[0].geometry as GeoJSON.Point).coordinates).toEqual([1, 0]);
    expect(fc.features[0].properties?.bearing).toBeCloseTo(90, 0);
    expect((fc.features[1].geometry as GeoJSON.Point).coordinates).toEqual([0, 2]);
    expect(fc.features[1].properties?.bearing).toBeCloseTo(0, 0);
  });

  it('skips paths with fewer than 2 coords', () => {
    const fc = arrowsFromPaths([{ coords: [[0, 0]] }, { coords: [[1, 1], [2, 2]] }]);
    expect(fc.features).toHaveLength(1);
  });
});
