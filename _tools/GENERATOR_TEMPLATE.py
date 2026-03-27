#!/usr/bin/env python3
"""
═══════════════════════════════════════════════════════════════════════
GENERATOR TEMPLATE — CompanionStudy Chapter Content Generator
═══════════════════════════════════════════════════════════════════════

Copy this file to /tmp/gen_{book}_{range}.py, fill in the scholarly
content, then run: python3 /tmp/gen_{book}_{range}.py

After running:
  1. python3 _tools/build_sqlite.py     (rebuild database)
  2. python3 _tools/validate_sqlite.py   (verify integrity)
  3. git add content/ && git commit      (commit content)
  4. eas update --branch production      (deploy to devices)

Panel reference:
  Section-level (per verse group):
    heb     — Hebrew/Greek word studies: (word, transliteration, gloss, paragraph)
    ctx     — Literary/historical context: plain string
    hist    — Historical background: plain string
    cross   — Cross-references: (ref, note)
    poi     — Places: {'name':..., 'role':..., 'text':...}
    tl      — Timeline events: {'date':..., 'event':..., 'text':...}
    mac     — MacArthur notes: (ref, note)
    calvin  — Calvin notes: (ref, note)
    netbible — NET Bible notes: (ref, note)
    {scholar} — Any scholar key from COMMENTATOR_SCOPE: (ref, note)

  Chapter-level (auto-generated if omitted):
    lit     — Literary structure: (rows_list, note)
    themes  — Theological themes radar: (scores_list, note) — 10 scores
    ppl     — People panel (auto from BOOK_META.vhl_people)
    trans   — Translation comparison (auto from verse files)
    src     — Ancient sources (auto from ane_map)
    rec     — Reception history (auto from scholar citations)
    hebtext — Hebrew-rooted reading (auto from section heb entries)
    thread  — Intertextual threads (auto from cross-refs)
    tx      — Textual notes (auto from tx_books)
    debate  — Scholarly debates (auto from debate_books)
═══════════════════════════════════════════════════════════════════════
"""
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__) or '.', '_tools') 
                if os.path.exists(os.path.join(os.path.dirname(__file__) or '.', '_tools'))
                else '/home/claude/ScriptureDeepDive/_tools')
from shared import save_chapter, verse_range

# ── CONFIGURATION ──────────────────────────────────────────────────────
BOOK = 'jeremiah'       # book directory name (lowercase, underscores for spaces)
BOOK_NAME = 'Jeremiah'  # canonical display name (e.g., "1 Corinthians", "Song of Solomon")

# Helper: shorthand for save_chapter with consistent book
def ch(num, subtitle, sections, lit=None, themes=None, **kw):
    """Save one chapter. lit and themes are required for full chapters.
    
    Args:
        num: Chapter number
        subtitle: Descriptive chapter subtitle (e.g., "The Call of Jeremiah")
        sections: List of section dicts
        lit: Literary structure panel (optional)
        themes: Theological themes panel (optional)
        **kw: Additional chapter-level data
    """
    data = {
        'title': f'{BOOK_NAME} {num}',  # Auto-generated: "Jeremiah 1"
        'subtitle': subtitle,            # Descriptive content goes here
        'sections': sections
    }
    if lit is not None:
        data['lit'] = lit
    if themes is not None:
        data['themes'] = themes
    data.update(kw)
    save_chapter(BOOK, num, data)


# ══════════════════════════════════════════════════════════════════════
#  CHAPTERS
# ══════════════════════════════════════════════════════════════════════

ch(1, 'The Call of Jeremiah',
  [
    # ── Section 1 ──────────────────────────────────────────────────
    {'header': 'Verses 1–10 — "Before I Formed You in the Womb"',
     'verses': verse_range(1, 10),

     'heb': [
         ('דְּבַר־יְהוָה', 'dĕvar-YHWH', 'the word of the LORD',
          'The opening formula identifies the book as prophetic oracle. '
          'The "word of the LORD" is not mere speech but a creative, '
          'powerful event that shapes history.'),
         ('טֶרֶם', 'ṭerem', 'before / not yet',
          'Emphasises divine foreknowledge — God knew Jeremiah before '
          'formation in the womb, a statement of prenatal calling.'),
     ],

     'ctx': ('Jeremiah\'s call narrative (1:4–10) is the theological '
             'foundation of the entire book. God\'s sovereignty over nations '
             'and his intimate knowledge of the prophet establish the authority '
             'behind every oracle that follows.'),

     'cross': [
         ('Isa 49:1', 'The Servant also called from the womb — parallel '
          'prophetic commissioning language.'),
         ('Gal 1:15', 'Paul echoes Jeremiah\'s prenatal call: "set apart '
          'before I was born."'),
     ],

     'mac': [
         ('1:5', 'God\'s foreknowledge and predestination are clearly taught '
          'here. "Before I formed you" indicates God\'s sovereign purpose '
          'preceded Jeremiah\'s existence.'),
         ('1:9', '"Then the LORD stretched out his hand and touched my '
          'mouth" — the prophetic commissioning, parallel to Isaiah 6:7.'),
     ],

     'calvin': [
         ('1:5', 'Calvin emphasises that Jeremiah\'s calling was not based '
          'on merit but on God\'s free election — a pattern that runs '
          'throughout Scripture.'),
     ],

     'netbible': [
         ('1:5', 'The Hebrew verb yāda ("knew") connotes intimate '
          'personal knowledge, not mere awareness — God chose Jeremiah '
          'for relationship and purpose.'),
     ],

     # Add book-specific scholars here:
     # 'thompson': [('1:5', 'Thompson note...')],
    },

    # ── Section 2 ──────────────────────────────────────────────────
    {'header': 'Verses 11–19 — The Two Visions: Almond Branch and Boiling Pot',
     'verses': verse_range(11, 19),

     'heb': [
         ('שָׁקֵד', 'shāqēd', 'almond tree',
          'A wordplay: shāqēd (almond) sounds like shōqēd (watching). '
          'God is "watching" over his word to perform it.'),
     ],

     'ctx': ('The two visions (almond branch and boiling pot) establish '
             'the twin themes of Jeremiah\'s ministry: God\'s faithfulness '
             'to fulfil his word, and the coming judgment from the north.'),

     'cross': [
         ('Jer 25:9', '"I will send for... Nebuchadnezzar" — the threat '
          'from the north materialises.'),
     ],

     'mac': [
         ('1:11–12', 'The almond tree vision is a divine visual pun '
          'confirming God\'s watchfulness over his prophetic word.'),
     ],
    },
  ],

  # ── Chapter-level panels (optional — auto-generated if omitted) ──
  lit=([
      ('vv.1–10', '1:1–10', 'The Call: "Before I Formed You"', True),
      ('vv.11–19', '1:11–19', 'Two Visions: Almond Branch and Boiling Pot', False),
  ], 'Structure of Jeremiah 1 — Call narrative + confirming visions'),

  themes=([
      ('Covenant', 7), ('Judgment', 8), ('Mercy', 5), ('Faith', 6),
      ('Sovereignty', 9), ('Worship', 3), ('Holiness', 5),
      ('Prophecy', 10), ('Justice', 6), ('Mission', 7),
  ], 'Prophecy peaks at 10: this is the quintessential call narrative. '
     'Sovereignty at 9: God\'s prenatal election of the prophet.'),
)

# ── Add more chapters below following the same pattern ──
# ch(2, 'Israel's Faithlessness', [...], lit=..., themes=...)
# ch(3, 'A Call to Repentance', [...], lit=..., themes=...)

print(f'\n✅ {BOOK.title()} generation complete.')
