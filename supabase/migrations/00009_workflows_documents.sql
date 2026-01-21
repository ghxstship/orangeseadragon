-- ATLVS Platform Database Schema
-- Workflows & Documents Tables

-- ============================================================================
-- WORKFLOW ENGINE TABLES
-- ============================================================================

-- Workflow Templates (organization_id is NULL for system-wide templates)
CREATE TABLE workflow_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    entity_type VARCHAR(50),
    trigger_type workflow_trigger_type NOT NULL,
    trigger_config JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    is_system BOOLEAN DEFAULT FALSE,
    version INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_workflow_templates_organization ON workflow_templates(organization_id);
CREATE INDEX idx_workflow_templates_entity ON workflow_templates(entity_type);
CREATE INDEX idx_workflow_templates_trigger ON workflow_templates(trigger_type);
CREATE INDEX idx_workflow_templates_active ON workflow_templates(organization_id, is_active) WHERE is_active = TRUE;
-- Unique slug per organization (for org-specific templates)
CREATE UNIQUE INDEX idx_workflow_templates_org_slug ON workflow_templates(organization_id, slug) WHERE organization_id IS NOT NULL;
-- Unique slug for system templates (where organization_id IS NULL)
CREATE UNIQUE INDEX idx_workflow_templates_system_slug ON workflow_templates(slug) WHERE organization_id IS NULL;

-- Workflow Steps
CREATE TABLE workflow_steps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workflow_template_id UUID NOT NULL REFERENCES workflow_templates(id) ON DELETE CASCADE,
    position INTEGER NOT NULL,
    name VARCHAR(255) NOT NULL,
    step_type VARCHAR(50) NOT NULL,
    config JSONB DEFAULT '{}',
    conditions JSONB DEFAULT '[]',
    on_success_step_id UUID REFERENCES workflow_steps(id) ON DELETE SET NULL,
    on_failure_step_id UUID REFERENCES workflow_steps(id) ON DELETE SET NULL,
    timeout_seconds INTEGER,
    retry_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_workflow_steps_template ON workflow_steps(workflow_template_id);
CREATE INDEX idx_workflow_steps_position ON workflow_steps(workflow_template_id, position);

-- Workflow Runs
CREATE TABLE workflow_runs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    workflow_template_id UUID NOT NULL REFERENCES workflow_templates(id) ON DELETE CASCADE,
    entity_type VARCHAR(50),
    entity_id UUID,
    status workflow_run_status DEFAULT 'pending',
    trigger_data JSONB DEFAULT '{}',
    context JSONB DEFAULT '{}',
    current_step_id UUID REFERENCES workflow_steps(id) ON DELETE SET NULL,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    triggered_by UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_workflow_runs_organization ON workflow_runs(organization_id);
CREATE INDEX idx_workflow_runs_template ON workflow_runs(workflow_template_id);
CREATE INDEX idx_workflow_runs_entity ON workflow_runs(entity_type, entity_id);
CREATE INDEX idx_workflow_runs_status ON workflow_runs(status);
CREATE INDEX idx_workflow_runs_created ON workflow_runs(created_at);

-- Workflow Step Executions
CREATE TABLE workflow_step_executions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workflow_run_id UUID NOT NULL REFERENCES workflow_runs(id) ON DELETE CASCADE,
    workflow_step_id UUID NOT NULL REFERENCES workflow_steps(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'skipped')),
    input_data JSONB DEFAULT '{}',
    output_data JSONB DEFAULT '{}',
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_workflow_step_executions_run ON workflow_step_executions(workflow_run_id);
CREATE INDEX idx_workflow_step_executions_step ON workflow_step_executions(workflow_step_id);
CREATE INDEX idx_workflow_step_executions_status ON workflow_step_executions(status);

-- Approval Workflows
CREATE TABLE approval_workflows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    description TEXT,
    entity_type VARCHAR(50) NOT NULL,
    approval_type approval_workflow_type NOT NULL,
    config JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE(organization_id, slug)
);

CREATE INDEX idx_approval_workflows_organization ON approval_workflows(organization_id);
CREATE INDEX idx_approval_workflows_entity ON approval_workflows(entity_type);
CREATE INDEX idx_approval_workflows_active ON approval_workflows(organization_id, is_active) WHERE is_active = TRUE;

-- Approval Requests
CREATE TABLE approval_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    approval_workflow_id UUID NOT NULL REFERENCES approval_workflows(id) ON DELETE CASCADE,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    status approval_request_status DEFAULT 'pending',
    requested_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    requested_at TIMESTAMPTZ DEFAULT NOW(),
    current_step INTEGER DEFAULT 1,
    total_steps INTEGER DEFAULT 1,
    due_date TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_approval_requests_organization ON approval_requests(organization_id);
CREATE INDEX idx_approval_requests_workflow ON approval_requests(approval_workflow_id);
CREATE INDEX idx_approval_requests_entity ON approval_requests(entity_type, entity_id);
CREATE INDEX idx_approval_requests_status ON approval_requests(status);
CREATE INDEX idx_approval_requests_requested_by ON approval_requests(requested_by);
CREATE INDEX idx_approval_requests_pending ON approval_requests(organization_id, status) WHERE status = 'pending';

-- Approval Decisions
CREATE TABLE approval_decisions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    approval_request_id UUID NOT NULL REFERENCES approval_requests(id) ON DELETE CASCADE,
    step_number INTEGER NOT NULL,
    approver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    decision VARCHAR(20) NOT NULL CHECK (decision IN ('approved', 'rejected', 'delegated')),
    comments TEXT,
    delegated_to UUID REFERENCES users(id) ON DELETE SET NULL,
    decided_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_approval_decisions_request ON approval_decisions(approval_request_id);
CREATE INDEX idx_approval_decisions_approver ON approval_decisions(approver_id);
CREATE INDEX idx_approval_decisions_decided ON approval_decisions(decided_at);

-- ============================================================================
-- DOCUMENT MANAGEMENT TABLES
-- ============================================================================

-- Document Folders
CREATE TABLE document_folders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES document_folders(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    description TEXT,
    color VARCHAR(7),
    icon VARCHAR(50),
    path TEXT,
    is_system BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_document_folders_organization ON document_folders(organization_id);
CREATE INDEX idx_document_folders_parent ON document_folders(parent_id);
CREATE INDEX idx_document_folders_path ON document_folders(path);

-- Documents
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    folder_id UUID REFERENCES document_folders(id) ON DELETE SET NULL,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    event_id UUID REFERENCES events(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    document_type document_type DEFAULT 'document',
    status document_status DEFAULT 'draft',
    content TEXT,
    content_format VARCHAR(20) DEFAULT 'markdown',
    summary TEXT,
    cover_image_url TEXT,
    visibility visibility_type DEFAULT 'team',
    version INTEGER DEFAULT 1,
    word_count INTEGER DEFAULT 0,
    reading_time_minutes INTEGER DEFAULT 0,
    is_template BOOLEAN DEFAULT FALSE,
    template_id UUID REFERENCES documents(id) ON DELETE SET NULL,
    published_at TIMESTAMPTZ,
    archived_at TIMESTAMPTZ,
    tags TEXT[],
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    last_edited_by UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_documents_organization ON documents(organization_id);
CREATE INDEX idx_documents_folder ON documents(folder_id);
CREATE INDEX idx_documents_project ON documents(project_id);
CREATE INDEX idx_documents_event ON documents(event_id);
CREATE INDEX idx_documents_type ON documents(document_type);
CREATE INDEX idx_documents_status ON documents(status);
CREATE INDEX idx_documents_tags ON documents USING GIN(tags);
CREATE INDEX idx_documents_search ON documents USING GIN(to_tsvector('english', title || ' ' || COALESCE(content, '')));

-- Document Versions
CREATE TABLE document_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    version INTEGER NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    change_summary TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE(document_id, version)
);

CREATE INDEX idx_document_versions_document ON document_versions(document_id);
CREATE INDEX idx_document_versions_version ON document_versions(document_id, version);

-- Document Comments
CREATE TABLE document_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES document_comments(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    selection_start INTEGER,
    selection_end INTEGER,
    is_resolved BOOLEAN DEFAULT FALSE,
    resolved_at TIMESTAMPTZ,
    resolved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_document_comments_document ON document_comments(document_id);
CREATE INDEX idx_document_comments_parent ON document_comments(parent_id);
CREATE INDEX idx_document_comments_user ON document_comments(user_id);
CREATE INDEX idx_document_comments_unresolved ON document_comments(document_id, is_resolved) WHERE is_resolved = FALSE;

-- Document Shares
CREATE TABLE document_shares (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    shared_with_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    shared_with_email VARCHAR(255),
    permission VARCHAR(20) DEFAULT 'view' CHECK (permission IN ('view', 'comment', 'edit')),
    share_token VARCHAR(100),
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_document_shares_document ON document_shares(document_id);
CREATE INDEX idx_document_shares_user ON document_shares(shared_with_user_id);
CREATE INDEX idx_document_shares_token ON document_shares(share_token);

-- ============================================================================
-- CUSTOM FIELDS TABLES
-- ============================================================================

-- Custom Field Definitions
CREATE TABLE custom_field_definitions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    entity_type VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    description TEXT,
    field_type VARCHAR(50) NOT NULL,
    is_required BOOLEAN DEFAULT FALSE,
    is_searchable BOOLEAN DEFAULT FALSE,
    is_filterable BOOLEAN DEFAULT FALSE,
    default_value JSONB,
    options JSONB,
    validation_rules JSONB DEFAULT '{}',
    position INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, entity_type, slug)
);

CREATE INDEX idx_custom_field_definitions_organization ON custom_field_definitions(organization_id);
CREATE INDEX idx_custom_field_definitions_entity ON custom_field_definitions(entity_type);
CREATE INDEX idx_custom_field_definitions_active ON custom_field_definitions(organization_id, entity_type, is_active) WHERE is_active = TRUE;

-- Custom Field Values
CREATE TABLE custom_field_values (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    field_definition_id UUID NOT NULL REFERENCES custom_field_definitions(id) ON DELETE CASCADE,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    value JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(field_definition_id, entity_id)
);

CREATE INDEX idx_custom_field_values_organization ON custom_field_values(organization_id);
CREATE INDEX idx_custom_field_values_definition ON custom_field_values(field_definition_id);
CREATE INDEX idx_custom_field_values_entity ON custom_field_values(entity_type, entity_id);
CREATE INDEX idx_custom_field_values_value ON custom_field_values USING GIN(value);

-- ============================================================================
-- TAGS & LABELS TABLES
-- ============================================================================

-- Tags
CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    color VARCHAR(7),
    description TEXT,
    entity_types TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, slug)
);

CREATE INDEX idx_tags_organization ON tags(organization_id);
CREATE INDEX idx_tags_entity_types ON tags USING GIN(entity_types);

-- Entity Tags
CREATE TABLE entity_tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE(tag_id, entity_type, entity_id)
);

CREATE INDEX idx_entity_tags_tag ON entity_tags(tag_id);
CREATE INDEX idx_entity_tags_entity ON entity_tags(entity_type, entity_id);
