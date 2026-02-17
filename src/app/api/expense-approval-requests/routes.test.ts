import { beforeEach, describe, expect, it, vi } from 'vitest';
import { POST as approvePOST } from './approve/route';
import { POST as rejectPOST } from './reject/route';
import { POST as returnPOST } from './return/route';
import { POST as bulkApprovePOST } from './bulk-approve/route';
import { POST as createPOST } from './route';

const { requirePolicyMock } = vi.hoisted(() => ({
  requirePolicyMock: vi.fn(),
}));

vi.mock('@/lib/api/guard', () => ({
  requirePolicy: requirePolicyMock,
}));

function createRequest(body: Record<string, unknown>): Request {
  return new Request('http://localhost/api/expense-approval-requests', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('expense approval action routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('approve route accepts legacy requestId/comments payload and invokes canonical RPC', async () => {
    const supabase = {
      rpc: vi.fn().mockResolvedValue({ data: null, error: null }),
    };

    requirePolicyMock.mockResolvedValue({
      user: { id: 'user-1' },
      supabase,
    } as never);

    const response = await approvePOST(
      createRequest({ requestId: 'req-1', comments: 'Looks good' }) as never
    );

    expect(response.status).toBe(200);
    expect(supabase.rpc).toHaveBeenCalledWith('process_expense_approval', {
      p_request_id: 'req-1',
      p_action: 'approved',
      p_comments: 'Looks good',
    });
  });

  it('approve route rejects missing identifiers with bad request', async () => {
    const supabase = {
      rpc: vi.fn().mockResolvedValue({ data: null, error: null }),
    };

    requirePolicyMock.mockResolvedValue({
      user: { id: 'user-1' },
      supabase,
    } as never);

    const response = await approvePOST(createRequest({ comments: 'no id' }) as never);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error.code).toBe('BAD_REQUEST');
    expect(supabase.rpc).not.toHaveBeenCalled();
  });

  it('reject route maps comments payload to rejection reason', async () => {
    const supabase = {
      rpc: vi.fn().mockResolvedValue({ data: null, error: null }),
    };

    requirePolicyMock.mockResolvedValue({
      user: { id: 'user-1' },
      supabase,
    } as never);

    const response = await rejectPOST(
      createRequest({ id: 'req-2', comments: 'Policy violation' }) as never
    );

    expect(response.status).toBe(200);
    expect(supabase.rpc).toHaveBeenCalledWith('process_expense_approval', {
      p_request_id: 'req-2',
      p_action: 'rejected',
      p_comments: 'Policy violation',
    });
  });

  it('return route maps comments and returns normalized cancelled status', async () => {
    const supabase = {
      rpc: vi.fn().mockResolvedValue({ data: null, error: null }),
    };

    requirePolicyMock.mockResolvedValue({
      user: { id: 'user-1' },
      supabase,
    } as never);

    const response = await returnPOST(
      createRequest({ requestId: 'req-3', comments: 'Please attach receipt' }) as never
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data.status).toBe('cancelled');
    expect(supabase.rpc).toHaveBeenCalledWith('process_expense_approval', {
      p_request_id: 'req-3',
      p_action: 'returned',
      p_comments: 'Please attach receipt',
    });
  });

  it('bulk approve route accepts requestIds payload and processes each ID', async () => {
    const supabase = {
      rpc: vi.fn().mockResolvedValue({ data: null, error: null }),
    };

    requirePolicyMock.mockResolvedValue({
      user: { id: 'user-1' },
      supabase,
    } as never);

    const response = await bulkApprovePOST(
      createRequest({ requestIds: ['req-10', 'req-11'] }) as never
    );

    expect(response.status).toBe(200);
    expect(supabase.rpc).toHaveBeenCalledTimes(2);
    expect(supabase.rpc).toHaveBeenNthCalledWith(1, 'process_expense_approval', {
      p_request_id: 'req-10',
      p_action: 'approved',
      p_comments: null,
    });
    expect(supabase.rpc).toHaveBeenNthCalledWith(2, 'process_expense_approval', {
      p_request_id: 'req-11',
      p_action: 'approved',
      p_comments: null,
    });
  });
});

describe('expense approval create route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('enforces submitted_by and pending status while stripping client overrides', async () => {
    const singleMock = vi.fn().mockResolvedValue({ data: { id: 'req-created' }, error: null });
    const selectMock = vi.fn().mockReturnValue({ single: singleMock });
    const insertMock = vi.fn().mockReturnValue({ select: selectMock });
    const fromMock = vi.fn().mockReturnValue({ insert: insertMock });

    const supabase = {
      from: fromMock,
    };

    requirePolicyMock.mockResolvedValue({
      user: { id: 'user-1' },
      supabase,
    } as never);

    const response = await createPOST(
      createRequest({
        expense_id: 'exp-1',
        notes: 'Need quick approval',
        requested_by: 'malicious-user',
        submitted_by: 'malicious-user',
        status: 'approved',
      }) as never
    );

    const body = await response.json();

    expect(response.status).toBe(200);
    expect(fromMock).toHaveBeenCalledWith('expense_approval_requests');
    expect(insertMock).toHaveBeenCalledWith({
      expense_id: 'exp-1',
      notes: 'Need quick approval',
      submitted_by: 'user-1',
      status: 'pending',
    });
    expect(body.data.id).toBe('req-created');
  });
});
