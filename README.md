# Scripture Walkthrough — Setup Guide

## File Structure

```
/                          ← Root (upload everything here to GitHub)
├── index.html             ← Landing page / library (all 66 books)
├── manifest.json          ← PWA config (installable on iPhone)
├── service-worker.js      ← Offline support
├── icon-192.png           ← App icon
├── icon-512.png           ← App icon (large)
├── README.md              ← This file
│
├── genesis/               ← One folder per book
│   ├── 1.html             ← Genesis Chapter 1
│   ├── 2.html
│   └── ...
│
├── exodus/                ← Add when ready
│   ├── 1.html
│   └── ...
```

## Adding a new chapter (e.g. Genesis 11)

1. Save the file as `genesis/11.html`
2. In `index.html`, find Genesis Ch.11 → change `<span>` to `<a href="genesis/11.html">`
3. In `genesis/10.html`, activate the → arrow: remove `disabled` from the `11.html` link
4. Add `'/genesis/11.html'` to CORE in `service-worker.js` and bump the version string

## Adding a new book (e.g. Exodus)

1. Create an `exodus/` folder
2. Save chapters as `exodus/1.html`, `exodus/2.html`, etc.
3. Path rules inside any book folder:
   - Library: `../index.html`
   - PWA assets: `../manifest.json`, `../icon-192.png`
   - Service worker: `../service-worker.js`
   - Prev/Next arrows: `1.html`, `2.html` (siblings, no prefix)
4. In `index.html`, activate links with `href="exodus/1.html"` etc.

## GitHub Pages Setup (one-time)

1. github.com → New repository → Public → Create
2. Upload all files: root files + the genesis/ folder
3. Settings → Pages → Deploy from branch → main → Save
4. Live at https://[username].github.io/[repo-name]/

## Add to iPhone Home Screen

Safari → navigate to your URL → Share → Add to Home Screen
