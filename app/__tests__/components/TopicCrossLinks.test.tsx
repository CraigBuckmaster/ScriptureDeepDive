import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { renderWithProviders } from '../helpers/renderWithProviders';
import { TopicCrossLinks } from '@/components/TopicCrossLinks';

describe('TopicCrossLinks', () => {
  const handlers = {
    onConceptPress: jest.fn(),
    onThreadPress: jest.fn(),
    onProphecyPress: jest.fn(),
  };

  beforeEach(() => jest.clearAllMocks());

  it('renders nothing when all arrays are empty', () => {
    const { toJSON } = renderWithProviders(
      <TopicCrossLinks concepts={[]} threads={[]} prophecyChains={[]} {...handlers} />,
    );
    expect(toJSON()).toBeNull();
  });

  it('renders concept links', () => {
    const { getByText } = renderWithProviders(
      <TopicCrossLinks
        concepts={[{ id: 'mercy-grace', title: 'Mercy & Grace' }]}
        threads={[]}
        prophecyChains={[]}
        {...handlers}
      />,
    );
    expect(getByText(/Mercy & Grace/)).toBeTruthy();
  });

  it('fires onConceptPress on tap', () => {
    const { getByText } = renderWithProviders(
      <TopicCrossLinks
        concepts={[{ id: 'mercy-grace', title: 'Mercy & Grace' }]}
        threads={[]}
        prophecyChains={[]}
        {...handlers}
      />,
    );
    fireEvent.press(getByText(/Mercy & Grace/));
    expect(handlers.onConceptPress).toHaveBeenCalledWith('mercy-grace');
  });

  it('renders mixed cross-links', () => {
    const { getByText } = renderWithProviders(
      <TopicCrossLinks
        concepts={[{ id: 'c1', title: 'Concept One' }]}
        threads={[{ id: 't1', theme: 'Thread One' }]}
        prophecyChains={[{ id: 'p1', title: 'Chain One' }]}
        {...handlers}
      />,
    );
    expect(getByText(/Concept One/)).toBeTruthy();
    expect(getByText(/Thread One/)).toBeTruthy();
    expect(getByText(/Chain One/)).toBeTruthy();
  });
});
