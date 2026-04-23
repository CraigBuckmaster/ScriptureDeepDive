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

  it('renders all three landing entries', () => {
    const { getByText } = renderWithProviders(<HowWeGotTheBibleLandingScreen />);
    expect(getByText('Extra-Biblical Literature')).toBeTruthy();
    expect(getByText('Canon Comparison')).toBeTruthy();
    expect(getByText('Guided Journeys')).toBeTruthy();
  });

  it('tapping Extra-Biblical Literature navigates to ExtraBiblicalIndex', () => {
    const { getByLabelText } = renderWithProviders(<HowWeGotTheBibleLandingScreen />);
    fireEvent.press(getByLabelText('Open Extra-Biblical Literature'));
    expect(mockNavigate).toHaveBeenCalledWith('ExtraBiblicalIndex');
  });

  it('tapping Guided Journeys navigates to JourneyBrowse with featured tab', () => {
    const { getByLabelText } = renderWithProviders(<HowWeGotTheBibleLandingScreen />);
    fireEvent.press(getByLabelText('Open Guided Journeys'));
    expect(mockNavigate).toHaveBeenCalledWith('JourneyBrowse', {
      tab: 'featured',
    });
  });

  // HWGTB #1555 — CanonComparisonScreen shipped in #1550, so this entry is
  // now live (the "Coming soon" label is gone).
  it('tapping Canon Comparison navigates to CanonComparison', () => {
    const { getByLabelText } = renderWithProviders(<HowWeGotTheBibleLandingScreen />);
    fireEvent.press(getByLabelText('Open Canon Comparison'));
    expect(mockNavigate).toHaveBeenCalledWith('CanonComparison');
  });

  it('back button fires navigation.goBack', () => {
    const { getByLabelText } = renderWithProviders(<HowWeGotTheBibleLandingScreen />);
    fireEvent.press(getByLabelText('Go back'));
    expect(mockGoBack).toHaveBeenCalled();
  });
});
