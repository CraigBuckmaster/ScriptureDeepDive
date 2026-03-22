// search-engine.js — Unified search logic for ScriptureDeepDive
// Pure functions: takes a query string, returns structured results.
// Consumed by homepage.js and qnav.js. No DOM access.
(function() {
'use strict';

var ERA_LABELS = {
  primeval:'Primeval History', patriarch:'Patriarchal Period', exodus:'Egypt & Exodus',
  judges:'Conquest & Judges', kingdom:'United Kingdom', prophets:'Divided Kingdom & Prophets',
  exile:'Exile & Return', nt:'New Testament'
};

function escapeRx(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

function highlight(text, fullQuery, words) {
  var out = text;
  if (fullQuery.length > 2) {
    var rx = new RegExp('(' + escapeRx(fullQuery) + ')', 'gi');
    out = out.replace(rx, '<em>$1</em>');
  }
  for (var i = 0; i < words.length; i++) {
    if (!out.toLowerCase().includes('<em>' + words[i])) {
      var rx2 = new RegExp('(' + escapeRx(words[i]) + ')', 'gi');
      out = out.replace(rx2, '<em>$1</em>');
    }
  }
  return out;
}

function searchChapters(ql, words) {
  if (ql.length < 2) return [];
  var chapters = window.CHAPTERS_ALL || [];
  return chapters.filter(function(c) {
    var refLow = c.ref.toLowerCase();
    var titlesLow = c.titles.map(function(t) { return t.toLowerCase(); }).join(' ');
    var ctxLow = (c.ctx || '').toLowerCase();
    if (refLow.indexOf(ql) > -1) return true;
    if (words.length >= 2 && words.every(function(w) { return titlesLow.indexOf(w) > -1 || ctxLow.indexOf(w) > -1; })) return true;
    if (words.length === 1 && words[0].length >= 4 && titlesLow.indexOf(words[0]) > -1) return true;
    return false;
  }).slice(0, 8);
}

function searchVerses(ql, words, opts) {
  if (ql.length < 3) return [];
  var max = (opts && opts.maxResults) || 12;
  return (window.VERSES_ALL || []).map(function(v) {
    var textLow = v.text.toLowerCase(), refLow = v.ref.toLowerCase(), score = 0;
    for (var i = 0; i < words.length; i++) {
      if (textLow.indexOf(words[i]) > -1) score += (words[i].length >= 5 ? 3 : 2);
      else if (refLow.indexOf(words[i]) > -1) score += 1;
    }
    if (textLow.indexOf(ql) > -1) score += 6;
    if (refLow === ql) score += 10;
    return { ref: v.ref, short: v.short, text: v.text, url: v.url, score: score };
  }).filter(function(v) { return v.score > 0; })
    .sort(function(a, b) { return b.score - a.score; })
    .slice(0, max);
}

function searchPeople(ql, words) {
  if (ql.length < 2) return [];
  var index = window.PEOPLE_INDEX || [];
  return index.map(function(p) {
    var nameLow = p.name.toLowerCase(), roleLow = p.role.toLowerCase();
    var score = 0;
    if (nameLow === ql) score += 20;
    else if (nameLow.indexOf(ql) === 0) score += 12;
    else if (nameLow.indexOf(ql) > -1) score += 8;
    for (var i = 0; i < words.length; i++) {
      if (nameLow.indexOf(words[i]) > -1) score += 5;
      else if (roleLow.indexOf(words[i]) > -1) score += 2;
    }
    if ((nameLow + ' ' + roleLow).indexOf(ql) > -1 && ql.length > 3) score += 4;
    return { id: p.id, name: p.name, role: p.role, era: p.era, dates: p.dates, score: score };
  }).filter(function(p) { return p.score > 0; })
    .sort(function(a, b) { return b.score - a.score; })
    .slice(0, 8);
}

function search(query, opts) {
  var q = (query || '').trim();
  if (!q) return { query: q, ql: '', words: [], books: [], chapters: [], verses: [], people: [] };
  var ql = q.toLowerCase();
  var words = ql.split(/\s+/).filter(function(w) { return w.length > 1; });
  opts = opts || {};
  return {
    query: q, ql: ql, words: words,
    books: [],
    chapters: searchChapters(ql, words),
    verses: searchVerses(ql, words, { maxResults: opts.maxVerses || 12 }),
    people: searchPeople(ql, words)
  };
}

window.SearchEngine = { search: search, highlight: highlight, ERA_LABELS: ERA_LABELS };
})();
