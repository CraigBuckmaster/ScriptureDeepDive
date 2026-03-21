// feature-loader.js — Lazy-loads deep study feature scripts on chapter pages.
//
// Loaded by every chapter page. Waits for DOMContentLoaded, then loads
// feature scripts in dependency order without blocking first paint.
//
// To add a new feature: add its script path to the appropriate PHASE below.
// Phase 1 loads first (shared services), then Phase 2 (data+engines), then Phase 3 (UI).
//
// Depends on: nothing (but features it loads depend on verse-resolver.js etc.)
// Consumed by: chapter pages (loaded via <script src="../../feature-loader.js">)

(function() {
  'use strict';

  var PHASES = [
    // Phase 1: shared services
    [
      '../../verse-resolver.js',
      '../../study-storage.js'
    ],
    // Phase 2: data files + engines
    [
      '../../data/cross-refs.js',
      '../../cross-ref-engine.js',
      '../../data/word-study.js',
      '../../word-study-engine.js'
    ],
    // Phase 3: UI features (depend on services + engines)
    [
      '../../annotations.js',
      '../../cross-ref-ui.js',
      '../../word-study-ui.js'
    ]
  ];

  function loadPhase(scripts) {
    return Promise.all(scripts.map(function(src) {
      return new Promise(function(resolve) {
        var s = document.createElement('script');
        s.src = src;
        s.onload = resolve;
        s.onerror = resolve;
        document.head.appendChild(s);
      });
    }));
  }

  function loadAll() {
    var chain = Promise.resolve();
    PHASES.forEach(function(phase) {
      chain = chain.then(function() { return loadPhase(phase); });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadAll);
  } else {
    loadAll();
  }
})();
