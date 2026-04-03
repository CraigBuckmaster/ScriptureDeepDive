/**
 * CommentaryPanel — Scholar commentary notes.
 *
 * Used for mac, calvin, netbible, sarna, alter, and ALL scholar panels.
 * Scholar color from getScholarColor(scholarId).
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TappableReference } from '../TappableReference';
import { ScholarTag } from '../ScholarTag';
import { useTheme, spacing, fontFamily } from '../../theme';
import type { CommentaryNote, ParsedRef } from '../../types';

interface Props {
  notes: CommentaryNote[];
  scholarId: string;
  onScholarPress?: () => void;
  onRefPress?: (ref: ParsedRef) => void;
}

export function CommentaryPanel({ notes, scholarId, onScholarPress, onRefPress }: Props) {
  const { base, getScholarColor } = useTheme();
  const color = getScholarColor(scholarId);

  return (
    <View style={styles.container}>
      <ScholarTag scholarId={scholarId} onPress={onScholarPress} />
      <Text style={[styles.subtitle, { color: base.textMuted }]}>
        Faithful Paraphrase
      </Text>

      {notes.map((note, i) => (
        <View key={i} style={styles.noteWrapper}>
          <Text style={[styles.noteRef, { color }]}>
            {note.ref}
          </Text>
          <TappableReference
            text={note.note}
            style={[styles.noteText, { color: base.textDim }]}
            onRefPress={onRefPress}
          />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  subtitle: {
    fontFamily: fontFamily.bodyItalic,
    fontSize: 11,
    marginTop: -spacing.xs,
  },
  noteWrapper: {
    gap: 2,
  },
  noteRef: {
    fontFamily: fontFamily.uiSemiBold,
    fontSize: 12,
  },
  noteText: {
    fontSize: 14,
    lineHeight: 22,
  },
});
