/**
 * TabbedPanelRenderer.test.tsx — Tests for the reusable tabbed container.
 */

import React from 'react';
import { Text } from 'react-native';
import { fireEvent } from '@testing-library/react-native';
import { renderWithProviders } from '../../helpers/renderWithProviders';
import { TabbedPanelRenderer } from '@/components/panels/TabbedPanelRenderer';
import type { TabConfig } from '@/components/panels/TabbedPanelRenderer';

const tabs: TabConfig[] = [
  { key: 'alpha', label: 'Alpha', hasData: true },
  { key: 'beta', label: 'Beta', hasData: true },
  { key: 'gamma', label: 'Gamma', hasData: false },
];

const renderContent = (activeKey: string) => (
  <Text testID="tab-content">{`Content: ${activeKey}`}</Text>
);

describe('TabbedPanelRenderer', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders without crashing', () => {
    const { toJSON } = renderWithProviders(
      <TabbedPanelRenderer tabs={tabs}>{renderContent}</TabbedPanelRenderer>,
    );
    expect(toJSON()).toBeTruthy();
  });

  it('shows only tabs with hasData true', () => {
    const { getByText, queryByText } = renderWithProviders(
      <TabbedPanelRenderer tabs={tabs}>{renderContent}</TabbedPanelRenderer>,
    );
    expect(getByText('Alpha')).toBeTruthy();
    expect(getByText('Beta')).toBeTruthy();
    expect(queryByText('Gamma')).toBeNull();
  });

  it('defaults to first tab with data and renders its content', () => {
    const { getByText } = renderWithProviders(
      <TabbedPanelRenderer tabs={tabs}>{renderContent}</TabbedPanelRenderer>,
    );
    expect(getByText('Content: alpha')).toBeTruthy();
  });

  it('switches content when a tab is pressed', () => {
    const { getByText } = renderWithProviders(
      <TabbedPanelRenderer tabs={tabs}>{renderContent}</TabbedPanelRenderer>,
    );
    fireEvent.press(getByText('Beta'));
    expect(getByText('Content: beta')).toBeTruthy();
  });

  it('renders null when no tabs have data', () => {
    const emptyTabs: TabConfig[] = [
      { key: 'a', label: 'A', hasData: false },
    ];
    const { toJSON } = renderWithProviders(
      <TabbedPanelRenderer tabs={emptyTabs}>{renderContent}</TabbedPanelRenderer>,
    );
    expect(toJSON()).toBeNull();
  });

  it('skips tab bar when only one tab has data', () => {
    const singleTab: TabConfig[] = [
      { key: 'only', label: 'Only', hasData: true },
      { key: 'empty', label: 'Empty', hasData: false },
    ];
    const { queryByText, getByText } = renderWithProviders(
      <TabbedPanelRenderer tabs={singleTab}>{renderContent}</TabbedPanelRenderer>,
    );
    // Content should render but tab label should not appear as a tab button
    expect(getByText('Content: only')).toBeTruthy();
    expect(queryByText('Only')).toBeNull();
  });
});
