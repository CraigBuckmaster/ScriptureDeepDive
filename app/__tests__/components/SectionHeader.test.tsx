/**
 * Tests for SectionHeader depth dots overflow fix.
 *
 * Bug: Long section titles pushed the DepthDots indicator off the
 * right side of the screen.
 * Fix: Added flex: 1 to title text and flexShrink: 0 to depth wrapper.
 */

import React from 'react';
import { renderWithProviders } from '../helpers/renderWithProviders';
import { SectionHeader } from '@/components/SectionHeader';

jest.mock('@/components/DepthDots', () => ({
  DepthDots: ({ explored, total }: any) => {
    const { Text } = require('react-native');
    return <Text testID="depth-dots">{explored}/{total}</Text>;
  },
}));

describe('SectionHeader', () => {
  it('renders header text', () => {
    const { getByText } = renderWithProviders(
      <SectionHeader header="Test Section" />
    );
    expect(getByText('Test Section')).toBeTruthy();
  });

  it('renders DepthDots when total > 0', () => {
    const { getByTestId } = renderWithProviders(
      <SectionHeader header="Test" explored={2} total={5} />
    );
    expect(getByTestId('depth-dots')).toBeTruthy();
  });

  it('does not render DepthDots when total is 0', () => {
    const { queryByTestId } = renderWithProviders(
      <SectionHeader header="Test" explored={0} total={0} />
    );
    expect(queryByTestId('depth-dots')).toBeNull();
  });

  it('renders both long title and depth dots without crash', () => {
    const longTitle = 'Verses 1-19 — A Very Long Section Title That Could Push Elements Off Screen If Not Handled';
    const { getByText, getByTestId } = renderWithProviders(
      <SectionHeader header={longTitle} explored={3} total={8} />
    );
    expect(getByText(longTitle)).toBeTruthy();
    expect(getByTestId('depth-dots')).toBeTruthy();
  });
});
