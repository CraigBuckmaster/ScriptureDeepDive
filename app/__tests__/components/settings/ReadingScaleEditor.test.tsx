/**
 * Tests for ReadingScaleEditor — the Settings font-size editor.
 *
 * Covers: preview renders, segment selection calls setReadingScale,
 * Reset returns to 1.0×, and the OS-large note appears when PixelRatio
 * reports a getFontScale() > 1.5.
 */

import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { PixelRatio } from 'react-native';
import { ReadingScaleEditor } from '@/components/settings/ReadingScaleEditor';
import { useSettingsStore } from '@/stores/settingsStore';

jest.mock('@/db/user', () => ({
  getPreference: jest.fn().mockResolvedValue(null),
  setPreference: jest.fn().mockResolvedValue(undefined),
  deletePreference: jest.fn().mockResolvedValue(undefined),
}));

describe('ReadingScaleEditor', () => {
  beforeEach(() => {
    jest.spyOn(PixelRatio, 'getFontScale').mockReturnValue(1.0);
    useSettingsStore.setState({ readingScale: 1.0 });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders the preview copy (section header + verse + commentary + chrome sample)', () => {
    const { getByText } = render(<ReadingScaleEditor />);
    expect(getByText('In the Beginning')).toBeTruthy();
    expect(
      getByText('In the beginning, God created the heavens and the earth.'),
    ).toBeTruthy();
    expect(getByText(/Calvin:/)).toBeTruthy();
    expect(getByText(/Chrome stays the same/)).toBeTruthy();
  });

  it('shows the current reading-size readout', () => {
    useSettingsStore.setState({ readingScale: 1.2 });
    const { getByText } = render(<ReadingScaleEditor />);
    expect(getByText(/Reading size: 1\.2×/)).toBeTruthy();
  });

  it('calls setReadingScale when a segment is pressed', () => {
    const { getByLabelText } = render(<ReadingScaleEditor />);
    fireEvent.press(getByLabelText('Reading size 1.35×'));
    expect(useSettingsStore.getState().readingScale).toBeCloseTo(1.35, 5);
  });

  it('shows Reset button only when not at 1.0× and returns to 1.0 when pressed', () => {
    useSettingsStore.setState({ readingScale: 1.35 });
    const { getByText, queryByText, rerender } = render(<ReadingScaleEditor />);

    fireEvent.press(getByText('Reset'));
    expect(useSettingsStore.getState().readingScale).toBe(1.0);

    rerender(<ReadingScaleEditor />);
    expect(queryByText('Reset')).toBeNull();
  });

  it('shows the OS-large note when PixelRatio.getFontScale() > 1.5', () => {
    jest.spyOn(PixelRatio, 'getFontScale').mockReturnValue(1.75);
    const { getByText } = render(<ReadingScaleEditor />);
    expect(
      getByText(/device is set to a large text size/i),
    ).toBeTruthy();
  });

  it('does not show the OS-large note when scale is within normal range', () => {
    jest.spyOn(PixelRatio, 'getFontScale').mockReturnValue(1.3);
    const { queryByText } = render(<ReadingScaleEditor />);
    expect(queryByText(/device is set to a large text size/i)).toBeNull();
  });

  it('surfaces the effective content scale in the secondary readout', () => {
    jest.spyOn(PixelRatio, 'getFontScale').mockReturnValue(1.5);
    useSettingsStore.setState({ readingScale: 1.5 });
    const { getByText } = render(<ReadingScaleEditor />);
    // 1.5 × 1.5 = 2.25 → capped at 2.2×
    expect(getByText(/Effective: 2\.2× \(content\)/)).toBeTruthy();
    // Device readout should show the OS scale
    expect(getByText(/Device text size: 1\.5×/)).toBeTruthy();
  });
});
