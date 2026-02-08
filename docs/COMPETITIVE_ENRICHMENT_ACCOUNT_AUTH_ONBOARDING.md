# Competitive Enrichment Analysis: Account, Auth & Onboarding Modules

**Analysis Date:** February 2026  
**Modules Analyzed:** `(app)/account`, `(auth)`, `(onboarding)`  
**Platform:** ATLVS - Production Management Platform

---

## Executive Summary

ATLVS's Account, Authentication, and Onboarding modules provide a solid foundation but lag behind industry leaders in several key areas. This analysis benchmarks against **Notion, Linear, Figma, Slack, and Monday.com**.

### Current State Assessment

| Module | Maturity | Key Strength | Critical Gap |
|--------|----------|--------------|--------------|
| **Account** | 65% | Clean template-driven architecture | Missing security center, API keys, audit logs |
| **Auth** | 70% | MFA support, SSO foundation | No passkeys, limited social providers, no magic links |
| **Onboarding** | 75% | Well-structured 8-step flow | No personalization, missing role-based paths |

### Strategic Recommendation
Prioritize **security hardening** (passkeys, session management) and **personalization** (role-based onboarding, AI-assisted setup) to achieve competitive parity by Q3 2026.

---

## 1. Competitive Intelligence Gathering

### 1.1 Account Management Competitors

#### **Notion**
- **Core Features**: Unified settings, workspace switching, connected apps, import/export
- **Differentiators**: Inline workspace settings, granular notification controls per page
- **Recent (12mo)**: AI settings panel, enhanced security dashboard

#### **Linear**
- **Core Features**: Personal/workspace settings separation, API tokens, webhooks
- **Differentiators**: Keyboard-first navigation, command palette for settings
- **Recent (12mo)**: Enhanced audit logs, SCIM provisioning

#### **Figma**
- **Core Features**: Account, notifications, plugins, connected apps, billing
- **Differentiators**: Visual billing history, team permission matrix
- **Recent (12mo)**: Enhanced SSO controls, usage analytics dashboard

#### **Slack**
- **Core Features**: Profile, preferences, accessibility, notifications, security
- **Differentiators**: Per-channel notification rules, status scheduling
- **Recent (12mo)**: Huddle preferences, AI summary settings

#### **Monday.com**
- **Core Features**: Profile, admin, billing, integrations, security
- **Differentiators**: Board-level permissions, automation settings
- **Recent (12mo)**: Enhanced HIPAA compliance settings, data residency

---

### 1.2 Authentication Competitors

| Provider | Auth Methods | Security Features | Recent Updates |
|----------|-------------|-------------------|----------------|
| **Notion** | Email, Google, Apple, SAML | 2FA, session mgmt | Passkeys (2024) |
| **Linear** | Email, Google, SAML | 2FA, device mgmt | Magic link improvements |
| **Figma** | Email, Google, SAML, SCIM | 2FA, IP allowlist | Enterprise SSO |
| **Slack** | Email, Google, Apple, SAML | 2FA, device approval | Passkey support |
| **Auth0** | 50+ providers, passwordless | Adaptive MFA, bot detection | Passkeys GA |

---

### 1.3 Onboarding Competitors

| Platform | Steps | Key Differentiator | Recent Updates |
|----------|-------|-------------------|----------------|
| **Notion** | 4 | Template gallery, AI setup | AI workspace setup |
| **Linear** | 5 | Import from Jira/Asana | Enhanced import |
| **Figma** | 3 | Role-based paths | Dev Mode intro |
| **Slack** | 6 | Bot-assisted, channel suggestions | AI channel suggestions |
| **Monday** | 5 | Industry templates | AI board generation |

---

## 2. Gap Analysis Matrix

### 2.1 Account Module Gaps

| Feature | ATLVS | Industry Standard | Gap Level |
|---------|-------|-------------------|-----------|
| Profile Management | ✅ | ✅ | Parity |
| Team Management | ❌ | ✅ | **Critical** |
| Role/Permission Editor | ❌ | ✅ | **Critical** |
| Billing Dashboard | ⚠️ Minimal | ✅ Full | **High** |
| Invoice History | ❌ | ✅ | **High** |
| Security Center | ❌ | ✅ | **Critical** |
| Session Management | ❌ | ✅ | **Critical** |
| API Keys/Tokens | ❌ | ✅ | **High** |
| Connected Apps | ❌ | ✅ | **Medium** |
| Data Export | ❌ | ✅ Required | **Critical** |
| Account Deletion | ❌ | ✅ Required | **Critical** |

### 2.2 Authentication Module Gaps

| Feature | ATLVS | Industry Standard | Gap Level |
|---------|-------|-------------------|-----------|
| Email/Password | ✅ | ✅ | Parity |
| Password Strength Meter | ❌ | ✅ | **High** |
| Magic Link | ❌ | ✅ | **High** |
| Passkeys/WebAuthn | ❌ | Emerging | **Medium** |
| Google OAuth | ⚠️ Stub | ✅ | **Critical** |
| Microsoft OAuth | ❌ | ✅ | **High** |
| MFA - TOTP | ✅ | ✅ | Parity |
| Session Management | ❌ | ✅ | **Critical** |
| Login History | ❌ | ✅ | **High** |
| Bot Protection | ❌ | ✅ | **High** |

### 2.3 Onboarding Module Gaps

| Feature | ATLVS | Industry Standard | Gap Level |
|---------|-------|-------------------|-----------|
| Progress Indicator | ✅ | ✅ | Parity |
| State Persistence | ❌ | ✅ | **Critical** |
| Role-Based Paths | ❌ | ✅ | **Critical** |
| Template Selection | ❌ | ✅ | **High** |
| Data Import | ❌ | ✅ | **High** |
| Interactive Tour | ⚠️ Static | ✅ Hotspots | **Medium** |
| Post-Onboarding Checklist | ❌ | ✅ | **Critical** |
| Sample Data | ❌ | ✅ | **High** |
| Bulk Team Invite | ❌ | ✅ | **High** |

---

## 3. Enhancement Recommendations (Top 10)

### Priority Scoring: (User Impact × Frequency) ÷ Implementation Effort

| Rank | ID | Feature | Score | Effort | Module |
|------|-----|---------|-------|--------|--------|
| 1 | AUTH-004 | Password Strength Meter | 31.5 | Low | Auth |
| 2 | ONB-006 | Post-Onboarding Checklist | 24.0 | Low | Onboarding |
| 3 | AUTH-002 | Magic Link Authentication | 21.3 | Low | Auth |
| 4 | ONB-002 | State Persistence & Resume | 21.3 | Low | Onboarding |
| 5 | ACC-007 | Enhanced Notifications | 18.7 | Low | Account |
| 6 | ONB-008 | Bulk Team Invite | 16.3 | Low | Onboarding |
| 7 | AUTH-003 | Social OAuth Providers | 16.2 | Medium | Auth |
| 8 | ONB-001 | Role-Based Onboarding | 16.2 | Medium | Onboarding |
| 9 | ACC-005 | Connected Apps Hub | 16.0 | Low | Account |
| 10 | ACC-001 | Security Center Dashboard | 14.4 | Medium | Account |

---

## 4. Detailed Specifications (Top 5)

### 4.1 Password Strength Meter (AUTH-004)

**Business Value**: Improves security, reduces weak passwords, industry standard

**Acceptance Criteria**:
- [ ] Real-time strength bar: Weak (red) → Fair (orange) → Good (yellow) → Strong (green)
- [ ] Requirements checklist: 8+ chars, uppercase, lowercase, number, special char
- [ ] Each requirement shows checkmark when met
- [ ] Works on register, reset-password, profile password change
- [ ] Accessible with ARIA labels

**Technical**: Use `zxcvbn` library, debounce 150ms

---

### 4.2 Post-Onboarding Checklist (ONB-006)

**Business Value**: Drives activation, gamification, reduces time-to-value

**Acceptance Criteria**:
- [ ] Collapsible sidebar widget after onboarding
- [ ] Progress bar with percentage
- [ ] Items: Create event, Invite team, Connect integration, etc.
- [ ] Clicking item navigates to feature
- [ ] Checkmark animation on completion
- [ ] Dismissible after 100% or manually

**Technical**: localStorage + database sync, custom events for completion

---

### 4.3 Magic Link Authentication (AUTH-002)

**Business Value**: Reduces friction, good for infrequent users

**Acceptance Criteria**:
- [ ] "Email me a login link" option on login page
- [ ] Email sent within 5 seconds
- [ ] 15-minute expiry, single-use
- [ ] Branded email with CTA button
- [ ] Resend with 60-second cooldown

**Technical**: Supabase magic link or custom tokens

---

### 4.4 State Persistence & Resume (ONB-002)

**Business Value**: Reduces abandonment, improves completion rate

**Acceptance Criteria**:
- [ ] Auto-save on each step
- [ ] "Continue where you left off" prompt
- [ ] Works across devices (logged-in)
- [ ] "Start fresh" option
- [ ] Handles schema changes

**Technical**: Database for logged-in, localStorage for anonymous

---

### 4.5 Enhanced Notification Preferences (ACC-007)

**Business Value**: Reduces notification fatigue, improves engagement

**Acceptance Criteria**:
- [ ] Grouped by category: Activity, Updates, Marketing, Security
- [ ] Channel toggles: Email, Push, In-app
- [ ] Frequency: Instant, Daily, Weekly
- [ ] Quiet hours configuration
- [ ] Test notification button

---

## 5. Prioritized Roadmap

### NOW (Q1 2026) - Foundation
| Feature | Effort | Dependencies |
|---------|--------|--------------|
| Password Strength Meter | Low | None |
| Post-Onboarding Checklist | Low | None |
| Magic Link Auth | Low | None |
| State Persistence | Low | None |
| Enhanced Notifications | Low | None |
| Bulk Team Invite | Low | None |

### NEXT (Q2 2026) - Core
| Feature | Effort | Dependencies |
|---------|--------|--------------|
| Social OAuth Providers | Medium | None |
| Role-Based Onboarding | Medium | None |
| Connected Apps Hub | Low | OAuth |
| Security Center | Medium | None |
| Billing Dashboard | Medium | Stripe |
| Template Gallery | Medium | None |

### LATER (Q3-Q4 2026) - Advanced
| Feature | Effort | Dependencies |
|---------|--------|--------------|
| Session Management | Medium | Security Center |
| Sample Data/Sandbox | Medium | None |
| Team & Role Management | High | None |
| Interactive Tour | Medium | None |
| Bot Protection | Medium | None |
| Data Export/Deletion | Medium | None |
| Login History | Medium | Security Center |
| Passkey Support | High | None |
| API Keys/Webhooks | Medium | None |
| Data Import Wizard | High | None |

---

## 6. Best Practices Summary

### Onboarding
- **Time-to-value < 5 min**: Reduce to 4 core steps
- **Progressive disclosure**: Add skip options, role-based paths
- **Immediate win**: Create first project in onboarding
- **Gamification**: Progress bar, completion rewards

### Authentication
- **Passwordless options**: Magic links, passkeys
- **Social login**: Google, Microsoft, Apple minimum
- **Security transparency**: Login history, session management
- **Bot protection**: Invisible CAPTCHA, rate limiting

### Account
- **Self-service**: Billing, team management, data export
- **Security center**: Unified security overview
- **Granular controls**: Per-event notification preferences
- **Compliance**: GDPR data export, account deletion

---

## 7. Data Model Additions (Summary)

```sql
-- Key new tables required:
- user_sessions (security center)
- login_history (security center)
- notification_preferences (account)
- passkeys (auth)
- magic_links (auth)
- oauth_accounts (auth)
- onboarding_paths (onboarding)
- user_onboarding_progress (onboarding)
- setup_checklist_progress (onboarding)
```

See `docs/DATABASE_SCHEMA_ENRICHMENT.md` for full schema definitions.

---

## 8. UI Wireframe Descriptions

### Security Center
- **Layout**: Full-width dashboard with card grid
- **Components**: Security score gauge, MFA status card, sessions table, activity timeline
- **Actions**: Enable MFA, revoke sessions, download history

### Onboarding Checklist
- **Layout**: Collapsible sidebar widget (right side)
- **Components**: Progress bar, checklist items with icons, dismiss button
- **Animations**: Checkmark on completion, confetti at 100%

### Magic Link Flow
- **Layout**: Centered card (same as login)
- **Components**: Email input, submit button, countdown timer, resend link
- **States**: Input, sending, sent, expired

---

*Document generated by competitive analysis workflow. Last updated: February 2026*
