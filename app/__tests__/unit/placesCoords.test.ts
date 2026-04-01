/**
 * Coordinate and type validation tests for places.json.
 * Reads content JSON directly — no React components or mocks.
 */

import * as fs from 'fs';
import * as path from 'path';

const CONTENT_DIR = path.resolve(__dirname, '../../..', 'content');

interface Place {
  id: string;
  ancient?: string;
  modern?: string;
  lat: number;
  lon: number;
  type: string;
  [key: string]: unknown;
}

function loadPlaces(): Place[] {
  return JSON.parse(
    fs.readFileSync(path.join(CONTENT_DIR, 'meta', 'places.json'), 'utf-8'),
  );
}

describe('places coordinate and type integrity', () => {
  const places = loadPlaces();

  it('places.json has entries', () => {
    expect(places.length).toBeGreaterThan(0);
  });

  it('all place latitudes are in [-90, 90]', () => {
    const violations: string[] = [];
    for (const place of places) {
      if (typeof place.lat !== 'number' || place.lat < -90 || place.lat > 90) {
        violations.push(`${place.id}: lat ${place.lat} out of range [-90, 90]`);
      }
    }
    expect(violations).toEqual([]);
  });

  it('all place longitudes are in [-180, 180]', () => {
    const violations: string[] = [];
    for (const place of places) {
      if (typeof place.lon !== 'number' || place.lon < -180 || place.lon > 180) {
        violations.push(`${place.id}: lon ${place.lon} out of range [-180, 180]`);
      }
    }
    expect(violations).toEqual([]);
  });

  it('all place types are in valid set', () => {
    const validTypes = new Set(['city', 'water', 'region', 'mountain', 'site', 'port']);
    const violations: string[] = [];
    for (const place of places) {
      if (!validTypes.has(place.type)) {
        violations.push(`${place.id}: type "${place.type}" not in valid set {${[...validTypes].join(', ')}}`);
      }
    }
    expect(violations).toEqual([]);
  });
});
