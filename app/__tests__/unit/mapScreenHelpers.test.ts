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

import { buildPlaceToStoriesMap, resolveBorderEra, STYLE_ANCIENT, STYLE_MODERN } from '@/screens/MapScreen';
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

/**
 * Regression guard for the story-select / era-filter decoupling
 * introduced in the PR that ships this file alongside.
 *
 * Before: selecting a story called `setActiveEra(story.era)` as a
 * side effect so the AncientBorderLayer would repaint — but that
 * ALSO narrowed the EraFilterBar to the story's era, trapping the
 * user there after the story closed.
 *
 * After: border era is derived from `activeStory?.era ?? filterEra`
 * so the map repaints correctly while the filter chip stays
 * untouched. This test pins the derivation so a future refactor
 * can't regress to the side-effect pattern without a red CI.
 */
describe('resolveBorderEra', () => {
  it('returns the active story’s era when a story is selected, regardless of the filter', () => {
    // The user is browsing "All" stories but has tapped one in the
    // Kingdom era — borders should match the story, not the filter.
    expect(resolveBorderEra({ era: 'kingdom' }, 'all')).toBe('kingdom');
  });

  it('returns the active story’s era even when the filter already matches', () => {
    // Belt-and-suspenders: if both agree, no ambiguity.
    expect(resolveBorderEra({ era: 'exodus' }, 'exodus')).toBe('exodus');
  });

  it('returns the filter era when no story is active', () => {
    // User has the Patriarchs chip selected, no story open — borders
    // follow the chip.
    expect(resolveBorderEra(null, 'patriarchs')).toBe('patriarchs');
  });

  it("returns 'all' when no story is active and the filter is 'all'", () => {
    // Default/idle state — whatever 'all' means downstream (typically
    // no borders or a neutral backdrop) is correctly propagated.
    expect(resolveBorderEra(null, 'all')).toBe('all');
  });

  it('prefers the story era over the filter even when they disagree', () => {
    // The exact bug scenario from Craig's screenshot: user's filter
    // chip is on "All", user taps a Kingdom story. Borders MUST
    // follow the story (kingdom); the filter MUST remain untouched.
    // resolveBorderEra only handles the first half; the parent
    // component is responsible for not calling setFilterEra —
    // but this test pins the resolver's contract.
    expect(resolveBorderEra({ era: 'kingdom' }, 'all')).toBe('kingdom');
    expect(resolveBorderEra({ era: 'nt' }, 'exile')).toBe('nt');
  });
});
