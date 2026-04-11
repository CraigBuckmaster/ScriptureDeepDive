import React from 'react';
import { fireEvent, waitFor } from '@testing-library/react-native';
import { renderWithProviders } from '../helpers/renderWithProviders';
import SignUpScreen from '@/screens/SignUpScreen';

const mockSignUpWithEmail = jest.fn().mockResolvedValue({});
const mockSignInWithGoogle = jest.fn().mockResolvedValue({});
const mockSignInWithFacebook = jest.fn().mockResolvedValue({});

jest.mock('@/stores', () => ({
  useSettingsStore: (sel: any) =>
    sel({ translation: 'kjv', fontSize: 16, ttsVoice: '' }),
  useAuthStore: (sel: any) =>
    sel({
      user: null,
      isLoading: false,
      signUpWithEmail: mockSignUpWithEmail,
      signInWithGoogle: mockSignInWithGoogle,
      signInWithFacebook: mockSignInWithFacebook,
    }),
}));

jest.mock('@/components/ScreenHeader', () => ({
  ScreenHeader: ({ title }: any) => {
    const RN = require('react-native');
    return <RN.Text>{title}</RN.Text>;
  },
}));

jest.mock('@/components/ScreenErrorBoundary', () => ({
  withErrorBoundary: (C: React.ComponentType) => C,
}));

const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({ navigate: mockNavigate, goBack: mockGoBack }),
}));

describe('SignUpScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSignUpWithEmail.mockResolvedValue({});
    mockSignInWithGoogle.mockResolvedValue({});
    mockSignInWithFacebook.mockResolvedValue({});
  });

  it('renders without crashing', () => {
    const { getAllByText } = renderWithProviders(<SignUpScreen />);
    expect(getAllByText('Create Account').length).toBeGreaterThanOrEqual(1);
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

  it('shows password mismatch error', async () => {
    const { getByPlaceholderText, getAllByText, findByText } = renderWithProviders(<SignUpScreen />);

    fireEvent.changeText(getByPlaceholderText('Email'), 'test@test.com');
    fireEvent.changeText(getByPlaceholderText('Password'), 'pass1');
    fireEvent.changeText(getByPlaceholderText('Confirm Password'), 'pass2');

    const buttons = getAllByText('Create Account');
    fireEvent.press(buttons[buttons.length - 1]);

    const error = await findByText('Passwords do not match.');
    expect(error).toBeTruthy();
    expect(mockSignUpWithEmail).not.toHaveBeenCalled();
  });

  it('calls signUpWithEmail on valid form submission', async () => {
    const { getByPlaceholderText, getAllByText } = renderWithProviders(<SignUpScreen />);

    fireEvent.changeText(getByPlaceholderText('Email'), 'new@test.com');
    fireEvent.changeText(getByPlaceholderText('Password'), 'password');
    fireEvent.changeText(getByPlaceholderText('Confirm Password'), 'password');

    const buttons = getAllByText('Create Account');
    fireEvent.press(buttons[buttons.length - 1]);

    await waitFor(() => {
      expect(mockSignUpWithEmail).toHaveBeenCalledWith('new@test.com', 'password');
    });
  });

  it('shows success message after sign up', async () => {
    const { getByPlaceholderText, getAllByText, findByText } = renderWithProviders(<SignUpScreen />);

    fireEvent.changeText(getByPlaceholderText('Email'), 'new@test.com');
    fireEvent.changeText(getByPlaceholderText('Password'), 'pass');
    fireEvent.changeText(getByPlaceholderText('Confirm Password'), 'pass');

    const buttons = getAllByText('Create Account');
    fireEvent.press(buttons[buttons.length - 1]);

    const success = await findByText('Check your email to confirm your account.');
    expect(success).toBeTruthy();
  });

  it('shows error on sign up failure', async () => {
    mockSignUpWithEmail.mockResolvedValue({ error: 'Email already taken' });

    const { getByPlaceholderText, getAllByText, findByText } = renderWithProviders(<SignUpScreen />);

    fireEvent.changeText(getByPlaceholderText('Email'), 'taken@test.com');
    fireEvent.changeText(getByPlaceholderText('Password'), 'pass');
    fireEvent.changeText(getByPlaceholderText('Confirm Password'), 'pass');

    const buttons = getAllByText('Create Account');
    fireEvent.press(buttons[buttons.length - 1]);

    const error = await findByText('Email already taken');
    expect(error).toBeTruthy();
  });

  it('calls signInWithGoogle on Google button press', async () => {
    const { getByText } = renderWithProviders(<SignUpScreen />);
    fireEvent.press(getByText('Continue with Google'));
    await waitFor(() => {
      expect(mockSignInWithGoogle).toHaveBeenCalled();
    });
  });

  it('navigates back on successful Google sign in', async () => {
    const { getByText } = renderWithProviders(<SignUpScreen />);
    fireEvent.press(getByText('Continue with Google'));
    await waitFor(() => {
      expect(mockGoBack).toHaveBeenCalled();
    });
  });

  it('shows error on Google sign in failure', async () => {
    mockSignInWithGoogle.mockResolvedValue({ error: 'Google failed' });
    const { getByText, findByText } = renderWithProviders(<SignUpScreen />);
    fireEvent.press(getByText('Continue with Google'));
    const error = await findByText('Google failed');
    expect(error).toBeTruthy();
  });

  it('calls signInWithFacebook on Facebook button press', async () => {
    const { getByText } = renderWithProviders(<SignUpScreen />);
    fireEvent.press(getByText('Continue with Facebook'));
    await waitFor(() => {
      expect(mockSignInWithFacebook).toHaveBeenCalled();
    });
  });

  it('navigates back on successful Facebook sign in', async () => {
    const { getByText } = renderWithProviders(<SignUpScreen />);
    fireEvent.press(getByText('Continue with Facebook'));
    await waitFor(() => {
      expect(mockGoBack).toHaveBeenCalled();
    });
  });

  it('shows error on Facebook sign in failure', async () => {
    mockSignInWithFacebook.mockResolvedValue({ error: 'FB failed' });
    const { getByText, findByText } = renderWithProviders(<SignUpScreen />);
    fireEvent.press(getByText('Continue with Facebook'));
    const error = await findByText('FB failed');
    expect(error).toBeTruthy();
  });

  it('navigates to Login on Already have an account press', () => {
    const { getByText } = renderWithProviders(<SignUpScreen />);
    fireEvent.press(getByText(/Already have an account/));
    expect(mockNavigate).toHaveBeenCalledWith('Login');
  });
});
