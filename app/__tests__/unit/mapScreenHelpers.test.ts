/**
 * Unit tests for pure helpers exported from MapScreen.
 */

// MapScreen transitively imports a few platform modules; mock them out so
// requiring the screen module is cheap.
jest.mock('@/stores', () => ({
  useSettingsStore: Object.assign(
    (sel: any) => sel({ translation: 'kjv', fontSize: 16 }),
    { getState: () => ({ markGettingStartedDone: jest.fn() }) },
  ),
  useReaderStore: (sel: any) => sel({}),
}));

jest.mock('@/hooks/usePlaces', () => ({ usePlaces: () => ({ places: [], isLoading: false }) }));
jest.mock('@/hooks/useMapStories', () => ({ useMapStories: () => ({ stories: [], isLoading: false }) }));
jest.mock('@/hooks/useMapZoom', () => ({ useMapZoom: () => ({ zoomLevel: 5, onRegionDidChange: jest.fn() }) }));
jest.mock('@/hooks/useLandscapeUnlock', () => ({ useLandscapeUnlock: jest.fn() }));
jest.mock('@/hooks/useMapTileCache', () => ({ useMapTileCache: jest.fn() }));
jest.mock('@/hooks/usePersonArc', () => ({
  usePersonArc: () => ({ arcData: null, isLoading: false }),
}));
jest.mock('@/hooks/useAncientBorders', () => ({
  useAncientBorders: () => ({
    borders: { type: 'FeatureCollection', features: [] },
    isLoading: false,
  }),
}));

import { buildPlaceToStoriesMap, STYLE_ANCIENT, STYLE_MODERN } from '@/screens/MapScreen';
import type { MapStory } from '@/types';

function story(id: string, places: string[]): MapStory {
  return {
    id,
    era: 'patriarchs',
    name: id,
    scripture_ref: null,
    chapter_link: null,
    summary: '',
    places_json: JSON.stringify(places),
    regions_json: null,
    paths_json: null,
  };
}

describe('buildPlaceToStoriesMap', () => {
  it('returns an empty map for no stories', () => {
    const out = buildPlaceToStoriesMap([]);
    expect(out.size).toBe(0);
  });

  it('indexes stories by every place id they reference', () => {
    const a = story('a', ['jerusalem', 'bethlehem']);
    const b = story('b', ['jerusalem']);
    const out = buildPlaceToStoriesMap([a, b]);
    expect(out.get('jerusalem')).toEqual([a, b]);
    expect(out.get('bethlehem')).toEqual([a]);
  });

  it('skips stories whose places_json is malformed', () => {
    const ok = story('ok', ['jerusalem']);
    const bad: MapStory = { ...ok, id: 'bad', places_json: 'not-json' };
    const out = buildPlaceToStoriesMap([bad, ok]);
    expect(out.get('jerusalem')).toEqual([ok]);
  });

  it('preserves story insertion order for each place', () => {
    const s1 = story('s1', ['p']);
    const s2 = story('s2', ['p']);
    const s3 = story('s3', ['p']);
    const out = buildPlaceToStoriesMap([s1, s2, s3]);
    expect(out.get('p')).toEqual([s1, s2, s3]);
  });
});

describe('MapLibre style URLs', () => {
  it('points ancient.json at the R2-hosted map-styles path', () => {
    expect(STYLE_ANCIENT).toMatch(/map-styles\/ancient\.json$/);
  });

  it('points modern.json at the R2-hosted map-styles path', () => {
    expect(STYLE_MODERN).toMatch(/map-styles\/modern\.json$/);
  });
});
