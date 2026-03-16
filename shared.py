"""Scripture Deep Dive — unified shared helpers. All books use this."""
import re, json, math, os

with open('/tmp/exodus_template.json') as f:
    T = json.load(f)

CSS    = T['css']
TOG_JS = T['tog_js']
QNAV_JS = T['qnav_js']
SW_JS  = T['sw_js']

REGISTRY = [
    ('genesis',  'Genesis',   50, 50, 'OT'),
    ('exodus',   'Exodus',    40, 40, 'OT'),
    ('ruth',     'Ruth',       4,  4, 'OT'),
    ('proverbs', 'Proverbs',  31, 31, 'OT'),
    ('matthew',  'Matthew',   28, 28, 'NT'),
]

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

def scholarly_block(cid, ppl, trans, src, rec, lit, hebtext, thread, themes_btn, themes_panel_html, is_nt=False):
    lang_btn = 'Greek-Rooted Reading' if is_nt else 'Hebrew-Rooted Reading'
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
{themes_btn}
</div>
{ppl}{trans}{src}{rec}{lit}{hebtext}{thread}{themes_panel_html}
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

print("Shared helpers loaded.")
