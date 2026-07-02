/**
 * #1836 — resume beat line.
 */
import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { ResumeBeat } from '@/components/guidedStudy/ResumeBeat';

describe('ResumeBeat (#1836)', () => {
  it('renders the step label from GUIDED_STUDY_STEP_LABELS', () => {
    const { getByText } = render(<ResumeBeat step="explore" onDismiss={jest.fn()} />);
    expect(getByText('Picking up where you left off — Explore.')).toBeTruthy();
  });

  it('is dismissible via an accessible control', () => {
    const onDismiss = jest.fn();
    const { getByLabelText } = render(<ResumeBeat step="synthesize" onDismiss={onDismiss} />);
    fireEvent.press(getByLabelText('Dismiss resume note'));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});
