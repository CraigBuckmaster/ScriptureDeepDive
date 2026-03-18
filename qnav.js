// qnav.js — shared quick-navigation panel for Scripture Deep Dive
// Panel built DYNAMICALLY from books.js (BOOKS array) — do not hardcode books here.
// Add a book: update REGISTRY in shared.py, run rebuild_books_js(). No changes needed here.

(function() {
  // ── Inject CSS ──────────────────────────────────────────────────────────
  var style = document.createElement('style');
  style.textContent = '.qnav-overlay{display:none;position:fixed;inset:0;z-index:200;background:rgba(0,0,0,.72);backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);}\n.qnav-overlay.open{display:flex;flex-direction:column;}\n.qnav-panel{background:#0d0b07;border-bottom:1px solid #3a2e18;max-height:82vh;overflow-y:auto;overscroll-behavior:contain;display:flex;flex-direction:column;}\n.qnav-header{display:flex;align-items:center;gap:.6rem;padding:.75rem .9rem;border-bottom:1px solid rgba(58,46,24,.5);position:sticky;top:0;background:#0d0b07;z-index:1;}\n.qnav-search-wrap{flex:1;position:relative;}\n.qnav-search-icon{position:absolute;left:.65rem;top:50%;transform:translateY(-50%);color:#5a4a30;font-size:.78rem;pointer-events:none;}\n.qnav-search{width:100%;background:rgba(255,255,255,.06);border:1px solid rgba(58,46,24,.8);border-radius:4px;padding:.42rem .75rem .42rem 2rem;color:#f0e8d8;font-family:\'Source Sans 3\',sans-serif;font-size:.88rem;outline:none;transition:border-color .15s;}\n.qnav-search:focus{border-color:#8b6914;}\n.qnav-search::placeholder{color:#4a3a22;}\n.qnav-close{background:none;border:1px solid rgba(58,46,24,.6);border-radius:4px;color:#7a6a50;cursor:pointer;padding:.35rem .65rem;font-size:.72rem;font-family:\'Source Sans 3\',sans-serif;letter-spacing:.04em;transition:all .15s;flex-shrink:0;white-space:nowrap;}\n.qnav-close:hover{border-color:#8b6914;color:#c9a84c;}\n.qnav-body{overflow-y:auto;}\n.qnav-testament{border-bottom:1px solid rgba(58,46,24,.25);}.qnav-testament-btn{width:100%;background:transparent;border:none;cursor:pointer;padding:.55rem .9rem;display:flex;justify-content:space-between;align-items:center;transition:background .12s;-webkit-appearance:none;}.qnav-testament-btn:hover{background:rgba(255,255,255,.03);}.qnav-testament-label{font-family:\'Cinzel\',serif;font-size:.58rem;font-weight:600;letter-spacing:.2em;text-transform:uppercase;color:#c9a84c;}.qnav-testament-chev{font-size:.48rem;color:#c9a84c;transition:transform .2s;}.qnav-testament.open .qnav-testament-chev{transform:rotate(180deg);}.qnav-testament-books{display:none;}.qnav-testament.open .qnav-testament-books{display:block;}\n.qnav-book{border-bottom:1px solid rgba(58,46,24,.18);}\n.qnav-book-btn{width:100%;background:none;border:none;cursor:pointer;padding:.48rem .9rem;display:flex;justify-content:space-between;align-items:center;gap:.5rem;transition:background .12s;}\n.qnav-book-btn:hover{background:rgba(255,255,255,.04);}\n.qnav-book-name{font-family:\'EB Garamond\',serif;font-size:.98rem;color:#c8c0a0;text-align:left;display:flex;align-items:center;gap:.5rem;}\n.qnav-live-dot{width:6px;height:6px;border-radius:50%;background:#70d098;flex-shrink:0;box-shadow:0 0 5px rgba(112,208,152,.5);}\n.qnav-book-meta{display:flex;align-items:center;gap:.4rem;flex-shrink:0;}\n.qnav-ch-count{font-family:\'Source Sans 3\',sans-serif;font-size:.6rem;color:#4a3a22;letter-spacing:.04em;}\n.qnav-book-chev{font-size:.5rem;color:#4a3a22;transition:transform .2s;}\n.qnav-book.open .qnav-book-chev{transform:rotate(180deg);}\n.qnav-ch-grid{display:none;padding:.4rem .9rem .7rem;}\n.qnav-book.open .qnav-ch-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(52px,1fr));gap:.3rem;}\n.qnav-ch-btn{background:rgba(255,255,255,.04);border:1px solid rgba(58,46,24,.4);border-radius:3px;color:#c8c0a0;font-family:\'Source Sans 3\',sans-serif;font-size:.72rem;padding:.3rem .4rem;text-align:center;text-decoration:none;transition:all .12s;display:block;}\n.qnav-ch-btn:hover,.qnav-ch-btn.live{border-color:#8b6914;color:#c9a84c;}\n.qnav-ch-btn.current{background:rgba(201,168,76,.15);border-color:#c9a84c;color:#e8c870;font-weight:600;}\n.qnav-dismiss{flex:1;cursor:pointer;}\n\n.qnav-search-results{padding:.4rem .5rem;max-height:420px;overflow-y:auto;}\n.qnav-verse-result{display:flex;flex-direction:column;gap:.2rem;padding:.5rem .65rem;\n  background:rgba(255,255,255,.03);border:1px solid var(--border);border-radius:4px;\n  margin-bottom:.3rem;text-decoration:none;transition:background .12s;cursor:pointer;}\n.qnav-verse-result:hover{background:rgba(201,168,76,.08);border-color:var(--gold-dim);}\n.qnav-vref{font-family:\'Cinzel\',serif;font-size:.62rem;font-weight:600;letter-spacing:.1em;\n  color:var(--gold);text-transform:uppercase;}\n.qnav-vsnip{font-family:\'Source Sans 3\',sans-serif;font-size:.78rem;color:var(--text-dim);\n  line-height:1.45;}\n.qnav-vsnip em{color:var(--gold-bright);font-style:normal;font-weight:600;}\n.qnav-no-results{font-family:\'Source Sans 3\',sans-serif;font-size:.78rem;color:var(--text-muted);\n  padding:.5rem .65rem;text-align:center;}\n\n\n/* ── Textual Notes panel ─────────────────────────────── */\n.tx-panel{--tx-bg:#0e1218;--tx-border:#2a4060;--tx-accent:#70b8e8;}\n.tx-panel.open{background:var(--tx-bg);border-color:var(--tx-border);}\n.tx-panel h4{color:var(--tx-accent);}\n.tx-item{margin-bottom:1rem;padding-bottom:1rem;border-bottom:1px solid rgba(42,64,96,.4);}\n.tx-item:last-child{border-bottom:none;margin-bottom:0;padding-bottom:0;}\n.tx-header{display:flex;align-items:baseline;gap:.6rem;margin-bottom:.35rem;}\n.tx-ref{font-family:\'Cinzel\',serif;font-size:.68rem;color:var(--tx-accent);flex-shrink:0;}\n.tx-issue{font-family:\'Source Sans 3\',sans-serif;font-size:.78rem;font-weight:600;color:#c0d8f0;}\n.tx-variants{font-family:\'Source Sans 3\',sans-serif;font-size:.8rem;color:#b0c8e0;line-height:1.6;margin-bottom:.3rem;}\n.tx-sig{font-family:\'EB Garamond\',serif;font-size:.88rem;color:#90a8c0;font-style:italic;line-height:1.5;}\n.tx-ms{font-family:\'Cinzel\',serif;font-size:.65rem;color:#c9a84c;background:rgba(201,168,76,.1);\n       padding:.05rem .3rem;border-radius:2px;margin-right:.2rem;}\n.tx-lxx{font-family:\'Cinzel\',serif;font-size:.65rem;color:#70b8e8;background:rgba(112,184,232,.1);\n        padding:.05rem .3rem;border-radius:2px;margin-right:.2rem;}\n.anno-trigger.textual{color:#70b8e8;border-color:#2a4060;background:rgba(42,64,96,.12);}\n\n/* ── Scholarly Debates panel ─────────────────────────── */\n.db-panel{--db-bg:#120d18;--db-border:#3a2060;--db-accent:#a870e8;}\n.db-panel.open{background:var(--db-bg);border-color:var(--db-border);}\n.db-panel h4{color:var(--db-accent);}\n.db-debate{margin-bottom:1.2rem;padding-bottom:1.2rem;border-bottom:1px solid rgba(58,32,96,.4);}\n.db-debate:last-child{border-bottom:none;margin-bottom:0;padding-bottom:0;}\n.db-title{font-family:\'Cinzel\',serif;font-size:.78rem;color:var(--db-accent);\n          letter-spacing:.05em;margin-bottom:.6rem;}\n.db-positions{display:flex;flex-direction:column;gap:.5rem;margin-bottom:.6rem;}\n.db-position{background:rgba(58,32,96,.15);border:1px solid rgba(58,32,96,.3);\n             border-radius:4px;padding:.5rem .7rem;}\n.db-pos-name{font-family:\'Source Sans 3\',sans-serif;font-size:.75rem;font-weight:700;\n             color:#c8a8f0;margin-bottom:.15rem;}\n.db-proponents{font-family:\'Source Sans 3\',sans-serif;font-size:.68rem;color:#8868a8;\n               font-style:italic;margin-bottom:.25rem;}\n.db-argument{font-family:\'EB Garamond\',serif;font-size:.88rem;color:#b098d0;line-height:1.55;}\n.db-synthesis{font-family:\'Source Sans 3\',sans-serif;font-size:.8rem;color:#a090c0;\n              background:rgba(168,112,232,.08);border-left:2px solid var(--db-accent);\n              padding:.4rem .6rem;line-height:1.55;}\n.anno-trigger.debate{color:#a870e8;border-color:#3a2060;background:rgba(58,32,96,.12);}\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n/* ==EXTRA_CSS_START== */\n/* ════════════════════════════════════════════════════════\n   BUTTON SYSTEM — corrected layer (overrides original CSS)\n   ════════════════════════════════════════════════════════ */\n\n/* 1. Font size: .72rem → .8rem for readability + tap target */\n.anno-trigger{font-size:.8rem !important;}\n\n/* Chev transition + rotation — applies to ALL anno-trigger buttons\n   (section-level new chapters have .chev; scholarly block no longer does) */\n.anno-trigger .chev{transition:transform .25s;}\n.anno-trigger.active .chev{transform:rotate(180deg);}\n\n/* Align scholarly-buttons container to match .btn-row */\n.scholarly-buttons{gap:.4rem !important;margin:.35rem 0 .55rem !important;}\n\n/* 2. Active state: clear left-bar indicator + brighter text\n      Users can see at a glance which panels are open         */\n.anno-trigger.active{\n  box-shadow:inset 3px 0 0 currentColor,\n             inset 0 1px 0 rgba(255,255,255,.12),\n             0 0 0 1px rgba(255,255,255,.06),\n             0 2px 8px rgba(0,0,0,.5) !important;\n  filter:brightness(1.25);\n}\n\n/* 3. Background opacity raised to .22 across section-level\n      buttons so they read as distinct interactive surfaces   */\n.anno-trigger.hebrew     {background:rgba(122,48,80,.22)   !important;}\n.anno-trigger.history    {background:rgba(32,64,112,.22)   !important;}\n.anno-trigger.context    {background:rgba(20,80,48,.22)    !important;}\n.anno-trigger.cross      {background:rgba(90,64,0,.22)     !important;}\n.anno-trigger.places     {background:rgba(12,80,32,.22)    !important;}\n.anno-trigger.people     {background:rgba(120,48,12,.22)   !important;}\n.anno-trigger.timeline   {background:rgba(32,48,100,.22)   !important;}\n.anno-trigger.macarthur  {background:rgba(100,20,32,.22)   !important;\n                          color:#e05a6a !important;border-color:#882030 !important;}\n.anno-trigger.literary   {background:rgba(64,72,8,.22)     !important;}\n.anno-trigger.hebrew-text{background:rgba(64,48,0,.22)     !important;}\n.anno-trigger.threading  {background:rgba(40,40,100,.22)   !important;}\n.anno-trigger.textual    {background:rgba(32,64,100,.22)   !important;}\n.anno-trigger.debate     {background:rgba(56,24,96,.22)    !important;}\n\n/* 4. WCAG AA fixes for failing colours\n      macarthur: #c04050 (3.78:1) → #e05a6a (5.40:1)\n      sources:   #a05890 (3.97:1) → #c070a8 (5.66:1)         */\n.anno-trigger.macarthur{color:#e05a6a !important;border-color:#882030 !important;}\n.anno-trigger.sources  {color:#c070a8 !important;border-color:#743060 !important;\n                        background:rgba(100,40,80,.22) !important;}\n\n/* 5. SCHOLARLY BLOCK — unified gold theme\n      Matches the inline cross-ref button aesthetic: warm gold text,\n      dark amber background, gold-dim border. Clean and consistent.\n      Three rules replace the previous 33.                          */\n.scholarly-buttons .anno-trigger{\n  color:var(--gold)          !important;\n  border-color:var(--gold-dim) !important;\n  background:rgba(90,64,0,.22) !important;\n}\n.scholarly-buttons .anno-trigger:hover{\n  border-color:var(--gold)     !important;\n  background:rgba(90,64,0,.32) !important;\n}\n.scholarly-buttons .anno-trigger.active{\n  color:var(--gold-bright)     !important;\n  border-color:var(--gold)     !important;\n  background:rgba(90,64,0,.36) !important;\n  box-shadow:inset 3px 0 0 var(--gold),\n             inset 0 1px 0 rgba(255,255,255,.12),\n             0 0 0 1px rgba(255,255,255,.06),\n             0 2px 8px rgba(0,0,0,.5)       !important;\n  filter:brightness(1.15);\n}\n\n/* Themes button — also gold in scholarly context, own colour outside */\n.anno-trigger.themes{color:var(--gold);border-color:var(--gold-dim);background:rgba(90,64,0,.22);}\n.anno-trigger.themes:hover{border-color:var(--gold);background:rgba(90,64,0,.32);}\n\n/* The original base CSS has .scholarly-buttons .anno-trigger[onclick*="themes"]\n   with !important setting purple. Override it here with equal specificity + !important\n   coming later in the cascade.                                                        */\n.scholarly-buttons .anno-trigger[onclick*="themes"]{color:var(--gold) !important;border-color:var(--gold-dim) !important;background:rgba(90,64,0,.22) !important;}\n.scholarly-buttons .anno-trigger[onclick*="themes"]:hover{border-color:var(--gold) !important;background:rgba(90,64,0,.32) !important;}\n.scholarly-buttons .anno-trigger[onclick*="themes"].active{color:var(--gold-bright) !important;border-color:var(--gold) !important;background:rgba(90,64,0,.36) !important;box-shadow:inset 3px 0 0 var(--gold),inset 0 1px 0 rgba(255,255,255,.12),0 0 0 1px rgba(255,255,255,.06),0 2px 8px rgba(0,0,0,.5) !important;filter:brightness(1.15);}\n\n\n/* ── Commentary panels — per-commentator colour identity ─ */\n/* MacArthur: crimson (defined in base CSS, kept as-is)     */\n/* Sarna (JPS): deep teal — Jewish/academic register        */\n.anno-trigger.sarna{color:#4ec9b0;border-color:#1a6058;background:rgba(20,80,70,.22);}\n.anno-trigger.sarna:hover{border-color:#3aaa98;background:rgba(20,80,70,.32);}\n.anno-trigger.sarna.active{filter:brightness(1.25);}\n.com-panel.com-sarna{background:#060e0c;border-color:#1a6058;}\n.com-panel.com-sarna h4{color:#4ec9b0;}\n.com-panel.com-sarna .com-source{color:#4ec9b0;border-bottom-color:rgba(26,96,88,.4);}\n\n/* Alter (Literary): warm amber — literary/poetic register  */\n.anno-trigger.alter{color:#d4a853;border-color:#7a5820;background:rgba(90,60,10,.22);}\n.anno-trigger.alter:hover{border-color:#c09040;background:rgba(90,60,10,.32);}\n.anno-trigger.alter.active{filter:brightness(1.25);}\n.com-panel.com-alter{background:#0e0c06;border-color:#7a5820;}\n.com-panel.com-alter h4{color:#d4a853;}\n.com-panel.com-alter .com-source{color:#d4a853;border-bottom-color:rgba(122,88,32,.4);}\n\n/* Calvin: slate blue — Reformed/theological register       */\n.anno-trigger.calvin{color:#7ba7cc;border-color:#2a4870;background:rgba(28,56,90,.22);}\n.anno-trigger.calvin:hover{border-color:#5a88b8;background:rgba(28,56,90,.32);}\n.anno-trigger.calvin.active{filter:brightness(1.25);}\n.com-panel.com-calvin{background:#060810;border-color:#2a4870;}\n.com-panel.com-calvin h4{color:#7ba7cc;}\n.com-panel.com-calvin .com-source{color:#7ba7cc;border-bottom-color:rgba(42,72,112,.4);}\n\n/* Robertson (NT Greek): chartreuse-lime                    */\n.anno-trigger.robertson{color:#c8d870;border-color:#687830;background:rgba(80,96,20,.22);}\n.anno-trigger.robertson:hover{border-color:#a8b850;background:rgba(80,96,20,.32);}\n.anno-trigger.robertson.active{filter:brightness(1.25);}\n.com-panel.com-robertson{background:#0a0e04;border-color:#687830;}\n.com-panel.com-robertson h4{color:#c8d870;}\n.com-panel.com-robertson .com-source{color:#c8d870;border-bottom-color:rgba(104,120,48,.4);}\n\n/* Catena Aurea (Patristic): medium violet                  */\n.anno-trigger.catena{color:#b888d8;border-color:#6a3898;background:rgba(60,28,90,.22);}\n.anno-trigger.catena:hover{border-color:#9868c0;background:rgba(60,28,90,.32);}\n.anno-trigger.catena.active{filter:brightness(1.25);}\n.com-panel.com-catena{background:#0c080f;border-color:#6a3898;}\n.com-panel.com-catena h4{color:#b888d8;}\n.com-panel.com-catena .com-source{color:#b888d8;border-bottom-color:rgba(106,56,152,.4);}\n\n/* Hubbard (NICOT Ruth): warm olive — OT narrative/covenant register */\n.anno-trigger.hubbard{color:#a8c870;border-color:#507028;background:rgba(60,80,20,.22);}\n.anno-trigger.hubbard:hover{border-color:#80a848;background:rgba(60,80,20,.32);}\n.anno-trigger.hubbard.active{filter:brightness(1.25);}\n.com-panel.com-hubbard{background:#090e04;border-color:#507028;}\n.com-panel.com-hubbard h4{color:#a8c870;}\n.com-panel.com-hubbard .com-source{color:#a8c870;border-bottom-color:rgba(80,112,40,.4);}\n\n/* Waltke (NICOT Proverbs): warm rose-mauve — wisdom register */\n.anno-trigger.waltke{color:#e8a0b8;border-color:#883050;background:rgba(80,20,40,.22);}\n.anno-trigger.waltke:hover{border-color:#c06080;background:rgba(80,20,40,.32);}\n.anno-trigger.waltke.active{filter:brightness(1.25);}\n.com-panel.com-waltke{background:#0f0608;border-color:#883050;}\n.com-panel.com-waltke h4{color:#e8a0b8;}\n.com-panel.com-waltke .com-source{color:#e8a0b8;border-bottom-color:rgba(136,48,80,.4);}\n\n/* NET Bible Notes: pale sage                               */\n.anno-trigger.netbible{color:#d8e8d0;border-color:#688858;background:rgba(52,80,40,.22);}\n.anno-trigger.netbible:hover{border-color:#a8c890;background:rgba(52,80,40,.32);}\n.anno-trigger.netbible.active{filter:brightness(1.25);}\n.com-panel.com-netbible{background:#070e06;border-color:#688858;}\n.com-panel.com-netbible h4{color:#d8e8d0;}\n.com-panel.com-netbible .com-source{color:#d8e8d0;border-bottom-color:rgba(104,136,88,.4);}\n/* Marcus — Anchor Bible (teal-blue: historical-critical scholarship) */\n.anno-trigger.marcus{color:#70d8d8;border-color:#2a7878;background:rgba(20,80,80,.22);}\n.anno-trigger.marcus:hover{border-color:#50b8b8;background:rgba(20,80,80,.32);}\n.anno-trigger.marcus.active{filter:brightness(1.25);}\n.com-panel.com-marcus{background:#030d0d;border-color:#2a7878;}\n.com-panel.com-marcus h4{color:#70d8d8;}\n.com-panel.com-marcus .com-source{color:#70d8d8;border-bottom-color:rgba(42,120,120,.4);}\n/* Rhoads — Mark as Story (amber-gold: narrative/literary criticism) */\n.anno-trigger.rhoads{color:#e8c060;border-color:#886020;background:rgba(80,56,12,.22);}\n.anno-trigger.rhoads:hover{border-color:#c8a040;background:rgba(80,56,12,.32);}\n.anno-trigger.rhoads.active{filter:brightness(1.25);}\n.com-panel.com-rhoads{background:#0e0900;border-color:#886020;}\n.com-panel.com-rhoads h4{color:#e8c060;}\n.com-panel.com-rhoads .com-source{color:#e8c060;border-bottom-color:rgba(136,96,32,.4);}\n\n.tx-panel{--tx-bg:#0e1218;--tx-border:#2a4060;--tx-accent:#70b8e8;}\n.tx-panel.open{background:var(--tx-bg);border-color:var(--tx-border);}\n.tx-panel h4{color:var(--tx-accent);}\n.tx-item{margin-bottom:1rem;padding-bottom:1rem;border-bottom:1px solid rgba(42,64,96,.4);}\n.tx-item:last-child{border-bottom:none;margin-bottom:0;padding-bottom:0;}\n.tx-header{display:flex;align-items:baseline;gap:.6rem;margin-bottom:.35rem;}\n.tx-ref{font-family:\'Cinzel\',serif;font-size:.68rem;color:var(--tx-accent);flex-shrink:0;}\n.tx-issue{font-family:\'Source Sans 3\',sans-serif;font-size:.78rem;font-weight:600;color:#c0d8f0;}\n.tx-variants{font-family:\'Source Sans 3\',sans-serif;font-size:.8rem;color:#b0c8e0;line-height:1.6;margin-bottom:.3rem;}\n.tx-sig{font-family:\'EB Garamond\',serif;font-size:.88rem;color:#90a8c0;font-style:italic;line-height:1.5;}\n.tx-ms{font-family:\'Cinzel\',serif;font-size:.65rem;color:#c9a84c;background:rgba(201,168,76,.1);\n       padding:.05rem .3rem;border-radius:2px;margin-right:.2rem;}\n.tx-lxx{font-family:\'Cinzel\',serif;font-size:.65rem;color:#70b8e8;background:rgba(112,184,232,.1);\n        padding:.05rem .3rem;border-radius:2px;margin-right:.2rem;}\n\n/* ── Scholarly Debates panel ─────────────────────────── */\n.db-panel{--db-bg:#120d18;--db-border:#3a2060;--db-accent:#a870e8;}\n.db-panel.open{background:var(--db-bg);border-color:var(--db-border);}\n.db-panel h4{color:var(--db-accent);}\n.db-debate{margin-bottom:1.2rem;padding-bottom:1.2rem;border-bottom:1px solid rgba(58,32,96,.4);}\n.db-debate:last-child{border-bottom:none;margin-bottom:0;padding-bottom:0;}\n.db-title{font-family:\'Cinzel\',serif;font-size:.78rem;color:var(--db-accent);\n          letter-spacing:.05em;margin-bottom:.6rem;}\n.db-positions{display:flex;flex-direction:column;gap:.5rem;margin-bottom:.6rem;}\n.db-position{background:rgba(58,32,96,.15);border:1px solid rgba(58,32,96,.3);\n             border-radius:4px;padding:.5rem .7rem;}\n.db-pos-name{font-family:\'Source Sans 3\',sans-serif;font-size:.75rem;font-weight:700;\n             color:#c8a8f0;margin-bottom:.15rem;}\n.db-proponents{font-family:\'Source Sans 3\',sans-serif;font-size:.68rem;color:#8868a8;\n               font-style:italic;margin-bottom:.25rem;}\n.db-argument{font-family:\'EB Garamond\',serif;font-size:.88rem;color:#b098d0;line-height:1.55;}\n.db-synthesis{font-family:\'Source Sans 3\',sans-serif;font-size:.8rem;color:#a090c0;\n              background:rgba(168,112,232,.08);border-left:2px solid var(--db-accent);\n              padding:.4rem .6rem;line-height:1.55;}\n\n/* ── Places (POI) section panel ─────────────────────────────── */\n.poi-entry{padding:.7rem 0;border-bottom:1px solid rgba(26,96,40,.35);}\n.poi-entry:last-child{border-bottom:none;}\n.poi-name{font-family:\'Cinzel\',serif;font-size:.8rem;color:var(--poi-accent);margin-bottom:.2rem;}\n.poi-coords{font-size:.72rem;color:var(--text-muted);font-style:italic;margin-bottom:.35rem;}\n.poi-text{font-size:.82rem;color:var(--text);line-height:1.65;}\n\n/* ── Timeline section panel ─────────────────────────────────── */\n.tl-visual{position:relative;margin:.5rem 0 .3rem;}\n.tl-spine{position:absolute;left:144px;top:8px;bottom:8px;width:2px;background:linear-gradient(to bottom,transparent,#4a6888 6%,#4a6888 94%,transparent);pointer-events:none;}\n.tl-event{position:relative;display:grid;grid-template-columns:130px 28px 1fr;grid-template-rows:auto auto;align-items:start;padding:6px 0;}\n.tl-date{grid-column:1;grid-row:1;text-align:right;font-family:\'Cinzel\',serif;font-size:.63rem;color:#7a9ab8;line-height:1.6;padding-right:10px;white-space:nowrap;}\n.tl-dot-wrap{grid-column:2;grid-row:1 / span 2;display:flex;flex-direction:column;align-items:center;padding-top:4px;}\n.tl-dot{width:10px;height:10px;border-radius:50%;background:#304858;border:2px solid #4a6888;position:relative;z-index:1;flex-shrink:0;}\n.tl-body{grid-column:3;grid-row:1 / span 2;padding-left:12px;}\n.tl-name{font-size:.78rem;color:#8ab8d8;line-height:1.6;}\n.tl-text{font-size:.78rem;color:var(--text);line-height:1.6;margin-top:.25rem;padding-top:.25rem;border-top:1px solid rgba(74,104,136,.2);}\n.tl-event.current .tl-dot{width:13px;height:13px;background:#c0d8f0;border-color:#e8f4ff;box-shadow:0 0 7px rgba(192,216,240,.55);margin-top:1px;}\n.tl-event.current .tl-date{color:#c0d8f0;}\n.tl-event.current .tl-name{color:#e8f4ff;font-weight:600;}\n.tl-event.current .tl-text{border-color:rgba(192,216,240,.2);color:var(--text);}\n.tl-range{display:flex;justify-content:space-between;font-size:.63rem;color:var(--text-muted);font-style:italic;padding:.2rem 0 0 170px;}\n.tl-caption{font-size:.72rem;color:var(--text-muted);font-style:italic;margin-top:.4rem;}-top:1px;}\n.tl-event.current .tl-date{color:#c0d8f0;}\n.tl-event.current .tl-name{color:#e8f4ff;font-weight:600;}\n.tl-event.current .tl-text{border-color:rgba(192,216,240,.2);color:var(--text);}\n.tl-range{display:flex;justify-content:space-between;font-size:.63rem;color:var(--text-muted);font-style:italic;padding:.2rem 0 0 90px;}\n.tl-caption{font-size:.72rem;color:var(--text-muted);font-style:italic;margin-top:.4rem;}';
  document.head.appendChild(style);

  // ── Build panel HTML dynamically from BOOKS registry ────────────────────
  function buildPanel() {
    var books = window.BOOKS || [];
    function chGrid(b) {
      var h = '';
      for (var i = 1; i <= b.live; i++) {
        h += '<a href="../' + b.dir + '/' + b.name + '_' + i + '.html' +
             ' class="qnav-ch-btn live">Ch ' + i + '</a>';
      }
      return h;
    }
    function bookDiv(b) {
      return '<div class="qnav-book" id="qnav-book-' + b.dir + '">' +
             '<button class="qnav-book-btn" onclick="qnavToggleBook(\'' + b.dir + '\')">' +
             '<span class="qnav-book-name"><span class="qnav-live-dot"></span>' + b.name + '</span>' +
             '<span class="qnav-book-meta"><span class="qnav-book-chev">&#9660;</span></span>' +
             '</button>' +
             '<div class="qnav-ch-grid">' + chGrid(b) + '</div></div>';
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
           '<div class="qnav-search-wrap">' +
           '<span class="qnav-search-icon">&#128269;</span>' +
           '<input class="qnav-search" id="qnav-search-input" placeholder="Search verses..." oninput="qnavFilter(this.value)">' +
           '<button class="qnav-close" onclick="closeQnav()">Close</button></div>' +
           '<div class="qnav-body">' +
           '<div class="qnav-search-results" id="qnav-search-results" style="display:none"></div>' +
           '<div class="qnav-testament" id="qnav-t-ot">' +
           '<button class="qnav-testament-btn" onclick="qnavToggleTestament(\'ot\')"><span class="qnav-testament-label">Old Testament</span><span class="qnav-testament-chev">&#9660;</span></button>' +
           '<div class="qnav-testament-books">' + otHtml + '</div></div>' +
           '<div class="qnav-testament open" id="qnav-t-nt">' +
           '<button class="qnav-testament-btn" onclick="qnavToggleTestament(\'nt\')"><span class="qnav-testament-label">New Testament</span><span class="qnav-testament-chev">&#9660;</span></button>' +
           '<div class="qnav-testament-books">' + ntHtml + '</div></div>' +
           '</div></div><div class="qnav-dismiss" onclick="closeQnav()"></div></div>';
  }

  // ── Inject panel (books.js loads before qnav.js) ───────────────────────
  function injectPanel() {
    var div = document.createElement('div');
    div.innerHTML = buildPanel();
    document.body.appendChild(div.firstChild);
    highlightCurrent();
  }
  if (window.BOOKS) { injectPanel(); }
  else { window.addEventListener('load', injectPanel); }
})();

// ── Global qnav functions (called from onclick= in HTML) ─────────────────
function qnavToggleTestament(id){var el=document.getElementById('qnav-t-'+id);if(!el)return;el.classList.toggle('open');}

function openQnav(){var ol=document.getElementById('qnav-overlay');ol.classList.add('open');document.body.style.overflow='hidden';setTimeout(function(){var s=document.getElementById('qnav-search-input');if(s)s.focus();},80);var gen=document.getElementById('qnav-book-genesis');if(gen&&!gen.classList.contains('open'))qnavToggleBook('genesis');}
function closeQnav(){document.getElementById('qnav-overlay').classList.remove('open');document.body.style.overflow='';var s=document.getElementById('qnav-search-input');if(s){s.value='';qnavFilter('');}}
function qnavToggleBook(id){var el=document.getElementById('qnav-book-'+id);if(!el)return;var wasOpen=el.classList.contains('open');document.querySelectorAll('.qnav-book').forEach(function(b){b.classList.remove('open');});if(!wasOpen)el.classList.add('open');}

function qnavFilter(q) {
  q = q.trim().toLowerCase();
  const words = q.split(/\s+/).filter(w => w.length > 1);
  const panel = document.getElementById('qnav-search-results');

  // If empty — show normal chapter grid, hide results
  if (!q) {
    if (panel) { panel.innerHTML = ''; panel.style.display = 'none'; }
    document.querySelectorAll('.qnav-ch-grid').forEach(g => g.style.display = '');
    document.querySelectorAll('.qnav-book').forEach(b => b.style.display = '');
    return;
  }

  // Hide chapter grids while searching
  document.querySelectorAll('.qnav-ch-grid').forEach(g => g.style.display = 'none');
  document.querySelectorAll('.qnav-book').forEach(b => b.style.display = 'none');

  // Verse matches
  var verseMatches = q.length >= 2 ? VERSES.map(function(v) {
    var text = v.text.toLowerCase();
    var ref  = v.ref.toLowerCase();
    var score = 0;
    for (var i=0; i<words.length; i++) {
      if (text.indexOf(words[i]) > -1) score += 2;
      else if (ref.indexOf(words[i]) > -1) score += 1;
    }
    if (text.indexOf(q) > -1) score += 5;
    return { ref:v.ref, short:v.short, text:v.text, url:v.url, score:score };
  }).filter(function(v){ return v.score > 0; })
    .sort(function(a,b){ return b.score - a.score; })
    .slice(0, 12) : [];

  function hl(text, q, words) {
    var out = text;
    if (q.length > 2) {
      var rx = new RegExp('(' + q.replace(/[.*+?^${}()|[\]\\]/g,'\\$&') + ')','gi');
      out = out.replace(rx,'<em>$1</em>');
    }
    for (var i=0; i<words.length; i++) {
      if (out.toLowerCase().indexOf(words[i]) > -1) {
        var rx2 = new RegExp('(' + words[i].replace(/[.*+?^${}()|[\]\\]/g,'\\$&') + ')','gi');
        out = out.replace(rx2,'<em>$1</em>');
      }
    }
    return out;
  }

  var html = '';
  if (verseMatches.length === 0) {
    html = '<p class="qnav-no-results">No verses found for \u201c' + q + '\u201d</p>';
  } else {
    for (var i=0; i<verseMatches.length; i++) {
      var v = verseMatches[i];
      var snippet = v.text.length > 120 ? v.text.slice(0,117) + '\u2026' : v.text;
      // Path relative to current chapter page (../ prefix for chapter pages)
      var href = '../' + v.url;
      html += '<a href="' + href + '" class="qnav-verse-result">' +
              '<span class="qnav-vref">' + v.short + '</span>' +
              '<span class="qnav-vsnip">' + hl(snippet, q, words) + '</span>' +
              '</a>';
    }
  }

  if (!panel) {
    var p = document.createElement('div');
    p.id = 'qnav-search-results';
    p.className = 'qnav-search-results';
    var body = document.querySelector('.qnav-body');
    if (body) body.insertBefore(p, body.firstChild);
    p.innerHTML = html;
    p.style.display = 'block';
  } else {
    panel.innerHTML = html;
    panel.style.display = 'block';
  }
}

// ── Highlight current chapter and open its book ────────────────────────
function highlightCurrent() {
  var cur = window.QNAV_CURRENT || '';
  if (!cur) return;
  var parts = cur.split('/');
  if (parts.length < 2) return;
  var bookDir = parts[0];
  var chUrl = '../' + cur;
  document.querySelectorAll('.qnav-ch-btn').forEach(function(btn) {
    if (btn.getAttribute('href') === chUrl) btn.classList.add('current');
  });
  var bookEl = document.getElementById('qnav-book-' + bookDir);
  if (bookEl) {
    bookEl.classList.add('open');
    var t = bookEl.closest('.qnav-testament');
    if (t && !t.classList.contains('open')) t.classList.add('open');
  }
}
