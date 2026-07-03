/**
 * ChapterVerseList — FlashList host for the chapter reader (#1872, Epic D
 * #1866). Renders the flat ChapterListItem model from buildChapterItems
 * (#1871) through a per-type dispatch, replacing the eager ScrollView
 * render of every section/panel/card.
 *
 * Item components read ambient state from ChapterReaderContext (#963) —
 * only data that varies per-instance arrives as props.
 *
 * Scrolling: this component OWNS the scroller now. The forwarded ref
 * implements ReaderScrollable (scrollTo/scrollToEnd/scrollToIndex) over
 * the FlashList so useChapterScroll/useChapterTTS/useChapterPanels keep
 * their call sites. NOTE: the legacy onLayout y-maps report cell-relative
 * coordinates under virtualization — precise verse/section anchoring
 * moves to scrollToIndex + verseIndexMap in D3 (#1873).
 */

import React, {
  useMemo,
  useState,
  useCallback,
  useImperativeHandle,
  useRef,
  forwardRef,
} from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { NativeSyntheticEvent, NativeScrollEvent, StyleProp, ViewStyle } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import type { FlashListRef, ListRenderItemInfo } from '@shopify/flash-list';
import { useNavigation } from '@react-navigation/native';
import type { Section, SectionPanel, ChapterPanel } from '../types';
import { useRelatedContent } from '../hooks/useRelatedContent';
import { useMapChipData } from '../hooks/useMapChipData';
import { useTheme, spacing, fontFamily } from '../theme';
import type { ChapterListItem } from '../utils/chapterItems';
import { useChapterReader } from './ChapterReaderContext';
import { SectionHeader } from './SectionHeader';
import { VerseBlock } from './VerseBlock';
import { ButtonRow } from './ButtonRow';
import { PanelContainer } from './PanelContainer';
import { ScholarlyBlock } from './ScholarlyBlock';
import { StudyCoachCard } from './StudyCoachCard';
import { ChapterCoachingCard } from './ChapterCoachingCard';
import { PrayerPromptCard } from './PrayerPromptCard';
import { RelatedContentCarousel } from './RelatedContentCarousel';
import { MapChip } from './map/MapChip';
import { PanelInfoSheet } from './PanelInfoSheet';
import RelatedLifeTopics from './RelatedLifeTopics';
import { GenreBanner } from './GenreBanner';
import { ContextGuardBanner } from './guidedStudy';
import { GoldSeparator } from './GoldSeparator';

export interface ChapterMeta {
  timeline_link_event?: string | null;
  timeline_link_text?: string | null;
  map_story_link_id?: string | null;
  map_story_link_text?: string | null;
  book_name?: string;
}

/**
 * Imperative scroll surface exposed to the chapter hooks. Mirrors the
 * ScrollView subset they used pre-FlashList; scrollToIndex is the D3
 * (#1873) migration target.
 */
export interface ReaderScrollable {
  scrollTo: (opts: { x?: number; y: number; animated?: boolean }) => void;
  scrollToEnd: (opts?: { animated?: boolean }) => void;
  scrollToIndex: (opts: { index: number; animated?: boolean; viewOffset?: number }) => void;
}

type SectionWithPanels = Section & { panels: SectionPanel[] };

interface Props {
  /** Flat reader items — built by ChapterScreen via buildChapterItems
   *  (#1871/#1873) so scroll anchoring shares the same indices. */
  items: ChapterListItem[];
  sections: SectionWithPanels[];
  chapterPanels: ChapterPanel[];
  chapterMeta?: ChapterMeta | null;
  /** Pre-section chrome (lens guidance, ChapterHeader, banners) — rendered
   *  for the model's chapterHeader item so it scrolls with the list. */
  header?: React.ReactElement | null;
  /** Post-list chrome (next-chapter hint) — rendered for the footer item. */
  footer?: React.ReactElement | null;
  /** Context-guard CTA (D4 #1874) — navigate to the suggested chapter. */
  onReadContext?: (guard: import('../types').ProofTextGuard) => void;
  /** Guided-study CTA renderer (D4 #1874) — element built by ChapterScreen. */
  renderStudyCta?: () => React.ReactElement | null;
  onScroll?: (e: NativeSyntheticEvent<NativeScrollEvent>) => void;
  contentContainerStyle?: StyleProp<ViewStyle>;
}

const ChapterVerseList = forwardRef<ReaderScrollable, Props>(function ChapterVerseList(
  {
    items,
    sections,
    chapterPanels,
    chapterMeta,
    header,
    footer,
    onReadContext,
    renderStudyCta,
    onScroll,
    contentContainerStyle,
  }: Props,
  ref,
) {
  const { base } = useTheme();
  const { panel, callbacks, layout, coaching, display } = useChapterReader();
  const relatedItems = useRelatedContent(chapterMeta, chapterPanels);
  const { chipData } = useMapChipData(chapterMeta?.map_story_link_id);
  const navigation = useNavigation();
  const [panelInfoType, setPanelInfoType] = useState<string | null>(null);
  const listRef = useRef<FlashListRef<ChapterListItem>>(null);

  useImperativeHandle(
    ref,
    () => ({
      scrollTo: ({ y, animated }) => listRef.current?.scrollToOffset({ offset: y, animated }),
      scrollToEnd: (opts) => listRef.current?.scrollToEnd({ animated: opts?.animated }),
      scrollToIndex: (opts) => listRef.current?.scrollToIndex(opts),
    }),
    [],
  );

  const handlePanelLongPress = useCallback((type: string) => {
    setPanelInfoType(type);
  }, []);

  const handleGoToFullBio = useCallback(
    (scholarId: string) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (navigation as any).navigate('ExploreTab', { screen: 'ScholarBio', params: { scholarId } });
    },
    [navigation],
  );

  const sectionById = useMemo(() => {
    const map = new Map<string, SectionWithPanels>();
    for (const s of sections) map.set(s.id, s);
    return map;
  }, [sections]);

  const isFocus = display.tier === 'read';

  // ── Per-type item renderer ──────────────────────────────────
  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<ChapterListItem>) => {
      switch (item.type) {
        case 'chapterHeader':
          return header ?? null;

        case 'contextGuard':
          return (
            <ContextGuardBanner
              guard={item.guard}
              onReadContext={() => onReadContext?.(item.guard)}
            />
          );

        case 'studySessionCta':
          return renderStudyCta?.() ?? null;

        case 'genreBanner':
          return (
            <GenreBanner genreLabel={item.genreLabel} genreGuidance={item.genreGuidance} />
          );

        case 'sectionHeader': {
          const depth = isFocus ? undefined : panel.depthMap.get(item.sectionId);
          return (
            <>
              {item.showSeparator && (
                <GoldSeparator marginTop={spacing.md} marginBottom={spacing.md} />
              )}
              <View
                onLayout={(e) => layout.onSectionLayout(item.sectionId, e.nativeEvent.layout.y)}
              >
                <SectionHeader
                  header={item.header}
                  explored={depth?.explored}
                  total={depth?.total}
                />
              </View>
            </>
          );
        }

        case 'verseBlock': {
          const section = sectionById.get(item.sectionId);
          if (!section) return null;
          return <VerseBlockItem item={item} section={section} />;
        }

        case 'panelRow': {
          const section = sectionById.get(item.sectionId);
          if (!section) return null;
          return <PanelRowItem section={section} onPanelLongPress={handlePanelLongPress} />;
        }

        case 'coachingCard':
          if (item.variant === 'section' && item.tip) {
            const tip = item.tip;
            return (
              <StudyCoachCard
                tip={tip.tip}
                tone={tip.tone}
                onDismiss={() => coaching.onDismissTip(tip.after_section)}
              />
            );
          }
          if (item.variant === 'chapter' && item.coaching) {
            return <ChapterCoachingCard coaching={item.coaching} />;
          }
          return null;

        case 'scholarlyBlock':
          return (
            <>
              <ScholarlyBlock
                chapterPanels={chapterPanels}
                activePanel={panel.activeChapterPanelType}
                onToggle={callbacks.handleChapterPanelToggle}
                onLongPress={handlePanelLongPress}
                onClose={callbacks.clearActivePanel}
                onRefPress={callbacks.onRefPress}
                defaultTab={
                  panel.openPanel && !panel.openPanel.sectionNum && panel.openPanel.tabKey
                    ? panel.openPanel.tabKey
                    : undefined
                }
              />
              {item.showDisclaimer && (
                <Text style={[styles.scholarDisclaimer, { color: base.textMuted }]}>
                  Scholar commentary panels present paraphrased summaries of positions found in
                  published works and are not direct quotations. For exact wording, consult the
                  original sources cited.
                </Text>
              )}
            </>
          );

        case 'relatedContent':
          if (item.variant === 'lifeTopics') {
            return <RelatedLifeTopics relatedLifeTopicsJson={item.relatedLifeTopicsJson} />;
          }
          return <RelatedContentCarousel items={relatedItems} />;

        case 'prayerPrompt':
          return <PrayerPromptCard prompt={item.prompt} />;

        case 'mapChip':
          if (!chipData) return null;
          return (
            <MapChip
              story={chipData.story}
              places={chipData.places}
              onExpand={() =>
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (navigation as any).navigate('ExploreTab', {
                  screen: 'Map',
                  params: { storyId: chipData.story.id },
                })
              }
            />
          );

        case 'footer':
          return footer ?? null;

        default:
          return null;
      }
    },
    [
      header,
      footer,
      onReadContext,
      renderStudyCta,
      isFocus,
      sectionById,
      panel,
      callbacks,
      layout,
      coaching,
      chapterPanels,
      relatedItems,
      chipData,
      navigation,
      base.textMuted,
      handlePanelLongPress,
    ],
  );

  const keyExtractor = useCallback((item: ChapterListItem) => item.key, []);
  const getItemType = useCallback((item: ChapterListItem) => item.type, []);

  return (
    <>
      <FlashList
        // eslint-disable-next-line react-hooks/refs -- passing ref to component is idiomatic
        ref={listRef}
        data={items}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        getItemType={getItemType}
        onScroll={onScroll}
        scrollEventThrottle={32}
        contentContainerStyle={contentContainerStyle}
        showsVerticalScrollIndicator
      />

      {/* Panel info tooltip (long-press) — modal, outside the list */}
      <PanelInfoSheet
        visible={panelInfoType !== null}
        panelType={panelInfoType}
        onClose={() => setPanelInfoType(null)}
        onGoToFullBio={handleGoToFullBio}
      />
    </>
  );
});

// ── Item components ──────────────────────────────────────────────
// Read ambient state from ChapterReaderContext; receive only per-item data.

interface VerseBlockItemProps {
  item: Extract<ChapterListItem, { type: 'verseBlock' }>;
  section: SectionWithPanels;
}

const VerseBlockItem = React.memo(function VerseBlockItem({ item, section }: VerseBlockItemProps) {
  const { verse, callbacks, layout, display } = useChapterReader();
  // Parity with the old SectionBlock container padding: in read mode the
  // verse run is the section's last element, so it carries the padding;
  // in study/deep the panelRow does.
  const isLastOfSection = display.tier === 'read';

  const sectionVerses = useMemo(
    () =>
      verse.verses.filter((v) => v.verse_num >= item.verseStart && v.verse_num <= item.verseEnd),
    [verse.verses, item.verseStart, item.verseEnd],
  );
  const sectionCompVerses = useMemo(
    () =>
      verse.comparisonVerses?.filter(
        (v) => v.verse_num >= item.verseStart && v.verse_num <= item.verseEnd,
      ),
    [verse.comparisonVerses, item.verseStart, item.verseEnd],
  );

  // VHL tap: walk btn_types to the first panel type this section carries
  // (moved from SectionBlock — same resolution rules).
  const handleVhlWordPress = useCallback(
    (panelTypes: string[], sectionId: string) => {
      const availableTypes = new Set(section.panels.map((p) => p.panel_type));
      const matchType = panelTypes.find((pt) => availableTypes.has(pt));
      if (matchType) {
        callbacks.handleSectionPanelToggle(sectionId, matchType);
        callbacks.recordOpen(sectionId, matchType);
      }
    },
    [section.panels, callbacks],
  );

  return (
    <View style={isLastOfSection ? styles.sectionBottom : null}>
      <VerseBlock
        verses={sectionVerses}
        vhlGroups={verse.vhlGroups}
        activeVhlGroups={verse.activeVhlGroups}
        notedVerses={verse.notedVerses}
        sectionId={item.sectionId}
        onVhlWordPress={handleVhlWordPress}
        onNotePress={callbacks.onNotePress}
        onVerseLongPress={callbacks.onVerseLongPress}
        onVerseNumPress={callbacks.onInterlinearPress}
        activeVerseNum={verse.activeVerseNum}
        comparisonVerses={sectionCompVerses}
        comparisonLabel={verse.comparisonLabel}
        primaryLabel={verse.primaryLabel}
        redLetterVerses={verse.redLetterVerses}
        onVerseLayout={(verseNum, y) => layout.onVerseLayout(verseNum, y, item.sectionId)}
        highlightMap={verse.highlightMap}
      />
    </View>
  );
});

interface PanelRowItemProps {
  section: SectionWithPanels;
  onPanelLongPress: (type: string) => void;
}

const PanelRowItem = React.memo(function PanelRowItem({
  section,
  onPanelLongPress,
}: PanelRowItemProps) {
  const { panel, callbacks, layout } = useChapterReader();

  const activeType =
    panel.activeSectionPanel?.sectionId === section.id
      ? (panel.activeSectionPanel?.panelType ?? null)
      : null;
  const activePanelObj = activeType
    ? (section.panels.find((p) => p.panel_type === activeType) ?? null)
    : null;

  return (
    <View style={styles.sectionBottom}>
      <View onLayout={(e) => layout.onBtnRowLayout(section.id, 0, e.nativeEvent.layout.y)}>
        <ButtonRow
          panels={section.panels}
          activePanel={activeType}
          onToggle={(type) => callbacks.handleSectionPanelToggle(section.id, type)}
          onLongPress={onPanelLongPress}
        />
      </View>
      {activePanelObj && (
        <PanelContainer
          panelType={activePanelObj.panel_type}
          contentJson={activePanelObj.content_json}
          isOpen
          onClose={callbacks.clearActivePanel}
          onRefPress={callbacks.onRefPress}
          defaultTab={
            panel.openPanel?.tabKey && panel.openPanel.panelType === activePanelObj.panel_type
              ? panel.openPanel.tabKey
              : undefined
          }
        />
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  // Parity with the old SectionBlock container (paddingBottom: spacing.sm).
  sectionBottom: {
    paddingBottom: spacing.sm,
  },
  scholarDisclaimer: {
    fontFamily: fontFamily.bodyItalic,
    fontSize: 10,
    lineHeight: 15,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
});

export { ChapterVerseList };
