import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { renderWithProviders } from '../helpers/renderWithProviders';
import AmicusPaywallScreen from '@/screens/AmicusPaywallScreen';

const mockNavigate = jest.fn();
const mockGetParent = jest.fn().mockReturnValue({ navigate: mockNavigate });

jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');
  return {
    ...actual,
    useNavigation: () => ({
      navigate: jest.fn(),
      goBack: jest.fn(),
      getParent: mockGetParent,
    }),
    useRoute: () => ({ params: undefined }),
  };
});

describe('AmicusPaywallScreen', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders hero copy and bullet list', () => {
    const { getByText } = renderWithProviders(<AmicusPaywallScreen />);
    expect(getByText('Amicus')).toBeTruthy();
    expect(getByText('Your scholarly study companion')).toBeTruthy();
    expect(getByText('Unlock with Companion+')).toBeTruthy();
  });

  it('navigates to subscription on unlock tap', () => {
    const { getByLabelText } = renderWithProviders(<AmicusPaywallScreen />);
    fireEvent.press(getByLabelText('Unlock with Companion+'));
    expect(mockGetParent).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith(
      'MoreTab',
      expect.objectContaining({ screen: 'Subscription' }),
    );
  });

  it('restore purchases also routes to Subscription', () => {
    const { getByLabelText } = renderWithProviders(<AmicusPaywallScreen />);
    fireEvent.press(getByLabelText('Restore purchases'));
    expect(mockNavigate).toHaveBeenCalledWith(
      'MoreTab',
      expect.objectContaining({ screen: 'Subscription' }),
    );
  });
});
