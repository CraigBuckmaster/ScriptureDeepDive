/**
 * Canonical world history region taxonomy.
 *
 * Mirrored in `_tools/world_regions.py` for content-side validation.
 * Issue #1809.
 */

import type { LucideIcon } from 'lucide-react-native';
import { Pyramid, Building, Crown, Columns3, Landmark, Tent } from 'lucide-react-native';

export interface RegionDef {
  key: string;
  label: string;
  color: string;
  icon: LucideIcon;
}

export const WORLD_REGIONS: Record<string, RegionDef> = {
  egypt:        { key: 'egypt',        label: 'Egypt',        color: '#c8a04f', icon: Pyramid },
  mesopotamia:  { key: 'mesopotamia',  label: 'Mesopotamia',  color: '#a86b3c', icon: Building },
  persia:       { key: 'persia',       label: 'Persia',       color: '#7a5fa0', icon: Crown },
  greece:       { key: 'greece',       label: 'Greece',       color: '#5f9ea0', icon: Columns3 },
  rome:         { key: 'rome',         label: 'Rome',         color: '#9c5648', icon: Landmark },
  levant:       { key: 'levant',       label: 'Levant',       color: '#7d8c5c', icon: Tent },
};

export const WORLD_REGION_KEYS = Object.keys(WORLD_REGIONS);

/** Resolve a region key to its definition. Returns null for unknown keys. */
export function resolveRegion(regionKey: string | null | undefined): RegionDef | null {
  if (!regionKey) return null;
  return WORLD_REGIONS[regionKey] ?? null;
}
