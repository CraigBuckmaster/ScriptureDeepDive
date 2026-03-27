# Companion Study — Session Handoff: Batch 10

## Repository Access

```
git clone https://CraigBuckmaster:{YOUR_TOKEN}@github.com/CraigBuckmaster/ScriptureDeepDive.git
```

**Git config required:**
```bash
git config user.email "craig@companionstudy.app"
git config user.name "Craig Buckmaster"
```

---

## Current State (as of commit c38c6c76)

### Batches Complete

| Batch | Feature | Status |
|-------|---------|--------|
| 1 | Feature 1 infra (prophecy_chains table, types, queries) | ✅ Complete |
| 2 | Prophecy chains content (50 chains, 283 links) | ✅ Complete |
| 3 | ProphecyBrowse + ProphecyDetail screens | ✅ Complete |
| 4 | user.db migration v2 (tags, collections, links, FTS) | ✅ Complete |
| 5 | Enhanced notes UI (AllNotesScreen 3-tab, CollectionDetail, NotesOverlay) | ✅ Complete |
| 6 | DiscoursePanel component + wiring | ✅ Complete |
| 7 | Discourse content for Romans 1-16 | ✅ Complete |
| 8 | Concept Explorer (20 concepts + screens) | ✅ Complete |
| 9a | Difficult Passages (28 entries — first half) | ✅ Complete |
| 9b | Difficult Passages (25 entries — second half) | ✅ Complete |
| **10** | **DifficultPassagesBrowse + DifficultPassageDetail screens** | **NEXT** |

---

## Difficult Passages Content Complete — 53 Entries

Distribution:
- Ethical: 15
- Contradiction: 10
- Theological: 10
- Historical: 10
- Textual: 8

---

## Batch 10: Difficult Passages Screens

**Goal:** Create browse and detail screens for difficult passages, following the pattern established by ProphecyBrowse/ProphecyDetail and ConceptBrowse/ConceptDetail.

### Files to Create

| File | Purpose |
|------|---------|
| `app/src/hooks/useDifficultPassages.ts` | Data hook for fetching passages from SQLite |
| `app/src/screens/DifficultPassagesBrowseScreen.tsx` | Browse with category filter + search |
| `app/src/screens/DifficultPassageDetailScreen.tsx` | Full passage view with responses |

### Files to Modify

| File | Change |
|------|--------|
| `app/src/navigation/types.ts` | Add `DifficultPassagesBrowse` and `DifficultPassageDetail` to ExploreStackParamList |
| `app/src/navigation/ExploreStack.tsx` | Register new screens |
| `app/src/screens/ExploreMenuScreen.tsx` | Add grid entry for Difficult Passages |

### Data Shape (from SQLite)

```sql
-- difficult_passages table
CREATE TABLE difficult_passages (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,  -- 'ethical' | 'contradiction' | 'theological' | 'historical' | 'textual'
  severity TEXT NOT NULL,  -- 'minor' | 'moderate' | 'major'
  passage TEXT NOT NULL,
  question TEXT NOT NULL,
  responses_json TEXT,     -- JSON array of Response objects
  related_chapters_json TEXT,
  tags_json TEXT
);
```

Response structure in `responses_json`:
```typescript
interface Response {
  tradition: string;      // e.g., "Divine Command Theodicy"
  scholar_id: string;     // Must exist in scholars table
  summary: string;        // 2-4 sentences
}
```

### Hook Pattern

```typescript
// useDifficultPassages.ts
export function useDifficultPassages() {
  // Fetch all passages, return { passages, loading, error }
}

export function useDifficultPassage(passageId: string) {
  // Fetch single passage + related data (scholars for responses, chapters)
  // Return { passage, scholars, relatedChapters, loading, error }
}
```

### Browse Screen Features

- Category filter chips (All, Ethical, Contradiction, Theological, Historical, Textual)
- Search by title/question
- Cards showing: title, category badge, severity indicator, truncated question
- Tap navigates to detail

### Detail Screen Features

- Header: title, passage reference, category badge
- Question section (prominent)
- Responses section: 2-3 cards, each with:
  - Tradition name
  - Scholar avatar + name (tap to ScholarBio)
  - Summary text
- Related chapters (horizontal scroll of chapter pills, tap to navigate)
- Tags at bottom

### Navigation Types

```typescript
// In ExploreStackParamList
DifficultPassagesBrowse: undefined;
DifficultPassageDetail: { passageId: string };
```

### ExploreMenuScreen Entry

```typescript
{
  title: 'Difficult Passages',
  subtitle: 'Wrestling with hard texts',
  screen: 'DifficultPassagesBrowse',
}
```

### Style Guidelines

- Follow existing patterns from ConceptBrowseScreen/ConceptDetailScreen
- Category badges: use distinct colors per category
- Severity: subtle indicator (dot or small badge)
- Gold accents for interactive elements
- bgElevated for cards, textMuted for secondary text

---

## Database Stats (as of Batch 9b)

- 58 live books, 1146 chapters
- 50 prophecy chains
- 20 concepts
- 53 difficult passages (Batch 9 complete!)
- 16 discourse panels (Romans)

---

## After Batch 10

**Batch 11:** Word Study enhancements (expanded content, better linking)
**Batch 12:** Timeline improvements

---

## Deploy

After commit:
```bash
cd app
eas update --branch production
```
