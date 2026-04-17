#!/usr/bin/env python3
"""count.py — Count meta-FAQ articles vs the quarterly target (#1470).

Usage:
    python3 _tools/meta_faq/count.py
    python3 _tools/meta_faq/count.py --json
"""
from __future__ import annotations

import argparse
import json
import os
import sys
from datetime import datetime
from typing import Optional


# Quarterly target: +20 articles per quarter, starting at 50 articles.
BASELINE_COUNT = 50
PER_QUARTER_TARGET = 20

# The baseline was established in Q2 2026. Quarters are simply counted as
# three-month windows from this anchor; fractional progress is rounded
# down so we only credit full quarters.
BASELINE_DATE = datetime(2026, 4, 1)


def meta_faq_dir() -> str:
    here = os.path.dirname(os.path.abspath(__file__))
    # _tools/meta_faq/ → repo_root/content/meta_faq/
    return os.path.abspath(os.path.join(here, '..', '..', 'content', 'meta_faq'))


def count_articles(directory: Optional[str] = None) -> int:
    d = directory or meta_faq_dir()
    if not os.path.isdir(d):
        return 0
    n = 0
    for entry in os.listdir(d):
        if entry.endswith('.md') and not entry.startswith('_') and entry != 'PLAYBOOK.md':
            n += 1
    return n


def quarterly_target(now: Optional[datetime] = None) -> int:
    now = now or datetime.utcnow()
    months = (now.year - BASELINE_DATE.year) * 12 + (now.month - BASELINE_DATE.month)
    quarters_elapsed = max(0, months // 3)
    return BASELINE_COUNT + quarters_elapsed * PER_QUARTER_TARGET


def main(argv: Optional[list[str]] = None) -> int:
    p = argparse.ArgumentParser(description='Meta-FAQ quarterly counter.')
    p.add_argument('--json', action='store_true', help='Emit JSON output.')
    p.add_argument('--dir', default=None, help='Meta-FAQ directory (default: content/meta_faq).')
    args = p.parse_args(argv)

    count = count_articles(args.dir)
    target = quarterly_target()
    delta = count - target
    if args.json:
        sys.stdout.write(
            json.dumps({'count': count, 'target': target, 'delta': delta}) + '\n',
        )
        return 0
    status = 'on track' if delta >= 0 else 'behind target'
    sys.stdout.write(
        f'{count} articles in content/meta_faq/ '
        f'(target this quarter: {target}, delta: {delta:+d} — {status})\n',
    )
    return 0


if __name__ == '__main__':
    sys.exit(main())
