import React from 'react';

jest.mock('react-native-svg', () => {
  const React = require('react');
  return { Svg: 'Svg', G: 'G', Line: 'Line', Path: 'Path', Rect: 'Rect', Text: 'Text', Circle: 'Circle' };
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
import type { LayoutNode, TreeLink as TreeLinkType, MarriageBar, SpouseConnector, TreePerson } from '@/utils/treeBuilder';

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
    expect(json.props?.transform).toBe('translate(50, 75)');
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
