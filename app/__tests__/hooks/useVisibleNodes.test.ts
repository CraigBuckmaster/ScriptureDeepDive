import { renderHook } from '@testing-library/react-native';
import { useVisibleNodes } from '@/hooks/useVisibleNodes';
import type {
  LayoutNode, TreeLink, MarriageBar, SpouseConnector,
  AssociationLink, AssociateBloomLabel, AssociateTrail,
} from '@/utils/treeBuilder';

const makeNode = (id: string, x: number, y: number, tier: 1 | 2 | 3 | 4): LayoutNode => ({
  data: {
    id,
    name: id,
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
    nodeType: 'satellite',
  },
  x,
  y,
  parent: null,
  children: [],
  depth: 0,
  isSpouse: false,
  tier,
});

const SCREEN_W = 400;
const SCREEN_H = 800;

describe('useVisibleNodes', () => {
  it('filters out nodes whose tier is above the current zoom threshold', () => {
    const nodes = [
      makeNode('spine', 0, 0, 1),
      makeNode('biological', 10, 10, 2),
      makeNode('bio-holder', 20, 20, 3),
      makeNode('minor', 30, 30, 4),
    ];
    const spineIds = new Set(['spine']);
    const { result } = renderHook(() =>
      useVisibleNodes(
        nodes, [], [], [], [], [], [],
        { x: -100, y: -100, zoom: 0.2 }, // below any tier-2 threshold
        SCREEN_W, SCREEN_H, spineIds,
      ),
    );
    const ids = result.current.nodes.map((n) => n.data.id);
    expect(ids).toEqual(['spine']);
  });

  it('always includes spine members even when off screen', () => {
    const spineNode = makeNode('spine', 10_000, 10_000, 1);
    const localNode = makeNode('local', 50, 50, 2);
    const spineIds = new Set(['spine']);
    const { result } = renderHook(() =>
      useVisibleNodes(
        [spineNode, localNode], [], [], [], [], [], [],
        { x: 0, y: 0, zoom: 1 },
        SCREEN_W, SCREEN_H, spineIds,
      ),
    );
    const ids = result.current.nodes.map((n) => n.data.id);
    expect(ids).toContain('spine');
    expect(ids).toContain('local');
  });

  it('culls nodes that sit outside the viewport (plus margin)', () => {
    const inside = makeNode('inside', 100, 100, 2);
    const outside = makeNode('outside', 5_000, 5_000, 2);
    const { result } = renderHook(() =>
      useVisibleNodes(
        [inside, outside], [], [], [], [], [], [],
        { x: 0, y: 0, zoom: 1 },
        SCREEN_W, SCREEN_H, new Set(),
      ),
    );
    const ids = result.current.nodes.map((n) => n.data.id);
    expect(ids).toContain('inside');
    expect(ids).not.toContain('outside');
  });

  it('promotes anchors whose bloom associates are visible', () => {
    // anchor is far off-screen (would otherwise be culled), member is in view.
    const anchor = makeNode('jesus', 10_000, 10_000, 2);
    const member = makeNode('peter', 100, 100, 3);
    const link: AssociationLink = {
      anchorId: 'jesus',
      memberId: 'peter',
      source: { x: 10_000, y: 10_000 },
      target: { x: 100, y: 100 },
      type: 'disciple',
    };
    const { result } = renderHook(() =>
      useVisibleNodes(
        [anchor, member], [], [], [], [link], [], [],
        { x: 0, y: 0, zoom: 1 },
        SCREEN_W, SCREEN_H, new Set(),
      ),
    );
    const ids = result.current.nodes.map((n) => n.data.id);
    expect(ids).toContain('peter');
    expect(ids).toContain('jesus');
    expect(result.current.associationLinks).toHaveLength(1);
  });

  it('keeps spine-to-spine links regardless of viewport', () => {
    const spineIds = new Set(['a', 'b']);
    const link: TreeLink = {
      sourceId: 'a', targetId: 'b',
      sourceEra: null, targetEra: null,
      source: { x: 10_000, y: 10_000 },
      target: { x: 10_100, y: 10_100 },
      isSpine: true,
      isMessianic: true,
    };
    const { result } = renderHook(() =>
      useVisibleNodes(
        [makeNode('a', 10_000, 10_000, 1), makeNode('b', 10_100, 10_100, 1)],
        [link], [], [], [], [], [],
        { x: 0, y: 0, zoom: 1 },
        SCREEN_W, SCREEN_H, spineIds,
      ),
    );
    expect(result.current.links).toHaveLength(1);
  });

  it('flags newly-visible nodes as entering on the first frame', () => {
    const nodes = [makeNode('a', 100, 100, 2), makeNode('b', 200, 200, 2)];
    const { result } = renderHook(() =>
      useVisibleNodes(
        nodes, [], [], [], [], [], [],
        { x: 0, y: 0, zoom: 1 },
        SCREEN_W, SCREEN_H, new Set(),
      ),
    );
    const entering = result.current.nodes.filter((n) => n.isEntering);
    expect(entering).toHaveLength(2);
  });

  it('keeps marriage bars whose partner or spouse is visible', () => {
    const partner = makeNode('abraham', 100, 100, 2);
    const spouse = makeNode('sarah', 200, 100, 2);
    spouse.isSpouse = true;
    const bar: MarriageBar = {
      partnerId: 'abraham', spouseId: 'sarah',
      x1: 100, x2: 200, y: 100, midX: 150,
    };
    const { result } = renderHook(() =>
      useVisibleNodes(
        [partner, spouse], [], [bar], [], [], [], [],
        { x: 0, y: 0, zoom: 1 },
        SCREEN_W, SCREEN_H, new Set(),
      ),
    );
    expect(result.current.marriageBars).toHaveLength(1);
  });

  it('suppresses spouse connectors whose partner is not visible', () => {
    const conn: SpouseConnector = {
      partnerId: 'jacob', x: 5000, yTop: 5000, yBottom: 5100,
    };
    const { result } = renderHook(() =>
      useVisibleNodes(
        [], [], [], [conn], [], [], [],
        { x: 0, y: 0, zoom: 1 },
        SCREEN_W, SCREEN_H, new Set(),
      ),
    );
    expect(result.current.spouseConnectors).toHaveLength(0);
  });

  it('forwards bloom labels and trails only when the anchor is visible', () => {
    const anchor = makeNode('jesus', 100, 100, 2);
    const label: AssociateBloomLabel = {
      anchorId: 'jesus', type: 'disciple', text: 'disciples', x: 100, y: 200,
    };
    const trail: AssociateTrail = {
      anchorId: 'jesus', source: { x: 100, y: 100 }, target: { x: 100, y: 250 },
    };
    const { result } = renderHook(() =>
      useVisibleNodes(
        [anchor], [], [], [], [], [label], [trail],
        { x: 0, y: 0, zoom: 1 },
        SCREEN_W, SCREEN_H, new Set(),
      ),
    );
    expect(result.current.associateBloomLabels).toHaveLength(1);
    expect(result.current.associateTrails).toHaveLength(1);
  });
});
