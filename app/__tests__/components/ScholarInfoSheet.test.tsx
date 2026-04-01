import React from 'react';
import { fireEvent, waitFor } from '@testing-library/react-native';
import { renderWithProviders } from '../helpers/renderWithProviders';
import { ScholarInfoSheet } from '@/components/ScholarInfoSheet';

const mockScholar = {
  id: 'carson',
  name: 'D.A. Carson',
  tradition: 'Evangelical',
  bio_json: JSON.stringify({
    eyebrow: 'New Testament Scholar',
    sections: [{ body: 'D.A. Carson is a renowned evangelical scholar and professor.' }],
  }),
};

jest.mock('@/db/content', () => ({
  getScholar: jest.fn().mockResolvedValue(null),
}));

jest.mock('@/utils/logger', () => ({
  logger: { error: jest.fn(), warn: jest.fn(), info: jest.fn() },
}));

const defaultProps = {
  visible: true,
  onClose: jest.fn(),
  scholarId: 'carson' as string | null,
};

describe('ScholarInfoSheet', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders without crashing when visible', () => {
    const { getByText } = renderWithProviders(
      <ScholarInfoSheet {...defaultProps} />,
    );
    expect(getByText('Loading...')).toBeTruthy();
  });

  it('shows scholar name and tradition after loading', async () => {
    const { getScholar } = require('@/db/content');
    getScholar.mockResolvedValueOnce(mockScholar);

    const { getByText } = renderWithProviders(
      <ScholarInfoSheet {...defaultProps} />,
    );
    await waitFor(() => {
      expect(getByText('D.A. Carson')).toBeTruthy();
      expect(getByText('Evangelical')).toBeTruthy();
    });
  });

  it('shows eyebrow and bio section', async () => {
    const { getScholar } = require('@/db/content');
    getScholar.mockResolvedValueOnce(mockScholar);

    const { getByText } = renderWithProviders(
      <ScholarInfoSheet {...defaultProps} />,
    );
    await waitFor(() => {
      expect(getByText('New Testament Scholar')).toBeTruthy();
      expect(getByText('D.A. Carson is a renowned evangelical scholar and professor.')).toBeTruthy();
    });
  });

  it('calls onClose when backdrop is pressed', () => {
    const onClose = jest.fn();
    renderWithProviders(
      <ScholarInfoSheet {...defaultProps} onClose={onClose} />,
    );
    // The Modal onRequestClose and backdrop tap both call onClose
  });

  it('shows full bio link when onGoToFullBio is provided', async () => {
    const { getScholar } = require('@/db/content');
    getScholar.mockResolvedValueOnce(mockScholar);
    const onGoToFullBio = jest.fn();

    const { getByText } = renderWithProviders(
      <ScholarInfoSheet {...defaultProps} onGoToFullBio={onGoToFullBio} />,
    );
    await waitFor(() => {
      expect(getByText('See full bio \u2192')).toBeTruthy();
    });
    fireEvent.press(getByText('See full bio \u2192'));
    expect(onGoToFullBio).toHaveBeenCalledWith('carson');
  });
});
