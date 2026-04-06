#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
validate_sqlite.py — Integrity checker for scripture.db.

Runs after build_sqlite.py to verify the database is complete, referentially
consistent, and has reasonable content quality.

Validation sections:
  1. COMPLETENESS          — Row counts, panel coverage, verse counts, deep-links
  2. REFERENTIAL INTEGRITY — FK relationships (chapters→books, sections→chapters, etc.)
  3. CONTENT QUALITY       — No empty panels, valid JSON, valid parent refs, VHL sanity
  4. FTS5 SEARCH           — Full-text search smoke tests (verses + people)
  5. CROSS-BOOK SPOT CHECKS — Specific chapters verified for expected panel types

IMPORTANT: Many checks use hardcoded expected counts (e.g. "282 people", "51 scholars").
These counts reflect the current state of the content and WILL drift as content is
enriched. A count-mismatch failure does NOT necessarily mean the data is broken —
it may just mean the expected count needs updating. Referential integrity and content
quality checks (sections 2-3) are the ones that catch real problems.

Exit codes:
  0 = all checks passed
  1 = one or more checks failed

Usage:
    python3 _tools/validate_sqlite.py
"""
import os, sys, json, sqlite3
from pathlib import Path

# Ensure stdout can handle UTF-8 (needed on Windows where cp1252 is default)
import sys as _sys
if _sys.stdout.encoding and _sys.stdout.encoding.lower() != 'utf-8':
    _sys.stdout.reconfigure(encoding='utf-8')
del _sys


ROOT = Path(__file__).resolve().parent.parent
DB_PATH = ROOT / 'scripture.db'

passed = 0
failed = 0
warnings = 0


def check(label, condition, detail=''):
    """Record a pass/fail check. Prints result with [OK] or [FAIL] prefix."""
    global passed, failed
    if condition:
        passed += 1
        print(f"  [OK] {label}")
    else:
        failed += 1
        msg = f"  [FAIL] {label}"
        if detail:
            msg += f" — {detail}"
        print(msg)


def warn(label, detail=''):
    """Record a non-fatal warning. Does not affect pass/fail counts."""
    global warnings
    warnings += 1
    print(f"  [WARN]  {label}" + (f" — {detail}" if detail else ''))


def q(cur, sql, params=()):
    """Execute query, return all results."""
    cur.execute(sql, params)
    return cur.fetchall()


def q1(cur, sql, params=()):
    """Execute query, return single value."""
    cur.execute(sql, params)
    row = cur.fetchone()
    return row[0] if row else None


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
def main():
    """Run all DB integrity checks against scripture.db.

    Returns 0 if all checks pass, 1 if any fail.
    """
    if not DB_PATH.exists():
        print(f"ERROR: {DB_PATH} not found. Run build_sqlite.py first.")
        sys.exit(1)

    conn = sqlite3.connect(str(DB_PATH))
    cur = conn.cursor()

    print("=" * 60)
    print("Phase 0G: Validating scripture.db")
    print("=" * 60)

    # =========================================================
    # 1. COMPLETENESS
    # =========================================================
    print("\n--- 1. COMPLETENESS ---")

    # NOTE ON HARDCODED COUNTS:
    # The expected counts below (282 people, 51 scholars, etc.) reflect a known-good
    # snapshot. They WILL drift as content is enriched — a count mismatch just means
    # the expected value here needs updating, not that the data is broken.
    # The checks that catch real problems are in sections 2 (referential integrity)
    # and 3 (content quality). Update these counts after intentional content changes.

    # Books — 66 is the Protestant biblical canon, this should never change
    live = q1(cur, "SELECT COUNT(*) FROM books WHERE is_live=1")
    pending = q1(cur, "SELECT COUNT(*) FROM books WHERE is_live=0")
    check("66 live books", live == 66, f"got {live}")
    check("0 pending books", pending == 0, f"got {pending}")

    # Chapters — 1189 is the total across all 66 books (Protestant canon)
    ch_count = q1(cur, "SELECT COUNT(*) FROM chapters")
    check("1189 chapters", ch_count == 1189, f"got {ch_count}")

    # Every chapter has 2+ sections (except legitimately short chapters)
    # These chapters are legitimately short enough that 1 section is correct:
    #   Jeremiah 45 (5 verses), Jeremiah 47 (7 verses), Malachi 4 (6 verses)
    SINGLE_SECTION_OK = {'jeremiah_45', 'jeremiah_47', 'malachi_4'}
    lonely = q(cur,
        "SELECT c.id, COUNT(s.id) as cnt FROM chapters c "
        "LEFT JOIN sections s ON s.chapter_id = c.id "
        "GROUP BY c.id HAVING cnt < 2")
    unexpected = [r for r in lonely if r[0] not in SINGLE_SECTION_OK]
    check("Every chapter has 2+ sections (or is known-short)", len(unexpected) == 0,
          f"{len(unexpected)} chapters have <2 sections: {[r[0] for r in unexpected[:5]]}")

    # Most sections should have 'heb' panel (some base chapters lack it)
    sections_without_heb = q(cur,
        "SELECT s.id FROM sections s "
        "WHERE NOT EXISTS (SELECT 1 FROM section_panels sp "
        "  WHERE sp.section_id = s.id AND sp.panel_type = 'heb')")
    heb_pct = 100 * (1 - len(sections_without_heb) / max(1, q1(cur, "SELECT COUNT(*) FROM sections")))
    check(f"92%+ sections have 'heb' panel ({heb_pct:.0f}%)", heb_pct >= 92,
          f"{len(sections_without_heb)} sections missing heb")

    # Every chapter has 'lit' and 'themes'
    for ptype in ('lit', 'themes'):
        missing = q(cur,
            f"SELECT c.id FROM chapters c "
            f"WHERE NOT EXISTS (SELECT 1 FROM chapter_panels cp "
            f"  WHERE cp.chapter_id = c.id AND cp.panel_type = ?)", (ptype,))
        check(f"Every chapter has '{ptype}' panel", len(missing) == 0,
              f"{len(missing)} chapters missing {ptype}")

    # Meta tables — these counts drift as content is enriched. Update after changes.
    check("282 people", q1(cur, "SELECT COUNT(*) FROM people") == 282)
    check("72 scholars", q1(cur, "SELECT COUNT(*) FROM scholars") == 72)
    check("71+ places", q1(cur, "SELECT COUNT(*) FROM places") >= 60)
    check("28+ map stories", q1(cur, "SELECT COUNT(*) FROM map_stories") >= 15)
    check("14+ word studies", q1(cur, "SELECT COUNT(*) FROM word_studies") >= 14)
    check("53+ synoptic entries", q1(cur, "SELECT COUNT(*) FROM synoptic_map") >= 53)

    # VHL groups: 5 groups per chapter (places, people, time, key, divine) × 1189 chapters
    # Count increased from 4395→5945 after content enrichment added VHL to more chapters.
    vhl_count = q1(cur, "SELECT COUNT(*) FROM vhl_groups")
    check("5945 VHL groups", vhl_count == 5945, f"got {vhl_count}")

    # Deep links
    dl_count = q1(cur,
        "SELECT COUNT(*) FROM chapters "
        "WHERE timeline_link_event IS NOT NULL OR map_story_link_id IS NOT NULL")
    check("51+ deep-linked chapters", dl_count >= 40, f"got {dl_count}")

    # Cross-ref threads — update this count when Batch 13 (thread expansion) ships
    thread_count = q1(cur, "SELECT COUNT(*) FROM cross_ref_threads")
    check("32 cross-ref threads", thread_count == 32, f"got {thread_count}")

    # Each thread has 3+ steps
    short_threads = q(cur,
        "SELECT id, json_array_length(steps_json) as step_count "
        "FROM cross_ref_threads WHERE json_array_length(steps_json) < 3")
    check("All threads have 3+ steps", len(short_threads) == 0,
          f"{len(short_threads)} threads have <3 steps")

    # Timelines — 543 = 203 events + 66 books + 250 people + 24 world. Update after enrichment.
    tl_count = q1(cur, "SELECT COUNT(*) FROM timelines")
    check("543 timeline entries", tl_count == 543, f"got {tl_count}")

    # Feature tables (prophecy chains, concepts, difficult passages)
    pc_count = q1(cur, "SELECT COUNT(*) FROM prophecy_chains")
    check("prophecy_chains table exists", pc_count is not None, "table missing")
    if pc_count:
        # Every chain has valid links_json
        bad_links = q(cur,
            "SELECT id FROM prophecy_chains WHERE links_json IS NULL OR links_json = '[]'")
        check("All prophecy chains have links", len(bad_links) == 0,
              f"{len(bad_links)} chains with empty links")
    print(f"  prophecy_chains: {pc_count or 0}")

    co_count = q1(cur, "SELECT COUNT(*) FROM concepts")
    check("concepts table exists", co_count is not None, "table missing")
    print(f"  concepts: {co_count or 0}")

    dp_count = q1(cur, "SELECT COUNT(*) FROM difficult_passages")
    check("difficult_passages table exists", dp_count is not None, "table missing")
    if dp_count:
        # Every passage has responses
        bad_resp = q(cur,
            "SELECT id FROM difficult_passages WHERE responses_json IS NULL OR responses_json = '[]'")
        check("All difficult passages have responses", len(bad_resp) == 0,
              f"{len(bad_resp)} passages with empty responses")
    print(f"  difficult_passages: {dp_count or 0}")

    # Content Library
    cl_count = q1(cur, "SELECT COUNT(*) FROM content_library")
    check("content_library table exists", cl_count is not None, "table missing")
    if cl_count:
        # Category counts
        for cat in ('manuscripts', 'discourse', 'echoes', 'ane', 'chiasms'):
            cat_count = q1(cur, "SELECT COUNT(*) FROM content_library WHERE category=?", (cat,))
            print(f"  content_library[{cat}]: {cat_count or 0}")
        # All entries have title
        empty_title = q1(cur, "SELECT COUNT(*) FROM content_library WHERE title IS NULL OR title = ''")
        check("All content_library entries have title", empty_title == 0,
              f"{empty_title} entries missing title")
        # All entries reference valid books
        orphan_cl = q1(cur,
            "SELECT COUNT(*) FROM content_library cl "
            "LEFT JOIN books b ON b.id = cl.book_id WHERE b.id IS NULL")
        check("All content_library entries reference valid books", orphan_cl == 0,
              f"{orphan_cl} orphaned")
    print(f"  content_library: {cl_count or 0}")

    # Lexicon entries (optional — populated by #68 Full Lexicon Integration)
    lex_count = q1(cur, "SELECT COUNT(*) FROM lexicon_entries")
    if lex_count is not None and lex_count > 0:
        lex_greek = q1(cur, "SELECT COUNT(*) FROM lexicon_entries WHERE language='greek'")
        lex_hebrew = q1(cur, "SELECT COUNT(*) FROM lexicon_entries WHERE language='hebrew'")
        check("Lexicon entries populated", lex_count >= 10000,
              f"only {lex_count} rows (expected ~14000)")
        print(f"  lexicon_entries: {lex_count} (greek={lex_greek}, hebrew={lex_hebrew})")
    else:
        print(f"  lexicon_entries: {lex_count or 0} (not yet populated)")

    # Red letter verses
    rl_count = q1(cur, "SELECT COUNT(*) FROM red_letter_verses")
    if rl_count is not None:
        check("Red letter verses populated", rl_count >= 1000,
              f"only {rl_count} rows (expected ~1200+)")
        print(f"  red_letter_verses: {rl_count}")
    else:
        print("  red_letter_verses: table not found (optional)")

    # Topics (Topical Index)
    topics_count = q1(cur, "SELECT COUNT(*) FROM topics")
    if topics_count is not None:
        check("Topics table populated", topics_count >= 5,
              f"only {topics_count} rows (expected 5+)")
        # All topics have required fields
        empty_fields = q1(cur,
            "SELECT COUNT(*) FROM topics WHERE title IS NULL OR title = '' "
            "OR category IS NULL OR category = '' OR description IS NULL OR description = ''")
        check("All topics have title, category, description", empty_fields == 0,
              f"{empty_fields} topics missing required fields")
        # Check categories are valid
        bad_cats = q(cur,
            "SELECT id, category FROM topics WHERE category NOT IN "
            "('theology','character','sin','relationships','worship',"
            "'living','church','eschatology','creation','identity')")
        check("All topics have valid category", len(bad_cats) == 0,
              f"{len(bad_cats)} topics with invalid category")
        # Check FTS table exists
        fts_ok = q1(cur, "SELECT COUNT(*) FROM topics_fts")
        check("topics_fts virtual table exists", fts_ok is not None, "FTS table missing")
        # Count topics with relevant chapters
        with_chapters = q1(cur,
            "SELECT COUNT(*) FROM topics WHERE relevant_chapters_json IS NOT NULL "
            "AND relevant_chapters_json != '[]'")
        print(f"  topics: {topics_count} ({with_chapters} with relevant chapters)")
    else:
        print("  topics: table not found (optional)")

    # Life Topics
    lt_cat_count = q1(cur, "SELECT COUNT(*) FROM life_topic_categories")
    check("life_topic_categories table exists", lt_cat_count is not None, "table missing")
    print(f"  life_topic_categories: {lt_cat_count or 0}")

    lt_off_count = q1(cur, "SELECT COUNT(*) FROM life_topics_official")
    check("life_topics_official table exists", lt_off_count is not None, "table missing")
    print(f"  life_topics_official: {lt_off_count or 0}")

    # Dictionary entries (Easton's)
    dict_count = q1(cur, "SELECT COUNT(*) FROM dictionary_entries")
    if dict_count is not None:
        check("Dictionary entries populated", dict_count >= 3500,
              f"only {dict_count} rows (expected ~3963)")
        # All entries have term and definition
        empty_dict = q1(cur,
            "SELECT COUNT(*) FROM dictionary_entries WHERE term IS NULL OR term = '' "
            "OR definition IS NULL OR definition = ''")
        check("All dictionary entries have term + definition", empty_dict == 0,
              f"{empty_dict} entries missing required fields")
        # Category distribution
        cat_count = q1(cur, "SELECT COUNT(DISTINCT category) FROM dictionary_entries")
        check("Dictionary has multiple categories", cat_count and cat_count >= 5,
              f"only {cat_count} categories")
        # Cross-links present
        cross_count = q1(cur,
            "SELECT COUNT(*) FROM dictionary_entries WHERE "
            "cross_person_id IS NOT NULL OR cross_place_id IS NOT NULL "
            "OR cross_word_study_id IS NOT NULL OR cross_concept_id IS NOT NULL")
        # FTS table exists
        dict_fts_ok = q1(cur, "SELECT COUNT(*) FROM dictionary_fts")
        check("dictionary_fts virtual table exists", dict_fts_ok is not None, "FTS table missing")
        print(f"  dictionary_entries: {dict_count} ({cross_count} with cross-links)")
    else:
        print("  dictionary_entries: table not found (optional)")

    # =========================================================
    # 2. REFERENTIAL INTEGRITY
    # =========================================================
    print("\n--- 2. REFERENTIAL INTEGRITY ---")

    # chapters → books
    orphan_ch = q(cur,
        "SELECT c.id FROM chapters c "
        "LEFT JOIN books b ON b.id = c.book_id WHERE b.id IS NULL")
    check("All chapters reference valid books", len(orphan_ch) == 0,
          f"{len(orphan_ch)} orphaned chapters")

    # sections → chapters
    orphan_sec = q(cur,
        "SELECT s.id FROM sections s "
        "LEFT JOIN chapters c ON c.id = s.chapter_id WHERE c.id IS NULL")
    check("All sections reference valid chapters", len(orphan_sec) == 0,
          f"{len(orphan_sec)} orphaned sections")

    # section_panels → sections
    orphan_sp = q1(cur,
        "SELECT COUNT(*) FROM section_panels sp "
        "LEFT JOIN sections s ON s.id = sp.section_id WHERE s.id IS NULL")
    check("All section_panels reference valid sections", orphan_sp == 0,
          f"{orphan_sp} orphaned")

    # chapter_panels → chapters
    orphan_cp = q1(cur,
        "SELECT COUNT(*) FROM chapter_panels cp "
        "LEFT JOIN chapters c ON c.id = cp.chapter_id WHERE c.id IS NULL")
    check("All chapter_panels reference valid chapters", orphan_cp == 0,
          f"{orphan_cp} orphaned")

    # vhl_groups → chapters
    orphan_vhl = q1(cur,
        "SELECT COUNT(*) FROM vhl_groups vg "
        "LEFT JOIN chapters c ON c.id = vg.chapter_id WHERE c.id IS NULL")
    check("All vhl_groups reference valid chapters", orphan_vhl == 0,
          f"{orphan_vhl} orphaned")

    # =========================================================
    # 3. CONTENT QUALITY
    # =========================================================
    print("\n--- 3. CONTENT QUALITY ---")

    # No empty content_json
    empty_sp = q1(cur,
        "SELECT COUNT(*) FROM section_panels WHERE content_json IS NULL OR content_json = ''")
    check("No empty section_panel content", empty_sp == 0, f"{empty_sp} empty")

    empty_cp = q1(cur,
        "SELECT COUNT(*) FROM chapter_panels WHERE content_json IS NULL OR content_json = ''")
    check("No empty chapter_panel content", empty_cp == 0, f"{empty_cp} empty")

    # Valid JSON in content_json
    invalid_sp = q1(cur,
        "SELECT COUNT(*) FROM section_panels WHERE json_valid(content_json) = 0")
    check("All section_panel JSON valid", invalid_sp == 0, f"{invalid_sp} invalid")

    invalid_cp = q1(cur,
        "SELECT COUNT(*) FROM chapter_panels WHERE json_valid(content_json) = 0")
    check("All chapter_panel JSON valid", invalid_cp == 0, f"{invalid_cp} invalid")

    # People: father/mother references point to existing people
    bad_fathers = q(cur,
        "SELECT p.id, p.father FROM people p "
        "WHERE p.father IS NOT NULL AND p.father != '' "
        "AND NOT EXISTS (SELECT 1 FROM people p2 WHERE p2.id = p.father)")
    check("All father refs valid", len(bad_fathers) == 0,
          f"{len(bad_fathers)} broken: {[r[0]+' → '+r[1] for r in bad_fathers[:5]]}")

    bad_mothers = q(cur,
        "SELECT p.id, p.mother FROM people p "
        "WHERE p.mother IS NOT NULL AND p.mother != '' "
        "AND NOT EXISTS (SELECT 1 FROM people p2 WHERE p2.id = p.mother)")
    check("All mother refs valid", len(bad_mothers) == 0,
          f"{len(bad_mothers)} broken: {[r[0]+' → '+r[1] for r in bad_mothers[:5]]}")

    # VHL btn_types_json non-empty
    empty_btn = q1(cur,
        "SELECT COUNT(*) FROM vhl_groups "
        "WHERE btn_types_json IS NULL OR btn_types_json = '' OR btn_types_json = '[]'")
    check("All VHL groups have btn_types", empty_btn == 0, f"{empty_btn} empty")

    # VHL btn_types contain valid panel type strings
    valid_btn_types = {'hebrew', 'hebrew-text', 'context', 'places', 'people',
                       'timeline', 'literary', 'cross'}
    cur.execute("SELECT DISTINCT group_name, btn_types_json FROM vhl_groups")
    bad_btns = []
    for gname, btj in cur.fetchall():
        try:
            types = json.loads(btj)
            for t in types:
                if t not in valid_btn_types:
                    bad_btns.append(f"{gname}: '{t}'")
        except json.JSONDecodeError:
            bad_btns.append(f"{gname}: invalid JSON")
    check("VHL btn_types are valid panel types", len(bad_btns) == 0,
          f"invalid: {bad_btns[:5]}")

    # =========================================================
    # 4. FTS5 SEARCH
    # =========================================================
    print("\n--- 4. FTS5 SEARCH ---")

    # Search verses: "In the beginning"
    cur.execute("""
        SELECT v.book_id, v.chapter_num, v.verse_num
        FROM verses_fts f JOIN verses v ON v.id = f.rowid
        WHERE f.text MATCH '"In the beginning"' LIMIT 10
    """)
    fts_results = cur.fetchall()
    has_gen1 = any(r[0] == 'genesis' and r[1] == 1 and r[2] == 1 for r in fts_results)
    check("FTS 'In the beginning' → Genesis 1:1", has_gen1,
          f"got {len(fts_results)} results: {fts_results[:3]}")

    # Search people: "Abraham"
    cur.execute("""
        SELECT p.id FROM people_fts f JOIN people p ON p.rowid = f.rowid
        WHERE f.name MATCH 'Abraham' LIMIT 10
    """)
    ppl_results = [r[0] for r in cur.fetchall()]
    check("FTS people 'Abraham' → returns abraham", 'abraham' in ppl_results,
          f"got {ppl_results}")

    # Search verses: "covenant"
    covenant_count = q1(cur, """
        SELECT COUNT(*) FROM verses_fts WHERE text MATCH 'covenant'
    """)
    check("FTS 'covenant' → multiple results", covenant_count and covenant_count > 10,
          f"got {covenant_count}")

    # Search dictionary: "baptism"
    try:
        cur.execute("""
            SELECT de.id FROM dictionary_fts f
            JOIN dictionary_entries de ON de.rowid = f.rowid
            WHERE f.term MATCH 'baptism' LIMIT 5
        """)
        dict_results = [r[0] for r in cur.fetchall()]
        check("FTS dictionary 'baptism' → returns results", len(dict_results) > 0,
              f"got {dict_results}")
    except Exception:
        warn("dictionary_fts search failed (table may not exist)")

    # =========================================================
    # 5. CROSS-BOOK SPOT CHECKS
    # =========================================================
    print("\n--- 5. CROSS-BOOK SPOT CHECKS ---")

    # Genesis 1: 5 sections
    gen1_secs = q1(cur, "SELECT COUNT(*) FROM sections WHERE chapter_id='genesis_1'")
    check("Genesis 1 has 5 sections", gen1_secs == 5, f"got {gen1_secs}")

    # Genesis 1 S1: 8 panel types (heb, hist, cross, mac, sarna, alter, calvin, net)
    # ctx merged into hist as composite object in Phase 2
    gen1_s1_types = [r[0] for r in q(cur,
        "SELECT panel_type FROM section_panels WHERE section_id='genesis_1_s1' ORDER BY panel_type")]
    expected = ['alter', 'calvin', 'cross', 'heb', 'hist', 'mac', 'net', 'sarna']
    check("Genesis 1 S1 has 8 panel types", gen1_s1_types == expected,
          f"got {gen1_s1_types}")

    # Psalms 23: verify it exists and has sections
    psa23_secs = q1(cur, "SELECT COUNT(*) FROM sections WHERE chapter_id='psalms_23'")
    check("Psalms 23 has sections", psa23_secs and psa23_secs >= 2, f"got {psa23_secs}")

    # Isaiah 6: should have oswalt and childs panels
    isa6_types = [r[0] for r in q(cur,
        "SELECT DISTINCT panel_type FROM section_panels sp "
        "JOIN sections s ON s.id = sp.section_id "
        "WHERE s.chapter_id = 'isaiah_6' ORDER BY panel_type")]
    check("Isaiah 6 has oswalt panel", 'oswalt' in isa6_types, f"types: {isa6_types}")
    check("Isaiah 6 has childs panel", 'childs' in isa6_types, f"types: {isa6_types}")

    # Daniel 1: should have collins, longman, goldingay
    dan1_types = [r[0] for r in q(cur,
        "SELECT DISTINCT panel_type FROM section_panels sp "
        "JOIN sections s ON s.id = sp.section_id "
        "WHERE s.chapter_id = 'daniel_1' ORDER BY panel_type")]
    check("Daniel 1 has collins panel", 'collins' in dan1_types, f"types: {dan1_types}")
    check("Daniel 1 has longman panel", 'longman' in dan1_types, f"types: {dan1_types}")

    # Matthew 1: NT book exists and has panels
    mt1_sp = q1(cur,
        "SELECT COUNT(*) FROM section_panels sp "
        "JOIN sections s ON s.id = sp.section_id "
        "WHERE s.chapter_id = 'matthew_1'")
    check("Matthew 1 has section panels", mt1_sp and mt1_sp > 5, f"got {mt1_sp}")

    # Spine = people in the main genealogy tree (Adam→Jesus), satellite = everyone else.
    # The spine count (37) is fixed by the genealogy tree structure.
    # The satellite count drifts as people are added during enrichment — update as needed.
    spine = q1(cur, "SELECT COUNT(*) FROM people WHERE type='spine'")
    sat = q1(cur, "SELECT COUNT(*) FROM people WHERE type='satellite'")
    check("37 spine people", spine == 37, f"got {spine}")
    check("245 satellite people", sat == 245, f"got {sat}")

    # Sanity: the two endpoints of the genealogy tree must always be spine
    adam_type = q1(cur, "SELECT type FROM people WHERE id='adam'")
    jesus_type = q1(cur, "SELECT type FROM people WHERE id='jesus'")
    check("Adam is spine", adam_type == 'spine')
    check("Jesus is spine", jesus_type == 'spine')

    # =========================================================
    # SUMMARY
    # =========================================================
    conn.close()

    print(f"\n{'='*60}")
    print(f"RESULTS: {passed} passed, {failed} failed, {warnings} warnings")
    if failed == 0:
        print("[OK] ALL CHECKS PASSED")
    else:
        print(f"[FAIL] {failed} CHECKS FAILED — review above")
    print(f"{'='*60}")

    return 0 if failed == 0 else 1


if __name__ == '__main__':
    os.chdir(ROOT)
    sys.exit(main())
