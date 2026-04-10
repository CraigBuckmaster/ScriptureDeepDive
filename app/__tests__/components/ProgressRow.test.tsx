import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { renderWithProviders } from '../helpers/renderWithProviders';
import { ProgressRow } from '@/components/ProgressRow';

jest.mock('@/db/user', () => ({
  getTestamentProgress: jest.fn().mockResolvedValue([
    { testament: 'Old Testament', chaptersRead: 100, totalChapters: 929 },
    { testament: 'New Testament', chaptersRead: 50, totalChapters: 260 },
  ]),
}));

jest.mock('@/utils/shareVerse', () => ({
  shareProgress: jest.fn(),
}));

describe('ProgressRow', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders without crashing', () => {
    expect(() => {
      renderWithProviders(<ProgressRow chaptersRead={100} />);
    }).not.toThrow();
  });

  it('returns null when chaptersRead is 0', () => {
    const { toJSON } = renderWithProviders(<ProgressRow chaptersRead={0} />);
    expect(toJSON()).toBeNull();
  });

  it('shows chapters count', () => {
    const { getByText } = renderWithProviders(<ProgressRow chaptersRead={247} />);
    expect(getByText('247 of 1189 chapters')).toBeTruthy();
  });

  it('shows percentage', () => {
    const { getByText } = renderWithProviders(<ProgressRow chaptersRead={247} />);
    expect(getByText('20.8%')).toBeTruthy();
  });

  it('shows progress bar', () => {
    const { getByLabelText } = renderWithProviders(<ProgressRow chaptersRead={247} />);
    expect(getByLabelText(/Reading progress/)).toBeTruthy();
  });

  it('expands testament breakdown on press', async () => {
    const { getByLabelText, findByText } = renderWithProviders(
      <ProgressRow chaptersRead={150} />,
    );

    fireEvent.press(getByLabelText(/Reading progress/));

    // After expanding, should show testament breakdown
    const ot = await findByText('Old Testament');
    expect(ot).toBeTruthy();
  });
});
