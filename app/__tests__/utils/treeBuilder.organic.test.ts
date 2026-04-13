/**
 * treeBuilder.organic.test.ts — Integration coverage for the organic
 * layout overrides added in cards #1290 and #1291: associate tribal
 * bloom clustering, Jacob's-sons arc, and important-figure spread.
 */

import { computeFullLayout } from '@/utils/treeBuilder';
import type { Person } from '@/types';

const makePerson = (overrides: Partial<Person>): Person => ({
  id: 'x',
  name: 'X',
  gender: null,
  father: null,
  mother: null,
  spouse_of: null,
  era: null,
  dates: null,
  role: null,
  type: null,
  bio: null,
  scripture_role: null,
  refs_json: null,
  chapter_link: null,
  associated_with: null,
  association_type: null,
  ...overrides,
});

describe('treeBuilder — #1290 associate tribal bloom', () => {
  it('fans associates radially around their anchor (not stacked columns)', () => {
    // Minimal tree rooted at Adam (buildHierarchy starts from 'adam').
    const people: Person[] = [
      makePerson({ id: 'adam', name: 'Adam' }),
      makePerson({ id: 'jacob_nt', name: 'Jacob', father: 'adam' }),
      makePerson({ id: 'joseph-nt', name: 'Joseph', father: 'jacob_nt' }),
      makePerson({ id: 'jesus', name: 'Jesus', father: 'joseph-nt' }),
      makePerson({ id: 'peter', name: 'Peter', associated_with: 'jesus', association_type: 'disciple' }),
      makePerson({ id: 'andrew', name: 'Andrew', associated_with: 'jesus', association_type: 'disciple' }),
      makePerson({ id: 'john', name: 'John', associated_with: 'jesus', association_type: 'disciple' }),
      makePerson({ id: 'thomas', name: 'Thomas', associated_with: 'jesus', association_type: 'disciple' }),
      makePerson({ id: 'matthew', name: 'Matthew', associated_with: 'jesus', association_type: 'disciple' }),
    ];

    const { nodes, associationLinks } = computeFullLayout(people, null);

    // All five associates should be placed and linked
    expect(associationLinks).toHaveLength(5);

    const associateIds = new Set(['peter', 'andrew', 'john', 'thomas', 'matthew']);
    const associateNodes = nodes.filter((n) => associateIds.has(n.data.id));
    expect(associateNodes).toHaveLength(5);

    // Each associate has `isAssociate: true`
    for (const n of associateNodes) {
      expect(n.data.isAssociate).toBe(true);
    }

    // Radial fan → the X values should NOT line up on a column. The old
    // stacked-column layout placed all members at column strides of 90/stride
    // away from the anchor; a bloom will produce distinct X values.
    const xs = associateNodes.map((n) => n.x);
    const ys = associateNodes.map((n) => n.y);
    const uniqueXs = new Set(xs.map((x) => Math.round(x)));
    const uniqueYs = new Set(ys.map((y) => Math.round(y)));
    expect(uniqueXs.size).toBeGreaterThan(1);
    expect(uniqueYs.size).toBeGreaterThan(1);

    // All associates must sit south of Jesus' row (radius > 0 below anchor).
    const jesusNode = nodes.find((n) => n.data.id === 'jesus')!;
    for (const n of associateNodes) {
      expect(n.y).toBeGreaterThan(jesusNode.y);
    }
  });

  it('spaces associates with enough gap for their name labels (≥ 70 px)', () => {
    // Guard against the "tight cluster" regression — large clusters must
    // scale radius so adjacent names don't overlap.
    const people: Person[] = [
      makePerson({ id: 'adam', name: 'Adam' }),
      makePerson({ id: 'jacob_nt', name: 'Jacob', father: 'adam' }),
      makePerson({ id: 'joseph-nt', name: 'Joseph', father: 'jacob_nt' }),
      makePerson({ id: 'jesus', name: 'Jesus', father: 'joseph-nt' }),
      makePerson({ id: 'peter', name: 'Peter', associated_with: 'jesus', association_type: 'disciple' }),
      makePerson({ id: 'andrew', name: 'Andrew', associated_with: 'jesus', association_type: 'disciple' }),
      makePerson({ id: 'james', name: 'James', associated_with: 'jesus', association_type: 'disciple' }),
      makePerson({ id: 'john', name: 'John', associated_with: 'jesus', association_type: 'disciple' }),
      makePerson({ id: 'thomas', name: 'Thomas', associated_with: 'jesus', association_type: 'disciple' }),
    ];
    const { nodes } = computeFullLayout(people, null);
    const ids = ['peter', 'andrew', 'james', 'john', 'thomas'];
    const placed = ids
      .map((id) => nodes.find((n) => n.data.id === id)!)
      .sort((a, b) => a.x - b.x);
    // Minimum distance between any two adjacent associate centres on the arc.
    let minGap = Infinity;
    for (let i = 1; i < placed.length; i++) {
      const dx = placed[i].x - placed[i - 1].x;
      const dy = placed[i].y - placed[i - 1].y;
      const gap = Math.hypot(dx, dy);
      if (gap < minGap) minGap = gap;
    }
    expect(minGap).toBeGreaterThanOrEqual(70);
  });
});

describe("treeBuilder — #1291 Jacob's tribal bloom", () => {
  it('arranges Jacob\u2019s sons in a visible arc (Y spans > 20 px)', () => {
    const people: Person[] = [
      makePerson({ id: 'adam', name: 'Adam' }),
      makePerson({ id: 'jacob', name: 'Jacob', father: 'adam' }),
      makePerson({ id: 'reuben', name: 'Reuben', father: 'jacob' }),
      makePerson({ id: 'simeon', name: 'Simeon', father: 'jacob' }),
      makePerson({ id: 'levi', name: 'Levi', father: 'jacob' }),
      makePerson({ id: 'judah', name: 'Judah', father: 'jacob' }),
      makePerson({ id: 'issachar', name: 'Issachar', father: 'jacob' }),
      makePerson({ id: 'zebulun', name: 'Zebulun', father: 'jacob' }),
      // jesus path so the tree has a spine and Jacob is a real parent
      makePerson({ id: 'perez', name: 'Perez', father: 'judah' }),
      makePerson({ id: 'jesus', name: 'Jesus', father: 'perez' }),
    ];

    const { nodes } = computeFullLayout(people, null);
    const sonIds = ['reuben', 'simeon', 'levi', 'judah', 'issachar', 'zebulun'];
    const sons = nodes.filter((n) => sonIds.includes(n.data.id));
    expect(sons).toHaveLength(6);

    const sonYs = sons.map((n) => n.y);
    const ySpan = Math.max(...sonYs) - Math.min(...sonYs);
    // Under the old d3 layout all sons shared one Y; the bloom arc makes
    // them vary — middle sons drop further than edge sons.
    expect(ySpan).toBeGreaterThan(20);

    // Sons should be beneath Jacob.
    const jacob = nodes.find((n) => n.data.id === 'jacob')!;
    for (const s of sons) {
      expect(s.y).toBeGreaterThan(jacob.y);
    }
  });

  it('gives 12 sons a wide-enough X span for readable names (≥ 600 px)', () => {
    // 12 spine circles with patriarch names ("Issachar", "Zebulun",
    // "Benjamin" …) need a lot of horizontal room to avoid overlapping.
    const sonIds = [
      'reuben', 'simeon', 'levi', 'judah-s', 'dan', 'naphtali',
      'gad', 'asher', 'issachar', 'zebulun', 'joseph-s', 'benjamin',
    ];
    const people: Person[] = [
      makePerson({ id: 'adam', name: 'Adam' }),
      makePerson({ id: 'jacob', name: 'Jacob', father: 'adam' }),
      ...sonIds.map((id) => makePerson({ id, name: id, father: 'jacob' })),
      // minimal spine path so the tree has a Jesus
      makePerson({ id: 'perez', name: 'Perez', father: 'judah-s' }),
      makePerson({ id: 'jesus', name: 'Jesus', father: 'perez' }),
    ];
    const { nodes } = computeFullLayout(people, null);
    const placed = sonIds
      .map((id) => nodes.find((n) => n.data.id === id))
      .filter((n): n is NonNullable<typeof n> => Boolean(n));
    expect(placed).toHaveLength(12);
    const xs = placed.map((n) => n.x);
    const span = Math.max(...xs) - Math.min(...xs);
    expect(span).toBeGreaterThanOrEqual(600);
  });
});
