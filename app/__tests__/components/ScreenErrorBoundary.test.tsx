/**
 * Tests for ScreenErrorBoundary component.
 */
import React from 'react';
import { Text, View } from 'react-native';
import { fireEvent } from '@testing-library/react-native';
import { renderWithProviders } from '../helpers/renderWithProviders';
import { ScreenErrorBoundary, withErrorBoundary } from '@/components/ScreenErrorBoundary';

// Suppress console.error for expected error boundary catches
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = (...args: any[]) => {
    if (typeof args[0] === 'string' && (
      args[0].includes('Error Boundary') ||
      args[0].includes('The above error')
    )) return;
    originalConsoleError(...args);
  };
});
afterAll(() => { console.error = originalConsoleError; });

function GoodChild() {
  return <Text>Everything is fine</Text>;
}

function BrokenChild(): JSX.Element {
  throw new Error('Test error');
}

describe('ScreenErrorBoundary', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders children when no error occurs', () => {
    const { getByText } = renderWithProviders(
      <ScreenErrorBoundary>
        <GoodChild />
      </ScreenErrorBoundary>,
    );
    expect(getByText('Everything is fine')).toBeTruthy();
  });

  it('shows fallback UI when child throws', () => {
    const { getByText } = renderWithProviders(
      <ScreenErrorBoundary>
        <BrokenChild />
      </ScreenErrorBoundary>,
    );
    expect(getByText('Something went wrong')).toBeTruthy();
    expect(getByText(/unexpected error/)).toBeTruthy();
  });

  it('shows Go Back and Try Again buttons in fallback', () => {
    const { getByText } = renderWithProviders(
      <ScreenErrorBoundary>
        <BrokenChild />
      </ScreenErrorBoundary>,
    );
    expect(getByText('Go Back')).toBeTruthy();
    expect(getByText('Try Again')).toBeTruthy();
  });

  it('resets error state when Try Again is pressed', () => {
    let shouldThrow = true;
    function ConditionalChild() {
      if (shouldThrow) throw new Error('Boom');
      return <Text>Recovered</Text>;
    }

    const { getByText } = renderWithProviders(
      <ScreenErrorBoundary>
        <ConditionalChild />
      </ScreenErrorBoundary>,
    );
    expect(getByText('Something went wrong')).toBeTruthy();

    shouldThrow = false;
    fireEvent.press(getByText('Try Again'));
    expect(getByText('Recovered')).toBeTruthy();
  });
});

describe('withErrorBoundary', () => {
  it('wraps a component with error boundary', () => {
    const WrappedGood = withErrorBoundary(GoodChild);
    const { getByText } = renderWithProviders(<WrappedGood />);
    expect(getByText('Everything is fine')).toBeTruthy();
  });

  it('catches errors in wrapped component', () => {
    const WrappedBroken = withErrorBoundary(BrokenChild);
    const { getByText } = renderWithProviders(<WrappedBroken />);
    expect(getByText('Something went wrong')).toBeTruthy();
  });

  it('sets displayName on the wrapped component', () => {
    GoodChild.displayName = 'GoodChild';
    const Wrapped = withErrorBoundary(GoodChild);
    expect(Wrapped.displayName).toBe('withErrorBoundary(GoodChild)');
  });
});
