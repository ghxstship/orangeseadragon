-- ============================================================================
-- Migration: Certification & Compliance Tracking
-- Description: Add certification types, employee certifications, and expiration alerts
-- ============================================================================

-- Create certification types table
CREATE TABLE IF NOT EXISTS certification_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100), -- 'safety', 'technical', 'legal', 'medical', 'equipment'
  validity_months INTEGER,
  is_required_for_hire BOOLEAN DEFAULT FALSE,
  required_for_positions UUID[], -- position_type_ids that require this cert
  required_for_departments UUID[], -- department_ids that require this cert
  renewal_reminder_days INTEGER DEFAULT 30,
  second_reminder_days INTEGER DEFAULT 7,
  allows_grace_period BOOLEAN DEFAULT FALSE,
  grace_period_days INTEGER DEFAULT 0,
  external_verification_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Create employee certifications table
CREATE TABLE IF NOT EXISTS employee_certifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES employee_profiles(id) ON DELETE CASCADE,
  certification_type_id UUID NOT NULL REFERENCES certification_types(id) ON DELETE CASCADE,
  certificate_number VARCHAR(100),
  issued_date DATE,
  expiry_date DATE,
  issuing_authority VARCHAR(255),
  issuing_location VARCHAR(255),
  document_url TEXT,
  document_name VARCHAR(255),
  status VARCHAR(20) DEFAULT 'active', -- 'pending', 'active', 'expired', 'revoked', 'renewal_pending'
  verified_by UUID REFERENCES auth.users(id),
  verified_at TIMESTAMPTZ,
  verification_notes TEXT,
  renewal_submitted_at TIMESTAMPTZ,
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create certification alerts table
CREATE TABLE IF NOT EXISTS certification_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES employee_profiles(id) ON DELETE CASCADE,
  certification_id UUID NOT NULL REFERENCES employee_certifications(id) ON DELETE CASCADE,
  certification_type_id UUID NOT NULL REFERENCES certification_types(id) ON DELETE CASCADE,
  alert_type VARCHAR(50) NOT NULL, -- 'expiring_soon', 'expired', 'missing_required', 'renewal_reminder'
  alert_date DATE NOT NULL,
  days_until_expiry INTEGER,
  is_acknowledged BOOLEAN DEFAULT FALSE,
  acknowledged_by UUID REFERENCES auth.users(id),
  acknowledged_at TIMESTAMPTZ,
  is_resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMPTZ,
  notification_sent BOOLEAN DEFAULT FALSE,
  notification_sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create certification renewal requests table
CREATE TABLE IF NOT EXISTS certification_renewals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES employee_profiles(id) ON DELETE CASCADE,
  certification_id UUID NOT NULL REFERENCES employee_certifications(id) ON DELETE CASCADE,
  new_certificate_number VARCHAR(100),
  new_issued_date DATE,
  new_expiry_date DATE,
  new_document_url TEXT,
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_certification_types_tenant ON certification_types(tenant_id);
CREATE INDEX IF NOT EXISTS idx_certification_types_category ON certification_types(category);
CREATE INDEX IF NOT EXISTS idx_employee_certifications_employee ON employee_certifications(employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_certifications_type ON employee_certifications(certification_type_id);
CREATE INDEX IF NOT EXISTS idx_employee_certifications_expiry ON employee_certifications(expiry_date);
CREATE INDEX IF NOT EXISTS idx_employee_certifications_status ON employee_certifications(status);
CREATE INDEX IF NOT EXISTS idx_certification_alerts_employee ON certification_alerts(employee_id);
CREATE INDEX IF NOT EXISTS idx_certification_alerts_unresolved ON certification_alerts(is_resolved) WHERE is_resolved = FALSE;
CREATE INDEX IF NOT EXISTS idx_certification_alerts_date ON certification_alerts(alert_date);

-- RLS policies
ALTER TABLE certification_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE certification_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE certification_renewals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view certification types for their tenant"
  ON certification_types FOR SELECT
  USING (tenant_id IN (SELECT tenant_id FROM user_tenants WHERE user_id = auth.uid()));

CREATE POLICY "Admins can manage certification types"
  ON certification_types FOR ALL
  USING (tenant_id IN (SELECT tenant_id FROM user_tenants WHERE user_id = auth.uid() AND role IN ('admin', 'owner')));

CREATE POLICY "Users can view their own certifications"
  ON employee_certifications FOR SELECT
  USING (
    tenant_id IN (SELECT tenant_id FROM user_tenants WHERE user_id = auth.uid())
    AND (
      employee_id IN (SELECT id FROM employee_profiles WHERE user_id = auth.uid())
      OR EXISTS (SELECT 1 FROM user_tenants WHERE user_id = auth.uid() AND role IN ('admin', 'owner', 'manager'))
    )
  );

CREATE POLICY "Users can manage their own certifications"
  ON employee_certifications FOR INSERT
  WITH CHECK (
    tenant_id IN (SELECT tenant_id FROM user_tenants WHERE user_id = auth.uid())
    AND employee_id IN (SELECT id FROM employee_profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Managers can update certifications"
  ON employee_certifications FOR UPDATE
  USING (tenant_id IN (SELECT tenant_id FROM user_tenants WHERE user_id = auth.uid() AND role IN ('admin', 'owner', 'manager')));

CREATE POLICY "Users can view their own alerts"
  ON certification_alerts FOR SELECT
  USING (
    tenant_id IN (SELECT tenant_id FROM user_tenants WHERE user_id = auth.uid())
    AND (
      employee_id IN (SELECT id FROM employee_profiles WHERE user_id = auth.uid())
      OR EXISTS (SELECT 1 FROM user_tenants WHERE user_id = auth.uid() AND role IN ('admin', 'owner', 'manager'))
    )
  );

CREATE POLICY "Users can view their own renewals"
  ON certification_renewals FOR SELECT
  USING (tenant_id IN (SELECT tenant_id FROM user_tenants WHERE user_id = auth.uid()));

CREATE POLICY "Users can submit renewals"
  ON certification_renewals FOR INSERT
  WITH CHECK (tenant_id IN (SELECT tenant_id FROM user_tenants WHERE user_id = auth.uid()));

-- Function to check and update certification status
CREATE OR REPLACE FUNCTION update_certification_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Update status based on expiry date
  IF NEW.expiry_date IS NOT NULL THEN
    IF NEW.expiry_date < CURRENT_DATE THEN
      NEW.status := 'expired';
    ELSIF NEW.expiry_date <= CURRENT_DATE + INTERVAL '30 days' THEN
      -- Keep as active but will trigger alerts
      NEW.status := COALESCE(NEW.status, 'active');
    ELSE
      NEW.status := 'active';
    END IF;
  END IF;
  
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_certification_status
  BEFORE INSERT OR UPDATE OF expiry_date ON employee_certifications
  FOR EACH ROW
  EXECUTE FUNCTION update_certification_status();

-- Function to generate certification alerts
CREATE OR REPLACE FUNCTION generate_certification_alerts()
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER := 0;
  v_cert RECORD;
  v_type RECORD;
BEGIN
  -- Find certifications expiring soon or expired
  FOR v_cert IN
    SELECT ec.*, ct.renewal_reminder_days, ct.second_reminder_days
    FROM employee_certifications ec
    JOIN certification_types ct ON ec.certification_type_id = ct.id
    WHERE ec.expiry_date IS NOT NULL
      AND ec.status NOT IN ('revoked')
      AND ec.expiry_date <= CURRENT_DATE + INTERVAL '60 days'
  LOOP
    -- Check if alert already exists for this certification and date
    IF NOT EXISTS (
      SELECT 1 FROM certification_alerts
      WHERE certification_id = v_cert.id
        AND alert_date = CURRENT_DATE
        AND is_resolved = FALSE
    ) THEN
      -- Determine alert type
      IF v_cert.expiry_date < CURRENT_DATE THEN
        INSERT INTO certification_alerts (
          tenant_id, employee_id, certification_id, certification_type_id,
          alert_type, alert_date, days_until_expiry
        )
        VALUES (
          v_cert.tenant_id, v_cert.employee_id, v_cert.id, v_cert.certification_type_id,
          'expired', CURRENT_DATE, v_cert.expiry_date - CURRENT_DATE
        );
        v_count := v_count + 1;
      ELSIF v_cert.expiry_date <= CURRENT_DATE + (v_cert.second_reminder_days || ' days')::INTERVAL THEN
        INSERT INTO certification_alerts (
          tenant_id, employee_id, certification_id, certification_type_id,
          alert_type, alert_date, days_until_expiry
        )
        VALUES (
          v_cert.tenant_id, v_cert.employee_id, v_cert.id, v_cert.certification_type_id,
          'expiring_soon', CURRENT_DATE, v_cert.expiry_date - CURRENT_DATE
        );
        v_count := v_count + 1;
      ELSIF v_cert.expiry_date <= CURRENT_DATE + (v_cert.renewal_reminder_days || ' days')::INTERVAL THEN
        INSERT INTO certification_alerts (
          tenant_id, employee_id, certification_id, certification_type_id,
          alert_type, alert_date, days_until_expiry
        )
        VALUES (
          v_cert.tenant_id, v_cert.employee_id, v_cert.id, v_cert.certification_type_id,
          'renewal_reminder', CURRENT_DATE, v_cert.expiry_date - CURRENT_DATE
        );
        v_count := v_count + 1;
      END IF;
    END IF;
  END LOOP;
  
  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if employee has required certifications
CREATE OR REPLACE FUNCTION check_employee_certifications(
  p_employee_id UUID,
  p_position_type_id UUID DEFAULT NULL
)
RETURNS TABLE(
  certification_type_id UUID,
  certification_name VARCHAR,
  is_valid BOOLEAN,
  expiry_date DATE,
  status VARCHAR
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ct.id as certification_type_id,
    ct.name as certification_name,
    CASE 
      WHEN ec.id IS NULL THEN FALSE
      WHEN ec.status = 'active' AND (ec.expiry_date IS NULL OR ec.expiry_date >= CURRENT_DATE) THEN TRUE
      ELSE FALSE
    END as is_valid,
    ec.expiry_date,
    COALESCE(ec.status, 'missing')::VARCHAR as status
  FROM certification_types ct
  LEFT JOIN employee_certifications ec ON ec.certification_type_id = ct.id 
    AND ec.employee_id = p_employee_id
    AND ec.status NOT IN ('revoked')
  WHERE ct.is_active = TRUE
    AND (
      ct.is_required_for_hire = TRUE
      OR (p_position_type_id IS NOT NULL AND p_position_type_id = ANY(ct.required_for_positions))
    )
  ORDER BY ct.name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert common certification types
INSERT INTO certification_types (tenant_id, name, description, category, validity_months, renewal_reminder_days)
SELECT 
  t.id,
  c.name,
  c.description,
  c.category,
  c.validity_months,
  c.renewal_reminder_days
FROM tenants t
CROSS JOIN (VALUES
  ('First Aid/CPR', 'Basic first aid and CPR certification', 'safety', 24, 60),
  ('OSHA 10-Hour', 'OSHA 10-hour safety training', 'safety', NULL, 30),
  ('OSHA 30-Hour', 'OSHA 30-hour safety training', 'safety', NULL, 30),
  ('Forklift Operator', 'Forklift operation certification', 'equipment', 36, 90),
  ('Rigging Certification', 'Rigging and load handling', 'technical', 36, 60),
  ('Electrical Safety', 'Electrical safety awareness', 'safety', 12, 30),
  ('Fall Protection', 'Fall protection and harness training', 'safety', 12, 30),
  ('Fire Safety', 'Fire extinguisher and evacuation training', 'safety', 12, 30),
  ('Food Handler', 'Food safety and handling certification', 'safety', 24, 60),
  ('Security License', 'State security guard license', 'legal', 12, 90)
) AS c(name, description, category, validity_months, renewal_reminder_days)
ON CONFLICT DO NOTHING;

COMMENT ON TABLE certification_types IS 'Types of certifications and licenses that can be tracked';
COMMENT ON TABLE employee_certifications IS 'Employee certification records with expiry tracking';
COMMENT ON TABLE certification_alerts IS 'Alerts for expiring or missing certifications';
COMMENT ON TABLE certification_renewals IS 'Certification renewal requests and approvals';
