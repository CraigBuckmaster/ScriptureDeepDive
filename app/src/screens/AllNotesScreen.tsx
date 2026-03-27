/**
 * AllNotesScreen — Global notes browser.
 *
 * Shows all user notes grouped by book/chapter, with search,
 * inline editing, and delete. Tap a note's reference to jump
 * to that chapter.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Search, X } from 'lucide-react-native';
import { ScreenHeader } from '../components/ScreenHeader';
import { getAllNotes, searchNotes, updateNote, deleteNote } from '../db/user';
import { parseVerseRef, displayRef } from '../utils/verseRef';
import { base, spacing, radii, fontFamily } from '../theme';
import type { UserNote } from '../types';

/** Group notes by book + chapter. */
function groupNotes(notes: UserNote[]): { key: string; label: string; notes: UserNote[] }[] {
  const map = new Map<string, UserNote[]>();
  for (const n of notes) {
    const parsed = parseVerseRef(n.verse_ref);
    const groupKey = parsed ? `${parsed.bookId} ${parsed.ch}` : n.verse_ref;
    const existing = map.get(groupKey) ?? [];
    existing.push(n);
    map.set(groupKey, existing);
  }
  const groups: { key: string; label: string; notes: UserNote[] }[] = [];
  for (const [key, groupedNotes] of map) {
    groups.push({ key, label: displayRef(key), notes: groupedNotes });
  }
  return groups;
}

export default function AllNotesScreen() {
  const navigation = useNavigation<any>();
  const [notes, setNotes] = useState<UserNote[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState('');

  const reload = useCallback(async () => {
    const result = searchQuery.trim().length >= 2
      ? await searchNotes(searchQuery.trim())
      : await getAllNotes();
    setNotes(result);
  }, [searchQuery]);

  useEffect(() => { reload(); }, [reload]);

  const handleUpdate = async (id: number) => {
    if (!editText.trim()) return;
    await updateNote(id, editText.trim());
    setEditingId(null);
    reload();
  };

  const handleDelete = (id: number) => {
    Alert.alert('Delete Note', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await deleteNote(id); reload(); } },
    ]);
  };

  const handleRefPress = (ref: string) => {
    const parsed = parseVerseRef(ref);
    if (parsed) {
      navigation.navigate('Chapter', {
        bookId: parsed.bookId,
        chapterNum: parsed.ch,
      });
    }
  };

  const groups = groupNotes(notes);

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader
        title="All Notes"
        onBack={() => navigation.goBack()}
      />

      {/* Search bar */}
      <View style={styles.searchRow}>
        <Search size={16} color={base.textMuted} />
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search notes..."
          placeholderTextColor={base.textMuted}
          style={styles.searchInput}
          returnKeyType="search"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <X size={16} color={base.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={groups}
        keyExtractor={(g) => g.key}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyText}>
              {searchQuery ? 'No notes match your search.' : 'No notes yet. Tap the pencil icon next to any verse to start.'}
            </Text>
          </View>
        }
        renderItem={({ item: group }) => (
          <View style={styles.group}>
            {/* Group header */}
            <TouchableOpacity onPress={() => handleRefPress(group.key)}>
              <Text style={styles.groupHeader}>{group.label}</Text>
            </TouchableOpacity>

            {/* Notes in this group */}
            {group.notes.map((note) => (
              <View key={note.id} style={styles.noteCard}>
                {/* Verse ref (tappable) */}
                <TouchableOpacity onPress={() => handleRefPress(note.verse_ref)}>
                  <Text style={styles.noteRef}>{displayRef(note.verse_ref)}</Text>
                </TouchableOpacity>

                {/* Note text — tap to edit */}
                {editingId === note.id ? (
                  <TextInput
                    value={editText}
                    onChangeText={setEditText}
                    multiline
                    autoFocus
                    onBlur={() => handleUpdate(note.id)}
                    style={styles.editInput}
                  />
                ) : (
                  <TouchableOpacity onPress={() => { setEditingId(note.id); setEditText(note.note_text); }}>
                    <Text style={styles.noteText}>{note.note_text}</Text>
                  </TouchableOpacity>
                )}

                {/* Footer */}
                <View style={styles.noteFooter}>
                  <Text style={styles.noteDate}>{note.updated_at?.slice(0, 10)}</Text>
                  <TouchableOpacity onPress={() => handleDelete(note.id)}>
                    <Text style={styles.deleteText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: base.bg,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: base.bgElevated,
    borderRadius: radii.md,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.sm,
    height: 40,
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: base.border,
  },
  searchInput: {
    flex: 1,
    color: base.text,
    fontFamily: fontFamily.ui,
    fontSize: 14,
    height: 40,
  },
  listContent: {
    padding: spacing.md,
    paddingTop: 0,
    gap: spacing.lg,
  },
  emptyWrap: {
    alignItems: 'center',
    paddingTop: spacing.xxl,
  },
  emptyText: {
    color: base.textMuted,
    fontFamily: fontFamily.bodyItalic,
    fontSize: 15,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
  },
  group: {
    gap: spacing.sm,
  },
  groupHeader: {
    color: base.gold,
    fontFamily: fontFamily.displayMedium,
    fontSize: 14,
    paddingBottom: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: base.border + '60',
  },
  noteCard: {
    backgroundColor: base.bgElevated,
    borderRadius: radii.md,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: base.border,
  },
  noteRef: {
    color: base.gold,
    fontFamily: fontFamily.uiSemiBold,
    fontSize: 12,
  },
  editInput: {
    color: base.text,
    fontFamily: fontFamily.body,
    fontSize: 14,
    marginTop: 4,
    minHeight: 40,
    textAlignVertical: 'top',
  },
  noteText: {
    color: base.textDim,
    fontFamily: fontFamily.body,
    fontSize: 14,
    marginTop: 4,
  },
  noteFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  noteDate: {
    color: base.textMuted,
    fontSize: 10,
  },
  deleteText: {
    color: '#e05a6a',
    fontSize: 11,
  },
});
