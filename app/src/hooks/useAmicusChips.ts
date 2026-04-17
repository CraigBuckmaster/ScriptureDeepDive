/**
 * hooks/useAmicusChips.ts — Load chip pool rows for the FAB peek.
 *
 * Reads from scripture.db's `precached_prompts` table (populated by
 * `_tools/build_prompts.py`). Picks a profile variant based on the
 * user's profile lean, falling back to the `generic_balanced` default.
 *
 * Returns up to 3 chips; empty if nothing is available for the current
 * context.
 */
import { useEffect, useState } from 'react';
import { getDb } from '@/db/database';
import { logger } from '@/utils/logger';

export interface AmicusChip {
  label: string;
  seed_query: string;
  expected_source_types: string[];
}

export type ChipContext =
  | { kind: 'chapter'; bookId: string; chapterNum: number }
  | { kind: 'person'; personId: string }
  | { kind: 'place'; placeId: string }
  | { kind: 'debate_topic'; topicId: string }
  | { kind: 'none' };

export interface UseAmicusChipsResult {
  chips: AmicusChip[];
  isLoading: boolean;
}

export const DEFAULT_VARIANT = 'generic_balanced';
const CHIP_LIMIT = 3;

/** Variant fallback order — try the user's preferred variant first, then
 *  the generic default, then `default` (entity rows use 'default'). */
function variantLookupOrder(preferredVariant?: string): string[] {
  const out = new Set<string>();
  if (preferredVariant) out.add(preferredVariant);
  out.add(DEFAULT_VARIANT);
  out.add('default');
  return [...out];
}

function entityKeyFromContext(
  ctx: ChipContext,
): { entityType: string; entityId: string } | null {
  switch (ctx.kind) {
    case 'chapter':
      return { entityType: 'chapter', entityId: `${ctx.bookId}-${ctx.chapterNum}` };
    case 'person':
      return { entityType: 'person', entityId: ctx.personId };
    case 'place':
      return { entityType: 'place', entityId: ctx.placeId };
    case 'debate_topic':
      return { entityType: 'debate_topic', entityId: ctx.topicId };
    case 'none':
      return null;
  }
}

async function loadChips(
  ctx: ChipContext,
  preferredVariant?: string,
): Promise<AmicusChip[]> {
  const key = entityKeyFromContext(ctx);
  if (!key) return [];

  for (const variant of variantLookupOrder(preferredVariant)) {
    try {
      const row = await getDb().getFirstAsync<{ chips_json: string }>(
        `SELECT chips_json FROM precached_prompts
          WHERE entity_type = ? AND entity_id = ? AND profile_variant = ?`,
        [key.entityType, key.entityId, variant],
      );
      if (!row) continue;
      try {
        const parsed = JSON.parse(row.chips_json) as AmicusChip[];
        return parsed.slice(0, CHIP_LIMIT);
      } catch (err) {
        logger.warn('Amicus', `bad chips_json for ${key.entityId}`, err);
        return [];
      }
    } catch (err) {
      logger.warn('Amicus', 'chip lookup failed', err);
      return [];
    }
  }
  return [];
}

function contextCacheKey(ctx: ChipContext): string {
  switch (ctx.kind) {
    case 'chapter': return `chapter:${ctx.bookId}-${ctx.chapterNum}`;
    case 'person': return `person:${ctx.personId}`;
    case 'place': return `place:${ctx.placeId}`;
    case 'debate_topic': return `debate_topic:${ctx.topicId}`;
    case 'none': return 'none';
  }
}

export function useAmicusChips(
  ctx: ChipContext,
  preferredVariant?: string,
): UseAmicusChipsResult {
  const [chips, setChips] = useState<AmicusChip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const cacheKey = contextCacheKey(ctx);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const out = await loadChips(ctx, preferredVariant);
      if (cancelled) return;
      setChips(out);
      setIsLoading(false);
    })();
    return () => {
      cancelled = true;
    };
    // The derived cacheKey captures every ctx field we care about; re-running
    // when preferredVariant changes is covered below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cacheKey, preferredVariant]);

  return { chips, isLoading };
}

export const _internal = { loadChips, variantLookupOrder, entityKeyFromContext };
