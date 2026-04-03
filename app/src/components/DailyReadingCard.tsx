import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme, spacing, radii, fontFamily } from '../theme';

interface Props {
  planName: string;
  dayNum: number;
  chapters: string[];
  onStartReading: (chapter: string) => void;
}

function DailyReadingCard({ planName, dayNum, chapters, onStartReading }: Props) {
  const { base } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: base.bgElevated, borderColor: base.gold + '40' }]}>
      <Text style={[styles.planLabel, { color: base.textMuted }]}>
        {planName.toUpperCase()} · DAY {dayNum}
      </Text>
      <Text style={[styles.chaptersText, { color: base.text }]}>
        {chapters.map((c) => c.replace('_', ' ')).join(', ')}
      </Text>
      <TouchableOpacity
        onPress={() => chapters[0] && onStartReading(chapters[0])}
        style={styles.startButton}
        accessibilityRole="button"
        accessibilityLabel={`Start reading ${planName} day ${dayNum}`}
      >
        <Text style={[styles.startButtonText, { color: base.gold }]}>
          Start reading →
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const MemoizedDailyReadingCard = React.memo(DailyReadingCard);
export { MemoizedDailyReadingCard as DailyReadingCard };
export default MemoizedDailyReadingCard;

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing.md,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  planLabel: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 9,
    letterSpacing: 0.5,
  },
  chaptersText: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 13,
    marginTop: 4,
  },
  startButton: {
    marginTop: spacing.sm,
  },
  startButtonText: {
    fontFamily: fontFamily.uiSemiBold,
    fontSize: 12,
  },
});
