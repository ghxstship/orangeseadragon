-- Migration: Phase 6 — Final Depth: Templates, Show-Cost Dashboard, Media Library,
--                     Forecasting, Utilization, Transit Time
-- Created: 2026-02-07
-- Description: Seed production document templates, real-time show-cost query,
--              media asset library, financial forecasting, billable utilization,
--              travel transit time estimation

-- ============================================================================
-- STEP 1: SEED PRODUCTION DOCUMENT TEMPLATES
-- ============================================================================

INSERT INTO document_templates (id, organization_id, name, description, category, content, is_system, created_at)
SELECT
    uuid_generate_v4(),
    NULL, -- system-level templates, cloned per org on first use
    t.name,
    t.description,
    t.category,
    t.content,
    TRUE,
    NOW()
FROM (VALUES
    ('Technical Rider',
     'Standard technical rider template for live events with power, audio, lighting, and staging requirements',
     'production',
     '# TECHNICAL RIDER

## Event Information
- **Event Name**: [Event Name]
- **Date**: [Date]
- **Venue**: [Venue Name]
- **Load-In**: [Time] | **Sound Check**: [Time] | **Doors**: [Time] | **Show**: [Time]

## Stage Requirements
- Stage dimensions: [W] x [D] x [H]
- Stage type: ☐ Indoor ☐ Outdoor ☐ Festival
- Barricade required: ☐ Yes ☐ No
- Wings/side stage: ☐ Yes ☐ No

## Power Requirements
- Total power needed: [___] amps
- Dedicated circuits: [___]
- Generator required: ☐ Yes ☐ No
- Transformer/distro: ☐ Yes ☐ No

## Audio Requirements
- FOH console: [Model]
- Monitor console: [Model]
- PA system: [Specification]
- Monitor wedges: [Quantity]
- IEM systems: [Quantity]
- Microphone list: [See input list]

## Lighting Requirements
- Lighting console: [Model]
- Moving heads: [Quantity/Type]
- LED wash: [Quantity/Type]
- Follow spots: [Quantity]
- Haze/fog: ☐ Yes ☐ No

## Video Requirements
- LED wall: [Size]
- Projection: ☐ Yes ☐ No
- IMAG cameras: [Quantity]
- Confidence monitors: [Quantity]

## Backline
[List backline requirements]

## Hospitality
[Dressing room and catering requirements]

## Notes
[Additional requirements]'),

    ('Call Sheet',
     'Daily call sheet template with crew times, locations, schedule, and emergency contacts',
     'production',
     '# CALL SHEET

## Production: [Production Name]
## Date: [Date] | Day [X] of [Y]

### GENERAL CALL: [Time]

### Weather
- Forecast: [Forecast]
- Sunrise: [Time] | Sunset: [Time]
- Contingency plan: [Plan]

### Key Contacts
| Role | Name | Phone | Email |
|------|------|-------|-------|
| Production Manager | | | |
| Stage Manager | | | |
| Technical Director | | | |
| Safety Officer | | | |

### Venue Information
- **Venue**: [Name]
- **Address**: [Address]
- **Parking**: [Instructions]
- **Load-In Door**: [Location]

### Schedule
| Time | Activity | Location | Notes |
|------|----------|----------|-------|
| [Time] | Load-In | [Location] | |
| [Time] | Sound Check | [Location] | |
| [Time] | Rehearsal | [Location] | |
| [Time] | Doors | [Location] | |
| [Time] | Show | [Location] | |
| [Time] | Strike | [Location] | |

### Department Call Times
| Department | Call Time | Location |
|------------|----------|----------|
| Audio | | |
| Lighting | | |
| Video | | |
| Staging | | |
| Rigging | | |
| Catering | | |

### Safety Notes
- Nearest hospital: [Name, Address]
- Emergency assembly point: [Location]
- First aid kit location: [Location]

### Advance Notes
[Any additional notes from advance]'),

    ('Settlement Worksheet',
     'Post-event settlement template with revenue, expenses, and final accounting',
     'finance',
     '# SETTLEMENT WORKSHEET

## Event: [Event Name]
## Date: [Date] | Venue: [Venue]
## Settlement Date: [Date]

### REVENUE
| Item | Gross | Tax | Net |
|------|-------|-----|-----|
| Ticket Sales | | | |
| Sponsorship | | | |
| Merchandise | | | |
| F&B Revenue Share | | | |
| **Total Revenue** | | | |

### EXPENSES
| Category | Budgeted | Actual | Variance |
|----------|----------|--------|----------|
| Talent/Artist Fees | | | |
| Production/Technical | | | |
| Venue Rental | | | |
| Staffing/Labor | | | |
| Catering/Hospitality | | | |
| Transportation | | | |
| Accommodation | | | |
| Marketing/Promotion | | | |
| Insurance | | | |
| Permits/Licenses | | | |
| Contingency | | | |
| **Total Expenses** | | | |

### SUMMARY
| | Amount |
|---|--------|
| Total Revenue | |
| Total Expenses | |
| **Net Profit/Loss** | |
| Margin % | |

### Approvals
| Role | Name | Signature | Date |
|------|------|-----------|------|
| Production Manager | | | |
| Finance Manager | | | |
| Client Representative | | | |'),

    ('Advance Sheet',
     'Pre-event advance information sheet for venue and production coordination',
     'production',
     '# ADVANCE SHEET

## Event: [Event Name]
## Date: [Date]
## Advance Contact: [Name, Phone, Email]

### Venue Details
- **Name**: [Venue]
- **Address**: [Full Address]
- **Capacity**: [Number]
- **Venue Contact**: [Name, Phone]
- **Venue Hours**: [Open/Close]

### Load-In Information
- **Load-In Date/Time**: [Date/Time]
- **Dock Access**: ☐ Ground Level ☐ Dock Height ☐ Ramp
- **Truck Access**: [Details]
- **Elevator**: ☐ Yes ☐ No — Dimensions: [W x D x H]
- **Fork Lift**: ☐ Available ☐ Bring Own

### Power
- **House Power**: [Amps/Phase]
- **Tie-In Location**: [Location]
- **Generator Parking**: [Location]

### Rigging
- **Rigging Points**: [Number]
- **Max Weight Per Point**: [Weight]
- **Trim Height**: [Height]
- **Rigging Crew Provided**: ☐ Yes ☐ No

### Catering
- **Kitchen Available**: ☐ Yes ☐ No
- **Green Room**: [Location/Details]
- **Crew Meals**: [Arrangement]
- **Water/Craft Services**: [Location]

### Parking & Transportation
- **Bus Parking**: [Location]
- **Crew Parking**: [Location/Passes]
- **Hotel**: [Name, Address, Confirmation]

### Local Crew
- **Stagehand Company**: [Name, Contact]
- **Call Time**: [Time]
- **Crew Count**: [Number]

### Notes
[Additional advance notes]'),

    ('Equipment Pull Sheet',
     'Equipment inventory pull list for production deployments',
     'production',
     '# EQUIPMENT PULL SHEET

## Production: [Name]
## Pull Date: [Date] | Return Date: [Date]
## Pulled By: [Name]

### Audio Equipment
| Item | Qty | Serial/Asset # | Condition Out | Condition In |
|------|-----|----------------|---------------|--------------|
| | | | | |

### Lighting Equipment
| Item | Qty | Serial/Asset # | Condition Out | Condition In |
|------|-----|----------------|---------------|--------------|
| | | | | |

### Video Equipment
| Item | Qty | Serial/Asset # | Condition Out | Condition In |
|------|-----|----------------|---------------|--------------|
| | | | | |

### Staging/Rigging
| Item | Qty | Serial/Asset # | Condition Out | Condition In |
|------|-----|----------------|---------------|--------------|
| | | | | |

### Consumables & Expendables
| Item | Qty | Notes |
|------|-----|-------|
| | | |

### Truck/Vehicle
- **Vehicle**: [Type/Number]
- **Driver**: [Name]
- **Departure**: [Date/Time]

### Sign-Off
| | Name | Signature | Date |
|---|------|-----------|------|
| Pulled By | | | |
| Verified By | | | |
| Returned By | | | |
| Received By | | | |'),

    ('Safety Plan',
     'Event safety plan template covering emergency procedures, risk assessment, and compliance',
     'compliance',
     '# EVENT SAFETY PLAN

## Event: [Event Name]
## Date: [Date] | Venue: [Venue]
## Safety Officer: [Name, Phone]

### Emergency Contacts
| Service | Contact | Phone |
|---------|---------|-------|
| Emergency Services | 911 | 911 |
| Nearest Hospital | [Name] | [Phone] |
| Venue Security | [Name] | [Phone] |
| Production Manager | [Name] | [Phone] |
| Safety Officer | [Name] | [Phone] |

### Emergency Assembly Points
- **Primary**: [Location]
- **Secondary**: [Location]

### Risk Assessment
| Hazard | Likelihood | Severity | Risk Level | Mitigation |
|--------|-----------|----------|------------|------------|
| Electrical | | | | |
| Working at Height | | | | |
| Crowd Management | | | | |
| Weather | | | | |
| Fire | | | | |
| Structural | | | | |

### PPE Requirements
| Area | Required PPE |
|------|-------------|
| Rigging | Hard hat, harness, steel-toe boots |
| Electrical | Insulated gloves, safety glasses |
| General | Closed-toe shoes, high-vis vest |

### Evacuation Procedures
1. [Step 1]
2. [Step 2]
3. [Step 3]

### Incident Reporting
All incidents must be reported to the Safety Officer immediately.
Incident report forms are located at: [Location]

### Certifications Required
- [ ] Venue fire inspection current
- [ ] Structural engineer sign-off (if applicable)
- [ ] Pyrotechnics permit (if applicable)
- [ ] Noise permit
- [ ] Insurance certificates on file')
) AS t(name, description, category, content)
WHERE NOT EXISTS (
    SELECT 1 FROM document_templates WHERE is_system = TRUE AND name = t.name
);

-- ============================================================================
-- STEP 2: REAL-TIME SHOW-COST DASHBOARD FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION report_show_cost_realtime(
    p_project_id UUID,
    p_organization_id UUID
)
RETURNS TABLE (
    -- Budget overview
    total_budget NUMERIC,
    total_committed NUMERIC,
    total_spent NUMERIC,
    remaining NUMERIC,
    burn_pct NUMERIC,
    -- Labor costs (real-time from time entries)
    labor_hours_today NUMERIC,
    labor_cost_today NUMERIC,
    labor_hours_total NUMERIC,
    labor_cost_total NUMERIC,
    -- Crew on-site
    crew_checked_in BIGINT,
    crew_total_assigned BIGINT,
    -- Expense categories
    expenses_by_category JSONB,
    -- Overtime alerts
    overtime_hours_today NUMERIC,
    meal_penalties_today BIGINT,
    -- Revenue tracking
    ticket_revenue NUMERIC,
    sponsorship_revenue NUMERIC,
    other_revenue NUMERIC,
    total_revenue NUMERIC,
    -- Profit
    current_profit NUMERIC,
    projected_profit NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT
        -- Budget
        COALESCE(b.total_budget, 0) AS total_budget,
        COALESCE(b.total_committed, 0) AS total_committed,
        COALESCE(b.total_spent, 0) AS total_spent,
        COALESCE(b.total_budget, 0) - COALESCE(b.total_spent, 0) AS remaining,
        CASE WHEN COALESCE(b.total_budget, 0) > 0
            THEN (COALESCE(b.total_spent, 0) / b.total_budget * 100)
            ELSE 0
        END AS burn_pct,

        -- Labor today
        COALESCE(today_labor.hours, 0) AS labor_hours_today,
        COALESCE(today_labor.cost, 0) AS labor_cost_today,
        COALESCE(total_labor.hours, 0) AS labor_hours_total,
        COALESCE(total_labor.cost, 0) AS labor_cost_total,

        -- Crew status
        COALESCE(crew_status.checked_in, 0) AS crew_checked_in,
        COALESCE(crew_status.total_assigned, 0) AS crew_total_assigned,

        -- Expenses by category
        COALESCE(exp_cat.data, '[]'::JSONB) AS expenses_by_category,

        -- OT/penalties today
        COALESCE(ot.hours, 0) AS overtime_hours_today,
        COALESCE(mp.count, 0) AS meal_penalties_today,

        -- Revenue
        COALESCE(rev.tickets, 0) AS ticket_revenue,
        COALESCE(rev.sponsorship, 0) AS sponsorship_revenue,
        COALESCE(rev.other, 0) AS other_revenue,
        COALESCE(rev.total, 0) AS total_revenue,

        -- Profit
        COALESCE(rev.total, 0) - COALESCE(b.total_spent, 0) AS current_profit,
        COALESCE(rev.total, 0) - COALESCE(b.total_budget, 0) AS projected_profit

    FROM projects p
    LEFT JOIN budgets b ON b.project_id = p.id AND b.organization_id = p_organization_id

    -- Today's labor
    LEFT JOIN LATERAL (
        SELECT SUM(te.hours) AS hours, SUM(te.hours * COALESCE(te.hourly_rate, 0)) AS cost
        FROM time_entries te
        WHERE te.project_id = p.id AND te.date = CURRENT_DATE
    ) today_labor ON TRUE

    -- Total labor
    LEFT JOIN LATERAL (
        SELECT SUM(te.hours) AS hours, SUM(te.hours * COALESCE(te.hourly_rate, 0)) AS cost
        FROM time_entries te
        WHERE te.project_id = p.id
    ) total_labor ON TRUE

    -- Crew check-in status
    LEFT JOIN LATERAL (
        SELECT
            COUNT(CASE WHEN cc.check_in_time IS NOT NULL AND cc.check_out_time IS NULL THEN 1 END) AS checked_in,
            COUNT(DISTINCT rb.user_id) AS total_assigned
        FROM resource_bookings rb
        LEFT JOIN crew_checkins cc ON cc.user_id = rb.user_id
            AND cc.project_id = p.id
            AND cc.check_in_date = CURRENT_DATE
        WHERE rb.project_id = p.id
          AND rb.status IN ('confirmed', 'tentative')
          AND rb.start_date <= CURRENT_DATE
          AND rb.end_date >= CURRENT_DATE
    ) crew_status ON TRUE

    -- Expenses by category
    LEFT JOIN LATERAL (
        SELECT jsonb_agg(
            jsonb_build_object('category', e.category, 'amount', e.total)
        ) AS data
        FROM (
            SELECT category, SUM(amount) AS total
            FROM expenses
            WHERE project_id = p.id AND organization_id = p_organization_id
            GROUP BY category
        ) e
    ) exp_cat ON TRUE

    -- Overtime today
    LEFT JOIN LATERAL (
        SELECT SUM(cc.overtime_hours) AS hours
        FROM crew_checkins cc
        WHERE cc.project_id = p.id AND cc.check_in_date = CURRENT_DATE
    ) ot ON TRUE

    -- Meal penalties today
    LEFT JOIN LATERAL (
        SELECT COUNT(*) AS count
        FROM meal_penalties mp2
        WHERE mp2.project_id = p.id AND mp2.violation_date = CURRENT_DATE
    ) mp ON TRUE

    -- Revenue breakdown
    LEFT JOIN LATERAL (
        SELECT
            SUM(CASE WHEN i.invoice_type = 'ticket_sales' THEN i.total_amount ELSE 0 END) AS tickets,
            SUM(CASE WHEN i.invoice_type = 'sponsorship' THEN i.total_amount ELSE 0 END) AS sponsorship,
            SUM(CASE WHEN i.invoice_type NOT IN ('ticket_sales', 'sponsorship') THEN i.total_amount ELSE 0 END) AS other,
            SUM(i.total_amount) AS total
        FROM invoices i
        WHERE i.project_id = p.id
          AND i.organization_id = p_organization_id
          AND i.direction = 'outgoing'
    ) rev ON TRUE

    WHERE p.id = p_project_id AND p.organization_id = p_organization_id;
END;
$$;

-- ============================================================================
-- STEP 3: MEDIA ASSET LIBRARY
-- ============================================================================

CREATE TABLE IF NOT EXISTS media_assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    document_id UUID REFERENCES documents(id) ON DELETE SET NULL,

    -- Asset metadata
    title VARCHAR(255) NOT NULL,
    description TEXT,
    asset_type VARCHAR(20) NOT NULL
        CHECK (asset_type IN ('photo', 'video', 'audio', 'render', 'cad', 'graphic')),
    file_url TEXT NOT NULL,
    thumbnail_url TEXT,
    file_size_bytes BIGINT,
    mime_type VARCHAR(100),

    -- Dimensions / duration
    width INTEGER,
    height INTEGER,
    duration_seconds NUMERIC(10,2),

    -- Organization
    folder VARCHAR(255),
    tags TEXT[],
    category VARCHAR(50),

    -- Rights & usage
    copyright_holder VARCHAR(255),
    usage_rights VARCHAR(50) DEFAULT 'internal'
        CHECK (usage_rights IN ('internal', 'client_approved', 'public', 'restricted')),
    license_type VARCHAR(50),
    expiration_date DATE,

    -- Metadata
    camera_model VARCHAR(100),
    shot_date TIMESTAMPTZ,
    location_description VARCHAR(255),
    gps_latitude NUMERIC(10,7),
    gps_longitude NUMERIC(10,7),

    -- Status
    status VARCHAR(20) DEFAULT 'active'
        CHECK (status IN ('active', 'archived', 'pending_review', 'rejected')),

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_media_assets_org ON media_assets(organization_id);
CREATE INDEX IF NOT EXISTS idx_media_assets_project ON media_assets(project_id);
CREATE INDEX IF NOT EXISTS idx_media_assets_type ON media_assets(asset_type);
CREATE INDEX IF NOT EXISTS idx_media_assets_tags ON media_assets USING GIN (tags);
CREATE INDEX IF NOT EXISTS idx_media_assets_folder ON media_assets(organization_id, folder);

-- ============================================================================
-- STEP 4: BILLABLE HOURS UTILIZATION RATE
-- ============================================================================

CREATE OR REPLACE FUNCTION report_billable_utilization(
    p_organization_id UUID,
    p_start_date DATE DEFAULT NULL,
    p_end_date DATE DEFAULT NULL
)
RETURNS TABLE (
    user_id UUID,
    user_name TEXT,
    department TEXT,
    total_hours NUMERIC,
    billable_hours NUMERIC,
    non_billable_hours NUMERIC,
    utilization_rate NUMERIC,
    billable_amount NUMERIC,
    cost_amount NUMERIC,
    margin NUMERIC,
    margin_pct NUMERIC,
    available_hours NUMERIC,
    capacity_utilization NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_start DATE := COALESCE(p_start_date, date_trunc('month', CURRENT_DATE)::DATE);
    v_end DATE := COALESCE(p_end_date, CURRENT_DATE);
    v_working_days INTEGER;
BEGIN
    -- Calculate working days (Mon-Fri)
    SELECT COUNT(*)::INTEGER INTO v_working_days
    FROM generate_series(v_start, v_end, '1 day'::INTERVAL) d
    WHERE EXTRACT(DOW FROM d) NOT IN (0, 6);

    RETURN QUERY
    SELECT
        u.id AS user_id,
        (ep.first_name || ' ' || ep.last_name)::TEXT AS user_name,
        ep.department::TEXT AS department,
        COALESCE(SUM(te.hours), 0) AS total_hours,
        COALESCE(SUM(CASE WHEN te.billable = TRUE THEN te.hours ELSE 0 END), 0) AS billable_hours,
        COALESCE(SUM(CASE WHEN te.billable = FALSE THEN te.hours ELSE 0 END), 0) AS non_billable_hours,
        CASE WHEN COALESCE(SUM(te.hours), 0) > 0
            THEN (SUM(CASE WHEN te.billable = TRUE THEN te.hours ELSE 0 END) / SUM(te.hours) * 100)
            ELSE 0
        END AS utilization_rate,
        COALESCE(SUM(CASE WHEN te.billable = TRUE THEN te.hours * COALESCE(te.hourly_rate, 0) ELSE 0 END), 0) AS billable_amount,
        COALESCE(SUM(te.hours * COALESCE(ep.cost_rate, 0)), 0) AS cost_amount,
        COALESCE(SUM(CASE WHEN te.billable = TRUE THEN te.hours * COALESCE(te.hourly_rate, 0) ELSE 0 END), 0) -
        COALESCE(SUM(te.hours * COALESCE(ep.cost_rate, 0)), 0) AS margin,
        CASE WHEN COALESCE(SUM(CASE WHEN te.billable = TRUE THEN te.hours * COALESCE(te.hourly_rate, 0) ELSE 0 END), 0) > 0
            THEN ((COALESCE(SUM(CASE WHEN te.billable = TRUE THEN te.hours * COALESCE(te.hourly_rate, 0) ELSE 0 END), 0) -
                   COALESCE(SUM(te.hours * COALESCE(ep.cost_rate, 0)), 0)) /
                  SUM(CASE WHEN te.billable = TRUE THEN te.hours * COALESCE(te.hourly_rate, 0) ELSE 0 END) * 100)
            ELSE 0
        END AS margin_pct,
        (v_working_days * 8)::NUMERIC AS available_hours,
        CASE WHEN v_working_days > 0
            THEN (COALESCE(SUM(te.hours), 0) / (v_working_days * 8) * 100)
            ELSE 0
        END AS capacity_utilization
    FROM users u
    JOIN employee_profiles ep ON ep.user_id = u.id AND ep.organization_id = p_organization_id
    LEFT JOIN time_entries te ON te.user_id = u.id
        AND te.organization_id = p_organization_id
        AND te.date BETWEEN v_start AND v_end
    JOIN organization_members om ON om.user_id = u.id AND om.organization_id = p_organization_id
    GROUP BY u.id, ep.first_name, ep.last_name, ep.department, ep.cost_rate
    ORDER BY utilization_rate DESC;
END;
$$;

-- ============================================================================
-- STEP 5: FINANCIAL FORECASTING
-- ============================================================================

CREATE OR REPLACE FUNCTION forecast_project_financials(
    p_project_id UUID,
    p_organization_id UUID,
    p_forecast_months INTEGER DEFAULT 3
)
RETURNS TABLE (
    forecast_month DATE,
    projected_revenue NUMERIC,
    projected_expenses NUMERIC,
    projected_profit NUMERIC,
    confidence_level VARCHAR,
    revenue_trend NUMERIC,
    expense_trend NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    WITH monthly_actuals AS (
        -- Get last 6 months of actuals for trend calculation
        SELECT
            date_trunc('month', i.created_at)::DATE AS month,
            SUM(CASE WHEN i.direction = 'outgoing' THEN i.total_amount ELSE 0 END) AS revenue,
            SUM(CASE WHEN i.direction = 'incoming' THEN i.total_amount ELSE 0 END) AS expenses
        FROM invoices i
        WHERE i.project_id = p_project_id
          AND i.organization_id = p_organization_id
          AND i.created_at >= (CURRENT_DATE - INTERVAL '6 months')
        GROUP BY date_trunc('month', i.created_at)
    ),
    expense_actuals AS (
        SELECT
            date_trunc('month', e.expense_date)::DATE AS month,
            SUM(e.amount) AS amount
        FROM expenses e
        WHERE e.project_id = p_project_id
          AND e.organization_id = p_organization_id
          AND e.expense_date >= (CURRENT_DATE - INTERVAL '6 months')
        GROUP BY date_trunc('month', e.expense_date)
    ),
    trends AS (
        SELECT
            COALESCE(AVG(ma.revenue), 0) AS avg_revenue,
            COALESCE(AVG(COALESCE(ma.expenses, 0) + COALESCE(ea.amount, 0)), 0) AS avg_expenses,
            CASE WHEN COUNT(*) >= 3 THEN
                (COALESCE(
                    (SELECT ma2.revenue FROM monthly_actuals ma2 ORDER BY ma2.month DESC LIMIT 1), 0) -
                 COALESCE(
                    (SELECT ma3.revenue FROM monthly_actuals ma3 ORDER BY ma3.month ASC LIMIT 1), 0)
                ) / GREATEST(COUNT(*), 1)
            ELSE 0 END AS revenue_slope,
            CASE WHEN COUNT(*) >= 3 THEN
                (COALESCE(
                    (SELECT COALESCE(ma2.expenses, 0) FROM monthly_actuals ma2 ORDER BY ma2.month DESC LIMIT 1), 0) -
                 COALESCE(
                    (SELECT COALESCE(ma3.expenses, 0) FROM monthly_actuals ma3 ORDER BY ma3.month ASC LIMIT 1), 0)
                ) / GREATEST(COUNT(*), 1)
            ELSE 0 END AS expense_slope
        FROM monthly_actuals ma
        LEFT JOIN expense_actuals ea ON ea.month = ma.month
    )
    SELECT
        (date_trunc('month', CURRENT_DATE) + (n || ' months')::INTERVAL)::DATE AS forecast_month,
        GREATEST(t.avg_revenue + (t.revenue_slope * n), 0) AS projected_revenue,
        GREATEST(t.avg_expenses + (t.expense_slope * n), 0) AS projected_expenses,
        GREATEST(t.avg_revenue + (t.revenue_slope * n), 0) -
        GREATEST(t.avg_expenses + (t.expense_slope * n), 0) AS projected_profit,
        CASE
            WHEN n <= 1 THEN 'high'
            WHEN n <= 2 THEN 'medium'
            ELSE 'low'
        END::VARCHAR AS confidence_level,
        t.revenue_slope AS revenue_trend,
        t.expense_slope AS expense_trend
    FROM trends t
    CROSS JOIN generate_series(1, p_forecast_months) AS n
    ORDER BY n;
END;
$$;

-- Scenario builder: compare budget scenarios
CREATE OR REPLACE FUNCTION compare_budget_scenarios(
    p_project_id UUID,
    p_organization_id UUID,
    p_scenarios JSONB DEFAULT '[{"name":"optimistic","revenue_multiplier":1.1,"cost_multiplier":0.95},{"name":"baseline","revenue_multiplier":1.0,"cost_multiplier":1.0},{"name":"pessimistic","revenue_multiplier":0.85,"cost_multiplier":1.15}]'
)
RETURNS TABLE (
    scenario_name TEXT,
    projected_revenue NUMERIC,
    projected_cost NUMERIC,
    projected_profit NUMERIC,
    profit_margin_pct NUMERIC,
    break_even_date TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_budget RECORD;
    v_scenario JSONB;
BEGIN
    -- Get current budget data
    SELECT
        COALESCE(b.total_budget, 0) AS budget,
        COALESCE(b.total_spent, 0) AS spent,
        COALESCE(b.revenue_amount, 0) AS revenue
    INTO v_budget
    FROM budgets b
    WHERE b.project_id = p_project_id AND b.organization_id = p_organization_id
    LIMIT 1;

    -- Generate scenario comparisons
    FOR v_scenario IN SELECT * FROM jsonb_array_elements(p_scenarios)
    LOOP
        scenario_name := (v_scenario->>'name')::TEXT;
        projected_revenue := v_budget.revenue * (v_scenario->>'revenue_multiplier')::NUMERIC;
        projected_cost := v_budget.budget * (v_scenario->>'cost_multiplier')::NUMERIC;
        projected_profit := projected_revenue - projected_cost;
        profit_margin_pct := CASE WHEN projected_revenue > 0
            THEN (projected_profit / projected_revenue * 100)
            ELSE 0
        END;
        break_even_date := CASE WHEN projected_profit < 0 THEN 'N/A' ELSE 'Profitable' END;
        RETURN NEXT;
    END LOOP;
END;
$$;

-- ============================================================================
-- STEP 6: TRAVEL TRANSIT TIME ESTIMATION
-- ============================================================================

-- Store known transit times between locations for reuse
CREATE TABLE IF NOT EXISTS transit_time_cache (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    origin_venue_id UUID REFERENCES venues(id) ON DELETE CASCADE,
    destination_venue_id UUID REFERENCES venues(id) ON DELETE CASCADE,
    origin_city VARCHAR(100),
    destination_city VARCHAR(100),

    -- Transit estimates
    drive_time_hours NUMERIC(6,2),
    drive_distance_miles NUMERIC(8,1),
    flight_time_hours NUMERIC(6,2),
    recommended_travel_mode VARCHAR(20)
        CHECK (recommended_travel_mode IN ('drive', 'fly', 'train', 'bus')),
    recommended_buffer_hours NUMERIC(4,1) DEFAULT 2,

    -- Metadata
    last_verified_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transit_cache_org ON transit_time_cache(organization_id);
CREATE INDEX IF NOT EXISTS idx_transit_cache_venues ON transit_time_cache(origin_venue_id, destination_venue_id);

-- Function to estimate travel day scheduling
CREATE OR REPLACE FUNCTION estimate_travel_schedule(
    p_employee_id UUID,
    p_organization_id UUID,
    p_origin_venue_id UUID,
    p_destination_venue_id UUID,
    p_event_date DATE
)
RETURNS TABLE (
    recommended_departure DATE,
    travel_mode VARCHAR,
    estimated_hours NUMERIC,
    travel_day_rate NUMERIC,
    per_diem NUMERIC,
    hotel_nights INTEGER,
    total_travel_cost NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_transit RECORD;
    v_rate RECORD;
    v_travel_hours NUMERIC;
    v_hotel_nights INTEGER;
BEGIN
    -- Look up cached transit time
    SELECT * INTO v_transit
    FROM transit_time_cache
    WHERE organization_id = p_organization_id
      AND origin_venue_id = p_origin_venue_id
      AND destination_venue_id = p_destination_venue_id
    LIMIT 1;

    -- Get rate card
    SELECT * INTO v_rate
    FROM crew_rate_cards
    WHERE employee_id = p_employee_id
      AND organization_id = p_organization_id
      AND effective_from <= p_event_date
      AND (effective_until IS NULL OR effective_until >= p_event_date)
    ORDER BY effective_from DESC
    LIMIT 1;

    IF v_transit IS NULL THEN
        -- Default estimate if no cached data
        v_travel_hours := 4;
    ELSE
        v_travel_hours := COALESCE(
            CASE WHEN v_transit.recommended_travel_mode = 'fly' THEN v_transit.flight_time_hours
                 ELSE v_transit.drive_time_hours END,
            4
        ) + COALESCE(v_transit.recommended_buffer_hours, 2);
    END IF;

    -- If travel > 6 hours, need day before
    v_hotel_nights := CASE WHEN v_travel_hours > 6 THEN 1 ELSE 0 END;

    RETURN QUERY SELECT
        CASE WHEN v_travel_hours > 6 THEN p_event_date - 1 ELSE p_event_date END AS recommended_departure,
        COALESCE(v_transit.recommended_travel_mode, 'drive')::VARCHAR AS travel_mode,
        v_travel_hours AS estimated_hours,
        COALESCE(v_rate.travel_day_rate, 0) AS travel_day_rate,
        COALESCE(v_rate.per_diem_amount, 0) AS per_diem,
        v_hotel_nights AS hotel_nights,
        COALESCE(v_rate.travel_day_rate, 0) +
        COALESCE(v_rate.per_diem_amount, 0) +
        (v_hotel_nights * COALESCE(v_rate.hotel_allowance, 0)) AS total_travel_cost;
END;
$$;

-- ============================================================================
-- STEP 7: RLS POLICIES
-- ============================================================================

ALTER TABLE media_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE transit_time_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY media_assets_org_isolation ON media_assets
    USING (organization_id IN (
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    ));

CREATE POLICY transit_cache_org_isolation ON transit_time_cache
    USING (organization_id IN (
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    ));
