-- #965: Server-side content_flags table for moderation queue.
--
-- Stores user-submitted content flags with rate limiting enforced
-- via RLS policy. Supports the moderation dashboard (#969).

-- ── Table ───────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS content_flags (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content_id  TEXT NOT NULL,
  content_type TEXT NOT NULL,     -- 'life_topic' | 'debate' | 'submission' | etc.
  reason      TEXT NOT NULL,      -- 'Spam' | 'Inappropriate content' | 'Off-topic' | 'Harmful/dangerous advice' | 'Other'
  details     TEXT,               -- Free-text details (max 500 chars, enforced client-side)
  status      TEXT NOT NULL DEFAULT 'pending',  -- 'pending' | 'approved' | 'rejected' | 'dismissed'
  resolved_by UUID REFERENCES auth.users(id),
  resolved_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for common query patterns
CREATE INDEX idx_content_flags_user      ON content_flags(user_id);
CREATE INDEX idx_content_flags_status    ON content_flags(status);
CREATE INDEX idx_content_flags_content   ON content_flags(content_id, content_type);
CREATE INDEX idx_content_flags_created   ON content_flags(created_at DESC);

-- ── Row-Level Security ──────────────────────────────────────────

ALTER TABLE content_flags ENABLE ROW LEVEL SECURITY;

-- Users can insert their own flags
CREATE POLICY "Users can create flags"
  ON content_flags FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can view only their own flags
CREATE POLICY "Users can view own flags"
  ON content_flags FOR SELECT
  USING (auth.uid() = user_id);

-- Moderators (via 'moderator' role in user metadata) can view all flags
CREATE POLICY "Moderators can view all flags"
  ON content_flags FOR SELECT
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'moderator'
    OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

-- Moderators can update flag status (approve/reject/dismiss)
CREATE POLICY "Moderators can update flags"
  ON content_flags FOR UPDATE
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'moderator'
    OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

-- ── Rate-limit helper function ──────────────────────────────────
-- Returns the count of flags a user submitted in the last hour.
-- Called client-side before insert, and can also be used in a
-- check constraint or trigger.

CREATE OR REPLACE FUNCTION get_user_flag_count_last_hour(uid UUID)
RETURNS INTEGER
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT COUNT(*)::INTEGER
  FROM content_flags
  WHERE user_id = uid
    AND created_at > now() - INTERVAL '1 hour';
$$;

-- RLS: block inserts when user has >= 5 flags in the last hour
CREATE POLICY "Rate limit flag submissions"
  ON content_flags FOR INSERT
  WITH CHECK (
    get_user_flag_count_last_hour(auth.uid()) < 5
  );

-- ── Updated-at trigger ──────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_content_flags_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER content_flags_updated_at
  BEFORE UPDATE ON content_flags
  FOR EACH ROW
  EXECUTE FUNCTION update_content_flags_updated_at();
