// annotations.js — Personal study notes for Scripture Deep Dive
//
// Adds per-verse note indicators to chapter pages. Tap a verse to add
// or edit a personal note. Notes persist via StudyStorage (window.storage API).
//
// Depends on: study-storage.js, verse-resolver.js, styles.css (chapter page)
// Loaded by: chapter pages (lazy, after DOMContentLoaded)
//
// Usage: Annotations.init("genesis", 1) — called automatically from page context.

(function() {
  'use strict';

  var VR = window.VerseResolver;
  var SS = window.StudyStorage;
  if (!VR || !SS) return;

  // ── Inject CSS ──────────────────────────────────────────────────────────
  var link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = '../../annotations.css';
  document.head.appendChild(link);

  // ── SVG icons ───────────────────────────────────────────────────────────
  var QUILL_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>';
  var QUILL_FILLED_SVG = '<svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>';

  // ── State ───────────────────────────────────────────────────────────────
  var _bookKey = '';
  var _chNum = 0;
  var _notes = {};      // keyed by verse number
  var _editors = {};    // keyed by verse number — DOM references
  var _openEditor = null;

  // ── Init ────────────────────────────────────────────────────────────────

  async function init(bookKey, chNum) {
    _bookKey = bookKey;
    _chNum = chNum;

    if (!SS.isAvailable()) return;

    // Load existing notes for this chapter
    var chapterNotes = await SS.getNotesForChapter(bookKey, chNum);
    _notes = {};
    chapterNotes.forEach(function(n) {
      if (n.v) _notes[n.v] = n;
    });

    // Find all verse-text elements and add indicators
    var verseSections = document.querySelectorAll('.verse-text');
    verseSections.forEach(function(vt) {
      // Extract verse number from the verse-num span inside
      var vnum = _extractVerseNum(vt);
      if (!vnum) return;
      _addIndicator(vt, vnum);
    });

    // Add "My Notes" button to chapter header
    _addNotesButton();
  }

  // ── Verse number extraction ─────────────────────────────────────────────

  function _extractVerseNum(verseTextEl) {
    // Look for span.verse-num inside, or data attribute
    var numSpan = verseTextEl.querySelector('.verse-num');
    if (numSpan) {
      var text = numSpan.textContent.trim();
      var match = text.match(/(\d+)/);
      if (match) return parseInt(match[1], 10);
    }
    // Fallback: check data-verse attribute
    var dv = verseTextEl.getAttribute('data-verse');
    if (dv) return parseInt(dv, 10);
    return null;
  }

  // ── Indicator (quill icon) ──────────────────────────────────────────────

  function _addIndicator(verseTextEl, verseNum) {
    var hasNote = !!_notes[verseNum];
    var indicator = document.createElement('span');
    indicator.className = 'note-indicator' + (hasNote ? ' has-note' : '');
    indicator.innerHTML = hasNote ? QUILL_FILLED_SVG : QUILL_SVG;
    indicator.style.color = hasNote ? '#c9a84c' : '#6a5a38';
    indicator.title = hasNote ? 'Edit note' : 'Add note';
    indicator.setAttribute('data-verse', verseNum);

    indicator.addEventListener('click', function(e) {
      e.stopPropagation();
      _toggleEditor(verseTextEl, verseNum);
    });

    // Append to the verse text container
    verseTextEl.appendChild(indicator);
  }

  function _updateIndicator(verseNum, hasNote) {
    var indicators = document.querySelectorAll('.note-indicator[data-verse="' + verseNum + '"]');
    indicators.forEach(function(ind) {
      ind.className = 'note-indicator' + (hasNote ? ' has-note' : '');
      ind.innerHTML = hasNote ? QUILL_FILLED_SVG : QUILL_SVG;
      ind.style.color = hasNote ? '#c9a84c' : '#6a5a38';
      ind.title = hasNote ? 'Edit note' : 'Add note';
    });
  }

  // ── Inline editor ───────────────────────────────────────────────────────

  function _toggleEditor(verseTextEl, verseNum) {
    // Close any open editor
    if (_openEditor !== null && _openEditor !== verseNum) {
      _closeEditor(_openEditor);
    }

    if (_editors[verseNum]) {
      // Toggle existing editor
      var ed = _editors[verseNum];
      if (ed.classList.contains('open')) {
        _closeEditor(verseNum);
      } else {
        ed.classList.add('open');
        ed.querySelector('.note-textarea').focus();
        _openEditor = verseNum;
      }
      return;
    }

    // Build editor
    var bookInfo = VR.getBook(_bookKey);
    var bookName = bookInfo ? bookInfo.name : _bookKey;
    var refStr = bookName + ' ' + _chNum + ':' + verseNum;
    var existing = _notes[verseNum];

    var editor = document.createElement('div');
    editor.className = 'note-editor open';

    editor.innerHTML =
      '<div class="note-editor-label">' +
        '<span class="note-editor-ref">' + refStr + '</span>' +
        '<div class="note-editor-actions">' +
          '<span class="note-saved-msg" id="note-saved-' + verseNum + '">Saved</span>' +
          (existing ? '<button class="note-editor-btn delete" data-v="' + verseNum + '">Delete</button>' : '') +
        '</div>' +
      '</div>' +
      '<textarea class="note-textarea" placeholder="Write your note\u2026" data-v="' + verseNum + '">' +
        (existing ? _escapeHtml(existing.text) : '') +
      '</textarea>';

    // Insert after the verse text (or after the btn-row if present)
    var insertAfter = verseTextEl.nextElementSibling;
    while (insertAfter && insertAfter.classList.contains('btn-row')) {
      insertAfter = insertAfter.nextElementSibling;
    }
    if (insertAfter) {
      insertAfter.parentNode.insertBefore(editor, insertAfter);
    } else {
      verseTextEl.parentNode.appendChild(editor);
    }

    _editors[verseNum] = editor;
    _openEditor = verseNum;

    // Focus
    var textarea = editor.querySelector('.note-textarea');
    textarea.focus();

    // Auto-save on input (debounced)
    var saveTimer = null;
    textarea.addEventListener('input', function() {
      clearTimeout(saveTimer);
      saveTimer = setTimeout(function() {
        _saveNote(verseNum, textarea.value);
      }, 600);
    });

    // Auto-save on blur
    textarea.addEventListener('blur', function() {
      clearTimeout(saveTimer);
      if (textarea.value.trim()) {
        _saveNote(verseNum, textarea.value);
      }
    });

    // Delete button
    var delBtn = editor.querySelector('.note-editor-btn.delete');
    if (delBtn) {
      delBtn.addEventListener('click', function() {
        _deleteNote(verseNum);
      });
    }
  }

  function _closeEditor(verseNum) {
    if (_editors[verseNum]) {
      _editors[verseNum].classList.remove('open');
    }
    if (_openEditor === verseNum) _openEditor = null;
  }

  // ── Save / Delete ───────────────────────────────────────────────────────

  async function _saveNote(verseNum, text) {
    if (!text.trim()) return;

    var bookInfo = VR.getBook(_bookKey);
    var bookName = bookInfo ? bookInfo.name : _bookKey;
    var refStr = bookName + ' ' + _chNum + ':' + verseNum;
    var existingId = _notes[verseNum] ? _notes[verseNum].id : null;

    var note = await SS.saveNote(refStr, text.trim(), existingId);
    if (note) {
      _notes[verseNum] = note;
      _updateIndicator(verseNum, true);
      _flashSaved(verseNum);

      // Add delete button if not present
      var ed = _editors[verseNum];
      if (ed && !ed.querySelector('.note-editor-btn.delete')) {
        var actions = ed.querySelector('.note-editor-actions');
        var del = document.createElement('button');
        del.className = 'note-editor-btn delete';
        del.setAttribute('data-v', verseNum);
        del.textContent = 'Delete';
        del.addEventListener('click', function() { _deleteNote(verseNum); });
        actions.appendChild(del);
      }
    }

    _updateNotesBadge();
  }

  async function _deleteNote(verseNum) {
    var note = _notes[verseNum];
    if (!note) return;

    var ok = await SS.deleteNote(_bookKey, _chNum, note.id);
    if (ok) {
      delete _notes[verseNum];
      _updateIndicator(verseNum, false);
      _closeEditor(verseNum);
      // Remove editor DOM
      if (_editors[verseNum]) {
        _editors[verseNum].remove();
        delete _editors[verseNum];
      }
      _updateNotesBadge();
    }
  }

  function _flashSaved(verseNum) {
    var msg = document.getElementById('note-saved-' + verseNum);
    if (!msg) return;
    msg.classList.add('show');
    setTimeout(function() { msg.classList.remove('show'); }, 1500);
  }

  // ── "My Notes" panel ────────────────────────────────────────────────────

  function _addNotesButton() {
    // Find the chapter header area
    var header = document.querySelector('.scholarly-header, .chapter-title, h1');
    if (!header) return;

    var count = Object.keys(_notes).length;
    var btn = document.createElement('button');
    btn.className = 'notes-toggle-btn';
    btn.id = 'notes-toggle-btn';
    btn.innerHTML = 'My Notes' + (count > 0 ? ' <span class="notes-badge">' + count + '</span>' : '');
    btn.addEventListener('click', _openNotesPanel);

    // Insert after header
    header.parentNode.insertBefore(btn, header.nextSibling);
  }

  function _updateNotesBadge() {
    var btn = document.getElementById('notes-toggle-btn');
    if (!btn) return;
    var count = Object.keys(_notes).length;
    btn.innerHTML = 'My Notes' + (count > 0 ? ' <span class="notes-badge">' + count + '</span>' : '');
  }

  async function _openNotesPanel() {
    // Build overlay
    var overlay = document.createElement('div');
    overlay.className = 'notes-panel-overlay open';

    var notes = await SS.getNotesForChapter(_bookKey, _chNum);
    var bookInfo = VR.getBook(_bookKey);
    var bookName = bookInfo ? bookInfo.name : _bookKey;

    var itemsHtml = '';
    if (notes.length === 0) {
      itemsHtml = '<p class="notes-panel-empty">No notes yet. Tap the pencil icon next to any verse to start.</p>';
    } else {
      notes.forEach(function(n) {
        var date = n.updated ? new Date(n.updated).toLocaleDateString() : '';
        itemsHtml +=
          '<div class="notes-panel-item">' +
            '<div class="notes-panel-item-ref">' + (n.verseShort || n.verse) + '</div>' +
            '<div class="notes-panel-item-text">' + _escapeHtml(n.text) + '</div>' +
            '<div class="notes-panel-item-date">' + date + '</div>' +
          '</div>';
      });
    }

    overlay.innerHTML =
      '<div class="notes-panel">' +
        '<div class="notes-panel-header">' +
          '<span><span class="notes-panel-title">' + bookName + ' ' + _chNum + '</span>' +
            '<span class="notes-panel-count">' + notes.length + ' note' + (notes.length !== 1 ? 's' : '') + '</span></span>' +
          '<button class="notes-panel-close">&times;</button>' +
        '</div>' +
        '<div class="notes-panel-body">' + itemsHtml + '</div>' +
      '</div>';

    document.body.appendChild(overlay);

    // Close handlers
    overlay.querySelector('.notes-panel-close').addEventListener('click', function() {
      overlay.remove();
    });
    overlay.addEventListener('click', function(e) {
      if (e.target === overlay) overlay.remove();
    });
  }

  // ── Utility ─────────────────────────────────────────────────────────────

  function _escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // ── Auto-init from page context ─────────────────────────────────────────

  function _autoInit() {
    // Determine book and chapter from the page's QNAV_CURRENT
    var cur = window.QNAV_CURRENT || '';
    if (!cur) return;
    // cur = "ot/genesis/Genesis_1.html"
    var parts = cur.split('/');
    if (parts.length < 3) return;
    var bookKey = parts[1]; // "genesis"
    var fname = parts[2];   // "Genesis_1.html"
    var chMatch = fname.match(/_(\d+)\.html$/);
    if (!chMatch) return;
    var chNum = parseInt(chMatch[1], 10);

    init(bookKey, chNum);
  }

  // Run on DOMContentLoaded or immediately if already loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', _autoInit);
  } else {
    _autoInit();
  }

  // ── Public API ──────────────────────────────────────────────────────────
  window.Annotations = {
    init: init
  };

})();
