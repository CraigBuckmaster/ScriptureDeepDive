/**
 * CommentaryPanel — Scholar commentary notes.
 *
 * Used for mac, calvin, netbible, sarna, alter, and ALL scholar panels.
 * Scholar color from getScholarColor(scholarId).
 */

import React from 'react';
import { View, Text } from 'react-native';
import { TappableReference } from '../TappableReference';
import { ScholarTag } from '../ScholarTag';
import { getScholarColor, base, spacing, fontFamily } from '../../theme';
import type { CommentaryNote, ParsedRef } from '../../types';

interface Props {
  notes: CommentaryNote[];
  scholarId: string;
  onScholarPress?: () => void;
  onRefPress?: (ref: ParsedRef) => void;
}

export function CommentaryPanel({ notes, scholarId, onScholarPress, onRefPress }: Props) {
  const color = getScholarColor(scholarId);

  return (
    <View style={{ gap: spacing.sm }}>
      <ScholarTag scholarId={scholarId} onPress={onScholarPress} />

      {notes.map((note, i) => (
        <View key={i} style={{ gap: 2 }}>
          <Text style={{
            color,
            fontFamily: fontFamily.uiSemiBold,
            fontSize: 12,
          }}>
            {note.ref}
          </Text>
          <TappableReference
            text={note.note}
            style={{ color: base.textDim, fontSize: 14, lineHeight: 22 }}
            onRefPress={onRefPress}
          />
        </View>
      ))}
    </View>
  );
}
