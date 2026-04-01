/**
 * AllNotesScreen — Global notes browser with 3 tabs.
 *
 * Collections: View/create study collections
 * Tags: Tag cloud with count badges
 * All: Flat list of all notes with FTS search
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { ScreenNavProp } from '../navigation/types';
import { Search, X, Plus, Folder, Tag, FileText, ChevronRight, Link } from 'lucide-react-native';
import { ScreenHeader } from '../components/ScreenHeader';
import { TagChips } from '../components/TagChips';
import { CollectionPicker } from '../components/CollectionPicker';
import { NoteLinkSheet } from '../components/NoteLinkSheet';
import {
  getAllNotes,
  searchNotesFTS,
  updateNote,
  deleteNote,
  getCollections,
  getCollectionNoteCounts,
  getAllTags,
  getNotesByTag,
  createCollection,
  updateNoteTags,
  setNoteCollection,
  getCollection,
  getLinkedNotes,
  linkNotes,
  unlinkNotes,
} from '../db/user';
import { parseVerseRef, displayRef } from '../utils/verseRef';
import { base, useTheme, spacing, radii, fontFamily } from '../theme';
import type { UserNote, StudyCollection } from '../types';

type TabKey = 'collections' | 'tags' | 'all';

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

function parseTags(json: string): string[] {
  try {
    return JSON.parse(json);
  } catch {
    return [];
  }
}

export default function AllNotesScreen() {
  const { base } = useTheme();
  const navigation = useNavigation<ScreenNavProp<'More', 'AllNotes'>>();
  const [activeTab, setActiveTab] = useState<TabKey>('all');

  // All tab state
  const [notes, setNotes] = useState<UserNote[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState('');
  const [editTags, setEditTags] = useState<string[]>([]);
  const [editCollection, setEditCollection] = useState<StudyCollection | null>(null);
  const [editLinkedNotes, setEditLinkedNotes] = useState<UserNote[]>([]);
  const [showCollectionPicker, setShowCollectionPicker] = useState(false);
  const [showLinkSheet, setShowLinkSheet] = useState(false);

  // Collections tab state
  const [collections, setCollections] = useState<StudyCollection[]>([]);
  const [collectionCounts, setCollectionCounts] = useState<Record<number, number>>({});

  // Tags tab state
  const [tags, setTags] = useState<string[]>([]);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [tagNotes, setTagNotes] = useState<UserNote[]>([]);

  // Load all notes
  const reloadNotes = useCallback(async () => {
    const result = searchQuery.trim().length >= 2
      ? await searchNotesFTS(searchQuery.trim())
      : await getAllNotes();
    setNotes(result);
  }, [searchQuery]);

  // Load collections
  const reloadCollections = useCallback(async () => {
    const [cols, counts] = await Promise.all([
      getCollections(),
      getCollectionNoteCounts(),
    ]);
    setCollections(cols);
    setCollectionCounts(counts);
  }, []);

  // Load tags
  const reloadTags = useCallback(async () => {
    const allTags = await getAllTags();
    setTags(allTags);
  }, []);

  // Load notes for selected tag
  const loadTagNotes = useCallback(async (tag: string) => {
    const noteList = await getNotesByTag(tag);
    setTagNotes(noteList);
  }, []);

  useEffect(() => {
    if (activeTab === 'all') reloadNotes();
    if (activeTab === 'collections') reloadCollections();
    if (activeTab === 'tags') reloadTags();
  }, [activeTab, reloadNotes, reloadCollections, reloadTags]);

  useEffect(() => {
    if (selectedTag) loadTagNotes(selectedTag);
  }, [selectedTag, loadTagNotes]);

  const startEditing = useCallback(async (note: UserNote) => {
    setEditingId(note.id);
    setEditText(note.note_text);
    setEditTags(parseTags(note.tags_json));
    if (note.collection_id) {
      const col = await getCollection(note.collection_id);
      setEditCollection(col);
    } else {
      setEditCollection(null);
    }
    const linked = await getLinkedNotes(note.id);
    setEditLinkedNotes(linked);
  }, []);

  const handleUpdate = async (id: number) => {
    if (!editText.trim()) return;
    await updateNote(id, editText.trim());
    setEditingId(null);
    reloadNotes();
  };

  const handleEditTagsChange = useCallback(async (newTags: string[]) => {
    if (editingId === null) return;
    setEditTags(newTags);
    await updateNoteTags(editingId, newTags);
  }, [editingId]);

  const handleEditCollectionSelect = useCallback(async (collectionId: number | null) => {
    if (editingId === null) return;
    await setNoteCollection(editingId, collectionId);
    if (collectionId) {
      const col = await getCollection(collectionId);
      setEditCollection(col);
    } else {
      setEditCollection(null);
    }
    reloadNotes();
  }, [editingId, reloadNotes]);

  const handleEditLinkNote = useCallback(async (toNoteId: number) => {
    if (editingId === null) return;
    await linkNotes(editingId, toNoteId);
    const linked = await getLinkedNotes(editingId);
    setEditLinkedNotes(linked);
    setShowLinkSheet(false);
  }, [editingId]);

  const handleEditUnlink = useCallback(async (toNoteId: number) => {
    if (editingId === null) return;
    await unlinkNotes(editingId, toNoteId);
    const linked = await getLinkedNotes(editingId);
    setEditLinkedNotes(linked);
  }, [editingId]);

  const handleDelete = (id: number) => {
    Alert.alert('Delete Note', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await deleteNote(id); reloadNotes(); } },
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

  const handleCollectionPress = (collectionId: number) => {
    navigation.navigate('CollectionDetail', { collectionId });
  };

  const handleCreateCollection = () => {
    // Use a simple prompt - Alert.prompt is iOS only, so we keep it simple
    Alert.alert('New Collection', 'Use the + button in Collection Detail to create collections with custom colors.');
  };

  const groups = groupNotes(notes);

  // Tab selector
  const TabBar = () => (
    <View style={[styles.tabBar, { borderBottomColor: base.border }]}>
      {([
        { key: 'collections' as TabKey, label: 'Collections', icon: Folder },
        { key: 'tags' as TabKey, label: 'Tags', icon: Tag },
        { key: 'all' as TabKey, label: 'All', icon: FileText },
      ]).map(({ key, label, icon: Icon }) => (
        <TouchableOpacity
          key={key}
          style={[styles.tab, activeTab === key && [styles.tabActive, { borderBottomColor: base.gold }]]}
          onPress={() => { setActiveTab(key); setSelectedTag(null); }}
        >
          <Icon size={14} color={activeTab === key ? base.gold : base.textMuted} />
          <Text style={[styles.tabLabel, { color: base.textMuted }, activeTab === key && { color: base.gold }]}>
            {label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  // Render Collections tab
  const renderCollectionsTab = () => (
    <ScrollView contentContainerStyle={styles.tabContent}>
      {collections.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Text style={[styles.emptyText, { color: base.textMuted }]}>No collections yet. Assign notes to collections from the chapter notes view.</Text>
        </View>
      ) : (
        collections.map((col) => (
          <TouchableOpacity
            key={col.id}
            style={[styles.collectionCard, { backgroundColor: base.bgElevated, borderColor: base.border }]}
            onPress={() => handleCollectionPress(col.id)}
          >
            <View style={[styles.colorBar, { backgroundColor: col.color }]} />
            <View style={styles.collectionInfo}>
              <Text style={[styles.collectionName, { color: base.text }]}>{col.name}</Text>
              {col.description ? (
                <Text style={[styles.collectionDesc, { color: base.textMuted }]} numberOfLines={1}>{col.description}</Text>
              ) : null}
            </View>
            <View style={[styles.countBadge, { backgroundColor: base.gold + '20' }]}>
              <Text style={[styles.countText, { color: base.gold }]}>{collectionCounts[col.id] ?? 0}</Text>
            </View>
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
  );

  // Render Tags tab
  const renderTagsTab = () => (
    <ScrollView contentContainerStyle={styles.tabContent}>
      {tags.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Text style={[styles.emptyText, { color: base.textMuted }]}>No tags yet. Add tags to your notes to see them here.</Text>
        </View>
      ) : selectedTag ? (
        <>
          <TouchableOpacity style={styles.backRow} onPress={() => setSelectedTag(null)}>
            <Text style={[styles.backText, { color: base.gold }]}>← All Tags</Text>
          </TouchableOpacity>
          <Text style={[styles.selectedTagHeader, { color: base.gold }]}>#{selectedTag}</Text>
          {tagNotes.map((note) => (
            <TouchableOpacity
              key={note.id}
              style={[styles.noteCard, { backgroundColor: base.bgElevated, borderColor: base.border }]}
              onPress={() => handleRefPress(note.verse_ref)}
            >
              <Text style={[styles.noteRef, { color: base.gold }]}>{displayRef(note.verse_ref)}</Text>
              <Text style={[styles.noteText, { color: base.textDim }]} numberOfLines={2}>{note.note_text}</Text>
            </TouchableOpacity>
          ))}
        </>
      ) : (
        <View style={styles.tagCloud}>
          {tags.map((tag) => (
            <TouchableOpacity
              key={tag}
              style={[styles.tagChip, { backgroundColor: base.bgElevated, borderColor: base.border }]}
              onPress={() => setSelectedTag(tag)}
            >
              <Text style={[styles.tagChipText, { color: base.goldDim }]}>#{tag}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </ScrollView>
  );

  // Render All tab
  const renderAllTab = () => (
    <>
      {/* Search bar */}
      <View style={[styles.searchRow, { backgroundColor: base.bgElevated, borderColor: base.border }]}>
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
            <Text style={[styles.emptyText, { color: base.textMuted }]}>
              {searchQuery ? 'No notes match your search.' : 'No notes yet. Tap the pencil icon next to any verse to start.'}
            </Text>
          </View>
        }
        renderItem={({ item: group }) => (
          <View style={styles.group}>
            <TouchableOpacity onPress={() => handleRefPress(group.key)}>
              <Text style={[styles.groupHeader, { color: base.gold, borderBottomColor: base.border + '60' }]}>{group.label}</Text>
            </TouchableOpacity>

            {group.notes.map((note) => {
              const noteTags = parseTags(note.tags_json);
              return (
                <View key={note.id} style={[styles.noteCard, { backgroundColor: base.bgElevated, borderColor: editingId === note.id ? base.gold : base.border }]}>
                  <TouchableOpacity onPress={() => handleRefPress(note.verse_ref)}>
                    <Text style={[styles.noteRef, { color: base.gold }]}>{displayRef(note.verse_ref)}</Text>
                  </TouchableOpacity>

                  {editingId === note.id ? (
                    <>
                      <TextInput
                        value={editText}
                        onChangeText={setEditText}
                        multiline
                        autoFocus
                        style={[styles.editInput, { color: base.text, backgroundColor: base.bg, borderColor: base.border }]}
                      />

                      {/* Tags */}
                      <View style={[styles.metaSection, { borderTopColor: base.border }]}>
                        <Text style={[styles.metaLabel, { color: base.textMuted }]}>TAGS</Text>
                        <TagChips tags={editTags} onTagsChange={handleEditTagsChange} />
                      </View>

                      {/* Collection */}
                      <View style={[styles.metaSection, { borderTopColor: base.border }]}>
                        <Text style={[styles.metaLabel, { color: base.textMuted }]}>COLLECTION</Text>
                        <TouchableOpacity style={[styles.collectionButton, { backgroundColor: base.bg }]} onPress={() => setShowCollectionPicker(true)}>
                          {editCollection ? (
                            <View style={styles.collectionRow}>
                              <View style={[styles.colorDot, { backgroundColor: editCollection.color }]} />
                              <Text style={[styles.editCollectionName, { color: base.text }]}>{editCollection.name}</Text>
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
                          <TouchableOpacity onPress={() => setShowLinkSheet(true)}>
                            <Text style={[styles.addLinkText, { color: base.gold }]}>+ Link</Text>
                          </TouchableOpacity>
                        </View>
                        {editLinkedNotes.length > 0 ? (
                          editLinkedNotes.map((linked) => (
                            <View key={linked.id} style={styles.linkedNoteRow}>
                              <Link size={12} color={base.goldDim} />
                              <Text style={[styles.linkedNoteRef, { color: base.goldDim }]}>{displayRef(linked.verse_ref)}</Text>
                              <TouchableOpacity onPress={() => handleEditUnlink(linked.id)}>
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
                        <TouchableOpacity onPress={() => handleUpdate(note.id)}>
                          <Text style={[styles.doneText, { color: base.gold }]}>Done</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleDelete(note.id)}>
                          <Text style={styles.deleteText}>Delete</Text>
                        </TouchableOpacity>
                      </View>
                    </>
                  ) : (
                    <>
                      <TouchableOpacity onPress={() => startEditing(note)}>
                        <Text style={[styles.noteText, { color: base.textDim }]}>{note.note_text}</Text>
                      </TouchableOpacity>

                      {noteTags.length > 0 && (
                        <View style={styles.noteTagRow}>
                          {noteTags.map((t, i) => (
                            <Text key={`${i}-${t}`} style={[styles.noteTag, { color: base.goldDim }]}>#{t}</Text>
                          ))}
                        </View>
                      )}

                      <View style={styles.noteFooter}>
                        <Text style={[styles.noteDate, { color: base.textMuted }]}>{note.updated_at?.slice(0, 10)}</Text>
                        <TouchableOpacity onPress={() => handleDelete(note.id)}>
                          <Text style={styles.deleteText}>Delete</Text>
                        </TouchableOpacity>
                      </View>
                    </>
                  )}
                </View>
              );
            })}
          </View>
        )}
      />
    </>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: base.bg }]} edges={['top']}>
      <ScreenHeader
        title="Notes"
        onBack={() => navigation.goBack()}
        style={styles.header}
      />

      <TabBar />

      {activeTab === 'collections' && renderCollectionsTab()}
      {activeTab === 'tags' && renderTagsTab()}
      {activeTab === 'all' && renderAllTab()}
      <CollectionPicker
        visible={showCollectionPicker}
        onClose={() => setShowCollectionPicker(false)}
        currentCollectionId={editCollection?.id ?? null}
        onSelect={handleEditCollectionSelect}
      />

      {editingId !== null && (
        <NoteLinkSheet
          visible={showLinkSheet}
          onClose={() => setShowLinkSheet(false)}
          currentNoteId={editingId}
          linkedNoteIds={editLinkedNotes.map((n) => n.id)}
          onLink={handleEditLinkNote}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xs,
    paddingBottom: spacing.sm,
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: spacing.sm,
  },
  tabActive: {
    borderBottomWidth: 2,
  },
  tabLabel: {
    fontFamily: fontFamily.uiSemiBold,
    fontSize: 12,
  },
  tabContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  collectionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
  },
  colorBar: {
    width: 4,
    height: 36,
    borderRadius: 2,
    marginRight: spacing.sm,
  },
  collectionInfo: {
    flex: 1,
  },
  collectionName: {
    fontFamily: fontFamily.displayMedium,
    fontSize: 14,
  },
  collectionDesc: {
    fontFamily: fontFamily.ui,
    fontSize: 12,
    marginTop: 2,
  },
  countBadge: {
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  countText: {
    fontFamily: fontFamily.uiSemiBold,
    fontSize: 12,
  },
  tagCloud: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  tagChip: {
    borderRadius: radii.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderWidth: 1,
  },
  tagChipText: {
    fontFamily: fontFamily.uiSemiBold,
    fontSize: 13,
  },
  backRow: {
    marginBottom: spacing.sm,
  },
  backText: {
    fontFamily: fontFamily.ui,
    fontSize: 13,
  },
  selectedTagHeader: {
    fontFamily: fontFamily.displayMedium,
    fontSize: 18,
    marginBottom: spacing.md,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radii.md,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.sm,
    height: 40,
    gap: spacing.xs,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
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
    fontFamily: fontFamily.bodyItalic,
    fontSize: 15,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
  },
  group: {
    gap: spacing.sm,
  },
  groupHeader: {
    fontFamily: fontFamily.displayMedium,
    fontSize: 14,
    paddingBottom: spacing.xs,
    borderBottomWidth: 1,
  },
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
    borderWidth: 1,
  },
  noteText: {
    fontFamily: fontFamily.body,
    fontSize: 14,
    marginTop: 4,
  },
  noteTagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: spacing.xs,
  },
  noteTag: {
    fontFamily: fontFamily.ui,
    fontSize: 10,
  },
  noteFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  noteDate: {
    fontSize: 10,
  },
  deleteText: {
    color: '#e05a6a',
    fontSize: 11,
  },
  doneText: {
    fontFamily: fontFamily.uiSemiBold,
    fontSize: 13,
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
  editCollectionName: {
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
});
