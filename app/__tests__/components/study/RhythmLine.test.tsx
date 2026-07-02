/**
 * #1832 — rhythm sentence (components/study/RhythmLine).
 * No streaks, no emojis — one italic sentence derived from weekly data.
 */
import React from 'react';
import { render } from '@testing-library/react-native';
import { buildRhythmSentence, RhythmLine } from '@/components/study/RhythmLine';
import type { WeeklyRhythm } from '@/services/study';

function week(weekKey: string, sessions: number, reviews: number): WeeklyRhythm {
  return { week: weekKey, weekStart: '2026-06-29', sessions, reviews };
}

describe('buildRhythmSentence', () => {
  it('summarizes sessions and reviews with number words', () => {
    expect(buildRhythmSentence([week('2026-W27', 2, 1)])).toBe(
      'Two sessions and one review this week — a steady rhythm of study.',
    );
    expect(buildRhythmSentence([week('2026-W27', 1, 0)])).toBe(
      'One session this week — a steady rhythm of study.',
    );
    expect(buildRhythmSentence([week('2026-W27', 0, 3)])).toBe(
      'Three reviews this week — a steady rhythm of study.',
    );
  });

  it('offers a gentle line for a quiet week (no counters, no emojis)', () => {
    const active = buildRhythmSentence([week('2026-W26', 2, 0), week('2026-W27', 0, 0)]);
    expect(active).toBe('A quiet week so far — the text will keep until you return.');

    const idle = buildRhythmSentence([week('2026-W26', 0, 0), week('2026-W27', 0, 0)]);
    expect(idle).toBe('A quiet stretch — one unhurried session would begin a rhythm.');

    expect(buildRhythmSentence([])).toBe(
      'A quiet stretch — one unhurried session would begin a rhythm.',
    );
  });

  it('never emits digits for small counts or emoji', () => {
    const sentence = buildRhythmSentence([week('2026-W27', 4, 2)]);
    expect(sentence).not.toMatch(/\d/);
    expect(sentence).not.toMatch(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u);
  });
});

describe('RhythmLine', () => {
  it('renders the sentence', () => {
    const { getByText } = render(<RhythmLine rhythm={[week('2026-W27', 1, 1)]} />);
    expect(getByText('One session and one review this week — a steady rhythm of study.')).toBeTruthy();
  });
});
