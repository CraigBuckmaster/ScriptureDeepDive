/**
 * Tests for StartHereBanner component.
 */
import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { renderWithProviders } from '../helpers/renderWithProviders';
import { StartHereBanner } from '@/components/StartHereBanner';

describe('StartHereBanner', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders the START HERE label', () => {
    const { getByText } = renderWithProviders(
      <StartHereBanner onDismiss={jest.fn()} onNavigate={jest.fn()} />,
    );
    expect(getByText('START HERE')).toBeTruthy();
  });

  it('renders intro text', () => {
    const { getByText } = renderWithProviders(
      <StartHereBanner onDismiss={jest.fn()} onNavigate={jest.fn()} />,
    );
    expect(getByText(/great first stop/)).toBeTruthy();
  });

  it('renders all 4 tool cards', () => {
    const { getByText } = renderWithProviders(
      <StartHereBanner onDismiss={jest.fn()} onNavigate={jest.fn()} />,
    );
    expect(getByText('People')).toBeTruthy();
    expect(getByText('Timeline')).toBeTruthy();
    expect(getByText('Word Studies')).toBeTruthy();
    expect(getByText('Topical Index')).toBeTruthy();
  });

  it('shows subtitles for each tool', () => {
    const { getByText } = renderWithProviders(
      <StartHereBanner onDismiss={jest.fn()} onNavigate={jest.fn()} />,
    );
    expect(getByText("See who's in the story")).toBeTruthy();
    expect(getByText('When did this happen?')).toBeTruthy();
  });

  it('calls onDismiss when X is pressed', () => {
    const onDismiss = jest.fn();
    const { getByLabelText } = renderWithProviders(
      <StartHereBanner onDismiss={onDismiss} onNavigate={jest.fn()} />,
    );
    fireEvent.press(getByLabelText('Dismiss start here banner'));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('calls onNavigate with the correct screen when a tool is tapped', () => {
    const onNavigate = jest.fn();
    const { getByLabelText } = renderWithProviders(
      <StartHereBanner onDismiss={jest.fn()} onNavigate={onNavigate} />,
    );
    fireEvent.press(getByLabelText(/People/));
    expect(onNavigate).toHaveBeenCalledWith('GenealogyTree');
  });

  it('calls onNavigate for Timeline tool', () => {
    const onNavigate = jest.fn();
    const { getByLabelText } = renderWithProviders(
      <StartHereBanner onDismiss={jest.fn()} onNavigate={onNavigate} />,
    );
    fireEvent.press(getByLabelText(/Timeline/));
    expect(onNavigate).toHaveBeenCalledWith('Timeline');
  });
});
