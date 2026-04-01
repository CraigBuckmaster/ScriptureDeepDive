import React from 'react';
import { render } from '@testing-library/react-native';
import ContentLibraryScreen from '@/screens/ContentLibraryScreen';

// Mock the hook to control data
jest.mock('@/hooks/useContentLibrary', () => ({
  useContentLibrary: () => ({
    counts: { manuscripts: 10, discourse: 57 },
    entries: [
      {
        id: 1,
        category: 'discourse',
        title: 'Genesis 1 — Argument Flow',
        preview: 'The thesis...',
        book_id: 'genesis',
        book_name: 'Genesis',
        chapter_num: 1,
        section_num: null,
        panel_type: 'discourse',
        tab_key: null,
        testament: 'ot',
        sort_order: 1,
      },
    ],
    availableCategories: ['manuscripts', 'discourse'],
    activeCategory: 'discourse',
    setActiveCategory: jest.fn(),
    testament: undefined,
    setTestament: jest.fn(),
    searchQuery: '',
    setSearchQuery: jest.fn(),
    isLoading: false,
  }),
}));

describe('ContentLibraryScreen', () => {
  it('renders without crashing', () => {
    const { getByText } = render(<ContentLibraryScreen />);
    expect(getByText('Content Library')).toBeTruthy();
  });

  it('renders category tabs', () => {
    const { getByText } = render(<ContentLibraryScreen />);
    expect(getByText(/manuscripts/i)).toBeTruthy();
    expect(getByText(/discourse/i)).toBeTruthy();
  });

  it('renders entries', () => {
    const { getByText } = render(<ContentLibraryScreen />);
    expect(getByText('Genesis 1 — Argument Flow')).toBeTruthy();
  });
});
