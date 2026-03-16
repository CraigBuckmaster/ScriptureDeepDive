"""Scripture Deep Dive — unified shared helpers. All books use this."""
import re, json, math, os

_REPO = '/home/claude/ScriptureDeepDive'

def _bootstrap():
    """Extract CSS and JS directly from Genesis_1.html — single source of truth."""
    with open(f'{_REPO}/genesis/Genesis_1.html') as f:
        g = f.read()
    scripts = re.findall(r'<script[^>]*>(.*?)</script>', g, re.DOTALL)
    css = g[g.find('<style>')+7:g.find('</style>')]
    tog_js  = '<script>' + scripts[0] + '</script>'
    qnav_js = next(('<script>'+s+'</script>' for s in scripts if 'verseMatches' in s), None)
    sw_js   = '<script>' + scripts[-1] + '</script>'
    return css, tog_js, qnav_js, sw_js

CSS, TOG_JS, QNAV_JS, SW_JS = _bootstrap()

# CSS for panel types added after the original Genesis_1.html template was frozen
EXTRA_CSS = '''
/* ── Textual Notes panel ─────────────────────────────── */
.tx-panel{--tx-bg:#0e1218;--tx-border:#2a4060;--tx-accent:#70b8e8;}
.tx-panel.open{background:var(--tx-bg);border-color:var(--tx-border);}
.tx-panel h4{color:var(--tx-accent);}
.tx-item{margin-bottom:1rem;padding-bottom:1rem;border-bottom:1px solid rgba(42,64,96,.4);}
.tx-item:last-child{border-bottom:none;margin-bottom:0;padding-bottom:0;}
.tx-header{display:flex;align-items:baseline;gap:.6rem;margin-bottom:.35rem;}
.tx-ref{font-family:'Cinzel',serif;font-size:.68rem;color:var(--tx-accent);flex-shrink:0;}
.tx-issue{font-family:'Source Sans 3',sans-serif;font-size:.78rem;font-weight:600;color:#c0d8f0;}
.tx-variants{font-family:'Source Sans 3',sans-serif;font-size:.8rem;color:#b0c8e0;line-height:1.6;margin-bottom:.3rem;}
.tx-sig{font-family:'EB Garamond',serif;font-size:.88rem;color:#90a8c0;font-style:italic;line-height:1.5;}
.tx-ms{font-family:'Cinzel',serif;font-size:.65rem;color:#c9a84c;background:rgba(201,168,76,.1);
       padding:.05rem .3rem;border-radius:2px;margin-right:.2rem;}
.tx-lxx{font-family:'Cinzel',serif;font-size:.65rem;color:#70b8e8;background:rgba(112,184,232,.1);
        padding:.05rem .3rem;border-radius:2px;margin-right:.2rem;}
.anno-trigger.textual{color:#70b8e8;border-color:#2a4060;background:rgba(42,64,96,.12);}

/* ── Scholarly Debates panel ─────────────────────────── */
.db-panel{--db-bg:#120d18;--db-border:#3a2060;--db-accent:#a870e8;}
.db-panel.open{background:var(--db-bg);border-color:var(--db-border);}
.db-panel h4{color:var(--db-accent);}
.db-debate{margin-bottom:1.2rem;padding-bottom:1.2rem;border-bottom:1px solid rgba(58,32,96,.4);}
.db-debate:last-child{border-bottom:none;margin-bottom:0;padding-bottom:0;}
.db-title{font-family:'Cinzel',serif;font-size:.78rem;color:var(--db-accent);
          letter-spacing:.05em;margin-bottom:.6rem;}
.db-positions{display:flex;flex-direction:column;gap:.5rem;margin-bottom:.6rem;}
.db-position{background:rgba(58,32,96,.15);border:1px solid rgba(58,32,96,.3);
             border-radius:4px;padding:.5rem .7rem;}
.db-pos-name{font-family:'Source Sans 3',sans-serif;font-size:.75rem;font-weight:700;
             color:#c8a8f0;margin-bottom:.15rem;}
.db-proponents{font-family:'Source Sans 3',sans-serif;font-size:.68rem;color:#8868a8;
               font-style:italic;margin-bottom:.25rem;}
.db-argument{font-family:'EB Garamond',serif;font-size:.88rem;color:#b098d0;line-height:1.55;}
.db-synthesis{font-family:'Source Sans 3',sans-serif;font-size:.8rem;color:#a090c0;
              background:rgba(168,112,232,.08);border-left:2px solid var(--db-accent);
              padding:.4rem .6rem;line-height:1.55;}
.anno-trigger.debate{color:#a870e8;border-color:#3a2060;background:rgba(58,32,96,.12);}
'''

REGISTRY = [
    ('genesis',  'Genesis',   50, 50, 'OT'),
    ('exodus',   'Exodus',    40, 40, 'OT'),
    ('ruth',     'Ruth',       4,  4, 'OT'),
    ('proverbs', 'Proverbs',  31, 31, 'OT'),
    ('matthew',  'Matthew',   28, 28, 'NT'),
]

# Short prefix used for auto-generated panel IDs (e.g. gen46-s1-grk)
BOOK_PREFIX = {
    'genesis':  'gen',
    'exodus':   'ex',
    'ruth':     'ru',
    'proverbs': 'pr',
    'matthew':  'mt',
}

# Book-level constants — AUTH text, IS_NT flag, VHL word lists
BOOK_META = {
    'genesis': {
        'is_nt': False,
        'auth': ('<strong>Author:</strong> Moses, according to Jewish and Christian tradition, '
                 'drawing on patriarchal records and divine revelation.\n\n'
                 '<strong>When written:</strong> c.1445-1405 BC during the wilderness period.\n\n'
                 '<strong>What prompted it:</strong> To record God\'s creation of the world and '
                 'his covenant relationship with the patriarchs, culminating in Israel\'s formation as a people.'),
        'vhl_places': ['Egypt','Canaan','Goshen','Bethel','Beersheba','Shechem','Hebron','Jordan','Mamre','Haran'],
        'vhl_people': ['Jacob','Joseph','Israel','Pharaoh','Judah','Benjamin','Reuben','Simeon',
                       'Isaac','Abraham','Sarah','Rebekah','Rachel','Leah','Laban','Esau'],
        'vhl_time':   ['day','days','night','year','years','generation','time','age'],
        'vhl_key':    ['covenant','blessing','promise','God','LORD','Israel','faith','fear','firstborn','seed'],
    },
    'exodus': {
        'is_nt': False,
        'auth': ('<strong>Author:</strong> Moses, according to Jewish and Christian tradition.\n\n'
                 '<strong>When written:</strong> c.1445-1405 BC during the wilderness period.\n\n'
                 '<strong>What prompted it:</strong> To record God\'s redemption of Israel from Egypt '
                 'and the establishment of the covenant at Sinai.'),
        'vhl_places': ['Egypt','Goshen','Sinai','Midian','wilderness','Canaan','mountain','tabernacle','Nile'],
        'vhl_people': ['Moses','Aaron','Pharaoh','LORD','Miriam','Joshua','Bezalel','Israel','Israelites'],
        'vhl_time':   ['day','days','night','morning','year','generation','Sabbath','Passover'],
        'vhl_key':    ['covenant','commandment','law','holy','glory','tabernacle','sacrifice',
                       'redeem','deliver','sign','wonder','plague'],
    },
    'ruth': {
        'is_nt': False,
        'auth': ('<strong>Author:</strong> Unknown; Jewish tradition attributes authorship to Samuel.\n\n'
                 '<strong>When written:</strong> c.1000 BC, possibly early monarchy period.\n\n'
                 '<strong>What prompted it:</strong> To record God\'s providential care for a Moabite widow '
                 'and her mother-in-law, and to trace the lineage of King David.'),
        'vhl_places': ['Bethlehem','Moab','field','gate','threshing floor'],
        'vhl_people': ['Ruth','Naomi','Boaz','Orpah','LORD','redeemer','kinsman'],
        'vhl_time':   ['day','days','harvest','night','morning'],
        'vhl_key':    ['kindness','hesed','redeemer','covenant','blessing','LORD','loyal','faithful'],
    },
    'proverbs': {
        'is_nt': False,
        'auth': ('<strong>Author:</strong> Primarily Solomon son of David (chs.1-29), with additional '
                 'contributions from Agur son of Jakeh (ch.30) and King Lemuel\'s mother (ch.31).\n\n'
                 '<strong>When written:</strong> Core Solomonic material c.970-930 BC; final compilation '
                 'under Hezekiah c.715-686 BC.\n\n'
                 '<strong>What prompted it:</strong> To transmit the accumulated wisdom of Israel\'s sages '
                 'to the next generation -- teaching the fear of the LORD as the foundation of all genuine wisdom.'),
        'vhl_places': ['gate','city','market','field','house','street','court','path','way'],
        'vhl_people': ['LORD','king','fool','wise','righteous','wicked','poor','rich','son','wife','neighbour'],
        'vhl_time':   ['day','days','morning','evening','year','life','age','generation'],
        'vhl_key':    ['wisdom','knowledge','understanding','fear','righteous','wicked',
                       'heart','tongue','mouth','honour','pride','humility'],
    },
    'matthew': {
        'is_nt': True,
        'auth': ('<strong>Author:</strong> Matthew (Levi), tax collector and apostle.\n\n'
                 '<strong>When written:</strong> c.AD 80-90, Antioch of Syria.\n\n'
                 '<strong>What prompted it:</strong> To present Jesus as the fulfilment of '
                 'Israel\'s Scripture and the promised Messiah, written primarily for a Jewish audience.'),
        'vhl_places': ['Jerusalem','Bethany','Gethsemane','Golgotha','temple','Mount of Olives',
                       'Galilee','Capernaum','Nazareth','Jordan'],
        'vhl_people': ['Jesus','disciples','Pharisees','chief priests','Pilate','Judas','Peter',
                       'scribes','crowd','elders','John'],
        'vhl_time':   ['day','days','night','morning','third day','hour','age','coming','generation'],
        'vhl_key':    ['kingdom','covenant','blood','resurrection','Son of Man','Son of God',
                       'authority','judgment','forgive','fulfil','law','gospel'],
    },
}

def auth_sections(text):
    parts = re.split(r'<strong>(Author:|When written:|What prompted it:)</strong>', text)
    if len(parts) < 4:
        return f'<div class="auth-section"><p class="auth-text">{text}</p></div>'
    html = ''
    for i in range(1, len(parts), 2):
        label = parts[i].rstrip(':')
        body  = parts[i+1].strip().lstrip('\n').strip() if i+1 < len(parts) else ''
        html += (f'<div class="auth-section"><span class="auth-label">{label}</span>'
                 f'<p class="auth-text">{body}</p></div>\n')
    return html

def qnav_overlay(current_book_dir, current_ch):
    def ch_links(d, n, total, live, cur_book, cur_ch):
        html = ''
        for i in range(1, total+1):
            is_cur = (d == cur_book and i == cur_ch)
            if i <= live:
                cls = 'qnav-ch-btn live' + (' current' if is_cur else '')
                html += f'<a href="../{d}/{n}_{i}.html" class="{cls}">Ch {i}</a>'
            else:
                html += f'<span class="qnav-ch-btn coming">Ch {i}</span>'
        return html
    def book_div(d, n, total, live, cur_book, cur_ch):
        is_open = (d == cur_book)
        cls = ' open' if is_open else ''
        links = ch_links(d, n, total, live, cur_book, cur_ch)
        return (f'<div class="qnav-book{cls}" id="qnav-book-{d}">'
                f'<button class="qnav-book-btn" onclick="qnavToggleBook(\'{d}\')">'
                f'<span class="qnav-book-name"><span class="qnav-live-dot"></span>{n}</span>'
                f'<span class="qnav-book-meta"><span class="qnav-book-chev">&#9660;</span></span>'
                f'</button><div class="qnav-ch-grid">{links}</div></div>')
    ot_books = ''.join(book_div(d,n,t,l,current_book_dir,current_ch) for d,n,t,l,test in REGISTRY if test=='OT')
    nt_books = ''.join(book_div(d,n,t,l,current_book_dir,current_ch) for d,n,t,l,test in REGISTRY if test=='NT')
    cur_test = next((test for d,n,t,l,test in REGISTRY if d==current_book_dir), 'OT')
    ot_open = ' open' if cur_test == 'OT' else ''
    nt_open = ' open' if cur_test == 'NT' else ''
    return f'''<div class="qnav-overlay" id="qnav-overlay">
<div class="qnav-panel">
<div class="qnav-header">
<div class="qnav-search-wrap"><span class="qnav-search-icon">&#128269;</span><input class="qnav-search" id="qnav-search-input" placeholder="Search books..." oninput="qnavFilter(this.value)"></div>
<button class="qnav-close" onclick="closeQnav()">Close</button>
</div>
<div class="qnav-body">
<div class="qnav-search-results" id="qnav-search-results" style="display:none"></div>
<div class="qnav-testament{ot_open}" id="qnav-t-ot">
<button class="qnav-testament-btn" onclick="qnavToggleTestament('ot')">
<span class="qnav-testament-label">Old Testament</span>
<span class="qnav-testament-chev">&#9660;</span>
</button>
<div class="qnav-testament-books">{ot_books}</div>
</div>
<div class="qnav-testament{nt_open}" id="qnav-t-nt">
<button class="qnav-testament-btn" onclick="qnavToggleTestament('nt')">
<span class="qnav-testament-label">New Testament</span>
<span class="qnav-testament-chev">&#9660;</span>
</button>
<div class="qnav-testament-books">{nt_books}</div>
</div>
</div>
</div>
<div class="qnav-dismiss" onclick="closeQnav()"></div>
</div>'''

def vhl_js(places=None, people=None, time_words=None, key_words=None):
    divine = ['God','LORD','Spirit','Angel','Lord','Holy Spirit','Father','Son','I AM','Almighty','Shaddai']
    pl = places    or []
    pp = people    or []
    tw = time_words or ['day','days','night','morning','evening','year','years','month','generation']
    kw = key_words  or []
    def js_list(lst):
        return '[' + ','.join(f"'{w}'" for w in lst) + ']'
    return f'''<script>
(function(){{
  var DIVINE={{words:{js_list(divine)},cls:'vhl-divine',btn:['hebrew','hebrew-text','context']}};
  var PLACES={{words:{js_list(pl)},cls:'vhl-place',btn:['places','context']}};
  var PEOPLE={{words:{js_list(pp)},cls:'vhl-person',btn:['people','context']}};
  var TIME  ={{words:{js_list(tw)},cls:'vhl-time',btn:['timeline','context']}};
  var KEY   ={{words:{js_list(kw)},cls:'vhl-key',btn:['literary','cross']}};
  var GROUPS=[DIVINE,PLACES,PEOPLE,TIME,KEY];
  function hasBtnType(row,types){{return types.some(function(t){{return row.querySelector('.anno-trigger.'+t);}});}}
  var vhlRowId=0;
  function highlightNode(node,word,cls,btns,row){{
    if(node.nodeType===3){{
      var nv=node.nodeValue,idx=nv.indexOf(word);
      if(idx===-1)return;
      var b=nv[idx-1],a=nv[idx+word.length];
      if((b!==undefined&&/[\\w]/.test(b))||(a!==undefined&&/[\\w]/.test(a)))return;
      var after=node.splitText(idx);after.splitText(word.length);
      var sp=document.createElement('span');sp.className='vhl '+cls;
      if(btns&&row){{
        if(!row.dataset.vhlId){{row.dataset.vhlId=++vhlRowId;row.setAttribute('data-vhl-id',vhlRowId);}}
        sp.setAttribute('data-btn',btns.join(','));
        sp.setAttribute('data-row',row.dataset.vhlId);
      }}
      after.parentNode.replaceChild(sp,after);sp.appendChild(document.createTextNode(word));
    }} else if(node.nodeType===1&&!node.classList.contains('verse-num')&&node.tagName!=='BUTTON'&&!node.classList.contains('vhl')){{
      var kids=[].slice.call(node.childNodes);
      kids.forEach(function(c){{highlightNode(c,word,cls,btns,row);}});
    }}
  }}
  document.querySelectorAll('.btn-row').forEach(function(row){{
    var vt=row.previousElementSibling;
    while(vt&&!vt.classList.contains('verse-text'))vt=vt.previousElementSibling;
    if(!vt)return;
    GROUPS.forEach(function(g){{
      if(!hasBtnType(row,g.btn))return;
      g.words.forEach(function(w){{highlightNode(vt,w,g.cls,g.btn,row);}});
    }});
  }});
  document.addEventListener('click',function(e){{
    var sp=e.target.closest?e.target.closest('.vhl[data-btn]'):null;
    if(!sp)return;
    var rowId=sp.getAttribute('data-row');
    if(!rowId)return;
    var row=document.querySelector('.btn-row[data-vhl-id="'+rowId+'"]');
    if(!row)return;
    var types=(sp.getAttribute('data-btn')||'').split(',');
    var btn=null;
    for(var i=0;i<types.length;i++){{btn=row.querySelector('.anno-trigger.'+types[i]);if(btn)break;}}
    if(!btn)return;
    var oc=btn.getAttribute('onclick')||'';
    var m=oc.match(/'([^']+)'/);
    var panelId=m?m[1]:null;
    if(!panelId)return;
    sp.classList.remove('vhl-pulse');void sp.offsetWidth;sp.classList.add('vhl-pulse');
    tog(btn,panelId);
    var panel=document.getElementById(panelId);
    if(panel&&panel.classList.contains('open')){{
      setTimeout(function(){{panel.scrollIntoView({{behavior:'smooth',block:'nearest'}});}},80);
    }}
  }});
}})();
</script>'''

HISTORY_JS = '''<script>
(function(){
  try {
    var KEY='sdw_recent', MAX=5;
    var hist = JSON.parse(localStorage.getItem(KEY)||'[]');
    var parts=window.location.pathname.split('/'); var url=parts.slice(-2).join('/');
    var title = document.querySelector('h1') ? document.querySelector('h1').textContent.trim() : '';
    var subtitle = document.querySelector('header p') ? document.querySelector('header p').textContent.trim() : '';
    var label = title + (subtitle ? ' \xb7 ' + subtitle.slice(0,30) : '');
    hist = hist.filter(function(h){ return h.url !== url; });
    hist.unshift({url:url, label:label, title:title, subtitle:subtitle});
    if(hist.length > MAX) hist = hist.slice(0,MAX);
    localStorage.setItem(KEY, JSON.stringify(hist));
  } catch(e){}
})();
</script>'''

def head(book_name, book_dir, ch, is_nt=False):
    rec = next((r for r in REGISTRY if r[0]==book_dir), None)
    live = rec[3] if rec else ch
    prev = (f'<a href="{book_name}_{ch-1}.html" class="nav-arrow">&#8592;</a>'
            if ch > 1 else '<span class="nav-arrow disabled">&#8592;</span>')
    nxt  = (f'<a href="{book_name}_{ch+1}.html" class="nav-arrow">&#8594;</a>'
            if ch < live else '<span class="nav-arrow disabled">&#8594;</span>')
    nav = f'''<nav class="chapter-nav">
<a href="../index.html" class="nav-back"><svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9,2 4,7 9,12"/></svg>Library</a>
<div class="nav-center"><span class="nav-book">{book_name}</span><span class="nav-chapter">Chapter {ch}</span></div>
<div class="nav-arrows">{prev}<button onclick="openQnav()" style="display:flex;align-items:center;justify-content:center;width:34px;height:34px;border-radius:4px;border:1px solid var(--border);background:rgba(255,255,255,.04);color:var(--gold);cursor:pointer;font-size:.85rem;" aria-label="Search">&#128269;</button>{nxt}</div>
</nav>'''
    return f'''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
<title>{book_name} {ch} — Scripture Walkthrough</title>
<link rel="manifest" href="../manifest.json">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="Scripture">
<meta name="theme-color" content="#0c0a07">
<link rel="apple-touch-icon" href="../icon-192.png">
<link href="https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Cinzel:wght@400;600&family=Source+Sans+3:wght@300;400;500&display=swap" rel="stylesheet">
<style>
{CSS}
{EXTRA_CSS}
</style>
</head>
<body>
{nav}'''

def legend(is_nt=False):
    lang = 'Greek' if is_nt else 'Hebrew'
    return f'''<div class="legend">
<div class="legend-item"><div class="legend-dot dot-hebrew"></div>{lang}</div>
<div class="legend-item"><div class="legend-dot dot-history"></div>Historical</div>
<div class="legend-item"><div class="legend-dot dot-context"></div>Context</div>
<div class="legend-item"><div class="legend-dot dot-cross"></div>Cross-Ref</div>
<div class="legend-item"><div class="legend-dot dot-places"></div>Places</div>
<div class="legend-item"><div class="legend-dot dot-timeline"></div>Timeline</div>
</div>'''

def chapter_header(book_name, ch, title, auth_text, is_nt=False):
    return f'''<header>
<h1>{book_name} {ch}</h1>
<p>{title}</p>
</header>
{legend(is_nt)}
<div class="authorship-block">
<button class="authorship-toggle" onclick="toggleAuth(this)"><span>Authorship &amp; Dating</span><span class="chev">&#9660;</span></button>
<div class="authorship-content">{auth_sections(auth_text)}</div>
</div>'''

def btn_row(*btns):
    inner = ''.join(
        f'<button class="anno-trigger {cls}" onclick="tog(this,\'{pid}\')"><span>{lbl}</span><span class="chev">&#9660;</span></button>'
        for cls, lbl, pid in btns)
    return f'<div class="btn-row">{inner}</div>'

def verse(num, text):
    return f'<span class="verse-text"><span class="verse-num">{num}</span>{text}</span>'

def heb_panel(pid, words, is_nt=False):
    label = 'Greek Word Study' if is_nt else 'Hebrew Word Study'
    rows = ''.join(f'<p><span class="hebrew-word">{h}</span> <span class="tlit">{t}</span> — <strong>{g}</strong>: {n}</p>' for h,t,g,n in words)
    return f'<div id="{pid}" class="anno-panel heb"><h4>{label}</h4>{rows}</div>'

def hist_panel(pid, text):
    return f'<div id="{pid}" class="anno-panel hist"><h4>Historical Context</h4><p>{text}</p></div>'

def ctx_panel(pid, text):
    return f'<div id="{pid}" class="anno-panel ctx"><h4>Context</h4><p>{text}</p></div>'

def cross_panel(pid, refs):
    items = ''.join(f'<li><span class="ref-cite">{c}</span><span class="ref-text">{t}</span></li>' for c,t in refs)
    return f'<div id="{pid}" class="anno-panel cross-ref"><h4>Cross-Reference</h4><ul class="cross-ref-list">{items}</ul></div>'

def poi_panel(pid, cards):
    inner = ''.join(f'<div class="poi-card"><div class="poi-name">{n}</div><div class="poi-region">{r}</div><div class="poi-text">{t}</div></div>' for n,r,t in cards)
    return f'<div id="{pid}" class="anno-panel poi-panel"><h4>Places &amp; Geography</h4><div class="poi-grid">{inner}</div></div>'

def tl_panel(pid, items):
    rows = ''.join(f'<p><strong style="color:#c0d8f0;font-family:\'Cinzel\',serif;font-size:.7rem;">{e}</strong> — {ev}</p>' for e,ev in items)
    return f'<div id="{pid}" class="anno-panel tl-panel"><h4>Timeline</h4>{rows}</div>'

def ppl_panel(pid, people):
    cards = ''.join(f'<div class="person-card"><div class="person-name">{n}</div><div class="person-role">{r}</div><div class="person-text">{t}</div></div>' for n,r,t in people)
    return f'<div id="{pid}" class="anno-panel ppl-panel"><h4>People of the Chapter</h4><div class="person-grid">{cards}</div></div>'

def trans_panel(pid, verse_ref, rows):
    trs = ''.join(f'<tr><td class="t-label">{v}</td><td>{t}</td></tr>' for v,t in rows)
    return (f'<div id="{pid}" class="anno-panel trans-panel"><h4>Translation Comparison</h4>'
            f'<p style="font-family:\'Cinzel\',serif;font-size:.65rem;color:var(--trans-accent);margin-bottom:.5rem;">{verse_ref}</p>'
            f'<table class="trans-table"><tr><th>Version</th><th>Translation</th></tr>{trs}</table></div>')

def src_panel(pid, blocks):
    inner = ''.join(f'<div class="source-block"><div class="source-title">{t}</div><div class="source-quote">{q}</div><div class="source-note">{n}</div></div>' for t,q,n in blocks)
    return f'<div id="{pid}" class="anno-panel src-panel"><h4>Ancient Sources</h4>{inner}</div>'

def rec_panel(pid, blocks):
    inner = ''.join(f'<div class="rec-block"><div class="rec-who">{b[0]}</div><div class="rec-text">{b[1]}</div></div>' for b in blocks)
    return f'<div id="{pid}" class="anno-panel rec-panel"><h4>Reception History</h4>{inner}</div>'

def lit_panel(pid, rows, note=''):
    inner = ''
    for row in rows:
        if len(row) == 4:
            lbl, vv, txt, center_raw = row
            lbl = lbl + ' \u2014 ' + vv
            center = center_raw in (True,'true','True')
        else:
            lbl, txt, center = row
        if center:
            inner += f'<div class="lit-center">{txt}</div>'
        else:
            inner += f'<div class="lit-row"><span class="lit-label">{lbl}</span><span class="lit-text">{txt}</span></div>'
    if note:
        inner += f'<div class="lit-note">{note}</div>'
    return f'<div id="{pid}" class="anno-panel lit-panel"><h4>Literary Structure</h4><div class="lit-diagram">{inner}</div></div>'

def hebtext_panel(pid, verses_html, is_nt=False):
    label = 'Greek-Rooted Reading' if is_nt else 'Hebrew-Rooted Reading'
    return f'<div id="{pid}" class="anno-panel heb-text-panel"><h4>{label}</h4>{verses_html}</div>'

def thread_panel(pid, items):
    inner = ''
    for dc, anch, arr, tgt, tc, tl, txt in items:
        inner += (f'<div class="thread-item {dc}"><div class="thread-header">'
                  f'<span class="thread-anchor">{anch}</span><span class="thread-arrow">{arr}</span>'
                  f'<span class="thread-target">{tgt}</span><span class="thread-type {tc}">{tl}</span></div>'
                  f'<div class="thread-text">{txt}</div></div>')
    return f'<div id="{pid}" class="anno-panel thread-panel"><h4>Intertextual Threading</h4>{inner}</div>'

def mac_panel(pid, notes):
    items = ''.join(f'<div class="com-note"><span class="com-ref">{ref}</span><p>{text}</p></div>' for ref, text in notes)
    return (f'<div id="{pid}" class="anno-panel com-panel"><h4>MacArthur Study Notes</h4>'
            f'<div class="com-source">MacArthur Study Bible \u2014 Faithful Paraphrase</div>{items}</div>')

def textual_panel(pid, items):
    """
    Textual criticism panel. items = list of (verse_ref, issue_title, variants_html, significance).
    variants_html may contain <span class="tx-ms">MT</span> <span class="tx-lxx">LXX</span> etc.
    """
    inner = ''
    for ref, issue, variants, significance in items:
        inner += (f'<div class="tx-item">'
                  f'<div class="tx-header"><span class="tx-ref">{ref}</span>'
                  f'<span class="tx-issue">{issue}</span></div>'
                  f'<div class="tx-variants">{variants}</div>'
                  f'<div class="tx-sig">{significance}</div></div>')
    return (f'<div id="{pid}" class="anno-panel tx-panel"><h4>Textual Notes</h4>{inner}</div>')


def debate_panel(pid, debates):
    """
    Scholarly debate panel. debates = list of (title, positions, synthesis).
    positions = list of (position_name, proponents, argument).
    synthesis = brief note on current scholarly consensus or where debate stands.
    """
    inner = ''
    for title, positions, synthesis in debates:
        pos_html = ''
        for name, proponents, argument in positions:
            pos_html += (f'<div class="db-position">'
                         f'<div class="db-pos-name">{name}</div>'
                         f'<div class="db-proponents">{proponents}</div>'
                         f'<div class="db-argument">{argument}</div></div>')
        inner += (f'<div class="db-debate">'
                  f'<div class="db-title">{title}</div>'
                  f'<div class="db-positions">{pos_html}</div>'
                  f'<div class="db-synthesis">{synthesis}</div></div>')
    return (f'<div id="{pid}" class="anno-panel db-panel"><h4>Scholarly Debates</h4>{inner}</div>')


def themes_btn_panel(pid, theme_data, chapter_note):
    n = len(theme_data)
    cx, cy, r = 120, 120, 85
    radar_pts = []
    for i, (lbl, val) in enumerate(theme_data):
        angle = math.pi*2*i/n - math.pi/2
        frac = val/5
        radar_pts.append((cx+r*frac*math.cos(angle), cy+r*frac*math.sin(angle)))
    poly = ' '.join(f'{x:.1f},{y:.1f}' for x,y in radar_pts)
    axis_lines = axis_labels = ''
    for i,(lbl,val) in enumerate(theme_data):
        angle = math.pi*2*i/n - math.pi/2
        x2,y2 = cx+r*math.cos(angle), cy+r*math.sin(angle)
        axis_lines += f'<line x1="{cx}" y1="{cy}" x2="{x2:.1f}" y2="{y2:.1f}" stroke="#303050" stroke-width="1"/>'
        lx,ly = cx+(r+18)*math.cos(angle), cy+(r+18)*math.sin(angle)
        axis_labels += f'<text x="{lx:.1f}" y="{ly:.1f}" text-anchor="middle" dominant-baseline="middle" fill="#7070a0" font-size="7" font-family="Source Sans 3">{lbl}</text>'
    circles = ''.join(f'<circle cx="{cx}" cy="{cy}" r="{r*k/5:.1f}" fill="none" stroke="#202040" stroke-width="1"/>' for k in range(1,6))
    svg = f'<svg viewBox="0 0 240 240" xmlns="http://www.w3.org/2000/svg">{circles}{axis_lines}<polygon points="{poly}" fill="rgba(136,64,224,.25)" stroke="#8840e0" stroke-width="1.5"/>{axis_labels}</svg>'
    btn = (f'<button class="anno-trigger" style="color:#8840e0;border-color:#501890;background:rgba(80,48,128,.12);'
           f'display:inline-flex;align-items:center;gap:.22rem;cursor:pointer;border:1px solid;'
           f'font-family:\'Source Sans 3\',sans-serif;font-size:.63rem;font-weight:600;letter-spacing:.07em;'
           f'text-transform:uppercase;padding:.2rem .55rem;border-radius:3px;transition:all .18s;" '
           f'onclick="tog(this,\'{pid}\')"><span>Theological Themes</span><span class="chev">&#9660;</span></button>')
    panel = (f'<div id="{pid}" class="themes-panel"><h4>Theological Themes Tracker</h4>'
             f'<div class="radar-wrap">{svg}</div>'
             f'<p style="font-family:\'Source Sans 3\',sans-serif;font-size:.83rem;color:#a090d0;line-height:1.6;">{chapter_note}</p></div>')
    return btn, panel

def scholarly_block(cid, ppl, trans, src, rec, lit, hebtext, thread, themes_btn, themes_panel_html,
                    is_nt=False, textual_h='', debate_h=''):
    lang_btn = 'Greek-Rooted Reading' if is_nt else 'Hebrew-Rooted Reading'
    tx_btn = (f'<button class="anno-trigger textual" onclick="tog(this,\'{cid}-tx\')">'
              f'<span>Textual Notes</span><span class="chev">&#9660;</span></button>'
              if textual_h else '')
    db_btn = (f'<button class="anno-trigger debate" onclick="tog(this,\'{cid}-debate\')">'
              f'<span>Scholarly Debates</span><span class="chev">&#9660;</span></button>'
              if debate_h else '')
    return f'''<div class="scholarly-block">
<div class="scholarly-title">Chapter-Level Scholarship</div>
<div class="scholarly-buttons">
<button class="anno-trigger people" onclick="tog(this,\'{cid}-ppl\')"><span>People</span><span class="chev">&#9660;</span></button>
<button class="anno-trigger translations" onclick="tog(this,\'{cid}-trans\')"><span>Translations</span><span class="chev">&#9660;</span></button>
<button class="anno-trigger sources" onclick="tog(this,\'{cid}-src\')"><span>Ancient Sources</span><span class="chev">&#9660;</span></button>
<button class="anno-trigger reception" onclick="tog(this,\'{cid}-rec\')"><span>Reception History</span><span class="chev">&#9660;</span></button>
<button class="anno-trigger literary" onclick="tog(this,\'{cid}-lit\')"><span>Literary Structure</span><span class="chev">&#9660;</span></button>
<button class="anno-trigger hebrew-text" onclick="tog(this,\'{cid}-hebtext\')"><span>{lang_btn}</span><span class="chev">&#9660;</span></button>
<button class="anno-trigger threading" onclick="tog(this,\'{cid}-thread\')"><span>Intertextual Threading</span><span class="chev">&#9660;</span></button>
{tx_btn}{db_btn}{themes_btn}
</div>
{ppl}{trans}{src}{rec}{lit}{hebtext}{thread}{textual_h}{debate_h}{themes_panel_html}
</div>'''

def page(book_name, book_dir, ch, title, auth_text, sections_html, scholarly_html,
         vhl_places=None, vhl_people=None, vhl_time=None, vhl_key=None, is_nt=False):
    sec_count = sections_html.count('<div class="section">')
    if sec_count < 2:
        raise ValueError(f"{book_name} {ch}: only {sec_count} section(s) — need at least 2.")
    out_dir = f'/home/claude/ScriptureDeepDive/{book_dir}'
    os.makedirs(out_dir, exist_ok=True)
    html = (head(book_name, book_dir, ch, is_nt) +
            '\n' + qnav_overlay(book_dir, ch) +
            '\n<main>\n' +
            chapter_header(book_name, ch, title, auth_text, is_nt) +
            '\n' + sections_html + '\n' + scholarly_html +
            '\n</main>\n' +
            TOG_JS + '\n' +
            vhl_js(vhl_places, vhl_people, vhl_time, vhl_key) + '\n' +
            QNAV_JS + '\n' +
            '<script src="../verses.js"></script>\n' +
            SW_JS + '\n' + HISTORY_JS + '\n</body></html>')
    path = f'{out_dir}/{book_name}_{ch}.html'
    with open(path, 'w') as f: f.write(html)
    return path

def build_chapter(book_dir, ch, data):
    """
    Build a chapter HTML file from a clean data dict.
    All book constants come from BOOK_META; all panel IDs are auto-generated.

    data keys:
      title    str
      sections list of section dicts (see below)
      ppl      list of (name, role, text)
      trans    (verse_ref_str, list of (version, text))
      src      list of (title, quote, note)
      rec      list of (title, text)
      lit      (list of (label, vv, text, center), overall_note_str)
      hebtext  str  -- raw HTML for the Hebrew/Greek reading panel
      thread   list of (dir_cls, anchor, arrow, target, type_cls, type_label, text)
      themes   (list of (label, score), chapter_note_str)
      textual  list of (verse_ref, issue_title, variants_html, significance)  [OPTIONAL]
      debate   list of (title, positions, synthesis)                           [OPTIONAL]
               where positions = list of (name, proponents, argument)

    section dict keys:
      header   str
      verses   list of (num, text)
      heb      list of (word, translit, gloss, note)  -> Hebrew/Greek button + panel
      ctx      str                                     -> Context button + panel
      cross    list of (ref, text)                    -> Cross-Ref button + panel
      mac      list of (ref, text)                    -> MacArthur button + panel
      -- optional, presence drives button + panel --
      hist     str                                     -> History button + panel
      places   list of (name, region, text)           -> Places button + panel
      people_sec list of (name, role, text)           -> People button + panel (section-level)
      timeline list of (era, event)                   -> Timeline button + panel

    Button order: heb -> places -> people_sec -> timeline -> hist -> ctx -> cross -> mac
    """
    meta      = BOOK_META[book_dir]
    book_name = next(n for d,n,*_ in REGISTRY if d==book_dir)
    is_nt     = meta['is_nt']
    lang      = 'Greek' if is_nt else 'Hebrew'
    prefix    = BOOK_PREFIX[book_dir]
    cid       = f'{prefix}{ch}'

    sections_html = ''
    for i, sec in enumerate(data['sections']):
        sid = f'{cid}-s{i+1}'

        # --- verses ---
        verses_html = ''.join(verse(n, t) for n, t in sec['verses'])

        # --- buttons (presence of data key = presence of button) ---
        btns = []
        if 'heb'        in sec: btns.append(('hebrew',    lang,      f'{sid}-grk'))
        if 'places'     in sec: btns.append(('places',    'Places',  f'{sid}-places'))
        if 'people_sec' in sec: btns.append(('people',    'People',  f'{sid}-ppl'))
        if 'timeline'   in sec: btns.append(('timeline',  'Timeline',f'{sid}-tl'))
        if 'hist'       in sec: btns.append(('history',   'History', f'{sid}-hist'))
        if 'ctx'        in sec: btns.append(('context',   'Context', f'{sid}-ctx'))
        if 'cross'      in sec: btns.append(('cross',     'Cross-Ref',f'{sid}-cross'))
        if 'mac'        in sec: btns.append(('macarthur', 'MacArthur',f'{sid}-mac'))
        btn_html = btn_row(*btns)

        # --- panels ---
        panels_html = ''
        if 'heb'        in sec: panels_html += heb_panel(f'{sid}-grk',    sec['heb'], is_nt)
        if 'places'     in sec: panels_html += poi_panel(f'{sid}-places',  sec['places'])
        if 'people_sec' in sec: panels_html += ppl_panel(f'{sid}-ppl',     sec['people_sec'])
        if 'timeline'   in sec: panels_html += tl_panel( f'{sid}-tl',      sec['timeline'])
        if 'hist'       in sec: panels_html += hist_panel(f'{sid}-hist',   sec['hist'])
        if 'ctx'        in sec: panels_html += ctx_panel(f'{sid}-ctx',     sec['ctx'])
        if 'cross'      in sec: panels_html += cross_panel(f'{sid}-cross', sec['cross'])
        if 'mac'        in sec: panels_html += mac_panel(f'{sid}-mac',     sec['mac'])

        sections_html += (f'<div class="section">'
                          f'<div class="section-header">{sec["header"]}</div>'
                          f'{verses_html}{btn_html}{panels_html}</div>')

    # --- scholarly block ---
    trans_ref, trans_rows = data['trans']
    lit_rows, lit_note    = data['lit']
    themes_data, themes_note = data['themes']

    ppl_h    = ppl_panel(   f'{cid}-ppl',    data['ppl'])
    trans_h  = trans_panel( f'{cid}-trans',  trans_ref, trans_rows)
    src_h    = src_panel(   f'{cid}-src',    data['src'])
    rec_h    = rec_panel(   f'{cid}-rec',    data['rec'])
    lit_h    = lit_panel(   f'{cid}-lit',    lit_rows, lit_note)
    hebt_h   = hebtext_panel(f'{cid}-hebtext', data['hebtext'], is_nt)
    thread_h = thread_panel(f'{cid}-thread', data['thread'])
    tb, tp   = themes_btn_panel(f'{cid}-themes', themes_data, themes_note)
    tx_h     = textual_panel(f'{cid}-tx',    data['textual']) if 'textual' in data else ''
    db_h     = debate_panel( f'{cid}-debate',data['debate'])  if 'debate'  in data else ''

    sch = scholarly_block(cid, ppl_h, trans_h, src_h, rec_h,
                          lit_h, hebt_h, thread_h, tb, tp, is_nt,
                          textual_h=tx_h, debate_h=db_h)

    page(book_name, book_dir, ch, data['title'], meta['auth'],
         sections_html, sch,
         meta['vhl_places'], meta['vhl_people'], meta['vhl_time'], meta['vhl_key'],
         is_nt)
    print(f'Built {book_name} {ch}')


def rebuild_verses_js():
    """Rebuild /verses.js from all live chapter HTML files. Call after every batch."""
    all_verses = []
    for book_dir, book_name, total, live, _ in REGISTRY:
        for ch in range(1, live+1):
            path = f'{_REPO}/{book_dir}/{book_name}_{ch}.html'
            if not os.path.exists(path): continue
            with open(path) as f: html = f.read()
            boundary = html.find('<div class="scholarly-block">')
            if boundary == -1: boundary = html.rfind('</main>')
            for v_num, text in re.findall(
                r'<span class="verse-text"><span class="verse-num">(\d+)</span>(.*?)</span>',
                html[:boundary], re.DOTALL):
                text = re.sub(r'<[^>]+>', '', text).strip()
                text = re.sub(r'\s+', ' ', text).strip()
                if text:
                    all_verses.append({
                        'ref':   f'{book_name} {ch}:{v_num}',
                        'short': f'{book_name[:3]} {ch}:{v_num}',
                        'text':  text,
                        'url':   f'{book_dir}/{book_name}_{ch}.html',
                        'book':  book_name,
                        'ch':    int(ch),
                        'v':     int(v_num),
                    })
    out = f'{_REPO}/verses.js'
    with open(out, 'w') as f:
        f.write('const VERSES=' + json.dumps(all_verses, separators=(',',':')) + ';')
    print(f'verses.js rebuilt: {len(all_verses)} verses')
    return len(all_verses)


print("Shared helpers loaded.")
