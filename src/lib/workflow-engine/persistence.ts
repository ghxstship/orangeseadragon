/**
 * Workflow Persistence Adapter
 *
 * Bridges the in-memory WorkflowService with Supabase tables:
 *   workflow_templates  → Workflow
 *   workflow_steps      → WorkflowStep[]
 *   workflow_runs       → WorkflowExecution
 *   workflow_step_executions → StepExecution[]
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  Workflow,
  WorkflowExecution,
  WorkflowStep,
  WorkflowTrigger,
  StepExecution,
} from './types';
import { captureError } from '@/lib/observability';

// ─────────────────────────────────────────────────────────────────────────────
// DB row shapes (snake_case)
// ─────────────────────────────────────────────────────────────────────────────

interface WorkflowRow {
  id: string;
  organization_id: string;
  name: string;
  description: string | null;
  slug: string;
  trigger_type: string;
  trigger_config: Record<string, unknown>;
  variables: Record<string, unknown> | null;
  metadata: Record<string, unknown> | null;
  status: string;
  version: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

interface StepRow {
  id: string;
  workflow_template_id: string;
  position: number;
  name: string;
  step_type: string;
  config: Record<string, unknown>;
  on_success: string[] | null;
  on_failure: string[] | null;
  timeout_ms: number | null;
  retry_count: number | null;
  retry_delay_ms: number | null;
  condition: string | null;
}

interface RunRow {
  id: string;
  organization_id: string;
  workflow_template_id: string;
  status: string;
  trigger_type: string;
  trigger_config: Record<string, unknown>;
  input: Record<string, unknown> | null;
  output: Record<string, unknown> | null;
  context: Record<string, unknown> | null;
  error: Record<string, unknown> | null;
  initiated_by: string | null;
  started_at: string;
  completed_at: string | null;
  created_at: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Mappers
// ─────────────────────────────────────────────────────────────────────────────

function toWorkflow(row: WorkflowRow, steps: StepRow[]): Workflow {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? undefined,
    version: row.version ?? 1,
    status: row.status as Workflow['status'],
    trigger: {
      type: row.trigger_type as WorkflowTrigger['type'],
      config: row.trigger_config ?? {},
    },
    steps: steps
      .sort((a, b) => a.position - b.position)
      .map(toWorkflowStep),
    variables: row.variables ?? undefined,
    metadata: row.metadata ?? undefined,
    organizationId: row.organization_id,
    createdBy: row.created_by,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

function toWorkflowStep(row: StepRow): WorkflowStep {
  return {
    id: row.id,
    name: row.name,
    type: row.step_type as WorkflowStep['type'],
    config: row.config ?? {},
    onSuccess: row.on_success ?? undefined,
    onFailure: row.on_failure ?? undefined,
    timeout: row.timeout_ms ?? undefined,
    retryPolicy: row.retry_count
      ? { maxAttempts: row.retry_count, backoffType: 'fixed' as const, initialDelay: row.retry_delay_ms ?? 1000 }
      : undefined,
    conditions: row.condition ? [{ field: row.condition, operator: 'eq' as const, value: true }] : undefined,
  };
}

function toExecution(row: RunRow, stepExecs: StepExecution[]): WorkflowExecution {
  return {
    id: row.id,
    workflowId: row.workflow_template_id,
    workflowVersion: 1,
    status: row.status as WorkflowExecution['status'],
    trigger: {
      type: row.trigger_type as WorkflowTrigger['type'],
      config: row.trigger_config ?? {},
    },
    input: row.input ?? undefined,
    output: row.output ?? undefined,
    context: (row.context as unknown as WorkflowExecution['context']) ?? {
      variables: {},
      environment: {},
    },
    steps: stepExecs,
    startedAt: new Date(row.started_at),
    completedAt: row.completed_at ? new Date(row.completed_at) : undefined,
    error: row.error as unknown as WorkflowExecution['error'],
    organizationId: row.organization_id,
    initiatedBy: row.initiated_by ?? undefined,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Persistence Class
// ─────────────────────────────────────────────────────────────────────────────

export class WorkflowPersistence {
  private supabase: SupabaseClient;

  constructor(supabase?: SupabaseClient) {
    this.supabase =
      supabase ??
      createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );
  }

  // ── Workflow CRUD ──────────────────────────────────────────────────────

  async saveWorkflow(workflow: Workflow): Promise<void> {
    const slug = workflow.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    const { error: upsertErr } = await this.supabase
      .from('workflow_templates')
      .upsert(
        {
          id: workflow.id,
          organization_id: workflow.organizationId,
          name: workflow.name,
          description: workflow.description ?? null,
          slug,
          trigger_type: workflow.trigger.type,
          trigger_config: workflow.trigger.config ?? {},
          variables: workflow.variables ?? null,
          metadata: workflow.metadata ?? null,
          status: workflow.status,
          version: workflow.version,
          created_by: workflow.createdBy,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      );

    if (upsertErr) {
      captureError(upsertErr, 'workflow.persistence.save_workflow_failed', { workflowId: workflow.id });
      throw upsertErr;
    }

    // Sync steps: delete old, insert new
    await this.supabase
      .from('workflow_steps')
      .delete()
      .eq('workflow_template_id', workflow.id);

    if (workflow.steps.length > 0) {
      const stepRows = workflow.steps.map((step, idx) => ({
        id: step.id,
        workflow_template_id: workflow.id,
        position: idx + 1,
        name: step.name,
        step_type: step.type,
        config: step.config ?? {},
        on_success: step.onSuccess ?? null,
        on_failure: step.onFailure ?? null,
        timeout_ms: step.timeout ?? null,
        retry_count: step.retryPolicy?.maxAttempts ?? null,
        retry_delay_ms: step.retryPolicy?.initialDelay ?? null,
        condition: step.conditions?.[0]?.field ?? null,
      }));

      const { error: stepsErr } = await this.supabase
        .from('workflow_steps')
        .insert(stepRows);

      if (stepsErr) {
        captureError(stepsErr, 'workflow.persistence.save_steps_failed', { workflowId: workflow.id });
      }
    }
  }

  async loadWorkflow(id: string): Promise<Workflow | null> {
    const { data: row, error } = await this.supabase
      .from('workflow_templates')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !row) return null;

    const { data: steps } = await this.supabase
      .from('workflow_steps')
      .select('*')
      .eq('workflow_template_id', id)
      .order('position');

    return toWorkflow(row as WorkflowRow, (steps ?? []) as StepRow[]);
  }

  async loadWorkflows(organizationId: string): Promise<Workflow[]> {
    const { data: rows, error } = await this.supabase
      .from('workflow_templates')
      .select('*')
      .eq('organization_id', organizationId)
      .order('updated_at', { ascending: false });

    if (error || !rows?.length) return [];

    const ids = rows.map((r: WorkflowRow) => r.id);
    const { data: allSteps } = await this.supabase
      .from('workflow_steps')
      .select('*')
      .in('workflow_template_id', ids)
      .order('position');

    const stepsByWorkflow = new Map<string, StepRow[]>();
    for (const step of (allSteps ?? []) as StepRow[]) {
      const list = stepsByWorkflow.get(step.workflow_template_id) ?? [];
      list.push(step);
      stepsByWorkflow.set(step.workflow_template_id, list);
    }

    return rows.map((r: WorkflowRow) =>
      toWorkflow(r, stepsByWorkflow.get(r.id) ?? [])
    );
  }

  async deleteWorkflow(id: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('workflow_templates')
      .delete()
      .eq('id', id);

    return !error;
  }

  // ── Execution persistence ─────────────────────────────────────────────

  async saveExecution(execution: WorkflowExecution): Promise<void> {
    const { error: runErr } = await this.supabase
      .from('workflow_runs')
      .upsert(
        {
          id: execution.id,
          organization_id: execution.organizationId,
          workflow_template_id: execution.workflowId,
          status: execution.status,
          trigger_type: execution.trigger.type,
          trigger_config: execution.trigger.config ?? {},
          input: execution.input ?? null,
          output: execution.output ?? null,
          context: execution.context ?? null,
          error: execution.error ?? null,
          initiated_by: execution.initiatedBy ?? null,
          started_at: execution.startedAt.toISOString(),
          completed_at: execution.completedAt?.toISOString() ?? null,
        },
        { onConflict: 'id' }
      );

    if (runErr) {
      captureError(runErr, 'workflow.persistence.save_execution_failed', { executionId: execution.id });
      return;
    }

    // Persist step executions
    if (execution.steps.length > 0) {
      const stepRows = execution.steps.map((s) => ({
        workflow_run_id: execution.id,
        workflow_step_id: s.stepId,
        status: s.status,
        input: s.input ?? null,
        output: s.output ?? null,
        started_at: s.startedAt?.toISOString() ?? null,
        completed_at: s.completedAt?.toISOString() ?? null,
        attempts: s.attempts,
        error: s.error ?? null,
      }));

      await this.supabase
        .from('workflow_step_executions')
        .upsert(stepRows, { onConflict: 'workflow_run_id,workflow_step_id' });
    }
  }

  async loadExecution(id: string): Promise<WorkflowExecution | null> {
    const { data: row, error } = await this.supabase
      .from('workflow_runs')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !row) return null;

    const { data: stepRows } = await this.supabase
      .from('workflow_step_executions')
      .select('*')
      .eq('workflow_run_id', id);

    const stepExecs: StepExecution[] = (stepRows ?? []).map(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (s: any) => ({
        stepId: s.workflow_step_id,
        status: s.status,
        input: s.input ?? undefined,
        output: s.output ?? undefined,
        startedAt: s.started_at ? new Date(s.started_at) : undefined,
        completedAt: s.completed_at ? new Date(s.completed_at) : undefined,
        attempts: s.attempts ?? 0,
        error: s.error ?? undefined,
      })
    );

    return toExecution(row as RunRow, stepExecs);
  }
}

// Singleton
let _instance: WorkflowPersistence | null = null;

export function getWorkflowPersistence(): WorkflowPersistence {
  if (!_instance) {
    _instance = new WorkflowPersistence();
  }
  return _instance;
}
