/**
 * genealogyOrganic.ts — Pure helpers for the organic layer.
 *
 * Cubic Bezier path generation, tribal bloom layout override, and
 * branch-weight encoding. All helpers are deterministic and easily
 * unit-tested.
 *
 * Tier / semantic-zoom logic lives in `./treeTiers` — this module only
 * deals with geometry + visual weight.
 */

import type { Person } from '../types';

// ── Bezier curve path ─────────────────────────────────────────────────

export interface Point {
  x: number;
  y: number;
}

/**
 * Generate an SVG cubic Bezier path string from `parent` down to `child`.
 * Control points are placed at the vertical midpoint, producing a smooth
 * S-curve for vertical spans and a graceful arc for horizontal ones.
 */
export function bezierPath(parent: Point, child: Point): string {
  const midY = (parent.y + child.y) / 2;
  return `M ${parent.x} ${parent.y} C ${parent.x} ${midY}, ${child.x} ${midY}, ${child.x} ${child.y}`;
}

// ── Branch weight encoding ────────────────────────────────────────────

export interface LinkStyle {
  width: number;
  /**
   * Colour key. 'gold' is messianic, 'faint' is non-messianic.
   * Callers resolve to a palette value.
   */
  color: 'gold' | 'faint';
  /** Decimal opacity (0..1). */
  opacity: number;
  /** Whether to apply a glow filter (messianic only). */
  glow: boolean;
}

/**
 * Map a parent/child/messianic-flag combination to visual weight.
 * Order of precedence: messianic → role-privileged parent → child bio → default.
 */
export function getLinkWeight(parent: Person, child: Person, isMessianic: boolean): LinkStyle {
  if (isMessianic) {
    return { width: 2.5, color: 'gold', opacity: 0.35, glow: true };
  }
  const role = parent.role ?? '';
  if (['patriarch', 'king'].includes(role)) {
    return { width: 1.5, color: 'faint', opacity: 0.25, glow: false };
  }
  if (child.bio) {
    return { width: 1.2, color: 'faint', opacity: 0.2, glow: false };
  }
  return { width: 0.8, color: 'faint', opacity: 0.12, glow: false };
}

// ── Tribal bloom layout ───────────────────────────────────────────────

export interface BloomInput {
  id: string;
  x: number;
  y: number;
  parentId?: string | null;
}

export interface BloomOutput extends BloomInput {
  x: number;
  y: number;
}

export interface BloomOptions {
  /** Pixel radius of the fan. */
  radius?: number;
  /** Degrees from straight-down at which the fan begins (left side). */
  startAngleDegrees?: number;
  /** Degrees from straight-down at which the fan ends (right side). */
  endAngleDegrees?: number;
}

/**
 * Produce a radial "bloom" arrangement for a set of child nodes that
 * descend from `centerX, centerY`. Children are placed evenly across
 * the provided angular sweep. Returns new nodes with updated (x, y) —
 * the input array is not mutated.
 */
export function applyTribalBloom(
  center: Point,
  children: BloomInput[],
  options: BloomOptions = {},
): BloomOutput[] {
  const { radius = 120, startAngleDegrees = -72, endAngleDegrees = 72 } = options;
  if (children.length === 0) return [];

  const start = (startAngleDegrees * Math.PI) / 180;
  const end = (endAngleDegrees * Math.PI) / 180;

  if (children.length === 1) {
    const [c] = children;
    return [{ ...c, x: center.x, y: center.y + radius }];
  }

  return children.map((child, i) => {
    const t = i / (children.length - 1);
    const angle = start + (end - start) * t;
    // Angle 0 points straight down (south). Positive rotates right.
    const dx = radius * Math.sin(angle);
    const dy = radius * Math.cos(angle);
    return { ...child, x: center.x + dx, y: center.y + dy };
  });
}
