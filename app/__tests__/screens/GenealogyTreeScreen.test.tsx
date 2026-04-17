import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { renderWithProviders } from '../helpers/renderWithProviders';
import GenealogyTreeScreen from '@/screens/GenealogyTreeScreen';

// ── Navigation mock ───────────────────────────────────────────────

const mockNavigate = jest.fn();
const mockGoBack = jest.fn();

const mockRoute = {
  params: {},
  key: 'genealogy-1',
  name: 'GenealogyTree',
};

// ── Stores ────────────────────────────────────────────────────────

jest.mock('@/stores', () => ({
  useSettingsStore: (sel: any) => sel({ translation: 'kjv', fontSize: 16 }),
  useReaderStore: (sel: any) => sel({}),
}));

// ── Hooks ─────────────────────────────────────────────────────────

const mockPeopleData = {
  people: [
    { id: 'adam', name: 'Adam', era: 'primeval', bio: 'First man', father_id: null, mother_id: null, spouse_id: 'eve' },
    { id: 'eve', name: 'Eve', era: 'primeval', bio: 'First woman', father_id: null, mother_id: null, spouse_id: 'adam' },
    { id: 'seth', name: 'Seth', era: 'primeval', bio: 'Son of Adam', father_id: 'adam', mother_id: 'eve', spouse_id: null },
  ],
  isLoading: false,
};

jest.mock('@/hooks/usePeople', () => ({
  usePeople: () => mockPeopleData,
}));

const mockTreeLayout = {
  nodes: [
    { data: { id: 'adam', name: 'Adam', era: 'primeval' }, x: 100, y: 50, tier: 1 },
    { data: { id: 'eve', name: 'Eve', era: 'primeval' }, x: 200, y: 50, tier: 1 },
    { data: { id: 'seth', name: 'Seth', era: 'primeval' }, x: 150, y: 150, tier: 1 },
    // A prophets-era person so the divided_kingdom → prophets fallback
    // has somewhere to land in the fixture.
    { data: { id: 'isaiah', name: 'Isaiah', era: 'prophets' }, x: 500, y: 800, tier: 2 },
  ],
  links: [],
  marriageBars: [],
  spouseConnectors: [],
  associationLinks: [],
  associateBloomLabels: [],
  associateTrails: [],
  spineIds: new Set(['adam', 'seth']),
  bounds: { width: 2000, height: 2000, minX: 0, minY: 0 },
};

jest.mock('@/hooks/useTreeLayout', () => ({
  useTreeLayout: () => mockTreeLayout,
}));

const mockCentreOnNode = jest.fn();
const mockCentreOnNodeTop = jest.fn();
const mockCentreOnNodeAbovePanel = jest.fn();

jest.mock('@/hooks/useTreeCamera', () => ({
  useTreeCamera: () => ({
    gesture: { _handlers: {} },
    camera: { x: 0, y: 0, zoom: 0.45 },
    viewBox: '0 0 500 900',
    viewW: 500,
    viewH: 900,
    centreOnNode: mockCentreOnNode,
    centreOnNodeTop: mockCentreOnNodeTop,
    centreOnNodeAbovePanel: mockCentreOnNodeAbovePanel,
  }),
}));

jest.mock('@/hooks/useVisibleNodes', () => ({
  useVisibleNodes: () => ({
    nodes: [],
    links: [],
    marriageBars: [],
    spouseConnectors: [],
    associationLinks: [],
    associateBloomLabels: [],
    associateTrails: [],
  }),
}));

jest.mock('@/hooks/useLandscapeUnlock', () => ({
  useLandscapeUnlock: jest.fn(),
}));

// ── Child component stubs ─────────────────────────────────────────

jest.mock('@/components/tree/TreeCanvas', () => ({
  TreeCanvas: () => 'TreeCanvas',
}));

jest.mock('@/components/tree/EraFilterBar', () => ({
  EraFilterBar: (props: any) => {
    const React = require('react');
    const { View, TouchableOpacity, Text } = require('react-native');
    return React.createElement(View, { testID: 'era-filter-bar' },
      ['all', 'primeval', 'patriarchs', 'exodus', 'divided_kingdom', 'prophets'].map((era: string) =>
        React.createElement(TouchableOpacity, {
          key: era,
          testID: `era-filter-${era}`,
          onPress: () => props.onSelect(era),
        }, React.createElement(Text, null, era)),
      ),
    );
  },
}));

jest.mock('@/components/tree/PersonSearchBar', () => ({
  PersonSearchBar: (props: any) => {
    const React = require('react');
    const { View, TextInput, TouchableOpacity, Text } = require('react-native');
    return React.createElement(View, { testID: 'person-search-bar' },
      React.createElement(TextInput, { testID: 'search-input', placeholder: 'Search people' }),
      // Simulate selecting the first person
      props.people?.length > 0 && React.createElement(
        TouchableOpacity,
        { testID: 'search-result-0', onPress: () => props.onSelect(props.people[0].id) },
        React.createElement(Text, null, props.people[0].name),
      ),
    );
  },
}));

jest.mock('@/components/PersonSidebar', () => ({
  PersonSidebar: (props: any) => {
    const React = require('react');
    const { View, Text, TouchableOpacity } = require('react-native');
    if (!props.visible) return null;
    return React.createElement(View, { testID: 'person-sidebar' },
      React.createElement(Text, { testID: 'sidebar-person-name' }, props.person?.name ?? ''),
      React.createElement(TouchableOpacity, { testID: 'sidebar-close', onPress: props.onClose }),
      props.onNavigate && React.createElement(
        TouchableOpacity,
        { testID: 'sidebar-navigate', onPress: () => props.onNavigate('seth') },
        React.createElement(Text, null, 'Navigate'),
      ),
      props.onChapterPress && React.createElement(
        TouchableOpacity,
        { testID: 'sidebar-chapter', onPress: () => props.onChapterPress('ot/genesis_1.html') },
        React.createElement(Text, null, 'Go to Chapter'),
      ),
    );
  },
}));

jest.mock('@/components/LoadingSkeleton', () => ({
  LoadingSkeleton: () => {
    const React = require('react');
    const { Text } = require('react-native');
    return React.createElement(Text, { testID: 'loading-skeleton' }, 'Loading...');
  },
}));

// Stub svg and gesture handler to avoid native module issues
jest.mock('react-native-svg', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: (props: any) => React.createElement(View, props),
  };
});

jest.mock('react-native-gesture-handler', () => ({
  GestureDetector: (props: any) => props.children,
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 44, bottom: 34, left: 0, right: 0 }),
}));

jest.mock('@/utils/logger', () => ({
  logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
}));

// ── Tests ─────────────────────────────────────────────────────────

describe('GenealogyTreeScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPeopleData.isLoading = false;
    mockPeopleData.people = [
      { id: 'adam', name: 'Adam', era: 'primeval', bio: 'First man', father_id: null, mother_id: null, spouse_id: 'eve' },
      { id: 'eve', name: 'Eve', era: 'primeval', bio: 'First woman', father_id: null, mother_id: null, spouse_id: 'adam' },
      { id: 'seth', name: 'Seth', era: 'primeval', bio: 'Son of Adam', father_id: 'adam', mother_id: 'eve', spouse_id: null },
    ] as any;
    mockRoute.params = {};
  });

  it('renders without crashing', () => {
    const { toJSON } = renderWithProviders(
      <GenealogyTreeScreen route={mockRoute as any} navigation={{ navigate: mockNavigate, goBack: mockGoBack } as any} />,
    );
    expect(toJSON()).toBeTruthy();
  });

  it('shows loading skeleton when isLoading is true', () => {
    mockPeopleData.isLoading = true;
    const { getByTestId } = renderWithProviders(
      <GenealogyTreeScreen route={mockRoute as any} navigation={{ navigate: mockNavigate, goBack: mockGoBack } as any} />,
    );
    expect(getByTestId('loading-skeleton')).toBeTruthy();
  });

  it('renders search bar and era filter bar when loaded', () => {
    const { getByTestId } = renderWithProviders(
      <GenealogyTreeScreen route={mockRoute as any} navigation={{ navigate: mockNavigate, goBack: mockGoBack } as any} />,
    );
    expect(getByTestId('person-search-bar')).toBeTruthy();
    expect(getByTestId('era-filter-bar')).toBeTruthy();
  });

  it('does not show person sidebar initially', () => {
    const { queryByTestId } = renderWithProviders(
      <GenealogyTreeScreen route={mockRoute as any} navigation={{ navigate: mockNavigate, goBack: mockGoBack } as any} />,
    );
    expect(queryByTestId('person-sidebar')).toBeNull();
  });

  it('changes era filter when an era chip is pressed', () => {
    const { getByTestId } = renderWithProviders(
      <GenealogyTreeScreen route={mockRoute as any} navigation={{ navigate: mockNavigate, goBack: mockGoBack } as any} />,
    );
    fireEvent.press(getByTestId('era-filter-patriarchs'));
    // The component calls setFilterEra('patriarchs') — verified by the tree re-rendering
    // (no crash proves the state update worked)
    expect(getByTestId('era-filter-bar')).toBeTruthy();
  });

  it('jumps to prophets region when divided_kingdom filter is selected', () => {
    // The fixture has zero people tagged with `era: 'divided_kingdom'`, so
    // the fallback chain should land on the first 'prophets' person
    // (Isaiah in the fixture at x=500, y=800).
    const { getByTestId } = renderWithProviders(
      <GenealogyTreeScreen route={mockRoute as any} navigation={{ navigate: mockNavigate, goBack: mockGoBack } as any} />,
    );
    mockCentreOnNode.mockClear();
    fireEvent.press(getByTestId('era-filter-divided_kingdom'));
    expect(mockCentreOnNode).toHaveBeenCalledWith(500, 800);
  });

  it('jumps to matching era directly when at least one person tagged with that era exists', () => {
    const { getByTestId } = renderWithProviders(
      <GenealogyTreeScreen route={mockRoute as any} navigation={{ navigate: mockNavigate, goBack: mockGoBack } as any} />,
    );
    mockCentreOnNode.mockClear();
    fireEvent.press(getByTestId('era-filter-prophets'));
    // Direct match on prophets → Isaiah at (500, 800) — no fallback needed.
    expect(mockCentreOnNode).toHaveBeenCalledWith(500, 800);
  });

  it('opens person sidebar when search result is selected', () => {
    const { getByTestId } = renderWithProviders(
      <GenealogyTreeScreen route={mockRoute as any} navigation={{ navigate: mockNavigate, goBack: mockGoBack } as any} />,
    );
    fireEvent.press(getByTestId('search-result-0'));
    expect(getByTestId('person-sidebar')).toBeTruthy();
    expect(getByTestId('sidebar-person-name').props.children).toBe('Adam');
  });

  it('closes person sidebar when close is pressed', () => {
    const { getByTestId, queryByTestId } = renderWithProviders(
      <GenealogyTreeScreen route={mockRoute as any} navigation={{ navigate: mockNavigate, goBack: mockGoBack } as any} />,
    );
    // Open sidebar via search
    fireEvent.press(getByTestId('search-result-0'));
    expect(getByTestId('person-sidebar')).toBeTruthy();
    // Close sidebar
    fireEvent.press(getByTestId('sidebar-close'));
    expect(queryByTestId('person-sidebar')).toBeNull();
  });

  it('navigates to a family member via sidebar', () => {
    const { getByTestId } = renderWithProviders(
      <GenealogyTreeScreen route={mockRoute as any} navigation={{ navigate: mockNavigate, goBack: mockGoBack } as any} />,
    );
    // Open sidebar
    fireEvent.press(getByTestId('search-result-0'));
    // Navigate to Seth
    fireEvent.press(getByTestId('sidebar-navigate'));
    expect(getByTestId('sidebar-person-name').props.children).toBe('Seth');
  });

  it('navigates to chapter screen via sidebar chapter link', () => {
    const { getByTestId } = renderWithProviders(
      <GenealogyTreeScreen route={mockRoute as any} navigation={{ navigate: mockNavigate, goBack: mockGoBack } as any} />,
    );
    // Open sidebar
    fireEvent.press(getByTestId('search-result-0'));
    // Press chapter link
    fireEvent.press(getByTestId('sidebar-chapter'));
    expect(mockNavigate).toHaveBeenCalledWith('ReadTab', {
      screen: 'Chapter',
      params: { bookId: 'genesis', chapterNum: 1 },
    });
  });

  it('renders the family tree accessibility label', () => {
    const { getByLabelText } = renderWithProviders(
      <GenealogyTreeScreen route={mockRoute as any} navigation={{ navigate: mockNavigate, goBack: mockGoBack } as any} />,
    );
    expect(getByLabelText('Family tree')).toBeTruthy();
  });
});
