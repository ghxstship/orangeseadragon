-- Security Advisor remediation (enterprise baseline)
-- Addresses common Supabase findings:
-- 1) "Policy Exists RLS Disabled"
-- 2) "Exposed Auth Users" via views
-- 3) "Security Definer View"

-- ----------------------------------------------------------------------------
-- 1) Enable RLS on any public table that already has policies but RLS disabled
-- ----------------------------------------------------------------------------
DO $$
DECLARE
  table_record RECORD;
BEGIN
  FOR table_record IN
    SELECT DISTINCT
      n.nspname AS schema_name,
      c.relname AS table_name
    FROM pg_policy p
    JOIN pg_class c ON c.oid = p.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relkind = 'r'
      AND NOT c.relrowsecurity
  LOOP
    EXECUTE format(
      'ALTER TABLE %I.%I ENABLE ROW LEVEL SECURITY;',
      table_record.schema_name,
      table_record.table_name
    );
  END LOOP;
END $$;

-- Explicitly harden compliance_policies (visible advisor finding)
ALTER TABLE IF EXISTS public.compliance_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.compliance_policies FORCE ROW LEVEL SECURITY;

DO $$
DECLARE
  org_col TEXT;
BEGIN
  IF to_regclass('public.compliance_policies') IS NULL THEN
    RETURN;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'compliance_policies'
      AND column_name = 'org_id'
  ) THEN
    org_col := 'org_id';
  ELSE
    org_col := 'organization_id';
  END IF;

  EXECUTE 'DROP POLICY IF EXISTS compliance_policies_org_read ON public.compliance_policies';
  EXECUTE format(
    'CREATE POLICY compliance_policies_org_read ON public.compliance_policies FOR SELECT USING (is_organization_member(%I))',
    org_col
  );

  EXECUTE 'DROP POLICY IF EXISTS compliance_policies_org_insert ON public.compliance_policies';
  EXECUTE format(
    'CREATE POLICY compliance_policies_org_insert ON public.compliance_policies FOR INSERT WITH CHECK (is_organization_member(%I))',
    org_col
  );

  EXECUTE 'DROP POLICY IF EXISTS compliance_policies_org_update ON public.compliance_policies';
  EXECUTE format(
    'CREATE POLICY compliance_policies_org_update ON public.compliance_policies FOR UPDATE USING (is_organization_member(%I))',
    org_col
  );

  EXECUTE 'DROP POLICY IF EXISTS compliance_policies_org_delete ON public.compliance_policies';
  EXECUTE format(
    'CREATE POLICY compliance_policies_org_delete ON public.compliance_policies FOR DELETE USING (is_organization_member(%I))',
    org_col
  );
END $$;

-- ----------------------------------------------------------------------------
-- 2) Remove auth.users exposure through public views
-- ----------------------------------------------------------------------------
-- Use public.users projection instead of joining auth.users directly.
CREATE OR REPLACE VIEW public.upcoming_meetings AS
SELECT
  mb.*,
  mt.name AS meeting_type_name,
  mt.duration_minutes,
  mt.color AS meeting_type_color,
  u.email::varchar(255) AS host_email,
  COALESCE(u.full_name::text, u.email::text) AS host_name
FROM public.meeting_bookings mb
JOIN public.meeting_types mt ON mb.meeting_type_id = mt.id
JOIN public.users u ON mb.host_id = u.id
WHERE mb.status IN ('pending', 'confirmed')
  AND mb.starts_at > NOW()
ORDER BY mb.starts_at;

COMMENT ON VIEW public.upcoming_meetings IS 'Upcoming confirmed meetings with type and host details';

-- ----------------------------------------------------------------------------
-- 3) Convert public views from definer to invoker mode
-- ----------------------------------------------------------------------------
DO $$
DECLARE
  view_record RECORD;
BEGIN
  FOR view_record IN
    SELECT
      n.nspname AS schema_name,
      c.relname AS view_name
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relkind = 'v'
      AND n.nspname = 'public'
  LOOP
    EXECUTE format(
      'ALTER VIEW %I.%I SET (security_invoker = true);',
      view_record.schema_name,
      view_record.view_name
    );
  END LOOP;
END $$;
