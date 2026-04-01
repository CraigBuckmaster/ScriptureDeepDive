/**
 * NotesOverlay — Full-screen modal for viewing/editing per-chapter notes.
 *
 * Thin shell that wires useNotesOverlay hook to child components.
 * State and CRUD live in the hook; rendering lives in NoteCard and NewNoteInput.
 */

import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { X, Plus } from 'lucide-react-native';
import { CollectionPicker } from '../CollectionPicker';
import { NoteLinkSheet } from '../NoteLinkSheet';
import { NoteCard } from './NoteCard';
import { NewNoteInput } from './NewNoteInput';
import { useNotesOverlay } from './useNotesOverlay';
import { useTheme, spacing, fontFamily, MIN_TOUCH_TARGET } from '../../theme';
import type { UserNote } from '../../types';

interface Props {
  visible: boolean;
  onClose: () => void;
  bookId: string;
  bookName?: string;
  chapterNum: number;
  initialVerseNum?: number | null;
}

export function NotesOverlay({ visible, onClose, bookId, bookName, chapterNum, initialVerseNum }: Props) {
  const { base } = useTheme();
  const state = useNotesOverlay({ visible, onClose, bookId, bookName, chapterNum, initialVerseNum });

  const renderNote = ({ item: note }: { item: UserNote }) => (
    <NoteCard
      note={note}
      isEditing={state.editingId === note.id}
      editText={state.editText}
      editTags={state.editTags}
      editCollection={state.editCollection}
      editLinkedNotes={state.editLinkedNotes}
      formatNoteRef={state.formatNoteRef}
      parseTags={state.parseTags}
      onStartEditing={state.startEditing}
      onEditTextChange={state.setEditText}
      onDone={state.handleUpdate}
      onDelete={state.handleDelete}
      onTagsChange={state.handleTagsChange}
      onOpenCollectionPicker={() => state.setShowCollectionPicker(true)}
      onOpenLinkSheet={() => state.setShowLinkSheet(true)}
      onUnlink={state.handleUnlink}
    />
  );

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen">
      <SafeAreaProvider>
        <SafeAreaView style={[styles.container, { backgroundColor: base.bg }]}>
          {/* Header — outside KAV so it doesn't shift with keyboard */}
          <View style={[styles.header, { borderBottomColor: base.border }]}>
            <Text style={[styles.headerTitle, { color: base.text }]}>
              Notes — {state.displayName} {chapterNum}
            </Text>
            <View style={styles.headerActions}>
              <TouchableOpacity onPress={state.handleShowAdd} style={styles.headerButton} accessibilityLabel="Add note">
                <Plus size={20} color={base.gold} />
              </TouchableOpacity>
              <TouchableOpacity onPress={state.handleClose} style={styles.headerButton} accessibilityLabel="Close notes">
                <X size={20} color={base.gold} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Scrollable content with keyboard avoidance */}
          <KeyboardAvoidingView
            style={styles.keyboardView}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
          >
            {state.showAdd && (
              <NewNoteInput
                addRef={state.addRef}
                newText={state.newText}
                newTextRef={state.newTextRef}
                formatNoteRef={state.formatNoteRef}
                onTextChange={state.handleNewTextChange}
                onBlur={state.handleNewNoteBlur}
                onCancel={state.handleCancelAdd}
                newTags={state.newTags}
                onNewTagsChange={state.handleNewTagsChange}
                newCollection={state.newCollection}
                onOpenCollectionPicker={() => state.setShowCollectionPicker(true)}
                newLinkedNotes={state.newLinkedNotes}
                onOpenLinkSheet={() => state.setShowLinkSheet(true)}
                onUnlink={state.handleNewUnlink}
              />
            )}

            <FlatList
              data={state.notes}
              keyExtractor={(n) => String(n.id)}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.listContent}
              ListEmptyComponent={
                <View style={styles.emptyWrap}>
                  <Text style={[styles.emptyText, { color: base.textMuted }]}>No notes yet for this chapter.</Text>
                </View>
              }
              renderItem={renderNote}
            />
          </KeyboardAvoidingView>

          {/* Sub-modals — outside KAV, they manage their own keyboard */}
          <CollectionPicker
            visible={state.showCollectionPicker}
            onClose={() => state.setShowCollectionPicker(false)}
            currentCollectionId={state.showAdd ? (state.newCollection?.id ?? null) : (state.editCollection?.id ?? null)}
            onSelect={state.handleCollectionSelect}
          />

          {(state.editingId !== null || state.showAdd) && (
            <NoteLinkSheet
              visible={state.showLinkSheet}
              onClose={() => state.setShowLinkSheet(false)}
              currentNoteId={state.editingId ?? -1}
              linkedNoteIds={state.showAdd ? state.newLinkedNotes.map((n) => n.id) : state.editLinkedNotes.map((n) => n.id)}
              onLink={state.handleLinkNote}
            />
          )}
        </SafeAreaView>
      </SafeAreaProvider>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  },
  headerTitle: {
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
  listContent: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  emptyWrap: {
    alignItems: 'center',
    paddingTop: spacing.xxl,
  },
  emptyText: {
    fontFamily: fontFamily.bodyItalic,
    fontSize: 15,
  },
});
