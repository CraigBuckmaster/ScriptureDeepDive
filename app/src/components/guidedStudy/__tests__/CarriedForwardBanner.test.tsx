import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { renderWithProviders } from '../../../../__tests__/helpers/renderWithProviders';
import {
  CarriedForwardBanner,
  type CarriedForwardItem,
} from '../CarriedForwardBanner';

const sceneItem: CarriedForwardItem = {
  sourceStep: 'scene',
  label: 'What you brought today',
  content:
    "Anxious about a hard week and looking for steadiness — came in tired but wanting to listen.",
};

const observeItem: CarriedForwardItem = {
  sourceStep: 'observe',
  label: 'What met you',
  content: 'The valley language — God is with me, not above me.',
};

describe('CarriedForwardBanner', () => {
  it('renders null when items is empty', () => {
    const { toJSON } = renderWithProviders(<CarriedForwardBanner items={[]} />);
    expect(toJSON()).toBeNull();
  });

  it('renders the CARRIED FORWARD header and the item label and content', () => {
    const { getByText } = renderWithProviders(
      <CarriedForwardBanner items={[observeItem]} />,
    );
    expect(getByText('CARRIED FORWARD')).toBeTruthy();
    expect(getByText('WHAT MET YOU')).toBeTruthy();
    expect(getByText(observeItem.content)).toBeTruthy();
  });

  it('truncates long content with an ellipsis when collapsed', () => {
    const { getByText, queryByText } = renderWithProviders(
      <CarriedForwardBanner items={[sceneItem]} />,
    );
    // Full content is hidden when collapsed
    expect(queryByText(sceneItem.content)).toBeNull();
    // Some preview ending in ellipsis is shown
    expect(getByText(/…$/)).toBeTruthy();
  });

  it('expands to full content when tapped', () => {
    const { getByLabelText, getByText, queryByText } = renderWithProviders(
      <CarriedForwardBanner items={[sceneItem]} />,
    );
    expect(queryByText(sceneItem.content)).toBeNull();
    fireEvent.press(getByLabelText(/Carried forward from earlier steps, collapsed/));
    expect(getByText(sceneItem.content)).toBeTruthy();
  });

  it('renders multiple items in the order given', () => {
    const { getAllByText } = renderWithProviders(
      <CarriedForwardBanner items={[sceneItem, observeItem]} defaultCollapsed={false} />,
    );
    const labels = getAllByText(/WHAT (?:YOU BROUGHT TODAY|MET YOU)/);
    expect(labels[0].props.children).toBe('WHAT YOU BROUGHT TODAY');
    expect(labels[1].props.children).toBe('WHAT MET YOU');
  });

  it('reports its expanded state via accessibilityState (button role)', () => {
    const collapsed = renderWithProviders(<CarriedForwardBanner items={[observeItem]} />);
    expect(collapsed.getByRole('button').props.accessibilityState.expanded).toBe(false);

    const expanded = renderWithProviders(
      <CarriedForwardBanner items={[observeItem]} defaultCollapsed={false} />,
    );
    expect(expanded.getByRole('button').props.accessibilityState.expanded).toBe(true);
  });

  it('honors defaultCollapsed=false (renders full content immediately)', () => {
    const { getByText } = renderWithProviders(
      <CarriedForwardBanner items={[sceneItem]} defaultCollapsed={false} />,
    );
    expect(getByText(sceneItem.content)).toBeTruthy();
  });
});
