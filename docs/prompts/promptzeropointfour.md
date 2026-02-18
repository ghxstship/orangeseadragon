# GHXSTSHIP Platform IA Rebuild — Normalized Architecture

## Objective
Rebuild the Information Architecture for `@(app)`, `@(auth)`, and `@(onboarding)` from scratch using a normalized component/schema/UI configuration approach.

---

## ⚠️ CRITICAL: ZERO MOCK DATA POLICY

### Absolute Requirements
- **NO mock data, placeholder values, or hardcoded content under any circumstances**
- **ALL data flows through live Supabase from day one**
- **Components must gracefully handle empty/loading/error states from real queries**
- **If data doesn't exist yet, create the schema and seed it—don't fake it**

### Implementation Rules
| ❌ PROHIBITED | ✅ REQUIRED |
|---------------|-------------|
| `const users = [{id: 1, name: "Test"}]` | `const { data: users } = useQuery('users')` |
| Hardcoded dropdown options | Supabase lookup tables |
| Static JSON fixtures | Live RLS-protected queries |
| `placeholder="John Doe"` | `placeholder={t('form.name.placeholder')}` |
| Conditional mock fallbacks | Proper loading/empty states |

### Data Layer Architecture
```
Supabase (Single Source of Truth)
    ├── Tables (3NF normalized)
    ├── Views (computed/joined data)
    ├── RLS Policies (security at data layer)
    ├── Edge Functions (business logic)
    └── Realtime Subscriptions (live updates)
           ↓
    React Query / SWR Cache
           ↓
    UI Components (render from cache)
```

### Why This Matters
- **One wiring, zero rewrites**: Build it right the first time
- **Real error handling**: Discover edge cases immediately
- **Accurate performance**: No false confidence from instant mock responses
- **Security validation**: RLS tested from first commit

---

## Core Principles

### Data Architecture
- **3NF Enforcement**: All schemas must adhere to Third Normal Form
- **Single Source of Truth**: Supabase is the only data authority
- **Schema-Driven UI**: Components render from DB-backed configuration tables
- **Lookup Tables**: All enums, options, and static choices stored in Supabase

### Component Architecture
- **Zero Specialized Views**: No one-off page components
- **Modular Page Templates**: Normalized, component-driven layouts
- **Configuration Over Code**: UI variations via Supabase config rows, not code branches
- **State-Aware Rendering**: Every component handles `loading | empty | error | success`

### Enterprise Standards
| Standard | Implementation |
|----------|----------------|
| **Accessibility** | WCAG 2.1 AA, i18n via Supabase translations table, RTL support |
| **Security** | RLS policies, RBAC from `user_roles` table, audit logging |
| **Privacy** | Consent flags in user profile, data minimization |
| **Performance** | React Query caching, Supabase connection pooling, <3s LCP |

### Whitelabeling
- Theme tokens stored in `tenant_config` table
- Brand assets served from Supabase Storage
- Feature flags from `tenant_features` table

---

## Deliverables
1. **Supabase Schema**: Normalized tables with RLS policies (no migrations pending)
2. **Seed Data**: Real reference data, not lorem ipsum
3. **Query Hooks**: Typed Supabase queries with proper error/loading states
4. **Component Registry**: Zero specialized views, all DB-driven
5. **Page Templates**: Configuration stored in `page_layouts` table

---

## Validation Checklist
Before any PR:
- [ ] `grep -r "mock\|placeholder\|dummy\|test.*data\|lorem" src/` returns zero results
- [ ] All components display loading skeleton on initial fetch
- [ ] All components display empty state when query returns `[]`
- [ ] All components display error boundary on query failure
- [ ] No hardcoded arrays, objects, or option lists in component files