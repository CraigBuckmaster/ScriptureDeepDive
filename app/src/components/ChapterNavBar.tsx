/**
 * ChapterNavBar — Sticky top bar for the chapter reading screen.
 *
 * Layout:
 *   BookName ▾           ‹ 43 ›           ⓘ
 *   (Qnav picker)     (prev/next)    (book intro)
 *
 * Translation toggle has moved to QnavOverlay.
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, ArrowRight, ChevronDown, Info, Volume2 } from 'lucide-react-native';
import { lightImpact } from '../utils/haptics';
import { useTheme, spacing, fontFamily, MIN_TOUCH_TARGET } from '../theme';

interface Props {
  bookName: string;
  chapterNum: number;
  hasPrev: boolean;
  hasNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  onQnav: () => void;
  onIntroPress?: () => void;
  onTTSPress?: () => void;
  ttsActive?: boolean;
}

export function ChapterNavBar({
  bookName, chapterNum, hasPrev, hasNext,
  onPrev, onNext, onQnav, onIntroPress, onTTSPress, ttsActive,
}: Props) {
  const { base } = useTheme();

  return (
    <SafeAreaView edges={['top']} style={[styles.safeArea, { backgroundColor: base.bg }]}>
      <View style={[styles.bar, { borderBottomColor: base.border }]}>
        {/* Left: Book name → Qnav */}
        <TouchableOpacity
          onPress={onQnav}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityLabel={`${bookName}. Tap to change book or chapter.`}
          accessibilityRole="button"
          style={styles.pickerButton}
        >
          <Text style={[styles.bookName, { color: base.navText }]} numberOfLines={1}>{bookName}</Text>
          <ChevronDown size={14} color={base.navText} />
        </TouchableOpacity>

        {/* Center: ‹ 43 › */}
        <View style={styles.chapterNav}>
          <TouchableOpacity
            onPress={() => { if (hasPrev) { lightImpact(); onPrev(); } }}
            disabled={!hasPrev}
            accessibilityLabel="Previous chapter"
            style={styles.arrowButton}
          >
            <ArrowLeft size={20} color={hasPrev ? base.gold : base.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onQnav}
            hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
            accessibilityLabel={`Chapter ${chapterNum}. Tap to jump to another chapter.`}
            accessibilityRole="button"
          >
            <Text style={[styles.chapterNum, { color: base.text }]}>{chapterNum}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => { if (hasNext) { lightImpact(); onNext(); } }}
            disabled={!hasNext}
            accessibilityLabel="Next chapter"
            style={styles.arrowButton}
          >
            <ArrowRight size={20} color={hasNext ? base.gold : base.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Right: TTS + ⓘ */}
        <View style={styles.rightActions}>
          {onTTSPress ? (
            <TouchableOpacity
              onPress={onTTSPress}
              accessibilityLabel={ttsActive ? 'Stop reading aloud' : 'Read aloud'}
              accessibilityRole="button"
              style={styles.actionButton}
            >
              <Volume2 size={18} color={ttsActive ? base.gold : base.textMuted} />
            </TouchableOpacity>
          ) : null}
          {onIntroPress ? (
            <TouchableOpacity
              onPress={onIntroPress}
              accessibilityLabel="About this book"
              accessibilityRole="button"
              style={styles.actionButton}
            >
              <Info size={18} color={base.textMuted} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {},
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    height: 48,
    borderBottomWidth: 1,
  },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minHeight: MIN_TOUCH_TARGET,
    flex: 1,
  },
  bookName: {
    fontFamily: fontFamily.displayMedium,
    fontSize: 14,
    flexShrink: 1,
  },
  chapterNav: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  arrowButton: {
    minWidth: MIN_TOUCH_TARGET,
    minHeight: MIN_TOUCH_TARGET,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chapterNum: {
    fontFamily: fontFamily.displayMedium,
    fontSize: 16,
    minWidth: 32,
    textAlign: 'center',
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    flex: 1,
    gap: spacing.xs,
  },
  actionButton: {
    minWidth: MIN_TOUCH_TARGET,
    minHeight: MIN_TOUCH_TARGET,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
