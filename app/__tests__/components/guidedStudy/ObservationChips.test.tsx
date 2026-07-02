/**
 * #1839 — ObservationChips: toggle buttons with announced selected
 * state; renders nothing with no candidates.
 */
import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { ObservationChips } from '@/components/guidedStudy/ObservationChips';

const CHIPS = [
  { id: 'covenant', label: 'Covenant' },
  { id: 'repeat:water', label: 'Water' },
];

describe('ObservationChips (#1839)', () => {
  it('renders chips as toggle buttons and reports presses', () => {
    const onToggle = jest.fn();
    const { getByLabelText } = render(
      <ObservationChips chips={CHIPS} selected={[]} onToggle={onToggle} />,
    );

    const covenant = getByLabelText('Covenant');
    expect(covenant.props.accessibilityState).toMatchObject({ selected: false });
    fireEvent.press(covenant);
    expect(onToggle).toHaveBeenCalledWith('Covenant');
  });

  it('announces the selected state on marked chips', () => {
    const { getByLabelText } = render(
      <ObservationChips chips={CHIPS} selected={['Water']} onToggle={jest.fn()} />,
    );
    const water = getByLabelText('Water, marked');
    expect(water.props.accessibilityState).toMatchObject({ selected: true });
    expect(getByLabelText('Covenant').props.accessibilityState).toMatchObject({
      selected: false,
    });
  });

  it('labels the group as optional and renders nothing without candidates', () => {
    const { getByText } = render(
      <ObservationChips chips={CHIPS} selected={[]} onToggle={jest.fn()} />,
    );
    expect(getByText('MARK WHAT YOU NOTICED — OPTIONAL')).toBeTruthy();

    const { toJSON } = render(<ObservationChips chips={[]} selected={[]} onToggle={jest.fn()} />);
    expect(toJSON()).toBeNull();
  });
});
