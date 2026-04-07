#!/usr/bin/env python3
"""
pipeline.py — Content pipeline orchestrator for Companion Study.

Single entry point for all pipeline workflows. Handles dependency
ordering, staleness detection, and auto-chaining so you never run
scripts out of order or forget a step.

Usage:
    python _tools/pipeline.py build      # validate → build DB → validate DB
    python _tools/pipeline.py verify     # re-verify stale claims → update matrix
    python _tools/pipeline.py ci         # full CI checks (validate + build + audit + quality)
    python _tools/pipeline.py full       # clean rebuild + full audit
    python _tools/pipeline.py status     # show what's stale
"""

import argparse
import json
import os
import subprocess
import sys
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TOOLS = ROOT / "_tools"
CONTENT = ROOT / "content"
APP_ASSETS = ROOT / "app" / "assets"
DB_PATH = APP_ASSETS / "scripture.db"
DB_VERSION_PATH = TOOLS / "db_version.json"
DATABASE_TS = ROOT / "app" / "src" / "db" / "database.ts"
MATRIX_PATH = TOOLS / "audit" / "reference_matrix.json"


# ─── Staleness helpers ────────────────────────────────────────────

def _mtime(path: Path) -> float:
    """File modification time, or 0 if missing."""
    try:
        return path.stat().st_mtime
    except FileNotFoundError:
        return 0.0


def _newest_content_mtime() -> float:
    """Most recent mtime across all content JSON files."""
    newest = 0.0
    for p in CONTENT.rglob("*.json"):
        t = _mtime(p)
        if t > newest:
            newest = t
    return newest


def _db_is_stale() -> bool:
    """True if any content file is newer than scripture.db."""
    return _newest_content_mtime() > _mtime(DB_PATH)


def _matrix_is_stale() -> bool:
    """True if any content file is newer than reference_matrix.json."""
    if not MATRIX_PATH.exists():
        return True
    return _newest_content_mtime() > _mtime(MATRIX_PATH)


def _matrix_refuted_count() -> int:
    """Count REFUTED claims in the reference matrix."""
    if not MATRIX_PATH.exists():
        return 0
    try:
        data = json.loads(MATRIX_PATH.read_text(encoding="utf-8"))
        return sum(1 for c in data.get("claims", {}).values()
                   if c.get("status") == "REFUTED")
    except Exception:
        return -1


def _db_version() -> str:
    """Current DB version from db_version.json."""
    try:
        return json.loads(DB_VERSION_PATH.read_text(encoding="utf-8"))["version"]
    except Exception:
        return "unknown"


def _db_size_mb() -> float:
    """Size of scripture.db in MB."""
    try:
        return DB_PATH.stat().st_size / (1024 * 1024)
    except FileNotFoundError:
        return 0.0


def _fmt_age(mtime: float) -> str:
    """Human-readable age from mtime."""
    if mtime == 0:
        return "missing"
    delta = time.time() - mtime
    if delta < 60:
        return f"{int(delta)}s ago"
    if delta < 3600:
        return f"{int(delta / 60)}m ago"
    if delta < 86400:
        return f"{delta / 3600:.1f}h ago"
    return f"{delta / 86400:.1f}d ago"


# ─── Step runners ─────────────────────────────────────────────────

def _run_script(name: str, script: str, args: list[str] | None = None,
                required: bool = True) -> bool:
    """Run a Python script from _tools/. Returns True on success."""
    path = TOOLS / script
    if not path.exists():
        print(f"  [{name}] SKIP — {script} not found")
        return not required

    cmd = [sys.executable, str(path)] + (args or [])
    print(f"\n{'=' * 60}")
    print(f"  [{name}] Running {script}...")
    print(f"{'=' * 60}\n")

    result = subprocess.run(cmd, cwd=str(ROOT))

    if result.returncode != 0:
        print(f"\n  [{name}] FAILED (exit code {result.returncode})")
        return False

    print(f"\n  [{name}] OK")
    return True


def step_validate(book: str | None = None) -> bool:
    """Run schema_validator.py."""
    args = []
    if book:
        args += ["--book", book]
    return _run_script("validate", "schema_validator.py", args)


def step_build() -> bool:
    """Run build_sqlite.py to produce scripture.db."""
    return _run_script("build", "build_sqlite.py")


def step_validate_db() -> bool:
    """Run validate_sqlite.py on the built DB."""
    if not DB_PATH.exists():
        print("  [validate-db] SKIP — scripture.db not found")
        return False
    return _run_script("validate-db", "validate_sqlite.py")


def step_audit(tier: int = 1, book: str | None = None,
               incremental: bool = False) -> bool:
    """Run accuracy_auditor.py to update the reference matrix."""
    args = ["--tier", str(tier)]
    if book:
        args += ["--book", book]
    if incremental:
        # Only re-verify chapters that changed since last matrix update
        changed = _get_changed_books_since_matrix()
        if not changed:
            print("  [audit] SKIP — no content changes since last audit")
            return True
        # Run per-book for each changed book
        ok = True
        for b in changed:
            if not _run_script(f"audit:{b}", "accuracy_auditor.py",
                               ["--tier", str(tier), "--book", b]):
                ok = False
        return ok
    return _run_script("audit", "accuracy_auditor.py", args)


def _get_changed_books_since_matrix() -> list[str]:
    """Return book_dirs with content newer than the reference matrix."""
    if not MATRIX_PATH.exists():
        return []
    matrix_mtime = _mtime(MATRIX_PATH)
    changed = set()
    for book_dir in sorted(CONTENT.iterdir()):
        if not book_dir.is_dir():
            continue
        if book_dir.name in ("meta", "verses", "interlinear",
                             "archaeology", "life_topics"):
            continue
        for ch_file in book_dir.glob("*.json"):
            if _mtime(ch_file) > matrix_mtime:
                changed.add(book_dir.name)
                break
    return sorted(changed)


# ─── Workflows ────────────────────────────────────────────────────

def workflow_status():
    """Show staleness of each pipeline artifact."""
    print("\n  Pipeline Status")
    print("  " + "─" * 50)

    # scripture.db
    db_stale = _db_is_stale()
    db_ver = _db_version()
    db_mb = _db_size_mb()
    db_age = _fmt_age(_mtime(DB_PATH))
    status = "STALE" if db_stale else "OK"
    print(f"  scripture.db:       {status} — v{db_ver}, {db_mb:.1f}MB, built {db_age}")

    # reference_matrix.json
    mat_stale = _matrix_is_stale()
    mat_age = _fmt_age(_mtime(MATRIX_PATH))
    refuted = _matrix_refuted_count()
    status = "STALE" if mat_stale else "OK"
    refuted_str = f", {refuted} REFUTED" if refuted > 0 else ""
    print(f"  reference_matrix:   {status} — updated {mat_age}{refuted_str}")

    if mat_stale:
        changed = _get_changed_books_since_matrix()
        if changed:
            print(f"    → {len(changed)} books changed: {', '.join(changed[:10])}"
                  + ("..." if len(changed) > 10 else ""))

    # Content freshness
    content_age = _fmt_age(_newest_content_mtime())
    print(f"  content newest:     {content_age}")

    print()


def workflow_build(book: str | None = None):
    """validate → build DB → validate DB"""
    print("\n  Workflow: build")
    print("  " + "─" * 50)

    if not _db_is_stale() and not book:
        print("  scripture.db is up to date. Use 'full' to force rebuild.")
        print("  (Run 'pipeline.py status' to see details)")
        # Still rebuild if explicitly requested
        inp = input("  Rebuild anyway? [y/N] ").strip().lower()
        if inp != "y":
            return

    if not step_validate(book):
        print("\n  ABORTED — validation failed.")
        sys.exit(1)

    if not step_build():
        print("\n  ABORTED — build failed.")
        sys.exit(1)

    step_validate_db()

    print(f"\n  Done. scripture.db v{_db_version()} ({_db_size_mb():.1f}MB)")


def workflow_verify(tier: int = 1):
    """Re-verify stale claims and update the reference matrix."""
    print("\n  Workflow: verify")
    print("  " + "─" * 50)

    if not _matrix_is_stale():
        print("  Reference matrix is up to date.")
        refuted = _matrix_refuted_count()
        if refuted > 0:
            print(f"  ({refuted} REFUTED claims — run 'full' to re-audit everything)")
        return

    # Auto-rebuild DB if stale
    if _db_is_stale():
        print("  scripture.db is stale — rebuilding first...")
        if not step_build():
            print("\n  ABORTED — build failed.")
            sys.exit(1)

    changed = _get_changed_books_since_matrix()
    if changed:
        print(f"  Re-verifying {len(changed)} changed books: {', '.join(changed)}")
        step_audit(tier=tier, incremental=True)
    else:
        print("  No content changes detected — running full re-audit...")
        step_audit(tier=tier)

    refuted = _matrix_refuted_count()
    print(f"\n  Done. {refuted} REFUTED claims remaining.")


def workflow_ci(changed_files: list[str] | None = None, tier: int = 1):
    """Full CI pipeline: validate → build → validate DB → audit → quality."""
    print("\n  Workflow: ci")
    print("  " + "─" * 50)

    if not step_validate():
        sys.exit(1)

    if not step_build():
        sys.exit(1)

    if not step_validate_db():
        sys.exit(1)

    # Run CI content check if available
    args = ["--tier", str(tier)]
    if changed_files:
        args += changed_files
    _run_script("ci-check", "ci_content_check.py", args, required=False)


def workflow_full(tier: int = 1):
    """Clean rebuild + full audit."""
    print("\n  Workflow: full")
    print("  " + "─" * 50)

    if not step_validate():
        print("\n  ABORTED — validation failed.")
        sys.exit(1)

    if not step_build():
        print("\n  ABORTED — build failed.")
        sys.exit(1)

    step_validate_db()
    step_audit(tier=tier)

    refuted = _matrix_refuted_count()
    print(f"\n  Done. DB v{_db_version()} ({_db_size_mb():.1f}MB)")
    print(f"  {refuted} REFUTED claims in reference matrix.")


# ─── CLI ──────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(
        description="Content pipeline orchestrator",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Workflows:
  status    Show what's stale (no changes made)
  build     validate → build DB → validate DB
  verify    re-verify stale claims → update matrix
  ci        full CI checks (validate + build + audit + quality)
  full      clean rebuild + full audit
        """,
    )
    parser.add_argument(
        "workflow",
        choices=["status", "build", "verify", "ci", "full"],
        help="Pipeline workflow to run",
    )
    parser.add_argument("--book", help="Scope to a single book (e.g., genesis)")
    parser.add_argument("--tier", type=int, default=1,
                        help="Max verification tier (default: 1)")
    parser.add_argument("--files", nargs="*",
                        help="Changed files (for ci workflow)")

    args = parser.parse_args()

    if args.workflow == "status":
        workflow_status()
    elif args.workflow == "build":
        workflow_build(book=args.book)
    elif args.workflow == "verify":
        workflow_verify(tier=args.tier)
    elif args.workflow == "ci":
        workflow_ci(changed_files=args.files, tier=args.tier)
    elif args.workflow == "full":
        workflow_full(tier=args.tier)


if __name__ == "__main__":
    main()
