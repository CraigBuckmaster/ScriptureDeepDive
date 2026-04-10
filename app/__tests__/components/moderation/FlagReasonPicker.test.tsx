import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { renderWithProviders } from '../../helpers/renderWithProviders';
import { FlagReasonPicker } from '@/components/moderation/FlagReasonPicker';

jest.mock('@/services/engagementApi', () => ({
  submitFlag: jest.fn().mockResolvedValue({ rateLimited: false }),
}));

describe('FlagReasonPicker', () => {
  const defaultProps = {
    visible: true,
    contentId: 'c-1',
    contentType: 'submission',
    onClose: jest.fn(),
  };

  beforeEach(() => jest.clearAllMocks());

  it('renders all reason options when visible', () => {
    const { getByText } = renderWithProviders(
      <FlagReasonPicker {...defaultProps} />,
    );
    expect(getByText('Spam')).toBeTruthy();
    expect(getByText('Inappropriate content')).toBeTruthy();
    expect(getByText('Off-topic')).toBeTruthy();
    expect(getByText('Harmful/dangerous advice')).toBeTruthy();
    expect(getByText('Other')).toBeTruthy();
  });

  it('shows "Report Content" title', () => {
    const { getByText } = renderWithProviders(
      <FlagReasonPicker {...defaultProps} />,
    );
    expect(getByText('Report Content')).toBeTruthy();
  });

  it('selecting a reason enables the submit button', () => {
    const { getByText, getByLabelText } = renderWithProviders(
      <FlagReasonPicker {...defaultProps} />,
    );
    fireEvent.press(getByText('Spam'));
    expect(getByLabelText('Submit report')).toBeTruthy();
  });
});
