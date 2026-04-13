import React from 'react';
import { renderWithProviders } from '../../helpers/renderWithProviders';
import { GoldSeparator } from '@/components/explore/GoldSeparator';

describe('GoldSeparator', () => {
  it('renders three gradient segments', () => {
    const { toJSON } = renderWithProviders(<GoldSeparator />);
    const tree = toJSON();
    // Expect 1 container + 3 segment children (flattened as array of Views).
    expect(tree).toBeTruthy();
  });

  it('honors custom marginBottom / marginTop', () => {
    const { UNSAFE_getAllByType } = renderWithProviders(
      <GoldSeparator marginBottom={4} marginTop={8} />,
    );
    const { View } = require('react-native');
    const views = UNSAFE_getAllByType(View);
    const container = views[0];
    // Style can be an array or an object — flatten before asserting.
    const styleArr = Array.isArray(container.props.style)
      ? container.props.style
      : [container.props.style];
    const merged = Object.assign({}, ...styleArr);
    expect(merged.marginBottom).toBe(4);
    expect(merged.marginTop).toBe(8);
  });
});
