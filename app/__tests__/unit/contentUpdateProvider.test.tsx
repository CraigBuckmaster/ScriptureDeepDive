/**
 * Tests for providers/ContentUpdateProvider.
 */
import React from 'react';
import { render } from '@testing-library/react-native';
import { Text } from 'react-native';

// Mock ContentUpdater
jest.mock('@/services/ContentUpdater', () => ({
  ContentUpdater: {
    shouldCheckForUpdates: jest.fn().mockReturnValue(false),
    fetchManifest: jest.fn().mockResolvedValue({ current_version: '1.0' }),
    getInstalledVersion: jest.fn().mockResolvedValue('1.0'),
    checkForUpdates: jest.fn().mockResolvedValue({ status: 'up_to_date' }),
  },
}));

// Mock ContentUpdateBanner
jest.mock('@/components/ContentUpdateBanner', () => ({
  ContentUpdateBanner: () => null,
}));

// Mock ContentUpdateContext
jest.mock('@/contexts/ContentUpdateContext', () => {
  const React = require('react');
  const contextValue = {
    visible: false,
    progress: 0,
    status: 'downloading',
    error: null,
    showUpdate: jest.fn(),
    updateProgress: jest.fn(),
    setStatus: jest.fn(),
    hideUpdate: jest.fn(),
  };
  return {
    ContentUpdateProvider: ({ children }: any) => children,
    useContentUpdate: () => contextValue,
  };
});

import { ContentUpdateProvider } from '@/providers/ContentUpdateProvider';

describe('ContentUpdateProvider', () => {
  it('renders children', () => {
    const { getByText } = render(
      <ContentUpdateProvider>
        <Text>App Content</Text>
      </ContentUpdateProvider>,
    );
    expect(getByText('App Content')).toBeTruthy();
  });

  it('does not crash when mounted', () => {
    expect(() => {
      render(
        <ContentUpdateProvider>
          <Text>Test</Text>
        </ContentUpdateProvider>,
      );
    }).not.toThrow();
  });
});
