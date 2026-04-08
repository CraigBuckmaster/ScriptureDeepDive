/**
 * PrayerPromptCard — A static prayer prompt shown at the end of each chapter.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Heart } from 'lucide-react-native';
import { useTheme, spacing, fontFamily } from '../theme';

interface Props {
  prompt: string;
}

function PrayerPromptCard({ prompt }: Props) {
  const { base } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: base.textMuted + '0A' }]}>
      <View style={styles.header}>
        <Heart size={14} color={base.textMuted} />
        <Text style={[styles.title, { color: base.textDim }]}>Reflect & Pray</Text>
      </View>
      <Text style={[styles.body, { color: base.textDim }]}>{prompt}</Text>
    </View>
  );
}

const MemoizedPrayerPromptCard = React.memo(PrayerPromptCard);
export { MemoizedPrayerPromptCard as PrayerPromptCard };
export default MemoizedPrayerPromptCard;

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginHorizontal: spacing.md,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: spacing.sm,
  },
  title: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 12,
    letterSpacing: 0.3,
  },
  body: {
    fontFamily: fontFamily.body,
    fontSize: 13,
    lineHeight: 21,
  },
});
