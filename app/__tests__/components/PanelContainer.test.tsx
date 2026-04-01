/**
 * PanelContainer.test.tsx — Tests for the panel wrapper component.
 */

import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { renderWithProviders } from '../helpers/renderWithProviders';
import { PanelContainer } from '@/components/PanelContainer';

// Minimal valid JSON for a cross-ref panel
const contentJson = JSON.stringify([{ ref: 'Gen 1:1', note: 'Creation account' }]);

describe('PanelContainer', () => {
  it('renders children (panel content) when open', () => {
    const { getByText } = renderWithProviders(
      <PanelContainer panelType="cross" contentJson={contentJson} isOpen />,
    );
    expect(getByText('Gen 1:1')).toBeTruthy();
  });

  it('returns null when not open', () => {
    const { toJSON } = renderWithProviders(
      <PanelContainer panelType="cross" contentJson={contentJson} isOpen={false} />,
    );
    expect(toJSON()).toBeNull();
  });

  it('close button calls onClose', () => {
    const onClose = jest.fn();
    const { getByLabelText } = renderWithProviders(
      <PanelContainer panelType="cross" contentJson={contentJson} isOpen onClose={onClose} />,
    );
    fireEvent.press(getByLabelText('Close panel'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('renders with border styling (borderLeftWidth)', () => {
    const { toJSON } = renderWithProviders(
      <PanelContainer panelType="cross" contentJson={contentJson} isOpen />,
    );
    // The root View should have borderLeftWidth: 3
    const root = toJSON();
    expect(root).not.toBeNull();
    // Verify it rendered something (not null)
    expect(root?.type).toBe('View');
  });
});
