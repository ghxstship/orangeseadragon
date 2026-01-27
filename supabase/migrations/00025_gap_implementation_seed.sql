-- Seed Data: Gap Implementation Lookup Tables
-- Provides default values for the new lookup tables

-- ============================================================================
-- REGISTRATION TYPES
-- ============================================================================

INSERT INTO registration_types (organization_id, code, name, description, color, sort_order)
SELECT o.id, t.code, t.name, t.description, t.color, t.sort_order
FROM organizations o
CROSS JOIN (VALUES
    ('general', 'General Admission', 'Standard event registration', '#6B7280', 1),
    ('vip', 'VIP', 'VIP access with premium benefits', '#8B5CF6', 2),
    ('press', 'Press/Media', 'Press and media credentials', '#3B82F6', 3),
    ('speaker', 'Speaker', 'Event speakers and presenters', '#10B981', 4),
    ('sponsor', 'Sponsor', 'Sponsor representatives', '#F59E0B', 5),
    ('exhibitor', 'Exhibitor', 'Exhibitor booth staff', '#EC4899', 6),
    ('staff', 'Staff', 'Event staff and crew', '#EF4444', 7),
    ('volunteer', 'Volunteer', 'Event volunteers', '#14B8A6', 8),
    ('complimentary', 'Complimentary', 'Complimentary guest passes', '#6366F1', 9)
) AS t(code, name, description, color, sort_order)
ON CONFLICT (organization_id, code) DO NOTHING;

-- ============================================================================
-- TALENT TYPES
-- ============================================================================

INSERT INTO talent_types (organization_id, code, name, description, color, sort_order)
SELECT o.id, t.code, t.name, t.description, t.color, t.sort_order
FROM organizations o
CROSS JOIN (VALUES
    ('speaker', 'Speaker', 'Conference speakers and presenters', '#3B82F6', 1),
    ('performer', 'Performer', 'Musical performers and bands', '#8B5CF6', 2),
    ('artist', 'Artist', 'Visual and performing artists', '#EC4899', 3),
    ('dj', 'DJ', 'Disc jockeys and electronic artists', '#F59E0B', 4),
    ('mc', 'MC/Host', 'Masters of ceremony and event hosts', '#10B981', 5),
    ('comedian', 'Comedian', 'Stand-up comedians and entertainers', '#EF4444', 6),
    ('instructor', 'Instructor', 'Workshop instructors and trainers', '#14B8A6', 7),
    ('panelist', 'Panelist', 'Panel discussion participants', '#6366F1', 8)
) AS t(code, name, description, color, sort_order)
ON CONFLICT (organization_id, code) DO NOTHING;

-- ============================================================================
-- TALENT ROLES
-- ============================================================================

INSERT INTO talent_roles (organization_id, code, name, description, sort_order)
SELECT o.id, t.code, t.name, t.description, t.sort_order
FROM organizations o
CROSS JOIN (VALUES
    ('keynote', 'Keynote Speaker', 'Main keynote presentation', 1),
    ('presenter', 'Presenter', 'Session presenter', 2),
    ('panelist', 'Panelist', 'Panel discussion participant', 3),
    ('moderator', 'Moderator', 'Panel or session moderator', 4),
    ('headliner', 'Headliner', 'Main stage headlining act', 5),
    ('opener', 'Opening Act', 'Opening performance', 6),
    ('support', 'Support Act', 'Supporting performance', 7),
    ('host', 'Host', 'Event or stage host', 8),
    ('workshop_lead', 'Workshop Lead', 'Workshop facilitator', 9),
    ('guest', 'Special Guest', 'Special guest appearance', 10)
) AS t(code, name, description, sort_order)
ON CONFLICT (organization_id, code) DO NOTHING;

-- ============================================================================
-- PARTNER TYPES
-- ============================================================================

INSERT INTO partner_types (organization_id, code, name, description, color, sort_order)
SELECT o.id, t.code, t.name, t.description, t.color, t.sort_order
FROM organizations o
CROSS JOIN (VALUES
    ('sponsor', 'Sponsor', 'Event sponsors providing financial support', '#F59E0B', 1),
    ('exhibitor', 'Exhibitor', 'Companies with exhibition booths', '#8B5CF6', 2),
    ('vendor', 'Vendor', 'Service and product vendors', '#3B82F6', 3),
    ('media', 'Media Partner', 'Media and press partners', '#EC4899', 4),
    ('community', 'Community Partner', 'Community organization partners', '#10B981', 5),
    ('technology', 'Technology Partner', 'Technology and platform partners', '#6366F1', 6),
    ('venue', 'Venue Partner', 'Venue and location partners', '#EF4444', 7)
) AS t(code, name, description, color, sort_order)
ON CONFLICT (organization_id, code) DO NOTHING;

-- ============================================================================
-- SPONSORSHIP LEVELS
-- ============================================================================

INSERT INTO sponsorship_levels (organization_id, code, name, description, color, sort_order)
SELECT o.id, t.code, t.name, t.description, t.color, t.sort_order
FROM organizations o
CROSS JOIN (VALUES
    ('title', 'Title Sponsor', 'Exclusive title sponsorship', '#FFD700', 1),
    ('platinum', 'Platinum', 'Platinum level sponsorship', '#E5E4E2', 2),
    ('gold', 'Gold', 'Gold level sponsorship', '#FFD700', 3),
    ('silver', 'Silver', 'Silver level sponsorship', '#C0C0C0', 4),
    ('bronze', 'Bronze', 'Bronze level sponsorship', '#CD7F32', 5),
    ('supporting', 'Supporting', 'Supporting sponsor', '#6B7280', 6),
    ('in_kind', 'In-Kind', 'In-kind sponsorship', '#9CA3AF', 7)
) AS t(code, name, description, color, sort_order)
ON CONFLICT (organization_id, code) DO NOTHING;

-- ============================================================================
-- CREDENTIAL TYPES
-- ============================================================================

INSERT INTO credential_types (organization_id, code, name, description, color, access_level, sort_order)
SELECT o.id, t.code, t.name, t.description, t.color, t.access_level, t.sort_order
FROM organizations o
CROSS JOIN (VALUES
    ('all_access', 'All Access', 'Full access to all areas', '#8B5CF6', 100, 1),
    ('backstage', 'Backstage', 'Backstage and production areas', '#EF4444', 80, 2),
    ('vip', 'VIP', 'VIP areas and lounges', '#F59E0B', 60, 3),
    ('press', 'Press', 'Press areas and media center', '#3B82F6', 50, 4),
    ('exhibitor', 'Exhibitor', 'Exhibition hall and booth areas', '#EC4899', 40, 5),
    ('general', 'General', 'General admission areas', '#10B981', 20, 6),
    ('staff', 'Staff', 'Staff and crew areas', '#6366F1', 70, 7),
    ('vendor', 'Vendor', 'Vendor service areas', '#14B8A6', 30, 8)
) AS t(code, name, description, color, access_level, sort_order)
ON CONFLICT (organization_id, code) DO NOTHING;

-- ============================================================================
-- LEAVE TYPES
-- ============================================================================

INSERT INTO leave_types (organization_id, code, name, description, color, requires_approval, requires_documentation, max_days_per_year, is_paid, sort_order)
SELECT o.id, t.code, t.name, t.description, t.color, t.requires_approval, t.requires_documentation, t.max_days_per_year, t.is_paid, t.sort_order
FROM organizations o
CROSS JOIN (VALUES
    ('vacation', 'Vacation', 'Annual vacation leave', '#10B981', true, false, 20, true, 1),
    ('sick', 'Sick Leave', 'Illness and medical appointments', '#EF4444', false, true, 10, true, 2),
    ('personal', 'Personal', 'Personal time off', '#3B82F6', true, false, 5, true, 3),
    ('bereavement', 'Bereavement', 'Family bereavement leave', '#6B7280', false, false, 5, true, 4),
    ('parental', 'Parental', 'Parental and family leave', '#EC4899', true, true, 60, true, 5),
    ('jury_duty', 'Jury Duty', 'Jury duty and civic obligations', '#8B5CF6', false, true, NULL, true, 6),
    ('unpaid', 'Unpaid Leave', 'Unpaid time off', '#9CA3AF', true, false, NULL, false, 7),
    ('comp_time', 'Comp Time', 'Compensatory time off', '#F59E0B', true, false, NULL, true, 8)
) AS t(code, name, description, color, requires_approval, requires_documentation, max_days_per_year, is_paid, sort_order)
ON CONFLICT (organization_id, code) DO NOTHING;

-- ============================================================================
-- TICKET CATEGORIES (Support)
-- ============================================================================

INSERT INTO ticket_categories (organization_id, code, name, description, color, default_priority, sla_hours, sort_order)
SELECT o.id, t.code, t.name, t.description, t.color, t.default_priority, t.sla_hours, t.sort_order
FROM organizations o
CROSS JOIN (VALUES
    ('registration', 'Registration', 'Registration and ticketing issues', '#3B82F6', 'high', 4, 1),
    ('payment', 'Payment', 'Payment and refund inquiries', '#EF4444', 'high', 4, 2),
    ('access', 'Access', 'Access and credential issues', '#F59E0B', 'medium', 8, 3),
    ('technical', 'Technical', 'Technical and platform issues', '#8B5CF6', 'medium', 8, 4),
    ('general', 'General Inquiry', 'General questions and information', '#10B981', 'low', 24, 5),
    ('feedback', 'Feedback', 'Feedback and suggestions', '#6B7280', 'low', 48, 6),
    ('complaint', 'Complaint', 'Complaints and escalations', '#EC4899', 'urgent', 2, 7)
) AS t(code, name, description, color, default_priority, sla_hours, sort_order)
ON CONFLICT (organization_id, code) DO NOTHING;

-- ============================================================================
-- ACCOUNT TYPES (GL)
-- ============================================================================

INSERT INTO account_types (organization_id, code, name, category, normal_balance, description, sort_order)
SELECT o.id, t.code, t.name, t.category, t.normal_balance, t.description, t.sort_order
FROM organizations o
CROSS JOIN (VALUES
    ('cash', 'Cash & Bank', 'asset', 'debit', 'Cash and bank accounts', 1),
    ('ar', 'Accounts Receivable', 'asset', 'debit', 'Money owed to the organization', 2),
    ('inventory', 'Inventory', 'asset', 'debit', 'Inventory and stock', 3),
    ('prepaid', 'Prepaid Expenses', 'asset', 'debit', 'Prepaid expenses and deposits', 4),
    ('fixed_asset', 'Fixed Assets', 'asset', 'debit', 'Property, equipment, and other fixed assets', 5),
    ('ap', 'Accounts Payable', 'liability', 'credit', 'Money owed to vendors', 6),
    ('accrued', 'Accrued Liabilities', 'liability', 'credit', 'Accrued expenses', 7),
    ('deferred_revenue', 'Deferred Revenue', 'liability', 'credit', 'Revenue received but not yet earned', 8),
    ('long_term_debt', 'Long-term Debt', 'liability', 'credit', 'Long-term loans and obligations', 9),
    ('equity', 'Equity', 'equity', 'credit', 'Owner equity and retained earnings', 10),
    ('revenue', 'Revenue', 'revenue', 'credit', 'Income from operations', 11),
    ('other_income', 'Other Income', 'revenue', 'credit', 'Non-operating income', 12),
    ('cogs', 'Cost of Goods Sold', 'expense', 'debit', 'Direct costs of goods sold', 13),
    ('operating_expense', 'Operating Expenses', 'expense', 'debit', 'General operating expenses', 14),
    ('payroll', 'Payroll Expenses', 'expense', 'debit', 'Wages, salaries, and benefits', 15),
    ('other_expense', 'Other Expenses', 'expense', 'debit', 'Non-operating expenses', 16)
) AS t(code, name, category, normal_balance, description, sort_order)
ON CONFLICT (organization_id, code) DO NOTHING;

-- ============================================================================
-- DEFAULT STATUSES FOR NEW DOMAINS
-- ============================================================================

-- Registration statuses
INSERT INTO statuses (organization_id, domain, code, name, color, is_default, sort_order)
SELECT o.id, 'registration', t.code, t.name, t.color, t.is_default, t.sort_order
FROM organizations o
CROSS JOIN (VALUES
    ('pending', 'Pending', '#F59E0B', true, 1),
    ('confirmed', 'Confirmed', '#10B981', false, 2),
    ('checked_in', 'Checked In', '#3B82F6', false, 3),
    ('cancelled', 'Cancelled', '#EF4444', false, 4),
    ('refunded', 'Refunded', '#6B7280', false, 5)
) AS t(code, name, color, is_default, sort_order)
ON CONFLICT DO NOTHING;

-- Talent statuses
INSERT INTO statuses (organization_id, domain, code, name, color, is_default, sort_order)
SELECT o.id, 'talent', t.code, t.name, t.color, t.is_default, t.sort_order
FROM organizations o
CROSS JOIN (VALUES
    ('active', 'Active', '#10B981', true, 1),
    ('inactive', 'Inactive', '#6B7280', false, 2),
    ('pending', 'Pending Approval', '#F59E0B', false, 3)
) AS t(code, name, color, is_default, sort_order)
ON CONFLICT DO NOTHING;

-- Partner statuses
INSERT INTO statuses (organization_id, domain, code, name, color, is_default, sort_order)
SELECT o.id, 'partner', t.code, t.name, t.color, t.is_default, t.sort_order
FROM organizations o
CROSS JOIN (VALUES
    ('prospect', 'Prospect', '#6B7280', true, 1),
    ('negotiating', 'Negotiating', '#F59E0B', false, 2),
    ('confirmed', 'Confirmed', '#10B981', false, 3),
    ('active', 'Active', '#3B82F6', false, 4),
    ('completed', 'Completed', '#8B5CF6', false, 5),
    ('cancelled', 'Cancelled', '#EF4444', false, 6)
) AS t(code, name, color, is_default, sort_order)
ON CONFLICT DO NOTHING;

-- Credential statuses
INSERT INTO statuses (organization_id, domain, code, name, color, is_default, sort_order)
SELECT o.id, 'credential', t.code, t.name, t.color, t.is_default, t.sort_order
FROM organizations o
CROSS JOIN (VALUES
    ('pending', 'Pending', '#F59E0B', true, 1),
    ('active', 'Active', '#10B981', false, 2),
    ('suspended', 'Suspended', '#EF4444', false, 3),
    ('revoked', 'Revoked', '#6B7280', false, 4),
    ('expired', 'Expired', '#9CA3AF', false, 5)
) AS t(code, name, color, is_default, sort_order)
ON CONFLICT DO NOTHING;

-- Session talent statuses
INSERT INTO statuses (organization_id, domain, code, name, color, is_default, sort_order)
SELECT o.id, 'session_talent', t.code, t.name, t.color, t.is_default, t.sort_order
FROM organizations o
CROSS JOIN (VALUES
    ('invited', 'Invited', '#F59E0B', true, 1),
    ('confirmed', 'Confirmed', '#10B981', false, 2),
    ('declined', 'Declined', '#EF4444', false, 3),
    ('cancelled', 'Cancelled', '#6B7280', false, 4)
) AS t(code, name, color, is_default, sort_order)
ON CONFLICT DO NOTHING;
