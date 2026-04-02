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
const mockSampleEntries = [
  {
    id: 'syn-1',
    title: 'The Baptism of Jesus',
    category: 'gospel',
    period: 'early_ministry',
    passages_json: JSON.stringify([
      { book: 'matthew', ref: 'Matt 3:13-17' },
      { book: 'mark', ref: 'Mark 1:9-11' },
      { book: 'luke', ref: 'Luke 3:21-22' },
    ]),
    diff_annotations_json: '[]',
  },
  {
    id: 'syn-2',
    title: 'The Temptation',
    category: 'gospel',
    period: 'early_ministry',
    passages_json: JSON.stringify([
      { book: 'matthew', ref: 'Matt 4:1-11' },
      { book: 'luke', ref: 'Luke 4:1-13' },
    ]),
    diff_annotations_json: '[]',
  },
  {
    id: 'syn-3',
    title: 'The Good Samaritan',
    category: 'gospel-luke',
    period: 'later_judean',
    passages_json: JSON.stringify([
      { book: 'luke', ref: 'Luke 10:25-37' },
    ]),
    diff_annotations_json: '[]',
  },
];

jest.mock('@/db/content', () => ({
  getSynopticEntries: jest.fn(() => Promise.resolve(mockSampleEntries)),
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

  it('renders period section headers', async () => {
    const { getByText } = renderWithProviders(<ParallelPassageScreen />);
    await waitFor(() => {
      expect(getByText('John the Baptist & Early Ministry')).toBeTruthy();
      expect(getByText('Later Judean Ministry')).toBeTruthy();
    });
  });

  it('renders category filter pills', async () => {
    const { getByText } = renderWithProviders(<ParallelPassageScreen />);
    await waitFor(() => {
      expect(getByText('All')).toBeTruthy();
      expect(getByText('Gospels')).toBeTruthy();
      expect(getByText('Luke')).toBeTruthy();
    });
  });

  it('filters entries by category', async () => {
    const { getByText, queryByText } = renderWithProviders(<ParallelPassageScreen />);
    await waitFor(() => expect(getByText('The Baptism of Jesus')).toBeTruthy());

    fireEvent.press(getByText('Luke'));

    await waitFor(() => {
      expect(getByText('The Good Samaritan')).toBeTruthy();
      expect(queryByText('The Baptism of Jesus')).toBeNull();
      expect(queryByText('The Temptation')).toBeNull();
    });
  });

  it('navigates to detail screen on entry press', async () => {
    const { getByText } = renderWithProviders(<ParallelPassageScreen />);
    await waitFor(() => expect(getByText('The Baptism of Jesus')).toBeTruthy());

    fireEvent.press(getByText('The Baptism of Jesus'));
    expect(mockNavigate).toHaveBeenCalledWith('ParallelDetail', { entryId: 'syn-1' });
  });
});
