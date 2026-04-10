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
    // Initially shows "Parallel Passage" header while loading
    expect(getByText('Parallel Passage')).toBeTruthy();
  });

  it('renders entry title after loading', async () => {
    const { findByText } = renderWithProviders(<ParallelDetailScreen />);
    const title = await findByText('The Baptism of Jesus');
    expect(title).toBeTruthy();
  });
});
