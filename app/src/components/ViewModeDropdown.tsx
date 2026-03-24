/**
 * ViewModeDropdown — Compact view mode picker for the book list.
 *
 * Thin wrapper around CompactDropdown. Two modes:
 *   'thematic'  → "By Tradition" (grouped by genre)
 *   'canonical' → "Canonical Order" (OT/NT flat list)
 */

import React from 'react';
import { CompactDropdown, type DropdownOption } from './CompactDropdown';

const VIEW_MODE_OPTIONS: DropdownOption[] = [
  { key: 'thematic',  label: 'By Tradition' },
  { key: 'canonical', label: 'Canonical Order' },
];

interface Props {
  mode: string;
  onModeChange: (mode: string) => void;
}

export function ViewModeDropdown({ mode, onModeChange }: Props) {
  return (
    <CompactDropdown
      value={mode}
      options={VIEW_MODE_OPTIONS}
      onSelect={onModeChange}
      direction="down"
    />
  );
}
