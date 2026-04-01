import React from 'react';
import { fireEvent, waitFor } from '@testing-library/react-native';
import { renderWithProviders } from '../helpers/renderWithProviders';
import PersonDetailScreen from '@/screens/PersonDetailScreen';

// ── Override navigation with trackable mocks ────────────────────
const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
const mockPush = jest.fn();
jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');
  return {
    ...actual,
    useNavigation: () => ({
      navigate: mockNavigate,
      goBack: mockGoBack,
      push: mockPush,
      setOptions: jest.fn(),
    }),
    useRoute: () => ({ params: { personId: 'person-1' } }),
    useScrollToTop: jest.fn(),
    useFocusEffect: (cb: () => void) => cb(),
  };
});

// ── Mock child components ────────────────────────────────────────
jest.mock('@/components/ScreenHeader', () => ({
  ScreenHeader: ({ title, subtitle }: { title: string; subtitle?: string }) => {
    const React = require('react');
    const { Text } = require('react-native');
    return React.createElement(React.Fragment, null,
      React.createElement(Text, {}, title),
      subtitle ? React.createElement(Text, {}, subtitle) : null,
    );
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

jest.mock('lucide-react-native', () => ({
  ArrowRight: () => null,
}));

// ── Mock hook ────────────────────────────────────────────────────
const mockUsePersonDetail = jest.fn();
jest.mock('@/hooks/usePersonDetail', () => ({
  usePersonDetail: (...args: unknown[]) => mockUsePersonDetail(...args),
}));

const samplePerson = {
  id: 'person-1',
  name: 'Abraham',
  dates: 'c. 2000 BC',
  era: 'patriarchs',
  role: 'Patriarch',
  bio: 'Father of many nations.',
  scripture_role: 'Central figure in the covenant narrative.',
  refs_json: '["Genesis 12:1","Genesis 15:6"]',
};

const sampleParents = {
  father: { id: 'person-0', name: 'Terah' },
  mother: null,
};

const sampleSpouses = [{ id: 'person-2', name: 'Sarah' }];

const sampleChildren = [
  { id: 'person-3', name: 'Isaac' },
  { id: 'person-4', name: 'Ishmael' },
];

beforeEach(() => {
  jest.clearAllMocks();
  mockUsePersonDetail.mockReturnValue({
    person: samplePerson,
    parents: sampleParents,
    children: sampleChildren,
    spouses: sampleSpouses,
    isLoading: false,
  });
});

describe('PersonDetailScreen', () => {
  it('renders without crashing', () => {
    const { getByText } = renderWithProviders(<PersonDetailScreen />);
    expect(getByText('Abraham')).toBeTruthy();
  });

  it('shows loading skeleton when loading', () => {
    mockUsePersonDetail.mockReturnValue({
      person: null,
      parents: { father: null, mother: null },
      children: [],
      spouses: [],
      isLoading: true,
    });
    const { getByText } = renderWithProviders(<PersonDetailScreen />);
    expect(getByText('Loading...')).toBeTruthy();
  });

  it('displays person role', () => {
    const { getByText } = renderWithProviders(<PersonDetailScreen />);
    expect(getByText('Patriarch')).toBeTruthy();
  });

  it('displays person bio', () => {
    const { getByText } = renderWithProviders(<PersonDetailScreen />);
    expect(getByText('Father of many nations.')).toBeTruthy();
  });

  it('displays scripture role section', () => {
    const { getByText } = renderWithProviders(<PersonDetailScreen />);
    expect(getByText('ROLE IN SCRIPTURE')).toBeTruthy();
    expect(getByText('Central figure in the covenant narrative.')).toBeTruthy();
  });

  it('displays family relationships', () => {
    const { getByText } = renderWithProviders(<PersonDetailScreen />);
    expect(getByText('Parents')).toBeTruthy();
    expect(getByText('Terah')).toBeTruthy();
    expect(getByText('Spouse')).toBeTruthy();
    expect(getByText('Sarah')).toBeTruthy();
    expect(getByText('Children')).toBeTruthy();
    expect(getByText('Isaac')).toBeTruthy();
    expect(getByText('Ishmael')).toBeTruthy();
  });

  it('displays reference badges', () => {
    const { getByText } = renderWithProviders(<PersonDetailScreen />);
    expect(getByText('Genesis 12:1')).toBeTruthy();
    expect(getByText('Genesis 15:6')).toBeTruthy();
  });

  it('navigates to family tree on link press', () => {
    const { getByLabelText } = renderWithProviders(<PersonDetailScreen />);
    fireEvent.press(getByLabelText('See on family tree'));
    expect(mockNavigate).toHaveBeenCalledWith('GenealogyTree', { personId: 'person-1' });
  });

  it('pushes to PersonDetail when tapping a family member', () => {
    const { getByText } = renderWithProviders(<PersonDetailScreen />);
    fireEvent.press(getByText('Sarah'));
    expect(mockPush).toHaveBeenCalledWith('PersonDetail', { personId: 'person-2' });
  });
});
