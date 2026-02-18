# Entity SSOT / 3NF Normalization Plan

## Executive Summary

This document maps the current state of the three core noun-entity domains — **People**, **Organizations**, and **Places** — identifies all SSOT/3NF violations, and defines the canonical entity model that will serve as the single source of truth for each domain.

---

## 1. PEOPLE Domain — Current State

### Tables That Represent "A Person"

| Table | Scope | PK | FK to `users` | Key Fields | Purpose |
|-------|-------|-----|---------------|------------|---------|
| `users` | Platform | `id` (= auth.users.id) | — | full_name, email, phone, avatar_url, bio, department, job_title | Auth identity + core profile |
| `user_profiles` | Platform | `id` | `user_id` (1:1) | bio, skills, headline, education, experience, social URLs | Extended professional profile |
| `public_profiles` | Platform | `id` | `user_id` | display_name, headline, avatar_url, bio, skills | Public-facing profile (VIEW) |
| `employee_profiles` | Org-scoped | `id` | `user_id` | hire_date, salary, hourly_rate, department_id, position_id, emergency contacts, NDA, union, dietary | HR/employment data |
| `staff_members` | Org-scoped | `id` | `user_id` | hire_date, salary, hourly_rate, department_id, position_id, employment_status | HR/employment data (DUPLICATE of employee_profiles) |
| `crew_members` | Org-scoped | `id` | `user_id` | full_name, email, phone, avatar_url, skills, certifications, hourly_rate, day_rate | Production crew (DUPLICATES users fields) |
| `contacts` | Org-scoped | `id` | — | first_name, last_name, email, phone, company_id, job_title, avatar_url | CRM contacts (external people) |
| `people_directory` | Org-scoped | `id` | — | entity_id, entity_type, full_name, email, phone, avatar_url, job_title, department | Unified directory (MATERIALIZED VIEW pattern) |
| `talent` | Org-scoped | `id` | — | contact_id → contacts, stage_name, professional_title, booking_rate | Entertainment talent |
| `candidates` | Org-scoped | `id` | — | first_name, last_name, email, phone, resume_url | Recruitment candidates |
| `contractors` | Org-scoped | `id` | `user_id` | company_name, tax_id, hourly_rate, contract_start/end | Contract workers |

### 3NF Violations — People

1. **`staff_members` ≈ `employee_profiles`** — Nearly identical schemas. Both store hire_date, salary, hourly_rate, department_id, position_id, employment_status for the same user_id. This is a **direct 2NF violation** (redundant entity).
2. **`crew_members` duplicates `users`** — full_name, email, phone, avatar_url are copied from users. The `user_id` FK exists but is nullable, meaning crew_members can exist without a user record, creating orphaned identity data.
3. **`people_directory` is a denormalized projection** — It copies fields from users, contacts, crew_members, staff_members into a flat table. This is acceptable as a materialized view but violates SSOT if queried as authoritative.
4. **`contacts` vs `users`** — External people (contacts) and internal people (users) share no common ancestor table. A person who is both a contact and a user has duplicated identity data.
5. **`talent.contact_id`** — Talent references contacts, not users. If a talent is also a user, there's no link.
6. **`candidates`** — Standalone person table with no FK to users or contacts. If hired, data must be manually migrated.

### Canonical Model — People

```
users (SSOT for all authenticated identities)
  ├── user_profiles (1:1 extended profile — social, skills, education)
  ├── employee_profiles (1:1 per org — HR/employment data, absorbs staff_members)
  ├── crew_members (org-scoped role — rates, availability; MUST FK to users, stop duplicating name/email)
  └── user_roles (org-scoped RBAC)

contacts (SSOT for all external/unauthenticated people)
  ├── talent (role extension — booking rates, stage name)
  ├── candidates (role extension — recruitment pipeline)
  └── vendor_contacts (role extension — vendor relationship)

people_directory (READ-ONLY materialized view — projection of users + contacts)
```

**Key Changes:**
- **Delete `staff_members`** — merge into `employee_profiles` (canonical HR table)
- **Strip `crew_members`** of duplicated identity fields (full_name, email, phone, avatar_url) — these come from `users` via FK
- **Make `crew_members.user_id` NOT NULL** — every crew member must be a user
- **Add `contacts.user_id` nullable FK** — link external contacts to user accounts when they exist
- **Add `candidates.contact_id` FK** — candidates are contacts in the recruitment pipeline

---

## 2. ORGANIZATIONS Domain — Current State

### Tables That Represent "An Organization/Business"

| Table | Scope | PK | Key Fields | Purpose |
|-------|-------|-----|------------|---------|
| `organizations` | Platform | `id` | name, slug, email, phone, address, city, state, country, logo_url, industry, legal_name, website | Tenant/org (the customer) |
| `companies` | Org-scoped | `id` | name, email, phone, address, city, state, country, logo_url, industry, legal_name, website, company_type | CRM companies (clients, vendors, partners) |
| `teams` | Org-scoped | `id` | name, description, organization_id | Internal teams/departments |
| `departments` | Org-scoped | `id` | name, code, organization_id | Organizational departments |

### 3NF Violations — Organizations

1. **`organizations` vs `companies`** — Nearly identical field sets (name, email, phone, address, city, state, country, logo_url, industry, legal_name, website). An organization IS a company, but they're modeled as separate entities. If the org needs to appear in its own CRM as a company, data is duplicated.
2. **`teams` vs `departments`** — Overlapping concepts. Both represent internal groupings of people within an org. `departments` has a `code` field; `teams` has a `description`. Some orgs use both, creating ambiguity about which is authoritative for organizational structure.
3. **`companies.address` + `companies.city` + `companies.state` + `companies.country` + `companies.postal_code`** — Inline address fields violate 3NF. The `address_id` FK to `addresses` exists but the inline fields are also present, creating dual-source ambiguity.
4. **`organizations` has inline address fields** — Same violation as companies. No `address_id` FK exists.

### Canonical Model — Organizations

```
organizations (SSOT for tenants — the platform customer)
  ├── organization_members (user ↔ org membership)
  ├── organization_subscriptions (billing)
  └── address_id → addresses (canonical address)

companies (SSOT for all external business entities within an org's CRM)
  ├── company_type enum: client | vendor | partner | supplier | agency
  ├── vendor_contacts (people at this company)
  ├── deals (sales pipeline)
  └── address_id → addresses (canonical address)

departments (SSOT for internal org structure)
  └── teams (sub-groupings within departments, or cross-functional)
```

**Key Changes:**
- **Add `organizations.address_id` FK** to `addresses` — stop inline address duplication
- **Remove inline address fields** from `organizations` (address, city, state, country, postal_code) — rename to `legacy_*`
- **Remove inline address fields** from `companies` where `address_id` exists — enforce single source
- **Keep `teams` and `departments` separate** — they serve different purposes (org chart vs working groups), but add `teams.department_id` FK if not present

---

## 3. PLACES Domain — Current State

### Tables That Represent "A Place"

| Table | Scope | PK | Key Fields | Purpose |
|-------|-------|-----|------------|---------|
| `addresses` | Org-scoped | `id` | line_1, line_2, city, state, postal_code, country, latitude, longitude | Canonical address entity |
| `locations` | Org-scoped | `id` | name, slug, location_type, address, city, state, country, latitude, longitude, parent_id | Asset locations (warehouses, staging areas, offices) |
| `venues` | Org-scoped | `id` | name, slug, venue_type, address, city, state, country, latitude, longitude, capacity, amenities | Event venues |
| `venue_spaces` | Org-scoped | `id` | name, venue_id, capacity, floor | Rooms/spaces within venues |
| `venue_zones` | Org-scoped | `id` | name, venue_id, zone_type | Zones within venues |
| `warehouse_locations` | Org-scoped | `id` | location_id, aisle, bay, shelf, bin | Storage bins within locations |
| `location_registry` | Org-scoped | `id` | entity_id, entity_type, name, address, city, state, country, latitude, longitude | Unified location directory (MATERIALIZED VIEW pattern) |
| `location_log` | Org-scoped | `id` | entity_id, entity_type, location_id, timestamp | Location tracking history |

### 3NF Violations — Places

1. **`locations` vs `venues`** — Both represent physical places with nearly identical address fields. A venue IS a location, but they're separate tables. If a venue also needs to be an asset location (e.g., warehouse at a venue), data is duplicated.
2. **`locations` has inline address fields** — address, city, state, country, postal_code, latitude, longitude are inline despite `address_id` FK existing. Dual-source.
3. **`venues` has inline address fields** — Same violation. `address_id` FK exists but inline fields also present.
4. **`location_registry` is a denormalized projection** — Copies fields from locations, venues, warehouse_locations. Same pattern as `people_directory`.
5. **`venue_spaces` vs `venue_zones`** — Overlapping concepts for subdivisions of a venue.

### Canonical Model — Places

```
addresses (SSOT for all physical addresses — 3NF compliant)
  ├── line_1, line_2, city, state, postal_code, country
  ├── latitude, longitude (geocoded)
  └── formatted_addresses (VIEW)

locations (SSOT for all named physical places)
  ├── location_type enum: warehouse | staging_area | office | venue | site | room | zone
  ├── address_id → addresses (canonical address, NOT inline)
  ├── parent_id → locations (hierarchical: venue > floor > room > zone)
  ├── capacity, amenities, metadata (type-specific data in metadata JSON)
  └── warehouse_locations (storage bins within warehouse-type locations)

location_registry (READ-ONLY materialized view — projection)
```

**Key Changes:**
- **Merge `venues` into `locations`** — venues become locations with `location_type = 'venue'` and venue-specific fields in `metadata` JSON or a `venue_details` extension table
- **Remove inline address fields** from `locations` — enforce `address_id` FK as sole source
- **Merge `venue_spaces` and `venue_zones`** into child `locations` with appropriate `location_type` (room, zone, stage, etc.)
- **`location_registry`** becomes a true materialized view, not a separate writable table

---

## 4. Migration Strategy

### Phase 1: People Domain (Migration 00122)
1. Add `contacts.user_id` nullable FK to `users`
2. Add `candidates.contact_id` nullable FK to `contacts`
3. Rename `crew_members` identity fields to `legacy_*` (full_name, email, phone, avatar_url)
4. Make `crew_members.user_id` NOT NULL (after data backfill)
5. Merge `staff_members` fields into `employee_profiles`, rename `staff_members` columns to `legacy_*`

### Phase 2: Organizations Domain (Migration 00123)
1. Add `organizations.address_id` FK to `addresses`
2. Rename inline address fields on `organizations` to `legacy_*`
3. Rename inline address fields on `companies` to `legacy_*` (where `address_id` exists)
4. Add `teams.department_id` FK if not present

### Phase 3: Places Domain (Migration 00124)
1. Add venue-specific columns to `locations` (capacity, amenities, venue_type, technical_specs, etc.)
2. Migrate `venues` data into `locations` with `location_type = 'venue'`
3. Migrate `venue_spaces` and `venue_zones` into `locations` as children
4. Rename inline address fields on `locations` to `legacy_*`
5. Drop legacy FK constraints on `venues`, `venue_spaces`, `venue_zones`

### Phase 4: Code Purge
1. Update all hooks, API routes, and schemas to use canonical tables
2. Remove legacy schema definitions
3. Update schema registry
4. Regenerate TypeScript types
5. Validate typecheck + lint
