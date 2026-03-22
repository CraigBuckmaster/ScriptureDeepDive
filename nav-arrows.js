// nav-arrows.js — Dynamic prev/next chapter navigation
//
// Derives prev/next links at runtime from BOOKS (books.js) and
// QNAV_CURRENT (inline script). No hardcoded hrefs in chapter HTML.
//
// Load order: books.js → QNAV_CURRENT inline → nav-arrows.js
// Depends on: window.BOOKS, window.QNAV_CURRENT

(function() {
  'use strict';

  var BOOKS = window.BOOKS;
  var cur = window.QNAV_CURRENT;
  if (!BOOKS || !cur) return;

  // ── Parse QNAV_CURRENT: "ot/genesis/Genesis_25.html" ───────────────────
  var parts = cur.split('/');
  if (parts.length < 3) return;
  var bookDir = parts[1];
  var fname = parts[2];
  var m = fname.match(/^(.+)_(\d+)\.html$/);
  if (!m) return;
  var bookName = m[1];  // "Genesis" or "1_Chronicles"
  var ch = parseInt(m[2], 10);

  // ── Find book in BOOKS ─────────────────────────────────────────────────
  var idx = -1;
  for (var i = 0; i < BOOKS.length; i++) {
    if (BOOKS[i].dir === bookDir) { idx = i; break; }
  }
  if (idx === -1) return;
  var book = BOOKS[idx];

  // ── Compute hrefs ──────────────────────────────────────────────────────
  function bookPath(b, chapter) {
    var td = b.testament.toLowerCase();
    return '../../' + td + '/' + b.dir + '/' + b.name.replace(/ /g, '_') + '_' + chapter + '.html';
  }

  var prevHref = null;
  if (ch > 1) {
    prevHref = bookName + '_' + (ch - 1) + '.html';
  } else if (idx > 0) {
    var pb = BOOKS[idx - 1];
    if (pb.live > 0) prevHref = bookPath(pb, pb.live);
  }

  var nextHref = null;
  if (ch < book.live) {
    nextHref = bookName + '_' + (ch + 1) + '.html';
  } else if (idx < BOOKS.length - 1) {
    var nb = BOOKS[idx + 1];
    if (nb.live > 0) nextHref = bookPath(nb, 1);
  }

  // ── Inject into DOM ────────────────────────────────────────────────────
  function upgrade(el, href) {
    if (!el) return;
    if (href) {
      var a = document.createElement('a');
      a.href = href;
      a.className = 'nav-arrow';
      a.innerHTML = el.innerHTML;
      el.parentNode.replaceChild(a, el);
    }
    // else: leave as disabled span
  }

  var prevEl = document.getElementById('nav-prev');
  var nextEl = document.getElementById('nav-next');
  upgrade(prevEl, prevHref);
  upgrade(nextEl, nextHref);
})();

// ── Auto-reload when a new service worker takes control ──────────────────
// This fires when skipWaiting + clients.claim activates a new SW while the
// page is open. The page reloads once to pick up fresh infrastructure files
// (books.js, qnav.js, etc.) from the new cache.
if ('serviceWorker' in navigator) {
  var _swRefreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', function() {
    if (_swRefreshing) return;
    _swRefreshing = true;
    window.location.reload();
  });
}
