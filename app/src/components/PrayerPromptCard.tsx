/**
 * PrayerPromptCard — A soft, collapsible prayer prompt shown at the end
 * of each chapter. Dismissible for the current session.
 */

import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, LayoutAnimation } from 'react-native';
import { Heart } from 'lucide-react-native';
import { useTheme, spacing, fontFamily } from '../theme';

interface Props {
  prompt: string;
}

function PrayerPromptCard({ prompt }: Props) {
  const { base } = useTheme();
  const [expanded, setExpanded] = useState(false);
  const dismissedRef = useRef(false);
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || dismissedRef.current) return null;

  const handleToggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((prev) => !prev);
  };

  const handleDismiss = () => {
    dismissedRef.current = true;
    setDismissed(true);
  };

  return (
    <View style={[styles.container, { backgroundColor: base.textMuted + '0A' }]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerLeft}
          onPress={handleToggle}
          activeOpacity={0.7}
        >
          <Heart size={14} color={base.textMuted} />
          <Text style={[styles.title, { color: base.textDim }]}>Reflect & Pray</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleDismiss}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={[styles.dismiss, { color: base.textMuted }]}>✕</Text>
        </TouchableOpacity>
      </View>
      {expanded && (
        <Text style={[styles.body, { color: base.textDim }]}>{prompt}</Text>
      )}
      {!expanded && (
        <TouchableOpacity onPress={handleToggle} activeOpacity={0.7}>
          <Text style={[styles.tapHint, { color: base.textMuted }]}>Tap to expand</Text>
        </TouchableOpacity>
      )}
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
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  title: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 12,
    letterSpacing: 0.3,
  },
  dismiss: {
    fontFamily: fontFamily.ui,
    fontSize: 13,
  },
  body: {
    fontFamily: fontFamily.body,
    fontSize: 13,
    lineHeight: 21,
    marginTop: spacing.sm,
  },
  tapHint: {
    fontFamily: fontFamily.body,
    fontSize: 11,
    marginTop: 4,
  },
});
