(function() {
'use strict';
// study-storage.js — Personal study data persistence for Scripture Deep Dive
//
// Thin wrapper around localStorage for per-verse notes with chapter-level grouping.
//
// Usage:
//   await StudyStorage.saveNote("Gen 22:1", "The Akedah — sacrifice and faith.");
//   var notes = await StudyStorage.getNotesForChapter("genesis", 22);
//   await StudyStorage.deleteNote("genesis", 22, "note-id-here");
//   var all = await StudyStorage.getAllNotes();
//   var json = await StudyStorage.exportAll();
//
// Storage keys: "sdd_notes:{book}:{ch}" → JSON array of note objects.
// All data stays on the user's device via localStorage.
//
// Consumed by: annotations.js, journal.html

(function() {
  'use strict';

  // ── Constants ───────────────────────────────────────────────────────────
  var PREFIX = 'sdd_notes:';
  var DEBOUNCE_MS = 500;
  var _writeTimers = {};

  function _key(book, ch) {
    return PREFIX + book + ':' + ch;
  }

  function _uuid() {
    return 'xxxx-xxxx-xxxx'.replace(/x/g, function() {
      return (Math.random() * 16 | 0).toString(16);
    });
  }

  function _now() {
    return new Date().toISOString();
  }

  // ── Storage primitives ──────────────────────────────────────────────────

  function _read(book, ch) {
    try {
      var raw = localStorage.getItem(_key(book, ch));
      if (raw) return JSON.parse(raw);
    } catch (e) { /* corrupt or missing — fine */ }
    return [];
  }

  function _write(book, ch, notes) {
    try {
      if (notes.length === 0) {
        localStorage.removeItem(_key(book, ch));
      } else {
        localStorage.setItem(_key(book, ch), JSON.stringify(notes));
      }
      return true;
    } catch (e) {
      console.error('StudyStorage write failed:', e);
      return false;
    }
  }

  function _debouncedWrite(book, ch, notes) {
    var k = _key(book, ch);
    if (_writeTimers[k]) clearTimeout(_writeTimers[k]);
    _writeTimers[k] = setTimeout(function() {
      _write(book, ch, notes);
      delete _writeTimers[k];
    }, DEBOUNCE_MS);
  }

  // List all keys matching our prefix
  function _allKeys() {
    var keys = [];
    for (var i = 0; i < localStorage.length; i++) {
      var k = localStorage.key(i);
      if (k && k.indexOf(PREFIX) === 0) keys.push(k);
    }
    return keys;
  }

  // ── Public API ──────────────────────────────────────────────────────────
  // Kept async for backward compatibility with annotations.js

  async function saveNote(verseRef, text, existingId) {
    var parsed = window.VerseResolver ? window.VerseResolver.parse(verseRef) : null;
    if (!parsed) {
      console.warn('StudyStorage.saveNote: could not parse ref:', verseRef);
      return null;
    }

    var book = parsed.book;
    var ch = parsed.ch;
    var notes = _read(book, ch);
    var timestamp = _now();

    if (existingId) {
      for (var i = 0; i < notes.length; i++) {
        if (notes[i].id === existingId) {
          notes[i].text = text;
          notes[i].updated = timestamp;
          _debouncedWrite(book, ch, notes);
          return notes[i];
        }
      }
    }

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

  async function getNotesForChapter(book, ch) {
    var notes = _read(book, ch);
    notes.sort(function(a, b) {
      if (a.v !== b.v) return (a.v || 0) - (b.v || 0);
      return (a.created || '').localeCompare(b.created || '');
    });
    return notes;
  }

  async function getNote(book, ch, noteId) {
    var notes = _read(book, ch);
    for (var i = 0; i < notes.length; i++) {
      if (notes[i].id === noteId) return notes[i];
    }
    return null;
  }

  async function deleteNote(book, ch, noteId) {
    var notes = _read(book, ch);
    var filtered = notes.filter(function(n) { return n.id !== noteId; });
    if (filtered.length < notes.length) {
      _write(book, ch, filtered);
      return true;
    }
    return false;
  }

  async function getAllNotes() {
    var all = [];
    var keys = _allKeys();
    for (var i = 0; i < keys.length; i++) {
      try {
        var raw = localStorage.getItem(keys[i]);
        if (raw) all = all.concat(JSON.parse(raw));
      } catch (e) { /* skip corrupt */ }
    }
    all.sort(function(a, b) {
      if (a.book !== b.book) return (a.book || '').localeCompare(b.book || '');
      if (a.ch !== b.ch) return (a.ch || 0) - (b.ch || 0);
      return (a.v || 0) - (b.v || 0);
    });
    return all;
  }

  async function countNotes(book, ch) {
    return _read(book, ch).length;
  }

  async function exportAll() {
    var notes = await getAllNotes();
    return JSON.stringify({
      exported: _now(),
      app: 'Scripture Deep Dive',
      version: 1,
      notes: notes
    }, null, 2);
  }

  async function importNotes(jsonStr) {
    try {
      var data = JSON.parse(jsonStr);
      if (!data.notes || !Array.isArray(data.notes)) return 0;

      var imported = 0;
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
        var existing = _read(book, ch);
        var existingIds = {};
        existing.forEach(function(n) { existingIds[n.id] = true; });

        groups[k].forEach(function(n) {
          if (!existingIds[n.id]) {
            existing.push(n);
            imported++;
          }
        });

        _write(book, ch, existing);
      }
      return imported;
    } catch (e) {
      console.error('StudyStorage.importNotes failed:', e);
      return 0;
    }
  }

  async function clearAll() {
    var keys = _allKeys();
    for (var i = 0; i < keys.length; i++) {
      localStorage.removeItem(keys[i]);
    }
    return true;
  }

  function isAvailable() {
    try {
      localStorage.setItem('sdd_test', '1');
      localStorage.removeItem('sdd_test');
      return true;
    } catch (e) {
      return false;
    }
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

})();
