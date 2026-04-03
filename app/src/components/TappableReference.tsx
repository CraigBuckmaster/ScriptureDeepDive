/**
 * TappableReference — Renders text with auto-linked scripture references.
 *
 * Uses extractReferences() to find refs, splits into plain + tappable segments.
 * Gold underline on tappable refs, onPress fires with parsed ref data.
 */

import React, { useMemo } from 'react';
import { Text, StyleSheet, type StyleProp, type TextStyle } from 'react-native';
import { extractReferences } from '../utils/referenceParser';
import { parseReference, type ParsedRef } from '../utils/verseResolver';
import { useTheme, fontFamily } from '../theme';

interface Props {
  text: string;
  style?: StyleProp<TextStyle>;
  onRefPress?: (ref: ParsedRef) => void;
}

export function TappableReference({ text, style, onRefPress }: Props) {
  const { base } = useTheme();
  const segments = useMemo(() => {
    if (!text) return [];
    const refs = extractReferences(text);
    if (refs.length === 0) return [{ type: 'text' as const, value: text }];

    const parts: { type: 'text' | 'ref'; value: string }[] = [];
    let cursor = 0;

    for (const ref of refs) {
      if (ref.start > cursor) {
        parts.push({ type: 'text', value: text.slice(cursor, ref.start) });
      }
      parts.push({ type: 'ref', value: ref.ref });
      cursor = ref.end;
    }
    if (cursor < text.length) {
      parts.push({ type: 'text', value: text.slice(cursor) });
    }

    return parts;
  }, [text]);

  const defaultStyle: TextStyle = {
    color: base.text,
    fontFamily: fontFamily.body,
    fontSize: 16,
    lineHeight: 26,
  };

  if (segments.length === 0) return null;
  if (segments.length === 1 && segments[0].type === 'text') {
    return <Text style={[defaultStyle, style]}>{text}</Text>;
  }

  return (
    <Text style={[defaultStyle, style]}>
      {segments.map((seg, i) => {
        if (seg.type === 'text') {
          return <Text key={i}>{seg.value}</Text>;
        }
        return (
          <Text
            key={i}
            style={[styles.refLink, { color: base.gold }]}
            onPress={() => {
              const parsed = parseReference(seg.value);
              if (parsed && onRefPress) onRefPress(parsed);
            }}
            accessibilityRole="link"
            accessibilityLabel={`Scripture reference: ${seg.value}`}
          >
            {seg.value}
          </Text>
        );
      })}
    </Text>
  );
}

const styles = StyleSheet.create({
  refLink: {
    textDecorationLine: 'underline',
  },
});

