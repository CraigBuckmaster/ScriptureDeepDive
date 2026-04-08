import { renderHook, act } from '@testing-library/react-native';
import { useChapterCoaching } from '@/hooks/chapter/useChapterCoaching';

describe('useChapterCoaching', () => {
  it('returns empty tips and null coaching when coachingJson is null', () => {
    const { result } = renderHook(() => useChapterCoaching(null, 'genesis', 1));
    expect(result.current.coachingTips).toEqual([]);
    expect(result.current.chapterCoaching).toBeNull();
  });

  it('returns empty tips and null coaching when coachingJson is undefined', () => {
    const { result } = renderHook(() => useChapterCoaching(undefined, 'genesis', 1));
    expect(result.current.coachingTips).toEqual([]);
    expect(result.current.chapterCoaching).toBeNull();
  });

  it('returns empty tips when coachingJson is invalid JSON', () => {
    const { result } = renderHook(() => useChapterCoaching('not valid json', 'genesis', 1));
    expect(result.current.coachingTips).toEqual([]);
    expect(result.current.chapterCoaching).toBeNull();
  });

  it('parses legacy array format', () => {
    const tips = [
      { after_section: 1, tip: 'Tip A', genre_tag: 'narrative' },
      { after_section: 2, tip: 'Tip B', genre_tag: 'narrative' },
    ];
    const { result } = renderHook(() =>
      useChapterCoaching(JSON.stringify(tips), 'genesis', 1),
    );
    expect(result.current.coachingTips).toEqual(tips);
    expect(result.current.chapterCoaching).toBeNull();
  });

  it('parses new format with section_tips and chapter_coaching', () => {
    const coaching = {
      section_tips: [{ after_section: 1, tip: 'Tip', genre_tag: 'poetry' }],
      chapter_coaching: {
        questions: ['Q1'],
        observations: ['O1'],
        reflections: ['R1'],
      },
      genre_tag: 'poetry',
    };
    const { result } = renderHook(() =>
      useChapterCoaching(JSON.stringify(coaching), 'psalms', 23),
    );
    expect(result.current.coachingTips).toEqual(coaching.section_tips);
    expect(result.current.chapterCoaching).toEqual(coaching.chapter_coaching);
  });

  it('handles new format with only chapter_coaching (no section_tips)', () => {
    const coaching = {
      chapter_coaching: { questions: ['Q1'], observations: [], reflections: [] },
    };
    const { result } = renderHook(() =>
      useChapterCoaching(JSON.stringify(coaching), 'genesis', 1),
    );
    expect(result.current.coachingTips).toEqual([]);
    expect(result.current.chapterCoaching).toEqual(coaching.chapter_coaching);
  });

  it('returns empty tips for non-array, non-object-with-keys parsed JSON', () => {
    const { result } = renderHook(() =>
      useChapterCoaching(JSON.stringify('just a string'), 'genesis', 1),
    );
    expect(result.current.coachingTips).toEqual([]);
    expect(result.current.chapterCoaching).toBeNull();
  });

  it('handleDismissTip adds section number to dismissedTips', () => {
    const { result } = renderHook(() => useChapterCoaching(null, 'genesis', 1));
    expect(result.current.dismissedTips.size).toBe(0);

    act(() => {
      result.current.handleDismissTip(1);
    });
    expect(result.current.dismissedTips.has(1)).toBe(true);

    act(() => {
      result.current.handleDismissTip(3);
    });
    expect(result.current.dismissedTips.has(1)).toBe(true);
    expect(result.current.dismissedTips.has(3)).toBe(true);
    expect(result.current.dismissedTips.size).toBe(2);
  });

  it('resets dismissedTips when chapter changes', () => {
    const { result, rerender } = renderHook(
      ({ bookId, chapterNum }: { bookId: string; chapterNum: number }) => useChapterCoaching(null, bookId, chapterNum),
      { initialProps: { bookId: 'genesis', chapterNum: 1 } },
    );

    // Dismiss a tip
    act(() => {
      result.current.handleDismissTip(2);
    });
    expect(result.current.dismissedTips.has(2)).toBe(true);

    // Change chapter
    rerender({ bookId: 'genesis', chapterNum: 2 });
    expect(result.current.dismissedTips.size).toBe(0);
  });

  it('resets dismissedTips when bookId changes', () => {
    const { result, rerender } = renderHook(
      ({ bookId, chapterNum }: { bookId: string; chapterNum: number }) => useChapterCoaching(null, bookId, chapterNum),
      { initialProps: { bookId: 'genesis', chapterNum: 1 } },
    );

    act(() => {
      result.current.handleDismissTip(5);
    });
    expect(result.current.dismissedTips.size).toBe(1);

    rerender({ bookId: 'exodus', chapterNum: 1 });
    expect(result.current.dismissedTips.size).toBe(0);
  });
});
