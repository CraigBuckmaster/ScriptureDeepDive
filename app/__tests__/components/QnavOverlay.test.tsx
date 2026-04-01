/**
 * QnavOverlay.test.tsx — Tests for the quick navigation bottom-sheet overlay.
 */

import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { renderWithProviders } from '../helpers/renderWithProviders';
import { QnavOverlay } from '@/components/QnavOverlay';

// Mock useBooks hook
jest.mock('@/hooks/useBooks', () => ({
  useBooks: () => ({
    books: [
      { id: 'gen', name: 'Genesis', testament: 'ot', total_chapters: 50, book_order: 1, is_live: true, chaptersRead: 5 },
      { id: 'exo', name: 'Exodus', testament: 'ot', total_chapters: 40, book_order: 2, is_live: true, chaptersRead: 0 },
      { id: 'mat', name: 'Matthew', testament: 'nt', total_chapters: 28, book_order: 40, is_live: true, chaptersRead: 3 },
      { id: 'rom', name: 'Romans', testament: 'nt', total_chapters: 16, book_order: 45, is_live: false, chaptersRead: 0 },
    ],
    liveBooks: [],
    isLoading: false,
  }),
}));

// Add BottomSheetFlatList to the existing bottom-sheet mock
jest.mock('@gorhom/bottom-sheet', () => {
  const React = require('react');
  return {
    __esModule: true,
    default: React.forwardRef(({ children }: any, ref: any) => {
      React.useImperativeHandle(ref, () => ({
        snapToIndex: jest.fn(),
        close: jest.fn(),
        expand: jest.fn(),
      }));
      return React.createElement('BottomSheet', null, children);
    }),
    BottomSheetFlatList: ({ data, renderItem, keyExtractor }: any) => {
      return React.createElement(
        'BottomSheetFlatList',
        null,
        data?.map((item: any, index: number) =>
          React.createElement(
            React.Fragment,
            { key: keyExtractor?.(item) ?? index },
            renderItem({ item, index }),
          ),
        ),
      );
    },
    BottomSheetView: ({ children }: any) => React.createElement('BottomSheetView', null, children),
    BottomSheetScrollView: ({ children }: any) => React.createElement('BottomSheetScrollView', null, children),
    BottomSheetBackdrop: () => null,
  };
});

const baseProps = {
  visible: true,
  currentBookId: 'gen',
  currentChapter: 1,
  onClose: jest.fn(),
  onSelectChapter: jest.fn(),
};

describe('QnavOverlay', () => {
  it('returns null when not visible', () => {
    const { toJSON } = renderWithProviders(
      <QnavOverlay {...baseProps} visible={false} />,
    );
    expect(toJSON()).toBeNull();
  });

  it('renders search input when visible', () => {
    const { getByPlaceholderText } = renderWithProviders(
      <QnavOverlay {...baseProps} />,
    );
    expect(getByPlaceholderText('Search books...')).toBeTruthy();
  });

  it('renders OT/NT toggle', () => {
    const { getByText } = renderWithProviders(
      <QnavOverlay {...baseProps} />,
    );
    expect(getByText('Old Testament')).toBeTruthy();
    expect(getByText('New Testament')).toBeTruthy();
  });

  it('renders OT book list by default', () => {
    const { getByText, queryByText } = renderWithProviders(
      <QnavOverlay {...baseProps} />,
    );
    expect(getByText('Genesis')).toBeTruthy();
    expect(getByText('Exodus')).toBeTruthy();
    // NT book should not appear when OT is selected
    expect(queryByText('Matthew')).toBeNull();
  });

  it('switches to NT books when NT toggle is pressed', () => {
    const { getByText, queryByText } = renderWithProviders(
      <QnavOverlay {...baseProps} currentBookId={undefined} />,
    );
    fireEvent.press(getByText('New Testament'));
    expect(getByText('Matthew')).toBeTruthy();
    expect(queryByText('Genesis')).toBeNull();
  });

  it('shows chapter grid when a book is expanded (auto-expands current book)', () => {
    const { getByText } = renderWithProviders(
      <QnavOverlay {...baseProps} />,
    );
    // Genesis should be auto-expanded (currentBookId = 'gen')
    // Chapter cells should be visible - check for chapter 1
    expect(getByText('1')).toBeTruthy();
    expect(getByText('50')).toBeTruthy();
  });

  it('shows chapter count for each book', () => {
    const { getByText } = renderWithProviders(
      <QnavOverlay {...baseProps} />,
    );
    expect(getByText('50 ch')).toBeTruthy();
    expect(getByText('40 ch')).toBeTruthy();
  });

  it('filters books by search text', () => {
    const { getByPlaceholderText, getByText, queryByText } = renderWithProviders(
      <QnavOverlay {...baseProps} />,
    );
    const input = getByPlaceholderText('Search books...');
    fireEvent.changeText(input, 'Exo');
    expect(getByText('Exodus')).toBeTruthy();
    expect(queryByText('Genesis')).toBeNull();
  });
});
