/**
 * NotesOverlay — Full-screen modal for viewing/editing per-chapter notes.
 *
 * Enhanced with tags, collection assignment, and note linking.
 * Auto-saves on blur and on close.
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  FlatList,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, Plus, ChevronRight, Link, Folder } from 'lucide-react-native';
import {
  getNotesForChapter,
  saveNote,
  updateNote,
  deleteNote,
  updateNoteTags,
  setNoteCollection,
  getLinkedNotes,
  linkNotes,
  unlinkNotes,
  getCollection,
} from '../db/user';
import { formatVerseRef, displayRef } from '../utils/verseRef';
import { TagChips } from './TagChips';
import { CollectionPicker } from './CollectionPicker';
import { NoteLinkSheet } from './NoteLinkSheet';
import { base, spacing, radii, MIN_TOUCH_TARGET, fontFamily } from '../theme';
import type { UserNote, StudyCollection } from '../types';

interface Props {
  visible: boolean;
  onClose: () => void;
  bookId: string;
  bookName?: string;
  chapterNum: number;
  initialVerseNum?: number | null;
}

function parseTags(json: string): string[] {
  try {
    return JSON.parse(json);
  } catch {
    return [];
  }
}

export function NotesOverlay({ visible, onClose, bookId, bookName, chapterNum, initialVerseNum }: Props) {
  const [notes, setNotes] = useState<UserNote[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState('');
  const [editTags, setEditTags] = useState<string[]>([]);
  const [editCollectionId, setEditCollectionId] = useState<number | null>(null);
  const [editCollection, setEditCollection] = useState<StudyCollection | null>(null);
  const [editLinkedNotes, setEditLinkedNotes] = useState<UserNote[]>([]);

  const [newText, setNewText] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [addRef, setAddRef] = useState('');
  const newTextRef = useRef<TextInput>(null);
  const pendingNewText = useRef('');

  const [showCollectionPicker, setShowCollectionPicker] = useState(false);
  const [showLinkSheet, setShowLinkSheet] = useState(false);

  const displayName = bookName ?? bookId;

  const makeRef = (verseNum?: number | null) =>
    formatVerseRef(bookId, chapterNum, verseNum ?? undefined);

  const formatNoteRef = (ref: string) => {
    const displayed = displayRef(ref);
    if (displayName !== bookId) {
      const titleBookId = bookId.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
      return displayed.replace(titleBookId, displayName);
    }
    return displayed;
  };

  const reload = useCallback(() => {
    if (bookId && chapterNum) {
      getNotesForChapter(bookId, chapterNum).then(setNotes);
    }
  }, [bookId, chapterNum]);

  useEffect(() => { if (visible) reload(); }, [visible, reload]);

  useEffect(() => {
    if (visible && initialVerseNum) {
      setAddRef(makeRef(initialVerseNum));
      setShowAdd(true);
      setTimeout(() => newTextRef.current?.focus(), 200);
    }
  }, [visible, initialVerseNum]);

  // Load editing note's collection and linked notes
  useEffect(() => {
    if (editingId !== null) {
      const note = notes.find((n) => n.id === editingId);
      if (note) {
        setEditTags(parseTags(note.tags_json));
        setEditCollectionId(note.collection_id);
        if (note.collection_id) {
          getCollection(note.collection_id).then(setEditCollection);
        } else {
          setEditCollection(null);
        }
        getLinkedNotes(editingId).then(setEditLinkedNotes);
      }
    } else {
      setEditTags([]);
      setEditCollectionId(null);
      setEditCollection(null);
      setEditLinkedNotes([]);
    }
  }, [editingId, notes]);

  const handleClose = useCallback(async () => {
    if (pendingNewText.current.trim()) {
      await saveNote(addRef || makeRef(), pendingNewText.current.trim());
      pendingNewText.current = '';
      setNewText('');
      setShowAdd(false);
    }
    if (editingId !== null && editText.trim()) {
      await updateNote(editingId, editText.trim());
      setEditingId(null);
    }
    setAddRef('');
    onClose();
  }, [addRef, editingId, editText, onClose, bookId, chapterNum]);

  const handleNewNoteBlur = useCallback(async () => {
    if (pendingNewText.current.trim()) {
      const savedText = pendingNewText.current.trim();
      const newId = await saveNote(addRef || makeRef(), savedText);
      pendingNewText.current = '';
      setNewText('');
      setShowAdd(false);
      setAddRef('');
      reload();
      // Auto-enter edit mode on the newly created note
      setEditingId(newId);
      setEditText(savedText);
    }
  }, [addRef, bookId, chapterNum, reload]);

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
      { text: 'Delete', style: 'destructive', onPress: async () => { await deleteNote(id); setEditingId(null); reload(); } },
    ]);
  };

  const handleShowAdd = () => {
    setAddRef(makeRef());
    setShowAdd(true);
    setTimeout(() => newTextRef.current?.focus(), 100);
  };

  const handleTagsChange = async (newTags: string[]) => {
    if (editingId === null) return;
    setEditTags(newTags);
    await updateNoteTags(editingId, newTags);
  };

  const handleCollectionSelect = async (collectionId: number | null) => {
    if (editingId === null) return;
    setEditCollectionId(collectionId);
    await setNoteCollection(editingId, collectionId);
    if (collectionId) {
      const col = await getCollection(collectionId);
      setEditCollection(col);
    } else {
      setEditCollection(null);
    }
    reload();
  };

  const handleLinkNote = async (toNoteId: number) => {
    if (editingId === null) return;
    await linkNotes(editingId, toNoteId);
    const linked = await getLinkedNotes(editingId);
    setEditLinkedNotes(linked);
    setShowLinkSheet(false);
  };

  const handleUnlink = async (toNoteId: number) => {
    if (editingId === null) return;
    await unlinkNotes(editingId, toNoteId);
    const linked = await getLinkedNotes(editingId);
    setEditLinkedNotes(linked);
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen">
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            Notes — {displayName} {chapterNum}
          </Text>
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={handleShowAdd} style={styles.headerButton} accessibilityLabel="Add note">
              <Plus size={20} color={base.gold} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleClose} style={styles.headerButton} accessibilityLabel="Close notes">
              <X size={20} color={base.gold} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Add note form */}
        {showAdd && (
          <View style={styles.addForm}>
            <Text style={styles.addLabel}>{formatNoteRef(addRef)}</Text>
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
            <TouchableOpacity onPress={() => { pendingNewText.current = ''; setNewText(''); setShowAdd(false); setAddRef(''); }} style={styles.cancelButton}>
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
          renderItem={({ item: note }) => {
            const isEditing = editingId === note.id;
            const noteTags = isEditing ? editTags : parseTags(note.tags_json);

            return (
              <View style={[styles.noteCard, isEditing && styles.noteCardEditing]}>
                <Text style={styles.noteRef}>{formatNoteRef(note.verse_ref)}</Text>
                
                {isEditing ? (
                  <>
                    <TextInput
                      value={editText}
                      onChangeText={setEditText}
                      multiline
                      autoFocus
                      style={styles.editInput}
                    />

                    {/* Tags section */}
                    <View style={styles.metaSection}>
                      <Text style={styles.metaLabel}>TAGS</Text>
                      <TagChips tags={editTags} onTagsChange={handleTagsChange} />
                    </View>

                    {/* Collection section */}
                    <View style={styles.metaSection}>
                      <Text style={styles.metaLabel}>COLLECTION</Text>
                      <TouchableOpacity
                        style={styles.collectionButton}
                        onPress={() => setShowCollectionPicker(true)}
                      >
                        {editCollection ? (
                          <View style={styles.collectionRow}>
                            <View style={[styles.colorDot, { backgroundColor: editCollection.color }]} />
                            <Text style={styles.collectionName}>{editCollection.name}</Text>
                          </View>
                        ) : (
                          <Text style={styles.collectionPlaceholder}>None</Text>
                        )}
                        <ChevronRight size={16} color={base.textMuted} />
                      </TouchableOpacity>
                    </View>

                    {/* Linked notes section */}
                    <View style={styles.metaSection}>
                      <View style={styles.metaHeader}>
                        <Text style={styles.metaLabel}>LINKED NOTES</Text>
                        <TouchableOpacity onPress={() => setShowLinkSheet(true)}>
                          <Text style={styles.addLinkText}>+ Link</Text>
                        </TouchableOpacity>
                      </View>
                      {editLinkedNotes.length > 0 ? (
                        editLinkedNotes.map((linked) => (
                          <View key={linked.id} style={styles.linkedNoteRow}>
                            <Link size={12} color={base.goldDim} />
                            <Text style={styles.linkedNoteRef}>{displayRef(linked.verse_ref)}</Text>
                            <TouchableOpacity onPress={() => handleUnlink(linked.id)}>
                              <X size={14} color={base.textMuted} />
                            </TouchableOpacity>
                          </View>
                        ))
                      ) : (
                        <Text style={styles.noLinksText}>No linked notes</Text>
                      )}
                    </View>

                    {/* Actions */}
                    <View style={styles.noteFooter}>
                      <TouchableOpacity onPress={() => { handleUpdate(note.id); }}>
                        <Text style={styles.doneText}>Done</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => handleDelete(note.id)}>
                        <Text style={styles.deleteText}>Delete</Text>
                      </TouchableOpacity>
                    </View>
                  </>
                ) : (
                  <>
                    <TouchableOpacity onPress={() => { setEditingId(note.id); setEditText(note.note_text); }}>
                      <Text style={styles.noteText}>{note.note_text}</Text>
                    </TouchableOpacity>
                    
                    {noteTags.length > 0 && (
                      <View style={styles.tagRow}>
                        {noteTags.map((t) => (
                          <Text key={t} style={styles.tagLabel}>#{t}</Text>
                        ))}
                      </View>
                    )}
                    
                    <View style={styles.noteFooter}>
                      <Text style={styles.noteDate}>{note.updated_at?.slice(0, 10)}</Text>
                      {note.collection_id && (
                        <View style={styles.collectionBadge}>
                          <Folder size={10} color={base.goldDim} />
                        </View>
                      )}
                    </View>
                  </>
                )}
              </View>
            );
          }}
        />

        {/* Collection picker sheet */}
        <CollectionPicker
          visible={showCollectionPicker}
          onClose={() => setShowCollectionPicker(false)}
          currentCollectionId={editCollectionId}
          onSelect={handleCollectionSelect}
        />

        {/* Note link sheet */}
        {editingId !== null && (
          <NoteLinkSheet
            visible={showLinkSheet}
            onClose={() => setShowLinkSheet(false)}
            currentNoteId={editingId}
            linkedNoteIds={editLinkedNotes.map((n) => n.id)}
            onLink={handleLinkNote}
          />
        )}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: base.bg,
  },
  keyboardView: {
    flex: 1,
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
  noteCardEditing: {
    borderColor: base.gold,
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
    minHeight: 60,
    textAlignVertical: 'top',
    backgroundColor: base.bg,
    borderRadius: radii.sm,
    padding: spacing.xs,
  },
  noteText: {
    color: base.textDim,
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
  tagLabel: {
    color: base.goldDim,
    fontFamily: fontFamily.ui,
    fontSize: 10,
  },
  metaSection: {
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: base.border,
  },
  metaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaLabel: {
    color: base.textMuted,
    fontFamily: fontFamily.ui,
    fontSize: 10,
    letterSpacing: 0.3,
    marginBottom: spacing.xs,
  },
  addLinkText: {
    color: base.gold,
    fontFamily: fontFamily.uiSemiBold,
    fontSize: 11,
  },
  collectionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: base.bg,
    borderRadius: radii.sm,
    padding: spacing.xs,
  },
  collectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  colorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  collectionName: {
    color: base.text,
    fontFamily: fontFamily.ui,
    fontSize: 13,
  },
  collectionPlaceholder: {
    color: base.textMuted,
    fontFamily: fontFamily.ui,
    fontSize: 13,
  },
  linkedNoteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: 4,
  },
  linkedNoteRef: {
    flex: 1,
    color: base.goldDim,
    fontFamily: fontFamily.ui,
    fontSize: 12,
  },
  noLinksText: {
    color: base.textMuted,
    fontFamily: fontFamily.bodyItalic,
    fontSize: 12,
  },
  noteFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  noteDate: {
    color: base.textMuted,
    fontSize: 10,
  },
  collectionBadge: {
    padding: 2,
  },
  doneText: {
    color: base.gold,
    fontFamily: fontFamily.uiSemiBold,
    fontSize: 13,
  },
  deleteText: {
    color: '#e05a6a',
    fontSize: 11,
  },
});
