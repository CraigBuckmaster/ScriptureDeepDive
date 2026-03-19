// translation.js — verse translation system
// Manages swapping between Bible translations on chapter pages.
// Loaded by every chapter page. Works with verses/niv/, verses/esv/, etc.
// Translation preference persists across all pages via localStorage.

(function() {
  'use strict';

  // ── REGISTRY ─────────────────────────────────────────────────────────────
  // Add new translations here when their verse files are available
  var TRANSLATIONS = {
    niv: { label: 'NIV', name: 'New International Version', available: true },
    esv: { label: 'ESV', name: 'English Standard Version', available: false },
    kjv: { label: 'KJV', name: 'King James Version', available: false },
  };

  var DEFAULT_TRANSLATION = 'niv';
  var STORAGE_KEY = 'sdd_translation';

  // ── STATE ─────────────────────────────────────────────────────────────────
  var currentTranslation = localStorage.getItem(STORAGE_KEY) || DEFAULT_TRANSLATION;
  if (!TRANSLATIONS[currentTranslation] || !TRANSLATIONS[currentTranslation].available) {
    currentTranslation = DEFAULT_TRANSLATION;
  }
  window.CURRENT_TRANSLATION = currentTranslation;

  // ── DETECT BOOK FROM CHAPTER PAGE ────────────────────────────────────────
  // Chapter pages already load their book's verse file via <script src="...">
  // e.g. ../../verses/niv/ot/genesis.js  → sets window.VERSES_GENESIS
  // We detect which variable name was set and use that as our source.

  function detectBookVar() {
    // Check for each possible book variable
    var bookVars = [
      'VERSES_GENESIS','VERSES_EXODUS','VERSES_RUTH','VERSES_PROVERBS',
      'VERSES_MATTHEW','VERSES_MARK','VERSES_LUKE','VERSES_JOHN','VERSES_ACTS'
    ];
    for (var i = 0; i < bookVars.length; i++) {
      if (window[bookVars[i]] && window[bookVars[i]].length > 0) {
        return bookVars[i];
      }
    }
    return null;
  }

  // ── FILL VERSE BODIES ─────────────────────────────────────────────────────
  // Called after a translation's verse data is loaded.
  // Fills every <span class="verse-body"> element on the page.
  function fillVerses(verseData) {
    if (!verseData) return;

    // Build a lookup: "Book 1:1" → text
    var lookup = {};
    for (var i = 0; i < verseData.length; i++) {
      var v = verseData[i];
      lookup[v.book + ' ' + v.ch + ':' + v.v] = v.text;
    }

    var bodies = document.querySelectorAll('.verse-body');
    var filled = 0;
    bodies.forEach(function(span) {
      var key = span.dataset.book + ' ' + span.dataset.ch + ':' + span.dataset.v;
      if (lookup[key] !== undefined) {
        span.textContent = lookup[key];
        filled++;
      }
    });

    return filled;
  }

  // ── LOAD A TRANSLATION FILE ───────────────────────────────────────────────
  function loadTranslation(slug, bookVar, callback) {
    // Derive the path to the book's verse file for this translation
    // We know the current src path from the existing script tag
    var existingScript = document.querySelector('script[src*="/verses/"]');
    if (!existingScript) { callback(null); return; }

    var currentSrc = existingScript.getAttribute('src');
    // Replace /niv/ (or current translation) with /slug/
    var newSrc = currentSrc.replace('/verses/niv/', '/verses/' + slug + '/')
                            .replace('/verses/esv/', '/verses/' + slug + '/')
                            .replace('/verses/kjv/', '/verses/' + slug + '/');

    // Load script dynamically
    var s = document.createElement('script');
    s.src = newSrc;
    s.onload = function() {
      var data = window[bookVar] || null;
      callback(data);
    };
    s.onerror = function() { callback(null); };
    document.head.appendChild(s);
  }

  // ── SWITCH TRANSLATION ────────────────────────────────────────────────────
  function switchTranslation(slug) {
    if (!TRANSLATIONS[slug] || !TRANSLATIONS[slug].available) return;
    if (slug === currentTranslation) return;

    var bookVar = detectBookVar();
    if (!bookVar) return;

    // Immediately show loading state on verses
    document.querySelectorAll('.verse-body').forEach(function(s) {
      s.style.opacity = '0.4';
    });

    currentTranslation = slug;
    window.CURRENT_TRANSLATION = slug;
    localStorage.setItem(STORAGE_KEY, slug);

    // Update toggle button states
    document.querySelectorAll('.translation-btn').forEach(function(btn) {
      btn.classList.toggle('active', btn.dataset.slug === slug);
    });

    // Load the translation's verse file then fill
    loadTranslation(slug, bookVar, function(data) {
      if (data) {
        fillVerses(data);
        // Rebuild qnav search index for the new translation
        if (window.VERSES_ALL) {
          // Replace book entries in VERSES_ALL with new translation
          for (var i = 0; i < data.length; i++) {
            var v = data[i];
            var idx = window.VERSES_ALL.findIndex(function(x) {
              return x.book === v.book && x.ch === v.ch && x.v === v.v;
            });
            if (idx > -1) window.VERSES_ALL[idx].text = v.text;
          }
        }
      }
      document.querySelectorAll('.verse-body').forEach(function(s) {
        s.style.opacity = '';
      });
    });
  }

  // ── BUILD TOGGLE UI ───────────────────────────────────────────────────────
  function buildToggle() {
    // Only show if there are multiple available translations
    var available = Object.entries(TRANSLATIONS).filter(function(e) { return e[1].available; });
    if (available.length < 2) return null;

    var wrap = document.createElement('span');
    wrap.className = 'translation-toggle';

    available.forEach(function(entry) {
      var slug = entry[0], info = entry[1];
      var btn = document.createElement('button');
      btn.className = 'translation-btn';
      btn.dataset.slug = slug;
      btn.textContent = info.label;
      btn.title = info.name;
      if (slug === currentTranslation) btn.classList.add('active');
      btn.addEventListener('click', function() { switchTranslation(slug); });
      wrap.appendChild(btn);
    });

    return wrap;
  }

  // ── INIT ──────────────────────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', function() {
    var bookVar = detectBookVar();
    if (!bookVar) return; // not a chapter page

    // Fill verses from the pre-loaded NIV data (already in page via script tag)
    var initData = window[bookVar];
    if (initData) fillVerses(initData);

    // Build toggle and insert into chapter header if multiple translations available
    var toggle = buildToggle();
    if (toggle) {
      var header = document.querySelector('main > header, article > header, .chapter-header');
      if (header) header.appendChild(toggle);
    }
  });

  // Expose for external use
  window.TRANSLATION = {
    current: function() { return currentTranslation; },
    switch: switchTranslation,
    fill: fillVerses,
  };

})();
