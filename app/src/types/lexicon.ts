/**
 * types/lexicon.ts — Lexicon entry types for Thayer's Greek and BDB Hebrew.
 */

export interface DefinitionNode {
  num?: string;
  letter?: string;
  text: string;
  subs?: DefinitionNode[];
}

export interface DefinitionJSON {
  short: string;
  full: DefinitionNode[];
}

export interface LexiconEntry {
  strongs: string;
  language: string;
  lemma: string;
  transliteration: string;
  pronunciation: string | null;
  pos: string | null;
  definition_json: string;
  etymology: string | null;
  related_strongs_json: string | null;
  source: string;
}
