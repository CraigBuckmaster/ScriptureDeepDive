/**
 * Phase 3.6 (#1743) — focused dispatch matrix for chooseStrategy. The
 * underlying logic is tiny, but locking the routing table down means
 * future flag/cap interactions never silently change the experience for
 * free/premium/amicus users.
 */
import { chooseStrategy } from '../strategy';
import { freeStrategy } from '../freeStrategy';
import { premiumStructuredStrategy } from '../premiumStructuredStrategy';
import { premiumAmicusStrategy } from '../premiumAmicusStrategy';

describe('chooseStrategy dispatch matrix', () => {
  it('non-premium + flag off + cap reached → free', () => {
    expect(
      chooseStrategy({ isPremium: false, amicusFlagEnabled: false, amicusCanUse: false }),
    ).toBe(freeStrategy);
  });

  it('non-premium + flag ON + cap available → still free (premium status wins)', () => {
    expect(
      chooseStrategy({ isPremium: false, amicusFlagEnabled: true, amicusCanUse: true }),
    ).toBe(freeStrategy);
  });

  it('premium + flag off → premium_structured', () => {
    expect(
      chooseStrategy({ isPremium: true, amicusFlagEnabled: false, amicusCanUse: true }),
    ).toBe(premiumStructuredStrategy);
  });

  it('premium + flag ON + cap reached → premium_structured (graceful fallback)', () => {
    expect(
      chooseStrategy({ isPremium: true, amicusFlagEnabled: true, amicusCanUse: false }),
    ).toBe(premiumStructuredStrategy);
  });

  it('premium + flag ON + cap available → premium_amicus', () => {
    expect(
      chooseStrategy({ isPremium: true, amicusFlagEnabled: true, amicusCanUse: true }),
    ).toBe(premiumAmicusStrategy);
  });
});
