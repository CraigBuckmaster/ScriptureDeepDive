import React from 'react';
import { fireEvent, waitFor } from '@testing-library/react-native';
import { renderWithProviders } from '../helpers/renderWithProviders';
import CollectionDetailScreen from '@/screens/CollectionDetailScreen';

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
    useRoute: () => ({ params: { collectionId: 'col-1' } }),
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

jest.mock('lucide-react-native', () => ({
  ArrowLeft: () => null,
  Share: () => null,
  Trash2: () => null,
}));

// ── Mock db/user ────────────────────────────────────────────────
const sampleCollection = {
  id: 'col-1',
  name: 'Romans Study',
  description: 'Notes from studying the book of Romans.',
  color: '#e8a070',
};

const sampleNotes = [
  {
    id: 1,
    verse_ref: 'rom_8_28',
    note_text: 'All things work together for good.',
    tags_json: '["faith","sovereignty"]',
    updated_at: '2025-03-15T10:00:00Z',
  },
  {
    id: 2,
    verse_ref: 'rom_3_23',
    note_text: 'All have sinned and fall short.',
    tags_json: '["sin","gospel"]',
    updated_at: '2025-03-10T09:00:00Z',
  },
];

const mockGetCollection = jest.fn(() => Promise.resolve(sampleCollection));
const mockGetNotesInCollection = jest.fn(() => Promise.resolve(sampleNotes));
const mockDeleteCollection = jest.fn(() => Promise.resolve());
jest.mock('@/db/user', () => ({
  getCollection: (..._args: any[]) => mockGetCollection(),
  getNotesInCollection: (..._args: any[]) => mockGetNotesInCollection(),
  deleteCollection: (..._args: any[]) => mockDeleteCollection(),
  updateNoteTags: jest.fn(),
}));

jest.mock('@/utils/verseRef', () => ({
  displayRef: (ref: string) => ref.replace(/_/g, ' '),
  parseVerseRef: (ref: string) => ({ bookId: 'rom', ch: 8, vs: 28 }),
}));

beforeEach(() => {
  jest.clearAllMocks();
});

describe('CollectionDetailScreen', () => {
  it('renders without crashing', async () => {
    const { getByText } = renderWithProviders(<CollectionDetailScreen />);
    await waitFor(() => {
      expect(getByText('Romans Study')).toBeTruthy();
    });
  });

  it('shows "Collection not found" when collection is null', async () => {
    mockGetCollection.mockResolvedValueOnce(null as any);
    mockGetNotesInCollection.mockResolvedValueOnce([]);
    const { getByText } = renderWithProviders(<CollectionDetailScreen />);
    await waitFor(() => expect(getByText('Collection not found')).toBeTruthy());
  });

  it('displays collection description', async () => {
    const { getByText } = renderWithProviders(<CollectionDetailScreen />);
    await waitFor(() => {
      expect(getByText('Notes from studying the book of Romans.')).toBeTruthy();
    });
  });

  it('displays note count', async () => {
    const { getByText } = renderWithProviders(<CollectionDetailScreen />);
    await waitFor(() => {
      expect(getByText('2 notes')).toBeTruthy();
    });
  });

  it('renders note cards with text', async () => {
    const { getByText } = renderWithProviders(<CollectionDetailScreen />);
    await waitFor(() => {
      expect(getByText('All things work together for good.')).toBeTruthy();
      expect(getByText('All have sinned and fall short.')).toBeTruthy();
    });
  });

  it('renders tags on note cards', async () => {
    const { getByText } = renderWithProviders(<CollectionDetailScreen />);
    await waitFor(() => {
      expect(getByText('#faith')).toBeTruthy();
      expect(getByText('#sovereignty')).toBeTruthy();
      expect(getByText('#sin')).toBeTruthy();
      expect(getByText('#gospel')).toBeTruthy();
    });
  });

  it('navigates to chapter on note press', async () => {
    const { getByText } = renderWithProviders(<CollectionDetailScreen />);
    await waitFor(() => expect(getByText('All things work together for good.')).toBeTruthy());
    fireEvent.press(getByText('All things work together for good.'));
    expect(mockNavigate).toHaveBeenCalledWith('Chapter', { bookId: 'rom', chapterNum: 8 });
  });

  it('shows empty state when collection has no notes', async () => {
    mockGetNotesInCollection.mockResolvedValueOnce([]);
    const { getByText } = renderWithProviders(<CollectionDetailScreen />);
    await waitFor(() => {
      expect(getByText('No notes in this collection yet.')).toBeTruthy();
    });
  });
});
