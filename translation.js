// translation.js — Multi-translation verse system v3
// Data-driven: reads from window.SDD_TRANSLATIONS (data/translations.js).
// Fetch-based: loads verse JSON files via fetch(), no script injection.
// Scalable: dropdown UI auto-switches at 3+ translations.
// To add a translation: edit data/translations.js + drop JSON files in verses/{slug}/.

(function() {
  'use strict';

  // ── CONSTANTS ────────────────────────────────────────────────────────────
  var STORAGE_KEY = 'sdd_translation';

  // ── REGISTRY (from data/translations.js) ─────────────────────────────────
  var registry = window.SDD_TRANSLATIONS || [];
  if (!registry.length) return; // no translations configured

  var defaultSlug = 'niv';
  for (var r = 0; r < registry.length; r++) {
    if (registry[r].isDefault) { defaultSlug = registry[r].slug; break; }
  }

  var bySlug = {};
  for (var i = 0; i < registry.length; i++) bySlug[registry[i].slug] = registry[i];

  // ── STATE ────────────────────────────────────────────────────────────────
  var current = localStorage.getItem(STORAGE_KEY) || defaultSlug;
  if (!bySlug[current]) current = defaultSlug;
  window.CURRENT_TRANSLATION = current;

  // ── CACHE: loaded verse arrays keyed by slug ─────────────────────────────
  var _cache = {};

  // ── DETECT BOOK & TESTAMENT FROM URL PATH ────────────────────────────────
  // Path patterns: /ot/genesis/Genesis_1.html or /nt/matthew/Matthew_1.html
  function detectBook() {
    var path = window.location.pathname;
    var m = path.match(/\/(ot|nt)\/([^/]+)\//);
    if (!m) return null;
    return { testament: m[1], book: m[2] };
  }

  // ── DETECT BOOK FROM LEGACY SCRIPT TAG (backward compat) ─────────────────
  // Old pages may have <script src="../../verses/niv/ot/genesis.js">
  function detectBookFromScript() {
    var script = document.querySelector('script[src*="/verses/"]');
    if (!script) return null;
    var src = script.getAttribute('src');
    var m = src.match(/verses\/[^/]+\/(ot|nt)\/([^.]+)\./);
    if (!m) return null;
    return { testament: m[1], book: m[2] };
  }

  // ── VERSE JSON PATH ──────────────────────────────────────────────────────
  // Derive prefix from the existing verse script tag (already correct on all
  // hosting configurations including GitHub Pages subdirectories).
  var _pathPrefix = null;
  function verseJsonUrl(slug, testament, book) {
    if (!_pathPrefix) {
      var script = document.querySelector('script[src*="/verses/"]');
      if (script) {
        // src="../../verses/niv/ot/genesis.js" → prefix="../../"
        var src = script.getAttribute('src');
        _pathPrefix = src.replace(/verses\/.*$/, '');
      } else {
        _pathPrefix = '../../';
      }
    }
    return _pathPrefix + 'verses/' + slug + '/' + testament + '/' + book + '.json';
  }

  // ── FETCH VERSE DATA ─────────────────────────────────────────────────────
  function loadVerses(slug, testament, book, callback) {
    if (_cache[slug]) { callback(_cache[slug]); return; }

    var url = verseJsonUrl(slug, testament, book);
    fetch(url)
      .then(function(r) {
        if (!r.ok) throw new Error(r.status);
        return r.json();
      })
      .then(function(data) {
        _cache[slug] = data;
        callback(data);
      })
      .catch(function() {
        callback(null);
      });
  }

  // ── FILL VERSE BODIES ────────────────────────────────────────────────────
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

  // ── REBUILD QNAV SEARCH INDEX ────────────────────────────────────────────
  function rebuildSearchIndex(verseData) {
    if (!window.VERSES_ALL || !verseData) return;
    var lookup = {};
    for (var i = 0; i < verseData.length; i++) {
      var v = verseData[i];
      lookup[v.book + '|' + v.ch + '|' + v.v] = v.text;
    }
    for (var j = 0; j < window.VERSES_ALL.length; j++) {
      var entry = window.VERSES_ALL[j];
      var key = entry.book + '|' + entry.ch + '|' + entry.v;
      if (lookup[key] !== undefined) entry.text = lookup[key];
    }
  }

  // ── UPDATE COPYRIGHT NOTICE ──────────────────────────────────────────────
  function updateCopyright(slug) {
    var notice = document.getElementById('translation-copyright');
    var text = bySlug[slug] ? bySlug[slug].copyright : '';
    if (!notice && text) {
      notice = document.createElement('p');
      notice.id = 'translation-copyright';
      notice.style.cssText = 'font-size:.62rem;color:var(--text-muted,#6a5a38);margin-top:1.5rem;padding-top:.8rem;border-top:1px solid var(--border,#332810);line-height:1.5;font-style:italic;';
      var main = document.querySelector('main');
      if (main) main.appendChild(notice);
    }
    if (notice) {
      notice.textContent = text;
      notice.style.display = text ? '' : 'none';
    }
  }

  // ── SWITCH TRANSLATION ───────────────────────────────────────────────────
  function switchTranslation(slug) {
    if (!bySlug[slug]) return;
    if (slug === current) return;

    var info = detectBook() || detectBookFromScript();
    if (!info) return;

    // Dim verses while loading
    document.querySelectorAll('.verse-body').forEach(function(s) { s.style.opacity = '0.35'; });

    current = slug;
    window.CURRENT_TRANSLATION = slug;
    localStorage.setItem(STORAGE_KEY, slug);

    // Update toggle/dropdown state
    updateToggleState(slug);

    loadVerses(slug, info.testament, info.book, function(data) {
      if (data) {
        fillVerses(data);
        rebuildSearchIndex(data);
      }
      document.querySelectorAll('.verse-body').forEach(function(s) { s.style.opacity = ''; });
      updateCopyright(slug);
    });
  }

  // ── UPDATE TOGGLE/DROPDOWN STATE ─────────────────────────────────────────
  function updateToggleState(slug) {
    // Button mode
    document.querySelectorAll('.translation-btn').forEach(function(btn) {
      btn.classList.toggle('active', btn.dataset.slug === slug);
    });
    // Dropdown mode
    var sel = document.querySelector('.translation-select');
    if (sel) sel.value = slug;
  }

  // ── BUILD TOGGLE UI ──────────────────────────────────────────────────────
  function buildToggle(availableSlugs) {
    if (availableSlugs.length < 2) return null;

    var wrap = document.createElement('span');
    wrap.className = 'translation-toggle';
    wrap.setAttribute('aria-label', 'Bible translation');

    if (availableSlugs.length <= 2) {
      // ── BUTTON MODE (2 translations) ──
      availableSlugs.forEach(function(slug) {
        var t = bySlug[slug];
        var btn = document.createElement('button');
        btn.className = 'translation-btn';
        btn.dataset.slug = slug;
        btn.textContent = t.label;
        btn.title = t.name;
        btn.classList.toggle('active', slug === current);
        btn.addEventListener('click', function() { switchTranslation(slug); });
        wrap.appendChild(btn);
      });
    } else {
      // ── DROPDOWN MODE (3+ translations) ──
      var sel = document.createElement('select');
      sel.className = 'translation-select';
      sel.title = 'Choose translation';
      availableSlugs.forEach(function(slug) {
        var t = bySlug[slug];
        var opt = document.createElement('option');
        opt.value = slug;
        opt.textContent = t.label;
        opt.title = t.name;
        if (slug === current) opt.selected = true;
        sel.appendChild(opt);
      });
      sel.addEventListener('change', function() { switchTranslation(sel.value); });
      wrap.appendChild(sel);
    }

    return wrap;
  }

  // ── PROBE AVAILABLE TRANSLATIONS FOR THIS BOOK ────────────────────────────
  function probeAvailability(info, callback) {
    var slugs = registry.map(function(t) { return t.slug; });
    var available = [];
    var checked = 0;

    slugs.forEach(function(slug) {
      var url = verseJsonUrl(slug, info.testament, info.book);
      fetch(url, { method: 'HEAD' })
        .then(function(r) {
          if (r.ok) available.push(slug);
        })
        .catch(function() { /* not available */ })
        .finally(function() {
          checked++;
          if (checked === slugs.length) {
            // Sort to match registry order
            available.sort(function(a, b) {
              return slugs.indexOf(a) - slugs.indexOf(b);
            });
            callback(available);
          }
        });
    });
  }

  // ── CACHE FROM LEGACY SCRIPT TAG ─────────────────────────────────────────
  // If a chapter still has <script src="verses/niv/ot/book.js">, the data
  // is already loaded as a global var. Cache it so we don't re-fetch.
  function cacheLegacyData() {
    var bookVars = [
      'VERSES_GENESIS','VERSES_EXODUS','VERSES_LEVITICUS','VERSES_NUMBERS','VERSES_DEUTERONOMY',
      'VERSES_JOSHUA','VERSES_JUDGES','VERSES_RUTH','VERSES_1_SAMUEL','VERSES_2_SAMUEL',
      'VERSES_1_KINGS','VERSES_2_KINGS','VERSES_1_CHRONICLES','VERSES_2_CHRONICLES',
      'VERSES_PROVERBS',
      'VERSES_MATTHEW','VERSES_MARK','VERSES_LUKE','VERSES_JOHN','VERSES_ACTS'
    ];
    for (var i = 0; i < bookVars.length; i++) {
      if (window[bookVars[i]] && window[bookVars[i]].length > 0) {
        // Deep copy so we own this data
        _cache[defaultSlug] = window[bookVars[i]].map(function(v) { return Object.assign({}, v); });
        return window[bookVars[i]];
      }
    }
    return null;
  }

  // ── INIT ─────────────────────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', function() {
    var info = detectBook() || detectBookFromScript();
    if (!info) return; // not a chapter page

    // Try legacy script data first (backward compat during migration)
    var legacyData = cacheLegacyData();

    function proceed(availableSlugs) {
      // If user's preferred translation is not available for this book, fall back
      if (availableSlugs.indexOf(current) === -1) {
        current = defaultSlug;
        window.CURRENT_TRANSLATION = current;
      }

      // Initial fill
      if (legacyData && current === defaultSlug) {
        // Already have default data from script tag
        fillVerses(legacyData);
        updateCopyright(current);
      } else {
        // Fetch the preferred translation
        loadVerses(current, info.testament, info.book, function(data) {
          if (data) {
            fillVerses(data);
            rebuildSearchIndex(data);
          } else {
            // Fallback to default
            if (legacyData) {
              fillVerses(legacyData);
            } else {
              loadVerses(defaultSlug, info.testament, info.book, function(d) {
                if (d) fillVerses(d);
              });
            }
            current = defaultSlug;
            window.CURRENT_TRANSLATION = defaultSlug;
            localStorage.setItem(STORAGE_KEY, defaultSlug);
          }
          updateCopyright(current);
        });
      }

      // Build and insert toggle
      var toggle = buildToggle(availableSlugs);
      if (toggle) {
        var nav = document.querySelector('.chapter-nav');
        if (nav) {
          var navCenter = nav.querySelector('.nav-center');
          if (navCenter) nav.insertBefore(toggle, navCenter);
          else nav.appendChild(toggle);
        }
      }
    }

    // Probe which translations have files for this book
    probeAvailability(info, proceed);
  });

  // ── PUBLIC API ───────────────────────────────────────────────────────────
  window.TRANSLATION = {
    current:  function() { return current; },
    switch:   switchTranslation,
    fill:     fillVerses,
    cache:    function() { return _cache; },
    registry: function() { return registry; }
  };

})();
