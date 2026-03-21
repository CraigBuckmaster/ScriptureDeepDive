// cross-ref-ui.js — Cross-reference thread UI for chapter pages
//
// Enhances chapter pages with:
// 1. Thread badges in the chapter header showing threads passing through this chapter
// 2. A thread viewer slide panel with the full chain
// 3. Breadcrumb bar when navigating within a thread
//
// Depends on: cross-ref-engine.js, verse-resolver.js, data/cross-refs.js
// Loaded by: feature-loader.js (lazy, after DOMContentLoaded)

(function() {
  'use strict';

  var CR = window.CrossRef;
  var VR = window.VerseResolver;
  if (!CR || !VR) return;

  // ── Inject CSS ──────────────────────────────────────────────────────────
  var style = document.createElement('style');
  style.textContent =
    // Thread badges in chapter header
    '.xref-badges{display:flex;flex-wrap:wrap;gap:.4rem;margin:.3rem 0;}' +
    '.xref-badge{display:inline-flex;align-items:center;gap:.3rem;padding:.25rem .55rem;' +
      'background:rgba(201,168,76,.06);border:1px solid rgba(201,168,76,.18);border-radius:3px;' +
      'cursor:pointer;transition:background .12s,border-color .12s;text-decoration:none;}' +
    '.xref-badge:hover{background:rgba(201,168,76,.12);border-color:rgba(201,168,76,.35);}' +
    '.xref-badge-icon{font-size:.65rem;color:#c9a84c;}' +
    '.xref-badge-label{font-family:"Source Sans 3",sans-serif;font-size:.6rem;letter-spacing:.06em;color:#b8a880;text-transform:uppercase;}' +

    // Thread viewer overlay
    '.xref-overlay{display:none;position:fixed;inset:0;z-index:260;background:rgba(0,0,0,.75);backdrop-filter:blur(4px);}' +
    '.xref-overlay.open{display:flex;justify-content:flex-end;}' +
    '.xref-panel{width:min(420px,92vw);height:100%;background:#0d0b07;border-left:1px solid #332810;' +
      'overflow-y:auto;-webkit-overflow-scrolling:touch;display:flex;flex-direction:column;' +
      'animation:xrefSlide .25s ease-out;}' +
    '@keyframes xrefSlide{from{transform:translateX(100%)}to{transform:translateX(0)}}' +

    // Panel header
    '.xref-panel-header{padding:1.2rem;border-bottom:1px solid #332810;position:sticky;top:0;background:#0d0b07;z-index:1;}' +
    '.xref-panel-theme{font-family:"Cinzel",serif;font-size:.82rem;letter-spacing:.06em;color:#c9a84c;margin-bottom:.2rem;}' +
    '.xref-panel-tags{display:flex;gap:.3rem;flex-wrap:wrap;margin-top:.4rem;}' +
    '.xref-panel-tag{font-family:"Source Sans 3",sans-serif;font-size:.55rem;letter-spacing:.05em;' +
      'padding:.15rem .4rem;background:rgba(201,168,76,.08);border-radius:2px;color:#7a6020;}' +
    '.xref-panel-close{position:absolute;top:.8rem;right:.8rem;background:none;border:none;' +
      'color:#6a5a38;font-size:1.3rem;cursor:pointer;padding:.2rem;line-height:1;transition:color .15s;}' +
    '.xref-panel-close:hover{color:#c9a84c;}' +

    // Chain steps
    '.xref-chain{flex:1;padding:0 1.2rem 2rem;}' +
    '.xref-step{display:flex;gap:.8rem;padding:.9rem 0;border-bottom:1px solid rgba(58,46,24,.25);}' +
    '.xref-step:last-child{border-bottom:none;}' +
    '.xref-step.current{background:rgba(201,168,76,.06);margin:0 -1.2rem;padding:.9rem 1.2rem;border-radius:4px;}' +
    '.xref-step-marker{display:flex;flex-direction:column;align-items:center;flex-shrink:0;width:1.8rem;}' +
    '.xref-step-dot{width:8px;height:8px;border-radius:50%;background:#4a3a22;flex-shrink:0;}' +
    '.xref-step.current .xref-step-dot{background:#c9a84c;box-shadow:0 0 6px rgba(201,168,76,.4);}' +
    '.xref-step-line{flex:1;width:1px;background:#332810;margin-top:4px;}' +
    '.xref-step:last-child .xref-step-line{display:none;}' +
    '.xref-step-content{flex:1;min-width:0;}' +
    '.xref-step-ref{font-family:"Cinzel",serif;font-size:.68rem;letter-spacing:.06em;margin-bottom:.2rem;}' +
    '.xref-step-ref a{color:#c9a84c;text-decoration:none;border-bottom:1px solid rgba(201,168,76,.3);transition:border-color .15s;}' +
    '.xref-step-ref a:hover{border-color:#c9a84c;}' +
    '.xref-step-ref span{color:#6a5a38;}' +
    '.xref-step-note{font-family:"EB Garamond",Georgia,serif;font-size:.88rem;color:#b8a880;line-height:1.7;}' +

    // Pairs section
    '.xref-pairs{margin-top:1rem;padding-top:.8rem;border-top:1px solid rgba(58,46,24,.3);}' +
    '.xref-pairs-title{font-family:"Source Sans 3",sans-serif;font-size:.58rem;letter-spacing:.15em;' +
      'text-transform:uppercase;color:#6a5a38;margin-bottom:.5rem;}' +
    '.xref-pair{display:flex;align-items:baseline;gap:.5rem;padding:.4rem 0;' +
      'font-family:"EB Garamond",Georgia,serif;font-size:.85rem;color:#b8a880;}' +
    '.xref-pair-arrow{color:#4a3a22;font-size:.7rem;}' +
    '.xref-pair a{color:#c9a84c;text-decoration:none;font-family:"Cinzel",serif;font-size:.62rem;' +
      'letter-spacing:.05em;border-bottom:1px solid rgba(201,168,76,.3);}' +
    '.xref-pair a:hover{border-color:#c9a84c;}' +
    '.xref-pair-note{font-size:.82rem;color:#7a6020;font-style:italic;}';
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

    var threads = CR.getThreadsForChapter(_bookKey, _chNum);
    if (threads.length === 0) return;

    _renderBadges(threads);
  }

  // ── Thread badges ───────────────────────────────────────────────────────

  function _renderBadges(threadEntries) {
    var header = document.querySelector('.scholarly-header, .chapter-title, h1');
    if (!header) return;

    var container = document.createElement('div');
    container.className = 'xref-badges';

    threadEntries.forEach(function(entry) {
      var badge = document.createElement('a');
      badge.className = 'xref-badge';
      badge.href = '#';
      badge.innerHTML =
        '<span class="xref-badge-icon">\u2734</span>' +
        '<span class="xref-badge-label">' + entry.thread.theme + '</span>';

      badge.addEventListener('click', function(e) {
        e.preventDefault();
        _openThreadViewer(entry.thread, entry.stepIndex);
      });

      container.appendChild(badge);
    });

    // Insert after the last map/timeline link, or after header if none exist
    var mapLinks = document.querySelectorAll('.map-story-link, .tl-event-link');
    var insertAfter = mapLinks.length ? mapLinks[mapLinks.length - 1] : header;
    insertAfter.parentNode.insertBefore(container, insertAfter.nextSibling);
  }

  // ── Thread viewer ───────────────────────────────────────────────────────

  function _openThreadViewer(thread, currentStep) {
    var overlay = document.createElement('div');
    overlay.className = 'xref-overlay open';

    // Tags
    var tagsHtml = '';
    if (thread.tags && thread.tags.length) {
      tagsHtml = '<div class="xref-panel-tags">';
      thread.tags.forEach(function(tag) {
        tagsHtml += '<span class="xref-panel-tag">' + tag + '</span>';
      });
      tagsHtml += '</div>';
    }

    // Chain steps
    var chainHtml = '';
    thread.chain.forEach(function(step, idx) {
      var isCurrent = idx === currentStep;
      var parsed = VR.parse(step.ref);
      var refHtml;
      if (parsed && VR.isLive(parsed.book, parsed.ch)) {
        refHtml = '<a href="../../' + parsed.url + '">' + step.ref + '</a>';
      } else {
        refHtml = '<span>' + step.ref + '</span>';
      }

      chainHtml +=
        '<div class="xref-step' + (isCurrent ? ' current' : '') + '">' +
          '<div class="xref-step-marker">' +
            '<div class="xref-step-dot"></div>' +
            '<div class="xref-step-line"></div>' +
          '</div>' +
          '<div class="xref-step-content">' +
            '<div class="xref-step-ref">' + refHtml + '</div>' +
            '<div class="xref-step-note">' + step.note + '</div>' +
          '</div>' +
        '</div>';
    });

    overlay.innerHTML =
      '<div class="xref-panel">' +
        '<div class="xref-panel-header">' +
          '<div class="xref-panel-theme">' + thread.theme + '</div>' +
          tagsHtml +
          '<button class="xref-panel-close">&times;</button>' +
        '</div>' +
        '<div class="xref-chain">' + chainHtml + '</div>' +
      '</div>';

    document.body.appendChild(overlay);

    // Scroll current step into view
    var currentEl = overlay.querySelector('.xref-step.current');
    if (currentEl) {
      setTimeout(function() { currentEl.scrollIntoView({ block: 'center' }); }, 100);
    }

    // Close handlers
    overlay.querySelector('.xref-panel-close').addEventListener('click', function() {
      overlay.remove();
    });
    overlay.addEventListener('click', function(e) {
      if (e.target === overlay) overlay.remove();
    });
  }


  // ── Auto-init ───────────────────────────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.CrossRefUI = { init: init };

})();
