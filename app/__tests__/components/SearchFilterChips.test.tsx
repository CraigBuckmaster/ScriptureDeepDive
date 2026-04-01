import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { renderWithProviders } from '../helpers/renderWithProviders';
import { SearchFilterChips, type SearchFilter } from '@/components/SearchFilterChips';

const defaultFilter: SearchFilter = { testament: 'all', bookId: null, bookName: null };

describe('SearchFilterChips', () => {
  it('renders testament chips (All, OT, NT)', () => {
    const { getByText } = renderWithProviders(
      <SearchFilterChips filter={defaultFilter} onFilterChange={jest.fn()} onBookPickerOpen={jest.fn()} />,
    );
    expect(getByText('All')).toBeTruthy();
    expect(getByText('OT')).toBeTruthy();
    expect(getByText('NT')).toBeTruthy();
  });

  it('shows "Book..." placeholder when no book is selected', () => {
    const { getByText } = renderWithProviders(
      <SearchFilterChips filter={defaultFilter} onFilterChange={jest.fn()} onBookPickerOpen={jest.fn()} />,
    );
    expect(getByText('Book...')).toBeTruthy();
  });

  it('shows book name when book is selected', () => {
    const filter: SearchFilter = { testament: 'all', bookId: 'GEN', bookName: 'Genesis' };
    const { getByText } = renderWithProviders(
      <SearchFilterChips filter={filter} onFilterChange={jest.fn()} onBookPickerOpen={jest.fn()} />,
    );
    expect(getByText('Genesis')).toBeTruthy();
  });

  it('calls onFilterChange when testament chip is pressed', () => {
    const mockChange = jest.fn();
    const { getByText } = renderWithProviders(
      <SearchFilterChips filter={defaultFilter} onFilterChange={mockChange} onBookPickerOpen={jest.fn()} />,
    );
    fireEvent.press(getByText('NT'));
    expect(mockChange).toHaveBeenCalledWith({ testament: 'nt', bookId: null, bookName: null });
  });

  it('calls onBookPickerOpen when "Book..." is pressed', () => {
    const mockOpen = jest.fn();
    const { getByText } = renderWithProviders(
      <SearchFilterChips filter={defaultFilter} onFilterChange={jest.fn()} onBookPickerOpen={mockOpen} />,
    );
    fireEvent.press(getByText('Book...'));
    expect(mockOpen).toHaveBeenCalledTimes(1);
  });
});
