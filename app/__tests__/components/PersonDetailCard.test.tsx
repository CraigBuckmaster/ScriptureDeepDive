import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { renderWithProviders } from '../helpers/renderWithProviders';
import {
  PersonDetailCard,
  parseRefsJson,
} from '@/components/tree/PersonDetailCard';
import type { Person } from '@/types';

function makePerson(overrides: Partial<Person> = {}): Person {
  return {
    id: 'david',
    name: 'David',
    gender: 'male',
    father: 'jesse',
    mother: null,
    spouse_of: null,
    era: 'kingdom',
    dates: '1040–970 BC',
    role: 'king',
    type: 'spine',
    bio: 'A shepherd boy from Bethlehem who became king of Israel.',
    scripture_role: 'King of united Israel',
    refs_json: '["1 Sam 16:12","Ps 23","2 Sam 7:16"]',
    chapter_link: 'ot/1_samuel_16.html',
    associated_with: null,
    association_type: null,
    ...overrides,
  };
}

describe('PersonDetailCard', () => {
  it('renders the name, scripture role, and dates', () => {
    const { getByText } = renderWithProviders(
      <PersonDetailCard person={makePerson()} childrenCount={19} />,
    );
    expect(getByText('David')).toBeTruthy();
    expect(getByText('King of united Israel')).toBeTruthy();
    expect(getByText('1040–970 BC')).toBeTruthy();
    expect(getByText('19')).toBeTruthy();
    expect(getByText('3')).toBeTruthy(); // 3 refs in refs_json
  });

  it('shows a Messianic Line badge for line members', () => {
    const { getByText } = renderWithProviders(
      <PersonDetailCard person={makePerson()} />,
    );
    expect(getByText('Messianic Line')).toBeTruthy();
  });

  it('hides the Messianic Line badge for non-members', () => {
    const { queryByText } = renderWithProviders(
      <PersonDetailCard person={makePerson({ id: 'esau' })} />,
    );
    expect(queryByText('Messianic Line')).toBeNull();
  });

  it('renders the default Bio tab content', () => {
    const { getByText } = renderWithProviders(
      <PersonDetailCard person={makePerson()} />,
    );
    expect(getByText(/A shepherd boy from Bethlehem/)).toBeTruthy();
  });

  it('switches to Family tab and renders related people', () => {
    const onPerson = jest.fn();
    const { getByText } = renderWithProviders(
      <PersonDetailCard
        person={makePerson()}
        relatedPeople={{
          parents: [{ id: 'jesse', name: 'Jesse' }],
          spouses: [{ id: 'bathsheba', name: 'Bathsheba' }],
          children: [{ id: 'solomon', name: 'Solomon' }],
        }}
        onPersonPress={onPerson}
      />,
    );
    fireEvent.press(getByText('Family'));
    expect(getByText('Jesse')).toBeTruthy();
    expect(getByText('Solomon')).toBeTruthy();
    fireEvent.press(getByText('Jesse'));
    expect(onPerson).toHaveBeenCalledWith('jesse');
  });

  it('switches to Journey tab and renders the View Full Journey button', () => {
    const onJourney = jest.fn();
    const { getByText } = renderWithProviders(
      <PersonDetailCard person={makePerson()} hasJourney onJourneyPress={onJourney} />,
    );
    fireEvent.press(getByText('Journey'));
    const btn = getByText('View full journey →');
    fireEvent.press(btn);
    expect(onJourney).toHaveBeenCalledTimes(1);
  });

  it('shows an empty-journey message when hasJourney is false', () => {
    const { getByText } = renderWithProviders(
      <PersonDetailCard person={makePerson()} hasJourney={false} />,
    );
    fireEvent.press(getByText('Journey'));
    expect(getByText('No journey recorded.')).toBeTruthy();
  });

  it('switches to Verses tab and renders key refs as pills', () => {
    const onVerse = jest.fn();
    const { getByText } = renderWithProviders(
      <PersonDetailCard person={makePerson()} onVersePress={onVerse} />,
    );
    fireEvent.press(getByText('Verses'));
    fireEvent.press(getByText('Ps 23'));
    expect(onVerse).toHaveBeenCalledWith('Ps 23');
  });

  it('notifies the parent on tab change', () => {
    const onTab = jest.fn();
    const { getByText } = renderWithProviders(
      <PersonDetailCard person={makePerson()} onTabChange={onTab} />,
    );
    fireEvent.press(getByText('Verses'));
    expect(onTab).toHaveBeenCalledWith('verses');
  });
});

describe('parseRefsJson', () => {
  it('returns [] for null/empty', () => {
    expect(parseRefsJson(null)).toEqual([]);
    expect(parseRefsJson(undefined)).toEqual([]);
    expect(parseRefsJson('')).toEqual([]);
  });

  it('returns [] for malformed JSON', () => {
    expect(parseRefsJson('not-json')).toEqual([]);
  });

  it('filters non-string entries', () => {
    expect(parseRefsJson('["a",1,null,"b"]')).toEqual(['a', 'b']);
  });
});
