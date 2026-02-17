# Expense Approval + Workflow Execution Smoke Checklist

Use this checklist after deploying the P0 fixes for expense approvals and workflow execution status handling.

## Preconditions

- App is running locally or in test environment.
- Database includes migration:
  - `supabase/migrations/00117_workflow_executions_update_policy.sql`
- Test user is an active member of the target organization.

## 1) Expense Approval Contract Compatibility

1. Create or identify an `expense_approval_requests` row with `status = pending`.
2. Call action endpoints with canonical payloads and verify success:
   - `POST /api/expense-approval-requests/approve` with `{ "id": "..." }`
   - `POST /api/expense-approval-requests/reject` with `{ "id": "...", "reason": "..." }`
   - `POST /api/expense-approval-requests/return` with `{ "id": "...", "reason": "..." }`
   - `POST /api/expense-approval-requests/bulk-approve` with `{ "ids": ["..."] }`
3. Repeat with legacy payload keys and verify compatibility:
   - `requestId`, `requestIds`, `comments`
4. Verify route responses remain envelope-shaped: `{ data: ... }`.

## 2) Expense Approvals UI Data Shape

1. Open `/finance/expense-approvals`.
2. Confirm cards render without runtime errors:
   - description, amount, category, date, status badge
3. Confirm statuses render correctly:
   - `returned` values should appear as `cancelled` in UI.
4. Perform approve/reject/return from card actions and confirm optimistic state updates.

## 3) Workflow Execution Status Integrity

1. Trigger workflow execution via:
   - `POST /api/advancing/workflows/execute`
2. Validate transition behavior:
   - wait step -> status `waiting`
   - completed flow -> status `completed`
   - failed flow -> status `failed`
3. Confirm no records remain incorrectly stuck in `running` due to update failures.

## 4) Regression Test Commands

Run the full targeted verification pipeline:

```bash
npm run verify:expense-approval
```

Or run tests only:

```bash
npm run test:expense-approval:regression
```

Advanced / equivalent explicit commands:

Run targeted tests:

```bash
npm run test -- --run \
  src/lib/expense-approvals/action-payload.test.ts \
  src/app/api/expense-approval-requests/routes.test.ts \
  src/app/api/advancing/workflows/execute/route.test.ts
```

Run full unit suite:

```bash
npm run test -- --run
```

## 5) Troubleshooting Notes

- If workflow status updates fail with DB errors, verify migration `00117` was applied.
- If action routes return `BAD_REQUEST id is required`, inspect caller payload keys.
- If approval cards do not show expected records, verify data is in `expense_approval_requests` (not legacy `approval_requests`).

## 6) Applying Migration 00117 Without Supabase CLI

If `supabase` CLI is not installed in your environment:

1. Open Supabase Dashboard -> SQL Editor for your project.
2. Open migration file:
   - `supabase/migrations/00117_workflow_executions_update_policy.sql`
3. Execute the SQL contents against the target environment.
4. Re-run:

```bash
npm run verify:expense-approval
```
