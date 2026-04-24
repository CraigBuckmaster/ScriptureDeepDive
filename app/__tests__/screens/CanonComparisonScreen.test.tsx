/**
 * CanonComparisonScreen.test.tsx — 4-column canon comparison with
 * portrait/landscape layouts and premium gating (HWGTB-P3-01 / #1550).
 */

import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { renderWithProviders } from '../helpers/renderWithProviders';
import CanonComparisonScreen from '@/screens/CanonComparisonScreen';
import type { CanonTradition } from '@/types';

// ── Navigation mock ─────────────────────────────────────────────
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
    useRoute: () => ({ params: {} }),
    useScrollToTop: jest.fn(),
    useFocusEffect: (cb: () => void) => cb(),
  };
});

jest.mock('lucide-react-native', () => ({
  ChevronLeft: () => null,
  ChevronDown: () => null,
  ChevronRight: () => null,
}));

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children }: any) => children,
  useSafeAreaInsets: () => ({ top: 44, bottom: 34, left: 0, right: 0 }),
}));

// ── useWindowDimensions mock — mutable so tests can flip orientation
let mockDimensions = { width: 400, height: 800 }; // portrait default
jest.mock('react-native/Libraries/Utilities/useWindowDimensions', () => ({
  __esModule: true,
  default: () => mockDimensions,
}));

// ── Premium mock ───────────────────────────────────────────────
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

// ── Books query — returns fake biblical book IDs ─────────────────
jest.mock('@/db/content', () => ({
  getBooks: jest.fn().mockResolvedValue([
    { id: 'genesis' },
    { id: 'exodus' },
    { id: 'jude' },
    { id: 'matthew' },
  ]),
}));

// ── Canon traditions hook ──────────────────────────────────────
const FIXTURE: CanonTradition[] = [
  {
    id: 'protestant',
    label: 'Protestant',
    book_count: 4,
    short_description: '66 Protestant books',
    canon_list: [
      { section: 'Old Testament', books: ['genesis', 'exodus'] },
      { section: 'New Testament', books: ['matthew', 'jude'] },
    ],
    distinctives: [{ title: 'Hebrew OT', detail: 'Follows the Hebrew canon.' }],
    formation_events: [
      {
        year: 367,
        label: "Athanasius' 39th Festal Letter",
        detail: 'First 27-book NT list.',
      },
      {
        year: 1534,
        label: "Luther's German Bible",
        detail: 'Apocrypha printed separately.',
      },
    ],
    sort_order: 1,
  },
  {
    id: 'catholic',
    label: 'Roman Catholic',
    book_count: 5,
    short_description: '73 Catholic books',
    canon_list: [
      { section: 'Old Testament', books: ['genesis', 'exodus', 'tobit'] },
      { section: 'New Testament', books: ['matthew', 'jude'] },
    ],
    distinctives: [
      { title: 'LXX-based OT', detail: 'Includes deuterocanon.' },
    ],
    formation_events: [
      { year: 1546, label: 'Trent Session IV', detail: 'Catholic canon dogma.' },
    ],
    sort_order: 2,
  },
  {
    id: 'eastern_orthodox',
    label: 'Eastern Orthodox',
    book_count: 5,
    short_description: '~76 Orthodox books',
    canon_list: [
      {
        section: 'Old Testament',
        books: ['genesis', 'exodus', 'tobit', '3_maccabees'],
      },
      { section: 'New Testament', books: ['matthew'] },
    ],
    distinctives: [{ title: 'Anagignoskomena', detail: 'Broader LXX scope.' }],
    formation_events: [
      { year: 1672, label: 'Synod of Jerusalem', detail: 'Confession of Dositheos.' },
    ],
    sort_order: 3,
  },
  {
    id: 'ethiopian_tewahedo',
    label: 'Ethiopian Tewahedo',
    book_count: 6,
    short_description: '81 Ethiopian books',
    canon_list: [
      {
        section: 'Old Testament',
        books: ['genesis', 'exodus', 'tobit', '1_enoch', 'jubilees'],
      },
      { section: 'New Testament', books: ['matthew'] },
    ],
    distinctives: [{ title: '1 Enoch canonical', detail: '81-book narrower canon.' }],
    formation_events: [
      {
        year: 1961,
        label: 'Haile Selassie Amharic Bible',
        detail: 'Formalizes the 81-book canon.',
      },
    ],
    sort_order: 4,
  },
];

jest.mock('@/hooks/useCanonTraditions', () => ({
  useCanonTraditions: () => {
    const { traditions: fixture } = require('../screens/CanonComparisonScreen.fixtures');
    // genesis, exodus, matthew appear in all 4 → common
    // jude appears in 2 → badged
    // tobit appears in 3 → badged
    // 1_enoch, jubilees, 3_maccabees unique → badged
    const membership = new Map<string, Set<string>>();
    for (const t of fixture) {
      for (const s of t.canon_list) {
        for (const b of s.books) {
          if (!membership.has(b)) membership.set(b, new Set());
          membership.get(b)!.add(t.id);
        }
      }
    }
    const common = new Set<string>();
    for (const [id, trs] of membership.entries()) {
      if (trs.size === fixture.length) common.add(id);
    }
    return {
      traditions: fixture,
      loading: false,
      commonBookIds: common,
      bookMembership: membership,
    };
  },
}));

// Export fixture for the hook mock to require (avoids hoisting issues)
jest.mock('../screens/CanonComparisonScreen.fixtures', () => ({ traditions: FIXTURE }), {
  virtual: true,
});

beforeEach(() => {
  jest.clearAllMocks();
  mockIsPremium = true;
  mockUpgradeRequest = null;
  mockDimensions = { width: 400, height: 800 };
});

describe('CanonComparisonScreen', () => {
  describe('portrait layout (width <= height)', () => {
    beforeEach(() => {
      mockDimensions = { width: 400, height: 800 };
    });

    it('renders all 4 tradition tabs', () => {
      const { getAllByText, getByText } = renderWithProviders(<CanonComparisonScreen />);
      // 'Protestant' appears twice (tab + column header) when it's the active tab
      expect(getAllByText('Protestant').length).toBeGreaterThanOrEqual(1);
      expect(getByText('Roman Catholic')).toBeTruthy();
      expect(getByText('Ethiopian Tewahedo')).toBeTruthy();
    });

    it('renders the active column (Protestant by default)', () => {
      const { getByText } = renderWithProviders(<CanonComparisonScreen />);
      expect(getByText('4 books')).toBeTruthy();
    });

    it('tapping a tradition tab switches the visible column', () => {
      const { getByText, getAllByText } = renderWithProviders(
        <CanonComparisonScreen />,
      );
      fireEvent.press(getByText('Roman Catholic'));
      // Catholic book_count = 5, Protestant = 4, so "5 books" should now render
      expect(getAllByText('5 books').length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('landscape layout (width > height)', () => {
    beforeEach(() => {
      mockDimensions = { width: 1200, height: 800 };
    });

    it('renders all 4 columns simultaneously (no tabs)', () => {
      const { getAllByText, getByText } = renderWithProviders(<CanonComparisonScreen />);
      expect(getByText('Protestant')).toBeTruthy();
      expect(getByText('Roman Catholic')).toBeTruthy();
      expect(getByText('Eastern Orthodox')).toBeTruthy();
      expect(getByText('Ethiopian Tewahedo')).toBeTruthy();
      // 4 book-count labels
      expect(getAllByText(/books$/).length).toBeGreaterThanOrEqual(4);
    });
  });

  describe('book-diff highlighting', () => {
    beforeEach(() => {
      mockDimensions = { width: 1200, height: 800 }; // landscape for full visibility
    });

    it('renders the "How did this happen?" header CTA', () => {
      const { getByLabelText } = renderWithProviders(<CanonComparisonScreen />);
      expect(getByLabelText('How did this happen?')).toBeTruthy();
    });

    it('tapping "How did this happen?" navigates to JourneyDetail canon-formation', () => {
      const { getByLabelText } = renderWithProviders(<CanonComparisonScreen />);
      fireEvent.press(getByLabelText('How did this happen?'));
      expect(mockNavigate).toHaveBeenCalledWith('JourneyDetail', {
        journeyId: 'canon-formation',
      });
    });
  });

  describe('premium gating', () => {
    beforeEach(() => {
      mockDimensions = { width: 400, height: 800 };
    });

    it('free user sees 🔒 on Orthodox + Ethiopian tabs', () => {
      mockIsPremium = false;
      const { getByText } = renderWithProviders(<CanonComparisonScreen />);
      expect(getByText('Eastern Orthodox 🔒')).toBeTruthy();
      expect(getByText('Ethiopian Tewahedo 🔒')).toBeTruthy();
    });

    it('free user selecting Orthodox sees the unlock CTA', () => {
      mockIsPremium = false;
      const { getByText, getByLabelText } = renderWithProviders(
        <CanonComparisonScreen />,
      );
      fireEvent.press(getByText('Eastern Orthodox 🔒'));
      expect(getByLabelText('Unlock canon comparison')).toBeTruthy();
    });

    it('free user tap on Orthodox unlock CTA fires showUpgrade', () => {
      mockIsPremium = false;
      const { getByText, getByLabelText } = renderWithProviders(
        <CanonComparisonScreen />,
      );
      fireEvent.press(getByText('Eastern Orthodox 🔒'));
      fireEvent.press(getByLabelText('Unlock canon comparison'));
      expect(mockShowUpgrade).toHaveBeenCalledWith('feature', 'Canon Comparison');
    });

    it('premium user does NOT see 🔒 on Orthodox / Ethiopian tabs', () => {
      mockIsPremium = true;
      const { queryByText, getByText } = renderWithProviders(
        <CanonComparisonScreen />,
      );
      expect(queryByText('Eastern Orthodox 🔒')).toBeNull();
      expect(queryByText('Ethiopian Tewahedo 🔒')).toBeNull();
      expect(getByText('Eastern Orthodox')).toBeTruthy();
      expect(getByText('Ethiopian Tewahedo')).toBeTruthy();
    });
  });

  describe('formation timeline footer', () => {
    beforeEach(() => {
      mockDimensions = { width: 1200, height: 800 };
    });

    it('renders the formation timeline header with event count', () => {
      const { getByText } = renderWithProviders(<CanonComparisonScreen />);
      expect(
        getByText(/Formation timeline — 5 events across the four traditions/),
      ).toBeTruthy();
    });

    it('expanding the timeline shows merged events sorted by year', () => {
      const { getByLabelText, getByText } = renderWithProviders(
        <CanonComparisonScreen />,
      );
      fireEvent.press(getByLabelText('Expand formation timeline'));
      // 367 AD (Athanasius) should be the first event shown
      expect(getByText('367 AD')).toBeTruthy();
      expect(getByText("Athanasius' 39th Festal Letter")).toBeTruthy();
    });
  });
});
