import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { renderWithProviders } from '../helpers/renderWithProviders';
import { ProgressRow } from '@/components/ProgressRow';

const mockGetTestamentProgress = jest.fn().mockResolvedValue([
  { testament: 'Old Testament', chaptersRead: 100, totalChapters: 929 },
  { testament: 'New Testament', chaptersRead: 50, totalChapters: 260 },
]);

jest.mock('@/db/user', () => ({
  getTestamentProgress: (...args: any[]) => mockGetTestamentProgress(...args),
}));

const mockShareProgress = jest.fn();
jest.mock('@/utils/shareVerse', () => ({
  shareProgress: (...args: any[]) => mockShareProgress(...args),
}));

jest.mock('@/utils/logger', () => ({
  logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
}));

describe('ProgressRow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetTestamentProgress.mockResolvedValue([
      { testament: 'Old Testament', chaptersRead: 100, totalChapters: 929 },
      { testament: 'New Testament', chaptersRead: 50, totalChapters: 260 },
    ]);
  });

  it('renders without crashing', () => {
    expect(() => {
      renderWithProviders(<ProgressRow chaptersRead={100} />);
    }).not.toThrow();
  });

  it('returns null when chaptersRead is 0', () => {
    const { toJSON } = renderWithProviders(<ProgressRow chaptersRead={0} />);
    expect(toJSON()).toBeNull();
  });

  it('returns null when chaptersRead is negative', () => {
    const { toJSON } = renderWithProviders(<ProgressRow chaptersRead={-1} />);
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

    const ot = await findByText('Old Testament');
    expect(ot).toBeTruthy();
    const nt = await findByText('New Testament');
    expect(nt).toBeTruthy();
  });

  it('collapses testament breakdown on second press', async () => {
    const { getByLabelText, findByText, queryByText } = renderWithProviders(
      <ProgressRow chaptersRead={150} />,
    );

    fireEvent.press(getByLabelText(/Reading progress/));
    await findByText('Old Testament');

    fireEvent.press(getByLabelText(/Reading progress/));
    expect(queryByText('Old Testament')).toBeNull();
  });

  it('skips testament rows with 0 chapters read', async () => {
    mockGetTestamentProgress.mockResolvedValue([
      { testament: 'Old Testament', chaptersRead: 0, totalChapters: 929 },
      { testament: 'New Testament', chaptersRead: 50, totalChapters: 260 },
    ]);

    const { getByLabelText, findByText, queryByText } = renderWithProviders(
      <ProgressRow chaptersRead={50} />,
    );

    fireEvent.press(getByLabelText(/Reading progress/));
    await findByText('New Testament');
    expect(queryByText('Old Testament')).toBeNull();
  });

  it('handles getTestamentProgress error gracefully', async () => {
    mockGetTestamentProgress.mockRejectedValue(new Error('DB error'));
    const { getByText } = renderWithProviders(<ProgressRow chaptersRead={100} />);
    expect(getByText('100 of 1189 chapters')).toBeTruthy();
  });

  it('shows testament percentages and chapter counts', async () => {
    const { getByLabelText, findByText } = renderWithProviders(
      <ProgressRow chaptersRead={150} />,
    );

    fireEvent.press(getByLabelText(/Reading progress/));
    const stat = await findByText(/100\/929/);
    expect(stat).toBeTruthy();
  });

  it('renders share button', () => {
    const { getByLabelText } = renderWithProviders(
      <ProgressRow chaptersRead={247} />,
    );
    expect(getByLabelText('Share reading progress')).toBeTruthy();
  });
});
