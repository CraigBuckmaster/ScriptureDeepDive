import React from 'react';
import { renderWithProviders } from '../helpers/renderWithProviders';
import { ContinueReadingHero } from '@/components/ContinueReadingHero';

jest.mock('@/hooks/useContentImages', () => ({
  useContentImages: jest.fn().mockReturnValue({ images: [] }),
}));

describe('ContinueReadingHero', () => {
  it('renders "Begin Your Journey" when no recent chapter', () => {
    const { getByText } = renderWithProviders(
      <ContinueReadingHero mostRecent={null} onPress={jest.fn()} />,
    );
    expect(getByText('Begin Your Journey')).toBeTruthy();
  });

  it('shows book and chapter when mostRecent is provided', () => {
    const recent = {
      book_id: 'genesis',
      book_name: 'Genesis',
      chapter_num: 3,
      title: 'The Fall',
    };
    const { getByText } = renderWithProviders(
      <ContinueReadingHero mostRecent={recent as any} onPress={jest.fn()} />,
    );
    expect(getByText(/Genesis/)).toBeTruthy();
    expect(getByText('Continue')).toBeTruthy();
  });
});
