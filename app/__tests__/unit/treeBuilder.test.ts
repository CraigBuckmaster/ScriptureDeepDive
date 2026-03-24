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
});
