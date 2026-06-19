-- Bug Reports table for beta feedback
CREATE TABLE IF NOT EXISTS bug_reports (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT        NOT NULL,
  email        TEXT        NOT NULL,
  message      TEXT        NOT NULL,
  screenshot_url TEXT,
  page_url     TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Only service role can read/delete; anyone can insert (public bug reporting)
ALTER TABLE bug_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public insert bug reports"
  ON bug_reports FOR INSERT
  WITH CHECK (true);

-- Admins access everything via service role (bypasses RLS)
