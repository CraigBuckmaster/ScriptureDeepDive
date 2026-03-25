/**
 * NotesOverlay — Full-screen modal for viewing/editing per-chapter notes.
 *
 * FlatList of NoteCards. Empty state. Inline edit on tap.
 * Delete with confirm. Add note from verse ref.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Modal, View, Text, TouchableOpacity, TextInput,
  FlatList, SafeAreaView, Alert,
} from 'react-native';
import { getNotesForChapter, saveNote, updateNote, deleteNote } from '../db/user';
import { base, spacing, radii, MIN_TOUCH_TARGET } from '../theme';
import type { UserNote } from '../types';

interface Props {
  visible: boolean;
  onClose: () => void;
  bookId: string;
  bookName?: string;
  chapterNum: number;
}

export function NotesOverlay({ visible, onClose, bookId, bookName, chapterNum }: Props) {
  const [notes, setNotes] = useState<UserNote[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState('');
  const [newRef, setNewRef] = useState('');
  const [newText, setNewText] = useState('');
  const [showAdd, setShowAdd] = useState(false);

  const reload = useCallback(() => {
    if (bookId && chapterNum) {
      getNotesForChapter(bookId, chapterNum).then(setNotes);
    }
  }, [bookId, chapterNum]);

  useEffect(() => { if (visible) reload(); }, [visible, reload]);

  const handleSave = async () => {
    if (!newRef.trim() || !newText.trim()) return;
    await saveNote(newRef.trim(), newText.trim());
    setNewRef(''); setNewText(''); setShowAdd(false);
    reload();
  };

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

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen">
      <SafeAreaView style={{ flex: 1, backgroundColor: base.bg }}>
        {/* Header */}
        <View style={{
          flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
          paddingHorizontal: spacing.md, height: 48,
          borderBottomWidth: 1, borderBottomColor: base.border,
        }}>
          <Text style={{ color: base.text, fontFamily: 'Cinzel_500Medium', fontSize: 14 }}>
            Notes — {bookName ?? bookId} {chapterNum}
          </Text>
          <View style={{ flexDirection: 'row', gap: spacing.md }}>
            <TouchableOpacity onPress={() => setShowAdd(true)} style={{ minHeight: MIN_TOUCH_TARGET, justifyContent: 'center' }}>
              <Text style={{ color: base.gold, fontSize: 20 }}>+</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onClose} style={{ minHeight: MIN_TOUCH_TARGET, justifyContent: 'center' }}>
              <Text style={{ color: base.gold, fontSize: 16 }}>✕</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Add note form */}
        {showAdd && (
          <View style={{ padding: spacing.md, gap: spacing.sm, borderBottomWidth: 1, borderBottomColor: base.border }}>
            <TextInput
              value={newRef} onChangeText={setNewRef}
              placeholder={`e.g. ${bookName ?? bookId} ${chapterNum}:1`}
              placeholderTextColor={base.textMuted}
              style={{ backgroundColor: base.bgElevated, color: base.text, borderRadius: radii.sm,
                paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, fontFamily: 'SourceSans3_400Regular',
                fontSize: 13, borderWidth: 1, borderColor: base.border }}
            />
            <TextInput
              value={newText} onChangeText={setNewText} multiline
              placeholder="Your note..."
              placeholderTextColor={base.textMuted}
              style={{ backgroundColor: base.bgElevated, color: base.text, borderRadius: radii.sm,
                paddingHorizontal: spacing.sm, paddingVertical: spacing.sm, fontFamily: 'EBGaramond_400Regular',
                fontSize: 14, minHeight: 60, borderWidth: 1, borderColor: base.border, textAlignVertical: 'top' }}
            />
            <View style={{ flexDirection: 'row', gap: spacing.sm }}>
              <TouchableOpacity onPress={handleSave} style={{ backgroundColor: base.gold + '30', borderRadius: radii.sm, paddingHorizontal: spacing.md, paddingVertical: spacing.xs }}>
                <Text style={{ color: base.gold, fontFamily: 'SourceSans3_600SemiBold', fontSize: 13 }}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setShowAdd(false)} style={{ paddingHorizontal: spacing.md, paddingVertical: spacing.xs }}>
                <Text style={{ color: base.textMuted, fontSize: 13 }}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Notes list */}
        <FlatList
          data={notes}
          keyExtractor={(n) => String(n.id)}
          contentContainerStyle={{ padding: spacing.md, gap: spacing.sm }}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', paddingTop: spacing.xxl }}>
              <Text style={{ color: base.textMuted, fontFamily: 'EBGaramond_400Regular_Italic', fontSize: 15 }}>
                No notes yet for this chapter.
              </Text>
            </View>
          }
          renderItem={({ item: note }) => (
            <View style={{ backgroundColor: base.bgElevated, borderRadius: radii.md, padding: spacing.sm,
              borderWidth: 1, borderColor: base.border }}>
              <Text style={{ color: base.gold, fontFamily: 'SourceSans3_600SemiBold', fontSize: 12 }}>
                {note.verse_ref}
              </Text>
              {editingId === note.id ? (
                <TextInput
                  value={editText} onChangeText={setEditText} multiline autoFocus
                  onBlur={() => handleUpdate(note.id)}
                  style={{ color: base.text, fontFamily: 'EBGaramond_400Regular', fontSize: 14,
                    marginTop: 4, minHeight: 40, textAlignVertical: 'top' }}
                />
              ) : (
                <TouchableOpacity onPress={() => { setEditingId(note.id); setEditText(note.note_text); }}>
                  <Text style={{ color: base.textDim, fontFamily: 'EBGaramond_400Regular', fontSize: 14, marginTop: 4 }}>
                    {note.note_text}
                  </Text>
                </TouchableOpacity>
              )}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.xs }}>
                <Text style={{ color: base.textMuted, fontSize: 10 }}>
                  {note.updated_at?.slice(0, 10)}
                </Text>
                <TouchableOpacity onPress={() => handleDelete(note.id)}>
                  <Text style={{ color: '#e05a6a', fontSize: 11 }}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      </SafeAreaView>
    </Modal>
  );
}
