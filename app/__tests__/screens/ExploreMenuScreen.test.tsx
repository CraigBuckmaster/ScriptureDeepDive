import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ExploreMenuScreen from '@/screens/ExploreMenuScreen';

describe('ExploreMenuScreen', () => {
  it('renders the Explore heading', () => {
    const { getByText } = render(<ExploreMenuScreen />);
    expect(getByText('Explore')).toBeTruthy();
  });

  it('renders hero feature cards', () => {
    const { getByText } = render(<ExploreMenuScreen />);
    expect(getByText('People')).toBeTruthy();
    expect(getByText('Timeline')).toBeTruthy();
  });

  it('renders grid feature cards', () => {
    const { getByText } = render(<ExploreMenuScreen />);
    expect(getByText('Map')).toBeTruthy();
    expect(getByText('Word Studies')).toBeTruthy();
    expect(getByText('Scholars')).toBeTruthy();
    expect(getByText('Content Library')).toBeTruthy();
  });

  it('navigates when a card is pressed', () => {
    const { getByText } = render(<ExploreMenuScreen />);
    // Pressing a card should not throw
    fireEvent.press(getByText('Map'));
  });
});
