import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { renderWithProviders } from '../../helpers/renderWithProviders';
import { EraContextPanel } from '@/components/timeline/EraContextPanel';
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
    key_themes: JSON.stringify([
      { theme: 'Covenant Kingship', ref: '2 Sam 7:12-16', note: 'God promises David an eternal throne.' },
      { theme: 'Temple Theology', ref: '1 Kgs 8:27-30', note: 'Solomon dedicates the temple.' },
    ]),
    key_people: JSON.stringify(['samuel', 'saul', 'david', 'solomon']),
    books: JSON.stringify(['1_samuel', '2_samuel', '1_kings', '2_kings', 'psalms']),
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

  it('renders key themes with theme names and refs', () => {
    const { getByText } = renderWithProviders(
      <EraContextPanel era={makeEra()} />,
    );
    expect(getByText('Covenant Kingship')).toBeTruthy();
    expect(getByText('2 Sam 7:12-16')).toBeTruthy();
    expect(getByText(/eternal throne/)).toBeTruthy();
  });

  it('renders key people as tappable pills with formatted names', () => {
    const onPerson = jest.fn();
    const { getByText } = renderWithProviders(
      <EraContextPanel era={makeEra()} onPersonPress={onPerson} />,
    );
    fireEvent.press(getByText('David'));
    expect(onPerson).toHaveBeenCalledWith('david');
  });

  it('renders books as tappable pills with formatted names', () => {
    const onBook = jest.fn();
    const { getByText } = renderWithProviders(
      <EraContextPanel era={makeEra()} onBookPress={onBook} />,
    );
    fireEvent.press(getByText('Psalms'));
    expect(onBook).toHaveBeenCalledWith('psalms');
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

  it('handles legacy comma-separated format gracefully', () => {
    const { getByText } = renderWithProviders(
      <EraContextPanel
        era={makeEra({ key_people: 'samuel, david, solomon' })}
      />,
    );
    // Comma-separated fallback should still work
    expect(getByText('Samuel')).toBeTruthy();
    expect(getByText('David')).toBeTruthy();
  });
});
