-- ============================================================================
-- NETWORK MODULE ENHANCEMENTS MIGRATION
-- Priority 1-5 Features: Messaging, Connections, Discussions, Activity, Challenges
-- ============================================================================

-- ============================================================================
-- 1. CONVERSATIONS TABLE (Direct & Group Messaging)
-- ============================================================================
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'direct' CHECK (type IN ('direct', 'group')),
  name TEXT,
  participant_ids UUID[] NOT NULL,
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  last_message_preview TEXT,
  unread_count INTEGER DEFAULT 0,
  is_muted BOOLEAN DEFAULT FALSE,
  is_archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_conversations_participants ON conversations USING GIN (participant_ids);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message ON conversations(last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_archived ON conversations(is_archived);

-- ============================================================================
-- 2. MESSAGES TABLE (Real-time Messaging)
-- ============================================================================
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'system')),
  attachments JSONB,
  read_at TIMESTAMPTZ,
  edited_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id, created_at);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);

-- ============================================================================
-- 3. REACTIONS TABLE (Emoji Reactions on Content)
-- ============================================================================
CREATE TABLE IF NOT EXISTS reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_type TEXT NOT NULL CHECK (target_type IN ('discussion', 'reply', 'showcase', 'challenge', 'message', 'activity')),
  target_id UUID NOT NULL,
  emoji TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, target_type, target_id, emoji)
);

CREATE INDEX IF NOT EXISTS idx_reactions_target ON reactions(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_reactions_user ON reactions(user_id);

-- ============================================================================
-- 4. DISCUSSION REPLIES TABLE (Threaded Discussions)
-- ============================================================================
-- Extend existing discussion_replies table (originally from 00014_network_community.sql)
ALTER TABLE discussion_replies ADD COLUMN IF NOT EXISTS parent_reply_id UUID;
ALTER TABLE discussion_replies ADD COLUMN IF NOT EXISTS is_best_answer BOOLEAN DEFAULT FALSE;
ALTER TABLE discussion_replies ADD COLUMN IF NOT EXISTS reply_count INTEGER DEFAULT 0;
ALTER TABLE discussion_replies ADD COLUMN IF NOT EXISTS reaction_count INTEGER DEFAULT 0;
ALTER TABLE discussion_replies ADD COLUMN IF NOT EXISTS is_edited BOOLEAN DEFAULT FALSE;
ALTER TABLE discussion_replies ADD COLUMN IF NOT EXISTS edited_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_discussion_replies_discussion ON discussion_replies(discussion_id, created_at);
CREATE INDEX IF NOT EXISTS idx_discussion_replies_parent ON discussion_replies(parent_reply_id);
CREATE INDEX IF NOT EXISTS idx_discussion_replies_author ON discussion_replies(author_id);
CREATE INDEX IF NOT EXISTS idx_discussion_replies_best ON discussion_replies(discussion_id) WHERE is_best_answer = TRUE;

-- ============================================================================
-- 5. ACTIVITIES TABLE (Activity Feed)
-- ============================================================================
-- Extend existing activities table (originally from 00006_crm_venues.sql)
ALTER TABLE activities ADD COLUMN IF NOT EXISTS actor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE activities ADD COLUMN IF NOT EXISTS action TEXT CHECK (action IN ('created', 'updated', 'joined', 'completed', 'commented', 'reacted', 'connected', 'shared', 'mentioned', 'achieved'));
ALTER TABLE activities ADD COLUMN IF NOT EXISTS target_type TEXT CHECK (target_type IN ('discussion', 'challenge', 'showcase', 'opportunity', 'connection', 'marketplace', 'profile', 'badge'));
ALTER TABLE activities ADD COLUMN IF NOT EXISTS target_id UUID;
ALTER TABLE activities ADD COLUMN IF NOT EXISTS target_title TEXT;
ALTER TABLE activities ADD COLUMN IF NOT EXISTS target_url TEXT;
ALTER TABLE activities ADD COLUMN IF NOT EXISTS metadata JSONB;
ALTER TABLE activities ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT 'connections' CHECK (visibility IN ('public', 'connections', 'private'));
ALTER TABLE activities ADD COLUMN IF NOT EXISTS reaction_count INTEGER DEFAULT 0;
ALTER TABLE activities ADD COLUMN IF NOT EXISTS comment_count INTEGER DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_activities_actor ON activities(actor_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activities_target ON activities(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_activities_created ON activities(created_at DESC);

-- ============================================================================
-- 6. USER FOLLOWS TABLE (Following Relationships)
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL,
  following_type TEXT NOT NULL CHECK (following_type IN ('user', 'discussion', 'challenge', 'showcase')),
  notify_on_update BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(follower_id, following_id, following_type)
);

CREATE INDEX IF NOT EXISTS idx_user_follows_follower ON user_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_following ON user_follows(following_type, following_id);

-- ============================================================================
-- 7. CHALLENGE PARTICIPANTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS challenge_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  team_id UUID,
  status TEXT NOT NULL DEFAULT 'registered' CHECK (status IN ('registered', 'active', 'completed', 'withdrawn')),
  progress_percent INTEGER DEFAULT 0 CHECK (progress_percent >= 0 AND progress_percent <= 100),
  score INTEGER DEFAULT 0,
  rank INTEGER,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  last_activity_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(challenge_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_challenge_participants_challenge ON challenge_participants(challenge_id);
CREATE INDEX IF NOT EXISTS idx_challenge_participants_user ON challenge_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_challenge_participants_score ON challenge_participants(challenge_id, score DESC);

-- ============================================================================
-- 8. CHALLENGE MILESTONES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS challenge_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  "order" INTEGER NOT NULL,
  due_date TIMESTAMPTZ,
  points INTEGER DEFAULT 10,
  is_required BOOLEAN DEFAULT TRUE,
  submission_type TEXT DEFAULT 'any' CHECK (submission_type IN ('any', 'text', 'file', 'link', 'none')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_challenge_milestones_challenge ON challenge_milestones(challenge_id, "order");

-- ============================================================================
-- 9. CHALLENGE SUBMISSIONS TABLE
-- ============================================================================
-- Extend existing challenge_submissions table (originally from 00014_network_community.sql)
ALTER TABLE challenge_submissions ADD COLUMN IF NOT EXISTS participant_id UUID;
ALTER TABLE challenge_submissions ADD COLUMN IF NOT EXISTS milestone_id UUID;
ALTER TABLE challenge_submissions ADD COLUMN IF NOT EXISTS attachments JSONB;
ALTER TABLE challenge_submissions ADD COLUMN IF NOT EXISTS submission_type TEXT DEFAULT 'milestone' CHECK (submission_type IN ('milestone', 'final', 'update'));
ALTER TABLE challenge_submissions ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending' CHECK (status IN ('draft', 'pending', 'reviewed', 'approved', 'rejected'));
ALTER TABLE challenge_submissions ADD COLUMN IF NOT EXISTS reviewer_id UUID REFERENCES auth.users(id);
ALTER TABLE challenge_submissions ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_challenge_submissions_challenge ON challenge_submissions(challenge_id);
CREATE INDEX IF NOT EXISTS idx_challenge_submissions_participant ON challenge_submissions(participant_id);
CREATE INDEX IF NOT EXISTS idx_challenge_submissions_status ON challenge_submissions(status);

-- ============================================================================
-- 10. GAMIFICATION: USER POINTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  points INTEGER DEFAULT 0,
  lifetime_points INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  level_progress INTEGER DEFAULT 0 CHECK (level_progress >= 0 AND level_progress <= 100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_points_user ON user_points(user_id);
CREATE INDEX IF NOT EXISTS idx_user_points_leaderboard ON user_points(lifetime_points DESC);

-- ============================================================================
-- 11. GAMIFICATION: BADGES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('engagement', 'expertise', 'community', 'achievement', 'special')),
  criteria JSONB NOT NULL,
  points_value INTEGER DEFAULT 10,
  rarity TEXT DEFAULT 'common' CHECK (rarity IN ('common', 'uncommon', 'rare', 'epic', 'legendary')),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_badges_category ON badges(category);
CREATE INDEX IF NOT EXISTS idx_badges_active ON badges(is_active);

-- ============================================================================
-- 12. GAMIFICATION: USER BADGES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

CREATE INDEX IF NOT EXISTS idx_user_badges_user ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_badge ON user_badges(badge_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_featured ON user_badges(user_id) WHERE is_featured = TRUE;

-- ============================================================================
-- 13. ALTER CONNECTIONS TABLE (Add Request Workflow Fields)
-- ============================================================================
ALTER TABLE connections 
  ADD COLUMN IF NOT EXISTS requester_id UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS requestee_id UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS request_message TEXT,
  ADD COLUMN IF NOT EXISTS request_status TEXT DEFAULT 'pending' CHECK (request_status IN ('pending', 'accepted', 'declined', 'blocked')),
  ADD COLUMN IF NOT EXISTS requested_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS responded_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS mutual_connections_count INTEGER DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_connections_requester ON connections(requester_id);
CREATE INDEX IF NOT EXISTS idx_connections_requestee ON connections(requestee_id);
CREATE INDEX IF NOT EXISTS idx_connections_request_status ON connections(request_status);

-- ============================================================================
-- 14. ALTER DISCUSSIONS TABLE (Add Reaction Count & Answered Status)
-- ============================================================================
ALTER TABLE discussions
  ADD COLUMN IF NOT EXISTS reaction_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_answered BOOLEAN DEFAULT FALSE;

-- ============================================================================
-- 15. HELPER FUNCTIONS
-- ============================================================================

-- Function to increment reply count on discussions
CREATE OR REPLACE FUNCTION increment_reply_count(discussion_id_param UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE discussions 
  SET reply_count = COALESCE(reply_count, 0) + 1,
      updated_at = NOW()
  WHERE id = discussion_id_param;
END;
$$ LANGUAGE plpgsql;

-- Function to increment reply count on replies (nested)
CREATE OR REPLACE FUNCTION increment_reply_count_for_reply(reply_id_param UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE discussion_replies 
  SET reply_count = COALESCE(reply_count, 0) + 1,
      updated_at = NOW()
  WHERE id = reply_id_param;
END;
$$ LANGUAGE plpgsql;

-- Function to update reaction counts
CREATE OR REPLACE FUNCTION update_reaction_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.target_type = 'discussion' THEN
      UPDATE discussions SET reaction_count = COALESCE(reaction_count, 0) + 1 WHERE id = NEW.target_id;
    ELSIF NEW.target_type = 'reply' THEN
      UPDATE discussion_replies SET reaction_count = COALESCE(reaction_count, 0) + 1 WHERE id = NEW.target_id;
    ELSIF NEW.target_type = 'activity' THEN
      UPDATE activities SET reaction_count = COALESCE(reaction_count, 0) + 1 WHERE id = NEW.target_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.target_type = 'discussion' THEN
      UPDATE discussions SET reaction_count = GREATEST(COALESCE(reaction_count, 0) - 1, 0) WHERE id = OLD.target_id;
    ELSIF OLD.target_type = 'reply' THEN
      UPDATE discussion_replies SET reaction_count = GREATEST(COALESCE(reaction_count, 0) - 1, 0) WHERE id = OLD.target_id;
    ELSIF OLD.target_type = 'activity' THEN
      UPDATE activities SET reaction_count = GREATEST(COALESCE(reaction_count, 0) - 1, 0) WHERE id = OLD.target_id;
    END IF;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_reaction_count ON reactions;
CREATE TRIGGER trigger_update_reaction_count
AFTER INSERT OR DELETE ON reactions
FOR EACH ROW EXECUTE FUNCTION update_reaction_count();

-- ============================================================================
-- 16. ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Enable RLS on new tables
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE discussion_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

-- Conversations: Users can see conversations they're part of
CREATE POLICY conversations_select ON conversations FOR SELECT
  USING (auth.uid() = ANY(participant_ids));

CREATE POLICY conversations_insert ON conversations FOR INSERT
  WITH CHECK (auth.uid() = ANY(participant_ids));

CREATE POLICY conversations_update ON conversations FOR UPDATE
  USING (auth.uid() = ANY(participant_ids));

-- Messages: Users can see messages in their conversations
CREATE POLICY messages_select ON messages FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM conversations 
    WHERE conversations.id = messages.conversation_id 
    AND auth.uid() = ANY(conversations.participant_ids)
  ));

CREATE POLICY messages_insert ON messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

-- Reactions: Anyone can view, users can manage their own
CREATE POLICY reactions_select ON reactions FOR SELECT USING (TRUE);
CREATE POLICY reactions_insert ON reactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY reactions_delete ON reactions FOR DELETE USING (auth.uid() = user_id);

-- Discussion Replies: Anyone can view, users can manage their own
CREATE POLICY discussion_replies_select ON discussion_replies FOR SELECT USING (TRUE);
CREATE POLICY discussion_replies_insert ON discussion_replies FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY discussion_replies_update ON discussion_replies FOR UPDATE USING (auth.uid() = author_id);

-- Activities: Based on visibility
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

CREATE POLICY activities_insert ON activities FOR INSERT WITH CHECK (auth.uid() = actor_id);

-- User Follows: Users can manage their own follows
CREATE POLICY user_follows_select ON user_follows FOR SELECT USING (TRUE);
CREATE POLICY user_follows_insert ON user_follows FOR INSERT WITH CHECK (auth.uid() = follower_id);
CREATE POLICY user_follows_delete ON user_follows FOR DELETE USING (auth.uid() = follower_id);

-- Challenge Participants: Anyone can view, users can manage their own
CREATE POLICY challenge_participants_select ON challenge_participants FOR SELECT USING (TRUE);
CREATE POLICY challenge_participants_insert ON challenge_participants FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY challenge_participants_update ON challenge_participants FOR UPDATE USING (auth.uid() = user_id);

-- Challenge Milestones: Anyone can view
CREATE POLICY challenge_milestones_select ON challenge_milestones FOR SELECT USING (TRUE);

-- Challenge Submissions: Users can see their own and reviewers can see assigned
CREATE POLICY challenge_submissions_select ON challenge_submissions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM challenge_participants 
    WHERE challenge_participants.id = challenge_submissions.participant_id 
    AND challenge_participants.user_id = auth.uid()
  ) OR reviewer_id = auth.uid());

CREATE POLICY challenge_submissions_insert ON challenge_submissions FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM challenge_participants 
    WHERE challenge_participants.id = participant_id 
    AND challenge_participants.user_id = auth.uid()
  ));

-- User Points: Users can see all (leaderboard), manage their own
CREATE POLICY user_points_select ON user_points FOR SELECT USING (TRUE);

-- Badges: Anyone can view
CREATE POLICY badges_select ON badges FOR SELECT USING (TRUE);

-- User Badges: Anyone can view
CREATE POLICY user_badges_select ON user_badges FOR SELECT USING (TRUE);

-- ============================================================================
-- 17. REALTIME SUBSCRIPTIONS
-- ============================================================================

-- Enable realtime for messaging
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE reactions;
ALTER PUBLICATION supabase_realtime ADD TABLE activities;

COMMENT ON TABLE conversations IS 'Direct and group message conversations';
COMMENT ON TABLE messages IS 'Real-time messages within conversations';
COMMENT ON TABLE reactions IS 'Emoji reactions on various content types';
COMMENT ON TABLE discussion_replies IS 'Threaded replies to discussions';
COMMENT ON TABLE activities IS 'Activity feed events for the network';
COMMENT ON TABLE user_follows IS 'Following relationships for users and content';
COMMENT ON TABLE challenge_participants IS 'User participation in challenges';
COMMENT ON TABLE challenge_milestones IS 'Progress milestones within challenges';
COMMENT ON TABLE challenge_submissions IS 'Submissions for challenge milestones';
COMMENT ON TABLE user_points IS 'Gamification points tracking';
COMMENT ON TABLE badges IS 'Achievement badge definitions';
COMMENT ON TABLE user_badges IS 'Badges earned by users';
