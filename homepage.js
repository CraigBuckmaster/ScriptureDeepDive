// homepage.js — search, navigation, and continue-reading for the homepage

// ── BOOK DATA for matching ─────────────────────────────────────────────────
// BOOK_DATA — built from DOM automatically.
// Adding new books: just add them to the library-grid HTML with class="book-item".
// When a chapter goes live, add class="live" to its chapter-link — search picks it up instantly.
const BOOK_DATA = [];
document.querySelectorAll('.book-item').forEach(item => {
  const name = item.querySelector('.book-name')?.textContent?.trim() || '';
  const liveLinks = item.querySelectorAll('.chapter-link.live');
  const hasLive = liveLinks.length > 0;
  const firstLive = liveLinks[0] || null;
  BOOK_DATA.push({
    name, hasLive, el: item,
    url: firstLive ? firstLive.getAttribute('href') : null,
    id: item.id.replace('book-', ''),
    liveCount: liveLinks.length
  });
});

// ── UNIFIED SEARCH ────────────────────────────────────────────────────────
function handleSearch(q) {
  const panel   = document.getElementById('unified-results');
  const libGrid = document.getElementById('library-grid');
  q = q.trim();

  if (!q) {
    panel.classList.remove('visible');
    panel.innerHTML = '';
    libGrid.style.display = '';
    document.querySelectorAll('.book-item').forEach(b => b.style.display = '');
    document.querySelectorAll('.testament-group').forEach(g => { g.style.display = ''; g.classList.remove('open'); });
    return;
  }

  const ql    = q.toLowerCase();
  const words = ql.split(/\s+/).filter(w => w.length > 1);

  // Live books set for filtering
  const LIVE_BOOKS = new Set(['genesis','exodus','leviticus','numbers','deuteronomy','joshua','judges','1_samuel','2_samuel','1_kings',
                               'ruth','proverbs',
                               'matthew','mark','luke','john','acts']);

  // ── Highlight helper ───────────────────────────────────────────────────
  function hl(text, q, words) {
    let out = text;
    if (q.length > 2) {
      const rx = new RegExp('(' + q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi');
      out = out.replace(rx, '<em>$1</em>');
    }
    for (const w of words) {
      if (!out.toLowerCase().includes('<em>' + w)) {
        const rx = new RegExp('(' + w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi');
        out = out.replace(rx, '<em>$1</em>');
      }
    }
    return out;
  }

  // ── 1. Book matches ────────────────────────────────────────────────────
  const bookMatches = BOOK_DATA.filter(b => b.name.toLowerCase().includes(ql));

  // ── 2. Chapter matches ─────────────────────────────────────────────────
  // Match ref (e.g. "Genesis 1"), book name, or section title keywords
  const chapterMatches = q.length >= 2 ? (window.CHAPTERS_ALL || []).filter(c => {
    const refLow   = c.ref.toLowerCase();
    const bookLow  = c.book.toLowerCase();
    const titlesLow = c.titles.map(t => t.toLowerCase()).join(' ');
    const ctxLow   = (c.ctx || '').toLowerCase();

    // Direct ref match: "Gen 1", "Genesis 1", "genesis 1"
    if (refLow.includes(ql)) return true;
    // All words appear somewhere in titles or ctx
    if (words.length >= 2 && words.every(w => titlesLow.includes(w) || ctxLow.includes(w))) return true;
    // Single keyword in section title
    if (words.length === 1 && words[0].length >= 4 && titlesLow.includes(words[0])) return true;
    return false;
  }).slice(0, 8) : [];

  // ── 3. Verse matches ───────────────────────────────────────────────────
  const verseMatches = q.length >= 3 ? (window.VERSES_ALL || [])
    .filter(v => {
      // Only live chapters
      const bookDir = v.url.split('/')[1];
      return LIVE_BOOKS.has(bookDir);
    })
    .map(v => {
      const textLow = v.text.toLowerCase();
      const refLow  = v.ref.toLowerCase();
      let score = 0;
      for (const w of words) {
        if (textLow.includes(w)) score += w.length >= 5 ? 3 : 2;
        if (refLow.includes(w)) score += 1;
      }
      if (textLow.includes(ql)) score += 6;   // exact phrase bonus
      if (refLow === ql)         score += 10;  // exact ref match
      return { ...v, score };
    })
    .filter(v => v.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 12) : [];

  // ── Build results HTML ─────────────────────────────────────────────────
  let html = '';
  const hasBooks    = bookMatches.length > 0;
  const hasChapters = chapterMatches.length > 0;
  const hasVerses   = verseMatches.length > 0;

  if (!hasBooks && !hasChapters && !hasVerses) {
    html = '<p class="no-results-msg">No results found for &ldquo;' + q + '&rdquo;</p>';
  }

  // Books
  if (hasBooks) {
    html += `<div class="results-section">
      <div class="results-section-label">
        <span>&#x1F4D6; Books</span>
        <span class="results-count">${bookMatches.length} match${bookMatches.length !== 1 ? 'es' : ''}</span>
      </div>`;
    for (const b of bookMatches) {
      const hlName = hl(b.name, ql, words);
      const liveBadge = b.hasLive ? `<span class="live-tag">&#x25CF; ${b.liveCount} live</span>` : '';
      if (b.hasLive && b.url) {
        html += `<a href="${b.url}" class="book-result has-live" title="Open ${b.name}">
          <span class="book-result-name">${hlName}</span>
          <span class="book-result-meta">${liveBadge}</span>
        </a>`;
      } else {
        html += `<div class="book-result" onclick="openBookFromSearch('${b.id}')" title="Browse ${b.name}">
          <span class="book-result-name">${hlName}</span>
          <span class="book-result-meta">coming soon</span>
        </div>`;
      }
    }
    html += '</div>';
  }

  // Chapters
  if (hasChapters) {
    html += `<div class="results-section">
      <div class="results-section-label">
        <span>&#x1F4C4; Chapters</span>
        <span class="results-count">${chapterMatches.length} match${chapterMatches.length !== 1 ? 'es' : ''}</span>
      </div>`;
    for (const c of chapterMatches) {
      const sectionList = c.titles.slice(0, 2)
        .map(t => `<span class="ch-section">${hl(t, ql, words)}</span>`).join('');
      const extraCount = c.titles.length > 2 ? `<span class="ch-section-more">+${c.titles.length - 2} more</span>` : '';
      html += `<a href="${c.url}" class="chapter-result" title="Open ${c.ref}">
        <span class="chapter-result-ref">${hl(c.ref, ql, words)}</span>
        <span class="chapter-result-sections">${sectionList}${extraCount}</span>
      </a>`;
    }
    html += '</div>';
  }

  // Verses
  if (hasVerses) {
    html += `<div class="results-section">
      <div class="results-section-label">
        <span>&#x1F4DC; Verses</span>
        <span class="results-count">${verseMatches.length} match${verseMatches.length !== 1 ? 'es' : ''}</span>
      </div>`;
    for (const v of verseMatches) {
      const snippet = v.text.length > 160 ? v.text.slice(0, 157) + '\u2026' : v.text;
      html += `<a href="${v.url}" class="verse-result" title="Open ${v.ref}">
        <span class="verse-ref">${v.short}</span>
        <span class="verse-snippet">${hl(snippet, ql, words)}</span>
      </a>`;
    }
    html += '</div>';
  }

  panel.innerHTML = html;
  panel.classList.add('visible');
  libGrid.style.display = 'none';
}

function openBookFromSearch(id) {
  document.getElementById('bookSearch').value = '';
  document.getElementById('unified-results').classList.remove('visible');
  document.getElementById('library-grid').style.display = '';
  document.querySelectorAll('.testament-group').forEach(g => g.classList.remove('open'));
  const bookEl = document.getElementById('book-' + id);
  if (bookEl) {
    const testament = bookEl.closest('.testament-group');
    if (testament) testament.classList.add('open');
    bookEl.classList.add('open');
    setTimeout(() => bookEl.scrollIntoView({behavior:'smooth', block:'start'}), 100);
  }
}

// ── TESTAMENT TOGGLE ──────────────────────────────────────────────────────
function toggleTestament(id) {
  const grp = document.getElementById(id);
  grp.classList.toggle('open');
  if (grp.classList.contains('open')) {
    setTimeout(() => {
      const rect = grp.getBoundingClientRect();
      if (rect.top < 60) grp.scrollIntoView({behavior:'smooth', block:'start'});
    }, 10);
  }
}

// ── BOOK TOGGLE ───────────────────────────────────────────────────────────
function toggleBook(id) {
  const item = document.getElementById('book-' + id);
  const wasOpen = item.classList.contains('open');
  document.querySelectorAll('.book-item.open').forEach(el => el.classList.remove('open'));
  if (!wasOpen) {
    item.classList.add('open');
    setTimeout(() => {
      const rect = item.getBoundingClientRect();
      if (rect.top < 60) item.scrollIntoView({behavior:'smooth', block:'start'});
    }, 10);
  }
}

// ── INIT ──────────────────────────────────────────────────────────────────
document.querySelectorAll('.book-item').forEach(item => {
  if (item.querySelector('.chapter-link.live')) item.classList.add('has-live');
});
function updateLiveBadge(id, badgeId) {
  const g = document.getElementById(id);
  if (!g) return;
  const n = g.querySelectorAll('.chapter-link.live').length;
  const b = document.getElementById(badgeId);
  if (b && n > 0) { b.className = 'tt-live-count'; b.textContent = n + ' live'; }
}
updateLiveBadge('tg-ot', 'ot-live-badge');
updateLiveBadge('tg-nt', 'nt-live-badge');

// ── CONTINUE READING ─────────────────────────────────────────────────────
(function() {
  var KEY = 'sdw_recent';
  try {
    var hist = JSON.parse(localStorage.getItem(KEY) || '[]');
    if (!hist.length) return;
    var bar = document.getElementById('continue-bar');
    var chips = document.getElementById('continue-chips');
    var ctaContinue = document.getElementById('cta-continue');
    var ctaBegin = document.getElementById('cta-begin');
    if (!bar || !chips) return;
    hist.forEach(function(item) {
      var a = document.createElement('a');
      a.href = item.url; a.className = 'continue-chip'; a.textContent = item.label || ((item.title || '') + (item.subtitle ? ' · ' + item.subtitle.slice(0,30) : ''));
      chips.appendChild(a);
    });
    bar.style.display = 'block';
    if (ctaContinue && ctaBegin) {
      ctaContinue.href = hist[0].url;
      ctaContinue.style.display = '';
      ctaBegin.style.display = 'none';
    }
  } catch(e) {}
})();
