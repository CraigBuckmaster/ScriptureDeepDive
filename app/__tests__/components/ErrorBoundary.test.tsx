import React from 'react';
import { Text } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';
import { ErrorBoundary } from '@/components/ErrorBoundary';

function ThrowingComponent(): JSX.Element {
  throw new Error('Test error');
}

describe('ErrorBoundary', () => {
  // Suppress console.error from React error boundary
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation();
  });
  afterEach(() => jest.restoreAllMocks());

  it('renders children when no error', () => {
    const { getByText } = render(
      <ErrorBoundary>
        <Text>Hello</Text>
      </ErrorBoundary>,
    );
    expect(getByText('Hello')).toBeTruthy();
  });

  it('renders fallback UI when child throws', () => {
    const { getByText } = render(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>,
    );
    expect(getByText('Something went wrong')).toBeTruthy();
  });

  it('uses custom fallback message', () => {
    const { getByText } = render(
      <ErrorBoundary fallbackMessage="Custom error">
        <ThrowingComponent />
      </ErrorBoundary>,
    );
    expect(getByText('Custom error')).toBeTruthy();
  });

  it('has a retry button that resets the error', () => {
    const { getByText, queryByText } = render(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>,
    );
    expect(getByText('Something went wrong')).toBeTruthy();
    // Pressing retry resets error state (component will throw again)
    fireEvent.press(getByText('Retry'));
    // After retry it tries to render child again, which throws again
    expect(getByText('Something went wrong')).toBeTruthy();
  });
});
