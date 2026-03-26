import { useState, useEffect, useCallback } from 'react';
import { getBookmarks, addBookmark, removeBookmark } from '../db/user';
import { chapterPrefix, formatVerseRef, extractVerseNum } from '../utils/verseRef';

export function useBookmarkedVerses(bookId: string | null, ch: number) {
  const [bookmarked, setBookmarked] = useState<Set<number>>(new Set());
  const [bookmarkIds, setBookmarkIds] = useState<Map<number, number>>(new Map());

  const reload = useCallback(() => {
    if (!bookId) return;
    getBookmarks().then((all) => {
      const prefix = chapterPrefix(bookId, ch);
      const nums = new Set<number>();
      const ids = new Map<number, number>();
      for (const b of all) {
        if (b.verse_ref.startsWith(prefix)) {
          const num = extractVerseNum(b.verse_ref);
          if (num) {
            nums.add(num);
            ids.set(num, b.id);
          }
        }
      }
      setBookmarked(nums);
      setBookmarkIds(ids);
    });
  }, [bookId, ch]);

  useEffect(() => { reload(); }, [reload]);

  const toggleBookmark = useCallback(async (verseNum: number) => {
    if (!bookId) return;
    const ref = formatVerseRef(bookId, ch, verseNum);
    if (bookmarked.has(verseNum)) {
      const id = bookmarkIds.get(verseNum);
      if (id) await removeBookmark(id);
    } else {
      await addBookmark(ref);
    }
    reload();
  }, [bookId, ch, bookmarked, bookmarkIds, reload]);

  return { bookmarked, toggleBookmark };
}
