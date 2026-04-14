import React from 'react';

jest.mock('react-native-svg', () => {
  return {
    Svg: 'Svg', G: 'G', Line: 'Line', Path: 'Path', Rect: 'Rect', Text: 'Text', Circle: 'Circle',
    Defs: 'Defs', RadialGradient: 'RadialGradient', Stop: 'Stop', Pattern: 'Pattern',
    LinearGradient: 'LinearGradient',
  };
});

jest.mock('@/components/tree/TreeNode', () => ({
  TreeNode: 'TreeNode',
}));

jest.mock('@/components/tree/TreeLink', () => ({
  TreeLink: 'TreeLink',
}));

jest.mock('@/components/tree/MarriageBarSvg', () => ({
  MarriageBarSvg: 'MarriageBarSvg',
}));

jest.mock('@/components/tree/SpouseConnectorSvg', () => ({
  SpouseConnectorSvg: 'SpouseConnectorSvg',
}));

import { renderWithProviders } from '../helpers/renderWithProviders';
import { TreeCanvas } from '@/components/tree/TreeCanvas';
import type {
  TreeLink as TreeLinkType, MarriageBar, SpouseConnector, AssociationLink,
} from '@/utils/treeBuilder';
import type { VisibleLayoutNode } from '@/hooks/useVisibleNodes';

const makeNode = (id: string, era: string = 'creation'): VisibleLayoutNode => ({
  data: {
    id,
    name: id.charAt(0).toUpperCase() + id.slice(1),
    gender: 'male',
    father: null,
    mother: null,
    spouse_of: null,
    era,
    dates: null,
    role: null,
    type: 'spine',
    bio: null,
    scripture_role: null,
    refs_json: null,
    chapter_link: null,
    associated_with: null,
    association_type: null,
    nodeType: 'spine',
  },
  x: 100,
  y: 100,
  parent: null,
  children: [],
  depth: 0,
  isSpouse: false,
  tier: 1,
  isEntering: false,
});

const makeLink = (sourceId = 'a', targetId = 'b', sourceEra: string | null = null, targetEra: string | null = null): TreeLinkType => ({
  sourceId,
  targetId,
  sourceEra,
  targetEra,
  source: { x: 100, y: 50 },
  target: { x: 100, y: 200 },
  isSpine: true,
  isMessianic: false,
});

describe('TreeCanvas', () => {
  beforeEach(() => jest.clearAllMocks());

  const defaultProps = {
    nodes: [] as VisibleLayoutNode[],
    links: [] as TreeLinkType[],
    marriageBars: [] as MarriageBar[],
    spouseConnectors: [] as SpouseConnector[],
    filterEra: null,
    spineIds: new Set<string>(),
    selectedPersonId: null,
    onNodePress: jest.fn(),
  };

  it('renders without crashing with empty data', () => {
    const tree = renderWithProviders(<TreeCanvas {...defaultProps} />);
    expect(tree.toJSON()).toBeTruthy();
  });

  it('renders a TreeNode for each node in the layout', () => {
    const nodes = [makeNode('adam'), makeNode('seth'), makeNode('enosh')];
    const tree = renderWithProviders(
      <TreeCanvas {...defaultProps} nodes={nodes} />,
    );
    const json = tree.toJSON() as any;
    const treeNodes = findAllByType(json, 'TreeNode');
    expect(treeNodes).toHaveLength(3);
  });

  it('renders TreeLink elements for given links', () => {
    const links = [makeLink('a', 'b'), makeLink('c', 'd')];
    const tree = renderWithProviders(
      <TreeCanvas {...defaultProps} links={links} />,
    );
    const json = tree.toJSON() as any;
    const treeLinks = findAllByType(json, 'TreeLink');
    expect(treeLinks).toHaveLength(2);
  });

  it('dims nodes that do not match filterEra and are not spine', () => {
    const spineIds = new Set(['adam']);
    const nodes = [
      makeNode('adam', 'creation'),
      makeNode('hagar', 'patriarchs'),
    ];
    const tree = renderWithProviders(
      <TreeCanvas
        {...defaultProps}
        nodes={nodes}
        spineIds={spineIds}
        filterEra="creation"
      />,
    );
    const json = tree.toJSON() as any;
    const treeNodes = findAllByType(json, 'TreeNode');
    const hagarNode = treeNodes.find((n: any) => n.props?.node?.data?.id === 'hagar');
    expect(hagarNode?.props?.dimmed).toBe(true);
    const adamNode = treeNodes.find((n: any) => n.props?.node?.data?.id === 'adam');
    expect(adamNode?.props?.dimmed).toBe(false);
  });

  it('dims non-spine links whose source and target eras do not match the filter', () => {
    const spineIds = new Set<string>();
    const links = [
      makeLink('a', 'b', 'creation', 'creation'),   // matches filter
      makeLink('c', 'd', 'patriarchs', 'patriarchs'), // does not match
    ];
    const tree = renderWithProviders(
      <TreeCanvas
        {...defaultProps}
        links={links}
        spineIds={spineIds}
        filterEra="creation"
      />,
    );
    const json = tree.toJSON() as any;
    const rendered = findAllByType(json, 'TreeLink');
    expect(rendered).toHaveLength(2);
    // The TreeLink for the mismatched pair is dimmed.
    const dimmedCount = rendered.filter((l: any) => l.props?.dimmed === true).length;
    expect(dimmedCount).toBe(1);
  });

  // ── Associate clusters + zoom collapse ─────────────────────────────

  const makeAssocLink = (anchorId: string, memberId: string, i = 0): AssociationLink => ({
    anchorId, memberId,
    source: { x: 100, y: 100 },
    target: { x: 100 + i * 20, y: 180 + i * 10 },
    type: 'disciple',
  });

  it('consolidates association links into a single Path when clusters are expanded', () => {
    const links = [
      makeAssocLink('jesus', 'peter', 0),
      makeAssocLink('jesus', 'andrew', 1),
      makeAssocLink('jesus', 'john', 2),
    ];
    const tree = renderWithProviders(
      <TreeCanvas {...defaultProps} associationLinks={links} zoom={1.0} />,
    );
    const json = tree.toJSON() as any;
    const paths = findAllByType(json, 'Path');
    const assocPath = paths.find((p: any) =>
      p.props?.strokeDasharray === '4,4' && p.props?.opacity === 0.55,
    );
    expect(assocPath).toBeTruthy();
    const mCount = (assocPath.props?.d?.match(/M /g) ?? []).length;
    expect(mCount).toBe(3);
  });

  it('collapses association Path to opacity 0 below the tier-3 zoom threshold', () => {
    const links = [
      makeAssocLink('jesus', 'peter', 0),
      makeAssocLink('jesus', 'andrew', 1),
      makeAssocLink('jesus', 'john', 2),
    ];
    const tree = renderWithProviders(
      <TreeCanvas {...defaultProps} associationLinks={links} zoom={0.3} />,
    );
    const json = tree.toJSON() as any;
    const paths = findAllByType(json, 'Path');
    const assocPath = paths.find((p: any) => p.props?.strokeDasharray === '4,4');
    expect(assocPath).toBeTruthy();
    expect(assocPath.props?.opacity).toBe(0);
    // Collapsed badge "+N" text is rendered.
    const texts = findAllByType(json, 'Text');
    const badgeText = texts.find((t: any) => {
      if (!t.children) return false;
      const text = Array.isArray(t.children) ? t.children.join('') : String(t.children);
      return text.includes('+3');
    });
    expect(badgeText).toBeTruthy();
  });

  it('declares the messianic-node-fill radial gradient', () => {
    const tree = renderWithProviders(<TreeCanvas {...defaultProps} />);
    const json = tree.toJSON() as any;
    const gradients = findAllByType(json, 'RadialGradient');
    const messianic = gradients.find((g: any) => g.props?.id === 'messianic-node-fill');
    expect(messianic).toBeTruthy();
    const stops = findAllByType(messianic, 'Stop');
    expect(stops.length).toBe(2);
    expect(stops[0].props?.stopColor).toBe('#bfa050');
    expect(stops[0].props?.stopOpacity).toBe(0.25);
    expect(stops[1].props?.stopOpacity).toBe(0.08);
  });
});

/** Recursively find all elements with a given type in a rendered JSON tree. */
function findAllByType(node: any, type: string): any[] {
  const results: any[] = [];
  if (!node) return results;
  if (node.type === type) results.push(node);
  if (Array.isArray(node.children)) {
    for (const child of node.children) {
      results.push(...findAllByType(child, type));
    }
  }
  if (Array.isArray(node)) {
    for (const item of node) {
      results.push(...findAllByType(item, type));
    }
  }
  return results;
}
