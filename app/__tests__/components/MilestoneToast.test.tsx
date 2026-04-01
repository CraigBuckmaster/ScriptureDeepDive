import React from 'react';
import { renderWithProviders } from '../helpers/renderWithProviders';
import { MilestoneToast } from '@/components/MilestoneToast';

describe('MilestoneToast', () => {
  it('renders message when provided', () => {
    const { getByText } = renderWithProviders(
      <MilestoneToast message="10 chapters read!" onDismiss={jest.fn()} />,
    );
    expect(getByText('10 chapters read!')).toBeTruthy();
  });

  it('returns null when message is null', () => {
    const { toJSON } = renderWithProviders(
      <MilestoneToast message={null} onDismiss={jest.fn()} />,
    );
    expect(toJSON()).toBeNull();
  });

  it('renders without crashing with empty string message', () => {
    const { toJSON } = renderWithProviders(
      <MilestoneToast message="" onDismiss={jest.fn()} />,
    );
    // empty string is falsy, so component returns null
    expect(toJSON()).toBeNull();
  });

  it('displays the exact message text', () => {
    const { getByText } = renderWithProviders(
      <MilestoneToast message="Finished Genesis!" onDismiss={jest.fn()} />,
    );
    expect(getByText('Finished Genesis!')).toBeTruthy();
  });
});
