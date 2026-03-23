/**
 * ChapterNavBar — Sticky top bar: ← Library | Book Ch.N | ← 🔍 →
 */

import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { base, spacing, MIN_TOUCH_TARGET } from '../theme';

interface Props {
  bookName: string;
  chapterNum: number;
  hasPrev: boolean;
  hasNext: boolean;
  onBack: () => void;
  onPrev: () => void;
  onNext: () => void;
  onQnav: () => void;
}

export function ChapterNavBar({
  bookName, chapterNum, hasPrev, hasNext,
  onBack, onPrev, onNext, onQnav,
}: Props) {
  return (
    <SafeAreaView style={{ backgroundColor: base.bg }}>
      <View style={{
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: spacing.md, height: 48,
        borderBottomWidth: 1, borderBottomColor: base.border,
      }}>
        {/* Left: Back to library */}
        <TouchableOpacity
          onPress={onBack}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityLabel="Back to library"
          style={{ minWidth: MIN_TOUCH_TARGET, minHeight: MIN_TOUCH_TARGET, justifyContent: 'center' }}
        >
          <Text style={{ color: base.gold, fontSize: 16 }}>← Library</Text>
        </TouchableOpacity>

        {/* Center: Book + Chapter (tap → Qnav) */}
        <TouchableOpacity onPress={onQnav} accessibilityLabel={`${bookName} chapter ${chapterNum}. Tap to navigate.`}>
          <Text style={{ color: base.text, fontFamily: 'Cinzel_500Medium', fontSize: 14 }}>
            {bookName} {chapterNum}
          </Text>
        </TouchableOpacity>

        {/* Right: Prev/Next arrows */}
        <View style={{ flexDirection: 'row', gap: spacing.md }}>
          <TouchableOpacity
            onPress={onPrev}
            disabled={!hasPrev}
            accessibilityLabel="Previous chapter"
            style={{ minWidth: MIN_TOUCH_TARGET, minHeight: MIN_TOUCH_TARGET, justifyContent: 'center', alignItems: 'center' }}
          >
            <Text style={{ color: hasPrev ? base.gold : base.textMuted + '40', fontSize: 18 }}>←</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onNext}
            disabled={!hasNext}
            accessibilityLabel="Next chapter"
            style={{ minWidth: MIN_TOUCH_TARGET, minHeight: MIN_TOUCH_TARGET, justifyContent: 'center', alignItems: 'center' }}
          >
            <Text style={{ color: hasNext ? base.gold : base.textMuted + '40', fontSize: 18 }}>→</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
