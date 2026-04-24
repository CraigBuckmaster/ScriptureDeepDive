import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { BookOpen, Link2, MessageSquare, Search } from 'lucide-react-native';
import type { AmicusStudyActionSeed } from '@/services/amicus/studyActions';
import { fontFamily, radii, spacing, useTheme } from '@/theme';

export interface StudyActionRowProps {
  actions: AmicusStudyActionSeed[];
  onSelect: (action: AmicusStudyActionSeed) => void;
}

const ICON_SIZE = 14;

export default function StudyActionRow({
  actions,
  onSelect,
}: StudyActionRowProps): React.ReactElement | null {
  const { base } = useTheme();

  if (actions.length === 0) return null;

  return (
    <View style={styles.wrap}>
      {actions.map((action) => {
        const Icon = iconForAction(action.key);
        return (
          <Pressable
            key={action.key}
            accessibilityLabel={action.label}
            onPress={() => onSelect(action)}
            style={({ pressed }) => [
              styles.actionButton,
              {
                borderColor: `${base.gold}70`,
                backgroundColor: pressed ? `${base.gold}16` : base.bgSurface,
              },
            ]}
          >
            <Icon size={ICON_SIZE} color={base.gold} />
            <Text
              numberOfLines={2}
              style={[styles.actionText, { color: base.text, fontFamily: fontFamily.body }]}
            >
              {action.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function iconForAction(key: AmicusStudyActionSeed['key']) {
  switch (key) {
    case 'explain_context':
      return BookOpen;
    case 'investigate_question':
      return MessageSquare;
    case 'interpretive_tensions':
      return Search;
    case 'refine_takeaway':
      return MessageSquare;
    case 'trace_connections':
      return Link2;
  }
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  actionButton: {
    minHeight: 44,
    minWidth: 120,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radii.md,
  },
  actionText: {
    fontSize: 13,
    lineHeight: 18,
    flexShrink: 1,
  },
});
