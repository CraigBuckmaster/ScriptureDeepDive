import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { renderWithProviders } from '../helpers/renderWithProviders';
import { PersonSidebar } from '@/components/PersonSidebar';
import type { Person } from '@/types';

jest.mock('@/db/content', () => ({
  getPersonChildren: jest.fn().mockResolvedValue([]),
  getSpousesOf: jest.fn().mockResolvedValue([]),
  getPerson: jest.fn().mockResolvedValue(null),
}));

const makePerson = (overrides?: Partial<Person>): Person => ({
  id: 'abraham',
  name: 'Abraham',
  gender: null,
  role: 'Patriarch',
  era: 'patriarchs',
  dates: '2166–1991 BC',
  bio: 'Father of faith.',
  scripture_role: 'Covenant bearer',
  refs_json: '["Gen 12:1","Gen 22:2"]',
  father: null,
  mother: null,
  spouse_of: null,
  type: null,
  chapter_link: null,
  ...overrides,
});

describe('PersonSidebar', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders without crashing when visible with a person', () => {
    const { getByText } = renderWithProviders(
      <PersonSidebar
        visible
        onClose={jest.fn()}
        person={makePerson()}
        onNavigate={jest.fn()}
      />,
    );
    expect(getByText('Abraham')).toBeTruthy();
  });

  it('returns null when person is null', () => {
    const { toJSON } = renderWithProviders(
      <PersonSidebar
        visible
        onClose={jest.fn()}
        person={null}
        onNavigate={jest.fn()}
      />,
    );
    expect(toJSON()).toBeNull();
  });

  it('shows role and bio', () => {
    const { getByText } = renderWithProviders(
      <PersonSidebar
        visible
        onClose={jest.fn()}
        person={makePerson()}
        onNavigate={jest.fn()}
      />,
    );
    expect(getByText('Patriarch')).toBeTruthy();
    expect(getByText('Father of faith.')).toBeTruthy();
  });

  it('calls onClose when dismiss button is pressed', () => {
    const onClose = jest.fn();
    const { getByLabelText } = renderWithProviders(
      <PersonSidebar
        visible
        onClose={onClose}
        person={makePerson()}
        onNavigate={jest.fn()}
      />,
    );
    fireEvent.press(getByLabelText('Close bio panel'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('displays scripture role section', () => {
    const { getByText } = renderWithProviders(
      <PersonSidebar
        visible
        onClose={jest.fn()}
        person={makePerson()}
        onNavigate={jest.fn()}
      />,
    );
    expect(getByText('ROLE IN SCRIPTURE')).toBeTruthy();
    expect(getByText('Covenant bearer')).toBeTruthy();
  });
});
