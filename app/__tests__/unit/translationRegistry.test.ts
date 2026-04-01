import {
  TRANSLATIONS,
  TRANSLATION_MAP,
  BUNDLED_TRANSLATIONS,
  DOWNLOADABLE_TRANSLATIONS,
  isBundled,
} from '@/db/translationRegistry';

describe('translationRegistry', () => {
  describe('TRANSLATIONS', () => {
    it('contains at least one translation', () => {
      expect(TRANSLATIONS.length).toBeGreaterThan(0);
    });

    it('every entry has required fields', () => {
      for (const t of TRANSLATIONS) {
        expect(t.id).toBeTruthy();
        expect(t.label).toBeTruthy();
        expect(t.fullName).toBeTruthy();
        expect(typeof t.bundled).toBe('boolean');
        expect(typeof t.sizeBytes).toBe('number');
      }
    });

    it('includes KJV as bundled', () => {
      const kjv = TRANSLATIONS.find((t) => t.id === 'kjv');
      expect(kjv).toBeTruthy();
      expect(kjv!.bundled).toBe(true);
      expect(kjv!.label).toBe('KJV');
      expect(kjv!.fullName).toBe('King James Version');
    });

    it('includes ASV as bundled', () => {
      const asv = TRANSLATIONS.find((t) => t.id === 'asv');
      expect(asv).toBeTruthy();
      expect(asv!.bundled).toBe(true);
      expect(asv!.label).toBe('ASV');
    });
  });

  describe('TRANSLATION_MAP', () => {
    it('is a Map keyed by translation ID', () => {
      expect(TRANSLATION_MAP).toBeInstanceOf(Map);
      expect(TRANSLATION_MAP.get('kjv')).toBeTruthy();
    });

    it('returns undefined for unknown IDs', () => {
      expect(TRANSLATION_MAP.get('nonexistent')).toBeUndefined();
    });
  });

  describe('BUNDLED_TRANSLATIONS', () => {
    it('only contains bundled entries', () => {
      for (const t of BUNDLED_TRANSLATIONS) {
        expect(t.bundled).toBe(true);
      }
    });

    it('includes KJV and ASV', () => {
      const ids = BUNDLED_TRANSLATIONS.map((t) => t.id);
      expect(ids).toContain('kjv');
      expect(ids).toContain('asv');
    });
  });

  describe('DOWNLOADABLE_TRANSLATIONS', () => {
    it('only contains non-bundled entries', () => {
      for (const t of DOWNLOADABLE_TRANSLATIONS) {
        expect(t.bundled).toBe(false);
      }
    });

    it('does not overlap with bundled', () => {
      const bundledIds = new Set(BUNDLED_TRANSLATIONS.map((t) => t.id));
      for (const t of DOWNLOADABLE_TRANSLATIONS) {
        expect(bundledIds.has(t.id)).toBe(false);
      }
    });
  });

  describe('isBundled', () => {
    it('returns true for bundled translations', () => {
      expect(isBundled('kjv')).toBe(true);
      expect(isBundled('asv')).toBe(true);
    });

    it('returns false for unknown translations', () => {
      expect(isBundled('nonexistent')).toBe(false);
    });
  });
});
