import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { renderWithProviders } from '../../helpers/renderWithProviders';

jest.mock('@/db/content', () => ({
  getDebateTopics: jest.fn(),
}));

import {
  DebatePreviewList,
  countPositions,
  pickTopDebates,
} from '@/components/explore/DebatePreviewList';
import type { DebateTopicSummary } from '@/types';
const { getDebateTopics } = require('@/db/content');

function makeDebate(overrides: Partial<DebateTopicSummary> = {}): DebateTopicSummary {
  return {
    id: 'd1',
    title: 'Was Paul the author of Hebrews?',
    category: 'historical',
    book_id: 'hebrews',
    chapters_json: '[]',
    passage: 'Heb 1:1',
    question: 'Who wrote Hebrews?',
    context: null,
    positions_json: '[]',
    synthesis: null,
    related_passages_json: null,
    tags_json: null,
    position_count: 2,
    ...overrides,
  };
}

describe('DebatePreviewList', () => {
  it('renders the supplied debates (no fetch)', () => {
    const debates = [
      makeDebate({ id: 'a', title: 'Debate A', position_count: 5 }),
      makeDebate({ id: 'b', title: 'Debate B', position_count: 3 }),
    ];
    const { getByText } = renderWithProviders(
      <DebatePreviewList
        onDebatePress={jest.fn()}
        onSeeAll={jest.fn()}
        debates={debates}
        totalCount={42}
      />,
    );
    expect(getByText('Debate A')).toBeTruthy();
    expect(getByText('Debate B')).toBeTruthy();
    expect(getByText('All 42 debates ›')).toBeTruthy();
  });

  it('sorts debates by position count (desc)', () => {
    const debates = [
      makeDebate({ id: 'low', title: 'Low', position_count: 1 }),
      makeDebate({ id: 'high', title: 'High', position_count: 9 }),
      makeDebate({ id: 'mid', title: 'Mid', position_count: 5 }),
      makeDebate({ id: 'tiny', title: 'Tiny', position_count: 0 }),
    ];
    const { getAllByRole } = renderWithProviders(
      <DebatePreviewList onDebatePress={jest.fn()} onSeeAll={jest.fn()} debates={debates} />,
    );
    const buttons = getAllByRole('button');
    // The first 3 row buttons correspond to the top 3 by position_count.
    expect(buttons[0].props.accessibilityLabel).toMatch(/High/);
    expect(buttons[1].props.accessibilityLabel).toMatch(/Mid/);
    expect(buttons[2].props.accessibilityLabel).toMatch(/Low/);
  });

  it('returns null when debate list is empty', () => {
    const { queryByText } = renderWithProviders(
      <DebatePreviewList onDebatePress={jest.fn()} onSeeAll={jest.fn()} debates={[]} />,
    );
    expect(queryByText(/debates ›/)).toBeNull();
  });

  it('calls onDebatePress with the debate id', () => {
    const onDebate = jest.fn();
    const debates = [makeDebate({ id: 'x', title: 'X' })];
    const { getByText } = renderWithProviders(
      <DebatePreviewList onDebatePress={onDebate} onSeeAll={jest.fn()} debates={debates} />,
    );
    fireEvent.press(getByText('X'));
    expect(onDebate).toHaveBeenCalledWith('x');
  });

  it('calls onSeeAll when the link is pressed', () => {
    const onSeeAll = jest.fn();
    const debates = [makeDebate({ id: 'x', title: 'X' })];
    const { getByText } = renderWithProviders(
      <DebatePreviewList onDebatePress={jest.fn()} onSeeAll={onSeeAll} debates={debates} />,
    );
    fireEvent.press(getByText(/All 1 debates ›/));
    expect(onSeeAll).toHaveBeenCalledTimes(1);
  });

  it('fetches debates from the DB when no override is provided', async () => {
    (getDebateTopics as jest.Mock).mockResolvedValueOnce([
      makeDebate({ id: 'fetched', title: 'Fetched' }),
    ]);
    const { findByText } = renderWithProviders(
      <DebatePreviewList onDebatePress={jest.fn()} onSeeAll={jest.fn()} />,
    );
    expect(await findByText('Fetched')).toBeTruthy();
    expect(getDebateTopics).toHaveBeenCalled();
  });
});

describe('countPositions', () => {
  it('returns 0 for null, undefined, empty string', () => {
    expect(countPositions(null)).toBe(0);
    expect(countPositions(undefined)).toBe(0);
    expect(countPositions('')).toBe(0);
  });

  it('returns 0 for malformed JSON', () => {
    expect(countPositions('not-json')).toBe(0);
  });

  it('returns 0 when parsed value is not an array', () => {
    expect(countPositions('{"a":1}')).toBe(0);
  });

  it('returns the array length for valid JSON arrays', () => {
    expect(countPositions('[1,2,3]')).toBe(3);
  });
});

describe('pickTopDebates', () => {
  it('returns up to n debates sorted by position count desc', () => {
    const input = [
      makeDebate({ id: 'a', position_count: 1 }),
      makeDebate({ id: 'b', position_count: 4 }),
      makeDebate({ id: 'c', position_count: 2 }),
    ];
    const out = pickTopDebates(input, 2);
    expect(out).toHaveLength(2);
    expect(out[0].id).toBe('b');
    expect(out[1].id).toBe('c');
  });

  it('falls back to positions_json length when position_count is missing', () => {
    const input = [
      makeDebate({ id: 'a', position_count: undefined as unknown as number, positions_json: '[1]' }),
      makeDebate({ id: 'b', position_count: undefined as unknown as number, positions_json: '[1,2,3]' }),
    ];
    const out = pickTopDebates(input, 2);
    expect(out[0].id).toBe('b');
  });

  it('does not mutate the input array', () => {
    const input = [
      makeDebate({ id: 'a', position_count: 1 }),
      makeDebate({ id: 'b', position_count: 4 }),
    ];
    const snapshot = [...input];
    pickTopDebates(input);
    expect(input).toEqual(snapshot);
  });
});
