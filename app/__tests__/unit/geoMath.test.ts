import { toLatLng, computeBearing, zoomFromDelta, maxPriorityForZoom, labelScale } from '../../src/utils/geoMath';

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
