import {
  assignTier,
  getMaxVisibleTier,
  isTierVisible,
  TIER_THRESHOLDS,
} from '@/utils/treeTiers';

describe('assignTier', () => {
  const spineIds = new Set(['adam', 'seth', 'jesus']);
  const treeNodeIds = new Set(['adam', 'seth', 'cain', 'abel', 'jesus']);

  it('returns tier 1 for spine members', () => {
    expect(assignTier('adam', spineIds, treeNodeIds, null, false, false)).toBe(1);
    expect(assignTier('jesus', spineIds, treeNodeIds, null, false, true)).toBe(1);
  });

  it('returns tier 1 for spouses of spine members', () => {
    expect(assignTier('eve', spineIds, treeNodeIds, 'adam', false, false)).toBe(1);
  });

  it('returns tier 2 for non-associate members of the biological tree', () => {
    expect(assignTier('cain', spineIds, treeNodeIds, null, false, false)).toBe(2);
    expect(assignTier('abel', spineIds, treeNodeIds, null, false, true)).toBe(2);
  });

  it('returns tier 3 for people with a bio who are not on the tree', () => {
    expect(assignTier('peter', spineIds, treeNodeIds, null, false, true)).toBe(3);
  });

  it('returns tier 3 for associates who have bios', () => {
    // isAssociate=true makes them fall out of tier 2; hasBio=true promotes to 3.
    expect(assignTier('peter', spineIds, treeNodeIds, null, true, true)).toBe(3);
  });

  it('returns tier 4 for minor figures with no bio and no tree membership', () => {
    expect(assignTier('unknown', spineIds, treeNodeIds, null, false, false)).toBe(4);
  });
});

describe('getMaxVisibleTier', () => {
  it('returns 1 at very low zoom', () => {
    expect(getMaxVisibleTier(0)).toBe(1);
    expect(getMaxVisibleTier(TIER_THRESHOLDS[2] - 0.01)).toBe(1);
  });

  it('returns 2 once zoom crosses the tier-2 threshold', () => {
    expect(getMaxVisibleTier(TIER_THRESHOLDS[2])).toBe(2);
  });

  it('returns 3 once zoom crosses the tier-3 threshold', () => {
    expect(getMaxVisibleTier(TIER_THRESHOLDS[3])).toBe(3);
  });

  it('returns 4 at the highest tier threshold', () => {
    expect(getMaxVisibleTier(TIER_THRESHOLDS[4])).toBe(4);
    expect(getMaxVisibleTier(2.5)).toBe(4);
  });
});

describe('isTierVisible', () => {
  it('tier 1 is always visible', () => {
    expect(isTierVisible(1, 0)).toBe(true);
    expect(isTierVisible(1, 3)).toBe(true);
  });

  it('hides higher tiers below their threshold', () => {
    expect(isTierVisible(4, TIER_THRESHOLDS[3])).toBe(false);
    expect(isTierVisible(3, TIER_THRESHOLDS[2])).toBe(false);
  });

  it('shows higher tiers once the threshold is reached', () => {
    expect(isTierVisible(3, TIER_THRESHOLDS[3])).toBe(true);
    expect(isTierVisible(4, TIER_THRESHOLDS[4])).toBe(true);
  });
});
