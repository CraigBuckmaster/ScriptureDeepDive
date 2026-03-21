// word-study-ui.js — Word study cards on chapter pages
//
// Adds word study indicators to VHL-highlighted words when they have
// a lexicon entry. Tap to show an inline study card with original script,
// transliteration, semantic range, and linked occurrences.
//
// Depends on: word-study-engine.js, verse-resolver.js, data/word-study.js
// Loaded by: feature-loader.js (lazy, after DOMContentLoaded)

(function() {
  'use strict';

  var WS = window.WordStudy;
  var VR = window.VerseResolver;
  if (!WS || !VR) return;

  // ── Inject CSS ──────────────────────────────────────────────────────────
  var style = document.createElement('style');
  style.textContent =
    '.ws-card-overlay{display:none;position:fixed;inset:0;z-index:270;background:rgba(0,0,0,.6);}' +
    '.ws-card-overlay.open{display:flex;align-items:flex-end;justify-content:center;}' +
    '@media(min-width:600px){.ws-card-overlay.open{align-items:center;}}' +
    '.ws-card{width:min(440px,95vw);max-height:80vh;overflow-y:auto;background:#0d0b07;' +
      'border:1px solid #332810;border-radius:8px 8px 0 0;box-shadow:0 -4px 24px rgba(0,0,0,.5);' +
      'animation:wsSlideUp .25s ease-out;}' +
    '@media(min-width:600px){.ws-card{border-radius:8px;animation:wsFadeIn .2s ease-out;}}' +
    '@keyframes wsSlideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}' +
    '@keyframes wsFadeIn{from{opacity:0;transform:scale(.96)}to{opacity:1;transform:scale(1)}}' +

    // Card header
    '.ws-card-header{padding:1.2rem 1.2rem .8rem;border-bottom:1px solid #332810;}' +
    '.ws-card-lang{font-family:"Source Sans 3",sans-serif;font-size:.55rem;letter-spacing:.15em;' +
      'text-transform:uppercase;color:#7a6020;margin-bottom:.3rem;}' +
    '.ws-card-original{font-size:1.8rem;color:#f0e8d8;margin-bottom:.1rem;line-height:1.2;}' +
    '.ws-card-translit{font-family:"EB Garamond",Georgia,serif;font-size:1rem;color:#c9a84c;' +
      'font-style:italic;margin-bottom:.4rem;}' +
    '.ws-card-glosses{font-family:"Source Sans 3",sans-serif;font-size:.72rem;color:#b8a880;' +
      'line-height:1.5;}' +
    '.ws-card-strongs{font-family:"Source Sans 3",sans-serif;font-size:.58rem;color:#4a3a22;' +
      'margin-top:.3rem;}' +

    // Card body
    '.ws-card-body{padding:1rem 1.2rem;}' +
    '.ws-card-section{margin-bottom:1.2rem;}' +
    '.ws-card-section:last-child{margin-bottom:0;}' +
    '.ws-card-label{font-family:"Source Sans 3",sans-serif;font-size:.58rem;letter-spacing:.12em;' +
      'text-transform:uppercase;color:#6a5a38;margin-bottom:.4rem;}' +
    '.ws-card-range{font-family:"EB Garamond",Georgia,serif;font-size:.9rem;color:#b8a880;line-height:1.7;}' +
    '.ws-card-note{font-family:"EB Garamond",Georgia,serif;font-size:.85rem;color:#7a6020;' +
      'line-height:1.7;font-style:italic;}' +

    // Occurrences
    '.ws-card-occ{list-style:none;padding:0;margin:0;}' +
    '.ws-card-occ li{display:flex;gap:.6rem;padding:.4rem 0;border-bottom:1px solid rgba(58,46,24,.2);' +
      'align-items:baseline;}' +
    '.ws-card-occ li:last-child{border-bottom:none;}' +
    '.ws-card-occ-ref{font-family:"Cinzel",serif;font-size:.6rem;letter-spacing:.05em;flex-shrink:0;min-width:70px;}' +
    '.ws-card-occ-ref a{color:#c9a84c;text-decoration:none;border-bottom:1px solid rgba(201,168,76,.3);}' +
    '.ws-card-occ-ref a:hover{border-color:#c9a84c;}' +
    '.ws-card-occ-ref span{color:#6a5a38;}' +
    '.ws-card-occ-gloss{font-family:"Source Sans 3",sans-serif;font-size:.62rem;color:#7a6020;' +
      'background:rgba(201,168,76,.08);padding:.1rem .3rem;border-radius:2px;flex-shrink:0;}' +
    '.ws-card-occ-ctx{font-family:"EB Garamond",Georgia,serif;font-size:.82rem;color:#b8a880;flex:1;}' +

    // Close button
    '.ws-card-close{position:absolute;top:.6rem;right:.8rem;background:none;border:none;' +
      'color:#6a5a38;font-size:1.2rem;cursor:pointer;padding:.2rem;transition:color .15s;}' +
    '.ws-card-close:hover{color:#c9a84c;}' +

    // Word study dot on VHL spans
    '.vhl.has-ws{cursor:pointer;border-bottom:1px dotted rgba(201,168,76,.4);}';
  document.head.appendChild(style);


  // ── State ───────────────────────────────────────────────────────────────
  var _bookKey = '';
  var _chNum = 0;

  // ── Init ────────────────────────────────────────────────────────────────

  function init() {
    var cur = window.QNAV_CURRENT || '';
    if (!cur) return;
    var parts = cur.split('/');
    if (parts.length < 3) return;
    _bookKey = parts[1];
    var chMatch = parts[2].match(/_(\d+)\.html$/);
    if (!chMatch) return;
    _chNum = parseInt(chMatch[1], 10);

    // Find VHL-highlighted words that have word study entries
    var chapterWords = WS.getForChapter(_bookKey, _chNum);
    if (chapterWords.length === 0) return;

    // Build a set of English glosses that have entries for this chapter
    var glossSet = {};
    chapterWords.forEach(function(hit) {
      hit.entry.glosses.forEach(function(g) {
        glossSet[g.toLowerCase()] = hit.entry;
      });
    });

    // Scan all VHL spans and mark those with word study entries
    document.querySelectorAll('.vhl').forEach(function(span) {
      var word = span.textContent.trim().toLowerCase();
      if (glossSet[word]) {
        span.classList.add('has-ws');
        span.setAttribute('data-ws-id', glossSet[word].id);
        span.addEventListener('click', function(e) {
          e.stopPropagation();
          openCard(glossSet[word].id);
        });
      }
    });
  }

  // ── Card rendering ──────────────────────────────────────────────────────

  function openCard(wordId) {
    var entry = WS.lookup(wordId);
    if (!entry) return;

    var overlay = document.createElement('div');
    overlay.className = 'ws-card-overlay open';

    // Occurrences
    var occHtml = '';
    if (entry.occurrences && entry.occurrences.length) {
      occHtml = '<ul class="ws-card-occ">';
      entry.occurrences.forEach(function(occ) {
        var parsed = VR.parse(occ.ref);
        var refHtml;
        if (parsed && VR.isLive(parsed.book, parsed.ch)) {
          refHtml = '<a href="../../' + parsed.url + '">' + occ.ref + '</a>';
        } else {
          refHtml = '<span>' + occ.ref + '</span>';
        }
        occHtml += '<li>' +
          '<span class="ws-card-occ-ref">' + refHtml + '</span>' +
          '<span class="ws-card-occ-gloss">' + occ.gloss + '</span>' +
          '<span class="ws-card-occ-ctx">' + occ.ctx + '</span>' +
          '</li>';
      });
      occHtml += '</ul>';
    }

    overlay.innerHTML =
      '<div class="ws-card" style="position:relative;">' +
        '<button class="ws-card-close">&times;</button>' +
        '<div class="ws-card-header">' +
          '<div class="ws-card-lang">' + entry.language + '</div>' +
          '<div class="ws-card-original">' + entry.original + '</div>' +
          '<div class="ws-card-translit">' + entry.transliteration + '</div>' +
          '<div class="ws-card-glosses">' + entry.glosses.join(' \u00b7 ') + '</div>' +
          (entry.strongs ? '<div class="ws-card-strongs">' + entry.strongs + '</div>' : '') +
        '</div>' +
        '<div class="ws-card-body">' +
          '<div class="ws-card-section">' +
            '<div class="ws-card-label">Semantic Range</div>' +
            '<div class="ws-card-range">' + entry.range + '</div>' +
          '</div>' +
          (entry.note ? '<div class="ws-card-section"><div class="ws-card-label">Theological Significance</div><div class="ws-card-note">' + entry.note + '</div></div>' : '') +
          (occHtml ? '<div class="ws-card-section"><div class="ws-card-label">Occurrences in Live Chapters</div>' + occHtml + '</div>' : '') +
        '</div>' +
      '</div>';

    document.body.appendChild(overlay);

    // Close handlers
    overlay.querySelector('.ws-card-close').addEventListener('click', function() { overlay.remove(); });
    overlay.addEventListener('click', function(e) { if (e.target === overlay) overlay.remove(); });
  }

  // ── Auto-init ───────────────────────────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.WordStudyUI = { init: init, openCard: openCard };
})();
