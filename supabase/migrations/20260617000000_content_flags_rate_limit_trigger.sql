-- Fix: the content_flags 5/hour cap was not actually enforced.
--
-- In Postgres, multiple PERMISSIVE policies for the same command are OR-combined.
-- The "Rate limit flag submissions" INSERT policy ran alongside the broader
-- "Users can create flags" ownership policy, so any insert that satisfied
-- ownership passed regardless of the rate-limit check — the cap was a no-op.
--
-- Enforce the cap with a BEFORE INSERT trigger instead, which always runs.

DROP POLICY IF EXISTS "Rate limit flag submissions" ON content_flags;

CREATE OR REPLACE FUNCTION enforce_content_flag_rate_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF (
    SELECT COUNT(*)
    FROM content_flags
    WHERE user_id = NEW.user_id
      AND created_at > now() - INTERVAL '1 hour'
  ) >= 5 THEN
    RAISE EXCEPTION 'flag_rate_limit_exceeded'
      USING ERRCODE = 'check_violation';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS content_flags_rate_limit ON content_flags;
CREATE TRIGGER content_flags_rate_limit
  BEFORE INSERT ON content_flags
  FOR EACH ROW
  EXECUTE FUNCTION enforce_content_flag_rate_limit();
