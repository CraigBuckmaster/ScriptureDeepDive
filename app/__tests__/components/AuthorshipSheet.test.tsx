import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { renderWithProviders } from '../helpers/renderWithProviders';
import { AuthorshipSheet } from '@/components/AuthorshipSheet';

const defaultProps = {
  visible: true,
  onClose: jest.fn(),
};

describe('AuthorshipSheet', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders without crashing when visible', () => {
    const { getByText } = renderWithProviders(
      <AuthorshipSheet {...defaultProps} />,
    );
    expect(getByText('About This Content')).toBeTruthy();
  });

  it('shows methodology description text', () => {
    const { getByText } = renderWithProviders(
      <AuthorshipSheet {...defaultProps} />,
    );
    expect(
      getByText(/Companion Study presents the Bible text alongside scholarly commentary/),
    ).toBeTruthy();
  });

  it('shows copyright notice', () => {
    const { getByText } = renderWithProviders(
      <AuthorshipSheet {...defaultProps} />,
    );
    expect(getByText(/© Companion Study/)).toBeTruthy();
  });

  it('shows translation attribution', () => {
    const { getByText } = renderWithProviders(
      <AuthorshipSheet {...defaultProps} />,
    );
    expect(getByText(/NIV and ESV translations/)).toBeTruthy();
  });
});
