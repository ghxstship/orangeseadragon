/**
 * Workflow Engine
 * Core execution engine for workflow automation
 */

import {
  Workflow,
  WorkflowExecution,
  WorkflowStep,
  StepExecution,
  StepStatus,
  ExecutionContext,
  ExecutionError,
  StepConfig,
  ActionStepConfig,
  ConditionStepConfig,
  DelayStepConfig,
  HttpStepConfig,
  NotificationStepConfig,
  TransformStepConfig,
} from "./types";
import { getActionHandler } from "./action-handlers";
import { sendNotification } from "./notification-service";

export class WorkflowEngine {
  private executionHandlers: Map<string, StepHandler>;

  constructor() {
    this.executionHandlers = new Map();
    this.registerDefaultHandlers();
  }

  private registerDefaultHandlers(): void {
    this.registerHandler("action", this.executeActionStep.bind(this));
    this.registerHandler("condition", this.executeConditionStep.bind(this));
    this.registerHandler("delay", this.executeDelayStep.bind(this));
    this.registerHandler("http", this.executeHttpStep.bind(this));
    this.registerHandler("notification", this.executeNotificationStep.bind(this));
    this.registerHandler("transform", this.executeTransformStep.bind(this));
    this.registerHandler("loop", this.executeLoopStep.bind(this));
    this.registerHandler("parallel", this.executeParallelStep.bind(this));
  }

  registerHandler(stepType: string, handler: StepHandler): void {
    this.executionHandlers.set(stepType, handler);
  }

  async executeWorkflow(
    workflow: Workflow,
    input?: Record<string, unknown>,
    initiatedBy?: string
  ): Promise<WorkflowExecution> {
    const execution: WorkflowExecution = {
      id: generateId(),
      workflowId: workflow.id,
      workflowVersion: workflow.version,
      status: "running",
      trigger: workflow.trigger,
      input,
      context: {
        variables: { ...workflow.variables, ...input },
        environment: {},
      },
      steps: workflow.steps.map((step) => ({
        stepId: step.id,
        status: "pending" as StepStatus,
        attempts: 0,
      })),
      startedAt: new Date(),
      organizationId: workflow.organizationId,
      initiatedBy,
    };

    try {
      await this.executeSteps(workflow.steps, execution);
      execution.status = "completed";
      execution.completedAt = new Date();
    } catch (error) {
      execution.status = "failed";
      execution.completedAt = new Date();
      execution.error = this.formatError(error);
    }

    return execution;
  }

  private async executeSteps(
    steps: WorkflowStep[],
    execution: WorkflowExecution
  ): Promise<void> {
    const stepMap = new Map(steps.map((s) => [s.id, s]));
    const executedSteps = new Set<string>();
    const pendingSteps = [...steps.filter((s) => !this.hasDependencies(s, steps))];

    while (pendingSteps.length > 0) {
      const step = pendingSteps.shift()!;
      
      if (executedSteps.has(step.id)) continue;

      const stepExecution = execution.steps.find((s) => s.stepId === step.id)!;
      
      try {
        await this.executeStep(step, stepExecution, execution.context);
        executedSteps.add(step.id);

        // Add next steps based on success
        if (step.onSuccess) {
          for (const nextId of step.onSuccess) {
            const nextStep = stepMap.get(nextId);
            if (nextStep && !executedSteps.has(nextId)) {
              pendingSteps.push(nextStep);
            }
          }
        }
      } catch (error) {
        stepExecution.status = "failed";
        stepExecution.error = this.formatError(error);

        // Handle failure path
        if (step.onFailure && step.onFailure.length > 0) {
          for (const nextId of step.onFailure) {
            const nextStep = stepMap.get(nextId);
            if (nextStep && !executedSteps.has(nextId)) {
              pendingSteps.push(nextStep);
            }
          }
        } else {
          throw error;
        }
      }
    }
  }

  private hasDependencies(step: WorkflowStep, allSteps: WorkflowStep[]): boolean {
    return allSteps.some(
      (s) =>
        (s.onSuccess?.includes(step.id) || s.onFailure?.includes(step.id)) &&
        s.id !== step.id
    );
  }

  private async executeStep(
    step: WorkflowStep,
    stepExecution: StepExecution,
    context: ExecutionContext
  ): Promise<void> {
    const handler = this.executionHandlers.get(step.type);
    
    if (!handler) {
      throw new Error(`No handler registered for step type: ${step.type}`);
    }

    // Check conditions
    if (step.conditions && !this.evaluateConditions(step.conditions, context)) {
      stepExecution.status = "skipped";
      return;
    }

    stepExecution.status = "running";
    stepExecution.startedAt = new Date();
    stepExecution.attempts++;

    const maxAttempts = step.retryPolicy?.maxAttempts ?? 1;
    let lastError: Error | undefined;

    while (stepExecution.attempts <= maxAttempts) {
      try {
        const result = await this.executeWithTimeout(
          handler(step.config, context),
          step.timeout ?? 30000
        );
        
        stepExecution.output = result;
        stepExecution.status = "completed";
        stepExecution.completedAt = new Date();
        
        // Update context with step output
        context.variables[`${step.id}_output`] = result;
        return;
      } catch (error) {
        lastError = error as Error;
        
        if (stepExecution.attempts < maxAttempts) {
          const delay = this.calculateRetryDelay(step.retryPolicy!, stepExecution.attempts);
          await this.delay(delay);
          stepExecution.attempts++;
        } else {
          break;
        }
      }
    }

    throw lastError;
  }

  private evaluateConditions(
    conditions: WorkflowStep["conditions"],
    context: ExecutionContext
  ): boolean {
    if (!conditions || conditions.length === 0) return true;

    return conditions.every((condition) => {
      const value = this.resolveVariable(condition.field, context);
      
      switch (condition.operator) {
        case "eq":
          return value === condition.value;
        case "ne":
          return value !== condition.value;
        case "gt":
          return (value as number) > (condition.value as number);
        case "gte":
          return (value as number) >= (condition.value as number);
        case "lt":
          return (value as number) < (condition.value as number);
        case "lte":
          return (value as number) <= (condition.value as number);
        case "contains":
          return String(value).includes(String(condition.value));
        case "in":
          return (condition.value as unknown[]).includes(value);
        case "notIn":
          return !(condition.value as unknown[]).includes(value);
        default:
          return false;
      }
    });
  }

  private resolveVariable(path: string, context: ExecutionContext): unknown {
    const parts = path.split(".");
    let current: unknown = context.variables;

    for (const part of parts) {
      if (current === null || current === undefined) return undefined;
      current = (current as Record<string, unknown>)[part];
    }

    return current;
  }

  private calculateRetryDelay(
    policy: NonNullable<WorkflowStep["retryPolicy"]>,
    attempt: number
  ): number {
    const { backoffType, initialDelay, maxDelay = 60000 } = policy;

    let delay: number;
    switch (backoffType) {
      case "exponential":
        delay = initialDelay * Math.pow(2, attempt - 1);
        break;
      case "linear":
        delay = initialDelay * attempt;
        break;
      case "fixed":
      default:
        delay = initialDelay;
    }

    return Math.min(delay, maxDelay);
  }

  private async executeWithTimeout<T>(
    promise: Promise<T>,
    timeout: number
  ): Promise<T> {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error("Step execution timeout")), timeout)
      ),
    ]);
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private formatError(error: unknown): ExecutionError {
    if (error instanceof Error) {
      return {
        code: "EXECUTION_ERROR",
        message: error.message,
        stack: error.stack,
      };
    }
    return {
      code: "UNKNOWN_ERROR",
      message: String(error),
    };
  }

  // Step Handlers
  private async executeActionStep(
    config: StepConfig,
    context: ExecutionContext
  ): Promise<Record<string, unknown>> {
    const actionConfig = config as ActionStepConfig;
    const handler = getActionHandler(actionConfig.actionType);

    if (handler) {
      // Interpolate parameters with context variables
      const interpolatedParams = this.interpolateObject(actionConfig.parameters, context);
      return handler(interpolatedParams, context);
    }

    // Fallback for unregistered actions
    return { success: true, actionType: actionConfig.actionType, message: "No handler registered" };
  }

  private interpolateObject(obj: Record<string, unknown>, context: ExecutionContext): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === "string") {
        result[key] = this.interpolateString(value, context);
      } else if (typeof value === "object" && value !== null && !Array.isArray(value)) {
        result[key] = this.interpolateObject(value as Record<string, unknown>, context);
      } else {
        result[key] = value;
      }
    }
    return result;
  }

  private async executeConditionStep(
    config: StepConfig,
    context: ExecutionContext
  ): Promise<Record<string, unknown>> {
    const conditionConfig = config as ConditionStepConfig;
    const result = this.evaluateExpression(conditionConfig.expression, context);
    return { 
      result, 
      branch: result ? conditionConfig.trueBranch : conditionConfig.falseBranch 
    };
  }

  private async executeDelayStep(
    config: StepConfig,
    context: ExecutionContext
  ): Promise<Record<string, unknown>> {
    const delayConfig = config as DelayStepConfig;
    const multipliers = { seconds: 1000, minutes: 60000, hours: 3600000, days: 86400000 };
    const ms = delayConfig.duration * multipliers[delayConfig.unit];
    await this.delay(ms);
    return { delayed: ms, contextSize: Object.keys(context.variables).length };
  }

  private async executeHttpStep(
    config: StepConfig,
    context: ExecutionContext
  ): Promise<Record<string, unknown>> {
    const httpConfig = config as HttpStepConfig;
    const url = this.interpolateString(httpConfig.url, context);
    
    const response = await fetch(url, {
      method: httpConfig.method,
      headers: httpConfig.headers,
      body: httpConfig.body ? JSON.stringify(httpConfig.body) : undefined,
    });

    const data = await response.json();
    return { status: response.status, data };
  }

  private async executeNotificationStep(
    config: StepConfig,
    context: ExecutionContext
  ): Promise<Record<string, unknown>> {
    const notificationConfig = config as NotificationStepConfig;
    
    // Interpolate recipients and data
    const recipients = notificationConfig.recipients.map((r) => 
      typeof r === "string" ? this.interpolateString(r, context) : r
    );
    const data = notificationConfig.data 
      ? this.interpolateObject(notificationConfig.data as Record<string, unknown>, context)
      : {};

    const result = await sendNotification({
      channel: notificationConfig.channel,
      recipients,
      template: notificationConfig.template,
      data,
    });

    return { sent: result.success, channel: notificationConfig.channel, recipients: result.recipients };
  }

  private async executeTransformStep(
    config: StepConfig,
    context: ExecutionContext
  ): Promise<Record<string, unknown>> {
    const transformConfig = config as TransformStepConfig;
    const input = this.resolveVariable(transformConfig.input, context);
    const output = input;
    context.variables[transformConfig.output] = output;
    return { transformed: true, output };
  }

  private async executeLoopStep(
    config: StepConfig,
    context: ExecutionContext
  ): Promise<Record<string, unknown>> {
    const loopConfig = config as { collection?: string };
    const collection = loopConfig.collection ? this.resolveVariable(loopConfig.collection, context) : [];
    return { iterations: Array.isArray(collection) ? collection.length : 0 };
  }

  private async executeParallelStep(
    config: StepConfig,
    context: ExecutionContext
  ): Promise<Record<string, unknown>> {
    const parallelConfig = config as { branches?: string[][] };
    const branchCount = parallelConfig.branches?.length ?? 0;
    return { branches: branchCount, contextSize: Object.keys(context.variables).length };
  }

  private evaluateExpression(expression: string, context: ExecutionContext): boolean {
    // Simple expression evaluation - in production, use a proper expression parser
    try {
      const func = new Function("ctx", `return ${expression}`);
      return Boolean(func(context.variables));
    } catch {
      return false;
    }
  }

  private interpolateString(template: string, context: ExecutionContext): string {
    return template.replace(/\{\{([^}]+)\}\}/g, (_, path) => {
      const value = this.resolveVariable(path.trim(), context);
      return value !== undefined ? String(value) : "";
    });
  }
}

type StepHandler = (
  config: StepConfig,
  context: ExecutionContext
) => Promise<Record<string, unknown>>;

function generateId(): string {
  return `wf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export const workflowEngine = new WorkflowEngine();
