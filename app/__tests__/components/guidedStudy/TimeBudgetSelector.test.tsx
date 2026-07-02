/**
 * #1842 — "How long do you have?" segmented row. Full is the default
 * and the row never blocks.
 */
import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { TimeBudgetSelector } from '@/components/guidedStudy/TimeBudgetSelector';

describe('TimeBudgetSelector (#1842)', () => {
  it('renders the three options with Full selected by default (value=null)', () => {
    const { getByLabelText } = render(<TimeBudgetSelector value={null} onChange={jest.fn()} />);
    expect(getByLabelText('Full session').props.accessibilityState).toMatchObject({
      selected: true,
    });
    expect(getByLabelText('10 minute session').props.accessibilityState).toMatchObject({
      selected: false,
    });
    expect(getByLabelText('20 minute session').props.accessibilityState).toMatchObject({
      selected: false,
    });
  });

  it('reports budget picks and returning to Full', () => {
    const onChange = jest.fn();
    const { getByLabelText } = render(<TimeBudgetSelector value={null} onChange={onChange} />);
    fireEvent.press(getByLabelText('10 minute session'));
    expect(onChange).toHaveBeenCalledWith(10);
    fireEvent.press(getByLabelText('20 minute session'));
    expect(onChange).toHaveBeenCalledWith(20);
    fireEvent.press(getByLabelText('Full session'));
    expect(onChange).toHaveBeenCalledWith(null);
  });
});
