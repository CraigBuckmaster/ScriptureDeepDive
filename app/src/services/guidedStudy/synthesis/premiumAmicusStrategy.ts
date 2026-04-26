/**
 * Premium Amicus synthesis strategy — stub.
 *
 * Filled in by Phase 4 (#1745). Behind GUIDED_STUDY_AMICUS_SYNTHESIS;
 * the chooseStrategy factory only routes here when the flag is on AND
 * useAmicusAccess.canUse is true.
 */
import type { SynthesisStrategy } from './strategy';

export const premiumAmicusStrategy: SynthesisStrategy = {
  kind: 'premium_amicus',
  async run() {
    throw new Error('premiumAmicusStrategy: not implemented (lands in #1745)');
  },
};
