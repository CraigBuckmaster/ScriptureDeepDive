import { decodeMorphology, DecodedMorphology } from '@/utils/morphologyDecoder';

describe('morphologyDecoder', () => {
  // ── decodeMorphology dispatch ─────────────────────────────────

  describe('decodeMorphology dispatch', () => {
    it('returns empty result for empty string', () => {
      const result = decodeMorphology('');
      expect(result.parts).toEqual([]);
      expect(result.summary).toBe('');
    });

    it('returns empty result for null/undefined', () => {
      const result = decodeMorphology(null as unknown as string);
      expect(result.parts).toEqual([]);
    });

    it('returns empty result for whitespace-only string', () => {
      const result = decodeMorphology('   ');
      expect(result.parts).toEqual([]);
    });

    it('detects Hebrew codes starting with H + POS letter', () => {
      const result = decodeMorphology('HVqp3ms');
      expect(result.language).toBe('hebrew');
    });

    it('detects compound Hebrew codes with / separator', () => {
      const result = decodeMorphology('HC/Vqp3ms');
      expect(result.language).toBe('hebrew');
    });

    it('treats non-Hebrew codes as Greek', () => {
      const result = decodeMorphology('V-PAI-3S');
      expect(result.language).toBe('greek');
    });

    it('trims leading/trailing whitespace', () => {
      const result = decodeMorphology('  V-PAI-3S  ');
      expect(result.language).toBe('greek');
      expect(result.parts.length).toBeGreaterThan(0);
    });
  });

  // ── Greek decoding ────────────────────────────────────────────

  describe('decodeGreek', () => {
    describe('POS detection', () => {
      it('decodes Verb POS', () => {
        const result = decodeMorphology('V-PAI-3S');
        expect(result.parts[0]).toEqual({ label: 'Part of Speech', value: 'Verb' });
      });

      it('decodes Noun POS', () => {
        const result = decodeMorphology('N-NSM');
        expect(result.parts[0]).toEqual({ label: 'Part of Speech', value: 'Noun' });
      });

      it('decodes Adjective POS', () => {
        const result = decodeMorphology('A-NSM');
        expect(result.parts[0]).toEqual({ label: 'Part of Speech', value: 'Adjective' });
      });

      it('decodes Article POS', () => {
        const result = decodeMorphology('T-NSM');
        expect(result.parts[0]).toEqual({ label: 'Part of Speech', value: 'Article' });
      });

      it('decodes Conjunction', () => {
        const result = decodeMorphology('CONJ');
        expect(result.parts[0]).toEqual({ label: 'Part of Speech', value: 'Conjunction' });
      });

      it('decodes Preposition', () => {
        const result = decodeMorphology('PREP');
        expect(result.parts[0]).toEqual({ label: 'Part of Speech', value: 'Preposition' });
      });

      it('decodes Adverb', () => {
        const result = decodeMorphology('ADV');
        expect(result.parts[0]).toEqual({ label: 'Part of Speech', value: 'Adverb' });
      });

      it('decodes Particle', () => {
        const result = decodeMorphology('PRT');
        expect(result.parts[0]).toEqual({ label: 'Part of Speech', value: 'Particle' });
      });

      it('decodes Pronoun', () => {
        const result = decodeMorphology('P-NSM');
        expect(result.parts[0]).toEqual({ label: 'Part of Speech', value: 'Pronoun' });
      });

      it('decodes Demonstrative', () => {
        const result = decodeMorphology('D-NSM');
        expect(result.parts[0]).toEqual({ label: 'Part of Speech', value: 'Demonstrative' });
      });

      it('decodes Relative', () => {
        const result = decodeMorphology('R-NSM');
        expect(result.parts[0]).toEqual({ label: 'Part of Speech', value: 'Relative' });
      });

      it('decodes Indefinite', () => {
        const result = decodeMorphology('X-NSM');
        expect(result.parts[0]).toEqual({ label: 'Part of Speech', value: 'Indefinite' });
      });

      it('decodes Reflexive', () => {
        const result = decodeMorphology('F-NSM');
        expect(result.parts[0]).toEqual({ label: 'Part of Speech', value: 'Reflexive' });
      });

      it('decodes Interrogative', () => {
        const result = decodeMorphology('I-NSM');
        expect(result.parts[0]).toEqual({ label: 'Part of Speech', value: 'Interrogative' });
      });

      it('decodes Possessive', () => {
        const result = decodeMorphology('S-NSM');
        expect(result.parts[0]).toEqual({ label: 'Part of Speech', value: 'Possessive' });
      });

      it('passes through unknown POS codes verbatim', () => {
        const result = decodeMorphology('Z-NSM');
        expect(result.parts[0]).toEqual({ label: 'Part of Speech', value: 'Z' });
      });
    });

    describe('verb parsing', () => {
      it('decodes tense, voice, mood for a standard verb', () => {
        const result = decodeMorphology('V-PAI-3S');
        expect(result.parts).toEqual(expect.arrayContaining([
          { label: 'Tense', value: 'Present' },
          { label: 'Voice', value: 'Active' },
          { label: 'Mood', value: 'Indicative' },
          { label: 'Person', value: '3rd' },
          { label: 'Number', value: 'Singular' },
        ]));
      });

      it('decodes Aorist Middle Subjunctive', () => {
        const result = decodeMorphology('V-AMS-1P');
        expect(result.parts).toEqual(expect.arrayContaining([
          { label: 'Tense', value: 'Aorist' },
          { label: 'Voice', value: 'Middle' },
          { label: 'Mood', value: 'Subjunctive' },
        ]));
      });

      it('decodes Future Passive Indicative', () => {
        const result = decodeMorphology('V-FPI-3S');
        expect(result.parts).toEqual(expect.arrayContaining([
          { label: 'Tense', value: 'Future' },
          { label: 'Voice', value: 'Passive' },
        ]));
      });

      it('decodes Perfect tense', () => {
        const result = decodeMorphology('V-XAI-1S');
        expect(result.parts).toEqual(expect.arrayContaining([
          { label: 'Tense', value: 'Perfect' },
        ]));
      });

      it('decodes Imperfect tense', () => {
        const result = decodeMorphology('V-IAI-3P');
        expect(result.parts).toEqual(expect.arrayContaining([
          { label: 'Tense', value: 'Imperfect' },
        ]));
      });

      it('decodes Middle/Passive voice', () => {
        const result = decodeMorphology('V-PEI-3S');
        expect(result.parts).toEqual(expect.arrayContaining([
          { label: 'Voice', value: 'Middle/Passive' },
        ]));
      });

      it('decodes Infinitive mood (no person/number)', () => {
        const result = decodeMorphology('V-PAN');
        const personParts = result.parts.filter((p) => p.label === 'Person');
        expect(result.parts).toEqual(expect.arrayContaining([
          { label: 'Mood', value: 'Infinitive' },
        ]));
        // Infinitive shouldn't have person if detail is only 3 chars
        expect(personParts).toHaveLength(0);
      });

      it('falls back to person/number for short participle codes', () => {
        // V-PAP-NSM → cleanDetail 'PAPNSM' (6 chars) — participle branch needs 7+
        const result = decodeMorphology('V-PAP-NSM');
        expect(result.parts).toEqual(expect.arrayContaining([
          { label: 'Mood', value: 'Participle' },
        ]));
        // With 6-char detail, positions 3/4 map to Person/Number
        expect(result.parts.find((p) => p.label === 'Person')).toBeDefined();
      });

      it('decodes Participle with case/number/gender when detail is 7+ chars', () => {
        // Synthesize a 7-char cleanDetail to trigger participle branch
        // V-PAP-3NSM → cleanDetail 'PAP3NSM' (7 chars)
        const result = decodeMorphology('V-PAP-3NSM');
        expect(result.parts).toEqual(expect.arrayContaining([
          { label: 'Mood', value: 'Participle' },
          { label: 'Case', value: 'Nominative' },
          { label: 'Number', value: 'Singular' },
          { label: 'Gender', value: 'Masculine' },
        ]));
        // Should have replaced person/number with case/number/gender
        const personParts = result.parts.filter((p) => p.label === 'Person');
        expect(personParts).toHaveLength(0);
      });

      it('generates articleId for verbs', () => {
        const result = decodeMorphology('V-PAI-3S');
        expect(result.articleId).toBe('greek-verb-present');
      });

      it('generates articleId for aorist verbs', () => {
        const result = decodeMorphology('V-AAI-3S');
        expect(result.articleId).toBe('greek-verb-aorist');
      });
    });

    describe('nominal parsing', () => {
      it('decodes Noun case/number/gender', () => {
        const result = decodeMorphology('N-GSF');
        expect(result.parts).toEqual(expect.arrayContaining([
          { label: 'Part of Speech', value: 'Noun' },
          { label: 'Case', value: 'Genitive' },
          { label: 'Number', value: 'Singular' },
          { label: 'Gender', value: 'Feminine' },
        ]));
      });

      it('decodes Dative Plural Neuter', () => {
        const result = decodeMorphology('N-DPN');
        expect(result.parts).toEqual(expect.arrayContaining([
          { label: 'Case', value: 'Dative' },
          { label: 'Number', value: 'Plural' },
          { label: 'Gender', value: 'Neuter' },
        ]));
      });

      it('decodes Accusative case', () => {
        const result = decodeMorphology('N-ASM');
        expect(result.parts).toEqual(expect.arrayContaining([
          { label: 'Case', value: 'Accusative' },
        ]));
      });

      it('decodes Vocative case', () => {
        const result = decodeMorphology('N-VSM');
        expect(result.parts).toEqual(expect.arrayContaining([
          { label: 'Case', value: 'Vocative' },
        ]));
      });

      it('generates articleId for nominals', () => {
        const result = decodeMorphology('N-NSM');
        expect(result.articleId).toBe('greek-noun-case');
      });

      it('generates articleId for adjectives', () => {
        const result = decodeMorphology('A-NSM');
        expect(result.articleId).toBe('greek-adjective-case');
      });

      it('handles single-char detail gracefully', () => {
        const result = decodeMorphology('N-N');
        expect(result.parts).toEqual(expect.arrayContaining([
          { label: 'Case', value: 'Nominative' },
        ]));
        // No Number or Gender since detail is only 1 char
        expect(result.parts.filter((p) => p.label === 'Number')).toHaveLength(0);
      });
    });

    describe('summary generation', () => {
      it('joins all part values with commas', () => {
        const result = decodeMorphology('N-NSM');
        expect(result.summary).toBe('Noun, Nominative, Singular, Masculine');
      });
    });

    describe('POS without hyphen', () => {
      it('handles POS code without detail', () => {
        const result = decodeMorphology('CONJ');
        expect(result.parts).toHaveLength(1);
        expect(result.parts[0].value).toBe('Conjunction');
      });
    });
  });

  // ── Hebrew decoding ───────────────────────────────────────────

  describe('decodeHebrew', () => {
    describe('H-prefix stripping', () => {
      it('strips leading H for Hebrew codes', () => {
        const result = decodeMorphology('HVqp3ms');
        expect(result.language).toBe('hebrew');
        expect(result.parts[0]).toEqual({ label: 'Part of Speech', value: 'Verb' });
      });
    });

    describe('verb decoding', () => {
      it('decodes Qal Perfect 3rd Masculine Singular', () => {
        const result = decodeMorphology('HVqp3ms');
        expect(result.parts).toEqual(expect.arrayContaining([
          { label: 'Part of Speech', value: 'Verb' },
          { label: 'Stem', value: 'Qal' },
          { label: 'Conjugation', value: 'Perfect' },
          { label: 'Person', value: '3rd' },
          { label: 'Gender', value: 'Masculine' },
          { label: 'Number', value: 'Singular' },
        ]));
      });

      it('decodes Niphal Imperfect', () => {
        const result = decodeMorphology('HVni3mp');
        expect(result.parts).toEqual(expect.arrayContaining([
          { label: 'Stem', value: 'Niphal' },
          { label: 'Conjugation', value: 'Imperfect' },
          { label: 'Number', value: 'Plural' },
        ]));
      });

      it('decodes Piel Imperative', () => {
        const result = decodeMorphology('HVpv2ms');
        expect(result.parts).toEqual(expect.arrayContaining([
          { label: 'Stem', value: 'Piel' },
          { label: 'Conjugation', value: 'Imperative' },
        ]));
      });

      it('decodes Hiphil stem', () => {
        const result = decodeMorphology('HVhp3ms');
        expect(result.parts).toEqual(expect.arrayContaining([
          { label: 'Stem', value: 'Hiphil' },
        ]));
      });

      it('decodes Hithpael stem', () => {
        const result = decodeMorphology('HVtp3ms');
        expect(result.parts).toEqual(expect.arrayContaining([
          { label: 'Stem', value: 'Hithpael' },
        ]));
      });

      it('decodes Wayyiqtol conjugation', () => {
        const result = decodeMorphology('HVqw3ms');
        expect(result.parts).toEqual(expect.arrayContaining([
          { label: 'Conjugation', value: 'Wayyiqtol' },
        ]));
      });

      it('decodes Participle conjugation', () => {
        const result = decodeMorphology('HVqrms');
        expect(result.parts).toEqual(expect.arrayContaining([
          { label: 'Conjugation', value: 'Participle' },
        ]));
      });

      it('decodes Infinitive Construct', () => {
        const result = decodeMorphology('HVqc');
        expect(result.parts).toEqual(expect.arrayContaining([
          { label: 'Conjugation', value: 'Infinitive Construct' },
        ]));
      });

      it('generates articleId from verb stem', () => {
        const result = decodeMorphology('HVqp3ms');
        expect(result.articleId).toBe('hebrew-verb-qal');
      });

      it('generates articleId for Niphal', () => {
        const result = decodeMorphology('HVni3ms');
        expect(result.articleId).toBe('hebrew-verb-niphal');
      });
    });

    describe('noun decoding', () => {
      it('decodes Common Masculine Singular Absolute', () => {
        const result = decodeMorphology('HNcmsa');
        expect(result.parts).toEqual(expect.arrayContaining([
          { label: 'Part of Speech', value: 'Noun' },
          { label: 'Type', value: 'Common' },
          { label: 'Gender', value: 'Masculine' },
          { label: 'Number', value: 'Singular' },
          { label: 'State', value: 'Absolute' },
        ]));
      });

      it('decodes Proper Feminine Plural Construct', () => {
        const result = decodeMorphology('HNpfpc');
        expect(result.parts).toEqual(expect.arrayContaining([
          { label: 'Type', value: 'Proper' },
          { label: 'Gender', value: 'Feminine' },
          { label: 'Number', value: 'Plural' },
          { label: 'State', value: 'Construct' },
        ]));
      });

      it('decodes Dual number', () => {
        const result = decodeMorphology('HNcmda');
        expect(result.parts).toEqual(expect.arrayContaining([
          { label: 'Number', value: 'Dual' },
        ]));
      });

      it('decodes Determined state', () => {
        const result = decodeMorphology('HNcmsd');
        expect(result.parts).toEqual(expect.arrayContaining([
          { label: 'State', value: 'Determined' },
        ]));
      });
    });

    describe('adjective decoding', () => {
      it('decodes Adjective Masculine Singular Absolute', () => {
        const result = decodeMorphology('HAmsa');
        expect(result.parts).toEqual(expect.arrayContaining([
          { label: 'Part of Speech', value: 'Adjective' },
          { label: 'Gender', value: 'Masculine' },
          { label: 'Number', value: 'Singular' },
          { label: 'State', value: 'Absolute' },
        ]));
      });
    });

    describe('pronoun decoding', () => {
      it('decodes Pronoun 3rd Masculine Singular', () => {
        const result = decodeMorphology('HP3ms');
        expect(result.parts).toEqual(expect.arrayContaining([
          { label: 'Part of Speech', value: 'Pronoun' },
          { label: 'Person', value: '3rd' },
          { label: 'Gender', value: 'Masculine' },
          { label: 'Number', value: 'Singular' },
        ]));
      });
    });

    describe('simple POS types', () => {
      it('decodes Conjunction', () => {
        const result = decodeMorphology('HC');
        expect(result.language).toBe('hebrew');
        expect(result.parts[0]).toEqual({ label: 'Part of Speech', value: 'Conjunction' });
        expect(result.parts).toHaveLength(1);
      });

      it('decodes Preposition', () => {
        const result = decodeMorphology('HR');
        expect(result.language).toBe('hebrew');
        expect(result.parts[0]).toEqual({ label: 'Part of Speech', value: 'Preposition' });
      });

      it('decodes Article', () => {
        const result = decodeMorphology('HT');
        expect(result.language).toBe('hebrew');
        expect(result.parts[0]).toEqual({ label: 'Part of Speech', value: 'Article' });
      });

      it('decodes Adverb', () => {
        const result = decodeMorphology('HD');
        expect(result.language).toBe('hebrew');
        expect(result.parts[0]).toEqual({ label: 'Part of Speech', value: 'Adverb' });
      });
    });

    describe('compound codes', () => {
      it('decodes compound code with / separator', () => {
        const result = decodeMorphology('HC/Vqp3ms');
        expect(result.language).toBe('hebrew');
        // First segment should be Conjunction
        expect(result.parts[0]).toEqual({ label: 'Part of Speech', value: 'Conjunction' });
        // Second segment should be prefixed with "+ "
        const verbPart = result.parts.find((p) => p.value.includes('+ Verb'));
        expect(verbPart).toBeDefined();
      });

      it('handles multiple compound segments', () => {
        const result = decodeMorphology('HC/R/Ncmsa');
        expect(result.language).toBe('hebrew');
        expect(result.parts.length).toBeGreaterThan(2);
      });

      it('generates articleId from first verb in compound', () => {
        const result = decodeMorphology('HC/Vqp3ms');
        expect(result.articleId).toBe('hebrew-verb-qal');
      });

      it('does not prefix first segment with +', () => {
        const result = decodeMorphology('HC/Vqp3ms');
        expect(result.parts[0].value).not.toContain('+ ');
      });
    });

    describe('edge cases', () => {
      it('handles unknown Hebrew stem code gracefully', () => {
        const result = decodeMorphology('HVzp3ms');
        // Should still decode, passing 'z' through verbatim
        expect(result.language).toBe('hebrew');
        expect(result.parts).toEqual(expect.arrayContaining([
          { label: 'Stem', value: 'z' },
        ]));
        expect(result.articleId).toBeUndefined();
      });

      it('handles single-char Hebrew segment', () => {
        const result = decodeMorphology('HN');
        expect(result.language).toBe('hebrew');
        expect(result.parts[0]).toEqual({ label: 'Part of Speech', value: 'Noun' });
      });

      it('handles empty segment after /', () => {
        const result = decodeMorphology('HC/');
        expect(result.language).toBe('hebrew');
        // Should still have at least the conjunction part
        expect(result.parts.length).toBeGreaterThanOrEqual(1);
      });
    });
  });
});
