-- Migration: Polymorphic entity comments table
-- Required by: src/lib/realtime/comments-service.ts
-- Provides a generic comments system attachable to any entity type

CREATE TABLE IF NOT EXISTS entity_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  author_id UUID NOT NULL REFERENCES auth.users(id),
  author_name TEXT NOT NULL,
  author_avatar_url TEXT,
  content TEXT NOT NULL,
  parent_id UUID REFERENCES entity_comments(id) ON DELETE CASCADE,
  mentions TEXT[] DEFAULT '{}',
  attachments JSONB DEFAULT '[]',
  is_edited BOOLEAN DEFAULT FALSE,
  is_resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_entity_comments_org ON entity_comments(organization_id);
CREATE INDEX IF NOT EXISTS idx_entity_comments_entity ON entity_comments(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_entity_comments_author ON entity_comments(author_id);
CREATE INDEX IF NOT EXISTS idx_entity_comments_parent ON entity_comments(parent_id);

ALTER TABLE entity_comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "entity_comments_org_access" ON entity_comments;
CREATE POLICY "entity_comments_org_access" ON entity_comments
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    )
  );

COMMENT ON TABLE entity_comments IS 'Polymorphic comments system - attachable to any entity via entity_type + entity_id';
