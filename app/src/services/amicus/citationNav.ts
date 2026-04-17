/**
 * services/amicus/citationNav.ts — Resolve a citation chunk id to a
 * cross-tab navigation action.
 *
 * chunk_id format is `{source_type}:{source_id}`. Each source_type maps to
 * a different destination screen on a potentially different tab (#1456).
 */
import type { NavigationProp, ParamListBase } from '@react-navigation/native';
import { getDb } from '@/db/database';
import { logger } from '@/utils/logger';

export interface CitationTarget {
  chunk_id: string;
  source_type: string;
  source_id: string;
  metadata?: Record<string, unknown>;
}

export interface MetaFaqArticle {
  id: string;
  title: string;
  body: string;
}

/**
 * Result of a navigation attempt. `kind: 'navigated'` means the caller doesn't
 * need to do anything further; `kind: 'modal'` means the caller must render
 * a modal with the returned payload; `kind: 'unresolved'` means we couldn't
 * find a destination (caller should toast "Source unavailable").
 */
export type NavOutcome =
  | { kind: 'navigated' }
  | { kind: 'modal'; modal: 'meta_faq'; article: MetaFaqArticle }
  | { kind: 'unresolved'; reason: string };

export async function navigateToCitation(
  target: CitationTarget,
  navigation: NavigationProp<ParamListBase>,
): Promise<NavOutcome> {
  try {
    switch (target.source_type) {
      case 'section_panel':
        return navigateSectionPanel(target, navigation);
      case 'chapter_panel':
        return navigateChapterPanel(target, navigation);
      case 'word_study':
        return navigateExplore(navigation, 'WordStudyDetail', {
          wordId: target.source_id,
        });
      case 'lexicon_entry':
        return navigateExplore(navigation, 'DictionaryDetail', {
          entryId: target.source_id,
        });
      case 'debate_topic':
        return navigateExplore(navigation, 'DebateDetail', {
          topicId: target.source_id,
        });
      case 'cross_ref_thread_note':
        return navigateCrossRefThreadNote(target, navigation);
      case 'journey_stop':
        return navigateJourneyStop(target, navigation);
      case 'meta_faq':
        return await loadMetaFaqModal(target.source_id);
      default:
        logger.warn('Amicus', `unknown citation source_type: ${target.source_type}`);
        return { kind: 'unresolved', reason: `unknown source_type ${target.source_type}` };
    }
  } catch (err) {
    logger.error('Amicus', 'navigateToCitation crashed', err);
    return { kind: 'unresolved', reason: (err as Error).message };
  }
}

// ── source_id parsing ─────────────────────────────────────────────────

const SECTION_PANEL_RE = /^([a-z0-9_]+)-(\d+)-s(\d+)-([a-z0-9]+)$/;
const CHAPTER_PANEL_RE = /^([a-z0-9_]+)-(\d+)-([a-z0-9]+)$/;
const JOURNEY_STOP_RE = /^([a-z_]+)-([a-z0-9-]+)-(\d+)$/;
const CROSS_REF_NOTE_RE = /^([a-z0-9-]+)-(\d+)$/;

export interface ParsedSectionPanel {
  bookId: string;
  chapterNum: number;
  sectionNum: number;
  panelType: string;
}

export function parseSectionPanelId(sourceId: string): ParsedSectionPanel | null {
  const m = SECTION_PANEL_RE.exec(sourceId);
  if (!m) return null;
  return {
    bookId: m[1]!,
    chapterNum: Number(m[2]),
    sectionNum: Number(m[3]),
    panelType: m[4]!,
  };
}

export interface ParsedChapterPanel {
  bookId: string;
  chapterNum: number;
  panelType: string;
}

export function parseChapterPanelId(sourceId: string): ParsedChapterPanel | null {
  const m = CHAPTER_PANEL_RE.exec(sourceId);
  if (!m) return null;
  return {
    bookId: m[1]!,
    chapterNum: Number(m[2]),
    panelType: m[3]!,
  };
}

export interface ParsedJourneyStop {
  journeyType: string;
  journeyId: string;
  stopOrder: number;
}

export function parseJourneyStopId(sourceId: string): ParsedJourneyStop | null {
  const m = JOURNEY_STOP_RE.exec(sourceId);
  if (!m) return null;
  return {
    journeyType: m[1]!,
    journeyId: m[2]!,
    stopOrder: Number(m[3]),
  };
}

export interface ParsedCrossRefNote {
  threadId: string;
  idx: number;
}

export function parseCrossRefThreadNoteId(sourceId: string): ParsedCrossRefNote | null {
  const m = CROSS_REF_NOTE_RE.exec(sourceId);
  if (!m) return null;
  return {
    threadId: m[1]!,
    idx: Number(m[2]),
  };
}

// ── Dispatch helpers ──────────────────────────────────────────────────

function navigateSectionPanel(
  target: CitationTarget,
  navigation: NavigationProp<ParamListBase>,
): NavOutcome {
  const parsed = parseSectionPanelId(target.source_id);
  if (!parsed) {
    logger.warn('Amicus', `malformed section_panel id: ${target.source_id}`);
    return { kind: 'unresolved', reason: 'malformed section_panel id' };
  }
  crossTabNavigate(navigation, 'ReadTab', {
    screen: 'Chapter',
    params: {
      bookId: parsed.bookId,
      chapterNum: parsed.chapterNum,
      openPanel: {
        sectionNum: parsed.sectionNum,
        panelType: parsed.panelType,
      },
    },
  });
  return { kind: 'navigated' };
}

function navigateChapterPanel(
  target: CitationTarget,
  navigation: NavigationProp<ParamListBase>,
): NavOutcome {
  const parsed = parseChapterPanelId(target.source_id);
  if (!parsed) {
    logger.warn('Amicus', `malformed chapter_panel id: ${target.source_id}`);
    return { kind: 'unresolved', reason: 'malformed chapter_panel id' };
  }
  crossTabNavigate(navigation, 'ReadTab', {
    screen: 'Chapter',
    params: {
      bookId: parsed.bookId,
      chapterNum: parsed.chapterNum,
      openPanel: { panelType: parsed.panelType },
    },
  });
  return { kind: 'navigated' };
}

function navigateExplore(
  navigation: NavigationProp<ParamListBase>,
  screen: string,
  params: Record<string, unknown>,
): NavOutcome {
  crossTabNavigate(navigation, 'ExploreTab', { screen, params });
  return { kind: 'navigated' };
}

function navigateJourneyStop(
  target: CitationTarget,
  navigation: NavigationProp<ParamListBase>,
): NavOutcome {
  const parsed = parseJourneyStopId(target.source_id);
  if (!parsed) {
    logger.warn('Amicus', `malformed journey_stop id: ${target.source_id}`);
    return { kind: 'unresolved', reason: 'malformed journey_stop id' };
  }
  crossTabNavigate(navigation, 'ExploreTab', {
    screen: 'JourneyDetail',
    params: { journeyId: parsed.journeyId },
  });
  return { kind: 'navigated' };
}

function navigateCrossRefThreadNote(
  target: CitationTarget,
  navigation: NavigationProp<ParamListBase>,
): NavOutcome {
  const parsed = parseCrossRefThreadNoteId(target.source_id);
  if (!parsed) {
    logger.warn('Amicus', `malformed cross_ref_thread_note id: ${target.source_id}`);
    return { kind: 'unresolved', reason: 'malformed cross_ref_thread_note id' };
  }
  crossTabNavigate(navigation, 'ExploreTab', {
    screen: 'ThreadDetail',
    params: { threadId: parsed.threadId },
  });
  return { kind: 'navigated' };
}

async function loadMetaFaqModal(sourceId: string): Promise<NavOutcome> {
  // Meta-FAQ content is bundled in the content/meta_faq/ markdown files.
  // They're not loaded into scripture.db as first-class rows — they're
  // chunked for embedding only (see #1449). The chunk_id is `meta_faq:{id}`,
  // and we can fetch the body from chunk_text.
  try {
    const row = await getDb().getFirstAsync<{ chunk_id: string; text: string }>(
      'SELECT chunk_id, text FROM chunk_text WHERE chunk_id = ?',
      [`meta_faq:${sourceId}`],
    );
    if (!row) {
      return { kind: 'unresolved', reason: `meta_faq not found: ${sourceId}` };
    }
    // Our chunker stores "title\n\nbody..." — split on the first blank line.
    const [firstLine, ...rest] = row.text.split('\n');
    const title = firstLine?.trim() ?? sourceId;
    const body = rest.join('\n').trim();
    return {
      kind: 'modal',
      modal: 'meta_faq',
      article: { id: sourceId, title, body },
    };
  } catch (err) {
    return { kind: 'unresolved', reason: (err as Error).message };
  }
}

/**
 * Bubble up to the root tab navigator and navigate to another tab's stack.
 *
 * Pattern: from an Amicus stack screen the immediate parent is the Amicus
 * stack navigator; its parent is the root tab navigator that knows about
 * ReadTab / ExploreTab / etc.
 */
function crossTabNavigate(
  navigation: NavigationProp<ParamListBase>,
  tab: string,
  payload: { screen: string; params: Record<string, unknown> },
): void {
  const root = navigation.getParent<NavigationProp<ParamListBase>>();
  if (!root) {
    logger.warn('Amicus', `no parent nav to jump to ${tab}`);
    return;
  }
  root.navigate(tab, payload);
}
