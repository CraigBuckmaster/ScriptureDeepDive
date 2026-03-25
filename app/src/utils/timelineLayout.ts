/**
 * utils/timelineLayout.ts — Timeline layout math.
 *
 * Piecewise linear scale (SCALE_BREAKPOINTS), swim-lane assignment,
 * year formatting, tick mark computation. Pure logic, no rendering.
 */

export const TOTAL_WIDTH = 9000;
export const LANE_COUNT = 20;
export const AXIS_Y = 580;
export const ERA_BAR_Y = 5;
export const ERA_BAR_H = 40;
export const LANE_HEIGHT = 26;
export const LANE_TOP = 60;

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
  lane: number;
  labelWidth: number;
  scripture_ref: string | null;
  chapter_link: string | null;
  summary: string | null;
  people_json: string | null;
}

/** Greedy lane assignment: no label overlap within same lane. */
export function assignLanes(events: { id: string; category: string; name: string; year: number; era: string | null; scripture_ref: string | null; chapter_link: string | null; summary: string | null; people_json: string | null }[]): PositionedEvent[] {
  const sorted = [...events].sort((a, b) => yearToX(a.year) - yearToX(b.year));
  const laneRightEdges = new Array(LANE_COUNT).fill(-Infinity);
  const GAP = 10;

  return sorted.map((evt) => {
    const x = yearToX(evt.year);
    const labelWidth = evt.name.length * 7 + 70; // approximate at fontSize 11
    const leftEdge = x - labelWidth / 2;

    let bestLane = 0;
    let bestRight = Infinity;
    for (let lane = 0; lane < LANE_COUNT; lane++) {
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

    return { ...evt, x, lane: bestLane, labelWidth };
  });
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
