-- ATLVS Platform Database Schema
-- Compliance, Reports & Insights Tables

-- ============================================================================
-- ADDITIONAL ENUMS
-- ============================================================================

CREATE TYPE policy_status AS ENUM ('draft', 'active', 'archived', 'superseded');
CREATE TYPE risk_level AS ENUM ('critical', 'high', 'medium', 'low', 'negligible');
CREATE TYPE risk_status AS ENUM ('identified', 'assessed', 'mitigating', 'accepted', 'closed');
CREATE TYPE audit_status AS ENUM ('scheduled', 'in_progress', 'completed', 'cancelled');
CREATE TYPE finding_severity AS ENUM ('critical', 'major', 'minor', 'observation');
CREATE TYPE report_status AS ENUM ('draft', 'scheduled', 'generating', 'completed', 'failed');
CREATE TYPE report_format AS ENUM ('pdf', 'excel', 'csv', 'json', 'html');
CREATE TYPE insight_type AS ENUM ('trend', 'anomaly', 'prediction', 'recommendation');
CREATE TYPE alert_severity AS ENUM ('critical', 'warning', 'info');

-- ============================================================================
-- COMPLIANCE TABLES
-- ============================================================================

-- Compliance Policies
CREATE TABLE compliance_policies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    description TEXT,
    policy_type VARCHAR(100) NOT NULL,
    status policy_status DEFAULT 'draft',
    version INTEGER DEFAULT 1,
    effective_date DATE,
    review_date DATE,
    content TEXT,
    document_url TEXT,
    owner_id UUID REFERENCES users(id) ON DELETE SET NULL,
    requires_acknowledgment BOOLEAN DEFAULT FALSE,
    acknowledgment_frequency_days INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE(organization_id, slug)
);

CREATE INDEX idx_compliance_policies_organization ON compliance_policies(organization_id);
CREATE INDEX idx_compliance_policies_status ON compliance_policies(status);
CREATE INDEX idx_compliance_policies_type ON compliance_policies(policy_type);

-- Policy Versions
CREATE TABLE policy_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    policy_id UUID NOT NULL REFERENCES compliance_policies(id) ON DELETE CASCADE,
    version INTEGER NOT NULL,
    content TEXT,
    change_summary TEXT,
    effective_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE(policy_id, version)
);

CREATE INDEX idx_policy_versions_policy ON policy_versions(policy_id);

-- Policy Acknowledgments
CREATE TABLE policy_acknowledgments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    policy_id UUID NOT NULL REFERENCES compliance_policies(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    version INTEGER NOT NULL,
    acknowledged_at TIMESTAMPTZ DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT,
    expires_at TIMESTAMPTZ,
    UNIQUE(policy_id, user_id, version)
);

CREATE INDEX idx_policy_acknowledgments_policy ON policy_acknowledgments(policy_id);
CREATE INDEX idx_policy_acknowledgments_user ON policy_acknowledgments(user_id);

-- Risk Assessments
CREATE TABLE risk_assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    event_id UUID REFERENCES events(id) ON DELETE SET NULL,
    assessment_date DATE NOT NULL,
    next_review_date DATE,
    status risk_status DEFAULT 'identified',
    overall_risk_level risk_level,
    assessor_id UUID REFERENCES users(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_risk_assessments_organization ON risk_assessments(organization_id);
CREATE INDEX idx_risk_assessments_project ON risk_assessments(project_id);
CREATE INDEX idx_risk_assessments_event ON risk_assessments(event_id);
CREATE INDEX idx_risk_assessments_status ON risk_assessments(status);

-- Risk Items
CREATE TABLE risk_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assessment_id UUID NOT NULL REFERENCES risk_assessments(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    likelihood INTEGER CHECK (likelihood BETWEEN 1 AND 5),
    impact INTEGER CHECK (impact BETWEEN 1 AND 5),
    risk_score INTEGER GENERATED ALWAYS AS (likelihood * impact) STORED,
    risk_level risk_level,
    status risk_status DEFAULT 'identified',
    owner_id UUID REFERENCES users(id) ON DELETE SET NULL,
    mitigation_plan TEXT,
    contingency_plan TEXT,
    residual_likelihood INTEGER CHECK (residual_likelihood BETWEEN 1 AND 5),
    residual_impact INTEGER CHECK (residual_impact BETWEEN 1 AND 5),
    due_date DATE,
    closed_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_risk_items_assessment ON risk_items(assessment_id);
CREATE INDEX idx_risk_items_status ON risk_items(status);
CREATE INDEX idx_risk_items_level ON risk_items(risk_level);

-- Risk Mitigations
CREATE TABLE risk_mitigations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    risk_item_id UUID NOT NULL REFERENCES risk_items(id) ON DELETE CASCADE,
    action VARCHAR(255) NOT NULL,
    description TEXT,
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    due_date DATE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
    completed_at TIMESTAMPTZ,
    effectiveness VARCHAR(20) CHECK (effectiveness IN ('effective', 'partially_effective', 'ineffective')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_risk_mitigations_risk ON risk_mitigations(risk_item_id);
CREATE INDEX idx_risk_mitigations_assigned ON risk_mitigations(assigned_to);
CREATE INDEX idx_risk_mitigations_status ON risk_mitigations(status);

-- Audit Schedules
CREATE TABLE audit_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    audit_type VARCHAR(100) NOT NULL,
    scope TEXT,
    scheduled_date DATE NOT NULL,
    status audit_status DEFAULT 'scheduled',
    lead_auditor_id UUID REFERENCES users(id) ON DELETE SET NULL,
    auditors UUID[],
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_schedules_organization ON audit_schedules(organization_id);
CREATE INDEX idx_audit_schedules_date ON audit_schedules(scheduled_date);
CREATE INDEX idx_audit_schedules_status ON audit_schedules(status);

-- Audit Findings
CREATE TABLE audit_findings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    audit_id UUID NOT NULL REFERENCES audit_schedules(id) ON DELETE CASCADE,
    finding_number VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    severity finding_severity NOT NULL,
    category VARCHAR(100),
    evidence TEXT,
    recommendation TEXT,
    management_response TEXT,
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    due_date DATE,
    status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed', 'accepted')),
    resolved_at TIMESTAMPTZ,
    verified_at TIMESTAMPTZ,
    verified_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_findings_audit ON audit_findings(audit_id);
CREATE INDEX idx_audit_findings_severity ON audit_findings(severity);
CREATE INDEX idx_audit_findings_status ON audit_findings(status);

-- Incidents (compliance/security)
CREATE TABLE compliance_incidents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    incident_number VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    incident_type VARCHAR(100) NOT NULL,
    severity finding_severity NOT NULL,
    occurred_at TIMESTAMPTZ NOT NULL,
    discovered_at TIMESTAMPTZ,
    reported_at TIMESTAMPTZ DEFAULT NOW(),
    reported_by UUID REFERENCES users(id) ON DELETE SET NULL,
    affected_systems TEXT[],
    affected_data TEXT,
    root_cause TEXT,
    immediate_actions TEXT,
    corrective_actions TEXT,
    preventive_actions TEXT,
    status VARCHAR(20) DEFAULT 'reported' CHECK (status IN ('reported', 'investigating', 'contained', 'resolved', 'closed')),
    resolved_at TIMESTAMPTZ,
    lessons_learned TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, incident_number)
);

CREATE INDEX idx_compliance_incidents_organization ON compliance_incidents(organization_id);
CREATE INDEX idx_compliance_incidents_type ON compliance_incidents(incident_type);
CREATE INDEX idx_compliance_incidents_severity ON compliance_incidents(severity);
CREATE INDEX idx_compliance_incidents_status ON compliance_incidents(status);

-- Training Materials
CREATE TABLE training_materials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    description TEXT,
    material_type VARCHAR(50) NOT NULL,
    content TEXT,
    content_url TEXT,
    duration_minutes INTEGER,
    is_required BOOLEAN DEFAULT FALSE,
    departments UUID[],
    positions UUID[],
    passing_score INTEGER DEFAULT 80,
    validity_months INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE(organization_id, slug)
);

CREATE INDEX idx_training_materials_organization ON training_materials(organization_id);
CREATE INDEX idx_training_materials_type ON training_materials(material_type);

-- Training Completions
CREATE TABLE training_completions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    training_material_id UUID NOT NULL REFERENCES training_materials(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    score INTEGER,
    passed BOOLEAN,
    attempts INTEGER DEFAULT 1,
    expires_at TIMESTAMPTZ,
    certificate_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_training_completions_material ON training_completions(training_material_id);
CREATE INDEX idx_training_completions_user ON training_completions(user_id);
CREATE INDEX idx_training_completions_expiring ON training_completions(expires_at) WHERE expires_at IS NOT NULL;

-- ============================================================================
-- REPORTS TABLES
-- ============================================================================

-- Report Definitions
CREATE TABLE report_definitions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    report_type VARCHAR(100) NOT NULL,
    query_config JSONB NOT NULL,
    columns JSONB DEFAULT '[]',
    filters JSONB DEFAULT '[]',
    grouping JSONB DEFAULT '[]',
    sorting JSONB DEFAULT '[]',
    visualizations JSONB DEFAULT '[]',
    default_format report_format DEFAULT 'pdf',
    is_system BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE(organization_id, slug)
);

CREATE INDEX idx_report_definitions_organization ON report_definitions(organization_id);
CREATE INDEX idx_report_definitions_category ON report_definitions(category);
CREATE INDEX idx_report_definitions_type ON report_definitions(report_type);

-- Report Schedules
CREATE TABLE report_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_definition_id UUID NOT NULL REFERENCES report_definitions(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    schedule_cron VARCHAR(100) NOT NULL,
    timezone VARCHAR(50) DEFAULT 'UTC',
    format report_format DEFAULT 'pdf',
    filters JSONB DEFAULT '{}',
    recipients JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT TRUE,
    last_run_at TIMESTAMPTZ,
    next_run_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_report_schedules_definition ON report_schedules(report_definition_id);
CREATE INDEX idx_report_schedules_next_run ON report_schedules(next_run_at) WHERE is_active = TRUE;

-- Report Exports
CREATE TABLE report_exports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    report_definition_id UUID REFERENCES report_definitions(id) ON DELETE SET NULL,
    schedule_id UUID REFERENCES report_schedules(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    status report_status DEFAULT 'generating',
    format report_format NOT NULL,
    filters JSONB DEFAULT '{}',
    file_url TEXT,
    file_size INTEGER,
    row_count INTEGER,
    error_message TEXT,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_report_exports_organization ON report_exports(organization_id);
CREATE INDEX idx_report_exports_definition ON report_exports(report_definition_id);
CREATE INDEX idx_report_exports_status ON report_exports(status);
CREATE INDEX idx_report_exports_expires ON report_exports(expires_at) WHERE expires_at IS NOT NULL;

-- Report Subscriptions
CREATE TABLE report_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_schedule_id UUID NOT NULL REFERENCES report_schedules(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    delivery_method VARCHAR(20) DEFAULT 'email' CHECK (delivery_method IN ('email', 'slack', 'webhook')),
    delivery_config JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(report_schedule_id, user_id)
);

CREATE INDEX idx_report_subscriptions_schedule ON report_subscriptions(report_schedule_id);
CREATE INDEX idx_report_subscriptions_user ON report_subscriptions(user_id);

-- Saved Reports (user favorites)
CREATE TABLE saved_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    report_definition_id UUID NOT NULL REFERENCES report_definitions(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    filters JSONB DEFAULT '{}',
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_saved_reports_user ON saved_reports(user_id);
CREATE INDEX idx_saved_reports_definition ON saved_reports(report_definition_id);

-- ============================================================================
-- INSIGHTS & ANALYTICS TABLES
-- ============================================================================

-- Insight Reports
CREATE TABLE insight_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    insight_type insight_type NOT NULL,
    category VARCHAR(100),
    title VARCHAR(255) NOT NULL,
    summary TEXT,
    details JSONB DEFAULT '{}',
    data_points JSONB DEFAULT '[]',
    confidence_score DECIMAL(5,2),
    impact_score DECIMAL(5,2),
    entity_type VARCHAR(50),
    entity_id UUID,
    is_actionable BOOLEAN DEFAULT FALSE,
    is_dismissed BOOLEAN DEFAULT FALSE,
    dismissed_at TIMESTAMPTZ,
    dismissed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    generated_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_insight_reports_organization ON insight_reports(organization_id);
CREATE INDEX idx_insight_reports_type ON insight_reports(insight_type);
CREATE INDEX idx_insight_reports_category ON insight_reports(category);
CREATE INDEX idx_insight_reports_entity ON insight_reports(entity_type, entity_id);
CREATE INDEX idx_insight_reports_active ON insight_reports(organization_id, is_dismissed) WHERE is_dismissed = FALSE;

-- Anomaly Alerts
CREATE TABLE anomaly_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    alert_type VARCHAR(100) NOT NULL,
    severity alert_severity NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    metric_name VARCHAR(100),
    expected_value DECIMAL(14,4),
    actual_value DECIMAL(14,4),
    deviation_percent DECIMAL(10,2),
    entity_type VARCHAR(50),
    entity_id UUID,
    detected_at TIMESTAMPTZ DEFAULT NOW(),
    acknowledged_at TIMESTAMPTZ,
    acknowledged_by UUID REFERENCES users(id) ON DELETE SET NULL,
    resolved_at TIMESTAMPTZ,
    resolution_notes TEXT,
    is_false_positive BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_anomaly_alerts_organization ON anomaly_alerts(organization_id);
CREATE INDEX idx_anomaly_alerts_type ON anomaly_alerts(alert_type);
CREATE INDEX idx_anomaly_alerts_severity ON anomaly_alerts(severity);
CREATE INDEX idx_anomaly_alerts_unacknowledged ON anomaly_alerts(organization_id, acknowledged_at) WHERE acknowledged_at IS NULL;

-- Predictions
CREATE TABLE predictions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    prediction_type VARCHAR(100) NOT NULL,
    category VARCHAR(100),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    predicted_value DECIMAL(14,4),
    predicted_date DATE,
    confidence_interval_low DECIMAL(14,4),
    confidence_interval_high DECIMAL(14,4),
    confidence_score DECIMAL(5,2),
    model_version VARCHAR(50),
    input_data JSONB DEFAULT '{}',
    entity_type VARCHAR(50),
    entity_id UUID,
    actual_value DECIMAL(14,4),
    accuracy_score DECIMAL(5,2),
    generated_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_predictions_organization ON predictions(organization_id);
CREATE INDEX idx_predictions_type ON predictions(prediction_type);
CREATE INDEX idx_predictions_entity ON predictions(entity_type, entity_id);
CREATE INDEX idx_predictions_date ON predictions(predicted_date);

-- Recommendations
CREATE TABLE recommendations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    recommendation_type VARCHAR(100) NOT NULL,
    category VARCHAR(100),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    rationale TEXT,
    expected_impact TEXT,
    effort_level VARCHAR(20) CHECK (effort_level IN ('low', 'medium', 'high')),
    priority priority_level DEFAULT 'medium',
    entity_type VARCHAR(50),
    entity_id UUID,
    action_items JSONB DEFAULT '[]',
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'implemented', 'dismissed')),
    accepted_at TIMESTAMPTZ,
    accepted_by UUID REFERENCES users(id) ON DELETE SET NULL,
    implemented_at TIMESTAMPTZ,
    outcome_notes TEXT,
    generated_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_recommendations_organization ON recommendations(organization_id);
CREATE INDEX idx_recommendations_type ON recommendations(recommendation_type);
CREATE INDEX idx_recommendations_status ON recommendations(status);
CREATE INDEX idx_recommendations_entity ON recommendations(entity_type, entity_id);

-- Dashboard Widgets
CREATE TABLE dashboard_widgets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    description TEXT,
    widget_type VARCHAR(50) NOT NULL,
    config JSONB NOT NULL,
    data_source VARCHAR(100),
    refresh_interval_seconds INTEGER DEFAULT 300,
    is_system BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE(organization_id, slug)
);

CREATE INDEX idx_dashboard_widgets_organization ON dashboard_widgets(organization_id);
CREATE INDEX idx_dashboard_widgets_type ON dashboard_widgets(widget_type);

-- User Dashboards
CREATE TABLE user_dashboards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    description TEXT,
    layout JSONB DEFAULT '[]',
    is_default BOOLEAN DEFAULT FALSE,
    is_shared BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, slug)
);

CREATE INDEX idx_user_dashboards_user ON user_dashboards(user_id);
CREATE INDEX idx_user_dashboards_organization ON user_dashboards(organization_id);

-- Dashboard Widget Instances
CREATE TABLE dashboard_widget_instances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dashboard_id UUID NOT NULL REFERENCES user_dashboards(id) ON DELETE CASCADE,
    widget_id UUID NOT NULL REFERENCES dashboard_widgets(id) ON DELETE CASCADE,
    position_x INTEGER DEFAULT 0,
    position_y INTEGER DEFAULT 0,
    width INTEGER DEFAULT 1,
    height INTEGER DEFAULT 1,
    config_overrides JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_dashboard_widget_instances_dashboard ON dashboard_widget_instances(dashboard_id);
CREATE INDEX idx_dashboard_widget_instances_widget ON dashboard_widget_instances(widget_id);
