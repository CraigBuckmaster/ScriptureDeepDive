import React from 'react';
import { renderWithProviders } from '../helpers/renderWithProviders';
import LoginScreen from '@/screens/LoginScreen';

jest.mock('@/stores', () => ({
  useSettingsStore: (sel: any) =>
    sel({ translation: 'kjv', fontSize: 16, ttsVoice: '' }),
  useAuthStore: (sel: any) =>
    sel({
      user: null,
      isLoading: false,
      signInWithEmail: jest.fn(),
      signUpWithEmail: jest.fn(),
      signInWithGoogle: jest.fn(),
      signInWithFacebook: jest.fn(),
      resetPassword: jest.fn(),
    }),
}));

const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({ navigate: mockNavigate, goBack: mockGoBack }),
}));

describe('LoginScreen', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders without crashing', () => {
    const { getAllByText } = renderWithProviders(<LoginScreen />);
    expect(getAllByText('Sign In').length).toBeGreaterThanOrEqual(1);
  });

  it('shows Sign In heading', () => {
    const { getAllByText } = renderWithProviders(<LoginScreen />);
    // ScreenHeader title + primary button both say "Sign In"
    const matches = getAllByText('Sign In');
    expect(matches.length).toBeGreaterThanOrEqual(1);
  });

  it('shows Continue with Google button', () => {
    const { getByText } = renderWithProviders(<LoginScreen />);
    expect(getByText('Continue with Google')).toBeTruthy();
  });

  it('shows Continue with Facebook button', () => {
    const { getByText } = renderWithProviders(<LoginScreen />);
    expect(getByText('Continue with Facebook')).toBeTruthy();
  });

  it('shows email and password inputs', () => {
    const { getByPlaceholderText } = renderWithProviders(<LoginScreen />);
    expect(getByPlaceholderText('Email')).toBeTruthy();
    expect(getByPlaceholderText('Password')).toBeTruthy();
  });

  it('shows "Don\'t have an account? Sign Up" link', () => {
    const { getByText } = renderWithProviders(<LoginScreen />);
    expect(getByText(/Don't have an account\?/)).toBeTruthy();
  });

  it('shows "Forgot password?" link', () => {
    const { getByText } = renderWithProviders(<LoginScreen />);
    expect(getByText('Forgot password?')).toBeTruthy();
  });
});
