import { getPanelLabel, isScholarPanel, CHAPTER_PANEL_ORDER } from '../../src/utils/panelLabels';

describe('getPanelLabel', () => {
  it('returns Hebrew for heb', () => expect(getPanelLabel('heb')).toBe('Hebrew'));
  it('returns Context for ctx', () => expect(getPanelLabel('ctx')).toBe('Context'));
  it('returns Connections for cross', () => expect(getPanelLabel('cross')).toBe('Connections'));
  it('returns Literary Structure for lit', () => expect(getPanelLabel('lit')).toBe('Literary Structure'));
  it('returns Theological Themes for themes', () => expect(getPanelLabel('themes')).toBe('Theological Themes'));
  it('returns MacArthur for mac', () => expect(getPanelLabel('mac')).toBe('MacArthur'));
  it('returns Sarna for sarna', () => expect(getPanelLabel('sarna')).toBe('Sarna'));
  it('returns Calvin for calvin', () => expect(getPanelLabel('calvin')).toBe('Calvin'));
  it('returns title-cased fallback for unknown', () => expect(getPanelLabel('xyz')).toBe('Xyz'));
});

describe('isScholarPanel', () => {
  it('true for mac', () => expect(isScholarPanel('mac')).toBe(true));
  it('true for sarna', () => expect(isScholarPanel('sarna')).toBe(true));
  it('false for heb', () => expect(isScholarPanel('heb')).toBe(false));
  it('false for lit', () => expect(isScholarPanel('lit')).toBe(false));
  it('true for other known scholar types', () => {
    expect(isScholarPanel('calvin')).toBe(true);
    expect(isScholarPanel('net')).toBe(true);
    expect(isScholarPanel('alter')).toBe(true);
    expect(isScholarPanel('keener')).toBe(true);
    expect(isScholarPanel('beale')).toBe(true);
  });
  it('false for content panel types', () => {
    expect(isScholarPanel('heb')).toBe(false);
    expect(isScholarPanel('cross')).toBe(false);
    expect(isScholarPanel('themes')).toBe(false);
    expect(isScholarPanel('ppl')).toBe(false);
    expect(isScholarPanel('trans')).toBe(false);
  });
  it('false for completely unknown type', () => {
    expect(isScholarPanel('randomstuff')).toBe(false);
  });
});

describe('getPanelLabel – additional edge cases', () => {
  it('returns title-case fallback for unknown keys', () => {
    expect(getPanelLabel('foo')).toBe('Foo');
    expect(getPanelLabel('bar')).toBe('Bar');
    expect(getPanelLabel('customPanel')).toBe('CustomPanel');
  });
  it('returns correct label for section-level panels', () => {
    expect(getPanelLabel('poi')).toBe('Places');
    expect(getPanelLabel('tl')).toBe('Timeline');
    expect(getPanelLabel('hist')).toBe('Context');
  });
});

describe('CHAPTER_PANEL_ORDER', () => {
  it('contains expected panel types', () => {
    expect(CHAPTER_PANEL_ORDER).toContain('lit');
    expect(CHAPTER_PANEL_ORDER).toContain('hebtext');
    expect(CHAPTER_PANEL_ORDER).toContain('themes');
    expect(CHAPTER_PANEL_ORDER).toContain('ppl');
    expect(CHAPTER_PANEL_ORDER).toContain('trans');
    expect(CHAPTER_PANEL_ORDER).toContain('src');
    expect(CHAPTER_PANEL_ORDER).toContain('rec');
    expect(CHAPTER_PANEL_ORDER).toContain('thread');
    expect(CHAPTER_PANEL_ORDER).toContain('discourse');
  });
  it('is an array with expected length', () => {
    expect(Array.isArray(CHAPTER_PANEL_ORDER)).toBe(true);
    expect(CHAPTER_PANEL_ORDER.length).toBeGreaterThanOrEqual(9);
  });
});
