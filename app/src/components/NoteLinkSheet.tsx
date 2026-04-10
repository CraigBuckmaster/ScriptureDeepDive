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
  const { base } = useTheme();
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

        <SafeAreaView edges={['bottom']} style={[styles.sheet, { backgroundColor: base.bgElevated }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: base.border }]}>
            <Text style={[styles.headerTitle, { color: base.text }]}>Link to Note</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={20} color={base.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Search */}
          <View style={[styles.searchRow, { backgroundColor: base.bg, borderColor: base.border }]}>
            <Search size={16} color={base.textMuted} />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search notes..."
              placeholderTextColor={base.textMuted}
              style={[styles.searchInput, { color: base.text }]}
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
                  style={[styles.noteRow, { borderBottomColor: base.border }, linked && styles.noteRowLinked]}
                  onPress={() => handleLink(item.id)}
                  disabled={linked}
                >
                  <View style={styles.noteInfo}>
                    <Text style={[styles.noteRef, { color: base.gold }]}>{displayRef(item.verse_ref)}</Text>
                    <Text style={[styles.noteText, { color: base.textDim }]} numberOfLines={2}>
                      {item.note_text}
                    </Text>
                  </View>
                  {linked ? (
                    <Link size={16} color={base.gold} />
                  ) : (
                    <Text style={[styles.linkText, { color: base.gold }]}>Link</Text>
                  )}
                </TouchableOpacity>
              );
            }}
            ListEmptyComponent={
              <View style={styles.emptyWrap}>
                <Text style={[styles.emptyText, { color: base.textMuted }]}>
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
    backgroundColor: 'rgba(0,0,0,0.5)', // overlay-color: intentional
  },
  sheet: {
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
  },
  headerTitle: {
    fontFamily: fontFamily.displayMedium,
    fontSize: 16,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radii.md,
    marginHorizontal: spacing.md,
    marginVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    height: 36,
    gap: spacing.xs,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
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
  },
  noteRowLinked: {
    opacity: 0.5,
  },
  noteInfo: {
    flex: 1,
    marginRight: spacing.sm,
  },
  noteRef: {
    fontFamily: fontFamily.uiSemiBold,
    fontSize: 12,
  },
  noteText: {
    fontFamily: fontFamily.body,
    fontSize: 13,
    marginTop: 2,
  },
  linkText: {
    fontFamily: fontFamily.uiSemiBold,
    fontSize: 13,
  },
  emptyWrap: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyText: {
    fontFamily: fontFamily.bodyItalic,
    fontSize: 14,
  },
});
