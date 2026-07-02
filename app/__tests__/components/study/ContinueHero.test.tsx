/**
 * #1832 — Continue hero (components/study/ContinueHero).
 */
import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import type { StudyPlan, StudyPlanItem } from '@/types';

const mockUseReducedMotion = jest.fn().mockReturnValue(false);
jest.mock('@/hooks/useReducedMotion', () => ({
  useReducedMotion: () => mockUseReducedMotion(),
}));

import { ContinueHero } from '@/components/study/ContinueHero';

const PLAN: StudyPlan = {
  id: 'plan-1',
  plan_type: 'book',
  source_id: 'jonah',
  title: 'Jonah',
  default_mode: 'quick',
  created_at: '2026-06-01 00:00:00',
  archived_at: null,
};

function item(num: number, completed: boolean): StudyPlanItem {
  return {
    plan_id: 'plan-1',
    item_num: num,
    kind: 'session',
    ref_json: JSON.stringify({ bookId: 'jonah', chapterNum: num }),
    session_id: null,
    completed_at: completed ? '2026-06-02 08:00:00' : null,
  };
}

const ITEMS = [item(1, true), item(2, false), item(3, false)];

beforeEach(() => {
  jest.clearAllMocks();
  mockUseReducedMotion.mockReturnValue(false);
});

describe('ContinueHero (#1832)', () => {
  it('renders the plan title, chapter ref, paused step, and minutes', () => {
    const { getByText } = render(
      <ContinueHero
        plan={PLAN}
        items={ITEMS}
        target={{ bookId: 'jonah', chapterNum: 2, step: 'explore' }}
        estimateMin={12}
        onResume={jest.fn()}
      />,
    );
    expect(getByText('Jonah')).toBeTruthy();
    expect(getByText('Jonah 2 · Paused at Explore · ~12 min')).toBeTruthy();
  });

  it('omits step and minutes gracefully when absent', () => {
    const { getByText } = render(
      <ContinueHero
        plan={PLAN}
        items={ITEMS}
        target={{ bookId: 'jonah', chapterNum: 2 }}
        estimateMin={null}
        onResume={jest.fn()}
      />,
    );
    expect(getByText('Jonah 2')).toBeTruthy();
  });

  it('fires onResume from an accessible 44pt button', () => {
    const onResume = jest.fn();
    const { getByLabelText } = render(
      <ContinueHero
        plan={PLAN}
        items={ITEMS}
        target={{ bookId: 'jonah', chapterNum: 2, step: 'explore' }}
        estimateMin={12}
        onResume={onResume}
      />,
    );
    const button = getByLabelText('Resume Jonah at Jonah 2');
    fireEvent.press(button);
    expect(onResume).toHaveBeenCalledTimes(1);
    const flat = Array.isArray(button.props.style) ? Object.assign({}, ...button.props.style.flat()) : button.props.style;
    expect(flat.minHeight).toBeGreaterThanOrEqual(44);
  });

  it('renders statically under reduced motion (still one tick per item)', () => {
    mockUseReducedMotion.mockReturnValue(true);
    const { getByText } = render(
      <ContinueHero
        plan={PLAN}
        items={ITEMS}
        target={{ bookId: 'jonah', chapterNum: 2 }}
        estimateMin={null}
        onResume={jest.fn()}
      />,
    );
    // Smoke: renders without starting the glow loop.
    expect(getByText('Jonah')).toBeTruthy();
  });
});
