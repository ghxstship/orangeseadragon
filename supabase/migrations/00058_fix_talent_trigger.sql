-- ============================================================================
-- FIX TRIGGERS WITH INCORRECT COLUMN NAMES
-- Updates triggers to use correct column names from actual schema
-- ============================================================================

-- Fix invoice trigger: use amount_paid instead of paid_amount
CREATE OR REPLACE FUNCTION sync_invoice_to_registry() RETURNS TRIGGER AS $$
DECLARE
    v_company_name VARCHAR(255);
BEGIN
    IF TG_OP = 'DELETE' THEN
        PERFORM delete_document_registry_for_entity('invoice', OLD.id);
        RETURN OLD;
    END IF;
    
    -- Get company name
    SELECT name INTO v_company_name FROM companies WHERE id = NEW.company_id;
    
    PERFORM upsert_document_registry(
        p_organization_id := NEW.organization_id,
        p_document_type := 'invoice',
        p_document_category := 'financial',
        p_entity_type := 'invoice',
        p_entity_id := NEW.id,
        p_title := 'Invoice ' || NEW.invoice_number,
        p_description := NEW.direction::TEXT || ' invoice for ' || COALESCE(v_company_name, 'client'),
        p_status := NEW.status::TEXT,
        p_expires_at := NEW.due_date::TIMESTAMPTZ,
        p_project_id := NEW.project_id,
        p_event_id := NEW.event_id,
        p_company_id := NEW.company_id,
        p_visibility := 'team',
        p_uploaded_by := NEW.created_by,
        p_metadata := jsonb_build_object(
            'invoice_number', NEW.invoice_number,
            'direction', NEW.direction,
            'total_amount', NEW.total_amount,
            'currency', NEW.currency,
            'amount_paid', NEW.amount_paid
        )
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Fix talent trigger: use correct column names
CREATE OR REPLACE FUNCTION sync_talent_to_directory()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        DELETE FROM people_directory 
        WHERE entity_type = 'talent' AND entity_id = OLD.id;
        RETURN OLD;
    END IF;
    
    PERFORM upsert_people_directory(
        p_organization_id := NEW.organization_id,
        p_person_type := 'talent',
        p_entity_type := 'talent',
        p_entity_id := NEW.id,
        p_full_name := NEW.name,
        p_display_name := NEW.name,
        p_email := NEW.email,
        p_phone := NEW.phone,
        p_bio := NEW.bio,
        p_website_url := NEW.website,
        p_is_internal := FALSE,
        p_is_active := COALESCE(NEW.is_active, TRUE),
        p_visibility := 'team',
        p_metadata := jsonb_build_object(
            'talent_type', NEW.talent_type,
            'genres', NEW.genres,
            'booking_status', NEW.booking_status,
            'base_fee', NEW.base_fee,
            'fee_currency', NEW.fee_currency
        )
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
