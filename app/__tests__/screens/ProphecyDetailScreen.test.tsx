import React from 'react';
import { renderWithProviders } from '../helpers/renderWithProviders';
import ProphecyDetailScreen from '@/screens/ProphecyDetailScreen';

// ── Override useRoute to supply params ───────────────────────────
jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');
  return {
    ...actual,
    useNavigation: () => ({ navigate: jest.fn(), goBack: jest.fn(), push: jest.fn(), setOptions: jest.fn() }),
    useRoute: () => ({ params: { chainId: 'chain-1' }, key: 'ProphecyDetail-1', name: 'ProphecyDetail' }),
    useScrollToTop: jest.fn(),
    useFocusEffect: (cb: () => void) => cb(),
  };
});

// ── Mock child components ────────────────────────────────────────
jest.mock('@/components/ScreenHeader', () => ({
  ScreenHeader: ({ title }: { title: string }) => {
    const React = require('react');
    const { Text } = require('react-native');
    return React.createElement(Text, {}, title);
  },
}));

jest.mock('@/components/BadgeChip', () => ({
  BadgeChip: ({ label }: { label: string }) => {
    const React = require('react');
    const { Text } = require('react-native');
    return React.createElement(Text, {}, label);
  },
}));

jest.mock('@/components/LoadingSkeleton', () => ({
  LoadingSkeleton: () => {
    const React = require('react');
    const { Text } = require('react-native');
    return React.createElement(Text, {}, 'Loading...');
  },
}));

// ── Mock hook ────────────────────────────────────────────────────
const mockUseProphecyChainDetail = jest.fn();
jest.mock('@/hooks/useProphecyChains', () => ({
  useProphecyChainDetail: (...args: unknown[]) => mockUseProphecyChainDetail(...args),
}));

const sampleChain = {
  id: 'chain-1',
  title: 'The Suffering Servant',
  category: 'messianic',
  chain_type: 'direct_fulfillment',
  summary: 'Traces the Servant motif from Isaiah through its fulfillment in Jesus.',
  tags_json: '["messianic","servant","isaiah"]',
  links_json: JSON.stringify([
    {
      book_dir: 'isaiah',
      chapter_num: 53,
      verse_ref: '53:1-12',
      label: 'The Suffering Servant Song',
      role: 'prophecy',
      summary: 'Isaiah describes a servant who bears the sins of many.',
    },
    {
      book_dir: 'matthew',
      chapter_num: 8,
      verse_ref: '8:17',
      label: 'Fulfillment citation',
      role: 'fulfillment',
      summary: 'Matthew applies Isaiah 53 to Jesus healing ministry.',
    },
  ]),
};

beforeEach(() => {
  jest.clearAllMocks();
  mockUseProphecyChainDetail.mockReturnValue({
    chain: sampleChain,
    isLoading: false,
  });
});

describe('ProphecyDetailScreen', () => {
  it('renders chain title and summary', () => {
    const { getByText } = renderWithProviders(<ProphecyDetailScreen />);
    expect(getByText('The Suffering Servant')).toBeTruthy();
    expect(getByText(/Traces the Servant motif/)).toBeTruthy();
  });

  it('shows fulfillment chain links', () => {
    const { getByText } = renderWithProviders(<ProphecyDetailScreen />);
    expect(getByText('FULFILLMENT CHAIN')).toBeTruthy();
    expect(getByText('Isaiah 53:1-12')).toBeTruthy();
    expect(getByText('Matthew 8:17')).toBeTruthy();
  });

  it('shows tags', () => {
    const { getByText } = renderWithProviders(<ProphecyDetailScreen />);
    expect(getByText('#messianic')).toBeTruthy();
    expect(getByText('#servant')).toBeTruthy();
    expect(getByText('#isaiah')).toBeTruthy();
  });

  it('shows category and type badges', () => {
    const { getByText } = renderWithProviders(<ProphecyDetailScreen />);
    expect(getByText('messianic')).toBeTruthy();
    expect(getByText('Direct Fulfillment')).toBeTruthy();
  });

  it('shows loading skeleton when loading', () => {
    mockUseProphecyChainDetail.mockReturnValue({
      chain: null,
      isLoading: true,
    });
    const { getByText } = renderWithProviders(<ProphecyDetailScreen />);
    expect(getByText('Loading...')).toBeTruthy();
  });
});
