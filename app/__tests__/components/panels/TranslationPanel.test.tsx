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

  it('parses HTML table string format', () => {
    const html = `<table>
      <tr><td class="t-label">KJV</td><td>In the beginning</td></tr>
      <tr><td class="t-label">NIV</td><td>In the beginning</td></tr>
    </table>`;
    const { getByText } = renderWithProviders(<TranslationPanel data={html} />);
    expect(getByText('KJV')).toBeTruthy();
    expect(getByText('NIV')).toBeTruthy();
  });

  it('renders verse_ref headers', () => {
    const data: TransPanel = {
      rows: [
        {
          verse_ref: 'Gen 1:1',
          translations: [
            { version: 'ESV', text: 'In the beginning...' },
          ],
        },
      ],
    };
    const { getByText } = renderWithProviders(<TranslationPanel data={data} />);
    expect(getByText('Gen 1:1')).toBeTruthy();
  });

  it('renders without title when title is undefined', () => {
    const data: TransPanel = {
      rows: [
        {
          translations: [
            { version: 'KJV', text: 'In the beginning God created...' },
          ],
        },
      ],
    };
    const { getByText, queryByText } = renderWithProviders(<TranslationPanel data={data} />);
    expect(getByText('KJV')).toBeTruthy();
    // No title rendered
    expect(queryByText('Genesis 1:1 Translations')).toBeNull();
  });

  it('shows empty message for HTML with no valid rows', () => {
    const html = '<table><tr><th>Header</th></tr></table>';
    const { getByText } = renderWithProviders(<TranslationPanel data={html} />);
    expect(getByText('No translation comparisons available.')).toBeTruthy();
  });
});
