/**
 * utils/timelineLayout.ts — Timeline layout math.
 *
 * Events render ABOVE the axis line (stems drop down to axis).
 * People + World History render BELOW the axis line (stems rise up to axis).
 * Piecewise linear scale, swim-lane assignment, tick marks. Pure logic.
 */

export const TOTAL_WIDTH = 9000;

// Lane config — events above, people/world below
const ABOVE_LANE_COUNT = 12;
const BELOW_LANE_COUNT = 8;
export const LANE_HEIGHT = 26;

// Vertical layout
export const ERA_BAR_Y = 5;
export const ERA_BAR_H = 40;
const ABOVE_LANE_TOP = 60;
export const AXIS_Y = ABOVE_LANE_TOP + ABOVE_LANE_COUNT * LANE_HEIGHT + 20;
const BELOW_LANE_TOP = AXIS_Y + 30;

/** Total SVG height based on whether below-axis content exists. */
export function computeSvgHeight(hasBelow: boolean): number {
  if (!hasBelow) return AXIS_Y + 40;
  return BELOW_LANE_TOP + BELOW_LANE_COUNT * LANE_HEIGHT + 30;
}

// Legacy exports for compatibility
export const LANE_COUNT = ABOVE_LANE_COUNT;
export const LANE_TOP = ABOVE_LANE_TOP;

export const SCALE_BREAKPOINTS: [number, number][] = [
  [-4000, 0], [-2200, 1400], [-1800, 2000], [-1400, 2800],
  [-1050, 3700], [-930, 4100], [-722, 4780], [-432, 6500],
  [0, 8000], [95, 9000],
];

export const ERA_RANGES: Record<string, [number, number]> = {
  primeval: [-4000, -2200],
  patriarch: [-2200, -1800],
  exodus: [-1800, -1400],
  judges: [-1400, -1050],
  kingdom: [-1050, -930],
  prophets: [-930, -722],
  exile: [-722, -432],
  intertestamental: [-432, 0],
  nt: [0, 95],
};

/** Piecewise linear interpolation: year → x pixel position (0–9000). */
export function yearToX(year: number): number {
  if (year <= SCALE_BREAKPOINTS[0][0]) return SCALE_BREAKPOINTS[0][1];
  if (year >= SCALE_BREAKPOINTS[SCALE_BREAKPOINTS.length - 1][0]) {
    return SCALE_BREAKPOINTS[SCALE_BREAKPOINTS.length - 1][1];
  }
  for (let i = 1; i < SCALE_BREAKPOINTS.length; i++) {
    const [y0, x0] = SCALE_BREAKPOINTS[i - 1];
    const [y1, x1] = SCALE_BREAKPOINTS[i];
    if (year <= y1) {
      const t = (year - y0) / (y1 - y0);
      return x0 + t * (x1 - x0);
    }
  }
  return TOTAL_WIDTH;
}

export function formatYear(year: number): string {
  if (year === 0) return 'AD·BC';
  if (year < 0) return `${Math.abs(year)} BC`;
  return `AD ${year}`;
}

export interface PositionedEvent {
  id: string;
  category: string;
  name: string;
  year: number;
  era: string | null;
  x: number;
  y: number;
  labelWidth: number;
  scripture_ref: string | null;
  chapter_link: string | null;
  summary: string | null;
  people_json: string | null;
}

/**
 * Assign lanes and compute y positions.
 * Events → above axis (stems drop down to axis).
 * People + World → below axis (stems rise up to axis).
 */
export function assignLanes(events: { id: string; category: string; name: string; year: number; era: string | null; scripture_ref: string | null; chapter_link: string | null; summary: string | null; people_json: string | null }[]): PositionedEvent[] {
  const above = events.filter((e) => e.category === 'event');
  const below = events.filter((e) => e.category !== 'event');

  const assignGroup = (
    items: typeof events,
    laneCount: number,
    laneTop: number,
  ): PositionedEvent[] => {
    const sorted = [...items].sort((a, b) => yearToX(a.year) - yearToX(b.year));
    const laneRightEdges = new Array(laneCount).fill(-Infinity);
    const GAP = 10;

    return sorted.map((evt) => {
      const x = yearToX(evt.year);
      const labelWidth = evt.name.length * 7 + 70;
      const leftEdge = x - labelWidth / 2;

      let bestLane = 0;
      let bestRight = Infinity;
      for (let lane = 0; lane < laneCount; lane++) {
        if (leftEdge > laneRightEdges[lane] + GAP) {
          bestLane = lane;
          break;
        }
        if (laneRightEdges[lane] < bestRight) {
          bestRight = laneRightEdges[lane];
          bestLane = lane;
        }
      }

      laneRightEdges[bestLane] = x + labelWidth / 2;
      const y = laneTop + bestLane * LANE_HEIGHT;

      return { ...evt, x, y, labelWidth };
    });
  };

  return [
    ...assignGroup(above, ABOVE_LANE_COUNT, ABOVE_LANE_TOP),
    ...assignGroup(below, BELOW_LANE_COUNT, BELOW_LANE_TOP),
  ];
}

export function computeTickMarks(): { x: number; label: string; major: boolean }[] {
  const ticks: { x: number; label: string; major: boolean }[] = [];
  for (let year = -4000; year <= 100; year += 100) {
    const x = yearToX(year);
    const major = year % 500 === 0 || year === 0 || year === 33;
    if (major || (year % 200 === 0)) {
      ticks.push({ x, label: formatYear(year), major });
    }
  }
  return ticks;
}
