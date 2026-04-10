/**
 * ChapterNavBar — Sticky top bar for the chapter reading screen.
 *
 * Layout:
 *   ← NIV ▾       ‹ Genesis 2 ›          🔊 ⓘ
 *   (back/trans)    (prev/qnav/next)    (TTS/intro)
 *
 * When compare mode is active, the translation pill shows "KJV | ASV"
 * and the dropdown footer shows "Exit Compare" instead of "Compare +".
 */

import React, { useCallback, useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, ChevronLeft, ChevronRight, Info, Volume2, Check, BookOpen, Eye } from 'lucide-react-native';
import { CompactDropdown, type DropdownOption } from './CompactDropdown';
import { lightImpact, selectionFeedback } from '../utils/haptics';
import { useTheme, spacing, radii, fontFamily, MIN_TOUCH_TARGET } from '../theme';
import { TRANSLATIONS } from '../db/translationRegistry';

const TRANSLATION_OPTIONS: DropdownOption[] = TRANSLATIONS.map((t) => ({
  key: t.id,
  label: t.label,
}));

interface Props {
  bookName: string;
  chapterNum: number;
  hasPrev: boolean;
  hasNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  onQnav: () => void;
  onBack?: () => void;
  onIntroPress?: () => void;
  onTTSPress?: () => void;
  ttsActive?: boolean;
  translation: string;
  onTranslationChange: (t: string) => void;
  comparisonTranslation: string | null;
  onCompareStart: (t: string) => void;
  onCompareEnd: () => void;
  focusMode?: boolean;
  onFocusToggle?: () => void;
}

export function ChapterNavBar({
  bookName, chapterNum, hasPrev, hasNext,
  onPrev, onNext, onQnav, onBack, onIntroPress, onTTSPress, ttsActive,
  translation, onTranslationChange,
  comparisonTranslation, onCompareStart, onCompareEnd,
  focusMode, onFocusToggle,
}: Props) {
  const { base } = useTheme();
  const [comparePicker, setComparePicker] = useState(false);

  const compLabel = comparisonTranslation
    ? (TRANSLATIONS.find(t => t.id === comparisonTranslation)?.label ?? comparisonTranslation.toUpperCase())
    : undefined;

  const handleCompareFooter = useCallback((close: () => void) => {
    if (comparisonTranslation) {
      return (
        <TouchableOpacity
          onPress={() => { onCompareEnd(); close(); }}
          style={styles.compareFooterBtn}
          accessibilityLabel="Exit translation comparison"
          accessibilityRole="button"
        >
          <Text style={[styles.compareFooterText, { color: base.danger ?? base.textMuted }]}>Exit Compare</Text>
        </TouchableOpacity>
      );
    }
    return (
      <TouchableOpacity
        onPress={() => { close(); setComparePicker(true); }}
        style={styles.compareFooterBtn}
        accessibilityLabel="Compare with another translation"
        accessibilityRole="button"
      >
        <Text style={[styles.compareFooterText, { color: base.gold }]}>Compare +</Text>
      </TouchableOpacity>
    );
  }, [comparisonTranslation, onCompareEnd, base]);

  const handleCompareSelect = useCallback((key: string) => {
    selectionFeedback();
    onCompareStart(key);
    setComparePicker(false);
  }, [onCompareStart]);

  return (
    <SafeAreaView edges={['top']} style={[styles.safeArea, { backgroundColor: base.bg }]}>
      <View style={[styles.bar, { borderBottomColor: base.border }]}>
        {/* Left: Back + Translation */}
        <View style={styles.sideSection}>
          {onBack ? (
            <TouchableOpacity
              onPress={onBack}
              accessibilityLabel="Go back"
              accessibilityRole="button"
              style={styles.actionButton}
            >
              <ArrowLeft size={20} color={base.gold} />
            </TouchableOpacity>
          ) : null}
          <CompactDropdown
            value={translation}
            secondaryLabel={compLabel}
            options={TRANSLATION_OPTIONS}
            onSelect={onTranslationChange}
            renderFooter={handleCompareFooter}
          />
        </View>

        {/* Center: ‹ Genesis 2 › */}
        <View style={styles.chapterNav}>
          <TouchableOpacity
            onPress={() => { if (hasPrev) { lightImpact(); onPrev(); } }}
            disabled={!hasPrev}
            accessibilityLabel="Previous chapter"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 4 }}
            style={styles.arrowButton}
          >
            <ChevronLeft size={22} color={hasPrev ? base.gold : base.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onQnav}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityLabel={`${bookName} ${chapterNum}. Tap to jump to another chapter.`}
            accessibilityRole="button"
            style={styles.chapterButton}
          >
            <Text style={[styles.chapterLabel, { color: base.text }]} numberOfLines={1}>
              {bookName} {chapterNum}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => { if (hasNext) { lightImpact(); onNext(); } }}
            disabled={!hasNext}
            accessibilityLabel="Next chapter"
            hitSlop={{ top: 8, bottom: 8, left: 4, right: 8 }}
            style={styles.arrowButton}
          >
            <ChevronRight size={22} color={hasNext ? base.gold : base.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Right: Focus + TTS + ⓘ */}
        <View style={[styles.sideSection, styles.sideSectionRight]}>
          {onFocusToggle ? (
            <TouchableOpacity
              onPress={onFocusToggle}
              accessibilityLabel={focusMode ? 'Exit reading mode' : 'Enter reading mode'}
              accessibilityRole="button"
              style={styles.actionButton}
            >
              {focusMode
                ? <BookOpen size={18} color={base.gold} />
                : <Eye size={18} color={base.textMuted} />}
            </TouchableOpacity>
          ) : null}
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

      {/* Comparison translation picker modal */}
      <Modal visible={comparePicker} transparent animationType="fade">
        <TouchableWithoutFeedback onPress={() => setComparePicker(false)}>
          <View style={styles.pickerBackdrop}>
            <TouchableWithoutFeedback>
              <View style={[styles.pickerMenu, { backgroundColor: base.bgElevated, borderColor: base.border }]}>
                <Text style={[styles.pickerTitle, { color: base.text }]}>Compare with:</Text>
                {TRANSLATION_OPTIONS.filter(o => o.key !== translation).map((opt) => (
                  <TouchableOpacity
                    key={opt.key}
                    onPress={() => handleCompareSelect(opt.key)}
                    style={styles.pickerItem}
                    accessibilityRole="button"
                    accessibilityLabel={`Compare with ${opt.label}`}
                  >
                    <Text style={[styles.pickerLabel, { color: base.text }]}>{opt.label}</Text>
                    {opt.key === comparisonTranslation && <Check size={14} color={base.gold} />}
                  </TouchableOpacity>
                ))}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {},
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    height: 48,
    borderBottomWidth: 1,
  },
  sideSection: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 100,
    gap: 2,
  },
  sideSectionRight: {
    justifyContent: 'flex-end',
  },
  chapterNav: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  arrowButton: {
    minWidth: 28,
    minHeight: MIN_TOUCH_TARGET,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chapterButton: {
    paddingHorizontal: 2,
    minHeight: MIN_TOUCH_TARGET,
    justifyContent: 'center',
    flexShrink: 1,
  },
  chapterLabel: {
    fontFamily: fontFamily.displayMedium,
    fontSize: 15,
    textAlign: 'center',
  },
  actionButton: {
    minWidth: MIN_TOUCH_TARGET,
    minHeight: MIN_TOUCH_TARGET,
    justifyContent: 'center',
    alignItems: 'center',
  },
  compareFooterBtn: {
    minHeight: MIN_TOUCH_TARGET,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  compareFooterText: {
    fontFamily: fontFamily.uiSemiBold,
    fontSize: 13,
  },
  pickerBackdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)', // overlay-color: intentional
  },
  pickerMenu: {
    borderWidth: 1,
    borderRadius: radii.md,
    minWidth: 200,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  pickerTitle: {
    fontFamily: fontFamily.uiSemiBold,
    fontSize: 13,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  pickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: MIN_TOUCH_TARGET,
    paddingHorizontal: spacing.md,
  },
  pickerLabel: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 14,
  },
});
