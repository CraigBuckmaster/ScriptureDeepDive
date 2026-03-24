import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { base, spacing, radii } from '../theme';

interface Props {
  planName: string;
  dayNum: number;
  chapters: string[];
  onStartReading: (chapter: string) => void;
}

export function DailyReadingCard({ planName, dayNum, chapters, onStartReading }: Props) {
  return (
    <View style={{
      backgroundColor: base.bgElevated, borderWidth: 1, borderColor: base.gold + '40',
      borderRadius: radii.md, padding: spacing.md, marginHorizontal: spacing.md, marginBottom: spacing.md,
    }}>
      <Text style={{ color: base.textMuted, fontFamily: 'Cinzel_400Regular', fontSize: 9, letterSpacing: 0.5 }}>
        {planName.toUpperCase()} · DAY {dayNum}
      </Text>
      <Text style={{ color: base.text, fontFamily: 'SourceSans3_500Medium', fontSize: 13, marginTop: 4 }}>
        {chapters.map((c) => c.replace('_', ' ')).join(', ')}
      </Text>
      <TouchableOpacity onPress={() => chapters[0] && onStartReading(chapters[0])} style={{ marginTop: spacing.sm }}>
        <Text style={{ color: base.gold, fontFamily: 'SourceSans3_600SemiBold', fontSize: 12 }}>
          Start reading →
        </Text>
      </TouchableOpacity>
    </View>
  );
}
