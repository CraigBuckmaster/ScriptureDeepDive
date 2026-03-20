"""
build_chapters_js.py — Rebuild verses/chapters.js search index

Scans all live chapter HTML files from REGISTRY and extracts:
  - ref (e.g. "Genesis 1")
  - book, ch, url
  - titles (section header titles, stripped of verse ranges)
  - ctx (first section context snippet for keyword matching)

Run after every batch deploy:
  python3 _tools/build_chapters_js.py

The output verses/chapters.js is loaded by index.html for chapter-level search.
"""
import re, glob, json, os, sys

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(REPO, '_tools'))
import shared

def build():
    rows = []
    for book_dir, book_name, total, live, testament, subdir in shared.REGISTRY:
        if live == 0:
            continue
        base = os.path.join(REPO, subdir, book_dir)
        paths = sorted(
            glob.glob(os.path.join(base, '*.html')),
            key=lambda p: int(re.search(r'_(\d+)\.html$', p).group(1))
        )
        for html_path in paths:
            ch = int(re.search(r'_(\d+)\.html$', html_path).group(1))
            with open(html_path, encoding='utf-8') as f:
                h = f.read()

            # Extract section headers
            raw_hdrs = re.findall(
                r'class="section-header[^"]*"[^>]*>(.*?)</(?:h\d|div)',
                h, re.DOTALL)
            hdrs = [re.sub(r'<[^>]+>', '', x)
                    .replace('&ndash;', '\u2013').replace('&mdash;', '\u2014')
                    .replace('&hellip;', '\u2026').replace('&rsquo;', "\u2019")
                    .replace('&lsquo;', "\u2018").replace('&amp;', '&')
                    .strip()
                    for x in raw_hdrs]

            # Strip "Verses N\u2013N \u2014 " prefix
            titles = []
            for hdr in hdrs:
                m = re.match(r'Verses?\s+[\d\u2013\u2014\-]+\s+[\u2014\u2013\-]+\s*(.*)', hdr)
                titles.append(m.group(1).strip() if m else hdr)

            # First-section context snippet
            ctx_m = re.search(r'id="[^"]*s1-ctx"[^>]*>(.*?)</div>', h, re.DOTALL)
            ctx = ''
            if ctx_m:
                ctx = re.sub(r'<[^>]+>', ' ', ctx_m.group(1)).strip()[:200]

            rel_path = os.path.relpath(html_path, REPO).replace(os.sep, '/')
            rows.append({
                'ref':    f'{book_name} {ch}',
                'book':   book_name,
                'ch':     ch,
                'url':    rel_path,
                'titles': titles,
                'ctx':    ctx,
            })

    out_path = os.path.join(REPO, 'verses', 'chapters.js')
    js = 'const CHAPTERS_ALL=' + json.dumps(rows, ensure_ascii=False) + ';'
    with open(out_path, 'w', encoding='utf-8') as f:
        f.write(js)
    print(f'Written verses/chapters.js: {len(js):,} chars, {len(rows)} chapters')
    return len(rows)

if __name__ == '__main__':
    build()
