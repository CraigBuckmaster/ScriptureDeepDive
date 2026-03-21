// commentator-nav.js — shared scholar bio navigation
// Auto-injected dropdown nav for commentator bio pages.
// Each page sets window.CURRENT_SCHOLAR = 'key' before loading this script.
// To add a scholar: add one entry to SCHOLARS below. All pages update automatically.

(function() {
  var SCHOLARS = [
    { key:'alter',     name:'Robert Alter',    color:'#d4a853', scope:'Genesis\u2013Deuteronomy, Ruth, Proverbs' },
    { key:'anderson',  name:'A.A. Anderson',   color:'#c8d0a0', scope:'2 Samuel' },
    { key:'ashley',    name:'Timothy Ashley',  color:'#f0c080', scope:'Numbers' },
    { key:'bergen',    name:'Robert Bergen',   color:'#d8a080', scope:'1\u20132 Samuel' },
    { key:'block',     name:'Daniel Block',    color:'#e0a070', scope:'Judges' },
    { key:'calvin',    name:'John Calvin',     color:'#7ba7cc', scope:'All Books' },
    { key:'catena',    name:'Catena Aurea',    color:'#b888d8', scope:'Gospels' },
    { key:'craigie',   name:'Peter Craigie',   color:'#d8b8f0', scope:'Deuteronomy' },
    { key:'hess',      name:'Richard Hess',    color:'#60d0c0', scope:'Joshua' },
    { key:'howard',    name:'David Howard',    color:'#90b0e0', scope:'Joshua' },
    { key:'hubbard',   name:'Robert Hubbard',  color:'#a8c870', scope:'Ruth' },
    { key:'keener',    name:'Craig Keener',    color:'#a8c8f8', scope:'Acts' },
    { key:'macarthur', name:'John MacArthur',  color:'#e05a6a', scope:'All Books' },
    { key:'marcus',    name:'Joel Marcus',     color:'#70d8d8', scope:'Mark' },
    { key:'milgrom',   name:'Jacob Milgrom',   color:'#78d8a8', scope:'Leviticus\u2013Numbers' },
    { key:'netbible',  name:'NET Bible Notes',  color:'#d8e8d0', scope:'All Books' },
    { key:'provan',    name:'Iain Provan',     color:'#d8c0a0', scope:'1\u20132 Kings' },
    { key:'rhoads',    name:'David Rhoads',    color:'#e8c060', scope:'Mark' },
    { key:'robertson', name:'A.T. Robertson',  color:'#c8d870', scope:'Gospels, Acts' },
    { key:'sarna',     name:'Nahum Sarna',     color:'#4ec9b0', scope:'Genesis\u2013Exodus' },
    { key:'tigay',     name:'Jeffrey Tigay',   color:'#e8d090', scope:'Deuteronomy' },
    { key:'tsumura',   name:'David Tsumura',   color:'#88b8d8', scope:'1 Samuel' },
    { key:'waltke',    name:'Bruce Waltke',    color:'#e8a0b8', scope:'Proverbs' },
    { key:'webb',      name:'Barry Webb',      color:'#90c890', scope:'Judges' },
    { key:'wiseman',   name:'Donald Wiseman',  color:'#b0d8e8', scope:'1\u20132 Kings' }
  ];

  var cur = window.CURRENT_SCHOLAR || '';
  var curScholar = null;
  for (var i = 0; i < SCHOLARS.length; i++) {
    if (SCHOLARS[i].key === cur) { curScholar = SCHOLARS[i]; break; }
  }

  // ── Inject CSS ──────────────────────────────────────────────────────────
  var style = document.createElement('style');
  style.textContent =
    '.com-nav{display:flex;align-items:center;justify-content:space-between;gap:1rem;padding:.7rem 1.5rem;background:var(--bg2);border-bottom:1px solid var(--border);position:sticky;top:0;z-index:100;}' +
    '.com-nav-back,.com-nav-all{font-family:"Source Sans 3",sans-serif;font-size:.72rem;color:var(--gold-dim);text-decoration:none;letter-spacing:.06em;white-space:nowrap;flex-shrink:0;}' +
    '.com-nav-back:hover,.com-nav-all:hover{color:var(--gold);}' +
    '.com-nav-dropdown{position:relative;flex:1;display:flex;justify-content:center;}' +
    '.com-nav-trigger{display:flex;align-items:center;gap:.4rem;background:none;border:1px solid var(--border);border-radius:4px;padding:.35rem .7rem;cursor:pointer;font-family:"Cinzel",serif;font-size:.62rem;letter-spacing:.1em;text-transform:uppercase;color:var(--accent);transition:border-color .15s,background .15s;}' +
    '.com-nav-trigger:hover{border-color:var(--accent);background:rgba(255,255,255,.04);}' +
    '.com-nav-trigger .chev{font-size:.5rem;color:var(--text-muted);transition:transform .2s;}' +
    '.com-nav-trigger.open .chev{transform:rotate(180deg);}' +
    '.com-nav-dd-panel{display:none;position:absolute;top:calc(100% + .5rem);left:50%;transform:translateX(-50%);width:min(320px,90vw);max-height:70vh;overflow-y:auto;overscroll-behavior:contain;background:#0d0b07;border:1px solid var(--border);border-radius:6px;box-shadow:0 8px 32px rgba(0,0,0,.6);z-index:200;-webkit-overflow-scrolling:touch;}' +
    '.com-nav-dd-panel.open{display:block;}' +
    '.com-nav-dd-item{display:flex;align-items:center;gap:.6rem;padding:.55rem .9rem;text-decoration:none;border-bottom:1px solid rgba(58,46,24,.3);transition:background .12s;}' +
    '.com-nav-dd-item:last-child{border-bottom:none;}' +
    '.com-nav-dd-item:hover{background:rgba(255,255,255,.04);}' +
    '.com-nav-dd-item.current{background:rgba(255,255,255,.06);}' +
    '.com-nav-dd-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0;}' +
    '.com-nav-dd-name{font-family:"Cinzel",serif;font-size:.62rem;letter-spacing:.08em;text-transform:uppercase;color:var(--text-dim);flex:1;}' +
    '.com-nav-dd-item.current .com-nav-dd-name{color:var(--text);}' +
    '.com-nav-dd-scope{font-family:"Source Sans 3",sans-serif;font-size:.62rem;color:var(--text-muted);white-space:nowrap;}' +
    '.com-nav-dd-dismiss{display:none;position:fixed;inset:0;z-index:199;}' +
    '.com-nav-dd-dismiss.open{display:block;}';
  document.head.appendChild(style);

  // ── Build nav HTML ──────────────────────────────────────────────────────
  var nav = document.getElementById('com-nav');
  if (!nav) return;

  var triggerLabel = curScholar ? curScholar.name : 'Select Scholar';
  var items = '';
  for (var j = 0; j < SCHOLARS.length; j++) {
    var s = SCHOLARS[j];
    var cls = s.key === cur ? 'com-nav-dd-item current' : 'com-nav-dd-item';
    items += '<a href="' + s.key + '.html" class="' + cls + '">' +
      '<span class="com-nav-dd-dot" style="background:' + s.color + '"></span>' +
      '<span class="com-nav-dd-name">' + s.name + '</span>' +
      '<span class="com-nav-dd-scope">' + s.scope + '</span></a>';
  }

  nav.innerHTML =
    '<a href="../index.html" class="com-nav-back">&#8592; Library</a>' +
    '<div class="com-nav-dropdown">' +
      '<button class="com-nav-trigger">' + triggerLabel + ' <span class="chev">&#9660;</span></button>' +
      '<div class="com-nav-dd-panel">' + items + '</div>' +
      '<div class="com-nav-dd-dismiss"></div>' +
    '</div>' +
    '<a href="index.html" class="com-nav-all">All Scholars</a>';

  // ── Toggle logic ────────────────────────────────────────────────────────
  var trigger = nav.querySelector('.com-nav-trigger');
  var panel   = nav.querySelector('.com-nav-dd-panel');
  var dismiss = nav.querySelector('.com-nav-dd-dismiss');

  function toggle() {
    var open = panel.classList.toggle('open');
    trigger.classList.toggle('open', open);
    dismiss.classList.toggle('open', open);
  }
  function close() {
    panel.classList.remove('open');
    trigger.classList.remove('open');
    dismiss.classList.remove('open');
  }
  trigger.addEventListener('click', toggle);
  dismiss.addEventListener('click', close);

  // Scroll current into view when opened
  trigger.addEventListener('click', function() {
    if (panel.classList.contains('open')) {
      var c = panel.querySelector('.current');
      if (c) setTimeout(function(){ c.scrollIntoView({block:'center'}); }, 50);
    }
  });
})();
