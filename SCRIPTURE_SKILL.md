# Scripture Deep Dive — Build System Skill

## Project Overview
Interactive Bible study PWA hosted on GitHub Pages.
- **Repo:** https://github.com/CraigBuckmaster/ScriptureDeepDive.git
- **Token:** [TOKEN_IN_MEMORY]
- **Live:** https://craigbuckmaster.github.io/ScriptureDeepDive/
- **Local outputs:** `/mnt/user-data/outputs/` (genesis/ subfolder done)
- **Local repo clone:** `/home/claude/ScriptureDeepDive/` (git remote set up)

## File Structure
```
ScriptureDeepDive/
├── index.html              ← Library / landing page (all 66 books)
├── manifest.json           ← PWA config
├── service-worker.js       ← Offline cache (bump version string on every deploy)
├── icon-192.png
├── icon-512.png
└── {book}/                 ← e.g. genesis/, exodus/
    ├── {Book}_{N}.html     ← e.g. Genesis_1.html
    └── ...
```

## Deploying
```bash
cd /home/claude/ScriptureDeepDive
cp /mnt/user-data/outputs/{book}/*.html {book}/
# Bump service-worker.js cache version: scripture-vN → scripture-v(N+1)
sed -i 's/scripture-vN/scripture-v(N+1)/' service-worker.js
git add -A && git commit -m "message" && git push origin master
```

---

## Design System

### Color Palette — CSS Custom Properties (all in `:root {}`)
```css
:root {
  --bg:#0f0d0a; --bg2:#181410; --border:#3a2e18;
  --gold:#c9a84c; --gold-dim:#8b6914; --gold-bright:#e8c870;
  --text:#f0e8d8; --text-dim:#b8a888; --text-muted:#7a6a50;

  /* Panel bg/border/accent — verse-level buttons */
  --heb-bg:#1a0d14;   --heb-border:#7a3050;  --heb-accent:#e890b8;
  --hist-bg:#0a1220;  --hist-border:#2a5080; --hist-accent:#70b8e8;
  --ctx-bg:#0a180e;   --ctx-border:#2a6040;  --ctx-accent:#70d098;
  --cross-bg:#140f00; --cross-border:#6a4a00;--cross-accent:#d4b060;
  --author-bg:#100818;--author-border:#5a2080;--author-accent:#c090f0;
  --poi-bg:#060e06;   --poi-border:#1a6028;  --poi-accent:#30a848;
  --tl-bg:#0a0f18;

  /* Scholarly panel vars */
  --ppl-bg:#180800;   --ppl-border:#8a3010;  --ppl-accent:#e86040;
  --trans-bg:#001a18; --trans-border:#186058;--trans-accent:#58c8c0;
  --src-bg:#140814;   --src-border:#603058;  --src-accent:#a05890;
  --rec-bg:#180610;   --rec-border:#882040;  --rec-accent:#e04080;
  --lit-bg:#101400;   --lit-border:#485010;  --lit-accent:#b8c858;

  /* MUST be in :root — these two caused black-button bugs when outside */
  --heb-text-bg:#0a0800; --heb-text-border:#4a3800; --heb-text-accent:#d4aa40;
  --thread-bg:#0a0a1a;   --thread-border:#303070;   --thread-accent:#9090e0;
}
```

### Button Accent Colors (all unique, conflict-tested)
| Button | Class | Color | Hue |
|---|---|---|---|
| Hebrew word study | `.hebrew` | `#e890b8` | 333° pink |
| Historical | `.history` | `#70b8e8` | 204° sky blue |
| Context | `.context` | `#70d098` | 145° mint |
| Cross-Reference | `.cross` | `#d4b060` | 41° gold |
| Places/POI | `.places` | `#30a848` | 132° deep green |
| Timeline | `.timeline` | `#c0d8f0` | 210° pale ice-blue |
| People | `.people` | `#e86040` | 11° coral-red |
| Translations | `.translations` | `#58c8c0` | 176° teal |
| Ancient Sources | `.sources` | `#a05890` | 313° dark mauve |
| Reception History | `.reception` | `#e04080` | 336° rose-magenta |
| Literary Structure | `.literary` | `#b8c858` | 69° lime |
| Hebrew-Rooted Reading | `.hebrew-text` | `#d4aa40` (gradient btn) | burnished gold |
| Intertextual Threading | `.threading` | `#9090e0` | 240° violet |
| Theological Themes | inline style | `#8840e0` | 267° deep purple |

### Fonts
- Body: EB Garamond (Google Fonts)
- Headers/labels: Cinzel
- UI/panels: Source Sans 3

### Layout
- Fixed nav bar 52px top; `padding-top:52px` on body
- `viewport-fit=cover` + `env(safe-area-inset-top)` for iPhone notch
- Dark parchment background throughout

---

## The 14 Panel Types

### Verse-Level (inline with each verse, in `.btn-row`)
1. **Hebrew Word Study** — `.anno-trigger.hebrew` → `.anno-panel.heb`
2. **Historical Context** — `.anno-trigger.history` → `.anno-panel.hist`
3. **Context** — `.anno-trigger.context` → `.anno-panel.ctx`
4. **Cross-Reference** — `.anno-trigger.cross` → `.anno-panel.cross-ref`
5. **Places/POI** — `.anno-trigger.places` → `.anno-panel.poi-panel`
6. **Timeline** — `.anno-trigger.timeline` → `.anno-panel.tl-panel`

### Chapter-Level Scholarly (bottom block, one per chapter)
7. **People** — `.anno-trigger.people` → `.anno-panel.ppl-panel`
8. **Translations** — `.anno-trigger.translations` → `.anno-panel.trans-panel`
9. **Ancient Sources** — `.anno-trigger.sources` → `.anno-panel.src-panel`
10. **Reception History** — `.anno-trigger.reception` → `.anno-panel.rec-panel`
11. **Literary Structure** — `.anno-trigger.literary` → `.anno-panel.lit-panel`
12. **Hebrew-Rooted Reading** — `.anno-trigger.hebrew-text` → `.anno-panel.heb-text-panel`
13. **Intertextual Threading** — `.anno-trigger.threading` → `.anno-panel.thread-panel`
14. **Theological Themes** — inline style button → `.anno-panel.themes-panel`

### tog() — Single-Open Panel Toggle
```js
// MUST be in its own <script> tag BEFORE the IIFE script
function tog(btn,id){
  var p=document.getElementById(id);
  if(!p)return;
  var willOpen=!p.classList.contains('open');
  document.querySelectorAll('.anno-panel.open').forEach(function(op){op.classList.remove('open');});
  document.querySelectorAll('.anno-trigger.active').forEach(function(tb){tb.classList.remove('active');});
  if(willOpen){p.classList.add('open');btn.classList.add('active');}
}
function toggleAuth(btn){btn.nextElementSibling.classList.toggle('open');btn.classList.toggle('open');}
```

### Panel HTML Pattern
```html
<div class="btn-row">
  <button class="anno-trigger hebrew" onclick="tog(this,'gN-sV-heb')"><span>Hebrew</span><span class="chev">&#9660;</span></button>
  <button class="anno-trigger history" onclick="tog(this,'gN-sV-hist')"><span>Historical</span><span class="chev">&#9660;</span></button>
  <!-- etc -->
</div>
<div id="gN-sV-heb" class="anno-panel heb">
  <h4>Hebrew Word Study</h4>
  <!-- content -->
</div>
```
Panel IDs use pattern: `{bookPrefix}{chapterN}-s{sectionN}-{type}`
e.g. `g1-s3-heb` = Genesis ch1, verse-section 3, Hebrew panel.

---

## Verse Word Highlighting (VHL)

Five categories of words are highlighted inline in verse text, color-matched to their button:

```js
// In the IIFE — five word groups
const DIVINE = {words:['God','LORD','Spirit','Angel','Lord'], cls:'vhl-divine', btn:['hebrew','hebrew-text','context']};
const PLACES = {words:['Eden','Nod','Ararat','Shinar','Babel','Tigris','Euphrates','Havilah','Cush','Asshur','Canaan','Sidon','Nineveh','Calah'], cls:'vhl-place', btn:['places']};
const PEOPLE = {words:['Adam','Eve','Cain','Abel','Seth','Enoch','Noah','Lamech','Methuselah','Japheth','Ham','Shem','Nimrod','Jubal','Jabal','Naamah'], cls:'vhl-person', btn:['people']};
const TIME   = {words:['evening','morning','night','year','years','season','seasons','month','months','forty','hundred'], cls:'vhl-time', btn:['timeline']};
const KEY    = {words:['image','likeness','holy','sacred','covenant','generations','account','beginning','blessed','cursed','ark','flood'], cls:'vhl-key', btn:['literary','cross']};
```

VHL CSS colors match button accents:
```css
.vhl { border-radius:2px; transition:opacity .15s,background .15s; cursor:pointer; }
.vhl-divine { color:#e8c070; }
.vhl-place  { color:#30a848; }
.vhl-person { color:#e86040; }
.vhl-time   { color:#c0d8f0; }
.vhl-key    { color:#b8c858; }
.vhl:hover  { text-decoration:underline dotted; text-underline-offset:3px; }
.vhl.vhl-pulse { animation:vhlPulse .35s ease-out; }
@keyframes vhlPulse { 0%{opacity:1} 40%{opacity:.4} 100%{opacity:1} }
```

**Click-to-open:** Clicking a highlighted word opens the matching panel. The IIFE injects `data-btn` and `data-vhl-id` attributes during highlight pass; a delegated click handler on `document` handles it.

---

## Critical JS Rules

1. **`tog()` must be in its own `<script>` tag** — separate from and BEFORE the IIFE script. If they share a tag and the IIFE has a parse error, `tog()` never loads and ALL buttons break.

2. **No optional chaining (`?.`)** — older Safari/iOS throws a parse error. Use:
   ```js
   var m = str.match(/pattern/); var val = m ? m[1] : null;
   ```
   instead of `str.match(/pattern/)?.[1]`

3. **No arrow functions in `.forEach()` callbacks if targeting old iOS** — use `function(x){...}` form inside `forEach`, `setTimeout` etc.

4. **All CSS vars must be inside `:root {}`** — vars declared outside `:root` resolve to empty/black. This bit us twice: `--thread-accent` and `--heb-text-accent` were outside root and caused black buttons. Always put them inside `:root`.

5. **IIFE structure:**
   ```html
   <script>
   function tog(btn,id){ ... }
   function toggleAuth(btn){ ... }
   </script>
   <script>
   (function(){
     // VHL constants, highlightNode, inject loop, click-to-open handler
   })();
   </script>
   <script>
   // Quick-nav functions (openQnav, closeQnav, qnavToggleBook, qnavFilter)
   </script>
   ```

---

## index.html — Library Page

### Book Grid
- Each book: `<div class="book-item" data-book="genesis" data-testament="ot">` 
- Live chapters linked as `<a>`, coming-soon as `<span>`
- Live badge: `<span class="live-badge">N live</span>`
- Collapsible OT/NT testament sections (id="tg-ot", id="tg-nt")

### Unified Search
- Single bar, searches both book names AND verse text
- Books: DOM-driven from `.book-item` elements — auto-updates as new books go live
- Verses: `const VERSES` array hardcoded — must append entries for new chapters
- Verse entry format:
  ```js
  { ref:"Genesis 1:1", short:"Gen 1:1", text:"In the beginning...", url:"genesis/Genesis_1.html#v1-1", ch:1, v:1 }
  ```

### Adding a New Book (checklist)
1. Create `{book}/` folder, build chapter HTML files
2. Add `.book-item` div to library grid in index.html → search auto-picks it up
3. Update live badge count
4. Append verse objects to `VERSES` array for each new chapter
5. Add all new files to service-worker.js CORE cache, bump version
6. Commit and push

---

## Chapter Page Structure (per chapter HTML)

```
<head> with PWA meta, Google Fonts link, <style> with full CSS
<nav> fixed top bar: ← back, "Genesis N", → forward, 🔍 search icon
<main>
  [chapter header block: title, subtitle, authorship toggle]
  [verse sections: each has .verse-text + .btn-row + inline panels]
  [chapter-level scholarly block: 8 scholarly buttons + panels]
  [footer]
</main>
<script> tog() + toggleAuth() </script>
<script> (IIFE: VHL + click-to-open) </script>
<script> Quick-nav overlay functions </script>
<script> Service worker registration </script>
[Quick-nav overlay HTML at end of body]
```

### Nav Bar HTML
```html
<nav>
  <a href="Genesis_{N-1}.html" class="nav-prev">&#8592;</a>  <!-- disabled attr if ch 1 -->
  <span class="nav-title">Genesis {N}</span>
  <div class="nav-right">
    <button onclick="openQnav()" class="nav-search-btn" aria-label="Search">&#128269;</button>
    <a href="Genesis_{N+1}.html" class="nav-next">&#8594;</a>  <!-- disabled attr if last ch -->
  </div>
</nav>
```

### Quick-Nav Overlay
Full chapter/verse browser overlay. Triggered by 🔍 button. Includes book selector and chapter grid. Functions: `openQnav()`, `closeQnav()`, `qnavToggleBook(id)`, `qnavFilter(q)`.

---

## Content Standards (what goes in each panel)

### Hebrew Word Study
- 3–6 key Hebrew words from the passage
- Show: transliteration, gloss, morphology note, theological significance
- Format: `.hebrew-word` span (RTL), `.tlit` for transliteration

### Historical Context
- ANE (Ancient Near East) background, archaeology, dating
- Compare with surrounding cultures where relevant

### Context
- Narrative flow, how this passage connects to what came before/after
- Intertextual connections within the same book

### Cross-Reference
- 3–6 key cross-references with brief note on connection
- Format: `.ref-cite` (gold, Cinzel font) + `.ref-text`

### Places/POI
- Cards for each significant location mentioned
- Format: `.poi-card` with `.poi-name`, `.poi-region`, `.poi-text`

### Timeline
- Chronological markers for events in the passage
- Format: `.tl-item` entries

### People (chapter-level)
- Cards for each significant person in the chapter
- Format: `.ppl-card` with name, role, significance

### Translations
- Compare 4–6 translations (NIV, ESV, KJV, NASB, NLT, MSG) on key verses
- Highlight interpretive differences

### Ancient Sources
- Dead Sea Scrolls variants, LXX differences, Targums, Josephus, Philo
- Format: `.src-item` entries

### Reception History
- How the passage has been interpreted across church history
- Key figures: Early church fathers, medieval, Reformation, modern

### Literary Structure
- Chiasms, parallelism, genre, narrative structure
- Identify the literary devices at work

### Hebrew-Rooted Reading
- Full NIV text with ~30 key Hebrew terms restored inline
- Color categories: divine names, cosmic terms, human terms, covenant terms, etc.
- Term colors: `.dn-yhwh` gold, `.dn-elohim` blue, `.dn-spirit` cyan, `.dn-key` yellow, etc.

### Intertextual Threading
- How this passage threads forward/backward through Scripture
- Show: earlier echoes, later fulfillments, NT connections

### Theological Themes
- Radar chart showing 6–8 theological themes rated 1–5 for this chapter
- Themes vary by book but stay consistent within a book

---

## Known Pitfalls & Historical Bugs

1. **Black buttons** — almost always a CSS var defined outside `:root`. Check first.
2. **Buttons not responding** — check `tog()` exists in its own script tag in that chapter.
3. **JS parse errors killing everything** — check for `?.` optional chaining, arrow functions in old-Safari-incompatible positions. Use `var`, `function(){}` form defensively.
4. **Stale RGBA backgrounds** — when changing button accent colors, the hardcoded `rgba()` background values in `.anno-trigger.X` rules don't auto-update with the CSS var. Must update manually.
5. **Service worker serving stale files** — always bump the cache version string on every deploy. User may need to hard-reload or clear SW cache on first visit after a fix.
6. **`tog()` stripped by inject scripts** — if a Python script replaces a script block pattern, verify it doesn't accidentally empty the tog() definition. Always grep for `function tog` after any bulk edit.

---

## Service Worker
- File: `service-worker.js` at repo root
- Cache name pattern: `scripture-vN` — increment N on every deploy
- CORE array lists all files to precache: index.html, manifest, icons, all chapter HTMLs
- When adding new chapters: add to CORE array and bump version

---

## Word Lists for VHL (update when adding new books)
When a new book introduces new significant names/places, add to the relevant GROUPS array in that book's chapter files. The Genesis lists are a good baseline; many names will carry forward (God, LORD, covenant, etc.) but place names and people will change per book.

