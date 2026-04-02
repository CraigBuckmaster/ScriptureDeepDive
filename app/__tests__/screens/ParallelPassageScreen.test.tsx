import React from 'react';
import { fireEvent, waitFor } from '@testing-library/react-native';
import { renderWithProviders } from '../helpers/renderWithProviders';
import ParallelPassageScreen from '@/screens/ParallelPassageScreen';

// ── Override navigation ─────────────────────────────────────────
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

// ── Mock child components ────────────────────────────────────────
jest.mock('@/components/ScreenHeader', () => ({
  ScreenHeader: ({ title }: { title: string }) => {
    const React = require('react');
    const { Text } = require('react-native');
    return React.createElement(Text, {}, title);
  },
}));

jest.mock('@/components/SearchInput', () => ({
  SearchInput: () => null,
}));

jest.mock('@/components/LoadingSkeleton', () => ({
  LoadingSkeleton: () => {
    const React = require('react');
    const { Text } = require('react-native');
    return React.createElement(Text, {}, 'Loading...');
  },
}));

jest.mock('@/components/GospelDots', () => ({
  GospelDots: () => null,
  GOSPEL_CONFIG: {},
}));

// ── Mock stores ─────────────────────────────────────────────────
jest.mock('@/stores', () => ({
  useSettingsStore: (sel: any) => sel({ translation: 'kjv', fontSize: 16 }),
}));

// ── Mock db/content ─────────────────────────────────────────────
const mockOTEntries = [
  {
    id: 'chr-census',
    title: "David's Census",
    category: 'ot-parallel',
    period: 'ot',
    sort_order: 1060,
    passages_json: JSON.stringify([
      { book: '2_samuel', ref: '2 Sam 24' },
      { book: '1_chronicles', ref: '1 Chr 21' },
    ]),
    diff_annotations_json: '[]',
  },
  {
    id: 'solomons-temple',
    title: 'Solomon Builds the Temple',
    category: 'ot-parallel',
    period: 'ot',
    sort_order: 1070,
    passages_json: JSON.stringify([
      { book: '1_kings', ref: '1 Kgs 6:1-38' },
    ]),
    diff_annotations_json: '[]',
  },
];

jest.mock('@/db/content', () => ({
  getOTParallelEntries: jest.fn(() => Promise.resolve(mockOTEntries)),
}));

jest.mock('@/utils/logger', () => ({
  logger: { warn: jest.fn() },
}));

beforeEach(() => {
  jest.clearAllMocks();
});

describe('ParallelPassageScreen', () => {
  it('renders without crashing', async () => {
    const { getByText } = renderWithProviders(<ParallelPassageScreen />);
    await waitFor(() => {
      expect(getByText('OT Parallels')).toBeTruthy();
    });
  });

  it('shows loading skeleton initially', () => {
    const { getByText } = renderWithProviders(<ParallelPassageScreen />);
    expect(getByText('Loading...')).toBeTruthy();
  });

  it('renders OT entry titles after loading', async () => {
    const { getByText } = renderWithProviders(<ParallelPassageScreen />);
    await waitFor(() => {
      expect(getByText("David's Census")).toBeTruthy();
      expect(getByText('Solomon Builds the Temple')).toBeTruthy();
    });
  });

  it('renders period section headers', async () => {
    const { getByText } = renderWithProviders(<ParallelPassageScreen />);
    await waitFor(() => {
      expect(getByText('Old Testament Parallels')).toBeTruthy();
    });
  });

  it('navigates to detail screen on entry press', async () => {
    const { getByText } = renderWithProviders(<ParallelPassageScreen />);
    await waitFor(() => expect(getByText("David's Census")).toBeTruthy());

    fireEvent.press(getByText("David's Census"));
    expect(mockNavigate).toHaveBeenCalledWith('ParallelDetail', { entryId: 'chr-census' });
  });
});
