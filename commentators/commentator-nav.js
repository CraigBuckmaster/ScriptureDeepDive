// commentator-nav.js — shared scholar bio page UI
// Requires: scholar-data.js loaded first (provides window.SCHOLAR_DATA)
// Each page sets window.CURRENT_SCHOLAR = 'key' before loading this script.
// Builds: 1) dropdown nav, 2) "Other Scholars" grid at bottom

(function() {
  var SCHOLARS = window.SCHOLAR_DATA || [];
  var cur = window.CURRENT_SCHOLAR || '';
  var curScholar = null;
  for (var i = 0; i < SCHOLARS.length; i++) {
    if (SCHOLARS[i].key === cur) { curScholar = SCHOLARS[i]; break; }
  }

  // Inject CSS
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
    '.com-nav-dd-dismiss.open{display:block;}' +
    '.bio-others{margin-top:3rem;padding-top:2rem;border-top:1px solid var(--border);}' +
    '.bio-others-title{font-family:"Source Sans 3",sans-serif;font-size:.68rem;letter-spacing:.2em;text-transform:uppercase;color:var(--text-muted);margin-bottom:1rem;}' +
    '.bio-others-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:.6rem;}' +
    '.bio-other-card{display:flex;flex-direction:column;align-items:center;gap:.25rem;padding:.7rem .5rem;background:rgba(255,255,255,.02);border:1px solid var(--border);border-radius:4px;text-decoration:none;transition:background .15s,border-color .15s;}' +
    '.bio-other-card:hover{background:rgba(255,255,255,.05);border-color:var(--other-accent);}' +
    '.bio-other-name{font-family:"Cinzel",serif;font-size:.6rem;letter-spacing:.1em;text-transform:uppercase;color:var(--other-accent);}' +
    '.bio-other-desc{font-family:"Source Sans 3",sans-serif;font-size:.58rem;color:var(--text-muted);}';
  document.head.appendChild(style);

  // Build dropdown nav
  var nav = document.getElementById('com-nav');
  if (nav) {
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
    trigger.addEventListener('click', function() {
      toggle();
      if (panel.classList.contains('open')) {
        var c = panel.querySelector('.current');
        if (c) setTimeout(function(){ c.scrollIntoView({block:'center'}); }, 50);
      }
    });
    dismiss.addEventListener('click', close);
  }

  // Build "Other Scholars" grid
  var target = document.getElementById('bio-others-target');
  if (target) {
    var cards = '';
    for (var k = 0; k < SCHOLARS.length; k++) {
      var sc = SCHOLARS[k];
      if (sc.key === cur) continue;
      cards += '<a href="' + sc.key + '.html" class="bio-other-card" style="--other-accent:' + sc.color + '">' +
        '<span class="bio-other-name">' + sc.name + '</span>' +
        '<span class="bio-other-desc">' + sc.scope + '</span></a>';
    }
    target.innerHTML = '<p class="bio-others-title">Other Scholars</p>' +
      '<div class="bio-others-grid">' + cards + '</div>';
  }
})();
