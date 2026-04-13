import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { renderWithProviders } from '../../helpers/renderWithProviders';
import {
  ContemporaryRow,
  computeContemporaries,
} from '@/components/timeline/ContemporaryRow';
import type { TimelineEntry } from '@/types';

function entry(overrides: Partial<TimelineEntry>): TimelineEntry {
  return {
    id: 'x',
    name: 'X',
    category: 'event',
    era: 'primeval',
    year: 0,
    summary: null,
    scripture_ref: null,
    chapter_link: null,
    people_json: null,
    region: null,
    ...overrides,
  };
}

describe('ContemporaryRow', () => {
  it('renders a circle for each contemporary', () => {
    const { getByLabelText } = renderWithProviders(
      <ContemporaryRow
        contemporaries={[
          { id: 'sarah', name: 'Sarah', count: 3 },
          { id: 'lot', name: 'Lot', count: 2 },
        ]}
        onPress={jest.fn()}
      />,
    );
    expect(getByLabelText('Switch filter to Sarah')).toBeTruthy();
    expect(getByLabelText('Switch filter to Lot')).toBeTruthy();
  });

  it('returns null when the list is empty', () => {
    const { toJSON } = renderWithProviders(
      <ContemporaryRow contemporaries={[]} onPress={jest.fn()} />,
    );
    expect(toJSON()).toBeNull();
  });

  it('calls onPress with the contemporary id when tapped', () => {
    const onPress = jest.fn();
    const { getByLabelText } = renderWithProviders(
      <ContemporaryRow
        contemporaries={[{ id: 'sarah', name: 'Sarah', count: 1 }]}
        onPress={onPress}
      />,
    );
    fireEvent.press(getByLabelText('Switch filter to Sarah'));
    expect(onPress).toHaveBeenCalledWith('sarah');
  });
});

describe('computeContemporaries', () => {
  const EVENTS = [
    entry({ id: 'a', year: -2000, people_json: '["abraham","sarah","lot"]' }),
    entry({ id: 'b', year: -1990, people_json: '["abraham","sarah"]' }),
    entry({ id: 'c', year: -1980, people_json: '["abraham","isaac"]' }),
    entry({ id: 'd', year: -1900, people_json: '["isaac"]' }),
    entry({ id: 'e', year: -3000, people_json: '["noah"]' }), // before Abraham's span
  ];

  it('returns [] when the person has no events', () => {
    expect(computeContemporaries(EVENTS, 'unknown')).toEqual([]);
  });

  it('returns contemporaries sorted by co-occurrence count', () => {
    const out = computeContemporaries(EVENTS, 'abraham');
    // Abraham's span is -2000 to -1980. Noah (-3000) is outside the span.
    // Sarah appears twice, Lot/Isaac once each.
    expect(out[0]).toMatchObject({ id: 'sarah', count: 2 });
    const ids = out.map((c) => c.id);
    expect(ids).not.toContain('noah');
    expect(ids).toContain('lot');
    expect(ids).toContain('isaac');
    expect(ids).not.toContain('abraham');
  });

  it('honors the max parameter', () => {
    const e = [
      entry({ id: 'a', year: 0, people_json: '["p","a","b","c","d","e","f","g","h","i"]' }),
    ];
    const out = computeContemporaries(e, 'p', 3);
    expect(out).toHaveLength(3);
  });

  it('ignores malformed people_json', () => {
    const e = [
      entry({ id: 'a', year: 0, people_json: 'not-json' }),
      entry({ id: 'b', year: 0, people_json: '["p","q"]' }),
    ];
    const out = computeContemporaries(e, 'p');
    expect(out.map((c) => c.id)).toEqual(['q']);
  });
});
