/**
 * NewNoteInput — Form for creating a new note.
 *
 * Shows verse reference, text input, and cancel button.
 * Auto-saves on blur and transitions to edit mode.
 */

import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { base, spacing, radii, fontFamily } from '../../theme';

interface Props {
  addRef: string;
  newText: string;
  newTextRef: React.RefObject<TextInput | null>;
  formatNoteRef: (ref: string) => string;
  onTextChange: (text: string) => void;
  onBlur: () => void;
  onCancel: () => void;
}

export function NewNoteInput({
  addRef,
  newText,
  newTextRef,
  formatNoteRef,
  onTextChange,
  onBlur,
  onCancel,
}: Props) {
  return (
    <View style={styles.addForm}>
      <Text style={styles.addLabel}>{formatNoteRef(addRef)}</Text>
      <TextInput
        ref={newTextRef}
        value={newText}
        onChangeText={onTextChange}
        onBlur={onBlur}
        multiline
        placeholder="Type your note — saves automatically..."
        placeholderTextColor={base.textMuted}
        style={styles.addInput}
      />
      <TouchableOpacity onPress={onCancel} style={styles.cancelButton}>
        <Text style={styles.cancelText}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
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
});
