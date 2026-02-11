-- ATLVS AI Lead Scoring
-- ML-based scoring for contacts and leads
-- Migration: 00046

-- ============================================================================
-- SCORING MODELS (Configuration for scoring algorithms)
-- ============================================================================

CREATE TABLE IF NOT EXISTS scoring_models (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    name VARCHAR(100) NOT NULL,
    description TEXT,
    
    -- Model type
    model_type VARCHAR(20) DEFAULT 'rule_based' CHECK (model_type IN ('rule_based', 'ml_trained', 'hybrid')),
    
    -- Scoring configuration
    scoring_factors JSONB NOT NULL DEFAULT '[]',
    -- Example: [
    --   { "factor": "email_opens", "weight": 10, "threshold": 3 },
    --   { "factor": "website_visits", "weight": 15, "threshold": 5 },
    --   { "factor": "company_size", "weight": 20, "values": { "enterprise": 20, "mid_market": 15, "smb": 10 } }
    -- ]
    
    -- Thresholds
    hot_threshold INTEGER DEFAULT 80,
    warm_threshold INTEGER DEFAULT 50,
    cold_threshold INTEGER DEFAULT 20,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    is_default BOOLEAN DEFAULT FALSE,
    
    -- Training metadata (for ML models)
    last_trained_at TIMESTAMPTZ,
    training_data_count INTEGER,
    model_accuracy DECIMAL(5, 2),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_scoring_models_organization ON scoring_models(organization_id);
CREATE INDEX IF NOT EXISTS idx_scoring_models_active ON scoring_models(is_active, is_default);

-- ============================================================================
-- LEAD SCORES (Calculated scores for contacts)
-- ============================================================================

CREATE TABLE IF NOT EXISTS lead_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Entity
    contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    scoring_model_id UUID REFERENCES scoring_models(id) ON DELETE SET NULL,
    
    -- Score
    score INTEGER NOT NULL CHECK (score BETWEEN 0 AND 100),
    score_label VARCHAR(20) NOT NULL CHECK (score_label IN ('hot', 'warm', 'cold', 'unscored')),
    
    -- Factor breakdown
    factor_scores JSONB DEFAULT '{}',
    -- Example: {
    --   "engagement": { "score": 25, "factors": ["email_opens", "website_visits"] },
    --   "firmographics": { "score": 20, "factors": ["company_size", "industry"] },
    --   "behavior": { "score": 15, "factors": ["demo_request", "pricing_page"] }
    -- }
    
    -- Trend
    previous_score INTEGER,
    score_change INTEGER,
    trend_direction VARCHAR(10) CHECK (trend_direction IN ('up', 'down', 'stable')),
    
    -- Timestamps
    calculated_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    
    -- History tracking
    score_history JSONB DEFAULT '[]',
    -- Example: [{ "score": 45, "date": "2026-01-15" }, { "score": 52, "date": "2026-01-22" }]
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(contact_id, scoring_model_id)
);

CREATE INDEX IF NOT EXISTS idx_lead_scores_organization ON lead_scores(organization_id);
CREATE INDEX IF NOT EXISTS idx_lead_scores_contact ON lead_scores(contact_id);
CREATE INDEX IF NOT EXISTS idx_lead_scores_score ON lead_scores(score DESC);
CREATE INDEX IF NOT EXISTS idx_lead_scores_label ON lead_scores(score_label);
CREATE INDEX IF NOT EXISTS idx_lead_scores_hot ON lead_scores(organization_id, score_label) 
    WHERE score_label = 'hot';

-- ============================================================================
-- SCORING EVENTS (Trackable events that affect score)
-- ============================================================================

CREATE TABLE IF NOT EXISTS scoring_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    
    -- Event details
    event_type VARCHAR(50) NOT NULL,
    event_source VARCHAR(50), -- email, website, crm, form, etc.
    event_value JSONB DEFAULT '{}',
    
    -- Scoring impact
    score_impact INTEGER DEFAULT 0,
    
    -- Timestamps
    occurred_at TIMESTAMPTZ DEFAULT NOW(),
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_scoring_events_contact ON scoring_events(contact_id);
CREATE INDEX IF NOT EXISTS idx_scoring_events_type ON scoring_events(event_type);
CREATE INDEX IF NOT EXISTS idx_scoring_events_occurred ON scoring_events(occurred_at DESC);

-- ============================================================================
-- FUNCTION: Calculate lead score
-- ============================================================================

CREATE OR REPLACE FUNCTION calculate_lead_score(
    p_contact_id UUID,
    p_model_id UUID DEFAULT NULL
) RETURNS INTEGER AS $$
DECLARE
    v_org_id UUID;
    v_model RECORD;
    v_score INTEGER := 0;
    v_factor RECORD;
    v_factor_value INTEGER;
    v_contact RECORD;
    v_activity_count INTEGER;
    v_email_opens INTEGER;
    v_meetings INTEGER;
    v_deal_value DECIMAL;
BEGIN
    -- Get contact and org
    SELECT organization_id INTO v_org_id FROM contacts WHERE id = p_contact_id;
    
    -- Get scoring model
    IF p_model_id IS NOT NULL THEN
        SELECT * INTO v_model FROM scoring_models WHERE id = p_model_id;
    ELSE
        SELECT * INTO v_model FROM scoring_models 
        WHERE organization_id = v_org_id AND is_default = TRUE AND is_active = TRUE
        LIMIT 1;
    END IF;
    
    -- If no model, use default scoring
    IF v_model IS NULL THEN
        -- Default scoring based on activity
        SELECT COUNT(*) INTO v_activity_count
        FROM activities WHERE contact_id = p_contact_id AND occurred_at > NOW() - INTERVAL '30 days';
        
        SELECT COUNT(*) INTO v_email_opens
        FROM email_tracking_events ete
        JOIN email_messages em ON ete.email_message_id = em.id
        WHERE em.contact_id = p_contact_id AND ete.event_type = 'opened';
        
        SELECT COUNT(*) INTO v_meetings
        FROM meeting_bookings WHERE contact_id = p_contact_id AND status = 'completed';
        
        SELECT COALESCE(SUM(value), 0) INTO v_deal_value
        FROM deals WHERE contact_id = p_contact_id AND stage = 'closed-won';
        
        -- Calculate default score
        v_score := LEAST(100, 
            (v_activity_count * 5) +
            (v_email_opens * 3) +
            (v_meetings * 15) +
            (CASE WHEN v_deal_value > 0 THEN 20 ELSE 0 END)
        );
        
        RETURN v_score;
    END IF;
    
    -- Apply model factors
    FOR v_factor IN SELECT * FROM jsonb_array_elements(v_model.scoring_factors)
    LOOP
        v_factor_value := 0;
        
        -- Calculate factor score based on type
        CASE v_factor->>'factor'
            WHEN 'activity_count' THEN
                SELECT COUNT(*) INTO v_factor_value
                FROM activities WHERE contact_id = p_contact_id 
                AND occurred_at > NOW() - INTERVAL '30 days';
                v_factor_value := LEAST(v_factor_value, COALESCE((v_factor->>'threshold')::INTEGER, 10));
                v_factor_value := v_factor_value * COALESCE((v_factor->>'weight')::INTEGER, 5);
                
            WHEN 'email_engagement' THEN
                SELECT COUNT(*) INTO v_factor_value
                FROM email_tracking_events ete
                JOIN email_messages em ON ete.email_message_id = em.id
                WHERE em.contact_id = p_contact_id AND ete.event_type IN ('opened', 'clicked');
                v_factor_value := LEAST(v_factor_value * 2, 30);
                
            WHEN 'meeting_count' THEN
                SELECT COUNT(*) INTO v_factor_value
                FROM meeting_bookings WHERE contact_id = p_contact_id;
                v_factor_value := v_factor_value * COALESCE((v_factor->>'weight')::INTEGER, 10);
                
            WHEN 'deal_association' THEN
                SELECT COUNT(*) INTO v_factor_value
                FROM deals WHERE contact_id = p_contact_id AND stage NOT IN ('closed-lost');
                v_factor_value := CASE WHEN v_factor_value > 0 THEN 20 ELSE 0 END;
                
            ELSE
                v_factor_value := 0;
        END CASE;
        
        v_score := v_score + v_factor_value;
    END LOOP;
    
    RETURN LEAST(100, v_score);
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- FUNCTION: Update lead score for contact
-- ============================================================================

CREATE OR REPLACE FUNCTION update_lead_score(p_contact_id UUID) RETURNS UUID AS $$
DECLARE
    v_org_id UUID;
    v_model_id UUID;
    v_new_score INTEGER;
    v_old_score INTEGER;
    v_score_label VARCHAR(20);
    v_trend VARCHAR(10);
    v_score_id UUID;
    v_hot_threshold INTEGER := 80;
    v_warm_threshold INTEGER := 50;
BEGIN
    -- Get org and default model
    SELECT organization_id INTO v_org_id FROM contacts WHERE id = p_contact_id;
    
    SELECT id, hot_threshold, warm_threshold INTO v_model_id, v_hot_threshold, v_warm_threshold
    FROM scoring_models 
    WHERE organization_id = v_org_id AND is_default = TRUE AND is_active = TRUE
    LIMIT 1;
    
    -- Calculate new score
    v_new_score := calculate_lead_score(p_contact_id, v_model_id);
    
    -- Get old score
    SELECT score INTO v_old_score FROM lead_scores WHERE contact_id = p_contact_id LIMIT 1;
    
    -- Determine label
    v_score_label := CASE 
        WHEN v_new_score >= v_hot_threshold THEN 'hot'
        WHEN v_new_score >= v_warm_threshold THEN 'warm'
        ELSE 'cold'
    END;
    
    -- Determine trend
    v_trend := CASE 
        WHEN v_old_score IS NULL THEN 'stable'
        WHEN v_new_score > v_old_score + 5 THEN 'up'
        WHEN v_new_score < v_old_score - 5 THEN 'down'
        ELSE 'stable'
    END;
    
    -- Upsert score
    INSERT INTO lead_scores (
        organization_id,
        contact_id,
        scoring_model_id,
        score,
        score_label,
        previous_score,
        score_change,
        trend_direction,
        calculated_at,
        score_history
    ) VALUES (
        v_org_id,
        p_contact_id,
        v_model_id,
        v_new_score,
        v_score_label,
        v_old_score,
        v_new_score - COALESCE(v_old_score, v_new_score),
        v_trend,
        NOW(),
        jsonb_build_array(jsonb_build_object('score', v_new_score, 'date', CURRENT_DATE))
    )
    ON CONFLICT (contact_id, scoring_model_id) DO UPDATE SET
        score = v_new_score,
        score_label = v_score_label,
        previous_score = lead_scores.score,
        score_change = v_new_score - lead_scores.score,
        trend_direction = v_trend,
        calculated_at = NOW(),
        score_history = (
            SELECT jsonb_agg(h) FROM (
                SELECT h FROM jsonb_array_elements(lead_scores.score_history) h
                ORDER BY h->>'date' DESC
                LIMIT 29
            ) sub
        ) || jsonb_build_array(jsonb_build_object('score', v_new_score, 'date', CURRENT_DATE)),
        updated_at = NOW()
    RETURNING id INTO v_score_id;
    
    RETURN v_score_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TRIGGER: Update score on activity
-- ============================================================================

CREATE OR REPLACE FUNCTION trigger_update_score_on_activity()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.contact_id IS NOT NULL THEN
        PERFORM update_lead_score(NEW.contact_id);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_score_on_activity ON activities;
CREATE TRIGGER trigger_score_on_activity
    AFTER INSERT ON activities
    FOR EACH ROW
    EXECUTE FUNCTION trigger_update_score_on_activity();

-- ============================================================================
-- TRIGGER: Update score on email tracking
-- ============================================================================

CREATE OR REPLACE FUNCTION trigger_update_score_on_email_event()
RETURNS TRIGGER AS $$
DECLARE
    v_contact_id UUID;
BEGIN
    SELECT contact_id INTO v_contact_id 
    FROM email_messages WHERE id = NEW.email_message_id;
    
    IF v_contact_id IS NOT NULL THEN
        PERFORM update_lead_score(v_contact_id);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_score_on_email_event ON email_tracking_events;
CREATE TRIGGER trigger_score_on_email_event
    AFTER INSERT ON email_tracking_events
    FOR EACH ROW
    WHEN (NEW.event_type IN ('opened', 'clicked'))
    EXECUTE FUNCTION trigger_update_score_on_email_event();

-- ============================================================================
-- VIEW: Hot leads
-- ============================================================================

CREATE OR REPLACE VIEW hot_leads AS
SELECT 
    ls.*,
    c.first_name,
    c.last_name,
    c.email,
    c.company_id,
    co.name as company_name
FROM lead_scores ls
JOIN contacts c ON ls.contact_id = c.id
LEFT JOIN companies co ON c.company_id = co.id
WHERE ls.score_label = 'hot'
ORDER BY ls.score DESC, ls.calculated_at DESC;

COMMENT ON VIEW hot_leads IS 'Contacts with hot lead scores';

-- ============================================================================
-- VIEW: Score leaderboard
-- ============================================================================

CREATE OR REPLACE VIEW lead_score_summary AS
SELECT 
    organization_id,
    score_label,
    COUNT(*) as count,
    AVG(score) as avg_score,
    MAX(score) as max_score,
    COUNT(*) FILTER (WHERE trend_direction = 'up') as trending_up,
    COUNT(*) FILTER (WHERE trend_direction = 'down') as trending_down
FROM lead_scores
GROUP BY organization_id, score_label;

COMMENT ON VIEW lead_score_summary IS 'Summary of lead scores by label';

-- ============================================================================
-- SEED: Default scoring model
-- ============================================================================

INSERT INTO scoring_models (
    id,
    organization_id,
    name,
    description,
    model_type,
    scoring_factors,
    is_default,
    is_active
) 
SELECT 
    uuid_generate_v4(),
    o.id,
    'Default Lead Scoring',
    'Standard scoring based on engagement and activity',
    'rule_based',
    '[
        {"factor": "activity_count", "weight": 5, "threshold": 10},
        {"factor": "email_engagement", "weight": 3, "threshold": 5},
        {"factor": "meeting_count", "weight": 15, "threshold": 3},
        {"factor": "deal_association", "weight": 20, "threshold": 1}
    ]'::jsonb,
    TRUE,
    TRUE
FROM organizations o
WHERE NOT EXISTS (
    SELECT 1 FROM scoring_models sm WHERE sm.organization_id = o.id
)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

ALTER TABLE scoring_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE scoring_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS scoring_models_org_isolation ON scoring_models;
CREATE POLICY scoring_models_org_isolation ON scoring_models
    FOR ALL
    USING (organization_id IN (
        SELECT organization_id FROM organization_members 
        WHERE user_id = auth.uid()
    ));

DROP POLICY IF EXISTS lead_scores_org_isolation ON lead_scores;
CREATE POLICY lead_scores_org_isolation ON lead_scores
    FOR ALL
    USING (organization_id IN (
        SELECT organization_id FROM organization_members 
        WHERE user_id = auth.uid()
    ));

DROP POLICY IF EXISTS scoring_events_org_isolation ON scoring_events;
CREATE POLICY scoring_events_org_isolation ON scoring_events
    FOR ALL
    USING (organization_id IN (
        SELECT organization_id FROM organization_members 
        WHERE user_id = auth.uid()
    ));
