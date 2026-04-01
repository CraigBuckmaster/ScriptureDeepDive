import { getPanelLabel, isScholarPanel } from '../../src/utils/panelLabels';

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
});
