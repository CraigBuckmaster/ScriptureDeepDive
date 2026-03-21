// word-study-engine.js — Hebrew/Greek word study lookup engine
//
// Indexes WORD_STUDY_DATA and provides lookups by ID, gloss, verse, and search.
//
// Depends on: data/word-study.js, verse-resolver.js
// Consumed by: word-study-ui.js, word-study.html

(function() {
  'use strict';

  var DATA = window.WORD_STUDY_DATA || [];
  var VR   = window.VerseResolver;

  // ── Build indexes ───────────────────────────────────────────────────────

  var _byId    = {};   // "hesed" → entry
  var _byGloss = {};   // "love" → [entry, entry, ...]
  var _byVerse = {};   // "genesis:1:1" → [entry, entry, ...]

  DATA.forEach(function(entry) {
    _byId[entry.id] = entry;

    // Index by glosses
    (entry.glosses || []).forEach(function(g) {
      var key = g.toLowerCase();
      if (!_byGloss[key]) _byGloss[key] = [];
      _byGloss[key].push(entry);
    });

    // Index by occurrence verses
    (entry.occurrences || []).forEach(function(occ) {
      if (!VR) return;
      var parsed = VR.parse(occ.ref);
      if (!parsed) return;
      var vk = parsed.book + ':' + parsed.ch + (parsed.v1 ? ':' + parsed.v1 : '');
      if (!_byVerse[vk]) _byVerse[vk] = [];
      _byVerse[vk].push({ entry: entry, occurrence: occ });
    });
  });


  // ── Public API ──────────────────────────────────────────────────────────

  // Lookup by ID.
  function lookup(wordId) {
    return _byId[wordId] || null;
  }

  // Find entries by English gloss word.
  function findByGloss(englishWord) {
    return _byGloss[englishWord.toLowerCase()] || [];
  }

  // Get all word studies relevant to a specific verse.
  function getForVerse(refStr) {
    if (!VR) return [];
    var parsed = VR.parse(refStr);
    if (!parsed) return [];

    var results = [];
    var seen = {};

    // Specific verse
    if (parsed.v1) {
      var vk = parsed.book + ':' + parsed.ch + ':' + parsed.v1;
      (_byVerse[vk] || []).forEach(function(hit) {
        if (!seen[hit.entry.id]) {
          seen[hit.entry.id] = true;
          results.push(hit);
        }
      });
    }

    // Chapter-level
    var ck = parsed.book + ':' + parsed.ch;
    (_byVerse[ck] || []).forEach(function(hit) {
      if (!seen[hit.entry.id]) {
        seen[hit.entry.id] = true;
        results.push(hit);
      }
    });

    return results;
  }

  // Get all word studies for a chapter.
  function getForChapter(bookKey, ch) {
    var results = [];
    var seen = {};
    var prefix = bookKey + ':' + ch + ':';
    var chKey = bookKey + ':' + ch;

    Object.keys(_byVerse).forEach(function(key) {
      if (key === chKey || key.indexOf(prefix) === 0) {
        _byVerse[key].forEach(function(hit) {
          if (!seen[hit.entry.id]) {
            seen[hit.entry.id] = true;
            results.push(hit);
          }
        });
      }
    });

    return results;
  }

  // Full-text search across entries.
  function search(query) {
    if (!query) return DATA.slice();
    var q = query.toLowerCase();
    return DATA.filter(function(e) {
      if (e.id.indexOf(q) > -1) return true;
      if (e.transliteration.toLowerCase().indexOf(q) > -1) return true;
      if (e.glosses.some(function(g) { return g.toLowerCase().indexOf(q) > -1; })) return true;
      if (e.range && e.range.toLowerCase().indexOf(q) > -1) return true;
      return false;
    });
  }

  // Get all entries.
  function allEntries() { return DATA.slice(); }

  // Get entries by language.
  function getByLanguage(lang) {
    return DATA.filter(function(e) { return e.language === lang; });
  }


  window.WordStudy = {
    lookup: lookup,
    findByGloss: findByGloss,
    getForVerse: getForVerse,
    getForChapter: getForChapter,
    search: search,
    allEntries: allEntries,
    getByLanguage: getByLanguage
  };

})();
