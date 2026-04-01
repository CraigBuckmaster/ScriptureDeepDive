import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { renderWithProviders } from '../helpers/renderWithProviders';
import MoreMenuScreen from '@/screens/MoreMenuScreen';

// ── Override useNavigation with a trackable mock ─────────────────
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');
  return {
    ...actual,
    useNavigation: () => ({
      navigate: mockNavigate,
      goBack: jest.fn(),
      push: jest.fn(),
      setOptions: jest.fn(),
    }),
    useRoute: () => ({ params: {} }),
    useScrollToTop: jest.fn(),
    useFocusEffect: (cb: () => void) => cb(),
  };
});

beforeEach(() => {
  mockNavigate.mockClear();
});

describe('MoreMenuScreen', () => {
  it('renders the More heading', () => {
    const { getByText } = renderWithProviders(<MoreMenuScreen />);
    expect(getByText('More')).toBeTruthy();
  });

  it('renders all menu items', () => {
    const { getByText } = renderWithProviders(<MoreMenuScreen />);
    expect(getByText('All Notes')).toBeTruthy();
    expect(getByText('Bookmarks')).toBeTruthy();
    expect(getByText('Reading History')).toBeTruthy();
    expect(getByText('Reading Plans')).toBeTruthy();
    expect(getByText('Settings')).toBeTruthy();
  });

  it('navigates to AllNotes when tapping All Notes', () => {
    const { getByText } = renderWithProviders(<MoreMenuScreen />);
    fireEvent.press(getByText('All Notes'));
    expect(mockNavigate).toHaveBeenCalledWith('AllNotes');
  });

  it('navigates to Settings when tapping Settings', () => {
    const { getByText } = renderWithProviders(<MoreMenuScreen />);
    fireEvent.press(getByText('Settings'));
    expect(mockNavigate).toHaveBeenCalledWith('Settings');
  });
});
