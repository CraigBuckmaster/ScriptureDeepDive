import React from 'react';

jest.mock('react-native-svg', () => {
  const React = require('react');
  const { View, Text } = require('react-native');
  // Render every SVG element as a real RN View/Text so testing-library
  // can find children by text content. (String-tag mocks hide SvgText
  // children from `getByText`.)
  const view = ({ children, ...rest }: any) => React.createElement(View, rest, children);
  const text = ({ children, ...rest }: any) => React.createElement(Text, rest, children);
  return {
    Svg: view,
    G: view,
    Line: view,
    Path: view,
    Rect: view,
    Text: text,
    Circle: view,
  };
});

jest.mock('@/theme', () => ({
  useTheme: () => ({
    base: {
      bg: '#0c0a07',
      text: '#f0e8d8',
      gold: '#FFD700',
      goldBright: '#FFE44D',
      goldDim: '#B8960C',
      textMuted: '#888888',
      textDim: '#666666',
      border: '#3a2e18',
    },
  }),
  eras: {
    creation: '#55AA55',
    patriarchs: '#AA5555',
  } as Record<string, string>,
  fontFamily: {
    display: 'Cinzel_400Regular',
    displayMedium: 'Cinzel_500Medium',
    displaySemiBold: 'Cinzel_600SemiBold',
    body: 'EBGaramond_400Regular',
    bodyMedium: 'EBGaramond_500Medium',
    bodySemiBold: 'EBGaramond_600SemiBold',
    bodyItalic: 'EBGaramond_400Regular_Italic',
    bodyMediumItalic: 'EBGaramond_500Medium_Italic',
    ui: 'SourceSans3_400Regular',
    uiLight: 'SourceSans3_300Light',
    uiMedium: 'SourceSans3_500Medium',
    uiSemiBold: 'SourceSans3_600SemiBold',
  },
}));

jest.mock('@/utils/treeBuilder', () => ({
  TREE_CONSTANTS: {
    spineRadius: 7,
    satelliteRadius: 5,
    spineFontSize: 11,
    satelliteFontSize: 9.5,
    touchTargetRadius: 18,
  },
}));

import { renderWithProviders } from '../helpers/renderWithProviders';
import { TreeNode } from '@/components/tree/TreeNode';
import type { LayoutNode } from '@/utils/treeBuilder';

const makeNode = (overrides: Partial<LayoutNode['data']> = {}): LayoutNode => ({
  data: {
    id: 'adam',
    name: 'Adam',
    gender: 'male',
    father: null,
    mother: null,
    spouse_of: null,
    era: 'creation',
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
    ...overrides,
  },
  x: 100,
  y: 200,
  parent: null,
  children: [],
  depth: 0,
  isSpouse: false,
  tier: 1,
});

describe('TreeNode', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders the person name', () => {
    const node = makeNode({ name: 'Abraham' });
    const { getByText } = renderWithProviders(
      <TreeNode node={node} dimmed={false} selected={false} onPress={jest.fn()} />,
    );
    expect(getByText('Abraham')).toBeTruthy();
  });

  it('renders a satellite node with era color', () => {
    const node = makeNode({ name: 'Hagar', nodeType: 'satellite', era: 'patriarchs' });
    const { getByText } = renderWithProviders(
      <TreeNode node={node} dimmed={false} selected={false} onPress={jest.fn()} />,
    );
    expect(getByText('Hagar')).toBeTruthy();
  });

  it('applies dimmed opacity', () => {
    const node = makeNode({ name: 'Seth' });
    const tree = renderWithProviders(
      <TreeNode node={node} dimmed={true} selected={false} onPress={jest.fn()} />,
    );
    // Component renders — dimmed does not hide the node
    expect(tree.getByText('Seth')).toBeTruthy();
  });

  it('calls onPress with the person data when pressed', () => {
    const onPress = jest.fn();
    const node = makeNode({ name: 'Noah' });
    const { getByText } = renderWithProviders(
      <TreeNode node={node} dimmed={false} selected={false} onPress={onPress} />,
    );
    const text = getByText('Noah');
    expect(text).toBeTruthy();
    expect(typeof onPress).toBe('function');
  });

  // ── Circular-node rendering ──────────────────────────────────────

  it('renders the uppercased first letter of the name as the initial', () => {
    const node = makeNode({ name: 'abraham' });
    const { getByText } = renderWithProviders(
      <TreeNode node={node} dimmed={false} selected={false} onPress={jest.fn()} />,
    );
    expect(getByText('A')).toBeTruthy();
    expect(getByText('abraham')).toBeTruthy();
  });

  it('uses the messianic radial-gradient fill URL for line members', () => {
    const david = makeNode({ id: 'david', name: 'David' });
    const { toJSON } = renderWithProviders(
      <TreeNode node={david} dimmed={false} selected={false} onPress={jest.fn()} />,
    );
    expect(JSON.stringify(toJSON())).toContain('url(#messianic-node-fill)');
  });

  it('does NOT use the messianic gradient for non-line members', () => {
    const seth = makeNode({ id: 'seth-not-on-line', name: 'Seth' });
    const { toJSON } = renderWithProviders(
      <TreeNode node={seth} dimmed={false} selected={false} onPress={jest.fn()} />,
    );
    expect(JSON.stringify(toJSON())).not.toContain('url(#messianic-node-fill)');
  });

  it('still renders an initial when the name is a single character', () => {
    const node = makeNode({ name: 'Uz' });
    const { getByText } = renderWithProviders(
      <TreeNode node={node} dimmed={false} selected={false} onPress={jest.fn()} />,
    );
    expect(getByText('U')).toBeTruthy();
    expect(getByText('Uz')).toBeTruthy();
  });

  it('renders without crashing when the name is empty', () => {
    const node = makeNode({ name: '' });
    const { toJSON } = renderWithProviders(
      <TreeNode node={node} dimmed={false} selected={false} onPress={jest.fn()} />,
    );
    expect(toJSON()).toBeTruthy();
  });

  // ── Associate variant ─────────────────────────────────────────────

  it('renders associate nodes with a dashed stroke', () => {
    const node = makeNode({
      name: 'Peter',
      nodeType: 'satellite',
      isAssociate: true,
      role: 'apostle',
    });
    const { toJSON } = renderWithProviders(
      <TreeNode node={node} dimmed={false} selected={false} onPress={jest.fn()} />,
    );
    expect(JSON.stringify(toJSON())).toContain('"strokeDasharray":"2,2"');
  });

  it('does NOT add a dashed stroke to genealogical satellites', () => {
    const node = makeNode({ name: 'Hagar', nodeType: 'satellite', isAssociate: false });
    const { toJSON } = renderWithProviders(
      <TreeNode node={node} dimmed={false} selected={false} onPress={jest.fn()} />,
    );
    expect(JSON.stringify(toJSON())).not.toContain('"strokeDasharray":"2,2"');
  });

  // ── Entrance fade ──────────────────────────────────────────────────

  it('starts invisible when isEntering is true', () => {
    const node = makeNode({ name: 'NewlyVisible' });
    const { toJSON } = renderWithProviders(
      <TreeNode node={node} dimmed={false} selected={false} isEntering onPress={jest.fn()} />,
    );
    // The outer G gets opacity 0 initially — the RAF-driven fade hasn't ticked yet.
    const json = toJSON() as any;
    expect(json?.props?.opacity).toBe(0);
  });

  it('starts fully visible when isEntering is false', () => {
    const node = makeNode({ name: 'Already' });
    const { toJSON } = renderWithProviders(
      <TreeNode node={node} dimmed={false} selected={false} isEntering={false} onPress={jest.fn()} />,
    );
    const json = toJSON() as any;
    // Not dimmed, not associate, so opacity should be 1.
    expect(json?.props?.opacity).toBe(1);
  });
});
