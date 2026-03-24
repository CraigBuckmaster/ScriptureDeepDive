#!/usr/bin/env python3
"""
Audit Verification Script for ScriptureDeepDive.

Manages the verification workflow for audit flags:
  - Select batches of unverified flags for review
  - Record verification results with sources
  - Track verification progress

Usage:
    # Show verification progress
    python3 _tools/audit_verify.py stats

    # Get next batch of flags to verify (default: 20, lowest confidence first)
    python3 _tools/audit_verify.py batch
    python3 _tools/audit_verify.py batch --count 10 --category date
    python3 _tools/audit_verify.py batch --count 15 --category hebrew --book ezekiel

    # Record a verification result
    python3 _tools/audit_verify.py record <flag_id> <status> <new_confidence> "<note>" "<source_urls>"
    python3 _tools/audit_verify.py record flag_00042 verified 5 "Confirmed: 586 BC fall of Jerusalem" "https://..."
    python3 _tools/audit_verify.py record flag_00099 needs_correction 1 "Wrong date, should be 587 BC" ""

    # Bulk record: pass a JSON file of results
    python3 _tools/audit_verify.py bulk_record /tmp/verify_results.json

    # Deduplicate: group identical claims and verify them as a unit
    python3 _tools/audit_verify.py dedup --category date

Statuses:
    pending          — not yet reviewed (default)
    verified         — confirmed accurate, no change needed
    needs_correction — inaccurate, correction needed (deferred to correction pipeline)
    needs_expert     — requires domain expert review
    dismissed        — not worth verifying (noise flag)

The bulk_record JSON format:
[
    {
        "flag_id": "flag_00042",
        "status": "verified",
        "confidence": 5,
        "note": "Confirmed via web search",
        "sources": ["https://example.com/article"]
    },
    ...
]
"""

import argparse
import json
import os
import sys
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path

AUDIT_FILE = Path(__file__).parent.parent / 'content' / 'meta' / 'audit-flags.json'

# Priority order for categories (most objectively verifiable first)
CATEGORY_PRIORITY = [
    'date',              # dates are binary right/wrong
    'hebrew',            # transliterations can be checked against lexicons
    'greek',             # same
    'family',            # genealogies are verifiable from Scripture
    'cross_ref',         # reference existence is verifiable
    'historical',        # requires more research but checkable
    'scholar_position',  # hardest — requires access to published works
]


def load_flags():
    """Load audit-flags.json."""
    if not AUDIT_FILE.exists():
        print(f"ERROR: {AUDIT_FILE} not found. Run audit_flags.py first.")
        sys.exit(1)
    with open(AUDIT_FILE, 'r', encoding='utf-8') as f:
        return json.load(f)


def save_flags(data):
    """Save audit-flags.json."""
    with open(AUDIT_FILE, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)


def cmd_stats(args):
    """Show verification progress."""
    data = load_flags()
    flags = data['flags']
    total = len(flags)

    # Status breakdown
    status_counts = defaultdict(int)
    for f in flags:
        status_counts[f.get('status', 'pending')] += 1

    # Category breakdown
    cat_status = defaultdict(lambda: defaultdict(int))
    for f in flags:
        cat_status[f['category']][f.get('status', 'pending')] += 1

    # Book breakdown (pending only)
    book_pending = defaultdict(int)
    for f in flags:
        if f.get('status', 'pending') == 'pending':
            book_pending[f['book']] += 1

    print("=" * 60)
    print("AUDIT VERIFICATION PROGRESS")
    print("=" * 60)
    print(f"\nTotal flags: {total}")
    print(f"\nBy status:")
    for status in ['pending', 'verified', 'needs_correction',
                    'needs_expert', 'dismissed']:
        count = status_counts.get(status, 0)
        pct = (count / total * 100) if total else 0
        bar = '#' * int(pct / 2)
        print(f"  {status:20s} {count:6d} ({pct:5.1f}%) {bar}")

    print(f"\nBy category (pending / total):")
    for cat in CATEGORY_PRIORITY:
        cat_flags = cat_status.get(cat, {})
        cat_total = sum(cat_flags.values())
        cat_pending = cat_flags.get('pending', 0)
        cat_verified = cat_flags.get('verified', 0)
        if cat_total:
            print(f"  {cat:20s} {cat_pending:5d} / {cat_total:5d} "
                  f"({cat_verified} verified)")

    print(f"\nTop 10 books by pending flags:")
    sorted_books = sorted(book_pending.items(),
                          key=lambda x: x[1], reverse=True)[:10]
    for book, count in sorted_books:
        print(f"  {book:20s} {count:5d}")

    # Unique claims analysis for dates
    date_flags = [f for f in flags
                  if f['category'] == 'date' and f.get('status') == 'pending']
    unique = set(f['claim'].strip() for f in date_flags)
    print(f"\nDate optimization: {len(date_flags)} flags contain "
          f"{len(unique)} unique claims")
    print(f"  (verifying unique claims would cascade to all instances)")


def cmd_batch(args):
    """Select next batch of flags to verify."""
    data = load_flags()
    flags = data['flags']

    # Filter to pending only
    pending = [f for f in flags if f.get('status', 'pending') == 'pending']

    # Apply filters
    if args.category:
        pending = [f for f in pending if f['category'] == args.category]
    if args.book:
        pending = [f for f in pending if f['book'] == args.book]

    # Sort: lowest confidence first, then by category priority
    cat_order = {c: i for i, c in enumerate(CATEGORY_PRIORITY)}
    pending.sort(key=lambda f: (
        f['confidence'],
        cat_order.get(f['category'], 99),
        f['book'],
        f['chapter'],
    ))

    # Deduplicate by claim text if --dedup flag is set
    if args.dedup:
        seen_claims = set()
        deduped = []
        for f in pending:
            claim_key = (f['category'], f['claim'].strip())
            if claim_key not in seen_claims:
                seen_claims.add(claim_key)
                deduped.append(f)
        pending = deduped

    batch = pending[:args.count]

    if not batch:
        print("No pending flags match the criteria.")
        return

    print(f"BATCH: {len(batch)} flags "
          f"(category={args.category or 'all'}, "
          f"book={args.book or 'all'}, "
          f"dedup={args.dedup})")
    print("=" * 70)

    # Output in a format useful for verification
    for i, f in enumerate(batch, 1):
        print(f"\n[{i}/{len(batch)}] {f['id']} | "
              f"conf={f['confidence']} | {f['category']} | "
              f"{f['book']} {f['chapter']}:{f['section']}")
        print(f"  Panel: {f['source_panel']}")
        print(f"  Claim: {f['claim'][:200]}")
        if f.get('context'):
            print(f"  Context: {f['context'][:150]}")

        # Generate a suggested search query
        query = _suggest_query(f)
        if query:
            print(f"  Suggested search: {query}")

    print(f"\n{'=' * 70}")
    print(f"To record results, run:")
    print(f"  python3 _tools/audit_verify.py record <flag_id> "
          f"<verified|needs_correction|needs_expert|dismissed> "
          f"<new_confidence> \"<note>\" \"<source_urls>\"")

    # Also output as JSON for bulk processing
    batch_file = '/tmp/audit_batch.json'
    batch_out = []
    for f in batch:
        batch_out.append({
            'flag_id': f['id'],
            'category': f['category'],
            'confidence': f['confidence'],
            'book': f['book'],
            'chapter': f['chapter'],
            'section': f['section'],
            'claim': f['claim'],
            'context': f.get('context', ''),
            'source_panel': f['source_panel'],
            'suggested_query': _suggest_query(f),
        })
    with open(batch_file, 'w') as bf:
        json.dump(batch_out, bf, indent=2, ensure_ascii=False)
    print(f"\nBatch exported to {batch_file}")


def _suggest_query(flag):
    """Generate a web search query for verifying a flag."""
    cat = flag['category']
    claim = flag['claim']
    book = flag['book']

    if cat == 'date':
        # Extract the date and surrounding event
        # For short claims like "586 BC", add context
        if len(claim) < 20 and flag.get('context'):
            return f"bible {flag['context'][:60]}"
        return f"bible chronology {claim[:60]}"

    elif cat == 'hebrew':
        # Extract word and transliteration
        if 'Hebrew:' in claim:
            parts = claim.replace('Hebrew: ', '')
            return f"Hebrew word {parts[:50]} biblical meaning"
        return f"Hebrew {claim[:50]} meaning"

    elif cat == 'greek':
        if 'Greek:' in claim:
            parts = claim.replace('Greek: ', '')
            return f"Greek word {parts[:50]} biblical meaning"
        return f"Greek {claim[:50]} meaning"

    elif cat == 'family':
        return f"bible genealogy {claim[:60]}"

    elif cat == 'cross_ref':
        # Extract the reference
        ref_match = claim[:30]
        return f"bible {ref_match} commentary"

    elif cat == 'historical':
        return f"ancient Near East {claim[:60]}"

    elif cat == 'scholar_position':
        # Extract scholar name and topic
        if '[' in claim and ']' in claim:
            scholar = claim.split(']')[0].replace('[', '')
            topic = claim.split(']')[1][:50] if ']' in claim else claim[:50]
            return f"{scholar} commentary {book} {topic}"
        return f"biblical commentary {claim[:60]}"

    return None


def cmd_record(args):
    """Record a single verification result."""
    data = load_flags()
    flags = data['flags']

    # Find the flag
    target = None
    for f in flags:
        if f['id'] == args.flag_id:
            target = f
            break

    if not target:
        print(f"ERROR: Flag '{args.flag_id}' not found.")
        sys.exit(1)

    # Parse sources
    sources = []
    if args.sources:
        sources = [s.strip() for s in args.sources.split(',') if s.strip()]

    # Update the flag
    old_status = target.get('status', 'pending')
    old_confidence = target['confidence']

    target['status'] = args.status
    target['confidence'] = args.confidence
    target['verification'] = {
        'note': args.note,
        'sources': sources,
        'verified_at': datetime.now(timezone.utc).isoformat(),
        'previous_confidence': old_confidence,
    }

    save_flags(data)
    print(f"Updated {args.flag_id}: {old_status} -> {args.status}, "
          f"confidence {old_confidence} -> {args.confidence}")

    # If this is a date/hebrew flag, offer to cascade to identical claims
    if target['category'] in ('date', 'hebrew', 'greek'):
        identical = [f for f in flags
                     if f['id'] != target['id']
                     and f['category'] == target['category']
                     and f['claim'].strip() == target['claim'].strip()
                     and f.get('status', 'pending') == 'pending']
        if identical:
            print(f"\n  Found {len(identical)} identical claims. "
                  f"Cascade this verification to all? (use --cascade)")


def cmd_bulk_record(args):
    """Record multiple verification results from a JSON file."""
    with open(args.results_file, 'r') as f:
        results = json.load(f)

    data = load_flags()
    flags = data['flags']
    flag_index = {f['id']: f for f in flags}

    updated = 0
    cascaded = 0
    not_found = 0

    for result in results:
        fid = result['flag_id']
        if fid not in flag_index:
            print(f"  WARN: {fid} not found, skipping")
            not_found += 1
            continue

        target = flag_index[fid]
        old_confidence = target['confidence']

        target['status'] = result['status']
        target['confidence'] = result.get('confidence', target['confidence'])
        target['verification'] = {
            'note': result.get('note', ''),
            'sources': result.get('sources', []),
            'verified_at': datetime.now(timezone.utc).isoformat(),
            'previous_confidence': old_confidence,
        }
        updated += 1

        # Auto-cascade for date/hebrew/greek identical claims
        if result.get('cascade', True) and \
                target['category'] in ('date', 'hebrew', 'greek'):
            for f in flags:
                if (f['id'] != fid
                        and f['category'] == target['category']
                        and f['claim'].strip() == target['claim'].strip()
                        and f.get('status', 'pending') == 'pending'):
                    f['status'] = target['status']
                    f['confidence'] = target['confidence']
                    f['verification'] = {
                        'note': f"Cascaded from {fid}: {result.get('note', '')}",
                        'sources': result.get('sources', []),
                        'verified_at': datetime.now(timezone.utc).isoformat(),
                        'previous_confidence': f['confidence'],
                        'cascaded_from': fid,
                    }
                    cascaded += 1

    save_flags(data)
    print(f"Bulk record complete: {updated} updated, "
          f"{cascaded} cascaded, {not_found} not found")


def cmd_dedup(args):
    """Show deduplicated claims for efficient batch verification."""
    data = load_flags()
    flags = data['flags']

    # Filter
    pending = [f for f in flags if f.get('status', 'pending') == 'pending']
    if args.category:
        pending = [f for f in pending if f['category'] == args.category]

    # Group by normalized claim
    groups = defaultdict(list)
    for f in pending:
        key = (f['category'], f['claim'].strip())
        groups[key].append(f)

    # Sort by group size (largest first — most impact per verification)
    sorted_groups = sorted(groups.items(),
                           key=lambda x: len(x[1]), reverse=True)

    print(f"DEDUPLICATED CLAIMS: {len(sorted_groups)} unique "
          f"(from {len(pending)} flags)")
    print("=" * 70)

    for i, ((cat, claim), flag_list) in enumerate(sorted_groups[:args.count]):
        books = set(f['book'] for f in flag_list)
        print(f"\n[{i+1}] {cat} | {len(flag_list)} instances | "
              f"books: {', '.join(sorted(books)[:5])}")
        print(f"  Claim: {claim[:200]}")
        print(f"  Flag IDs: {flag_list[0]['id']} "
              f"(+{len(flag_list)-1} more)")
        query = _suggest_query(flag_list[0])
        if query:
            print(f"  Suggested search: {query}")


def main():
    parser = argparse.ArgumentParser(
        description='Audit flag verification workflow')
    subparsers = parser.add_subparsers(dest='command', help='Command')

    # stats
    subparsers.add_parser('stats', help='Show verification progress')

    # batch
    batch_p = subparsers.add_parser('batch',
                                     help='Select next batch to verify')
    batch_p.add_argument('--count', type=int, default=20,
                         help='Number of flags in batch')
    batch_p.add_argument('--category', type=str, default=None,
                         help='Filter by category')
    batch_p.add_argument('--book', type=str, default=None,
                         help='Filter by book')
    batch_p.add_argument('--dedup', action='store_true',
                         help='Deduplicate identical claims')

    # record
    rec_p = subparsers.add_parser('record',
                                   help='Record a verification result')
    rec_p.add_argument('flag_id', help='Flag ID (e.g. flag_00042)')
    rec_p.add_argument('status',
                        choices=['verified', 'needs_correction',
                                 'needs_expert', 'dismissed'])
    rec_p.add_argument('confidence', type=int,
                        help='Updated confidence (0-5)')
    rec_p.add_argument('note', help='Verification note')
    rec_p.add_argument('sources', nargs='?', default='',
                        help='Comma-separated source URLs')

    # bulk_record
    bulk_p = subparsers.add_parser('bulk_record',
                                    help='Record results from JSON file')
    bulk_p.add_argument('results_file', help='Path to results JSON')

    # dedup
    dedup_p = subparsers.add_parser('dedup',
                                     help='Show deduplicated claims')
    dedup_p.add_argument('--category', type=str, default=None)
    dedup_p.add_argument('--count', type=int, default=30)

    args = parser.parse_args()

    if not args.command:
        parser.print_help()
        return

    os.chdir(Path(__file__).parent.parent)

    commands = {
        'stats': cmd_stats,
        'batch': cmd_batch,
        'record': cmd_record,
        'bulk_record': cmd_bulk_record,
        'dedup': cmd_dedup,
    }
    commands[args.command](args)


if __name__ == '__main__':
    main()
