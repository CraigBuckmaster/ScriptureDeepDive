/**
 * ButtonRow — Horizontal ScrollView of PanelButtons.
 *
 * Button order: section = heb,hist,ctx,cross,[scholars],poi,tl
 * Chapter = lit,hebtext,themes,ppl,trans,src,rec,thread,tx,debate
 */

import React, { useMemo } from 'react';
import { ScrollView, View } from 'react-native';
import { PanelButton } from './PanelButton';
import { SECTION_PANEL_ORDER, CHAPTER_PANEL_ORDER, isScholarPanel } from '../utils/panelLabels';
import { spacing } from '../theme';
import type { SectionPanel, ChapterPanel } from '../types';

interface Props {
  panels: (SectionPanel | ChapterPanel)[];
  activePanel: string | null;  // active panel_type for this section/chapter
  onToggle: (panelType: string) => void;
  isChapterLevel?: boolean;
}

export function ButtonRow({ panels, activePanel, onToggle, isChapterLevel }: Props) {
  const orderedTypes = useMemo(() => {
    const available = new Set(panels.map((p) => p.panel_type));
    const order = isChapterLevel ? CHAPTER_PANEL_ORDER : SECTION_PANEL_ORDER;

    // Known types in order
    const ordered: string[] = [];
    const scholars: string[] = [];

    for (const t of order) {
      if (available.has(t)) {
        ordered.push(t);
        available.delete(t);
      }
    }

    // Remaining types: scholars first, then unknown
    for (const t of available) {
      if (isScholarPanel(t)) scholars.push(t);
      else ordered.push(t);
    }

    // Insert scholars after 'cross' (section) or at end (chapter)
    if (!isChapterLevel) {
      const crossIdx = ordered.indexOf('cross');
      ordered.splice(crossIdx >= 0 ? crossIdx + 1 : ordered.length, 0, ...scholars.sort());
    } else {
      ordered.push(...scholars.sort());
    }

    return ordered;
  }, [panels, isChapterLevel]);

  if (orderedTypes.length === 0) return null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        gap: spacing.xs,
      }}
    >
      {orderedTypes.map((type) => (
        <PanelButton
          key={type}
          panelType={type}
          isActive={activePanel === type}
          onPress={() => onToggle(type)}
        />
      ))}
    </ScrollView>
  );
}
