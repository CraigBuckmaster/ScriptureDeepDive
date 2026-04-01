/**
 * Tests for TTSControls layout and functionality.
 *
 * Issues fixed:
 * - Replaced emoji icons with lucide-react-native icons
 * - Speed pills overlapping play button (moved to separate row)
 * - Speed pills offset left (centered with absolute-positioned X)
 * - Stop button replaced with X close button at bottom-right
 */

import React from 'react';
import { renderWithProviders } from '../helpers/renderWithProviders';
import { TTSControls } from '@/components/TTSControls';

const defaultProps = {
  isPlaying: false,
  currentVerse: 0,
  totalVerses: 10,
  speed: 1.0,
  onPlay: jest.fn(),
  onPause: jest.fn(),
  onStop: jest.fn(),
  onSkipNext: jest.fn(),
  onSkipPrev: jest.fn(),
  onSetSpeed: jest.fn(),
};

describe('TTSControls', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders without crash', () => {
    expect(() => {
      renderWithProviders(<TTSControls {...defaultProps} />);
    }).not.toThrow();
  });

  it('displays verse counter', () => {
    const { getByText } = renderWithProviders(
      <TTSControls {...defaultProps} currentVerse={3} totalVerses={25} />
    );
    expect(getByText('4/25')).toBeTruthy();
  });

  it('renders speed pills', () => {
    const { getByText } = renderWithProviders(<TTSControls {...defaultProps} />);
    expect(getByText('0.5x')).toBeTruthy();
    expect(getByText('1x')).toBeTruthy();
    expect(getByText('1.5x')).toBeTruthy();
  });

  it('renders close button with accessibility label', () => {
    const { getByLabelText } = renderWithProviders(<TTSControls {...defaultProps} />);
    expect(getByLabelText('Close TTS')).toBeTruthy();
  });

  it('calls onStop when close button pressed', () => {
    const { getByLabelText } = renderWithProviders(<TTSControls {...defaultProps} />);
    const { fireEvent } = require('@testing-library/react-native');
    fireEvent.press(getByLabelText('Close TTS'));
    expect(defaultProps.onStop).toHaveBeenCalledTimes(1);
  });

  it('calls onSetSpeed when speed pill pressed', () => {
    const { getByText } = renderWithProviders(<TTSControls {...defaultProps} />);
    const { fireEvent } = require('@testing-library/react-native');
    fireEvent.press(getByText('1.5x'));
    expect(defaultProps.onSetSpeed).toHaveBeenCalledWith(1.5);
  });
});
