/**
 * NoteLinkSheet — Bottom sheet for searching and linking notes.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, Search, Link } from 'lucide-react-native';
import { getAllNotes, searchNotesFTS, getLinkedNotes } from '../db/user';
import { displayRef } from '../utils/verseRef';
import { useTheme, spacing, radii, fontFamily } from '../theme';
import type { UserNote } from '../types';

interface Props {
  visible: boolean;
  onClose: () => void;
  currentNoteId: number;
  linkedNoteIds: number[];
  onLink: (noteId: number) => void;
}

export function NoteLinkSheet({ visible, onClose, currentNoteId, linkedNoteIds, onLink }: Props) {
  const [notes, setNotes] = useState<UserNote[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const reload = useCallback(async () => {
    if (!visible) return;
    
    let results: UserNote[];
    if (searchQuery.trim().length >= 2) {
      results = await searchNotesFTS(searchQuery.trim());
    } else {
      results = await getAllNotes();
    }
    // Filter out the current note
    setNotes(results.filter((n) => n.id !== currentNoteId));
  }, [visible, searchQuery, currentNoteId]);

  useEffect(() => {
    reload();
  }, [reload]);

  const handleLink = (noteId: number) => {
    onLink(noteId);
  };

  const isLinked = (noteId: number) => linkedNoteIds.includes(noteId);

  return (
    <Modal visible={visible} animationType="slide" transparent presentationStyle="overFullScreen">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <TouchableOpacity style={styles.backdrop} onPress={onClose} activeOpacity={1} />

        <SafeAreaView edges={['bottom']} style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Link to Note</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={20} color={base.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Search */}
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
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <X size={16} color={base.textMuted} />
              </TouchableOpacity>
            )}
          </View>

          {/* Notes list */}
          <FlatList
            data={notes}
            keyExtractor={(n) => String(n.id)}
            style={styles.list}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => {
              const linked = isLinked(item.id);
              return (
                <TouchableOpacity
                  style={[styles.noteRow, linked && styles.noteRowLinked]}
                  onPress={() => handleLink(item.id)}
                  disabled={linked}
                >
                  <View style={styles.noteInfo}>
                    <Text style={styles.noteRef}>{displayRef(item.verse_ref)}</Text>
                    <Text style={styles.noteText} numberOfLines={2}>
                      {item.note_text}
                    </Text>
                  </View>
                  {linked ? (
                    <Link size={16} color={base.gold} />
                  ) : (
                    <Text style={styles.linkText}>Link</Text>
                  )}
                </TouchableOpacity>
              );
            }}
            ListEmptyComponent={
              <View style={styles.emptyWrap}>
                <Text style={styles.emptyText}>
                  {searchQuery ? 'No notes match your search.' : 'No other notes to link.'}
                </Text>
              </View>
            }
          />
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    backgroundColor: base.bgElevated,
    borderTopLeftRadius: radii.lg,
    borderTopRightRadius: radii.lg,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: base.border,
  },
  headerTitle: {
    color: base.text,
    fontFamily: fontFamily.displayMedium,
    fontSize: 16,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: base.bg,
    borderRadius: radii.md,
    marginHorizontal: spacing.md,
    marginVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    height: 36,
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: base.border,
  },
  searchInput: {
    flex: 1,
    color: base.text,
    fontFamily: fontFamily.ui,
    fontSize: 14,
    height: 36,
  },
  list: {
    flexGrow: 0,
  },
  listContent: {
    paddingBottom: spacing.xl,
  },
  noteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: base.border,
  },
  noteRowLinked: {
    opacity: 0.5,
  },
  noteInfo: {
    flex: 1,
    marginRight: spacing.sm,
  },
  noteRef: {
    color: base.gold,
    fontFamily: fontFamily.uiSemiBold,
    fontSize: 12,
  },
  noteText: {
    color: base.textDim,
    fontFamily: fontFamily.body,
    fontSize: 13,
    marginTop: 2,
  },
  linkText: {
    color: base.gold,
    fontFamily: fontFamily.uiSemiBold,
    fontSize: 13,
  },
  emptyWrap: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyText: {
    color: base.textMuted,
    fontFamily: fontFamily.bodyItalic,
    fontSize: 14,
  },
});
