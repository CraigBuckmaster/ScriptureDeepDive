import React from 'react';
import { renderWithProviders } from '../helpers/renderWithProviders';
import SignUpScreen from '@/screens/SignUpScreen';

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

describe('SignUpScreen', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders without crashing', () => {
    const { getAllByText } = renderWithProviders(<SignUpScreen />);
    expect(getAllByText('Create Account').length).toBeGreaterThanOrEqual(1);
  });

  it('shows Create Account heading', () => {
    const { getAllByText } = renderWithProviders(<SignUpScreen />);
    // ScreenHeader title + primary button both say "Create Account"
    const matches = getAllByText('Create Account');
    expect(matches.length).toBeGreaterThanOrEqual(1);
  });

  it('shows email, password, and confirm password fields', () => {
    const { getByPlaceholderText } = renderWithProviders(<SignUpScreen />);
    expect(getByPlaceholderText('Email')).toBeTruthy();
    expect(getByPlaceholderText('Password')).toBeTruthy();
    expect(getByPlaceholderText('Confirm Password')).toBeTruthy();
  });

  it('shows Google and Facebook social buttons', () => {
    const { getByText } = renderWithProviders(<SignUpScreen />);
    expect(getByText('Continue with Google')).toBeTruthy();
    expect(getByText('Continue with Facebook')).toBeTruthy();
  });

  it('shows "Already have an account?" link', () => {
    const { getByText } = renderWithProviders(<SignUpScreen />);
    expect(getByText(/Already have an account\?/)).toBeTruthy();
  });
});
