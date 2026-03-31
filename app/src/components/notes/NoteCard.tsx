/**
 * NoteCard — Displays a single note in read or edit mode.
 *
 * Read mode: tap-to-edit, shows tags and date.
 * Edit mode: text input, tag chips, collection picker, linked notes, done/delete.
 */

import React from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { X, ChevronRight, Link, Folder } from 'lucide-react-native';
import { TagChips } from '../TagChips';
import { displayRef } from '../../utils/verseRef';
import { useTheme, spacing, radii, fontFamily } from '../../theme';
import type { UserNote, StudyCollection } from '../../types';

interface Props {
  note: UserNote;
  isEditing: boolean;
  editText: string;
  editTags: string[];
  editCollection: StudyCollection | null;
  editLinkedNotes: UserNote[];
  formatNoteRef: (ref: string) => string;
  parseTags: (json: string) => string[];
  onStartEditing: (note: UserNote) => void;
  onEditTextChange: (text: string) => void;
  onDone: (id: number) => void;
  onDelete: (id: number) => void;
  onTagsChange: (tags: string[]) => Promise<void>;
  onOpenCollectionPicker: () => void;
  onOpenLinkSheet: () => void;
  onUnlink: (toNoteId: number) => void;
}

export function NoteCard({
  note,
  isEditing,
  editText,
  editTags,
  editCollection,
  editLinkedNotes,
  formatNoteRef,
  parseTags,
  onStartEditing,
  onEditTextChange,
  onDone,
  onDelete,
  onTagsChange,
  onOpenCollectionPicker,
  onOpenLinkSheet,
  onUnlink,
}: Props) {
  const { base } = useTheme();
  const noteTags = isEditing ? editTags : parseTags(note.tags_json);

  return (
    <View style={[styles.noteCard, { backgroundColor: base.bgElevated, borderColor: isEditing ? base.gold : base.border }]}>
      <Text style={[styles.noteRef, { color: base.gold }]}>{formatNoteRef(note.verse_ref)}</Text>

      {isEditing ? (
        <>
          <TextInput
            value={editText}
            onChangeText={onEditTextChange}
            multiline
            autoFocus
            style={[styles.editInput, { color: base.text, backgroundColor: base.bg, borderColor: base.border }]}
          />

          {/* Tags */}
          <View style={[styles.metaSection, { borderTopColor: base.border }]}>
            <Text style={[styles.metaLabel, { color: base.textMuted }]}>TAGS</Text>
            <TagChips tags={editTags} onTagsChange={onTagsChange} />
          </View>

          {/* Collection */}
          <View style={[styles.metaSection, { borderTopColor: base.border }]}>
            <Text style={[styles.metaLabel, { color: base.textMuted }]}>COLLECTION</Text>
            <TouchableOpacity style={[styles.collectionButton, { backgroundColor: base.bg }]} onPress={onOpenCollectionPicker}>
              {editCollection ? (
                <View style={styles.collectionRow}>
                  <View style={[styles.colorDot, { backgroundColor: editCollection.color }]} />
                  <Text style={[styles.collectionName, { color: base.text }]}>{editCollection.name}</Text>
                </View>
              ) : (
                <Text style={[styles.collectionPlaceholder, { color: base.textMuted }]}>None</Text>
              )}
              <ChevronRight size={16} color={base.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Linked notes */}
          <View style={[styles.metaSection, { borderTopColor: base.border }]}>
            <View style={styles.metaHeader}>
              <Text style={[styles.metaLabel, { color: base.textMuted }]}>LINKED NOTES</Text>
              <TouchableOpacity onPress={onOpenLinkSheet}>
                <Text style={[styles.addLinkText, { color: base.gold }]}>+ Link</Text>
              </TouchableOpacity>
            </View>
            {editLinkedNotes.length > 0 ? (
              editLinkedNotes.map((linked) => (
                <View key={linked.id} style={styles.linkedNoteRow}>
                  <Link size={12} color={base.goldDim} />
                  <Text style={[styles.linkedNoteRef, { color: base.goldDim }]}>{displayRef(linked.verse_ref)}</Text>
                  <TouchableOpacity onPress={() => onUnlink(linked.id)}>
                    <X size={14} color={base.textMuted} />
                  </TouchableOpacity>
                </View>
              ))
            ) : (
              <Text style={[styles.noLinksText, { color: base.textMuted }]}>No linked notes</Text>
            )}
          </View>

          {/* Actions */}
          <View style={styles.noteFooter}>
            <TouchableOpacity onPress={() => onDone(note.id)}>
              <Text style={[styles.doneText, { color: base.gold }]}>Done</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => onDelete(note.id)}>
              <Text style={styles.deleteText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <>
          <TouchableOpacity onPress={() => onStartEditing(note)}>
            <Text style={[styles.noteText, { color: base.textDim }]}>{note.note_text}</Text>
          </TouchableOpacity>

          {noteTags.length > 0 && (
            <View style={styles.tagRow}>
              {noteTags.map((t) => (
                <Text key={t} style={[styles.tagLabel, { color: base.goldDim }]}>
                  #{t}
                </Text>
              ))}
            </View>
          )}

          <View style={styles.noteFooter}>
            <Text style={[styles.noteDate, { color: base.textMuted }]}>{note.updated_at?.slice(0, 10)}</Text>
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
}

const styles = StyleSheet.create({
  noteCard: {
    borderRadius: radii.md,
    padding: spacing.sm,
    borderWidth: 1,
  },
  noteRef: {
    fontFamily: fontFamily.uiSemiBold,
    fontSize: 12,
  },
  editInput: {
    fontFamily: fontFamily.body,
    fontSize: 14,
    marginTop: 4,
    minHeight: 60,
    textAlignVertical: 'top',
    borderRadius: radii.sm,
    padding: spacing.xs,
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
  tagLabel: {
    fontFamily: fontFamily.ui,
    fontSize: 10,
  },
  metaSection: {
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  metaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaLabel: {
    fontFamily: fontFamily.ui,
    fontSize: 10,
    letterSpacing: 0.3,
    marginBottom: spacing.xs,
  },
  addLinkText: {
    fontFamily: fontFamily.uiSemiBold,
    fontSize: 11,
  },
  collectionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    fontFamily: fontFamily.ui,
    fontSize: 13,
  },
  collectionPlaceholder: {
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
    fontFamily: fontFamily.ui,
    fontSize: 12,
  },
  noLinksText: {
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
    fontSize: 10,
  },
  collectionBadge: {
    padding: 2,
  },
  doneText: {
    fontFamily: fontFamily.uiSemiBold,
    fontSize: 13,
  },
  deleteText: {
    color: '#e05a6a',
    fontSize: 11,
  },
});
