/**
 * HighlightedText — VHL (Verse Highlight Layer) engine.
 *
 * Colors words that match VHL group word lists. Tap fires onVhlWordPress
 * with the group's btn_types array so the parent can open the correct panel.
 *
 * CRITICAL: VHL taps open PANELS, not popups. The btn_types array maps
 * each VHL group to the panel types it should open:
 *   DIVINE → ['hebrew','hebrew-text','context']
 *   PLACES → ['places','context']
 *   PEOPLE → ['people','context']
 *   TIME   → ['timeline','context']
 *   KEY    → ['literary','cross']
 */

import React, { useMemo, useCallback } from 'react';
import { Text, type TextStyle } from 'react-native';
import { panels, base, fontFamily } from '../theme';
import type { VHLGroup } from '../types';

// ── VHL group → color mapping ───────────────────────────────────────

const VHL_COLORS: Record<string, string> = {
  'vhl-divine': panels.heb.accent,    // #e890b8 pink
  'vhl-place': panels.poi.accent,     // #30a848 green
  'vhl-person': panels.ppl.accent,    // #e86040 orange
  'vhl-time': panels.tl.accent,       // #70b8e8 blue
  'vhl-key': base.gold,               // #c9a84c gold
};

// ── BTN TYPE mapping (button CSS class → panel_type in DB) ──────────

const BTN_TO_PANEL: Record<string, string> = {
  'hebrew': 'heb',
  'hebrew-text': 'hebtext',
  'context': 'ctx',
  'places': 'poi',
  'people': 'ppl',
  'timeline': 'tl',
  'literary': 'lit',
  'cross': 'cross',
};

interface Props {
  text: string;
  groups: VHLGroup[];
  activeGroups?: string[];
  sectionId: string;
  onVhlWordPress?: (panelTypes: string[], sectionId: string) => void;
  style?: TextStyle;
}

interface WordMatch {
  word: string;
  color: string;
  btnTypes: string[];
}

export function HighlightedText({
  text, groups, activeGroups, sectionId, onVhlWordPress, style,
}: Props) {
  // Build word → match lookup from all active VHL groups
  const wordMap = useMemo(() => {
    const map = new Map<string, WordMatch>();
    const active = activeGroups ?? groups.map((g) => g.group_name);

    for (const group of groups) {
      if (!active.includes(group.group_name)) continue;

      const color = VHL_COLORS[group.css_class] ?? base.gold;
      let words: string[];
      try {
        words = typeof group.words_json === 'string'
          ? JSON.parse(group.words_json)
          : group.words_json;
      } catch {
        continue;
      }
      if (!Array.isArray(words)) continue;

      let btnTypes: string[];
      try {
        const rawBtns = typeof group.btn_types_json === 'string'
          ? JSON.parse(group.btn_types_json)
          : group.btn_types_json;
        // Map button CSS class names → panel_type DB values
        btnTypes = (rawBtns as string[]).map((btn) => BTN_TO_PANEL[btn] ?? btn);
      } catch {
        btnTypes = [];
      }

      for (const w of words) {
        if (w) map.set(w.toLowerCase(), { word: w, color, btnTypes });
      }
    }
    return map;
  }, [groups, activeGroups]);

  const handlePress = useCallback(
    (btnTypes: string[]) => {
      if (onVhlWordPress) onVhlWordPress(btnTypes, sectionId);
    },
    [onVhlWordPress, sectionId]
  );

  // Split text into tokens preserving whitespace and punctuation attachment
  const rendered = useMemo(() => {
    if (wordMap.size === 0) {
      return <Text style={[defaultStyle, style]}>{text}</Text>;
    }

    // Split on word boundaries but keep punctuation attached
    const tokens = text.split(/(\s+)/);
    const elements: React.ReactNode[] = [];

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      if (/^\s+$/.test(token)) {
        elements.push(token);
        continue;
      }

      // Strip leading/trailing punctuation for matching
      const stripped = token.replace(/^[^\w\u0590-\u05FF]+|[^\w\u0590-\u05FF]+$/g, '');
      const match = wordMap.get(stripped.toLowerCase());

      if (match) {
        elements.push(
          <Text
            key={i}
            style={{ color: match.color }}
            onPress={() => handlePress(match.btnTypes)}
            accessibilityRole="button"
            accessibilityLabel={`Highlighted word: ${stripped}`}
          >
            {token}
          </Text>
        );
      } else {
        elements.push(token);
      }
    }

    return <Text style={[defaultStyle, style]}>{elements}</Text>;
  }, [text, wordMap, style, handlePress]);

  return <>{rendered}</>;
}

const defaultStyle: TextStyle = {
  color: base.text,
  fontFamily: fontFamily.body,
  fontSize: 16,
  lineHeight: 26,
};
