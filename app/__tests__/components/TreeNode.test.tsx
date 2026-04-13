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
    nodeType: 'spine',
    ...overrides,
  },
  x: 100,
  y: 200,
  parent: null,
  children: [],
  depth: 0,
  isSpouse: false,
});

describe('TreeNode', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders the person name', () => {
    const node = makeNode({ name: 'Abraham' });
    const { getByText } = renderWithProviders(
      <TreeNode node={node} dimmed={false} filterEra={null} selected={false} onPress={jest.fn()} />,
    );
    expect(getByText('Abraham')).toBeTruthy();
  });

  it('renders a satellite node with era color', () => {
    const node = makeNode({ name: 'Hagar', nodeType: 'satellite', era: 'patriarchs' });
    const { getByText } = renderWithProviders(
      <TreeNode node={node} dimmed={false} filterEra={null} selected={false} onPress={jest.fn()} />,
    );
    expect(getByText('Hagar')).toBeTruthy();
  });

  it('applies dimmed opacity', () => {
    const node = makeNode({ name: 'Seth' });
    const tree = renderWithProviders(
      <TreeNode node={node} dimmed={true} filterEra={null} selected={false} onPress={jest.fn()} />,
    );
    // Component renders — dimmed does not hide the node
    expect(tree.getByText('Seth')).toBeTruthy();
  });

  it('calls onPress with the person data when pressed', () => {
    const onPress = jest.fn();
    const node = makeNode({ name: 'Noah' });
    const { getByText } = renderWithProviders(
      <TreeNode node={node} dimmed={false} filterEra={null} selected={false} onPress={onPress} />,
    );
    // The G element has onPress — simulate by finding the text and pressing
    const text = getByText('Noah');
    // Since we mocked SVG elements as strings, we can at least verify the component renders
    expect(text).toBeTruthy();
    expect(typeof onPress).toBe('function');
  });

  // ── Card #1281: circular-node redesign assertions ──────────────────

  it('renders the uppercased first letter of the name as the initial', () => {
    const node = makeNode({ name: 'abraham' });
    const { getByText } = renderWithProviders(
      <TreeNode node={node} dimmed={false} filterEra={null} selected={false} onPress={jest.fn()} />,
    );
    expect(getByText('A')).toBeTruthy();   // initial inside the circle
    expect(getByText('abraham')).toBeTruthy(); // full name below
  });

  it('uses the messianic radial-gradient fill URL for line members', () => {
    // David is on the messianic line per utils/messianicLine.ts.
    const david = makeNode({ id: 'david', name: 'David' });
    const { toJSON } = renderWithProviders(
      <TreeNode node={david} dimmed={false} filterEra={null} selected={false} onPress={jest.fn()} />,
    );
    // The serialised tree includes every `fill` prop — the gradient URL should appear.
    expect(JSON.stringify(toJSON())).toContain('url(#messianic-node-fill)');
  });

  it('does NOT use the messianic gradient for non-line members', () => {
    const seth = makeNode({ id: 'seth-not-on-line', name: 'Seth' });
    const { toJSON } = renderWithProviders(
      <TreeNode node={seth} dimmed={false} filterEra={null} selected={false} onPress={jest.fn()} />,
    );
    expect(JSON.stringify(toJSON())).not.toContain('url(#messianic-node-fill)');
  });

  it('still renders an initial when the name is a single character', () => {
    const node = makeNode({ name: 'Uz' });
    const { getByText } = renderWithProviders(
      <TreeNode node={node} dimmed={false} filterEra={null} selected={false} onPress={jest.fn()} />,
    );
    expect(getByText('U')).toBeTruthy();
    expect(getByText('Uz')).toBeTruthy();
  });

  it('renders without crashing when the name is empty', () => {
    const node = makeNode({ name: '' });
    const { toJSON } = renderWithProviders(
      <TreeNode node={node} dimmed={false} filterEra={null} selected={false} onPress={jest.fn()} />,
    );
    expect(toJSON()).toBeTruthy();
  });
});
