-- ============================================================================
-- NETWORK MODULE FIXES - Alter existing tables to add missing columns
-- ============================================================================

-- Fix discussion_replies table - add missing columns
ALTER TABLE discussion_replies 
  ADD COLUMN IF NOT EXISTS parent_reply_id UUID REFERENCES discussion_replies(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS is_best_answer BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS reply_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS reaction_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_edited BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS edited_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_discussion_replies_parent ON discussion_replies(parent_reply_id);
CREATE INDEX IF NOT EXISTS idx_discussion_replies_best ON discussion_replies(discussion_id) WHERE is_best_answer = TRUE;

-- Fix activities table - add missing columns
ALTER TABLE activities
  ADD COLUMN IF NOT EXISTS actor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS action TEXT,
  ADD COLUMN IF NOT EXISTS target_type TEXT,
  ADD COLUMN IF NOT EXISTS target_id UUID,
  ADD COLUMN IF NOT EXISTS target_title TEXT,
  ADD COLUMN IF NOT EXISTS target_url TEXT,
  ADD COLUMN IF NOT EXISTS metadata JSONB,
  ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT 'connections',
  ADD COLUMN IF NOT EXISTS reaction_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS comment_count INTEGER DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_activities_actor ON activities(actor_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activities_target ON activities(target_type, target_id);

-- Fix challenge_submissions table - add missing columns
ALTER TABLE challenge_submissions
  ADD COLUMN IF NOT EXISTS participant_id UUID,
  ADD COLUMN IF NOT EXISTS milestone_id UUID,
  ADD COLUMN IF NOT EXISTS submission_type TEXT DEFAULT 'milestone',
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS score INTEGER,
  ADD COLUMN IF NOT EXISTS feedback TEXT,
  ADD COLUMN IF NOT EXISTS reviewer_id UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_challenge_submissions_participant ON challenge_submissions(participant_id);
CREATE INDEX IF NOT EXISTS idx_challenge_submissions_status ON challenge_submissions(status);

-- Add foreign key constraints if tables exist
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'challenge_participants') THEN
    BEGIN
      ALTER TABLE challenge_submissions 
        ADD CONSTRAINT fk_challenge_submissions_participant 
        FOREIGN KEY (participant_id) REFERENCES challenge_participants(id) ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_object THEN
      NULL;
    END;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'challenge_milestones') THEN
    BEGIN
      ALTER TABLE challenge_submissions 
        ADD CONSTRAINT fk_challenge_submissions_milestone 
        FOREIGN KEY (milestone_id) REFERENCES challenge_milestones(id) ON DELETE SET NULL;
    EXCEPTION WHEN duplicate_object THEN
      NULL;
    END;
  END IF;
END $$;

-- Fix RLS policies for activities
DROP POLICY IF EXISTS activities_select ON activities;
CREATE POLICY activities_select ON activities FOR SELECT
  USING (
    visibility = 'public' 
    OR actor_id = auth.uid()
    OR (visibility = 'connections' AND EXISTS (
      SELECT 1 FROM connections 
      WHERE request_status = 'accepted'
      AND ((requester_id = auth.uid() AND requestee_id = actor_id)
        OR (requestee_id = auth.uid() AND requester_id = actor_id))
    ))
  );

DROP POLICY IF EXISTS activities_insert ON activities;
CREATE POLICY activities_insert ON activities FOR INSERT WITH CHECK (auth.uid() = actor_id);

-- Fix RLS policies for challenge_submissions
DROP POLICY IF EXISTS challenge_submissions_select ON challenge_submissions;
CREATE POLICY challenge_submissions_select ON challenge_submissions FOR SELECT
  USING (
    participant_id IS NULL 
    OR EXISTS (
      SELECT 1 FROM challenge_participants 
      WHERE challenge_participants.id = challenge_submissions.participant_id 
      AND challenge_participants.user_id = auth.uid()
    ) 
    OR reviewer_id = auth.uid()
  );

DROP POLICY IF EXISTS challenge_submissions_insert ON challenge_submissions;
CREATE POLICY challenge_submissions_insert ON challenge_submissions FOR INSERT
  WITH CHECK (
    participant_id IS NULL
    OR EXISTS (
      SELECT 1 FROM challenge_participants 
      WHERE challenge_participants.id = participant_id 
      AND challenge_participants.user_id = auth.uid()
    )
  );

-- Add connections columns if missing
ALTER TABLE connections
  ADD COLUMN IF NOT EXISTS requestee_id UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS request_message TEXT,
  ADD COLUMN IF NOT EXISTS request_status TEXT DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS mutual_connections_count INTEGER DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_connections_requestee ON connections(requestee_id);
CREATE INDEX IF NOT EXISTS idx_connections_request_status ON connections(request_status);
