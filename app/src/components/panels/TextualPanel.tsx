import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { getPanelColors, base, spacing, radii, fontFamily } from '../../theme';
import { ManuscriptStoriesView } from './ManuscriptStoriesView';
import type { TextualEntry } from '../../types';
import type { ManuscriptStory } from './ManuscriptStoriesView';

interface Props { entries: TextualEntry[]; }

export function TextualPanel({ entries }: Props) {
  const colors = getPanelColors('tx');
  return (
    <View style={styles.entryList}>
      {entries.map((e, i) => (
        <View key={i} style={styles.entry}>
          <View style={styles.entryHeader}>
            <Text style={[styles.entryRef, { color: colors.accent }]}>{e.ref}</Text>
            <Text style={styles.entryTitle}>{e.title}</Text>
          </View>
          <Text style={styles.entryContent}>{e.content}</Text>
          {e.note ? (
            <Text style={styles.entryNote}>{e.note}</Text>
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
}

export function CompositeTextualPanel({ data }: CompositeProps) {
  const hasNotes = data.notes && data.notes.length > 0;
  const hasStories = data.stories && data.stories.length > 0;
  const showTabs = hasNotes && hasStories;

  const [activeTab, setActiveTab] = useState<'notes' | 'stories'>('notes');

  if (!showTabs) {
    // Only one type of data — render without tab bar
    if (hasStories) return <ManuscriptStoriesView stories={data.stories} />;
    return <TextualPanel entries={data.notes} />;
  }

  return (
    <View>
      {/* Tab bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'notes' && styles.tabActive]}
          onPress={() => setActiveTab('notes')}
        >
          <Text style={[styles.tabText, activeTab === 'notes' && styles.tabTextActive]}>
            Notes
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'stories' && styles.tabActive]}
          onPress={() => setActiveTab('stories')}
        >
          <Text style={[styles.tabText, activeTab === 'stories' && styles.tabTextActive]}>
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
    color: base.textDim,
    fontFamily: fontFamily.display,
    fontSize: 11,
  },
  entryContent: {
    color: base.textDim,
    fontFamily: fontFamily.body,
    fontSize: 14,
    lineHeight: 22,
  },
  entryNote: {
    color: base.textMuted,
    fontFamily: fontFamily.bodyItalic,
    fontSize: 13,
  },

  // Composite tab bar
  tabBar: {
    flexDirection: 'row',
    backgroundColor: base.bgElevated,
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
  tabActive: {
    backgroundColor: base.gold + '25',
  },
  tabText: {
    color: base.textMuted,
    fontFamily: fontFamily.uiMedium,
    fontSize: 12,
  },
  tabTextActive: {
    color: base.gold,
  },
});
