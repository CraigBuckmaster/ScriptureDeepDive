import {
  yearToX,
  formatYear,
  computeSvgHeight,
  assignLanes,
  computeTickMarks,
  TOTAL_WIDTH,
  LANE_HEIGHT,
  AXIS_Y,
  SCALE_BREAKPOINTS,
} from '../../src/utils/timelineLayout';

const FIRST_X = SCALE_BREAKPOINTS[0][1];                     // PAD_LEFT = 200
const LAST_X = SCALE_BREAKPOINTS[SCALE_BREAKPOINTS.length - 1][1]; // TOTAL_WIDTH - PAD_RIGHT = 9200

describe('yearToX', () => {
  it('maps earliest breakpoint year to first x', () => expect(yearToX(-4000)).toBe(FIRST_X));
  it('maps last breakpoint year to last x', () => expect(yearToX(95)).toBe(LAST_X));
  it('maps exact breakpoint -2200 to 1600', () => expect(yearToX(-2200)).toBe(1600));
  it('maps 0 to 8200', () => expect(yearToX(0)).toBe(8200));
  it('interpolates between breakpoints', () => {
    const x = yearToX(-3100);
    expect(x).toBeGreaterThan(FIRST_X);
    expect(x).toBeLessThan(1600);
  });
  it('clamps below minimum', () => expect(yearToX(-5000)).toBe(FIRST_X));
  it('clamps above maximum', () => expect(yearToX(200)).toBe(LAST_X));
});

describe('formatYear', () => {
  it('formats BC years', () => expect(formatYear(-4000)).toBe('4000 BC'));
  it('formats year 0', () => expect(formatYear(0)).toBe('AD·BC'));
  it('formats AD years', () => expect(formatYear(33)).toBe('AD 33'));
  it('formats negative year as absolute value + BC', () => expect(formatYear(-500)).toBe('500 BC'));
  it('formats positive year as AD + value', () => expect(formatYear(1)).toBe('AD 1'));
});

describe('computeSvgHeight', () => {
  it('returns smaller height when hasBelow is false', () => {
    const noBelow = computeSvgHeight(false);
    expect(noBelow).toBe(AXIS_Y + 40);
  });

  it('returns larger height when hasBelow is true', () => {
    const withBelow = computeSvgHeight(true);
    expect(withBelow).toBeGreaterThan(computeSvgHeight(false));
  });

  it('includes below-axis lanes in height calculation', () => {
    const withBelow = computeSvgHeight(true);
    // Below lane top = AXIS_Y + 30, plus 8 lanes * LANE_HEIGHT + 30 padding
    expect(withBelow).toBe(AXIS_Y + 30 + 8 * LANE_HEIGHT + 30);
  });
});

describe('assignLanes', () => {
  const makeEvent = (overrides: Partial<{
    id: string; category: string; name: string; year: number;
    era: string | null; scripture_ref: string | null;
    chapter_link: string | null; summary: string | null;
    people_json: string | null;
  }> = {}) => ({
    id: '1',
    category: 'event',
    name: 'Test Event',
    year: -1000,
    era: null,
    scripture_ref: null,
    chapter_link: null,
    summary: null,
    people_json: null,
    ...overrides,
  });

  it('places event/book categories above the axis', () => {
    const result = assignLanes([
      makeEvent({ id: '1', category: 'event', year: -2000 }),
      makeEvent({ id: '2', category: 'book', year: -1500 }),
    ]);
    result.forEach((evt) => {
      expect(evt.y).toBeLessThan(AXIS_Y);
    });
  });

  it('places non-event/book categories below the axis', () => {
    const result = assignLanes([
      makeEvent({ id: '1', category: 'person', year: -2000 }),
      makeEvent({ id: '2', category: 'world', year: -1500 }),
    ]);
    result.forEach((evt) => {
      expect(evt.y).toBeGreaterThan(AXIS_Y);
    });
  });

  it('marks events with chapter_link or summary as major', () => {
    const result = assignLanes([
      makeEvent({ id: '1', chapter_link: '/genesis/1' }),
      makeEvent({ id: '2', summary: 'A summary' }),
    ]);
    result.forEach((evt) => {
      expect(evt.significance).toBe('major');
    });
  });

  it('marks events with category "book" as major', () => {
    const result = assignLanes([
      makeEvent({ id: '1', category: 'book' }),
    ]);
    expect(result[0].significance).toBe('major');
  });

  it('marks plain events without chapter_link/summary as minor', () => {
    const result = assignLanes([
      makeEvent({ id: '1', category: 'event' }),
    ]);
    expect(result[0].significance).toBe('minor');
  });

  it('sorts events by x position', () => {
    const result = assignLanes([
      makeEvent({ id: '1', year: 0 }),
      makeEvent({ id: '2', year: -3000 }),
      makeEvent({ id: '3', year: -1000 }),
    ]);
    // All are 'event' category so all go above axis; should be sorted by x
    const aboveEvents = result.filter((e) => e.y < AXIS_Y);
    for (let i = 1; i < aboveEvents.length; i++) {
      expect(aboveEvents[i].x).toBeGreaterThanOrEqual(aboveEvents[i - 1].x);
    }
  });

  it('computes x from yearToX', () => {
    const result = assignLanes([makeEvent({ year: -2200 })]);
    expect(result[0].x).toBe(yearToX(-2200));
  });
});

describe('computeTickMarks', () => {
  it('returns an array of tick marks', () => {
    const ticks = computeTickMarks();
    expect(Array.isArray(ticks)).toBe(true);
    expect(ticks.length).toBeGreaterThan(0);
  });

  it('returns cached result on second call (same reference)', () => {
    const first = computeTickMarks();
    const second = computeTickMarks();
    expect(first).toBe(second); // same object reference
  });

  it('includes ticks at multiples of 500 as major', () => {
    const ticks = computeTickMarks();
    const tick1000BC = ticks.find((t) => t.label === '1000 BC');
    expect(tick1000BC).toBeDefined();
    expect(tick1000BC!.major).toBe(true);
  });

  it('includes year 0 as major', () => {
    const ticks = computeTickMarks();
    const tickZero = ticks.find((t) => t.label === 'AD\u00b7BC');
    expect(tickZero).toBeDefined();
    expect(tickZero!.major).toBe(true);
  });

  it('each tick has x, label, and major properties', () => {
    const ticks = computeTickMarks();
    ticks.forEach((tick) => {
      expect(tick).toHaveProperty('x');
      expect(tick).toHaveProperty('label');
      expect(tick).toHaveProperty('major');
      expect(typeof tick.x).toBe('number');
      expect(typeof tick.label).toBe('string');
      expect(typeof tick.major).toBe('boolean');
    });
  });
});

describe('constants', () => {
  it('TOTAL_WIDTH is 9400', () => {
    expect(TOTAL_WIDTH).toBe(9400);
  });

  it('LANE_HEIGHT is 26', () => {
    expect(LANE_HEIGHT).toBe(26);
  });

  it('AXIS_Y is computable from ABOVE_LANE_TOP + 12 * LANE_HEIGHT + 20', () => {
    // ABOVE_LANE_TOP = 60, ABOVE_LANE_COUNT = 12
    expect(AXIS_Y).toBe(60 + 12 * LANE_HEIGHT + 20);
  });
});
