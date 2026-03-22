(function() {
'use strict';
// cross-ref-engine.js — Cross-reference thread lookup and traversal
//
// Indexes CROSS_REF_THREADS and CROSS_REF_PAIRS from data/cross-refs.js.
// Provides fast lookups by verse, by thread ID, and by keyword.
//
// Depends on: data/cross-refs.js, verse-resolver.js
// Consumed by: cross-ref-ui.js

(function() {
  'use strict';

  var THREADS = window.CROSS_REF_THREADS || [];
  var PAIRS   = window.CROSS_REF_PAIRS   || [];
  var VR      = window.VerseResolver;

  // ── Build indexes ───────────────────────────────────────────────────────
  //
  // _threadsByVerse: "genesis:22" → [{ thread, stepIndex }]
  // _pairsByVerse:   "genesis:22:1" → [pair]
  //
  // Key format for threads uses book:ch (threads reference chapter ranges).
  // Key format for pairs uses book:ch:v (more precise).

  var _threadsByVerse = {};
  var _pairsByVerse   = {};

  function _verseKey(parsed) {
    if (!parsed) return null;
    return parsed.book + ':' + parsed.ch + (parsed.v1 ? ':' + parsed.v1 : '');
  }

  function _chapterKey(parsed) {
    if (!parsed) return null;
    return parsed.book + ':' + parsed.ch;
  }

  // Index threads
  THREADS.forEach(function(thread) {
    thread.chain.forEach(function(step, idx) {
      if (!VR) return;
      var parsed = VR.parse(step.ref);
      if (!parsed) return;

      // Index by chapter (most cross-refs span verses, not just one verse)
      var ck = _chapterKey(parsed);
      if (!_threadsByVerse[ck]) _threadsByVerse[ck] = [];
      _threadsByVerse[ck].push({ thread: thread, stepIndex: idx });

      // Also index by specific verse if available
      if (parsed.v1) {
        var vk = _verseKey(parsed);
        if (!_threadsByVerse[vk]) _threadsByVerse[vk] = [];
        _threadsByVerse[vk].push({ thread: thread, stepIndex: idx });
      }
    });
  });

  // Index pairs
  PAIRS.forEach(function(pair) {
    if (!VR) return;
    ['a', 'b'].forEach(function(side) {
      var parsed = VR.parse(pair[side]);
      if (!parsed) return;

      var ck = _chapterKey(parsed);
      if (!_pairsByVerse[ck]) _pairsByVerse[ck] = [];
      _pairsByVerse[ck].push(pair);

      if (parsed.v1) {
        var vk = _verseKey(parsed);
        if (!_pairsByVerse[vk]) _pairsByVerse[vk] = [];
        _pairsByVerse[vk].push(pair);
      }
    });
  });


  // ── Public API ──────────────────────────────────────────────────────────

  // Get all threads that pass through a specific chapter or verse.
  // refStr: "Gen 22:1" or "Gen 22" — returns array of { thread, stepIndex }.
  function getThreadsForVerse(refStr) {
    if (!VR) return [];
    var parsed = VR.parse(refStr);
    if (!parsed) return [];

    var results = [];
    var seen = {};

    // Check specific verse key
    if (parsed.v1) {
      var vk = _verseKey(parsed);
      (_threadsByVerse[vk] || []).forEach(function(entry) {
        if (!seen[entry.thread.id]) {
          seen[entry.thread.id] = true;
          results.push(entry);
        }
      });
    }

    // Check chapter key
    var ck = _chapterKey(parsed);
    (_threadsByVerse[ck] || []).forEach(function(entry) {
      if (!seen[entry.thread.id]) {
        seen[entry.thread.id] = true;
        results.push(entry);
      }
    });

    return results;
  }

  // Get all threads for a chapter (book key + chapter number).
  function getThreadsForChapter(bookKey, ch) {
    var ck = bookKey + ':' + ch;
    var results = [];
    var seen = {};
    (_threadsByVerse[ck] || []).forEach(function(entry) {
      if (!seen[entry.thread.id]) {
        seen[entry.thread.id] = true;
        results.push(entry);
      }
    });
    return results;
  }

  // Get all bidirectional pairs for a verse or chapter.
  function getPairsForVerse(refStr) {
    if (!VR) return [];
    var parsed = VR.parse(refStr);
    if (!parsed) return [];

    var results = [];
    var seen = {};

    if (parsed.v1) {
      var vk = _verseKey(parsed);
      (_pairsByVerse[vk] || []).forEach(function(p) {
        var pk = p.a + '|' + p.b;
        if (!seen[pk]) { seen[pk] = true; results.push(p); }
      });
    }

    var ck = _chapterKey(parsed);
    (_pairsByVerse[ck] || []).forEach(function(p) {
      var pk = p.a + '|' + p.b;
      if (!seen[pk]) { seen[pk] = true; results.push(p); }
    });

    return results;
  }

  // Get a specific thread by ID.
  function getThread(threadId) {
    for (var i = 0; i < THREADS.length; i++) {
      if (THREADS[i].id === threadId) return THREADS[i];
    }
    return null;
  }

  // Search threads by theme name or tag.
  function searchThreads(query) {
    if (!query) return THREADS.slice();
    var q = query.toLowerCase();
    return THREADS.filter(function(t) {
      if (t.theme.toLowerCase().indexOf(q) > -1) return true;
      if (t.tags && t.tags.some(function(tag) { return tag.toLowerCase().indexOf(q) > -1; })) return true;
      return false;
    });
  }

  // Get all threads.
  function allThreads() {
    return THREADS.slice();
  }

  // Get all pairs.
  function allPairs() {
    return PAIRS.slice();
  }


  window.CrossRef = {
    getThreadsForVerse: getThreadsForVerse,
    getThreadsForChapter: getThreadsForChapter,
    getPairsForVerse: getPairsForVerse,
    getThread: getThread,
    searchThreads: searchThreads,
    allThreads: allThreads,
    allPairs: allPairs
  };

})();

})();
