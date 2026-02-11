-- Migration: Add template and status columns to events table
-- Required by: src/lib/services/event-template.service.ts
-- Enables event templating (clone/reuse event configurations)

ALTER TABLE events ADD COLUMN IF NOT EXISTS is_template BOOLEAN DEFAULT FALSE;
ALTER TABLE events ADD COLUMN IF NOT EXISTS template_id UUID REFERENCES events(id) ON DELETE SET NULL;
ALTER TABLE events ADD COLUMN IF NOT EXISTS template_name TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft';

CREATE INDEX IF NOT EXISTS idx_events_is_template ON events(is_template) WHERE is_template = TRUE;
CREATE INDEX IF NOT EXISTS idx_events_template_id ON events(template_id);

-- Also add delivery_date to catering_orders (referenced by event-template.service.ts)
ALTER TABLE catering_orders ADD COLUMN IF NOT EXISTS delivery_date TIMESTAMPTZ;

COMMENT ON COLUMN events.is_template IS 'Whether this event serves as a reusable template';
COMMENT ON COLUMN events.template_id IS 'Source template this event was cloned from';
COMMENT ON COLUMN events.template_name IS 'Display name when used as a template';
COMMENT ON COLUMN events.status IS 'Event lifecycle status: draft, confirmed, in_progress, completed, cancelled';
