-- Cloudflare D1 schema for Amicus corpus-gap capture (Card #1471).
--
-- Apply with:
--   wrangler d1 execute amicus-corpus-gaps-staging --file=migrations/0001_corpus_gaps.sql
--   wrangler d1 execute amicus-corpus-gaps         --file=migrations/0001_corpus_gaps.sql

CREATE TABLE IF NOT EXISTS corpus_gaps (
  gap_id               TEXT PRIMARY KEY,
  question_text        TEXT,                -- raw (lightly scrubbed) for Craig's reference
  question_embedding   BLOB,                -- for semantic dedup
  scrubbed_summary     TEXT,                -- Haiku-paraphrased; GitHub issue body uses this
  compressed_profile   TEXT,                -- prose profile snapshot
  current_chapter_ref  TEXT,
  retrieved_chunks_json TEXT,
  retrieval_max_score  REAL,
  model_gap_explanation TEXT,
  user_feedback        TEXT,                -- 'thumbs_down' or NULL
  gap_type             TEXT,                -- content | translation | out_of_scope
  captured_at          INTEGER NOT NULL,    -- unix seconds
  occurrence_count     INTEGER NOT NULL DEFAULT 1,
  status               TEXT NOT NULL DEFAULT 'new',
                                            --   new | queued | issue_opened | content_shipped | redacted
  linked_issue_number  INTEGER,
  linked_content_pr    INTEGER,
  redacted             INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_corpus_gaps_status
  ON corpus_gaps(status);

CREATE INDEX IF NOT EXISTS idx_corpus_gaps_captured_at
  ON corpus_gaps(captured_at);

-- Config flag table — simple key/value store for mode switching.
CREATE TABLE IF NOT EXISTS amicus_config (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

-- Default: individual-issue mode. Flip to 'digest' at ~20K users
-- by updating the single row rather than migrating schema.
INSERT OR IGNORE INTO amicus_config (key, value)
  VALUES ('gap_sync_mode', 'individual');
