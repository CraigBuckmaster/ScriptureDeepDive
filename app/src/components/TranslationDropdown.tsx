/**
 * TranslationDropdown — Compact translation picker for the chapter nav bar.
 *
 * Thin wrapper around CompactDropdown. Adding a new translation is a
 * one-line addition to TRANSLATION_OPTIONS.
 */

import React from 'react';
import { CompactDropdown, type DropdownOption } from './CompactDropdown';

const TRANSLATION_OPTIONS: DropdownOption[] = [
  { key: 'niv', label: 'NIV' },
  { key: 'esv', label: 'ESV' },
  { key: 'kjv', label: 'KJV' },
  { key: 'asv', label: 'ASV' },
];

interface Props {
  active: string;
  onSelect: (key: string) => void;
}

export function TranslationDropdown({ active, onSelect }: Props) {
  return (
    <CompactDropdown
      value={active}
      options={TRANSLATION_OPTIONS}
      onSelect={onSelect}
      direction="down"
    />
  );
}
