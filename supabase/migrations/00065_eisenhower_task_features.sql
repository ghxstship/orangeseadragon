-- Migration 00065: Eisenhower Matrix for Tasks
-- Adds urgency and importance fields to tasks table

-- Add fields
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS importance SMALLINT DEFAULT 5 CHECK (importance >= 1 AND importance <= 10);
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS urgency SMALLINT DEFAULT 5 CHECK (urgency >= 1 AND urgency <= 10);

-- Add computed quadrant column
-- Q1: Do (Important & Urgent)
-- Q2: Schedule (Important & Not Urgent)
-- Q3: Delegate (Not Important & Urgent)
-- Q4: Eliminate (Not Important & Not Urgent)
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS eisenhower_quadrant SMALLINT GENERATED ALWAYS AS (
    CASE 
        WHEN importance >= 6 AND urgency >= 6 THEN 1
        WHEN importance >= 6 AND urgency < 6 THEN 2
        WHEN importance < 6 AND urgency >= 6 THEN 3
        ELSE 4
    END
) STORED;

-- Add indexes for matrix performance
CREATE INDEX IF NOT EXISTS idx_tasks_eisenhower_quadrant ON tasks(eisenhower_quadrant);
CREATE INDEX IF NOT EXISTS idx_tasks_urgency_importance ON tasks(urgency, importance);

-- Help text for UI
COMMENT ON COLUMN tasks.importance IS 'Task importance scale 1-10 (10 being most important)';
COMMENT ON COLUMN tasks.urgency IS 'Task urgency scale 1-10 (10 being most urgent)';
COMMENT ON COLUMN tasks.eisenhower_quadrant IS 'Computed Eisenhower quadrant (1: Do, 2: Schedule, 3: Delegate, 4: Eliminate)';
