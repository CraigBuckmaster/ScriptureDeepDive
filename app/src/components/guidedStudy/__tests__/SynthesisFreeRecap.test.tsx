import React from 'react';
import { fireEvent, waitFor } from '@testing-library/react-native';
import * as Clipboard from 'expo-clipboard';
import { renderWithProviders } from '../../../../__tests__/helpers/renderWithProviders';
import { SynthesisFreeRecap } from '../SynthesisFreeRecap';
import type { SynthesisOutputBlock } from '../../../services/guidedStudy/synthesis/strategy';

const setStringAsync = Clipboard.setStringAsync as jest.Mock;

beforeEach(() => {
  setStringAsync.mockReset();
});

const sampleBlocks: SynthesisOutputBlock[] = [
  { type: 'recap_section', label: 'Takeaway', content: 'Creation is ordered by speech.' },
  { type: 'recap_section', label: 'Verse to remember', content: 'In the beginning, God.' },
  { type: 'cta_button', label: 'Copy to clipboard', action: 'copy' },
  { type: 'cta_button', label: 'Share', action: 'share' },
  {
    type: 'footer_note',
    text: 'Companion+ saves this for spaced review and brings it back when it matters.',
  },
];

describe('SynthesisFreeRecap (block-driven)', () => {
  it('renders null when blocks is empty', () => {
    const { toJSON } = renderWithProviders(
      <SynthesisFreeRecap title="Your Quick Pass" chapterTitle="Genesis 1" blocks={[]} />,
    );
    expect(toJSON()).toBeNull();
  });

  it('renders title and recap_section blocks with uppercase labels', () => {
    const { getByText } = renderWithProviders(
      <SynthesisFreeRecap
        title="Your Quick Pass"
        chapterTitle="Genesis 1"
        blocks={sampleBlocks}
      />,
    );
    expect(getByText('Your Quick Pass')).toBeTruthy();
    expect(getByText('TAKEAWAY')).toBeTruthy();
    expect(getByText('Creation is ordered by speech.')).toBeTruthy();
    expect(getByText('VERSE TO REMEMBER')).toBeTruthy();
  });

  it('Copy CTA writes the plain-text recap to the clipboard', async () => {
    const { getByLabelText } = renderWithProviders(
      <SynthesisFreeRecap
        title="Your Quick Pass"
        chapterTitle="Genesis 1"
        blocks={sampleBlocks}
      />,
    );
    fireEvent.press(getByLabelText('Copy recap to clipboard'));
    await waitFor(() => expect(setStringAsync).toHaveBeenCalledTimes(1));
    const arg = setStringAsync.mock.calls[0][0] as string;
    expect(arg).toContain('Genesis 1 — Your Quick Pass');
    expect(arg).toContain('Takeaway:');
    expect(arg).toContain('Creation is ordered by speech.');
  });

  it('renders the footer_note text and fires onUpgradeNudgePress on tap', () => {
    const onUpgradeNudgePress = jest.fn();
    const { getByLabelText, getByText } = renderWithProviders(
      <SynthesisFreeRecap
        title="Your Quick Pass"
        chapterTitle="Genesis 1"
        blocks={sampleBlocks}
        onUpgradeNudgePress={onUpgradeNudgePress}
      />,
    );
    expect(
      getByText('Companion+ saves this for spaced review and brings it back when it matters.'),
    ).toBeTruthy();
    fireEvent.press(getByLabelText('Learn about Companion Study Partner'));
    expect(onUpgradeNudgePress).toHaveBeenCalledTimes(1);
  });

  it('renders each cta_button block with its label', () => {
    const { getByLabelText } = renderWithProviders(
      <SynthesisFreeRecap
        title="Your Quick Pass"
        chapterTitle="Genesis 1"
        blocks={sampleBlocks}
      />,
    );
    expect(getByLabelText('Copy recap to clipboard')).toBeTruthy();
    expect(getByLabelText('Share recap')).toBeTruthy();
  });
});
