/**
 * Tests for ContentUpdateContext — provider and hook.
 */
import React from 'react';
import { render, act } from '@testing-library/react-native';
import { Text } from 'react-native';
import {
  ContentUpdateProvider,
  useContentUpdate,
} from '@/contexts/ContentUpdateContext';

// Test component that consumes the context
function TestConsumer() {
  const { visible, progress, status, error, showUpdate, updateProgress, setStatus, hideUpdate } =
    useContentUpdate();

  return (
    <>
      <Text testID="visible">{String(visible)}</Text>
      <Text testID="progress">{progress}</Text>
      <Text testID="status">{status}</Text>
      <Text testID="error">{error ?? 'none'}</Text>
    </>
  );
}

// Separate component to access actions
let contextActions: ReturnType<typeof useContentUpdate>;
function ActionCapture() {
  contextActions = useContentUpdate();
  return null;
}

describe('ContentUpdateContext', () => {
  it('throws when used outside provider', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation();
    expect(() => render(<TestConsumer />)).toThrow(
      'useContentUpdate must be used within a ContentUpdateProvider',
    );
    consoleError.mockRestore();
  });

  it('provides initial state', () => {
    const { getByTestId } = render(
      <ContentUpdateProvider>
        <TestConsumer />
      </ContentUpdateProvider>,
    );

    expect(getByTestId('visible').props.children).toBe('false');
    expect(getByTestId('progress').props.children).toBe(0);
    expect(getByTestId('status').props.children).toBe('downloading');
    expect(getByTestId('error').props.children).toBe('none');
  });

  it('showUpdate sets visible and resets state', () => {
    const { getByTestId } = render(
      <ContentUpdateProvider>
        <ActionCapture />
        <TestConsumer />
      </ContentUpdateProvider>,
    );

    act(() => {
      contextActions.showUpdate();
    });

    expect(getByTestId('visible').props.children).toBe('true');
    expect(getByTestId('progress').props.children).toBe(0);
    expect(getByTestId('status').props.children).toBe('downloading');
  });

  it('updateProgress updates the progress value', () => {
    const { getByTestId } = render(
      <ContentUpdateProvider>
        <ActionCapture />
        <TestConsumer />
      </ContentUpdateProvider>,
    );

    act(() => {
      contextActions.showUpdate();
    });
    act(() => {
      contextActions.updateProgress(50);
    });

    expect(getByTestId('progress').props.children).toBe(50);
  });

  it('setStatus updates status and optional error', () => {
    const { getByTestId } = render(
      <ContentUpdateProvider>
        <ActionCapture />
        <TestConsumer />
      </ContentUpdateProvider>,
    );

    act(() => {
      contextActions.setStatus('error', 'Network failed');
    });

    expect(getByTestId('status').props.children).toBe('error');
    expect(getByTestId('error').props.children).toBe('Network failed');
  });

  it('hideUpdate sets visible to false', () => {
    const { getByTestId } = render(
      <ContentUpdateProvider>
        <ActionCapture />
        <TestConsumer />
      </ContentUpdateProvider>,
    );

    act(() => {
      contextActions.showUpdate();
    });
    expect(getByTestId('visible').props.children).toBe('true');

    act(() => {
      contextActions.hideUpdate();
    });
    expect(getByTestId('visible').props.children).toBe('false');
  });
});
