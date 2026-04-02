import React from 'react';
import { fireEvent, waitFor } from '@testing-library/react-native';
import { renderWithProviders } from '../helpers/renderWithProviders';
import HarmonyBrowseScreen from '@/screens/HarmonyBrowseScreen';

const mockPush = jest.fn();
const mockGoBack = jest.fn();
jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');
  return {
    ...actual,
    useNavigation: () => ({
      push: mockPush, goBack: mockGoBack,
      navigate: jest.fn(), setOptions: jest.fn(),
    }),
    useRoute: () => ({ params: {} }),
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

jest.mock('@/components/SearchInput', () => ({ SearchInput: () => null }));
jest.mock('@/components/LoadingSkeleton', () => ({ LoadingSkeleton: () => null }));

const mockEntries = [
  {
    id: 'birth-of-jesus', title: 'The Birth of Jesus', category: 'gospel',
    period: 'birth', sort_order: 10,
    passages_json: JSON.stringify([
      { book: 'matthew', ref: 'Matt 1:18-25' },
      { book: 'luke', ref: 'Luke 2:1-7' },
    ]),
    diff_annotations_json: '[]',
  },
  {
    id: 'baptism', title: 'The Baptism of Jesus', category: 'gospel',
    period: 'early_ministry', sort_order: 20,
    passages_json: JSON.stringify([
      { book: 'matthew', ref: 'Matt 3:13-17' },
      { book: 'mark', ref: 'Mark 1:9-11' },
      { book: 'luke', ref: 'Luke 3:21-22' },
      { book: 'john', ref: 'John 1:29-34' },
    ]),
    diff_annotations_json: JSON.stringify([
      { location: 'Matt/Luke', diff_type: 'wording',
        texts: { matthew: 'A', luke: 'B' }, explanation: 'Explanation' },
    ]),
  },
];

jest.mock('@/db/content', () => ({
  getHarmonyEntries: jest.fn(() => Promise.resolve(mockEntries)),
}));
jest.mock('@/utils/logger', () => ({ logger: { warn: jest.fn() } }));

beforeEach(() => jest.clearAllMocks());

describe('HarmonyBrowseScreen', () => {
  it('renders the screen title', async () => {
    const { getByText } = renderWithProviders(<HarmonyBrowseScreen />);
    await waitFor(() => expect(getByText('Harmony of the Gospels')).toBeTruthy());
  });

  it('shows entry titles after loading', async () => {
    const { getByText } = renderWithProviders(<HarmonyBrowseScreen />);
    await waitFor(() => {
      expect(getByText('The Birth of Jesus')).toBeTruthy();
      expect(getByText('The Baptism of Jesus')).toBeTruthy();
    });
  });

  it('shows period section headers', async () => {
    const { getByText } = renderWithProviders(<HarmonyBrowseScreen />);
    await waitFor(() => {
      expect(getByText('BIRTH & INFANCY')).toBeTruthy();
      expect(getByText('EARLY MINISTRY')).toBeTruthy();
    });
  });

  it('shows GospelDots with short labels', async () => {
    const { getAllByText } = renderWithProviders(<HarmonyBrowseScreen />);
    await waitFor(() => expect(getAllByText('Mk').length).toBeGreaterThan(0));
  });

  it('navigates to detail on row press', async () => {
    const { getByText } = renderWithProviders(<HarmonyBrowseScreen />);
    await waitFor(() => expect(getByText('The Baptism of Jesus')).toBeTruthy());
    fireEvent.press(getByText('The Baptism of Jesus'));
    expect(mockPush).toHaveBeenCalledWith('HarmonyDetail', { entryId: 'baptism' });
  });
});
