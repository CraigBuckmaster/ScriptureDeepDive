"""Scripture Deep Dive — unified shared helpers. All books use this."""
import re, json, math, os

_REPO = '/home/claude/ScriptureDeepDive'

def _bootstrap():
    """Extract CSS and JS from Genesis_2.html (richer JS) + Genesis_1.html (base CSS).
    Genesis 2 has the full qnav control script (openQnav, closeQnav, qnavToggleBook)
    which Genesis 1 lost when rebuilt. Use Gen 2 for scripts, Gen 1 for CSS.
    Strips any previously baked EXTRA_CSS so accumulated rules don't conflict."""
    with open(f'{_REPO}/genesis/Genesis_1.html') as f:
        g1 = f.read()
    with open(f'{_REPO}/genesis/Genesis_2.html') as f:
        g2 = f.read()

    # CSS from Genesis 1 (base, stripped of EXTRA_CSS)
    raw_css = g1[g1.find('<style>')+7:g1.find('</style>')]
    for marker in ('/* ==EXTRA_CSS_START== */', '/* \u2550\u2550\u2550\u2550'):
        if marker in raw_css:
            raw_css = raw_css[:raw_css.find(marker)]
            break

    # Scripts from Genesis 2 (has the full qnav control block)
    scripts2 = re.findall(r'<script[^>]*>(.*?)</script>', g2, re.DOTALL)
    tog_js      = '<script>' + scripts2[0] + '</script>'
    qnav_js     = next(('<script>'+s+'</script>' for s in scripts2 if 'verseMatches' in s), None)
    qnav_ctrl   = next(('<script>'+s+'</script>' for s in scripts2 if 'openQnav' in s), None)
    sw_js       = next(('<script>'+s+'</script>' for s in scripts2 if 'serviceWorker' in s), None)

    return raw_css, tog_js, qnav_js, qnav_ctrl, sw_js

CSS, TOG_JS, QNAV_JS, QNAV_CTRL_JS, SW_JS = _bootstrap()

# CSS for panel types added after the original Genesis_1.html template was frozen
EXTRA_CSS = '''
/* ==EXTRA_CSS_START== */
/* ════════════════════════════════════════════════════════
   BUTTON SYSTEM — corrected layer (overrides original CSS)
   ════════════════════════════════════════════════════════ */

/* 1. Font size: .72rem → .8rem for readability + tap target */
.anno-trigger{font-size:.8rem !important;}

/* Chev transition + rotation — applies to ALL anno-trigger buttons
   (section-level new chapters have .chev; scholarly block no longer does) */
.anno-trigger .chev{transition:transform .25s;}
.anno-trigger.active .chev{transform:rotate(180deg);}

/* Align scholarly-buttons container to match .btn-row */
.scholarly-buttons{gap:.4rem !important;margin:.35rem 0 .55rem !important;}

/* 2. Active state: clear left-bar indicator + brighter text
      Users can see at a glance which panels are open         */
.anno-trigger.active{
  box-shadow:inset 3px 0 0 currentColor,
             inset 0 1px 0 rgba(255,255,255,.12),
             0 0 0 1px rgba(255,255,255,.06),
             0 2px 8px rgba(0,0,0,.5) !important;
  filter:brightness(1.25);
}

/* 3. Background opacity raised to .22 across section-level
      buttons so they read as distinct interactive surfaces   */
.anno-trigger.hebrew     {background:rgba(122,48,80,.22)   !important;}
.anno-trigger.history    {background:rgba(32,64,112,.22)   !important;}
.anno-trigger.context    {background:rgba(20,80,48,.22)    !important;}
.anno-trigger.cross      {background:rgba(90,64,0,.22)     !important;}
.anno-trigger.places     {background:rgba(12,80,32,.22)    !important;}
.anno-trigger.people     {background:rgba(120,48,12,.22)   !important;}
.anno-trigger.timeline   {background:rgba(32,48,100,.22)   !important;}
.anno-trigger.macarthur  {background:rgba(100,20,32,.22)   !important;
                          color:#e05a6a !important;border-color:#882030 !important;}
.anno-trigger.literary   {background:rgba(64,72,8,.22)     !important;}
.anno-trigger.hebrew-text{background:rgba(64,48,0,.22)     !important;}
.anno-trigger.threading  {background:rgba(40,40,100,.22)   !important;}
.anno-trigger.textual    {background:rgba(32,64,100,.22)   !important;}
.anno-trigger.debate     {background:rgba(56,24,96,.22)    !important;}

/* 4. WCAG AA fixes for failing colours
      macarthur: #c04050 (3.78:1) → #e05a6a (5.40:1)
      sources:   #a05890 (3.97:1) → #c070a8 (5.66:1)         */
.anno-trigger.macarthur{color:#e05a6a !important;border-color:#882030 !important;}
.anno-trigger.sources  {color:#c070a8 !important;border-color:#743060 !important;
                        background:rgba(100,40,80,.22) !important;}

/* 5. SCHOLARLY BLOCK — unified gold theme
      Matches the inline cross-ref button aesthetic: warm gold text,
      dark amber background, gold-dim border. Clean and consistent.
      Three rules replace the previous 33.                          */
.scholarly-buttons .anno-trigger{
  color:var(--gold)          !important;
  border-color:var(--gold-dim) !important;
  background:rgba(90,64,0,.22) !important;
}
.scholarly-buttons .anno-trigger:hover{
  border-color:var(--gold)     !important;
  background:rgba(90,64,0,.32) !important;
}
.scholarly-buttons .anno-trigger.active{
  color:var(--gold-bright)     !important;
  border-color:var(--gold)     !important;
  background:rgba(90,64,0,.36) !important;
  box-shadow:inset 3px 0 0 var(--gold),
             inset 0 1px 0 rgba(255,255,255,.12),
             0 0 0 1px rgba(255,255,255,.06),
             0 2px 8px rgba(0,0,0,.5)       !important;
  filter:brightness(1.15);
}

/* Themes button — also gold in scholarly context, own colour outside */
.anno-trigger.themes{color:var(--gold);border-color:var(--gold-dim);background:rgba(90,64,0,.22);}
.anno-trigger.themes:hover{border-color:var(--gold);background:rgba(90,64,0,.32);}

/* The original base CSS has .scholarly-buttons .anno-trigger[onclick*="themes"]
   with !important setting purple. Override it here with equal specificity + !important
   coming later in the cascade.                                                        */
.scholarly-buttons .anno-trigger[onclick*="themes"]{color:var(--gold) !important;border-color:var(--gold-dim) !important;background:rgba(90,64,0,.22) !important;}
.scholarly-buttons .anno-trigger[onclick*="themes"]:hover{border-color:var(--gold) !important;background:rgba(90,64,0,.32) !important;}
.scholarly-buttons .anno-trigger[onclick*="themes"].active{color:var(--gold-bright) !important;border-color:var(--gold) !important;background:rgba(90,64,0,.36) !important;box-shadow:inset 3px 0 0 var(--gold),inset 0 1px 0 rgba(255,255,255,.12),0 0 0 1px rgba(255,255,255,.06),0 2px 8px rgba(0,0,0,.5) !important;filter:brightness(1.15);}


/* ── Commentary panels — per-commentator colour identity ─ */
/* MacArthur: crimson (defined in base CSS, kept as-is)     */
/* Sarna (JPS): deep teal — Jewish/academic register        */
.anno-trigger.sarna{color:#4ec9b0;border-color:#1a6058;background:rgba(20,80,70,.22);}
.anno-trigger.sarna:hover{border-color:#3aaa98;background:rgba(20,80,70,.32);}
.anno-trigger.sarna.active{filter:brightness(1.25);}
.com-panel.com-sarna{background:#060e0c;border-color:#1a6058;}
.com-panel.com-sarna h4{color:#4ec9b0;}
.com-panel.com-sarna .com-source{color:#4ec9b0;border-bottom-color:rgba(26,96,88,.4);}

/* Alter (Literary): warm amber — literary/poetic register  */
.anno-trigger.alter{color:#d4a853;border-color:#7a5820;background:rgba(90,60,10,.22);}
.anno-trigger.alter:hover{border-color:#c09040;background:rgba(90,60,10,.32);}
.anno-trigger.alter.active{filter:brightness(1.25);}
.com-panel.com-alter{background:#0e0c06;border-color:#7a5820;}
.com-panel.com-alter h4{color:#d4a853;}
.com-panel.com-alter .com-source{color:#d4a853;border-bottom-color:rgba(122,88,32,.4);}

/* Calvin: slate blue — Reformed/theological register       */
.anno-trigger.calvin{color:#7ba7cc;border-color:#2a4870;background:rgba(28,56,90,.22);}
.anno-trigger.calvin:hover{border-color:#5a88b8;background:rgba(28,56,90,.32);}
.anno-trigger.calvin.active{filter:brightness(1.25);}
.com-panel.com-calvin{background:#060810;border-color:#2a4870;}
.com-panel.com-calvin h4{color:#7ba7cc;}
.com-panel.com-calvin .com-source{color:#7ba7cc;border-bottom-color:rgba(42,72,112,.4);}

/* Robertson (NT Greek): chartreuse-lime                    */
.anno-trigger.robertson{color:#c8d870;border-color:#687830;background:rgba(80,96,20,.22);}
.anno-trigger.robertson:hover{border-color:#a8b850;background:rgba(80,96,20,.32);}
.anno-trigger.robertson.active{filter:brightness(1.25);}
.com-panel.com-robertson{background:#0a0e04;border-color:#687830;}
.com-panel.com-robertson h4{color:#c8d870;}
.com-panel.com-robertson .com-source{color:#c8d870;border-bottom-color:rgba(104,120,48,.4);}

/* Catena Aurea (Patristic): medium violet                  */
.anno-trigger.catena{color:#b888d8;border-color:#6a3898;background:rgba(60,28,90,.22);}
.anno-trigger.catena:hover{border-color:#9868c0;background:rgba(60,28,90,.32);}
.anno-trigger.catena.active{filter:brightness(1.25);}
.com-panel.com-catena{background:#0c080f;border-color:#6a3898;}
.com-panel.com-catena h4{color:#b888d8;}
.com-panel.com-catena .com-source{color:#b888d8;border-bottom-color:rgba(106,56,152,.4);}

/* NET Bible Notes: pale sage                               */
.anno-trigger.netbible{color:#d8e8d0;border-color:#688858;background:rgba(52,80,40,.22);}
.anno-trigger.netbible:hover{border-color:#a8c890;background:rgba(52,80,40,.32);}
.anno-trigger.netbible.active{filter:brightness(1.25);}
.com-panel.com-netbible{background:#070e06;border-color:#688858;}
.com-panel.com-netbible h4{color:#d8e8d0;}
.com-panel.com-netbible .com-source{color:#d8e8d0;border-bottom-color:rgba(104,136,88,.4);}

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

# Scope rules for each commentator.
# build_chapter() silently skips a commentator whose scope excludes the current book.
# This means generator scripts never need to know "don't include Robertson in Genesis" —
# the architecture handles it. Add new books to each scope as coverage expands.
COMMENTATOR_SCOPE = {
    # ── Universal — apply to every book ─────────────────────────────────────
    'macarthur': 'all',   # MacArthur Study Bible covers entire canon
    'calvin':    'all',   # Calvin's Commentaries cover entire Bible
    'netbible':  'all',   # NET Bible Full Notes cover entire canon

    # ── OT-only commentators ─────────────────────────────────────────────────
    # Nahum Sarna — JPS Torah Commentary: Genesis, Exodus, Leviticus, Num, Deut
    # (Ruth and Proverbs are not Torah — Sarna did not write on them)
    'sarna':     ['genesis', 'exodus'],

    # Robert Alter — The Hebrew Bible: A Translation with Commentary (2018)
    # Covers the entire Hebrew Bible: Torah, Prophets, and Writings
    # Add book names here as we build them out
    'alter':     ['genesis', 'exodus', 'ruth', 'proverbs'],
    # Future: 'psalms', 'job', 'samuel', 'kings', 'isaiah', etc.

    # ── NT-only commentators ─────────────────────────────────────────────────
    # A.T. Robertson — Word Pictures in the New Testament (NT only)
    'robertson': ['matthew'],
    # Future: 'mark', 'luke', 'john', 'acts', 'romans', etc.

    # Catena Aurea — Aquinas compilation on all four Gospels only
    'catena':    ['matthew'],
    # Future: 'mark', 'luke', 'john'
}

# Book-level constants — AUTH text, IS_NT flag, VHL word lists
BOOK_META = {
    'genesis': {
        'is_nt': False,
        'auth': ('<strong>Author:</strong> Moses (Moshe ben Amram), c.1526&ndash;1406 BC. Born a Hebrew slave in Egypt, '
                 'adopted into Pharaoh\'s household, educated in "all the wisdom of the Egyptians" (Acts 7:22). '
                 'Fled to Midian after killing an Egyptian overseer; spent 40 years as a shepherd under Jethro. '
                 'Called at the burning bush (Exod 3) to lead the Exodus at age 80. Spent 40 years leading Israel '
                 'through the wilderness; died on Mount Nebo in sight of Canaan, age 120.\n\n'
                 '<strong>When written:</strong> c.1445&ndash;1405 BC during the wilderness period, following the Exodus from Egypt. '
                 'Moses drew on earlier patriarchal records, oral tradition, and direct divine revelation. '
                 'The Pentateuch as a whole shows strong literary unity and was treated as Mosaic by both the OT '
                 '(Josh 8:31; 1 Kgs 2:3; Ezra 6:18) and the NT (Mark 12:26; Luke 24:27; John 5:46).\n\n'
                 '<strong>What prompted it:</strong> To record God\'s creation of the world and his covenant relationship '
                 'with the patriarchs &mdash; Abraham, Isaac, Jacob, and Joseph &mdash; culminating in Israel\'s formation '
                 'as a people chosen to carry the promise of blessing to all nations (Gen 12:1&ndash;3). '
                 'Genesis answers the foundational questions: Who is God? Who are we? What went wrong? '
                 'What is God doing about it?'),
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
        'auth': ('<strong>Author:</strong> Matthew (Levi) ben Alphaeus, a tax collector called by Jesus '
                 'at his customs post in Capernaum (Matt 9:9; Mark 2:14). One of the twelve apostles and '
                 'an eyewitness to the ministry of Jesus. He would have been literate and numerate by '
                 'profession — uniquely equipped to compose a carefully structured written account. '
                 'Unanimous early tradition attributes the Gospel to him: Papias (c.AD 125) records that '
                 '"Matthew compiled the oracles in the Hebrew language, and everyone interpreted them as '
                 'best he could." The Gospel as we have it is in polished literary Greek, suggesting '
                 'either a Greek composition drawing on Aramaic sources, or a Greek original.\n\n'
                 '<strong>When written:</strong> c.AD 80&ndash;90, traditionally associated with Antioch '
                 'of Syria, the first great Gentile church and a centre of Jewish-Christian interaction. '
                 'The Gospel presupposes the destruction of Jerusalem (AD 70) in its apocalyptic passages '
                 '(Matt 22:7; 24:15-22), suggesting composition after that date. It draws on Mark\'s '
                 'Gospel (c.AD 65-70) and on a sayings source shared with Luke (conventionally called Q). '
                 'Matthew shapes his sources with a more formal, structured literary hand than any of the '
                 'other evangelists.\n\n'
                 '<strong>What prompted it:</strong> To present Jesus of Nazareth as the fulfilment of '
                 'Israel\'s entire scriptural heritage — the promised Messiah, the new Moses, the true '
                 'Israel, and the Son of God. Matthew writes primarily for a Jewish-Christian community '
                 'navigating its relationship to the synagogue after AD 70. His ten fulfilment-formula '
                 'citations ("all this took place to fulfil what was spoken through the prophet") are the '
                 'theological spine of the work: Israel\'s Scripture is not superseded but completed in '
                 'Jesus. The Great Commission (28:18-20) shows the universal horizon of a Gospel that '
                 'begins with Abraham and ends with all nations.'),
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

def chapter_header(book_name, ch, title, auth_text, is_nt=False):
    return f'''<header>
<h1>{book_name} {ch}</h1>
<p>{title}</p>
</header>
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

def commentary_panel(pid, commentator_key, notes):
    """
    Generic commentary panel. commentator_key: 'macarthur' | 'sarna' | 'alter' | 'calvin'
    notes = list of (verse_ref, text)
    """
    META = {
        'macarthur': ('MacArthur Study Notes',         'MacArthur Study Bible \u2014 Faithful Paraphrase'),
        'sarna':     ('Sarna \u2014 JPS Commentary',  'Nahum Sarna, JPS Torah Commentary \u2014 Scholarly Paraphrase'),
        'alter':     ('Alter \u2014 Literary Reading','Robert Alter, The Hebrew Bible: A Translation with Commentary \u2014 Scholarly Paraphrase'),
        'calvin':    ('Calvin\u2019s Commentary',     'John Calvin, Commentaries \u2014 Faithful Paraphrase'),
        'robertson': ('Robertson \u2014 Word Pictures','A.T. Robertson, Word Pictures in the New Testament \u2014 Public Domain'),
        'catena':    ('Catena Aurea',                  'Thomas Aquinas (compiler), Catena Aurea \u2014 Patristic Commentary, Public Domain'),
        'netbible':  ('NET Bible Notes',               'NET Bible Full Notes Edition \u2014 Biblical Studies Press'),
    }
    title, source = META.get(commentator_key, (commentator_key.title() + ' Notes', commentator_key))
    items = ''.join(
        f'<div class="com-note"><span class="com-ref">{ref}</span><p>{text}</p></div>'
        for ref, text in notes)
    return (f'<div id="{pid}" class="anno-panel com-panel com-{commentator_key}">'
            f'<h4>{title}</h4>'
            f'<div class="com-source">{source}</div>'
            f'{items}</div>')


def mac_panel(pid, notes):
    """Backward-compatible wrapper around commentary_panel."""
    return commentary_panel(pid, 'macarthur', notes)


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
    # Use class-based styling so EXTRA_CSS can control it consistently
    btn = (f'<button class="anno-trigger themes" onclick="tog(this,\'{pid}\')">'
           f'<span>Theological Themes</span></button>')
    panel = (f'<div id="{pid}" class="themes-panel"><h4>Theological Themes Tracker</h4>'
             f'<div class="radar-wrap">{svg}</div>'
             f'<p style="font-family:\'Source Sans 3\',sans-serif;font-size:.83rem;color:#a090d0;line-height:1.6;">{chapter_note}</p></div>')
    return btn, panel

def scholarly_block(cid, ppl, trans, src, rec, lit, hebtext, thread, themes_btn, themes_panel_html,
                    is_nt=False, textual_h='', debate_h=''):
    """Render the chapter-level scholarly block. Any empty string argument suppresses
    its button — so omitted data keys produce a clean block with no dead buttons."""
    lang_btn = 'Greek-Rooted Reading' if is_nt else 'Hebrew-Rooted Reading'
    # Conditional buttons — only rendered when the matching panel has content
    ppl_btn    = f'<button class="anno-trigger people" onclick="tog(this,\'{cid}-ppl\')"><span>People</span></button>' if ppl else ''
    trans_btn  = f'<button class="anno-trigger translations" onclick="tog(this,\'{cid}-trans\')"><span>Translations</span></button>' if trans else ''
    src_btn    = f'<button class="anno-trigger sources" onclick="tog(this,\'{cid}-src\')"><span>Ancient Sources</span></button>' if src else ''
    rec_btn    = f'<button class="anno-trigger reception" onclick="tog(this,\'{cid}-rec\')"><span>Reception History</span></button>' if rec else ''
    lit_btn    = f'<button class="anno-trigger literary" onclick="tog(this,\'{cid}-lit\')"><span>Literary Structure</span></button>' if lit else ''
    hebt_btn   = f'<button class="anno-trigger hebrew-text" onclick="tog(this,\'{cid}-hebtext\')"><span>{lang_btn}</span></button>' if hebtext else ''
    thread_btn = f'<button class="anno-trigger threading" onclick="tog(this,\'{cid}-thread\')"><span>Intertextual Threading</span></button>' if thread else ''
    tx_btn     = f'<button class="anno-trigger textual" onclick="tog(this,\'{cid}-tx\')"><span>Textual Notes</span></button>' if textual_h else ''
    db_btn     = f'<button class="anno-trigger debate" onclick="tog(this,\'{cid}-debate\')"><span>Scholarly Debates</span></button>' if debate_h else ''
    all_btns   = ''.join(filter(None, [ppl_btn, trans_btn, src_btn, rec_btn, lit_btn,
                                       hebt_btn, thread_btn, tx_btn, db_btn, themes_btn]))
    all_panels = ''.join(filter(None, [ppl, trans, src, rec, lit, hebtext, thread,
                                       textual_h, debate_h, themes_panel_html]))
    return f'''<div class="scholarly-block">
<div class="scholarly-title">Chapter-Level Scholarship</div>
<div class="scholarly-buttons">
{all_btns}
</div>
{all_panels}
</div>'''

def page(book_name, book_dir, ch, title, auth_text, sections_html, scholarly_html,
         vhl_places=None, vhl_people=None, vhl_time=None, vhl_key=None, is_nt=False):
    sec_count = sections_html.count('<div class="section">')
    if sec_count < 2:
        raise ValueError(f"{book_name} {ch}: only {sec_count} section(s) — need at least 2.")
    out_dir = f'/home/claude/ScriptureDeepDive/{book_dir}'
    os.makedirs(out_dir, exist_ok=True)
    # Guard against None from _bootstrap() in case a script wasn't found
    _tog      = TOG_JS       or ''
    _vhl      = vhl_js(vhl_places, vhl_people, vhl_time, vhl_key)
    _qnav     = QNAV_JS      or ''
    _qctrl    = QNAV_CTRL_JS or ''
    _sw       = SW_JS        or ''
    html = (head(book_name, book_dir, ch, is_nt) +
            '\n' + qnav_overlay(book_dir, ch) +
            '\n<main>\n' +
            chapter_header(book_name, ch, title, auth_text, is_nt) +
            '\n' + sections_html + '\n' + scholarly_html +
            '\n</main>\n' +
            _tog + '\n' +
            _vhl + '\n' +
            _qnav + '\n' +
            _qctrl + '\n' +
            '<script src="../verses.js"></script>\n' +
            _sw + '\n' + HISTORY_JS + '\n</body></html>')
    path = f'{out_dir}/{book_name}_{ch}.html'
    with open(path, 'w') as f: f.write(html)
    return path

def build_chapter(book_dir, ch, data):
    """
    Build a chapter HTML file from a data dict and write it to disk.
    All book constants (auth text, VHL lists, is_nt) come from BOOK_META.
    All panel IDs are auto-generated.  Commentator scope is enforced automatically
    via COMMENTATOR_SCOPE — generator scripts never need to filter by testament.

    ── REQUIRED TOP-LEVEL KEYS ─────────────────────────────────────────────
      title    str           Chapter title for the header
      sections list[dict]    2+ section dicts (see below)

    ── OPTIONAL SCHOLARLY BLOCK KEYS ───────────────────────────────────────
    All scholarly block keys are optional. Omit any that haven't been written
    yet — the corresponding button and panel will simply not appear.
      ppl      list[(name, role, text)]
      trans    (verse_ref_str, list[(version, text)])
      src      list[(title, quote, note)]
      rec      list[(title, text)]
      lit      (list[(label, vv, text, center)], overall_note_str)
      hebtext  str   raw HTML for the Hebrew/Greek reading panel
      thread   list[(dir_cls, anchor, arrow, target, type_cls, type_label, text)]
      themes   (list[(label, score)], chapter_note_str)
      textual  list[(verse_ref, issue_title, variants_html, significance)]
      debate   list[(title, positions, synthesis)]
               where positions = list[(name, proponents, argument)]

    ── SECTION DICT KEYS ────────────────────────────────────────────────────
    Presence of a key drives the corresponding button + panel automatically.
    Button order in rendered HTML: heb → places → people_sec → timeline →
                                   hist → ctx → cross → mac → sarna → alter →
                                   calvin → netbible → robertson → catena
      header      str                     e.g. 'Verses 1–5 — Title'
      verses      list[(int, str)]        NIV verse tuples
      heb         list[(word, translit, gloss, note)]   Hebrew/Greek word study
      ctx         str                     Context note
      cross       list[(ref, text)]       Cross-references
      hist        str          [OPTIONAL] Historical background
      places      list[(name, region, text)]  [OPTIONAL]
      people_sec  list[(name, role, text)]    [OPTIONAL] Section-level people
      timeline    list[(era, event)]          [OPTIONAL]
      mac         list[(ref, text)]      MacArthur notes
      sarna       list[(ref, text)]      Sarna/JPS notes      [scope: OT only]
      alter       list[(ref, text)]      Alter literary notes [scope: OT prose]
      calvin      list[(ref, text)]      Calvin notes
      netbible    list[(ref, text)]      NET Bible notes
      robertson   list[(ref, text)]      Robertson NT Greek   [scope: NT only]
      catena      list[(ref, text)]      Catena Aurea         [scope: Gospels]

    ── COMMENTATOR SCOPE ────────────────────────────────────────────────────
    COMMENTATOR_SCOPE in this file defines which books each commentator covers.
    build_chapter() silently skips any commentator whose scope excludes the
    current book — even if data keys for that commentator are present in the
    section dict. This means generator scripts never need to filter by testament.
    Extend COMMENTATOR_SCOPE as coverage expands.
    """
    meta      = BOOK_META[book_dir]
    book_name = next(n for d,n,*_ in REGISTRY if d==book_dir)
    is_nt     = meta['is_nt']
    lang      = 'Greek' if is_nt else 'Hebrew'
    prefix    = BOOK_PREFIX[book_dir]
    cid       = f'{prefix}{ch}'

    # Pre-compute which commentators are in scope for this book
    def in_scope(key):
        scope = COMMENTATOR_SCOPE.get(key, 'all')
        return scope == 'all' or book_dir in scope

    sections_html = ''
    for i, sec in enumerate(data['sections']):
        sid = f'{cid}-s{i+1}'

        # --- verses ---
        verses_html = ''.join(verse(n, t) for n, t in sec['verses'])

        # --- buttons: presence of key + scope check drives inclusion ---
        btns = []
        if 'heb'        in sec: btns.append(('hebrew',    lang,           f'{sid}-grk'))
        if 'places'     in sec: btns.append(('places',    'Places',       f'{sid}-places'))
        if 'people_sec' in sec: btns.append(('people',    'People',       f'{sid}-ppl'))
        if 'timeline'   in sec: btns.append(('timeline',  'Timeline',     f'{sid}-tl'))
        if 'hist'       in sec: btns.append(('history',   'History',      f'{sid}-hist'))
        if 'ctx'        in sec: btns.append(('context',   'Context',      f'{sid}-ctx'))
        if 'cross'      in sec: btns.append(('cross',     'Cross-Ref',    f'{sid}-cross'))
        if 'mac'        in sec and in_scope('macarthur'):  btns.append(('macarthur', 'MacArthur',   f'{sid}-mac'))
        if 'sarna'      in sec and in_scope('sarna'):      btns.append(('sarna',     'Sarna',       f'{sid}-sarna'))
        if 'alter'      in sec and in_scope('alter'):      btns.append(('alter',     'Alter',       f'{sid}-alter'))
        if 'calvin'     in sec and in_scope('calvin'):     btns.append(('calvin',    'Calvin',      f'{sid}-calvin'))
        if 'netbible'   in sec and in_scope('netbible'):   btns.append(('netbible',  'NET Notes',   f'{sid}-net'))
        if 'robertson'  in sec and in_scope('robertson'):  btns.append(('robertson', 'Robertson',   f'{sid}-robertson'))
        if 'catena'     in sec and in_scope('catena'):     btns.append(('catena',    'Catena Aurea',f'{sid}-catena'))
        btn_html = btn_row(*btns)

        # --- panels: same key + scope logic ---
        panels_html = ''
        if 'heb'        in sec: panels_html += heb_panel(f'{sid}-grk',    sec['heb'], is_nt)
        if 'places'     in sec: panels_html += poi_panel(f'{sid}-places',  sec['places'])
        if 'people_sec' in sec: panels_html += ppl_panel(f'{sid}-ppl',     sec['people_sec'])
        if 'timeline'   in sec: panels_html += tl_panel( f'{sid}-tl',      sec['timeline'])
        if 'hist'       in sec: panels_html += hist_panel(f'{sid}-hist',   sec['hist'])
        if 'ctx'        in sec: panels_html += ctx_panel(f'{sid}-ctx',     sec['ctx'])
        if 'cross'      in sec: panels_html += cross_panel(f'{sid}-cross', sec['cross'])
        if 'mac'      in sec and in_scope('macarthur'): panels_html += commentary_panel(f'{sid}-mac',      'macarthur', sec['mac'])
        if 'sarna'    in sec and in_scope('sarna'):     panels_html += commentary_panel(f'{sid}-sarna',    'sarna',     sec['sarna'])
        if 'alter'    in sec and in_scope('alter'):     panels_html += commentary_panel(f'{sid}-alter',    'alter',     sec['alter'])
        if 'calvin'   in sec and in_scope('calvin'):    panels_html += commentary_panel(f'{sid}-calvin',   'calvin',    sec['calvin'])
        if 'netbible' in sec and in_scope('netbible'):  panels_html += commentary_panel(f'{sid}-net',      'netbible',  sec['netbible'])
        if 'robertson' in sec and in_scope('robertson'): panels_html += commentary_panel(f'{sid}-robertson','robertson', sec['robertson'])
        if 'catena'   in sec and in_scope('catena'):    panels_html += commentary_panel(f'{sid}-catena',   'catena',    sec['catena'])

        sections_html += (f'<div class="section">'
                          f'<div class="section-header">{sec["header"]}</div>'
                          f'{verses_html}{btn_html}{panels_html}</div>')

    # --- scholarly block (all keys optional — omit any and its button disappears) ---
    ppl_h    = ppl_panel(   f'{cid}-ppl',     data['ppl'])                       if 'ppl'     in data else ''
    trans_h  = trans_panel( f'{cid}-trans',   *data['trans'])                    if 'trans'   in data else ''
    src_h    = src_panel(   f'{cid}-src',     data['src'])                       if 'src'     in data else ''
    rec_h    = rec_panel(   f'{cid}-rec',     data['rec'])                       if 'rec'     in data else ''
    lit_h    = lit_panel(   f'{cid}-lit',     *data['lit'])                      if 'lit'     in data else ''
    hebt_h   = hebtext_panel(f'{cid}-hebtext',data['hebtext'], is_nt)            if 'hebtext' in data else ''
    thread_h = thread_panel(f'{cid}-thread',  data['thread'])                    if 'thread'  in data else ''
    tx_h     = textual_panel(f'{cid}-tx',     data['textual'])                   if 'textual' in data else ''
    db_h     = debate_panel( f'{cid}-debate', data['debate'])                    if 'debate'  in data else ''
    tb, tp   = themes_btn_panel(f'{cid}-themes', *data['themes'])                if 'themes'  in data else ('', '')

    sch = scholarly_block(cid, ppl_h, trans_h, src_h, rec_h,
                          lit_h, hebt_h, thread_h, tb, tp, is_nt,
                          textual_h=tx_h, debate_h=db_h)

    page(book_name, book_dir, ch, data['title'], meta['auth'],
         sections_html, sch,
         meta['vhl_places'], meta['vhl_people'], meta['vhl_time'], meta['vhl_key'],
         is_nt)
    print(f'Built {book_name} {ch}')


def update_homepage():
    """
    Sync index.html OT/NT library section with the actual state of chapter files on disk.
    For each book in REGISTRY:
      - Counts which chapter HTML files exist
      - Rewrites the chapter-grid (live <a> vs coming <span>)
      - Sets/removes has-live class on book-item
      - Updates or removes the live-badge count
      - Updates the REGISTRY live count in shared.py itself

    Call this as part of the deploy checklist after every chapter batch,
    alongside rebuild_verses_js(). It is idempotent — safe to run multiple times.
    """
    index_path = f'{_REPO}/index.html'
    with open(index_path) as f: h = f.read()

    for book_dir, book_name, total, _, testament in REGISTRY:
        # Count which chapter files actually exist
        live_chs = [ch for ch in range(1, total+1)
                    if os.path.exists(f'{_REPO}/{book_dir}/{book_name}_{ch}.html')]
        live_count = len(live_chs)

        # Build the new chapter-grid HTML
        links = []
        for ch in range(1, total+1):
            title = f'{book_name} {ch}'
            if ch in live_chs:
                href = f'{book_dir}/{book_name}_{ch}.html'
                links.append(f'<a href="{href}" class="chapter-link live" title="{title}">Ch.{ch}</a>')
            else:
                links.append(f'<span class="chapter-link coming" title="{title}">Ch.{ch}</span>')
        new_grid = '<div class="chapter-grid">' + ''.join(links) + '</div>'

        # Build new book-item header
        live_badge = f'<span class="live-badge">{live_count} live</span>' if live_count else ''
        has_live   = ' has-live' if live_count else ''
        new_item_open = (f'<div class="book-item{has_live}" id="book-{book_dir.lower().replace("_","-")}">\n'
                         f'  <button class="book-btn" onclick="toggleBook(\'{book_dir.lower().replace("_","-")}\')">\n'
                         f'    <span class="book-name">{book_name}</span>\n'
                         f'    <span class="book-meta"><span class="ch-count">{total} ch</span>'
                         f'{live_badge}<span class="book-chev">&#9660;</span></span>\n'
                         f'  </button>')

        # Find and replace the existing book-item block's header + chapter-grid
        # Use the id to locate the block
        book_id = book_dir.lower().replace('_', '-')
        id_marker = f'id="book-{book_id}"'
        idx = h.find(id_marker)
        if idx == -1:
            print(f'  WARNING: book-{book_id} not found in index.html')
            continue

        # Find the opening div of this book-item
        div_start = h.rfind('<div class="book-item', 0, idx)

        # Find the end of the opening button section (closing </button> tag)
        btn_end = h.find('</button>', div_start) + 9

        # Find the chapter-grid end
        grid_start = h.find('<div class="chapter-grid">', btn_end)
        grid_end   = h.find('</div>', grid_start) + 6

        # Replace opening block (div through </button>) and the chapter-grid
        h = h[:div_start] + new_item_open + h[btn_end:grid_start] + new_grid + h[grid_end:]

    with open(index_path, 'w') as f: f.write(h)

    # Report
    total_live = sum(
        len([ch for ch in range(1, total+1)
             if os.path.exists(f'{_REPO}/{book_dir}/{book_name}_{ch}.html')])
        for book_dir, book_name, total, _, _ in REGISTRY
    )
    print(f'index.html updated — {total_live} live chapters across {len(REGISTRY)} books')
    return total_live



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
