import {
  emptyCapturedInputs,
  safeParseCapturedInputs,
  serializeCapturedInputs,
  type CapturedInputs,
} from '../capturedInputs';
import { logger } from '@/utils/logger';

jest.mock('@/utils/logger', () => ({
  logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
}));

const warnMock = logger.warn as jest.Mock;

beforeEach(() => {
  warnMock.mockClear();
});

describe('emptyCapturedInputs', () => {
  it('returns a fresh empty object each call', () => {
    const a = emptyCapturedInputs();
    const b = emptyCapturedInputs();
    expect(a).toEqual({});
    expect(a).not.toBe(b);
  });
});

describe('serializeCapturedInputs / safeParseCapturedInputs round-trip', () => {
  it('empty object round-trips to empty', () => {
    const empty = emptyCapturedInputs();
    expect(safeParseCapturedInputs(serializeCapturedInputs(empty))).toEqual(empty);
  });

  it('fully populated CapturedInputs survives round-trip', () => {
    const populated: CapturedInputs = {
      scene: {
        genre_response: 'Theological narrative; creation arc.',
        audience: 'College small group',
        setting: 'small group',
        arrival: 'Anxious about a hard week.',
        concepts: ['creation', 'covenant'],
      },
      observe: {
        primary: 'Light from speech.',
        surprises: 'God evaluates the work as good.',
        confusions: 'What is the firmament exactly?',
        repetitions: '"And God said" / "and it was so".',
        main_point: 'Order from chaos by speech.',
        clarification: "It isn't a science manual.",
        questions: ['What is the role of the Spirit here?'],
      },
      explore: {
        panels_opened: [
          { panel_type: 'hist', section_num: 1, opened_at_ms: 1735000000000 },
          { panel_type: 'cross', opened_at_ms: 1735000005000 },
        ],
        most_helpful_panel_type: 'hist',
      },
      synthesize: {
        takeaway: 'Creation is ordered by speech.',
        open_question: 'How does this frame John 1?',
        key_connection: 'John 1 echoes Genesis 1.',
      },
      review: {
        artifact_generated: true,
        next_chapter_accepted: false,
      },
    };
    const back = safeParseCapturedInputs(serializeCapturedInputs(populated));
    expect(back).toEqual(populated);
  });

  it('partial CapturedInputs round-trips with only the populated keys', () => {
    const partial: CapturedInputs = {
      observe: { primary: 'shepherd' },
    };
    expect(safeParseCapturedInputs(serializeCapturedInputs(partial))).toEqual(partial);
  });
});

describe('safeParseCapturedInputs error handling', () => {
  it('returns empty for null without warning', () => {
    expect(safeParseCapturedInputs(null)).toEqual({});
    expect(warnMock).not.toHaveBeenCalled();
  });

  it('returns empty for undefined without warning', () => {
    expect(safeParseCapturedInputs(undefined)).toEqual({});
    expect(warnMock).not.toHaveBeenCalled();
  });

  it('returns empty for empty string without warning', () => {
    expect(safeParseCapturedInputs('')).toEqual({});
    expect(warnMock).not.toHaveBeenCalled();
  });

  it('returns empty + logs a warning on malformed JSON', () => {
    expect(safeParseCapturedInputs('{not valid')).toEqual({});
    expect(warnMock).toHaveBeenCalledTimes(1);
    expect(warnMock).toHaveBeenCalledWith('GuidedStudy', 'parse failed', expect.anything());
  });

  it('returns empty + logs a warning when JSON parses to a non-object', () => {
    expect(safeParseCapturedInputs('"a string"')).toEqual({});
    expect(safeParseCapturedInputs('[1,2,3]')).toEqual({});
    expect(warnMock).toHaveBeenCalledTimes(2);
  });
});
