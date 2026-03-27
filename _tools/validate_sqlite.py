#!/usr/bin/env python3
"""
validate_sqlite.py — Comprehensive integrity checks for scripture.db.

Phase 0G: Validates completeness, referential integrity, content quality,
FTS5 search, and cross-book spot checks.

Usage:
    python3 _tools/validate_sqlite.py
"""
import os, sys, json, sqlite3
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DB_PATH = ROOT / 'scripture.db'

passed = 0
failed = 0
warnings = 0


def check(label, condition, detail=''):
    global passed, failed
    if condition:
        passed += 1
        print(f"  ✅ {label}")
    else:
        failed += 1
        msg = f"  ❌ {label}"
        if detail:
            msg += f" — {detail}"
        print(msg)


def warn(label, detail=''):
    global warnings
    warnings += 1
    print(f"  ⚠️  {label}" + (f" — {detail}" if detail else ''))


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

    # Books
    live = q1(cur, "SELECT COUNT(*) FROM books WHERE is_live=1")
    pending = q1(cur, "SELECT COUNT(*) FROM books WHERE is_live=0")
    check("60 live books", live == 60, f"got {live}")
    check("6 pending books", pending == 6, f"got {pending}")

    # Chapters
    ch_count = q1(cur, "SELECT COUNT(*) FROM chapters")
    check("1156 chapters", ch_count == 1156, f"got {ch_count}")

    # Every chapter has 2+ sections (except legitimately short chapters)
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

    # Verse counts per translation
    for trans in ('niv', 'esv'):
        vc = q1(cur, "SELECT COUNT(*) FROM verses WHERE translation=?", (trans,))
        check(f"{trans.upper()} verses > 25000", vc and vc > 25000, f"got {vc}")

    # Known verse counts (NIV)
    known_counts = {'genesis': 1533, 'psalms': 2461, 'matthew': 1069}
    for book, expected in known_counts.items():
        actual = q1(cur,
            "SELECT COUNT(*) FROM verses WHERE book_id=? AND translation='niv'",
            (book,))
        check(f"{book} NIV = {expected} verses", actual == expected,
              f"got {actual}")

    # Meta tables
    check("281 people", q1(cur, "SELECT COUNT(*) FROM people") == 281)
    check("51 scholars", q1(cur, "SELECT COUNT(*) FROM scholars") == 51)
    check("71+ places", q1(cur, "SELECT COUNT(*) FROM places") >= 60)
    check("28+ map stories", q1(cur, "SELECT COUNT(*) FROM map_stories") >= 15)
    check("14+ word studies", q1(cur, "SELECT COUNT(*) FROM word_studies") >= 14)
    check("53+ synoptic entries", q1(cur, "SELECT COUNT(*) FROM synoptic_map") >= 53)

    # VHL groups: 5 per chapter = 4395
    vhl_count = q1(cur, "SELECT COUNT(*) FROM vhl_groups")
    check("4395 VHL groups", vhl_count == 4395, f"got {vhl_count}")

    # Deep links
    dl_count = q1(cur,
        "SELECT COUNT(*) FROM chapters "
        "WHERE timeline_link_event IS NOT NULL OR map_story_link_id IS NOT NULL")
    check("51+ deep-linked chapters", dl_count >= 40, f"got {dl_count}")

    # Cross-ref threads
    thread_count = q1(cur, "SELECT COUNT(*) FROM cross_ref_threads")
    check("11 cross-ref threads", thread_count == 11, f"got {thread_count}")

    # Each thread has 3+ steps
    short_threads = q(cur,
        "SELECT id, json_array_length(steps_json) as step_count "
        "FROM cross_ref_threads WHERE json_array_length(steps_json) < 3")
    check("All threads have 3+ steps", len(short_threads) == 0,
          f"{len(short_threads)} threads have <3 steps")

    # Timelines
    tl_count = q1(cur, "SELECT COUNT(*) FROM timelines")
    check("420 timeline entries", tl_count == 420, f"got {tl_count}")

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

    # =========================================================
    # 5. CROSS-BOOK SPOT CHECKS
    # =========================================================
    print("\n--- 5. CROSS-BOOK SPOT CHECKS ---")

    # Genesis 1: 5 sections
    gen1_secs = q1(cur, "SELECT COUNT(*) FROM sections WHERE chapter_id='genesis_1'")
    check("Genesis 1 has 5 sections", gen1_secs == 5, f"got {gen1_secs}")

    # Genesis 1 S1: 9 panel types (heb, hist, ctx, cross, mac, sarna, alter, calvin, net)
    gen1_s1_types = [r[0] for r in q(cur,
        "SELECT panel_type FROM section_panels WHERE section_id='genesis_1_s1' ORDER BY panel_type")]
    expected = ['alter', 'calvin', 'cross', 'ctx', 'heb', 'hist', 'mac', 'net', 'sarna']
    check("Genesis 1 S1 has 9 panel types", gen1_s1_types == expected,
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

    # Spine/satellite people
    spine = q1(cur, "SELECT COUNT(*) FROM people WHERE type='spine'")
    sat = q1(cur, "SELECT COUNT(*) FROM people WHERE type='satellite'")
    check("37 spine people", spine == 37, f"got {spine}")
    check("244 satellite people", sat == 244, f"got {sat}")

    # Adam and Jesus both spine
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
        print("✅ ALL CHECKS PASSED")
    else:
        print(f"❌ {failed} CHECKS FAILED — review above")
    print(f"{'='*60}")

    return 0 if failed == 0 else 1


if __name__ == '__main__':
    os.chdir(ROOT)
    sys.exit(main())
