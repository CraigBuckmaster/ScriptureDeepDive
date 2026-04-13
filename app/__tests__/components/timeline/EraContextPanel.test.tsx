import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { renderWithProviders } from '../../helpers/renderWithProviders';
import {
  EraContextPanel,
  splitCommaList,
} from '@/components/timeline/EraContextPanel';
import type { EraRow } from '@/db/content/reference';

function makeEra(overrides: Partial<EraRow> = {}): EraRow {
  return {
    id: 'kingdom',
    name: 'Kingdom',
    pill: 'Kingdom',
    hex: '#c8a040',
    range_start: -1050,
    range_end: -586,
    summary: null,
    narrative:
      'Israel transitions from tribal confederation to monarchy. The united kingdom splits after Solomon.',
    key_themes: 'covenant kingship, temple theology, prophetic critique',
    key_people: 'Samuel, Saul, David, Solomon',
    books: '1-2 Samuel, 1-2 Kings, Psalms',
    chapter_range: null,
    geographic_center: null,
    redemptive_thread: null,
    transition_to_next: null,
    ...overrides,
  };
}

describe('EraContextPanel', () => {
  it('renders the era name, range, and narrative', () => {
    const { getByText } = renderWithProviders(
      <EraContextPanel era={makeEra()} />,
    );
    expect(getByText(/KINGDOM/)).toBeTruthy();
    expect(getByText(/1050 BC – 586 BC/)).toBeTruthy();
    expect(getByText(/monarchy/)).toBeTruthy();
  });

  it('renders key themes as comma-separated text', () => {
    const { getByText } = renderWithProviders(
      <EraContextPanel era={makeEra()} />,
    );
    expect(getByText(/covenant kingship, temple theology, prophetic critique/)).toBeTruthy();
  });

  it('renders key people as tappable pills', () => {
    const onPerson = jest.fn();
    const { getByText } = renderWithProviders(
      <EraContextPanel era={makeEra()} onPersonPress={onPerson} />,
    );
    fireEvent.press(getByText('David'));
    expect(onPerson).toHaveBeenCalledWith('David');
  });

  it('renders books as tappable pills', () => {
    const onBook = jest.fn();
    const { getByText } = renderWithProviders(
      <EraContextPanel era={makeEra()} onBookPress={onBook} />,
    );
    fireEvent.press(getByText('Psalms'));
    expect(onBook).toHaveBeenCalledWith('Psalms');
  });

  it('skips missing sections', () => {
    const { queryByText } = renderWithProviders(
      <EraContextPanel
        era={makeEra({ narrative: null, key_themes: null, key_people: null, books: null })}
      />,
    );
    expect(queryByText(/Key Themes/i)).toBeNull();
    expect(queryByText(/Key People/i)).toBeNull();
    expect(queryByText(/Books/i)).toBeNull();
  });
});

describe('splitCommaList', () => {
  it('returns [] for null/empty', () => {
    expect(splitCommaList(null)).toEqual([]);
    expect(splitCommaList(undefined)).toEqual([]);
    expect(splitCommaList('')).toEqual([]);
  });

  it('splits and trims comma-separated values', () => {
    expect(splitCommaList(' a , b,c ')).toEqual(['a', 'b', 'c']);
  });

  it('drops empty pieces', () => {
    expect(splitCommaList('a,,b')).toEqual(['a', 'b']);
  });
});
