-- ATLVS Platform Database Schema
-- Programs, Portfolios & Forecasting Tables

-- ============================================================================
-- ADDITIONAL ENUMS
-- ============================================================================

CREATE TYPE program_status AS ENUM ('draft', 'planning', 'active', 'on_hold', 'completed', 'cancelled', 'archived');
CREATE TYPE forecast_type AS ENUM ('revenue', 'cost', 'resource', 'capacity');
CREATE TYPE forecast_period AS ENUM ('daily', 'weekly', 'monthly', 'quarterly', 'yearly');
CREATE TYPE scenario_type AS ENUM ('baseline', 'optimistic', 'pessimistic', 'custom');

-- ============================================================================
-- PROGRAMS & PORTFOLIOS
-- ============================================================================

-- Programs (groups of related projects)
CREATE TABLE programs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    description TEXT,
    status program_status DEFAULT 'draft',
    visibility visibility_type DEFAULT 'team',
    priority priority_level DEFAULT 'medium',
    color VARCHAR(7),
    icon VARCHAR(50),
    start_date DATE,
    end_date DATE,
    budget_amount DECIMAL(14,2),
    budget_currency VARCHAR(3) DEFAULT 'USD',
    owner_id UUID REFERENCES users(id) ON DELETE SET NULL,
    settings JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    deleted_at TIMESTAMPTZ,
    UNIQUE(organization_id, slug)
);

CREATE INDEX idx_programs_organization ON programs(organization_id);
CREATE INDEX idx_programs_status ON programs(status);
CREATE INDEX idx_programs_owner ON programs(owner_id);

-- Program Projects (junction table)
CREATE TABLE program_projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    position INTEGER DEFAULT 0,
    added_at TIMESTAMPTZ DEFAULT NOW(),
    added_by UUID REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE(program_id, project_id)
);

CREATE INDEX idx_program_projects_program ON program_projects(program_id);
CREATE INDEX idx_program_projects_project ON program_projects(project_id);

-- Program Members
CREATE TABLE program_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'member',
    permissions JSONB DEFAULT '{}',
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(program_id, user_id)
);

CREATE INDEX idx_program_members_program ON program_members(program_id);
CREATE INDEX idx_program_members_user ON program_members(user_id);

-- Program Objectives
CREATE TABLE program_objectives (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    target_value DECIMAL(14,2),
    current_value DECIMAL(14,2) DEFAULT 0,
    unit VARCHAR(50),
    due_date DATE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'achieved', 'missed')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_program_objectives_program ON program_objectives(program_id);

-- Program Metrics
CREATE TABLE program_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    metric_type VARCHAR(50) NOT NULL,
    value DECIMAL(14,4),
    previous_value DECIMAL(14,4),
    target_value DECIMAL(14,4),
    unit VARCHAR(50),
    period_start DATE,
    period_end DATE,
    calculated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_program_metrics_program ON program_metrics(program_id);
CREATE INDEX idx_program_metrics_period ON program_metrics(period_start, period_end);

-- Portfolios (groups of programs)
CREATE TABLE portfolios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    description TEXT,
    status program_status DEFAULT 'active',
    owner_id UUID REFERENCES users(id) ON DELETE SET NULL,
    budget_amount DECIMAL(14,2),
    budget_currency VARCHAR(3) DEFAULT 'USD',
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE(organization_id, slug)
);

CREATE INDEX idx_portfolios_organization ON portfolios(organization_id);

-- Portfolio Programs
CREATE TABLE portfolio_programs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    portfolio_id UUID NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
    program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
    position INTEGER DEFAULT 0,
    added_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(portfolio_id, program_id)
);

CREATE INDEX idx_portfolio_programs_portfolio ON portfolio_programs(portfolio_id);
CREATE INDEX idx_portfolio_programs_program ON portfolio_programs(program_id);

-- ============================================================================
-- FORECASTING TABLES
-- ============================================================================

-- Forecasts
CREATE TABLE forecasts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    forecast_type forecast_type NOT NULL,
    period_type forecast_period NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_forecasts_organization ON forecasts(organization_id);
CREATE INDEX idx_forecasts_type ON forecasts(forecast_type);
CREATE INDEX idx_forecasts_dates ON forecasts(start_date, end_date);

-- Forecast Periods
CREATE TABLE forecast_periods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    forecast_id UUID NOT NULL REFERENCES forecasts(id) ON DELETE CASCADE,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    planned_value DECIMAL(14,2),
    actual_value DECIMAL(14,2),
    variance DECIMAL(14,2) GENERATED ALWAYS AS (planned_value - COALESCE(actual_value, 0)) STORED,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_forecast_periods_forecast ON forecast_periods(forecast_id);
CREATE INDEX idx_forecast_periods_dates ON forecast_periods(period_start, period_end);

-- Forecast Items
CREATE TABLE forecast_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    forecast_period_id UUID NOT NULL REFERENCES forecast_periods(id) ON DELETE CASCADE,
    category_id UUID REFERENCES budget_categories(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    planned_value DECIMAL(14,2) NOT NULL,
    actual_value DECIMAL(14,2) DEFAULT 0,
    probability INTEGER DEFAULT 100 CHECK (probability BETWEEN 0 AND 100),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_forecast_items_period ON forecast_items(forecast_period_id);
CREATE INDEX idx_forecast_items_category ON forecast_items(category_id);

-- Forecast Scenarios
CREATE TABLE forecast_scenarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    forecast_id UUID NOT NULL REFERENCES forecasts(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    scenario_type scenario_type NOT NULL,
    description TEXT,
    assumptions JSONB DEFAULT '{}',
    adjustments JSONB DEFAULT '{}',
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_forecast_scenarios_forecast ON forecast_scenarios(forecast_id);
CREATE INDEX idx_forecast_scenarios_type ON forecast_scenarios(scenario_type);

-- Budget vs Actual
CREATE TABLE budget_vs_actual (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    budget_id UUID REFERENCES budgets(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    event_id UUID REFERENCES events(id) ON DELETE SET NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    category_id UUID REFERENCES budget_categories(id) ON DELETE SET NULL,
    budgeted_amount DECIMAL(14,2) NOT NULL,
    actual_amount DECIMAL(14,2) DEFAULT 0,
    committed_amount DECIMAL(14,2) DEFAULT 0,
    variance DECIMAL(14,2) GENERATED ALWAYS AS (budgeted_amount - actual_amount) STORED,
    variance_percent DECIMAL(5,2),
    notes TEXT,
    calculated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_budget_vs_actual_organization ON budget_vs_actual(organization_id);
CREATE INDEX idx_budget_vs_actual_budget ON budget_vs_actual(budget_id);
CREATE INDEX idx_budget_vs_actual_project ON budget_vs_actual(project_id);
CREATE INDEX idx_budget_vs_actual_period ON budget_vs_actual(period_start, period_end);

-- Resource Forecasts
CREATE TABLE resource_forecasts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    position_id UUID REFERENCES positions(id) ON DELETE SET NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    required_hours DECIMAL(10,2),
    available_hours DECIMAL(10,2),
    allocated_hours DECIMAL(10,2) DEFAULT 0,
    gap_hours DECIMAL(10,2) GENERATED ALWAYS AS (required_hours - allocated_hours) STORED,
    headcount_required INTEGER,
    headcount_available INTEGER,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_resource_forecasts_organization ON resource_forecasts(organization_id);
CREATE INDEX idx_resource_forecasts_project ON resource_forecasts(project_id);
CREATE INDEX idx_resource_forecasts_department ON resource_forecasts(department_id);
CREATE INDEX idx_resource_forecasts_period ON resource_forecasts(period_start, period_end);

-- Capacity Planning
CREATE TABLE capacity_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'archived')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_capacity_plans_organization ON capacity_plans(organization_id);
CREATE INDEX idx_capacity_plans_dates ON capacity_plans(start_date, end_date);

-- Capacity Plan Items
CREATE TABLE capacity_plan_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    capacity_plan_id UUID NOT NULL REFERENCES capacity_plans(id) ON DELETE CASCADE,
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    position_id UUID REFERENCES positions(id) ON DELETE SET NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    capacity_hours DECIMAL(10,2) NOT NULL,
    allocated_hours DECIMAL(10,2) DEFAULT 0,
    utilization_percent DECIMAL(5,2),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_capacity_plan_items_plan ON capacity_plan_items(capacity_plan_id);
CREATE INDEX idx_capacity_plan_items_user ON capacity_plan_items(user_id);
CREATE INDEX idx_capacity_plan_items_period ON capacity_plan_items(period_start, period_end);
