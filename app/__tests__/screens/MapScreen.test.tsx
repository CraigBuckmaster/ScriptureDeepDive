import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { renderWithProviders } from '../helpers/renderWithProviders';
import MapScreen from '@/screens/MapScreen';

// ── Navigation mock ───────────────────────────────────────────────

const mockNavigate = jest.fn();
const mockGoBack = jest.fn();

const mockRoute = {
  params: {},
  key: 'map-1',
  name: 'Map',
};

// ── Stores ────────────────────────────────────────────────────────

jest.mock('@/stores', () => ({
  useSettingsStore: (sel: any) => sel({ translation: 'kjv', fontSize: 16 }),
  useReaderStore: (sel: any) => sel({}),
}));

// ── Hooks ─────────────────────────────────────────────────────────

const mockPlacesData = {
  places: [
    {
      id: 'jerusalem', ancient_name: 'Jerusalem', modern_name: 'Yerushalayim',
      latitude: 31.77, longitude: 35.23, type: 'city', priority: 1, label_dir: 'n',
    },
    {
      id: 'bethlehem', ancient_name: 'Bethlehem', modern_name: 'Beit Lehem',
      latitude: 31.70, longitude: 35.20, type: 'city', priority: 1, label_dir: 'n',
    },
    {
      id: 'nazareth', ancient_name: 'Nazareth', modern_name: 'Nazaret',
      latitude: 32.70, longitude: 35.30, type: 'city', priority: 1, label_dir: 'n',
    },
  ],
  isLoading: false,
};

const mockStoriesData = {
  stories: [
    {
      id: 'exodus-journey',
      name: 'The Exodus',
      era: 'exodus',
      summary: 'Israel leaves Egypt',
      places_json: '["jerusalem"]',
      chapter_link: 'ot/exodus_12.html',
    },
    {
      id: 'nativity',
      name: 'Birth of Jesus',
      era: 'gospels',
      summary: 'Jesus born in Bethlehem',
      places_json: '["bethlehem","nazareth"]',
      chapter_link: 'nt/luke_2.html',
    },
  ],
  isLoading: false,
};

jest.mock('@/hooks/usePlaces', () => ({
  usePlaces: () => mockPlacesData,
}));

jest.mock('@/hooks/useMapStories', () => ({
  useMapStories: () => mockStoriesData,
}));

jest.mock('@/hooks/useMapZoom', () => ({
  useMapZoom: () => ({
    zoomLevel: 5,
    onRegionChange: jest.fn(),
  }),
}));

jest.mock('@/hooks/useLandscapeUnlock', () => ({
  useLandscapeUnlock: jest.fn(),
}));

jest.mock('@/utils/mapStyles', () => ({
  ancientMapStyle: [],
  modernMapStyle: [],
}));

// ── Child component stubs ─────────────────────────────────────────

// MapView as simple View
jest.mock('react-native-maps', () => {
  const React = require('react');
  const { View } = require('react-native');
  const MockMapView = React.forwardRef((props: any, ref: any) => {
    React.useImperativeHandle(ref, () => ({
      animateToRegion: jest.fn(),
      fitToCoordinates: jest.fn(),
    }));
    return React.createElement(View, { testID: 'map-view', ...props }, props.children);
  });
  MockMapView.displayName = 'MockMapView';
  return {
    __esModule: true,
    default: MockMapView,
    PROVIDER_GOOGLE: 'google',
    PROVIDER_DEFAULT: undefined,
  };
});

jest.mock('@/components/tree/EraFilterBar', () => ({
  EraFilterBar: (props: any) => {
    const React = require('react');
    const { View, TouchableOpacity, Text } = require('react-native');
    return React.createElement(View, { testID: 'era-filter-bar' },
      ['all', 'exodus', 'gospels'].map((era: string) =>
        React.createElement(TouchableOpacity, {
          key: era,
          testID: `era-filter-${era}`,
          onPress: () => props.onSelect(era),
        }, React.createElement(Text, null, era)),
      ),
    );
  },
}));

jest.mock('@/components/map/PlaceMarkerList', () => ({
  PlaceMarkerList: (props: any) => {
    const React = require('react');
    const { View, TouchableOpacity, Text } = require('react-native');
    return React.createElement(View, { testID: 'place-marker-list' },
      (props.places ?? []).map((p: any) =>
        React.createElement(
          TouchableOpacity,
          {
            key: p.id,
            testID: `marker-${p.id}`,
            onPress: () => props.onPlacePress?.(p),
          },
          React.createElement(Text, null, p.ancient_name ?? p.name),
        ),
      ),
    );
  },
}));

jest.mock('@/components/map/StoryOverlays', () => ({
  StoryOverlays: () => {
    const React = require('react');
    const { View } = require('react-native');
    return React.createElement(View, { testID: 'story-overlays' });
  },
}));

jest.mock('@/components/map/StoryPicker', () => ({
  StoryPicker: (props: any) => {
    const React = require('react');
    const { View, TouchableOpacity, Text } = require('react-native');
    return React.createElement(View, { testID: 'story-picker' },
      (props.stories ?? []).map((s: any) =>
        React.createElement(TouchableOpacity, {
          key: s.id,
          testID: `story-chip-${s.id}`,
          onPress: () => props.onSelect(s.id),
        }, React.createElement(Text, null, s.name)),
      ),
    );
  },
}));

jest.mock('@/components/map/StoryPanel', () => ({
  StoryPanel: (props: any) => {
    const React = require('react');
    const { View, Text, TouchableOpacity } = require('react-native');
    return React.createElement(View, { testID: 'story-panel' },
      React.createElement(Text, { testID: 'story-panel-name' }, props.story?.name ?? ''),
      React.createElement(TouchableOpacity, { testID: 'story-panel-close', onPress: props.onClose }),
      React.createElement(TouchableOpacity, { testID: 'story-panel-chapter', onPress: props.onChapterPress }),
    );
  },
}));

jest.mock('@/components/map/FloatingControls', () => ({
  FloatingControls: (props: any) => {
    const React = require('react');
    const { View, TouchableOpacity } = require('react-native');
    return React.createElement(View, { testID: 'floating-controls' },
      React.createElement(TouchableOpacity, { testID: 'toggle-names', onPress: props.onToggleNames }),
      React.createElement(TouchableOpacity, { testID: 'centre-button', onPress: props.onCentre }),
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

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 44, bottom: 34, left: 0, right: 0 }),
}));

jest.mock('@/utils/logger', () => ({
  logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
  safeParse: <T,>(json: string | null | undefined, fallback: T): T => {
    if (!json) return fallback;
    try {
      return JSON.parse(json) as T;
    } catch {
      return fallback;
    }
  },
}));

// ── Tests ─────────────────────────────────────────────────────────

describe('MapScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPlacesData.isLoading = false;
    mockStoriesData.isLoading = false;
    mockRoute.params = {};
  });

  it('renders without crashing', () => {
    const { toJSON } = renderWithProviders(
      <MapScreen route={mockRoute as any} navigation={{ navigate: mockNavigate, goBack: mockGoBack } as any} />,
    );
    expect(toJSON()).toBeTruthy();
  });

  it('shows loading skeleton when places are loading', () => {
    mockPlacesData.isLoading = true;
    const { getByTestId } = renderWithProviders(
      <MapScreen route={mockRoute as any} navigation={{ navigate: mockNavigate, goBack: mockGoBack } as any} />,
    );
    expect(getByTestId('loading-skeleton')).toBeTruthy();
  });

  it('shows loading skeleton when stories are loading', () => {
    mockStoriesData.isLoading = true;
    const { getByTestId } = renderWithProviders(
      <MapScreen route={mockRoute as any} navigation={{ navigate: mockNavigate, goBack: mockGoBack } as any} />,
    );
    expect(getByTestId('loading-skeleton')).toBeTruthy();
  });

  it('renders map view with place markers when loaded', () => {
    const { getByTestId } = renderWithProviders(
      <MapScreen route={mockRoute as any} navigation={{ navigate: mockNavigate, goBack: mockGoBack } as any} />,
    );
    expect(getByTestId('map-view')).toBeTruthy();
    expect(getByTestId('place-marker-list')).toBeTruthy();
    expect(getByTestId('marker-jerusalem')).toBeTruthy();
    expect(getByTestId('marker-bethlehem')).toBeTruthy();
  });

  it('renders story picker and era filter bar', () => {
    const { getByTestId } = renderWithProviders(
      <MapScreen route={mockRoute as any} navigation={{ navigate: mockNavigate, goBack: mockGoBack } as any} />,
    );
    expect(getByTestId('story-picker')).toBeTruthy();
    expect(getByTestId('era-filter-bar')).toBeTruthy();
  });

  it('opens story panel when a story chip is selected', () => {
    const { getByTestId } = renderWithProviders(
      <MapScreen route={mockRoute as any} navigation={{ navigate: mockNavigate, goBack: mockGoBack } as any} />,
    );
    fireEvent.press(getByTestId('story-chip-exodus-journey'));
    expect(getByTestId('story-panel')).toBeTruthy();
    expect(getByTestId('story-panel-name').props.children).toBe('The Exodus');
  });

  it('closes story panel when close is pressed', () => {
    const { getByTestId, queryByTestId } = renderWithProviders(
      <MapScreen route={mockRoute as any} navigation={{ navigate: mockNavigate, goBack: mockGoBack } as any} />,
    );
    // Open panel
    fireEvent.press(getByTestId('story-chip-exodus-journey'));
    expect(getByTestId('story-panel')).toBeTruthy();
    // Close panel
    fireEvent.press(getByTestId('story-panel-close'));
    expect(queryByTestId('story-panel')).toBeNull();
  });

  it('toggles story off when pressing the same story chip again', () => {
    const { getByTestId, queryByTestId } = renderWithProviders(
      <MapScreen route={mockRoute as any} navigation={{ navigate: mockNavigate, goBack: mockGoBack } as any} />,
    );
    fireEvent.press(getByTestId('story-chip-exodus-journey'));
    expect(getByTestId('story-panel')).toBeTruthy();
    // Press same story again to toggle off
    fireEvent.press(getByTestId('story-chip-exodus-journey'));
    expect(queryByTestId('story-panel')).toBeNull();
  });

  it('renders floating controls', () => {
    const { getByTestId } = renderWithProviders(
      <MapScreen route={mockRoute as any} navigation={{ navigate: mockNavigate, goBack: mockGoBack } as any} />,
    );
    expect(getByTestId('floating-controls')).toBeTruthy();
    expect(getByTestId('toggle-names')).toBeTruthy();
  });

  it('renders map with accessibility label', () => {
    const { getByTestId } = renderWithProviders(
      <MapScreen route={mockRoute as any} navigation={{ navigate: mockNavigate, goBack: mockGoBack } as any} />,
    );
    const mapView = getByTestId('map-view');
    expect(mapView.props.accessibilityLabel).toBe('Biblical world map');
  });

  it('filters stories by era when era filter is used', () => {
    const { getByTestId, queryByTestId } = renderWithProviders(
      <MapScreen route={mockRoute as any} navigation={{ navigate: mockNavigate, goBack: mockGoBack } as any} />,
    );
    // Select 'exodus' era filter
    fireEvent.press(getByTestId('era-filter-exodus'));

    // Story picker should show the exodus story, panel should open
    expect(getByTestId('story-panel')).toBeTruthy();
  });

  it('resets to initial region when "all" era is selected', () => {
    const { getByTestId, queryByTestId } = renderWithProviders(
      <MapScreen route={mockRoute as any} navigation={{ navigate: mockNavigate, goBack: mockGoBack } as any} />,
    );
    // Select a specific era first
    fireEvent.press(getByTestId('era-filter-exodus'));
    expect(getByTestId('story-panel')).toBeTruthy();

    // Select "all" era
    fireEvent.press(getByTestId('era-filter-all'));
    expect(queryByTestId('story-panel')).toBeNull();
  });

  it('toggles modern/ancient names with toggle button', () => {
    const { getByTestId } = renderWithProviders(
      <MapScreen route={mockRoute as any} navigation={{ navigate: mockNavigate, goBack: mockGoBack } as any} />,
    );
    fireEvent.press(getByTestId('toggle-names'));
    // Should not crash, toggle is handled internally
    expect(getByTestId('map-view')).toBeTruthy();
  });

  it('renders centre button that recentres map', () => {
    const { getByTestId } = renderWithProviders(
      <MapScreen route={mockRoute as any} navigation={{ navigate: mockNavigate, goBack: mockGoBack } as any} />,
    );
    fireEvent.press(getByTestId('centre-button'));
    // Should not crash
    expect(getByTestId('map-view')).toBeTruthy();
  });

  it('navigates to chapter when chapter press is triggered from story panel', () => {
    const { getByTestId } = renderWithProviders(
      <MapScreen route={mockRoute as any} navigation={{ navigate: mockNavigate, goBack: mockGoBack } as any} />,
    );
    // Open a story panel
    fireEvent.press(getByTestId('story-chip-exodus-journey'));
    expect(getByTestId('story-panel')).toBeTruthy();

    // Press the chapter link
    fireEvent.press(getByTestId('story-panel-chapter'));
    expect(mockNavigate).toHaveBeenCalledWith('ReadTab', {
      screen: 'Chapter',
      params: { bookId: 'exodus', chapterNum: 12 },
    });
  });

  it('re-centres on active story when centre button is pressed with active story', () => {
    const { getByTestId } = renderWithProviders(
      <MapScreen route={mockRoute as any} navigation={{ navigate: mockNavigate, goBack: mockGoBack } as any} />,
    );
    // Select a story first
    fireEvent.press(getByTestId('story-chip-nativity'));
    expect(getByTestId('story-panel')).toBeTruthy();

    // Press centre button - should recentre on active story
    fireEvent.press(getByTestId('centre-button'));
    expect(getByTestId('map-view')).toBeTruthy();
  });

  it('shows story overlays when a story is active', () => {
    const { getByTestId } = renderWithProviders(
      <MapScreen route={mockRoute as any} navigation={{ navigate: mockNavigate, goBack: mockGoBack } as any} />,
    );
    fireEvent.press(getByTestId('story-chip-exodus-journey'));
    expect(getByTestId('story-overlays')).toBeTruthy();
  });

  it('opens the place detail card when a marker is tapped', () => {
    const { getByTestId, getByText } = renderWithProviders(
      <MapScreen route={mockRoute as any} navigation={{ navigate: mockNavigate, goBack: mockGoBack } as any} />,
    );
    fireEvent.press(getByTestId('marker-jerusalem'));
    // Modern name only appears in the PlaceDetailCard, so it's a unique signal.
    expect(getByText('Yerushalayim')).toBeTruthy();
    // Coordinate footer is also unique to the card.
    expect(getByText(/31\.77° N · 35\.23° E/)).toBeTruthy();
  });

  it('lists related stories on the place detail card', () => {
    const { getByTestId, getByLabelText } = renderWithProviders(
      <MapScreen route={mockRoute as any} navigation={{ navigate: mockNavigate, goBack: mockGoBack } as any} />,
    );
    fireEvent.press(getByTestId('marker-bethlehem'));
    // Bethlehem appears in the 'nativity' story per mockStoriesData. The
    // PlaceDetailCard's chip uses an "Open story ..." accessibility label
    // which is unique versus the chip in the StoryPicker.
    expect(getByLabelText(/Open story Birth of Jesus/)).toBeTruthy();
  });

  it('switches from the place card to a story when a related story chip is tapped', () => {
    const { getByTestId, getByLabelText } = renderWithProviders(
      <MapScreen route={mockRoute as any} navigation={{ navigate: mockNavigate, goBack: mockGoBack } as any} />,
    );
    fireEvent.press(getByTestId('marker-bethlehem'));
    fireEvent.press(getByLabelText(/Open story Birth of Jesus/));
    // Story panel opens; the place card unmounts (so its labelled chip vanishes).
    expect(getByTestId('story-panel')).toBeTruthy();
  });

  it('closes the place detail card when its close button is pressed', () => {
    const { getByTestId, getByLabelText, queryByText } = renderWithProviders(
      <MapScreen route={mockRoute as any} navigation={{ navigate: mockNavigate, goBack: mockGoBack } as any} />,
    );
    fireEvent.press(getByTestId('marker-jerusalem'));
    expect(queryByText('Yerushalayim')).toBeTruthy();
    fireEvent.press(getByLabelText('Close place details'));
    expect(queryByText('Yerushalayim')).toBeNull();
  });

  it('closes the story panel when a marker is tapped', () => {
    const { getByTestId, queryByTestId, queryByText } = renderWithProviders(
      <MapScreen route={mockRoute as any} navigation={{ navigate: mockNavigate, goBack: mockGoBack } as any} />,
    );
    // Open story panel first
    fireEvent.press(getByTestId('story-chip-nativity'));
    expect(getByTestId('story-panel')).toBeTruthy();
    // Tap a marker — story panel closes, place card opens
    fireEvent.press(getByTestId('marker-jerusalem'));
    expect(queryByTestId('story-panel')).toBeNull();
    expect(queryByText('Yerushalayim')).toBeTruthy();
  });
});
