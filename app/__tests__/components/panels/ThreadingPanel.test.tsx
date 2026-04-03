/**
 * ThreadingPanel.test.tsx — Tests for the threading/intertextual links panel.
 */

import React from 'react';
import { renderWithProviders } from '../../helpers/renderWithProviders';
import { ThreadingPanel } from '@/components/panels/ThreadingPanel';
import type { ThreadEntry } from '@/types';

jest.mock('@/utils/referenceParser', () => ({
  extractReferences: jest.fn(() => []),
}));

const entries: ThreadEntry[] = [
  { anchor: 'Gen 1:1', target: 'John 1:1', direction: 'forward', type: 'echo', text: 'Both passages open with "In the beginning."' },
  { anchor: 'Gen 1:3', target: 'Ps 33:6', direction: 'forward', type: 'allusion', text: 'Creation by divine speech.' },
];

describe('ThreadingPanel', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders anchor and target references', () => {
    const { getByText } = renderWithProviders(
      <ThreadingPanel entries={entries} />,
    );
    expect(getByText('Gen 1:1')).toBeTruthy();
    expect(getByText('John 1:1')).toBeTruthy();
    expect(getByText('Gen 1:3')).toBeTruthy();
    expect(getByText('Ps 33:6')).toBeTruthy();
  });

  it('renders entry text', () => {
    const { getByText } = renderWithProviders(
      <ThreadingPanel entries={entries} />,
    );
    expect(getByText(/In the beginning/)).toBeTruthy();
  });

  it('renders type badge chips', () => {
    const { getByText } = renderWithProviders(
      <ThreadingPanel entries={entries} />,
    );
    expect(getByText('echo')).toBeTruthy();
    expect(getByText('allusion')).toBeTruthy();
  });

  it('renders with empty entries without crashing', () => {
    const { toJSON } = renderWithProviders(
      <ThreadingPanel entries={[]} />,
    );
    expect(toJSON()).toBeTruthy();
  });
});
