import React from 'react';
import { View, Text } from 'react-native';
import { getPanelColors, base, spacing, fontFamily } from '../../theme';

interface TransRow {
  verse_ref?: string;
  translations: { version: string; text: string }[];
}

interface Props { data: any; }

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
      <Text style={{ color: base.textMuted, fontSize: 12, fontFamily: fontFamily.ui }}>
        No translation comparisons available.
      </Text>
    );
  }

  if (rows.length === 0) {
    return (
      <Text style={{ color: base.textMuted, fontSize: 12, fontFamily: fontFamily.ui }}>
        No translation comparisons available.
      </Text>
    );
  }

  return (
    <View style={{ gap: spacing.md }}>
      {title ? (
        <Text style={{ color: colors.accent, fontFamily: fontFamily.display, fontSize: 11, letterSpacing: 0.3 }}>
          {title}
        </Text>
      ) : null}
      {rows.map((row, i) => (
        <View key={i} style={{ gap: spacing.xs }}>
          {row.verse_ref ? (
            <Text style={{ color: base.textMuted, fontSize: 11, fontFamily: fontFamily.uiSemiBold }}>
              {row.verse_ref}
            </Text>
          ) : null}
          {row.translations.map((t, j) => (
            <View key={j} style={{ flexDirection: 'row', gap: spacing.sm }}>
              <Text style={{ color: colors.accent, fontFamily: fontFamily.uiSemiBold, fontSize: 12, minWidth: 32 }}>
                {t.version}
              </Text>
              <Text style={{ color: base.textDim, fontFamily: fontFamily.body, fontSize: 14, flex: 1 }}>
                {t.text}
              </Text>
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}
