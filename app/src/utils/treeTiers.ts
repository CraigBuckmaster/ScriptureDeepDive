/**
 * treeTiers.ts — Structural tier assignment for semantic zoom.
 *
 * Tiers control information density at each zoom level:
 *   Tier 1: Messianic spine + their spouses (always visible)
 *   Tier 2: Biological tree (connected via father/mother links)
 *   Tier 3: Disconnected figures with bios (prophets, NT figures, bloom associates)
 *   Tier 4: Minor figures, future additions (headroom)
 *
 * Unlike the previous role-based tier system in genealogyOrganic.ts, this
 * assignment is purely structural — it reflects a person's position in the
 * genealogical graph rather than inspecting their role / bio fields. That
 * makes the tier data-driven: adding a new person slots into the right
 * tier automatically without having to curate role metadata.
 */

export type PersonTier = 1 | 2 | 3 | 4;

/** Zoom thresholds — below each threshold, that tier is hidden.
 *  Tier 1 is always visible. */
export const TIER_THRESHOLDS: Record<PersonTier, number> = {
  1: 0, // always visible
  2: 0.35, // family tree appears
  3: 0.55, // disconnected figures + bloom associates
  4: 0.70, // everyone (future headroom)
};

/**
 * Decide a person's structural tier.
 *
 * Precedence (first match wins):
 *   1. On the messianic spine → Tier 1
 *   2. Spouse of someone on the spine → Tier 1
 *   3. Attached to the main biological tree (not an associate) → Tier 2
 *   4. Has a bio (disconnected figure with curated content, or a bloom
 *      associate we still want surfaced at mid-zoom) → Tier 3
 *   5. Everything else → Tier 4
 */
export function assignTier(
  personId: string,
  spineIds: Set<string>,
  treeNodeIds: Set<string>,
  spouseOf: string | null | undefined,
  isAssociate: boolean,
  hasBio: boolean,
): PersonTier {
  if (spineIds.has(personId)) return 1;
  if (spouseOf && spineIds.has(spouseOf)) return 1;
  if (treeNodeIds.has(personId) && !isAssociate) return 2;
  if (hasBio) return 3;
  return 4;
}

/** Given the current zoom, return the max tier that should be visible. */
export function getMaxVisibleTier(zoom: number): PersonTier {
  if (zoom >= TIER_THRESHOLDS[4]) return 4;
  if (zoom >= TIER_THRESHOLDS[3]) return 3;
  if (zoom >= TIER_THRESHOLDS[2]) return 2;
  return 1;
}

/** Whether a node at the given tier should be visible at the given zoom. */
export function isTierVisible(tier: PersonTier, zoom: number): boolean {
  return tier <= getMaxVisibleTier(zoom);
}
