/**
 * ButtonRow — Wrapping grid of PanelButtons with content/scholar grouping.
 *
 * Content panels (heb, hist, ctx, cross, etc.) render first as square buttons.
 * A thin vertical divider separates them from scholar panels (pill-shaped).
 *
 * Button order: section = heb,hist,ctx,cross | [scholars],poi,tl
 * Chapter = lit,hebtext,themes,ppl,trans,src,rec,thread,tx,debate
 */

import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { PanelButton } from './PanelButton';
import { SECTION_PANEL_ORDER, CHAPTER_PANEL_ORDER, isScholarPanel } from '../utils/panelLabels';
import { base, spacing } from '../theme';
import type { SectionPanel, ChapterPanel } from '../types';

interface Props {
  panels: (SectionPanel | ChapterPanel)[];
  activePanel: string | null;
  onToggle: (panelType: string) => void;
  isChapterLevel?: boolean;
}

export function ButtonRow({ panels, activePanel, onToggle, isChapterLevel }: Props) {
  const { contentTypes, scholarTypes } = useMemo(() => {
    const available = new Set(panels.map((p) => p.panel_type));
    const order = isChapterLevel ? CHAPTER_PANEL_ORDER : SECTION_PANEL_ORDER;

    const content: string[] = [];
    const scholars: string[] = [];

    // Known types in order
    for (const t of order) {
      if (available.has(t)) {
        content.push(t);
        available.delete(t);
      }
    }

    // Remaining: scholars vs unknown content
    for (const t of available) {
      if (isScholarPanel(t)) scholars.push(t);
      else content.push(t);
    }

    scholars.sort();
    return { contentTypes: content, scholarTypes: scholars };
  }, [panels, isChapterLevel]);

  if (contentTypes.length === 0 && scholarTypes.length === 0) return null;

  return (
    <View style={styles.container}>
      {/* Content panels */}
      {contentTypes.map((type) => (
        <PanelButton
          key={type}
          panelType={type}
          isActive={activePanel === type}
          onPress={() => onToggle(type)}
        />
      ))}

      {/* Divider between content and scholars */}
      {contentTypes.length > 0 && scholarTypes.length > 0 && (
        <View style={styles.divider} />
      )}

      {/* Scholar panels */}
      {scholarTypes.map((type) => (
        <PanelButton
          key={type}
          panelType={type}
          isActive={activePanel === type}
          onPress={() => onToggle(type)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: 6,
    alignItems: 'center',
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: base.border,
    marginHorizontal: 2,
  },
});
