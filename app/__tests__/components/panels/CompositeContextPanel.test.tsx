/**
 * CompositeContextPanel.test.tsx — Tests for the tabbed context hub panel.
 */

import React from 'react';
import { renderWithProviders } from '../../helpers/renderWithProviders';
import { CompositeContextPanel } from '@/components/panels/CompositeContextPanel';
import type { CompositeContextData } from '@/types';

jest.mock('@/utils/referenceParser', () => ({
  extractReferences: jest.fn(() => []),
}));

const data: CompositeContextData = {
  context: 'The creation narrative opens the entire biblical canon.',
  historical: 'Written during the Mosaic period.',
  audience: 'Ancient Israel leaving Egypt.',
  ane: [
    {
      parallel: 'Enuma Elish',
      similarity: 'Both describe creation from chaos.',
      difference: 'Genesis is monotheistic.',
      significance: 'Polemic against polytheism.',
    },
  ],
};

describe('CompositeContextPanel', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders without crashing', () => {
    const { toJSON } = renderWithProviders(<CompositeContextPanel data={data} />);
    expect(toJSON()).toBeTruthy();
  });

  it('renders tab labels when multiple tabs have data', () => {
    const { getByText } = renderWithProviders(<CompositeContextPanel data={data} />);
    expect(getByText('Context')).toBeTruthy();
    expect(getByText('Historical')).toBeTruthy();
    expect(getByText('Audience')).toBeTruthy();
    expect(getByText('ANE')).toBeTruthy();
  });

  it('renders with only context data (single tab, no tab bar)', () => {
    const singleData: CompositeContextData = { context: 'Just context.' };
    const { toJSON } = renderWithProviders(<CompositeContextPanel data={singleData} />);
    expect(toJSON()).toBeTruthy();
  });

  it('renders with no data without crashing', () => {
    const emptyData: CompositeContextData = {};
    const { toJSON } = renderWithProviders(<CompositeContextPanel data={emptyData} />);
    // No tabs have data, should render null
    expect(toJSON()).toBeNull();
  });

  it('can default to historical tab', () => {
    const { toJSON } = renderWithProviders(
      <CompositeContextPanel data={data} defaultTab="historical" />,
    );
    expect(toJSON()).toBeTruthy();
  });

  it('renders ANE parallels tab content with parallel details', () => {
    const aneOnlyData: CompositeContextData = {
      ane: [
        {
          parallel: 'Gilgamesh',
          similarity: 'Flood narrative',
          difference: 'Monotheistic vs polytheistic',
          significance: 'Shared ANE tradition',
        },
      ],
    };
    const { getByText } = renderWithProviders(
      <CompositeContextPanel data={aneOnlyData} />,
    );
    expect(getByText('Gilgamesh')).toBeTruthy();
    expect(getByText('Similarity')).toBeTruthy();
    expect(getByText('Difference')).toBeTruthy();
    expect(getByText('Significance')).toBeTruthy();
  });

  it('renders audience-only data without tab bar', () => {
    const audienceData: CompositeContextData = { audience: 'First-century Jews' };
    const { toJSON } = renderWithProviders(
      <CompositeContextPanel data={audienceData} />,
    );
    expect(toJSON()).toBeTruthy();
  });
});
