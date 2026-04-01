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

jest.mock('@/components/DiffAnnotation', () => ({
  DiffAnnotationList: () => null,
}));

// ── Mock stores ─────────────────────────────────────────────────
jest.mock('@/stores', () => ({
  useSettingsStore: (sel: any) => sel({ translation: 'kjv', fontSize: 16 }),
}));

// ── Mock db/content ─────────────────────────────────────────────
const mockSampleEntries = [
  {
    id: 'syn-1',
    title: 'The Baptism of Jesus',
    category: 'gospel',
    passages_json: JSON.stringify([
      { book: 'Matthew', ref: '3:13-17' },
      { book: 'Mark', ref: '1:9-11' },
      { book: 'Luke', ref: '3:21-22' },
    ]),
    diff_annotations_json: '[]',
  },
  {
    id: 'syn-2',
    title: 'The Temptation',
    category: 'gospel',
    passages_json: JSON.stringify([
      { book: 'Matthew', ref: '4:1-11' },
      { book: 'Luke', ref: '4:1-13' },
    ]),
    diff_annotations_json: '[]',
  },
  {
    id: 'syn-3',
    title: 'The Good Samaritan',
    category: 'gospel-luke',
    passages_json: JSON.stringify([
      { book: 'Luke', ref: '10:25-37' },
    ]),
    diff_annotations_json: '[]',
  },
];

jest.mock('@/db/content', () => ({
  getSynopticEntries: jest.fn(() => Promise.resolve(mockSampleEntries)),
}));

jest.mock('@/utils/verseResolver', () => ({
  resolveVerseText: jest.fn(() => Promise.resolve(['Sample verse text.'])),
  parseReference: jest.fn((ref: string) => ({ book: ref, ch: 1, vs: 1 })),
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
      expect(getByText('Parallel Passages')).toBeTruthy();
    });
  });

  it('shows loading skeleton initially', () => {
    const { getByText } = renderWithProviders(<ParallelPassageScreen />);
    expect(getByText('Loading...')).toBeTruthy();
  });

  it('renders entry titles after loading', async () => {
    const { getByText } = renderWithProviders(<ParallelPassageScreen />);
    await waitFor(() => {
      expect(getByText('The Baptism of Jesus')).toBeTruthy();
      expect(getByText('The Temptation')).toBeTruthy();
      expect(getByText('The Good Samaritan')).toBeTruthy();
    });
  });

  it('displays passage references on entries', async () => {
    const { getByText } = renderWithProviders(<ParallelPassageScreen />);
    await waitFor(() => {
      expect(getByText('Matthew 3:13-17 · Mark 1:9-11 · Luke 3:21-22')).toBeTruthy();
    });
  });

  it('renders category filter tabs', async () => {
    const { getByText } = renderWithProviders(<ParallelPassageScreen />);
    await waitFor(() => {
      expect(getByText('All')).toBeTruthy();
      expect(getByText('Synoptic Gospels')).toBeTruthy();
      expect(getByText('Luke Special')).toBeTruthy();
    });
  });

  it('filters entries by category', async () => {
    const { getByText, queryByText } = renderWithProviders(<ParallelPassageScreen />);
    await waitFor(() => expect(getByText('The Baptism of Jesus')).toBeTruthy());

    fireEvent.press(getByText('Luke Special'));

    await waitFor(() => {
      expect(getByText('The Good Samaritan')).toBeTruthy();
      expect(queryByText('The Baptism of Jesus')).toBeNull();
      expect(queryByText('The Temptation')).toBeNull();
    });
  });
});
