/**
 * utils/chapterItems.ts — Flat item model for the chapter reader (#1871).
 *
 * Epic D (#1866) step 1: express everything ChapterScreen/ChapterVerseList
 * currently render as a flat, ordered list of discriminated-union items so
 * the FlashList swap (#1872) is a pure rendering change.
 *
 * Pure module: no React, no hooks, no I/O. `buildChapterItems` is a
 * deterministic function of its inputs.
 *
 * Coverage map (current render tree → items):
 *   ChapterHeader                        → chapterHeader
 *   GenreBanner (study/deep)             → genreBanner
 *   per section:
 *     GoldSeparator (between sections)   → sectionHeader.showSeparator
 *     SectionHeader                      → sectionHeader
 *     VerseBlock (section's verse run)   → verseBlock
 *     ButtonRow (+ inline open panel)    → panelRow (study/deep)
 *     StudyCoachCard after section       → coachingCard variant 'section'
 *   ScholarlyBlock + scholar disclaimer  → scholarlyBlock (study/deep)
 *   ChapterCoachingCard                  → coachingCard variant 'chapter'
 *   RelatedLifeTopics                    → relatedContent variant 'lifeTopics'
 *   PrayerPromptCard                     → prayerPrompt
 *   MapChip (#1322)                      → mapChip (study/deep)
 *   RelatedContentCarousel               → relatedContent variant 'carousel'
 *   next-chapter hint                    → footer
 *
 * Ephemeral UI state (which panel is open, TTS highlight, dismissed-tip
 * animation) stays with the renderer — the model only carries what exists
 * for the chapter. The open panel renders inside its section's panelRow.
 *
 * Mode notes: 'study' and 'deep' currently render identically (the PR-2
 * parity bridge in ChapterScreen only distinguishes 'read'); the model
 * mirrors that, so `deep` gates nothing extra yet.
 */

import type {
  Section,
  SectionPanel,
  ChapterPanel,
  CoachingTip,
  ChapterCoaching,
} from '../types';
import type { ChapterMode } from '../stores/settingsStore';
import { filterPanelKeys } from './lensPanelFilter';

export type { ChapterMode };

// ── Item union ─────────────────────────────────────────────────────

interface ItemBase {
  /** Stable list key: `${type}:${sectionNum}:${panelKey ?? verseStart}` (0 for chapter-level items). */
  key: string;
}

export interface ChapterHeaderItem extends ItemBase {
  type: 'chapterHeader';
}

export interface GenreBannerItem extends ItemBase {
  type: 'genreBanner';
  genreLabel: string;
  genreGuidance: string;
}

export interface SectionHeaderItem extends ItemBase {
  type: 'sectionHeader';
  sectionId: string;
  sectionNum: number;
  header: string;
  /** Gold separator above this section (every section but the first). */
  showSeparator: boolean;
}

export interface VerseBlockItem extends ItemBase {
  type: 'verseBlock';
  sectionId: string;
  sectionNum: number;
  /** Inclusive verse range this block renders (the section's run). */
  verseStart: number;
  verseEnd: number;
}

export interface PanelRowItem extends ItemBase {
  type: 'panelRow';
  sectionId: string;
  sectionNum: number;
  /** Panel keys for the ButtonRow, post-lens-filter, in render order. */
  panelKeys: string[];
}

export interface CoachingCardItem extends ItemBase {
  type: 'coachingCard';
  variant: 'section' | 'chapter';
  /** Present when variant === 'section'. */
  tip?: CoachingTip;
  /** Present when variant === 'chapter'. */
  coaching?: ChapterCoaching;
}

export interface PrayerPromptItem extends ItemBase {
  type: 'prayerPrompt';
  prompt: string;
}

export interface ScholarlyBlockItem extends ItemBase {
  type: 'scholarlyBlock';
  /** Chapter panel keys, post-lens-filter, in render order. */
  panelKeys: string[];
  /** Scholar-paraphrase disclaimer rendered beneath the block. */
  showDisclaimer: boolean;
}

export interface RelatedContentItem extends ItemBase {
  type: 'relatedContent';
  variant: 'lifeTopics' | 'carousel';
  /** Present when variant === 'lifeTopics'. */
  relatedLifeTopicsJson?: string | null;
}

export interface MapChipItem extends ItemBase {
  type: 'mapChip';
  storyId: string;
}

export interface FooterItem extends ItemBase {
  type: 'footer';
}

export type ChapterListItem =
  | ChapterHeaderItem
  | GenreBannerItem
  | SectionHeaderItem
  | VerseBlockItem
  | PanelRowItem
  | CoachingCardItem
  | PrayerPromptItem
  | ScholarlyBlockItem
  | RelatedContentItem
  | MapChipItem
  | FooterItem;

// ── Inputs ─────────────────────────────────────────────────────────

export interface ChapterCoachingOpts {
  /** Settings toggle — when false, no coaching items are emitted. */
  studyCoachEnabled: boolean;
  /** Per-section tips (parsed from coaching_json). */
  sectionTips: CoachingTip[];
  /** Chapter-level coaching (parsed from coaching_json). */
  chapterCoaching: ChapterCoaching | null;
  /** after_section values the user dismissed this visit. */
  dismissedTips: ReadonlySet<number>;
}

export interface BuildChapterItemsOpts {
  mode: ChapterMode;
  /**
   * Active lens panel-key allowlist (parsed panel_filter). Empty array =
   * no filtering, mirroring filterPanelKeys' authoring-bug safety net.
   */
  lensKeys: string[];
  coaching: ChapterCoachingOpts;
  /** Genre banner content (resolveGenre output), study/deep only. */
  genre?: { label: string; guidance: string } | null;
  prayerPrompt?: string | null;
  relatedLifeTopicsJson?: string | null;
  /** map_story_link_id — emits the mapChip slot in study/deep. */
  mapStoryLinkId?: string | null;
}

export interface BuildChapterItemsResult {
  items: ChapterListItem[];
  /** verse_num → index (in `items`) of the verseBlock that renders it. */
  verseIndexMap: Map<number, number>;
}

// ── Builder ────────────────────────────────────────────────────────

function makeKey(type: ChapterListItem['type'], sectionNum: number, tail: string | number): string {
  return `${type}:${sectionNum}:${tail}`;
}

/**
 * Flatten a chapter into the ordered list of reader items.
 *
 * @param sections       Sections with their panels (pre- or post-lens; the
 *                       lens filter is re-applied here idempotently).
 * @param chapterPanels  Chapter-level panels for the ScholarlyBlock.
 */
export function buildChapterItems(
  sections: Array<Section & { panels: SectionPanel[] }>,
  chapterPanels: ChapterPanel[],
  opts: BuildChapterItemsOpts,
): BuildChapterItemsResult {
  const { mode, lensKeys, coaching } = opts;
  // PR-1 parity bridge semantics: only 'read' hides study chrome.
  const isRead = mode === 'read';
  const lensFilter = lensKeys.length > 0 ? lensKeys : undefined;

  const items: ChapterListItem[] = [];
  const verseIndexMap = new Map<number, number>();

  // Chapter header — always first, all modes.
  items.push({ type: 'chapterHeader', key: makeKey('chapterHeader', 0, 0) });

  // Genre banner — study/deep only.
  if (!isRead && opts.genre) {
    items.push({
      type: 'genreBanner',
      key: makeKey('genreBanner', 0, 0),
      genreLabel: opts.genre.label,
      genreGuidance: opts.genre.guidance,
    });
  }

  // Sections.
  sections.forEach((sec, secIdx) => {
    items.push({
      type: 'sectionHeader',
      key: makeKey('sectionHeader', sec.section_num, sec.verse_start),
      sectionId: sec.id,
      sectionNum: sec.section_num,
      header: sec.header,
      showSeparator: secIdx > 0,
    });

    const verseBlockIndex = items.length;
    items.push({
      type: 'verseBlock',
      key: makeKey('verseBlock', sec.section_num, sec.verse_start),
      sectionId: sec.id,
      sectionNum: sec.section_num,
      verseStart: sec.verse_start,
      verseEnd: sec.verse_end,
    });
    for (let v = sec.verse_start; v <= sec.verse_end; v++) {
      verseIndexMap.set(v, verseBlockIndex);
    }

    if (!isRead) {
      const panelKeys = filterPanelKeys(
        sec.panels.map((p) => p.panel_type),
        lensFilter,
      );
      items.push({
        type: 'panelRow',
        key: makeKey('panelRow', sec.section_num, sec.verse_start),
        sectionId: sec.id,
        sectionNum: sec.section_num,
        panelKeys,
      });

      // Coaching tip after this section.
      if (coaching.studyCoachEnabled) {
        const tip = coaching.sectionTips.find((t) => t.after_section === sec.section_num);
        if (tip && !coaching.dismissedTips.has(tip.after_section)) {
          items.push({
            type: 'coachingCard',
            key: makeKey('coachingCard', sec.section_num, 'tip'),
            variant: 'section',
            tip,
          });
        }
      }
    }
  });

  if (!isRead) {
    // Chapter-level scholarly block + disclaimer.
    items.push({
      type: 'scholarlyBlock',
      key: makeKey('scholarlyBlock', 0, 0),
      panelKeys: filterPanelKeys(
        chapterPanels.map((p) => p.panel_type),
        lensFilter,
      ),
      showDisclaimer: true,
    });

    // Chapter-level coaching card.
    if (coaching.studyCoachEnabled && coaching.chapterCoaching) {
      items.push({
        type: 'coachingCard',
        key: makeKey('coachingCard', 0, 'chapter'),
        variant: 'chapter',
        coaching: coaching.chapterCoaching,
      });
    }
  }

  // Related life topics — all modes (renderer no-ops on empty JSON).
  if (opts.relatedLifeTopicsJson) {
    items.push({
      type: 'relatedContent',
      key: makeKey('relatedContent', 0, 'lifeTopics'),
      variant: 'lifeTopics',
      relatedLifeTopicsJson: opts.relatedLifeTopicsJson,
    });
  }

  // Prayer prompt — all modes.
  if (opts.prayerPrompt) {
    items.push({
      type: 'prayerPrompt',
      key: makeKey('prayerPrompt', 0, 0),
      prompt: opts.prayerPrompt,
    });
  }

  if (!isRead) {
    // Inline map chip (#1322) — slot exists when the chapter links a story;
    // the renderer hides it if the story fails to hydrate (as today).
    if (opts.mapStoryLinkId) {
      items.push({
        type: 'mapChip',
        key: makeKey('mapChip', 0, opts.mapStoryLinkId),
        storyId: opts.mapStoryLinkId,
      });
    }

    // Related-content carousel — data loads in the renderer's hook.
    items.push({
      type: 'relatedContent',
      key: makeKey('relatedContent', 0, 'carousel'),
      variant: 'carousel',
    });
  }

  // Footer — next-chapter hint slot, all modes.
  items.push({ type: 'footer', key: makeKey('footer', 0, 0) });

  return { items, verseIndexMap };
}
