/**
 * Unit tests for `utils/routeContext.ts` — pure helpers extracted from
 * AmicusPeekSheet's former `useNavigationContext`.
 *
 * Covers:
 *   - `findDeepestRoute` traversal and edge cases (null, missing index,
 *     nested navigators, linear state)
 *   - `routeToChipContext` mapping for every recognised route name and
 *     each param edge case (missing / wrong type)
 */

import {
  findDeepestRoute,
  routeToChipContext,
  type MinimalRoute,
} from '@/utils/routeContext';

describe('findDeepestRoute', () => {
  it('returns null for undefined state', () => {
    expect(findDeepestRoute(undefined)).toBeNull();
  });

  it('returns null for null state', () => {
    expect(findDeepestRoute(null)).toBeNull();
  });

  it('returns null when routes is missing', () => {
    expect(findDeepestRoute({ index: 0 })).toBeNull();
  });

  it('returns null when routes is empty', () => {
    expect(findDeepestRoute({ routes: [], index: 0 })).toBeNull();
  });

  it('returns the focused route in a linear state', () => {
    const state = {
      index: 1,
      routes: [{ name: 'Home' }, { name: 'Chapter', params: { bookId: 'romans' } }],
    };
    const route = findDeepestRoute(state);
    expect(route?.name).toBe('Chapter');
    expect((route?.params as { bookId: string }).bookId).toBe('romans');
  });

  it('falls back to the last route when index is missing', () => {
    const state = {
      routes: [{ name: 'First' }, { name: 'Second' }, { name: 'Third' }],
    };
    expect(findDeepestRoute(state)?.name).toBe('Third');
  });

  it('descends into nested navigator state', () => {
    const state = {
      index: 0,
      routes: [
        {
          name: 'HomeTab',
          state: {
            index: 1,
            routes: [{ name: 'HomeMain' }, { name: 'Chapter', params: { bookId: 'psalms' } }],
          },
        },
      ],
    };
    const route = findDeepestRoute(state);
    expect(route?.name).toBe('Chapter');
  });

  it('handles three-level nesting (tab → stack → modal stack)', () => {
    const state = {
      index: 0,
      routes: [
        {
          name: 'MainTabs',
          state: {
            index: 0,
            routes: [
              {
                name: 'HomeStack',
                state: {
                  index: 1,
                  routes: [
                    { name: 'Home' },
                    { name: 'PersonDetail', params: { personId: 'moses' } },
                  ],
                },
              },
            ],
          },
        },
      ],
    };
    const route = findDeepestRoute(state);
    expect(route?.name).toBe('PersonDetail');
  });

  it('returns the parent route when its child state is malformed', () => {
    // A parent route with a state field whose routes is missing should
    // still surface the parent itself rather than return null, because
    // the parent IS a valid focused route.
    const state = {
      index: 0,
      routes: [
        {
          name: 'ParentRoute',
          params: { foo: 'bar' },
          state: { index: 0 }, // missing routes
        },
      ],
    };
    const route = findDeepestRoute(state);
    expect(route?.name).toBe('ParentRoute');
  });
});

describe('routeToChipContext', () => {
  it('returns {kind: none} for null route', () => {
    expect(routeToChipContext(null)).toEqual({ kind: 'none' });
  });

  it('returns {kind: none} for an unrecognised route', () => {
    const route: MinimalRoute = { name: 'SomeUnknownRoute' };
    expect(routeToChipContext(route)).toEqual({ kind: 'none' });
  });

  describe('Chapter route', () => {
    it('maps a valid Chapter route to chapter context', () => {
      const route: MinimalRoute = {
        name: 'Chapter',
        params: { bookId: 'romans', chapterNum: 9 },
      };
      expect(routeToChipContext(route)).toEqual({
        kind: 'chapter',
        bookId: 'romans',
        chapterNum: 9,
      });
    });

    it('falls back to {kind: none} when bookId is missing', () => {
      const route: MinimalRoute = {
        name: 'Chapter',
        params: { chapterNum: 9 },
      };
      expect(routeToChipContext(route)).toEqual({ kind: 'none' });
    });

    it('falls back to {kind: none} when chapterNum is missing', () => {
      const route: MinimalRoute = {
        name: 'Chapter',
        params: { bookId: 'romans' },
      };
      expect(routeToChipContext(route)).toEqual({ kind: 'none' });
    });

    it('falls back to {kind: none} when chapterNum is a string (common deep-link serialisation bug)', () => {
      const route: MinimalRoute = {
        name: 'Chapter',
        params: { bookId: 'romans', chapterNum: '9' as unknown as number },
      };
      expect(routeToChipContext(route)).toEqual({ kind: 'none' });
    });

    it('falls back to {kind: none} when params are missing entirely', () => {
      const route: MinimalRoute = { name: 'Chapter' };
      expect(routeToChipContext(route)).toEqual({ kind: 'none' });
    });
  });

  describe('PersonDetail route', () => {
    it('maps a valid PersonDetail route to person context', () => {
      const route: MinimalRoute = {
        name: 'PersonDetail',
        params: { personId: 'moses' },
      };
      expect(routeToChipContext(route)).toEqual({
        kind: 'person',
        personId: 'moses',
      });
    });

    it('falls back to {kind: none} when personId is missing', () => {
      const route: MinimalRoute = { name: 'PersonDetail', params: {} };
      expect(routeToChipContext(route)).toEqual({ kind: 'none' });
    });

    it('falls back to {kind: none} when personId is not a string', () => {
      const route: MinimalRoute = {
        name: 'PersonDetail',
        params: { personId: 42 as unknown as string },
      };
      expect(routeToChipContext(route)).toEqual({ kind: 'none' });
    });
  });

  describe('DebateDetail route', () => {
    it('maps a valid DebateDetail route to debate_topic context', () => {
      const route: MinimalRoute = {
        name: 'DebateDetail',
        params: { topicId: 'predestination' },
      };
      expect(routeToChipContext(route)).toEqual({
        kind: 'debate_topic',
        topicId: 'predestination',
      });
    });

    it('falls back to {kind: none} when topicId is missing', () => {
      const route: MinimalRoute = { name: 'DebateDetail', params: {} };
      expect(routeToChipContext(route)).toEqual({ kind: 'none' });
    });
  });
});
