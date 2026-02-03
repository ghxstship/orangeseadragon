# ATLVS Database Schema - ClickUp List Format

> **Generated:** January 2026  
> **Source:** `src/lib/supabase/database.types.ts`  
> **Total Tables:** 250+  
> **Total Enums:** 120+

This document provides the complete database schema in a format that can be replicated as ClickUp lists. Each table becomes a **List**, each field becomes a **Custom Field**.

---

## Table of Contents

1. [Field Type Mapping](#field-type-mapping)
2. [Enums Reference](#enums-reference)
3. [Core Tables](#core-tables)
4. [CRM & Sales](#crm--sales)
5. [Events & Productions](#events--productions)
6. [Assets & Inventory](#assets--inventory)
7. [Finance & Accounting](#finance--accounting)
8. [HR & Workforce](#hr--workforce)
9. [Projects & Tasks](#projects--tasks)
10. [Content & Marketing](#content--marketing)
11. [System & Configuration](#system--configuration)

---

## Field Type Mapping

| Database Type | ClickUp Field Type | Notes |
|---------------|-------------------|-------|
| `string` | Text | Single line text |
| `string (uuid)` | Text | Use for IDs and foreign keys |
| `string \| null` | Text | Optional text field |
| `number` | Number | Numeric values |
| `number \| null` | Number | Optional numeric |
| `boolean` | Checkbox | True/false |
| `boolean \| null` | Checkbox | Optional checkbox |
| `string (date)` | Date | Date fields |
| `string (timestamp)` | Date | Include time |
| `Json` | Text (Long) | Store as JSON string |
| `string[]` | Labels | Multi-select or tags |
| `Enum` | Dropdown | Use enum values as options |

---

## Enums Reference

### Status Enums

#### accommodation_status
- `booked`
- `confirmed`
- `checked_in`
- `checked_out`
- `cancelled`

#### activity_type
- `call`
- `email`
- `meeting`
- `note`
- `task`
- `demo`
- `proposal`

#### alert_severity
- `critical`
- `warning`
- `info`

#### api_key_status
- `active`
- `revoked`
- `expired`

#### approval_request_status
- `pending`
- `approved`
- `rejected`
- `escalated`
- `cancelled`

#### approval_status
- `pending`
- `approved`
- `rejected`
- `revision_requested`

#### approval_workflow_type
- `single_approver`
- `any_of_list`
- `all_of_list`
- `sequential_chain`
- `parallel_chain`
- `manager_hierarchy`
- `role_based`

#### article_status
- `draft`
- `published`
- `archived`

#### asset_condition
- `excellent`
- `good`
- `fair`
- `poor`
- `broken`

#### asset_status
- `available`
- `in_use`
- `maintenance`
- `reserved`
- `retired`
- `lost`
- `damaged`

#### assignment_status
- `invited`
- `confirmed`
- `declined`
- `checked_in`
- `checked_out`
- `no_show`

#### audit_status
- `scheduled`
- `in_progress`
- `completed`
- `cancelled`

#### availability_status
- `available`
- `unavailable`
- `tentative`
- `preferred`
- `blackout`

#### billing_cycle
- `monthly`
- `quarterly`
- `annual`

#### booking_status
- `available`
- `limited`
- `unavailable`

#### budget_category_type
- `income`
- `expense`
- `capital`

#### budget_period_type
- `annual`
- `quarterly`
- `monthly`
- `project`
- `event`

#### budget_status
- `draft`
- `pending_approval`
- `approved`
- `active`
- `closed`

#### campaign_status
- `planning`
- `active`
- `paused`
- `completed`
- `cancelled`

#### campaign_type
- `launch`
- `awareness`
- `engagement`
- `conversion`
- `retention`
- `event`
- `seasonal`

#### candidate_status
- `new`
- `screening`
- `phone_screen`
- `interview`
- `assessment`
- `reference_check`
- `offer`
- `hired`
- `rejected`
- `withdrawn`

#### catering_order_type
- `greenroom`
- `crew_meal`
- `vip`
- `hospitality`
- `concession`

#### catering_status
- `pending`
- `confirmed`
- `delivered`
- `cancelled`

#### certification_status
- `pending`
- `active`
- `expired`
- `revoked`

#### challenge_status
- `draft`
- `active`
- `voting`
- `completed`
- `cancelled`

#### check_action_type
- `check_out`
- `check_in`
- `transfer`
- `reserve`
- `release`

#### checklist_status
- `not_started`
- `in_progress`
- `completed`

#### company_type
- `prospect`
- `client`
- `partner`
- `vendor`
- `competitor`

#### connection_status
- `pending`
- `accepted`
- `declined`
- `blocked`

#### contract_status
- `draft`
- `pending_review`
- `pending_signature`
- `active`
- `expired`
- `terminated`
- `renewed`

#### contract_type
- `vendor`
- `client`
- `employment`
- `nda`
- `service`
- `licensing`
- `rental`
- `sponsorship`

#### crew_call_status
- `draft`
- `published`
- `confirmed`
- `active`
- `completed`
- `cancelled`

#### deal_type
- `new_business`
- `expansion`
- `renewal`
- `other`

#### document_status
- `draft`
- `published`
- `archived`

#### email_status
- `draft`
- `scheduled`
- `sending`
- `sent`
- `failed`

#### event_phase
- `concept`
- `planning`
- `pre_production`
- `setup`
- `active`
- `live`
- `teardown`
- `post_mortem`
- `archived`

#### event_type
- `festival`
- `conference`
- `concert`
- `activation`
- `corporate`
- `wedding`
- `private`
- `tour`
- `production`

#### expense_status
- `draft`
- `submitted`
- `pending_approval`
- `approved`
- `rejected`
- `reimbursed`

#### form_status
- `draft`
- `active`
- `closed`
- `archived`

#### guest_entry_status
- `pending`
- `confirmed`
- `checked_in`
- `no_show`

#### guest_list_status
- `draft`
- `active`
- `closed`

#### guest_list_type
- `vip`
- `artist`
- `media`
- `sponsor`
- `staff`
- `comp`

#### hospitality_status
- `pending`
- `approved`
- `fulfilled`
- `cancelled`

#### import_status
- `pending`
- `processing`
- `completed`
- `failed`
- `cancelled`

#### inspection_status
- `scheduled`
- `in_progress`
- `passed`
- `failed`
- `conditional`
- `cancelled`

#### invoice_direction
- `receivable`
- `payable`

#### invoice_status
- `draft`
- `sent`
- `viewed`
- `partially_paid`
- `paid`
- `overdue`
- `cancelled`
- `disputed`

#### invoice_type
- `standard`
- `credit`
- `proforma`
- `recurring`

#### maintenance_status
- `scheduled`
- `in_progress`
- `completed`
- `cancelled`

#### maintenance_type
- `preventive`
- `corrective`
- `inspection`
- `calibration`

#### member_status
- `active`
- `invited`
- `suspended`
- `deactivated`

#### payment_method
- `bank_transfer`
- `credit_card`
- `check`
- `cash`
- `paypal`
- `stripe`
- `other`

#### payment_status
- `pending`
- `processing`
- `completed`
- `failed`
- `refunded`

#### permit_status
- `not_required`
- `pending`
- `submitted`
- `under_review`
- `approved`
- `denied`
- `expired`
- `revoked`

#### po_status
- `draft`
- `sent`
- `acknowledged`
- `partially_received`
- `received`
- `invoiced`
- `paid`
- `cancelled`

#### priority_level
- `critical`
- `high`
- `medium`
- `low`

#### production_health
- `on_track`
- `at_risk`
- `critical`
- `blocked`

#### production_status
- `intake`
- `scoping`
- `proposal`
- `awarded`
- `design`
- `fabrication`
- `deployment`
- `installation`
- `show`
- `strike`
- `closeout`
- `archived`

#### project_status
- `draft`
- `planning`
- `active`
- `on_hold`
- `completed`
- `cancelled`
- `archived`

#### proposal_status
- `draft`
- `sent`
- `viewed`
- `accepted`
- `rejected`
- `expired`

#### rider_status
- `draft`
- `submitted`
- `approved`
- `signed`

#### risk_level
- `critical`
- `high`
- `medium`
- `low`
- `negligible`

#### runsheet_status
- `draft`
- `approved`
- `active`
- `locked`

#### shipment_status
- `draft`
- `pending`
- `packed`
- `in_transit`
- `delivered`
- `partially_received`
- `received`
- `returned`
- `cancelled`

#### shift_status
- `scheduled`
- `confirmed`
- `in_progress`
- `completed`
- `cancelled`
- `no_show`

#### subscription_status
- `active`
- `past_due`
- `cancelled`
- `trialing`

#### subscription_tier
- `core`
- `pro`
- `enterprise`

#### support_ticket_status
- `new`
- `open`
- `pending`
- `on_hold`
- `solved`
- `closed`

#### talent_booking_status
- `inquiry`
- `negotiating`
- `confirmed`
- `contracted`
- `cancelled`
- `completed`

#### talent_payment_status
- `pending`
- `processing`
- `completed`
- `failed`
- `cancelled`

#### talent_type
- `dj`
- `band`
- `solo_artist`
- `speaker`
- `mc`
- `performer`
- `comedian`
- `other`

#### task_priority
- `urgent`
- `high`
- `medium`
- `low`
- `none`

#### task_status
- `backlog`
- `todo`
- `in_progress`
- `in_review`
- `blocked`
- `done`
- `cancelled`

#### task_type
- `task`
- `bug`
- `feature`
- `epic`
- `story`
- `milestone`

#### ticket_status
- `reserved`
- `purchased`
- `checked_in`
- `cancelled`
- `refunded`
- `transferred`

#### timesheet_status
- `draft`
- `submitted`
- `approved`
- `rejected`
- `paid`

#### transport_status
- `booked`
- `confirmed`
- `in_transit`
- `completed`
- `cancelled`

#### travel_status
- `draft`
- `submitted`
- `approved`
- `booked`
- `in_progress`
- `completed`
- `cancelled`

#### venue_type
- `indoor`
- `outdoor`
- `hybrid`
- `virtual`

#### visibility_type
- `private`
- `team`
- `organization`
- `public`

#### webhook_status
- `active`
- `paused`
- `failed`

#### work_order_status
- `draft`
- `scheduled`
- `in_progress`
- `on_hold`
- `completed`
- `verified`
- `cancelled`

#### workflow_run_status
- `pending`
- `running`
- `completed`
- `failed`
- `cancelled`

---

## Core Tables

### organizations
**Description:** Multi-tenant organization records

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | Text (UUID) | ✓ | Primary Key |
| name | Text | ✓ | Organization name |
| slug | Text | ✓ | URL-friendly identifier |
| description | Text | | |
| logo_url | Text | | |
| website | Text | | |
| email | Email | | |
| phone | Phone | | |
| address | Text | | |
| timezone | Text | | |
| currency | Text | | Default currency code |
| settings | Text (JSON) | | Organization settings |
| is_active | Checkbox | | Default: true |
| created_at | Date | | Auto-generated |
| updated_at | Date | | Auto-updated |

**Relationships:** Parent of most other tables via `organization_id`

---

### users
**Description:** System users with authentication

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | Text (UUID) | ✓ | Primary Key |
| email | Email | ✓ | Unique |
| first_name | Text | | |
| last_name | Text | | |
| display_name | Text | | |
| avatar_url | Text | | |
| phone | Phone | | |
| timezone | Text | | |
| locale | Text | | |
| is_active | Checkbox | | |
| last_login_at | Date | | |
| created_at | Date | | |
| updated_at | Date | | |

**Relationships:** Referenced by most tables for `created_by`, `assigned_to`, etc.

---

### user_profiles
**Description:** Extended user profile information

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | Text (UUID) | ✓ | Primary Key |
| user_id | Text (UUID) | ✓ | FK → users |
| organization_id | Text (UUID) | ✓ | FK → organizations |
| job_title | Text | | |
| department | Text | | |
| bio | Text (Long) | | |
| skills | Labels | | |
| certifications | Text (JSON) | | |
| emergency_contact | Text (JSON) | | |
| created_at | Date | | |
| updated_at | Date | | |

---

### user_roles
**Description:** User role assignments

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | Text (UUID) | ✓ | Primary Key |
| user_id | Text (UUID) | ✓ | FK → users |
| role_id | Text (UUID) | ✓ | FK → roles |
| organization_id | Text (UUID) | ✓ | FK → organizations |
| assigned_by | Text (UUID) | | FK → users |
| assigned_at | Date | | |
| expires_at | Date | | |
| is_active | Checkbox | | |

---

### roles
**Description:** Role definitions with permissions

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | Text (UUID) | ✓ | Primary Key |
| name | Text | ✓ | |
| slug | Text | ✓ | |
| description | Text | | |
| permissions | Text (JSON) | | |
| is_system | Checkbox | | Cannot be deleted |
| organization_id | Text (UUID) | | FK → organizations |
| created_at | Date | | |
| updated_at | Date | | |

---

### departments
**Description:** Organizational departments

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | Text (UUID) | ✓ | Primary Key |
| name | Text | ✓ | |
| code | Text | | |
| description | Text | | |
| parent_id | Text (UUID) | | FK → departments (self) |
| manager_id | Text (UUID) | | FK → users |
| organization_id | Text (UUID) | ✓ | FK → organizations |
| is_active | Checkbox | | |
| created_at | Date | | |
| updated_at | Date | | |

---

### teams
**Description:** Cross-functional teams

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | Text (UUID) | ✓ | Primary Key |
| name | Text | ✓ | |
| description | Text | | |
| lead_id | Text (UUID) | | FK → users |
| department_id | Text (UUID) | | FK → departments |
| organization_id | Text (UUID) | ✓ | FK → organizations |
| is_active | Checkbox | | |
| created_at | Date | | |
| updated_at | Date | | |

---

### addresses
**Description:** Reusable address records

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | Text (UUID) | ✓ | Primary Key |
| label | Text | | e.g., "Main Office" |
| address_type | Text | | |
| street_line_1 | Text | ✓ | |
| street_line_2 | Text | | |
| city | Text | ✓ | |
| state_province | Text | | |
| postal_code | Text | | |
| country | Text | | |
| country_code | Text | | ISO code |
| latitude | Number | | |
| longitude | Number | | |
| is_verified | Checkbox | | |
| verified_at | Date | | |
| verification_source | Text | | |
| notes | Text | | |
| organization_id | Text (UUID) | ✓ | FK → organizations |
| is_active | Checkbox | | |
| created_at | Date | | |
| updated_at | Date | | |

---

### tags
**Description:** Flexible tagging system

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | Text (UUID) | ✓ | Primary Key |
| name | Text | ✓ | |
| slug | Text | ✓ | |
| color | Text | | Hex color |
| description | Text | | |
| organization_id | Text (UUID) | ✓ | FK → organizations |
| created_at | Date | | |

---

### entity_tags
**Description:** Tag assignments to entities

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | Text (UUID) | ✓ | Primary Key |
| tag_id | Text (UUID) | ✓ | FK → tags |
| entity_type | Text | ✓ | Table name |
| entity_id | Text (UUID) | ✓ | Record ID |
| created_at | Date | | |

---

### statuses
**Description:** Configurable status definitions

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | Text (UUID) | ✓ | Primary Key |
| name | Text | ✓ | |
| slug | Text | ✓ | |
| color | Text | | Hex color |
| icon | Text | | Icon name |
| entity_type | Text | ✓ | Which table uses this |
| position | Number | | Sort order |
| is_default | Checkbox | | |
| is_final | Checkbox | | End state |
| organization_id | Text (UUID) | ✓ | FK → organizations |
| created_at | Date | | |
| updated_at | Date | | |

---

## CRM & Sales

### companies
**Description:** Client, vendor, and partner companies

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | Text (UUID) | ✓ | Primary Key |
| name | Text | ✓ | |
| legal_name | Text | | |
| company_type | Dropdown | | Enum: company_type |
| industry | Text | | |
| website | Text | | |
| email | Email | | |
| phone | Phone | | |
| address_id | Text (UUID) | | FK → addresses |
| billing_address_id | Text (UUID) | | FK → addresses |
| tax_id | Text | | |
| logo_url | Text | | |
| description | Text | | |
| notes | Text (Long) | | |
| annual_revenue | Number | | |
| employee_count | Number | | |
| owner_id | Text (UUID) | | FK → users |
| parent_company_id | Text (UUID) | | FK → companies (self) |
| organization_id | Text (UUID) | ✓ | FK → organizations |
| is_active | Checkbox | | |
| created_by | Text (UUID) | | FK → users |
| created_at | Date | | |
| updated_at | Date | | |

---

### contacts
**Description:** Individual contact records

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | Text (UUID) | ✓ | Primary Key |
| first_name | Text | ✓ | |
| last_name | Text | ✓ | |
| email | Email | | |
| phone | Phone | | |
| mobile | Phone | | |
| job_title | Text | | |
| department | Text | | |
| company_id | Text (UUID) | | FK → companies |
| address_id | Text (UUID) | | FK → addresses |
| avatar_url | Text | | |
| linkedin_url | Text | | |
| twitter_handle | Text | | |
| notes | Text (Long) | | |
| birthday | Date | | |
| lead_source | Text | | |
| lead_score | Number | | |
| owner_id | Text (UUID) | | FK → users |
| organization_id | Text (UUID) | ✓ | FK → organizations |
| is_active | Checkbox | | |
| do_not_contact | Checkbox | | |
| created_by | Text (UUID) | | FK → users |
| created_at | Date | | |
| updated_at | Date | | |

---

### deals
**Description:** Sales opportunities/deals

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | Text (UUID) | ✓ | Primary Key |
| name | Text | ✓ | |
| deal_type | Dropdown | | Enum: deal_type |
| amount | Number | | Deal value |
| currency | Text | | |
| probability | Number | | 0-100 |
| expected_close_date | Date | | |
| actual_close_date | Date | | |
| stage_id | Text (UUID) | | FK → pipeline_stages |
| pipeline_id | Text (UUID) | | FK → pipelines |
| company_id | Text (UUID) | | FK → companies |
| contact_id | Text (UUID) | | FK → contacts |
| owner_id | Text (UUID) | | FK → users |
| description | Text (Long) | | |
| notes | Text (Long) | | |
| lost_reason | Text | | |
| won_reason | Text | | |
| next_step | Text | | |
| next_step_date | Date | | |
| organization_id | Text (UUID) | ✓ | FK → organizations |
| created_by | Text (UUID) | | FK → users |
| created_at | Date | | |
| updated_at | Date | | |

---

### leads
**Description:** Sales leads before qualification

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | Text (UUID) | ✓ | Primary Key |
| first_name | Text | | |
| last_name | Text | | |
| email | Email | | |
| phone | Phone | | |
| company_name | Text | | |
| job_title | Text | | |
| source | Text | | |
| status | Text | | |
| score | Number | | |
| notes | Text (Long) | | |
| converted_at | Date | | |
| converted_to_contact_id | Text (UUID) | | FK → contacts |
| converted_to_deal_id | Text (UUID) | | FK → deals |
| owner_id | Text (UUID) | | FK → users |
| organization_id | Text (UUID) | ✓ | FK → organizations |
| created_by | Text (UUID) | | FK → users |
| created_at | Date | | |
| updated_at | Date | | |

---

### activities
**Description:** CRM activities (calls, emails, meetings)

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | Text (UUID) | ✓ | Primary Key |
| subject | Text | ✓ | |
| activity_type | Dropdown | ✓ | Enum: activity_type |
| description | Text (Long) | | |
| due_date | Date | | |
| is_completed | Checkbox | | |
| completed_at | Date | | |
| outcome | Text | | |
| notes | Text (Long) | | |
| contact_id | Text (UUID) | | FK → contacts |
| company_id | Text (UUID) | | FK → companies |
| deal_id | Text (UUID) | | FK → deals |
| project_id | Text (UUID) | | FK → projects |
| event_id | Text (UUID) | | FK → events |
| assigned_to | Text (UUID) | | FK → users |
| organization_id | Text (UUID) | ✓ | FK → organizations |
| created_by | Text (UUID) | | FK → users |
| created_at | Date | | |
| updated_at | Date | | |

---

### pipelines
**Description:** Sales pipeline definitions

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | Text (UUID) | ✓ | Primary Key |
| name | Text | ✓ | |
| description | Text | | |
| is_default | Checkbox | | |
| is_active | Checkbox | | |
| organization_id | Text (UUID) | ✓ | FK → organizations |
| created_at | Date | | |
| updated_at | Date | | |

---

### pipeline_stages
**Description:** Stages within pipelines

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | Text (UUID) | ✓ | Primary Key |
| name | Text | ✓ | |
| pipeline_id | Text (UUID) | ✓ | FK → pipelines |
| position | Number | | Sort order |
| probability | Number | | Default probability |
| is_won | Checkbox | | Win stage |
| is_lost | Checkbox | | Loss stage |
| color | Text | | |
| created_at | Date | | |
| updated_at | Date | | |

---

### proposals
**Description:** Sales proposals/quotes

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | Text (UUID) | ✓ | Primary Key |
| proposal_number | Text | ✓ | |
| name | Text | ✓ | |
| status | Dropdown | | Enum: proposal_status |
| deal_id | Text (UUID) | | FK → deals |
| company_id | Text (UUID) | | FK → companies |
| contact_id | Text (UUID) | | FK → contacts |
| valid_until | Date | | |
| subtotal | Number | | |
| discount_amount | Number | | |
| tax_amount | Number | | |
| total_amount | Number | | |
| currency | Text | | |
| terms | Text (Long) | | |
| notes | Text (Long) | | |
| sent_at | Date | | |
| viewed_at | Date | | |
| accepted_at | Date | | |
| rejected_at | Date | | |
| organization_id | Text (UUID) | ✓ | FK → organizations |
| created_by | Text (UUID) | | FK → users |
| created_at | Date | | |
| updated_at | Date | | |

---

### contracts
**Description:** Legal contracts and agreements

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | Text (UUID) | ✓ | Primary Key |
| contract_number | Text | ✓ | |
| name | Text | ✓ | |
| contract_type | Dropdown | | Enum: contract_type |
| status | Dropdown | | Enum: contract_status |
| counterparty_type | Dropdown | | Enum: counterparty_type |
| counterparty_id | Text (UUID) | | Polymorphic FK |
| start_date | Date | | |
| end_date | Date | | |
| value | Number | | |
| currency | Text | | |
| renewal_type | Dropdown | | Enum: renewal_type |
| renewal_date | Date | | |
| notice_period_days | Number | | |
| terms | Text (Long) | | |
| document_url | Text | | |
| signed_at | Date | | |
| signed_by | Text (UUID) | | FK → users |
| project_id | Text (UUID) | | FK → projects |
| deal_id | Text (UUID) | | FK → deals |
| organization_id | Text (UUID) | ✓ | FK → organizations |
| created_by | Text (UUID) | | FK → users |
| created_at | Date | | |
| updated_at | Date | | |

---

## Events & Productions

### events
**Description:** Events, festivals, and productions

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | Text (UUID) | ✓ | Primary Key |
| name | Text | ✓ | |
| event_code | Text | | Unique identifier |
| event_type | Dropdown | | Enum: event_type |
| phase | Dropdown | | Enum: event_phase |
| description | Text (Long) | | |
| start_date | Date | ✓ | |
| end_date | Date | ✓ | |
| doors_time | Date | | |
| start_time | Date | | |
| end_time | Date | | |
| timezone | Text | | |
| venue_id | Text (UUID) | | FK → venues |
| capacity | Number | | |
| expected_attendance | Number | | |
| actual_attendance | Number | | |
| is_public | Checkbox | | |
| is_ticketed | Checkbox | | |
| ticket_url | Text | | |
| website_url | Text | | |
| banner_image_url | Text | | |
| client_id | Text (UUID) | | FK → companies |
| project_id | Text (UUID) | | FK → projects |
| budget_id | Text (UUID) | | FK → budgets |
| notes | Text (Long) | | |
| organization_id | Text (UUID) | ✓ | FK → organizations |
| created_by | Text (UUID) | | FK → users |
| created_at | Date | | |
| updated_at | Date | | |

---

### venues
**Description:** Event venues and locations

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | Text (UUID) | ✓ | Primary Key |
| name | Text | ✓ | |
| venue_type | Dropdown | | Enum: venue_type |
| description | Text (Long) | | |
| address_id | Text (UUID) | | FK → addresses |
| capacity | Number | | |
| website | Text | | |
| phone | Phone | | |
| email | Email | | |
| contact_name | Text | | |
| amenities | Text (JSON) | | |
| technical_specs | Text (JSON) | | |
| parking_info | Text | | |
| load_in_info | Text | | |
| curfew_time | Text | | |
| notes | Text (Long) | | |
| images | Text (JSON) | | |
| floor_plan_url | Text | | |
| is_active | Checkbox | | |
| organization_id | Text (UUID) | ✓ | FK → organizations |
| created_by | Text (UUID) | | FK → users |
| created_at | Date | | |
| updated_at | Date | | |

---

### productions
**Description:** Production projects (scenic, touring, etc.)

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | Text (UUID) | ✓ | Primary Key |
| name | Text | ✓ | |
| production_code | Text | | |
| production_type | Dropdown | | Enum: production_type |
| status | Dropdown | | Enum: production_status |
| health | Dropdown | | Enum: production_health |
| description | Text (Long) | | |
| client_id | Text (UUID) | | FK → companies |
| project_id | Text (UUID) | | FK → projects |
| venue_id | Text (UUID) | | FK → venues |
| start_date | Date | | |
| end_date | Date | | |
| load_in_date | Date | | |
| load_out_date | Date | | |
| budget_amount | Number | | |
| actual_cost | Number | | |
| notes | Text (Long) | | |
| organization_id | Text (UUID) | ✓ | FK → organizations |
| created_by | Text (UUID) | | FK → users |
| created_at | Date | | |
| updated_at | Date | | |

---

### talent_profiles
**Description:** Artist/performer profiles

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | Text (UUID) | ✓ | Primary Key |
| name | Text | ✓ | Stage name |
| legal_name | Text | | |
| talent_type | Dropdown | | Enum: talent_type |
| bio | Text (Long) | | |
| genre | Text | | |
| subgenres | Labels | | |
| hometown | Text | | |
| based_in | Text | | |
| website | Text | | |
| email | Email | | |
| phone | Phone | | |
| manager_name | Text | | |
| manager_email | Email | | |
| manager_phone | Phone | | |
| agent_name | Text | | |
| agent_email | Email | | |
| agent_phone | Phone | | |
| booking_fee_min | Number | | |
| booking_fee_max | Number | | |
| currency | Text | | |
| spotify_url | Text | | |
| instagram_url | Text | | |
| facebook_url | Text | | |
| twitter_url | Text | | |
| youtube_url | Text | | |
| soundcloud_url | Text | | |
| press_kit_url | Text | | |
| photo_url | Text | | |
| notes | Text (Long) | | |
| organization_id | Text (UUID) | ✓ | FK → organizations |
| created_by | Text (UUID) | | FK → users |
| created_at | Date | | |
| updated_at | Date | | |

---

### talent_bookings
**Description:** Talent booking records

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | Text (UUID) | ✓ | Primary Key |
| booking_code | Text | | |
| talent_id | Text (UUID) | ✓ | FK → talent_profiles |
| event_id | Text (UUID) | ✓ | FK → events |
| status | Dropdown | | Enum: talent_booking_status |
| performance_type | Dropdown | | Enum: performance_type |
| set_time | Date | | |
| set_length_minutes | Number | | |
| stage_id | Text (UUID) | | FK → stages |
| fee_type | Dropdown | | Enum: fee_type |
| fee_amount | Number | | |
| deposit_amount | Number | | |
| deposit_paid | Checkbox | | |
| balance_amount | Number | | |
| balance_paid | Checkbox | | |
| currency | Text | | |
| contract_id | Text (UUID) | | FK → contracts |
| rider_id | Text (UUID) | | FK → riders |
| travel_required | Checkbox | | |
| accommodation_required | Checkbox | | |
| notes | Text (Long) | | |
| organization_id | Text (UUID) | ✓ | FK → organizations |
| created_by | Text (UUID) | | FK → users |
| created_at | Date | | |
| updated_at | Date | | |

---

### riders
**Description:** Technical and hospitality riders

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | Text (UUID) | ✓ | Primary Key |
| name | Text | ✓ | |
| rider_type | Dropdown | | Enum: rider_type |
| status | Dropdown | | Enum: rider_status |
| talent_id | Text (UUID) | | FK → talent_profiles |
| booking_id | Text (UUID) | | FK → talent_bookings |
| document_url | Text | | |
| notes | Text (Long) | | |
| organization_id | Text (UUID) | ✓ | FK → organizations |
| created_by | Text (UUID) | | FK → users |
| created_at | Date | | |
| updated_at | Date | | |

---

### stages
**Description:** Event stages/performance areas

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | Text (UUID) | ✓ | Primary Key |
| name | Text | ✓ | |
| event_id | Text (UUID) | | FK → events |
| venue_id | Text (UUID) | | FK → venues |
| capacity | Number | | |
| dimensions | Text | | |
| power_specs | Text | | |
| rigging_specs | Text | | |
| notes | Text (Long) | | |
| organization_id | Text (UUID) | ✓ | FK → organizations |
| created_at | Date | | |
| updated_at | Date | | |

---

### runsheets
**Description:** Event runsheets/schedules

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | Text (UUID) | ✓ | Primary Key |
| name | Text | ✓ | |
| event_id | Text (UUID) | ✓ | FK → events |
| stage_id | Text (UUID) | | FK → stages |
| date | Date | ✓ | |
| status | Dropdown | | Enum: runsheet_status |
| notes | Text (Long) | | |
| organization_id | Text (UUID) | ✓ | FK → organizations |
| created_by | Text (UUID) | | FK → users |
| created_at | Date | | |
| updated_at | Date | | |

---

### runsheet_items
**Description:** Individual runsheet entries

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | Text (UUID) | ✓ | Primary Key |
| runsheet_id | Text (UUID) | ✓ | FK → runsheets |
| item_type | Dropdown | | Enum: runsheet_item_type |
| status | Dropdown | | Enum: runsheet_item_status |
| name | Text | ✓ | |
| description | Text | | |
| scheduled_start | Date | ✓ | |
| scheduled_end | Date | | |
| actual_start | Date | | |
| actual_end | Date | | |
| duration_minutes | Number | | |
| talent_id | Text (UUID) | | FK → talent_profiles |
| assigned_to | Text (UUID) | | FK → users |
| notes | Text (Long) | | |
| position | Number | | Sort order |
| created_at | Date | | |
| updated_at | Date | | |

---

### crew_calls
**Description:** Crew call sheets

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | Text (UUID) | ✓ | Primary Key |
| name | Text | ✓ | |
| event_id | Text (UUID) | ✓ | FK → events |
| date | Date | ✓ | |
| call_time | Date | ✓ | |
| end_time | Date | | |
| location | Text | | |
| status | Dropdown | | Enum: crew_call_status |
| notes | Text (Long) | | |
| organization_id | Text (UUID) | ✓ | FK → organizations |
| created_by | Text (UUID) | | FK → users |
| created_at | Date | | |
| updated_at | Date | | |

---

### crew_assignments
**Description:** Crew member assignments

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | Text (UUID) | ✓ | Primary Key |
| crew_call_id | Text (UUID) | ✓ | FK → crew_calls |
| user_id | Text (UUID) | ✓ | FK → users |
| position_id | Text (UUID) | | FK → position_types |
| department_id | Text (UUID) | | FK → departments |
| status | Dropdown | | Enum: assignment_status |
| call_time | Date | | Override |
| end_time | Date | | |
| rate | Number | | |
| rate_type | Dropdown | | Enum: rate_type |
| notes | Text | | |
| checked_in_at | Date | | |
| checked_out_at | Date | | |
| organization_id | Text (UUID) | ✓ | FK → organizations |
| created_at | Date | | |
| updated_at | Date | | |

---

### guest_lists
**Description:** Event guest lists

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | Text (UUID) | ✓ | Primary Key |
| name | Text | ✓ | |
| event_id | Text (UUID) | ✓ | FK → events |
| list_type | Dropdown | | Enum: guest_list_type |
| status | Dropdown | | Enum: guest_list_status |
| max_guests | Number | | |
| notes | Text (Long) | | |
| organization_id | Text (UUID) | ✓ | FK → organizations |
| created_by | Text (UUID) | | FK → users |
| created_at | Date | | |
| updated_at | Date | | |

---

### guest_list_entries
**Description:** Individual guest list entries

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | Text (UUID) | ✓ | Primary Key |
| guest_list_id | Text (UUID) | ✓ | FK → guest_lists |
| guest_name | Text | ✓ | |
| guest_email | Email | | |
| guest_phone | Phone | | |
| plus_ones | Number | | |
| status | Dropdown | | Enum: guest_entry_status |
| checked_in_at | Date | | |
| checked_in_by | Text (UUID) | | FK → users |
| notes | Text | | |
| added_by | Text (UUID) | | FK → users |
| created_at | Date | | |
| updated_at | Date | | |

---

### accommodations
**Description:** Hotel/accommodation bookings

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | Text (UUID) | ✓ | Primary Key |
| event_id | Text (UUID) | ✓ | FK → events |
| booking_id | Text (UUID) | | FK → talent_bookings |
| hotel_name | Text | ✓ | |
| hotel_address | Text | | |
| hotel_phone | Phone | | |
| guest_name | Text | ✓ | |
| guest_email | Email | | |
| guest_phone | Phone | | |
| room_type | Text | | |
| check_in_date | Date | ✓ | |
| check_in_time | Text | | |
| check_out_date | Date | ✓ | |
| check_out_time | Text | | |
| confirmation_number | Text | | |
| nightly_rate | Number | | |
| total_cost | Number | | |
| currency | Text | | |
| payment_method | Text | | |
| status | Dropdown | | Enum: accommodation_status |
| special_requests | Text (Long) | | |
| notes | Text (Long) | | |
| organization_id | Text (UUID) | ✓ | FK → organizations |
| created_by | Text (UUID) | | FK → users |
| created_at | Date | | |
| updated_at | Date | | |

---

### transportation
**Description:** Ground transportation bookings

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | Text (UUID) | ✓ | Primary Key |
| event_id | Text (UUID) | ✓ | FK → events |
| booking_id | Text (UUID) | | FK → talent_bookings |
| transport_type | Dropdown | | Enum: transport_type |
| status | Dropdown | | Enum: transport_status |
| passenger_name | Text | ✓ | |
| passenger_count | Number | | |
| pickup_location | Text | ✓ | |
| pickup_time | Date | ✓ | |
| dropoff_location | Text | ✓ | |
| dropoff_time | Date | | |
| vehicle_type | Text | | |
| driver_name | Text | | |
| driver_phone | Phone | | |
| confirmation_number | Text | | |
| cost | Number | | |
| currency | Text | | |
| notes | Text (Long) | | |
| organization_id | Text (UUID) | ✓ | FK → organizations |
| created_by | Text (UUID) | | FK → users |
| created_at | Date | | |
| updated_at | Date | | |

---

### flights
**Description:** Flight bookings

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | Text (UUID) | ✓ | Primary Key |
| event_id | Text (UUID) | | FK → events |
| booking_id | Text (UUID) | | FK → talent_bookings |
| passenger_name | Text | ✓ | |
| airline | Text | | |
| flight_number | Text | | |
| departure_airport | Text | | |
| departure_time | Date | | |
| arrival_airport | Text | | |
| arrival_time | Date | | |
| seat_class | Text | | |
| seat_number | Text | | |
| confirmation_number | Text | | |
| ticket_number | Text | | |
| cost | Number | | |
| currency | Text | | |
| baggage_allowance | Text | | |
| notes | Text (Long) | | |
| organization_id | Text (UUID) | ✓ | FK → organizations |
| created_by | Text (UUID) | | FK → users |
| created_at | Date | | |
| updated_at | Date | | |

---

## Assets & Inventory

### assets
**Description:** Physical assets and equipment

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | Text (UUID) | ✓ | Primary Key |
| asset_tag | Text | ✓ | Unique identifier |
| name | Text | ✓ | |
| description | Text (Long) | | |
| category_id | Text (UUID) | | FK → asset_categories |
| catalog_item_id | Text (UUID) | | FK → catalog_items |
| status | Dropdown | | Enum: asset_status |
| condition | Dropdown | | Enum: asset_condition |
| serial_number | Text | | |
| barcode | Text | | |
| qr_code | Text | | |
| rfid_tag | Text | | |
| manufacturer | Text | | |
| model | Text | | |
| purchase_date | Date | | |
| purchase_price | Number | | |
| purchase_currency | Text | | |
| vendor_id | Text (UUID) | | FK → companies |
| warranty_expires | Date | | |
| location_id | Text (UUID) | | FK → locations |
| assigned_to | Text (UUID) | | FK → users |
| specifications | Text (JSON) | | |
| notes | Text (Long) | | |
| organization_id | Text (UUID) | ✓ | FK → organizations |
| created_by | Text (UUID) | | FK → users |
| created_at | Date | | |
| updated_at | Date | | |

---

### asset_categories
**Description:** Asset categorization hierarchy

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | Text (UUID) | ✓ | Primary Key |
| name | Text | ✓ | |
| slug | Text | ✓ | |
| description | Text | | |
| parent_id | Text (UUID) | | FK → asset_categories (self) |
| icon | Text | | |
| color | Text | | |
| depreciation_method | Dropdown | | Enum: depreciation_method |
| useful_life_months | Number | | |
| maintenance_interval_days | Number | | |
| custom_fields | Text (JSON) | | |
| organization_id | Text (UUID) | ✓ | FK → organizations |
| created_at | Date | | |
| updated_at | Date | | |

---

### asset_maintenance
**Description:** Maintenance records

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | Text (UUID) | ✓ | Primary Key |
| asset_id | Text (UUID) | ✓ | FK → assets |
| maintenance_type | Dropdown | | Enum: maintenance_type |
| status | Dropdown | | Enum: maintenance_status |
| scheduled_date | Date | | |
| completed_date | Date | | |
| performed_by | Text (UUID) | | FK → users |
| vendor_id | Text (UUID) | | FK → companies |
| description | Text (Long) | | |
| labor_cost | Number | | |
| parts_cost | Number | | |
| total_cost | Number | | |
| currency | Text | | |
| notes | Text (Long) | | |
| organization_id | Text (UUID) | ✓ | FK → organizations |
| created_by | Text (UUID) | | FK → users |
| created_at | Date | | |
| updated_at | Date | | |

---

### locations
**Description:** Physical storage locations

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | Text (UUID) | ✓ | Primary Key |
| name | Text | ✓ | |
| code | Text | | |
| location_type | Dropdown | | Enum: location_type |
| parent_id | Text (UUID) | | FK → locations (self) |
| address_id | Text (UUID) | | FK → addresses |
| capacity | Number | | |
| description | Text | | |
| is_active | Checkbox | | |
| organization_id | Text (UUID) | ✓ | FK → organizations |
| created_at | Date | | |
| updated_at | Date | | |

---

### inventory_items
**Description:** Consumable inventory items

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | Text (UUID) | ✓ | Primary Key |
| sku | Text | ✓ | |
| name | Text | ✓ | |
| description | Text | | |
| category_id | Text (UUID) | | FK → asset_categories |
| unit_of_measure | Text | | |
| quantity_on_hand | Number | | |
| quantity_reserved | Number | | |
| reorder_point | Number | | |
| unit_cost | Number | | |
| currency | Text | | |
| location_id | Text (UUID) | | FK → locations |
| vendor_id | Text (UUID) | | FK → companies |
| is_active | Checkbox | | |
| organization_id | Text (UUID) | ✓ | FK → organizations |
| created_at | Date | | |
| updated_at | Date | | |

---

### shipments
**Description:** Shipping/logistics records

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | Text (UUID) | ✓ | Primary Key |
| shipment_number | Text | ✓ | |
| direction | Dropdown | | Enum: shipment_direction |
| status | Dropdown | | Enum: shipment_status |
| event_id | Text (UUID) | | FK → events |
| project_id | Text (UUID) | | FK → projects |
| from_location_id | Text (UUID) | | FK → locations |
| to_location_id | Text (UUID) | | FK → locations |
| carrier_id | Text (UUID) | | FK → carriers |
| tracking_number | Text | | |
| ship_date | Date | | |
| expected_delivery | Date | | |
| actual_delivery | Date | | |
| shipping_cost | Number | | |
| currency | Text | | |
| notes | Text (Long) | | |
| organization_id | Text (UUID) | ✓ | FK → organizations |
| created_by | Text (UUID) | | FK → users |
| created_at | Date | | |
| updated_at | Date | | |

---

## Finance & Accounting

### invoices
**Description:** Invoices (AR and AP)

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | Text (UUID) | ✓ | Primary Key |
| invoice_number | Text | ✓ | |
| direction | Dropdown | | Enum: invoice_direction |
| invoice_type | Dropdown | | Enum: invoice_type |
| status | Dropdown | | Enum: invoice_status |
| company_id | Text (UUID) | | FK → companies |
| contact_id | Text (UUID) | | FK → contacts |
| project_id | Text (UUID) | | FK → projects |
| event_id | Text (UUID) | | FK → events |
| issue_date | Date | ✓ | |
| due_date | Date | ✓ | |
| subtotal | Number | | |
| discount_amount | Number | | |
| tax_amount | Number | | |
| total_amount | Number | ✓ | |
| amount_paid | Number | | |
| currency | Text | | |
| payment_terms | Text | | |
| notes | Text (Long) | | |
| sent_at | Date | | |
| paid_at | Date | | |
| organization_id | Text (UUID) | ✓ | FK → organizations |
| created_by | Text (UUID) | | FK → users |
| created_at | Date | | |
| updated_at | Date | | |

---

### expenses
**Description:** Expense records

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | Text (UUID) | ✓ | Primary Key |
| expense_number | Text | | |
| status | Dropdown | | Enum: expense_status |
| category_id | Text (UUID) | | FK → budget_categories |
| description | Text | ✓ | |
| amount | Number | ✓ | |
| currency | Text | | |
| expense_date | Date | ✓ | |
| vendor_id | Text (UUID) | | FK → companies |
| project_id | Text (UUID) | | FK → projects |
| event_id | Text (UUID) | | FK → events |
| payment_method | Dropdown | | Enum: payment_method |
| receipt_url | Text | | |
| is_billable | Checkbox | | |
| submitted_by | Text (UUID) | | FK → users |
| approved_by | Text (UUID) | | FK → users |
| notes | Text (Long) | | |
| organization_id | Text (UUID) | ✓ | FK → organizations |
| created_by | Text (UUID) | | FK → users |
| created_at | Date | | |
| updated_at | Date | | |

---

### budgets
**Description:** Budget definitions

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | Text (UUID) | ✓ | Primary Key |
| name | Text | ✓ | |
| description | Text | | |
| period_type | Dropdown | | Enum: budget_period_type |
| status | Dropdown | | Enum: budget_status |
| start_date | Date | ✓ | |
| end_date | Date | ✓ | |
| total_amount | Number | ✓ | |
| currency | Text | | |
| project_id | Text (UUID) | | FK → projects |
| event_id | Text (UUID) | | FK → events |
| department_id | Text (UUID) | | FK → departments |
| approved_by | Text (UUID) | | FK → users |
| notes | Text (Long) | | |
| organization_id | Text (UUID) | ✓ | FK → organizations |
| created_by | Text (UUID) | | FK → users |
| created_at | Date | | |
| updated_at | Date | | |

---

### purchase_orders
**Description:** Purchase orders

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | Text (UUID) | ✓ | Primary Key |
| po_number | Text | ✓ | |
| status | Dropdown | | Enum: po_status |
| vendor_id | Text (UUID) | ✓ | FK → companies |
| project_id | Text (UUID) | | FK → projects |
| event_id | Text (UUID) | | FK → events |
| order_date | Date | ✓ | |
| expected_date | Date | | |
| subtotal | Number | | |
| tax_amount | Number | | |
| total_amount | Number | | |
| currency | Text | | |
| payment_terms | Text | | |
| notes | Text (Long) | | |
| approved_by | Text (UUID) | | FK → users |
| organization_id | Text (UUID) | ✓ | FK → organizations |
| created_by | Text (UUID) | | FK → users |
| created_at | Date | | |
| updated_at | Date | | |

---

### accounts
**Description:** Chart of accounts

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | Text (UUID) | ✓ | Primary Key |
| account_code | Text | ✓ | |
| name | Text | ✓ | |
| account_type | Text | ✓ | |
| description | Text | | |
| parent_id | Text (UUID) | | FK → accounts (self) |
| balance | Number | | |
| currency | Text | | |
| is_active | Checkbox | | |
| organization_id | Text (UUID) | ✓ | FK → organizations |
| created_by | Text (UUID) | | FK → users |
| created_at | Date | | |
| updated_at | Date | | |

---

## HR & Workforce

### employee_profiles
**Description:** Employee information

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | Text (UUID) | ✓ | Primary Key |
| user_id | Text (UUID) | ✓ | FK → users |
| employee_number | Text | | |
| employment_type | Text | | |
| department_id | Text (UUID) | | FK → departments |
| manager_id | Text (UUID) | | FK → users |
| job_title | Text | | |
| hire_date | Date | | |
| termination_date | Date | | |
| work_location | Text | | |
| emergency_contact | Text (JSON) | | |
| notes | Text (Long) | | |
| organization_id | Text (UUID) | ✓ | FK → organizations |
| created_at | Date | | |
| updated_at | Date | | |

---

### timesheets
**Description:** Timesheet records

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | Text (UUID) | ✓ | Primary Key |
| user_id | Text (UUID) | ✓ | FK → users |
| period_start | Date | ✓ | |
| period_end | Date | ✓ | |
| status | Dropdown | | Enum: timesheet_status |
| total_hours | Number | | |
| regular_hours | Number | | |
| overtime_hours | Number | | |
| submitted_at | Date | | |
| approved_by | Text (UUID) | | FK → users |
| notes | Text | | |
| organization_id | Text (UUID) | ✓ | FK → organizations |
| created_at | Date | | |
| updated_at | Date | | |

---

### time_entries
**Description:** Individual time entries

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | Text (UUID) | ✓ | Primary Key |
| user_id | Text (UUID) | ✓ | FK → users |
| timesheet_id | Text (UUID) | | FK → timesheets |
| project_id | Text (UUID) | | FK → projects |
| task_id | Text (UUID) | | FK → tasks |
| event_id | Text (UUID) | | FK → events |
| date | Date | ✓ | |
| start_time | Date | | |
| end_time | Date | | |
| duration_minutes | Number | | |
| description | Text | | |
| is_billable | Checkbox | | |
| hourly_rate | Number | | |
| organization_id | Text (UUID) | ✓ | FK → organizations |
| created_at | Date | | |
| updated_at | Date | | |

---

### shifts
**Description:** Work shifts

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | Text (UUID) | ✓ | Primary Key |
| user_id | Text (UUID) | ✓ | FK → users |
| event_id | Text (UUID) | | FK → events |
| project_id | Text (UUID) | | FK → projects |
| position_id | Text (UUID) | | FK → position_types |
| department_id | Text (UUID) | | FK → departments |
| status | Dropdown | | Enum: shift_status |
| scheduled_start | Date | ✓ | |
| scheduled_end | Date | ✓ | |
| actual_start | Date | | |
| actual_end | Date | | |
| break_minutes | Number | | |
| rate | Number | | |
| rate_type | Dropdown | | Enum: rate_type |
| notes | Text | | |
| organization_id | Text (UUID) | ✓ | FK → organizations |
| created_at | Date | | |
| updated_at | Date | | |

---

## Projects & Tasks

### projects
**Description:** Project records

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | Text (UUID) | ✓ | Primary Key |
| name | Text | ✓ | |
| project_code | Text | | |
| status | Dropdown | | Enum: project_status |
| description | Text (Long) | | |
| client_id | Text (UUID) | | FK → companies |
| manager_id | Text (UUID) | | FK → users |
| department_id | Text (UUID) | | FK → departments |
| start_date | Date | | |
| end_date | Date | | |
| deadline | Date | | |
| budget_amount | Number | | |
| currency | Text | | |
| priority | Dropdown | | Enum: priority_level |
| progress_percent | Number | | 0-100 |
| is_billable | Checkbox | | |
| notes | Text (Long) | | |
| organization_id | Text (UUID) | ✓ | FK → organizations |
| created_by | Text (UUID) | | FK → users |
| created_at | Date | | |
| updated_at | Date | | |

---

### tasks
**Description:** Task records

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | Text (UUID) | ✓ | Primary Key |
| title | Text | ✓ | |
| description | Text (Long) | | |
| task_type | Dropdown | | Enum: task_type |
| status | Dropdown | | Enum: task_status |
| priority | Dropdown | | Enum: task_priority |
| project_id | Text (UUID) | | FK → projects |
| parent_id | Text (UUID) | | FK → tasks (self) |
| sprint_id | Text (UUID) | | FK → sprints |
| assigned_to | Text (UUID) | | FK → users |
| reporter_id | Text (UUID) | | FK → users |
| due_date | Date | | |
| start_date | Date | | |
| completed_at | Date | | |
| estimated_hours | Number | | |
| actual_hours | Number | | |
| story_points | Number | | |
| position | Number | | Sort order |
| tags | Labels | | |
| organization_id | Text (UUID) | ✓ | FK → organizations |
| created_by | Text (UUID) | | FK → users |
| created_at | Date | | |
| updated_at | Date | | |

---

### sprints
**Description:** Agile sprints

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | Text (UUID) | ✓ | Primary Key |
| name | Text | ✓ | |
| project_id | Text (UUID) | ✓ | FK → projects |
| goal | Text | | |
| start_date | Date | ✓ | |
| end_date | Date | ✓ | |
| status | Text | | |
| velocity | Number | | |
| notes | Text | | |
| organization_id | Text (UUID) | ✓ | FK → organizations |
| created_at | Date | | |
| updated_at | Date | | |

---

### checklists
**Description:** Task checklists

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | Text (UUID) | ✓ | Primary Key |
| name | Text | ✓ | |
| entity_type | Text | | |
| entity_id | Text (UUID) | | |
| status | Dropdown | | Enum: checklist_status |
| due_date | Date | | |
| assigned_to | Text (UUID) | | FK → users |
| completed_at | Date | | |
| notes | Text | | |
| organization_id | Text (UUID) | ✓ | FK → organizations |
| created_by | Text (UUID) | | FK → users |
| created_at | Date | | |
| updated_at | Date | | |

---

## Content & Marketing

### documents
**Description:** Document management

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | Text (UUID) | ✓ | Primary Key |
| title | Text | ✓ | |
| document_type | Dropdown | | Enum: document_type |
| status | Dropdown | | Enum: document_status |
| content | Text (Long) | | |
| file_url | Text | | |
| file_size_bytes | Number | | |
| mime_type | Text | | |
| folder_id | Text (UUID) | | FK → document_folders |
| version | Number | | |
| is_template | Checkbox | | |
| tags | Labels | | |
| organization_id | Text (UUID) | ✓ | FK → organizations |
| created_by | Text (UUID) | | FK → users |
| created_at | Date | | |
| updated_at | Date | | |

---

### campaigns
**Description:** Marketing campaigns

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | Text (UUID) | ✓ | Primary Key |
| name | Text | ✓ | |
| campaign_type | Dropdown | | Enum: campaign_type |
| status | Dropdown | | Enum: campaign_status |
| description | Text (Long) | | |
| start_date | Date | | |
| end_date | Date | | |
| budget | Number | | |
| actual_spend | Number | | |
| currency | Text | | |
| target_audience | Text | | |
| channels | Labels | | |
| owner_id | Text (UUID) | | FK → users |
| notes | Text (Long) | | |
| organization_id | Text (UUID) | ✓ | FK → organizations |
| created_by | Text (UUID) | | FK → users |
| created_at | Date | | |
| updated_at | Date | | |

---

### email_templates
**Description:** Email templates

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | Text (UUID) | ✓ | Primary Key |
| name | Text | ✓ | |
| template_type | Dropdown | | Enum: email_template_type |
| subject | Text | ✓ | |
| body_html | Text (Long) | | |
| body_text | Text (Long) | | |
| variables | Text (JSON) | | |
| is_active | Checkbox | | |
| organization_id | Text (UUID) | ✓ | FK → organizations |
| created_by | Text (UUID) | | FK → users |
| created_at | Date | | |
| updated_at | Date | | |

---

### forms
**Description:** Custom forms

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | Text (UUID) | ✓ | Primary Key |
| name | Text | ✓ | |
| slug | Text | ✓ | |
| description | Text | | |
| status | Dropdown | | Enum: form_status |
| settings | Text (JSON) | | |
| success_message | Text | | |
| redirect_url | Text | | |
| submissions_count | Number | | |
| organization_id | Text (UUID) | ✓ | FK → organizations |
| created_by | Text (UUID) | | FK → users |
| created_at | Date | | |
| updated_at | Date | | |

---

## System & Configuration

### audit_logs
**Description:** System audit trail

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | Text (UUID) | ✓ | Primary Key |
| action | Text | ✓ | |
| entity_type | Text | ✓ | |
| entity_id | Text (UUID) | ✓ | |
| old_values | Text (JSON) | | |
| new_values | Text (JSON) | | |
| user_id | Text (UUID) | | FK → users |
| ip_address | Text | | |
| user_agent | Text | | |
| organization_id | Text (UUID) | ✓ | FK → organizations |
| created_at | Date | | |

---

### webhooks
**Description:** Webhook configurations

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | Text (UUID) | ✓ | Primary Key |
| name | Text | ✓ | |
| url | Text | ✓ | |
| events | Labels | | |
| status | Dropdown | | Enum: webhook_status |
| secret | Text | | |
| headers | Text (JSON) | | |
| retry_count | Number | | |
| last_triggered_at | Date | | |
| organization_id | Text (UUID) | ✓ | FK → organizations |
| created_by | Text (UUID) | | FK → users |
| created_at | Date | | |
| updated_at | Date | | |

---

### api_keys
**Description:** API key management

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | Text (UUID) | ✓ | Primary Key |
| name | Text | ✓ | |
| key_prefix | Text | ✓ | |
| key_hash | Text | ✓ | |
| status | Dropdown | | Enum: api_key_status |
| scopes | Labels | | |
| rate_limit | Number | | |
| expires_at | Date | | |
| last_used_at | Date | | |
| revoked_at | Date | | |
| revoked_by | Text (UUID) | | FK → users |
| organization_id | Text (UUID) | ✓ | FK → organizations |
| created_by | Text (UUID) | | FK → users |
| created_at | Date | | |

---

### workflows
**Description:** Automation workflows

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | Text (UUID) | ✓ | Primary Key |
| name | Text | ✓ | |
| description | Text | | |
| trigger_type | Dropdown | | Enum: workflow_trigger_type |
| trigger_config | Text (JSON) | | |
| actions | Text (JSON) | | |
| is_active | Checkbox | | |
| last_run_at | Date | | |
| run_count | Number | | |
| organization_id | Text (UUID) | ✓ | FK → organizations |
| created_by | Text (UUID) | | FK → users |
| created_at | Date | | |
| updated_at | Date | | |

---

### feature_flags
**Description:** Feature flag configuration

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | Text (UUID) | ✓ | Primary Key |
| key | Text | ✓ | |
| name | Text | ✓ | |
| description | Text | | |
| is_enabled | Checkbox | | |
| rollout_percentage | Number | | 0-100 |
| conditions | Text (JSON) | | |
| organization_id | Text (UUID) | | FK → organizations |
| created_at | Date | | |
| updated_at | Date | | |

---

## Additional Tables Reference

The database contains 250+ tables. Below is a categorized list of additional tables not detailed above:

### Ticketing & Registration
- `tickets`, `ticket_types`, `ticket_orders`, `event_registrations`, `registration_types`, `promo_codes`

### Knowledge & Support
- `kb_articles`, `kb_categories`, `support_tickets`, `ticket_comments`, `faq_items`

### Community & Social
- `community_posts`, `community_comments`, `discussions`, `discussion_replies`

### Training & Compliance
- `training_courses`, `training_sessions`, `training_enrollments`, `certifications`, `compliance_policies`

### Reporting & Analytics
- `report_definitions`, `report_schedules`, `saved_reports`, `dashboard_widgets`

### Approvals & Workflows
- `approval_workflows`, `approval_requests`, `approval_decisions`

### Custom Fields
- `custom_field_definitions`, `custom_field_values`

### Integrations
- `integration_connections`, `integration_sync_logs`, `calendar_sync_connections`

---

## ClickUp Implementation Notes

### Creating Lists from Tables

1. **Create a Space** for each major category (CRM, Events, Assets, etc.)
2. **Create a Folder** for related tables within each Space
3. **Create a List** for each table
4. **Add Custom Fields** matching the field definitions above

### Field Type Recommendations

| Schema Type | ClickUp Field |
|-------------|---------------|
| Primary Key (id) | Use ClickUp's built-in Task ID |
| Foreign Keys | Relationship field linking to another List |
| Enums | Dropdown with predefined options |
| Dates | Date field |
| Timestamps | Date field with time enabled |
| Booleans | Checkbox |
| Numbers | Number field |
| Currency | Currency field |
| JSON | Long Text (store as formatted JSON) |
| Arrays | Labels or Multiple Select |

### Relationship Mapping

- Use ClickUp's **Relationship** custom field type to link between Lists
- For `organization_id`, use Workspace-level filtering instead of a field
- For `created_by`/`updated_by`, use ClickUp's built-in Created By/Updated By

### Status Mapping

- Map enum status fields to ClickUp's native Status feature
- Create Status groups matching the enum values
- Use colors from the schema where defined

---

*Document generated from ATLVS database schema. For the complete schema with all 250+ tables, refer to `src/lib/supabase/database.types.ts`.*
