/**
 * GoldSeparator (explore re-export) — Back-compat shim.
 *
 * The canonical implementation moved to `app/src/components/GoldSeparator.tsx`
 * in Card #1358 so any screen can import it. This file exists only so that
 * existing `import { GoldSeparator } from '../components/explore'` calls keep
 * working. New code should import from `'../components/GoldSeparator'` or
 * `'@/components/GoldSeparator'` directly.
 */

export { GoldSeparator } from '../GoldSeparator';
export type { GoldSeparatorProps } from '../GoldSeparator';
