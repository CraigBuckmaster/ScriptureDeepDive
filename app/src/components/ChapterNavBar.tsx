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
import { View, Text, TouchableOpacity, SafeAreaView, StyleSheet } from 'react-native';
import { ArrowLeft, ArrowRight, ChevronDown, Info } from 'lucide-react-native';
import { lightImpact } from '../utils/haptics';
import { base, spacing, fontFamily, MIN_TOUCH_TARGET } from '../theme';

interface Props {
  bookName: string;
  chapterNum: number;
  hasPrev: boolean;
  hasNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  onQnav: () => void;
  onIntroPress?: () => void;
}

export function ChapterNavBar({
  bookName, chapterNum, hasPrev, hasNext,
  onPrev, onNext, onQnav, onIntroPress,
}: Props) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.bar}>
        {/* Left: Book name → Qnav */}
        <TouchableOpacity
          onPress={onQnav}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityLabel={`${bookName}. Tap to change book or chapter.`}
          accessibilityRole="button"
          style={styles.pickerButton}
        >
          <Text style={styles.bookName} numberOfLines={1}>{bookName}</Text>
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
            <ArrowLeft size={20} color={hasPrev ? base.gold : base.textMuted + '40'} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onQnav}
            hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
            accessibilityLabel={`Chapter ${chapterNum}. Tap to jump to another chapter.`}
            accessibilityRole="button"
          >
            <Text style={styles.chapterNum}>{chapterNum}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => { if (hasNext) { lightImpact(); onNext(); } }}
            disabled={!hasNext}
            accessibilityLabel="Next chapter"
            style={styles.arrowButton}
          >
            <ArrowRight size={20} color={hasNext ? base.gold : base.textMuted + '40'} />
          </TouchableOpacity>
        </View>

        {/* Right: ⓘ Book info */}
        {onIntroPress ? (
          <TouchableOpacity
            onPress={onIntroPress}
            accessibilityLabel="About this book"
            accessibilityRole="button"
            style={styles.infoButton}
          >
            <Info size={18} color={base.textMuted} />
          </TouchableOpacity>
        ) : (
          <View style={styles.infoButton} />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: base.bg,
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    height: 48,
    borderBottomWidth: 1,
    borderBottomColor: base.border,
  },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minHeight: MIN_TOUCH_TARGET,
    flex: 1,
  },
  bookName: {
    color: base.navText,
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
    color: base.text,
    fontFamily: fontFamily.displayMedium,
    fontSize: 16,
    minWidth: 32,
    textAlign: 'center',
  },
  infoButton: {
    flex: 1,
    alignItems: 'flex-end',
    justifyContent: 'center',
    minHeight: MIN_TOUCH_TARGET,
  },
});
