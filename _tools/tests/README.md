# Scripture Deep Dive — UI Tests

## Setup (one time)
```bash
npm install
npx playwright install chromium
```

## Running tests
```bash
# Full suite (desktop + mobile)
npm test

# Desktop only
npx playwright test --project=chromium

# Mobile only  
npx playwright test --project=mobile

# Headed (watch the browser)
npm run test:headed

# Single test file
npx playwright test tests/ui.spec.js
```

## What's tested
- Homepage: title, OT open by default, live book badges
- Search: book name, verse text, verse reference, clear, navigation
- Continue reading bar: appears after visit, correct links, no 404s
- Chapter pages: verses render, authorship toggle, annotation panels,
  panel collapse behaviour, nav arrows, qnav open/search/close,
  theological themes panel
- Retrofit chapters (Gen 5): correct structure and authorship
- Last chapter (Exod 40): verse count, disabled next arrow

## Adding tests
Add new `test()` blocks to `tests/ui.spec.js`.
When a new bug is found and fixed, add a regression test so it
can never silently reappear.
