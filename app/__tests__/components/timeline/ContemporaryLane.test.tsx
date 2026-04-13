import React from 'react';
import { renderWithProviders } from '../../helpers/renderWithProviders';
import { ContemporaryLane, MAX_LANES } from '@/components/timeline/ContemporaryLane';

describe('ContemporaryLane', () => {
  it('renders exactly MAX_LANES lanes at most', () => {
    const { UNSAFE_getAllByType } = renderWithProviders(
      <ContemporaryLane laneActive={[true, true, true, true, true, true]} />,
    );
    const { View } = require('react-native');
    const views = UNSAFE_getAllByType(View);
    // wrapper + MAX_LANES children
    expect(views.length).toBe(1 + MAX_LANES);
  });

  it('paints active lanes with a visible fill', () => {
    const { UNSAFE_getAllByType } = renderWithProviders(
      <ContemporaryLane laneActive={[true, false, true, false]} />,
    );
    const { View } = require('react-native');
    const views = UNSAFE_getAllByType(View);
    const bgs = views.slice(1).map((v: any) => {
      const s = Array.isArray(v.props.style) ? v.props.style : [v.props.style];
      return Object.assign({}, ...s).backgroundColor;
    });
    expect(bgs[0]).not.toBe('transparent');
    expect(bgs[1]).toBe('transparent');
    expect(bgs[2]).not.toBe('transparent');
    expect(bgs[3]).toBe('transparent');
  });

  it('clamps input to MAX_LANES', () => {
    const { UNSAFE_getAllByType } = renderWithProviders(
      <ContemporaryLane laneActive={new Array(10).fill(true)} />,
    );
    const { View } = require('react-native');
    const views = UNSAFE_getAllByType(View);
    expect(views.length).toBe(1 + MAX_LANES);
  });
});
