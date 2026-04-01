import React from 'react';
import { fireEvent, waitFor } from '@testing-library/react-native';
import { renderWithProviders } from '../helpers/renderWithProviders';
import { ThreadViewerSheet } from '@/components/ThreadViewerSheet';

const mockThread = {
  id: 'thread-1',
  theme: 'The Covenant Promise',
  steps_json: JSON.stringify([
    { ref: 'Genesis 12:1-3', note: 'God calls Abram and promises blessing.' },
    { ref: 'Genesis 15:6', note: 'Abram believed and it was credited as righteousness.' },
    { ref: 'Galatians 3:8', note: 'Paul connects the Abrahamic promise to the gospel.' },
  ]),
};

jest.mock('@/db/content', () => ({
  getCrossRefThread: jest.fn().mockResolvedValue(null),
}));

jest.mock('@/utils/logger', () => ({
  logger: { error: jest.fn(), warn: jest.fn(), info: jest.fn() },
}));

jest.mock('@/components/BadgeChip', () => ({
  BadgeChip: () => null,
}));

const defaultProps = {
  visible: true,
  onClose: jest.fn(),
  threadId: 'thread-1' as string | null,
};

describe('ThreadViewerSheet', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders without crashing when visible', () => {
    const { getByText } = renderWithProviders(
      <ThreadViewerSheet {...defaultProps} />,
    );
    expect(getByText('Loading thread...')).toBeTruthy();
  });

  it('shows thread theme after loading', async () => {
    const { getCrossRefThread } = require('@/db/content');
    getCrossRefThread.mockResolvedValueOnce(mockThread);

    const { getByText } = renderWithProviders(
      <ThreadViewerSheet {...defaultProps} />,
    );
    await waitFor(() => {
      expect(getByText('The Covenant Promise')).toBeTruthy();
    });
  });

  it('displays all steps with refs and notes', async () => {
    const { getCrossRefThread } = require('@/db/content');
    getCrossRefThread.mockResolvedValueOnce(mockThread);

    const { getByText } = renderWithProviders(
      <ThreadViewerSheet {...defaultProps} />,
    );
    await waitFor(() => {
      expect(getByText('Genesis 12:1-3')).toBeTruthy();
      expect(getByText('God calls Abram and promises blessing.')).toBeTruthy();
      expect(getByText('Genesis 15:6')).toBeTruthy();
      expect(getByText('Galatians 3:8')).toBeTruthy();
    });
  });

  it('shows loading state when threadId is provided but data not yet fetched', () => {
    const { getByText } = renderWithProviders(
      <ThreadViewerSheet {...defaultProps} />,
    );
    expect(getByText('Loading thread...')).toBeTruthy();
  });
});
