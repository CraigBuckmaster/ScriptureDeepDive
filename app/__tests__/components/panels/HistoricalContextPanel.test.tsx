/**
 * HistoricalContextPanel.test.tsx — Tests for the historical background panel.
 */

import React from 'react';
import { renderWithProviders } from '../../helpers/renderWithProviders';
import { HistoricalContextPanel } from '@/components/panels/HistoricalContextPanel';

jest.mock('@/utils/referenceParser', () => ({
  extractReferences: jest.fn(() => []),
}));

describe('HistoricalContextPanel', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders without crashing', () => {
    const { toJSON } = renderWithProviders(
      <HistoricalContextPanel text="Historical background information." />,
    );
    expect(toJSON()).toBeTruthy();
  });

  it('displays the provided text', () => {
    const { getByText } = renderWithProviders(
      <HistoricalContextPanel text="The Babylonian exile began in 586 BC." />,
    );
    expect(getByText(/Babylonian exile/)).toBeTruthy();
  });

  it('renders with empty text without crashing', () => {
    const { toJSON } = renderWithProviders(
      <HistoricalContextPanel text="" />,
    );
    expect(toJSON()).toBeTruthy();
  });
});
