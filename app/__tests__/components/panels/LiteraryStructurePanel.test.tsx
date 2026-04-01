/**
 * LiteraryStructurePanel.test.tsx — Tests for the literary structure panel.
 */

import React from 'react';
import { renderWithProviders } from '../../helpers/renderWithProviders';
import { LiteraryStructurePanel } from '@/components/panels/LiteraryStructurePanel';
import type { LitPanel } from '@/types';

jest.mock('@/utils/referenceParser', () => ({
  extractReferences: jest.fn(() => []),
}));

const data: LitPanel = {
  rows: [
    { label: 'A', range: '1:1-2', text: 'Introduction', is_key: false },
    { label: 'B', range: '1:3-5', text: 'First day of creation', is_key: true },
  ],
  note: 'The structure follows a pattern of command and fulfillment.',
};

const dataWithChiasm: LitPanel = {
  ...data,
  chiasm: {
    title: 'Chiasm of Gen 1',
    pairs: [{ label: 'A', top: 'Light', bottom: 'Luminaries', color: '#64B5F6' }],
    center: { label: 'C', text: 'Central point' },
  },
};

describe('LiteraryStructurePanel', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders without crashing', () => {
    const { toJSON } = renderWithProviders(<LiteraryStructurePanel data={data} />);
    expect(toJSON()).toBeTruthy();
  });

  it('renders structure row labels and text', () => {
    const { getByText } = renderWithProviders(<LiteraryStructurePanel data={data} />);
    expect(getByText('A')).toBeTruthy();
    expect(getByText('Introduction')).toBeTruthy();
    expect(getByText('B')).toBeTruthy();
    expect(getByText('First day of creation')).toBeTruthy();
  });

  it('renders the note', () => {
    const { getByText } = renderWithProviders(<LiteraryStructurePanel data={data} />);
    expect(getByText(/pattern of command and fulfillment/)).toBeTruthy();
  });

  it('handles empty rows without crashing', () => {
    const { toJSON } = renderWithProviders(
      <LiteraryStructurePanel data={{ rows: [], note: '' }} />,
    );
    // May return null for empty data — just verify no crash
    expect(() => toJSON()).not.toThrow();
  });
});
