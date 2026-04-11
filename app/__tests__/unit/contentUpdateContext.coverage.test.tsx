/**
 * Extended coverage tests for contexts/ContentUpdateContext.tsx —
 * Tests the real provider and consumer hook.
 */
import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { render, fireEvent, act } from '@testing-library/react-native';
import { ContentUpdateProvider, useContentUpdate } from '@/contexts/ContentUpdateContext';

function TestConsumer() {
  const { visible, progress, status, error, showUpdate, updateProgress, setStatus, hideUpdate } =
    useContentUpdate();

  return (
    <>
      <Text testID="visible">{visible ? 'yes' : 'no'}</Text>
      <Text testID="progress">{progress}</Text>
      <Text testID="status">{status}</Text>
      <Text testID="error">{error ?? 'null'}</Text>
      <TouchableOpacity testID="showUpdate" onPress={showUpdate} />
      <TouchableOpacity testID="updateProgress" onPress={() => updateProgress(50)} />
      <TouchableOpacity testID="setStatus" onPress={() => setStatus('success')} />
      <TouchableOpacity testID="setStatusError" onPress={() => setStatus('error', 'Network fail')} />
      <TouchableOpacity testID="hideUpdate" onPress={hideUpdate} />
    </>
  );
}

describe('ContentUpdateContext', () => {
  it('provides initial state', () => {
    const { getByTestId } = render(
      <ContentUpdateProvider>
        <TestConsumer />
      </ContentUpdateProvider>,
    );

    expect(getByTestId('visible').props.children).toBe('no');
    expect(getByTestId('progress').props.children).toBe(0);
    expect(getByTestId('status').props.children).toBe('downloading');
    expect(getByTestId('error').props.children).toBe('null');
  });

  it('showUpdate sets visible to true and resets state', () => {
    const { getByTestId } = render(
      <ContentUpdateProvider>
        <TestConsumer />
      </ContentUpdateProvider>,
    );

    fireEvent.press(getByTestId('showUpdate'));
    expect(getByTestId('visible').props.children).toBe('yes');
    expect(getByTestId('progress').props.children).toBe(0);
    expect(getByTestId('status').props.children).toBe('downloading');
  });

  it('updateProgress updates the progress value', () => {
    const { getByTestId } = render(
      <ContentUpdateProvider>
        <TestConsumer />
      </ContentUpdateProvider>,
    );

    fireEvent.press(getByTestId('updateProgress'));
    expect(getByTestId('progress').props.children).toBe(50);
  });

  it('setStatus updates status and optional error', () => {
    const { getByTestId } = render(
      <ContentUpdateProvider>
        <TestConsumer />
      </ContentUpdateProvider>,
    );

    fireEvent.press(getByTestId('setStatus'));
    expect(getByTestId('status').props.children).toBe('success');
    expect(getByTestId('error').props.children).toBe('null');

    fireEvent.press(getByTestId('setStatusError'));
    expect(getByTestId('status').props.children).toBe('error');
    expect(getByTestId('error').props.children).toBe('Network fail');
  });

  it('hideUpdate sets visible to false', () => {
    const { getByTestId } = render(
      <ContentUpdateProvider>
        <TestConsumer />
      </ContentUpdateProvider>,
    );

    fireEvent.press(getByTestId('showUpdate'));
    expect(getByTestId('visible').props.children).toBe('yes');

    fireEvent.press(getByTestId('hideUpdate'));
    expect(getByTestId('visible').props.children).toBe('no');
  });

  it('useContentUpdate throws when used outside provider', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => {
      render(<TestConsumer />);
    }).toThrow('useContentUpdate must be used within a ContentUpdateProvider');
    spy.mockRestore();
  });
});
