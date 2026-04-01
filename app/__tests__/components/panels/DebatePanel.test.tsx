/**
 * DebatePanel.test.tsx — Tests for the scholarly debate panel.
 */

import React from 'react';
import { renderWithProviders } from '../../helpers/renderWithProviders';
import { DebatePanel } from '@/components/panels/DebatePanel';
import type { DebateEntry } from '@/types';

const entries: DebateEntry[] = [
  {
    topic: 'Age of the Earth',
    positions: [
      { scholar: 'Young Earth', position: 'The days of Genesis 1 are literal 24-hour days.' },
      { scholar: 'Old Earth', position: 'The days represent long epochs of time.' },
    ],
  },
];

describe('DebatePanel', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders debate topic heading', () => {
    const { getByText } = renderWithProviders(
      <DebatePanel entries={entries} />,
    );
    expect(getByText('Age of the Earth')).toBeTruthy();
  });

  it('renders scholar positions', () => {
    const { getByText } = renderWithProviders(
      <DebatePanel entries={entries} />,
    );
    expect(getByText('Young Earth')).toBeTruthy();
    expect(getByText(/literal 24-hour days/)).toBeTruthy();
    expect(getByText('Old Earth')).toBeTruthy();
  });

  it('returns null for empty entries', () => {
    const { toJSON } = renderWithProviders(
      <DebatePanel entries={[]} />,
    );
    expect(toJSON()).toBeNull();
  });

  it('returns null for null entries', () => {
    const { toJSON } = renderWithProviders(
      <DebatePanel entries={null as any} />,
    );
    expect(toJSON()).toBeNull();
  });
});
