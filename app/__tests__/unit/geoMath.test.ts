import {
  toLatLng,
  computeBearing,
  computeBounds,
  midpoint,
  zoomFromDelta,
  maxPriorityForZoom,
  labelScale,
  labelOffset,
  haversineDistance,
  pathDistance,
} from '../../src/utils/geoMath';

describe('toLatLng', () => {
  it('flips lon,lat to latitude,longitude', () => {
    expect(toLatLng([35.2, 31.7])).toEqual({ latitude: 31.7, longitude: 35.2 });
  });
});

describe('computeBearing', () => {
  it('computes roughly north', () => {
    const b = computeBearing({ latitude: 0, longitude: 0 }, { latitude: 1, longitude: 0 });
    expect(b).toBeCloseTo(0, 0);
  });
  it('computes roughly east', () => {
    const b = computeBearing({ latitude: 0, longitude: 0 }, { latitude: 0, longitude: 1 });
    expect(b).toBeCloseTo(90, 0);
  });
});

describe('maxPriorityForZoom', () => {
  it('zoom 3 shows priority 1 only', () => expect(maxPriorityForZoom(3)).toBe(1));
  it('zoom 6 shows priority 2', () => expect(maxPriorityForZoom(6)).toBe(2));
  it('zoom 8 shows priority 3', () => expect(maxPriorityForZoom(8)).toBe(3));
  it('zoom 10 shows all', () => expect(maxPriorityForZoom(10)).toBe(4));
});

describe('labelScale', () => {
  it('clamps minimum', () => expect(labelScale(3)).toBeGreaterThanOrEqual(0.7));
  it('clamps maximum', () => expect(labelScale(20)).toBeLessThanOrEqual(2.4));
  it('scales with zoom', () => expect(labelScale(7)).toBeGreaterThan(labelScale(5)));
});

describe('toLatLng – negative coordinates', () => {
  it('handles negative longitude and latitude', () => {
    const result = toLatLng([-73.9857, -33.8688]);
    expect(result).toEqual({ latitude: -33.8688, longitude: -73.9857 });
  });
  it('handles mixed negative/positive', () => {
    const result = toLatLng([-118.2437, 34.0522]);
    expect(result).toEqual({ latitude: 34.0522, longitude: -118.2437 });
  });
});

describe('computeBearing – south direction', () => {
  it('computes roughly south (180 degrees)', () => {
    const b = computeBearing(
      { latitude: 1, longitude: 0 },
      { latitude: 0, longitude: 0 },
    );
    expect(b).toBeCloseTo(180, 0);
  });
  it('computes roughly west (270 degrees)', () => {
    const b = computeBearing(
      { latitude: 0, longitude: 1 },
      { latitude: 0, longitude: 0 },
    );
    expect(b).toBeCloseTo(270, 0);
  });
});

describe('computeBounds', () => {
  it('returns correct bounds for a single point', () => {
    const bounds = computeBounds([{ latitude: 31.7, longitude: 35.2 }]);
    expect(bounds.ne).toEqual({ latitude: 31.7, longitude: 35.2 });
    expect(bounds.sw).toEqual({ latitude: 31.7, longitude: 35.2 });
  });
  it('returns correct bounds for multiple points', () => {
    const bounds = computeBounds([
      { latitude: 10, longitude: 20 },
      { latitude: 30, longitude: 40 },
      { latitude: 20, longitude: 30 },
    ]);
    expect(bounds.ne).toEqual({ latitude: 30, longitude: 40 });
    expect(bounds.sw).toEqual({ latitude: 10, longitude: 20 });
  });
});

describe('midpoint', () => {
  it('returns the geographic midpoint of two coordinates', () => {
    const m = midpoint(
      { latitude: 0, longitude: 0 },
      { latitude: 10, longitude: 20 },
    );
    expect(m.latitude).toBeCloseTo(5);
    expect(m.longitude).toBeCloseTo(10);
  });
  it('handles negative coordinates', () => {
    const m = midpoint(
      { latitude: -10, longitude: -20 },
      { latitude: 10, longitude: 20 },
    );
    expect(m.latitude).toBeCloseTo(0);
    expect(m.longitude).toBeCloseTo(0);
  });
});

describe('zoomFromDelta', () => {
  it('returns a zoom level from latitude delta', () => {
    const z = zoomFromDelta(1);
    expect(z).toBeGreaterThanOrEqual(3);
    expect(z).toBeLessThanOrEqual(16);
  });
  it('clamps to minimum zoom for very large delta', () => {
    expect(zoomFromDelta(1000)).toBe(3);
  });
  it('clamps to maximum zoom for very small delta', () => {
    expect(zoomFromDelta(0.001)).toBe(16);
  });
  it('larger delta yields lower zoom', () => {
    expect(zoomFromDelta(10)).toBeLessThan(zoomFromDelta(1));
  });
});

describe('haversineDistance', () => {
  it('returns 0 for identical coordinates', () => {
    const d = haversineDistance(
      { latitude: 31.77, longitude: 35.23 },
      { latitude: 31.77, longitude: 35.23 },
    );
    expect(d).toBeCloseTo(0, 5);
  });

  it('matches the known Jerusalem → Babylon distance (~530–560 mi)', () => {
    // Jerusalem (31.77, 35.23) → Babylon ruins (32.54, 44.42)
    const d = haversineDistance(
      { latitude: 31.77, longitude: 35.23 },
      { latitude: 32.54, longitude: 44.42 },
    );
    expect(d).toBeGreaterThan(530);
    expect(d).toBeLessThan(580);
  });

  it('matches the known Jerusalem → Bethlehem distance (~5 mi)', () => {
    const d = haversineDistance(
      { latitude: 31.77, longitude: 35.23 },
      { latitude: 31.70, longitude: 35.20 },
    );
    expect(d).toBeGreaterThan(4);
    expect(d).toBeLessThan(7);
  });

  it('is symmetric', () => {
    const a = { latitude: 0, longitude: 0 };
    const b = { latitude: 5, longitude: 5 };
    expect(haversineDistance(a, b)).toBeCloseTo(haversineDistance(b, a), 5);
  });
});

describe('pathDistance', () => {
  it('returns 0 for an empty or single-point path', () => {
    expect(pathDistance([])).toBe(0);
    expect(pathDistance([{ latitude: 31, longitude: 35 }])).toBe(0);
  });

  it('sums leg distances along a polyline', () => {
    const single = haversineDistance(
      { latitude: 31.77, longitude: 35.23 },
      { latitude: 31.70, longitude: 35.20 },
    );
    const looped = pathDistance([
      { latitude: 31.77, longitude: 35.23 },
      { latitude: 31.70, longitude: 35.20 },
      { latitude: 31.77, longitude: 35.23 },
    ]);
    expect(looped).toBeCloseTo(single * 2, 5);
  });
});

describe('labelOffset', () => {
  it('returns negative y for north direction', () => {
    const off = labelOffset('n', 10);
    expect(off.x).toBe(0);
    expect(off.y).toBeLessThan(0);
  });
  it('returns positive y for south direction', () => {
    const off = labelOffset('s', 10);
    expect(off.x).toBe(0);
    expect(off.y).toBeGreaterThan(0);
  });
  it('returns positive x for east direction', () => {
    const off = labelOffset('e', 10);
    expect(off.x).toBeGreaterThan(0);
    expect(off.y).toBe(0);
  });
  it('returns negative x for west direction', () => {
    const off = labelOffset('w', 10);
    expect(off.x).toBeLessThan(0);
    expect(off.y).toBe(0);
  });
  it('returns diagonal offset for ne', () => {
    const off = labelOffset('ne', 10);
    expect(off.x).toBeGreaterThan(0);
    expect(off.y).toBeLessThan(0);
  });
  it('returns diagonal offset for sw', () => {
    const off = labelOffset('sw', 10);
    expect(off.x).toBeLessThan(0);
    expect(off.y).toBeGreaterThan(0);
  });
  it('falls back to east-like offset for unknown direction', () => {
    const off = labelOffset('unknown', 10);
    expect(off.x).toBeGreaterThan(0);
    expect(off.y).toBe(0);
  });
});
