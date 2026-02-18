/**
 * Workflow Service
 * High-level service for workflow management, execution, and monitoring
 */

import {
  Workflow,
  WorkflowExecution,
  WorkflowTemplate,
  WorkflowStatus,
  ExecutionStatus,
  WorkflowMetrics,
  WorkflowEvent,
  WorkflowTrigger,
  WorkflowStep,
} from "./types";
import { WorkflowEngine, workflowEngine } from "./engine";
import { loadAllWorkflowTemplates } from "./templates";
import { WorkflowPersistence, getWorkflowPersistence } from "./persistence";
import { captureError } from "@/lib/observability";

export interface CreateWorkflowInput {
  name: string;
  description?: string;
  trigger: WorkflowTrigger;
  steps: WorkflowStep[];
  variables?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  organizationId: string;
  createdBy: string;
}

export interface UpdateWorkflowInput {
  name?: string;
  description?: string;
  trigger?: WorkflowTrigger;
  steps?: WorkflowStep[];
  variables?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  status?: WorkflowStatus;
}

export interface WorkflowFilter {
  organizationId?: string;
  status?: WorkflowStatus;
  createdBy?: string;
  search?: string;
  tags?: string[];
}

export interface ExecutionFilter {
  workflowId?: string;
  organizationId?: string;
  status?: ExecutionStatus;
  startedAfter?: Date;
  startedBefore?: Date;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

type WorkflowEventHandler = (event: WorkflowEvent) => void | Promise<void>;

export class WorkflowService {
  private engine: WorkflowEngine;
  private workflows: Map<string, Workflow>;
  private executions: Map<string, WorkflowExecution>;
  private eventHandlers: Map<string, WorkflowEventHandler[]>;
  private scheduledJobs: Map<string, NodeJS.Timeout>;
  private persistence: WorkflowPersistence | null;

  constructor(engine?: WorkflowEngine, persistence?: WorkflowPersistence | null) {
    this.engine = engine ?? workflowEngine;
    this.workflows = new Map();
    this.executions = new Map();
    this.eventHandlers = new Map();
    this.scheduledJobs = new Map();
    // persistence is null only in tests; default to singleton
    this.persistence = persistence === null ? null : (persistence ?? getWorkflowPersistence());
  }

  // ==================== Workflow CRUD ====================

  async createWorkflow(input: CreateWorkflowInput): Promise<Workflow> {
    const workflow: Workflow = {
      id: this.generateId("wf"),
      name: input.name,
      description: input.description,
      version: 1,
      status: "draft",
      trigger: input.trigger,
      steps: input.steps,
      variables: input.variables,
      metadata: input.metadata,
      organizationId: input.organizationId,
      createdBy: input.createdBy,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.workflows.set(workflow.id, workflow);
    this.persistWorkflow(workflow);
    await this.emitEvent("workflow.created", { workflow });

    return workflow;
  }

  async getWorkflow(id: string): Promise<Workflow | null> {
    const cached = this.workflows.get(id);
    if (cached) return cached;

    // Fall through to persistence
    if (this.persistence) {
      try {
        const loaded = await this.persistence.loadWorkflow(id);
        if (loaded) {
          this.workflows.set(loaded.id, loaded);
          return loaded;
        }
      } catch (e) {
        captureError(e, 'workflow.service.load_failed', { workflowId: id });
      }
    }
    return null;
  }

  async updateWorkflow(id: string, input: UpdateWorkflowInput): Promise<Workflow | null> {
    const workflow = this.workflows.get(id);
    if (!workflow) return null;

    const updated: Workflow = {
      ...workflow,
      ...input,
      version: workflow.version + 1,
      updatedAt: new Date(),
    };

    this.workflows.set(id, updated);
    this.persistWorkflow(updated);
    await this.emitEvent("workflow.updated", { workflow: updated });

    // Handle status changes
    if (input.status && input.status !== workflow.status) {
      await this.handleStatusChange(updated, workflow.status);
    }

    return updated;
  }

  async deleteWorkflow(id: string): Promise<boolean> {
    const workflow = this.workflows.get(id);
    if (!workflow) return false;

    // Stop any scheduled jobs
    this.stopScheduledJob(id);

    this.workflows.delete(id);
    if (this.persistence) {
      this.persistence.deleteWorkflow(id).catch((e) =>
        captureError(e, 'workflow.service.delete_persist_failed', { workflowId: id })
      );
    }
    await this.emitEvent("workflow.deleted", { workflowId: id });

    return true;
  }

  async listWorkflows(
    filter: WorkflowFilter = {},
    pagination: PaginationParams = { page: 1, limit: 20 }
  ): Promise<PaginatedResult<Workflow>> {
    let workflows = Array.from(this.workflows.values());

    // Apply filters
    if (filter.organizationId) {
      workflows = workflows.filter((w) => w.organizationId === filter.organizationId);
    }
    if (filter.status) {
      workflows = workflows.filter((w) => w.status === filter.status);
    }
    if (filter.createdBy) {
      workflows = workflows.filter((w) => w.createdBy === filter.createdBy);
    }
    if (filter.search) {
      const search = filter.search.toLowerCase();
      workflows = workflows.filter(
        (w) =>
          w.name.toLowerCase().includes(search) ||
          w.description?.toLowerCase().includes(search)
      );
    }

    const total = workflows.length;
    const totalPages = Math.ceil(total / pagination.limit);
    const start = (pagination.page - 1) * pagination.limit;
    const data = workflows.slice(start, start + pagination.limit);

    return {
      data,
      total,
      page: pagination.page,
      limit: pagination.limit,
      totalPages,
    };
  }

  // ==================== Workflow Activation ====================

  async activateWorkflow(id: string): Promise<Workflow | null> {
    const workflow = await this.updateWorkflow(id, { status: "active" });
    if (!workflow) return null;

    // Set up scheduled trigger if applicable
    if (workflow.trigger.type === "schedule") {
      await this.setupScheduledTrigger(workflow);
    }

    return workflow;
  }

  async deactivateWorkflow(id: string): Promise<Workflow | null> {
    const workflow = await this.updateWorkflow(id, { status: "inactive" });
    if (!workflow) return null;

    this.stopScheduledJob(id);

    return workflow;
  }

  private async handleStatusChange(
    workflow: Workflow,
    previousStatus: WorkflowStatus
  ): Promise<void> {
    await this.emitEvent("workflow.status_changed", {
      workflowId: workflow.id,
      previousStatus,
      newStatus: workflow.status,
    });

    if (workflow.status === "active" && workflow.trigger.type === "schedule") {
      await this.setupScheduledTrigger(workflow);
    } else if (workflow.status !== "active") {
      this.stopScheduledJob(workflow.id);
    }
  }

  // ==================== Workflow Execution ====================

  async executeWorkflow(
    workflowId: string,
    input?: Record<string, unknown>,
    initiatedBy?: string
  ): Promise<WorkflowExecution | null> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) return null;

    if (workflow.status !== "active" && workflow.trigger.type !== "manual") {
      throw new Error("Workflow is not active");
    }

    await this.emitEvent("execution.started", { workflowId, input, initiatedBy });

    const execution = await this.engine.executeWorkflow(workflow, input, initiatedBy);
    this.executions.set(execution.id, execution);
    this.persistExecution(execution);

    await this.emitEvent("execution.completed", {
      executionId: execution.id,
      status: execution.status,
    });

    return execution;
  }

  async getExecution(id: string): Promise<WorkflowExecution | null> {
    const cached = this.executions.get(id);
    if (cached) return cached;

    if (this.persistence) {
      try {
        const loaded = await this.persistence.loadExecution(id);
        if (loaded) {
          this.executions.set(loaded.id, loaded);
          return loaded;
        }
      } catch (e) {
        captureError(e, 'workflow.service.load_execution_failed', { executionId: id });
      }
    }
    return null;
  }

  async listExecutions(
    filter: ExecutionFilter = {},
    pagination: PaginationParams = { page: 1, limit: 20 }
  ): Promise<PaginatedResult<WorkflowExecution>> {
    let executions = Array.from(this.executions.values());

    // Apply filters
    if (filter.workflowId) {
      executions = executions.filter((e) => e.workflowId === filter.workflowId);
    }
    if (filter.organizationId) {
      executions = executions.filter((e) => e.organizationId === filter.organizationId);
    }
    if (filter.status) {
      executions = executions.filter((e) => e.status === filter.status);
    }
    if (filter.startedAfter) {
      executions = executions.filter((e) => e.startedAt >= filter.startedAfter!);
    }
    if (filter.startedBefore) {
      executions = executions.filter((e) => e.startedAt <= filter.startedBefore!);
    }

    // Sort by started date descending
    executions.sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime());

    const total = executions.length;
    const totalPages = Math.ceil(total / pagination.limit);
    const start = (pagination.page - 1) * pagination.limit;
    const data = executions.slice(start, start + pagination.limit);

    return {
      data,
      total,
      page: pagination.page,
      limit: pagination.limit,
      totalPages,
    };
  }

  async cancelExecution(id: string): Promise<boolean> {
    const execution = this.executions.get(id);
    if (!execution || execution.status !== "running") return false;

    execution.status = "cancelled";
    execution.completedAt = new Date();
    this.persistExecution(execution);

    await this.emitEvent("execution.cancelled", { executionId: id });

    return true;
  }

  // ==================== Template Management ====================

  async getTemplates(category?: string): Promise<WorkflowTemplate[]> {
    const all = await loadAllWorkflowTemplates();
    if (category) {
      return all.filter((t: WorkflowTemplate) => t.category === category);
    }
    return [...all];
  }

  async getTemplate(id: string): Promise<WorkflowTemplate | null> {
    const all = await loadAllWorkflowTemplates();
    return all.find((t: WorkflowTemplate) => t.id === id) ?? null;
  }

  async getTemplateCategories(): Promise<string[]> {
    const all = await loadAllWorkflowTemplates();
    const categories = new Set(all.map((t: WorkflowTemplate) => t.category));
    return Array.from(categories).sort();
  }

  async createWorkflowFromTemplate(
    templateId: string,
    variables: Record<string, unknown>,
    organizationId: string,
    createdBy: string
  ): Promise<Workflow | null> {
    const template = await this.getTemplate(templateId);
    if (!template) return null;

    // Validate required variables
    for (const variable of template.variables) {
      if (variable.required && !(variable.name in variables)) {
        throw new Error(`Missing required variable: ${variable.name}`);
      }
    }

    // Apply default values
    const resolvedVariables: Record<string, unknown> = {};
    for (const variable of template.variables) {
      resolvedVariables[variable.name] =
        variables[variable.name] ?? variable.default;
    }

    // Create workflow from template
    const workflow = await this.createWorkflow({
      name: template.workflow.name,
      description: template.workflow.description,
      trigger: template.workflow.trigger,
      steps: template.workflow.steps,
      variables: { ...template.workflow.variables, ...resolvedVariables },
      metadata: {
        ...template.workflow.metadata,
        templateId: template.id,
        templateName: template.name,
      },
      organizationId,
      createdBy,
    });

    await this.emitEvent("workflow.created_from_template", {
      workflowId: workflow.id,
      templateId,
    });

    return workflow;
  }

  // ==================== Metrics & Analytics ====================

  async getWorkflowMetrics(workflowId: string): Promise<WorkflowMetrics | null> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) return null;

    const executions = Array.from(this.executions.values()).filter(
      (e) => e.workflowId === workflowId
    );

    const successful = executions.filter((e) => e.status === "completed");
    const failed = executions.filter((e) => e.status === "failed");

    const completedExecutions = executions.filter((e) => e.completedAt);
    const totalDuration = completedExecutions.reduce((sum, e) => {
      return sum + (e.completedAt!.getTime() - e.startedAt.getTime());
    }, 0);

    const lastExecution = executions.sort(
      (a, b) => b.startedAt.getTime() - a.startedAt.getTime()
    )[0];

    return {
      workflowId,
      totalExecutions: executions.length,
      successfulExecutions: successful.length,
      failedExecutions: failed.length,
      averageDuration:
        completedExecutions.length > 0
          ? totalDuration / completedExecutions.length
          : 0,
      lastExecutedAt: lastExecution?.startedAt,
    };
  }

  async getOrganizationMetrics(organizationId: string): Promise<{
    totalWorkflows: number;
    activeWorkflows: number;
    totalExecutions: number;
    successRate: number;
  }> {
    const workflows = Array.from(this.workflows.values()).filter(
      (w) => w.organizationId === organizationId
    );

    const executions = Array.from(this.executions.values()).filter(
      (e) => e.organizationId === organizationId
    );

    const successful = executions.filter((e) => e.status === "completed");

    return {
      totalWorkflows: workflows.length,
      activeWorkflows: workflows.filter((w) => w.status === "active").length,
      totalExecutions: executions.length,
      successRate:
        executions.length > 0 ? (successful.length / executions.length) * 100 : 0,
    };
  }

  // ==================== Event System ====================

  on(eventType: string, handler: WorkflowEventHandler): void {
    const handlers = this.eventHandlers.get(eventType) ?? [];
    handlers.push(handler);
    this.eventHandlers.set(eventType, handlers);
  }

  off(eventType: string, handler: WorkflowEventHandler): void {
    const handlers = this.eventHandlers.get(eventType) ?? [];
    const index = handlers.indexOf(handler);
    if (index > -1) {
      handlers.splice(index, 1);
    }
  }

  private async emitEvent(
    type: string,
    data: Record<string, unknown>
  ): Promise<void> {
    const event: WorkflowEvent = {
      id: this.generateId("evt"),
      type,
      timestamp: new Date(),
      data,
    };

    const handlers = this.eventHandlers.get(type) ?? [];
    const wildcardHandlers = this.eventHandlers.get("*") ?? [];

    for (const handler of [...handlers, ...wildcardHandlers]) {
      try {
        await handler(event);
      } catch (error) {
        captureError(error, 'workflow.eventHandler.error', { eventType: type });
      }
    }
  }

  // ==================== Trigger Management ====================

  async triggerByEvent(
    eventType: string,
    eventData: Record<string, unknown>,
    organizationId: string
  ): Promise<WorkflowExecution[]> {
    const workflows = Array.from(this.workflows.values()).filter(
      (w) =>
        w.status === "active" &&
        w.organizationId === organizationId &&
        w.trigger.type === "event" &&
        (w.trigger.config as { eventType?: string }).eventType === eventType
    );

    const executions: WorkflowExecution[] = [];

    for (const workflow of workflows) {
      const execution = await this.executeWorkflow(workflow.id, eventData);
      if (execution) {
        executions.push(execution);
      }
    }

    return executions;
  }

  async triggerByWebhook(
    path: string,
    method: string,
    payload: Record<string, unknown>,
    organizationId: string
  ): Promise<WorkflowExecution | null> {
    const workflow = Array.from(this.workflows.values()).find(
      (w) =>
        w.status === "active" &&
        w.organizationId === organizationId &&
        w.trigger.type === "webhook" &&
        (w.trigger.config as { path?: string; method?: string }).path === path &&
        (w.trigger.config as { path?: string; method?: string }).method === method
    );

    if (!workflow) return null;

    return this.executeWorkflow(workflow.id, payload);
  }

  private async setupScheduledTrigger(workflow: Workflow): Promise<void> {
    // Stop existing job if any
    this.stopScheduledJob(workflow.id);

    const config = workflow.trigger.config as { cron?: string; interval?: number };

    // Simple interval-based scheduling (in production, use a proper cron library)
    if (config.interval) {
      const job = setInterval(async () => {
        await this.executeWorkflow(workflow.id, {}, "scheduler");
      }, config.interval);

      this.scheduledJobs.set(workflow.id, job);
    }
  }

  private stopScheduledJob(workflowId: string): void {
    const job = this.scheduledJobs.get(workflowId);
    if (job) {
      clearInterval(job);
      this.scheduledJobs.delete(workflowId);
    }
  }

  // ==================== Utilities ====================

  async cloneWorkflow(
    id: string,
    newName: string,
    organizationId?: string,
    createdBy?: string
  ): Promise<Workflow | null> {
    const original = this.workflows.get(id);
    if (!original) return null;

    return this.createWorkflow({
      name: newName,
      description: original.description,
      trigger: { ...original.trigger },
      steps: original.steps.map((s) => ({ ...s })),
      variables: { ...original.variables },
      metadata: { ...original.metadata, clonedFrom: id },
      organizationId: organizationId ?? original.organizationId,
      createdBy: createdBy ?? original.createdBy,
    });
  }

  async validateWorkflow(workflow: Partial<Workflow>): Promise<{
    valid: boolean;
    errors: string[];
  }> {
    const errors: string[] = [];

    if (!workflow.name?.trim()) {
      errors.push("Workflow name is required");
    }

    if (!workflow.trigger) {
      errors.push("Workflow trigger is required");
    }

    if (!workflow.steps || workflow.steps.length === 0) {
      errors.push("Workflow must have at least one step");
    }

    // Validate step references
    if (workflow.steps) {
      const stepIds = new Set(workflow.steps.map((s) => s.id));

      for (const step of workflow.steps) {
        if (step.onSuccess) {
          for (const ref of step.onSuccess) {
            if (!stepIds.has(ref)) {
              errors.push(`Step "${step.id}" references non-existent step "${ref}" in onSuccess`);
            }
          }
        }
        if (step.onFailure) {
          for (const ref of step.onFailure) {
            if (!stepIds.has(ref)) {
              errors.push(`Step "${step.id}" references non-existent step "${ref}" in onFailure`);
            }
          }
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  // ==================== Persistence Helpers ====================

  private persistWorkflow(workflow: Workflow): void {
    if (!this.persistence) return;
    this.persistence.saveWorkflow(workflow).catch((e) =>
      captureError(e, 'workflow.service.persist_workflow_failed', { workflowId: workflow.id })
    );
  }

  private persistExecution(execution: WorkflowExecution): void {
    if (!this.persistence) return;
    this.persistence.saveExecution(execution).catch((e) =>
      captureError(e, 'workflow.service.persist_execution_failed', { executionId: execution.id })
    );
  }

  /**
   * Hydrate in-memory cache from Supabase for a given organization.
   * Call once at startup or on first request for an org.
   */
  async hydrateFromPersistence(organizationId: string): Promise<void> {
    if (!this.persistence) return;
    try {
      const workflows = await this.persistence.loadWorkflows(organizationId);
      for (const wf of workflows) {
        this.workflows.set(wf.id, wf);
      }
    } catch (e) {
      captureError(e, 'workflow.service.hydrate_failed', { organizationId });
    }
  }

  private generateId(prefix: string): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export singleton instance
export const workflowService = new WorkflowService();
