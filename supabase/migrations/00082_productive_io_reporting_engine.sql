-- Migration: Productive.io Reporting & Analytics Engine
-- Created: 2026-02-07
-- Description: Adds report definitions, saved reports, scheduled reports,
--              dashboards with widget system, KPI tracking, and pre-built
--              profitability/utilization/pipeline report functions.

-- ============================================================================
-- STEP 1: REPORT DEFINITIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS report_definitions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

    name VARCHAR(255) NOT NULL,
    description TEXT,
    slug VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL
        CHECK (category IN ('financial', 'time', 'resource', 'project', 'sales', 'people', 'custom')),
    report_type VARCHAR(30) NOT NULL DEFAULT 'table'
        CHECK (report_type IN ('table', 'chart', 'pivot', 'summary', 'comparison', 'trend')),

    -- Data source
    base_entity VARCHAR(50) NOT NULL,
    joins JSONB DEFAULT '[]',
    columns JSONB NOT NULL DEFAULT '[]',
    filters JSONB DEFAULT '[]',
    grouping JSONB DEFAULT '[]',
    sorting JSONB DEFAULT '[]',
    aggregations JSONB DEFAULT '[]',

    -- Chart configuration
    chart_type VARCHAR(30)
        CHECK (chart_type IN ('bar', 'line', 'pie', 'donut', 'area', 'scatter', 'heatmap', 'funnel', 'gauge', 'treemap')),
    chart_config JSONB DEFAULT '{}',

    -- Date range
    default_date_range VARCHAR(30) DEFAULT 'this_month'
        CHECK (default_date_range IN ('today', 'this_week', 'this_month', 'this_quarter', 'this_year', 'last_month', 'last_quarter', 'last_year', 'custom', 'all_time')),
    date_field VARCHAR(100),

    -- Sharing
    visibility VARCHAR(20) DEFAULT 'private'
        CHECK (visibility IN ('private', 'team', 'organization')),
    is_system BOOLEAN DEFAULT FALSE,
    is_favorite BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,

    CONSTRAINT uq_report_slug UNIQUE (organization_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_report_defs_org ON report_definitions(organization_id);
CREATE INDEX IF NOT EXISTS idx_report_defs_category ON report_definitions(organization_id, category);
CREATE INDEX IF NOT EXISTS idx_report_defs_creator ON report_definitions(created_by);

-- ============================================================================
-- STEP 2: SAVED REPORT SNAPSHOTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS report_snapshots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    report_definition_id UUID NOT NULL REFERENCES report_definitions(id) ON DELETE CASCADE,

    name VARCHAR(255),
    snapshot_date TIMESTAMPTZ DEFAULT NOW(),
    date_range_start DATE,
    date_range_end DATE,
    applied_filters JSONB DEFAULT '{}',

    -- Cached results
    result_data JSONB NOT NULL DEFAULT '{}',
    row_count INTEGER DEFAULT 0,
    summary_data JSONB DEFAULT '{}',

    -- Export
    export_format VARCHAR(10)
        CHECK (export_format IN ('json', 'csv', 'xlsx', 'pdf')),
    export_url TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_report_snapshots_def ON report_snapshots(report_definition_id);
CREATE INDEX IF NOT EXISTS idx_report_snapshots_date ON report_snapshots(snapshot_date);

-- ============================================================================
-- STEP 3: SCHEDULED REPORTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS scheduled_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    report_definition_id UUID NOT NULL REFERENCES report_definitions(id) ON DELETE CASCADE,

    name VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,

    -- Schedule
    frequency VARCHAR(20) NOT NULL
        CHECK (frequency IN ('daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'yearly')),
    day_of_week INTEGER CHECK (day_of_week BETWEEN 0 AND 6),
    day_of_month INTEGER CHECK (day_of_month BETWEEN 1 AND 31),
    time_of_day TIME DEFAULT '09:00',
    timezone VARCHAR(50) DEFAULT 'UTC',

    -- Delivery
    delivery_method VARCHAR(20) DEFAULT 'email'
        CHECK (delivery_method IN ('email', 'slack', 'webhook', 'dashboard')),
    recipients JSONB DEFAULT '[]',
    delivery_config JSONB DEFAULT '{}',

    -- Export format
    export_format VARCHAR(10) DEFAULT 'pdf'
        CHECK (export_format IN ('json', 'csv', 'xlsx', 'pdf')),

    last_sent_at TIMESTAMPTZ,
    next_send_at TIMESTAMPTZ,
    send_count INTEGER DEFAULT 0,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_scheduled_reports_org ON scheduled_reports(organization_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_reports_next ON scheduled_reports(next_send_at) WHERE is_active = TRUE;

-- ============================================================================
-- STEP 4: DASHBOARDS
-- ============================================================================

CREATE TABLE IF NOT EXISTS dashboards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

    name VARCHAR(255) NOT NULL,
    description TEXT,
    slug VARCHAR(100) NOT NULL,
    icon VARCHAR(50),

    -- Layout
    layout_type VARCHAR(20) DEFAULT 'grid'
        CHECK (layout_type IN ('grid', 'freeform', 'columns')),
    column_count INTEGER DEFAULT 12,

    -- Sharing
    visibility VARCHAR(20) DEFAULT 'private'
        CHECK (visibility IN ('private', 'team', 'organization', 'public')),
    is_default BOOLEAN DEFAULT FALSE,
    is_system BOOLEAN DEFAULT FALSE,

    -- Date context
    default_date_range VARCHAR(30) DEFAULT 'this_month',
    date_field VARCHAR(100),

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,

    CONSTRAINT uq_dashboard_slug UNIQUE (organization_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_dashboards_org ON dashboards(organization_id);
CREATE INDEX IF NOT EXISTS idx_dashboards_creator ON dashboards(created_by);

-- ============================================================================
-- STEP 5: DASHBOARD WIDGETS
-- ============================================================================

CREATE TABLE IF NOT EXISTS dashboard_widgets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dashboard_id UUID NOT NULL REFERENCES dashboards(id) ON DELETE CASCADE,

    title VARCHAR(255) NOT NULL,
    widget_type VARCHAR(30) NOT NULL
        CHECK (widget_type IN ('metric', 'chart', 'table', 'list', 'progress', 'comparison', 'heatmap', 'funnel', 'text', 'embed')),

    -- Grid position
    grid_x INTEGER DEFAULT 0,
    grid_y INTEGER DEFAULT 0,
    grid_w INTEGER DEFAULT 4,
    grid_h INTEGER DEFAULT 3,

    -- Data source
    report_definition_id UUID REFERENCES report_definitions(id) ON DELETE SET NULL,
    data_source JSONB DEFAULT '{}',
    query_override JSONB,

    -- Display configuration
    config JSONB DEFAULT '{}',
    color_scheme VARCHAR(30),
    show_trend BOOLEAN DEFAULT FALSE,
    trend_period VARCHAR(20),

    -- Refresh
    refresh_interval_seconds INTEGER DEFAULT 300,
    last_refreshed_at TIMESTAMPTZ,
    cached_data JSONB,

    position INTEGER DEFAULT 0,
    is_visible BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_dashboard_widgets_dashboard ON dashboard_widgets(dashboard_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_widgets_report ON dashboard_widgets(report_definition_id);

-- ============================================================================
-- STEP 6: KPI DEFINITIONS & TRACKING
-- ============================================================================

CREATE TABLE IF NOT EXISTS kpi_definitions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL,
    unit VARCHAR(20) DEFAULT 'number'
        CHECK (unit IN ('number', 'currency', 'percentage', 'hours', 'days', 'count')),

    -- Calculation
    calculation_type VARCHAR(30) NOT NULL
        CHECK (calculation_type IN ('query', 'formula', 'manual', 'aggregate')),
    calculation_config JSONB NOT NULL DEFAULT '{}',

    -- Targets
    target_value DECIMAL(14,2),
    warning_threshold DECIMAL(14,2),
    critical_threshold DECIMAL(14,2),
    target_direction VARCHAR(10) DEFAULT 'higher'
        CHECK (target_direction IN ('higher', 'lower', 'target')),

    -- Tracking
    current_value DECIMAL(14,2),
    previous_value DECIMAL(14,2),
    trend_direction VARCHAR(10),
    last_calculated_at TIMESTAMPTZ,

    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_kpi_defs_org ON kpi_definitions(organization_id);
CREATE INDEX IF NOT EXISTS idx_kpi_defs_category ON kpi_definitions(organization_id, category);

-- KPI history for trend tracking
CREATE TABLE IF NOT EXISTS kpi_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    kpi_definition_id UUID NOT NULL REFERENCES kpi_definitions(id) ON DELETE CASCADE,
    recorded_at TIMESTAMPTZ DEFAULT NOW(),
    value DECIMAL(14,2) NOT NULL,
    period_start DATE,
    period_end DATE,
    metadata JSONB DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_kpi_history_kpi ON kpi_history(kpi_definition_id);
CREATE INDEX IF NOT EXISTS idx_kpi_history_date ON kpi_history(kpi_definition_id, recorded_at);

-- ============================================================================
-- STEP 7: PRE-BUILT REPORT FUNCTIONS
-- ============================================================================

-- Profitability report by project
CREATE OR REPLACE FUNCTION report_project_profitability(
    p_org_id UUID,
    p_start_date DATE DEFAULT NULL,
    p_end_date DATE DEFAULT NULL
) RETURNS TABLE (
    project_id UUID,
    project_name VARCHAR,
    budget_type VARCHAR,
    total_budget DECIMAL,
    total_revenue DECIMAL,
    total_costs DECIMAL,
    profit DECIMAL,
    margin_percent DECIMAL,
    budget_health VARCHAR,
    burn_percent DECIMAL,
    hours_logged DECIMAL,
    billable_hours DECIMAL,
    billable_percent DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        p.id AS project_id,
        p.name::varchar AS project_name,
        b.budget_type::varchar,
        COALESCE(b.total_amount, 0) AS total_budget,
        COALESCE(b.revenue_amount, 0) AS total_revenue,
        COALESCE(b.cost_amount, 0) AS total_costs,
        COALESCE(b.revenue_amount, 0) - COALESCE(b.cost_amount, 0) AS profit,
        CASE WHEN COALESCE(b.revenue_amount, 0) > 0
             THEN ROUND(((b.revenue_amount - b.cost_amount) / b.revenue_amount) * 100, 2)
             ELSE 0 END AS margin_percent,
        b.health_status::varchar AS budget_health,
        COALESCE(b.burn_percentage, 0) AS burn_percent,
        COALESCE(te.total_hours, 0) AS hours_logged,
        COALESCE(te.billable_hours, 0) AS billable_hours,
        CASE WHEN COALESCE(te.total_hours, 0) > 0
             THEN ROUND((te.billable_hours / te.total_hours) * 100, 2)
             ELSE 0 END AS billable_percent
    FROM projects p
    LEFT JOIN budgets b ON b.project_id = p.id AND b.status != 'cancelled'
    LEFT JOIN LATERAL (
        SELECT
            SUM(t.hours) AS total_hours,
            SUM(CASE WHEN t.billable THEN t.hours ELSE 0 END) AS billable_hours
        FROM time_entries t
        WHERE t.project_id = p.id
          AND (p_start_date IS NULL OR t.date >= p_start_date)
          AND (p_end_date IS NULL OR t.date <= p_end_date)
    ) te ON TRUE
    WHERE p.organization_id = p_org_id
      AND p.status NOT IN ('cancelled', 'archived')
    ORDER BY profit DESC;
END;
$$ LANGUAGE plpgsql;

-- Team utilization report
CREATE OR REPLACE FUNCTION report_team_utilization(
    p_org_id UUID,
    p_start_date DATE,
    p_end_date DATE
) RETURNS TABLE (
    user_id UUID,
    user_name VARCHAR,
    available_hours DECIMAL,
    logged_hours DECIMAL,
    billable_hours DECIMAL,
    non_billable_hours DECIMAL,
    utilization_percent DECIMAL,
    billable_percent DECIMAL,
    booking_count INTEGER,
    project_count INTEGER
) AS $$
DECLARE
    v_working_days INTEGER;
BEGIN
    v_working_days := (
        SELECT COUNT(*)
        FROM generate_series(p_start_date, p_end_date, '1 day'::interval) d
        WHERE EXTRACT(DOW FROM d) NOT IN (0, 6)
    );

    RETURN QUERY
    SELECT
        u.id AS user_id,
        COALESCE(u.raw_user_meta_data->>'full_name', u.email)::varchar AS user_name,
        (v_working_days * 8.0)::decimal AS available_hours,
        COALESCE(te.logged, 0)::decimal AS logged_hours,
        COALESCE(te.billable, 0)::decimal AS billable_hours,
        (COALESCE(te.logged, 0) - COALESCE(te.billable, 0))::decimal AS non_billable_hours,
        CASE WHEN v_working_days > 0
             THEN ROUND((COALESCE(te.logged, 0) / (v_working_days * 8.0)) * 100, 2)
             ELSE 0 END::decimal AS utilization_percent,
        CASE WHEN COALESCE(te.logged, 0) > 0
             THEN ROUND((COALESCE(te.billable, 0) / te.logged) * 100, 2)
             ELSE 0 END::decimal AS billable_percent,
        COALESCE(rb.booking_count, 0)::integer AS booking_count,
        COALESCE(te.project_count, 0)::integer AS project_count
    FROM auth.users u
    JOIN organization_members om ON om.user_id = u.id AND om.organization_id = p_org_id
    LEFT JOIN LATERAL (
        SELECT
            SUM(t.hours) AS logged,
            SUM(CASE WHEN t.billable THEN t.hours ELSE 0 END) AS billable,
            COUNT(DISTINCT t.project_id) AS project_count
        FROM time_entries t
        WHERE t.user_id = u.id
          AND t.date >= p_start_date
          AND t.date <= p_end_date
    ) te ON TRUE
    LEFT JOIN LATERAL (
        SELECT COUNT(*) AS booking_count
        FROM resource_bookings rb2
        WHERE rb2.user_id = u.id
          AND rb2.status = 'active'
          AND rb2.start_date <= p_end_date
          AND rb2.end_date >= p_start_date
    ) rb ON TRUE
    ORDER BY utilization_percent DESC;
END;
$$ LANGUAGE plpgsql;

-- Sales pipeline report
CREATE OR REPLACE FUNCTION report_sales_pipeline(
    p_org_id UUID
) RETURNS TABLE (
    stage_name VARCHAR,
    deal_count INTEGER,
    total_value DECIMAL,
    weighted_value DECIMAL,
    avg_probability DECIMAL,
    avg_days_in_stage DECIMAL,
    conversion_rate DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        d.stage::varchar AS stage_name,
        COUNT(*)::integer AS deal_count,
        COALESCE(SUM(d.value), 0) AS total_value,
        COALESCE(SUM(d.value * COALESCE(d.probability, 50) / 100.0), 0) AS weighted_value,
        ROUND(AVG(COALESCE(d.probability, 50)), 2) AS avg_probability,
        ROUND(AVG(EXTRACT(EPOCH FROM (NOW() - d.created_at)) / 86400), 1) AS avg_days_in_stage,
        CASE WHEN COUNT(*) > 0
             THEN ROUND((COUNT(*) FILTER (WHERE d.status = 'won')::decimal / COUNT(*)) * 100, 2)
             ELSE 0 END AS conversion_rate
    FROM deals d
    WHERE d.organization_id = p_org_id
    GROUP BY d.stage
    ORDER BY
        CASE d.stage
            WHEN 'lead' THEN 1
            WHEN 'qualified' THEN 2
            WHEN 'proposal' THEN 3
            WHEN 'negotiation' THEN 4
            WHEN 'won' THEN 5
            WHEN 'lost' THEN 6
            ELSE 7
        END;
END;
$$ LANGUAGE plpgsql;

-- Invoice aging report
CREATE OR REPLACE FUNCTION report_invoice_aging(
    p_org_id UUID
) RETURNS TABLE (
    aging_bucket VARCHAR,
    invoice_count INTEGER,
    total_amount DECIMAL,
    total_outstanding DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        CASE
            WHEN i.due_date >= CURRENT_DATE THEN 'Not Yet Due'
            WHEN CURRENT_DATE - i.due_date <= 30 THEN '1-30 Days'
            WHEN CURRENT_DATE - i.due_date <= 60 THEN '31-60 Days'
            WHEN CURRENT_DATE - i.due_date <= 90 THEN '61-90 Days'
            ELSE '90+ Days'
        END::varchar AS aging_bucket,
        COUNT(*)::integer AS invoice_count,
        COALESCE(SUM(i.total_amount), 0) AS total_amount,
        COALESCE(SUM(i.total_amount - COALESCE(i.paid_amount, 0)), 0) AS total_outstanding
    FROM invoices i
    WHERE i.organization_id = p_org_id
      AND i.status IN ('sent', 'overdue', 'partially_paid')
    GROUP BY
        CASE
            WHEN i.due_date >= CURRENT_DATE THEN 'Not Yet Due'
            WHEN CURRENT_DATE - i.due_date <= 30 THEN '1-30 Days'
            WHEN CURRENT_DATE - i.due_date <= 60 THEN '31-60 Days'
            WHEN CURRENT_DATE - i.due_date <= 90 THEN '61-90 Days'
            ELSE '90+ Days'
        END
    ORDER BY
        CASE
            WHEN aging_bucket = 'Not Yet Due' THEN 1
            WHEN aging_bucket = '1-30 Days' THEN 2
            WHEN aging_bucket = '31-60 Days' THEN 3
            WHEN aging_bucket = '61-90 Days' THEN 4
            ELSE 5
        END;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- STEP 8: RLS POLICIES
-- ============================================================================

ALTER TABLE report_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_widgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE kpi_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE kpi_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY report_defs_org_isolation ON report_definitions
    USING (organization_id IN (
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    ));

CREATE POLICY report_snapshots_org_isolation ON report_snapshots
    USING (organization_id IN (
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    ));

CREATE POLICY scheduled_reports_org_isolation ON scheduled_reports
    USING (organization_id IN (
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    ));

CREATE POLICY dashboards_org_isolation ON dashboards
    USING (organization_id IN (
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    ));

CREATE POLICY dashboard_widgets_org_isolation ON dashboard_widgets
    USING (dashboard_id IN (
        SELECT id FROM dashboards WHERE organization_id IN (
            SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
        )
    ));

CREATE POLICY kpi_defs_org_isolation ON kpi_definitions
    USING (organization_id IN (
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    ));

CREATE POLICY kpi_history_org_isolation ON kpi_history
    USING (kpi_definition_id IN (
        SELECT id FROM kpi_definitions WHERE organization_id IN (
            SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
        )
    ));
