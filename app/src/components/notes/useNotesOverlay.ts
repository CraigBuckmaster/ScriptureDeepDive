/**
 * useNotesOverlay — All state and CRUD operations for the NotesOverlay.
 *
 * Owns every useState that was previously in the monolith.
 * Returns a stable interface that child components consume.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Alert,
  TextInput,
} from 'react-native';
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
} from '../../db/user';
import { formatVerseRef, displayRef } from '../../utils/verseRef';
import type { UserNote, StudyCollection } from '../../types';

function parseTags(json: string): string[] {
  try {
    return JSON.parse(json);
  } catch {
    return [];
  }
}

interface UseNotesOverlayParams {
  visible: boolean;
  onClose: () => void;
  bookId: string;
  bookName?: string;
  chapterNum: number;
  initialVerseNum?: number | null;
}

export interface NotesOverlayState {
  /* Data */
  notes: UserNote[];
  displayName: string;

  /* Edit mode */
  editingId: number | null;
  editText: string;
  editTags: string[];
  editCollection: StudyCollection | null;
  editLinkedNotes: UserNote[];

  /* New note */
  showAdd: boolean;
  newText: string;
  addRef: string;
  newTextRef: React.RefObject<TextInput | null>;
  newTags: string[];
  newCollection: StudyCollection | null;
  newLinkedNotes: UserNote[];

  /* Sub-modals */
  showCollectionPicker: boolean;
  showLinkSheet: boolean;

  /* Helpers */
  formatNoteRef: (ref: string) => string;
  parseTags: (json: string) => string[];

  /* Actions */
  handleClose: () => Promise<void>;
  handleShowAdd: () => void;
  handleCancelAdd: () => void;
  handleNewTextChange: (text: string) => void;
  handleNewNoteBlur: () => Promise<void>;
  startEditing: (note: UserNote) => void;
  handleUpdate: (id: number) => Promise<void>;
  handleDelete: (id: number) => void;
  handleTagsChange: (newTags: string[]) => Promise<void>;
  handleNewTagsChange: (newTags: string[]) => void;
  handleCollectionSelect: (collectionId: number | null) => Promise<void>;
  handleLinkNote: (toNoteId: number) => Promise<void>;
  handleUnlink: (toNoteId: number) => Promise<void>;
  handleNewUnlink: (toNoteId: number) => void;
  setShowCollectionPicker: (v: boolean) => void;
  setShowLinkSheet: (v: boolean) => void;
  setEditText: (text: string) => void;
}

export function useNotesOverlay({
  visible,
  onClose,
  bookId,
  bookName,
  chapterNum,
  initialVerseNum,
}: UseNotesOverlayParams): NotesOverlayState {
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
  const [newTags, setNewTags] = useState<string[]>([]);
  const [newCollectionId, setNewCollectionId] = useState<number | null>(null);
  const [newCollection, setNewCollection] = useState<StudyCollection | null>(null);
  const [newLinkedNotes, setNewLinkedNotes] = useState<UserNote[]>([]);

  const [showCollectionPicker, setShowCollectionPicker] = useState(false);
  const [showLinkSheet, setShowLinkSheet] = useState(false);

  const displayName = bookName ?? bookId;

  const makeRef = (verseNum?: number | null) =>
    formatVerseRef(bookId, chapterNum, verseNum ?? undefined);

  const formatNoteRef = useCallback(
    (ref: string) => {
      const displayed = displayRef(ref);
      if (displayName !== bookId) {
        const titleBookId = bookId
          .replace(/_/g, ' ')
          .replace(/\b\w/g, (c) => c.toUpperCase());
        return displayed.replace(titleBookId, displayName);
      }
      return displayed;
    },
    [displayName, bookId],
  );

  const reload = useCallback(async () => {
    if (bookId && chapterNum) {
      const fetched = await getNotesForChapter(bookId, chapterNum);
      setNotes(fetched);
      return fetched;
    }
    return [];
  }, [bookId, chapterNum]);

  // Reload notes when overlay becomes visible
  useEffect(() => {
    if (visible) reload();
  }, [visible, reload]);

  // Auto-open add form when launched with a specific verse
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

  /* ─── Actions ─── */

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

  const handleShowAdd = useCallback(() => {
    setAddRef(makeRef());
    setShowAdd(true);
    setTimeout(() => newTextRef.current?.focus(), 100);
  }, [bookId, chapterNum]);

  const handleCancelAdd = useCallback(() => {
    pendingNewText.current = '';
    setNewText('');
    setShowAdd(false);
    setAddRef('');
    setNewTags([]);
    setNewCollectionId(null);
    setNewCollection(null);
    setNewLinkedNotes([]);
  }, []);

  const handleNewTextChange = useCallback((text: string) => {
    setNewText(text);
    pendingNewText.current = text;
  }, []);

  const handleNewNoteBlur = useCallback(async () => {
    if (pendingNewText.current.trim()) {
      const savedText = pendingNewText.current.trim();
      const newId = await saveNote(addRef || makeRef(), savedText);
      // Apply tags, collection, and linked notes gathered during creation
      if (newTags.length > 0) await updateNoteTags(newId, newTags);
      if (newCollectionId !== null) await setNoteCollection(newId, newCollectionId);
      for (const linked of newLinkedNotes) await linkNotes(newId, linked.id);
      pendingNewText.current = '';
      setNewText('');
      setShowAdd(false);
      setAddRef('');
      setNewTags([]);
      setNewCollectionId(null);
      setNewCollection(null);
      setNewLinkedNotes([]);
      await reload();
      setEditingId(newId);
      setEditText(savedText);
    }
  }, [addRef, bookId, chapterNum, reload, newTags, newCollectionId, newLinkedNotes]);

  const startEditing = useCallback((note: UserNote) => {
    setEditingId(note.id);
    setEditText(note.note_text);
  }, []);

  const handleUpdate = useCallback(
    async (id: number) => {
      if (!editText.trim()) return;
      await updateNote(id, editText.trim());
      setEditingId(null);
      reload();
    },
    [editText, reload],
  );

  const handleDelete = useCallback(
    (id: number) => {
      Alert.alert('Delete Note', 'Are you sure?', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteNote(id);
            setEditingId(null);
            reload();
          },
        },
      ]);
    },
    [reload],
  );

  const handleTagsChange = useCallback(
    async (newTags: string[]) => {
      if (editingId === null) return;
      setEditTags(newTags);
      await updateNoteTags(editingId, newTags);
    },
    [editingId],
  );

  const handleCollectionSelect = useCallback(
    async (collectionId: number | null) => {
      if (showAdd) {
        // New note mode — store temporarily
        setNewCollectionId(collectionId);
        if (collectionId) {
          const col = await getCollection(collectionId);
          setNewCollection(col);
        } else {
          setNewCollection(null);
        }
        return;
      }
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
    },
    [editingId, showAdd, reload],
  );

  const handleLinkNote = useCallback(
    async (toNoteId: number) => {
      if (showAdd) {
        // New note mode — store temporarily (need to fetch the note object)
        const allNotes = await getNotesForChapter(bookId, chapterNum);
        const linkedNote = allNotes.find((n) => n.id === toNoteId);
        if (linkedNote && !newLinkedNotes.some((n) => n.id === toNoteId)) {
          setNewLinkedNotes((prev) => [...prev, linkedNote]);
        }
        setShowLinkSheet(false);
        return;
      }
      if (editingId === null) return;
      await linkNotes(editingId, toNoteId);
      const linked = await getLinkedNotes(editingId);
      setEditLinkedNotes(linked);
      setShowLinkSheet(false);
    },
    [editingId, showAdd, bookId, chapterNum, newLinkedNotes],
  );

  const handleUnlink = useCallback(
    async (toNoteId: number) => {
      if (editingId === null) return;
      await unlinkNotes(editingId, toNoteId);
      const linked = await getLinkedNotes(editingId);
      setEditLinkedNotes(linked);
    },
    [editingId],
  );

  const handleNewUnlink = useCallback(
    (toNoteId: number) => {
      setNewLinkedNotes((prev) => prev.filter((n) => n.id !== toNoteId));
    },
    [],
  );

  const handleNewTagsChange = useCallback(
    (tags: string[]) => {
      setNewTags(tags);
    },
    [],
  );

  return {
    notes,
    displayName,
    editingId,
    editText,
    editTags,
    editCollection,
    editLinkedNotes,
    showAdd,
    newText,
    addRef,
    newTextRef,
    newTags,
    newCollection,
    newLinkedNotes,
    showCollectionPicker,
    showLinkSheet,
    formatNoteRef,
    parseTags,
    handleClose,
    handleShowAdd,
    handleCancelAdd,
    handleNewTextChange,
    handleNewNoteBlur,
    startEditing,
    handleUpdate,
    handleDelete,
    handleTagsChange,
    handleNewTagsChange,
    handleCollectionSelect,
    handleLinkNote,
    handleUnlink,
    handleNewUnlink,
    setShowCollectionPicker,
    setShowLinkSheet,
    setEditText,
  };
}
