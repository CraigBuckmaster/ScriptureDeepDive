import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { renderWithProviders } from '../../helpers/renderWithProviders';
import { StudySessionStepper } from '@/components/guidedStudy/StudySessionStepper';

describe('StudySessionStepper', () => {
  it('renders all five canonical steps', () => {
    const { getByText } = renderWithProviders(
      <StudySessionStepper activeStep="scene" onSelect={jest.fn()} />,
    );
    ['Scene', 'Observe', 'Explore', 'Synthesize', 'Review'].forEach((label) => {
      expect(getByText(label)).toBeTruthy();
    });
  });

  it('fires onSelect with the tapped step key', () => {
    const onSelect = jest.fn();
    const { getByText } = renderWithProviders(
      <StudySessionStepper activeStep="scene" onSelect={onSelect} />,
    );
    fireEvent.press(getByText('Explore'));
    expect(onSelect).toHaveBeenCalledWith('explore');
  });
});
