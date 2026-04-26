import React from 'react';
import { fireEvent, waitFor } from '@testing-library/react-native';
import * as Clipboard from 'expo-clipboard';
import { renderWithProviders } from '../../../../__tests__/helpers/renderWithProviders';
import { SynthesisFreeRecap } from '../SynthesisFreeRecap';
import type { CapturedInputs } from '../../../services/guidedStudy/capturedInputs';

const setStringAsync = Clipboard.setStringAsync as jest.Mock;

beforeEach(() => {
  setStringAsync.mockReset();
});

describe('SynthesisFreeRecap', () => {
  it('renders null when nothing has been captured', () => {
    const { toJSON } = renderWithProviders(
      <SynthesisFreeRecap
        mode="quick"
        chapterTitle="Genesis 1"
        capturedInputs={{}}
      />,
    );
    expect(toJSON()).toBeNull();
  });

  it('quick mode shows takeaway + verse-to-remember sections', () => {
    const captured: CapturedInputs = {
      synthesize: {
        takeaway: 'Creation is ordered by speech.',
        key_connection: 'In the beginning, God.',
        open_question: '',
      },
    };
    const { getByText } = renderWithProviders(
      <SynthesisFreeRecap mode="quick" chapterTitle="Genesis 1" capturedInputs={captured} />,
    );
    expect(getByText('Your Quick Pass')).toBeTruthy();
    expect(getByText('TAKEAWAY')).toBeTruthy();
    expect(getByText('Creation is ordered by speech.')).toBeTruthy();
    expect(getByText('VERSE TO REMEMBER')).toBeTruthy();
    expect(getByText('In the beginning, God.')).toBeTruthy();
  });

  it('hides empty sections — partial sessions only show populated fields', () => {
    const captured: CapturedInputs = {
      synthesize: { takeaway: 'Creation is ordered.', open_question: '', key_connection: '' },
    };
    const { getByText, queryByText } = renderWithProviders(
      <SynthesisFreeRecap mode="quick" chapterTitle="Genesis 1" capturedInputs={captured} />,
    );
    expect(getByText('TAKEAWAY')).toBeTruthy();
    expect(queryByText('VERSE TO REMEMBER')).toBeNull();
  });

  it('teaching mode renders six labeled outline sections', () => {
    const captured: CapturedInputs = {
      scene: { audience: 'College small group', setting: 'small group' },
      observe: { main_point: 'Order from chaos.', clarification: 'Not a science manual.' },
      synthesize: {
        takeaway: 'Hook → main point → moves → application.',
        open_question: 'How does this frame John 1?',
        key_connection: '',
      },
    };
    const { getByText } = renderWithProviders(
      <SynthesisFreeRecap
        mode="teaching"
        chapterTitle="Genesis 1"
        capturedInputs={captured}
      />,
    );
    expect(getByText('Your Teaching Outline')).toBeTruthy();
    for (const label of [
      'AUDIENCE',
      'SETTING',
      'MAIN POINT',
      'CLARIFICATION',
      'OUTLINE',
      'DISCUSSION QUESTION',
    ]) {
      expect(getByText(label)).toBeTruthy();
    }
  });

  it('devotional mode title and prayer label appear', () => {
    const captured: CapturedInputs = {
      synthesize: {
        takeaway: 'Lord, you walk with me.',
        open_question: '',
        key_connection: '',
      },
    };
    const { getByText } = renderWithProviders(
      <SynthesisFreeRecap
        mode="devotional"
        chapterTitle="Psalm 23"
        capturedInputs={captured}
      />,
    );
    expect(getByText('Your Devotional')).toBeTruthy();
    expect(getByText('YOUR PRAYER')).toBeTruthy();
  });

  it('Copy button writes the plain-text recap to the clipboard', async () => {
    const captured: CapturedInputs = {
      synthesize: { takeaway: 'A.', key_connection: 'B.', open_question: '' },
    };
    const { getByLabelText } = renderWithProviders(
      <SynthesisFreeRecap
        mode="quick"
        chapterTitle="Genesis 1"
        capturedInputs={captured}
      />,
    );
    fireEvent.press(getByLabelText('Copy recap to clipboard'));
    await waitFor(() => expect(setStringAsync).toHaveBeenCalledTimes(1));
    const arg = setStringAsync.mock.calls[0][0] as string;
    expect(arg).toContain('Genesis 1 — Your Quick Pass');
    expect(arg).toContain('Takeaway:');
    expect(arg).toContain('A.');
    expect(arg).toContain('Verse to remember:');
    expect(arg).toContain('B.');
  });

  it('renders the flag-off footer copy when GUIDED_STUDY_AMICUS_SYNTHESIS=false', () => {
    const captured: CapturedInputs = {
      synthesize: { takeaway: 'A.', open_question: '', key_connection: '' },
    };
    const { getByText } = renderWithProviders(
      <SynthesisFreeRecap
        mode="quick"
        chapterTitle="Genesis 1"
        capturedInputs={captured}
      />,
    );
    expect(
      getByText('Companion+ saves this for spaced review and brings it back when it matters.'),
    ).toBeTruthy();
  });

  it('fires onUpgradeNudgePress when the footer is tapped', () => {
    const onUpgradeNudgePress = jest.fn();
    const captured: CapturedInputs = {
      synthesize: { takeaway: 'A.', open_question: '', key_connection: '' },
    };
    const { getByLabelText } = renderWithProviders(
      <SynthesisFreeRecap
        mode="quick"
        chapterTitle="Genesis 1"
        capturedInputs={captured}
        onUpgradeNudgePress={onUpgradeNudgePress}
      />,
    );
    fireEvent.press(getByLabelText('Learn about Companion Study Partner'));
    expect(onUpgradeNudgePress).toHaveBeenCalledTimes(1);
  });
});
