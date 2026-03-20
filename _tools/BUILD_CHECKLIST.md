"""
NEW BOOK BUILD CHECKLIST — Scripture Deep Dive
═══════════════════════════════════════════════
Pull this file EVERY TIME before building a new book.
Run through EVERY section. No exceptions. No shortcuts.

Usage:
    view /home/claude/ScriptureDeepDive/_tools/BUILD_CHECKLIST.md

Last updated: SW 2.144 (15 books, 415 chapters)
"""

# ═══════════════════════════════════════════════════════════════════════════
# PHASE 0: PLANNING (before writing any code)
# ═══════════════════════════════════════════════════════════════════════════

PLANNING = """
□ Book name, directory name (e.g., '1_samuel'), display name (e.g., '1 Samuel')
□ Total chapters and verse counts (check verses/niv/ot/ or verses/niv/nt/)
□ NIV verse file exists? (verses/niv/{ot|nt}/{book}.js)
□ ESV verse file exists? (verses/esv/{ot|nt}/{book}.js)
□ Scholar roster: pick 2 book-specific + MacArthur + Calvin + NET Bible = 5 minimum
□ Chapter outline: title, section breaks (header, verse range, topic) for every chapter
□ People to add: who appears in this book that isn't already in people.html?
□ Timeline entries to add: key events in the book's era
□ ANE sources: what ancient Near Eastern material illuminates this book?
□ Textual notes: LXX variants, Dead Sea Scrolls, notable text-critical issues
□ Scholarly debate: 1-2 major interpretive controversies for the book
"""

# ═══════════════════════════════════════════════════════════════════════════
# PHASE 1: SHARED.PY INFRASTRUCTURE
# ═══════════════════════════════════════════════════════════════════════════

SHARED_PY = """
All changes go in _tools/shared.py. After EVERY change, verify syntax:
    python3 -c "import py_compile; py_compile.compile('_tools/shared.py', doraise=True)"

□ 1. REGISTRY — add entry in canonical order
      Format: ('book_dir', 'Display Name', total_chapters, 0, 'OT'|'NT', 'ot'|'nt')
      NOTE: live count starts at 0, set to total after chapters are built
      Canonical OT order: gen, ex, lev, num, deut, josh, judg, 1_samuel, ruth, ...
      Canonical NT order: matt, mark, luke, john, acts, ...

□ 2. BOOK_PREFIX — add short prefix for panel IDs
      Format: 'book_dir': 'prefix'  (e.g., 'judges': 'judg', '1_samuel': '1sa')

□ 3. BOOK_META — add full metadata dict after the preceding book
      Required keys:
        'is_nt': bool
        'auth': str (HTML — author, date, theme)
        'vhl_people': list[str]
        'vhl_places': list[str]
        'vhl_key': list[str]
        'vhl_time': list[str]  ← EASY TO FORGET

□ 4. COMMENTATOR_SCOPE — add book-specific scholars
      Format: 'scholar_key': ['book_dir']
      Universal scholars (macarthur, calvin, netbible) already cover all books.

□ 5. COMMENTATOR_META — add display name and source line
      Location: inside the META dict in commentary_panel() function
      Format: 'key': ('Display — Series', 'Full citation — Scholarly Paraphrase')

□ 6. COMMENTATOR CSS — add button + panel colors  ★ NEW CHECK ★
      Location: CSS string near top of shared.py (around line 126-260)
      Every new scholar needs ALL of these CSS rules:
        .anno-trigger.KEY{color:COLOR;border-color:BORDER;background:rgba(R,G,B,.22);}
        .anno-trigger.KEY:hover{border-color:HOVER;background:rgba(R,G,B,.32);}
        .anno-trigger.KEY.active{filter:brightness(1.25);}
        .com-panel.com-KEY{background:BG;border-color:BORDER;}
        .com-panel.com-KEY h4{color:COLOR;}
        .com-panel.com-KEY .com-source{color:COLOR;border-bottom-color:rgba(R,G,B,.4);}

      Existing color assignments (DO NOT REUSE):
        macarthur  #e05a6a (crimson)        sarna      #4ec9b0 (jade)
        alter      #d4a853 (amber)          calvin     #7ba7cc (slate blue)
        robertson  #c8d870 (yellow-green)   catena     #b888d8 (lavender)
        hubbard    #a8c870 (sage)           waltke     #e8a0b8 (rose)
        netbible   #d8e8d0 (pale sage)      marcus     #70d8d8 (teal)
        rhoads     #e8c060 (gold)           milgrom    #78d8a8 (mint)
        ashley     #f0c080 (peach)          keener     #a8c8f8 (sky blue)
        craigie    #d8b8f0 (lilac)          tigay      #e8d090 (wheat)
        hess       #60d0c0 (bright teal)    howard     #90b0e0 (slate blue)
        block      #e0a070 (copper)         webb       #90c890 (sage green)
        bergen     #d8a080 (sienna)         tsumura    #88b8d8 (steel blue)

□ 7. BUTTON + PANEL GENERATION — wire into build_chapter()
      Two places, both after the 'howard' lines:
        a) btns.append() — button creation (search: "in_scope('howard')")
        b) panels_html += commentary_panel() — panel creation (same area, ~30 lines below)

□ 8. ANE SOURCES — add to ane_map in _auto_src()
      Location: dict inside _auto_src() function
      Format: 'book_dir': [(title, quote, note), ...]  (3 entries recommended)

□ 9. TEXTUAL NOTES — add to tx_books in _auto_textual()
      Location: dict inside _auto_textual() function
      Format: 'book_dir': [(ref, issue_title, variants_html, significance), ...]
      NOTE: MUST be 4-tuples, not 3-tuples!

□ 10. PEOPLE_BIO — add new people entries
       Location: PEOPLE_BIO dict in shared.py
       Format varies — check existing entries for pattern

□ 11. TIMELINE_IDS — add timeline ID mappings for new people
       Location: _TIMELINE_IDS dict in shared.py
"""

# ═══════════════════════════════════════════════════════════════════════════
# PHASE 2: AUDIT.PY + SEARCH INFRASTRUCTURE
# ═══════════════════════════════════════════════════════════════════════════

AUDIT_FILES = """
□ 12. audit.py — BOOK_ROSTER
       Add: ('book_dir', 'Display Name', range(1, N+1), 'ot'|'nt')

□ 13. audit.py — SCHOLAR_KEYS
       Add: 'Display Name': ['scholar1', 'scholar2', 'calvin', 'netbible']
       (list the book-specific scholars + universal ones checked per-section)

□ 14. audit.py — OT_BOOKS or NT_BOOKS
       Add 'book_dir' to the appropriate list, in canonical order

□ 15. audit.py — REGISTRY_ORDER
       Add ('book_dir','Display Name','ot'|'nt') in canonical position

□ 16. audit_search.py — LIVE_BOOKS
       Add 'book_dir' to the set

□ 17. index.html — LIVE_BOOKS (JavaScript)
       Find EVERY `new Set([...])` that contains book names → add 'book_dir'
       NOTE: there may be MULTIPLE sets in index.html — check ALL of them
"""

# ═══════════════════════════════════════════════════════════════════════════
# PHASE 3: PEOPLE & TIMELINE
# ═══════════════════════════════════════════════════════════════════════════

PEOPLE_TIMELINE = """
□ 18. people.html — add new person entries to PEOPLE array
       Check: does the person already exist? (search for id:"name")
       Format: {id:"key",name:"Name",era:"era",parent:"",role:"...",
                bio:"...",refs:["..."],chapter:"ot/book/Book_N.html"}

□ 19. timeline.html — add era-specific events to TIMELINE_PEOPLE array
       Format: {id:"event-id",label:"Description",year:-NNNN,era:"era"}
       Common eras: patriarchs, exodus, judges, monarchy, exile, nt
"""

# ═══════════════════════════════════════════════════════════════════════════
# PHASE 4: SCHOLAR BIOGRAPHY PAGES  ★ FREQUENTLY MISSED ★
# ═══════════════════════════════════════════════════════════════════════════

SCHOLAR_BIOS = """
For EVERY new book-specific scholar, TWO things must be created:

□ 20. commentators/{key}.html — Individual biography page
       Copy structure from an existing page (e.g., commentators/craigie.html)
       Required sections:
         a) <head>: title, meta, CSS with correct --accent color
         b) bio-header: eyebrow (tradition · series · century), h1 name,
            bio-tradition (dates · role · institution · series)
         c) bio-quote: representative quote from their work
         d) bio-section "Biography": life, education, career
         e) bio-section "Interpretive Approach": methodology, strengths
         f) bio-section "Theological Tradition": denomination, commitments
         g) bio-section "Key Works": publications with descriptions
         h) bio-section "Appears In": intro text + bio-appears div with chapter links
         i) bio-others: grid of links to all OTHER scholars (use existing pattern)

       The --accent color MUST match the button CSS color for that scholar.
       The bio-appears links must point to actual live chapter files.

□ 21. commentators/index.html — Add card to the hub page
       Location: inside the hub-grid div, in alphabetical or logical order
       Format:
         <a href="KEY.html" class="hub-card" style="--accent:COLOR">
           <span class="hub-card-name">Full Name</span>
           <span class="hub-card-tradition">Tradition · Series</span>
           <span class="hub-card-desc">2-3 sentence description</span>
         </a>

       COLOR must match the button CSS color.

□ 22. UPDATE ALL EXISTING bio-others grids
       Every existing commentator/*.html page has a bio-others-grid
       that links to all other scholars. New scholars must be added
       to EVERY existing page's grid.
       Automate this — don't do it manually for 20+ files.

EXISTING SCHOLAR BIO PAGES (as of SW 2.144):
  ✅ macarthur, sarna, alter, hubbard, waltke, calvin, robertson,
     catena, netbible, marcus, rhoads, milgrom, ashley, keener,
     craigie, tigay
  ❌ MISSING: hess, howard, block, webb, bergen, tsumura
"""

# ═══════════════════════════════════════════════════════════════════════════
# PHASE 5: GENERATOR SCRIPT
# ═══════════════════════════════════════════════════════════════════════════

GENERATOR = """
□ 23. Write _tools/gen_{book}.py
       Requirements:
         - Import build_chapter, verse_range from shared
         - Every section gets ALL 5+ scholars (mac + 2 book-specific + calvin + net)
         - MacArthur: minimum 4 notes per section (NEVER thin)
         - Other scholars: minimum 2 notes per section
         - Hebrew word studies: 1-2 per section
         - Context paragraph: 1 per section
         - Cross-references: 2-3 per section
         - Chapter-level scholarly block data:
             ppl, rec, lit (2+ rows!), hebtext, thread, themes
           Optional but recommended: src, debate, textual

□ 24. Run the generator:
       python3 _tools/gen_{book}.py
       Verify output: "Built {Book} N" for every chapter
"""

# ═══════════════════════════════════════════════════════════════════════════
# PHASE 6: POST-BUILD FIXES (required after every generation)
# ═══════════════════════════════════════════════════════════════════════════

POST_BUILD = """
□ 25. FIX NAV ARROWS — generator sets cross-book next to the WRONG book
       Within-book: chapters 1 to N-1 need next→Book_{ch+1}.html
       First chapter: prev should point to previous book's last chapter
       Last chapter: next should point to next book's first chapter
       Previous book's last chapter: update next→this book's ch 1
       Next book's first chapter: update prev→this book's last ch

       AUTOMATION:
         for ch in range(1, TOTAL):
             replace cross-book href with f'Book_{ch+1}.html'
         Fix first/last chapter cross-book links manually

□ 26. FIX LIT PANELS — generated chapters may have only 1 lit-row
       Audit requires 2+ rows. Add a second row using depth-tracking:
         find id="prefix{ch}-lit" → track depth → insert before last </div>

□ 27. SET REGISTRY LIVE COUNT — change from 0 to total
       In shared.py, update: ('book_dir', 'Name', N, N, ...)
"""

# ═══════════════════════════════════════════════════════════════════════════
# PHASE 7: DEPLOY PIPELINE
# ═══════════════════════════════════════════════════════════════════════════

DEPLOY = """
□ 28. shared.update_homepage()    — updates index.html chapter grid + badge
□ 29. shared.rebuild_qnav_js()   — updates quick nav with new book
□ 30. shared.rebuild_books_js()   — updates books.js
□ 31. shared.rebuild_sw_js()      — updates service worker cache list
       (translation.js BOOK_VARS is auto-updated by build_chapter)
"""

# ═══════════════════════════════════════════════════════════════════════════
# PHASE 8: AUDIT — ALL 3 MUST PASS CLEAN
# ═══════════════════════════════════════════════════════════════════════════

AUDIT = """
□ 32. python3 _tools/audit.py          — MUST show "all checks clean"
       Common failures:
         - com-source div not closed: manual note injection broke nesting
         - cross-book href wrong: forgot space→underscore in filenames
         - single lit-row: forgot to add 2nd row
         - scholar panel thin: <2 notes in a section
         - space in JS var name in verse files (ESV/NIV)
         - BOOK_VARS entry has space instead of underscore
         - live book missing from BOOK_VARS in translation.js

□ 33. python3 _tools/audit_people.py   — MUST show "0 warning(s)"
       Common failures:
         - New person in people.html has malformed bio

□ 34. python3 _tools/audit_search.py   — MUST show "0 warning(s)"
       Common failures:
         - LIVE_BOOKS missing in audit_search.py or index.html JS Set
         - Multiple Sets in index.html — forgot to update one of them

VERSE FILE + TRANSLATION TOGGLE CHECKLIST  ★ EASY TO MISS ★
   After building any new book, verify:
   □ NIV verse file var name has NO spaces: var VERSES_BOOK_NAME=
   □ ESV verse file var name has NO spaces: var VERSES_BOOK_NAME=
   □ translation.js BOOK_VARS entry uses underscores, not spaces
   □ Chapter HTML loads the correct NIV verse script path
   □ Translation toggle works: switch NIV↔ESV, verify text changes
   
   Root cause: book names with spaces (1 Samuel, 2 Kings, Song of Solomon)
   generate invalid JS var names unless spaces are replaced with underscores.
   shared.py ensure_tx_book_var() and rebuild_verses_js() now handle this,
   but ESV files built before the fix needed manual patching.
"""

# ═══════════════════════════════════════════════════════════════════════════
# PHASE 9: COMMIT & PUSH
# ═══════════════════════════════════════════════════════════════════════════

COMMIT = """
□ 35. Bump SW version in service-worker.js
       sed -i 's/scripture-2.NNN/scripture-2.NNN+1/' service-worker.js

□ 36. git add -A && git commit -m "descriptive message" && git push origin master
       Message template:
         "Add {Book}: {N}ch, {V}v (NIV+ESV); {N} commentators ({list});
          full scholarly blocks; {N} new people; cross-book nav {prev}↔{book}↔{next};
          {N} live books, {N} chapters; all 3 audits clean; SW 2.NNN"
"""

# ═══════════════════════════════════════════════════════════════════════════
# KNOWN GOTCHAS — LEARNED THE HARD WAY
# ═══════════════════════════════════════════════════════════════════════════

GOTCHAS = """
1. SPACE IN FILENAMES: Books like "1 Samuel" → directory is "1_samuel",
   files are "1_Samuel_N.html". build_chapter now handles this automatically
   via .replace(' ','_'). But cross-book nav in audit.py also needs it
   (fixed in audit.py lines 407/416 as of SW 2.144).

2. VHL_TIME: Easy to forget in BOOK_META. KeyError will crash build_chapter.

3. COMMENTATOR_META: Must be inside the META dict in commentary_panel().
   Check for duplicate entries or unclosed strings after edits.

4. _auto_src vs _auto_textual: Sources are 3-tuples, textual notes are
   4-tuples. Mixing them up causes ValueError during build.

5. ANE/TEXTUAL DICT PLACEMENT: Must go inside the existing dict (ane_map
   or tx_books), not as standalone if-blocks outside. Python dicts use
   last-key-wins, so duplicates silently override.

6. LIT PANELS: The generator creates 1-row lit panels for chapters that
   only have 1 entry in the lit data. Audit requires 2+. Always add a
   second row after generation.

7. NAV ARROWS: build_chapter() sets the next arrow to the NEXT BOOK in
   REGISTRY (cross-book), not the next chapter. Must fix all within-book
   next arrows after generation.

8. COMMENTATOR CSS: If you add a scholar to COMMENTATOR_SCOPE but forget
   the CSS, the button renders unstyled (no color, no hover, no panel bg).
   Always add CSS FIRST, then scope, then meta.

9. SCHOLAR BIO PAGES: commentators/{key}.html and the index card are
   frequently forgotten. Run: ls commentators/ to verify.

10. BIO-OTHERS GRID: Every existing scholar page has a grid linking to
    all other scholars. When adding new scholars, ALL existing pages
    need updating. Automate with a script.

11. MULTIPLE LIVE_BOOKS SETS: index.html may have more than one
    new Set([...]) that filters by book name. Check ALL of them.

12. PEOPLE_BIO vs people.html: Both need updating. PEOPLE_BIO is in
    shared.py (used by auto_scholarly). people.html is the public tree.

13. VERSE FILE VAR NAMES: Books with spaces in names (1 Samuel, 2 Kings,
    Song of Solomon) produce invalid JS var names (var VERSES_1 SAMUEL=).
    shared.py now handles this, but if ESV files were built with older
    build_esv.py, they need manual patching. The audit now catches this
    (Section 18: Verse File Integrity).
"""

# ═══════════════════════════════════════════════════════════════════════════
# SCHOLAR ROSTER REFERENCE
# ═══════════════════════════════════════════════════════════════════════════

SCHOLAR_ROSTER = """
Universal (every book):
  macarthur    MacArthur Study Bible        Evangelical / Reformed
  calvin       Calvin's Commentaries        Reformation
  netbible     NET Bible Full Notes         Text-critical / Evangelical

OT Book-Specific:
  sarna        JPS Torah: Genesis, Exodus   Modern Jewish / JPS
  alter        Hebrew Bible Translation     Literary-critical
  hubbard      NICOT Ruth                   Evangelical
  waltke       NICOT Proverbs              Evangelical / Reformed
  milgrom      Anchor Bible Leviticus       Critical Jewish
  ashley       NICOT Numbers               Evangelical
  craigie      NICOT Deuteronomy           Evangelical
  tigay        JPS Torah Deuteronomy        Modern Jewish / JPS
  hess         TOTC Joshua                  Evangelical / Archaeological
  howard       NAC Joshua                   Evangelical / Canonical
  block        NAC Judges-Ruth              Evangelical / Narrative
  webb         NICOT Judges                 Evangelical / Literary
  bergen       NAC 1-2 Samuel               Evangelical / Historical
  tsumura      NICOT 1 Samuel               Evangelical / Philological

NT Book-Specific:
  robertson    Word Pictures (NT)           Baptist / Greek scholarship
  catena       Catena Aurea (Gospels)       Patristic / Aquinas
  marcus       Anchor Bible Mark            Historical-critical
  rhoads       Mark as Story                Narrative criticism
  keener       Acts Commentary              Evangelical / Socio-historical
"""
