(function() {
'use strict';
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
      '../../js/features/verse-resolver.js',
      '../../js/features/study-storage.js'
    ],
    // Phase 2: data files (must complete before engines capture globals)
    [
      '../../data/cross-refs.js',
      '../../data/word-study.js'
    ],
    // Phase 3: engines (index the data loaded in Phase 2)
    [
      '../../js/features/cross-ref-engine.js',
      '../../js/features/word-study-engine.js'
    ],
    // Phase 4: UI features (depend on services + engines)
    [
      '../../js/features/annotations.js',
      '../../js/features/cross-ref-ui.js',
      '../../js/features/word-study-ui.js'
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

})();
