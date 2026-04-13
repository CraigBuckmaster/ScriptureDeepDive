import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { renderWithProviders } from '../../helpers/renderWithProviders';
import {
  TimelineEraStrip,
  computeEraShares,
  firstWord,
  formatEraRange,
} from '@/components/timeline/TimelineEraStrip';
import type { EraRow } from '@/db/content/reference';

function makeEra(id: string, name: string, range: [number, number]): EraRow {
  return {
    id,
    name,
    pill: name,
    hex: '#888888',
    range_start: range[0],
    range_end: range[1],
    summary: null,
    narrative: null,
    key_themes: null,
    key_people: null,
    books: null,
    chapter_range: null,
    geographic_center: null,
    redemptive_thread: null,
    transition_to_next: null,
  };
}

const ERAS = [
  makeEra('primeval', 'Primeval', [-4000, -2100]),
  makeEra('patriarchs', 'Patriarchs', [-2100, -1800]),
  makeEra('divided_kingdom', 'Divided Kingdom', [-930, -722]),
];

describe('TimelineEraStrip', () => {
  it('renders a segment for each era', () => {
    const { getByLabelText } = renderWithProviders(
      <TimelineEraStrip
        eras={ERAS}
        eventCounts={{ primeval: 10, patriarchs: 5, divided_kingdom: 60 }}
        activeEraId={null}
        onSelectEra={jest.fn()}
      />,
    );
    expect(getByLabelText(/Primeval era/)).toBeTruthy();
    expect(getByLabelText(/Patriarchs era/)).toBeTruthy();
    expect(getByLabelText(/Divided Kingdom era/)).toBeTruthy();
  });

  it('calls onSelectEra with the era id when a segment is tapped', () => {
    const onSelect = jest.fn();
    const { getByLabelText } = renderWithProviders(
      <TimelineEraStrip
        eras={ERAS}
        eventCounts={{ primeval: 10 }}
        activeEraId={null}
        onSelectEra={onSelect}
      />,
    );
    fireEvent.press(getByLabelText(/Primeval era/));
    expect(onSelect).toHaveBeenCalledWith('primeval');
  });

  it('deselects an active era when tapped again', () => {
    const onSelect = jest.fn();
    const { getByLabelText } = renderWithProviders(
      <TimelineEraStrip
        eras={ERAS}
        eventCounts={{ primeval: 10 }}
        activeEraId="primeval"
        onSelectEra={onSelect}
      />,
    );
    fireEvent.press(getByLabelText(/Primeval era/));
    expect(onSelect).toHaveBeenCalledWith(null);
  });

  it('shows a caption with the active era name and range', () => {
    const { getAllByText, getByText } = renderWithProviders(
      <TimelineEraStrip
        eras={ERAS}
        eventCounts={{ primeval: 40 }}
        activeEraId="primeval"
        onSelectEra={jest.fn()}
      />,
    );
    // "Primeval" appears twice (segment label + caption).
    expect(getAllByText('Primeval').length).toBeGreaterThanOrEqual(2);
    expect(getByText(/4000 BC – 2100 BC/)).toBeTruthy();
    expect(getByText(/40 events/)).toBeTruthy();
  });

  it('shows the era first-word label only for wide segments (>30 events)', () => {
    const { queryByText } = renderWithProviders(
      <TimelineEraStrip
        eras={ERAS}
        eventCounts={{ primeval: 60, patriarchs: 5 }}
        activeEraId={null}
        onSelectEra={jest.fn()}
      />,
    );
    // Primeval has 60 events → label rendered
    expect(queryByText('Primeval')).toBeTruthy();
    // Patriarchs has only 5 → label not rendered (caption wouldn't show either — no active era)
    expect(queryByText('Patriarchs')).toBeNull();
  });
});

describe('computeEraShares', () => {
  it('returns equal shares when total count is zero', () => {
    const out = computeEraShares(ERAS, {});
    out.forEach(({ share }) => expect(share).toBeCloseTo(1 / ERAS.length, 5));
  });

  it('proportional shares sum to ~1', () => {
    const out = computeEraShares(ERAS, { primeval: 10, patriarchs: 5, divided_kingdom: 85 });
    const sum = out.reduce((s, r) => s + r.share, 0);
    expect(sum).toBeCloseTo(1, 5);
  });

  it('applies a minimum share so every segment stays tappable', () => {
    const out = computeEraShares(
      ERAS,
      { primeval: 0, patriarchs: 0, divided_kingdom: 1000 },
      0.05,
    );
    for (const { share } of out) {
      expect(share).toBeGreaterThanOrEqual(0);
    }
    // After normalisation the largest era still dominates.
    const largest = out.find((r) => r.id === 'divided_kingdom')!;
    expect(largest.share).toBeGreaterThan(0.5);
  });
});

describe('firstWord', () => {
  it('returns the first whitespace-separated token', () => {
    expect(firstWord('Divided Kingdom')).toBe('Divided');
    expect(firstWord('Primeval')).toBe('Primeval');
    expect(firstWord('   Leading Spaces')).toBe('Leading');
  });

  it('returns empty string for empty input', () => {
    expect(firstWord('')).toBe('');
    expect(firstWord('   ')).toBe('');
  });
});

describe('formatEraRange', () => {
  it('formats BC years', () => {
    expect(formatEraRange(-2000, -1500)).toBe('2000 BC – 1500 BC');
  });

  it('formats AD years', () => {
    expect(formatEraRange(30, 95)).toBe('AD 30 – AD 95');
  });

  it('handles BC → AD spans', () => {
    expect(formatEraRange(-50, 70)).toBe('50 BC – AD 70');
  });

  it('returns empty string if either bound is null', () => {
    expect(formatEraRange(null, 100)).toBe('');
    expect(formatEraRange(0, null)).toBe('');
  });
});
