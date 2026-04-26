import {
  buildCarryForwardItems,
  getCapturedText,
  getPromptBinding,
  setCapturedText,
  stepsWithCarryForward,
} from '../stepBindings';
import type { CapturedInputs } from '../capturedInputs';

describe('getPromptBinding', () => {
  it.each([
    ['quick-scene-genre', 'scene', 'genre_response'],
    ['quick-observe-takeaway', 'observe', 'primary'],
    ['quick-synthesize-summary', 'synthesize', 'takeaway'],
    ['deep-observe-surprise', 'observe', 'surprises'],
    ['deep-observe-confusion', 'observe', 'confusions'],
    ['deep-observe-repetition', 'observe', 'repetitions'],
    ['teaching-observe-main-point', 'observe', 'main_point'],
    ['teaching-observe-misread', 'observe', 'clarification'],
    ['devotional-synthesize-prayer', 'synthesize', 'takeaway'],
  ])('binds prompt %s to (%s, %s)', (promptKey, expectedStep, expectedKey) => {
    const ref = getPromptBinding(promptKey);
    expect(ref?.step).toBe(expectedStep);
    expect(ref?.key).toBe(expectedKey);
  });

  it('returns undefined for prompts without a binding (e.g. explore-step prompts)', () => {
    expect(getPromptBinding('quick-explore-priority')).toBeUndefined();
    expect(getPromptBinding('deep-explore-evidence')).toBeUndefined();
    expect(getPromptBinding('quick-review-carry')).toBeUndefined();
    expect(getPromptBinding('not-a-real-key')).toBeUndefined();
  });
});

describe('getCapturedText / setCapturedText round-trip', () => {
  it('writes a value and reads it back at the same ref', () => {
    let captured: CapturedInputs = {};
    const ref = { step: 'observe', key: 'surprises' } as const;
    captured = setCapturedText(captured, ref, 'God evaluates the work as good.');
    expect(getCapturedText(captured, ref)).toBe('God evaluates the work as good.');
  });

  it('returns empty string for an unwritten ref', () => {
    expect(
      getCapturedText({}, { step: 'synthesize', key: 'takeaway' }),
    ).toBe('');
  });

  it('does not clobber other fields on the same step bucket', () => {
    let captured: CapturedInputs = {
      observe: { surprises: 'initial', main_point: 'hold' },
    };
    captured = setCapturedText(captured, { step: 'observe', key: 'surprises' }, 'updated');
    expect(captured.observe?.surprises).toBe('updated');
    expect(captured.observe?.main_point).toBe('hold');
  });
});

describe('buildCarryForwardItems', () => {
  it('renders empty list for the scene step (first step, nothing to carry)', () => {
    expect(buildCarryForwardItems('quick', 'scene', {})).toEqual([]);
  });

  it('quick observe surfaces the scene genre_response', () => {
    const captured: CapturedInputs = { scene: { genre_response: 'A creation poem.' } };
    const items = buildCarryForwardItems('quick', 'observe', captured);
    expect(items).toEqual([
      {
        sourceStep: 'scene',
        label: "What's happening in this chapter",
        content: 'A creation poem.',
      },
    ]);
  });

  it('teaching synthesize surfaces both audience and main_point when both are filled', () => {
    const captured: CapturedInputs = {
      scene: { audience: 'College small group' },
      observe: { main_point: 'Order from chaos by speech.' },
    };
    const items = buildCarryForwardItems('teaching', 'synthesize', captured);
    expect(items.map((i) => i.label)).toEqual(['Your audience', 'Your main point']);
    expect(items.map((i) => i.content)).toEqual([
      'College small group',
      'Order from chaos by speech.',
    ]);
  });

  it('teaching synthesize skips empty sources (banner stays silent)', () => {
    const captured: CapturedInputs = {
      scene: { audience: 'College small group' },
      // observe.main_point unfilled
    };
    const items = buildCarryForwardItems('teaching', 'synthesize', captured);
    expect(items).toEqual([
      {
        sourceStep: 'scene',
        label: 'Your audience',
        content: 'College small group',
      },
    ]);
  });

  it('devotional review surfaces the synthesize prayer (takeaway)', () => {
    const captured: CapturedInputs = {
      synthesize: { takeaway: 'Lord, you walk with me.', open_question: '', key_connection: '' },
    };
    const items = buildCarryForwardItems('devotional', 'review', captured);
    expect(items).toEqual([
      {
        sourceStep: 'synthesize',
        label: 'Your prayer',
        content: 'Lord, you walk with me.',
      },
    ]);
  });

  it('returns empty list when the source field is whitespace-only', () => {
    const captured: CapturedInputs = { scene: { genre_response: '   ' } };
    expect(buildCarryForwardItems('quick', 'observe', captured)).toEqual([]);
  });
});

describe('stepsWithCarryForward', () => {
  it('returns an empty set when nothing is captured', () => {
    expect(stepsWithCarryForward('deep', {}).size).toBe(0);
  });

  it('marks every later step that has carry-forward content available', () => {
    const captured: CapturedInputs = {
      scene: { audience: 'small group' },
      observe: { main_point: 'point' },
      synthesize: { takeaway: 'outline', open_question: '', key_connection: '' },
    };
    const set = stepsWithCarryForward('teaching', captured);
    expect([...set].sort()).toEqual(['explore', 'observe', 'review', 'synthesize']);
  });
});
