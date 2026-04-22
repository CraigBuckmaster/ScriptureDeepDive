import json, re
from pathlib import Path

disc = json.load(open('_tools/art_sources/_discovered.json', encoding='utf-8'))
p = Path('_tools/fix_missing_art.py')
text = p.read_text(encoding='utf-8')

for entry in disc['resolved']:
    r2 = entry['r2_filename']
    new_url = entry['source_url']
    pattern = (
        r"(r2_filename=['\"]" + re.escape(r2) + r"['\"],\s*\n\s*source_url=)"
        r"['\"][^'\"]+['\"]"
    )
    new_text, n = re.subn(pattern, lambda m: m.group(1) + repr(new_url), text)
    if n != 1:
        print(f"[X] {r2}: matched {n} times (expected 1)")
    else:
        print(f"[OK] {r2}")
        text = new_text

p.write_text(text, encoding='utf-8')
print('wrote', p)
