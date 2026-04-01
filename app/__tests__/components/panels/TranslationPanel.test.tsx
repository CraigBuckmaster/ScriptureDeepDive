/**
 * TranslationPanel.test.tsx — Tests for the translation comparison panel.
 */

import React from 'react';
import { renderWithProviders } from '../../helpers/renderWithProviders';
import { TranslationPanel } from '@/components/panels/TranslationPanel';
import type { TransPanel } from '@/types';

const structuredData: TransPanel = {
  title: 'Genesis 1:1 Translations',
  rows: [
    {
      verse_ref: 'Genesis 1:1',
      translations: [
        { version: 'ESV', text: 'In the beginning, God created the heavens and the earth.' },
        { version: 'NIV', text: 'In the beginning God created the heavens and the earth.' },
      ],
    },
  ],
};

describe('TranslationPanel', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders without crashing with structured data', () => {
    const { toJSON } = renderWithProviders(<TranslationPanel data={structuredData} />);
    expect(toJSON()).toBeTruthy();
  });

  it('renders title, version labels, and translation text', () => {
    const { getByText } = renderWithProviders(<TranslationPanel data={structuredData} />);
    expect(getByText('Genesis 1:1 Translations')).toBeTruthy();
    expect(getByText('ESV')).toBeTruthy();
    expect(getByText('NIV')).toBeTruthy();
    expect(getByText(/In the beginning, God created/)).toBeTruthy();
  });

  it('renders fallback message when data has no rows', () => {
    const emptyData: TransPanel = { title: 'Empty', rows: [] };
    const { getByText } = renderWithProviders(<TranslationPanel data={emptyData} />);
    expect(getByText('No translation comparisons available.')).toBeTruthy();
  });

  it('renders fallback message for null-ish data', () => {
    const { getByText } = renderWithProviders(<TranslationPanel data={null as any} />);
    expect(getByText('No translation comparisons available.')).toBeTruthy();
  });
});
