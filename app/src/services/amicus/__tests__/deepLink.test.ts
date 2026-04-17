/**
 * Tests for services/amicus/deepLink.ts — seeded-nav helpers (#1467).
 */
import type { NavigationProp, ParamListBase } from '@react-navigation/native';
import {
  formatChapterRef,
  navigateToAmicusWithSeed,
  parseAmicusDeepLink,
  parseChapterRef,
} from '@/services/amicus/deepLink';

function makeNav(): {
  nav: NavigationProp<ParamListBase>;
  parentNavigate: jest.Mock;
} {
  const parentNavigate = jest.fn();
  const nav = {
    getParent: () => ({ navigate: parentNavigate }),
  } as unknown as NavigationProp<ParamListBase>;
  return { nav, parentNavigate };
}

describe('formatChapterRef / parseChapterRef', () => {
  it('round-trips chapter refs', () => {
    const ref = { book_id: 'romans', chapter_num: 9 };
    const formatted = formatChapterRef(ref);
    expect(formatted).toBe('romans/9');
    expect(parseChapterRef(formatted)).toEqual(ref);
  });

  it('returns undefined/null for missing input', () => {
    expect(formatChapterRef(null)).toBeUndefined();
    expect(formatChapterRef(undefined)).toBeUndefined();
    expect(parseChapterRef(null)).toBeNull();
    expect(parseChapterRef(undefined)).toBeNull();
    expect(parseChapterRef('')).toBeNull();
  });

  it('rejects malformed chapter strings', () => {
    expect(parseChapterRef('no-slash')).toBeNull();
    expect(parseChapterRef('romans/')).toBeNull();
    expect(parseChapterRef('romans/0')).toBeNull();
    expect(parseChapterRef('romans/x')).toBeNull();
  });
});

describe('navigateToAmicusWithSeed', () => {
  it('dispatches a seeded NewThread navigation via the parent tab navigator', () => {
    const { nav, parentNavigate } = makeNav();
    navigateToAmicusWithSeed(nav, {
      query: 'Why does Paul use this metaphor?',
      chapterRef: { book_id: 'romans', chapter_num: 9 },
    });
    expect(parentNavigate).toHaveBeenCalledWith('AmicusTab', {
      screen: 'NewThread',
      params: {
        seedQuery: 'Why does Paul use this metaphor?',
        seedChapterRef: 'romans/9',
      },
    });
  });

  it('omits the chapter ref when not provided', () => {
    const { nav, parentNavigate } = makeNav();
    navigateToAmicusWithSeed(nav, { query: 'What is grace?' });
    expect(parentNavigate).toHaveBeenCalledWith('AmicusTab', {
      screen: 'NewThread',
      params: { seedQuery: 'What is grace?', seedChapterRef: undefined },
    });
  });

  it('invokes onNoParent when there is no parent navigator', () => {
    const onNoParent = jest.fn();
    const navNoParent = {
      getParent: () => undefined,
    } as unknown as NavigationProp<ParamListBase>;
    navigateToAmicusWithSeed(
      navNoParent,
      { query: 'x' },
      { onNoParent },
    );
    expect(onNoParent).toHaveBeenCalled();
  });
});

describe('parseAmicusDeepLink', () => {
  it('parses the canonical URL with query and chapter ref', () => {
    const seed = parseAmicusDeepLink(
      'scripture://amicus/new?q=What+does+hesed+mean%3F&ch=psalms/23',
    );
    expect(seed).toEqual({
      query: 'What does hesed mean?',
      chapterRef: { book_id: 'psalms', chapter_num: 23 },
    });
  });

  it('returns null when the path does not start with amicus/new', () => {
    expect(parseAmicusDeepLink('scripture://chapter/john/3')).toBeNull();
    expect(parseAmicusDeepLink('scripture://amicus/list')).toBeNull();
  });

  it('returns null when the query is missing or empty', () => {
    expect(parseAmicusDeepLink('scripture://amicus/new')).toBeNull();
    expect(parseAmicusDeepLink('scripture://amicus/new?q=')).toBeNull();
    expect(parseAmicusDeepLink('scripture://amicus/new?q=%20%20')).toBeNull();
  });

  it('returns a seed with null chapter ref when ch is malformed', () => {
    const seed = parseAmicusDeepLink(
      'scripture://amicus/new?q=What+is+grace&ch=bogus',
    );
    expect(seed).toEqual({ query: 'What is grace', chapterRef: null });
  });

  it('returns null for malformed URLs', () => {
    expect(parseAmicusDeepLink('not a url')).toBeNull();
  });
});
