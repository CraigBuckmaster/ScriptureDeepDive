import React from 'react';
import { waitFor } from '@testing-library/react-native';
import { renderWithProviders } from '../helpers/renderWithProviders';
import HarmonyDetailScreen from '@/screens/HarmonyDetailScreen';

const mockGoBack = jest.fn();
const mockPush = jest.fn();
jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');
  return {
    ...actual,
    useNavigation: () => ({
      goBack: mockGoBack, push: mockPush,
      navigate: jest.fn(), setOptions: jest.fn(),
    }),
    useRoute: () => ({ params: { entryId: 'baptism' } }),
    useFocusEffect: (cb: () => void) => cb(),
  };
});

jest.mock('@/components/ScreenHeader', () => ({
  ScreenHeader: ({ title }: { title: string }) => {
    const React = require('react');
    const { Text } = require('react-native');
    return React.createElement(Text, {}, title);
  },
}));

jest.mock('@/components/LoadingSkeleton', () => ({ LoadingSkeleton: () => null }));
jest.mock('@/components/DiffAnnotation', () => ({
  DiffAnnotationList: () => null,
  normalizeDiffAnnotation: (x: any) => x,
}));

jest.mock('@/db/content', () => ({
  getHarmonyEntry: jest.fn(() => Promise.resolve({
    id: 'baptism', title: 'The Baptism of Jesus', category: 'gospel',
    period: 'early_ministry', sort_order: 20,
    passages_json: JSON.stringify([
      { book: 'matthew', ref: 'Matt 3:13-17' },
      { book: 'mark', ref: 'Mark 1:9-11' },
    ]),
    diff_annotations_json: '[]',
  })),
}));

jest.mock('@/utils/verseResolver', () => ({
  resolveVersesWithNumbers: jest.fn(() => Promise.resolve([{ verseNum: 13, text: 'Then Jesus came from Galilee.' }])),
  parseReference: jest.fn((ref: string) => ({ bookId: 'matthew', chapter: 3, verse: 13 })),
}));

jest.mock('@/stores', () => ({
  useSettingsStore: (sel: any) => sel({ translation: 'kjv', fontSize: 16 }),
}));
jest.mock('@/utils/logger', () => ({ logger: { warn: jest.fn() } }));

beforeEach(() => jest.clearAllMocks());

describe('HarmonyDetailScreen', () => {
  it('renders the entry title', async () => {
    const { getByText } = renderWithProviders(<HarmonyDetailScreen />);
    await waitFor(() => expect(getByText('The Baptism of Jesus')).toBeTruthy());
  });

  it('shows Gospel passage cards with names', async () => {
    const { getByText } = renderWithProviders(<HarmonyDetailScreen />);
    await waitFor(() => {
      expect(getByText('MATTHEW')).toBeTruthy();
      expect(getByText('MARK')).toBeTruthy();
    });
  });

  it('shows verse references', async () => {
    const { getByText } = renderWithProviders(<HarmonyDetailScreen />);
    await waitFor(() => {
      expect(getByText('Matt 3:13-17')).toBeTruthy();
      expect(getByText('Mark 1:9-11')).toBeTruthy();
    });
  });

  it('does not show absent Gospels', async () => {
    const { queryByText } = renderWithProviders(<HarmonyDetailScreen />);
    await waitFor(() => {
      expect(queryByText('LUKE')).toBeNull();
      expect(queryByText('JOHN')).toBeNull();
    });
  });
});
