"""Unit tests for _tools/coverage_auditor.py and panel_taxonomy.py.

Run locally with:
    python3 _tools/test_coverage_auditor.py

Inline fixtures only — no real-corpus reads, no network. Stdlib unittest.
"""
from __future__ import annotations

import json
import os
import sys
import tempfile
import unittest
from pathlib import Path

_HERE = os.path.dirname(os.path.abspath(__file__))
if _HERE not in sys.path:
    sys.path.insert(0, _HERE)

import panel_taxonomy as pt  # noqa: E402
import coverage_auditor as ca  # noqa: E402


SCHOLAR_KEYS = {
    "macarthur", "mac", "netbible", "net", "sarna", "alter", "calvin",
    "cat", "catena", "marcus", "mar", "rhoads", "rho",
}


# ─── L2: Panel verdict tests ────────────────────────────────────────

class PanelVerdictTests(unittest.TestCase):
    def test_empty_dict(self):
        v = ca.evaluate_panel("hist", {})
        self.assertEqual(v.verdict, "empty")

    def test_empty_list(self):
        v = ca.evaluate_panel("heb", [])
        self.assertEqual(v.verdict, "empty")

    def test_empty_string(self):
        v = ca.evaluate_panel("trans", "")
        self.assertEqual(v.verdict, "empty")

    def test_empty_none(self):
        v = ca.evaluate_panel("debate", None)
        self.assertEqual(v.verdict, "empty")

    def test_placeholder_panel(self):
        sec = {"notes": [{"note": "This passage is significant because of its theology."}]}
        v = ca.evaluate_panel("sarna", sec)
        self.assertEqual(v.verdict, "placeholder")

    def test_template_panel_debate(self):
        # Inject a test pattern, then restore.
        original = pt.TEMPLATE_PATTERNS.get("debate")
        pt.TEMPLATE_PATTERNS["debate"] = [(
            "Critical/Analytical scholarship",
            "Traditional/Confessional reading",
            "Emphasises historical-critical",
        )]
        try:
            data = [[
                "Interpretive Question: 9:1",
                [
                    ["Critical/Analytical scholarship",
                     "The NET note explains some scattering metaphor — many words to clear the threshold here.",
                     "Emphasises historical-critical, literary, or text-critical analysis."],
                    ["Traditional/Confessional reading",
                     "Reads within the canonical framework of fulfilled prophecy and covenant.",
                     "Represented by Calvin, MacArthur, and the evangelical tradition."],
                ],
                "Both readings engage seriously.",
            ]]
            v = ca.evaluate_panel("debate", data)
            self.assertEqual(v.verdict, "template")
        finally:
            if original is None:
                pt.TEMPLATE_PATTERNS.pop("debate", None)
            else:
                pt.TEMPLATE_PATTERNS["debate"] = original

    def test_stub_panel_heb(self):
        # heb threshold = 100 * 0.5 = 50 chars; 30 chars = stub
        data = [{"paragraph": "x" * 20, "gloss": "abc"}]
        v = ca.evaluate_panel("heb", data)
        self.assertEqual(v.verdict, "stub")

    def test_stub_panel_generic(self):
        # Non-heb threshold = 100 chars; 50 chars = stub
        data = {"notes": [{"note": "x" * 50}]}
        v = ca.evaluate_panel("sarna", data)
        self.assertEqual(v.verdict, "stub")

    def test_substantive_panel_heb(self):
        data = [{"paragraph": "x" * 200, "gloss": "y"}]
        v = ca.evaluate_panel("heb", data)
        self.assertEqual(v.verdict, "substantive")

    def test_substantive_panel_scholar(self):
        data = {"notes": [{"note": "z" * 800}]}
        v = ca.evaluate_panel("sarna", data)
        self.assertEqual(v.verdict, "substantive")

    def test_heb_50_char_boundary(self):
        # Exactly 50 chars in extracted text → adjusted=100, NOT below 50 stub-floor.
        # Confirms the empirical floor described in epic §1.5.
        data = [{"paragraph": "a" * 49, "gloss": ""}]
        v = ca.evaluate_panel("heb", data)
        # 49 chars < 50 → stub
        self.assertEqual(v.verdict, "stub")
        data2 = [{"paragraph": "a" * 60, "gloss": ""}]
        v2 = ca.evaluate_panel("heb", data2)
        self.assertEqual(v2.verdict, "substantive")


# ─── L1: Section tier tests ─────────────────────────────────────────

def _scholar_panel(notes_chars: int = 600) -> dict:
    return {"notes": [{"note": "x" * notes_chars}]}


def _heb_panel(chars: int = 300) -> list:
    return [{"paragraph": "y" * chars, "gloss": "z"}]


def _hist_panel(chars: int = 300) -> dict:
    return {"historical": "h" * chars, "context": "", "audience": ""}


def _cross_panel(chars: int = 80) -> dict:
    return {"refs": [{"note": "c" * chars}]}


class SectionTierTests(unittest.TestCase):
    def _eval(self, panels: dict, *, cp_verdicts=None) -> ca.SectionVerdict:
        section = {
            "section_num": 1, "verse_start": 1, "verse_end": 5,
            "panels": panels,
        }
        return ca.evaluate_section(
            "genesis", 1, section, SCHOLAR_KEYS, cp_verdicts or [],
        )

    def test_rich_section(self):
        # Rich rubric requires weight >= 6; heb+hist+cross+commentary collapses
        # to weight 4 alone. Real corpus reaches 'rich' via the chapter-panel
        # bonus (+0.5 per substantive chapter-panel type), so model that here.
        cp = [
            ca.ChapterPanelVerdict("genesis", 1, k, "substantive", True, 600)
            for k in ("ppl", "trans", "src", "rec")
        ]
        sv = self._eval({
            "heb": _heb_panel(300),
            "hist": _hist_panel(300),
            "cross": _cross_panel(80),
            "sarna": _scholar_panel(),
            "alter": _scholar_panel(),
            "calvin": _scholar_panel(),
        }, cp_verdicts=cp)
        # weight = 3 (non-commentary) + 1 (commentary) + 4*0.5 = 6.0
        self.assertGreaterEqual(sv.panel_weight, 6.0)
        self.assertEqual(sv.tier, "rich")

    def test_adequate_section(self):
        sv = self._eval({
            "heb": _heb_panel(300),
            "hist": _hist_panel(300),
            "cross": _cross_panel(80),
            "sarna": _scholar_panel(),
            "alter": _scholar_panel(),
        })
        self.assertEqual(sv.tier, "adequate")

    def test_thin_single_commentator(self):
        sv = self._eval({
            "heb": _heb_panel(300),
            "cross": _cross_panel(80),
            "sarna": _scholar_panel(),
        })
        # 1 commentator → fails commentator floor → deficient
        self.assertEqual(sv.tier, "deficient")
        self.assertEqual(sv.commentator_count, 1)

    def test_thin_boundary(self):
        # heb + hist + sarna + alter:
        #   weight = 1(heb) + 1(hist) + 1(commentary collapsed) = 3
        #   categories_hit = {linguistic, historical, commentary} = 3
        # Rubric: thin requires weight==3 AND categories==2 AND commentators==2.
        # Here categories=3 so this isn't a strict "thin" — falls to deficient.
        sv = self._eval({
            "heb": _heb_panel(300),
            "hist": _hist_panel(300),
            "sarna": _scholar_panel(),
            "alter": _scholar_panel(),
        })
        self.assertEqual(sv.commentator_count, 2)
        # weight=3, cats=3 → fails 'thin' (cats!=2) and fails 'adequate' (weight<4)
        self.assertEqual(sv.tier, "deficient")

    def test_thin_exact(self):
        # Construct exact thin: 2 categories, weight=3, 2 commentators
        # heb (linguistic) + sarna + alter (commentary collapsed) = weight 1+1=2,
        # add one more linguistic substantive panel
        sv = self._eval({
            "heb": _heb_panel(300),
            "hebtext": _heb_panel(300),  # also linguistic, second non-commentary
            "sarna": _scholar_panel(),
            "alter": _scholar_panel(),
        })
        # weight = 1(heb) + 1(hebtext) + 1(commentary) = 3
        # categories_hit = {linguistic, commentary} = 2
        # commentators = 2
        self.assertEqual(sv.tier, "thin")

    def test_commentary_only(self):
        sv = self._eval({
            "sarna": _scholar_panel(),
            "alter": _scholar_panel(),
            "calvin": _scholar_panel(),
            "macarthur": _scholar_panel(),
            "netbible": _scholar_panel(),
        })
        # commentary collapses to weight 1, categories_hit = 1 → deficient
        self.assertEqual(sv.tier, "deficient")
        codes = {f["code"] for f in sv.findings}
        self.assertIn("commentary_only", codes)

    def test_template_demotes_section(self):
        # Inject debate template pattern temporarily
        pt.TEMPLATE_PATTERNS["debate"] = [(
            "Critical/Analytical scholarship",
            "Traditional/Confessional reading",
            "Emphasises historical-critical",
        )]
        try:
            template_data = [[
                "Q",
                [["Critical/Analytical scholarship", "x" * 100, "Emphasises historical-critical."],
                 ["Traditional/Confessional reading", "y" * 100, "tradition"]],
                "summary",
            ]]
            # All panels substantive except `debate` which is template.
            sv_with_tpl = self._eval({
                "heb": _heb_panel(300),
                "hist": _hist_panel(300),
                "debate": template_data,
                "sarna": _scholar_panel(),
                "alter": _scholar_panel(),
            })
            sv_substantive = self._eval({
                "heb": _heb_panel(300),
                "hist": _hist_panel(300),
                "debate": _heb_panel(800),  # any substantive content
                "sarna": _scholar_panel(),
                "alter": _scholar_panel(),
            })
            # Templated debate doesn't count → categories_hit goes from 4→3,
            # weight from 5→4. Both still adequate but with strictly fewer.
            self.assertLess(sv_with_tpl.panel_weight, sv_substantive.panel_weight)
        finally:
            pt.TEMPLATE_PATTERNS.pop("debate", None)

    def test_chapter_bonus_lifts_weight(self):
        cp = [
            ca.ChapterPanelVerdict("genesis", 1, "ppl", "substantive", True, 600),
            ca.ChapterPanelVerdict("genesis", 1, "trans", "substantive", True, 600),
        ]
        sv = self._eval(
            {"heb": _heb_panel(300), "cross": _cross_panel(80), "sarna": _scholar_panel()},
            cp_verdicts=cp,
        )
        # Two chapter-panel categories → +1.0 to weight
        self.assertGreaterEqual(sv.panel_weight, 1 + 1 + 1 + 1.0)


# ─── L3: Chapter-panel completeness ────────────────────────────────

class ChapterPanelTests(unittest.TestCase):
    def test_gospel_missing_debate(self):
        chapter = {"chapter_panels": {"ppl": _scholar_panel(), "trans": _scholar_panel()}}
        out = ca.evaluate_chapter_panels("matthew", 5, chapter, "gospel")
        debate = [cp for cp in out if cp.panel_key == "debate"]
        self.assertEqual(len(debate), 1)
        self.assertEqual(debate[0].verdict, "missing")
        self.assertTrue(debate[0].expected)

    def test_poetry_missing_debate_no_finding(self):
        chapter = {"chapter_panels": {"ppl": _scholar_panel()}}
        out = ca.evaluate_chapter_panels("psalms", 23, chapter, "poetry")
        debate = [cp for cp in out if cp.panel_key == "debate"]
        # poetry doesn't expect debate → no finding emitted
        self.assertEqual(debate, [])

    def test_epistle_discourse_template(self):
        pt.TEMPLATE_PATTERNS["discourse"] = [("standard discourse marker A",
                                              "standard discourse marker B")]
        try:
            chapter = {"chapter_panels": {
                "discourse": {"notes": [{
                    "note": "This panel includes standard discourse marker A and standard discourse marker B" + " x" * 200,
                }]},
            }}
            out = ca.evaluate_chapter_panels("romans", 1, chapter, "epistle")
            disc = [cp for cp in out if cp.panel_key == "discourse"][0]
            self.assertEqual(disc.verdict, "template")
        finally:
            pt.TEMPLATE_PATTERNS.pop("discourse", None)

    def test_bonus_panel(self):
        # poetry doesn't expect debate; if substantive debate present → bonus
        chapter = {"chapter_panels": {
            "debate": [{"title": "T", "positions": [{"name": "A", "argument": "x" * 200}]}],
            "ppl": _scholar_panel(),
        }}
        out = ca.evaluate_chapter_panels("psalms", 1, chapter, "poetry")
        bonus = [cp for cp in out if cp.panel_key == "debate"]
        self.assertEqual(len(bonus), 1)
        self.assertFalse(bonus[0].expected)
        self.assertEqual(bonus[0].verdict, "substantive")


# ─── Algorithm tests ────────────────────────────────────────────────

class CategorizeTests(unittest.TestCase):
    def test_heb_linguistic(self):
        self.assertEqual(pt.categorize_panel("heb", SCHOLAR_KEYS), "linguistic")

    def test_hist_historical(self):
        self.assertEqual(pt.categorize_panel("hist", SCHOLAR_KEYS), "historical")

    def test_cross_connective(self):
        self.assertEqual(pt.categorize_panel("cross", SCHOLAR_KEYS), "connective")

    def test_mac_is_commentary(self):
        # Critical: scholar key 'mac' must NOT be misclassified as historical.
        self.assertEqual(pt.categorize_panel("mac", SCHOLAR_KEYS), "commentary")

    def test_sarna_commentary(self):
        self.assertEqual(pt.categorize_panel("sarna", SCHOLAR_KEYS), "commentary")

    def test_themes_connective(self):
        self.assertEqual(pt.categorize_panel("themes", SCHOLAR_KEYS), "connective")

    def test_unknown_key(self):
        self.assertEqual(pt.categorize_panel("zzz_unknown", SCHOLAR_KEYS), "unknown")


class BooksDiscoveryTests(unittest.TestCase):
    def test_excludes_non_book_dirs(self):
        with tempfile.TemporaryDirectory() as td:
            content = Path(td)
            (content / "meta").mkdir()
            (content / "meta" / "books.json").write_text(json.dumps([
                {"id": "genesis", "is_live": True, "book_order": 1, "genre": "theological_narrative"},
                {"id": "fakebook", "is_live": False, "book_order": 99, "genre": "history"},
            ]), encoding="utf-8")
            books = ca.load_books(content)
            ids = {b["id"] for b in books}
            self.assertEqual(ids, {"genesis"})

    def test_canonical_order(self):
        with tempfile.TemporaryDirectory() as td:
            content = Path(td)
            (content / "meta").mkdir()
            (content / "meta" / "books.json").write_text(json.dumps([
                {"id": "matthew", "is_live": True, "book_order": 40},
                {"id": "genesis", "is_live": True, "book_order": 1},
                {"id": "psalms", "is_live": True, "book_order": 19},
            ]), encoding="utf-8")
            books = ca.load_books(content)
            self.assertEqual([b["id"] for b in books], ["genesis", "psalms", "matthew"])


class TemplateSignatureTests(unittest.TestCase):
    def test_signature_strips_numeric_refs(self):
        sig1 = ca._signature_of([{"title": "Question 9:22", "body": "x"}])
        sig2 = ca._signature_of([{"title": "Question 11:5", "body": "x"}])
        # Verse refs stripped → signatures should match
        self.assertEqual(sig1, sig2)

    def test_signature_truncates_300(self):
        big = ca._signature_of("x" * 1000)
        self.assertLessEqual(len(big), 300)


# ─── Integration: run_audit on synthetic corpus ────────────────────

class RunAuditIntegrationTests(unittest.TestCase):
    def _make_corpus(self, td: Path) -> Path:
        content = td / "content"
        (content / "meta").mkdir(parents=True)
        (content / "meta" / "books.json").write_text(json.dumps([
            {"id": "genesis", "is_live": True, "book_order": 1,
             "genre": "theological_narrative", "total_chapters": 1},
        ]), encoding="utf-8")
        (content / "meta" / "scholars.json").write_text(json.dumps([
            {"id": "sarna", "panel_key": "sarna"},
            {"id": "alter", "panel_key": "alter"},
        ]), encoding="utf-8")
        (content / "genesis").mkdir()
        (content / "genesis" / "1.json").write_text(json.dumps({
            "chapter_id": "gen1", "book_dir": "genesis", "chapter_num": 1,
            "chapter_panels": {
                "ppl": {"notes": [{"note": "x" * 600}]},
            },
            "sections": [{
                "section_num": 1, "verse_start": 1, "verse_end": 5,
                "panels": {
                    "heb": [{"paragraph": "y" * 300, "gloss": "z"}],
                    "hist": {"historical": "h" * 300},
                    "cross": {"refs": [{"note": "c" * 80}]},
                    "sarna": {"notes": [{"note": "n" * 600}]},
                    "alter": {"notes": [{"note": "n" * 600}]},
                },
            }],
        }), encoding="utf-8")
        return content

    def test_run_audit_end_to_end(self):
        with tempfile.TemporaryDirectory() as td:
            content = self._make_corpus(Path(td))
            report = ca.run_audit(content)
            self.assertEqual(len(report.sections), 1)
            self.assertEqual(report.sections[0].tier, "adequate")
            # JSON serializes
            data = json.loads(report.to_json())
            self.assertEqual(data["summary"]["total_sections"], 1)
            # Markdown renders
            md = report.to_markdown()
            self.assertIn("genesis", md)
            self.assertIn("Executive Summary", md)


# ─── Phase 2 / 3 stubs ─────────────────────────────────────────────

class StubFlagTests(unittest.TestCase):
    def test_parables_stub(self):
        rc = ca.main(["--parables"])
        self.assertEqual(rc, 0)

    def test_concepts_stub(self):
        rc = ca.main(["--concepts"])
        self.assertEqual(rc, 0)


if __name__ == "__main__":
    unittest.main(verbosity=2)
