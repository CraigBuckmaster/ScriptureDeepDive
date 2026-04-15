/**
 * db/translationRegistry.ts — Central registry for Bible translations.
 *
 * Translations are either "bundled" (baked into scripture.db, ship with the
 * app binary) or "downloadable" (separate .db files the user installs on
 * demand). The manifest is generated at build time by build_sqlite.py.
 *
 * UI labels and display order are defined here so the build pipeline only
 * needs to know translation IDs.
 */

import manifest from './translations.json';

export interface TranslationInfo {
  id: string;
  label: string;
  fullName: string;
  bundled: boolean;
  /** Filename for downloadable translations (e.g. "esv.db") */
  file?: string;
  /** Approximate download size in bytes (0 for bundled) */
  sizeBytes: number;
}

/** Display metadata keyed by translation ID. */
const LABELS: Record<string, { label: string; fullName: string }> = {
  kjv: { label: 'KJV', fullName: 'King James Version' },
  asv: { label: 'ASV', fullName: 'American Standard Version' },
};

/** All known translations, in display order. */
export const TRANSLATIONS: TranslationInfo[] = manifest.map((t) => ({
  id: t.id,
  label: LABELS[t.id]?.label ?? t.id.toUpperCase(),
  fullName: LABELS[t.id]?.fullName ?? t.id.toUpperCase(),
  bundled: t.bundled,
  file: (t as { file?: string }).file,
  sizeBytes: (t as { sizeBytes?: number }).sizeBytes ?? 0,
}));

/** Quick lookup by ID. */
export const TRANSLATION_MAP = new Map(TRANSLATIONS.map((t) => [t.id, t]));

/** Only bundled translations. */
export const BUNDLED_TRANSLATIONS = TRANSLATIONS.filter((t) => t.bundled);

/** Only downloadable (non-bundled) translations. */
export const DOWNLOADABLE_TRANSLATIONS = TRANSLATIONS.filter((t) => !t.bundled);

/** Check if a translation is bundled in the core DB. */
export function isBundled(translationId: string): boolean {
  return TRANSLATION_MAP.get(translationId)?.bundled ?? false;
}
