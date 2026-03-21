// synoptic.js — Parallel passage lookup engine
//
// Indexes SYNOPTIC_MAP and provides fast lookups by book/chapter/verse.
//
// Depends on: data/synoptic-map.js, verse-resolver.js
// Consumed by: synoptic.html (standalone viewer), chapter pages (via feature-loader)

(function() {
  'use strict';

  var MAP = window.SYNOPTIC_MAP || [];
  var VR  = window.VerseResolver;

  // ── Build index ─────────────────────────────────────────────────────────
  // _byChapter: "matthew:14" → [entry, entry, ...]

  var _byChapter = {};

  MAP.forEach(function(entry) {
    entry.passages.forEach(function(p) {
      if (!VR) return;
      var parsed = VR.parse(p.ref);
      if (!parsed) return;
      var ck = parsed.book + ':' + parsed.ch;
      if (!_byChapter[ck]) _byChapter[ck] = [];
      // Avoid duplicate entries for same pericope
      var already = _byChapter[ck].some(function(e) { return e.id === entry.id; });
      if (!already) _byChapter[ck].push(entry);
    });
  });


  // ── Public API ──────────────────────────────────────────────────────────

  // Get all parallel entries that touch a specific chapter.
  function getForChapter(bookKey, ch) {
    return _byChapter[bookKey + ':' + ch] || [];
  }

  // Get all parallel entries that touch a specific verse.
  function getForVerse(refStr) {
    if (!VR) return [];
    var parsed = VR.parse(refStr);
    if (!parsed) return [];
    // Return entries for the chapter (since pericopes span verses)
    return getForChapter(parsed.book, parsed.ch);
  }

  // Get a specific entry by ID.
  function getEntry(id) {
    for (var i = 0; i < MAP.length; i++) {
      if (MAP[i].id === id) return MAP[i];
    }
    return null;
  }

  // Get all entries in a category.
  function getCategory(cat) {
    return MAP.filter(function(e) { return e.category === cat; });
  }

  // Get all entries.
  function allEntries() { return MAP.slice(); }

  // Get all categories present in the data.
  function allCategories() {
    var cats = {};
    MAP.forEach(function(e) { cats[e.category] = true; });
    return Object.keys(cats);
  }


  window.Synoptic = {
    getForChapter: getForChapter,
    getForVerse: getForVerse,
    getEntry: getEntry,
    getCategory: getCategory,
    allEntries: allEntries,
    allCategories: allCategories
  };

})();
