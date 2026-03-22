(function() {
'use strict';
// book-intro.js — Renders book introduction pages from data/book-intros.js
//
// Each intro page is a thin HTML shell that sets window.CURRENT_BOOK and loads this script.
// This file reads the matching entry from BOOK_INTROS and builds the entire page.
//
// Depends on: data/book-intros.js (window.BOOK_INTROS),
//             verse-resolver.js (for linking chapter refs),
//             books.js (for live chapter counts)
// Consumed by: intro/{book}.html pages

(function() {
  'use strict';

  var INTROS = window.BOOK_INTROS || [];
  var bookKey = window.CURRENT_BOOK || '';
  if (!bookKey) return;

  // Find the intro for this book
  var intro = null;
  for (var i = 0; i < INTROS.length; i++) {
    if (INTROS[i].book === bookKey) { intro = INTROS[i]; break; }
  }

  var target = document.getElementById('intro-target');
  if (!target) return;

  // If no intro data exists yet, show a placeholder
  if (!intro) {
    target.innerHTML =
      '<div class="intro-wrapper">' +
        '<nav class="intro-nav">' +
          '<a href="../index.html">&larr; Library</a>' +
        '</nav>' +
        '<p class="intro-eyebrow">Coming Soon</p>' +
        '<h1 class="intro-title">Book Introduction</h1>' +
        '<p class="intro-subtitle">This introduction is being written. Check back soon.</p>' +
      '</div>';
    return;
  }

  // ── Helpers ────────────────────────────────────────────────────────────

  var VR = window.VerseResolver || null;

  // Turn a ref string into a link if the chapter is live, otherwise plain text.
  function refLink(refStr) {
    if (!VR) return '<span>' + refStr + '</span>';
    var parsed = VR.parse(refStr);
    if (!parsed) return '<span>' + refStr + '</span>';
    if (VR.isLive(parsed.book, parsed.ch)) {
      return '<a href="../' + parsed.url + '">' + refStr + '</a>';
    }
    return '<span>' + refStr + '</span>';
  }

  // ── Build HTML ─────────────────────────────────────────────────────────

  var bookInfo = VR ? VR.getBook(bookKey) : null;
  var bookName = bookInfo ? bookInfo.name : (intro.title || bookKey);
  var testament = bookInfo ? bookInfo.testament : 'ot';
  var bookDir = bookInfo ? bookInfo.dir : bookKey;

  // Chapter link — if user came from a chapter, return them there
  var refCh = null;
  var hashMatch = window.location.hash.match(/ch=(\d+)/);
  if (hashMatch) refCh = parseInt(hashMatch[1], 10);

  var chUrl = '../' + testament + '/' + bookDir + '/' + bookName.replace(/ /g, '_') + '_' + (refCh || 1) + '.html';
  var chLabel = refCh ? 'Continue Reading &rarr;' : 'Start Reading &rarr;';

  var html = '<div class="intro-wrapper">';

  // Nav
  html += '<nav class="intro-nav">';
  html += '<a href="../index.html">&larr; Library</a>';
  html += '<a href="' + chUrl + '">' + chLabel + '</a>';
  html += '</nav>';

  // Header
  html += '<p class="intro-eyebrow">How to Read</p>';
  html += '<h1 class="intro-title">' + bookName + '</h1>';
  if (intro.subtitle) {
    html += '<p class="intro-subtitle">' + intro.subtitle + '</p>';
  }

  // Authorship & Dating
  if (intro.authorship) {
    var a = intro.authorship;
    html += '<div class="intro-section intro-authorship">';
    html += '<h2 class="intro-section-heading">Authorship &amp; Dating</h2>';
    html += '<div class="intro-section-content">';
    if (a.author) {
      html += '<div class="intro-auth-field">';
      html += '<span class="intro-auth-label">Author</span>';
      html += '<p class="intro-auth-text">' + a.author + '</p>';
      html += '</div>';
    }
    if (a.date) {
      html += '<div class="intro-auth-field">';
      html += '<span class="intro-auth-label">When Written</span>';
      html += '<p class="intro-auth-text">' + a.date + '</p>';
      html += '</div>';
    }
    if (a.prompt) {
      html += '<div class="intro-auth-field">';
      html += '<span class="intro-auth-label">What Prompted It</span>';
      html += '<p class="intro-auth-text">' + a.prompt + '</p>';
      html += '</div>';
    }
    html += '</div></div>';
  }

  // Sections
  var sections = intro.sections || [];
  for (var s = 0; s < sections.length; s++) {
    var sec = sections[s];
    html += '<div class="intro-section">';
    html += '<h2 class="intro-section-heading">' + sec.heading + '</h2>';
    html += '<div class="intro-section-content">';

    // Content paragraphs
    if (sec.content) {
      var paragraphs = sec.content.split('\n\n');
      for (var p = 0; p < paragraphs.length; p++) {
        if (paragraphs[p].trim()) {
          html += '<p>' + paragraphs[p].trim() + '</p>';
        }
      }
    }

    // Literary structure outline
    if (sec.outline && sec.outline.length) {
      html += '<ol class="intro-outline">';
      for (var o = 0; o < sec.outline.length; o++) {
        var item = sec.outline[o];
        html += '<li class="intro-outline-item">';
        html += '<span class="intro-outline-label">' + item.label + '</span>';
        if (item.chapters) {
          html += '<span class="intro-outline-chs">Ch ' + item.chapters[0] + '\u2013' + item.chapters[1] + '</span>';
        }
        if (item.note) {
          html += '<span class="intro-outline-note">' + item.note + '</span>';
        }
        html += '</li>';
      }
      html += '</ol>';
    }

    // Theme tags
    if (sec.themes && sec.themes.length) {
      html += '<div class="intro-themes">';
      for (var t = 0; t < sec.themes.length; t++) {
        html += '<span class="intro-theme-tag">' + sec.themes[t] + '</span>';
      }
      html += '</div>';
    }

    // Reading plan
    if (sec.plan && sec.plan.length) {
      html += '<ol class="intro-plan">';
      for (var r = 0; r < sec.plan.length; r++) {
        var step = sec.plan[r];
        html += '<li class="intro-plan-step">';
        html += '<span class="intro-plan-ref">' + refLink(step.ref) + '</span>';
        html += '<span class="intro-plan-label">' + step.label + '</span>';
        html += '</li>';
      }
      html += '</ol>';
    }

    html += '</div>'; // .intro-section-content
    html += '</div>'; // .intro-section
  }

  // Chapter grid
  if (bookInfo) {
    var BOOKS = window.BOOKS || [];
    var liveCount = 0;
    for (var b = 0; b < BOOKS.length; b++) {
      if (BOOKS[b].dir === bookKey) { liveCount = BOOKS[b].live; break; }
    }

    if (liveCount > 0) {
      html += '<div class="intro-start">';
      html += '<p class="intro-start-heading">Chapters</p>';
      html += '<div class="intro-ch-grid">';
      for (var c = 1; c <= liveCount; c++) {
        var chUrl = '../' + testament + '/' + bookDir + '/' + bookName.replace(/ /g, '_') + '_' + c + '.html';
        html += '<a href="' + chUrl + '" class="intro-ch-link">' + c + '</a>';
      }
      html += '</div>';
      html += '</div>';
    }
  }

  html += '</div>'; // .intro-wrapper

  target.innerHTML = html;
})();

})();
