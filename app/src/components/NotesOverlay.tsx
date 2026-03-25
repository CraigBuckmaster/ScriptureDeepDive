/**
 * NotesOverlay — Full-screen modal for viewing/editing per-chapter notes.
 *
 * Auto-saves on blur and on close. No explicit Save button.
 * Verse ref auto-generated from current book/chapter.
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Modal, View, Text, TouchableOpacity, TextInput,
  FlatList, SafeAreaView, Alert, StyleSheet,
} from 'react-native';
import { X, Plus } from 'lucide-react-native';
import { getNotesForChapter, saveNote, updateNote, deleteNote } from '../db/user';
import { base, spacing, radii, MIN_TOUCH_TARGET, fontFamily } from '../theme';
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
  const [newText, setNewText] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const newTextRef = useRef<TextInput>(null);
  const pendingNewText = useRef('');

  const displayName = bookName ?? bookId;
  const defaultRef = `${displayName} ${chapterNum}`;

  const reload = useCallback(() => {
    if (bookId && chapterNum) {
      getNotesForChapter(bookId, chapterNum).then(setNotes);
    }
  }, [bookId, chapterNum]);

  useEffect(() => { if (visible) reload(); }, [visible, reload]);

  // Auto-save pending new note on close
  const handleClose = useCallback(async () => {
    if (pendingNewText.current.trim()) {
      await saveNote(defaultRef, pendingNewText.current.trim());
      pendingNewText.current = '';
      setNewText('');
      setShowAdd(false);
    }
    // Auto-save pending edit
    if (editingId !== null && editText.trim()) {
      await updateNote(editingId, editText.trim());
      setEditingId(null);
    }
    onClose();
  }, [defaultRef, editingId, editText, onClose]);

  // Auto-save new note on blur
  const handleNewNoteBlur = useCallback(async () => {
    if (pendingNewText.current.trim()) {
      await saveNote(defaultRef, pendingNewText.current.trim());
      pendingNewText.current = '';
      setNewText('');
      setShowAdd(false);
      reload();
    }
  }, [defaultRef, reload]);

  const handleNewTextChange = (text: string) => {
    setNewText(text);
    pendingNewText.current = text;
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

  const handleShowAdd = () => {
    setShowAdd(true);
    setTimeout(() => newTextRef.current?.focus(), 100);
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen">
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            Notes — {displayName} {chapterNum}
          </Text>
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={handleShowAdd} style={styles.headerButton} accessibilityLabel="Add note" accessibilityRole="button">
              <Plus size={20} color={base.gold} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleClose} style={styles.headerButton} accessibilityLabel="Close notes" accessibilityRole="button">
              <X size={20} color={base.gold} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Add note — just a text area, auto-saves on blur */}
        {showAdd && (
          <View style={styles.addForm}>
            <Text style={styles.addLabel}>{defaultRef}</Text>
            <TextInput
              ref={newTextRef}
              value={newText}
              onChangeText={handleNewTextChange}
              onBlur={handleNewNoteBlur}
              multiline
              placeholder="Type your note — saves automatically..."
              placeholderTextColor={base.textMuted}
              style={styles.addInput}
            />
            <TouchableOpacity onPress={() => { pendingNewText.current = ''; setNewText(''); setShowAdd(false); }} style={styles.cancelButton}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Notes list */}
        <FlatList
          data={notes}
          keyExtractor={(n) => String(n.id)}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyText}>No notes yet for this chapter.</Text>
            </View>
          }
          renderItem={({ item: note }) => (
            <View style={styles.noteCard}>
              <Text style={styles.noteRef}>{note.verse_ref}</Text>
              {editingId === note.id ? (
                <TextInput
                  value={editText} onChangeText={setEditText} multiline autoFocus
                  onBlur={() => handleUpdate(note.id)}
                  style={styles.editInput}
                />
              ) : (
                <TouchableOpacity onPress={() => { setEditingId(note.id); setEditText(note.note_text); }}>
                  <Text style={styles.noteText}>{note.note_text}</Text>
                </TouchableOpacity>
              )}
              <View style={styles.noteFooter}>
                <Text style={styles.noteDate}>{note.updated_at?.slice(0, 10)}</Text>
                <TouchableOpacity onPress={() => handleDelete(note.id)}>
                  <Text style={styles.deleteText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: base.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    height: 48,
    borderBottomWidth: 1,
    borderBottomColor: base.border,
  },
  headerTitle: {
    color: base.text,
    fontFamily: fontFamily.displayMedium,
    fontSize: 14,
  },
  headerActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  headerButton: {
    minHeight: MIN_TOUCH_TARGET,
    justifyContent: 'center',
  },
  addForm: {
    padding: spacing.md,
    gap: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: base.border,
  },
  addLabel: {
    color: base.gold,
    fontFamily: fontFamily.uiSemiBold,
    fontSize: 12,
  },
  addInput: {
    backgroundColor: base.bgElevated,
    color: base.text,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    fontFamily: fontFamily.body,
    fontSize: 14,
    minHeight: 60,
    borderWidth: 1,
    borderColor: base.border,
    textAlignVertical: 'top',
  },
  cancelButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    alignSelf: 'flex-start',
  },
  cancelText: {
    color: base.textMuted,
    fontSize: 13,
  },
  listContent: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  emptyWrap: {
    alignItems: 'center',
    paddingTop: spacing.xxl,
  },
  emptyText: {
    color: base.textMuted,
    fontFamily: fontFamily.bodyItalic,
    fontSize: 15,
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
