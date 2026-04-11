import React from 'react';
import { fireEvent, waitFor } from '@testing-library/react-native';
import { renderWithProviders } from '../helpers/renderWithProviders';
import LoginScreen from '@/screens/LoginScreen';

const mockSignIn = jest.fn().mockResolvedValue({});
const mockSignInWithMagicLink = jest.fn().mockResolvedValue({});
const mockSignInWithGoogle = jest.fn().mockResolvedValue({});
const mockSignInWithFacebook = jest.fn().mockResolvedValue({});

jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    signIn: mockSignIn,
    signInWithMagicLink: mockSignInWithMagicLink,
    isLoading: false,
  }),
}));

jest.mock('@/stores', () => ({
  useSettingsStore: (sel: any) =>
    sel({ translation: 'kjv', fontSize: 16, ttsVoice: '' }),
  useAuthStore: (sel: any) =>
    sel({
      user: null,
      isLoading: false,
      signInWithGoogle: mockSignInWithGoogle,
      signInWithFacebook: mockSignInWithFacebook,
    }),
}));

jest.mock('@/components/ScreenHeader', () => ({
  ScreenHeader: ({ title, onBack }: any) => {
    const RN = require('react-native');
    return <RN.View><RN.Text>{title}</RN.Text></RN.View>;
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

describe('LoginScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSignIn.mockResolvedValue({});
    mockSignInWithMagicLink.mockResolvedValue({});
    mockSignInWithGoogle.mockResolvedValue({});
    mockSignInWithFacebook.mockResolvedValue({});
  });

  it('renders without crashing', () => {
    const { getAllByText } = renderWithProviders(<LoginScreen />);
    expect(getAllByText('Sign In').length).toBeGreaterThanOrEqual(1);
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

  it('shows subtitle', () => {
    const { getByText } = renderWithProviders(<LoginScreen />);
    expect(getByText(/Sign in to unlock/)).toBeTruthy();
  });

  it('shows sign in with email link button', () => {
    const { getByText } = renderWithProviders(<LoginScreen />);
    expect(getByText('Sign in with email link')).toBeTruthy();
  });

  it('calls signIn on Sign In button press', async () => {
    const { getByPlaceholderText, getAllByText } = renderWithProviders(<LoginScreen />);

    fireEvent.changeText(getByPlaceholderText('Email'), 'test@test.com');
    fireEvent.changeText(getByPlaceholderText('Password'), 'pass123');

    const signInButtons = getAllByText('Sign In');
    // Press the primary Sign In button (not the header)
    fireEvent.press(signInButtons[signInButtons.length - 1]);

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('test@test.com', 'pass123');
    });
  });

  it('navigates back on successful sign in', async () => {
    mockSignIn.mockResolvedValue({});

    const { getByPlaceholderText, getAllByText } = renderWithProviders(<LoginScreen />);
    fireEvent.changeText(getByPlaceholderText('Email'), 'test@test.com');
    fireEvent.changeText(getByPlaceholderText('Password'), 'pass');
    fireEvent.press(getAllByText('Sign In')[getAllByText('Sign In').length - 1]);

    await waitFor(() => {
      expect(mockGoBack).toHaveBeenCalled();
    });
  });

  it('shows error on sign in failure', async () => {
    mockSignIn.mockResolvedValue({ error: 'Invalid credentials' });

    const { getByPlaceholderText, getAllByText, findByText } = renderWithProviders(<LoginScreen />);
    fireEvent.changeText(getByPlaceholderText('Email'), 'bad@test.com');
    fireEvent.changeText(getByPlaceholderText('Password'), 'wrong');
    fireEvent.press(getAllByText('Sign In')[getAllByText('Sign In').length - 1]);

    const errorText = await findByText('Invalid credentials');
    expect(errorText).toBeTruthy();
  });

  it('calls signInWithGoogle on Google button press', async () => {
    const { getByText } = renderWithProviders(<LoginScreen />);
    fireEvent.press(getByText('Continue with Google'));

    await waitFor(() => {
      expect(mockSignInWithGoogle).toHaveBeenCalled();
    });
  });

  it('shows error on Google sign in failure', async () => {
    mockSignInWithGoogle.mockResolvedValue({ error: 'Google error' });

    const { getByText, findByText } = renderWithProviders(<LoginScreen />);
    fireEvent.press(getByText('Continue with Google'));

    const errorText = await findByText('Google error');
    expect(errorText).toBeTruthy();
  });

  it('calls signInWithFacebook on Facebook button press', async () => {
    const { getByText } = renderWithProviders(<LoginScreen />);
    fireEvent.press(getByText('Continue with Facebook'));

    await waitFor(() => {
      expect(mockSignInWithFacebook).toHaveBeenCalled();
    });
  });

  it('shows error on Facebook sign in failure', async () => {
    mockSignInWithFacebook.mockResolvedValue({ error: 'FB error' });

    const { getByText, findByText } = renderWithProviders(<LoginScreen />);
    fireEvent.press(getByText('Continue with Facebook'));

    const errorText = await findByText('FB error');
    expect(errorText).toBeTruthy();
  });

  it('sends magic link when button pressed with email', async () => {
    const { getByPlaceholderText, getByText, findByText } = renderWithProviders(<LoginScreen />);

    fireEvent.changeText(getByPlaceholderText('Email'), 'user@example.com');
    fireEvent.press(getByText('Sign in with email link'));

    await waitFor(() => {
      expect(mockSignInWithMagicLink).toHaveBeenCalledWith('user@example.com');
    });

    const success = await findByText('Check your email for a sign-in link.');
    expect(success).toBeTruthy();
  });

  it('shows error when magic link pressed without email', async () => {
    const { getByText, findByText } = renderWithProviders(<LoginScreen />);

    fireEvent.press(getByText('Sign in with email link'));

    const errorText = await findByText('Please enter your email address first.');
    expect(errorText).toBeTruthy();
  });

  it('shows error when magic link fails', async () => {
    mockSignInWithMagicLink.mockResolvedValue({ error: 'Rate limited' });

    const { getByPlaceholderText, getByText, findByText } = renderWithProviders(<LoginScreen />);
    fireEvent.changeText(getByPlaceholderText('Email'), 'user@test.com');
    fireEvent.press(getByText('Sign in with email link'));

    const errorText = await findByText('Rate limited');
    expect(errorText).toBeTruthy();
  });

  it('navigates to ForgotPassword on forgot password press', () => {
    const { getByText } = renderWithProviders(<LoginScreen />);
    fireEvent.press(getByText('Forgot password?'));
    expect(mockNavigate).toHaveBeenCalledWith('ForgotPassword');
  });

  it('navigates to SignUp on Sign Up link press', () => {
    const { getByText } = renderWithProviders(<LoginScreen />);
    fireEvent.press(getByText(/Don't have an account/));
    expect(mockNavigate).toHaveBeenCalledWith('SignUp');
  });
});
