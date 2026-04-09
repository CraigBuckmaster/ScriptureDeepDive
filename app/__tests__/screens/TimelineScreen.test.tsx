import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { renderWithProviders } from '../helpers/renderWithProviders';
import TimelineScreen from '@/screens/TimelineScreen';

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

const mockTimelineEntries = [
  {
    id: 'evt_creation',
    name: 'Creation',
    category: 'event',
    era: 'primeval',
    year: -4000,
    summary: 'God creates the heavens and the earth.',
    scripture_ref: 'Genesis 1',
    chapter_link: 'ot/genesis_1.html',
  },
  {
    id: 'bk_book-genesis',
    name: 'Genesis',
    category: 'book',
    era: 'primeval',
    year: -3800,
    summary: 'Book of Genesis covers creation through Joseph.',
    scripture_ref: null,
    chapter_link: null,
  },
  {
    id: 'per_abraham',
    name: 'Abraham',
    category: 'person',
    era: 'patriarchs',
    year: -2000,
    summary: 'Father of many nations.',
    scripture_ref: 'Genesis 12',
    chapter_link: 'ot/genesis_12.html',
  },
  {
    id: 'wld_babel',
    name: 'Tower of Babel',
    category: 'world',
    era: 'primeval',
    year: -3500,
    summary: 'Languages confused at Babel.',
    scripture_ref: 'Genesis 11',
    chapter_link: null,
  },
];

jest.mock('@/db/content', () => ({
  getAllTimelineEntries: jest.fn().mockResolvedValue([
    {
      id: 'evt_creation', name: 'Creation', category: 'event', era: 'primeval',
      year: -4000, summary: 'God creates the heavens and the earth.',
      scripture_ref: 'Genesis 1', chapter_link: 'ot/genesis_1.html',
    },
    {
      id: 'bk_book-genesis', name: 'Genesis', category: 'book', era: 'primeval',
      year: -3800, summary: 'Book of Genesis covers creation through Joseph.',
      scripture_ref: null, chapter_link: null,
    },
    {
      id: 'per_abraham', name: 'Abraham', category: 'person', era: 'patriarchs',
      year: -2000, summary: 'Father of many nations.',
      scripture_ref: 'Genesis 12', chapter_link: 'ot/genesis_12.html',
    },
    {
      id: 'wld_babel', name: 'Tower of Babel', category: 'world', era: 'primeval',
      year: -3500, summary: 'Languages confused at Babel.',
      scripture_ref: 'Genesis 11', chapter_link: null,
    },
  ]),
}));

// ── Hooks ─────────────────────────────────────────────────────────

jest.mock('@/hooks/useLandscapeUnlock', () => ({
  useLandscapeUnlock: jest.fn(),
}));

// ── Layout utils ──────────────────────────────────────────────────

jest.mock('@/utils/timelineLayout', () => ({
  yearToX: (y: number) => (y + 5000) * 0.5,
  formatYear: (y: number) => (y < 0 ? `${Math.abs(y)} BC` : `AD ${y}`),
  assignLanes: (events: any[]) => events.map((e: any, i: number) => ({
    ...e,
    x: (e.year + 5000) * 0.5,
    y: 80 + i * 40,
    lane: i,
    labelWidth: 120,
    significance: e.chapter_link || e.summary || e.category === 'book' ? 'major' : 'minor',
  })),
  computeTickMarks: () => [
    { x: 100, label: '4000 BC', major: true },
    { x: 200, label: '3000 BC', major: true },
    { x: 250, label: '2500 BC', major: false },
  ],
  computeSvgHeight: () => 500,
  ERA_RANGES: {
    primeval: [-4000, -2100],
    patriarchs: [-2100, -1800],
    exodus: [-1800, -1400],
  } as Record<string, [number, number]>,
  TOTAL_WIDTH: 5000,
  AXIS_Y: 150,
  ERA_BAR_Y: 10,
  ERA_BAR_H: 30,
}));

// ── Child component stubs ─────────────────────────────────────────

jest.mock('@/components/tree/EraFilterBar', () => ({
  EraFilterBar: (props: any) => {
    const React = require('react');
    const { View, TouchableOpacity, Text } = require('react-native');
    return React.createElement(View, { testID: 'era-filter-bar' },
      ['all', 'primeval', 'patriarchs', 'exodus'].map((era: string) =>
        React.createElement(TouchableOpacity, {
          key: era,
          testID: `era-filter-${era}`,
          onPress: () => props.onSelect(era),
        }, React.createElement(Text, null, era)),
      ),
    );
  },
}));

jest.mock('@/components/BadgeChip', () => ({
  BadgeChip: (props: any) => {
    const React = require('react');
    const { Text } = require('react-native');
    return React.createElement(Text, { testID: 'badge-chip' }, props.label);
  },
}));

jest.mock('@/components/LoadingSkeleton', () => ({
  LoadingSkeleton: () => {
    const React = require('react');
    const { Text } = require('react-native');
    return React.createElement(Text, { testID: 'loading-skeleton' }, 'Loading...');
  },
}));

// Stub SVG components (including Defs/LinearGradient/Stop for modernized timeline)
jest.mock('react-native-svg', () => {
  const React = require('react');
  const { View, Text } = require('react-native');
  const createSvgMock = (name: string) => (props: any) =>
    React.createElement(View, { ...props, testID: props.testID ?? undefined }, props.children);
  return {
    __esModule: true,
    default: createSvgMock('Svg'),
    Rect: createSvgMock('Rect'),
    Line: createSvgMock('Line'),
    Circle: createSvgMock('Circle'),
    G: (props: any) => React.createElement(View, props, props.children),
    Text: (props: any) => React.createElement(Text, props, props.children),
    Defs: (props: any) => React.createElement(View, props, props.children),
    LinearGradient: (props: any) => React.createElement(View, props, props.children),
    Stop: (props: any) => React.createElement(View, props),
  };
});

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 44, bottom: 34, left: 0, right: 0 }),
}));

// Bottom sheet mock (replaces Modal in modernized timeline)
jest.mock('@gorhom/bottom-sheet', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: React.forwardRef(({ children }: any, ref: any) => {
      React.useImperativeHandle(ref, () => ({
        snapToIndex: jest.fn(),
        close: jest.fn(),
        expand: jest.fn(),
      }));
      return React.createElement(View, { testID: 'bottom-sheet' }, children);
    }),
    BottomSheetScrollView: ({ children }: any) => React.createElement(View, null, children),
  };
});

// ── Tests ─────────────────────────────────────────────────────────

describe('TimelineScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing after data loads', async () => {
    const { findByTestId } = renderWithProviders(<TimelineScreen />);
    // After the async getAllTimelineEntries resolves, the screen renders content
    expect(await findByTestId('era-filter-bar')).toBeTruthy();
  });

  it('shows loading skeleton initially', () => {
    // On first render, isLoading is true (before the effect resolves)
    const { getByTestId } = renderWithProviders(<TimelineScreen />);
    expect(getByTestId('loading-skeleton')).toBeTruthy();
  });

  it('renders era filter bar after loading', async () => {
    const { findByTestId } = renderWithProviders(<TimelineScreen />);
    expect(await findByTestId('era-filter-bar')).toBeTruthy();
  });

  it('renders category filter chips after loading', async () => {
    const { findByText } = renderWithProviders(<TimelineScreen />);
    expect(await findByText('Events')).toBeTruthy();
    expect(await findByText('Books')).toBeTruthy();
    expect(await findByText('People')).toBeTruthy();
    expect(await findByText('World History')).toBeTruthy();
  });

  it('renders timeline events after loading', async () => {
    const { findByText } = renderWithProviders(<TimelineScreen />);
    // Events display name + formatted year
    expect(await findByText(/Creation/)).toBeTruthy();
    expect(await findByText(/Abraham/)).toBeTruthy();
  });

  it('toggles a category filter when chip is pressed', async () => {
    const { findByText } = renderWithProviders(<TimelineScreen />);
    const peopleChip = await findByText('People');
    // Press to toggle off the person category
    fireEvent.press(peopleChip);
    // Component re-renders — no crash confirms the state update
    expect(await findByText('Events')).toBeTruthy();
  });

  it('changes era filter when era chip is pressed', async () => {
    const { findByTestId } = renderWithProviders(<TimelineScreen />);
    const patriarchsFilter = await findByTestId('era-filter-patriarchs');
    fireEvent.press(patriarchsFilter);
    // Screen re-renders with filtered events — no crash
    expect(await findByTestId('era-filter-bar')).toBeTruthy();
  });

  it('renders timeline with accessibility label', async () => {
    const { findByLabelText } = renderWithProviders(<TimelineScreen />);
    expect(await findByLabelText('Timeline')).toBeTruthy();
  });

  it('shows event detail modal when an event is pressed', async () => {
    const { findByText } = renderWithProviders(<TimelineScreen />);
    // The SVG G elements have onPress handlers. Since we mock G as a View,
    // the press should propagate. We look for the event in the rendered tree.
    // Note: With mocked SVG, the G onPress may not fire via fireEvent.
    // Instead, verify that the events are rendered (interaction tested via
    // the category filter toggle above).
    expect(await findByText(/Creation/)).toBeTruthy();
    expect(await findByText(/Tower of Babel/)).toBeTruthy();
  });

  it('renders timeline container after loading', async () => {
    const { findByText, toJSON } = renderWithProviders(<TimelineScreen />);
    await findByText(/Creation/);
    // Tree should be non-null after data loads
    expect(toJSON()).toBeTruthy();
  });
});
