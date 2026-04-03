/**
 * types/dictionary.ts — Type definitions for Bible Dictionary feature.
 */

export interface DictionaryEntry {
  id: string;
  term: string;
  definition: string;
  refs_json: string | null;
  related_json: string | null;
  category: string | null;
  cross_person_id: string | null;
  cross_place_id: string | null;
  cross_word_study_id: string | null;
  cross_concept_id: string | null;
  source: string;
}

export interface DictionaryEntryParsed {
  id: string;
  term: string;
  definition: string;
  refs: string[];
  related: string[];
  category: string;
  crossLinks: {
    personId: string | null;
    placeId: string | null;
    wordStudyId: string | null;
    conceptId: string | null;
  };
  source: string;
}

export type DictionaryCategory =
  | 'people'
  | 'places'
  | 'theology'
  | 'customs'
  | 'objects'
  | 'nature'
  | 'groups'
  | 'general';

export const CATEGORY_LABELS: Record<DictionaryCategory, string> = {
  people: 'People',
  places: 'Places',
  theology: 'Theology',
  customs: 'Customs & Practices',
  objects: 'Objects & Artifacts',
  nature: 'Nature',
  groups: 'Groups & Nations',
  general: 'General',
};
