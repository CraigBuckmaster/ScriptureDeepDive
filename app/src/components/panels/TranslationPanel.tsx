import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme, spacing, fontFamily } from '../../theme';
import type { TransPanel } from '../../types';

interface TransRow {
  verse_ref?: string;
  translations: { version: string; text: string }[];
}

interface Props { data: string | TransPanel; }

/**
 * Parse legacy HTML table format: <tr><td class="t-label">NIV</td><td>...</td></tr>
 * into structured rows. Strips all nested HTML tags.
 * Rows with empty version + <strong> content become verse_ref headers.
 */
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim();
}

function parseHtmlTable(html: string): TransRow[] {
  const rows: TransRow[] = [];
  let currentRef: string | undefined;
  let currentTranslations: { version: string; text: string }[] = [];

  const flushGroup = () => {
    if (currentTranslations.length > 0) {
      rows.push({ verse_ref: currentRef, translations: currentTranslations });
      currentTranslations = [];
    }
  };

  // Match each <tr>...</tr>
  const trPattern = /<tr>(.*?)<\/tr>/gs;
  let match;
  while ((match = trPattern.exec(html)) !== null) {
    const inner = match[1];
    // Skip header rows
    if (inner.includes('<th>')) continue;
    // Extract cells
    const tdPattern = /<td[^>]*>(.*?)<\/td>/gs;
    const cells: string[] = [];
    let tdMatch;
    while ((tdMatch = tdPattern.exec(inner)) !== null) {
      cells.push(tdMatch[1]);
    }
    if (cells.length < 2) continue;

    const version = stripHtml(cells[0]);
    const text = stripHtml(cells[1]);

    // Empty version + text with content = verse header row
    if (!version && text) {
      flushGroup();
      currentRef = text;
      continue;
    }

    if (version && text) {
      currentTranslations.push({ version, text });
    }
  }
  flushGroup();

  return rows;
}

export function TranslationPanel({ data }: Props) {
  const { base, getPanelColors } = useTheme();
  const colors = getPanelColors('trans');

  // Handle both structured data and legacy HTML strings
  let title: string | undefined;
  let rows: TransRow[];

  if (typeof data === 'string') {
    rows = parseHtmlTable(data);
  } else if (data?.rows) {
    title = data.title;
    rows = data.rows;
  } else {
    return (
      <Text style={[styles.emptyText, { color: base.textMuted }]}>
        No translation comparisons available.
      </Text>
    );
  }

  if (rows.length === 0) {
    return (
      <Text style={[styles.emptyText, { color: base.textMuted }]}>
        No translation comparisons available.
      </Text>
    );
  }

  return (
    <View style={styles.container}>
      {title ? (
        <Text style={[styles.title, { color: colors.accent }]}>
          {title}
        </Text>
      ) : null}
      {rows.map((row, i) => (
        <View key={i} style={styles.rowGroup}>
          {row.verse_ref ? (
            <Text style={[styles.verseRef, { color: base.textMuted }]}>
              {row.verse_ref}
            </Text>
          ) : null}
          {row.translations.map((t, j) => (
            <View key={j} style={styles.transRow}>
              <Text style={[styles.versionLabel, { color: colors.accent }]}>
                {t.version}
              </Text>
              <Text style={[styles.transText, { color: base.textDim }]}>
                {t.text}
              </Text>
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  emptyText: {
    fontSize: 12,
    fontFamily: fontFamily.ui,
  },
  title: {
    fontFamily: fontFamily.display,
    fontSize: 11,
    letterSpacing: 0.3,
  },
  rowGroup: {
    gap: spacing.xs,
  },
  verseRef: {
    fontSize: 11,
    fontFamily: fontFamily.uiSemiBold,
  },
  transRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  versionLabel: {
    fontFamily: fontFamily.uiSemiBold,
    fontSize: 12,
    minWidth: 32,
  },
  transText: {
    fontFamily: fontFamily.body,
    fontSize: 14,
    flex: 1,
  },
});
