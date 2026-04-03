/**
 * morphologyDecoder.ts — Pure-function decoders for Greek (Robinson's) and
 * Hebrew (ETCBC) morphology codes.
 *
 * Covers the common patterns (~80 % of codes). Unknown segments are passed
 * through verbatim so the UI always shows *something* useful.
 */

export interface DecodedMorphology {
  language: 'greek' | 'hebrew';
  summary: string;       // e.g. "Verb, Present Active Indicative, 3rd Singular"
  parts: { label: string; value: string }[];
  articleId?: string;     // linked grammar article ID if available
}

// ── Greek (Robinson's Morphology Codes) ─────────────────────────────────

const GREEK_POS: Record<string, string> = {
  'V':    'Verb',
  'N':    'Noun',
  'A':    'Adjective',
  'T':    'Article',
  'CONJ': 'Conjunction',
  'PREP': 'Preposition',
  'ADV':  'Adverb',
  'PRT':  'Particle',
  'P':    'Pronoun',       // P- prefix (sometimes just P)
  'D':    'Demonstrative',
  'R':    'Relative',
  'C':    'Reciprocal',
  'X':    'Indefinite',
  'F':    'Reflexive',
  'I':    'Interrogative',
  'S':    'Possessive',
};

const GREEK_TENSE: Record<string, string> = {
  P: 'Present', I: 'Imperfect', F: 'Future', A: 'Aorist',
  X: 'Perfect', Y: 'Pluperfect', '2A': '2nd Aorist', '2F': '2nd Future',
  '2P': '2nd Perfect', '2Y': '2nd Pluperfect',
};

const GREEK_VOICE: Record<string, string> = {
  A: 'Active', M: 'Middle', P: 'Passive', E: 'Middle/Passive',
  D: 'Middle Deponent', O: 'Passive Deponent', N: 'Middle/Passive Deponent',
  Q: 'Impersonal Active',
};

const GREEK_MOOD: Record<string, string> = {
  I: 'Indicative', S: 'Subjunctive', O: 'Optative', M: 'Imperative',
  N: 'Infinitive', P: 'Participle',
};

const GREEK_PERSON: Record<string, string> = { '1': '1st', '2': '2nd', '3': '3rd' };

const GREEK_NUMBER: Record<string, string> = { S: 'Singular', P: 'Plural' };

const GREEK_CASE: Record<string, string> = {
  N: 'Nominative', G: 'Genitive', D: 'Dative', A: 'Accusative', V: 'Vocative',
};

const GREEK_GENDER: Record<string, string> = {
  M: 'Masculine', F: 'Feminine', N: 'Neuter',
};

function decodeGreek(code: string): DecodedMorphology {
  const parts: { label: string; value: string }[] = [];
  let articleId: string | undefined;

  // Split on first hyphen: POS-detail
  const hyphenIdx = code.indexOf('-');
  let posCode: string;
  let detail: string;

  if (hyphenIdx >= 0) {
    posCode = code.slice(0, hyphenIdx);
    detail = code.slice(hyphenIdx + 1);
  } else {
    posCode = code;
    detail = '';
  }

  // Resolve POS — handle two-char pronoun prefixes (P-, D-, R-, etc.)
  let posLabel: string;
  if (posCode.length >= 2 && posCode.endsWith('-')) {
    posCode = posCode.slice(0, -1);
  }
  posLabel = GREEK_POS[posCode] ?? posCode;
  parts.push({ label: 'Part of Speech', value: posLabel });

  const isVerb = posCode === 'V';
  const isNominal = ['N', 'A', 'T', 'P', 'D', 'R', 'C', 'X', 'F', 'I', 'S'].includes(posCode);

  if (isVerb && detail.length >= 3) {
    // Verb: Tense Voice Mood [Person Number] — e.g. PAI-3S or PAI3S
    // Sometimes the detail contains an extra hyphen before person-number
    const cleanDetail = detail.replace(/-/g, '');
    const tense = GREEK_TENSE[cleanDetail[0]] ?? cleanDetail[0];
    const voice = GREEK_VOICE[cleanDetail[1]] ?? cleanDetail[1];
    const mood = GREEK_MOOD[cleanDetail[2]] ?? cleanDetail[2];
    parts.push({ label: 'Tense', value: tense });
    parts.push({ label: 'Voice', value: voice });
    parts.push({ label: 'Mood', value: mood });

    if (cleanDetail.length >= 4) {
      const person = GREEK_PERSON[cleanDetail[3]] ?? cleanDetail[3];
      parts.push({ label: 'Person', value: person });
    }
    if (cleanDetail.length >= 5) {
      const number = GREEK_NUMBER[cleanDetail[4]] ?? cleanDetail[4];
      parts.push({ label: 'Number', value: number });
    }
    // Participles may also carry case-number-gender
    if (mood === 'Participle' && cleanDetail.length >= 7) {
      const cas = GREEK_CASE[cleanDetail[4]] ?? cleanDetail[4];
      const num = GREEK_NUMBER[cleanDetail[5]] ?? cleanDetail[5];
      const gen = GREEK_GENDER[cleanDetail[6]] ?? cleanDetail[6];
      // Replace person/number with case/number/gender
      parts.splice(4);
      parts.push({ label: 'Case', value: cas });
      parts.push({ label: 'Number', value: num });
      parts.push({ label: 'Gender', value: gen });
    }

    articleId = `greek-verb-${tense.toLowerCase()}`;
  } else if (isNominal && detail.length >= 1) {
    // Nominal: Case Number Gender — e.g. NSM, GSF
    const cleanDetail = detail.replace(/-/g, '');
    if (cleanDetail.length >= 1) {
      const cas = GREEK_CASE[cleanDetail[0]] ?? cleanDetail[0];
      parts.push({ label: 'Case', value: cas });
    }
    if (cleanDetail.length >= 2) {
      const num = GREEK_NUMBER[cleanDetail[1]] ?? cleanDetail[1];
      parts.push({ label: 'Number', value: num });
    }
    if (cleanDetail.length >= 3) {
      const gen = GREEK_GENDER[cleanDetail[2]] ?? cleanDetail[2];
      parts.push({ label: 'Gender', value: gen });
    }

    articleId = `greek-${posLabel.toLowerCase()}-case`;
  }

  const summary = parts.map((p) => p.value).join(', ');
  return { language: 'greek', summary, parts, articleId };
}

// ── Hebrew (ETCBC Codes) ────────────────────────────────────────────────

const HEBREW_POS: Record<string, string> = {
  N: 'Noun', V: 'Verb', P: 'Pronoun', A: 'Adjective',
  D: 'Adverb', C: 'Conjunction', R: 'Preposition', T: 'Article',
  S: 'Suffix',
};

const HEBREW_NOUN_TYPE: Record<string, string> = {
  c: 'Common', p: 'Proper',
};

const HEBREW_GENDER: Record<string, string> = {
  m: 'Masculine', f: 'Feminine', c: 'Common', b: 'Both',
};

const HEBREW_NUMBER: Record<string, string> = {
  s: 'Singular', p: 'Plural', d: 'Dual',
};

const HEBREW_STATE: Record<string, string> = {
  a: 'Absolute', c: 'Construct', d: 'Determined',
};

const HEBREW_STEM: Record<string, string> = {
  q: 'Qal', n: 'Niphal', p: 'Piel', P: 'Pual',
  h: 'Hiphil', H: 'Hophal', t: 'Hithpael',
  o: 'Polel', O: 'Polal', r: 'Hithpolel',
  m: 'Poel', M: 'Poal', k: 'Palel', K: 'Pulal',
  Q: 'Qal Passive', N: 'Niphal', l: 'Pilpel', L: 'Polpal',
  f: 'Hithpalpel', D: 'Nithpael',
};

const HEBREW_CONJ: Record<string, string> = {
  p: 'Perfect', i: 'Imperfect', w: 'Wayyiqtol', v: 'Imperative',
  a: 'Infinitive Absolute', c: 'Infinitive Construct', r: 'Participle',
  s: 'Sequential Perfect',
};

const HEBREW_PERSON: Record<string, string> = { '1': '1st', '2': '2nd', '3': '3rd' };

function decodeHebrewSegment(seg: string): { label: string; value: string }[] {
  const parts: { label: string; value: string }[] = [];
  if (seg.length < 1) return parts;

  const posChar = seg[0];
  const posLabel = HEBREW_POS[posChar] ?? posChar;
  parts.push({ label: 'Part of Speech', value: posLabel });

  let idx = 1;

  if (posChar === 'V') {
    // Verb: stem + conjugation + person + gender + number
    if (idx < seg.length) {
      const stem = HEBREW_STEM[seg[idx]] ?? seg[idx];
      parts.push({ label: 'Stem', value: stem });
      idx++;
    }
    if (idx < seg.length) {
      const conj = HEBREW_CONJ[seg[idx]] ?? seg[idx];
      parts.push({ label: 'Conjugation', value: conj });
      idx++;
    }
    if (idx < seg.length) {
      const person = HEBREW_PERSON[seg[idx]] ?? seg[idx];
      parts.push({ label: 'Person', value: person });
      idx++;
    }
    if (idx < seg.length) {
      const gender = HEBREW_GENDER[seg[idx]] ?? seg[idx];
      parts.push({ label: 'Gender', value: gender });
      idx++;
    }
    if (idx < seg.length) {
      const number = HEBREW_NUMBER[seg[idx]] ?? seg[idx];
      parts.push({ label: 'Number', value: number });
      idx++;
    }
  } else if (posChar === 'N') {
    // Noun: type + gender + number + state
    if (idx < seg.length) {
      const ntype = HEBREW_NOUN_TYPE[seg[idx]] ?? seg[idx];
      parts.push({ label: 'Type', value: ntype });
      idx++;
    }
    if (idx < seg.length) {
      const gender = HEBREW_GENDER[seg[idx]] ?? seg[idx];
      parts.push({ label: 'Gender', value: gender });
      idx++;
    }
    if (idx < seg.length) {
      const number = HEBREW_NUMBER[seg[idx]] ?? seg[idx];
      parts.push({ label: 'Number', value: number });
      idx++;
    }
    if (idx < seg.length) {
      const state = HEBREW_STATE[seg[idx]] ?? seg[idx];
      parts.push({ label: 'State', value: state });
      idx++;
    }
  } else if (posChar === 'A') {
    // Adjective: gender + number + state
    if (idx < seg.length) {
      const gender = HEBREW_GENDER[seg[idx]] ?? seg[idx];
      parts.push({ label: 'Gender', value: gender });
      idx++;
    }
    if (idx < seg.length) {
      const number = HEBREW_NUMBER[seg[idx]] ?? seg[idx];
      parts.push({ label: 'Number', value: number });
      idx++;
    }
    if (idx < seg.length) {
      const state = HEBREW_STATE[seg[idx]] ?? seg[idx];
      parts.push({ label: 'State', value: state });
      idx++;
    }
  } else if (posChar === 'P') {
    // Pronoun: person + gender + number
    if (idx < seg.length) {
      const person = HEBREW_PERSON[seg[idx]] ?? seg[idx];
      parts.push({ label: 'Person', value: person });
      idx++;
    }
    if (idx < seg.length) {
      const gender = HEBREW_GENDER[seg[idx]] ?? seg[idx];
      parts.push({ label: 'Gender', value: gender });
      idx++;
    }
    if (idx < seg.length) {
      const number = HEBREW_NUMBER[seg[idx]] ?? seg[idx];
      parts.push({ label: 'Number', value: number });
      idx++;
    }
  }
  // For C, R, T, D, S — just the POS label is enough

  return parts;
}

function decodeHebrew(code: string): DecodedMorphology {
  // Strip leading H if present (H prefix = Hebrew)
  const raw = code.startsWith('H') ? code.slice(1) : code;

  // Handle compound codes separated by /
  const segments = raw.split('/');
  const allParts: { label: string; value: string }[] = [];
  let articleId: string | undefined;

  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    const segParts = decodeHebrewSegment(seg);
    if (segments.length > 1 && segParts.length > 0) {
      // Prefix segment label with index
      segParts[0] = {
        label: segParts[0].label,
        value: (i > 0 ? '+ ' : '') + segParts[0].value,
      };
    }
    allParts.push(...segParts);

    // Link to grammar article based on first verb stem found
    if (seg.startsWith('V') && seg.length >= 2 && !articleId) {
      const stemKey = HEBREW_STEM[seg[1]];
      if (stemKey) {
        articleId = `hebrew-verb-${stemKey.toLowerCase()}`;
      }
    }
  }

  const summary = allParts.map((p) => p.value).join(', ');
  return { language: 'hebrew', summary, parts: allParts, articleId };
}

// ── Public API ──────────────────────────────────────────────────────────

/**
 * Decode a morphology code string into a human-readable breakdown.
 * Handles both Greek (Robinson's) and Hebrew (ETCBC) codes.
 */
export function decodeMorphology(code: string): DecodedMorphology {
  if (!code || code.trim().length === 0) {
    return {
      language: 'greek',
      summary: code ?? '',
      parts: [],
    };
  }

  const trimmed = code.trim();

  // Hebrew codes start with 'H' followed by a POS letter (not a valid Greek start)
  // or start directly with ETCBC patterns like 'Vq' 'Nc' etc.
  const isHebrew =
    trimmed.startsWith('H') &&
    trimmed.length >= 2 &&
    /[A-Z]/.test(trimmed[1]) &&
    !['HEB'].includes(trimmed.slice(0, 3)) &&
    HEBREW_POS[trimmed[1]] !== undefined;

  // Also detect compound Hebrew codes (e.g. HC/Vqw3ms)
  const isCompoundHebrew = trimmed.startsWith('H') && trimmed.includes('/');

  if (isHebrew || isCompoundHebrew) {
    return decodeHebrew(trimmed);
  }

  return decodeGreek(trimmed);
}
