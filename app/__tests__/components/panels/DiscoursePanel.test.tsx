/**
 * DiscoursePanel.test.tsx — Tests for the discourse/argument tree panel.
 */

import React from 'react';
import { renderWithProviders } from '../../helpers/renderWithProviders';
import { DiscoursePanel } from '@/components/panels/DiscoursePanel';

jest.mock('lucide-react-native', () => ({
  ChevronDown: () => 'ChevronDown',
  ChevronRight: () => 'ChevronRight',
}));

const data = {
  thesis: 'Justification is by faith apart from works of the law.',
  nodes: [
    {
      id: 'n1',
      type: 'premise' as const,
      verse_range: 'vv. 1-3',
      marker: 'For',
      text: 'All have sinned and fall short of the glory of God.',
      children: [],
    },
    {
      id: 'n2',
      type: 'conclusion' as const,
      verse_range: 'v. 4',
      text: 'Therefore we conclude that a person is justified by faith.',
    },
  ],
  note: 'Central argument of Romans 3.',
};

describe('DiscoursePanel', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders the main thesis', () => {
    const { getByText } = renderWithProviders(
      <DiscoursePanel data={data} />,
    );
    expect(getByText('MAIN THESIS')).toBeTruthy();
    expect(getByText(/Justification is by faith/)).toBeTruthy();
  });

  it('renders discourse nodes with type badges', () => {
    const { getByText } = renderWithProviders(
      <DiscoursePanel data={data} />,
    );
    expect(getByText('Premise')).toBeTruthy();
    expect(getByText('Conclusion')).toBeTruthy();
    expect(getByText(/All have sinned/)).toBeTruthy();
  });

  it('renders the note text', () => {
    const { getByText } = renderWithProviders(
      <DiscoursePanel data={data} />,
    );
    expect(getByText('Central argument of Romans 3.')).toBeTruthy();
  });

  it('shows empty state when data is null', () => {
    const { getByText } = renderWithProviders(
      <DiscoursePanel data={null as any} />,
    );
    expect(getByText('No argument structure data available.')).toBeTruthy();
  });
});
