// translation.js — verse translation system v2
// Manages swapping between Bible translations on chapter pages.
// Translation preference persists via localStorage.
// Verse files are static — no API keys at runtime.

(function() {
  'use strict';

  // ── REGISTRY ─────────────────────────────────────────────────────────────
  // Set available:true when the verse files are in the repo
  var TRANSLATIONS = {
    niv: { label: 'NIV', name: 'New International Version', available: true },
    esv: { label: 'ESV', name: 'English Standard Version',  available: true  },
    kjv: { label: 'KJV', name: 'King James Version',        available: false },
  };

  var DEFAULT    = 'niv';
  var STORAGE_KEY = 'sdd_translation';

  // ── CACHE: loaded verse arrays keyed by slug ──────────────────────────────
  // Prevents re-fetching when switching back to a previously loaded translation
  var _cache = {};

  // ── STATE ─────────────────────────────────────────────────────────────────
  var current = localStorage.getItem(STORAGE_KEY) || DEFAULT;
  if (!TRANSLATIONS[current] || !TRANSLATIONS[current].available) current = DEFAULT;
  window.CURRENT_TRANSLATION = current;

  // ── DETECT BOOK VAR ───────────────────────────────────────────────────────
  var BOOK_VARS = [
    'VERSES_GENESIS','VERSES_EXODUS','VERSES_LEVITICUS','VERSES_NUMBERS','VERSES_DEUTERONOMY',
    'VERSES_JOSHUA','VERSES_RUTH','VERSES_PROVERBS','VERSES_MATTHEW','VERSES_MARK',
    'VERSES_LUKE','VERSES_JOHN','VERSES_ACTS'
  ];

  function detectBookVar() {
    for (var i = 0; i < BOOK_VARS.length; i++) {
      if (window[BOOK_VARS[i]] && window[BOOK_VARS[i]].length > 0) return BOOK_VARS[i];
    }
    return null;
  }

  // ── FILL VERSE BODIES ─────────────────────────────────────────────────────
  function fillVerses(verseData) {
    if (!verseData) return 0;
    var lookup = {};
    for (var i = 0; i < verseData.length; i++) {
      var v = verseData[i];
      lookup[v.book + ' ' + v.ch + ':' + v.v] = v.text;
    }
    var bodies = document.querySelectorAll('.verse-body');
    var filled = 0;
    bodies.forEach(function(span) {
      var key = span.dataset.book + ' ' + span.dataset.ch + ':' + span.dataset.v;
      if (lookup[key] !== undefined) { span.textContent = lookup[key]; filled++; }
    });
    return filled;
  }

  // ── REBUILD QNAV SEARCH INDEX ──────────────────────────────────────────────
  function rebuildSearchIndex(verseData) {
    // Update search index text for this translation without mutating cached data
    if (!window.VERSES_ALL || !verseData) return;
    // Build lookup for fast access
    var lookup = {};
    for (var i = 0; i < verseData.length; i++) {
      var v = verseData[i];
      lookup[v.book + '|' + v.ch + '|' + v.v] = v.text;
    }
    for (var j = 0; j < window.VERSES_ALL.length; j++) {
      var entry = window.VERSES_ALL[j];
      var key = entry.book + '|' + entry.ch + '|' + entry.v;
      if (lookup[key] !== undefined) {
        // VERSES_ALL entries are their own objects (loaded from niv/verses.js)
        // Safe to update .text directly — these aren't in our translation cache
        entry.text = lookup[key];
      }
    }
  }

  // ── LOAD TRANSLATION FILE (with cache) ───────────────────────────────────
  function loadTranslation(slug, bookVar, callback) {
    // Serve from cache if already loaded
    if (_cache[slug]) { callback(_cache[slug]); return; }

    // Derive path from existing verse script tag
    var existingScript = document.querySelector('script[src*="/verses/"]');
    if (!existingScript) { callback(null); return; }

    var src = existingScript.getAttribute('src');
    // Replace /verses/{any-slug}/ with /verses/{slug}/
    var newSrc = src.replace(/\/verses\/[^\/]+\//, '/verses/' + slug + '/');

    var s = document.createElement('script');
    s.src = newSrc;
    s.onload = function() {
      var data = window[bookVar] || null;
      if (data) { _cache[slug] = data.map(function(v) { return Object.assign({}, v); }); }
      callback(data);
    };
    s.onerror = function() { callback(null); };
    document.head.appendChild(s);
  }

  // ── UPDATE COPYRIGHT NOTICE ───────────────────────────────────────────────
  var ESV_COPYRIGHT = 'Scripture quotations are from the ESV\u00ae Bible (The Holy Bible, English Standard Version\u00ae), copyright \u00a9 2001 by Crossway. Used by permission. All rights reserved.';
  var NIV_COPYRIGHT = 'Scripture quotations taken from The Holy Bible, New International Version\u00ae NIV\u00ae Copyright \u00a9 1973 1978 1984 2011 by Biblica, Inc. Used with permission. All rights reserved.';
  var COPYRIGHT_MAP = { esv: ESV_COPYRIGHT, niv: NIV_COPYRIGHT, kjv: '' };

  function updateCopyright(slug) {
    var notice = document.getElementById('translation-copyright');
    var text = COPYRIGHT_MAP[slug] || '';
    if (!notice) {
      if (!text) return;
      notice = document.createElement('p');
      notice.id = 'translation-copyright';
      notice.style.cssText = 'font-size:.62rem;color:var(--text-muted,#6a5a38);margin-top:1.5rem;padding-top:.8rem;border-top:1px solid var(--border,#332810);line-height:1.5;font-style:italic;';
      var main = document.querySelector('main');
      if (main) main.appendChild(notice);
    }
    notice.textContent = text;
    notice.style.display = text ? '' : 'none';
  }

  // ── SWITCH TRANSLATION ────────────────────────────────────────────────────
  function switchTranslation(slug) {
    if (!TRANSLATIONS[slug] || !TRANSLATIONS[slug].available) return;
    if (slug === current) return;

    var bookVar = detectBookVar();
    if (!bookVar) return;

    // Dim verses while loading
    document.querySelectorAll('.verse-body').forEach(function(s) { s.style.opacity = '0.35'; });

    current = slug;
    window.CURRENT_TRANSLATION = slug;
    localStorage.setItem(STORAGE_KEY, slug);

    // Update toggle state
    document.querySelectorAll('.translation-btn').forEach(function(btn) {
      btn.classList.toggle('active', btn.dataset.slug === slug);
    });

    loadTranslation(slug, bookVar, function(data) {
      if (data) {
        fillVerses(data);
        rebuildSearchIndex(data);
      }
      document.querySelectorAll('.verse-body').forEach(function(s) { s.style.opacity = ''; });
      updateCopyright(slug);
    });
  }

  // ── BUILD TOGGLE UI ───────────────────────────────────────────────────────
  function buildToggle() {
    var available = Object.keys(TRANSLATIONS).filter(function(k) {
      return TRANSLATIONS[k].available;
    });
    if (available.length < 2) return null;

    var wrap = document.createElement('span');
    wrap.className = 'translation-toggle';
    wrap.setAttribute('aria-label', 'Bible translation');

    available.forEach(function(slug) {
      var btn = document.createElement('button');
      btn.className = 'translation-btn';
      btn.dataset.slug = slug;
      btn.textContent = TRANSLATIONS[slug].label;
      btn.title = TRANSLATIONS[slug].name;
      btn.classList.toggle('active', slug === current);
      btn.addEventListener('click', function() { switchTranslation(slug); });
      wrap.appendChild(btn);
    });

    return wrap;
  }

  // ── INIT ──────────────────────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', function() {
    var bookVar = detectBookVar();
    if (!bookVar) return; // not a chapter page

    // Cache the pre-loaded NIV data — deep copy so ESV loading can't overwrite it
    // (ESV matthew.js also declares var VERSES_MATTHEW which would clobber the reference)
    var initData = window[bookVar];
    if (initData) {
      // Deep copy — each verse object is also copied so rebuildSearchIndex can't corrupt it
      _cache['niv'] = initData.map(function(v) { return Object.assign({}, v); });

      // If user prefers a different translation, switch immediately
      if (current !== 'niv') {
        // Load and fill preferred translation
        loadTranslation(current, bookVar, function(data) {
          if (data) { fillVerses(data); rebuildSearchIndex(data); }
          else {
            // Fallback to NIV if preferred translation fails to load
            fillVerses(initData);
            current = 'niv';
            window.CURRENT_TRANSLATION = 'niv';
            localStorage.setItem(STORAGE_KEY, 'niv');
          }
          updateCopyright(current);
        });
      } else {
        fillVerses(initData);
        updateCopyright('niv');
      }
    }

    // Insert toggle after the Library back-link (left side of nav)
    var toggle = buildToggle();
    if (toggle) {
      var nav = document.querySelector('.chapter-nav');
      if (nav) {
        // Insert after nav-back (Library link), before nav-center
        var navCenter = nav.querySelector('.nav-center');
        if (navCenter) {
          nav.insertBefore(toggle, navCenter);
        } else {
          nav.appendChild(toggle);
        }
      }
    }
  });

  // Expose for external use
  window.TRANSLATION = {
    current: function() { return current; },
    switch:  switchTranslation,
    fill:    fillVerses,
    cache:   function() { return _cache; },
  };

})();
