import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { renderWithProviders } from '../helpers/renderWithProviders';
import { CovenantMarker } from '@/components/tree/CovenantMarker';

const WAYPOINT = {
  personId: 'abraham',
  text: '"In you all nations will be blessed"',
  ref: 'Gen 12:3',
};

describe('CovenantMarker', () => {
  it('renders the annotation text and verse ref', () => {
    const { getByText } = renderWithProviders(
      <CovenantMarker waypoint={WAYPOINT} x={0} y={0} />,
    );
    expect(getByText(/"In you all nations will be blessed"/)).toBeTruthy();
    expect(getByText('Gen 12:3')).toBeTruthy();
  });

  it('calls onPress with the waypoint ref', () => {
    const onPress = jest.fn();
    const { getByLabelText } = renderWithProviders(
      <CovenantMarker waypoint={WAYPOINT} x={0} y={0} onPress={onPress} />,
    );
    fireEvent.press(getByLabelText('Open Gen 12:3'));
    expect(onPress).toHaveBeenCalledWith('Gen 12:3');
  });

  it('renders nothing when zoomLevel is below the minimum', () => {
    const { toJSON } = renderWithProviders(
      <CovenantMarker waypoint={WAYPOINT} x={0} y={0} zoomLevel={0.3} minZoom={0.4} />,
    );
    expect(toJSON()).toBeNull();
  });

  it('still renders when zoomLevel is above minZoom', () => {
    const { toJSON } = renderWithProviders(
      <CovenantMarker waypoint={WAYPOINT} x={0} y={0} zoomLevel={0.5} minZoom={0.4} />,
    );
    expect(toJSON()).not.toBeNull();
  });

  it('always renders when zoomLevel is unspecified', () => {
    const { toJSON } = renderWithProviders(
      <CovenantMarker waypoint={WAYPOINT} x={0} y={0} />,
    );
    expect(toJSON()).not.toBeNull();
  });
});
