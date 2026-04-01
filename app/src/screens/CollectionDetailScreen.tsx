/**
 * CollectionDetailScreen — Notes within a single study collection.
 *
 * Shows collection name/description, lists all notes, allows export.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Alert,
  StyleSheet,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Share as ShareIcon, Trash2 } from 'lucide-react-native';
import type { ScreenNavProp, ScreenRouteProp } from '../navigation/types';
import { ScreenHeader } from '../components/ScreenHeader';
import {
  getCollection,
  getNotesInCollection,
  deleteCollection,
  updateNoteTags,
} from '../db/user';
import { displayRef, parseVerseRef } from '../utils/verseRef';
import { base, useTheme, spacing, radii, fontFamily } from '../theme';
import type { StudyCollection, UserNote } from '../types';

export default function CollectionDetailScreen() {
  const { base } = useTheme();
  const navigation = useNavigation<ScreenNavProp<'More', 'CollectionDetail'>>();
  const route = useRoute<ScreenRouteProp<'More', 'CollectionDetail'>>();
  const { collectionId } = route.params ?? {};

  const [collection, setCollection] = useState<StudyCollection | null>(null);
  const [notes, setNotes] = useState<UserNote[]>([]);

  const reload = useCallback(async () => {
    if (!collectionId) return;
    const [col, noteList] = await Promise.all([
      getCollection(collectionId),
      getNotesInCollection(collectionId),
    ]);
    setCollection(col);
    setNotes(noteList);
  }, [collectionId]);

  useEffect(() => {
    reload();
  }, [reload]);

  const handleExport = async () => {
    if (!collection || notes.length === 0) return;

    const lines: string[] = [
      `# ${collection.name}`,
      collection.description ? `\n${collection.description}\n` : '',
      '',
    ];

    for (const note of notes) {
      lines.push(`## ${displayRef(note.verse_ref)}`);
      lines.push(note.note_text);
      lines.push('');
    }

    const text = lines.join('\n');
    try {
      await Share.share({ message: text, title: collection.name });
    } catch (err) {
      // User cancelled or share failed
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Collection',
      `Delete "${collection?.name}"? Notes will remain but be unassigned.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (collectionId) {
              await deleteCollection(collectionId);
              navigation.goBack();
            }
          },
        },
      ]
    );
  };

  const handleNotePress = (note: UserNote) => {
    const parsed = parseVerseRef(note.verse_ref);
    if (parsed) {
      navigation.navigate('Chapter', {
        bookId: parsed.bookId,
        chapterNum: parsed.ch,
      });
    }
  };

  const parseTags = (json: string): string[] => {
    try {
      return JSON.parse(json);
    } catch {
      return [];
    }
  };

  if (!collection) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: base.bg }]} edges={['top']}>
        <ScreenHeader title="Collection" onBack={() => navigation.goBack()} style={styles.header} />
        <View style={styles.emptyWrap}>
          <Text style={[styles.emptyText, { color: base.textMuted }]}>Collection not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: base.bg }]} edges={['top']}>
      <ScreenHeader
        title={collection.name}
        titleColor={collection.color}
        onBack={() => navigation.goBack()}
        style={styles.header}
      />

      {/* Collection header */}
      <View style={[styles.collectionHeader, { borderBottomColor: base.border }]}>
        <View style={[styles.colorBar, { backgroundColor: collection.color }]} />
        <View style={styles.collectionInfo}>
          {collection.description ? (
            <Text style={[styles.description, { color: base.textDim }]}>{collection.description}</Text>
          ) : null}
          <Text style={[styles.noteCount, { color: base.textMuted }]}>{notes.length} notes</Text>
        </View>
        <View style={styles.actions}>
          <TouchableOpacity onPress={handleExport} style={styles.actionButton}>
            <ShareIcon size={18} color={base.gold} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDelete} style={styles.actionButton}>
            <Trash2 size={18} color="#e05a6a" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Notes list */}
      <FlatList
        data={notes}
        keyExtractor={(n) => String(n.id)}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Text style={[styles.emptyText, { color: base.textMuted }]}>No notes in this collection yet.</Text>
          </View>
        }
        renderItem={({ item: note }) => {
          const tags = parseTags(note.tags_json);
          return (
            <TouchableOpacity style={[styles.noteCard, { backgroundColor: base.bgElevated, borderColor: base.border }]} onPress={() => handleNotePress(note)}>
              <Text style={[styles.noteRef, { color: base.gold }]}>{displayRef(note.verse_ref)}</Text>
              <Text style={[styles.noteText, { color: base.textDim }]}>{note.note_text}</Text>
              {tags.length > 0 && (
                <View style={styles.tagRow}>
                  {tags.map((t) => (
                    <Text key={t} style={[styles.tag, { color: base.goldDim }]}>#{t}</Text>
                  ))}
                </View>
              )}
              <Text style={[styles.noteDate, { color: base.textMuted }]}>{note.updated_at?.slice(0, 10)}</Text>
            </TouchableOpacity>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xs,
    paddingBottom: spacing.sm,
  },
  collectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing.md,
    borderBottomWidth: 1,
  },
  colorBar: {
    width: 4,
    height: 40,
    borderRadius: 2,
    marginRight: spacing.sm,
  },
  collectionInfo: {
    flex: 1,
  },
  description: {
    fontFamily: fontFamily.body,
    fontSize: 14,
    marginBottom: 4,
  },
  noteCount: {
    fontFamily: fontFamily.ui,
    fontSize: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    padding: spacing.xs,
  },
  listContent: {
    padding: spacing.md,
    gap: spacing.sm,
    paddingBottom: spacing.xxl,
  },
  emptyWrap: {
    alignItems: 'center',
    paddingTop: spacing.xxl,
  },
  emptyText: {
    fontFamily: fontFamily.bodyItalic,
    fontSize: 15,
  },
  noteCard: {
    borderRadius: radii.md,
    padding: spacing.sm,
    borderWidth: 1,
  },
  noteRef: {
    fontFamily: fontFamily.uiSemiBold,
    fontSize: 12,
  },
  noteText: {
    fontFamily: fontFamily.body,
    fontSize: 14,
    marginTop: 4,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: spacing.xs,
  },
  tag: {
    fontFamily: fontFamily.ui,
    fontSize: 10,
  },
  noteDate: {
    fontSize: 10,
    marginTop: spacing.xs,
    textAlign: 'right',
  },
});
