import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { renderWithProviders } from '../../../../__tests__/helpers/renderWithProviders';
import { NextChapterNudge } from '../NextChapterNudge';
import type { Book } from '../../../types';

function book(
  id: string,
  name: string,
  book_order: number,
  total_chapters: number,
  testament: 'ot' | 'nt' = 'ot',
): Book {
  return { id, name, testament, total_chapters, book_order, is_live: true };
}

const BOOKS: Book[] = [
  book('genesis', 'Genesis', 1, 50, 'ot'),
  book('exodus', 'Exodus', 2, 40, 'ot'),
  book('revelation', 'Revelation', 66, 22, 'nt'),
];

describe('NextChapterNudge', () => {
  it('shows the next chapter and fires onOpenNext with the resolved ref', () => {
    const onOpenNext = jest.fn();
    const onMarkComplete = jest.fn();
    const { getByText, getByLabelText } = renderWithProviders(
      <NextChapterNudge
        bookId="genesis"
        chapterNum={1}
        books={BOOKS}
        onOpenNext={onOpenNext}
        onMarkComplete={onMarkComplete}
      />,
    );
    expect(getByText('Continue your study')).toBeTruthy();
    expect(getByText('Next: Genesis 2')).toBeTruthy();
    fireEvent.press(getByLabelText('Open Genesis 2'));
    expect(onOpenNext).toHaveBeenCalledWith({
      bookId: 'genesis',
      bookName: 'Genesis',
      chapterNum: 2,
    });
  });

  it('crosses book boundaries (Genesis 50 → Exodus 1)', () => {
    const onOpenNext = jest.fn();
    const { getByText } = renderWithProviders(
      <NextChapterNudge
        bookId="genesis"
        chapterNum={50}
        books={BOOKS}
        onOpenNext={onOpenNext}
        onMarkComplete={jest.fn()}
      />,
    );
    expect(getByText('Next: Exodus 1')).toBeTruthy();
  });

  it('Mark complete fires onMarkComplete', () => {
    const onMarkComplete = jest.fn();
    const { getByLabelText } = renderWithProviders(
      <NextChapterNudge
        bookId="genesis"
        chapterNum={1}
        books={BOOKS}
        onOpenNext={jest.fn()}
        onMarkComplete={onMarkComplete}
      />,
    );
    fireEvent.press(getByLabelText('Mark complete and stay here'));
    expect(onMarkComplete).toHaveBeenCalledTimes(1);
  });

  it('renders the celebratory variant at the end of Revelation', () => {
    const onRestart = jest.fn();
    const { getByText, getByLabelText } = renderWithProviders(
      <NextChapterNudge
        bookId="revelation"
        chapterNum={22}
        books={BOOKS}
        onOpenNext={jest.fn()}
        onMarkComplete={jest.fn()}
        onRestart={onRestart}
      />,
    );
    expect(getByText('You finished Revelation!')).toBeTruthy();
    fireEvent.press(getByLabelText('Start over from Genesis 1'));
    expect(onRestart).toHaveBeenCalledTimes(1);
  });
});
