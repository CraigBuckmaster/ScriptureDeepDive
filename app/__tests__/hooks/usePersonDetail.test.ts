import { renderHook, waitFor } from '@testing-library/react-native';

const mockGetPerson = jest.fn();
const mockGetPersonChildren = jest.fn();
const mockGetSpousesOf = jest.fn();

jest.mock('@/db/content', () => ({
  getPerson: (...args: any[]) => mockGetPerson(...args),
  getPersonChildren: (...args: any[]) => mockGetPersonChildren(...args),
  getSpousesOf: (...args: any[]) => mockGetSpousesOf(...args),
}));

import { usePersonDetail } from '@/hooks/usePersonDetail';

const mockPerson = {
  id: 'abraham',
  name: 'Abraham',
  father: 'terah',
  mother: null,
};

const mockFather = { id: 'terah', name: 'Terah', father: null, mother: null };
const mockChild = { id: 'isaac', name: 'Isaac', father: 'abraham', mother: 'sarah' };
const mockSpouse = { id: 'sarah', name: 'Sarah', father: null, mother: null };

describe('usePersonDetail', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns person data after loading', async () => {
    mockGetPerson
      .mockResolvedValueOnce(mockPerson)   // person
      .mockResolvedValueOnce(mockFather)   // father
    ;
    mockGetPersonChildren.mockResolvedValue([mockChild]);
    mockGetSpousesOf.mockResolvedValue([mockSpouse]);

    const { result } = renderHook(() => usePersonDetail('abraham'));
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.person).toEqual(mockPerson);
    expect(result.current.parents.father).toEqual(mockFather);
    expect(result.current.parents.mother).toBeNull();
  });

  it('returns spouses and children', async () => {
    mockGetPerson.mockResolvedValueOnce(mockPerson).mockResolvedValueOnce(mockFather);
    mockGetPersonChildren.mockResolvedValue([mockChild]);
    mockGetSpousesOf.mockResolvedValue([mockSpouse]);

    const { result } = renderHook(() => usePersonDetail('abraham'));
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.children).toEqual([mockChild]);
    expect(result.current.spouses).toEqual([mockSpouse]);
  });

  it('starts in loading state', () => {
    mockGetPerson.mockResolvedValue(mockPerson);
    mockGetPersonChildren.mockResolvedValue([]);
    mockGetSpousesOf.mockResolvedValue([]);

    const { result } = renderHook(() => usePersonDetail('abraham'));
    expect(result.current.isLoading).toBe(true);
  });

  it('does not load when personId is null', () => {
    const { result } = renderHook(() => usePersonDetail(null));
    expect(result.current.person).toBeNull();
    expect(result.current.isLoading).toBe(true);
    expect(mockGetPerson).not.toHaveBeenCalled();
  });
});
