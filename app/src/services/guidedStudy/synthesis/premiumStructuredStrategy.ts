/**
 * Premium structured synthesis strategy — stub.
 *
 * Filled in by Phase 3.3 (#1740): mode-shaped form with persistent save
 * + spaced review queue entry. This is the path premium users get when
 * the GUIDED_STUDY_AMICUS_SYNTHESIS flag is OFF.
 */
import type { SynthesisStrategy } from './strategy';

export const premiumStructuredStrategy: SynthesisStrategy = {
  kind: 'premium_structured',
  async run() {
    throw new Error('premiumStructuredStrategy: not implemented (lands in #1740)');
  },
};
