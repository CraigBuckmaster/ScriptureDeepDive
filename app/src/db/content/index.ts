/**
 * db/content/index.ts — Barrel re-export for all content queries.
 *
 * Consumers import from '../db/content' — this file ensures
 * zero breaking changes after the decomposition.
 */

export { getBooks, getBook, getLiveBooks, getBookIntro } from './books';
export {
  getChapter, getChapterById, getDifficultyForBook, getSections, getSectionPanels,
  getSectionPanelsByType, getChapterPanels, getChapterPanelByType,
  getVerses, getVerse, getInterlinearWords, getVHLGroups,
  getConcordanceResults, getConcordanceCount,
  getRedLetterVerses,
} from './chapters';
export { getAllScholars, getScholar, getScholarsForBook } from './scholars';
export {
  getAllPeople, getPerson, getPersonChildren, getSpousesOf,
  getPersonJourney, getPersonLegacyRefs, hasPersonJourney, getPeopleWithJourneys,
} from './people';
export { getPlaces, getPlace, getMapStories, getMapStory, getAncientBorders } from './places';
export {
  getAllWordStudies, getWordStudy, getSynopticEntries, getSynopticEntry,
  getHarmonyEntries, getHarmonyEntry, getOTParallelEntries,
  getCrossRefThreads, getCrossRefThread, getCrossRefPairsForVerse,
  getTimelineEvents, getTimelinePeople, getAllTimelineEntries,
  getGenealogyConfig, getTimelineEraConfig,
  getEras, getEra,
  getRedemptiveActs, getRedemptiveAct,
  getLexiconEntry, getLexiconEntries,
  getTopics, getTopic, searchTopics,
} from './reference';
export type { EraConfig, EraRow } from './reference';
export {
  getAllProphecyChains, getProphecyChain, getProphecyChainsByCategory,
  getProphecyChainsForChapter, getAllConcepts, getConcept,
  getAllDifficultPassages, getDifficultPassage, getDifficultPassagesByCategory,
  getDifficultPassagesForChapter,
} from './features';
export {
  getDebateTopics, getDebateTopic, getDebateTopicsForChapter,
  searchDebateTopics, getDebateTopicScholars,
} from './debates';
export {
  getLifeTopicCategories, getLifeTopics, getLifeTopic,
  searchLifeTopics, getLifeTopicVerses, getLifeTopicScholars,
  getRelatedLifeTopics,
} from './lifeTopics';
export {
  getAllLenses, getLensesForChapter, getChapterLensContent,
} from './hermeneutics';
export {
  getAllEras, getInterpretationsForVerse, getInterpretationsForChapter,
  getInterpretationsByEra, getInterpretation,
} from './interpretations';
export {
  getAllDiscoveries, getDiscovery, getDiscoveriesForChapter,
  getDiscoveriesByCategory, searchDiscoveries, getDiscoveryVerseLinks,
} from './archaeology';
export {
  getGrammarArticle, getGrammarArticles, searchGrammarArticles,
} from './grammar';
export { getContentImages, getFeaturedImages } from './images';
export { searchVerses, searchPeople } from './search';
export { getContentStats } from './stats';
export type { ContentStats } from './stats';
export {
  getContentLibraryCounts, getContentLibrary, searchContentLibrary,
} from './contentLibrary';
