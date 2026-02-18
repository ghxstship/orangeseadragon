# GHXSTSHIP INDUSTRIES — ENTERPRISE CODEBASE AUDIT PROTOCOL v3.0

## WINDSURF DEPLOYMENT READINESS CERTIFICATION PROMPT

**Classification:** Zero-Tolerance / Surgical Precision / Production-Critical
**Standard:** Enterprise-Grade Senior Developer Approved
**Failure Mode:** BLOCK DEPLOYMENT until every finding is resolved

---

## INSTRUCTIONS TO WINDSURF

You are operating as a **Principal Staff Engineer** conducting a **pre-deployment certification audit** of this entire codebase. You are not offering suggestions. You are issuing **binding findings** — every finding must be resolved before this application ships to end users.

Your audit must be **file-by-file, layer-by-layer, line-by-line**. You will traverse the entire project tree. You will open every file. You will read every function. You will trace every data flow from the UI to the database and back. Nothing is skipped. Nothing is assumed working. Nothing passes without evidence.

**For each file you audit, output the following:**

```
📄 FILE: [path/to/file]
⚡ STATUS: PASS | FAIL | WARN | CRITICAL
🔍 FINDINGS: [list every issue with line numbers]
🔧 REQUIRED FIXES: [exact code changes needed]
📊 RISK LEVEL: LOW | MEDIUM | HIGH | CRITICAL
```

**At the end of the full audit, produce:**

1. A **Deployment Readiness Scorecard** (0-100 per layer, 95+ required for each)
2. A **Critical Path Blockers** list (must be zero to ship)
3. A **Fix Priority Queue** ordered by severity
4. A **Certification Statement** — CERTIFIED or BLOCKED with reasons

---

## PHASE 0: PROJECT RECONNAISSANCE

Before auditing any code, perform a full project scan:

```
ACTION: Execute these commands and analyze output before proceeding

1. Display full project tree (all files, no exclusions):
   find . -type f | grep -v node_modules | grep -v .git | grep -v dist | sort

2. Read and analyze every configuration file:
   - package.json (all of them — root and nested)
   - tsconfig.json / jsconfig.json (all of them)
   - .env.example / .env.local.example
   - next.config.js / vite.config.ts / webpack.config.js
   - tailwind.config.ts
   - postcss.config.js
   - eslint config files
   - prettier config files
   - docker-compose.yml / Dockerfile
   - vercel.json / netlify.toml / fly.toml
   - supabase/config.toml
   - prisma/schema.prisma or drizzle config
   - turbo.json / nx.json (monorepo configs)

3. Identify the tech stack:
   - Framework (Next.js / Nuxt / SvelteKit / Remix / etc.)
   - Language (TypeScript strictness level)
   - Database (PostgreSQL / MySQL / MongoDB / Supabase / PlanetScale)
   - ORM (Prisma / Drizzle / TypeORM / Knex)
   - Auth (NextAuth / Clerk / Supabase Auth / Auth.js / Custom)
   - State Management (Zustand / Redux / Jotai / Context)
   - API Layer (tRPC / REST / GraphQL)
   - Realtime (WebSockets / SSE / Supabase Realtime / Pusher)
   - File Storage (S3 / Supabase Storage / Cloudflare R2)
   - Deployment Target (Vercel / AWS / GCP / Fly.io / Railway)
   - CI/CD (GitHub Actions / GitLab CI / Bitbucket Pipelines)
   - Monitoring (Sentry / DataDog / LogRocket)
   - Email (Resend / SendGrid / Postmark / SES)
   - Payments (Stripe / LemonSqueezy)
   - Search (Algolia / Meilisearch / pg_trgm)

4. Map the complete architecture:
   - Draw the dependency graph between all modules
   - Identify all entry points (pages, API routes, cron jobs, webhooks)
   - Map all external service integrations
   - Catalog all environment variables required
```

---

## PHASE 1: TYPESCRIPT & LANGUAGE LAYER

### 1.1 — TypeScript Configuration Audit

```
CHECK: tsconfig.json — every project and sub-project

REQUIRED STRICT SETTINGS (fail if any are missing):
{
  "compilerOptions": {
    "strict": true,                    // Master strict flag
    "noUncheckedIndexedAccess": true,  // Arrays/objects can be undefined
    "noImplicitReturns": true,         // Every code path must return
    "noFallthroughCasesInSwitch": true,// Switch cases must break
    "noUnusedLocals": true,            // No dead variables
    "noUnusedParameters": true,        // No dead params
    "exactOptionalPropertyTypes": true,// Distinguish undefined vs missing
    "forceConsistentCasingInFileNames": true,
    "isolatedModules": true,           // Required for bundlers
    "moduleResolution": "bundler",     // Modern resolution
    "skipLibCheck": true,              // Performance (but verify types)
    "esModuleInterop": true,
    "resolveJsonModule": true
  }
}

FAIL CONDITIONS:
- "strict": false or missing
- "any" used anywhere except explicit type assertions with justification comments
- @ts-ignore or @ts-expect-error without linked issue ticket
- Type assertions (as Type) used to suppress real type errors
- "noUncheckedIndexedAccess" missing (causes runtime undefined crashes)
```

### 1.2 — Type Safety Audit (Every File)

```
SCAN EVERY .ts AND .tsx FILE FOR:

❌ CRITICAL FAILURES:
- `any` type used without `// @audit-ok: [reason]` comment
- Type assertions `as` that mask real type mismatches
- Non-null assertions `!` on values that could genuinely be null
- `// @ts-ignore` or `// @ts-expect-error` without issue reference
- Implicit `any` from untyped function parameters
- Missing return types on exported functions
- Missing generic constraints (bare `<T>` without `extends`)
- `Object`, `Function`, `{}` used as types (use specific types)
- Index signatures `[key: string]: any` without validation
- `enum` used instead of `const` objects or union types

⚠️ WARNINGS:
- Overly broad union types that could be narrowed
- Type predicates (`is`) without exhaustive checking
- Utility types used incorrectly (Partial where DeepPartial needed)
- Missing discriminated union patterns where polymorphism exists
- Intersection types that create impossible types
```

### 1.3 — Import & Module Audit

```
CHECK EVERY IMPORT STATEMENT:

❌ FAILURES:
- Circular dependencies (trace full import chains)
- Barrel exports (index.ts) that pull entire modules into bundles
- Missing file extensions where required by runtime
- Import of server-only code in client components
- Import of client-only code in server components
- Default exports on non-page/layout files (use named exports)
- Relative imports that cross module boundaries (use path aliases)
- Side-effect imports (import './file') without justification
- Dynamic imports without error boundaries
- Missing 'use client' / 'use server' directives where needed

✅ REQUIRED PATTERNS:
- Path aliases configured and used consistently (@/lib, @/components, etc.)
- Server/client boundary clearly defined
- Shared types in dedicated types/ directory
- Constants in dedicated constants/ directory
- No cross-feature imports (features should be self-contained)
```

---

## PHASE 2: FRONTEND LAYER

### 2.1 — Component Architecture Audit

```
AUDIT EVERY COMPONENT FILE:

STRUCTURE REQUIREMENTS:
- Components follow single responsibility principle
- Max component file size: 300 lines (extract sub-components if larger)
- Props interface defined and exported separately
- Default props provided where sensible
- Children components extracted when JSX exceeds 50 lines
- No business logic in components (extract to hooks/utils)
- Presentation and container components separated

NAMING CONVENTIONS:
- PascalCase for components: UserProfile.tsx
- camelCase for hooks: useUserProfile.ts
- camelCase for utilities: formatDate.ts
- SCREAMING_SNAKE for constants: MAX_RETRY_COUNT
- kebab-case for CSS modules: user-profile.module.css
- File name matches default/primary export name

COMPOSITION PATTERNS:
- Compound components used for complex UI (Tabs.Root, Tabs.List, etc.)
- Render props or slots used instead of deeply nested prop drilling
- Context used only for truly global state (theme, auth, locale)
- forwardRef used on all reusable components that wrap DOM elements
- displayName set on all forwardRef and memo components
```

### 2.2 — React/Framework-Specific Audit

```
FOR REACT / NEXT.JS PROJECTS:

HOOKS AUDIT (every useState, useEffect, useMemo, useCallback):

❌ CRITICAL:
- useEffect with missing dependencies
- useEffect with object/array dependencies (causes infinite loops)
- useEffect used for derived state (should be useMemo or computed)
- useEffect used for event handlers (should be in handler functions)
- useState for server-fetched data (should use server components or SWR/TanStack Query)
- Missing cleanup functions in useEffects with subscriptions/timers/listeners
- State updates in useEffect without checking mounted status
- Multiple useState calls that should be useReducer
- useMemo/useCallback wrapping cheap operations (unnecessary overhead)
- Missing useMemo/useCallback for expensive computations or reference-sensitive children

SERVER COMPONENTS (Next.js App Router):
- Default to server components — client components need explicit 'use client'
- No useState, useEffect, or browser APIs in server components
- Async server components used for data fetching (no useEffect)
- Client components are leaf nodes — push 'use client' boundary down
- Serializable props only passed from server to client components
- No functions/classes passed as props across the server/client boundary
- Streaming/Suspense used for slow data fetches
- generateMetadata used for SEO (not manual <Head> tags)

RENDERING AUDIT:
- No layout shifts (CLS) — all images have width/height or aspect-ratio
- No blocking renders — Suspense boundaries around async components
- Loading states exist for every async operation
- Error boundaries wrap every major section and route
- 404 and error pages implemented and styled
- Empty states designed and implemented for all list/data views
- Skeleton loaders match final layout dimensions exactly
```

### 2.3 — State Management Audit

```
AUDIT ALL STATE:

GLOBAL STATE (Zustand / Redux / Jotai / Context):
- State shape is typed with TypeScript interface
- State is normalized (no deeply nested objects)
- Selectors extract minimal required data (no full-store subscriptions)
- Actions are typed and have predictable names
- Devtools middleware configured for development
- Persist middleware configured correctly (if used)
- No redundant state (derived values computed, not stored)
- State hydration handles server/client mismatch (no hydration errors)
- Middleware order is correct (devtools → persist → immer if used)

LOCAL STATE:
- Form state managed by react-hook-form, Formik, or equivalent
- URL state used for filters, pagination, search (useSearchParams)
- Component state used only for truly local UI concerns
- No prop drilling beyond 2 levels (use context or composition)

SERVER STATE (TanStack Query / SWR / tRPC):
- All API calls wrapped in query hooks (no raw fetch in components)
- Query keys are structured and consistent
- Stale times configured appropriately per data type
- Optimistic updates implemented for mutations
- Error handling configured at query client level
- Retry logic configured (not infinite retries)
- Prefetching used for predictable navigation
- Cache invalidation strategy documented and implemented
- Infinite queries used for paginated lists (not manual page state)
```

### 2.4 — Styling & CSS Audit

```
AUDIT ALL STYLES:

TAILWIND CSS (if used):
- tailwind.config.ts has custom theme extending defaults (not replacing)
- Design tokens (colors, spacing, fonts) defined in config, not hardcoded
- No arbitrary values [color: #xxx] except truly one-off cases
- Dark mode implemented via class strategy (not media)
- Responsive breakpoints used consistently (mobile-first)
- No conflicting utility classes on same element
- Custom components use @apply sparingly (prefer component composition)
- Purging configured correctly — no missing styles in production

CSS MODULES / STYLED COMPONENTS (if used):
- No global styles that bleed across components
- CSS variables used for theming
- No !important declarations
- No z-index values without a documented z-index scale
- Transitions/animations use will-change and transform (GPU accelerated)
- No layout thrashing (reading then writing DOM in loops)

RESPONSIVE DESIGN:
- Every page tested at: 320px, 375px, 768px, 1024px, 1280px, 1440px, 1920px
- Touch targets minimum 44x44px on mobile
- No horizontal scroll on any viewport
- Font sizes use clamp() or responsive scaling
- Images use srcSet and sizes attributes
- Container queries used where appropriate

ACCESSIBILITY (a11y):
- Every interactive element is keyboard accessible
- Focus management implemented for modals, dialogs, dropdowns
- Focus trap in modals (focus stays inside when tabbing)
- Focus visible styles not removed (outline or equivalent)
- ARIA labels on all icon buttons and non-text interactive elements
- ARIA live regions for dynamic content updates
- Color contrast ratio meets WCAG AA (4.5:1 text, 3:1 large text)
- Skip navigation link as first focusable element
- Semantic HTML used (nav, main, article, section, aside, header, footer)
- Form inputs have associated labels (label htmlFor or aria-labelledby)
- Error messages linked to inputs via aria-describedby
- No content conveyed by color alone
- prefers-reduced-motion respected for all animations
- Screen reader tested (at minimum: headings structure is logical)
```

### 2.5 — Performance & Bundle Audit

```
FRONTEND PERFORMANCE:

BUNDLE ANALYSIS:
- Run and analyze bundle output (next build --analyze or equivalent)
- No single chunk > 200KB gzipped
- Dynamic imports used for heavy components (charts, editors, maps)
- Tree shaking verified — no dead code in production bundle
- No duplicate dependencies (different versions of same package)
- Lodash imported per-function, not entire library
- Date libraries are lightweight (date-fns or dayjs, NOT moment)
- Icon libraries use individual imports, not entire sets

CORE WEB VITALS TARGETS:
- LCP (Largest Contentful Paint): < 2.5s
- FID (First Input Delay): < 100ms
- CLS (Cumulative Layout Shift): < 0.1
- TTFB (Time to First Byte): < 200ms
- INP (Interaction to Next Paint): < 200ms

IMAGE OPTIMIZATION:
- All images use next/image or equivalent with optimization
- WebP/AVIF formats served with fallbacks
- Lazy loading on below-fold images
- Priority loading on hero/LCP images
- Proper sizing (no 4000px images displayed at 400px)
- Placeholder blur or skeleton during load

FONT OPTIMIZATION:
- Fonts self-hosted or loaded via next/font (not Google Fonts CDN)
- font-display: swap configured
- Subset fonts to used character ranges
- Preload critical fonts
- Variable fonts used where possible (reduces file count)

CACHING:
- Static assets have immutable cache headers
- API responses have appropriate Cache-Control headers
- Service worker configured for offline support (if PWA)
- stale-while-revalidate pattern used where appropriate
```

---

## PHASE 3: BACKEND / API LAYER

### 3.1 — API Route Audit

```
AUDIT EVERY API ROUTE / SERVER ACTION / tRPC PROCEDURE:

FOR EACH ENDPOINT, VERIFY:

1. INPUT VALIDATION:
   - Zod schema (or equivalent) validates ALL input parameters
   - Schema is strict (no unknown keys pass through — .strict() or equivalent)
   - String inputs have maxLength constraints
   - Numeric inputs have min/max constraints
   - Array inputs have maxItems constraints
   - Email fields validated with proper regex or Zod .email()
   - URL fields validated and sanitized
   - File uploads validated for type, size, and content
   - No raw req.body used without parsing/validation
   - Validation errors return 400 with specific field errors

2. AUTHENTICATION:
   - Route checks authentication before ANY logic executes
   - Auth token/session validated on every request (no cached auth)
   - Middleware applies auth check (not repeated in each handler)
   - Public routes explicitly marked and documented
   - Auth failure returns 401 (not 403 — that's authorization)

3. AUTHORIZATION:
   - User can only access their own resources (verify ownership)
   - Role-based checks where required (admin, owner, member, viewer)
   - Resource-level permissions checked (not just role)
   - IDOR (Insecure Direct Object Reference) prevented
   - Authorization failure returns 403 with no information leakage
   - Admin routes have additional verification layer

4. RESPONSE FORMAT:
   - Consistent response envelope: { data, error, meta }
   - HTTP status codes used correctly (200, 201, 204, 400, 401, 403, 404, 409, 422, 429, 500)
   - Error responses include error code, message, and details
   - No stack traces or internal errors exposed to client
   - Pagination metadata included for list endpoints (total, page, limit, hasMore)
   - Response typed with TypeScript (inferred or explicit)

5. ERROR HANDLING:
   - Try/catch wraps all async operations
   - Errors categorized: validation, auth, not_found, conflict, internal
   - Error logging includes request context (userId, route, params)
   - Error responses are sanitized (no SQL, no paths, no internals)
   - Unhandled rejections caught at framework level
   - Graceful degradation for external service failures

6. RATE LIMITING:
   - Applied to all public endpoints
   - Applied to auth endpoints (login, register, password reset)
   - Applied to sensitive operations (payments, emails, file uploads)
   - Rate limit headers included in response (X-RateLimit-*)
   - 429 response with Retry-After header when limited
```

### 3.2 — API Design Audit

```
REST API DESIGN (if applicable):

- Resources named as plural nouns (/users, /projects, /events)
- Nested resources max 2 levels deep (/users/:id/projects)
- HTTP methods used correctly:
  GET    — read (idempotent, cacheable)
  POST   — create (not idempotent)
  PUT    — full replace (idempotent)
  PATCH  — partial update (idempotent)
  DELETE — remove (idempotent)
- Query params for filtering: ?status=active&sort=-createdAt
- Pagination via cursor or offset: ?cursor=xxx&limit=20
- Versioning strategy defined (URL prefix /v1/ or header)
- HATEOAS links for discoverability (optional but reviewed)
- OpenAPI/Swagger spec generated and accurate

tRPC AUDIT (if applicable):

- Router structure mirrors feature domains
- Input schemas use Zod with proper constraints
- Output types explicitly defined (not inferred from DB)
- Middleware chain: auth → rateLimit → logging → handler
- Error handling uses TRPCError with proper codes
- Subscriptions use proper cleanup
- Batch requests configured with limits
- Links configured for error retry and logging

GraphQL AUDIT (if applicable):

- Schema defines all types (no `any` or `JSON` scalar abuse)
- Resolvers have DataLoader for N+1 prevention
- Query depth limiting configured
- Query complexity analysis configured
- Introspection disabled in production
- Persisted queries enabled
- Subscriptions have auth verification
```

### 3.3 — Server Actions Audit (Next.js / Remix)

```
AUDIT EVERY 'use server' FUNCTION:

❌ CRITICAL:
- Server action validates input (never trust client data)
- Server action checks authentication
- Server action checks authorization
- Server action catches and handles errors
- Server action revalidates affected cache paths
- Server action returns typed response
- No sensitive data in server action return values
- No redirects before completing critical operations (data loss)
- Server actions are not exported from client components
- Server actions don't expose internal IDs or paths in errors
- Progressive enhancement: forms work without JavaScript
```

---

## PHASE 4: DATABASE LAYER

### 4.1 — Schema Audit

```
AUDIT THE COMPLETE DATABASE SCHEMA:

PRISMA SCHEMA (or equivalent ORM schema):

TABLE DESIGN:
- Every table has a primary key (uuid preferred over autoincrement for distributed)
- Every table has createdAt (DateTime @default(now()))
- Every table has updatedAt (DateTime @updatedAt)
- Soft delete implemented where required (deletedAt DateTime?)
- Foreign keys defined with explicit onDelete behavior:
  CASCADE  — child deleted when parent deleted (comments when post deleted)
  SET NULL — reference nulled (authorId when user deleted)
  RESTRICT — block deletion if children exist (user with active orders)
  NO ACTION — explicit choice for each relationship
- No orphaned records possible (every FK has onDelete strategy)
- Indexes on every foreign key column
- Indexes on every column used in WHERE clauses
- Composite indexes for multi-column queries (column order matches query order)
- Unique constraints on business-unique fields (email, slug, etc.)
- Check constraints where database supports them
- Enum types used instead of magic strings

NAMING CONVENTIONS:
- Tables: PascalCase singular (User, Project, EventBooking)
- Columns: camelCase (firstName, createdAt, projectId)
- Foreign keys: [relation]Id (userId, projectId, parentCommentId)
- Indexes: idx_[table]_[columns] (idx_user_email)
- Unique: unq_[table]_[columns] (unq_user_email)
- Join tables: PascalCase combination (ProjectMember, EventAttendee)

DATA INTEGRITY:
- No nullable columns that should have defaults
- String columns have appropriate max lengths
- Decimal used for money (never float)
- DateTime stored in UTC
- JSON columns have documented schema (or use typed relations instead)
- No redundant data stored (normalize or denormalize with clear strategy)
- Timestamps use timestamptz (with timezone) not timestamp
```

### 4.2 — Migration Audit

```
AUDIT ALL DATABASE MIGRATIONS:

❌ CRITICAL:
- Migrations are sequential and non-conflicting
- No destructive changes without data migration plan
- Column renames handled in steps: add new → migrate data → drop old
- Large table migrations have batch processing (not single ALTER TABLE)
- Migrations are reversible (down migration defined)
- Migration files never modified after deployment
- Seed data separated from schema migrations
- Index creation is CONCURRENT where supported (no table locks)
- Enum modifications handle existing data

MIGRATION SAFETY CHECKLIST:
□ New columns have defaults or are nullable
□ Dropped columns are unused in current code
□ Type changes don't lose data
□ Index additions won't lock tables in production
□ Foreign key additions handle existing orphaned data
□ Enum changes are backwards compatible
□ Migration tested on production-size dataset
```

### 4.3 — Query Performance Audit

```
AUDIT EVERY DATABASE QUERY:

❌ CRITICAL:
- No N+1 queries (use eager loading / includes / joins)
- No SELECT * (select only needed columns)
- No unbounded queries (always LIMIT, always paginate)
- No full table scans on large tables (check EXPLAIN output)
- No missing indexes on JOIN columns
- No queries inside loops (batch operations instead)
- No raw SQL without parameterized queries (SQL injection risk)
- No transaction-heavy operations without timeout limits
- Connection pooling configured (PgBouncer / Prisma pool)
- Connection pool size appropriate for deployment target
- Read replicas used for read-heavy operations (if applicable)
- Query timeout configured (no runaway queries)

PAGINATION:
- Cursor-based pagination for large datasets (not offset)
- Offset pagination acceptable only for small, bounded datasets
- Total count queries only when necessary (expensive on large tables)
- Infinite scroll uses cursor pagination with proper cache invalidation

CACHING STRATEGY:
- Frequently-read, rarely-changed data cached (Redis / in-memory)
- Cache invalidation strategy documented
- Cache TTLs appropriate for data freshness requirements
- Cache stampede prevention (locking or stale-while-revalidate)
- Cache keys are structured and consistent
```

### 4.4 — Row Level Security (Supabase / PostgreSQL)

```
IF USING SUPABASE OR DIRECT POSTGRESQL RLS:

❌ CRITICAL:
- RLS enabled on EVERY table containing user data
- Policies exist for SELECT, INSERT, UPDATE, DELETE on every table
- Policies use auth.uid() (not client-supplied user IDs)
- Service role key NEVER exposed to client
- Anon key used only for public-safe operations
- JOIN-based policies tested for data leakage
- RLS policies tested with multiple user roles
- Bypass RLS only via service role in server-side code
- No policy allows unrestricted SELECT on sensitive tables
- Function security is SECURITY DEFINER only when necessary
  (and the function validates its own inputs)
```

---

## PHASE 5: AUTHENTICATION & AUTHORIZATION LAYER

### 5.1 — Authentication Audit

```
AUDIT THE COMPLETE AUTH SYSTEM:

SESSION MANAGEMENT:
- Sessions stored server-side (database/Redis), not just JWT
- Session tokens are cryptographically random (min 128 bits entropy)
- Session expiry configured (absolute and idle timeout)
- Session invalidation works (logout actually destroys session)
- Concurrent session limiting (if required by business logic)
- Session fixation prevented (new session ID after login)
- Remember me uses separate long-lived token (not extended session)

JWT (if used):
- Signed with RS256 or ES256 (NOT HS256 with weak secret)
- Short expiry (15 minutes or less for access tokens)
- Refresh tokens stored securely (httpOnly cookie or encrypted storage)
- Refresh token rotation implemented (one-time use)
- Token includes minimal claims (no sensitive data in payload)
- Token validation checks: signature, expiry, issuer, audience
- Revocation strategy exists (blocklist or short TTL + refresh)

PASSWORD HANDLING:
- Hashed with bcrypt (cost ≥ 12), scrypt, or Argon2id
- NEVER stored in plaintext, logs, or error messages
- Minimum length: 8 characters (NIST recommendation)
- Password strength indicator shown to user
- Breached password check (HaveIBeenPwned API)
- Password reset tokens are single-use and time-limited (1 hour max)
- Password reset doesn't reveal if email exists (timing-safe response)
- Old password required to set new password (except reset flow)

OAUTH / SOCIAL LOGIN:
- State parameter used and validated (CSRF protection)
- Nonce used for OpenID Connect flows
- Token exchange happens server-side (never in browser)
- OAuth tokens stored encrypted
- Account linking handles email conflicts
- Revocation endpoint called on disconnect

MULTI-FACTOR AUTHENTICATION:
- TOTP implementation uses standard algorithm (RFC 6238)
- Recovery codes generated and shown once
- MFA required for sensitive operations (if enabled)
- MFA bypass prevention (no fallback that skips MFA)
- Rate limiting on MFA verification attempts
```

### 5.2 — Authorization Audit

```
AUDIT AUTHORIZATION ON EVERY PROTECTED RESOURCE:

RBAC (Role-Based Access Control):
- Roles clearly defined with documented permissions
- Roles assigned at appropriate scope (global, organization, project)
- Permission checks happen BEFORE any data access or mutation
- Super admin access logged and auditable
- Role changes require elevated permissions
- Invitation system validates inviter has authority to assign roles

RESOURCE-LEVEL AUTHORIZATION:
- Every data access verifies user owns or has access to the resource
- IDOR testing: change resource IDs in requests and verify rejection
- Nested resource access checks parent authorization
- Bulk operations check authorization on each item
- File access checks ownership/permissions
- Webhook endpoints verify signatures (not just check existence)

AUTHORIZATION TEST MATRIX:
For every protected endpoint, verify:
□ Anonymous user → 401
□ Authenticated user (no access) → 403
□ Authenticated user (read access) → 200 (read only)
□ Authenticated user (write access) → 200 (read + write)
□ Admin user → 200 (full access)
□ Owner → 200 (full access + delete)
□ Cross-tenant access → 403 (CRITICAL — multi-tenant isolation)
```

---

## PHASE 6: SECURITY LAYER

### 6.1 — OWASP Top 10 Audit

```
VERIFY PROTECTION AGAINST EVERY OWASP TOP 10 ITEM:

1. BROKEN ACCESS CONTROL:
   - Covered in Authorization Audit above
   - CORS configured to allow only trusted origins (not *)
   - CORS credentials mode matches cookie policy
   - Directory listing disabled
   - .env files not accessible via web

2. CRYPTOGRAPHIC FAILURES:
   - All data in transit encrypted (HTTPS only, HSTS header)
   - Sensitive data at rest encrypted (PII, tokens, keys)
   - No secrets in source code (grep for API keys, passwords)
   - No secrets in client-side bundles
   - Encryption keys rotated on schedule
   - TLS 1.2+ only (no SSL, no TLS 1.0/1.1)

3. INJECTION:
   - SQL: Parameterized queries everywhere (no string concatenation)
   - XSS: All user input sanitized before rendering
   - XSS: Content-Security-Policy header configured
   - NoSQL: Query operators sanitized ($gt, $where, etc.)
   - Command: No shell commands with user input (child_process)
   - LDAP: Input sanitized if LDAP queries used
   - Template: No user input in template strings on server

4. INSECURE DESIGN:
   - Business logic has rate limits
   - Abuse scenarios documented and mitigated
   - Sensitive operations require re-authentication
   - Feature flags guard incomplete features
   - Fail-safe defaults (deny by default, not allow)

5. SECURITY MISCONFIGURATION:
   - No default credentials active
   - Error pages don't reveal stack traces
   - Unnecessary HTTP methods disabled
   - Security headers configured (see 6.2)
   - Debug mode disabled in production
   - Admin panels protected and not at obvious URLs

6. VULNERABLE COMPONENTS:
   - npm audit / yarn audit shows zero critical/high vulnerabilities
   - Dependencies pinned to exact versions (lockfile committed)
   - No deprecated packages in use
   - License compatibility verified for all dependencies
   - No packages with known CVEs in production dependencies

7. AUTHENTICATION FAILURES:
   - Covered in Authentication Audit above
   - Brute force protection on login (rate limiting + lockout)
   - Credential stuffing protection (CAPTCHA after failures)

8. DATA INTEGRITY FAILURES:
   - CI/CD pipeline integrity verified
   - Package integrity verified (lockfile, checksums)
   - No insecure deserialization of user input
   - Signed updates for auto-update features

9. LOGGING FAILURES:
   - Login attempts logged (success and failure)
   - Access control failures logged
   - Input validation failures logged
   - Sensitive data NOT in logs (passwords, tokens, PII)
   - Logs have timestamps, user context, and request IDs
   - Log injection prevented (user input sanitized before logging)

10. SERVER-SIDE REQUEST FORGERY (SSRF):
    - URL inputs validated against allowlist
    - Internal network requests blocked (10.x, 172.x, 192.168.x)
    - DNS rebinding protection if resolving user-supplied hostnames
    - Webhook URLs validated before fetching
```

### 6.2 — HTTP Security Headers Audit

```
VERIFY ALL SECURITY HEADERS ARE SET:

REQUIRED HEADERS:
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
Content-Security-Policy: [properly configured — see below]
X-Content-Type-Options: nosniff
X-Frame-Options: DENY (or SAMEORIGIN if iframe needed)
X-XSS-Protection: 0 (deprecated, CSP replaces it)
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Resource-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp (if SharedArrayBuffer needed)

CONTENT SECURITY POLICY (detailed):
- default-src 'self'
- script-src with nonce or hash (NO 'unsafe-inline' or 'unsafe-eval')
- style-src with nonce or 'self' (Tailwind may need 'unsafe-inline')
- img-src with explicit allowed domains
- font-src 'self' (plus CDN if external fonts)
- connect-src with API domains and WebSocket origins
- frame-ancestors 'none' (unless embedding is required)
- base-uri 'self'
- form-action 'self'
- upgrade-insecure-requests
- report-uri or report-to configured for violation reporting
```

### 6.3 — Secrets & Environment Audit

```
❌ ZERO TOLERANCE — ANY FAILURE HERE BLOCKS DEPLOYMENT:

- grep -r for API keys, passwords, secrets in codebase
- .env files in .gitignore (verify they're not committed in history)
- git log --all --diff-filter=A -- "*.env" shows no env files ever committed
- No hardcoded connection strings
- No hardcoded tokens or API keys
- No secrets in Docker images (use build args or secrets mounts)
- No secrets logged by any logger
- No secrets in error responses
- No secrets in client-side JavaScript bundles
- Environment variables categorized:
  PUBLIC_* or NEXT_PUBLIC_* — safe for client
  Everything else — server only
- All required env vars documented in .env.example
- Missing env vars cause immediate startup failure (not silent errors)
- Production env vars stored in secure vault (not in CI config as plaintext)
```

---

## PHASE 7: FILE STORAGE & UPLOADS LAYER

```
AUDIT ALL FILE UPLOAD AND STORAGE LOGIC:

UPLOAD SECURITY:
- File type validated by content (magic bytes), not just extension
- Maximum file size enforced server-side
- Maximum total storage per user/org enforced
- Filenames sanitized (no path traversal: ../ or special chars)
- Uploaded files stored outside web root (S3 / Supabase Storage / R2)
- No user-uploaded files served with execute permissions
- Virus/malware scanning on uploads (ClamAV or cloud-based)
- Image uploads re-encoded (strip EXIF data, prevent polyglot attacks)

STORAGE ARCHITECTURE:
- Signed URLs used for private file access (time-limited)
- Public URLs only for intentionally public files
- CDN configured for static assets
- File metadata stored in database (original name, size, type, storage key)
- Storage provider abstracted behind interface (easy to swap S3 ↔ R2)
- Backup strategy for stored files
- Lifecycle policies for temporary files (auto-delete after TTL)

FILE SERVING:
- Content-Disposition header set (attachment for downloads, inline for previews)
- Content-Type header matches actual file type
- Range requests supported for large files/video
- Thumbnails generated server-side for images
- PDF preview uses sandboxed viewer
```

---

## PHASE 8: REALTIME & WEBSOCKET LAYER

```
AUDIT ALL REALTIME FUNCTIONALITY:

CONNECTION MANAGEMENT:
- WebSocket/SSE connections authenticated on establishment
- Re-authentication on reconnection
- Connection limits per user/session
- Heartbeat/ping-pong implemented to detect stale connections
- Automatic reconnection with exponential backoff
- Graceful degradation when realtime is unavailable
- Connection state exposed to UI (connected/connecting/disconnected)

MESSAGE HANDLING:
- All incoming messages validated (schema + size limits)
- Messages typed with TypeScript interfaces
- No sensitive data broadcast to unauthorized channels
- Room/channel authorization checked before join
- Rate limiting on message sending
- Message ordering guaranteed or handled (timestamps)
- Deduplication for idempotent message processing
- Large payloads rejected or chunked

SUPABASE REALTIME (if applicable):
- Realtime enabled only on necessary tables
- RLS policies apply to realtime subscriptions
- Broadcast channel names are unpredictable (not sequential IDs)
- Presence state managed correctly (join/leave/sync)
- Subscription cleanup on component unmount
- Exponential backoff for reconnection

SCALABILITY:
- Connection count monitored
- Horizontal scaling strategy (sticky sessions or shared state)
- Message fan-out optimized (pub/sub, not N queries)
- Stale subscriptions cleaned up
```

---

## PHASE 9: EMAIL & NOTIFICATIONS LAYER

```
AUDIT ALL EMAIL SENDING:

EMAIL INFRASTRUCTURE:
- Transactional email provider configured (Resend / SendGrid / SES)
- Sender domain authenticated (SPF, DKIM, DMARC records)
- Reply-to address configured and monitored
- Bounce handling configured
- Unsubscribe link in marketing emails (CAN-SPAM compliance)
- Email templates are HTML + plaintext (multipart)
- Email content sanitized (no XSS in HTML emails)
- Email rate limiting (no spam on rapid actions)

EMAIL FUNCTIONALITY:
- Welcome email on registration
- Email verification flow works end-to-end
- Password reset flow works end-to-end
- Invitation emails work end-to-end
- Notification emails have correct data
- All links in emails use absolute URLs with correct domain
- Preview text (preheader) set and useful
- Mobile rendering tested

NOTIFICATION SYSTEM:
- Notification preferences per user
- Notification channels (in-app, email, push, SMS) configurable
- Notification queue processes reliably (idempotent handlers)
- Failed notifications retried with backoff
- Notification deduplication (same event doesn't notify twice)
- Read/unread status tracked
- Notification grouping/batching for high-volume events
```

---

## PHASE 10: PAYMENT & BILLING LAYER

```
IF PAYMENTS ARE IMPLEMENTED:

STRIPE INTEGRATION (or equivalent):

❌ ZERO TOLERANCE:
- Stripe Secret Key NEVER in client-side code
- Webhook signature verified on EVERY webhook handler
- Webhook handlers are idempotent (same event processed once)
- Customer portal session created server-side
- Checkout session created server-side
- Price IDs from environment variables (not hardcoded)
- Test mode / live mode clearly separated
- No direct API calls for charges (use Checkout or Payment Intents)

SUBSCRIPTION MANAGEMENT:
- Create subscription flow works end-to-end
- Upgrade/downgrade flow works end-to-end
- Cancellation flow works end-to-end (with grace period)
- Failed payment handling (dunning emails, grace period, access revocation)
- Webhook events handled:
  checkout.session.completed
  customer.subscription.created
  customer.subscription.updated
  customer.subscription.deleted
  invoice.payment_succeeded
  invoice.payment_failed
  customer.subscription.trial_will_end

BILLING DATA:
- Subscription status synced to database
- User access based on database status (not just Stripe API)
- Billing history accessible to user
- Invoices/receipts available for download
- Proration handled on plan changes
- Tax handling configured (Stripe Tax or manual)

TESTING:
- Stripe test mode used in development/staging
- Webhook testing with Stripe CLI
- All subscription lifecycle events tested
- Edge cases: expired card, disputed charge, refund
```

---

## PHASE 11: EDGE FUNCTIONS & MIDDLEWARE LAYER

```
AUDIT ALL MIDDLEWARE AND EDGE FUNCTIONS:

NEXT.JS MIDDLEWARE:
- middleware.ts is at project root (not nested)
- Matcher config excludes static files and API routes that handle their own auth
- Middleware is FAST (< 50ms) — no heavy computation
- No database calls in middleware (use edge-compatible auth check)
- Redirects and rewrites are correct (verify with test routes)
- Headers set correctly (security headers, CORS)
- Geolocation / IP-based logic tested for all regions
- Rate limiting at edge (if implemented)
- Bot detection / crawl budget management

EDGE FUNCTION SPECIFIC:
- Edge runtime limitations understood:
  No Node.js APIs (fs, path, child_process)
  No native modules
  Limited execution time (varies by provider)
  Limited memory
- Edge-compatible packages only (check edge runtime support)
- Fallback for edge function failures
- Caching configured at edge (CDN cache headers)

VERCEL CONFIGURATION (if applicable):
- vercel.json or next.config.js rewrites verified
- Function regions configured for latency optimization
- ISR (Incremental Static Regeneration) configured correctly
- On-demand revalidation webhooks secured
- Build output analyzed for function sizes
- Serverless function cold starts minimized
```

---

## PHASE 12: TESTING LAYER

```
AUDIT THE COMPLETE TEST SUITE:

TEST COVERAGE REQUIREMENTS:
- Unit tests: ≥ 80% coverage on business logic
- Integration tests: Every API route tested
- E2E tests: Every critical user flow tested
- No tests that always pass (check for meaningful assertions)
- No flaky tests (tests must pass consistently)

UNIT TESTS:
- Pure functions tested with multiple input scenarios
- Edge cases tested (null, undefined, empty, boundary values)
- Error cases tested (verify errors are thrown correctly)
- Mocks used only for external dependencies (not for code under test)
- Test data factories or fixtures (no copy-paste test data)
- Tests are independent (no shared state, no execution order dependency)

INTEGRATION TESTS:
- API routes tested with real database (test database)
- Authentication tested (valid/invalid/expired tokens)
- Authorization tested (verify 403 for unauthorized access)
- Input validation tested (verify 400 for invalid input)
- Database constraints tested (unique violations, FK constraints)
- File upload tested with real files
- Webhook handlers tested with sample payloads
- Email sending tested (mock transport, verify content)

E2E TESTS (Playwright / Cypress):
- User registration flow
- User login flow (including OAuth if applicable)
- Core feature CRUD operations
- Payment flow (with Stripe test mode)
- Error states and recovery
- Mobile viewport tests
- Multi-tab / multi-session scenarios

CRITICAL FLOWS THAT MUST HAVE E2E TESTS:
□ Sign up → verify email → complete onboarding → land on dashboard
□ Login → navigate to feature → create item → view item → edit → delete
□ Start trial → upgrade to paid → manage subscription → cancel
□ Invite team member → accept invitation → access shared resource
□ Upload file → process → view → download → delete
□ Receive notification → view → action → mark read
```

---

## PHASE 13: CI/CD & DEPLOYMENT LAYER

```
AUDIT THE DEPLOYMENT PIPELINE:

CI PIPELINE:
- Runs on every PR and push to main
- Steps in order:
  1. Install dependencies (cached)
  2. Lint (ESLint + Prettier check)
  3. Type check (tsc --noEmit)
  4. Unit tests
  5. Integration tests
  6. Build (production build)
  7. E2E tests (against built app)
  8. Bundle size check (fail if regression)
  9. Security audit (npm audit)
  10. Deploy preview (for PRs)
- Pipeline completes in < 10 minutes
- Artifacts (test reports, coverage, screenshots) uploaded
- Status checks required for PR merge

DEPLOYMENT:
- Branch strategy documented (main → production, develop → staging)
- Preview deployments for every PR
- Staging environment mirrors production
- Database migration runs before deployment
- Health check endpoint exists and is verified post-deploy
- Rollback strategy documented and tested
- Blue-green or canary deployment for zero-downtime
- Environment promotion: staging → production (not direct to prod)
- Deployment notifications (Slack / email)

ENVIRONMENT MANAGEMENT:
- Development, staging, production clearly separated
- Each environment has its own:
  Database instance
  Auth provider config
  API keys
  Domain / URLs
  Feature flags
- Environment parity (same runtime, same OS, same config)
- Secrets managed via platform secrets (not committed)
```

---

## PHASE 14: MONITORING & OBSERVABILITY LAYER

```
AUDIT MONITORING CONFIGURATION:

ERROR TRACKING (Sentry or equivalent):
- Source maps uploaded for production builds
- Error boundaries capture React errors
- Unhandled promise rejections captured
- User context attached (userId, email — not PII in some jurisdictions)
- Release tracking configured
- Environment tags set (production, staging, development)
- Error grouping configured (not too broad, not too narrow)
- Alert rules configured for new errors and regressions
- Performance monitoring enabled (transaction tracing)

LOGGING:
- Structured logging (JSON format)
- Log levels used correctly (debug, info, warn, error)
- Request ID / correlation ID on every log entry
- No PII in logs (passwords, tokens, SSN, credit cards)
- Log retention policy configured
- Log aggregation service configured (if multiple instances)
- Log rotation configured (no disk filling)

UPTIME MONITORING:
- Health check endpoint: GET /api/health returns:
  { status: "ok", database: "connected", cache: "connected", version: "x.y.z" }
- Uptime monitoring service configured (Checkly / UptimeRobot / Better Stack)
- Alert escalation path documented
- Status page configured for end users (optional but recommended)

PERFORMANCE MONITORING:
- Core Web Vitals tracked (LCP, FID, CLS, INP)
- API response times tracked (P50, P95, P99)
- Database query times tracked
- External API latency tracked
- Anomaly detection for traffic spikes
- Custom business metrics tracked (signups, conversions, etc.)

ALERTING:
- Critical alerts: PagerDuty / SMS / Phone
- Warning alerts: Slack / Email
- Info alerts: Dashboard only
- Alert fatigue prevention (threshold tuning, deduplication)
- Runbook linked to each alert type
```

---

## PHASE 15: DOCUMENTATION & DEVELOPER EXPERIENCE LAYER

```
AUDIT ALL DOCUMENTATION:

README.md:
- Project description and purpose
- Tech stack summary
- Prerequisites (Node version, database, etc.)
- Setup instructions (step-by-step, copy-pasteable)
- Environment variable documentation
- Development workflow (how to run, test, build)
- Deployment instructions
- Architecture overview (diagram or description)
- Contributing guidelines
- License

CODE DOCUMENTATION:
- Complex business logic has JSDoc comments explaining WHY
- Public API functions have JSDoc with @param and @returns
- Type definitions have comments explaining non-obvious fields
- Configuration files have inline comments
- Complex regex patterns have explanatory comments
- TODO/FIXME/HACK comments have linked issue tickets
- No commented-out code (use git history instead)

API DOCUMENTATION:
- OpenAPI / Swagger spec generated from code
- All endpoints documented with:
  Description
  Request parameters (path, query, body)
  Request body schema with examples
  Response schemas with examples
  Error response schemas
  Authentication requirements
- API documentation accessible at /docs or /api-docs
- Postman / Insomnia collection exported

ARCHITECTURE DOCUMENTATION:
- System architecture diagram (services, databases, queues)
- Data flow diagrams for critical paths
- Entity relationship diagram
- Authentication flow diagram
- Deployment architecture diagram
- Decision records for major technical choices (ADRs)
```

---

## PHASE 16: OPENAPI & WHITE LABEL LAYER

### 16.1 — OpenAPI Specification Audit

```
AUDIT OPENAPI/SWAGGER SPECIFICATION:

SPECIFICATION QUALITY:
- OpenAPI 3.1 (latest) or minimum 3.0
- Every endpoint documented (no undocumented routes)
- Request body schemas complete with required fields
- Response schemas complete for all status codes (200, 400, 401, 403, 404, 500)
- Examples provided for every request/response
- Authentication schemes documented (bearerAuth, apiKey, oauth2)
- Tags used to group related endpoints
- Description includes rate limits and pagination behavior
- Schemas use $ref for reusability (no inline duplication)
- Enum values documented with descriptions
- Nullable fields explicitly marked

API VERSIONING:
- Version strategy documented (URL path, header, or query param)
- Breaking changes only in new versions
- Deprecation notices on old endpoints
- Migration guide between versions
- Sunset headers on deprecated endpoints

SDK / CLIENT GENERATION:
- OpenAPI spec validated (no errors with openapi-generator validate)
- Spec is auto-generated from code annotations (not manually maintained)
- Client SDK generatable from spec (test with openapi-generator)
- Types match between spec and actual implementation
```

### 16.2 — White Label / Multi-Tenancy Audit

```
IF THE APPLICATION SUPPORTS WHITE LABELING OR MULTI-TENANCY:

TENANT ISOLATION:
- Data isolation strategy documented:
  Schema-per-tenant (PostgreSQL schemas)
  Row-level isolation (tenant_id on every table)
  Database-per-tenant (highest isolation)
- Every query filters by tenant (no cross-tenant data leakage)
- Tenant ID derived from authenticated session (never from request params)
- Admin operations are tenant-scoped
- File storage is tenant-scoped (separate buckets/prefixes)
- Cache keys are tenant-scoped
- Background jobs are tenant-scoped
- Realtime subscriptions are tenant-scoped

BRANDING & CUSTOMIZATION:
- Tenant branding configuration (logo, colors, favicon, name)
- CSS custom properties used for theme values
- Email templates support tenant branding
- Custom domain support per tenant (if applicable):
  SSL certificate provisioning automated
  DNS verification flow
  Routing configuration
- Login page customizable per tenant
- Transactional emails from tenant's domain (if configured)

WHITE LABEL CONFIGURATION:
- Tenant settings stored in database (not environment variables)
- Settings cached with proper invalidation
- Feature flags per tenant (enable/disable features)
- Billing per tenant (separate Stripe accounts or customers)
- Analytics separated per tenant
- Data export per tenant (GDPR compliance)
- Tenant onboarding flow (automated provisioning)
- Tenant offboarding flow (data retention, deletion)
```

---

## PHASE 17: INTERNATIONALIZATION (i18n) & LOCALIZATION

```
IF THE APPLICATION SUPPORTS MULTIPLE LANGUAGES:

i18n ARCHITECTURE:
- Translation framework configured (next-intl, i18next, etc.)
- Default locale defined
- Fallback locale chain configured
- All user-facing strings extracted to translation files
- No hardcoded strings in components (grep for English text in JSX)
- Pluralization rules handled correctly per locale
- Date/time formatting uses Intl API (locale-aware)
- Number/currency formatting uses Intl API (locale-aware)
- RTL (right-to-left) layout support (if Arabic, Hebrew, etc.)
- Dynamic content (database content) has translation strategy
- URL structure for locales (subdomain, path prefix, or domain)
- SEO: hreflang tags for localized pages
- Language switcher persists preference
```

---

## PHASE 18: ACCESSIBILITY & COMPLIANCE LAYER

```
LEGAL COMPLIANCE:

GDPR (if serving EU users):
- Cookie consent banner with granular controls
- Privacy policy page
- Data processing disclosure
- Right to access (data export)
- Right to deletion (account + data deletion)
- Right to rectification (edit personal data)
- Data processing agreements with sub-processors
- Data breach notification procedure documented

CCPA (if serving California users):
- "Do Not Sell My Personal Information" link
- Privacy policy with CCPA disclosures
- Opt-out mechanism for data selling

ADA / WCAG (web accessibility):
- WCAG 2.1 Level AA compliance (minimum)
- Automated testing (axe-core) integrated in CI
- Manual testing with screen readers
- Keyboard navigation complete
- All images have alt text
- All videos have captions
- All audio has transcripts
- Color is not sole means of conveying information
```

---

## PHASE 19: DISASTER RECOVERY & RESILIENCE

```
AUDIT RESILIENCE ARCHITECTURE:

DATABASE BACKUP:
- Automated backups configured (daily minimum)
- Point-in-time recovery available
- Backup restoration tested and documented
- Backup stored in different region than primary
- Backup encryption at rest

APPLICATION RESILIENCE:
- Circuit breaker pattern for external service calls
- Retry with exponential backoff for transient failures
- Graceful degradation when dependencies fail
- Queue-based processing for non-critical operations
- Dead letter queue for failed messages
- Timeout on all external HTTP requests
- Connection pooling for database and Redis

INCIDENT RESPONSE:
- Runbook for common failures (database down, API timeout, etc.)
- On-call rotation documented
- Incident severity levels defined
- Communication plan for user-facing outages
- Post-mortem template and process defined
```

---

## PHASE 20: FINAL DEPLOYMENT READINESS CHECKLIST

```
COMPLETE THIS CHECKLIST — EVERY ITEM MUST PASS:

PRE-LAUNCH:
□ All environment variables configured for production
□ Database migrations applied to production
□ DNS configured and SSL certificates provisioned
□ CDN configured and warm
□ Error tracking configured and verified
□ Monitoring and alerting configured and verified
□ Logging configured and verified
□ Backup system configured and verified
□ Rate limiting configured and tested
□ Security headers verified (use securityheaders.com)
□ Performance tested under expected load
□ All E2E tests pass against staging environment
□ Manual QA completed on staging
□ Accessibility audit passed
□ Legal review completed (terms, privacy, cookies)
□ SEO basics verified (meta tags, sitemap, robots.txt, structured data)
□ Analytics configured (privacy-respecting)
□ Social sharing tags (OG, Twitter Card) configured
□ Favicon and PWA manifest configured
□ 404 and 500 error pages designed and deployed
□ Email delivery verified from production domain
□ Webhook endpoints accessible from external services
□ API documentation published and accessible
□ Runbooks written for operational procedures
□ Team notified of launch plan and rollback procedures

POST-LAUNCH (first 48 hours):
□ Monitor error rates (should be < 0.1%)
□ Monitor response times (P95 < 500ms for API, < 2s for pages)
□ Monitor Core Web Vitals
□ Monitor conversion/signup funnel
□ Verify all email flows in production
□ Verify all payment flows in production
□ Verify all webhook flows in production
□ Monitor database performance (query times, connection count)
□ Verify backups ran successfully
□ Verify monitoring alerts fire correctly (test with synthetic error)
```

---

## DEPLOYMENT READINESS SCORECARD TEMPLATE

```
╔══════════════════════════════════════════════════════════╗
║         DEPLOYMENT READINESS SCORECARD                  ║
╠════════════════════════════════════╦═════════╦══════════╣
║ LAYER                              ║ SCORE   ║ STATUS   ║
╠════════════════════════════════════╬═════════╬══════════╣
║ TypeScript & Language              ║   /100  ║          ║
║ Frontend Components                ║   /100  ║          ║
║ State Management                   ║   /100  ║          ║
║ Styling & Accessibility            ║   /100  ║          ║
║ Performance & Bundle               ║   /100  ║          ║
║ API Routes / Server Actions        ║   /100  ║          ║
║ API Design & Documentation         ║   /100  ║          ║
║ Database Schema                    ║   /100  ║          ║
║ Database Queries & Performance     ║   /100  ║          ║
║ Authentication                     ║   /100  ║          ║
║ Authorization                      ║   /100  ║          ║
║ Security (OWASP)                   ║   /100  ║          ║
║ Security Headers                   ║   /100  ║          ║
║ Secrets Management                 ║   /100  ║          ║
║ File Storage & Uploads             ║   /100  ║          ║
║ Realtime & WebSockets              ║   /100  ║          ║
║ Email & Notifications              ║   /100  ║          ║
║ Payments & Billing                 ║   /100  ║          ║
║ Edge Functions & Middleware         ║   /100  ║          ║
║ Testing                            ║   /100  ║          ║
║ CI/CD & Deployment                 ║   /100  ║          ║
║ Monitoring & Observability         ║   /100  ║          ║
║ Documentation                      ║   /100  ║          ║
║ OpenAPI & White Label              ║   /100  ║          ║
║ i18n & Localization                ║   /100  ║          ║
║ Compliance (GDPR/ADA/CCPA)         ║   /100  ║          ║
║ Disaster Recovery                  ║   /100  ║          ║
╠════════════════════════════════════╬═════════╬══════════╣
║ OVERALL SCORE                      ║   /100  ║          ║
╠════════════════════════════════════╩═════════╩══════════╣
║                                                         ║
║ CERTIFICATION: [ CERTIFIED / BLOCKED ]                  ║
║ CRITICAL BLOCKERS: [ count ]                            ║
║ HIGH FINDINGS: [ count ]                                ║
║ MEDIUM FINDINGS: [ count ]                              ║
║ LOW FINDINGS: [ count ]                                 ║
║                                                         ║
║ MINIMUM SCORE TO SHIP: 95 per layer                     ║
║ MINIMUM OVERALL TO SHIP: 95                             ║
║ BLOCKERS ALLOWED TO SHIP: 0                             ║
║                                                         ║
╚═════════════════════════════════════════════════════════╝
```

---

## EXECUTION PROTOCOL

**When you receive a codebase to audit with this prompt:**

1. **Phase 0**: Scan the entire project tree. Map every file. Identify the stack.
2. **Phase 1-19**: Proceed layer by layer. For each phase:
   - Open and read every relevant file
   - Test every requirement listed
   - Log every finding with file path, line number, and severity
   - Provide exact fix code for every finding
3. **Phase 20**: Complete the final checklist
4. **Scorecard**: Generate the Deployment Readiness Scorecard
5. **Certification**: Issue CERTIFIED or BLOCKED determination
6. **Fix Queue**: Output prioritized list of all fixes needed, ordered:
   - CRITICAL → must fix before deployment
   - HIGH → should fix before deployment
   - MEDIUM → fix within first sprint post-launch
   - LOW → fix when convenient

**You are not done until every file has been opened, every check has been performed, and the scorecard is complete.**

**DO NOT SUMMARIZE. DO NOT SKIP. DO NOT ASSUME. VERIFY EVERYTHING.**

---

*GHXSTSHIP Industries LLC — Where Zero Tolerance Meets Enterprise Excellence*
*Protocol v3.0 — Built for deployment readiness certification of production-grade systems*