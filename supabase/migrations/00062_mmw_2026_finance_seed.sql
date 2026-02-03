-- ============================================================================
-- MIAMI MUSIC WEEK 2026 - FINANCE SEED DATA (Part 4)
-- Budgets, Budget Categories, Invoices, Expenses
-- ============================================================================

-- Budget Categories
INSERT INTO budget_categories (id, organization_id, name, slug, description, category_type, is_active) VALUES
('10000000-0000-0000-0060-000000000001', '10000000-0000-0000-0000-000000000001', 'Talent Fees', 'talent-fees', 'Artist booking fees and deposits', 'expense', true),
('10000000-0000-0000-0060-000000000002', '10000000-0000-0000-0000-000000000001', 'Production', 'production', 'Stage, sound, lighting, video production', 'expense', true),
('10000000-0000-0000-0060-000000000003', '10000000-0000-0000-0000-000000000001', 'Venue Rental', 'venue-rental', 'Venue hire and facility fees', 'expense', true),
('10000000-0000-0000-0060-000000000004', '10000000-0000-0000-0000-000000000001', 'Marketing', 'marketing', 'Advertising, PR, social media', 'expense', true),
('10000000-0000-0000-0060-000000000005', '10000000-0000-0000-0000-000000000001', 'Operations', 'operations', 'Security, medical, logistics', 'expense', true),
('10000000-0000-0000-0060-000000000006', '10000000-0000-0000-0000-000000000001', 'Hospitality', 'hospitality', 'Artist hospitality, catering, travel', 'expense', true),
('10000000-0000-0000-0060-000000000007', '10000000-0000-0000-0000-000000000001', 'Staffing', 'staffing', 'Crew wages and contractor fees', 'expense', true),
('10000000-0000-0000-0060-000000000008', '10000000-0000-0000-0000-000000000001', 'Insurance', 'insurance', 'Event insurance and liability', 'expense', true),
('10000000-0000-0000-0060-000000000009', '10000000-0000-0000-0000-000000000001', 'Permits', 'permits', 'City permits and licenses', 'expense', true),
('10000000-0000-0000-0060-000000000010', '10000000-0000-0000-0000-000000000001', 'Ticket Sales', 'ticket-sales', 'Revenue from ticket sales', 'income', true),
('10000000-0000-0000-0060-000000000011', '10000000-0000-0000-0000-000000000001', 'Sponsorship', 'sponsorship', 'Sponsor revenue and partnerships', 'income', true),
('10000000-0000-0000-0060-000000000012', '10000000-0000-0000-0000-000000000001', 'VIP Services', 'vip-services', 'VIP table sales and upgrades', 'income', true),
('10000000-0000-0000-0060-000000000013', '10000000-0000-0000-0000-000000000001', 'Merchandise', 'merchandise', 'Merchandise sales', 'income', true),
('10000000-0000-0000-0060-000000000014', '10000000-0000-0000-0000-000000000001', 'F&B Revenue', 'fb-revenue', 'Food and beverage revenue share', 'income', true)
ON CONFLICT (id) DO NOTHING;

-- Budgets
INSERT INTO budgets (id, organization_id, project_id, name, description, period_type, start_date, end_date, total_amount, currency, status) VALUES
('10000000-0000-0000-0061-000000000001', '10000000-0000-0000-0000-000000000001', '10000000-0000-0000-0010-000000000001', 'Ultra 2026 Master Budget', 'Master budget for Ultra Music Festival 2026', 'project', '2026-01-01', '2026-04-30', 25000000, 'USD', 'approved'),
('10000000-0000-0000-0061-000000000002', '10000000-0000-0000-0000-000000000001', '10000000-0000-0000-0010-000000000002', 'WMC 2026 Budget', 'Winter Music Conference 2026 budget', 'project', '2026-01-01', '2026-04-30', 2500000, 'USD', 'approved'),
('10000000-0000-0000-0061-000000000003', '10000000-0000-0000-0000-000000000001', '10000000-0000-0000-0010-000000000003', 'Factory Town MMW Budget', 'Factory Town MMW series budget', 'project', '2026-01-01', '2026-04-30', 1500000, 'USD', 'approved'),
('10000000-0000-0000-0061-000000000004', '10000000-0000-0000-0000-000000000001', '10000000-0000-0000-0010-000000000004', 'Space Miami MMW Budget', 'Space Miami MMW series budget', 'project', '2026-01-01', '2026-04-30', 800000, 'USD', 'approved'),
('10000000-0000-0000-0061-000000000005', '10000000-0000-0000-0000-000000000001', '10000000-0000-0000-0010-000000000005', 'Pool Parties Budget', 'MMW Pool Party series budget', 'project', '2026-01-01', '2026-04-30', 600000, 'USD', 'draft')
ON CONFLICT (id) DO NOTHING;

-- Companies (Vendors/Partners - sponsors use 'partner' type)
INSERT INTO companies (id, organization_id, name, company_type, industry, website, email, phone, is_active) VALUES
('10000000-0000-0000-0069-000000000001', '10000000-0000-0000-0000-000000000001', 'PRG Lighting', 'vendor', 'Production Services', 'https://prg.com', 'info@prg.com', '+1 (305) 555-1001', true),
('10000000-0000-0000-0069-000000000002', '10000000-0000-0000-0000-000000000001', 'Clair Global', 'vendor', 'Audio Services', 'https://clairglobal.com', 'info@clairglobal.com', '+1 (305) 555-1002', true),
('10000000-0000-0000-0069-000000000003', '10000000-0000-0000-0000-000000000001', 'TAIT Towers', 'vendor', 'Staging', 'https://taittowers.com', 'info@taittowers.com', '+1 (305) 555-1003', true),
('10000000-0000-0000-0069-000000000004', '10000000-0000-0000-0000-000000000001', 'Stageco', 'vendor', 'Staging', 'https://stageco.com', 'info@stageco.com', '+1 (305) 555-1004', true),
('10000000-0000-0000-0069-000000000005', '10000000-0000-0000-0000-000000000001', 'CSC Event Security', 'vendor', 'Security', 'https://cscsecurity.com', 'info@cscsecurity.com', '+1 (305) 555-1005', true),
('10000000-0000-0000-0069-000000000006', '10000000-0000-0000-0000-000000000001', 'Heineken', 'partner', 'Beverages', 'https://heineken.com', 'sponsorship@heineken.com', '+1 (305) 555-1009', true),
('10000000-0000-0000-0069-000000000007', '10000000-0000-0000-0000-000000000001', 'Red Bull', 'partner', 'Beverages', 'https://redbull.com', 'sponsorship@redbull.com', '+1 (305) 555-1010', true)
ON CONFLICT (id) DO NOTHING;

-- Contacts (linked to companies)
INSERT INTO contacts (id, organization_id, company_id, first_name, last_name, email, phone, job_title, is_active) VALUES
('10000000-0000-0000-0070-000000000001', '10000000-0000-0000-0000-000000000001', '10000000-0000-0000-0069-000000000001', 'Mike', 'Johnson', 'mike@prg.com', '+1 (305) 555-1001', 'Account Manager', true),
('10000000-0000-0000-0070-000000000002', '10000000-0000-0000-0000-000000000001', '10000000-0000-0000-0069-000000000002', 'Sarah', 'Williams', 'sarah@clairglobal.com', '+1 (305) 555-1002', 'Project Manager', true),
('10000000-0000-0000-0070-000000000003', '10000000-0000-0000-0000-000000000001', '10000000-0000-0000-0069-000000000003', 'David', 'Chen', 'david@taittowers.com', '+1 (305) 555-1003', 'Sales Director', true),
('10000000-0000-0000-0070-000000000004', '10000000-0000-0000-0000-000000000001', '10000000-0000-0000-0069-000000000004', 'Emma', 'Brown', 'emma@stageco.com', '+1 (305) 555-1004', 'Account Executive', true),
('10000000-0000-0000-0070-000000000005', '10000000-0000-0000-0000-000000000001', '10000000-0000-0000-0069-000000000005', 'James', 'Wilson', 'james@cscsecurity.com', '+1 (305) 555-1005', 'Operations Manager', true),
('10000000-0000-0000-0070-000000000006', '10000000-0000-0000-0000-000000000001', '10000000-0000-0000-0069-000000000006', 'Mark', 'Anderson', 'mark@heineken.com', '+1 (305) 555-1009', 'Sponsorship Manager', true),
('10000000-0000-0000-0070-000000000007', '10000000-0000-0000-0000-000000000001', '10000000-0000-0000-0069-000000000007', 'Amy', 'Taylor', 'amy@redbull.com', '+1 (305) 555-1010', 'Brand Partnerships', true)
ON CONFLICT (id) DO NOTHING;

-- Invoices (direction: payable = we pay, receivable = we receive)
INSERT INTO invoices (id, organization_id, contact_id, company_id, invoice_number, direction, status, issue_date, due_date, subtotal, tax_amount, total_amount, currency, notes) VALUES
('10000000-0000-0000-0071-000000000001', '10000000-0000-0000-0000-000000000001', '10000000-0000-0000-0070-000000000001', '10000000-0000-0000-0069-000000000001', 'INV-2026-001', 'payable', 'draft', '2026-01-15', '2026-02-15', 850000, 0, 850000, 'USD', 'Main Stage lighting package'),
('10000000-0000-0000-0071-000000000002', '10000000-0000-0000-0000-000000000001', '10000000-0000-0000-0070-000000000002', '10000000-0000-0000-0069-000000000002', 'INV-2026-002', 'payable', 'draft', '2026-01-20', '2026-02-20', 1200000, 0, 1200000, 'USD', 'Festival sound system rental'),
('10000000-0000-0000-0071-000000000003', '10000000-0000-0000-0000-000000000001', '10000000-0000-0000-0070-000000000003', '10000000-0000-0000-0069-000000000003', 'INV-2026-003', 'payable', 'draft', '2026-02-01', '2026-03-01', 2500000, 0, 2500000, 'USD', 'Main Stage structure and LED walls'),
('10000000-0000-0000-0071-000000000004', '10000000-0000-0000-0000-000000000001', '10000000-0000-0000-0070-000000000005', '10000000-0000-0000-0069-000000000005', 'INV-2026-004', 'payable', 'draft', '2026-02-15', '2026-03-15', 450000, 0, 450000, 'USD', 'Security services - 3 day festival'),
('10000000-0000-0000-0071-000000000005', '10000000-0000-0000-0000-000000000001', '10000000-0000-0000-0070-000000000006', '10000000-0000-0000-0069-000000000006', 'INV-2026-005', 'receivable', 'sent', '2026-01-01', '2026-03-01', 500000, 0, 500000, 'USD', 'Heineken title sponsorship - Q1'),
('10000000-0000-0000-0071-000000000006', '10000000-0000-0000-0000-000000000001', '10000000-0000-0000-0070-000000000007', '10000000-0000-0000-0069-000000000007', 'INV-2026-006', 'receivable', 'sent', '2026-01-01', '2026-03-01', 350000, 0, 350000, 'USD', 'Red Bull activation sponsorship')
ON CONFLICT (id) DO NOTHING;

-- Note: Expenses table requires user_id which we don't have seeded yet
-- Skipping expenses seed for now - would need users first
