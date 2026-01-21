# ATLVS Quality & Developer Experience

## Testing Strategy

### Test Pyramid

```
         ┌─────────┐
         │   E2E   │  10%  - Critical user journeys
         ├─────────┤
         │  Integ  │  20%  - API & component integration
         ├─────────┤
         │  Unit   │  70%  - Functions, hooks, utilities
         └─────────┘
```

### Unit Testing (Vitest)

**Coverage Targets:**
- Statements: 80%
- Branches: 75%
- Functions: 85%
- Lines: 80%

```typescript
// Example: Testing a workflow condition evaluator
describe('WorkflowConditionEvaluator', () => {
  it('evaluates field_equals correctly', () => {
    const condition = { type: 'field_equals', field: 'status', value: 'active' };
    const context = { entity: { status: 'active' } };
    
    expect(evaluateCondition(condition, context)).toBe(true);
  });
  
  it('evaluates field_in_list correctly', () => {
    const condition = { type: 'field_in_list', field: 'priority', value: ['high', 'urgent'] };
    const context = { entity: { priority: 'high' } };
    
    expect(evaluateCondition(condition, context)).toBe(true);
  });
});
```

### Integration Testing (Playwright)

**Critical User Journeys:**

| Journey | Steps | Priority |
|---------|-------|----------|
| User Onboarding | Sign up → Create org → Invite team | P0 |
| Task Management | Create → Assign → Complete | P0 |
| Event Creation | Create event → Add crew → Publish | P0 |
| Asset Checkout | Scan → Checkout → Return | P0 |
| Expense Submission | Create → Submit → Approve | P1 |
| Invoice Generation | Create → Send → Record payment | P1 |

```typescript
// Example: E2E test for task creation
test('create and complete a task', async ({ page }) => {
  await page.goto('/tasks');
  
  // Create task
  await page.click('[data-testid="create-task-btn"]');
  await page.fill('[data-testid="task-title"]', 'Test Task');
  await page.click('[data-testid="save-task-btn"]');
  
  // Verify created
  await expect(page.locator('text=Test Task')).toBeVisible();
  
  // Complete task
  await page.click('[data-testid="task-checkbox"]');
  await expect(page.locator('[data-testid="task-status"]')).toHaveText('Done');
});
```

### Contract Testing (OpenAPI)

```yaml
# openapi-test.yaml
tests:
  - name: "GET /api/v1/tasks returns valid schema"
    request:
      method: GET
      path: /api/v1/tasks
    response:
      status: 200
      schema: $ref('#/components/schemas/TaskList')
      
  - name: "POST /api/v1/tasks creates task"
    request:
      method: POST
      path: /api/v1/tasks
      body:
        title: "New Task"
        project_id: "{{project_id}}"
    response:
      status: 201
      schema: $ref('#/components/schemas/Task')
```

### Performance Testing (k6)

```javascript
// load-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 100 },  // Ramp up
    { duration: '5m', target: 100 },  // Steady state
    { duration: '2m', target: 200 },  // Spike
    { duration: '2m', target: 0 },    // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],  // 95% under 500ms
    http_req_failed: ['rate<0.01'],    // <1% errors
  },
};

export default function () {
  const res = http.get('https://api.atlvs.io/v1/tasks');
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });
  sleep(1);
}
```

**Performance Benchmarks:**

| Metric | Target | Critical |
|--------|--------|----------|
| API Response (p95) | < 200ms | < 500ms |
| Page Load (LCP) | < 2.5s | < 4s |
| Time to Interactive | < 3.5s | < 5s |
| Database Query | < 50ms | < 200ms |

---

## CI/CD Pipeline

### GitHub Actions Workflow

```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  lint-and-typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
      - run: pnpm typecheck

  unit-tests:
    runs-on: ubuntu-latest
    needs: lint-and-typecheck
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - run: pnpm install --frozen-lockfile
      - run: pnpm test:unit --coverage
      - uses: codecov/codecov-action@v3

  build:
    runs-on: ubuntu-latest
    needs: unit-tests
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - run: pnpm install --frozen-lockfile
      - run: pnpm build
      - uses: actions/upload-artifact@v4
        with:
          name: build
          path: .next

  integration-tests:
    runs-on: ubuntu-latest
    needs: build
    steps:
      - uses: actions/checkout@v4
      - uses: actions/download-artifact@v4
      - run: pnpm test:e2e

  security-scan:
    runs-on: ubuntu-latest
    needs: build
    steps:
      - uses: actions/checkout@v4
      - uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}

  deploy-preview:
    runs-on: ubuntu-latest
    needs: [integration-tests, security-scan]
    if: github.event_name == 'pull_request'
    steps:
      - uses: actions/checkout@v4
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}

  deploy-production:
    runs-on: ubuntu-latest
    needs: [integration-tests, security-scan]
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

### Branch Strategy

```
main ─────────────────────────────────────────► Production
  │
  └── develop ────────────────────────────────► Staging
        │
        ├── feature/ATLVS-123-task-board ─────► Feature
        ├── feature/ATLVS-124-calendar ───────► Feature
        └── hotfix/ATLVS-125-auth-fix ────────► Hotfix
```

### Release Process

1. **Feature Development** → `feature/*` branch
2. **Code Review** → PR to `develop`
3. **Staging Deploy** → Automatic on merge
4. **QA Validation** → Manual testing
5. **Release PR** → `develop` → `main`
6. **Production Deploy** → Automatic on merge
7. **Tag Release** → `v1.2.3`

---

## Documentation

### API Reference (OpenAPI)

- Auto-generated from OpenAPI spec
- Interactive Swagger UI at `/api/docs`
- SDK generation for TypeScript, Python, Go

### Component Storybook

```bash
# Run Storybook
pnpm storybook

# Build static docs
pnpm build-storybook
```

**Story Categories:**
- Primitives (Button, Input, Select)
- Data Display (Table, Card, List)
- Data Entry (Form, DatePicker)
- Feedback (Toast, Dialog, Alert)
- Layout (Sidebar, Header, Tabs)
- Views (Board, Calendar, Timeline)

### Architecture Decision Records (ADRs)

```markdown
# ADR-001: Use Supabase for Backend

## Status
Accepted

## Context
Need a scalable backend with auth, database, and real-time.

## Decision
Use Supabase (PostgreSQL + Auth + Realtime + Storage).

## Consequences
- Positive: Rapid development, built-in RLS
- Negative: Vendor lock-in, PostgreSQL only
```

### Runbooks

| Runbook | Purpose |
|---------|---------|
| `DEPLOY.md` | Production deployment steps |
| `ROLLBACK.md` | Emergency rollback procedure |
| `INCIDENT.md` | Incident response process |
| `SCALING.md` | Horizontal scaling guide |
| `BACKUP.md` | Database backup/restore |

---

## Developer Experience

### Local Development

```bash
# Clone and setup
git clone https://github.com/atlvs/atlvs.git
cd atlvs
pnpm install

# Start Supabase locally
pnpm supabase start

# Run migrations
pnpm supabase db reset

# Start dev server
pnpm dev
```

### Environment Variables

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Optional integrations
STRIPE_SECRET_KEY=sk_test_...
RESEND_API_KEY=re_...
```

### Code Generation

```bash
# Generate TypeScript types from database
pnpm supabase gen types typescript --local > src/types/database.ts

# Generate API client from OpenAPI
pnpm openapi-typescript openapi/atlvs-api.yaml -o src/types/api.ts

# Generate Zod schemas
pnpm ts-to-zod src/types/database.ts src/validators/database.ts
```

### VS Code Extensions

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "prisma.prisma",
    "ms-playwright.playwright",
    "vitest.explorer"
  ]
}
```

### Git Hooks (Husky)

```bash
# pre-commit
pnpm lint-staged

# pre-push
pnpm typecheck
pnpm test:unit

# commit-msg
npx commitlint --edit $1
```

### Commit Convention

```
type(scope): description

feat(tasks): add drag-drop reordering
fix(auth): resolve session refresh issue
docs(api): update OpenAPI spec
refactor(ui): extract DataTable component
test(workflows): add condition evaluator tests
chore(deps): update dependencies
```

---

## Monitoring & Observability

### Error Tracking (Sentry)

```typescript
// sentry.client.config.ts
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});
```

### Analytics (PostHog)

```typescript
// Track feature usage
posthog.capture('task_created', {
  project_id: task.project_id,
  has_due_date: !!task.due_date,
  has_assignee: !!task.assignee_id,
});
```

### Logging (Axiom)

```typescript
// Structured logging
logger.info('Workflow executed', {
  workflow_id: workflow.id,
  trigger: workflow.trigger.type,
  duration_ms: endTime - startTime,
  actions_count: workflow.actions.length,
});
```

### Health Checks

```typescript
// /api/health
export async function GET() {
  const checks = {
    database: await checkDatabase(),
    redis: await checkRedis(),
    storage: await checkStorage(),
  };
  
  const healthy = Object.values(checks).every(c => c.status === 'ok');
  
  return Response.json(checks, { status: healthy ? 200 : 503 });
}
```

---

## Security Practices

### Dependency Scanning

```yaml
# .github/workflows/security.yml
- uses: snyk/actions/node@master
- uses: github/codeql-action/analyze@v2
```

### Secret Management

- Use environment variables (never commit secrets)
- Rotate API keys quarterly
- Use Vault for production secrets

### Security Headers

```typescript
// next.config.js
headers: [
  {
    source: '/:path*',
    headers: [
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=()' },
    ],
  },
],
```

---

## Support & Escalation

### Issue Triage

| Priority | Response | Resolution | Example |
|----------|----------|------------|---------|
| P0 Critical | 15 min | 4 hours | Production down |
| P1 High | 1 hour | 24 hours | Major feature broken |
| P2 Medium | 4 hours | 1 week | Minor bug |
| P3 Low | 1 day | 2 weeks | Enhancement |

### On-Call Rotation

- Primary: Responds to all alerts
- Secondary: Backup if primary unavailable
- Rotation: Weekly, handoff on Mondays
