// study-storage.js — Personal study data persistence for Scripture Deep Dive
//
// Thin wrapper around window.storage (PWA persistent storage API).
// Provides CRUD for per-verse notes with chapter-level grouping.
//
// Usage:
//   await StudyStorage.saveNote("Gen 22:1", "The Akedah — sacrifice and faith.");
//   var notes = await StudyStorage.getNotesForChapter("genesis", 22);
//   await StudyStorage.deleteNote("genesis", 22, "note-id-here");
//   var all = await StudyStorage.getAllNotes();
//   var json = await StudyStorage.exportAll();
//
// Storage keys: "notes:{book}:{ch}" → JSON array of note objects.
// All data is personal (shared: false). No data leaves the device.
//
// Depends on: window.storage (PWA persistent storage API)
// Consumed by: annotations.js, journal.html

(function() {
  'use strict';

  // ── Helpers ─────────────────────────────────────────────────────────────

  var STORAGE = window.storage || null;
  var DEBOUNCE_MS = 500;
  var _writeTimers = {};

  function _key(book, ch) {
    return 'notes:' + book + ':' + ch;
  }

  function _uuid() {
    // Simple UUID v4 — good enough for local note IDs
    return 'xxxx-xxxx-xxxx'.replace(/x/g, function() {
      return (Math.random() * 16 | 0).toString(16);
    });
  }

  function _now() {
    return new Date().toISOString();
  }

  // Read a chapter's notes from storage. Returns [] on any failure.
  async function _read(book, ch) {
    if (!STORAGE) return [];
    try {
      var result = await STORAGE.get(_key(book, ch));
      if (result && result.value) {
        return JSON.parse(result.value);
      }
    } catch (e) {
      // Key doesn't exist or parse error — both are fine
    }
    return [];
  }

  // Write a chapter's notes to storage.
  async function _write(book, ch, notes) {
    if (!STORAGE) return false;
    try {
      var result = await STORAGE.set(_key(book, ch), JSON.stringify(notes));
      return !!result;
    } catch (e) {
      console.error('StudyStorage write failed:', e);
      return false;
    }
  }

  // Debounced write — batches rapid edits into a single storage call.
  function _debouncedWrite(book, ch, notes) {
    var k = _key(book, ch);
    if (_writeTimers[k]) clearTimeout(_writeTimers[k]);
    _writeTimers[k] = setTimeout(function() {
      _write(book, ch, notes);
      delete _writeTimers[k];
    }, DEBOUNCE_MS);
  }


  // ── Public API ──────────────────────────────────────────────────────────

  // Save a note for a verse. Creates new or updates existing.
  // verseRef: canonical string like "Gen 22:1" — parsed to get book + ch.
  // text: the note content.
  // existingId: if provided, updates that note instead of creating new.
  // Returns the note object.
  async function saveNote(verseRef, text, existingId) {
    var parsed = window.VerseResolver ? window.VerseResolver.parse(verseRef) : null;
    if (!parsed) {
      console.warn('StudyStorage.saveNote: could not parse ref:', verseRef);
      return null;
    }

    var book = parsed.book;
    var ch = parsed.ch;
    var notes = await _read(book, ch);
    var timestamp = _now();

    if (existingId) {
      // Update existing note
      for (var i = 0; i < notes.length; i++) {
        if (notes[i].id === existingId) {
          notes[i].text = text;
          notes[i].updated = timestamp;
          _debouncedWrite(book, ch, notes);
          return notes[i];
        }
      }
    }

    // Create new note
    var note = {
      id: _uuid(),
      verse: parsed.ref,
      verseShort: parsed.shortRef,
      book: book,
      ch: ch,
      v: parsed.v1,
      text: text,
      created: timestamp,
      updated: timestamp
    };

    notes.push(note);
    _debouncedWrite(book, ch, notes);
    return note;
  }

  // Get all notes for a chapter. Returns array (possibly empty).
  async function getNotesForChapter(book, ch) {
    var notes = await _read(book, ch);
    // Sort by verse number, then by created date
    notes.sort(function(a, b) {
      if (a.v !== b.v) return (a.v || 0) - (b.v || 0);
      return (a.created || '').localeCompare(b.created || '');
    });
    return notes;
  }

  // Get a single note by ID within a chapter.
  async function getNote(book, ch, noteId) {
    var notes = await _read(book, ch);
    for (var i = 0; i < notes.length; i++) {
      if (notes[i].id === noteId) return notes[i];
    }
    return null;
  }

  // Delete a note by ID.
  async function deleteNote(book, ch, noteId) {
    var notes = await _read(book, ch);
    var filtered = notes.filter(function(n) { return n.id !== noteId; });
    if (filtered.length < notes.length) {
      await _write(book, ch, filtered);
      return true;
    }
    return false;
  }

  // Get all notes across all books and chapters.
  // Scans storage keys matching "notes:*" pattern.
  async function getAllNotes() {
    if (!STORAGE) return [];
    try {
      var keys = await STORAGE.list('notes:');
      if (!keys || !keys.keys) return [];

      var all = [];
      for (var i = 0; i < keys.keys.length; i++) {
        try {
          var result = await STORAGE.get(keys.keys[i]);
          if (result && result.value) {
            var notes = JSON.parse(result.value);
            all = all.concat(notes);
          }
        } catch (e) {
          // Skip corrupt entries
        }
      }

      // Sort by book, chapter, verse
      all.sort(function(a, b) {
        if (a.book !== b.book) return (a.book || '').localeCompare(b.book || '');
        if (a.ch !== b.ch) return (a.ch || 0) - (b.ch || 0);
        return (a.v || 0) - (b.v || 0);
      });

      return all;
    } catch (e) {
      console.error('StudyStorage.getAllNotes failed:', e);
      return [];
    }
  }

  // Get note count for a chapter (fast — avoids full parse if possible).
  async function countNotes(book, ch) {
    var notes = await _read(book, ch);
    return notes.length;
  }

  // Export all notes as a JSON string for backup.
  async function exportAll() {
    var notes = await getAllNotes();
    return JSON.stringify({
      exported: _now(),
      app: 'Scripture Deep Dive',
      version: 1,
      notes: notes
    }, null, 2);
  }

  // Import notes from a JSON export. Merges with existing (doesn't overwrite).
  async function importNotes(jsonStr) {
    try {
      var data = JSON.parse(jsonStr);
      if (!data.notes || !Array.isArray(data.notes)) return 0;

      var imported = 0;
      // Group by book+ch
      var groups = {};
      data.notes.forEach(function(n) {
        var k = n.book + ':' + n.ch;
        if (!groups[k]) groups[k] = [];
        groups[k].push(n);
      });

      for (var k in groups) {
        var parts = k.split(':');
        var book = parts[0];
        var ch = parseInt(parts[1], 10);
        var existing = await _read(book, ch);
        var existingIds = {};
        existing.forEach(function(n) { existingIds[n.id] = true; });

        groups[k].forEach(function(n) {
          if (!existingIds[n.id]) {
            existing.push(n);
            imported++;
          }
        });

        await _write(book, ch, existing);
      }

      return imported;
    } catch (e) {
      console.error('StudyStorage.importNotes failed:', e);
      return 0;
    }
  }

  // Clear all notes (destructive — requires confirmation in UI).
  async function clearAll() {
    if (!STORAGE) return false;
    try {
      var keys = await STORAGE.list('notes:');
      if (keys && keys.keys) {
        for (var i = 0; i < keys.keys.length; i++) {
          await STORAGE.delete(keys.keys[i]);
        }
      }
      return true;
    } catch (e) {
      return false;
    }
  }

  // Check if storage is available.
  function isAvailable() {
    return !!STORAGE;
  }


  // ── Expose ──────────────────────────────────────────────────────────────

  window.StudyStorage = {
    saveNote: saveNote,
    getNotesForChapter: getNotesForChapter,
    getNote: getNote,
    deleteNote: deleteNote,
    getAllNotes: getAllNotes,
    countNotes: countNotes,
    exportAll: exportAll,
    importNotes: importNotes,
    clearAll: clearAll,
    isAvailable: isAvailable
  };

})();
