import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { renderWithProviders } from '../../helpers/renderWithProviders';
import { StudySessionCTA } from '@/components/guidedStudy/StudySessionCTA';

describe('StudySessionCTA', () => {
  const estimate = { readMin: 3, guidedMin: 8, deepMin: 20 };

  it('renders the estimate line with all three durations', () => {
    const { getByText } = renderWithProviders(
      <StudySessionCTA estimate={estimate} onPress={jest.fn()} />,
    );
    expect(getByText('Study this chapter')).toBeTruthy();
    expect(getByText('3 min read · 8 min guided · 20 min deep')).toBeTruthy();
  });

  it('fires onPress when tapped', () => {
    const onPress = jest.fn();
    const { getByLabelText } = renderWithProviders(
      <StudySessionCTA estimate={estimate} onPress={onPress} />,
    );
    fireEvent.press(getByLabelText('Study this chapter'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
