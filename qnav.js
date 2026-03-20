// qnav.js — shared quick-navigation panel for Scripture Deep Dive v2
(function() {
  var style = document.createElement('style');
  style.textContent =
    '.qnav-overlay{display:none;position:fixed;inset:0;z-index:200;background:rgba(0,0,0,.72);backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);flex-direction:column;}' +
    '.qnav-overlay.open{display:flex;}' +
    '.qnav-panel{background:#0d0b07;border-bottom:1px solid #3a2e18;max-height:82vh;overflow-y:auto;overscroll-behavior:contain;display:flex;flex-direction:column;-webkit-overflow-scrolling:touch;}' +
    '.qnav-header{display:flex;align-items:center;gap:.6rem;padding:.65rem .9rem;border-bottom:1px solid rgba(58,46,24,.5);position:sticky;top:0;background:#0d0b07;z-index:2;}' +
    '.qnav-search-wrap{flex:1;position:relative;}' +
    '.qnav-search-icon{position:absolute;left:.65rem;top:50%;transform:translateY(-50%);color:#5a4a30;font-size:.78rem;pointer-events:none;}' +
    '.qnav-search{width:100%;background:rgba(255,255,255,.06);border:1px solid rgba(58,46,24,.8);border-radius:4px;padding:.42rem .75rem .42rem 2rem;color:#f0e8d8;font-family:\'Source Sans 3\',sans-serif;font-size:.88rem;outline:none;transition:border-color .15s;}' +
    '.qnav-search:focus{border-color:#8b6914;}' +
    '.qnav-search::placeholder{color:#4a3a22;}' +
    '.qnav-close{background:none;border:none;color:#6a5a40;cursor:pointer;padding:.1rem .3rem;font-size:1.5rem;line-height:1;transition:color .15s;flex-shrink:0;display:flex;align-items:center;justify-content:center;min-width:40px;min-height:40px;}' +
    '.qnav-close:hover{color:#c9a84c;}' +
    '.qnav-body{flex:1;}' +
    '.qnav-testament{border-bottom:1px solid rgba(58,46,24,.25);}' +
    '.qnav-testament-btn{width:100%;background:transparent;border:none;cursor:pointer;padding:.5rem .9rem;display:flex;justify-content:space-between;align-items:center;transition:background .12s;-webkit-appearance:none;}' +
    '.qnav-testament-btn:hover{background:rgba(255,255,255,.03);}' +
    '.qnav-testament-label{font-family:\'Cinzel\',serif;font-size:.58rem;font-weight:600;letter-spacing:.2em;text-transform:uppercase;color:#c9a84c;}' +
    '.qnav-testament-chev{font-size:.48rem;color:#c9a84c;transition:transform .2s;}' +
    '.qnav-testament.open .qnav-testament-chev{transform:rotate(180deg);}' +
    '.qnav-testament-books{display:none;}' +
    '.qnav-testament.open .qnav-testament-books{display:block;}' +
    '.qnav-book{border-bottom:1px solid rgba(58,46,24,.18);}' +
    '.qnav-book-btn{width:100%;background:none;border:none;cursor:pointer;padding:.48rem .9rem;display:flex;justify-content:space-between;align-items:center;gap:.5rem;transition:background .12s;}' +
    '.qnav-book-btn:hover{background:rgba(255,255,255,.04);}' +
    '.qnav-book-name{font-family:\'EB Garamond\',serif;font-size:.98rem;color:#c8c0a0;text-align:left;display:flex;align-items:center;gap:.5rem;}' +
    '.qnav-live-dot{width:6px;height:6px;border-radius:50%;background:#70d098;flex-shrink:0;box-shadow:0 0 5px rgba(112,208,152,.5);}' +
    '.qnav-book-meta{display:flex;align-items:center;gap:.4rem;flex-shrink:0;}' +
    '.qnav-book-chev{font-size:.5rem;color:#4a3a22;transition:transform .2s;}' +
    '.qnav-book.open .qnav-book-chev{transform:rotate(180deg);}' +
    '.qnav-ch-grid{display:none;padding:.4rem .9rem .7rem;}' +
    '.qnav-book.open .qnav-ch-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(38px,1fr));gap:.3rem;}' +
    '.qnav-ch-btn{background:rgba(255,255,255,.04);border:1px solid rgba(58,46,24,.4);border-radius:3px;color:#c8c0a0;font-family:\'Source Sans 3\',sans-serif;font-size:.75rem;padding:.3rem .25rem;text-align:center;text-decoration:none;transition:all .12s;display:block;}' +
    '.qnav-ch-btn:hover,.qnav-ch-btn.live{border-color:#8b6914;color:#c9a84c;}' +
    '.qnav-ch-btn.current{background:rgba(201,168,76,.15);border-color:#c9a84c;color:#e8c870;font-weight:600;}' +
    '.qnav-dismiss{flex:1;cursor:pointer;min-height:40px;}' +
    '.qnav-search-results{padding:.4rem .5rem;}' +
    '.qnav-book-result{display:flex;align-items:center;justify-content:space-between;gap:.6rem;padding:.45rem .65rem;background:rgba(201,168,76,.08);border:1px solid rgba(201,168,76,.25);border-radius:4px;margin-bottom:.3rem;text-decoration:none;transition:background .12s;}' +
    '.qnav-book-result:hover,.qnav-book-result.focused{background:rgba(201,168,76,.14);border-color:rgba(201,168,76,.45);}' +
    '.qnav-book-result-meta{font-family:\'Source Sans 3\',sans-serif;font-size:.7rem;color:#6a5a38;white-space:nowrap;}' +
    '.qnav-verse-result{display:flex;flex-direction:column;gap:.2rem;padding:.5rem .65rem;background:rgba(255,255,255,.03);border:1px solid #2a2010;border-radius:4px;margin-bottom:.3rem;text-decoration:none;transition:background .12s;cursor:pointer;}' +
    '.qnav-verse-result:hover,.qnav-verse-result.focused{background:rgba(201,168,76,.08);border-color:#7a6020;}' +
    '.qnav-vref{font-family:\'Cinzel\',serif;font-size:.62rem;font-weight:600;letter-spacing:.1em;color:#c9a84c;text-transform:uppercase;}' +
    '.qnav-vsnip{font-family:\'Source Sans 3\',sans-serif;font-size:.78rem;color:#b8a880;line-height:1.45;}' +
    '.qnav-vsnip em{color:#e8c870;font-style:normal;font-weight:600;}' +
    '.qnav-no-results{font-family:\'Source Sans 3\',sans-serif;font-size:.78rem;color:#6a5a38;padding:.5rem .65rem;text-align:center;}';
  document.head.appendChild(style);

  function buildPanel() {
    var books = window.BOOKS || [];
    function chGrid(b) {
      var h = '';
      for (var i = 1; i <= b.live; i++) {
        h += '<a href="../../' + b.testament.toLowerCase() + '/' + b.dir + '/' + b.name + '_' + i + '.html" class="qnav-ch-btn live">' + i + '</a>';
      }
      return h;
    }
    function bookDiv(b) {
      return '<div class="qnav-book" id="qnav-book-' + b.dir + '">' +
             '<button class="qnav-book-btn" onclick="qnavToggleBook(\'' + b.dir + '\')">' +
             '<span class="qnav-book-name"><span class="qnav-live-dot"></span>' + b.name + '</span>' +
             '<span class="qnav-book-meta"><span class="qnav-book-chev">&#9660;</span></span>' +
             '</button><div class="qnav-ch-grid">' + chGrid(b) + '</div></div>';
    }
    var otHtml = '', ntHtml = '';
    for (var i = 0; i < books.length; i++) {
      if (books[i].live > 0) {
        if (books[i].testament === 'OT') otHtml += bookDiv(books[i]);
        else ntHtml += bookDiv(books[i]);
      }
    }
    return '<div class="qnav-overlay" id="qnav-overlay">' +
           '<div class="qnav-panel">' +
           '<div class="qnav-header">' +
           '<div class="qnav-search-wrap"><span class="qnav-search-icon">&#128269;</span>' +
           '<input class="qnav-search" id="qnav-search-input" placeholder="Search verses or books\u2026" oninput="qnavFilter(this.value)" onkeydown="qnavKeydown(event)"></div>' +
           '<button class="qnav-close" onclick="closeQnav()" aria-label="Close">&times;</button>' +
           '</div>' +
           '<div class="qnav-body">' +
           '<div class="qnav-search-results" id="qnav-search-results" style="display:none"></div>' +
           '<div class="qnav-testament" id="qnav-t-ot"><button class="qnav-testament-btn" onclick="qnavToggleTestament(\'ot\')"><span class="qnav-testament-label">Old Testament</span><span class="qnav-testament-chev">&#9660;</span></button><div class="qnav-testament-books">' + otHtml + '</div></div>' +
           '<div class="qnav-testament" id="qnav-t-nt"><button class="qnav-testament-btn" onclick="qnavToggleTestament(\'nt\')"><span class="qnav-testament-label">New Testament</span><span class="qnav-testament-chev">&#9660;</span></button><div class="qnav-testament-books">' + ntHtml + '</div></div>' +
           '</div></div>' +
           '<div class="qnav-dismiss" onclick="closeQnav()"></div></div>';
  }

  function injectPanel() {
    var div = document.createElement('div');
    div.innerHTML = buildPanel();
    document.body.appendChild(div.firstChild);
    highlightCurrent();
    document.addEventListener('keydown', function(e) { if (e.key === 'Escape') closeQnav(); });
  }
  if (window.BOOKS) { injectPanel(); }
  else { window.addEventListener('load', injectPanel); }
})();

var _versesLoaded = {};
function loadAllVerses() {
  var books = window.BOOKS || [];
  for (var i = 0; i < books.length; i++) {
    var b = books[i];
    if (_versesLoaded[b.dir]) continue;
    _versesLoaded[b.dir] = true;
    (function(dir, test) {
      var s = document.createElement('script');
      s.src = '../../verses/' + test.toLowerCase() + '/' + dir + '.js';
      document.head.appendChild(s);
    })(b.dir, b.testament);
  }
}

function qnavToggleTestament(id) {
  var el = document.getElementById('qnav-t-' + id);
  if (el) el.classList.toggle('open');
}

function openQnav() {
  var ol = document.getElementById('qnav-overlay');
  ol.classList.add('open');
  document.body.style.overflow = 'hidden';
  loadAllVerses();
  var cur = window.QNAV_CURRENT || '';
  if (cur) {
    var parts = cur.split('/');
    var bookDir = parts[1];
    var bookEl = document.getElementById('qnav-book-' + bookDir);
    if (bookEl) {
      var testament = bookEl.closest('.qnav-testament');
      if (testament && !testament.classList.contains('open')) testament.classList.add('open');
      if (!bookEl.classList.contains('open')) qnavToggleBook(bookDir);
      setTimeout(function() { bookEl.scrollIntoView({ block: 'center', behavior: 'smooth' }); }, 80);
    }
  }
  setTimeout(function() { var s = document.getElementById('qnav-search-input'); if (s) s.focus(); }, 80);
}

function closeQnav() {
  var ol = document.getElementById('qnav-overlay');
  if (!ol) return;
  ol.classList.remove('open');
  document.body.style.overflow = '';
  var s = document.getElementById('qnav-search-input');
  if (s) { s.value = ''; qnavFilter(''); }
}

function qnavToggleBook(id) {
  var el = document.getElementById('qnav-book-' + id);
  if (!el) return;
  var wasOpen = el.classList.contains('open');
  document.querySelectorAll('.qnav-book').forEach(function(b) { b.classList.remove('open'); });
  if (!wasOpen) el.classList.add('open');
}

var _qnavFocusIndex = -1;
function qnavKeydown(e) {
  var results = document.querySelectorAll('#qnav-search-results .qnav-verse-result, #qnav-search-results .qnav-book-result');
  if (!results.length) return;
  if (e.key === 'ArrowDown') {
    e.preventDefault();
    _qnavFocusIndex = Math.min(_qnavFocusIndex + 1, results.length - 1);
    _qnavApplyFocus(results);
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    _qnavFocusIndex = Math.max(_qnavFocusIndex - 1, -1);
    if (_qnavFocusIndex === -1) {
      results.forEach(function(r) { r.classList.remove('focused'); });
      document.getElementById('qnav-search-input').focus();
    } else { _qnavApplyFocus(results); }
  } else if (e.key === 'Enter' && _qnavFocusIndex >= 0) {
    e.preventDefault();
    results[_qnavFocusIndex].click();
  }
}
function _qnavApplyFocus(results) {
  results.forEach(function(r, i) {
    r.classList.toggle('focused', i === _qnavFocusIndex);
    if (i === _qnavFocusIndex) r.scrollIntoView({ block: 'nearest' });
  });
}

function qnavFilter(q) {
  q = q.trim();
  var ql = q.toLowerCase();
  var words = ql.split(/\s+/).filter(function(w) { return w.length > 1; });
  var panel = document.getElementById('qnav-search-results');
  _qnavFocusIndex = -1;
  if (!q) {
    if (panel) { panel.innerHTML = ''; panel.style.display = 'none'; }
    document.querySelectorAll('.qnav-ch-grid').forEach(function(g) { g.style.display = ''; });
    document.querySelectorAll('.qnav-book').forEach(function(b) { b.style.display = ''; });
    return;
  }
  document.querySelectorAll('.qnav-ch-grid').forEach(function(g) { g.style.display = 'none'; });
  document.querySelectorAll('.qnav-book').forEach(function(b) { b.style.display = 'none'; });

  var books = window.BOOKS || [];
  var bookMatches = books.filter(function(b) { return b.live > 0 && b.name.toLowerCase().indexOf(ql) > -1; });

  var verseMatches = ql.length >= 2 ? (window.VERSES_ALL || []).map(function(v) {
    var text = v.text.toLowerCase(), ref = v.ref.toLowerCase(), score = 0;
    for (var i = 0; i < words.length; i++) {
      if (text.indexOf(words[i]) > -1) score += 2;
      else if (ref.indexOf(words[i]) > -1) score += 1;
    }
    if (text.indexOf(ql) > -1) score += 5;
    return { ref: v.ref, short: v.short, text: v.text, url: v.url, score: score };
  }).filter(function(v) { return v.score > 0; })
    .sort(function(a, b) { return b.score - a.score; })
    .slice(0, 12) : [];

  function hl(text) {
    var out = text;
    if (ql.length > 2) { var rx = new RegExp('(' + ql.replace(/[.*+?^${}()|[\]\\]/g,'\\$&') + ')','gi'); out = out.replace(rx,'<em>$1</em>'); }
    for (var i = 0; i < words.length; i++) { var rx2 = new RegExp('(' + words[i].replace(/[.*+?^${}()|[\]\\]/g,'\\$&') + ')','gi'); out = out.replace(rx2,'<em>$1</em>'); }
    return out;
  }

  var html = '';
  for (var i = 0; i < bookMatches.length; i++) {
    var b = bookMatches[i];
    var firstUrl = '../../' + b.testament.toLowerCase() + '/' + b.dir + '/' + b.name + '_1.html';
    html += '<a href="' + firstUrl + '" class="qnav-book-result"><span style="font-family:\'EB Garamond\',serif;font-size:.95rem;color:#c8c0a0;">' + hl(b.name) + '</span><span class="qnav-book-result-meta">' + b.live + ' ch &middot; ' + b.testament + '</span></a>';
  }
  if (verseMatches.length === 0 && bookMatches.length === 0) {
    html = '<p class="qnav-no-results">No results for \u201c' + q + '\u201d</p>';
  } else {
    for (var j = 0; j < verseMatches.length; j++) {
      var v = verseMatches[j];
      var snippet = v.text.length > 120 ? v.text.slice(0,117) + '\u2026' : v.text;
      html += '<a href="../../' + v.url + '" class="qnav-verse-result"><span class="qnav-vref">' + v.short + '</span><span class="qnav-vsnip">' + hl(snippet) + '</span></a>';
    }
  }
  if (!panel) {
    var p = document.createElement('div'); p.id = 'qnav-search-results'; p.className = 'qnav-search-results';
    var body = document.querySelector('.qnav-body'); if (body) body.insertBefore(p, body.firstChild);
    p.innerHTML = html; p.style.display = 'block';
  } else { panel.innerHTML = html; panel.style.display = 'block'; }
}

function highlightCurrent() {
  var cur = window.QNAV_CURRENT || '';
  if (!cur) return;
  var chUrl = '../../' + cur;
  document.querySelectorAll('.qnav-ch-btn').forEach(function(btn) {
    if (btn.getAttribute('href') === chUrl) btn.classList.add('current');
  });
}
