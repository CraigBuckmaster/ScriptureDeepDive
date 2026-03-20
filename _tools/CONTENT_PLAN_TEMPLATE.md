"""
NEW BOOK CONTENT PLAN TEMPLATE — Scripture Deep Dive
═════════════════════════════════════════════════════
Run this planning phase BEFORE writing any gen_{book}.py script.
This produces the content blueprint that the generator implements.

Copy this template → _tools/plans/{book}_plan.md
Fill in every section. Review with the user. Only then proceed to build.

Last updated: SW 2.150 (16 books, 439 chapters)
"""

# ═══════════════════════════════════════════════════════════════════════════
# STEP 1: BOOK IDENTITY
# ═══════════════════════════════════════════════════════════════════════════
#
# □ Book name:           (e.g., "1 Kings")
# □ Directory name:      (e.g., "1_kings")
# □ Display name:        (e.g., "1 Kings")
# □ Total chapters:      (e.g., 22)
# □ Testament:           OT / NT
# □ Testament dir:       ot / nt
# □ Position in REGISTRY: after which book?
#
# □ NIV verse file:      verses/niv/{ot|nt}/{book}.js  — exists? verse count?
# □ ESV verse file:      verses/esv/{ot|nt}/{book}.js  — exists? verse count?
#
# □ Narrative continuity: which book does this follow? What's the handoff?
#   (e.g., "1 Kings follows 2 Samuel. David is dying. Solomon succeeds.")

# ═══════════════════════════════════════════════════════════════════════════
# STEP 2: SCHOLAR ROSTER
# ═══════════════════════════════════════════════════════════════════════════
#
# Universal (always included):
#   □ MacArthur Study Bible — crimson, every verse section gets 4+ notes
#   □ Calvin's Commentaries — slate blue
#   □ NET Bible Full Notes  — pale sage
#
# Book-specific (pick 2–3):
#   □ Scholar 1: Name, series, color, scope justification
#   □ Scholar 2: Name, series, color, scope justification
#   □ Scholar 3: (optional) Name, series, color, scope justification
#
# Check existing COMMENTATOR_CSS in styles.css:
#   - Reuse existing scholar if they cover this book (e.g., Alter covers Gen-Deut+Ruth+Prov)
#   - New scholar? Pick unused color from palette. Document in plan.
#
# Check existing COMMENTATOR_SCOPE in config.py:
#   - Add this book to each scholar's scope list
#
# Check commentators/ directory:
#   - Existing scholars: bio page already exists, just update scope
#   - New scholars: need bio page + index card + bio-others grid update

# ═══════════════════════════════════════════════════════════════════════════
# STEP 3: CHAPTER-BY-CHAPTER OUTLINE
# ═══════════════════════════════════════════════════════════════════════════
#
# For EVERY chapter, define:
#
# Chapter N: "Title"
#   Section 1: "Verses X–Y — Section Title"
#     - Theme/content summary (1 sentence)
#     - Key Hebrew/Greek terms (2–3 per section minimum)
#     - Key people appearing (for VHL + people panels)
#     - Key places appearing (for VHL + places panels)
#     - Timeline events (if any)
#     - Cross-references (2–3 per section)
#     - MacArthur notes (4+ per section — NEVER fewer than 4)
#   Section 2: "Verses X–Y — Section Title"
#     ... same structure ...
#   Section 3: (if needed — most chapters have 2–4 sections)
#     ... same structure ...
#
# RULES:
#   - Every chapter MUST have ≥2 sections (audit enforces this)
#   - Section breaks should follow natural literary/narrative divisions
#   - Verse ranges must be contiguous and cover every verse (no gaps)
#   - Section headers follow format: "Verses X–Y — Descriptive Title"
#   - Titles should be evocative, not generic (not "More Laws" but "The Sabbath Year and Jubilee")

# ═══════════════════════════════════════════════════════════════════════════
# STEP 4: GENERATOR BATCHING
# ═══════════════════════════════════════════════════════════════════════════
#
# Group chapters into batches of 3–6 for implementation.
# Each batch should be a natural literary unit when possible.
#
# Batch 1 (BOOK-1): Chapters N–M — "Thematic Label"
#   - Chapters in batch
#   - Why these group together
#   - Estimated sections per chapter
#
# Batch 2 (BOOK-2): Chapters N–M — "Thematic Label"
#   ... etc ...
#
# RULES:
#   - Build, audit, and commit each batch before starting the next
#   - First batch always includes chapter 1 (establishes patterns)
#   - Last batch includes final chapter (handles cross-book next arrow)

# ═══════════════════════════════════════════════════════════════════════════
# STEP 5: PEOPLE & PLACES INVENTORY
# ═══════════════════════════════════════════════════════════════════════════
#
# □ New people to add to PEOPLE_BIO:
#   - Name, role, description, timeline_id, era
#   - Check if already exists from a previous book
#
# □ New people to add to people.html:
#   - Name, chapter links, era, relationships
#
# □ Key places for VHL (vhl_places in BOOK_META):
#   - List all significant geographical locations
#
# □ Key people for VHL (vhl_people in BOOK_META):
#   - List all significant named individuals
#
# □ Key terms for VHL (vhl_key in BOOK_META):
#   - Book-specific theological/thematic keywords

# ═══════════════════════════════════════════════════════════════════════════
# STEP 6: SCHOLARLY APPARATUS
# ═══════════════════════════════════════════════════════════════════════════
#
# □ ANE sources relevant to this book:
#   - What ancient parallels exist? (e.g., Annals of Assyrian kings for 1-2 Kings)
#   - Add to ane_map in _auto_src()
#
# □ Textual notes:
#   - LXX variants (the LXX of 1 Kings differs significantly from MT)
#   - Dead Sea Scrolls fragments
#   - Notable text-critical issues
#   - Add to tx_books in _auto_textual()
#
# □ Major scholarly debates (1–3 for the book):
#   - Topic, positions, key scholars on each side
#   - These populate the debate panels in auto_scholarly()

# ═══════════════════════════════════════════════════════════════════════════
# STEP 7: PRE-FLIGHT CHECKS
# ═══════════════════════════════════════════════════════════════════════════
#
# Before writing gen_{book}.py:
#   □ REGISTRY entry added (live=0)
#   □ BOOK_META complete (auth, vhl arrays, is_nt)
#   □ COMMENTATOR_SCOPE updated for new scholars
#   □ Scholar CSS in styles.css (if new scholars)
#   □ Scholar bio pages created (if new scholars)
#   □ audit.py updated (BOOK_ROSTER, SCHOLAR_KEYS, OT/NT_BOOKS)
#   □ Plan reviewed and approved
#
# After building each batch:
#   □ python3 _tools/gen_{book}.py (build chapters)
#   □ Fix nav arrows (within-book chain + cross-book endpoints)
#   □ Set REGISTRY live count
#   □ shared.update_homepage() + rebuild_qnav_js() + rebuild_books_js() + rebuild_sw_js()
#   □ python3 _tools/audit.py (0 failures)
#   □ python3 _tools/audit_people.py
#   □ python3 _tools/audit_search.py
#   □ python3 _tools/tests/test_regressions.py
#   □ Bump SW version + git commit + git push
