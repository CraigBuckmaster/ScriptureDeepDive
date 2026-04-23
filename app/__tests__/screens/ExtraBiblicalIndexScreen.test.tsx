/**
 * ExtraBiblicalIndexScreen.test.tsx — Browse screen for extra-biblical
 * literature (HWGTB-P2-02 / #1547).
 */

import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { renderWithProviders } from '../helpers/renderWithProviders';
import ExtraBiblicalIndexScreen from '@/screens/ExtraBiblicalIndexScreen';
import type { ExtrabiblicalSummary } from '@/types';

// ── Mock navigation ─────────────────────────────────────────────
const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');
  return {
    ...actual,
    useNavigation: () => ({
      navigate: mockNavigate,
      goBack: mockGoBack,
      push: jest.fn(),
      setOptions: jest.fn(),
    }),
    useScrollToTop: jest.fn(),
    useFocusEffect: (cb: () => void) => cb(),
  };
});

// ── Mock icons + safe-area ─────────────────────────────────────
jest.mock('lucide-react-native', () => ({
  ArrowLeft: () => null,
  ChevronLeft: () => null,
  Search: () => null,
  X: () => null,
  Filter: () => null,
  BookOpen: () => null,
  ScrollText: () => null,
}));

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children }: any) => children,
  useSafeAreaInsets: () => ({ top: 44, bottom: 34, left: 0, right: 0 }),
}));

// ── Mock premium store — mutable so tests can flip free/premium ─
let mockIsPremium = true;
const mockShowUpgrade = jest.fn();
const mockDismissUpgrade = jest.fn();
let mockUpgradeRequest: { variant: string; featureName: string } | null = null;
jest.mock('@/hooks/usePremium', () => ({
  usePremium: () => ({
    isPremium: mockIsPremium,
    upgradeRequest: mockUpgradeRequest,
    showUpgrade: mockShowUpgrade,
    dismissUpgrade: mockDismissUpgrade,
  }),
}));

// ── Mock data hook ──────────────────────────────────────────────
const SAMPLE_ENTRIES: ExtrabiblicalSummary[] = [
  {
    id: '1_enoch',
    title: '1 Enoch (Ethiopic Enoch)',
    category: 'pseudepigrapha',
    brief_summary:
      '1 Enoch is a composite work of five distinct books. It is preserved complete only in Ethiopic Geʽez.',
    also_known_as: ['Book of Enoch', 'Ethiopic Enoch'],
    tradition_status: {
      protestant: 'not canonical',
      catholic: 'not canonical',
      eastern_orthodox: 'not canonical',
      ethiopian_tewahedo: 'canonical (included in the 81-book canon)',
    },
  },
  {
    id: 'tobit',
    title: 'Tobit',
    category: 'deuterocanon',
    brief_summary:
      'Tobit is a deuterocanonical short narrative composed in Aramaic or Hebrew in the 3rd or 2nd century BC.',
    also_known_as: [],
    tradition_status: {
      protestant: 'apocryphal / not canonical',
      catholic: 'canonical deuterocanon',
      eastern_orthodox: 'canonical (anagignoskomena)',
      ethiopian_tewahedo: 'canonical',
    },
  },
];

let mockCategoryFilter: string = 'all';
const mockSetCategoryFilter = jest.fn((c: string) => {
  mockCategoryFilter = c;
});
let mockSearch = '';
const mockSetSearch = jest.fn((s: string) => {
  mockSearch = s;
});
let mockEntries: ExtrabiblicalSummary[] = SAMPLE_ENTRIES;

jest.mock('@/hooks/useExtraBiblical', () => ({
  useExtraBiblical: () => ({
    entries: mockEntries,
    loading: false,
    search: mockSearch,
    setSearch: mockSetSearch,
    categoryFilter: mockCategoryFilter,
    setCategoryFilter: mockSetCategoryFilter,
    categories: ['deuterocanon', 'pseudepigrapha'],
  }),
  EXTRABIBLICAL_CATEGORY_LABELS: {
    apocrypha: 'Apocrypha',
    pseudepigrapha: 'Pseudepigrapha',
    dss: 'Dead Sea Scrolls',
    deuterocanon: 'Deuterocanon',
  },
}));

beforeEach(() => {
  jest.clearAllMocks();
  mockIsPremium = true;
  mockUpgradeRequest = null;
  mockCategoryFilter = 'all';
  mockSearch = '';
  mockEntries = SAMPLE_ENTRIES;
});

describe('ExtraBiblicalIndexScreen', () => {
  it('renders the Extra-Biblical Literature title', () => {
    const { getByText } = renderWithProviders(<ExtraBiblicalIndexScreen />);
    expect(getByText('Extra-Biblical Literature')).toBeTruthy();
  });

  it('renders each entry title and first-sentence descriptor', () => {
    const { getByText } = renderWithProviders(<ExtraBiblicalIndexScreen />);
    expect(getByText('1 Enoch (Ethiopic Enoch)')).toBeTruthy();
    expect(getByText('Tobit')).toBeTruthy();
    expect(
      getByText(/1 Enoch is a composite work of five distinct books/),
    ).toBeTruthy();
  });

  it('renders tradition badges (Prot / Cath / EO / Eth) on each card', () => {
    const { getAllByLabelText } = renderWithProviders(<ExtraBiblicalIndexScreen />);
    // Each card has all 4 badges, each entry → 4 badges
    expect(getAllByLabelText(/^Protestant:/)).toHaveLength(2);
    expect(getAllByLabelText(/^Catholic:/)).toHaveLength(2);
    expect(getAllByLabelText(/^Eastern Orthodox:/)).toHaveLength(2);
    expect(getAllByLabelText(/^Ethiopian Tewahedo:/)).toHaveLength(2);
  });

  it('renders the "All" + present-category filter chips', () => {
    const { getByText } = renderWithProviders(<ExtraBiblicalIndexScreen />);
    expect(getByText('All')).toBeTruthy();
    expect(getByText('Deuterocanon')).toBeTruthy();
    expect(getByText('Pseudepigrapha')).toBeTruthy();
  });

  it('tapping "Deuterocanon" filter calls setCategoryFilter', () => {
    const { getByText } = renderWithProviders(<ExtraBiblicalIndexScreen />);
    fireEvent.press(getByText('Deuterocanon'));
    expect(mockSetCategoryFilter).toHaveBeenCalledWith('deuterocanon');
  });

  it('premium user tapping an entry navigates to ExtraBiblicalDetail with id', () => {
    mockIsPremium = true;
    const { getByLabelText } = renderWithProviders(<ExtraBiblicalIndexScreen />);
    fireEvent.press(getByLabelText('Open 1 Enoch (Ethiopic Enoch)'));
    expect(mockNavigate).toHaveBeenCalledWith('ExtraBiblicalDetail', {
      id: '1_enoch',
    });
    expect(mockShowUpgrade).not.toHaveBeenCalled();
  });

  it('free user tapping an entry fires showUpgrade, not navigation', () => {
    mockIsPremium = false;
    const { getByLabelText } = renderWithProviders(<ExtraBiblicalIndexScreen />);
    fireEvent.press(getByLabelText('Open Tobit'));
    expect(mockShowUpgrade).toHaveBeenCalledWith(
      'explore',
      'Extra-Biblical Literature',
    );
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('renders empty state when hook returns no entries', () => {
    mockEntries = [];
    const { getByText } = renderWithProviders(<ExtraBiblicalIndexScreen />);
    expect(getByText(/No entries match/)).toBeTruthy();
  });
});
