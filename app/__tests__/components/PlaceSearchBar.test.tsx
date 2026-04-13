import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { renderWithProviders } from '../helpers/renderWithProviders';
import { PlaceSearchBar, filterPlaces } from '@/components/map/PlaceSearchBar';
import type { Place } from '@/types';

function makePlace(overrides: Partial<Place>): Place {
  return {
    id: overrides.id ?? 'jerusalem',
    ancient_name: 'Jerusalem',
    modern_name: 'Yerushalayim',
    latitude: 31.77,
    longitude: 35.23,
    type: 'city',
    priority: 1,
    label_dir: 'n',
    ...overrides,
  };
}

const PLACES: Place[] = [
  makePlace({ id: 'jerusalem', ancient_name: 'Jerusalem', modern_name: 'Yerushalayim' }),
  makePlace({ id: 'jericho', ancient_name: 'Jericho', modern_name: 'Ariha' }),
  makePlace({ id: 'bethlehem', ancient_name: 'Bethlehem', modern_name: 'Beit Lehem' }),
  makePlace({ id: 'galilee', ancient_name: 'Sea of Galilee', modern_name: null, type: 'water' }),
];

describe('PlaceSearchBar', () => {
  it('renders the input and shows no dropdown initially', () => {
    const { queryByLabelText } = renderWithProviders(
      <PlaceSearchBar places={PLACES} onSelect={jest.fn()} />,
    );
    // No result rows yet — verifies the dropdown stays hidden under the 2-char threshold.
    expect(queryByLabelText(/Select Jerusalem/)).toBeNull();
  });

  it('reveals matching places once the query has 2+ characters', async () => {
    const { getByPlaceholderText, findByLabelText } = renderWithProviders(
      <PlaceSearchBar places={PLACES} onSelect={jest.fn()} />,
    );
    fireEvent.changeText(getByPlaceholderText('Search places...'), 'jer');
    expect(await findByLabelText('Select Jerusalem')).toBeTruthy();
    expect(await findByLabelText('Select Jericho')).toBeTruthy();
  });

  it('calls onSelect with the matching place and clears the query', () => {
    const onSelect = jest.fn();
    const { getByPlaceholderText, getByLabelText, queryByLabelText } = renderWithProviders(
      <PlaceSearchBar places={PLACES} onSelect={onSelect} />,
    );
    fireEvent.changeText(getByPlaceholderText('Search places...'), 'beth');
    fireEvent.press(getByLabelText('Select Bethlehem'));
    expect(onSelect).toHaveBeenCalledWith(PLACES[2]);
    // Dropdown closes after selection
    expect(queryByLabelText(/Select Bethlehem/)).toBeNull();
  });

  it('matches the modern name as well as the ancient name', async () => {
    const { getByPlaceholderText, findByLabelText } = renderWithProviders(
      <PlaceSearchBar places={PLACES} onSelect={jest.fn()} />,
    );
    fireEvent.changeText(getByPlaceholderText('Search places...'), 'ari');
    // "Ariha" is the modern name of Jericho — the row should still surface.
    expect(await findByLabelText('Select Jericho')).toBeTruthy();
  });
});

describe('filterPlaces', () => {
  it('returns [] for a query under 2 characters', () => {
    expect(filterPlaces(PLACES, '')).toEqual([]);
    expect(filterPlaces(PLACES, ' ')).toEqual([]);
    expect(filterPlaces(PLACES, 'j')).toEqual([]);
  });

  it('matches the start of an ancient name (case-insensitive)', () => {
    const out = filterPlaces(PLACES, 'JER');
    expect(out.map((p) => p.id)).toEqual(['jerusalem', 'jericho']);
  });

  it('matches the start of a modern name when ancient name does not match', () => {
    const out = filterPlaces(PLACES, 'beit');
    expect(out.map((p) => p.id)).toEqual(['bethlehem']);
  });

  it('caps results at the supplied max', () => {
    expect(filterPlaces(PLACES, 'j', 8)).toHaveLength(0); // < 2 chars
    const all = filterPlaces(PLACES, 'je', 1);
    expect(all).toHaveLength(1);
  });

  it('skips places where neither name starts with the query', () => {
    const out = filterPlaces(PLACES, 'galilee');
    // 'Sea of Galilee' does NOT start with 'galilee' — only "Sea ..." does.
    expect(out).toHaveLength(0);
  });

  it('finds water-type places by their ancient_name prefix', () => {
    const out = filterPlaces(PLACES, 'sea');
    expect(out.map((p) => p.id)).toEqual(['galilee']);
  });
});
