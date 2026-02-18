# GHXSTSHIP INDUSTRIES — USER ONBOARDING & PROFILE SYSTEM AUDIT + BUILD PROTOCOL v1.0

## WINDSURF PROMPT — ONBOARDING FLOW, PROFILE, SETTINGS, PREFERENCES FOR MULTI-TENANT

**Classification:** UX-Critical / Conversion-Critical / Multi-Tenant Architecture
**Scope:** First touch to fully configured user — every screen, every field, every tenant boundary
**Standard:** Enterprise SaaS best practices (2024-2026), WCAG 2.1 AA, mobile-first
**Output:** Audit findings + working implementation code — not recommendations

---

## INSTRUCTIONS TO WINDSURF

You are a **Principal Product Engineer** who has shipped onboarding flows at Notion, Linear, Slack, Figma, and Stripe. You are auditing and rebuilding the complete journey from the moment a user first encounters this application to the moment they are a fully configured, productive, retained user inside their tenant workspace.

**The onboarding flow is the highest-leverage surface in the entire product.** A broken onboarding means every feature built after it is wasted — users never reach it. Treat this accordingly.

**Your mandate:**

1. **AUDIT** the existing onboarding, profile, settings, and preferences systems
2. **IDENTIFY** every drop-off point, dead end, missing state, and friction source
3. **REBUILD** to match the best patterns from the top 1% of SaaS products
4. **WIRE** everything end-to-end: UI ↔ API ↔ Database ↔ Tenant context
5. **VERIFY** the entire flow works for every user type across every tenant

**Execute in order. Build working code. Do not ask — ship.**

---

## PHASE 0: EXISTING SYSTEM AUDIT

### 0.1 — Map the Current State

```
BEFORE CHANGING ANYTHING, DOCUMENT WHAT EXISTS:

1. AUTH ENTRY POINTS — Find every way a user enters the system:
   □ Signup page (email + password)
   □ Signup page (OAuth — Google, GitHub, Microsoft, etc.)
   □ Magic link / passwordless
   □ Invitation link (from existing team member)
   □ API key self-service signup
   □ SSO / SAML entry (enterprise)
   □ Waitlist → approval → signup
   □ Trial signup (with or without credit card)

2. CURRENT ONBOARDING SCREENS — Screenshot and catalog every step:
   □ What does the user see IMMEDIATELY after auth?
   □ Is there an onboarding wizard? How many steps?
   □ What data is collected? What is skipped?
   □ Where does the user land when onboarding is "complete"?
   □ Can the user skip onboarding? What happens if they do?
   □ Is onboarding resumable (can they leave and come back)?

3. CURRENT PROFILE SYSTEM — Catalog every field:
   □ Where is the profile page? (/settings/profile, /account, etc.)
   □ What fields exist? (name, email, avatar, bio, phone, etc.)
   □ Which fields are editable? Which are locked?
   □ What is the save mechanism? (auto-save, explicit save button)
   □ Where does profile data come from? (auth provider, manual entry, both)

4. CURRENT SETTINGS SYSTEM — Catalog every settings page:
   □ Account settings (email, password, 2FA, sessions, delete account)
   □ Notification settings (email, push, in-app per event type)
   □ Appearance settings (theme, language, timezone, density)
   □ Workspace/org settings (name, logo, billing, members, roles)
   □ Integration settings (connected apps, API keys, webhooks)
   □ Privacy settings (data sharing, analytics opt-out)

5. CURRENT TENANT ARCHITECTURE — Map the multi-tenant model:
   □ How are tenants modeled? (organizations, workspaces, teams)
   □ Can a user belong to multiple tenants?
   □ How does tenant switching work?
   □ Where is the tenant context stored? (URL, session, cookie, header)
   □ What data is tenant-scoped vs. user-global?
   □ How are invitations scoped to a tenant?

6. DATABASE SCHEMA — Extract all relevant tables:
   users, profiles, organizations, org_members, org_invitations,
   user_preferences, user_settings, notification_preferences,
   onboarding_state, sessions, connected_accounts, api_keys
```

### 0.2 — Identify Every Failure Point

```
WALK THROUGH EVERY POSSIBLE USER JOURNEY AND FIND EVERY BREAK:

SIGNUP → ONBOARDING:
□ Does the user see a blank screen at any point?
□ Is there a loading state between auth redirect and first screen?
□ If OAuth signup: is the name/avatar pre-filled from the provider?
□ If invited: does the user skip steps that the invitation already answered?
□ If the user refreshes mid-onboarding: do they resume or restart?
□ If the user closes the tab: do they resume on next login?
□ Is the onboarding state persisted in the database (not just local state)?

ONBOARDING → FIRST VALUE:
□ How many clicks/screens between signup and the user's first meaningful action?
□ Is there sample data or an empty state that guides the first action?
□ Can the user accomplish something valuable in under 2 minutes?
□ Is there a checklist or progress indicator after onboarding?

PROFILE COMPLETENESS:
□ Is there a profile completeness indicator anywhere?
□ Are users nudged to complete missing fields (but not blocked)?
□ Do empty profile fields cause UI issues elsewhere? (e.g., "null" shown as name)
□ Is the avatar a generated initial/gravatar when not set?

SETTINGS COVERAGE:
□ Are there settings the user needs but can't find?
□ Are there settings pages that are empty or placeholder?
□ Do settings changes take effect immediately (without page reload)?
□ Are dangerous settings (delete account, leave org) properly guarded?

MULTI-TENANT GAPS:
□ Can a user see data from another tenant? (CRITICAL security)
□ Does the user know which tenant they're in? (context indicator)
□ What happens when a user with multiple orgs logs in? (org picker)
□ Do user-level preferences override or merge with org-level settings?
□ When a user is removed from a tenant: what happens to their data?
```

---

## PHASE 1: DATABASE SCHEMA — REQUIRED TABLES

Audit the existing schema against this reference. Create migrations for anything missing.

### 1.1 — User & Profile Schema

```sql
-- USERS TABLE (auth-level, tenant-independent)
users (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email                 varchar(255) NOT NULL UNIQUE,
  email_verified        boolean NOT NULL DEFAULT false,
  email_verified_at     timestamptz,
  hashed_password       varchar(255),               -- null if OAuth-only
  avatar_url            text,
  display_name          varchar(100),                -- how the user wants to be called
  full_name             varchar(255),                -- legal/formal name
  phone                 varchar(50),
  phone_verified        boolean NOT NULL DEFAULT false,
  timezone              varchar(100) DEFAULT 'UTC',
  locale                varchar(10) DEFAULT 'en',
  date_format           varchar(20) DEFAULT 'MMM D, YYYY',
  time_format           varchar(10) DEFAULT '12h',   -- '12h' | '24h'
  first_day_of_week     smallint DEFAULT 0,          -- 0=Sun, 1=Mon
  theme                 varchar(20) DEFAULT 'system', -- 'light' | 'dark' | 'system'
  onboarding_completed  boolean NOT NULL DEFAULT false,
  onboarding_step       varchar(50),                 -- current step if incomplete
  onboarding_data       jsonb DEFAULT '{}',          -- partial data collected so far
  last_login_at         timestamptz,
  last_active_at        timestamptz,
  login_count           integer NOT NULL DEFAULT 0,
  signup_source         varchar(50),                 -- 'organic', 'invitation', 'oauth_google', etc.
  signup_referrer       text,                        -- UTM or referral tracking
  status                varchar(20) NOT NULL DEFAULT 'active', -- 'active', 'suspended', 'deactivated'
  deactivated_at        timestamptz,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now()
);

-- USER CONNECTED ACCOUNTS (OAuth providers)
connected_accounts (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider              varchar(50) NOT NULL,        -- 'google', 'github', 'microsoft'
  provider_account_id   varchar(255) NOT NULL,
  provider_email        varchar(255),
  provider_name         varchar(255),
  provider_avatar       text,
  access_token          text,                        -- encrypted
  refresh_token         text,                        -- encrypted
  token_expires_at      timestamptz,
  scopes                text[],
  connected_at          timestamptz NOT NULL DEFAULT now(),
  UNIQUE(provider, provider_account_id)
);
```

### 1.2 — Multi-Tenant Schema

```sql
-- ORGANIZATIONS (tenants)
organizations (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name                  varchar(255) NOT NULL,
  slug                  varchar(100) NOT NULL UNIQUE, -- URL-safe identifier
  logo_url              text,
  favicon_url           text,
  brand_color           varchar(7),                   -- hex color for white-label
  domain                varchar(255),                 -- custom domain (white-label)
  plan                  varchar(50) NOT NULL DEFAULT 'free',
  plan_started_at       timestamptz,
  trial_ends_at         timestamptz,
  stripe_customer_id    varchar(255),
  stripe_subscription_id varchar(255),
  settings              jsonb NOT NULL DEFAULT '{}',  -- org-level feature settings
  metadata              jsonb NOT NULL DEFAULT '{}',
  owner_id              uuid NOT NULL REFERENCES users(id),
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now()
);

-- ORGANIZATION MEMBERS (user ↔ tenant join table)
org_members (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id                uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id               uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role                  varchar(50) NOT NULL DEFAULT 'member',
                        -- 'owner', 'admin', 'manager', 'member', 'viewer', 'guest'
  title                 varchar(255),                 -- job title within this org
  department            varchar(255),
  permissions           jsonb DEFAULT '{}',           -- granular permission overrides
  joined_at             timestamptz NOT NULL DEFAULT now(),
  invited_by            uuid REFERENCES users(id),
  last_active_in_org    timestamptz,
  UNIQUE(org_id, user_id)
);

-- ORGANIZATION INVITATIONS
org_invitations (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id                uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  email                 varchar(255) NOT NULL,
  role                  varchar(50) NOT NULL DEFAULT 'member',
  invited_by            uuid NOT NULL REFERENCES users(id),
  token                 varchar(255) NOT NULL UNIQUE, -- secure random token
  status                varchar(20) NOT NULL DEFAULT 'pending',
                        -- 'pending', 'accepted', 'expired', 'revoked'
  accepted_at           timestamptz,
  expires_at            timestamptz NOT NULL,
  message               text,                         -- personal note from inviter
  created_at            timestamptz NOT NULL DEFAULT now()
);
```

### 1.3 — Preferences & Notification Schema

```sql
-- NOTIFICATION PREFERENCES (per user, per org — most granular)
notification_preferences (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  org_id                uuid REFERENCES organizations(id) ON DELETE CASCADE,
                        -- null = global default, non-null = org-specific override
  event_type            varchar(100) NOT NULL,
                        -- e.g., 'task.assigned', 'comment.mentioned', 'invoice.paid'
  channel_email         boolean NOT NULL DEFAULT true,
  channel_push          boolean NOT NULL DEFAULT true,
  channel_in_app        boolean NOT NULL DEFAULT true,
  channel_sms           boolean NOT NULL DEFAULT false,
  UNIQUE(user_id, org_id, event_type)
);

-- USER PREFERENCES (key-value for extensible preferences)
user_preferences (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  org_id                uuid REFERENCES organizations(id) ON DELETE CASCADE,
  category              varchar(50) NOT NULL,         -- 'appearance', 'workflow', 'privacy'
  key                   varchar(100) NOT NULL,
  value                 jsonb NOT NULL,
  UNIQUE(user_id, org_id, category, key)
);

-- ONBOARDING CHECKLIST TRACKING
onboarding_progress (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  org_id                uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  step_key              varchar(100) NOT NULL,
  completed             boolean NOT NULL DEFAULT false,
  completed_at          timestamptz,
  skipped               boolean NOT NULL DEFAULT false,
  metadata              jsonb DEFAULT '{}',
  UNIQUE(user_id, org_id, step_key)
);
```

---

## PHASE 2: ONBOARDING FLOW — ARCHITECTURE & IMPLEMENTATION

### 2.1 — Onboarding State Machine

```typescript
// lib/onboarding/machine.ts

/**
 * Onboarding is a STATE MACHINE, not a linear wizard.
 * Different entry paths skip different steps.
 * The machine determines the next required step based on what's already known.
 */

type OnboardingContext = {
  userId: string;
  signupSource: 'organic' | 'invitation' | 'oauth_google' | 'oauth_github' | 'oauth_microsoft' | 'sso';
  hasOrg: boolean;
  orgRole: string | null;
  invitationId: string | null;
  profile: {
    displayName: string | null;
    avatarUrl: string | null;
    timezone: string | null;
  };
  org: {
    name: string | null;
    slug: string | null;
    logoUrl: string | null;
  };
  completedSteps: string[];
};

type OnboardingStep =
  | 'verify_email'        // Confirm email address (skip if OAuth)
  | 'complete_profile'    // Name, avatar, timezone (pre-fill from OAuth)
  | 'create_or_join_org'  // Create new org OR accept invitation (skip if invited)
  | 'configure_org'       // Org name, logo, settings (skip if joining existing)
  | 'invite_team'         // Invite teammates (skip for non-admin, defer for solo)
  | 'select_use_case'     // What will you use this for? (personalizes experience)
  | 'connect_integrations'// Connect Slack, Calendar, etc. (optional, skippable)
  | 'guided_tour'         // Interactive product tour (optional, skippable)
  | 'complete'            // Done — redirect to dashboard

/**
 * Determines the next step based on current context.
 * Returns null if onboarding is complete.
 */
function getNextStep(ctx: OnboardingContext): OnboardingStep | null {

  // Email verification (skip for OAuth users — already verified by provider)
  if (ctx.signupSource === 'organic' && !isEmailVerified(ctx.userId)) {
    return 'verify_email';
  }

  // Profile completion (pre-fill from OAuth, ask for remaining)
  if (!ctx.profile.displayName || !ctx.profile.timezone) {
    return 'complete_profile';
  }

  // Org creation or joining
  if (!ctx.hasOrg && !ctx.invitationId) {
    return 'create_or_join_org';
  }

  // Org configuration (only for creators)
  if (ctx.hasOrg && ctx.orgRole === 'owner' && !ctx.completedSteps.includes('configure_org')) {
    return 'configure_org';
  }

  // Team invitation (only for admins/owners, skippable)
  if (ctx.orgRole === 'owner' && !ctx.completedSteps.includes('invite_team')) {
    return 'invite_team';
  }

  // Use case selection (personalizes empty states and defaults)
  if (!ctx.completedSteps.includes('select_use_case')) {
    return 'select_use_case';
  }

  return null; // Onboarding complete
}

/**
 * ENTRY PATH ROUTING:
 *
 * Organic signup → verify_email → complete_profile → create_or_join_org → ...
 * Google OAuth   → complete_profile (pre-filled) → create_or_join_org → ...
 * Invitation     → complete_profile → (skip org creation, auto-join) → select_use_case → ...
 * SSO/SAML       → (auto-org, auto-profile from IdP) → select_use_case → ...
 */
```

### 2.2 — Onboarding Screen Specifications

```
FOR EACH ONBOARDING STEP, BUILD THIS EXACT SCREEN:

════════════════════════════════════════════════════════════════
STEP: VERIFY EMAIL
CONDITION: signupSource === 'organic' && !emailVerified
════════════════════════════════════════════════════════════════

┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                     [App Logo]                              │
│                                                             │
│              Check your email ✉️                             │
│                                                             │
│     We sent a verification link to:                         │
│     julian@ghxstship.com                                    │
│                                                             │
│     Click the link in the email to verify                   │
│     your account and continue setup.                        │
│                                                             │
│     Didn't receive it?  [Resend email]                      │
│                                                             │
│     ───────────────────────────────────────                 │
│     Wrong email? [Change email address]                     │
│                                                             │
│              Step 1 of 4  ● ○ ○ ○                           │
│                                                             │
└─────────────────────────────────────────────────────────────┘

REQUIREMENTS:
□ Auto-detects email client and shows "Open Gmail" / "Open Outlook" button
□ Resend has rate limit (1 per 60 seconds) with countdown timer
□ "Change email" updates the user record and resends
□ Deep link in email verifies and auto-redirects to next step
□ If already verified (e.g., clicked in another tab): auto-advances
□ Polls for verification status every 5 seconds (or uses realtime)
□ Mobile: email client detection works for iOS Mail, Gmail app

════════════════════════════════════════════════════════════════
STEP: COMPLETE PROFILE
CONDITION: !displayName || !timezone
PRE-FILL: OAuth name, avatar, and browser-detected timezone
════════════════════════════════════════════════════════════════

┌─────────────────────────────────────────────────────────────┐
│                                                             │
│              Tell us about yourself                         │
│              This helps your team recognize you.            │
│                                                             │
│     ┌─────────┐                                             │
│     │  [📷]   │  Upload photo (or keep your Google avatar)  │
│     │ avatar  │  [Remove]                                   │
│     └─────────┘                                             │
│                                                             │
│     Display Name *                                          │
│     ┌─────────────────────────────────┐                     │
│     │ Julian                          │ ← pre-filled        │
│     └─────────────────────────────────┘                     │
│     This is how you'll appear to teammates.                 │
│                                                             │
│     Full Name                                               │
│     ┌─────────────────────────────────┐                     │
│     │ Julian Ramirez                  │ ← pre-filled        │
│     └─────────────────────────────────┘                     │
│                                                             │
│     Job Title                                               │
│     ┌─────────────────────────────────┐                     │
│     │ e.g., Product Manager           │                     │
│     └─────────────────────────────────┘                     │
│                                                             │
│     Timezone                                                │
│     ┌─────────────────────────────────┐                     │
│     │ America/New_York (EST) [auto] ▾ │ ← auto-detected     │
│     └─────────────────────────────────┘                     │
│                                                             │
│              Step 2 of 4  ● ● ○ ○                           │
│                                                             │
│     [Skip for now]                     [Continue →]         │
│                                                             │
└─────────────────────────────────────────────────────────────┘

REQUIREMENTS:
□ Avatar: drag-drop or click upload, crop to square, compress, show preview
□ Avatar: if OAuth provided one, show it as default with "Keep" / "Change"
□ Avatar: generate initials avatar as fallback (first letter of display name)
□ Display name: required, min 2 chars, max 100
□ Full name: optional but encouraged (used for invoices, formal communication)
□ Job title: optional (shown in team views and mentions)
□ Timezone: auto-detected from Intl.DateTimeFormat().resolvedOptions().timeZone
□ Timezone: searchable dropdown with city names and UTC offset display
□ "Skip for now": saves whatever is filled, marks step as skipped (not completed)
□ Skipped steps appear in a "Complete your profile" nudge later
□ All fields save to the users table immediately on [Continue]
□ Pre-fill MUST NOT overwrite user's manual edits (check if field already has value)

════════════════════════════════════════════════════════════════
STEP: CREATE OR JOIN ORGANIZATION
CONDITION: !hasOrg && !invitationId
════════════════════════════════════════════════════════════════

┌─────────────────────────────────────────────────────────────┐
│                                                             │
│              Set up your workspace                          │
│                                                             │
│     ┌─────────────────────────────────────────────────┐     │
│     │                                                 │     │
│     │  🏢  Create a new workspace                     │     │
│     │  Set up a workspace for your team or company    │     │
│     │                                                 │     │
│     └─────────────────────────────────────────────────┘     │
│                                                             │
│     ┌─────────────────────────────────────────────────┐     │
│     │                                                 │     │
│     │  🔗  Join an existing workspace                 │     │
│     │  Enter an invitation code or request access     │     │
│     │                                                 │     │
│     └─────────────────────────────────────────────────┘     │
│                                                             │
│     Pending invitations:                                    │
│     ┌─────────────────────────────────────────────────┐     │
│     │  GHXSTSHIP Industries  •  Invited by Sarah      │     │
│     │  Role: Member          [Accept]  [Decline]      │     │
│     └─────────────────────────────────────────────────┘     │
│                                                             │
│              Step 3 of 4  ● ● ● ○                           │
│                                                             │
└─────────────────────────────────────────────────────────────┘

→ IF "CREATE NEW":

┌─────────────────────────────────────────────────────────────┐
│                                                             │
│              Name your workspace                            │
│                                                             │
│     Workspace Name *                                        │
│     ┌─────────────────────────────────┐                     │
│     │ GHXSTSHIP Industries            │                     │
│     └─────────────────────────────────┘                     │
│                                                             │
│     URL                                                     │
│     ┌──────────────────────────────────────────┐            │
│     │ app.platform.com / ghxstship-industries  │ ✅ avail   │
│     └──────────────────────────────────────────┘            │
│     Auto-generated from name. You can change this.          │
│                                                             │
│     Workspace Logo (optional)                               │
│     ┌─────────┐                                             │
│     │  [📷]   │  Drag & drop or click                       │
│     └─────────┘                                             │
│                                                             │
│     How big is your team? *                                 │
│     (○) Just me       (○) 2-5        (○) 6-20              │
│     (○) 21-50         (○) 51-200     (○) 200+              │
│                                                             │
│     [← Back]                          [Create Workspace →]  │
│                                                             │
└─────────────────────────────────────────────────────────────┘

REQUIREMENTS:
□ Slug auto-generated from name (lowercase, hyphens, no special chars)
□ Slug availability checked in real-time (debounced 500ms)
□ Team size captured for plan recommendation and feature gating
□ Pending invitations for user's email auto-discovered and shown
□ Accepting invitation: auto-joins org, skips org creation, advances to next step
□ Creates org_members record with role='owner' for creator
□ Creates default org settings from template
□ If user has an existing org: show it, allow switching or creating additional

════════════════════════════════════════════════════════════════
STEP: INVITE TEAM
CONDITION: orgRole === 'owner' && !completed('invite_team')
════════════════════════════════════════════════════════════════

┌─────────────────────────────────────────────────────────────┐
│                                                             │
│              Invite your team                               │
│              [App] is better together.                       │
│                                                             │
│     ┌─────────────────────────────────────────────────┐     │
│     │ teammate@company.com                        [+] │     │
│     └─────────────────────────────────────────────────┘     │
│                                                             │
│     Added:                                                  │
│     sarah@ghxstship.com          Admin    [✕]               │
│     marcus@ghxstship.com         Member   [✕]               │
│     ops@ghxstship.com            Member   [✕]               │
│                                                             │
│     Role for new invites: [Member ▾]                        │
│                                                             │
│     ─── or share an invite link ───                         │
│     ┌─────────────────────────────────────────────────┐     │
│     │ https://app.com/join/ghxstship-ind/aB3x9...  📋 │     │
│     └─────────────────────────────────────────────────┘     │
│     Anyone with this link can join as: [Member ▾]           │
│                                                             │
│     [Skip for now]                  [Send Invites →]        │
│                                                             │
│              Step 4 of 5  ● ● ● ● ○                         │
│                                                             │
└─────────────────────────────────────────────────────────────┘

REQUIREMENTS:
□ Multi-email input (paste comma/newline-separated list)
□ Validate email format before adding to list
□ Warn if email domain doesn't match org domain (but don't block)
□ Role selector per invite (default: Member)
□ Invite link with configurable role and optional expiry
□ "Copy link" with clipboard feedback
□ Invitations created in org_invitations table with secure token
□ Invitation email sent via transactional email service
□ Skip stores step as 'skipped' — nudge shown on dashboard later
□ Rate limit: max 50 invitations per action

════════════════════════════════════════════════════════════════
STEP: SELECT USE CASE / PERSONALIZATION
CONDITION: !completed('select_use_case')
════════════════════════════════════════════════════════════════

┌─────────────────────────────────────────────────────────────┐
│                                                             │
│              What will you use [App] for?                   │
│              We'll customize your experience.               │
│                                                             │
│     Select all that apply:                                  │
│                                                             │
│     ┌──────────┐  ┌──────────┐  ┌──────────┐               │
│     │ 🎪       │  │ 📊       │  │ 🎨       │               │
│     │ Event    │  │ Project  │  │ Creative │               │
│     │ Prod.    │  │ Mgmt.    │  │ Services │               │
│     └──────────┘  └──────────┘  └──────────┘               │
│     ┌──────────┐  ┌──────────┐  ┌──────────┐               │
│     │ 💼       │  │ 🏢       │  │ 🔧       │               │
│     │ Client   │  │ Venue    │  │ Other    │               │
│     │ Mgmt.    │  │ Ops.     │  │          │               │
│     └──────────┘  └──────────┘  └──────────┘               │
│                                                             │
│                                                             │
│     [Skip]                         [Finish Setup →]         │
│                                                             │
└─────────────────────────────────────────────────────────────┘

REQUIREMENTS:
□ Multi-select (not single-select — users have multiple use cases)
□ Selection stored in org or user metadata (used for personalization)
□ Selection determines:
  - Default sidebar navigation order
  - Empty state CTAs and sample data
  - Onboarding checklist items
  - Feature recommendations
  - Template suggestions
□ "Other" opens a free-text field
□ Skippable (defaults apply if skipped)
□ Can be changed later in settings

════════════════════════════════════════════════════════════════
STEP: ONBOARDING COMPLETE → DASHBOARD
════════════════════════════════════════════════════════════════

AFTER THE LAST STEP:
1. Set users.onboarding_completed = true
2. Set users.onboarding_step = null
3. Redirect to the dashboard

THE DASHBOARD MUST SHOW A POST-ONBOARDING EXPERIENCE:

□ Welcome message: "Welcome to [Org Name], [Display Name]! 🎉"
□ Getting started checklist (persistent, dismissible):
  ┌─────────────────────────────────────────────────────┐
  │  Getting Started (2 of 6 complete)                  │
  │  ━━━━━━━━━━━░░░░░░░░░░░░░░░░░░  33%                │
  │                                                     │
  │  ✅ Create your account                             │
  │  ✅ Set up your workspace                           │
  │  ☐  Create your first project                       │
  │  ☐  Invite a teammate                               │
  │  ☐  Connect an integration                          │
  │  ☐  Explore templates                               │
  │                                                     │
  │  [Dismiss checklist]                                │
  └─────────────────────────────────────────────────────┘
□ Each checklist item links to the relevant action
□ Completed items auto-detected (not just manual checkbox)
□ Checklist dismissible after ≥50% complete
□ Checklist stored in onboarding_progress table per user per org
□ If user was invited: checklist skips "Set up workspace" and "Invite team"
□ Sample data or templates offered based on use case selection
```

---

## PHASE 3: PROFILE & ACCOUNT SETTINGS — FULL SPECIFICATION

### 3.1 — Settings Page Architecture

```
REQUIRED SETTINGS STRUCTURE:

/settings
├── /profile              — Personal information, avatar, bio
├── /account              — Email, password, 2FA, sessions, connected accounts
├── /appearance           — Theme, language, timezone, date/time format, density
├── /notifications        — Per-event-type channel toggles
├── /privacy              — Data sharing, analytics, activity visibility
│
├── /[org-slug]           — Org-scoped settings (require admin role)
│   ├── /general          — Org name, logo, slug, metadata
│   ├── /members          — Member list, roles, invitations
│   ├── /billing          — Plan, payment method, invoices
│   ├── /security         — SSO/SAML, enforced 2FA, session policies
│   ├── /integrations     — Connected apps, API keys, webhooks
│   ├── /branding         — White-label: colors, logo, domain, email templates
│   └── /danger           — Transfer ownership, delete organization

ROUTING RULES:
- /settings/profile, /account, /appearance, /notifications, /privacy
  are USER-SCOPED (same across all orgs)
- /settings/[org-slug]/* are ORG-SCOPED (different per org)
- Settings page shows a sidebar with both sections clearly labeled:
  "Personal Settings" and "[Org Name] Settings"
- Org settings only visible to users with admin/owner role
- Active section highlighted in sidebar
- Mobile: sidebar collapses to top-level menu
```

### 3.2 — Profile Page Specification

```
/settings/profile

┌─────────────────────────────────────────────────────────────┐
│  Profile                                                    │
│  ───────────────────────────────────────────                │
│                                                             │
│  Photo                                                      │
│  ┌─────────┐                                                │
│  │  [avatar]│  [Upload new photo]  [Remove]                 │
│  └─────────┘  JPG, PNG, GIF up to 5MB. Will be cropped     │
│               to a square.                                  │
│                                                             │
│  Display Name *                                             │
│  ┌───────────────────────────────────────┐                  │
│  │ Julian                                │                  │
│  └───────────────────────────────────────┘                  │
│  This is how you appear in mentions and comments.           │
│                                                             │
│  Full Name                                                  │
│  ┌───────────────────────────────────────┐                  │
│  │ Julian Ramirez                        │                  │
│  └───────────────────────────────────────┘                  │
│  Used for invoices and formal communication.                │
│                                                             │
│  Bio                                                        │
│  ┌───────────────────────────────────────┐                  │
│  │ CEO @ GHXSTSHIP Industries            │                  │
│  │ 13+ years in immersive entertainment  │                  │
│  └───────────────────────────────────────┘                  │
│  Brief description shown on your profile. Max 300 chars.    │
│                                                             │
│  Phone                                                      │
│  ┌───────────────────────────────────────┐                  │
│  │ +1 (813) 555-0123                     │                  │
│  └───────────────────────────────────────┘                  │
│                                                             │
│                          [Cancel]  [Save Changes]           │
│                                                             │
│  ───────────────────────────────────────────                │
│                                                             │
│  Your role in [GHXSTSHIP Industries]:  Owner                │
│  Member since: March 12, 2025                               │
│                                                             │
└─────────────────────────────────────────────────────────────┘

IMPLEMENTATION REQUIREMENTS:
□ Save button disabled until a field changes (dirty detection)
□ Save button shows loading state during API call
□ Optimistic save: UI updates immediately, reverts on error
□ Avatar upload: client-side crop, compress, upload to storage, update URL
□ Avatar crop modal: square aspect ratio, min 100x100px, max 5MB
□ Avatar fallback: initials avatar generated from display name
□ Bio: character counter showing remaining (300 - current)
□ Phone: formatted on blur with international format
□ Read-only fields: role, member since (not editable here)
□ Form validation: display name required, min 2 chars
□ Success toast: "Profile updated" (not a page redirect)
□ Error handling: field-level errors from API + generic toast
□ Autosave option: debounced 3s after last keystroke (opt-in preference)
```

### 3.3 — Appearance Settings Specification

```
/settings/appearance

┌─────────────────────────────────────────────────────────────┐
│  Appearance                                                 │
│  ───────────────────────────────────────────                │
│                                                             │
│  Theme                                                      │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐                     │
│  │ ☀️ Light │  │ 🌙 Dark  │  │ 💻 System│  ← auto           │
│  └─────────┘  └─────────┘  └─────────┘                     │
│                                                             │
│  Language                                                   │
│  ┌───────────────────────────────────────┐                  │
│  │ English (US)                        ▾ │                  │
│  └───────────────────────────────────────┘                  │
│                                                             │
│  Timezone                                                   │
│  ┌───────────────────────────────────────┐                  │
│  │ America/New_York (UTC-5:00)         ▾ │                  │
│  └───────────────────────────────────────┘                  │
│  Affects how dates and times are displayed.                 │
│                                                             │
│  Date Format                                                │
│  (○) Mar 15, 2026     — MMM D, YYYY                        │
│  (○) 15 Mar 2026      — D MMM YYYY                         │
│  (○) 03/15/2026       — MM/DD/YYYY                         │
│  (○) 15/03/2026       — DD/MM/YYYY                         │
│  (○) 2026-03-15       — YYYY-MM-DD                         │
│                                                             │
│  Time Format                                                │
│  (○) 12-hour  (3:00 PM)                                    │
│  (○) 24-hour  (15:00)                                      │
│                                                             │
│  First Day of Week                                          │
│  (○) Sunday   (○) Monday   (○) Saturday                    │
│                                                             │
│  Interface Density                                          │
│  (○) Comfortable  — More spacing, larger touch targets      │
│  (○) Compact      — Denser layout, more data visible        │
│                                                             │
│  Sidebar                                                    │
│  [✓] Collapse sidebar by default                            │
│  [✓] Show keyboard shortcuts in tooltips                    │
│                                                             │
│                                [Save Changes]               │
│                                                             │
└─────────────────────────────────────────────────────────────┘

IMPLEMENTATION REQUIREMENTS:
□ Theme: applied INSTANTLY on click (no save required)
□ Theme: stored in users.theme column AND localStorage (for instant apply before DB loads)
□ Theme: 'system' option follows prefers-color-scheme and reacts to OS changes in real-time
□ Language: changes all UI strings (requires i18n system — flag if not implemented)
□ Timezone: affects ALL datetime displays throughout the app
□ Timezone: stored as IANA timezone identifier (America/New_York not EST)
□ Date/time format: applied to every formatted date in the app
□ Format preferences: stored in users table, passed to date formatting utility
□ All preferences: apply app-wide without page reload
□ Interface density: toggles between CSS variable sets (spacing scale)
□ Keyboard shortcut: ? opens shortcut sheet if enabled
```

### 3.4 — Notification Settings Specification

```
/settings/notifications

REQUIRED: Build a matrix where users can toggle channels per event type.
Group events by category.

┌─────────────────────────────────────────────────────────────────┐
│  Notifications                                                  │
│  Choose how you want to be notified for each type of event.     │
│  ───────────────────────────────────────────────────────        │
│                                                                 │
│  [Master toggles]                                               │
│  [✓] Email notifications enabled                                │
│  [✓] Push notifications enabled                                 │
│  [ ] SMS notifications (requires verified phone)                │
│                                                                 │
│  ┌────────────────────────┬───────┬──────┬────────┬─────┐       │
│  │ Event                  │ Email │ Push │ In-App │ SMS │       │
│  ├────────────────────────┼───────┼──────┼────────┼─────┤       │
│  │ TASKS                  │       │      │        │     │       │
│  │ Assigned to me         │  [✓]  │ [✓]  │  [✓]   │ [ ] │       │
│  │ Mentioned in comment   │  [✓]  │ [✓]  │  [✓]   │ [ ] │       │
│  │ Status changed         │  [ ]  │ [ ]  │  [✓]   │ [ ] │       │
│  │ Due date approaching   │  [✓]  │ [✓]  │  [✓]   │ [ ] │       │
│  │ Overdue                │  [✓]  │ [✓]  │  [✓]   │ [✓] │       │
│  ├────────────────────────┼───────┼──────┼────────┼─────┤       │
│  │ PROJECTS               │       │      │        │     │       │
│  │ Added as member        │  [✓]  │ [✓]  │  [✓]   │ [ ] │       │
│  │ Project completed      │  [✓]  │ [ ]  │  [✓]   │ [ ] │       │
│  │ Budget threshold alert │  [✓]  │ [✓]  │  [✓]   │ [✓] │       │
│  ├────────────────────────┼───────┼──────┼────────┼─────┤       │
│  │ TEAM                   │       │      │        │     │       │
│  │ New member joined      │  [ ]  │ [ ]  │  [✓]   │ [ ] │       │
│  │ Member left            │  [ ]  │ [ ]  │  [✓]   │ [ ] │       │
│  │ Role changed           │  [✓]  │ [ ]  │  [✓]   │ [ ] │       │
│  ├────────────────────────┼───────┼──────┼────────┼─────┤       │
│  │ BILLING (Admin only)   │       │      │        │     │       │
│  │ Payment succeeded      │  [✓]  │ [ ]  │  [✓]   │ [ ] │       │
│  │ Payment failed         │  [✓]  │ [✓]  │  [✓]   │ [✓] │       │
│  │ Trial ending soon      │  [✓]  │ [✓]  │  [✓]   │ [ ] │       │
│  └────────────────────────┴───────┴──────┴────────┴─────┘       │
│                                                                 │
│  Quiet Hours                                                    │
│  [✓] Suppress push & SMS notifications between:                │
│      [10:00 PM] and [8:00 AM] in my timezone                   │
│                                                                 │
│  Weekly Digest                                                  │
│  [✓] Send weekly summary email every [Monday ▾] at [9:00 AM ▾] │
│                                                                 │
│                                        [Save Preferences]       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

IMPLEMENTATION REQUIREMENTS:
□ Event types defined in a central registry (not hardcoded in UI)
□ New event types automatically appear when registered (no UI code change)
□ Default preferences set per event type in the registry
□ User overrides stored in notification_preferences table
□ Master toggles disable the entire channel (overrides individual settings)
□ SMS channel requires phone verification (disabled/grayed if no verified phone)
□ Admin-only events visible only to users with admin/owner role
□ Category headers allow "toggle all in category" on click
□ Changes auto-save on toggle (no explicit save button needed for toggles)
□ Quiet hours stored as user preference, checked by notification delivery system
□ Digest preference stored and used by scheduled job
□ Org-level overrides: org admins can set MINIMUM notification requirements
  (e.g., "payment failed" email cannot be disabled by members)
□ Resolution order: org minimum > user preference > system default
```

### 3.5 — Account Security Settings

```
/settings/account

SECTIONS:
1. Email management (change, verify)
2. Password management (change, set if OAuth-only)
3. Two-factor authentication (enable/disable TOTP, show recovery codes)
4. Active sessions (list, revoke)
5. Connected accounts (link/unlink OAuth providers)
6. Danger zone (deactivate, delete account)

CRITICAL REQUIREMENTS:
□ Changing email: requires current password (or re-auth for OAuth)
□ Changing email: sends verification to NEW email, keeps old until verified
□ Changing password: requires current password
□ Password strength: meter with requirements shown (min 8 chars, etc.)
□ 2FA enable: show QR code, require verification code before enabling
□ 2FA enable: generate and display recovery codes (downloadable)
□ 2FA disable: requires current password + verification code
□ Active sessions: show device, browser, location, last active, "current" badge
□ Active sessions: "Revoke" button per session, "Revoke all others" button
□ Connected accounts: show which OAuth providers are linked
□ Connected accounts: "Connect" / "Disconnect" buttons
□ Connected accounts: prevent disconnecting last auth method (no lockout)
□ Delete account: requires password, shows what will be deleted
□ Delete account: if org owner, must transfer ownership first
□ Delete account: 14-day grace period with reactivation option
□ All security actions logged in audit trail
```

---

## PHASE 4: MULTI-TENANT USER EXPERIENCE

### 4.1 — Tenant Switching

```
IF A USER BELONGS TO MULTIPLE ORGANIZATIONS:

IMPLEMENTATION REQUIREMENTS:
□ Org switcher visible in sidebar or top navigation
□ Current org clearly indicated (name + logo/icon)
□ Dropdown shows all orgs with:
  - Org name and logo
  - User's role in each
  - Unread notification count per org
  - "Create new workspace" option at bottom
□ Switching orgs:
  - Updates URL (e.g., /org/ghxstship/dashboard → /org/acme/dashboard)
  - Resets data context to new org
  - Preserves navigation position where possible (if same page exists)
  - No full page reload (SPA navigation)
  - Updates document title
□ Org context stored in:
  - URL path (preferred for shareability)
  - OR subdomain (for white-label)
  - OR cookie/session (for seamless switching)
□ Every API request includes org context (from URL, header, or session)
□ Server validates user membership in org on EVERY request
□ Invitation to a new org: notification badge in switcher

FIRST LOGIN ORG SELECTION:
- If user has 1 org → auto-select, go to dashboard
- If user has 2+ orgs → show org picker before dashboard
- If user has 0 orgs → redirect to onboarding (create or join)
- Remember last active org (users.last_active_org_id or cookie)
```

### 4.2 — Preference Cascade (User vs. Org vs. System)

```
PREFERENCE RESOLUTION ORDER (highest priority first):

1. USER PREFERENCE (per org) — user set this for this specific org
2. USER PREFERENCE (global) — user set this as their default
3. ORG DEFAULT — org admin set this as the org default
4. ORG ENFORCED — org admin REQUIRES this (cannot be overridden)
5. SYSTEM DEFAULT — built-in application default

IMPLEMENTATION:

function resolvePreference(
  userId: string,
  orgId: string,
  category: string,
  key: string
): unknown {
  // Check org-enforced first (highest priority)
  const orgEnforced = getOrgSetting(orgId, `enforce.${category}.${key}`);
  if (orgEnforced !== undefined) return orgEnforced;

  // User org-specific preference
  const userOrgPref = getUserPref(userId, orgId, category, key);
  if (userOrgPref !== undefined) return userOrgPref;

  // User global preference
  const userGlobalPref = getUserPref(userId, null, category, key);
  if (userGlobalPref !== undefined) return userGlobalPref;

  // Org default
  const orgDefault = getOrgSetting(orgId, `default.${category}.${key}`);
  if (orgDefault !== undefined) return orgDefault;

  // System default
  return SYSTEM_DEFAULTS[category][key];
}

EXAMPLES:
- Theme: user sets "dark" globally → all orgs show dark mode
  UNLESS an org enforces "light" for brand consistency (enterprise tenant)
- Language: user sets "es" globally → all orgs show Spanish
  Org cannot override language (it's a user-level accessibility need)
- Notification: user disables email for "task.status_changed"
  BUT org enforces email for "payment.failed" → user cannot disable it
- Date format: user picks DD/MM/YYYY → applies everywhere
  Org cannot override (user preference for readability)

SETTINGS UI MUST INDICATE:
□ "Set by you" — user-configured preference
□ "Org default" — using org's default (user can override)
□ "Required by [Org Name]" — enforced by org (user cannot override, toggle disabled)
□ "System default" — no one has set this (user can override)
```

---

## PHASE 5: WIRE VERIFICATION

```
AFTER BUILDING EVERYTHING, VERIFY THESE COMPLETE CIRCUITS:

ONBOARDING WIRES:
□ Organic signup → verify email → complete profile → create org → invite → use case → dashboard
□ OAuth signup → complete profile (pre-filled) → create org → invite → use case → dashboard
□ Invitation signup → complete profile → auto-join org → use case → dashboard
□ Invitation existing user → auto-join org → redirect to org dashboard
□ SSO signup → auto-join org (from IdP) → complete profile (pre-filled) → dashboard
□ Resume after abandon: user closes tab at step 3, logs back in → resumes at step 3
□ Skip handling: user skips optional steps → nudge appears on dashboard
□ Onboarding state persisted in DB (not localStorage)
□ Onboarding adapts to entry path (skips irrelevant steps)

PROFILE WIRES:
□ Profile fields save to users table correctly
□ Profile changes reflected everywhere immediately (avatar, name in nav, mentions)
□ Avatar upload → storage → URL saved → displayed in header, comments, team list
□ Empty avatar → initials fallback generated and displayed consistently
□ OAuth profile data pre-fills but doesn't overwrite manual edits on re-login

SETTINGS WIRES:
□ Theme change applies instantly (no reload, no flash)
□ Timezone change affects all datetime displays throughout the app
□ Date/time format change affects all formatted dates
□ Language change updates all UI strings (if i18n implemented)
□ Notification preference changes persist and affect notification delivery
□ Quiet hours respected by notification system
□ Digest preference triggers scheduled email at configured time
□ Account settings: email change flow works end-to-end
□ Account settings: password change flow works end-to-end
□ Account settings: 2FA enable/disable flow works end-to-end
□ Account settings: session revocation immediately invalidates session
□ Account settings: connected account link/unlink works
□ Account settings: account deletion flow works with grace period

MULTI-TENANT WIRES:
□ Org switcher shows all user's orgs with correct data
□ Switching org updates all data context without reload
□ API requests scoped to current org (no cross-tenant data)
□ Org-scoped settings only visible to admins
□ Preference cascade resolves correctly at all levels
□ Invitation flow: send → receive email → click → join org → land in org
□ Invitation flow: existing user accepts → added to org, redirected
□ Invitation flow: new user accepts → signup with invitation context preserved
□ Member removal: user loses access immediately, data handled per policy
□ Org transfer: ownership transfers cleanly with no orphaned permissions
□ Org deletion: cascades correctly, members notified
```

---

## CERTIFICATION SCORECARD

```
╔══════════════════════════════════════════════════════════════╗
║       ONBOARDING & USER SYSTEM CERTIFICATION SCORECARD      ║
╠══════════════════════════════════════╦═════════╦════════════╣
║ LAYER                                ║ SCORE   ║ STATUS     ║
╠══════════════════════════════════════╬═════════╬════════════╣
║ Auth Entry Points (all paths work)   ║   /100  ║            ║
║ Onboarding State Machine             ║   /100  ║            ║
║ Email Verification Flow              ║   /100  ║            ║
║ Profile Completion Step              ║   /100  ║            ║
║ Org Creation / Join Flow             ║   /100  ║            ║
║ Team Invitation Step                 ║   /100  ║            ║
║ Use Case Personalization             ║   /100  ║            ║
║ Post-Onboarding Checklist            ║   /100  ║            ║
║ Onboarding Resume / Persistence      ║   /100  ║            ║
║ Onboarding Path Adaptation           ║   /100  ║            ║
║ Profile Page — Fields & Validation   ║   /100  ║            ║
║ Profile Page — Avatar System         ║   /100  ║            ║
║ Appearance Settings — Theme          ║   /100  ║            ║
║ Appearance Settings — Date/Time/TZ   ║   /100  ║            ║
║ Notification Settings Matrix         ║   /100  ║            ║
║ Notification Quiet Hours & Digest    ║   /100  ║            ║
║ Account Security — Password & Email  ║   /100  ║            ║
║ Account Security — 2FA               ║   /100  ║            ║
║ Account Security — Sessions          ║   /100  ║            ║
║ Account Security — Connected Accts   ║   /100  ║            ║
║ Account — Deactivation / Deletion    ║   /100  ║            ║
║ Multi-Tenant — Org Switcher          ║   /100  ║            ║
║ Multi-Tenant — Preference Cascade    ║   /100  ║            ║
║ Multi-Tenant — Invitation System     ║   /100  ║            ║
║ Multi-Tenant — Data Isolation        ║   /100  ║            ║
║ DB Schema Completeness               ║   /100  ║            ║
║ API Endpoint Coverage                ║   /100  ║            ║
║ UI ↔ API ↔ DB Full Wire             ║   /100  ║            ║
║ Mobile Responsive (all screens)      ║   /100  ║            ║
║ Accessibility (WCAG 2.1 AA)          ║   /100  ║            ║
╠══════════════════════════════════════╬═════════╬════════════╣
║ OVERALL SCORE                        ║   /100  ║            ║
╠══════════════════════════════════════╩═════════╩════════════╣
║                                                              ║
║ CERTIFICATION: [ CERTIFIED / BLOCKED ]                       ║
║ ONBOARDING DROP-OFF POINTS: [ must = 0 ]                     ║
║ DEAD-END SCREENS: [ must = 0 ]                               ║
║ MISSING SETTINGS PAGES: [ must = 0 ]                         ║
║ UNWIRED PREFERENCES: [ must = 0 ]                            ║
║ CROSS-TENANT DATA LEAKS: [ must = 0 — CRITICAL ]            ║
║                                                              ║
║ MINIMUM SCORE TO CERTIFY: 95 per layer                       ║
║ MINIMUM OVERALL TO CERTIFY: 95                               ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
```

---

## EXECUTION PROTOCOL

1. **Phase 0**: Audit everything that exists. Document every screen, field, and flow.
2. **Phase 1**: Compare DB schema to required tables. Create migrations for gaps.
3. **Phase 2**: Build the onboarding state machine and every screen. Wire to API and DB.
4. **Phase 3**: Build every settings page. Wire every preference to the DB and to UI effects.
5. **Phase 4**: Build tenant switching, preference cascade, and invitation system.
6. **Phase 5**: Walk through every wire. Fix every break. Complete the scorecard.

**Every screen must be built. Every field must be wired. Every tenant boundary must be enforced.**

---

*GHXSTSHIP Industries LLC — First Impression. Full Configuration. Every Tenant.*
*Onboarding & User System Protocol v1.0 — From First Click to Fully Productive*