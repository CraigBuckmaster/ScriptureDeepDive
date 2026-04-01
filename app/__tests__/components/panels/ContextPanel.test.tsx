/**
 * ContextPanel.test.tsx — Tests for the literary/historical context panel.
 */

import React from 'react';
import { renderWithProviders } from '../../helpers/renderWithProviders';
import { ContextPanel } from '@/components/panels/ContextPanel';

jest.mock('@/utils/referenceParser', () => ({
  extractReferences: jest.fn(() => []),
}));

describe('ContextPanel', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders without crashing', () => {
    const { toJSON } = renderWithProviders(
      <ContextPanel text="Some context about the passage." />,
    );
    expect(toJSON()).toBeTruthy();
  });

  it('displays the provided text', () => {
    const { getByText } = renderWithProviders(
      <ContextPanel text="The ancient Near Eastern background of Genesis 1." />,
    );
    expect(getByText(/ancient Near Eastern background/)).toBeTruthy();
  });

  it('renders with empty text without crashing', () => {
    const { toJSON } = renderWithProviders(
      <ContextPanel text="" />,
    );
    expect(toJSON()).toBeTruthy();
  });
});
