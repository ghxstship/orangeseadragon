-- Migration: Productive.io Task Automations & Project Templates
-- Created: 2026-02-07
-- Description: Adds automation rules engine, project/task templates with
--              dependency cloning, custom fields, and Gantt chart support.

-- ============================================================================
-- STEP 1: AUTOMATION RULES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS automation_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,

    -- Trigger
    trigger_entity VARCHAR(50) NOT NULL,
    trigger_event VARCHAR(30) NOT NULL
        CHECK (trigger_event IN ('created', 'updated', 'deleted', 'status_changed', 'field_changed', 'date_reached', 'schedule')),
    trigger_conditions JSONB DEFAULT '[]',

    -- Actions (ordered array of action objects)
    actions JSONB NOT NULL DEFAULT '[]',

    -- Scheduling (for schedule-based triggers)
    cron_expression VARCHAR(100),
    next_run_at TIMESTAMPTZ,
    last_run_at TIMESTAMPTZ,

    -- Limits
    run_count INTEGER DEFAULT 0,
    max_runs INTEGER,
    cooldown_seconds INTEGER,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_automation_rules_org ON automation_rules(organization_id);
CREATE INDEX IF NOT EXISTS idx_automation_rules_entity ON automation_rules(trigger_entity);
CREATE INDEX IF NOT EXISTS idx_automation_rules_active ON automation_rules(organization_id, is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_automation_rules_schedule ON automation_rules(next_run_at) WHERE trigger_event = 'schedule' AND is_active = TRUE;

-- Automation execution log
CREATE TABLE IF NOT EXISTS automation_executions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    automation_rule_id UUID NOT NULL REFERENCES automation_rules(id) ON DELETE CASCADE,
    trigger_entity_type VARCHAR(50),
    trigger_entity_id UUID,
    status VARCHAR(20) DEFAULT 'running'
        CHECK (status IN ('running', 'completed', 'failed', 'skipped')),
    actions_executed INTEGER DEFAULT 0,
    actions_failed INTEGER DEFAULT 0,
    execution_log JSONB DEFAULT '[]',
    error_message TEXT,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    duration_ms INTEGER
);

CREATE INDEX IF NOT EXISTS idx_automation_executions_rule ON automation_executions(automation_rule_id);
CREATE INDEX IF NOT EXISTS idx_automation_executions_org ON automation_executions(organization_id);
CREATE INDEX IF NOT EXISTS idx_automation_executions_status ON automation_executions(status);

-- ============================================================================
-- STEP 2: PROJECT TEMPLATES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS project_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

    name VARCHAR(255) NOT NULL,
    description TEXT,
    production_type VARCHAR(50),
    category VARCHAR(100),
    icon VARCHAR(50),
    color VARCHAR(20),

    -- Template configuration
    default_status VARCHAR(30) DEFAULT 'planning',
    default_visibility VARCHAR(20) DEFAULT 'team',
    default_priority VARCHAR(20) DEFAULT 'medium',
    estimated_duration_days INTEGER,

    -- Budget template link
    budget_template_id UUID REFERENCES budget_templates(id) ON DELETE SET NULL,

    -- Metadata
    usage_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    is_system BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_project_templates_org ON project_templates(organization_id);
CREATE INDEX IF NOT EXISTS idx_project_templates_type ON project_templates(production_type);
CREATE INDEX IF NOT EXISTS idx_project_templates_active ON project_templates(organization_id, is_active) WHERE is_active = TRUE;

-- ============================================================================
-- STEP 3: TASK TEMPLATES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS task_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_template_id UUID NOT NULL REFERENCES project_templates(id) ON DELETE CASCADE,

    title VARCHAR(500) NOT NULL,
    description TEXT,
    task_type VARCHAR(30) DEFAULT 'task',
    priority VARCHAR(20) DEFAULT 'medium',
    position INTEGER DEFAULT 0,

    -- Relative scheduling (days from project start)
    relative_start_day INTEGER DEFAULT 0,
    relative_due_day INTEGER,
    estimated_hours DECIMAL(6,2),

    -- Assignment
    assigned_role VARCHAR(100),
    department VARCHAR(100),

    -- Grouping
    task_list_name VARCHAR(255),
    parent_task_position INTEGER,

    -- Labels/tags
    labels TEXT[],
    checklist_items JSONB DEFAULT '[]',

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_task_templates_project ON task_templates(project_template_id);
CREATE INDEX IF NOT EXISTS idx_task_templates_position ON task_templates(project_template_id, position);

-- ============================================================================
-- STEP 4: TASK TEMPLATE DEPENDENCIES
-- ============================================================================

CREATE TABLE IF NOT EXISTS task_template_dependencies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    predecessor_id UUID NOT NULL REFERENCES task_templates(id) ON DELETE CASCADE,
    successor_id UUID NOT NULL REFERENCES task_templates(id) ON DELETE CASCADE,
    dependency_type VARCHAR(30) DEFAULT 'finish_to_start'
        CHECK (dependency_type IN ('finish_to_start', 'start_to_start', 'finish_to_finish', 'start_to_finish')),
    lag_days INTEGER DEFAULT 0,

    CONSTRAINT chk_no_self_dependency CHECK (predecessor_id != successor_id)
);

CREATE INDEX IF NOT EXISTS idx_task_template_deps_pred ON task_template_dependencies(predecessor_id);
CREATE INDEX IF NOT EXISTS idx_task_template_deps_succ ON task_template_dependencies(successor_id);

-- ============================================================================
-- STEP 5: CUSTOM FIELDS SYSTEM
-- ============================================================================

CREATE TABLE IF NOT EXISTS custom_field_definitions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    description TEXT,
    entity_type VARCHAR(50) NOT NULL,
    field_type VARCHAR(30) NOT NULL
        CHECK (field_type IN ('text', 'number', 'date', 'datetime', 'select', 'multi_select', 'checkbox', 'url', 'email', 'currency', 'percentage', 'formula', 'relation')),

    -- Configuration
    options JSONB DEFAULT '[]',
    default_value TEXT,
    is_required BOOLEAN DEFAULT FALSE,
    is_filterable BOOLEAN DEFAULT TRUE,
    is_sortable BOOLEAN DEFAULT TRUE,
    show_in_table BOOLEAN DEFAULT FALSE,
    show_in_form BOOLEAN DEFAULT TRUE,
    position INTEGER DEFAULT 0,

    -- Formula (for formula type)
    formula_expression TEXT,

    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,

    CONSTRAINT uq_custom_field_slug UNIQUE (organization_id, entity_type, slug)
);

CREATE INDEX IF NOT EXISTS idx_custom_field_defs_org ON custom_field_definitions(organization_id);
CREATE INDEX IF NOT EXISTS idx_custom_field_defs_entity ON custom_field_definitions(organization_id, entity_type);

-- Custom field values (EAV pattern for flexibility)
CREATE TABLE IF NOT EXISTS custom_field_values (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    field_definition_id UUID NOT NULL REFERENCES custom_field_definitions(id) ON DELETE CASCADE,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    value_text TEXT,
    value_number DECIMAL(14,4),
    value_date TIMESTAMPTZ,
    value_json JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT uq_custom_field_value UNIQUE (field_definition_id, entity_id)
);

CREATE INDEX IF NOT EXISTS idx_custom_field_values_entity ON custom_field_values(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_custom_field_values_field ON custom_field_values(field_definition_id);

-- ============================================================================
-- STEP 6: PROJECT FROM TEMPLATE FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION create_project_from_template(
    p_template_id UUID,
    p_org_id UUID,
    p_user_id UUID,
    p_project_name VARCHAR,
    p_start_date DATE DEFAULT CURRENT_DATE,
    p_client_id UUID DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    v_template project_templates%ROWTYPE;
    v_project_id UUID;
    v_task_list_id UUID;
    v_task_map JSONB := '{}';
    v_task_template RECORD;
    v_new_task_id UUID;
    v_dep RECORD;
    v_slug VARCHAR;
BEGIN
    SELECT * INTO v_template FROM project_templates WHERE id = p_template_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Template not found: %', p_template_id;
    END IF;

    -- Generate slug
    v_slug := LOWER(REGEXP_REPLACE(p_project_name, '[^a-z0-9]+', '-', 'gi')) || '-' || TO_CHAR(NOW(), 'YYYYMMDD');

    -- Create project
    INSERT INTO projects (
        organization_id, name, slug, description,
        status, visibility, priority,
        client_id, start_date,
        end_date, created_by
    ) VALUES (
        p_org_id, p_project_name, v_slug, v_template.description,
        v_template.default_status, v_template.default_visibility, v_template.default_priority,
        p_client_id, p_start_date,
        CASE WHEN v_template.estimated_duration_days IS NOT NULL
             THEN p_start_date + v_template.estimated_duration_days
             ELSE NULL END,
        p_user_id
    ) RETURNING id INTO v_project_id;

    -- Create default task list
    INSERT INTO task_lists (
        organization_id, project_id, name, position, is_default
    ) VALUES (
        p_org_id, v_project_id, 'Tasks', 0, TRUE
    ) RETURNING id INTO v_task_list_id;

    -- Create tasks from template (ordered by position)
    FOR v_task_template IN
        SELECT * FROM task_templates
        WHERE project_template_id = p_template_id
        ORDER BY position
    LOOP
        INSERT INTO tasks (
            organization_id, project_id, task_list_id,
            title, description, task_type, priority,
            status, position,
            start_date,
            due_date,
            estimated_hours,
            created_by
        ) VALUES (
            p_org_id, v_project_id, v_task_list_id,
            v_task_template.title, v_task_template.description,
            v_task_template.task_type, v_task_template.priority,
            'todo', v_task_template.position,
            CASE WHEN v_task_template.relative_start_day IS NOT NULL
                 THEN p_start_date + v_task_template.relative_start_day
                 ELSE NULL END,
            CASE WHEN v_task_template.relative_due_day IS NOT NULL
                 THEN p_start_date + v_task_template.relative_due_day
                 ELSE NULL END,
            v_task_template.estimated_hours,
            p_user_id
        ) RETURNING id INTO v_new_task_id;

        -- Map template task ID → real task ID
        v_task_map := v_task_map || jsonb_build_object(v_task_template.id::text, v_new_task_id::text);
    END LOOP;

    -- Clone dependencies
    FOR v_dep IN
        SELECT * FROM task_template_dependencies
        WHERE predecessor_id IN (SELECT id FROM task_templates WHERE project_template_id = p_template_id)
    LOOP
        INSERT INTO task_dependencies (
            predecessor_id, successor_id, dependency_type, lag_hours
        ) VALUES (
            (v_task_map ->> v_dep.predecessor_id::text)::uuid,
            (v_task_map ->> v_dep.successor_id::text)::uuid,
            v_dep.dependency_type,
            v_dep.lag_days * 8
        );
    END LOOP;

    -- Create budget from linked template if available
    IF v_template.budget_template_id IS NOT NULL THEN
        INSERT INTO budgets (
            organization_id, project_id, name,
            budget_type, period_type, start_date,
            status, created_by
        ) VALUES (
            p_org_id, v_project_id, p_project_name || ' Budget',
            'fixed_price', 'project', p_start_date,
            'draft', p_user_id
        );
    END IF;

    -- Increment usage count
    UPDATE project_templates SET
        usage_count = usage_count + 1,
        updated_at = NOW()
    WHERE id = p_template_id;

    -- Add creator as project member
    INSERT INTO project_members (project_id, user_id, role)
    VALUES (v_project_id, p_user_id, 'owner');

    RETURN v_project_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- STEP 7: GANTT CHART SUPPORT — CRITICAL PATH CALCULATION
-- ============================================================================

CREATE OR REPLACE FUNCTION calculate_critical_path(p_project_id UUID)
RETURNS TABLE (
    task_id UUID,
    task_title VARCHAR,
    earliest_start DATE,
    earliest_finish DATE,
    latest_start DATE,
    latest_finish DATE,
    total_float INTEGER,
    is_critical BOOLEAN
) AS $$
BEGIN
    -- Forward pass: calculate earliest start/finish
    -- Backward pass: calculate latest start/finish
    -- Float = latest_start - earliest_start
    -- Critical = float == 0

    RETURN QUERY
    WITH RECURSIVE
    task_data AS (
        SELECT
            t.id,
            t.title,
            t.start_date,
            t.due_date,
            COALESCE(t.due_date - t.start_date, COALESCE(t.estimated_hours::integer / 8, 1)) AS duration_days
        FROM tasks t
        WHERE t.project_id = p_project_id
          AND t.status != 'cancelled'
    ),
    -- Forward pass
    forward_pass AS (
        -- Tasks with no predecessors
        SELECT
            td.id,
            td.title,
            COALESCE(td.start_date, CURRENT_DATE) AS es,
            COALESCE(td.start_date, CURRENT_DATE) + td.duration_days AS ef,
            td.duration_days
        FROM task_data td
        WHERE NOT EXISTS (
            SELECT 1 FROM task_dependencies dep WHERE dep.successor_id = td.id
        )
        UNION ALL
        SELECT
            td.id,
            td.title,
            GREATEST(fp.ef + COALESCE(dep.lag_hours / 8, 0), COALESCE(td.start_date, CURRENT_DATE)) AS es,
            GREATEST(fp.ef + COALESCE(dep.lag_hours / 8, 0), COALESCE(td.start_date, CURRENT_DATE)) + td.duration_days AS ef,
            td.duration_days
        FROM task_data td
        JOIN task_dependencies dep ON dep.successor_id = td.id
        JOIN forward_pass fp ON fp.id = dep.predecessor_id
    ),
    -- Get max earliest finish per task
    forward_max AS (
        SELECT id, title, MAX(es) AS es, MAX(ef) AS ef, MAX(duration_days) AS duration_days
        FROM forward_pass
        GROUP BY id, title
    ),
    -- Project end
    project_end AS (
        SELECT MAX(ef) AS end_date FROM forward_max
    ),
    -- Backward pass
    backward AS (
        SELECT
            fm.id, fm.title, fm.es, fm.ef, fm.duration_days,
            COALESCE(
                (SELECT MIN(bk.ls - COALESCE(dep2.lag_hours / 8, 0))
                 FROM task_dependencies dep2
                 JOIN forward_max bk ON bk.id = dep2.successor_id
                 WHERE dep2.predecessor_id = fm.id),
                (SELECT end_date FROM project_end)
            ) - fm.duration_days AS ls,
            COALESCE(
                (SELECT MIN(bk.ls - COALESCE(dep2.lag_hours / 8, 0))
                 FROM task_dependencies dep2
                 JOIN forward_max bk ON bk.id = dep2.successor_id
                 WHERE dep2.predecessor_id = fm.id),
                (SELECT end_date FROM project_end)
            ) AS lf
        FROM forward_max fm
    )
    SELECT
        b.id,
        b.title::varchar,
        b.es::date,
        b.ef::date,
        b.ls::date,
        b.lf::date,
        (b.ls - b.es)::integer AS total_float,
        (b.ls - b.es) = 0 AS is_critical
    FROM backward b
    ORDER BY b.es, b.id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- STEP 8: RLS POLICIES
-- ============================================================================

ALTER TABLE automation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_template_dependencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_field_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_field_values ENABLE ROW LEVEL SECURITY;

CREATE POLICY automation_rules_org_isolation ON automation_rules
    USING (organization_id IN (
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    ));

CREATE POLICY automation_executions_org_isolation ON automation_executions
    USING (organization_id IN (
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    ));

CREATE POLICY project_templates_org_isolation ON project_templates
    USING (organization_id IN (
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    ));

CREATE POLICY task_templates_org_isolation ON task_templates
    USING (project_template_id IN (
        SELECT id FROM project_templates WHERE organization_id IN (
            SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
        )
    ));

CREATE POLICY task_template_deps_org_isolation ON task_template_dependencies
    USING (predecessor_id IN (
        SELECT tt.id FROM task_templates tt
        JOIN project_templates pt ON pt.id = tt.project_template_id
        WHERE pt.organization_id IN (
            SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
        )
    ));

CREATE POLICY custom_field_defs_org_isolation ON custom_field_definitions
    USING (organization_id IN (
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    ));

CREATE POLICY custom_field_values_org_isolation ON custom_field_values
    USING (organization_id IN (
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    ));
