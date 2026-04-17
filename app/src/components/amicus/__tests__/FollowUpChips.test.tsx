import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { renderWithProviders } from '../../../../__tests__/helpers/renderWithProviders';
import FollowUpChips from '@/components/amicus/FollowUpChips';

describe('FollowUpChips', () => {
  it('returns null when the list is empty', () => {
    const { toJSON } = renderWithProviders(
      <FollowUpChips followUps={[]} onSelect={() => undefined} />,
    );
    expect(toJSON()).toBeNull();
  });

  it('renders up to 3 chips and fires onSelect with the chip text', () => {
    const onSelect = jest.fn();
    const followUps = ['Q1', 'Q2', 'Q3', 'Q4'];
    const { getByLabelText, queryByLabelText } = renderWithProviders(
      <FollowUpChips followUps={followUps} onSelect={onSelect} />,
    );
    expect(queryByLabelText('Ask: Q4')).toBeNull();
    fireEvent.press(getByLabelText('Ask: Q2'));
    expect(onSelect).toHaveBeenCalledWith('Q2');
  });
});
