/**
 * db/content/index.ts — Barrel re-export for all content queries.
 *
 * Consumers import from '../db/content' — this file ensures
 * zero breaking changes after the decomposition.
 */

export { getBooks, getBook, getLiveBooks, getBookIntro } from './books';
export {
  getChapter, getChapterById, getSections, getSectionPanels,
  getSectionPanelsByType, getChapterPanels, getChapterPanelByType,
  getVerses, getVerse, getInterlinearWords, getVHLGroups,
  getConcordanceResults, getConcordanceCount,
  getRedLetterVerses,
} from './chapters';
export { getAllScholars, getScholar, getScholarsForBook } from './scholars';
export { getAllPeople, getPerson, getPersonChildren, getSpousesOf } from './people';
export { getPlaces, getPlace, getMapStories, getMapStory } from './places';
export {
  getAllWordStudies, getWordStudy, getSynopticEntries,
  getCrossRefThreads, getCrossRefThread, getCrossRefPairsForVerse,
  getTimelineEvents, getTimelinePeople, getAllTimelineEntries,
  getGenealogyConfig, getTimelineEraConfig,
} from './reference';
export type { EraConfig } from './reference';
export {
  getAllProphecyChains, getProphecyChain, getProphecyChainsByCategory,
  getProphecyChainsForChapter, getAllConcepts, getConcept,
  getAllDifficultPassages, getDifficultPassage, getDifficultPassagesByCategory,
  getDifficultPassagesForChapter,
} from './features';
export { searchVerses, searchPeople } from './search';
export { getContentStats } from './stats';
export type { ContentStats } from './stats';
export {
  getContentLibraryCounts, getContentLibrary, searchContentLibrary,
} from './contentLibrary';
