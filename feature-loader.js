// feature-loader.js — Lazy-loads deep study feature scripts on chapter pages.
//
// Loaded by every chapter page. Waits for DOMContentLoaded, then asynchronously
// loads feature scripts that enhance the page without blocking first paint.
//
// To add a new feature: add its script path to the FEATURES array below.
//
// Depends on: nothing (but features it loads depend on verse-resolver.js etc.)
// Consumed by: chapter pages (loaded via <script src="../../feature-loader.js">)

(function() {
  'use strict';

  // Feature scripts to load (relative to chapter page — ../../ prefix for chapter depth)
  var FEATURES = [
    '../../verse-resolver.js',
    '../../study-storage.js',
    '../../annotations.js'
    // Future features:
    // '../../cross-ref-ui.js',
    // '../../word-study-ui.js'
  ];

  function loadFeatures() {
    FEATURES.forEach(function(src) {
      var s = document.createElement('script');
      s.src = src;
      s.async = true;
      document.head.appendChild(s);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadFeatures);
  } else {
    loadFeatures();
  }
})();
