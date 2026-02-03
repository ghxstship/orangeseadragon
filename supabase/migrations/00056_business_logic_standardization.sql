-- Migration: Business Logic Standardization
-- Created: 2026-02-02
-- Description: Standardize approval workflows, audit trails, soft deletes, and status handling
-- Reference: docs/DATABASE_SCHEMA_OPTIMIZATION_ANALYSIS.md

-- ============================================================================
-- PHASE 1: ENHANCE EXISTING APPROVAL REQUESTS TABLE
-- Note: approval_requests already exists in 00009_workflows_documents.sql
-- We enhance it with additional columns for standardized approval workflow
-- ============================================================================

-- Add missing columns to existing approval_requests table
ALTER TABLE approval_requests 
    ADD COLUMN IF NOT EXISTS request_number VARCHAR(50),
    ADD COLUMN IF NOT EXISTS title VARCHAR(255),
    ADD COLUMN IF NOT EXISTS description TEXT,
    ADD COLUMN IF NOT EXISTS amount DECIMAL(14,2),
    ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT 'USD',
    ADD COLUMN IF NOT EXISTS approval_level INTEGER DEFAULT 1,
    ADD COLUMN IF NOT EXISTS required_approvers UUID[],
    ADD COLUMN IF NOT EXISTS approval_role VARCHAR(100),
    ADD COLUMN IF NOT EXISTS decided_by UUID REFERENCES users(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS decided_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS decision_notes TEXT,
    ADD COLUMN IF NOT EXISTS escalated_to UUID REFERENCES users(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS escalated_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS escalation_reason TEXT,
    ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- Create index for decided_by if column was added
CREATE INDEX IF NOT EXISTS idx_approval_requests_decided_by ON approval_requests(decided_by) 
    WHERE decided_by IS NOT NULL;

-- Approval history table (enhances approval_decisions from 00009)
-- Note: approval_decisions already exists, we create approval_history as additional tracking
CREATE TABLE IF NOT EXISTS approval_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    approval_request_id UUID NOT NULL REFERENCES approval_requests(id) ON DELETE CASCADE,
    
    action VARCHAR(20) NOT NULL CHECK (action IN ('approved', 'rejected', 'escalated', 'commented')),
    action_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action_at TIMESTAMPTZ DEFAULT NOW(),
    
    approval_level INTEGER,
    notes TEXT,
    
    -- For escalations
    escalated_to UUID REFERENCES users(id) ON DELETE SET NULL,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_approval_history_request ON approval_history(approval_request_id);
CREATE INDEX IF NOT EXISTS idx_approval_history_action_by ON approval_history(action_by);

-- ============================================================================
-- PHASE 2: COMPREHENSIVE AUDIT LOGGING
-- ============================================================================

-- Enhanced audit_logs table (if not exists or needs enhancement)
DO $$
BEGIN
    -- Add columns if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'audit_logs' AND column_name = 'ip_address') THEN
        ALTER TABLE audit_logs ADD COLUMN ip_address INET;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'audit_logs' AND column_name = 'user_agent') THEN
        ALTER TABLE audit_logs ADD COLUMN user_agent TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'audit_logs' AND column_name = 'session_id') THEN
        ALTER TABLE audit_logs ADD COLUMN session_id UUID;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'audit_logs' AND column_name = 'changes') THEN
        ALTER TABLE audit_logs ADD COLUMN changes JSONB;
    END IF;
END $$;

-- Generic audit trigger function
CREATE OR REPLACE FUNCTION audit_trigger_func()
RETURNS TRIGGER AS $$
DECLARE
    audit_org_id UUID;
    audit_user_id UUID;
    changes_json JSONB;
    old_json JSONB;
    new_json JSONB;
BEGIN
    -- Get organization_id from the record
    IF TG_OP = 'DELETE' THEN
        audit_org_id := OLD.organization_id;
    ELSE
        audit_org_id := NEW.organization_id;
    END IF;
    
    -- Get current user
    audit_user_id := auth.uid();
    
    -- Build changes JSON
    IF TG_OP = 'UPDATE' THEN
        old_json := to_jsonb(OLD);
        new_json := to_jsonb(NEW);
        -- Only include changed fields
        SELECT jsonb_object_agg(key, jsonb_build_object('old', old_json->key, 'new', new_json->key))
        INTO changes_json
        FROM jsonb_object_keys(new_json) AS key
        WHERE old_json->key IS DISTINCT FROM new_json->key
        AND key NOT IN ('updated_at', 'created_at');
    ELSIF TG_OP = 'INSERT' THEN
        changes_json := to_jsonb(NEW);
    ELSIF TG_OP = 'DELETE' THEN
        changes_json := to_jsonb(OLD);
    END IF;
    
    -- Insert audit log
    INSERT INTO audit_logs (
        organization_id,
        user_id,
        action,
        entity_type,
        entity_id,
        old_values,
        new_values,
        changes
    ) VALUES (
        audit_org_id,
        audit_user_id,
        TG_OP,
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN to_jsonb(OLD) ELSE NULL END,
        CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END,
        changes_json
    );
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply audit triggers to critical tables
DO $$
DECLARE
    critical_tables TEXT[] := ARRAY[
        'invoices', 'contracts', 'purchase_orders', 'expenses', 
        'payroll_runs', 'budgets', 'deals', 'proposals'
    ];
    tbl TEXT;
BEGIN
    FOREACH tbl IN ARRAY critical_tables
    LOOP
        -- Drop existing trigger if exists
        EXECUTE format('DROP TRIGGER IF EXISTS audit_%I ON %I', tbl, tbl);
        
        -- Create new trigger
        EXECUTE format(
            'CREATE TRIGGER audit_%I 
             AFTER INSERT OR UPDATE OR DELETE ON %I 
             FOR EACH ROW EXECUTE FUNCTION audit_trigger_func()',
            tbl, tbl
        );
    END LOOP;
END $$;

-- ============================================================================
-- PHASE 3: SOFT DELETE STANDARDIZATION
-- ============================================================================

-- Add deleted_at column to major entities that don't have it
DO $$
DECLARE
    tables_needing_soft_delete TEXT[] := ARRAY[
        'events', 'companies', 'contacts', 'deals', 'projects', 
        'tasks', 'invoices', 'expenses', 'assets', 'documents',
        'contracts', 'proposals', 'budgets', 'products', 'services'
    ];
    tbl TEXT;
BEGIN
    FOREACH tbl IN ARRAY tables_needing_soft_delete
    LOOP
        -- Check if table exists and column doesn't exist
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = tbl) THEN
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                          WHERE table_name = tbl AND column_name = 'deleted_at') THEN
                EXECUTE format('ALTER TABLE %I ADD COLUMN deleted_at TIMESTAMPTZ', tbl);
                EXECUTE format('CREATE INDEX IF NOT EXISTS idx_%I_deleted ON %I(deleted_at) WHERE deleted_at IS NULL', tbl, tbl);
            END IF;
            
            -- Add deleted_by if not exists
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                          WHERE table_name = tbl AND column_name = 'deleted_by') THEN
                EXECUTE format('ALTER TABLE %I ADD COLUMN deleted_by UUID REFERENCES users(id) ON DELETE SET NULL', tbl);
            END IF;
        END IF;
    END LOOP;
END $$;

-- Soft delete function
CREATE OR REPLACE FUNCTION soft_delete()
RETURNS TRIGGER AS $$
BEGIN
    -- Instead of deleting, set deleted_at
    NEW.deleted_at := NOW();
    NEW.deleted_by := auth.uid();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- View helper to filter soft-deleted records
CREATE OR REPLACE FUNCTION create_active_view(table_name TEXT)
RETURNS VOID AS $$
BEGIN
    EXECUTE format(
        'CREATE OR REPLACE VIEW %I_active AS SELECT * FROM %I WHERE deleted_at IS NULL',
        table_name, table_name
    );
END;
$$ LANGUAGE plpgsql;

-- Create active views for major entities
DO $$
DECLARE
    tables_with_soft_delete TEXT[] := ARRAY[
        'events', 'companies', 'contacts', 'deals', 'projects', 
        'tasks', 'invoices', 'expenses', 'assets', 'documents',
        'contracts', 'proposals', 'budgets'
    ];
    tbl TEXT;
BEGIN
    FOREACH tbl IN ARRAY tables_with_soft_delete
    LOOP
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = tbl) THEN
            IF EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = tbl AND column_name = 'deleted_at') THEN
                PERFORM create_active_view(tbl);
            END IF;
        END IF;
    END LOOP;
END $$;

-- ============================================================================
-- PHASE 4: STATUS TRACKING STANDARDIZATION
-- ============================================================================

-- Ensure statuses table has proper structure
ALTER TABLE statuses 
    ADD COLUMN IF NOT EXISTS icon VARCHAR(50),
    ADD COLUMN IF NOT EXISTS next_statuses TEXT[], -- Valid status transitions
    ADD COLUMN IF NOT EXISTS requires_approval BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS auto_transition_to VARCHAR(50),
    ADD COLUMN IF NOT EXISTS auto_transition_after INTERVAL;

-- Seed standard statuses for common domains
INSERT INTO statuses (organization_id, domain, code, name, color, is_default, is_terminal, sort_order)
SELECT 
    o.id,
    s.domain,
    s.code,
    s.name,
    s.color,
    s.is_default,
    s.is_terminal,
    s.sort_order
FROM organizations o
CROSS JOIN (VALUES
    -- Invoice statuses
    ('invoice', 'draft', 'Draft', '#6B7280', TRUE, FALSE, 1),
    ('invoice', 'sent', 'Sent', '#3B82F6', FALSE, FALSE, 2),
    ('invoice', 'viewed', 'Viewed', '#8B5CF6', FALSE, FALSE, 3),
    ('invoice', 'partial', 'Partially Paid', '#F59E0B', FALSE, FALSE, 4),
    ('invoice', 'paid', 'Paid', '#10B981', FALSE, TRUE, 5),
    ('invoice', 'overdue', 'Overdue', '#EF4444', FALSE, FALSE, 6),
    ('invoice', 'cancelled', 'Cancelled', '#6B7280', FALSE, TRUE, 7),
    
    -- Expense statuses
    ('expense', 'draft', 'Draft', '#6B7280', TRUE, FALSE, 1),
    ('expense', 'submitted', 'Submitted', '#3B82F6', FALSE, FALSE, 2),
    ('expense', 'approved', 'Approved', '#10B981', FALSE, FALSE, 3),
    ('expense', 'rejected', 'Rejected', '#EF4444', FALSE, TRUE, 4),
    ('expense', 'reimbursed', 'Reimbursed', '#10B981', FALSE, TRUE, 5),
    
    -- Project statuses
    ('project', 'planning', 'Planning', '#6B7280', TRUE, FALSE, 1),
    ('project', 'active', 'Active', '#3B82F6', FALSE, FALSE, 2),
    ('project', 'on_hold', 'On Hold', '#F59E0B', FALSE, FALSE, 3),
    ('project', 'completed', 'Completed', '#10B981', FALSE, TRUE, 4),
    ('project', 'cancelled', 'Cancelled', '#6B7280', FALSE, TRUE, 5),
    
    -- Task statuses
    ('task', 'todo', 'To Do', '#6B7280', TRUE, FALSE, 1),
    ('task', 'in_progress', 'In Progress', '#3B82F6', FALSE, FALSE, 2),
    ('task', 'review', 'In Review', '#8B5CF6', FALSE, FALSE, 3),
    ('task', 'done', 'Done', '#10B981', FALSE, TRUE, 4),
    ('task', 'blocked', 'Blocked', '#EF4444', FALSE, FALSE, 5)
) AS s(domain, code, name, color, is_default, is_terminal, sort_order)
WHERE NOT EXISTS (
    SELECT 1 FROM statuses st 
    WHERE st.organization_id = o.id 
    AND st.domain = s.domain 
    AND st.code = s.code
)
ON CONFLICT (organization_id, domain, code) DO NOTHING;

-- ============================================================================
-- PHASE 5: NUMBER SEQUENCE GENERATION
-- ============================================================================

-- Sequence table for auto-generating document numbers
CREATE TABLE IF NOT EXISTS number_sequences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    sequence_type VARCHAR(50) NOT NULL, -- 'invoice', 'purchase_order', 'expense', etc.
    prefix VARCHAR(20),
    suffix VARCHAR(20),
    current_value BIGINT DEFAULT 0,
    padding INTEGER DEFAULT 6,
    reset_frequency VARCHAR(20) CHECK (reset_frequency IN ('never', 'yearly', 'monthly')),
    last_reset_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, sequence_type)
);

CREATE INDEX idx_number_sequences_org ON number_sequences(organization_id);

-- Function to get next number in sequence
CREATE OR REPLACE FUNCTION get_next_sequence_number(
    p_organization_id UUID,
    p_sequence_type VARCHAR(50)
)
RETURNS VARCHAR AS $$
DECLARE
    v_sequence number_sequences%ROWTYPE;
    v_next_value BIGINT;
    v_result VARCHAR;
    v_year VARCHAR(4);
    v_month VARCHAR(2);
BEGIN
    -- Get or create sequence
    SELECT * INTO v_sequence
    FROM number_sequences
    WHERE organization_id = p_organization_id AND sequence_type = p_sequence_type
    FOR UPDATE;
    
    IF NOT FOUND THEN
        -- Create default sequence
        INSERT INTO number_sequences (organization_id, sequence_type, prefix, current_value, padding)
        VALUES (p_organization_id, p_sequence_type, UPPER(LEFT(p_sequence_type, 3)) || '-', 0, 6)
        RETURNING * INTO v_sequence;
    END IF;
    
    -- Check if reset needed
    IF v_sequence.reset_frequency = 'yearly' AND 
       (v_sequence.last_reset_at IS NULL OR EXTRACT(YEAR FROM v_sequence.last_reset_at) < EXTRACT(YEAR FROM NOW())) THEN
        v_sequence.current_value := 0;
        v_sequence.last_reset_at := NOW();
    ELSIF v_sequence.reset_frequency = 'monthly' AND 
          (v_sequence.last_reset_at IS NULL OR 
           DATE_TRUNC('month', v_sequence.last_reset_at) < DATE_TRUNC('month', NOW())) THEN
        v_sequence.current_value := 0;
        v_sequence.last_reset_at := NOW();
    END IF;
    
    -- Increment
    v_next_value := v_sequence.current_value + 1;
    
    -- Update sequence
    UPDATE number_sequences
    SET current_value = v_next_value,
        last_reset_at = COALESCE(v_sequence.last_reset_at, last_reset_at),
        updated_at = NOW()
    WHERE id = v_sequence.id;
    
    -- Build result
    v_year := TO_CHAR(NOW(), 'YYYY');
    v_month := TO_CHAR(NOW(), 'MM');
    
    v_result := COALESCE(v_sequence.prefix, '');
    
    IF v_sequence.reset_frequency = 'yearly' THEN
        v_result := v_result || v_year || '-';
    ELSIF v_sequence.reset_frequency = 'monthly' THEN
        v_result := v_result || v_year || v_month || '-';
    END IF;
    
    v_result := v_result || LPAD(v_next_value::TEXT, v_sequence.padding, '0');
    v_result := v_result || COALESCE(v_sequence.suffix, '');
    
    RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- PHASE 6: NOTIFICATION TRIGGERS
-- ============================================================================

-- Function to create notifications for approval requests
CREATE OR REPLACE FUNCTION notify_approval_request()
RETURNS TRIGGER AS $$
DECLARE
    v_approver UUID;
BEGIN
    -- Create notification for each required approver
    IF NEW.required_approvers IS NOT NULL THEN
        FOREACH v_approver IN ARRAY NEW.required_approvers
        LOOP
            INSERT INTO notifications (
                organization_id,
                user_id,
                notification_type,
                title,
                message,
                entity_type,
                entity_id,
                action_url
            ) VALUES (
                NEW.organization_id,
                v_approver,
                'approval_request',
                'Approval Required: ' || COALESCE(NEW.title, NEW.entity_type::TEXT),
                'A new ' || NEW.entity_type::TEXT || ' requires your approval.',
                'approval_request',
                NEW.id,
                '/approvals/' || NEW.id
            );
        END LOOP;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_notify_approval_request
    AFTER INSERT ON approval_requests
    FOR EACH ROW
    WHEN (NEW.status = 'pending')
    EXECUTE FUNCTION notify_approval_request();

-- Function to notify requester of approval decision
CREATE OR REPLACE FUNCTION notify_approval_decision()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status = 'pending' AND NEW.status IN ('approved', 'rejected') THEN
        INSERT INTO notifications (
            organization_id,
            user_id,
            notification_type,
            title,
            message,
            entity_type,
            entity_id
        ) VALUES (
            NEW.organization_id,
            NEW.requested_by,
            CASE NEW.status WHEN 'approved' THEN 'approval_approved' ELSE 'approval_rejected' END,
            CASE NEW.status 
                WHEN 'approved' THEN 'Approved: ' || COALESCE(NEW.title, NEW.entity_type::TEXT)
                ELSE 'Rejected: ' || COALESCE(NEW.title, NEW.entity_type::TEXT)
            END,
            'Your ' || NEW.entity_type::TEXT || ' has been ' || NEW.status || '.',
            'approval_request',
            NEW.id
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_notify_approval_decision
    AFTER UPDATE ON approval_requests
    FOR EACH ROW
    EXECUTE FUNCTION notify_approval_decision();

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

ALTER TABLE approval_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE number_sequences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "approval_requests_org_access" ON approval_requests 
    FOR ALL USING (is_organization_member(organization_id));

CREATE POLICY "approval_history_org_access" ON approval_history 
    FOR ALL USING (
        EXISTS (SELECT 1 FROM approval_requests ar 
                WHERE ar.id = approval_history.approval_request_id 
                AND is_organization_member(ar.organization_id))
    );

CREATE POLICY "number_sequences_org_access" ON number_sequences 
    FOR ALL USING (is_organization_member(organization_id));

-- ============================================================================
-- UPDATED_AT TRIGGERS
-- ============================================================================

CREATE TRIGGER trg_approval_requests_updated_at
    BEFORE UPDATE ON approval_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_number_sequences_updated_at
    BEFORE UPDATE ON number_sequences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE approval_requests IS 'Standardized approval workflow for all entity types';
COMMENT ON TABLE approval_history IS 'History of approval actions for audit trail';
COMMENT ON TABLE number_sequences IS 'Auto-incrementing number sequences for document numbering';
COMMENT ON FUNCTION get_next_sequence_number IS 'Generate next number in sequence with optional yearly/monthly reset';
COMMENT ON FUNCTION audit_trigger_func IS 'Generic audit trigger for tracking all changes to critical tables';
