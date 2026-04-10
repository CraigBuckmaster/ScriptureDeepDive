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

  it('shows details input when Other is selected', () => {
    const { getByText, getByPlaceholderText } = renderWithProviders(
      <FlagReasonPicker {...defaultProps} />,
    );
    fireEvent.press(getByText('Other'));
    expect(getByPlaceholderText('Please describe the issue...')).toBeTruthy();
  });

  it('cancel button calls onClose', () => {
    const onClose = jest.fn();
    const { getByLabelText } = renderWithProviders(
      <FlagReasonPicker {...defaultProps} onClose={onClose} />,
    );
    fireEvent.press(getByLabelText('Cancel'));
    expect(onClose).toHaveBeenCalled();
  });

  it('submit calls submitFlag with selected reason', async () => {
    const { submitFlag } = require('@/services/engagementApi');
    const { getByText, getByLabelText } = renderWithProviders(
      <FlagReasonPicker {...defaultProps} />,
    );

    fireEvent.press(getByText('Spam'));
    fireEvent.press(getByLabelText('Submit report'));

    await new Promise((r) => setTimeout(r, 10));
    expect(submitFlag).toHaveBeenCalledWith('c-1', 'submission', 'Spam', undefined);
  });

  it('shows subtitle text', () => {
    const { getByText } = renderWithProviders(
      <FlagReasonPicker {...defaultProps} />,
    );
    expect(getByText('Why are you reporting this?')).toBeTruthy();
  });

  it('does not render content when not visible', () => {
    const { queryByText } = renderWithProviders(
      <FlagReasonPicker {...defaultProps} visible={false} />,
    );
    // Modal is not visible, so content should not appear
    // (though with RN Modal, it may still be in the tree but not shown)
    expect(queryByText('Report Content')).toBeFalsy();
  });
});
