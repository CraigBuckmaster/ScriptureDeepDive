import React from 'react';
import { fireEvent, waitFor } from '@testing-library/react-native';
import { renderWithProviders } from '../helpers/renderWithProviders';
import TopicBrowseScreen from '@/screens/TopicBrowseScreen';

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

const mockTopics = [
  { id: 'atonement', title: 'Atonement', category: 'theology',
    description: 'Reconciliation', tags_json: '[]',
    subtopics_json: '[{"label":"A","verses":[{"ref":"R","text":"T"}]}]',
    related_concept_ids_json: '["sacrifice-atonement"]',
    related_thread_ids_json: '[]', related_prophecy_ids_json: '[]',
    relevant_chapters_json: '[]' },
  { id: 'courage', title: 'Courage', category: 'character',
    description: 'Boldness', tags_json: '[]',
    subtopics_json: '[{"label":"A","verses":[{"ref":"R","text":"T"},{"ref":"R2","text":"T2"}]}]',
    related_concept_ids_json: '[]',
    related_thread_ids_json: '[]', related_prophecy_ids_json: '[]',
    relevant_chapters_json: '[]' },
];

jest.mock('@/db/content', () => ({
  getTopics: jest.fn(() => Promise.resolve(mockTopics)),
  searchTopics: jest.fn(() => Promise.resolve([])),
}));
jest.mock('@/utils/logger', () => ({ logger: { warn: jest.fn() } }));

beforeEach(() => jest.clearAllMocks());

describe('TopicBrowseScreen', () => {
  it('renders the screen title', async () => {
    const { getByText } = renderWithProviders(<TopicBrowseScreen />);
    await waitFor(() => expect(getByText('Topical Index')).toBeTruthy());
  });

  it('shows topic titles after loading', async () => {
    const { getByText } = renderWithProviders(<TopicBrowseScreen />);
    await waitFor(() => {
      expect(getByText('Atonement')).toBeTruthy();
      expect(getByText('Courage')).toBeTruthy();
    });
  });

  it('shows category section headers', async () => {
    const { getByText } = renderWithProviders(<TopicBrowseScreen />);
    await waitFor(() => {
      expect(getByText('THEOLOGY')).toBeTruthy();
      expect(getByText('CHARACTER & VIRTUE')).toBeTruthy();
    });
  });

  it('shows verse count metadata', async () => {
    const { getByText } = renderWithProviders(<TopicBrowseScreen />);
    await waitFor(() => {
      expect(getByText(/1 verse/)).toBeTruthy();
      expect(getByText(/2 verses/)).toBeTruthy();
    });
  });

  it('shows cross-link indicator for topics with concept links', async () => {
    const { getByText } = renderWithProviders(<TopicBrowseScreen />);
    await waitFor(() => expect(getByText(/Concept/)).toBeTruthy());
  });

  it('navigates to detail on row press', async () => {
    const { getByText } = renderWithProviders(<TopicBrowseScreen />);
    await waitFor(() => expect(getByText('Atonement')).toBeTruthy());
    fireEvent.press(getByText('Atonement'));
    expect(mockPush).toHaveBeenCalledWith('TopicDetail', { topicId: 'atonement' });
  });
});
