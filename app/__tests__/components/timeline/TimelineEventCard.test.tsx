import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { renderWithProviders } from '../../helpers/renderWithProviders';
import {
  TimelineEventCard,
  formatTimelineYear,
  parsePeopleJson,
  parseChapterLink,
} from '@/components/timeline/TimelineEventCard';
import type { TimelineEntry } from '@/types';

function makeEntry(overrides: Partial<TimelineEntry> = {}): TimelineEntry {
  return {
    id: 'evt_creation',
    name: 'Creation',
    category: 'event',
    era: 'primeval',
    year: -4000,
    summary: 'God creates the heavens and the earth.',
    scripture_ref: 'Genesis 1',
    chapter_link: 'ot/genesis_1.html',
    people_json: null,
    region: null,
    ...overrides,
  };
}

describe('TimelineEventCard', () => {
  it('renders year, scripture ref, title, and summary', () => {
    const { getByText } = renderWithProviders(
      <TimelineEventCard
        event={makeEntry()}
        eraColor="#8a6e3a"
        isExpanded={false}
        onToggleExpand={jest.fn()}
      />,
    );
    expect(getByText('4000 BC')).toBeTruthy();
    expect(getByText('Genesis 1')).toBeTruthy();
    expect(getByText('Creation')).toBeTruthy();
    expect(getByText('God creates the heavens and the earth.')).toBeTruthy();
  });

  it('calls onToggleExpand when pressed', () => {
    const onToggle = jest.fn();
    const { getByText } = renderWithProviders(
      <TimelineEventCard
        event={makeEntry()}
        eraColor="#8a6e3a"
        isExpanded={false}
        onToggleExpand={onToggle}
      />,
    );
    fireEvent.press(getByText('Creation'));
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it('hides people pills when collapsed', () => {
    const { queryByText } = renderWithProviders(
      <TimelineEventCard
        event={makeEntry({ people_json: '["abraham","sarah"]' })}
        eraColor="#8a6e3a"
        isExpanded={false}
        onToggleExpand={jest.fn()}
      />,
    );
    expect(queryByText('abraham')).toBeNull();
  });

  it('shows people pills when expanded and invokes onPersonPress', () => {
    const onPerson = jest.fn();
    const { getByText } = renderWithProviders(
      <TimelineEventCard
        event={makeEntry({ people_json: '["abraham","sarah"]' })}
        eraColor="#8a6e3a"
        isExpanded
        onToggleExpand={jest.fn()}
        onPersonPress={onPerson}
      />,
    );
    fireEvent.press(getByText('abraham'));
    expect(onPerson).toHaveBeenCalledWith('abraham');
  });

  it('shows the chapter button when expanded and chapter_link parses', () => {
    const onChapter = jest.fn();
    const { getByText } = renderWithProviders(
      <TimelineEventCard
        event={makeEntry()}
        eraColor="#8a6e3a"
        isExpanded
        onToggleExpand={jest.fn()}
        onChapterPress={onChapter}
      />,
    );
    fireEvent.press(getByText('Go to chapter →'));
    expect(onChapter).toHaveBeenCalledWith('genesis', 1);
  });
});

describe('formatTimelineYear', () => {
  it('formats negative years as BC', () => {
    expect(formatTimelineYear(-4000)).toBe('4000 BC');
    expect(formatTimelineYear(-1)).toBe('1 BC');
  });

  it('formats positive years as AD', () => {
    expect(formatTimelineYear(30)).toBe('AD 30');
    expect(formatTimelineYear(1995)).toBe('AD 1995');
  });

  it('handles year 0 specially', () => {
    expect(formatTimelineYear(0)).toBe('AD/BC');
  });
});

describe('parsePeopleJson', () => {
  it('returns [] for null/undefined/empty', () => {
    expect(parsePeopleJson(null)).toEqual([]);
    expect(parsePeopleJson(undefined)).toEqual([]);
    expect(parsePeopleJson('')).toEqual([]);
  });

  it('returns [] for malformed JSON', () => {
    expect(parsePeopleJson('not-json')).toEqual([]);
  });

  it('returns [] when parsed value is not an array', () => {
    expect(parsePeopleJson('{"a":1}')).toEqual([]);
  });

  it('parses arrays of strings and filters non-strings', () => {
    expect(parsePeopleJson('["a","b"]')).toEqual(['a', 'b']);
    expect(parsePeopleJson('["a",1,null,"b"]')).toEqual(['a', 'b']);
  });
});

describe('parseChapterLink', () => {
  it('returns null for null/empty', () => {
    expect(parseChapterLink(null)).toBeNull();
    expect(parseChapterLink('')).toBeNull();
  });

  it('returns null for strings that do not match the pattern', () => {
    expect(parseChapterLink('not-a-link')).toBeNull();
  });

  it('parses book/chapter from the standard link format', () => {
    expect(parseChapterLink('ot/genesis_12.html')).toEqual({
      bookId: 'genesis',
      chapterNum: 12,
    });
  });

  it('lowercases the book id', () => {
    expect(parseChapterLink('nt/Matthew_5.html')).toEqual({
      bookId: 'matthew',
      chapterNum: 5,
    });
  });
});
