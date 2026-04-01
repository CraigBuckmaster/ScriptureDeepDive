/**
 * TranslationDropdown — Compact translation picker for the chapter nav bar.
 *
 * Thin wrapper around CompactDropdown. Translation list is driven by the
 * central registry — adding a new translation only requires updating the
 * build pipeline and translationRegistry.ts.
 */

import React from 'react';
import { CompactDropdown, type DropdownOption } from './CompactDropdown';
import { TRANSLATIONS } from '../db/translationRegistry';

const TRANSLATION_OPTIONS: DropdownOption[] = TRANSLATIONS.map((t) => ({
  key: t.id,
  label: t.label,
}));

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
