# Meta-FAQ expansion playbook (#1470)

This is the operational playbook for the **ongoing meta-FAQ expansion
track**. Meta-FAQ articles are short, standalone pieces that answer
recurring reader questions the chapter-level corpus doesn't cover well
— "what is the Septuagint?", "how do we date Paul's letters?",
"what's the apocrypha?". They are the scaffolding behind good Amicus
responses when no single section-panel is the right answer.

## Goal

**+20 articles per quarter** post-launch. Article count grows from
**50 → 100+** over the first 6 months.

## Cadence

- **Weekly (Monday)** — review the corpus-gap report from #1471 +
  the audit report from #1468. Identify 3–5 new candidate topics.
- **Bi-weekly** — commit at least 2 new meta-FAQ articles.
- **Quarterly (end of quarter)** — retro: which articles are getting
  cited by Amicus? which are dead weight? prune accordingly. Write a
  short note to the "AI Partner" discussion.

Target: by the end of each quarter, the net count has grown by ≥20.

## Candidate sourcing

Three feedback streams converge:

1. **Corpus gaps** (#1471). Top unresolved clusters from the
   `corpus_gaps` D1 table. Use
   `python3 _tools/meta_faq/prioritize.py --source cache/amicus-gaps.db`
   to rank by occurrence count + semantic cluster size.
2. **Audit review queue** (#1468). Responses flagged
   `fabricated_scholar_names` or `invalid_chunk_id` often point to a
   missing meta-FAQ. The classifier isn't a substitute for the
   content — it just surfaces where the content should live.
3. **User thumbs-downs**. Direct signal. Weight these at 3× a
   random cluster of similar size.

A candidate is "ready" when:
- It's been seen **≥10 times** in corpus gaps or **≥3 times** in
  thumbs-downs, AND
- It's **general enough** that a single 400–800-word article could
  resolve many future queries (e.g., not "what does Augustine say
  about predestination in Romans 9:13?" — too narrow).

## Authoring

Each meta-FAQ article lives at `content/meta_faq/<slug>.md` with the
frontmatter:

```
---
id: <kebab-case-slug>
title: <Title Case question or short phrase>
tags: [comma, separated, lowercase]
related_chapter_refs: []     # optional; populate if article defends a specific passage
---
```

Body: one to four paragraphs. Keep it crisp. 400–800 words. No
footnotes — use inline scholar attributions so the Amicus retriever
can surface source_type=meta_faq with a scholar_id where relevant.

## Retrieval integration

No additional work — meta-FAQ articles are already indexed as
`source_type: 'meta_faq'` by `_tools/build_embeddings.py` and served
through the same retrieve pipeline that backs `/ai/chat`. Adding a
new `.md` file is all it takes to get the article into production on
the next content pipeline run.

## Pruning criteria

A meta-FAQ article is a candidate for removal if **all** are true:

- It has not been cited by Amicus in the past **90 days** (check via
  the `amicus_response_samples` citations_json column).
- Its chapter-level coverage has since been filled in (better covered
  by section_panels or word_studies).
- Keeping it is actively confusing readers (e.g., it's been flagged
  in ≥2 audit issues).

Pruning is cheap — removing an `.md` file evicts it from the next
embeddings build. Don't hesitate.

## Tracking the quarterly target

The quarterly net count is tracked in-repo via a small counter
command:

```
python3 _tools/meta_faq/count.py
# → "56 articles in content/meta_faq/ (target this quarter: 70)"
```

CI would surface a warning if the count falls more than 5 articles
behind the target trajectory, but that's a later enhancement.
