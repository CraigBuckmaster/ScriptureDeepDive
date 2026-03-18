"""
inject_tx_db.py  —  Surgical injector for Textual Notes and Scholarly Debates panels.
Uses depth-counting HTML extraction (not regex) for safe removal of existing panels.
"""
import re, sys, os
_TOOLS = os.path.dirname(os.path.abspath(__file__))
_REPO  = os.path.dirname(_TOOLS)
sys.path.insert(0, _TOOLS)
exec(open(os.path.join(_TOOLS, 'shared.py')).read())

def _cid_from_path(path):
    import os
    fname = os.path.basename(path)
    book  = os.path.basename(os.path.dirname(path))
    num   = re.search(r'_(\d+)\.html', fname).group(1)
    abbr  = {'genesis':'gen','exodus':'ex','ruth':'ru','proverbs':'prov','matthew':'mt'}.get(book, book[:3])
    return f'{abbr}{num}'

def _extract_div(html, start):
    """Return (div_text, end_pos) by counting depth from position of opening <div."""
    depth = 0; i = start
    while i < len(html):
        if html[i:i+4] == '<div': depth += 1; i += 4; continue
        if html[i:i+6] == '</div>':
            depth -= 1
            if depth == 0: return html[start:i+6], i+6
            i += 6; continue
        i += 1
    return None, start

def _remove_panel(html, panel_id):
    """Remove a specific panel div by id using depth-counting."""
    pat = f'<div id="{panel_id}"'
    pos = html.find(pat)
    if pos == -1: return html
    div_text, end = _extract_div(html, pos)
    if div_text:
        html = html[:pos] + html[end:].lstrip('\n').lstrip('\r')
    return html

def inject(path, textual_data=None, debate_data=None):
    with open(path) as f:
        html = f.read()

    cid = _cid_from_path(path)

    tx_h = textual_panel(f'{cid}-tx', textual_data) if textual_data else ''
    db_h = debate_panel(f'{cid}-debate', debate_data) if debate_data else ''

    tx_btn = (f'<button class="anno-trigger textual" onclick="tog(this,\'{cid}-tx\')">'
              f'<span>Textual Notes</span></button>') if tx_h else ''
    db_btn = (f'<button class="anno-trigger debate" onclick="tog(this,\'{cid}-debate\')">'
              f'<span>Scholarly Debates</span></button>') if db_h else ''

    # Remove existing panels (depth-safe)
    html = _remove_panel(html, f'{cid}-tx')
    html = _remove_panel(html, f'{cid}-debate')

    # Remove existing buttons
    html = re.sub(r'<button class="anno-trigger textual"[^>]*>.*?</button>', '', html)
    html = re.sub(r'<button class="anno-trigger debate"[^>]*>.*?</button>', '', html)

    # Inject buttons before themes button
    if tx_btn or db_btn:
        inject_btns = (tx_btn or '') + (db_btn or '')
        themes_pat = re.compile(r'(<button class="anno-trigger themes")')
        if themes_pat.search(html):
            html = themes_pat.sub(inject_btns + r'\1', html, count=1)

    # Inject panels before themes panel
    inject_panels = (tx_h or '') + (db_h or '')
    if inject_panels:
        themes_panel_pat = re.compile(r'(<div id="[^"]*-themes")')
        if themes_panel_pat.search(html):
            html = themes_panel_pat.sub(inject_panels + r'\1', html, count=1)

    with open(path, 'w') as f:
        f.write(html)

    panels = []
    if tx_h: panels.append(f'tx({len(textual_data)})')
    if db_h: panels.append(f'db({len(debate_data)})')
    print(f'  {cid}: {", ".join(panels) or "nothing"}')

def inject_book(book, ch, textual_data, debate_data):
    repo = _REPO
    path = f'{repo}/{book}/{book.capitalize()}_{ch}.html'
    inject(path, textual_data, debate_data)

print("inject_tx_db loaded")
