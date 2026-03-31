/**
 * ButtonRow — Wrapping grid of PanelButtons with content/scholar grouping.
 *
 * Content panels (heb, hist, ctx, cross, etc.) render first as square buttons.
 * A thin vertical divider separates them from scholar panels (pill-shaped).
 *
 * Button order: section = heb,hist,ctx,cross | [scholars],poi,tl
 * Chapter = lit,hebtext,themes,ppl,trans,src,rec,thread,tx,debate
 *
 * When `categories` is provided, content panels are grouped under category
 * header labels (e.g. "LANGUAGE & FORM", "WORLD BEHIND THE TEXT").
 */

import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { PanelButton } from './PanelButton';
import { SECTION_PANEL_ORDER, CHAPTER_PANEL_ORDER, isScholarPanel } from '../utils/panelLabels';
import type { PanelCategory } from '../utils/panelLabels';
import { useTheme, spacing, fontFamily } from '../theme';
import type { SectionPanel, ChapterPanel } from '../types';

interface Props {
  panels: (SectionPanel | ChapterPanel)[];
  activePanel: string | null;
  onToggle: (panelType: string) => void;
  isChapterLevel?: boolean;
  /** When provided, content panels are grouped under category labels. */
  categories?: PanelCategory[];
}

export function ButtonRow({ panels, activePanel, onToggle, isChapterLevel, categories }: Props) {
  const { base } = useTheme();

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

  // Build categorized groups when categories prop is provided
  const categorizedGroups = useMemo(() => {
    if (!categories || contentTypes.length === 0) return null;

    const categorizedSet = new Set(categories.flatMap((c) => c.types));
    const groups: { label: string; types: string[] }[] = [];

    for (const cat of categories) {
      const matching = cat.types.filter((t) => contentTypes.includes(t));
      if (matching.length > 0) {
        groups.push({ label: cat.label, types: matching });
      }
    }

    // Uncategorized content panels go at the end
    const uncategorized = contentTypes.filter((t) => !categorizedSet.has(t));
    if (uncategorized.length > 0) {
      groups.push({ label: '', types: uncategorized });
    }

    return groups;
  }, [categories, contentTypes]);

  if (contentTypes.length === 0 && scholarTypes.length === 0) return null;

  return (
    <View style={styles.container}>
      {categorizedGroups ? (
        /* Categorized layout: groups with header labels */
        categorizedGroups.map((group) => (
          <View key={group.label || '_uncategorized'} style={styles.categoryGroup}>
            {group.label.length > 0 && (
              <Text style={[styles.categoryLabel, { color: base.textMuted }]}>{group.label}</Text>
            )}
            <View style={styles.categoryButtons}>
              {group.types.map((type) => (
                <PanelButton
                  key={type}
                  panelType={type}
                  isActive={activePanel === type}
                  onPress={() => onToggle(type)}
                />
              ))}
            </View>
          </View>
        ))
      ) : (
        /* Flat layout: content panels without categories */
        contentTypes.map((type) => (
          <PanelButton
            key={type}
            panelType={type}
            isActive={activePanel === type}
            onPress={() => onToggle(type)}
          />
        ))
      )}

      {/* Divider between content and scholars */}
      {contentTypes.length > 0 && scholarTypes.length > 0 && (
        <View style={[styles.divider, { backgroundColor: base.border }]} />
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
    marginHorizontal: 2,
  },
  categoryGroup: {
    width: '100%',
    marginBottom: spacing.xs,
  },
  categoryLabel: {
    fontSize: 8,
    fontFamily: fontFamily.uiSemiBold,
    letterSpacing: 1.2,
    paddingLeft: 2,
    marginBottom: 4,
  },
  categoryButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    alignItems: 'center',
  },
});
