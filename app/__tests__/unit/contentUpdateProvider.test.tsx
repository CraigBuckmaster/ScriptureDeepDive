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

// Mock reloadDatabase
jest.mock('@/db/database', () => ({
  reloadDatabase: jest.fn().mockResolvedValue({}),
}));

// Mock ContentUpdateContext
jest.mock('@/contexts/ContentUpdateContext', () => {
  const React = require('react');
  const contextValue = {
    visible: false,
    progress: 0,
    status: 'downloading',
    error: null,
    dbVersion: 0,
    showUpdate: jest.fn(),
    updateProgress: jest.fn(),
    setStatus: jest.fn(),
    hideUpdate: jest.fn(),
    bumpDbVersion: jest.fn(),
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

  it('calls shouldCheckForUpdates on mount', async () => {
    const { ContentUpdater } = require('@/services/ContentUpdater');

    render(
      <ContentUpdateProvider>
        <Text>Check mount</Text>
      </ContentUpdateProvider>,
    );

    await new Promise((r) => setTimeout(r, 10));
    expect(ContentUpdater.shouldCheckForUpdates).toHaveBeenCalled();
  });

  it('runs full update check when shouldCheckForUpdates returns true and versions differ', async () => {
    const { ContentUpdater } = require('@/services/ContentUpdater');
    ContentUpdater.shouldCheckForUpdates.mockReturnValue(true);
    ContentUpdater.fetchManifest.mockResolvedValue({ current_version: '2.0' });
    ContentUpdater.getInstalledVersion.mockResolvedValue('1.0');
    ContentUpdater.checkForUpdates.mockResolvedValue({ status: 'updated' });

    const contextMock = require('@/contexts/ContentUpdateContext');
    const { showUpdate, updateProgress, setStatus } = contextMock.useContentUpdate();

    render(
      <ContentUpdateProvider>
        <Text>Update test</Text>
      </ContentUpdateProvider>,
    );

    await new Promise((r) => setTimeout(r, 50));
    expect(showUpdate).toHaveBeenCalled();
    expect(updateProgress).toHaveBeenCalledWith(10);
    // New flow: setStatus('applying') → reloadDatabase() → bumpDbVersion() → setStatus('success')
    expect(setStatus).toHaveBeenCalledWith('applying');
    const { reloadDatabase } = require('@/db/database');
    expect(reloadDatabase).toHaveBeenCalled();
    const { bumpDbVersion } = contextMock.useContentUpdate();
    expect(bumpDbVersion).toHaveBeenCalled();
    expect(setStatus).toHaveBeenLastCalledWith('success');
  });

  it('skips update banner when versions match', async () => {
    const { ContentUpdater } = require('@/services/ContentUpdater');
    ContentUpdater.shouldCheckForUpdates.mockReturnValue(true);
    ContentUpdater.fetchManifest.mockResolvedValue({ current_version: '1.0' });
    ContentUpdater.getInstalledVersion.mockResolvedValue('1.0');

    const contextMock = require('@/contexts/ContentUpdateContext');
    const { showUpdate } = contextMock.useContentUpdate();
    showUpdate.mockClear();

    render(
      <ContentUpdateProvider>
        <Text>Same version</Text>
      </ContentUpdateProvider>,
    );

    await new Promise((r) => setTimeout(r, 50));
    // showUpdate should NOT be called when versions match
    expect(showUpdate).not.toHaveBeenCalled();
  });

  it('handles update check error gracefully', async () => {
    const { ContentUpdater } = require('@/services/ContentUpdater');
    ContentUpdater.shouldCheckForUpdates.mockReturnValue(true);
    ContentUpdater.fetchManifest.mockRejectedValue(new Error('Network error'));

    const contextMock = require('@/contexts/ContentUpdateContext');
    const { setStatus } = contextMock.useContentUpdate();

    render(
      <ContentUpdateProvider>
        <Text>Error test</Text>
      </ContentUpdateProvider>,
    );

    await new Promise((r) => setTimeout(r, 50));
    expect(setStatus).toHaveBeenCalledWith('error', 'Network error');
  });

  it('hides update banner when result is up_to_date', async () => {
    const { ContentUpdater } = require('@/services/ContentUpdater');
    ContentUpdater.shouldCheckForUpdates.mockReturnValue(true);
    ContentUpdater.fetchManifest.mockResolvedValue({ current_version: '2.0' });
    ContentUpdater.getInstalledVersion.mockResolvedValue('1.0');
    ContentUpdater.checkForUpdates.mockResolvedValue({ status: 'up_to_date' });

    const contextMock = require('@/contexts/ContentUpdateContext');
    const { hideUpdate } = contextMock.useContentUpdate();

    render(
      <ContentUpdateProvider>
        <Text>Up to date test</Text>
      </ContentUpdateProvider>,
    );

    await new Promise((r) => setTimeout(r, 50));
    expect(hideUpdate).toHaveBeenCalled();
  });

  it('handles failed update status', async () => {
    const { ContentUpdater } = require('@/services/ContentUpdater');
    ContentUpdater.shouldCheckForUpdates.mockReturnValue(true);
    ContentUpdater.fetchManifest.mockResolvedValue({ current_version: '2.0' });
    ContentUpdater.getInstalledVersion.mockResolvedValue('1.0');
    ContentUpdater.checkForUpdates.mockResolvedValue({ status: 'failed', error: 'DB corrupt' });

    const contextMock = require('@/contexts/ContentUpdateContext');
    const { setStatus } = contextMock.useContentUpdate();

    render(
      <ContentUpdateProvider>
        <Text>Failed test</Text>
      </ContentUpdateProvider>,
    );

    await new Promise((r) => setTimeout(r, 50));
    expect(setStatus).toHaveBeenCalledWith('error', 'DB corrupt');
  });
});
