# _tools/art_sources — Source-of-truth art files

This directory holds the **original downloaded bytes** of every public-domain
art asset referenced by Companion Study. Files are tracked via Git LFS.

## Why it exists

Until April 2026, `_tools/fix_missing_art.py` fetched art directly from
`upload.wikimedia.org` at runtime. Wikimedia Commons is an actively curated
media library: files get renamed, merged, and deleted during housekeeping.
Our hash-prefixed hotlinks rotted faster than we could re-curate, and on
2026-04-22 all 9 of the originally-curated Map + Prophecy card sources
were dead (real 404s, not blocks).

Committing the bytes here makes this repo the source of truth. The runtime
script uploads from local disk; it never needs Commons to be up, unchanged,
or even reachable.

## What lives here

- `{r2_filename}.jpg` — one file per R2 asset. The filename matches the
  `r2_filename` field of the corresponding `ArtTarget` entry in
  `_tools/fix_missing_art.py`. The bytes are already post-conversion (PNG
  sources from Wikimedia have been flattened to RGB JPEG, quality 90).
- `_discovered.json` — last output of `_tools/discover_art_sources.py`.
  Records provenance: which Commons `File:` title each asset came from,
  plus dimensions and size. Check this in after every re-discovery run.

## How to add a new asset

1. Add the subject to `SUBJECTS` in `_tools/discover_art_sources.py`.
2. Run `python _tools/discover_art_sources.py`. Inspect the new entry.
3. Add an `ArtTarget(...)` entry to `TARGETS` in `_tools/fix_missing_art.py`.
4. Run `python _tools/fix_missing_art.py --populate-sources --only {new_r2_filename}`
   to download the source, convert if needed, and stage it in this directory.
5. Commit `_tools/art_sources/{new_r2_filename}` plus the script changes.
6. Run `python _tools/fix_missing_art.py --only {new_r2_filename}` to upload
   to R2 (or trigger the `fix-missing-art.yml` workflow).

## How to re-curate when Commons breaks the world again

1. Run `python _tools/discover_art_sources.py` to re-resolve all sources.
2. Run `python _tools/fix_missing_art.py --populate-sources` to re-download.
3. Inspect the diff. Commit changed bytes + updated `_discovered.json`.

The R2 bucket itself stays untouched until you run `fix_missing_art.py`
without `--populate-sources`.

## Why Git LFS and not a source R2 bucket

LFS keeps provenance next to the code that depends on it. `git log` on a
source file shows when it was re-curated and why (via PR description).
A separate R2 bucket would work, but adds a failure mode where the bucket
and the repo disagree, and the repo alone isn't reproducible.

Cost: ~50 MB for the 9 current assets, ~150 MB projected after Topical
Index rollout. Well within GitHub's 1 GB LFS bandwidth quota for Pro
accounts.
