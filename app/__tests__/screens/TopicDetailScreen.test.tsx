import React from 'react';
import { waitFor } from '@testing-library/react-native';
import { renderWithProviders } from '../helpers/renderWithProviders';
import TopicDetailScreen from '@/screens/TopicDetailScreen';

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
    useRoute: () => ({ params: { topicId: 'forgiveness' } }),
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

jest.mock('@/db/content', () => ({
  getTopic: jest.fn(() => Promise.resolve({
    id: 'forgiveness', title: 'Forgiveness', category: 'living',
    description: 'Release of offense and restoration of relationship.',
    tags_json: '["forgiveness"]',
    subtopics_json: JSON.stringify([
      { label: "God's Forgiveness", verses: [
        { ref: 'Psalm 103:12', text: 'As far as the east is from the west...' },
      ]},
      { label: 'Forgiving Others', verses: [
        { ref: 'Matthew 6:14', text: 'For if you forgive other people...' },
      ]},
    ]),
    related_concept_ids_json: '["mercy-grace"]',
    related_thread_ids_json: '[]',
    related_prophecy_ids_json: '[]',
    relevant_chapters_json: '[]',
  })),
  getConcept: jest.fn(() => Promise.resolve({ id: 'mercy-grace', name: 'Mercy & Grace' })),
  getCrossRefThread: jest.fn(() => Promise.resolve(null)),
  getProphecyChain: jest.fn(() => Promise.resolve(null)),
}));

jest.mock('@/utils/verseResolver', () => ({
  parseReference: jest.fn(() => ({ bookId: 'psalms', chapter: 103, verse: 12 })),
}));
jest.mock('@/utils/logger', () => ({ logger: { warn: jest.fn() } }));

beforeEach(() => jest.clearAllMocks());

describe('TopicDetailScreen', () => {
  it('renders the topic title', async () => {
    const { getByText } = renderWithProviders(<TopicDetailScreen />);
    await waitFor(() => expect(getByText('Forgiveness')).toBeTruthy());
  });

  it('shows the description', async () => {
    const { getByText } = renderWithProviders(<TopicDetailScreen />);
    await waitFor(() => expect(getByText(/Release of offense/)).toBeTruthy());
  });

  it('shows subtopic labels', async () => {
    const { getByText } = renderWithProviders(<TopicDetailScreen />);
    await waitFor(() => {
      expect(getByText("God's Forgiveness")).toBeTruthy();
      expect(getByText('Forgiving Others')).toBeTruthy();
    });
  });

  it('shows verse references in chains', async () => {
    const { getByText } = renderWithProviders(<TopicDetailScreen />);
    await waitFor(() => {
      expect(getByText('Psalm 103:12')).toBeTruthy();
      expect(getByText('Matthew 6:14')).toBeTruthy();
    });
  });

  it('shows cross-link banner for related concepts', async () => {
    const { getByText } = renderWithProviders(<TopicDetailScreen />);
    await waitFor(() => expect(getByText(/Mercy & Grace/)).toBeTruthy());
  });
});
