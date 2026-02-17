import { beforeEach, describe, expect, it, vi } from 'vitest';
import { POST } from './route';

const { requirePolicyMock } = vi.hoisted(() => ({
  requirePolicyMock: vi.fn(),
}));

vi.mock('@/lib/api/guard', () => ({
  requirePolicy: requirePolicyMock,
}));

type RouteStep = {
  type: 'action' | 'condition' | 'wait' | 'branch';
  action?: string;
  config?: Record<string, unknown>;
};

type MockDbError = {
  message: string;
  code?: string;
};

function createRequest(body: Record<string, unknown>): Request {
  return new Request('http://localhost/api/advancing/workflows/execute', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

function createSupabaseMock(options?: {
  steps?: RouteStep[];
  waitingUpdateError?: MockDbError | null;
  finalUpdateError?: MockDbError | null;
}) {
  const workflow = {
    id: 'workflow-1',
    organization_id: 'org-1',
    entity_type: 'advance_item',
    steps: options?.steps || [{ type: 'branch' as const }],
    run_once_per_entity: false,
  };

  const execution = { id: 'execution-1' };

  const workflowQuery = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: workflow, error: null }),
  };

  const workflowExecutionsQuery = {
    insert: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: execution, error: null }),
    update: vi.fn((values: { status?: string }) => ({
      eq: vi.fn().mockResolvedValue({
        data: null,
        error:
          values.status === 'waiting'
            ? options?.waitingUpdateError || null
            : options?.finalUpdateError || null,
      }),
    })),
  };

  return {
    from: vi.fn((tableName: string) => {
      if (tableName === 'workflows') return workflowQuery;
      if (tableName === 'workflow_executions') return workflowExecutionsQuery;

      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: null }),
      };
    }),
  };
}

describe('POST /api/advancing/workflows/execute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns a database error when waiting status update fails', async () => {
    const supabase = createSupabaseMock({
      steps: [{ type: 'wait', config: { for: 'approval' } }],
      waitingUpdateError: { message: 'RLS denied update', code: '42501' },
    });

    requirePolicyMock.mockResolvedValue({
      user: { id: 'user-1' },
      supabase,
    } as never);

    const response = await POST(createRequest({ workflowId: 'workflow-1' }) as never);
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.error.code).toBe('42501');
    expect(body.error.message).toBe('RLS denied update');
  });

  it('returns a database error when final status update fails', async () => {
    const supabase = createSupabaseMock({
      steps: [{ type: 'branch' }],
      finalUpdateError: { message: 'Failed to persist final status', code: '42501' },
    });

    requirePolicyMock.mockResolvedValue({
      user: { id: 'user-1' },
      supabase,
    } as never);

    const response = await POST(createRequest({ workflowId: 'workflow-1' }) as never);
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.error.code).toBe('42501');
    expect(body.error.message).toBe('Failed to persist final status');
  });

  it('returns waiting status when wait step update succeeds', async () => {
    const supabase = createSupabaseMock({
      steps: [{ type: 'wait', config: { for: 'approval' } }],
    });

    requirePolicyMock.mockResolvedValue({
      user: { id: 'user-1' },
      supabase,
    } as never);

    const response = await POST(createRequest({ workflowId: 'workflow-1' }) as never);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data.status).toBe('waiting');
    expect(body.data.waitingFor).toBe('approval');
  });

  it('returns created response when final status update succeeds', async () => {
    const supabase = createSupabaseMock({
      steps: [{ type: 'branch' }],
    });

    requirePolicyMock.mockResolvedValue({
      user: { id: 'user-1' },
      supabase,
    } as never);

    const response = await POST(createRequest({ workflowId: 'workflow-1' }) as never);
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.data.status).toBe('completed');
    expect(body.data.executionId).toBe('execution-1');
  });
});
