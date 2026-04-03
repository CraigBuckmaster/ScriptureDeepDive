/**
 * GospelPassageCard — Displays one Gospel's full passage text with colored
 * accent bar, Gospel name header, tappable reference, and superscript verse numbers.
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { useTheme, spacing, radii, fontFamily } from '../theme';
import type { ResolvedVerse } from '../utils/verseResolver';

interface Props {
  gospelName: string;
  passageRef: string;
  verses: ResolvedVerse[];
  color: string;
  onNavigate: () => void;
}

function GospelPassageCard({ gospelName, passageRef: refStr, verses, color, onNavigate }: Props) {
  const { base } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: base.bgElevated, borderColor: base.border, borderLeftColor: color }]}>
      {/* Header: Gospel name + ref → */}
      <View style={styles.header}>
        <Text style={[styles.gospelName, { color }]}>{gospelName.toUpperCase()}</Text>
        <TouchableOpacity
          onPress={onNavigate}
          style={styles.refButton}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityLabel={`Read ${refStr} in full`}
          accessibilityRole="button"
        >
          <Text style={[styles.refText, { color: base.gold }]}>{refStr}</Text>
          <ChevronRight size={14} color={base.gold} />
        </TouchableOpacity>
      </View>

      {/* Verse text with superscript numbers */}
      <Text style={[styles.verseBody, { color: base.text }]}>
        {verses.map((v, i) => (
          <React.Fragment key={v.verseNum}>
            <Text style={[styles.verseSup, { color: base.verseNum }]}>
              {v.verseNum}
            </Text>
            {' '}{v.text}{i < verses.length - 1 ? ' ' : ''}
          </React.Fragment>
        ))}
      </Text>

      {verses.length === 0 && (
        <Text style={[styles.placeholder, { color: base.textMuted }]}>
          Passage text not available for {refStr}
        </Text>
      )}
    </View>
  );
}

const MemoizedGospelPassageCard = React.memo(GospelPassageCard);
export { MemoizedGospelPassageCard as GospelPassageCard };
export default MemoizedGospelPassageCard;

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderLeftWidth: 3,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  gospelName: {
    fontFamily: fontFamily.display,
    fontSize: 11,
    letterSpacing: 0.5,
  },
  refButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  refText: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 11,
  },
  verseBody: {
    fontFamily: fontFamily.body,
    fontSize: 15,
    lineHeight: 24,
  },
  verseSup: {
    fontFamily: fontFamily.display,
    fontSize: 9,
    lineHeight: 14,
  },
  placeholder: {
    fontFamily: fontFamily.bodyItalic,
    fontSize: 14,
  },
});
