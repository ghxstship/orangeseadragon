import { NextRequest } from 'next/server';
import { requirePolicy } from '@/lib/api/guard';
import { apiSuccess, badRequest, serverError } from '@/lib/api/response';
import { captureError } from '@/lib/observability';

export async function POST(request: NextRequest) {
  const auth = await requirePolicy('entity.write');
  if (auth.error) return auth.error;

  try {
    const workflow = await request.json();

    if (!workflow?.name || !workflow?.steps) {
      return badRequest('Workflow name and steps are required');
    }

    const validationErrors: string[] = [];

    if (!Array.isArray(workflow.steps) || workflow.steps.length === 0) {
      validationErrors.push('Workflow must have at least one step');
    }

    for (const [i, step] of (workflow.steps || []).entries()) {
      if (!step.type) {
        validationErrors.push(`Step ${i + 1}: missing type`);
      }
      if (!step.name) {
        validationErrors.push(`Step ${i + 1}: missing name`);
      }
    }

    if (!workflow.trigger?.type) {
      validationErrors.push('Workflow must have a trigger type');
    }

    const result = {
      valid: validationErrors.length === 0,
      errors: validationErrors,
      stepCount: workflow.steps?.length || 0,
      estimatedDuration: `${(workflow.steps?.length || 0) * 2}s`,
      dryRun: true,
    };

    return apiSuccess(result);
  } catch (err) {
    captureError(err, 'api.workflows.test.error');
    return serverError('Failed to test workflow');
  }
}
