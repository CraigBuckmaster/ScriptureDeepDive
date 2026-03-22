// person-sidebar.js — Right-slide biography sidebar
// Opens from search results and chapter people-panel names.
// Lazy-loads people-data.js on first use. Family links chain within sidebar.
(function() {
'use strict';
var ERA_LABELS = {primeval:'Primeval History',patriarch:'Patriarchal Period',exodus:'Egypt & Exodus',judges:'Conquest & Judges',kingdom:'United Kingdom',prophets:'Divided Kingdom & Prophets',exile:'Exile & Return',nt:'New Testament'};
var _fullData = null, _loading = false, _overlayEl = null, _history = [];

function bp() {
  var p = window.location.pathname;
  if (p.endsWith('/index.html') || p.endsWith('/') || p.indexOf('/ot/') === -1 && p.indexOf('/nt/') === -1) return '';
  return '../../';
}

function ensureFullData(cb) {
  if (_fullData) return cb(_fullData);
  if (_loading) { var chk = setInterval(function() { if (_fullData) { clearInterval(chk); cb(_fullData); } }, 50); return; }
  _loading = true;
  var s = document.createElement('script'); s.src = bp() + 'js/pages/people-data.js';
  s.onload = function() { _fullData = window.PEOPLE || []; _loading = false; cb(_fullData); };
  s.onerror = function() { _loading = false; };
  document.head.appendChild(s);
}

function findById(id) { if (!_fullData) return null; for (var i = 0; i < _fullData.length; i++) { if (_fullData[i].id === id) return _fullData[i]; } return null; }

function findByName(name) {
  if (!_fullData) return null;
  var nl = name.toLowerCase().trim();
  for (var i = 0; i < _fullData.length; i++) { if (_fullData[i].name.toLowerCase() === nl) return _fullData[i]; }
  for (var j = 0; j < _fullData.length; j++) { if (nl.indexOf(_fullData[j].name.toLowerCase()) > -1) return _fullData[j]; }
  return null;
}

function famHtml(person) {
  var items = [];
  function add(label, tid) {
    if (!tid) return; var t = findById(tid); if (!t) return;
    items.push('<div class="person-sidebar-family-item"><span class="fam-label">' + label + '</span><span class="person-sidebar-family-link" data-person-id="' + t.id + '">' + t.name + ' &#8599;</span></div>');
  }
  add('Father', person.father); add('Mother', person.mother);
  if (person.spouseOf) add('Spouse', person.spouseOf);
  if (_fullData) {
    for (var i = 0; i < _fullData.length; i++) {
      if (_fullData[i].spouseOf === person.id && _fullData[i].id !== (person.spouseOf || '')) add('Spouse', _fullData[i].id);
    }
    var ch = _fullData.filter(function(p) { return p.father === person.id || p.mother === person.id; });
    for (var c = 0; c < ch.length && c < 8; c++) add('Child', ch[c].id);
  }
  if (!items.length) return '';
  return '<div class="person-sidebar-section"><div class="person-sidebar-section-label">Family</div><div class="person-sidebar-family">' + items.join('') + '</div></div>';
}

function render(person) {
  var era = person.era || '', eraLabel = ERA_LABELS[era] || era, b = bp();
  var h = '<div class="person-sidebar-era-bar" data-era="' + era + '"></div>';
  h += '<button class="person-sidebar-back' + (_history.length > 0 ? ' visible' : '') + '" onclick="PersonSidebar._goBack()">&#8592; Back</button>';
  h += '<div class="person-sidebar-header"><div class="person-sidebar-title-block">';
  h += '<div class="person-sidebar-name">' + person.name + '</div>';
  h += '<div class="person-sidebar-role">' + (person.role || '') + '</div>';
  h += '<div class="person-sidebar-meta">' + (person.dates ? '<span>' + person.dates + '</span>' : '') + '<span class="person-sidebar-era-label">' + eraLabel + '</span></div>';
  h += '</div><button class="person-sidebar-close" onclick="PersonSidebar.close()">&times;</button></div>';
  h += '<div class="person-sidebar-body">';
  if (person.bio) h += '<div class="person-sidebar-section"><div class="person-sidebar-section-label">Biography</div><div class="person-sidebar-bio">' + person.bio + '</div></div>';
  if (person.scriptureRole) h += '<div class="person-sidebar-section"><div class="person-sidebar-section-label">Role in Scripture</div><div class="person-sidebar-scripture-role">' + person.scriptureRole + '</div></div>';
  h += famHtml(person);
  if (person.refs && person.refs.length) {
    h += '<div class="person-sidebar-section"><div class="person-sidebar-section-label">Key References</div><div class="person-sidebar-refs">';
    for (var i = 0; i < person.refs.length; i++) h += '<span class="person-sidebar-ref">' + person.refs[i] + '</span>';
    h += '</div></div>';
  }
  if (person.chapter) h += '<div class="person-sidebar-section"><a href="' + b + person.chapter + '" class="person-sidebar-chapter-link">&#128214; Open Chapter &rarr;</a></div>';
  h += '</div>';
  return h;
}

function getOverlay() {
  if (_overlayEl) return _overlayEl;
  var el = document.createElement('div'); el.className = 'person-sidebar-overlay';
  el.innerHTML = '<div class="person-sidebar"></div>';
  el.addEventListener('click', function(e) { if (e.target === el) close(); });
  el.addEventListener('click', function(e) {
    var link = e.target.closest('.person-sidebar-family-link');
    if (link) { var tid = link.getAttribute('data-person-id'); if (tid) navigateTo(tid); }
  });
  document.body.appendChild(el); _overlayEl = el; return el;
}

function open(personId) {
  _history = [];
  var ov = getOverlay(), panel = ov.querySelector('.person-sidebar');
  panel.innerHTML = '<div class="person-sidebar-loading">Loading biography\u2026</div>';
  ov.classList.add('open'); document.body.style.overflow = 'hidden';
  ensureFullData(function() {
    var p = findById(personId);
    if (!p) { panel.innerHTML = '<div class="person-sidebar-loading">Person not found.</div>'; return; }
    panel.innerHTML = render(p); panel.scrollTop = 0;
  });
}

function navigateTo(personId) {
  var ov = getOverlay(), panel = ov.querySelector('.person-sidebar');
  var curName = panel.querySelector('.person-sidebar-name');
  if (curName && _fullData) {
    for (var i = 0; i < _fullData.length; i++) {
      if (_fullData[i].name === curName.textContent) { _history.push(_fullData[i].id); break; }
    }
  }
  var p = findById(personId); if (!p) return;
  panel.innerHTML = render(p); panel.scrollTop = 0;
}

function goBack() {
  if (!_history.length) return;
  var prevId = _history.pop(), ov = getOverlay(), panel = ov.querySelector('.person-sidebar');
  var p = findById(prevId); if (!p) return;
  panel.innerHTML = render(p); panel.scrollTop = 0;
}

function close() { if (_overlayEl) _overlayEl.classList.remove('open'); document.body.style.overflow = ''; _history = []; }

function openByName(name) {
  _history = [];
  var ov = getOverlay(), panel = ov.querySelector('.person-sidebar');
  panel.innerHTML = '<div class="person-sidebar-loading">Loading biography\u2026</div>';
  ov.classList.add('open'); document.body.style.overflow = 'hidden';
  ensureFullData(function() {
    var p = findByName(name);
    if (!p) { panel.innerHTML = '<div class="person-sidebar-loading">No biography found for \u201c' + name + '\u201d.</div>'; return; }
    panel.innerHTML = render(p); panel.scrollTop = 0;
  });
}

function initChapterPeopleLinks() {
  document.querySelectorAll('.person-card .person-name').forEach(function(el) {
    if (el.classList.contains('person-name-linked') || el.querySelector('.person-name-link')) return;
    el.classList.add('person-name-linked');
    var nameText = el.childNodes[0] ? el.childNodes[0].textContent.trim() : el.textContent.trim();
    if (!nameText) return;
    var span = document.createElement('span'); span.className = 'person-name-link'; span.textContent = nameText; span.title = 'View biography';
    span.addEventListener('click', function(e) { e.stopPropagation(); openByName(nameText); });
    if (el.childNodes[0] && el.childNodes[0].nodeType === 3) el.replaceChild(span, el.childNodes[0]);
    else el.insertBefore(span, el.firstChild);
  });
}

// Auto-init
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initChapterPeopleLinks);
else initChapterPeopleLinks();

// Inject CSS
(function() { var l = document.createElement('link'); l.rel = 'stylesheet'; l.href = bp() + 'css/person-sidebar.css'; document.head.appendChild(l); })();

// Escape key
document.addEventListener('keydown', function(e) { if (e.key === 'Escape' && _overlayEl && _overlayEl.classList.contains('open')) close(); });

window.PersonSidebar = { open: open, openByName: openByName, close: close, _goBack: goBack, initChapterPeopleLinks: initChapterPeopleLinks };
})();
