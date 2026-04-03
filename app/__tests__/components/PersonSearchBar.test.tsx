import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { renderWithProviders } from '../helpers/renderWithProviders';
import { PersonSearchBar } from '@/components/tree/PersonSearchBar';
import type { Person } from '@/types';

jest.mock('lucide-react-native', () => ({
  X: () => null,
}));

const makePerson = (overrides?: Partial<Person>): Person => ({
  id: 'abraham',
  name: 'Abraham',
  gender: null,
  role: 'Patriarch',
  era: 'patriarchs',
  dates: '2166–1991 BC',
  bio: 'Father of faith.',
  scripture_role: 'Covenant bearer',
  refs_json: '["Gen 12:1"]',
  father: null,
  mother: null,
  spouse_of: null,
  type: null,
  chapter_link: null,
  ...overrides,
});

const people: Person[] = [
  makePerson(),
  makePerson({ id: 'isaac', name: 'Isaac', role: 'Son of Abraham' }),
  makePerson({ id: 'ishmael', name: 'Ishmael', role: 'Son of Abraham' }),
  makePerson({ id: 'jacob', name: 'Jacob', role: 'Patriarch' }),
];

describe('PersonSearchBar', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders the search input', () => {
    const { getByPlaceholderText } = renderWithProviders(
      <PersonSearchBar people={people} onSelect={jest.fn()} />,
    );
    expect(getByPlaceholderText('Search people...')).toBeTruthy();
  });

  it('shows matching results when query is at least 2 characters', () => {
    const { getByPlaceholderText, getByText } = renderWithProviders(
      <PersonSearchBar people={people} onSelect={jest.fn()} />,
    );
    fireEvent.changeText(getByPlaceholderText('Search people...'), 'Is');
    expect(getByText('Isaac')).toBeTruthy();
    expect(getByText('Ishmael')).toBeTruthy();
  });

  it('does not show results for single-character queries', () => {
    const { getByPlaceholderText, queryByText } = renderWithProviders(
      <PersonSearchBar people={people} onSelect={jest.fn()} />,
    );
    fireEvent.changeText(getByPlaceholderText('Search people...'), 'I');
    expect(queryByText('Isaac')).toBeNull();
  });

  it('calls onSelect and clears query when a result is tapped', () => {
    const onSelect = jest.fn();
    const { getByPlaceholderText, getByText, queryByText } = renderWithProviders(
      <PersonSearchBar people={people} onSelect={onSelect} />,
    );
    fireEvent.changeText(getByPlaceholderText('Search people...'), 'Ab');
    fireEvent.press(getByText('Abraham'));
    expect(onSelect).toHaveBeenCalledWith('abraham');
    // Results should be gone after selection (query cleared)
    expect(queryByText('Patriarch')).toBeNull();
  });
});
