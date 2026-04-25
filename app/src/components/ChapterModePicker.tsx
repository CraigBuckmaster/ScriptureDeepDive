/**
 * ChapterModePicker — Bottom sheet for switching the chapter reading mode
 * from the chapter nav bar. Mirrors the AuthorshipSheet structure.
 *
 * Tap a mode to persist via settingsStore.setChapterMode and close. No
 * "Recommended" pip — onboarding owns that affordance.
 */

import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme, spacing, radii, fontFamily } from '../theme';
import { useSettingsStore, type ChapterMode } from '../stores/settingsStore';
import { MODE_META, ModeChoiceCard } from './onboarding/ModeChoiceCard';

interface Props {
  visible: boolean;
  currentMode: ChapterMode;
  onClose: () => void;
}

export function ChapterModePicker({ visible, currentMode, onClose }: Props) {
  const { base } = useTheme();
  const setChapterMode = useSettingsStore((s) => s.setChapterMode);

  const handlePick = (mode: ChapterMode) => {
    if (mode !== currentMode) {
      setChapterMode(mode);
    }
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel="Close mode picker"
      />
      <SafeAreaView
        style={[
          styles.sheet,
          { backgroundColor: base.bgElevated, borderColor: base.border },
        ]}
      >
        <View style={styles.content}>
          <View style={[styles.handle, { backgroundColor: base.textMuted }]} />

          <Text style={[styles.title, { color: base.gold }]}>
            Chapter Reading Mode
          </Text>

          {MODE_META.map((meta) => (
            <ModeChoiceCard
              key={meta.mode}
              mode={meta.mode}
              selected={meta.mode === currentMode}
              onPress={() => handlePick(meta.mode)}
            />
          ))}
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
  },
  sheet: {
    borderTopLeftRadius: radii.lg,
    borderTopRightRadius: radii.lg,
    borderTopWidth: 1,
  },
  content: {
    padding: spacing.md,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    marginBottom: spacing.md,
  },
  title: {
    fontFamily: fontFamily.displayMedium,
    fontSize: 16,
    marginBottom: spacing.md,
  },
});
