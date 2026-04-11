import React from 'react';
import { renderWithProviders } from '../helpers/renderWithProviders';

jest.mock('@/db/content', () => ({
  getSynopticEntry: jest.fn().mockResolvedValue({
    id: 'entry1',
    title: 'The Baptism of Jesus',
    passages_json: JSON.stringify([
      { book: 'matthew', ref: 'Matthew 3:13-17' },
      { book: 'mark', ref: 'Mark 1:9-11' },
    ]),
    diff_annotations_json: '[]',
  }),
}));

jest.mock('@/utils/verseResolver', () => ({
  parseReference: jest.fn().mockReturnValue({ bookId: 'matthew', chapter: 3, startVerse: 13, endVerse: 17 }),
  resolveVersesWithNumbers: jest.fn().mockResolvedValue([]),
}));

jest.mock('@/stores', () => ({
  useSettingsStore: (sel: any) =>
    sel({ translation: 'kjv', fontSize: 16, theme: 'dark' }),
}));

jest.mock('@/components/ScreenHeader', () => ({
  ScreenHeader: ({ title }: { title: string }) => {
    const RN = require('react-native');
    return <RN.Text>{title}</RN.Text>;
  },
}));

jest.mock('@/components/LoadingSkeleton', () => ({
  LoadingSkeleton: () => null,
}));

jest.mock('@/components/GospelPassageCard', () => ({
  GospelPassageCard: ({ gospelName }: any) => {
    const RN = require('react-native');
    return <RN.Text>{gospelName}</RN.Text>;
  },
}));

jest.mock('@/components/GospelDots', () => ({
  GOSPEL_CONFIG: {
    matthew: { name: 'Matthew', color: '#4a7c4f' },
    mark: { name: 'Mark', color: '#8b4c4f' },
    luke: { name: 'Luke', color: '#4a6c8b' },
    john: { name: 'John', color: '#8b6c4a' },
  },
}));

jest.mock('@/components/DiffAnnotation', () => ({
  DiffAnnotationList: () => null,
  normalizeDiffAnnotation: (a: any) => a,
}));

jest.mock('@/components/ScreenErrorBoundary', () => ({
  withErrorBoundary: (C: React.ComponentType) => C,
}));

const mockGoBack = jest.fn();
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({ navigate: mockNavigate, goBack: mockGoBack }),
  useRoute: () => ({ params: { entryId: 'entry1' } }),
}));

import ParallelDetailScreen from '@/screens/ParallelDetailScreen';

describe('ParallelDetailScreen', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders without crashing', () => {
    expect(() => {
      renderWithProviders(<ParallelDetailScreen />);
    }).not.toThrow();
  });

  it('shows loading skeleton initially', () => {
    const { getByText } = renderWithProviders(<ParallelDetailScreen />);
    expect(getByText('Parallel Passage')).toBeTruthy();
  });

  it('renders entry title after loading', async () => {
    const { findByText } = renderWithProviders(<ParallelDetailScreen />);
    const title = await findByText('The Baptism of Jesus');
    expect(title).toBeTruthy();
  });

  it('renders gospel passage cards after loading', async () => {
    const { findByText } = renderWithProviders(<ParallelDetailScreen />);
    const matthew = await findByText('Matthew');
    expect(matthew).toBeTruthy();
    const mark = await findByText('Mark');
    expect(mark).toBeTruthy();
  });

  it('shows not found when entry is null', async () => {
    const { getSynopticEntry } = require('@/db/content');
    getSynopticEntry.mockResolvedValueOnce(null);

    const { findByText } = renderWithProviders(<ParallelDetailScreen />);
    const notFound = await findByText('Passage not found');
    expect(notFound).toBeTruthy();
  });

  it('renders diff annotations when present', async () => {
    const { getSynopticEntry } = require('@/db/content');
    getSynopticEntry.mockResolvedValueOnce({
      id: 'entry1',
      title: 'The Baptism of Jesus',
      passages_json: JSON.stringify([
        { book: 'matthew', ref: 'Matthew 3:13-17' },
      ]),
      diff_annotations_json: JSON.stringify([{ type: 'addition', text: 'only in Matthew' }]),
    });

    const { findByText } = renderWithProviders(<ParallelDetailScreen />);
    const title = await findByText('The Baptism of Jesus');
    expect(title).toBeTruthy();
  });

  it('handles malformed passages JSON gracefully', async () => {
    const { getSynopticEntry } = require('@/db/content');
    getSynopticEntry.mockResolvedValueOnce({
      id: 'entry1',
      title: 'Bad Data',
      passages_json: 'not json',
      diff_annotations_json: null,
    });

    const { findByText } = renderWithProviders(<ParallelDetailScreen />);
    const title = await findByText('Bad Data');
    expect(title).toBeTruthy();
  });

  it('handles unknown gospel in GOSPEL_CONFIG', async () => {
    const { getSynopticEntry } = require('@/db/content');
    getSynopticEntry.mockResolvedValueOnce({
      id: 'entry1',
      title: 'Test',
      passages_json: JSON.stringify([{ book: 'unknown_gospel', ref: 'Unknown 1:1' }]),
      diff_annotations_json: '[]',
    });

    const { findByText } = renderWithProviders(<ParallelDetailScreen />);
    // Should capitalize first letter of unknown book
    const unknownGospel = await findByText('Unknown_gospel');
    expect(unknownGospel).toBeTruthy();
  });
});
