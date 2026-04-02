import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme, spacing, radii, fontFamily } from '../../theme';
import { ManuscriptStoriesView } from './ManuscriptStoriesView';
import type { TextualEntry } from '../../types';
import type { ManuscriptStory } from './ManuscriptStoriesView';

interface Props { entries: TextualEntry[]; }

export function TextualPanel({ entries }: Props) {
  const { base, getPanelColors } = useTheme();
  const colors = getPanelColors('tx');
  return (
    <View style={styles.entryList}>
      {entries.map((e, i) => (
        <View key={i} style={styles.entry}>
          <View style={styles.entryHeader}>
            <Text style={[styles.entryRef, { color: colors.accent }]}>{e.ref}</Text>
            <Text style={[styles.entryTitle, { color: base.textDim }]}>{e.title}</Text>
          </View>
          <Text style={[styles.entryContent, { color: base.textDim }]}>{e.content}</Text>
          {e.note ? (
            <Text style={[styles.entryNote, { color: base.textMuted }]}>{e.note}</Text>
          ) : null}
        </View>
      ))}
    </View>
  );
}

export interface CompositeTxData {
  notes: TextualEntry[];
  stories: ManuscriptStory[];
}

interface CompositeProps {
  data: CompositeTxData;
  defaultTab?: string;
}

export function CompositeTextualPanel({ data, defaultTab }: CompositeProps) {
  const { base } = useTheme();
  const hasNotes = data.notes && data.notes.length > 0;
  const hasStories = data.stories && data.stories.length > 0;
  const showTabs = hasNotes && hasStories;

  const [activeTab, setActiveTab] = useState<'notes' | 'stories'>(
    () => (defaultTab === 'stories' && hasStories) ? 'stories' : 'notes'
  );

  if (!showTabs) {
    // Only one type of data — render without tab bar
    if (hasStories) return <ManuscriptStoriesView stories={data.stories} />;
    return <TextualPanel entries={data.notes} />;
  }

  return (
    <View>
      {/* Tab bar */}
      <View style={[styles.tabBar, { backgroundColor: base.bgElevated }]}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'notes' && [styles.tabActive, { backgroundColor: base.gold + '25' }]]}
          onPress={() => setActiveTab('notes')}
          accessibilityRole="button"
          accessibilityLabel="Notes tab"
          accessibilityState={{ selected: activeTab === 'notes' }}
        >
          <Text style={[styles.tabText, { color: base.textMuted }, activeTab === 'notes' && { color: base.gold }]}>
            Notes
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'stories' && [styles.tabActive, { backgroundColor: base.gold + '25' }]]}
          onPress={() => setActiveTab('stories')}
          accessibilityRole="button"
          accessibilityLabel="Manuscript Stories tab"
          accessibilityState={{ selected: activeTab === 'stories' }}
        >
          <Text style={[styles.tabText, { color: base.textMuted }, activeTab === 'stories' && { color: base.gold }]}>
            Manuscript Stories
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'notes'
        ? <TextualPanel entries={data.notes} />
        : <ManuscriptStoriesView stories={data.stories} />
      }
    </View>
  );
}

const styles = StyleSheet.create({
  // Legacy TextualPanel styles
  entryList: {
    gap: spacing.md,
  },
  entry: {
    gap: 4,
  },
  entryHeader: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  entryRef: {
    fontFamily: fontFamily.uiSemiBold,
    fontSize: 12,
  },
  entryTitle: {
    fontFamily: fontFamily.display,
    fontSize: 11,
  },
  entryContent: {
    fontFamily: fontFamily.body,
    fontSize: 14,
    lineHeight: 22,
  },
  entryNote: {
    fontFamily: fontFamily.bodyItalic,
    fontSize: 13,
  },

  // Composite tab bar
  tabBar: {
    flexDirection: 'row',
    borderRadius: radii.md,
    padding: 2,
    marginBottom: spacing.sm,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.xs + 2,
    alignItems: 'center',
    borderRadius: radii.sm + 2,
  },
  tabActive: {},
  tabText: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 12,
  },
});
