import { normalizeDiffAnnotation } from '@/components/DiffAnnotation';

describe('normalizeDiffAnnotation', () => {
  it('passes through new-format annotations unchanged', () => {
    const input = {
      location: 'Matt / Luke',
      diff_type: 'wording' as const,
      texts: { matthew: 'text A', luke: 'text B' },
      explanation: 'Some explanation',
    };
    expect(normalizeDiffAnnotation(input)).toEqual(input);
  });

  it('converts legacy matthew/luke flat fields to texts map', () => {
    const legacy = {
      location: 'Matt / Luke',
      diff_type: 'addition',
      matthew: 'Only in Matthew',
      luke: '(absent)',
      explanation: 'Matthew adds this',
    };
    const result = normalizeDiffAnnotation(legacy);
    expect(result.texts).toEqual({ matthew: 'Only in Matthew', luke: '(absent)' });
    expect(result.location).toBe('Matt / Luke');
    expect(result.explanation).toBe('Matthew adds this');
  });

  it('handles legacy with mark and john fields', () => {
    const legacy = {
      location: 'Mark / John',
      diff_type: 'wording',
      mark: 'Mark says this',
      john: 'John says that',
      explanation: 'A difference',
    };
    const result = normalizeDiffAnnotation(legacy);
    expect(result.texts).toEqual({ mark: 'Mark says this', john: 'John says that' });
  });

  it('handles 3+ Gospel texts map', () => {
    const input = {
      location: 'All Synoptics',
      diff_type: 'reordering' as const,
      texts: { matthew: 'A', mark: 'B', luke: 'C' },
      explanation: 'Three-way diff',
    };
    const result = normalizeDiffAnnotation(input);
    expect(Object.keys(result.texts)).toHaveLength(3);
  });

  it('preserves diff_type through normalization', () => {
    const legacy = {
      location: 'X', diff_type: 'omission',
      matthew: 'A', luke: 'B', explanation: 'E',
    };
    expect(normalizeDiffAnnotation(legacy).diff_type).toBe('omission');
  });
});
