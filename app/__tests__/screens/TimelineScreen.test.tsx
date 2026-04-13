import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { renderWithProviders } from '../helpers/renderWithProviders';

// ── Navigation mock ───────────────────────────────────────────────

const mockNavigate = jest.fn();
const mockGoBack = jest.fn();

jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');
  return {
    ...actual,
    useNavigation: () => ({
      navigate: mockNavigate,
      goBack: mockGoBack,
      setOptions: jest.fn(),
    }),
    useRoute: jest.fn().mockReturnValue({
      params: {},
      key: 'timeline-1',
      name: 'Timeline',
    }),
    useScrollToTop: jest.fn(),
    useFocusEffect: (cb: () => void) => cb(),
  };
});

// ── Stores ────────────────────────────────────────────────────────

jest.mock('@/stores', () => ({
  useSettingsStore: Object.assign(
    (sel: any) => sel({ translation: 'kjv', fontSize: 16 }),
    { getState: () => ({ markGettingStartedDone: jest.fn() }) },
  ),
  useReaderStore: (sel: any) => sel({}),
}));

// ── DB calls ──────────────────────────────────────────────────────
// Inline the mock data inside the factory — jest hoists jest.mock calls,
// so any top-level `const` in this file is not yet initialised when the
// factory runs.

jest.mock('@/db/content', () => ({
  getAllTimelineEntries: jest.fn().mockResolvedValue([
    {
      id: 'evt_creation', name: 'Creation', category: 'event', era: 'primeval',
      year: -4000, summary: 'God creates the heavens and the earth.',
      scripture_ref: 'Genesis 1', chapter_link: 'ot/genesis_1.html',
      people_json: null, region: null,
    },
    {
      id: 'bk_book-genesis', name: 'Genesis', category: 'book', era: 'primeval',
      year: -3800, summary: 'Book of Genesis.',
      scripture_ref: null, chapter_link: null,
      people_json: null, region: null,
    },
    {
      id: 'per_abraham', name: 'Abraham', category: 'person', era: 'patriarchs',
      year: -2000, summary: 'Father of many nations.',
      scripture_ref: 'Genesis 12', chapter_link: 'ot/genesis_12.html',
      people_json: '["abraham"]', region: null,
    },
  ]),
  getEras: jest.fn().mockResolvedValue([
    {
      id: 'primeval', name: 'Primeval', pill: 'Primeval', hex: '#8a6e3a',
      range_start: -4000, range_end: -2100, summary: null, narrative: null,
      key_themes: null, key_people: null, books: null,
      chapter_range: null, geographic_center: null,
      redemptive_thread: null, transition_to_next: null,
    },
    {
      id: 'patriarchs', name: 'Patriarchs', pill: 'Patriarchs', hex: '#c8a040',
      range_start: -2100, range_end: -1800, summary: null, narrative: null,
      key_themes: null, key_people: null, books: null,
      chapter_range: null, geographic_center: null,
      redemptive_thread: null, transition_to_next: null,
    },
  ]),
}));

jest.mock('@/hooks/useContentImages', () => ({
  useContentImages: jest.fn().mockReturnValue({ images: [], isLoading: false }),
}));

jest.mock('@/components/LoadingSkeleton', () => ({
  LoadingSkeleton: () => {
    const React = require('react');
    const { Text } = require('react-native');
    return React.createElement(Text, { testID: 'loading-skeleton' }, 'Loading...');
  },
}));

// For the default export (which wraps the screen in an ErrorBoundary), make
// sure the boundary passes errors through rather than swallowing — but since
// our rewrite no longer throws on render, no special handling is needed.

import TimelineScreen from '@/screens/TimelineScreen';

describe('TimelineScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows the loading skeleton initially', () => {
    const { getByTestId } = renderWithProviders(<TimelineScreen />);
    expect(getByTestId('loading-skeleton')).toBeTruthy();
  });

  it('renders the Timeline header and event count after loading', async () => {
    const { findByText } = renderWithProviders(<TimelineScreen />);
    expect(await findByText('Timeline')).toBeTruthy();
    expect(await findByText('3 events')).toBeTruthy();
  });

  it('renders event cards in the list after loading', async () => {
    const { findByText } = renderWithProviders(<TimelineScreen />);
    expect(await findByText('Creation')).toBeTruthy();
    expect(await findByText('Abraham')).toBeTruthy();
  });

  it('renders era strip segments keyed by era', async () => {
    const { findByLabelText } = renderWithProviders(<TimelineScreen />);
    expect(await findByLabelText(/Primeval era/)).toBeTruthy();
    expect(await findByLabelText(/Patriarchs era/)).toBeTruthy();
  });

  it('renders category filter chips after loading', async () => {
    const { findByText } = renderWithProviders(<TimelineScreen />);
    expect(await findByText('Events')).toBeTruthy();
    expect(await findByText('Books')).toBeTruthy();
    expect(await findByText('People')).toBeTruthy();
    expect(await findByText('World History')).toBeTruthy();
  });

  it('toggles a category filter when a chip is pressed', async () => {
    const { findByText, queryByText } = renderWithProviders(<TimelineScreen />);
    const peopleChip = await findByText('People');
    fireEvent.press(peopleChip);
    // Abraham is a person — should be filtered out after toggling people off.
    expect(queryByText('Abraham')).toBeNull();
  });

  it('filters to an era when its segment is pressed', async () => {
    const { findByText, findByLabelText, queryByText } = renderWithProviders(
      <TimelineScreen />,
    );
    await findByText('Creation');
    const patriarchs = await findByLabelText(/Patriarchs era/);
    fireEvent.press(patriarchs);
    // Creation is in the primeval era — should be hidden after filtering.
    expect(queryByText('Creation')).toBeNull();
    expect(await findByText('Abraham')).toBeTruthy();
  });

  it('expands an event card when it is tapped', async () => {
    const { findByText, getByLabelText } = renderWithProviders(<TimelineScreen />);
    await findByText('Abraham');
    const card = getByLabelText(/Abraham,/);
    fireEvent.press(card);
    // People pill renders once the card expands.
    expect(await findByText('abraham')).toBeTruthy();
  });

  it('exposes an accessibility label on the root container', async () => {
    const { findByLabelText } = renderWithProviders(<TimelineScreen />);
    expect(await findByLabelText('Timeline')).toBeTruthy();
  });

  it('enters person-filter mode when a person pill is tapped on an expanded card', async () => {
    const { findByLabelText, findByText, getByText } = renderWithProviders(<TimelineScreen />);
    // Expand Abraham's card (it has people_json = ["abraham"])
    const card = await findByLabelText(/Abraham,/);
    fireEvent.press(card);
    const pill = await findByText('abraham');
    fireEvent.press(pill);
    // Person filter bar now renders.
    expect(getByText(/Showing \d+ event/)).toBeTruthy();
  });

  it('dismisses the person filter when the close pill is pressed', async () => {
    const { findByLabelText, findByText, queryByText, getByLabelText } = renderWithProviders(
      <TimelineScreen />,
    );
    const card = await findByLabelText(/Abraham,/);
    fireEvent.press(card);
    fireEvent.press(await findByText('abraham'));
    await findByText(/Showing \d+ event/);
    fireEvent.press(getByLabelText('Clear person filter'));
    expect(queryByText(/Showing \d+ event/)).toBeNull();
  });

  it('shows an era context panel when an era segment is tapped', async () => {
    const { findByLabelText } = renderWithProviders(<TimelineScreen />);
    const primeval = await findByLabelText(/Primeval era/);
    fireEvent.press(primeval);
    // EraContextPanel renders its own accessibility label scoped to the era.
    expect(await findByLabelText(/Primeval era context/)).toBeTruthy();
  });
});
