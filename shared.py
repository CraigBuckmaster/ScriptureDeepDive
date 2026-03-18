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

/* Hubbard (NICOT Ruth): warm olive — OT narrative/covenant register */
.anno-trigger.hubbard{color:#a8c870;border-color:#507028;background:rgba(60,80,20,.22);}
.anno-trigger.hubbard:hover{border-color:#80a848;background:rgba(60,80,20,.32);}
.anno-trigger.hubbard.active{filter:brightness(1.25);}
.com-panel.com-hubbard{background:#090e04;border-color:#507028;}
.com-panel.com-hubbard h4{color:#a8c870;}
.com-panel.com-hubbard .com-source{color:#a8c870;border-bottom-color:rgba(80,112,40,.4);}

/* Waltke (NICOT Proverbs): warm rose-mauve — wisdom register */
.anno-trigger.waltke{color:#e8a0b8;border-color:#883050;background:rgba(80,20,40,.22);}
.anno-trigger.waltke:hover{border-color:#c06080;background:rgba(80,20,40,.32);}
.anno-trigger.waltke.active{filter:brightness(1.25);}
.com-panel.com-waltke{background:#0f0608;border-color:#883050;}
.com-panel.com-waltke h4{color:#e8a0b8;}
.com-panel.com-waltke .com-source{color:#e8a0b8;border-bottom-color:rgba(136,48,80,.4);}

/* NET Bible Notes: pale sage                               */
.anno-trigger.netbible{color:#d8e8d0;border-color:#688858;background:rgba(52,80,40,.22);}
.anno-trigger.netbible:hover{border-color:#a8c890;background:rgba(52,80,40,.32);}
.anno-trigger.netbible.active{filter:brightness(1.25);}
.com-panel.com-netbible{background:#070e06;border-color:#688858;}
.com-panel.com-netbible h4{color:#d8e8d0;}
.com-panel.com-netbible .com-source{color:#d8e8d0;border-bottom-color:rgba(104,136,88,.4);}
/* Marcus — Anchor Bible (teal-blue: historical-critical scholarship) */
.anno-trigger.marcus{color:#70d8d8;border-color:#2a7878;background:rgba(20,80,80,.22);}
.anno-trigger.marcus:hover{border-color:#50b8b8;background:rgba(20,80,80,.32);}
.anno-trigger.marcus.active{filter:brightness(1.25);}
.com-panel.com-marcus{background:#030d0d;border-color:#2a7878;}
.com-panel.com-marcus h4{color:#70d8d8;}
.com-panel.com-marcus .com-source{color:#70d8d8;border-bottom-color:rgba(42,120,120,.4);}
/* Rhoads — Mark as Story (amber-gold: narrative/literary criticism) */
.anno-trigger.rhoads{color:#e8c060;border-color:#886020;background:rgba(80,56,12,.22);}
.anno-trigger.rhoads:hover{border-color:#c8a040;background:rgba(80,56,12,.32);}
.anno-trigger.rhoads.active{filter:brightness(1.25);}
.com-panel.com-rhoads{background:#0e0900;border-color:#886020;}
.com-panel.com-rhoads h4{color:#e8c060;}
.com-panel.com-rhoads .com-source{color:#e8c060;border-bottom-color:rgba(136,96,32,.4);}

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

/* ── Places (POI) section panel ─────────────────────────────── */
.poi-entry{padding:.7rem 0;border-bottom:1px solid rgba(26,96,40,.35);}
.poi-entry:last-child{border-bottom:none;}
.poi-name{font-family:'Cinzel',serif;font-size:.8rem;color:var(--poi-accent);margin-bottom:.2rem;}
.poi-coords{font-size:.72rem;color:var(--text-muted);font-style:italic;margin-bottom:.35rem;}
.poi-text{font-size:.82rem;color:var(--text);line-height:1.65;}

/* ── Timeline section panel ─────────────────────────────────── */
.tl-visual{position:relative;margin:.5rem 0 .3rem;}
.tl-spine{position:absolute;left:144px;top:8px;bottom:8px;width:2px;background:linear-gradient(to bottom,transparent,#4a6888 6%,#4a6888 94%,transparent);pointer-events:none;}
.tl-event{position:relative;display:grid;grid-template-columns:130px 28px 1fr;grid-template-rows:auto auto;align-items:start;padding:6px 0;}
.tl-date{grid-column:1;grid-row:1;text-align:right;font-family:'Cinzel',serif;font-size:.63rem;color:#7a9ab8;line-height:1.6;padding-right:10px;white-space:nowrap;}
.tl-dot-wrap{grid-column:2;grid-row:1 / span 2;display:flex;flex-direction:column;align-items:center;padding-top:4px;}
.tl-dot{width:10px;height:10px;border-radius:50%;background:#304858;border:2px solid #4a6888;position:relative;z-index:1;flex-shrink:0;}
.tl-body{grid-column:3;grid-row:1 / span 2;padding-left:12px;}
.tl-name{font-size:.78rem;color:#8ab8d8;line-height:1.6;}
.tl-text{font-size:.78rem;color:var(--text);line-height:1.6;margin-top:.25rem;padding-top:.25rem;border-top:1px solid rgba(74,104,136,.2);}
.tl-event.current .tl-dot{width:13px;height:13px;background:#c0d8f0;border-color:#e8f4ff;box-shadow:0 0 7px rgba(192,216,240,.55);margin-top:1px;}
.tl-event.current .tl-date{color:#c0d8f0;}
.tl-event.current .tl-name{color:#e8f4ff;font-weight:600;}
.tl-event.current .tl-text{border-color:rgba(192,216,240,.2);color:var(--text);}
.tl-range{display:flex;justify-content:space-between;font-size:.63rem;color:var(--text-muted);font-style:italic;padding:.2rem 0 0 170px;}
.tl-caption{font-size:.72rem;color:var(--text-muted);font-style:italic;margin-top:.4rem;}-top:1px;}
.tl-event.current .tl-date{color:#c0d8f0;}
.tl-event.current .tl-name{color:#e8f4ff;font-weight:600;}
.tl-event.current .tl-text{border-color:rgba(192,216,240,.2);color:var(--text);}
.tl-range{display:flex;justify-content:space-between;font-size:.63rem;color:var(--text-muted);font-style:italic;padding:.2rem 0 0 90px;}
.tl-caption{font-size:.72rem;color:var(--text-muted);font-style:italic;margin-top:.4rem;}
'''

REGISTRY = [
    ('genesis',  'Genesis',   50, 50, 'OT'),
    ('exodus',   'Exodus',    40, 40, 'OT'),
    ('ruth',     'Ruth',       4,  4, 'OT'),
    ('proverbs', 'Proverbs',  31, 31, 'OT'),
    ('matthew',  'Matthew',   28, 28, 'NT'),
    ('mark',     'Mark',      16, 16, 'NT'),
    ('luke',     'Luke',      24, 24, 'NT'),
    ('john',     'John',      21, 21, 'NT'),
    ('acts',     'Acts',      28, 16, 'NT'),
]

# Short prefix used for auto-generated panel IDs (e.g. gen46-s1-grk)
BOOK_PREFIX = {
    'genesis':  'gen',
    'exodus':   'ex',
    'ruth':     'ru',
    'proverbs': 'pr',
    'matthew':  'mt',
    'mark':     'mk',
    'luke':     'lk',
    'john':     'jn',
    'acts':     'ac',
}

# ── Per-book commentary roster ────────────────────────────────────────────
#
#  When adding a new book, check this table to decide which scholars to use.
#  Flag in the batch script if a listed scholar does NOT cover the book.
#
#  Book        | Slot 1 (Jewish/OT)    | Slot 2 (Literary)  | Slot 3 (Reformed) | Slot 4 (Notes)
#  ------------|----------------------|--------------------|-------------------|---------------
#  Genesis     | Sarna (JPS Torah)    | Alter (Heb Bible)  | Calvin            | NET Bible
#  Exodus      | Sarna (JPS Torah)    | Alter (Heb Bible)  | Calvin            | NET Bible
#  Ruth        | Hubbard (NICOT Ruth) | Alter (Heb Bible)  | Calvin            | NET Bible
#  Proverbs    | Waltke (NICOT)       | Alter (Heb Bible)  | Calvin            | NET Bible
#  Matthew     | — (NT, no Sarna)     | —                  | Calvin            | NET Bible
#              |   Robertson (NT Gk)  | Catena (Patristic) |                   |
#  Mark        | Marcus (Anchor Bible)| Rhoads (Narrative) | Calvin            | NET Bible
#              |   Robertson (NT Gk)  | Catena (Patristic) |                   |
#  Luke        | Green (NICGT Luke)   | Bovon (Hermeneia)  | Calvin            | NET Bible
#              |   Robertson (NT Gk)  | Catena (Patristic) |                   |
#
#  Hubbard: Robert Hubbard, NICOT Commentary on Ruth (1988). Evangelical-scholarly.
#
#  DECISION LOG:
#  - Ruth: Sarna → Hubbard (Robert Hubbard, NICOT Ruth, 1988)
#    Reason: Sarna did not write on Ruth; Hubbard is the gold-standard
#    evangelical-scholarly commentary on Ruth.
#  - Proverbs: Sarna → Waltke (Bruce K. Waltke, NICOT Proverbs 2 vols, 2004–5)
#    Reason: Sarna did not write on Proverbs; Waltke is the gold-standard
#    evangelical-scholarly commentary on Proverbs.
#  - Matthew: Sarna/Alter not applicable (NT); Robertson + Catena fill slots.
#
# Scope rules for each commentator.
# build_chapter() silently skips a commentator whose scope excludes the current book.
# This means generator scripts never need to know "don't include Robertson in Genesis" —
# the architecture handles it. Add new books to each scope as coverage expands.
COMMENTATOR_SCOPE = {
    # ── Universal — apply to every book ─────────────────────────────────────
    'macarthur': 'all',   # MacArthur Study Bible covers entire canon
    'calvin':    'all',   # Calvin's Commentaries cover entire Bible
    'netbible':  'all',   # NET Bible Full Notes cover entire canon

    # ── OT commentators ──────────────────────────────────────────────────────
    # Nahum Sarna — JPS Torah Commentary (Genesis & Exodus volumes only)
    # SCOPE: Pentateuch only. Ruth included with scholarly-paraphrase caveat.
    # ⚠ Does NOT cover: Proverbs, Psalms, Job, or any non-Torah book.
    'sarna':     ['genesis', 'exodus'],   # JPS Torah — Genesis & Exodus only

    # Robert Alter — The Hebrew Bible: A Translation with Commentary (2019)
    # Covers the entire Hebrew Bible (Torah, Prophets, Writings).
    'alter':     ['genesis', 'exodus', 'ruth', 'proverbs'],
    # Future: add 'psalms', 'job', 'isaiah', etc. as built

    # Robert Hubbard — NICOT Commentary on Ruth (1988)
    # SCOPE: Ruth only. The standard evangelical-scholarly Ruth commentary.
    # ⚠ Does NOT cover any other book.
    'hubbard':   ['ruth'],

    # Bruce K. Waltke — NICOT Commentary on Proverbs (2 vols, 2004–2005)
    # SCOPE: Proverbs only. The gold-standard evangelical-scholarly Proverbs commentary.
    # ⚠ Does NOT cover any other book. For Psalms/Job use a different scholar.
    'waltke':    ['proverbs'],
    # Future: if we add Psalms, consider Goldingay or Craigie (WBC)

    # ── NT-only commentators ─────────────────────────────────────────────────
    # A.T. Robertson — Word Pictures in the New Testament (NT only)
    'robertson': ['matthew', 'mark', 'luke', 'acts'],
    # Future: 'john', 'acts', etc.

    # Catena Aurea — Aquinas compilation on all four Gospels only
    'catena':    ['matthew', 'mark', 'luke', 'john'],
    # Future: 'john'

    # Joel Marcus — Anchor Bible Commentary on Mark (2 vols., 2000/2009)
    # SCOPE: Mark only. Heavyweight historical-critical; strong on Jewish backgrounds,
    # Dead Sea Scrolls parallels, and Roman imperial context.
    'marcus':    ['mark'],

    # Rhoads & Michie — Mark as Story (1982, updated 2012)
    # SCOPE: Mark only. Founding text of Markan narrative criticism —
    # narrator, characters, plot, rhetoric.
    'rhoads':    ['mark'],
    'keener':    ['acts'],
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
    'mark': {
        'is_nt': True,
        'auth': ('<strong>Author:</strong> John Mark, companion of Peter and Paul. Early and unanimous '
                 'tradition (Papias, c.AD 125; Irenaeus; Clement of Alexandria) identifies Mark as the '
                 'interpreter of Peter — his Gospel preserves the apostle\'s eyewitness testimony in '
                 'compressed, vivid narrative. Mark is mentioned in Acts 12:12, 25; 13:13; 15:37-39; '
                 'Col 4:10; Phm 24; and 1 Pet 5:13 ("my son Mark"), confirming the Petrine connection. '
                 'The Gospel\'s Latinisms, explanation of Jewish customs, and Roman audience markers '
                 'support a Roman provenance.'),
        'vhl_places': ['Galilee', 'Capernaum', 'Jerusalem', 'Judea', 'Jordan',
                       'temple', 'Decapolis', 'Caesarea Philippi', 'Bethany',
                       'Gethsemane', 'Golgotha', 'synagogue', 'wilderness'],
        'vhl_people': ['Jesus', 'disciples', 'Pharisees', 'scribes', 'Peter',
                       'John', 'James', 'crowd', 'demon', 'priest', 'Pilate',
                       'Herod', 'elders', 'chief priests'],
        'vhl_time':   ['day', 'days', 'night', 'morning', 'immediately',
                       'straightway', 'hour', 'third day', 'evening', 'coming'],
        'vhl_key':    ['kingdom', 'gospel', 'Son of God', 'Son of Man', 'faith',
                       'authority', 'repent', 'blood', 'covenant', 'ransom',
                       'Holy Spirit', 'forgive', 'power', 'immediately'],
    },
    'luke': {
        'is_nt': True,
        'auth': ('<strong>Author:</strong> Luke, a Gentile physician (Col 4:14) and the most '
                 'accomplished literary stylist in the New Testament. His Greek is the most '
                 'polished in the NT corpus &mdash; modelled on the style of educated Hellenistic '
                 'historians such as Thucydides and Polybius. Early and unanimous church tradition '
                 '(Irenaeus c.&thinsp;AD&thinsp;180, Clement of Alexandria, Origen, Eusebius, '
                 'Jerome) identifies him as the author of both this Gospel and the Acts of the '
                 'Apostles. He was a close companion of Paul (Phlm 24; 2 Tim 4:11, &ldquo;only '
                 'Luke is with me&rdquo;), and the &ldquo;we&rdquo; passages in Acts '
                 '(16:10&ndash;17; 20:5&ndash;15; 21:1&ndash;18; 27:1&ndash;28:16) confirm '
                 'direct eyewitness participation in events he narrates. Luke is the only '
                 'Gentile author in the canon. He explicitly describes his method in the '
                 'prologue (1:1&ndash;4): careful investigation of all available tradition, '
                 'consultation of eyewitnesses and ministers of the word, and orderly composition '
                 'for a patron named Theophilus &mdash; a preface that conforms to the best '
                 'conventions of Hellenistic historiography.\n\n'
                 '<strong>When written:</strong> c.&thinsp;AD&thinsp;62&ndash;70, most likely '
                 'during Paul&rsquo;s two-year imprisonment in Caesarea (Acts 24:27, c.&thinsp;AD '
                 '57&ndash;59) or shortly thereafter, with publication before Acts (which '
                 'presupposes it, Acts 1:1). A pre-AD&thinsp;70 date is supported by the absence '
                 'of any reference to the destruction of Jerusalem as a past event; the '
                 'Gospel&rsquo;s detailed prediction of the siege (21:20&ndash;24) reads as '
                 'prophecy, not retrospective commentary. A minority of scholars favour '
                 'AD&thinsp;70&ndash;85, arguing that the precision of 21:20 reflects '
                 'post-event knowledge. The two-volume work (Luke&ndash;Acts) is approximately '
                 '27,000 words &mdash; the largest single contribution to the NT by word count.\n\n'
                 '<strong>What prompted it:</strong> Luke writes for Theophilus (&ldquo;friend '
                 'of God&rdquo;), probably a Gentile patron of high social standing '
                 '(&ldquo;most excellent,&rdquo; Acts 1:1, a term used for Roman officials), '
                 'who has already received some instruction in the faith but needs a reliable, '
                 'ordered account to confirm its certainty (1:4). More broadly, Luke&rsquo;s '
                 'two-volume work addresses the expanding Gentile mission: How does the story of '
                 'a Jewish Messiah become good news for all nations? His Gospel foregrounds '
                 'the inclusion of the poor, women, Samaritans, and Gentiles; his Acts shows '
                 'the gospel moving from Jerusalem to Rome. Luke also addresses a pastoral '
                 'crisis: the delay of the Parousia. His travel narrative (9:51&ndash;19:28) '
                 'reframes discipleship as a sustained journey of formation, not merely '
                 'expectation of an imminent end. The Gospel&rsquo;s persistent themes &mdash; '
                 'prayer, joy, the Holy Spirit, reversal of fortune, universal salvation &mdash; '
                 'all serve this dual apologetic and pastoral purpose.'),
        'vhl_places': ['Jerusalem', 'Galilee', 'Judea', 'Samaria', 'Nazareth', 'Capernaum',
                       'Bethlehem', 'Jordan', 'temple', 'synagogue', 'road', 'Jericho'],
        'vhl_people': ['Jesus', 'disciples', 'Pharisees', 'scribes', 'Peter', 'John', 'James',
                       'crowd', 'elders', 'chief priests', 'Pilate', 'Herod', 'angel', 'women'],
        'vhl_time':   ['day', 'days', 'night', 'morning', 'hour', 'today', 'year',
                       'generation', 'coming', 'now', 'appointed time'],
        'vhl_key':    ['kingdom', 'Son of Man', 'salvation', 'Spirit', 'repent', 'forgive',
                       'grace', 'glory', 'faith', 'gospel', 'poor', 'joy', 'covenant', 'prophet'],
    },

    'john': {
        'is_nt': True,
        'auth': (
            '<strong>Author:</strong> John the son of Zebedee &mdash; fisherman, apostle, '
            'and &ldquo;the disciple whom Jesus loved&rdquo; (John 13:23; 19:26; 20:2; 21:7, 20). '
            'The fourth Gospel never names its author directly, but the evidence converges on John: '
            '(1) The &ldquo;beloved disciple&rdquo; is an eyewitness (19:35; 21:24) present at the '
            'Last Supper, the cross, and the empty tomb. (2) Early and unanimous tradition: Irenaeus '
            '(c.&thinsp;AD&thinsp;180), Clement of Alexandria, Origen, and Eusebius all identify '
            'the author as John the apostle writing from Ephesus in old age. (3) The Gospel\u2019s '
            'intimate knowledge of Jerusalem topography (Pool of Bethesda, Pool of Siloam, '
            'the Pavement/Gabbatha) is confirmed by archaeology. (4) The eyewitness claim of 19:35 '
            'and the closing verse of 21:24 point to direct authorial witness. Liberal scholarship '
            'has proposed an anonymous Johannine community or the Elder John of Ephesus; the '
            'traditional identification with the apostle remains the best-attested position.'
            '\n\n'
            '<strong>When written:</strong> c.&thinsp;AD&thinsp;85&ndash;95, probably from Ephesus, '
            'making it the latest of the four Gospels. The Rylands Papyrus (P52, '
            'c.&thinsp;AD&thinsp;125) &mdash; the earliest surviving NT manuscript fragment &mdash; '
            'contains John 18:31-33, 37-38, confirming the Gospel was in circulation in Egypt by the '
            'early second century. A pre-AD&thinsp;70 date has been argued from the Temple language '
            'in chs 2, 5, and 10, which reads as description of a standing building; the majority '
            'of scholars favour a post-70 date for the final composition. The three Johannine '
            'letters and Revelation share vocabulary and theological concerns with the Gospel, '
            'suggesting a common Ephesian milieu.'
            '\n\n'
            '<strong>What prompted it:</strong> John states his purpose explicitly &mdash; a rarity '
            'in the Gospels: &ldquo;These are written that you may believe that Jesus is the '
            'Messiah, the Son of God, and that by believing you may have life in his '
            'name&rdquo; (20:31). The Gospel was written to produce and sustain faith in the person '
            'of Jesus as divine Son. It supplements the Synoptics rather than duplicates them: John '
            'omits the Baptism, the Transfiguration, the Olivet Discourse, and the institution of '
            'the Lord\u2019s Supper as a formal narrative, while providing material found nowhere else '
            '&mdash; the wedding at Cana, Nicodemus, the Samaritan woman, the raising of Lazarus, '
            'the Farewell Discourse (chs&thinsp;14&ndash;17), and the resurrection appearances to '
            'Mary Magdalene and Thomas. Its elevated Christology (&ldquo;In the beginning was the '
            'Word&rdquo;) addresses late first-century challenges to the full divinity of Christ and '
            'lays the foundation for all subsequent trinitarian theology.'
        ),
        'vhl_places': ['Jerusalem', 'Galilee', 'Judea', 'Samaria', 'Bethany', 'Cana',
                       'Jordan', 'temple', 'synagogue', 'Capernaum'],
        'vhl_people': ['Jesus', 'disciples', 'Pharisees', 'Jews', 'Peter', 'Thomas', 'Philip',
                       'Mary', 'Martha', 'Lazarus', 'Pilate', 'Nicodemus', 'crowd'],
        'vhl_time':   ['day', 'days', 'night', 'morning', 'hour', 'now', 'today', 'third day',
                       'abide', 'remain', 'eternal', 'before Abraham'],
        'vhl_key':    ['Word', 'light', 'life', 'love', 'truth', 'glory', 'believe', 'sent',
                       'Father', 'Son', 'Spirit', 'witness', 'eternal life', 'sign'],
    },


    'acts': {
        'is_nt': True,
        'auth': (
            '<strong>Author:</strong> Luke the physician (Col 4:14), a Gentile convert and '
            'travelling companion of Paul. Acts is the second volume of a two-part work addressed '
            'to Theophilus (Luke 1:3; Acts 1:1). The &ldquo;we&rdquo; sections (16:10&ndash;17; '
            '20:5&ndash;21:18; 27:1&ndash;28:16) place Luke as an eyewitness participant in '
            'significant portions of the Pauline mission. Irenaeus, Clement of Alexandria, '
            'and the Muratorian Canon (c.&thinsp;AD&thinsp;170) unanimously identify Luke as author.'
            '\n\n'
            '<strong>When written:</strong> c.&thinsp;AD&thinsp;62&ndash;64, most likely during '
            "Paul's Roman imprisonment (28:30&ndash;31). The abrupt ending &mdash; Paul awaiting "
            'trial &mdash; is most naturally explained if Luke wrote before the outcome was known. '
            'The silence about Jerusalem&rsquo;s destruction (AD&thinsp;70) and Paul&rsquo;s death '
            '(c.&thinsp;AD&thinsp;67) supports an early 60s date.'
            '\n\n'
            '<strong>What prompted it:</strong> Luke traces the Gospel from Jerusalem to Rome, '
            'fulfilling the commission of 1:8 (&ldquo;you will be my witnesses in Jerusalem, and '
            'in all Judea and Samaria, and to the ends of the earth&rdquo;). Acts defends the '
            'legitimacy of the Gentile mission, demonstrates the continuity of the church with '
            'Israel, and shows that the gospel&rsquo;s advance is providentially directed through '
            'opposition, imprisonment, and persecution. It is the indispensable bridge between '
            'the Gospels and the Epistles.'
        ),
        'vhl_places': ['Jerusalem','Antioch','Rome','Ephesus','Corinth','Philippi',
                       'Athens','Caesarea','Damascus','Samaria','Judea','Galatia',
                       'synagogue','temple','Macedonia'],
        'vhl_people': ['Paul','Peter','Barnabas','Stephen','Philip','James','Silas',
                       'Timothy','Apollos','Herod','Felix','Festus','Agrippa',
                       'disciples','apostles','elders','Ananias','Cornelius'],
        'vhl_time':   ['day','days','night','morning','hour','years','year',
                       'suddenly','at once','three days','sabbath','Pentecost'],
        'vhl_key':    ['Spirit','repentance','baptized','believe','witness','gospel',
                       'resurrection','kingdom','salvation','Holy Spirit','boldly',
                       'signs','wonders','name','Word','grace','faith','Gentiles'],
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
    return f'<div id="{pid}" class="anno-panel heb-text-panel"><h4>{label}</h4>{rows}</div>'

def hist_panel(pid, text):
    return f'<div id="{pid}" class="anno-panel hist"><h4>Historical Context</h4><p>{text}</p></div>'

def ctx_panel(pid, text):
    return f'<div id="{pid}" class="anno-panel ctx"><h4>Context</h4><p>{text}</p></div>'

def cross_panel(pid, refs):
    items = ''.join(f'<li><span class="ref-cite">{c}</span><span class="ref-text">{t}</span></li>' for c,t in refs)
    return f'<div id="{pid}" class="anno-panel cross-ref"><h4>Cross-Reference</h4><ul class="cross-ref-list">{items}</ul></div>'

def poi_panel(pid, entries):
    """Build a Places panel.

    entries — list of 3-tuples: (name, coords, text)
        name    str  place name, e.g. 'Shechem'
        coords  str  modern location / region, e.g. 'Central Canaan hill country'
        text    str  explanatory paragraph
    """
    inner = ''.join(
        f'<div class="poi-entry">'
        f'<div class="poi-name">{n}</div>'
        f'<div class="poi-coords">{c}</div>'
        f'<div class="poi-text">{t}</div>'
        f'</div>'
        for n, c, t in entries
    )
    return (f'<div id="{pid}" class="anno-panel poi-panel">'
            f'<h4>Places</h4>{inner}</div>')

# ── Canonical timeline CSS ────────────────────────────────────────────────
# Injected into chapters that receive tl-panels via patch scripts.
# Values must match EXTRA_CSS above. Update both together.
TL_CSS = (
    '.tl-visual{position:relative;margin:.5rem 0 .3rem;}'
    '.tl-spine{position:absolute;left:144px;top:8px;bottom:8px;width:2px;'
    'background:linear-gradient(to bottom,transparent,#4a6888 6%,#4a6888 94%,transparent);pointer-events:none;}'
    '.tl-event{position:relative;display:grid;grid-template-columns:130px 28px 1fr;'
    'grid-template-rows:auto auto;align-items:start;padding:6px 0;}'
    '.tl-date{grid-column:1;grid-row:1;text-align:right;font-family:\'Cinzel\',serif;'
    'font-size:.63rem;color:#7a9ab8;line-height:1.6;padding-right:10px;white-space:nowrap;}'
    '.tl-dot-wrap{grid-column:2;grid-row:1 / span 2;display:flex;flex-direction:column;'
    'align-items:center;padding-top:4px;}'
    '.tl-dot{width:10px;height:10px;border-radius:50%;background:#304858;'
    'border:2px solid #4a6888;position:relative;z-index:1;flex-shrink:0;}'
    '.tl-body{grid-column:3;grid-row:1 / span 2;padding-left:12px;}'
    '.tl-name{font-size:.78rem;color:#8ab8d8;line-height:1.6;}'
    '.tl-text{font-size:.78rem;color:var(--text);line-height:1.6;margin-top:.25rem;'
    'padding-top:.25rem;border-top:1px solid rgba(74,104,136,.2);}'
    '.tl-event.current .tl-dot{width:13px;height:13px;background:#c0d8f0;'
    'border-color:#e8f4ff;box-shadow:0 0 7px rgba(192,216,240,.55);margin-top:1px;}'
    '.tl-event.current .tl-date{color:#c0d8f0;}'
    '.tl-event.current .tl-name{color:#e8f4ff;font-weight:600;}'
    '.tl-event.current .tl-text{border-color:rgba(192,216,240,.2);color:var(--text);}'
    '.tl-range{display:flex;justify-content:space-between;font-size:.63rem;'
    'color:var(--text-muted);font-style:italic;padding:.2rem 0 0 170px;}'
    '.tl-caption{font-size:.72rem;color:var(--text-muted);font-style:italic;margin-top:.4rem;}'
)

def tl_panel(pid, items, range_start=None, range_end=None, caption=None):
    """Build a visual proportional timeline panel.

    items — list of dicts or 5-tuples:
        (date_label, name, text, is_current, year_for_pos)
        • date_label  str   e.g. 'c. 2091 BC'
        • name        str   short event label
        • text        str   explanatory text (shown only for is_current=True entries, or pass '' to skip)
        • is_current  bool  highlights this event as the passage being studied
        • year_for_pos int  numeric year (positive=AD, negative=BC) for proportional placement;
                           pass None to distribute events evenly

    range_start, range_end — int years (negative=BC) for the range labels shown at bottom.
        If omitted, derived from item years with 10% padding.
    caption — optional italic note at bottom (e.g. 'Traditional chronology; dates approximate.')
    """
    # Normalise items to dicts
    entries = []
    for item in items:
        if isinstance(item, dict):
            entries.append(item)
        else:
            # Unpack tuple (date_label, name, text, is_current, year_for_pos)
            dl, nm, tx, cur, yr = (list(item) + [None, None, False, None, None])[:5]
            entries.append({'date': dl, 'name': nm, 'text': tx or '',
                            'current': bool(cur), 'year': yr})

    # Determine numeric years for positioning
    years = [e.get('year') for e in entries]
    if all(y is not None for y in years):
        ys = sorted(years)
        lo, hi = ys[0], ys[-1]
        span = (hi - lo) or 1
        pad = span * 0.10
        r0 = lo - pad if range_start is None else range_start
        r1 = hi + pad if range_end   is None else range_end
        total = (r1 - r0) or 1
        def pct(y): return round((y - r0) / total * 100, 1)
        positions = [pct(e['year']) for e in entries]
    else:
        # Even distribution
        n = len(entries)
        positions = [round(i / max(n-1,1) * 100, 1) for i in range(n)]
        r0 = range_start or 0
        r1 = range_end   or 0

    # Build event rows
    rows_html = ''
    for i, (e, pos) in enumerate(zip(entries, positions)):
        cur_cls = ' current' if e.get('current') else ''
        text_html = (f'<div class="tl-text">{e["text"]}</div>'
                     if e.get('text') else '')
        rows_html += (
            f'<div class="tl-event{cur_cls}">'
            f'<div class="tl-date">{e["date"]}</div>'
            f'<div class="tl-dot-wrap"><div class="tl-dot"></div></div>'
            f'<div class="tl-body">'
            f'<div class="tl-name">{e["name"]}</div>'
            f'{text_html}'
            f'</div></div>\n'
        )

    # Range labels
    def yr_label(y):
        if y is None: return ''
        yi = int(y)
        return f'c. {abs(yi)} {"BC" if yi < 0 else "AD"}'

    range_html = ''
    if r0 != 0 or r1 != 0:
        range_html = (f'<div class="tl-range">'
                      f'<span>{yr_label(r0)}</span>'
                      f'<span>{yr_label(r1)}</span>'
                      f'</div>')

    cap_html = f'<p class="tl-caption">{caption}</p>' if caption else ''

    return (f'<div id="{pid}" class="anno-panel tl-panel">'
            f'<h4>Timeline</h4>'
            f'<div class="tl-visual">'
            f'<div class="tl-spine"></div>'
            f'{rows_html}'
            f'</div>'
            f'{range_html}'
            f'{cap_html}'
            f'</div>')


def plan_section_panels(section_header, verse_range, section_text_sample=''):
    """
    PLANNING HELPER: call during chapter design, before writing data.
    Evaluates a section and prints whether Places and Timeline panels add value.

    Arguments:
        section_header       str  e.g. 'Verses 1-9 — The Call of Abram'
        verse_range          str  e.g. '1-9'
        section_text_sample  str  optional: first sentence of section content

    Returns dict: {places, timeline, reasons, notes} where values are YES/MAYBE/NO

    PLACES YES when: named locations are CENTRAL to the section; travel/movement
    shapes the theology; place names carry loaded covenant history (Bethel, Sinai,
    Golgotha, Goshen etc.); geography is the stage (gate, threshing floor, tomb).
    PLACES NO when: pure dialogue with no travel; law/aphorism; Proverbs (skip
    entirely — no narrative geography); place named once as incidental backdrop.

    TIMELINE YES when: age markers ('was 75 years old'); elapsed time ('after 7
    years'); calendar dates; genealogies (ALWAYS); Passion Week (ALWAYS Matt 21-28);
    named time spans ('40 years', '430 years', '3 days'); covenant-clock passages.
    TIMELINE NO when: atemporal wisdom; law with no narrative time anchor; Proverbs.

    SPAN: ~1000-year window. 4-5 context events (label-only) before/after the
    highlighted passage. Current event MUST have tl-text (1-3 sentences on why
    the timing matters theologically).
    """
    h = section_header.lower()
    t = section_text_sample.lower()
    combined = h + ' ' + t
    reasons, notes = [], []

    # Places signals
    p_yes_words = ['went', 'came', 'fled', 'crossed', 'returned', 'traveled',
                   'set out', 'entered', 'left', 'arrived', 'descended', 'ascended',
                   'journey', 'road', 'route', 'wilderness', 'desert', 'mountain',
                   'river', 'sea', 'egypt', 'canaan', 'sinai', 'moab', 'galilee',
                   'jerusalem', 'bethlehem', 'capernaum', 'jericho', 'nazareth',
                   'jordan', 'flight', 'exile', 'departure', 'camp', 'settlement',
                   'city gate', 'gate', 'threshing floor', 'field', 'tomb', 'garden',
                   'temple', 'tabernacle', 'horeb', 'bethel', 'hebron', 'goshen']
    p_no_words  = ['proverb', 'blessed are', 'you have heard', 'do not', 'whoever',
                   'a wise', 'the fool', 'like a', 'better than', 'the law says',
                   'gentle answer', 'answer turns']
    p_hits = [w for w in p_yes_words if w in combined]
    p_veto = any(w in combined for w in p_no_words) and not p_hits

    if p_veto:
        places = 'NO';   reasons.append('Places NO: wisdom/law content — no narrative geography')
    elif len(p_hits) >= 2:
        places = 'YES';  reasons.append(f'Places YES: geography signals — {", ".join(p_hits[:3])}')
        notes.append('Identify 2-4 locations central to this section (name, modern coords, theological significance)')
    elif len(p_hits) == 1:
        places = 'MAYBE'; reasons.append(f'Places MAYBE: one signal ({p_hits[0]}) — is it central or incidental?')
    else:
        places = 'NO';   reasons.append('Places NO: no travel or named geography signals')

    # Timeline signals
    genealogy = any(w in combined for w in ['genealogy', 'begot', 'begat', 'generations']) or combined.count('son of') >= 2
    passion   = any(w in combined for w in ['passover', 'gethsemane', 'crucifixion', 'burial',
                                             'resurrection', 'triumphal', 'that night', 'early morning'])
    t_yes_words = ['years old', 'year old', 'forty years', 'seven years', 'three days',
                   '40 days', '430 years', 'generation', 'first day', 'that day', 'morning',
                   'from that time', 'two days', 'long time', 'how long', 'harvest', 'feast',
                   'born', 'died at', 'age of']
    t_hits = [w for w in t_yes_words if w in combined]
    t_veto = any(w in combined for w in p_no_words) and not genealogy and not passion and not t_hits

    if genealogy:
        timeline = 'YES'; reasons.append('Timeline YES: genealogy — always include')
        notes.append("Span the full generational range; highlight this section's key generation as current event")
    elif passion:
        timeline = 'YES'; reasons.append('Timeline YES: Passion Week — include day-by-day chronology')
        notes.append('Use tight span (1-2 weeks); label Passion Week days precisely')
    elif t_veto:
        timeline = 'NO';  reasons.append('Timeline NO: wisdom/law — no chronological anchor')
    elif len(t_hits) >= 2:
        timeline = 'YES'; reasons.append(f'Timeline YES: time signals — {", ".join(t_hits[:3])}')
        notes.append('~1000-year window; 4-5 context events label-only; current event needs tl-text explanation')
    elif len(t_hits) == 1:
        timeline = 'MAYBE'; reasons.append(f'Timeline MAYBE: one signal ({t_hits[0]}) — does context add value?')
    else:
        timeline = 'NO';  reasons.append('Timeline NO: no specific time markers')

    result = {'places': places, 'timeline': timeline, 'reasons': reasons, 'notes': notes}
    icons = {'YES': '\033[92m✓\033[0m', 'MAYBE': '\033[93m?\033[0m', 'NO': '\033[90m✗\033[0m'}
    print(f'\n  {section_header} (vv.{verse_range})')
    print(f'    Places   [{icons[places]}] {places}')
    print(f'    Timeline [{icons[timeline]}] {timeline}')
    for r in reasons: print(f'      • {r}')
    for n in notes:   print(f'      → {n}')
    return result


def plan_chapter(book_name, chapter_num, sections):
    """
    CHAPTER PLANNING HELPER — call at the START of building a new chapter.
    Pass a list of (header, verse_range, first_verse_sample) tuples and
    receive a Places/Timeline recommendation for every section plus a summary.

    Usage:
        plan_chapter('Numbers', 13, [
            ('Verses 1-25 — Twelve Spies Sent', '1-25',
             'The LORD said to Moses, Send some men to explore the land of Canaan'),
            ('Verses 26-33 — The Report and the Fear', '26-33',
             'They came back to Moses and Aaron and the whole Israelite community'),
        ])

    After reviewing output, add places/timeline keys to sections that need them.
    REMINDER: chapters with tl/poi panels need tl-visual + poi-entry CSS in their
    <style> block. build_chapter() injects this via EXTRA_CSS automatically.
    Manual patch scripts must inject it explicitly.
    """
    print(f'\n\033[96m{"="*58}\033[0m')
    print(f'\033[96mCHAPTER PLAN: {book_name} {chapter_num}\033[0m')
    print(f'\033[96m{"="*58}\033[0m')
    results = [plan_section_panels(hdr, vr, samp) for hdr, vr, samp in sections]
    y_p = sum(1 for r in results if r['places']   == 'YES')
    y_t = sum(1 for r in results if r['timeline'] == 'YES')
    m_p = sum(1 for r in results if r['places']   == 'MAYBE')
    m_t = sum(1 for r in results if r['timeline'] == 'MAYBE')
    print(f'\n  SUMMARY  Places: {y_p} YES, {m_p} MAYBE  |  Timeline: {y_t} YES, {m_t} MAYBE')
    if y_p + m_p + y_t + m_t > 0:
        print('  REMINDER: any chapter receiving tl/poi panels needs poi-entry + tl-visual CSS.')
    print()
    return results


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
            center = center in (True, 'true', 'True')
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
        'hubbard':   ('Hubbard \u2014 NICOT Ruth',    'Robert L. Hubbard Jr., NICOT Commentary on Ruth (1988) \u2014 Scholarly Paraphrase'),
        'waltke':    ('Waltke \u2014 NICOT Proverbs', 'Bruce K. Waltke, NICOT Commentary on Proverbs (2 vols.) \u2014 Scholarly Paraphrase'),
        'calvin':    ('Calvin\u2019s Commentary',     'John Calvin, Commentaries \u2014 Faithful Paraphrase'),
        'robertson': ('Robertson \u2014 Word Pictures','A.T. Robertson, Word Pictures in the New Testament \u2014 Public Domain'),
        'catena':    ('Catena Aurea',                  'Thomas Aquinas (compiler), Catena Aurea \u2014 Patristic Commentary, Public Domain'),
        'netbible':  ('NET Bible Notes',               'NET Bible Full Notes Edition \u2014 Biblical Studies Press'),
        'marcus':    ('Marcus \u2014 Anchor Bible',     'Joel Marcus, Mark 1\u20138 / 8\u201316, Anchor Bible (2000/2009) \u2014 Scholarly Paraphrase'),
        'rhoads':    ('Rhoads \u2014 Mark as Story',   'David Rhoads & Donald Michie, Mark as Story (3rd ed., 2012) \u2014 Scholarly Paraphrase'),
        'keener':    ('Keener \u2014 Acts Commentary',  'Craig S. Keener, Acts: An Exegetical Commentary (4 vols., 2012\u20132015) \u2014 Scholarly Paraphrase'),
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
            _sw + '\n' + HISTORY_JS + '\n' +
            f'<script>window.QNAV_CURRENT="{book_dir}/{book_name}_{ch}.html";</script>\n' +
            '<script src="../qnav.js"></script>\n</body></html>')
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
      places      list[(name, coords, text)]  [OPTIONAL]
                  name=place name, coords=modern location, text=significance para
                  INCLUDE when: named locations are CENTRAL to the section's meaning;
                  geography shapes narrative or theology; movement between places
                  matters; a place name carries loaded history (e.g. Bethel, Sinai,
                  Golgotha). SKIP when: pure dialogue/law/aphorism; location is
                  incidental backdrop; Proverbs-style wisdom (no narrative geography).
      people_sec  list[(name, role, text)]    [OPTIONAL] Section-level people
      timeline    list[dict]  [OPTIONAL]  Each dict: {date, name, text, current, year}
                  date=display string e.g.'c. 2091 BC', name=short event label,
                  text=explanatory note (shown only when current=True),
                  current=bool (True = highlighted as this passage),
                  year=int negative=BC e.g. -2091 for proportional placement.
                  INCLUDE when: section has specific time markers (ages, elapsed
                  time, calendar dates, numbered days); genealogies (always);
                  meaning improves with ~1000-year context window; Passion Week
                  chronology. SKIP when: atemporal wisdom/law; time is irrelevant.
                  SPAN: ~1000-year window around the passage. Include 4-5 context
                  events. The current event MUST have a tl-text explanation (1-3
                  sentences on why the timing matters). Other events label-only.
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
        if 'hubbard'    in sec and in_scope('hubbard'):    btns.append(('hubbard',   'Hubbard',     f'{sid}-hubbard'))
        if 'waltke'     in sec and in_scope('waltke'):     btns.append(('waltke',    'Waltke',      f'{sid}-waltke'))
        if 'calvin'     in sec and in_scope('calvin'):     btns.append(('calvin',    'Calvin',      f'{sid}-calvin'))
        if 'netbible'   in sec and in_scope('netbible'):   btns.append(('netbible',  'NET Notes',   f'{sid}-net'))
        if 'robertson'  in sec and in_scope('robertson'):  btns.append(('robertson', 'Robertson',   f'{sid}-robertson'))
        if 'catena'     in sec and in_scope('catena'):     btns.append(('catena',    'Catena Aurea',f'{sid}-catena'))
        if 'marcus'     in sec and in_scope('marcus'):     btns.append(('marcus',    'Marcus',      f'{sid}-marcus'))
        if 'rhoads'     in sec and in_scope('rhoads'):     btns.append(('rhoads',    'Rhoads',      f'{sid}-rhoads'))
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
        if 'hubbard'  in sec and in_scope('hubbard'):   panels_html += commentary_panel(f'{sid}-hubbard',  'hubbard',   sec['hubbard'])
        if 'waltke'   in sec and in_scope('waltke'):    panels_html += commentary_panel(f'{sid}-waltke',   'waltke',    sec['waltke'])
        if 'calvin'   in sec and in_scope('calvin'):    panels_html += commentary_panel(f'{sid}-calvin',   'calvin',    sec['calvin'])
        if 'netbible' in sec and in_scope('netbible'):  panels_html += commentary_panel(f'{sid}-net',      'netbible',  sec['netbible'])
        if 'robertson' in sec and in_scope('robertson'): panels_html += commentary_panel(f'{sid}-robertson','robertson', sec['robertson'])
        if 'catena'   in sec and in_scope('catena'):    panels_html += commentary_panel(f'{sid}-catena',   'catena',    sec['catena'])
        if 'marcus'   in sec and in_scope('marcus'):    panels_html += commentary_panel(f'{sid}-marcus',   'marcus',    sec['marcus'])
        if 'rhoads'   in sec and in_scope('rhoads'):    panels_html += commentary_panel(f'{sid}-rhoads',   'rhoads',    sec['rhoads'])
        if 'keener'   in sec and in_scope('keener'):    panels_html += commentary_panel(f'{sid}-keener',   'keener',    sec['keener'])

        sections_html += (f'<div class="section">'
                          f'<div class="section-header">{sec["header"]}</div>'
                          f'{verses_html}{btn_html}{panels_html}</div>')

    # --- hoist chapter-level keys from sections if accidentally placed there ---
    for key in ('textual', 'debate', 'hebtext', 'themes', 'lit', 'ppl_sec',
                'sarna', 'alter', 'hubbard', 'waltke', 'calvin', 'netbible'):
        for sec in data.get('sections', []):
            if key in sec:
                if key not in data:
                    data[key] = sec.pop(key)
                else:
                    sec.pop(key)

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
