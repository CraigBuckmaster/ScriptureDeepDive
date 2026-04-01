/**
 * NewNoteInput — Form for creating a new note.
 *
 * Shows verse reference, text input, tags, collection, linked notes,
 * and cancel button. Auto-saves on blur and transitions to edit mode.
 */

import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { ChevronRight, Link, X } from 'lucide-react-native';
import { TagChips } from '../TagChips';
import { displayRef } from '../../utils/verseRef';
import { useTheme, spacing, radii, fontFamily } from '../../theme';
import type { StudyCollection, UserNote } from '../../types';

interface Props {
  addRef: string;
  newText: string;
  newTextRef: React.RefObject<TextInput | null>;
  formatNoteRef: (ref: string) => string;
  onTextChange: (text: string) => void;
  onBlur: () => void;
  onCancel: () => void;
  newTags: string[];
  onNewTagsChange: (tags: string[]) => void;
  newCollection: StudyCollection | null;
  onOpenCollectionPicker: () => void;
  newLinkedNotes: UserNote[];
  onOpenLinkSheet: () => void;
  onUnlink: (toNoteId: number) => void;
}

export function NewNoteInput({
  addRef,
  newText,
  newTextRef,
  formatNoteRef,
  onTextChange,
  onBlur,
  onCancel,
  newTags,
  onNewTagsChange,
  newCollection,
  onOpenCollectionPicker,
  newLinkedNotes,
  onOpenLinkSheet,
  onUnlink,
}: Props) {
  const { base } = useTheme();
  return (
    <View style={[styles.addForm, { borderBottomColor: base.border }]}>
      <Text style={[styles.addLabel, { color: base.gold }]}>{formatNoteRef(addRef)}</Text>
      <TextInput
        ref={newTextRef}
        value={newText}
        onChangeText={onTextChange}
        onBlur={onBlur}
        multiline
        placeholder="Type your note — saves automatically..."
        placeholderTextColor={base.textMuted}
        style={[styles.addInput, { backgroundColor: base.bgElevated, color: base.text, borderColor: base.border }]}
      />

      {/* Tags */}
      <View style={[styles.metaSection, { borderTopColor: base.border }]}>
        <Text style={[styles.metaLabel, { color: base.textMuted }]}>TAGS</Text>
        <TagChips tags={newTags} onTagsChange={onNewTagsChange} />
      </View>

      {/* Collection */}
      <View style={[styles.metaSection, { borderTopColor: base.border }]}>
        <Text style={[styles.metaLabel, { color: base.textMuted }]}>COLLECTION</Text>
        <TouchableOpacity style={[styles.collectionButton, { backgroundColor: base.bgElevated }]} onPress={onOpenCollectionPicker}>
          {newCollection ? (
            <View style={styles.collectionRow}>
              <View style={[styles.colorDot, { backgroundColor: newCollection.color }]} />
              <Text style={[styles.collectionName, { color: base.text }]}>{newCollection.name}</Text>
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
        {newLinkedNotes.length > 0 ? (
          newLinkedNotes.map((linked) => (
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

      <TouchableOpacity onPress={onCancel} style={styles.cancelButton}>
        <Text style={[styles.cancelText, { color: base.textMuted }]}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  addForm: {
    padding: spacing.md,
    gap: spacing.sm,
    borderBottomWidth: 1,
  },
  addLabel: {
    fontFamily: fontFamily.uiSemiBold,
    fontSize: 12,
  },
  addInput: {
    borderRadius: radii.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    fontFamily: fontFamily.body,
    fontSize: 14,
    minHeight: 60,
    borderWidth: 1,
    textAlignVertical: 'top',
  },
  metaSection: {
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
  cancelButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    alignSelf: 'flex-start',
  },
  cancelText: {
    fontSize: 13,
  },
});
