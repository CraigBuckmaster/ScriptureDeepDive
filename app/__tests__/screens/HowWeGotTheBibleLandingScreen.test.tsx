/**
 * HowWeGotTheBibleLandingScreen.test.tsx — Landing page for the HWGTB
 * content bundle (HWGTB-P2-04 / #1549).
 */

import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { renderWithProviders } from '../helpers/renderWithProviders';
import HowWeGotTheBibleLandingScreen from '@/screens/HowWeGotTheBibleLandingScreen';

// ── Navigation mock ─────────────────────────────────────────────
const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');
  return {
    ...actual,
    useNavigation: () => ({
      navigate: mockNavigate,
      goBack: mockGoBack,
      push: jest.fn(),
      setOptions: jest.fn(),
    }),
    useScrollToTop: jest.fn(),
    useFocusEffect: (cb: () => void) => cb(),
  };
});

jest.mock('lucide-react-native', () => ({
  ChevronLeft: () => null,
  ChevronRight: () => null,
  BookOpen: () => null,
  Scale: () => null,
  Map: () => null,
  BookCopy: () => null,
  Languages: () => null,
}));

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children }: any) => children,
  useSafeAreaInsets: () => ({ top: 44, bottom: 34, left: 0, right: 0 }),
}));

jest.mock('expo-image', () => ({
  Image: () => null,
}));

// Mock the explore-images hook so the hero image branch exercises
jest.mock('@/hooks/useExploreImages', () => ({
  useExploreImages: () => ({
    HowWeGotTheBible: {
      count: null,
      noun: 'study bundle',
      contentType: null,
      images: [
        {
          url: 'https://example.org/hwgtb.png',
          caption: 'How We Got The Bible',
          credit: 'Companion Study',
        },
      ],
    },
  }),
}));

beforeEach(() => {
  jest.clearAllMocks();
});

describe('HowWeGotTheBibleLandingScreen', () => {
  it('renders the page title', () => {
    const { getByText } = renderWithProviders(<HowWeGotTheBibleLandingScreen />);
    expect(getByText('How We Got The Bible')).toBeTruthy();
  });

  it('renders the intro copy (evangelical-framed)', () => {
    const { getByText } = renderWithProviders(<HowWeGotTheBibleLandingScreen />);
    expect(getByText(/follows the canon through 1,500 years/)).toBeTruthy();
    expect(getByText(/Evangelical in framing/)).toBeTruthy();
  });

  it('renders all four landing entries', () => {
    const { getByText } = renderWithProviders(<HowWeGotTheBibleLandingScreen />);
    expect(getByText('Extra-Biblical Literature')).toBeTruthy();
    expect(getByText('Canon Comparison')).toBeTruthy();
    expect(getByText('Canon Formation')).toBeTruthy();
    expect(getByText('Text & Translation')).toBeTruthy();
  });

  it('renders the escape hatch row', () => {
    const { getByLabelText } = renderWithProviders(<HowWeGotTheBibleLandingScreen />);
    expect(getByLabelText('Browse all guided journeys')).toBeTruthy();
  });

  it('Canon Comparison shows "Coming soon" label (HWGTB-P3-01 not yet shipped)', () => {
    const { getByLabelText } = renderWithProviders(<HowWeGotTheBibleLandingScreen />);
    expect(getByLabelText('Coming soon')).toBeTruthy();
  });

  it('tapping Extra-Biblical Literature navigates to ExtraBiblicalIndex', () => {
    const { getByLabelText } = renderWithProviders(<HowWeGotTheBibleLandingScreen />);
    fireEvent.press(getByLabelText('Open Extra-Biblical Literature'));
    expect(mockNavigate).toHaveBeenCalledWith('ExtraBiblicalIndex');
  });

  it('tapping Canon Formation navigates to JourneyDetail with canon-formation id', () => {
    const { getByLabelText } = renderWithProviders(<HowWeGotTheBibleLandingScreen />);
    fireEvent.press(getByLabelText('Open Canon Formation'));
    expect(mockNavigate).toHaveBeenCalledWith('JourneyDetail', {
      journeyId: 'canon-formation',
    });
  });

  it('tapping Text & Translation navigates to JourneyDetail with text-and-translation id', () => {
    const { getByLabelText } = renderWithProviders(<HowWeGotTheBibleLandingScreen />);
    fireEvent.press(getByLabelText('Open Text & Translation'));
    expect(mockNavigate).toHaveBeenCalledWith('JourneyDetail', {
      journeyId: 'text-and-translation',
    });
  });

  it('tapping the escape hatch navigates to JourneyBrowse with no params', () => {
    const { getByLabelText } = renderWithProviders(<HowWeGotTheBibleLandingScreen />);
    fireEvent.press(getByLabelText('Browse all guided journeys'));
    expect(mockNavigate).toHaveBeenCalledWith('JourneyBrowse', undefined);
  });

  it('Canon Comparison entry has no onPress handler (no navigation fired)', () => {
    const { queryByLabelText } = renderWithProviders(<HowWeGotTheBibleLandingScreen />);
    // When locked, the container is a View (not TouchableOpacity) so it
    // has no 'Open Canon Comparison' accessibility label.
    expect(queryByLabelText('Open Canon Comparison')).toBeNull();
  });

  it('back button fires navigation.goBack', () => {
    const { getByLabelText } = renderWithProviders(<HowWeGotTheBibleLandingScreen />);
    fireEvent.press(getByLabelText('Go back'));
    expect(mockGoBack).toHaveBeenCalled();
  });
});
