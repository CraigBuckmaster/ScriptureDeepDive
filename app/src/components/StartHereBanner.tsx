/**
 * StartHereBanner — Dismissible banner for new users on the Explore tab.
 *
 * Shows 4 approachable tool recommendations in plain language.
 * Visible when chaptersRead < 5 and not dismissed. Dismissing stores
 * preference. Auto-hides when chaptersRead >= 5.
 *
 * Part of Epic #1048 (#1054).
 */

import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { X } from 'lucide-react-native';
import { useTheme, spacing, radii, fontFamily } from '../theme';

interface StartHereTool {
  title: string;
  subtitle: string;
  screen: string;
}

const START_HERE_TOOLS: StartHereTool[] = [
  { title: 'People',        subtitle: "See who's in the story",              screen: 'GenealogyTree' },
  { title: 'Timeline',      subtitle: 'When did this happen?',               screen: 'Timeline' },
  { title: 'Word Studies',  subtitle: 'What does this word mean?',           screen: 'WordStudyBrowse' },
  { title: 'Topical Index', subtitle: 'What does the Bible say about...?',   screen: 'TopicBrowse' },
];

interface Props {
  onDismiss: () => void;
  onNavigate: (screen: string) => void;
}

export function StartHereBanner({ onDismiss, onNavigate }: Props) {
  const { base } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: base.gold + '08', borderColor: base.gold + '25' }]}>
      <View style={styles.header}>
        <Text style={[styles.label, { color: base.gold }]}>START HERE</Text>
        <TouchableOpacity
          onPress={onDismiss}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityRole="button"
          accessibilityLabel="Dismiss start here banner"
        >
          <X size={14} color={base.textMuted} />
        </TouchableOpacity>
      </View>
      <Text style={[styles.intro, { color: base.textDim }]}>
        These tools are a great first stop alongside your reading:
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {START_HERE_TOOLS.map((tool) => (
          <TouchableOpacity
            key={tool.screen}
            onPress={() => onNavigate(tool.screen)}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={`${tool.title}: ${tool.subtitle}`}
            style={[styles.toolCard, { backgroundColor: base.bgElevated, borderColor: base.gold + '25' }]}
          >
            <Text style={[styles.toolTitle, { color: base.gold }]}>{tool.title}</Text>
            <Text style={[styles.toolSubtitle, { color: base.textMuted }]}>{tool.subtitle}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: radii.lg,
    padding: spacing.sm + 2,
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  label: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 10,
    letterSpacing: 1,
  },
  intro: {
    fontFamily: fontFamily.ui,
    fontSize: 11,
    marginBottom: spacing.sm,
  },
  scrollContent: {
    gap: spacing.xs + 2,
  },
  toolCard: {
    width: 118,
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing.xs + 4,
  },
  toolTitle: {
    marginBottom: 2,
    fontFamily: fontFamily.uiMedium,
    fontSize: 11,
  },
  toolSubtitle: {
    fontFamily: fontFamily.ui,
    fontSize: 9,
    lineHeight: 13,
  },
});
