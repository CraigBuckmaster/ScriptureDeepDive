import React from 'react';
import { fireEvent, waitFor } from '@testing-library/react-native';
import { renderWithProviders } from '../helpers/renderWithProviders';
import PersonDetailScreen from '@/screens/PersonDetailScreen';

// ── Navigation mocks ────────────────────────────────────────
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
    useRoute: () => ({ params: { personId: 'abraham' } }),
    useScrollToTop: jest.fn(),
    useFocusEffect: (cb: () => void) => cb(),
  };
});

// ── Mock DB queries ────────────────────────────────────────
const samplePerson = {
  id: 'abraham',
  name: 'Abraham',
  dates: 'c. 2000 BC',
  era: 'patriarch',
  role: 'Patriarch',
  bio: 'Father of many nations.',
  scripture_role: 'Central figure in the covenant narrative.',
  refs_json: '["Genesis 12:1","Genesis 15:6"]',
  father: 'terah',
  mother: null,
  chapter_link: null,
};

jest.mock('@/db/content', () => ({
  getPerson: jest.fn().mockResolvedValue(samplePerson),
  hasPersonJourney: jest.fn().mockResolvedValue(false),
  getPersonChildren: jest.fn().mockResolvedValue([
    { id: 'isaac', name: 'Isaac', era: 'patriarch' },
    { id: 'ishmael', name: 'Ishmael', era: 'patriarch' },
  ]),
  getSpousesOf: jest.fn().mockResolvedValue([
    { id: 'sarah', name: 'Sarah', era: 'patriarch' },
  ]),
}));

// ── Mock PersonSidebar to bypass Modal portal entirely ──────
jest.mock('@/components/PersonSidebar', () => ({
  PersonSidebar: (props: any) => {
    if (!props.visible || !props.person) return null;
    const React = require('react');
    const { View, Text, TouchableOpacity } = require('react-native');
    return React.createElement(View, { testID: 'person-sidebar' },
      React.createElement(Text, {}, props.person.name),
      React.createElement(Text, {}, props.person.role),
      React.createElement(Text, {}, props.person.bio),
      React.createElement(TouchableOpacity, {
        accessibilityLabel: 'See on family tree',
        onPress: () => props.onTreePress(props.person.id),
      }, React.createElement(Text, {}, 'See on Family Tree')),
      React.createElement(TouchableOpacity, {
        accessibilityLabel: 'Close bio panel',
        onPress: props.onClose,
      }, React.createElement(Text, {}, 'Close')),
    );
  },
}));

beforeEach(() => {
  jest.clearAllMocks();
});

describe('PersonDetailScreen', () => {
  it('renders person name', async () => {
    const { findByText } = renderWithProviders(<PersonDetailScreen />);
    expect(await findByText('Abraham')).toBeTruthy();
  });

  it('displays person role', async () => {
    const { findByText } = renderWithProviders(<PersonDetailScreen />);
    expect(await findByText('Patriarch')).toBeTruthy();
  });

  it('displays person bio', async () => {
    const { findByText } = renderWithProviders(<PersonDetailScreen />);
    expect(await findByText('Father of many nations.')).toBeTruthy();
  });

  it('navigates to family tree on link press', async () => {
    const { findByLabelText } = renderWithProviders(<PersonDetailScreen />);
    const link = await findByLabelText('See on family tree');
    fireEvent.press(link);
    expect(mockNavigate).toHaveBeenCalledWith('GenealogyTree', { personId: 'abraham' });
  });

  it('goes back on close', async () => {
    const { findByLabelText } = renderWithProviders(<PersonDetailScreen />);
    const close = await findByLabelText('Close bio panel');
    fireEvent.press(close);
    expect(mockGoBack).toHaveBeenCalled();
  });
});
