/**
 * Tests for PanelInfoSheet component.
 */
import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { renderWithProviders } from '../helpers/renderWithProviders';
import { PanelInfoSheet } from '@/components/PanelInfoSheet';

jest.mock('@/db/content', () => ({
  getScholar: jest.fn().mockResolvedValue(null),
}));

jest.mock('@/utils/panelLabels', () => ({
  isScholarPanel: jest.fn().mockReturnValue(false),
}));

jest.mock('@/utils/panelDescriptions', () => ({
  PANEL_DESCRIPTIONS: {
    historical: { label: 'Historical', description: 'Historical context and background' },
    cultural: { label: 'Cultural', description: 'Cultural insights' },
  } as Record<string, { label: string; description: string }>,
}));

describe('PanelInfoSheet', () => {
  const { isScholarPanel } = require('@/utils/panelLabels');
  const { getScholar } = require('@/db/content');

  beforeEach(() => {
    jest.clearAllMocks();
    isScholarPanel.mockReturnValue(false);
    getScholar.mockResolvedValue(null);
  });

  it('returns null when not visible', () => {
    const { toJSON } = renderWithProviders(
      <PanelInfoSheet visible={false} panelType="historical" onClose={jest.fn()} />,
    );
    expect(toJSON()).toBeNull();
  });

  it('returns null when panelType is null', () => {
    const { toJSON } = renderWithProviders(
      <PanelInfoSheet visible={true} panelType={null} onClose={jest.fn()} />,
    );
    expect(toJSON()).toBeNull();
  });

  it('shows content panel info for non-scholar panel', () => {
    const { getByText } = renderWithProviders(
      <PanelInfoSheet visible={true} panelType="historical" onClose={jest.fn()} />,
    );
    expect(getByText('Historical')).toBeTruthy();
    expect(getByText('Historical context and background')).toBeTruthy();
    expect(getByText(/open this panel/)).toBeTruthy();
  });

  it('calls onClose when backdrop is pressed', () => {
    const onClose = jest.fn();
    const { getByLabelText } = renderWithProviders(
      <PanelInfoSheet visible={true} panelType="historical" onClose={onClose} />,
    );
    fireEvent.press(getByLabelText('Close panel info'));
    expect(onClose).toHaveBeenCalled();
  });

  it('shows scholar info for scholar panels', async () => {
    isScholarPanel.mockReturnValue(true);
    getScholar.mockResolvedValue({
      id: 'john_calvin',
      name: 'John Calvin',
      tradition: 'Reformed',
      bio_json: JSON.stringify({ description: 'A French theologian. He was influential in the Reformation.' }),
    });

    const { findByText } = renderWithProviders(
      <PanelInfoSheet visible={true} panelType="john_calvin" onClose={jest.fn()} />,
    );
    expect(await findByText('John Calvin')).toBeTruthy();
    expect(await findByText('Reformed')).toBeTruthy();
    expect(await findByText(/read commentary/)).toBeTruthy();
  });

  it('shows View Bio link when onGoToFullBio is provided for scholar', async () => {
    isScholarPanel.mockReturnValue(true);
    getScholar.mockResolvedValue({
      id: 'john_calvin',
      name: 'John Calvin',
      tradition: 'Reformed',
      bio_json: JSON.stringify({ description: 'A great theologian.' }),
    });

    const onGoToFullBio = jest.fn();
    const { findByText } = renderWithProviders(
      <PanelInfoSheet
        visible={true}
        panelType="john_calvin"
        onClose={jest.fn()}
        onGoToFullBio={onGoToFullBio}
      />,
    );
    const bioLink = await findByText('View Bio →');
    expect(bioLink).toBeTruthy();
    fireEvent.press(bioLink);
    expect(onGoToFullBio).toHaveBeenCalledWith('john_calvin');
  });

  it('shows fallback for unknown content panel type', () => {
    const { getByText } = renderWithProviders(
      <PanelInfoSheet visible={true} panelType="unknown_panel" onClose={jest.fn()} />,
    );
    expect(getByText('unknown_panel')).toBeTruthy();
    expect(getByText('Study panel')).toBeTruthy();
  });
});
