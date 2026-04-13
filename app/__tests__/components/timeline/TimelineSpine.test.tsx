import React from 'react';
import { renderWithProviders } from '../../helpers/renderWithProviders';
import { TimelineSpine, SPINE_GUTTER_WIDTH } from '@/components/timeline/TimelineSpine';

describe('TimelineSpine', () => {
  it('renders without crashing', () => {
    const { toJSON } = renderWithProviders(
      <TimelineSpine eraColor="#8a6e3a" hasImage={false} />,
    );
    expect(toJSON()).toBeTruthy();
  });

  it('has a stable gutter width constant', () => {
    expect(SPINE_GUTTER_WIDTH).toBe(32);
  });

  it('uses a larger, glowing dot when hasImage is true', () => {
    const { UNSAFE_getAllByType } = renderWithProviders(
      <TimelineSpine eraColor="#8a6e3a" hasImage />,
    );
    const { View } = require('react-native');
    const views = UNSAFE_getAllByType(View);
    // The third view is the dot (gutter → top-half → dot → bottom-half)
    const dot = views[2];
    const styleArr = Array.isArray(dot.props.style) ? dot.props.style : [dot.props.style];
    const merged = Object.assign({}, ...styleArr);
    expect(merged.width).toBe(10);
    expect(merged.shadowOpacity).toBeGreaterThan(0);
  });

  it('uses a smaller, dim dot when hasImage is false', () => {
    const { UNSAFE_getAllByType } = renderWithProviders(
      <TimelineSpine eraColor="#8a6e3a" hasImage={false} />,
    );
    const { View } = require('react-native');
    const views = UNSAFE_getAllByType(View);
    const dot = views[2];
    const styleArr = Array.isArray(dot.props.style) ? dot.props.style : [dot.props.style];
    const merged = Object.assign({}, ...styleArr);
    expect(merged.width).toBe(7);
    expect(merged.opacity).toBe(0.5);
  });

  it('hides the top line for the first row', () => {
    const { UNSAFE_getAllByType } = renderWithProviders(
      <TimelineSpine eraColor="#8a6e3a" hasImage={false} isFirst />,
    );
    const { View } = require('react-native');
    const views = UNSAFE_getAllByType(View);
    const topHalf = views[1];
    const styleArr = Array.isArray(topHalf.props.style)
      ? topHalf.props.style
      : [topHalf.props.style];
    const merged = Object.assign({}, ...styleArr);
    expect(merged.backgroundColor).toBe('transparent');
  });

  it('hides the bottom line for the last row', () => {
    const { UNSAFE_getAllByType } = renderWithProviders(
      <TimelineSpine eraColor="#8a6e3a" hasImage={false} isLast />,
    );
    const { View } = require('react-native');
    const views = UNSAFE_getAllByType(View);
    const bottomHalf = views[3];
    const styleArr = Array.isArray(bottomHalf.props.style)
      ? bottomHalf.props.style
      : [bottomHalf.props.style];
    const merged = Object.assign({}, ...styleArr);
    expect(merged.backgroundColor).toBe('transparent');
  });
});
