import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { renderWithProviders } from '../../helpers/renderWithProviders';
import { FlagButton } from '@/components/moderation/FlagButton';

jest.mock('@/services/engagementApi', () => ({
  submitFlag: jest.fn().mockResolvedValue({ rateLimited: false }),
}));

describe('FlagButton', () => {
  it('renders without crashing', () => {
    const { getByLabelText } = renderWithProviders(
      <FlagButton contentId="c-1" contentType="submission" />,
    );
    expect(getByLabelText('Report content')).toBeTruthy();
  });

  it('pressing opens the FlagReasonPicker modal', () => {
    const { getByLabelText, getByText } = renderWithProviders(
      <FlagButton contentId="c-1" contentType="submission" />,
    );
    fireEvent.press(getByLabelText('Report content'));
    expect(getByText('Report Content')).toBeTruthy();
  });

  it('modal shows reason options', () => {
    const { getByLabelText, getByText } = renderWithProviders(
      <FlagButton contentId="c-1" contentType="submission" />,
    );
    fireEvent.press(getByLabelText('Report content'));
    expect(getByText('Spam')).toBeTruthy();
    expect(getByText('Inappropriate content')).toBeTruthy();
    expect(getByText('Off-topic')).toBeTruthy();
  });
});
