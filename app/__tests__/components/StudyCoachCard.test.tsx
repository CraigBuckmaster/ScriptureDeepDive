import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { renderWithProviders } from '../helpers/renderWithProviders';
import { StudyCoachCard } from '@/components/StudyCoachCard';

describe('StudyCoachCard', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders without crashing', () => {
    const { getByText } = renderWithProviders(
      <StudyCoachCard tip="Notice the chiasm here." onDismiss={jest.fn()} />,
    );
    expect(getByText('STUDY COACH')).toBeTruthy();
  });

  it('displays the tip text', () => {
    const { getByText } = renderWithProviders(
      <StudyCoachCard tip="Notice the chiasm here." onDismiss={jest.fn()} />,
    );
    expect(getByText('Notice the chiasm here.')).toBeTruthy();
  });

  it('calls onDismiss when dismiss button is pressed', () => {
    const onDismiss = jest.fn();
    const { getByText } = renderWithProviders(
      <StudyCoachCard tip="A helpful tip." onDismiss={onDismiss} />,
    );
    fireEvent.press(getByText('✕'));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});
