/**
 * genealogyOrganic.ts — Pure helpers for the Phase-2 organic layer.
 *
 * Cubic Bezier path generation, zoom-semantic tier computation, tribal
 * bloom layout override, and branch-weight encoding. All helpers are
 * deterministic and easily unit-tested.
 *
 * Part of Card #1267 (Genealogy Phase 2).
 */

import type { Person } from '../types';

// ── Zoom-semantic tier ────────────────────────────────────────────────

export type PersonTier = 1 | 2 | 3;

/** Visible tier threshold for each zoom level.
 *
 * Thresholds are set LOW (both at 0.4) so the default mobile centre-on-Adam
 * scale (0.45 initial, 0.65 post-centring) shows the FULL tree including
 * bio-holders, tier-3 figures, and expanded associate clusters. Higher
 * thresholds hid too much content by default.
 *
 * At zoom ≤ 0.4 (extreme zoom-out) the tree falls back to tier-1 only
 * (messianic spine + role-holders) and associate clusters collapse to
 * "+N" badges, giving a readable overview at the bird's-eye scale.
 *
 * The original crash that justified higher thresholds (a single commit
 * that mounted ~240 SVG layers when tier 2 first became visible) is
 * now prevented by the staggered reveal in TreeCanvas (#1329) — mount
 * batches of REVEAL_BATCH_PER_FRAME per animation frame instead of a
 * single commit. So we no longer need the thresholds themselves to
 * defend against the batch-mount crash.
 */
export const TIER_2_ZOOM = 0.3;
export const TIER_3_ZOOM = 0.4;

/** Derive the tier for a single person. */
export function getPersonTier(person: Person, isMessianic: boolean): PersonTier {
  if (isMessianic) return 1;
  const role = person.role ?? '';
  if (['patriarch', 'king', 'prophet', 'judge'].includes(role)) return 1;
  if (person.bio) return 2;
  return 3;
}

/** Map a zoom level to the highest visible tier. */
export function getVisibleTier(zoom: number): PersonTier {
  if (zoom > TIER_3_ZOOM) return 3;
  if (zoom > TIER_2_ZOOM) return 2;
  return 1;
}

/** Whether a person at `personTier` should be visible at the current `zoom`. */
export function isPersonVisibleAtZoom(personTier: PersonTier, zoom: number): boolean {
  const visible = getVisibleTier(zoom);
  return personTier <= visible;
}

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
