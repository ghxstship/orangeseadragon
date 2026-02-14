-- Program/Portfolio/Forecast RLS hardening
-- Addresses Supabase Security Advisor "RLS Disabled in Public" findings

-- Tables with direct organization_id ownership
DO $$
DECLARE
  table_name TEXT;
BEGIN
  FOREACH table_name IN ARRAY ARRAY[
    'programs',
    'portfolios',
    'forecasts',
    'budget_vs_actual',
    'resource_forecasts',
    'capacity_plans'
  ]
  LOOP
    IF to_regclass(format('public.%s', table_name)) IS NULL THEN
      CONTINUE;
    END IF;

    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', table_name);
    EXECUTE format('DROP POLICY IF EXISTS %I_org_isolation ON public.%I', table_name, table_name);
    EXECUTE format(
      'CREATE POLICY %I_org_isolation ON public.%I FOR ALL USING (is_organization_member(organization_id)) WITH CHECK (is_organization_member(organization_id))',
      table_name,
      table_name
    );
  END LOOP;
END $$;

-- programs -> projects
DO $$
BEGIN
  IF to_regclass('public.program_projects') IS NOT NULL THEN
    ALTER TABLE public.program_projects ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS program_projects_org_isolation ON public.program_projects;
    CREATE POLICY program_projects_org_isolation ON public.program_projects
      FOR ALL
      USING (
        EXISTS (
          SELECT 1
          FROM public.programs p
          WHERE p.id = program_projects.program_id
            AND is_organization_member(p.organization_id)
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1
          FROM public.programs p
          JOIN public.projects pr ON pr.id = program_projects.project_id
          WHERE p.id = program_projects.program_id
            AND pr.organization_id = p.organization_id
            AND is_organization_member(p.organization_id)
        )
      );
  END IF;
END $$;

-- programs child tables
DO $$
BEGIN
  IF to_regclass('public.program_members') IS NOT NULL THEN
    ALTER TABLE public.program_members ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS program_members_org_isolation ON public.program_members;
    CREATE POLICY program_members_org_isolation ON public.program_members
      FOR ALL
      USING (
        EXISTS (
          SELECT 1
          FROM public.programs p
          WHERE p.id = program_members.program_id
            AND is_organization_member(p.organization_id)
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1
          FROM public.programs p
          WHERE p.id = program_members.program_id
            AND is_organization_member(p.organization_id)
        )
      );
  END IF;
END $$;

DO $$
BEGIN
  IF to_regclass('public.program_objectives') IS NOT NULL THEN
    ALTER TABLE public.program_objectives ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS program_objectives_org_isolation ON public.program_objectives;
    CREATE POLICY program_objectives_org_isolation ON public.program_objectives
      FOR ALL
      USING (
        EXISTS (
          SELECT 1
          FROM public.programs p
          WHERE p.id = program_objectives.program_id
            AND is_organization_member(p.organization_id)
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1
          FROM public.programs p
          WHERE p.id = program_objectives.program_id
            AND is_organization_member(p.organization_id)
        )
      );
  END IF;
END $$;

DO $$
BEGIN
  IF to_regclass('public.program_metrics') IS NOT NULL THEN
    ALTER TABLE public.program_metrics ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS program_metrics_org_isolation ON public.program_metrics;
    CREATE POLICY program_metrics_org_isolation ON public.program_metrics
      FOR ALL
      USING (
        EXISTS (
          SELECT 1
          FROM public.programs p
          WHERE p.id = program_metrics.program_id
            AND is_organization_member(p.organization_id)
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1
          FROM public.programs p
          WHERE p.id = program_metrics.program_id
            AND is_organization_member(p.organization_id)
        )
      );
  END IF;
END $$;

-- portfolios -> programs
DO $$
BEGIN
  IF to_regclass('public.portfolio_programs') IS NOT NULL THEN
    ALTER TABLE public.portfolio_programs ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS portfolio_programs_org_isolation ON public.portfolio_programs;
    CREATE POLICY portfolio_programs_org_isolation ON public.portfolio_programs
      FOR ALL
      USING (
        EXISTS (
          SELECT 1
          FROM public.portfolios pf
          WHERE pf.id = portfolio_programs.portfolio_id
            AND is_organization_member(pf.organization_id)
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1
          FROM public.portfolios pf
          JOIN public.programs p ON p.id = portfolio_programs.program_id
          WHERE pf.id = portfolio_programs.portfolio_id
            AND p.organization_id = pf.organization_id
            AND is_organization_member(pf.organization_id)
        )
      );
  END IF;
END $$;

-- forecasts child tables
DO $$
BEGIN
  IF to_regclass('public.forecast_periods') IS NOT NULL THEN
    ALTER TABLE public.forecast_periods ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS forecast_periods_org_isolation ON public.forecast_periods;
    CREATE POLICY forecast_periods_org_isolation ON public.forecast_periods
      FOR ALL
      USING (
        EXISTS (
          SELECT 1
          FROM public.forecasts f
          WHERE f.id = forecast_periods.forecast_id
            AND is_organization_member(f.organization_id)
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1
          FROM public.forecasts f
          WHERE f.id = forecast_periods.forecast_id
            AND is_organization_member(f.organization_id)
        )
      );
  END IF;
END $$;

DO $$
BEGIN
  IF to_regclass('public.forecast_items') IS NOT NULL THEN
    ALTER TABLE public.forecast_items ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS forecast_items_org_isolation ON public.forecast_items;
    CREATE POLICY forecast_items_org_isolation ON public.forecast_items
      FOR ALL
      USING (
        EXISTS (
          SELECT 1
          FROM public.forecast_periods fp
          JOIN public.forecasts f ON f.id = fp.forecast_id
          WHERE fp.id = forecast_items.forecast_period_id
            AND is_organization_member(f.organization_id)
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1
          FROM public.forecast_periods fp
          JOIN public.forecasts f ON f.id = fp.forecast_id
          WHERE fp.id = forecast_items.forecast_period_id
            AND is_organization_member(f.organization_id)
        )
      );
  END IF;
END $$;

DO $$
BEGIN
  IF to_regclass('public.forecast_scenarios') IS NOT NULL THEN
    ALTER TABLE public.forecast_scenarios ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS forecast_scenarios_org_isolation ON public.forecast_scenarios;
    CREATE POLICY forecast_scenarios_org_isolation ON public.forecast_scenarios
      FOR ALL
      USING (is_organization_member(organization_id))
      WITH CHECK (is_organization_member(organization_id));
  END IF;
END $$;

-- capacity plan items inherit organization boundary from parent capacity plan
DO $$
BEGIN
  IF to_regclass('public.capacity_plan_items') IS NOT NULL THEN
    ALTER TABLE public.capacity_plan_items ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS capacity_plan_items_org_isolation ON public.capacity_plan_items;
    CREATE POLICY capacity_plan_items_org_isolation ON public.capacity_plan_items
      FOR ALL
      USING (
        EXISTS (
          SELECT 1
          FROM public.capacity_plans cp
          WHERE cp.id = capacity_plan_items.capacity_plan_id
            AND is_organization_member(cp.organization_id)
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1
          FROM public.capacity_plans cp
          WHERE cp.id = capacity_plan_items.capacity_plan_id
            AND is_organization_member(cp.organization_id)
        )
      );
  END IF;
END $$;
