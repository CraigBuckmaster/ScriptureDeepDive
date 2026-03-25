/**
 * ChapterNavBar — Sticky top bar for the chapter reading screen.
 *
 * Layout:
 *   BookName ▾     [NIV]     ‹ Ch 43 ›
 *   (picker)       (trans)   (prev/next)
 *
 * Left:   Book name + down indicator. Tap = QnavOverlay (book/chapter picker).
 * Center: TranslationDropdown (CompactDropdown wrapper).
 * Right:  Prev/Next arrows flanking the chapter number.
 */

import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, StyleSheet } from 'react-native';
import { ArrowLeft, ArrowRight, ChevronDown } from 'lucide-react-native';
import { TranslationDropdown } from './TranslationDropdown';
import { useSettingsStore } from '../stores';
import { base, spacing, fontFamily, MIN_TOUCH_TARGET } from '../theme';

interface Props {
  bookName: string;
  chapterNum: number;
  hasPrev: boolean;
  hasNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  onQnav: () => void;
}

export function ChapterNavBar({
  bookName, chapterNum, hasPrev, hasNext,
  onPrev, onNext, onQnav,
}: Props) {
  const translation = useSettingsStore((s) => s.translation);
  const setTranslation = useSettingsStore((s) => s.setTranslation);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.bar}>
        {/* Left: Book name picker */}
        <TouchableOpacity
          onPress={onQnav}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityLabel={`${bookName} chapter ${chapterNum}. Tap to change book or chapter.`}
          accessibilityRole="button"
          accessibilityHint="Opens chapter navigator"
          style={styles.pickerButton}
        >
          <Text style={styles.bookName} numberOfLines={1}>{bookName}</Text>
          <ChevronDown size={14} color={base.navText} />
        </TouchableOpacity>

        {/* Center: Translation dropdown */}
        <TranslationDropdown
          active={translation}
          onSelect={(t) => setTranslation(t as any)}
        />

        {/* Right: Prev / Ch N / Next */}
        <View style={styles.chapterNav}>
          <TouchableOpacity
            onPress={onPrev}
            disabled={!hasPrev}
            accessibilityLabel="Previous chapter"
            style={styles.arrowButton}
          >
            <ArrowLeft
              size={20}
              color={hasPrev ? base.gold : base.textMuted + '40'}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onQnav}
            hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
            accessibilityLabel={`Chapter ${chapterNum}. Tap to jump to another chapter.`}
            accessibilityRole="button"
          >
            <Text style={styles.chapterNum}>Ch {chapterNum}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onNext}
            disabled={!hasNext}
            accessibilityLabel="Next chapter"
            style={styles.arrowButton}
          >
            <ArrowRight
              size={20}
              color={hasNext ? base.gold : base.textMuted + '40'}
            />
          </TouchableOpacity>
        </View>
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
    flex: 1,
    justifyContent: 'flex-end',
  },
  arrowButton: {
    minWidth: MIN_TOUCH_TARGET,
    minHeight: MIN_TOUCH_TARGET,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chapterNum: {
    color: base.textDim,
    fontFamily: fontFamily.uiMedium,
    fontSize: 13,
    minWidth: 40,
    textAlign: 'center',
  },
});
