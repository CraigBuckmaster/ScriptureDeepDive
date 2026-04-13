import React from 'react';

jest.mock('react-native-svg', () => {
  const React = require('react');
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

jest.mock('@/components/tree/AssociationLinkSvg', () => ({
  AssociationLinkSvg: 'AssociationLinkSvg',
}));

import { renderWithProviders } from '../helpers/renderWithProviders';
import { TreeCanvas } from '@/components/tree/TreeCanvas';
import type { LayoutNode, TreeLink as TreeLinkType, MarriageBar, SpouseConnector, TreePerson, AssociationLink } from '@/utils/treeBuilder';

const makeNode = (id: string, era: string = 'creation'): LayoutNode => ({
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
});

const makeLink = (): TreeLinkType => ({
  source: { x: 100, y: 50 },
  target: { x: 100, y: 200 },
  isSpine: true,
  isMessianic: false,
  dimmed: false,
});

describe('TreeCanvas', () => {
  beforeEach(() => jest.clearAllMocks());

  const defaultProps = {
    nodes: [] as LayoutNode[],
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
    // The G wrapper should contain children including 3 TreeNode mocks
    const treeNodes = findAllByType(json, 'TreeNode');
    expect(treeNodes).toHaveLength(3);
  });

  it('renders TreeLink elements for given links', () => {
    const links = [makeLink(), makeLink()];
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
    // adam matches era → dimmed=false; hagar does not match but is not in spine → dimmed=true
    const hagarNode = treeNodes.find((n: any) => n.props?.node?.data?.id === 'hagar');
    expect(hagarNode?.props?.dimmed).toBe(true);
    const adamNode = treeNodes.find((n: any) => n.props?.node?.data?.id === 'adam');
    expect(adamNode?.props?.dimmed).toBe(false);
  });

  it('applies offset transform', () => {
    const tree = renderWithProviders(
      <TreeCanvas {...defaultProps} offsetX={50} offsetY={75} />,
    );
    const json = tree.toJSON() as any;
    // TreeCanvas renders Fragment children: [Defs, Rect, Rect, G(transform)]
    const children = Array.isArray(json) ? json : [json];
    const gWithTransform = children.find((c: any) => c?.props?.transform);
    expect(gWithTransform?.props?.transform).toBe('translate(50, 75)');
  });

  // ── Card #1290 + #1291: associate clusters + zoom collapse ─────────

  const makeAssocLink = (anchorId: string, memberId: string, i = 0): AssociationLink => ({
    anchorId, memberId,
    source: { x: 100, y: 100 },
    target: { x: 100 + i * 20, y: 180 + i * 10 },
    type: 'disciple',
  });

  it('consolidates association links into a single Path at normal zoom', () => {
    // Post-constant-canvas-render refactor: all 89+ dashed connectors
    // share a single <Path> with a multi-M `d` attribute, so zoom
    // transitions never mount new native views.
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
    // Should contain three 'M' moveto commands in the `d` attribute.
    const mCount = (assocPath.props?.d?.match(/M /g) ?? []).length;
    expect(mCount).toBe(3);
  });

  it('fades the consolidated association-link Path to opacity 0 when clusters collapsed', () => {
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
    // Badge group still rendered; visible-opacity at 0.85, zero-opacity
    // when uncollapsed — post-refactor the badge always mounts.
    const texts = findAllByType(json, 'Text');
    const badgeText = texts.find((t: any) => t.children?.join?.('') === '+3' || (t.children?.[1] === 3));
    expect(badgeText).toBeTruthy();
  });

  it('always renders associate TreeNodes and forwards clustersCollapsed', () => {
    // Associate nodes are no longer null-skipped when clusters collapse;
    // they mount at initial render and use opacity inside TreeNode to hide.
    const peter = makeNode('peter');
    peter.data.isAssociate = true;
    const jesus = makeNode('jesus');
    const tree = renderWithProviders(
      <TreeCanvas
        {...defaultProps}
        nodes={[jesus, peter]}
        associationLinks={[makeAssocLink('jesus', 'peter', 0)]}
        zoom={0.3}
      />,
    );
    const json = tree.toJSON() as any;
    const treeNodes = findAllByType(json, 'TreeNode');
    const ids = treeNodes.map((n: any) => n.props?.node?.data?.id);
    expect(ids).toContain('jesus');
    expect(ids).toContain('peter');
    // Both receive clustersCollapsed=true; TreeNode applies opacity=0
    // to the associate while leaving jesus visible.
    for (const n of treeNodes) {
      expect(n.props?.clustersCollapsed).toBe(true);
    }
  });

  it('forwards zoom to each TreeNode', () => {
    const nodes = [makeNode('adam'), makeNode('seth')];
    const tree = renderWithProviders(
      <TreeCanvas {...defaultProps} nodes={nodes} zoom={0.7} />,
    );
    const json = tree.toJSON() as any;
    const treeNodes = findAllByType(json, 'TreeNode');
    for (const n of treeNodes) {
      expect(n.props?.zoom).toBe(0.7);
    }
  });

  it('declares the messianic-node-fill radial gradient (Card #1281)', () => {
    const tree = renderWithProviders(<TreeCanvas {...defaultProps} />);
    const json = tree.toJSON() as any;
    const gradients = findAllByType(json, 'RadialGradient');
    const messianic = gradients.find((g: any) => g.props?.id === 'messianic-node-fill');
    expect(messianic).toBeTruthy();
    // Stops should reference the gold token from the theme.
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
