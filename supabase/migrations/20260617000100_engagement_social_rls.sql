-- Row-Level Security for the engagement/social tables the client reads and
-- writes (upvotes, star_ratings, follows, user_trust_scores).
--
-- These tables previously had no RLS migration in the repo, leaving their
-- access posture unverifiable and likely over-permissive. This migration
-- ensures the tables exist (matching how the client uses them) and locks down
-- writes to the row owner while allowing the public reads the app relies on
-- (aggregate counts / averages). Trust scores are computed server-side and are
-- read-only to clients.
--
-- CREATE TABLE IF NOT EXISTS is used so this is safe whether or not the tables
-- were already created out-of-band; the RLS/policy statements then apply to the
-- existing tables regardless.

-- ── upvotes ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS upvotes (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  topic_id   TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, topic_id)
);
CREATE INDEX IF NOT EXISTS idx_upvotes_topic ON upvotes(topic_id);

ALTER TABLE upvotes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read upvotes" ON upvotes;
CREATE POLICY "Anyone can read upvotes"
  ON upvotes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users insert own upvotes" ON upvotes;
CREATE POLICY "Users insert own upvotes"
  ON upvotes FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users delete own upvotes" ON upvotes;
CREATE POLICY "Users delete own upvotes"
  ON upvotes FOR DELETE USING (auth.uid() = user_id);

-- ── star_ratings ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS star_ratings (
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  topic_id   TEXT NOT NULL,
  rating     SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, topic_id)
);
CREATE INDEX IF NOT EXISTS idx_star_ratings_topic ON star_ratings(topic_id);

ALTER TABLE star_ratings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read ratings" ON star_ratings;
CREATE POLICY "Anyone can read ratings"
  ON star_ratings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users insert own rating" ON star_ratings;
CREATE POLICY "Users insert own rating"
  ON star_ratings FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users update own rating" ON star_ratings;
CREATE POLICY "Users update own rating"
  ON star_ratings FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ── follows ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS follows (
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_id   TEXT NOT NULL,
  target_type TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, target_id, target_type)
);
CREATE INDEX IF NOT EXISTS idx_follows_target ON follows(target_id, target_type);

ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read follows" ON follows;
CREATE POLICY "Anyone can read follows"
  ON follows FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users insert own follow" ON follows;
CREATE POLICY "Users insert own follow"
  ON follows FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users delete own follow" ON follows;
CREATE POLICY "Users delete own follow"
  ON follows FOR DELETE USING (auth.uid() = user_id);

-- ── user_trust_scores ───────────────────────────────────────────
-- Computed server-side; clients may read only their own score and may not
-- write (no INSERT/UPDATE policy → writes require the service role, which
-- bypasses RLS).
CREATE TABLE IF NOT EXISTS user_trust_scores (
  user_id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  score            INTEGER NOT NULL DEFAULT 0,
  account_age_days INTEGER NOT NULL DEFAULT 0,
  recent_flags     INTEGER NOT NULL DEFAULT 0,
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE user_trust_scores ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own trust score" ON user_trust_scores;
CREATE POLICY "Users read own trust score"
  ON user_trust_scores FOR SELECT USING (auth.uid() = user_id);
