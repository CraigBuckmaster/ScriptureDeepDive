import React from 'react';
import { renderWithProviders } from '../helpers/renderWithProviders';
import ForgotPasswordScreen from '@/screens/ForgotPasswordScreen';

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

describe('ForgotPasswordScreen', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders without crashing', () => {
    const { getByText } = renderWithProviders(<ForgotPasswordScreen />);
    expect(getByText('Reset Password')).toBeTruthy();
  });

  it('shows Reset Password heading', () => {
    const { getByText } = renderWithProviders(<ForgotPasswordScreen />);
    expect(getByText('Reset Password')).toBeTruthy();
  });

  it('shows email input', () => {
    const { getByPlaceholderText } = renderWithProviders(<ForgotPasswordScreen />);
    expect(getByPlaceholderText('Email')).toBeTruthy();
  });

  it('shows Send Reset Link button', () => {
    const { getByText } = renderWithProviders(<ForgotPasswordScreen />);
    expect(getByText('Send Reset Link')).toBeTruthy();
  });

  it('shows explanatory text', () => {
    const { getByText } = renderWithProviders(<ForgotPasswordScreen />);
    expect(
      getByText(/Enter your email and we'll send you a link to reset your password/),
    ).toBeTruthy();
  });

  it('shows Back to Sign In link', () => {
    const { getByText } = renderWithProviders(<ForgotPasswordScreen />);
    expect(getByText('Back to Sign In')).toBeTruthy();
  });
});
