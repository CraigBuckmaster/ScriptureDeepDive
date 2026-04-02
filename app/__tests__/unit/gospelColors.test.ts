import { gospelColor, GOSPEL_COLORS, GOSPEL_ORDER, GOSPEL_SHORT, GOSPEL_LABELS } from '@/components/GospelColors';

describe('GospelColors', () => {
  it('returns correct color for each Gospel', () => {
    expect(gospelColor('matthew')).toBe('#5b8def');
    expect(gospelColor('mark')).toBe('#e8854a');
    expect(gospelColor('luke')).toBe('#5cb85c');
    expect(gospelColor('john')).toBe('#b070d8');
  });

  it('returns fallback for unknown book', () => {
    expect(gospelColor('acts')).toBe('#908878');
    expect(gospelColor('genesis')).toBe('#908878');
  });

  it('has correct short labels', () => {
    expect(GOSPEL_SHORT.matthew).toBe('M');
    expect(GOSPEL_SHORT.mark).toBe('Mk');
    expect(GOSPEL_SHORT.luke).toBe('L');
    expect(GOSPEL_SHORT.john).toBe('J');
  });

  it('has correct full labels', () => {
    expect(GOSPEL_LABELS.matthew).toBe('Matthew');
    expect(GOSPEL_LABELS.john).toBe('John');
  });

  it('GOSPEL_ORDER is canonical', () => {
    expect(GOSPEL_ORDER).toEqual(['matthew', 'mark', 'luke', 'john']);
  });

  it('all four Gospels have entries in every map', () => {
    for (const g of GOSPEL_ORDER) {
      expect(GOSPEL_COLORS[g]).toBeDefined();
      expect(GOSPEL_LABELS[g]).toBeDefined();
      expect(GOSPEL_SHORT[g]).toBeDefined();
    }
  });
});
