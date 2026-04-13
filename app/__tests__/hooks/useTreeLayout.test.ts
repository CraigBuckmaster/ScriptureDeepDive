import { renderHook } from '@testing-library/react-native';

const mockComputeFullLayout = jest.fn();

jest.mock('@/utils/treeBuilder', () => ({
  computeFullLayout: (...args: any[]) => mockComputeFullLayout(...args),
}));

import { useTreeLayout } from '@/hooks/useTreeLayout';
import type { Person } from '@/types';

const makePerson = (overrides: Partial<Person> = {}): Person => ({
  id: 'adam',
  name: 'Adam',
  gender: 'male',
  father: null,
  mother: null,
  spouse_of: null,
  era: 'creation',
  dates: null,
  role: null,
  type: 'spine',
  bio: null,
  scripture_role: null,
  refs_json: null,
  chapter_link: null,
  associated_with: null,
  association_type: null,
  ...overrides,
});

describe('useTreeLayout', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns empty layout for empty people array', () => {
    const { result } = renderHook(() => useTreeLayout([]));
    expect(result.current.nodes).toEqual([]);
    expect(result.current.links).toEqual([]);
    expect(result.current.marriageBars).toEqual([]);
    expect(result.current.spouseConnectors).toEqual([]);
    expect(result.current.spineIds).toEqual(new Set());
    expect(result.current.bounds).toEqual({
      minX: 0, maxX: 100, minY: 0, maxY: 100, width: 100, height: 100,
    });
    expect(mockComputeFullLayout).not.toHaveBeenCalled();
  });

  it('calls computeFullLayout with people and null era', () => {
    const fakeResult = {
      nodes: [{ data: { id: 'adam' }, x: 0, y: 0 }],
      links: [],
      marriageBars: [],
      spouseConnectors: [],
      spineIds: new Set(['adam']),
      bounds: { minX: 0, maxX: 200, minY: 0, maxY: 300, width: 200, height: 300 },
    };
    mockComputeFullLayout.mockReturnValue(fakeResult);

    const people = [makePerson()];
    const { result } = renderHook(() => useTreeLayout(people));

    expect(mockComputeFullLayout).toHaveBeenCalledWith(people, null);
    expect(result.current.nodes).toHaveLength(1);
    expect(result.current.spineIds.has('adam')).toBe(true);
  });

  it('passes filterEra to computeFullLayout', () => {
    mockComputeFullLayout.mockReturnValue({
      nodes: [], links: [], marriageBars: [], spouseConnectors: [],
      spineIds: new Set(), bounds: { minX: 0, maxX: 100, minY: 0, maxY: 100, width: 100, height: 100 },
    });

    const people = [makePerson()];
    renderHook(() => useTreeLayout(people, 'patriarchs'));

    expect(mockComputeFullLayout).toHaveBeenCalledWith(people, 'patriarchs');
  });

  it('treats filterEra "all" as null', () => {
    mockComputeFullLayout.mockReturnValue({
      nodes: [], links: [], marriageBars: [], spouseConnectors: [],
      spineIds: new Set(), bounds: { minX: 0, maxX: 100, minY: 0, maxY: 100, width: 100, height: 100 },
    });

    const people = [makePerson()];
    renderHook(() => useTreeLayout(people, 'all'));

    expect(mockComputeFullLayout).toHaveBeenCalledWith(people, null);
  });

  it('memoises result when inputs do not change', () => {
    const fakeResult = {
      nodes: [], links: [], marriageBars: [], spouseConnectors: [],
      spineIds: new Set(), bounds: { minX: 0, maxX: 100, minY: 0, maxY: 100, width: 100, height: 100 },
    };
    mockComputeFullLayout.mockReturnValue(fakeResult);

    const people = [makePerson()];
    const { result, rerender } = renderHook(() => useTreeLayout(people));
    const first = result.current;

    rerender({});
    expect(result.current).toBe(first);
    // computeFullLayout should only be called once due to memoisation
    expect(mockComputeFullLayout).toHaveBeenCalledTimes(1);
  });
});
