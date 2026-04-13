import { computeSpineIds, positionSpouses, TREE_CONSTANTS } from '../../src/utils/treeBuilder';
import type { Person } from '../../src/types';

const makePerson = (id: string, father?: string): Person => ({
  id, name: id, gender: 'm', father: father ?? null, mother: null,
  spouse_of: null, era: 'patriarch', dates: null, role: '', type: null,
  bio: null, scripture_role: null, refs_json: null, chapter_link: null,
});

describe('computeSpineIds', () => {
  it('traces father chain from jesus to adam', () => {
    const people = [
      makePerson('adam'),
      makePerson('seth', 'adam'),
      makePerson('enosh', 'seth'),
      makePerson('jesus', 'enosh'),
      makePerson('ishmael', 'adam'), // not on spine
    ];
    const spine = computeSpineIds(people);
    expect(spine.has('adam')).toBe(true);
    expect(spine.has('seth')).toBe(true);
    expect(spine.has('enosh')).toBe(true);
    expect(spine.has('jesus')).toBe(true);
    expect(spine.has('ishmael')).toBe(false);
  });

  it('returns empty set if no jesus', () => {
    const people = [makePerson('adam')];
    expect(computeSpineIds(people).size).toBe(0);
  });
});

describe('positionSpouses', () => {
  it('uses correct spouse offset', () => {
    expect(TREE_CONSTANTS.spouseXOffset).toBe(88);
    expect(TREE_CONSTANTS.spouseYSpread).toBe(58);
  });

  it('offsets spouse nodes from the primary node', () => {
    const people: Person[] = [
      makePerson('adam'),
      { ...makePerson('eve'), gender: 'f', spouse_of: 'adam' },
    ];
    const spineIds = new Set(['adam']);
    const primaryNode = {
      data: { ...people[0], nodeType: 'spine' as const },
      x: 100, y: 200, parent: null, children: [], depth: 0, isSpouse: false,
    };
    const result = positionSpouses([primaryNode], people, spineIds);
    expect(result.length).toBe(2);
    const spouse = result.find(n => n.data.id === 'eve');
    expect(spouse).toBeDefined();
    expect(spouse!.isSpouse).toBe(true);
    expect(spouse!.x).toBe(100 + TREE_CONSTANTS.spouseXOffset);
    // Single spouse => offset is 0, so same y
    expect(spouse!.y).toBe(200);
  });

  it('spreads multiple spouses vertically around partner', () => {
    const people: Person[] = [
      makePerson('jacob'),
      { ...makePerson('leah'), gender: 'f', spouse_of: 'jacob' },
      { ...makePerson('rachel'), gender: 'f', spouse_of: 'jacob' },
    ];
    const spineIds = new Set(['jacob']);
    const primaryNode = {
      data: { ...people[0], nodeType: 'spine' as const },
      x: 0, y: 0, parent: null, children: [], depth: 0, isSpouse: false,
    };
    const result = positionSpouses([primaryNode], people, spineIds);
    const spouses = result.filter(n => n.isSpouse);
    expect(spouses.length).toBe(2);
    // Two spouses should be spread by spouseYSpread
    const ys = spouses.map(s => s.y).sort((a, b) => a - b);
    expect(ys[1] - ys[0]).toBe(TREE_CONSTANTS.spouseYSpread);
  });
});

describe('computeSpineIds – extra edge cases', () => {
  it('returns empty set if rootPersonId (jesus) not found in people', () => {
    const people = [
      makePerson('adam'),
      makePerson('seth', 'adam'),
      makePerson('enosh', 'seth'),
    ];
    const spine = computeSpineIds(people);
    expect(spine.size).toBe(0);
  });
});

describe('computeMarriageBars', () => {
  it('returns connectors for married couples', () => {
    const { computeMarriageBars } = require('../../src/utils/treeBuilder');
    const partner = {
      data: { id: 'abraham', name: 'Abraham', nodeType: 'spine' },
      x: 0, y: 0, parent: null, children: [], depth: 0, isSpouse: false,
    };
    const spouse = {
      data: { id: 'sarah', name: 'Sarah', nodeType: 'satellite', spouse_of: 'abraham' },
      x: TREE_CONSTANTS.spouseXOffset, y: 0, parent: null, children: [], depth: 0, isSpouse: true,
    };
    const bars = computeMarriageBars([partner, spouse], new Set(['abraham']), null);
    expect(bars.length).toBe(1);
    expect(bars[0].partnerId).toBe('abraham');
    expect(bars[0].spouseId).toBe('sarah');
    expect(bars[0].x1).toBeLessThan(bars[0].x2);
    expect(bars[0].dimmed).toBe(false);
  });

  it('uses the new circular-node radii for bar endpoints (Card #1281)', () => {
    // Constants must match SPINE_R / SAT_R in TreeNode.tsx so the marriage
    // bar attaches to the actual circle edge (and the +/- 2 px gap defined
    // in computeMarriageBars).
    expect(TREE_CONSTANTS.spineCardHalfW).toBe(24);
    expect(TREE_CONSTANTS.satCardHalfW).toBe(18);

    const { computeMarriageBars } = require('../../src/utils/treeBuilder');
    const partner = {
      data: { id: 'abraham', name: 'Abraham', nodeType: 'spine' },
      x: 0, y: 0, parent: null, children: [], depth: 0, isSpouse: false,
    };
    const spouse = {
      data: { id: 'sarah', name: 'Sarah', nodeType: 'satellite', spouse_of: 'abraham' },
      x: TREE_CONSTANTS.spouseXOffset, y: 0, parent: null, children: [], depth: 0, isSpouse: true,
    };
    const bars = computeMarriageBars([partner, spouse], new Set(['abraham']), null);
    // Spine partner contributes spineCardHalfW (24) + 2 → x1 = 26
    expect(bars[0].x1).toBe(TREE_CONSTANTS.spineCardHalfW + 2);
    // Satellite spouse contributes satCardHalfW (18) + 2 → x2 = 88 - 18 - 2 = 68
    expect(bars[0].x2).toBe(TREE_CONSTANTS.spouseXOffset - TREE_CONSTANTS.satCardHalfW - 2);
  });
});

describe('computeFullLayout', () => {
  it('returns empty/minimal result for empty input array', () => {
    const { computeFullLayout } = require('../../src/utils/treeBuilder');
    const result = computeFullLayout([], null);
    expect(result.nodes).toEqual([]);
    expect(result.links).toEqual([]);
    expect(result.marriageBars).toEqual([]);
    expect(result.spouseConnectors).toEqual([]);
    expect(result.spineIds.size).toBe(0);
    expect(result.bounds).toBeDefined();
    expect(result.bounds.width).toBeGreaterThan(0);
    expect(result.bounds.height).toBeGreaterThan(0);
  });

  it('handles a single person with no parents or spouses', () => {
    const { computeFullLayout } = require('../../src/utils/treeBuilder');
    const people = [makePerson('adam')];
    const result = computeFullLayout(people, null);
    // adam is the root, so we get one node
    expect(result.nodes.length).toBe(1);
    expect(result.nodes[0].data.id).toBe('adam');
    expect(result.links).toEqual([]);
    expect(result.marriageBars).toEqual([]);
  });
});
